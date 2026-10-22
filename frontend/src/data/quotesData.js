// CLEAN FRONTEND DATA & API SERVICE LAYER

export const CATEGORIES = [
  { id: 'all',          label: 'All Quotes',     color: '#c8f135' },
  { id: 'friendship',   label: 'Friendship',      color: '#fbc98a' },
  { id: 'love',         label: 'Love & Romance',  color: '#f06fa8' },
  { id: 'happiness',    label: 'Good Vibes',      color: '#c8f135' },
  { id: 'life',         label: 'Life Lessons',    color: '#4dd9c0' },
  { id: 'inspirational',label: 'Motivation',      color: '#b8a9f8' },
  { id: 'wisdom',       label: 'Deep Truths',     color: '#ff7a5c' },
  { id: 'success',      label: 'Ambition & Grit', color: '#c8f135' },
  { id: 'humor',        label: 'Wit & Humor',     color: '#fbc98a' },
  { id: 'courage',      label: 'Courage',         color: '#ff7a5c' },
  { id: 'art',          label: 'Creativity',      color: '#b8a9f8' },
  { id: 'peace',        label: 'Inner Peace',     color: '#4dd9c0' },
  { id: 'hope',         label: 'Hope & Dreams',   color: '#60c3f5' },
  { id: 'nature',       label: 'Nature & Soul',   color: '#4dd9c0' }
];

export const NOTE_COLORS = [
  { id: 'lime',  name: 'Neon Lime',      bg: '#d8ff38', text: '#0e0f14' },
  { id: 'lilac', name: 'Cyber Lilac',    bg: '#c4b5fd', text: '#0e0f14' },
  { id: 'coral', name: 'Warm Coral',     bg: '#ff8566', text: '#0e0f14' },
  { id: 'mint',  name: 'Fresh Mint',     bg: '#5eead4', text: '#0e0f14' },
  { id: 'peach', name: 'Soft Peach',     bg: '#fed7aa', text: '#0e0f14' },
  { id: 'white', name: 'Clean Chalk',    bg: '#ffffff', text: '#0e0f14' },
  { id: 'pink',  name: 'Sweet Bubblegum',bg: '#f472b6', text: '#0e0f14' }
];

// ─── SMART CACHE ─────────────────────────────────────────────
// Stores quotes in localStorage with a 10-minute TTL.
// First visit hits Atlas; subsequent visits within 10 min are instant.
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getCacheKey = (category, search, page) =>
  `noted_cache_v3_${category || 'all'}_${search || ''}_p${page}`;

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch { return null; }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* storage full — skip silently */ }
};

import { FALLBACK_QUOTES } from './fallbackQuotes';

// Production-ready API Base (auto-sanitizes protocol, trailing slashes, and accidental /api endings)
const getSanitizedApiBase = () => {
  let url = (import.meta.env.VITE_API_URL || '').trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
};

const API_BASE = getSanitizedApiBase();

// Filter local fallback quotes if backend is sleeping or unreachable
const getLocalFallback = (category = '', search = '', page = 1) => {
  const filtered = FALLBACK_QUOTES.filter(item => {
    const matchesCategory = !category || category === 'all' || item.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = !search || 
      item.quote.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const limit = 30;
  const start = (page - 1) * limit;
  return filtered.slice(start, start + limit);
};

// ─── FETCH WITH CACHE & ZERO-DOWNTIME FALLBACK ────────────────
// 1. Returns cached quotes immediately if fresh.
// 2. Tries to fetch live Atlas quotes from API (with 35s timeout for Render cold boots).
// 3. If API is waking up or fails, gracefully serves fallback quotes so user is NEVER left empty.
export const fetchQuotesFromApi = async (category = '', search = '', page = 1) => {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  params.append('page', page);
  params.append('limit', 30);

  const key = getCacheKey(category, search, page);

  // 1. Check cache first — return instantly if fresh
  const cached = readCache(key);

  // 2. Background fetch to retrieve/refresh live database quotes from Atlas
  const fetchFresh = async () => {
    try {
      // 35s timeout accounts for Render free-tier cold starts without dying prematurely
      const res = await fetch(`${API_BASE}/api/quotes?${params.toString()}`, { 
        signal: AbortSignal.timeout(35000) 
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.quotes && data.quotes.length > 0) {
          writeCache(key, data.quotes);
          return data.quotes;
        }
      }
    } catch (err) {
      console.warn('API fetch notice (Render may be starting or offline):', err.message);
    }
    // Return fallback quotes so user always sees inspiring content
    return getLocalFallback(category, search, page);
  };

  if (cached && cached.length > 0) {
    // Return cache immediately (instant!) and silently refresh in background
    fetchFresh();
    return cached;
  }

  // No cache — fetch with fallback guarantee
  return await fetchFresh();
};

// ─── PREFETCH next page silently ─────────────────────────────
// Call this as soon as page 1 loads to warm the cache for page 2
export const prefetchNextPage = (category = '', search = '', nextPage = 2) => {
  const key = getCacheKey(category, search, nextPage);
  if (readCache(key)) return; // already cached
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  params.append('page', nextPage);
  params.append('limit', 30);
  fetch(`${API_BASE}/api/quotes?${params.toString()}`, { signal: AbortSignal.timeout(8000) })
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data?.quotes?.length) writeCache(key, data.quotes); })
    .catch(() => {});
};

// ─── INVALIDATE CACHE ─────────────────────────────────────────
// Call after creating/liking/pinning so stale cache is cleared
export const invalidateQuoteCache = () => {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('noted_cache_'))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
};

// Create quote in MongoDB Atlas
export const createQuoteInApi = async (quoteData) => {
  try {
    const res = await fetch(`${API_BASE}/api/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    if (res.ok) {
      invalidateQuoteCache();
      return await res.json();
    }
  } catch (err) {
    console.error('Error creating quote:', err);
  }
  return quoteData;
};

// Like quote in database (fire & forget)
export const likeQuoteInApi = async (id) => {
  try {
    await fetch(`${API_BASE}/api/quotes/${id}/like`, {
      method: 'PATCH',
      signal: AbortSignal.timeout(5000)
    });
  } catch {}
};

// Toggle pin in database (fire & forget)
export const pinQuoteInApi = async (id) => {
  try {
    await fetch(`${API_BASE}/api/quotes/${id}/pin`, {
      method: 'PATCH',
      signal: AbortSignal.timeout(5000)
    });
  } catch {}
};

// Check DB connection status
export const checkDatabaseStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/status`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? res.json() : null;
  } catch { return null; }
};
