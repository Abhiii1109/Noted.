import React, { useState, useEffect, useRef } from 'react';
import StickyNote from './StickyNote';
import { CATEGORIES } from '../data/quotesData';
import { Search, X, Sparkles, RefreshCw, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';

export default function StickyBoard({
  quotes,
  onLike,
  onTogglePin,
  onUpdateStyle,
  onSelectQuote,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onLoadMore,
  isLoading,
  hasMore = true
}) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const sentinelRef = useRef(null);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Infinite scroll observer: triggers when user reaches bottom of board
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          onLoadMore();
        }
      },
      { rootMargin: '350px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, quotes.length, hasMore]);

  // Prevent background scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Filtered quotes based on category and search
  const filteredQuotes = quotes.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tag && item.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);
  const isCategoryFiltered = selectedCategory !== 'all';

  return (
    <div className="board-wrapper" style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Search & Filter Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Top Search & Filter Bar */}
        <div className="filter-search-row">
          {/* Search Input */}
          <div className="search-input-wrap">
            <Search
              size={17}
              className="search-input-icon"
              aria-hidden="true"
            />
            <input
              id="search-input"
              type="search"
              role="searchbox"
              aria-label="Search quotes, authors, or categories"
              placeholder="Search quotes, authors, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="main-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                title="Clear search"
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* MOBILE-ONLY: Sleek Filter Trigger Button */}
          {!isCategoryFiltered ? (
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="mobile-filter-trigger-btn"
              title="Filter by topic"
            >
              <SlidersHorizontal size={15} />
              <span>Category</span>
            </button>
          ) : (
            <div className="mobile-filter-btn-group">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="mobile-filter-trigger-btn active"
                title="Change category"
              >
                <span className="cat-dot" style={{ background: activeCategoryObj?.color || 'var(--c-lime)' }} />
                <span>{activeCategoryObj?.label}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('all');
                }}
                className="mobile-filter-clear-btn"
                title="Clear filter"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* DESKTOP-ONLY: Category Pills (hidden on mobile in favor of the clean Filter Button) */}
        <div className="cat-pills-wrap desktop-filter-pills" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cat-pill${selectedCategory === cat.id ? ' active' : ''}`}
            >
              <span
                className="cat-dot"
                style={{ background: cat.color }}
              />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET DRAWER */}
      {isMobileFilterOpen && (
        <div 
          className="mobile-filter-drawer-overlay"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div 
            className="mobile-filter-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="drawer-handle" />

            {/* Header */}
            <div className="drawer-header">
              <div>
                <h3 className="font-display drawer-title">
                  Select Category
                </h3>
                <p className="drawer-subtitle">
                  {filteredQuotes.length} quotes match this collection
                </p>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="drawer-close-btn"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Category Grid */}
            <div className="drawer-cat-grid">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                    }}
                    className={`drawer-cat-item ${isSelected ? 'active' : ''}`}
                  >
                    <span className="cat-dot" style={{ background: cat.color }} />
                    <span className="drawer-cat-label">{cat.label}</span>
                    {isSelected && (
                      <Check size={14} strokeWidth={3} className="drawer-cat-check" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="drawer-footer">
              {isCategoryFiltered && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="drawer-reset-btn"
                >
                  <RotateCcw size={14} />
                  <span>Show All</span>
                </button>
              )}

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="drawer-apply-btn"
              >
                <span>View {filteredQuotes.length} Quotes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Notes Grid */}
      {filteredQuotes.length === 0 ? (
        <div style={{
          border: 'var(--border-thick)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface)',
          padding: '50px 20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '600px',
          margin: '30px auto'
        }}>
          <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
            No sticky notes found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Try adjusting your search or select another category filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="noted-btn btn-lime"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="sticky-board-grid">
          {filteredQuotes.map(quote => (
            <StickyNote
              key={quote.id}
              quoteItem={quote}
              onLike={onLike}
              onTogglePin={onTogglePin}
              onUpdateStyle={onUpdateStyle}
              onSelectQuote={onSelectQuote}
            />
          ))}
        </div>
      )}

      {/* Sentinel Element for Infinite Auto-Scroll */}
      <div 
        ref={sentinelRef}
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        {isLoading ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            fontWeight: 700,
            fontSize: '0.86rem'
          }}>
            <RefreshCw size={16} className="spin" />
            <span>Channeling more sticky thoughts...</span>
          </div>
        ) : hasMore ? (
          <button
            onClick={onLoadMore}
            className="noted-btn btn-lilac"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            <Sparkles size={15} />
            <span>Load More Wisdom</span>
          </button>
        ) : filteredQuotes.length > 0 ? (
          <div style={{
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            padding: '16px 24px',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-color)',
            background: 'var(--bg-surface)'
          }}>
            ✦ You've reached the end of this collection ✦
          </div>
        ) : null}
      </div>
    </div>
  );
}
