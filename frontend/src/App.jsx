import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import StickyBoard from './components/StickyBoard';
import FavoritesView from './components/FavoritesView';
import CreateQuoteModal from './components/CreateQuoteModal';
import FateWheelModal from './components/FateWheelModal';
import QuoteDetailModal from './components/QuoteDetailModal';
import QuoteCardStudioModal from './components/QuoteCardStudioModal';
import Preloader from './components/Preloader';
import Footer from './components/Footer';
import {
  fetchQuotesFromApi,
  prefetchNextPage,
  createQuoteInApi,
  likeQuoteInApi
} from './data/quotesData';
import confetti from 'canvas-confetti';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('noted_theme') || 'light';
  });

  const [currentView, setCurrentView] = useState('all'); // 'all' | 'pinned'
  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Preloader state: ensures tactile sticky note loading screen on initial visit
  const [showPreloader, setShowPreloader] = useState(true);
  const [isInitialReady, setIsInitialReady] = useState(false);

  // User-specific pinned quotes stored in browser localStorage
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('noted_pinned_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFateOpen, setIsFateOpen] = useState(false);
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioQuote, setStudioQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('noted_theme', theme);
  }, [theme]);

  // Persist user's personal pinned quotes
  useEffect(() => {
    try {
      localStorage.setItem('noted_pinned_ids', JSON.stringify(pinnedIds));
    } catch { }
  }, [pinnedIds]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2600);
  };

  // Fetch quotes — useRef guard prevents double-fetch on React StrictMode
  const loadingRef = useRef(false);

  const loadQuotes = useCallback(async (pageNum = 1, isNewCategory = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const incoming = await fetchQuotesFromApi(selectedCategory, searchQuery, pageNum);
      if (incoming && incoming.length > 0) {
        setQuotes(prev => {
          if (isNewCategory || pageNum === 1) return incoming;
          const existing = new Set(prev.map(p => p.id));
          const fresh = incoming.filter(item => !existing.has(item.id));
          return [...prev, ...fresh];
        });
        setPage(pageNum);
        const moreAvailable = incoming.length >= 30;
        setHasMore(moreAvailable);
        // Continuously prefetch the upcoming page in the background
        if (moreAvailable) {
          prefetchNextPage(selectedCategory, searchQuery, pageNum + 1);
        }
      } else {
        if (pageNum === 1) setQuotes([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [selectedCategory, searchQuery]);

  // Initial load: fetches quotes while keeping the tactile preloader smooth and satisfying
  useEffect(() => {
    let active = true;
    const initialInit = async () => {
      const minTimer = new Promise(resolve => setTimeout(resolve, 850));
      await Promise.all([
        loadQuotes(1, true),
        minTimer
      ]);
      if (active) {
        setIsInitialReady(true);
      }
    };
    initialInit();
    return () => { active = false; };
  }, []);

  // Subsequent category/search changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    loadQuotes(1, true);
  }, [selectedCategory, searchQuery]);

  // Infinite scroll trigger
  const handleLoadMore = () => {
    if (!loadingRef.current && hasMore) {
      loadQuotes(page + 1, false);
    }
  };

  // Like
  const handleLike = (id) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        const liked = !q.liked;
        return {
          ...q,
          liked,
          likes: liked ? (q.likes || 0) + 1 : Math.max(0, (q.likes || 1) - 1)
        };
      }
      return q;
    }));
    likeQuoteInApi(id);
  };

  // Personal Pin Toggle — completely user-specific via localStorage
  const handleTogglePin = (id) => {
    setPinnedIds(prev => {
      const isCurrentlyPinned = prev.includes(id);
      if (isCurrentlyPinned) {
        showToast("Unpinned from your board 📌");
        return prev.filter(pId => pId !== id);
      } else {
        showToast("Pinned to your board! 📌");
        confetti({ particleCount: 30, spread: 50, colors: ['#c8f135', '#000000'] });
        return [...prev, id];
      }
    });
  };

  // Update Style
  const handleUpdateStyle = (id, newColorId) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, colorId: newColorId } : q));
  };

  // Save Custom Quote to Database & pin for the user
  const handleSaveQuote = async (newQuoteData) => {
    const saved = await createQuoteInApi(newQuoteData);
    setQuotes(prev => [saved, ...prev]);
    setPinnedIds(prev => [...prev, saved.id]);
    showToast("Sticky note saved to your board! ✨");
  };

  // Open Quote Card Studio
  const handleOpenStudio = (quote = null) => {
    if (quote) {
      setStudioQuote(quote);
    } else if (displayQuotes.length > 0) {
      // Pick random quote if not specified
      const randomIndex = Math.floor(Math.random() * displayQuotes.length);
      setStudioQuote(displayQuotes[randomIndex]);
    }
    setIsStudioOpen(true);
  };

  // Attach personal pinned state to quotes
  const displayQuotes = useMemo(() => {
    return quotes.map(q => ({
      ...q,
      pinned: pinnedIds.includes(q.id)
    }));
  }, [quotes, pinnedIds]);

  const pinnedCount = displayQuotes.filter(q => q.pinned).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        setTheme={setTheme}
        onOpenCreate={() => setIsCreateOpen(true)}
        onRollFate={() => setIsFateOpen(true)}
        onOpenStudio={() => handleOpenStudio()}
        pinnedCount={pinnedCount}
        totalCount={displayQuotes.length}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'all' && (
          <StickyBoard
            quotes={displayQuotes}
            onLike={handleLike}
            onTogglePin={handleTogglePin}
            onUpdateStyle={handleUpdateStyle}
            onSelectQuote={setSelectedQuoteForDetail}
            onOpenStudio={handleOpenStudio}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onLoadMore={handleLoadMore}
            isLoading={isLoading}
            hasMore={hasMore}
          />
        )}

        {currentView === 'pinned' && (
          <FavoritesView
            quotes={displayQuotes}
            onLike={handleLike}
            onTogglePin={handleTogglePin}
            onUpdateStyle={handleUpdateStyle}
            onSelectQuote={setSelectedQuoteForDetail}
            onOpenCreate={() => setIsCreateOpen(true)}
            onOpenStudio={handleOpenStudio}
          />
        )}
      </main>

      {/* Relatable Footer */}
      <footer style={{
        borderTop: 'var(--border-thick)',
        background: 'var(--bg-surface)',
        padding: '28px 24px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'var(--c-lime)',
              border: '2px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.9rem'
            }}>
              N.
            </div>
            <span className="font-display" style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              NOTED.
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              — Sticky wisdom for the modern mind
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            DAILY EDITION • THOUGHTS THAT STICK
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateQuoteModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaveQuote={handleSaveQuote}
      />

      <FateWheelModal
        isOpen={isFateOpen}
        onClose={() => setIsFateOpen(false)}
        quotes={displayQuotes}
        onLike={handleLike}
      />

      <QuoteDetailModal
        quoteItem={selectedQuoteForDetail ? {
          ...selectedQuoteForDetail,
          pinned: pinnedIds.includes(selectedQuoteForDetail.id)
        } : null}
        onClose={() => setSelectedQuoteForDetail(null)}
        onLike={handleLike}
        onTogglePin={handleTogglePin}
        onOpenStudio={handleOpenStudio}
      />

      <QuoteCardStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        initialQuote={studioQuote || displayQuotes[0]}
        allQuotes={displayQuotes}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="app-toast font-display" style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0e0f14',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: 'var(--radius-sm)',
          border: '2px solid var(--c-lime)',
          boxShadow: '4px 4px 0px #000000',
          fontSize: '0.86rem',
          fontWeight: 700,
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Tactile Sticky Note Preloader */}
      {showPreloader && (
        <Preloader
          isReady={isInitialReady}
          onFinish={() => setShowPreloader(false)}
        />
      )}

      {/* Footer with copyright */}
      <Footer />
    </div>
  );
}
