import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Copy, 
  Check, 
  Maximize,
  Wind
} from 'lucide-react';
import { soundscape } from '../utils/soundscapes';

export default function ZenSanctuary({ quotes, onLike, onSelectQuote }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [soundMode, setSoundMode] = useState('bowl');
  const [copied, setCopied] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');

  const currentQuote = quotes[currentIndex] || quotes[0];

  // Auto-play timer
  useEffect(() => {
    let interval = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % quotes.length);
      }, 9000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, quotes.length]);

  // Breathing cycle
  useEffect(() => {
    const phases = ['Inhale serenity', 'Hold stillness', 'Release tension'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathPhase(phases[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % quotes.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length);
  };

  const handleRandom = () => {
    const rand = Math.floor(Math.random() * quotes.length);
    setCurrentIndex(rand);
  };

  const handleToggleAudio = () => {
    if (soundMode) {
      soundscape.stop();
      setSoundMode(null);
    } else {
      soundscape.playSingingBowl();
      setSoundMode('bowl');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Soft Zen Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none',
        opacity: 0.6
      }} />

      {/* Breathing Guide Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        borderRadius: '99px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '40px',
        color: 'var(--accent-gold-light)',
        fontSize: '0.82rem',
        letterSpacing: '1px'
      }}>
        <Wind size={14} className="pulse-glow" />
        <span className="font-heading" style={{ textTransform: 'uppercase' }}>{breathPhase}</span>
      </div>

      {/* Hero Zen Quote Card */}
      <div 
        key={currentQuote.id}
        className="animate-fade-in"
        style={{
          maxWidth: '920px',
          width: '100%',
          textAlign: 'center',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(30px)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 48px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <span style={{
          fontSize: '0.75rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--accent-gold)',
          fontWeight: 700,
          display: 'block',
          marginBottom: '20px'
        }}>
          ✦ {currentQuote.category} • {currentQuote.era || 'Timeless'}
        </span>

        <p className="font-serif" style={{
          fontSize: '2.1rem',
          lineHeight: '1.5',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          letterSpacing: '0.3px',
          marginBottom: '32px'
        }}>
          “{currentQuote.quote}”
        </p>

        <div className="font-heading" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '2px',
          color: 'var(--accent-gold-light)'
        }}>
          — {currentQuote.author}
        </div>

        {currentQuote.source && (
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            marginTop: '6px'
          }}>
            From: {currentQuote.source}
          </div>
        )}

        {/* Action icons on card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '36px'
        }}>
          <button
            onClick={() => onLike(currentQuote.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '99px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <Heart size={15} fill={currentQuote.liked ? '#ff4d6d' : 'none'} color={currentQuote.liked ? '#ff4d6d' : 'currentColor'} />
            <span style={{ fontSize: '0.8rem' }}>{currentQuote.likes || 0}</span>
          </button>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '99px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: copied ? '#4ade80' : 'var(--text-secondary)'
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span style={{ fontSize: '0.8rem' }}>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleToggleAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '99px',
              background: soundMode ? 'rgba(223, 177, 91, 0.2)' : 'var(--bg-secondary)',
              border: soundMode ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
              color: soundMode ? 'var(--accent-gold)' : 'var(--text-secondary)'
            }}
          >
            {soundMode ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span style={{ fontSize: '0.8rem' }}>{soundMode ? 'Bowl Drone' : 'Sound Off'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '36px',
        zIndex: 1
      }}>
        <button
          onClick={handlePrev}
          style={{
            padding: '12px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
          title="Previous Wisdom"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '99px',
            background: isAutoPlaying ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark))' : 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: isAutoPlaying ? '#09090c' : 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isAutoPlaying ? 'Pause Journey' : 'Begin Journey'}</span>
        </button>

        <button
          onClick={handleRandom}
          style={{
            padding: '12px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
          title="Random Starlight Wisdom"
        >
          <Shuffle size={20} />
        </button>

        <button
          onClick={handleNext}
          style={{
            padding: '12px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
          title="Next Wisdom"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{
        marginTop: '20px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-serif)'
      }}>
        {currentIndex + 1} of {quotes.length} sacred meditations
      </div>
    </div>
  );
}
