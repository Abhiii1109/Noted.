import React from 'react';
import StickyNote from './StickyNote';
import { Search, X, Circle, Square, Triangle } from 'lucide-react';
import { GEO_CATEGORIES } from '../data/quotesData';

export default function EditorialView({
  quotes,
  onLike,
  onTogglePin,
  onUpdateStyle,
  onSelectQuote,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) {
  const filteredQuotes = quotes.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Constructivist Header */}
      <div style={{
        border: 'var(--border-thick)',
        background: 'var(--bg-surface)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-hard-lg)',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--c-lime)',
            border: '2px solid #000000',
            padding: '3px 10px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            marginBottom: '10px'
          }}>
            <span>▲ CONSTRUCTIVIST ARCHIVE</span>
          </div>

          <h2 className="font-display" style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-1px'
          }}>
            MASONRY MATRIX
          </h2>

          <p className="font-mono" style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginTop: '4px'
          }}>
            GEOMETRIC ALIGNMENT OF {filteredQuotes.length} THOUGHTS
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <input 
              type="text"
              placeholder="FILTER MATRIX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: 'var(--border-thick)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-hard-sm)'
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 16px',
              border: 'var(--border-thick)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: 'var(--c-lavender)',
              color: '#000000',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-hard-sm)'
            }}
          >
            {GEO_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Sticky Notes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        {filteredQuotes.map(quote => (
          <StickyNote
            key={quote.id}
            quoteItem={quote}
            isDraggable={false}
            onLike={onLike}
            onTogglePin={onTogglePin}
            onUpdateStyle={onUpdateStyle}
            onSelectQuote={onSelectQuote}
          />
        ))}
      </div>
    </div>
  );
}
