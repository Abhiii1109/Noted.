import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CATEGORIES, NOTE_COLORS } from '../data/quotesData';
import StickyNote from './StickyNote';
import confetti from 'canvas-confetti';

export default function CreateQuoteModal({ isOpen, onClose, onSaveQuote }) {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('wisdom');
  const [colorId, setColorId] = useState('lime');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quote.trim()) return;

    const newQuoteItem = {
      id: `custom-${Date.now()}`,
      quote: quote.trim(),
      author: author.trim() || 'Anonymous',
      category: category,
      colorId: colorId,
      tag: category.toUpperCase(),
      rotation: 0,
      pinned: true,
      liked: true,
      likes: 1,
      isCustom: true
    };

    onSaveQuote(newQuoteItem);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#c8f135', '#000000', '#b8a9f8']
    });

    onClose();
  };

  const previewItem = {
    id: 'preview',
    quote: quote || 'Write something inspiring, funny, or wise here...',
    author: author || 'Your Name',
    category: category,
    colorId: colorId,
    tag: category.toUpperCase(),
    rotation: 0,
    pinned: true,
    likes: 1
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto'
      }}
    >
      {/* Fixed close — always visible */}
      <button
        className="modal-close-btn"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 600,
          border: '2px solid #ffffff',
          borderRadius: '6px',
          background: '#000000',
          color: '#ffffff',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <X size={15} />
        <span>ESC</span>
      </button>

      <div className="modal-panel" style={{
        background: 'var(--bg-surface)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: '920px',
        padding: '36px',
        position: 'relative',
        marginTop: '8px',
        marginBottom: '24px'
      }}>

        {/* Modal Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--c-lime)',
            border: '1.5px solid #000000',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <span>✦ NEW STICKY NOTE</span>
          </div>

          <h2 className="font-display" style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '-0.5px'
          }}>
            Pin a Custom Thought
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Add your favorite personal quote, book excerpt, or daily reminder to your board.
          </p>
        </div>

        {/* Form and Preview Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'start'
        }}>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Quote or Thought *
              </label>
              <textarea
                required
                rows={4}
                placeholder="What words inspire you today?..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="font-hand"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-thick)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '1.35rem',
                  lineHeight: '1.3',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Author
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Angelou"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thick)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thick)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem'
                  }}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note Color Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                Sticky Note Color
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorId(c.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: colorId === c.id ? '2.5px solid #000000' : '1.5px solid #000000',
                      background: c.bg,
                      color: c.text,
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: colorId === c.id ? '2px 2px 0px #000000' : 'none',
                      transform: colorId === c.id ? 'translate(-2px, -2px)' : 'none'
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="noted-btn btn-lime"
              style={{ justifyContent: 'center', padding: '13px', marginTop: '10px', fontSize: '0.92rem' }}
            >
              <Plus size={18} strokeWidth={3} />
              <span>Pin Note to Board</span>
            </button>
          </form>

          {/* Right Live Preview */}
          <div style={{
            background: 'var(--bg-main)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-sm)',
            padding: '36px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="font-mono" style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              marginBottom: '20px',
              background: '#000000',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '2px'
            }}>
              LIVE NOTE PREVIEW
            </div>

            <div style={{ width: '100%', maxWidth: '340px' }}>
              <StickyNote
                quoteItem={previewItem}
                onLike={() => {}}
                onTogglePin={() => {}}
                onUpdateStyle={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
