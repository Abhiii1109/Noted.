import React, { useState, useRef } from 'react';
import {
  Heart,
  Pin,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  Palette,
  Maximize2
} from 'lucide-react';
import { NOTE_COLORS } from '../data/quotesData';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export default function StickyNote({
  quoteItem,
  onLike,
  onTogglePin,
  onUpdateStyle,
  onSelectQuote
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const noteRef = useRef(null);

  const colorTheme = NOTE_COLORS.find(c => c.id === quoteItem.colorId) || NOTE_COLORS[0];

  // Voice recital
  const handleSpeak = (e) => {
    e.stopPropagation();
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

  // Copy formatted quote
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${quoteItem.quote}" — ${quoteItem.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Export card as PNG
  const handleExport = async (e) => {
    e.stopPropagation();
    if (!noteRef.current) return;
    try {
      const dataUrl = await toPng(noteRef.current, { quality: 0.98, pixelRatio: 2 });
      const a = document.createElement('a');
      a.download = `noted-${quoteItem.author.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.href = dataUrl;
      a.click();
      confetti({ particleCount: 30, spread: 50, colors: ['#000000', colorTheme.bg] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      ref={noteRef}
      className="sticky-note-item fade-in"
      style={{
        background: colorTheme.bg,
        color: colorTheme.text,
      }}
    >
      {/* Top header strip: category chip + pin button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Category badge */}
        <span
          className="note-category-chip"
          style={{ color: 'rgba(0,0,0,0.65)' }}
        >
          {quoteItem.tag || quoteItem.category?.toUpperCase() || 'NOTE'}
        </span>

        {/* Pin button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(quoteItem.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            borderRadius: '3px',
            border: '1.5px solid rgba(0,0,0,0.35)',
            background: quoteItem.pinned ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.45)',
            color: quoteItem.pinned ? colorTheme.bg : 'rgba(0,0,0,0.7)',
            fontWeight: 800,
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.6px',
            cursor: 'pointer',
            transition: 'all 0.1s'
          }}
          title={quoteItem.pinned ? 'Pinned' : 'Pin this note'}
        >
          <Pin size={10} fill={quoteItem.pinned ? 'currentColor' : 'none'} />
          <span>{quoteItem.pinned ? 'PINNED' : 'PIN'}</span>
        </button>
      </div>

      {/* Divider */}
      <div style={{
        height: '1.5px',
        background: 'rgba(0,0,0,0.15)',
        marginBottom: '16px'
      }} />

      {/* Main Quote Text — Handwritten font */}
      <div
        onClick={() => onSelectQuote && onSelectQuote(quoteItem)}
        style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <p
          className="font-hand"
          style={{
            fontSize: quoteItem.quote.length > 140 ? '1.38rem' : quoteItem.quote.length > 100 ? '1.55rem' : '1.75rem',
            lineHeight: '1.3',
            fontWeight: 700,
            color: '#0b0b0e',
            letterSpacing: '0.2px',
            marginBottom: '16px'
          }}
        >
          &ldquo;{quoteItem.quote}&rdquo;
        </p>

        {/* Author */}
        <div style={{ textAlign: 'right', marginTop: 'auto' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'rgba(0,0,0,0.75)',
            background: 'rgba(0,0,0,0.07)',
            padding: '3px 10px',
            borderRadius: '3px',
            fontFamily: 'var(--font-display)',
            border: '1px solid rgba(0,0,0,0.12)'
          }}>
            — {quoteItem.author}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: '1.5px',
        background: 'rgba(0,0,0,0.15)',
        marginTop: '16px',
        marginBottom: '12px'
      }} />

      {/* Bottom Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Like & Audio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(quoteItem.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              borderRadius: '3px',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: quoteItem.liked ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.4)',
              color: quoteItem.liked ? '#fff' : 'rgba(0,0,0,0.7)',
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.1s'
            }}
          >
            <Heart
              size={11}
              fill={quoteItem.liked ? '#ff4d6d' : 'none'}
              color={quoteItem.liked ? '#ff4d6d' : 'currentColor'}
            />
            <span>{quoteItem.likes || 0}</span>
          </button>

          <button
            onClick={handleSpeak}
            className="note-btn-action"
            style={{
              padding: '5px 7px',
              borderRadius: '3px',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: isSpeaking ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.4)',
              color: isSpeaking ? colorTheme.bg : 'rgba(0,0,0,0.7)',
              cursor: 'pointer',
              display: 'flex',
              transition: 'all 0.1s'
            }}
            title="Read aloud"
          >
            {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
          </button>
        </div>

        {/* Right: Palette, Copy, Download, Expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
          {/* Palette Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPalette(!showPalette);
              }}
              className="note-btn-action"
              style={{
                padding: '5px 7px',
                borderRadius: '3px',
                border: '1.5px solid rgba(0,0,0,0.3)',
                background: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Change color"
            >
              <Palette size={11} />
            </button>

            {showPalette && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '6px',
                background: '#ffffff',
                border: '2px solid #000',
                borderRadius: '4px',
                boxShadow: '4px 4px 0px #000',
                padding: '6px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '5px',
                zIndex: 100
              }}>
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStyle(quoteItem.id, c.id);
                      setShowPalette(false);
                    }}
                    title={c.name}
                    style={{
                      width: '22px',
                      height: '22px',
                      background: c.bg,
                      border: '1.5px solid rgba(0,0,0,0.3)',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="note-btn-action"
            style={{
              padding: '5px 7px',
              borderRadius: '3px',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: copied ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.4)',
              color: copied ? '#c8f135' : 'rgba(0,0,0,0.7)',
              cursor: 'pointer',
              display: 'flex',
              transition: 'all 0.1s'
            }}
            title="Copy quote"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>

          {/* Download */}
          <button
            onClick={handleExport}
            className="note-btn-action"
            style={{
              padding: '5px 7px',
              borderRadius: '3px',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Download quote card"
          >
            <Download size={11} />
          </button>

          {/* Expand */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectQuote && onSelectQuote(quoteItem);
            }}
            className="note-btn-action"
            style={{
              padding: '5px 7px',
              borderRadius: '3px',
              border: '1.5px solid rgba(0,0,0,0.3)',
              background: 'rgba(0,0,0,0.85)',
              color: colorTheme.bg,
              cursor: 'pointer',
              display: 'flex'
            }}
            title="Expand"
          >
            <Maximize2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
