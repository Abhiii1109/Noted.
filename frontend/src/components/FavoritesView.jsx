import React from 'react';
import StickyNote from './StickyNote';
import { Pin, Plus } from 'lucide-react';

export default function FavoritesView({
  quotes,
  onLike,
  onTogglePin,
  onUpdateStyle,
  onSelectQuote,
  onOpenCreate,
  onOpenStudio
}) {
  const pinnedQuotes = quotes.filter(q => q.pinned || q.isCustom);

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Pinned Header */}
      <div style={{
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-surface)',
        padding: '32px 28px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--c-coral)',
            border: '1.5px solid #000000',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <Pin size={12} fill="#000" />
            <span>PERSONAL PINBOARD</span>
          </div>

          <h2 className="font-display" style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            lineHeight: 1.1
          }}>
            My Pinned Notes
          </h2>

          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginTop: '6px'
          }}>
            {pinnedQuotes.length} sticky notes saved for quick daily inspiration.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="noted-btn btn-lime"
        >
          <Plus size={16} strokeWidth={3} />
          <span>+ Add Custom Note</span>
        </button>
      </div>

      {pinnedQuotes.length === 0 ? (
        <div style={{
          border: 'var(--border-thick)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface)',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '560px',
          margin: '40px auto'
        }}>
          <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
            No pinned notes yet
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
            Click the "PIN" button on any note card to save it here, or write your own thought note.
          </p>
          <button
            onClick={onOpenCreate}
            className="noted-btn btn-lime"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="sticky-board-grid">
          {pinnedQuotes.map(quote => (
            <StickyNote
              key={quote.id}
              quoteItem={quote}
              onLike={onLike}
              onTogglePin={onTogglePin}
              onUpdateStyle={onUpdateStyle}
              onSelectQuote={onSelectQuote}
              onOpenStudio={onOpenStudio}
            />
          ))}
        </div>
      )}
    </div>
  );
}
