import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Quote } from './models/Quote.js';
import { SEED_QUOTES } from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

let isDbConnected = false;
let memoryQuotes = [...SEED_QUOTES.map((q, idx) => ({ ...q, _id: `mem-${idx + 1}` }))];

// Connect to MongoDB Atlas
const connectDB = async () => {
  if (!MONGODB_URI || MONGODB_URI.includes('username:password')) {
    console.log('⚠️  No MongoDB Atlas URI configured in .env yet. Running in resilient memory-mode.');
    console.log('👉 To connect to your cloud database, update MONGODB_URI in .env with your Atlas connection string.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isDbConnected = true;
    console.log('✅ Connected successfully to MongoDB Atlas!');

    // Auto-seed if collection is empty
    const count = await Quote.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial quotes into MongoDB Atlas...');
      await Quote.insertMany(SEED_QUOTES);
      console.log('✅ Database seeded with initial quotes!');
    }
  } catch (err) {
    console.warn('⚠️  Could not connect to MongoDB Atlas:', err.message);
    console.log('🔄 Operating with local memory fallback.');
    isDbConnected = false;
  }
};

connectDB();

// Health/Status checks for cloud hosting (Render, Railway, Fly.io, Vercel)
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/', (req, res) => res.status(200).json({ name: 'NOTED API', status: 'online' }));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: isDbConnected ? 'MongoDB Atlas (Connected)' : 'Local Memory Fallback (Update .env with your Atlas URI)',
    timestamp: new Date().toISOString()
  });
});

// Fast In-Memory Cache (< 1ms responses for repeated / next-page requests)
const apiCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const clearServerCache = () => {
  apiCache.clear();
};

// GET /api/quotes (with pagination, category filtering, search)
app.get('/api/quotes', async (req, res) => {
  const { category, search, page = 1, limit = 24 } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 24);
  const skip = (pageNum - 1) * limitNum;

  // Check cache for instant (< 1ms) response
  const cacheKey = `${category || 'all'}_${search || ''}_${pageNum}_${limitNum}`;
  const cached = apiCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts < CACHE_TTL_MS)) {
    return res.json(cached.data);
  }

  if (isDbConnected) {
    try {
      const query = {};
      if (category && category !== 'all') {
        query.category = category.toLowerCase();
      }
      if (search) {
        query.$or = [
          { quote: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { tag: { $regex: search, $options: 'i' } }
        ];
      }

      // Fetch limitNum + 1 with .lean() in ONE fast query instead of running slow countDocuments
      const docs = await Quote.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum + 1)
        .lean();

      const hasMore = docs.length > limitNum;
      const quotes = hasMore ? docs.slice(0, limitNum) : docs;

      const responsePayload = {
        quotes: quotes.map(q => ({
          id: q._id.toString(),
          quote: q.quote,
          author: q.author,
          category: q.category,
          colorId: q.colorId,
          rotation: q.rotation,
          tag: q.tag,
          pinned: q.pinned,
          likes: q.likes,
          isCustom: q.isCustom
        })),
        total: skip + quotes.length + (hasMore ? 1 : 0),
        page: pageNum,
        hasMore
      };

      apiCache.set(cacheKey, { ts: Date.now(), data: responsePayload });
      return res.json(responsePayload);
    } catch (err) {
      console.error('Error querying MongoDB:', err);
      // Fall through to memory fallback
    }
  }

  // Memory fallback logic
  let results = [...memoryQuotes];
  if (category && category !== 'all') {
    results = results.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(q => 
      q.quote.toLowerCase().includes(s) || 
      q.author.toLowerCase().includes(s) || 
      (q.tag && q.tag.toLowerCase().includes(s))
    );
  }

  const paginated = results.slice(skip, skip + limitNum);
  const responsePayload = {
    quotes: paginated.map(q => ({
      id: q._id,
      quote: q.quote,
      author: q.author,
      category: q.category,
      colorId: q.colorId,
      rotation: q.rotation,
      tag: q.tag,
      pinned: q.pinned,
      likes: q.likes,
      isCustom: q.isCustom
    })),
    total: results.length,
    page: pageNum,
    hasMore: skip + paginated.length < results.length
  };

  apiCache.set(cacheKey, { ts: Date.now(), data: responsePayload });
  res.json(responsePayload);
});

// POST /api/quotes (Create custom quote)
app.post('/api/quotes', async (req, res) => {
  const { quote, author, category, colorId, tag } = req.body;
  if (!quote) {
    return res.status(400).json({ error: 'Quote text is required' });
  }

  const newQuoteData = {
    quote,
    author: author || 'Anonymous',
    category: category || 'wisdom',
    colorId: colorId || 'lime',
    rotation: Number(((Math.random() * 3.4) - 1.7).toFixed(1)),
    tag: tag || (category ? category.toUpperCase() : 'WISDOM'),
    pinned: true,
    likes: 1,
    isCustom: true
  };

  if (isDbConnected) {
    try {
      const created = await Quote.create(newQuoteData);
      clearServerCache();
      return res.status(201).json({
        id: created._id.toString(),
        ...newQuoteData
      });
    } catch (err) {
      console.error('Error saving to MongoDB Atlas:', err);
    }
  }

  const memCreated = {
    _id: `mem-${Date.now()}`,
    ...newQuoteData
  };
  memoryQuotes.unshift(memCreated);
  clearServerCache();
  res.status(201).json({ id: memCreated._id, ...newQuoteData });
});

// PATCH /api/quotes/:id/like
app.patch('/api/quotes/:id/like', async (req, res) => {
  const { id } = req.params;
  clearServerCache();

  if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const quote = await Quote.findById(id);
      if (quote) {
        quote.likes += 1;
        await quote.save();
        return res.json({ id: quote._id, likes: quote.likes });
      }
    } catch (err) {
      console.error('Error liking quote in MongoDB:', err);
    }
  }

  const q = memoryQuotes.find(item => item._id === id);
  if (q) {
    q.likes = (q.likes || 0) + 1;
    return res.json({ id: q._id, likes: q.likes });
  }

  res.json({ id, likes: 1 });
});

// PATCH /api/quotes/:id/pin
app.patch('/api/quotes/:id/pin', async (req, res) => {
  const { id } = req.params;
  clearServerCache();

  if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const quote = await Quote.findById(id);
      if (quote) {
        quote.pinned = !quote.pinned;
        await quote.save();
        return res.json({ id: quote._id, pinned: quote.pinned });
      }
    } catch (err) {
      console.error('Error toggling pin in MongoDB:', err);
    }
  }

  const q = memoryQuotes.find(item => item._id === id);
  if (q) {
    q.pinned = !q.pinned;
    return res.json({ id: q._id, pinned: q.pinned });
  }

  res.json({ id, pinned: true });
});

app.listen(PORT, () => {
  console.log(`🚀 NOTED API server running at http://localhost:${PORT}`);
});
