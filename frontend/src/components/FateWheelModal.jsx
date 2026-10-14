import React, { useState } from 'react';
import { X, Shuffle, Copy, Check, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FateWheelModal({ isOpen, onClose, quotes, onLike }) {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSurprise = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * quotes.length);
      setSelectedQuote(quotes[rand]);
      count++;
      if (count > 14) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 45,
          spread: 60,
          colors: ['#d8ff38', '#c4b5fd', '#ff8566', '#000000']
        });
      }
    }, 75);
  };

  const current = selectedQuote || quotes[Math.floor(Math.random() * quotes.length)];

  const handleCopy = () => {
    if (!current) return;
    navigator.clipboard.writeText(`"${current.quote}" — ${current.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 500,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: '640px',
        padding: '38px 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: '2px solid #000000',
            borderRadius: '4px',
            background: '#000000',
            color: '#ffffff',
            padding: '6px',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--c-lilac)',
          color: '#000000',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1.5px solid #000000',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          fontWeight: 800,
          marginBottom: '14px'
        }}>
          <Sparkles size={12} />
          <span>SERENDIPITY GENERATOR</span>
        </div>

        <h3 className="font-display" style={{
          fontSize: '1.85rem',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          marginBottom: '20px'
        }}>
          Wisdom Meant For You Today
        </h3>

        {/* Quote Block with handwritten font */}
        <div style={{
          border: 'var(--border-thick)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--c-lime)',
          color: '#0e0f14',
          padding: '32px 26px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '24px',
          minHeight: '170px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transform: isSpinning ? 'scale(0.98)' : 'scale(1)',
          transition: 'transform 0.15s ease'
        }}>
          <p className="font-hand" style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            lineHeight: '1.3',
            letterSpacing: '0.2px',
            marginBottom: '16px'
          }}>
            “{current?.quote}”
          </p>

          <div style={{
            display: 'inline-block',
            alignSelf: 'center',
            background: '#0e0f14',
            color: '#ffffff',
            padding: '4px 14px',
            borderRadius: '4px',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 800
          }}>
            — {current?.author}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSurprise}
            disabled={isSpinning}
            className="noted-btn btn-lime"
          >
            <Shuffle size={15} />
            <span>{isSpinning ? 'Rolling the Fate...' : 'Roll Again'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="noted-btn"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {current && (
            <button
              onClick={() => onLike(current.id)}
              className="noted-btn"
            >
              <Heart size={15} fill={current.liked ? '#ff4d6d' : 'none'} color={current.liked ? '#ff4d6d' : 'currentColor'} />
              <span>{current.likes || 0}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
