import React from 'react';
import {
  Plus,
  Shuffle,
  Sun,
  Moon,
  Pin,
  Bookmark
} from 'lucide-react';

export default function Header({
  currentView,
  setCurrentView,
  theme,
  setTheme,
  onOpenCreate,
  onRollFate,
  pinnedCount,
  totalCount
}) {
  return (
    <header style={{
      borderBottom: 'var(--border-thick)',
      background: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Banner — hidden on mobile via .site-banner */}
      <div className="site-banner" style={{
        background: '#0e0f14',
        color: '#ffffff',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--c-lime)' }} />
            THOUGHTS THAT STICK
          </span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span style={{ opacity: 0.8 }}>{totalCount} CURATED NOTES ON BOARD</span>
        </div>
        <span style={{
          background: 'var(--c-lime)', color: '#000',
          padding: '1px 8px', borderRadius: '3px', fontWeight: 800
        }}>
          DAILY EDITION
        </span>
      </div>

      {/* Main Header Row */}
      <div className="header-inner" style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>

        {/* Brand */}
        <div
          onClick={() => setCurrentView('all')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div className="brand-logo-box" style={{
            width: '40px', height: '40px',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-thick)',
            background: 'var(--c-lime)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(-2deg)',
            flexShrink: 0
          }}>
            <span className="font-display" style={{ fontWeight: 900, fontSize: '1.3rem', color: '#000' }}>N.</span>
          </div>

          <div>
            <h1 className="brand-title font-display" style={{
              fontSize: '1.55rem', fontWeight: 900,
              letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: 1,
              margin: 0
            }}>
              NOTED.
            </h1>
            <p className="brand-subtitle" style={{
              fontSize: '0.75rem', color: 'var(--text-secondary)',
              fontWeight: 600, marginTop: '2px'
            }}>
              Sticky wisdom for the modern mind
            </p>
          </div>
        </div>

        {/* View Nav — full width on mobile (via CSS) */}
        <nav className="header-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-main)',
          padding: '4px',
          border: 'var(--border-thick)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            id="nav-all-btn"
            onClick={() => setCurrentView('all')}
            style={{
              padding: '8px 18px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: currentView === 'all' ? '2px solid #000' : '2px solid transparent',
              background: currentView === 'all' ? 'var(--c-lime)' : 'transparent',
              color: '#000',
              cursor: 'pointer',
              borderRadius: '4px',
              boxShadow: currentView === 'all' ? '2px 2px 0px #000' : 'none',
              transition: 'all 0.12s ease',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Bookmark size={13} fill={currentView === 'all' ? 'currentColor' : 'none'} />
            <span>All Notes</span>
          </button>

          <button
            id="nav-pinned-btn"
            onClick={() => setCurrentView('pinned')}
            style={{
              padding: '8px 18px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: currentView === 'pinned' ? '2px solid #000' : '2px solid transparent',
              background: currentView === 'pinned' ? 'var(--c-coral)' : 'transparent',
              color: '#000',
              cursor: 'pointer',
              borderRadius: '4px',
              boxShadow: currentView === 'pinned' ? '2px 2px 0px #000' : 'none',
              transition: 'all 0.12s ease',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Pin size={13} fill={currentView === 'pinned' ? 'currentColor' : 'none'} />
            <span>Pinned</span>
            {pinnedCount > 0 && (
              <span style={{
                background: '#000', color: '#fff',
                padding: '1px 5px', borderRadius: '99px',
                fontSize: '0.68rem', fontFamily: 'var(--font-mono)'
              }}>
                {pinnedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Surprise Me */}
          <button
            onClick={onRollFate}
            className="noted-btn btn-lilac"
            title="Random quote"
          >
            <Shuffle size={14} />
            <span className="btn-label">Surprise Me</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="noted-btn"
            style={{ padding: '9px 11px' }}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Add Note */}
          <button
            id="create-note-btn"
            onClick={onOpenCreate}
            className="noted-btn btn-lime"
            title="Add new sticky note"
          >
            <Plus size={15} strokeWidth={3} />
            <span className="btn-label">Add Note</span>
          </button>
        </div>
      </div>
    </header>
  );
}
