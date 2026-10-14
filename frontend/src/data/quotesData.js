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

// Production-ready API Base (supports Vercel/Netlify frontend pointing to Render/Railway backend)
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// ─── FETCH WITH CACHE ─────────────────────────────────────────
// Returns cached data immediately if available, then refetches in background
// so the NEXT visit is even faster.
export const fetchQuotesFromApi = async (category = '', search = '', page = 1) => {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  params.append('page', page);
  params.append('limit', 30); // 30 per page for rich grid

  const key = getCacheKey(category, search, page);

  // 1. Check cache first — return instantly if fresh
  const cached = readCache(key);

  // 2. Always kick off a background fetch to keep cache warm
  const fetchFresh = () =>
    fetch(`${API_BASE}/api/quotes?${params.toString()}`, { signal: AbortSignal.timeout(8000) })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.quotes?.length) {
          writeCache(key, data.quotes);
        }
        return data?.quotes || [];
      })
      .catch(() => []);

  if (cached) {
    // Return cache immediately (instant!) and silently refresh in background
    fetchFresh();
    return cached;
  }

  // No cache — must wait for real fetch
  try {
    const quotes = await fetchFresh();
    return quotes;
  } catch {
    return [];
  }
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
