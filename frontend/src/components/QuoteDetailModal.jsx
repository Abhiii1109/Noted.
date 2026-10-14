import React, { useState, useRef } from 'react';
import { 
  X, 
  Heart, 
  Pin, 
  Copy, 
  Check, 
  Download, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { NOTE_COLORS } from '../data/quotesData';

export default function QuoteDetailModal({ 
  quoteItem, 
  onClose, 
  onLike, 
  onTogglePin 
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cardRef = useRef(null);

  if (!quoteItem) return null;

  const colorTheme = NOTE_COLORS.find(c => c.id === quoteItem.colorId) || NOTE_COLORS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quoteItem.quote}" — ${quoteItem.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`"${quoteItem.quote}" by ${quoteItem.author}`);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.98, pixelRatio: 2 });
      const a = document.createElement('a');
      a.download = `noted-${quoteItem.author.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.href = dataUrl;
      a.click();
      confetti({ particleCount: 40, spread: 60, colors: [colorTheme.bg, '#000000'] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto'
      }}
    >
      {/* Fixed close button */}
      <button
        className="modal-close-btn"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 700,
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
        maxWidth: '780px',
        padding: '36px 32px',
        position: 'relative',
        marginTop: '8px',
        marginBottom: '24px'
      }}>

        {/* Exportable Art Card with handwritten quote */}
        <div 
          ref={cardRef}
          style={{
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-sm)',
            background: colorTheme.bg,
            color: '#0e0f14',
            padding: '44px 32px',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '28px',
            position: 'relative'
          }}
        >
          {/* Header tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid rgba(0,0,0,0.3)',
            paddingBottom: '12px',
            marginBottom: '24px'
          }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
              ✦ NOTED. // {quoteItem.category}
            </span>
            <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
              #{quoteItem.tag || 'WISDOM'}
            </span>
          </div>

          <p className="font-hand" style={{
            fontSize: '2.1rem',
            lineHeight: '1.35',
            fontWeight: 700,
            letterSpacing: '0.2px',
            marginBottom: '28px',
            color: '#0b0b0e'
          }}>
            “{quoteItem.quote}”
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <span className="font-display" style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              background: '#0e0f14',
              color: '#ffffff',
              padding: '4px 14px',
              borderRadius: '4px'
            }}>
              — {quoteItem.author}
            </span>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onLike(quoteItem.id)}
              className="noted-btn"
            >
              <Heart size={15} fill={quoteItem.liked ? '#ff4d6d' : 'none'} color={quoteItem.liked ? '#ff4d6d' : 'currentColor'} />
              <span>{quoteItem.likes || 0} Likes</span>
            </button>

            <button
              onClick={() => onTogglePin(quoteItem.id)}
              className="noted-btn"
            >
              <Pin size={15} fill={quoteItem.pinned ? 'currentColor' : 'none'} />
              <span>{quoteItem.pinned ? 'Pinned to Board' : 'Pin to Board'}</span>
            </button>

            <button
              onClick={handleSpeak}
              className="noted-btn"
              title="Voice recital"
            >
              {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCopy}
              className="noted-btn"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleExportPng}
              className="noted-btn btn-mint"
            >
              <Download size={15} />
              <span>Download Art Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
