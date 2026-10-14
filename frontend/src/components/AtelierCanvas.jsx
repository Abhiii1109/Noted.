import React, { useState, useEffect, useRef } from 'react';
import StickyNote from './StickyNote';
import { GEO_CATEGORIES } from '../data/quotesData';
import { Search, X, Shuffle, Grid, DownloadCloud, Circle, Square, Triangle } from 'lucide-react';

export default function AtelierCanvas({
  quotes,
  onLike,
  onTogglePin,
  onUpdateStyle,
  onSelectQuote,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onFetchCategoryQuotes,
  isFetching
}) {
  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);

  // Filtered quotes based on search & category
  const filteredQuotes = quotes.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate default grid layout positions
  const calculateDefaultPositions = (items) => {
    const posMap = {};
    const cols = 3;
    const colWidth = 370;
    const rowHeight = 340;
    const startX = 40;
    const startY = 40;

    items.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      // subtle constructivist offset
      const offsetX = ((index * 7) % 18) - 9;
      const offsetY = ((index * 11) % 18) - 9;

      posMap[item.id] = {
        x: startX + col * colWidth + offsetX,
        y: startY + row * rowHeight + offsetY
      };
    });
    return posMap;
  };

  useEffect(() => {
    setPositions(calculateDefaultPositions(filteredQuotes));
  }, [filteredQuotes.length, selectedCategory]);

  // Scatter Asymmetry
  const handleScatter = () => {
    const posMap = {};
    const width = (containerRef.current ? containerRef.current.clientWidth : 1200) - 380;
    const height = Math.max(700, filteredQuotes.length * 100);

    filteredQuotes.forEach((item) => {
      posMap[item.id] = {
        x: Math.max(20, Math.floor(Math.random() * Math.max(300, width))),
        y: Math.max(20, Math.floor(Math.random() * height))
      };
    });
    setPositions(posMap);
  };

  const handleTidy = () => {
    setPositions(calculateDefaultPositions(filteredQuotes));
  };

  const handleDragEnd = (id, newCoord) => {
    setPositions(prev => ({
      ...prev,
      [id]: newCoord
    }));
  };

  const maxPositionY = Object.values(positions).reduce((acc, curr) => Math.max(acc, curr.y || 0), 300);
  const canvasMinHeight = Math.max(820, maxPositionY + 380);

  return (
    <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '24px 24px' }}>
      {/* Category Pills & Search Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Filter and Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Stark Brutalist Search Box */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '14px',
                color: '#000000',
                pointerEvents: 'none'
              }} 
            />
            <input 
              id="geo-search-input"
              type="text"
              placeholder="SEARCH BY KEYWORD, AUTHOR, OR CATEGORY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 42px 12px 44px',
                border: 'var(--border-thick)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-hard-sm)',
                letterSpacing: '0.5px'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleScatter}
              className="geo-btn"
              style={{ fontSize: '0.8rem' }}
              title="Scatter notes with constructivist asymmetry"
            >
              <Shuffle size={14} />
              <span>SCATTER ASYMMETRY</span>
            </button>

            <button
              onClick={handleTidy}
              className="geo-btn"
              style={{ fontSize: '0.8rem' }}
              title="Snap notes to orthogonal matrix"
            >
              <Grid size={14} />
              <span>SNAP MATRIX</span>
            </button>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => onFetchCategoryQuotes(selectedCategory)}
                disabled={isFetching}
                className="geo-btn btn-mint"
                style={{ fontSize: '0.8rem' }}
              >
                <DownloadCloud size={14} />
                <span>FETCH {selectedCategory.toUpperCase()} (API NINJAS)</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Selector Bar (Circles, Squares, Triangles) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {GEO_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'all') {
                    onFetchCategoryQuotes(cat.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  border: 'var(--border-thick)',
                  background: isSelected ? '#000000' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--c-lime)' : 'var(--text-main)',
                  boxShadow: isSelected ? 'var(--shadow-hard-sm)' : 'none',
                  cursor: 'pointer',
                  transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {cat.shape === 'circle' && <Circle size={10} fill="currentColor" />}
                {cat.shape === 'square' && <Square size={10} fill="currentColor" />}
                {cat.shape === 'triangle' && <Triangle size={10} fill="currentColor" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Draggable Geometric Canvas */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          minHeight: `${canvasMinHeight}px`,
          width: '100%',
          border: 'var(--border-thick)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-hard-lg)',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      >
        {/* Constructivist Corner Watermark */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          textAlign: 'right',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <div className="font-display" style={{
            fontSize: '0.9rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            letterSpacing: '1px'
          }}>
            CANVAS // CONSTRUCTIVIST ATELIER
          </div>
          <div className="font-mono" style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 700
          }}>
            [DRAGGABLE STICKY NOTES • {filteredQuotes.length} MANUSCRIPTS]
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            textAlign: 'center',
            padding: '24px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: 'var(--border-thick)',
              background: 'var(--c-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-hard)'
            }}>
              <Square size={28} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase' }}>
              NO QUOTES FOUND IN MATRIX
            </h3>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0 16px 0' }}>
              PULL FROM API NINJAS OR RESET YOUR SEARCH PARAMETERS.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="geo-btn btn-lime"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const pos = positions[quote.id] || { x: 40, y: 40 };
            return (
              <StickyNote
                key={quote.id}
                quoteItem={quote}
                isDraggable={true}
                position={pos}
                onDragEnd={handleDragEnd}
                onLike={onLike}
                onTogglePin={onTogglePin}
                onUpdateStyle={onUpdateStyle}
                onSelectQuote={onSelectQuote}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
