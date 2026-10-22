import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  Shuffle,
  Smartphone,
  Square,
  Monitor,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  CheckCircle2,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import confetti from 'canvas-confetti';

// Aspect Ratios configuration
const ASPECT_RATIOS = [
  {
    id: '9:16',
    label: 'Story / Wallpaper',
    sub: '9:16 • 1080×1920',
    icon: Smartphone,
    width: 450,
    height: 800,
    aspectClass: 'ratio-story'
  },
  {
    id: '1:1',
    label: 'Square Post',
    sub: '1:1 • 1080×1080',
    icon: Square,
    width: 600,
    height: 600,
    aspectClass: 'ratio-square'
  },
  {
    id: '4:5',
    label: 'Portrait Feed',
    sub: '4:5 • 1080×1350',
    icon: Smartphone,
    width: 480,
    height: 600,
    aspectClass: 'ratio-portrait'
  },
  {
    id: '16:9',
    label: 'Landscape / X',
    sub: '16:9 • 1920×1080',
    icon: Monitor,
    width: 720,
    height: 405,
    aspectClass: 'ratio-landscape'
  }
];

// Themes configuration
const THEMES = [
  {
    id: 'neo',
    name: 'Neo-Brutalist',
    tagline: 'Bold, raw & iconic',
    previewBg: '#c8f135',
    previewBorder: '#000000',
    previewText: '#000000'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'Dark void & electric glow',
    previewBg: '#090a10',
    previewBorder: '#00f0ff',
    previewText: '#00f0ff'
  },
  {
    id: 'swiss',
    name: 'Swiss Editorial',
    tagline: 'Clean gallery minimalism',
    previewBg: '#faf9f5',
    previewBorder: '#e63946',
    previewText: '#111111'
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Parchment',
    tagline: 'Warm vintage archival paper',
    previewBg: '#f4ede2',
    previewBorder: '#8c7862',
    previewText: '#2e241c'
  },
  {
    id: 'notebook',
    name: 'Notebook Page',
    tagline: 'Lined paper, spiral rings & margin',
    previewBg: '#fcfbf7',
    previewBorder: '#e57373',
    previewText: '#16253d'
  },
  {
    id: 'aurora',
    name: 'Aurora Sunset',
    tagline: 'Dreamy glassmorphism glow',
    previewBg: 'linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)',
    previewBorder: 'rgba(255,255,255,0.4)',
    previewText: '#ffffff'
  }
];

// Neo-brutalist color options
const NEO_COLORS = [
  { id: 'lime', name: 'Acid Lime', bg: '#c8f135', text: '#000000' },
  { id: 'peach', name: 'Warm Peach', bg: '#fbc98a', text: '#000000' },
  { id: 'lilac', name: 'Cyber Lilac', bg: '#b8a9f8', text: '#000000' },
  { id: 'coral', name: 'Punch Coral', bg: '#ff7a5c', text: '#000000' },
  { id: 'mint', name: 'Fresh Mint', bg: '#4dd9c0', text: '#000000' },
  { id: 'paper', name: 'Raw Paper', bg: '#ffffff', text: '#000000' },
  { id: 'lemon', name: 'Solar Yellow', bg: '#ffea52', text: '#000000' }
];

// Typography styles
const FONTS = [
  { id: 'hand', name: 'Handwritten', family: 'var(--font-hand)' },
  { id: 'modern', name: 'Bold Modern', family: 'var(--font-display)' },
  { id: 'serif', name: 'Editorial Serif', family: 'var(--font-serif)' },
  { id: 'mono', name: 'Retro Mono', family: 'var(--font-mono)' }
];

export default function QuoteCardStudioModal({
  isOpen,
  onClose,
  initialQuote,
  allQuotes = []
}) {
  const [activeQuote, setActiveQuote] = useState(initialQuote);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [theme, setTheme] = useState('neo');
  const [font, setFont] = useState('modern');
  const [fontSize, setFontSize] = useState('md'); // 'sm' | 'md' | 'lg'
  const [alignment, setAlignment] = useState('left');
  const [neoColor, setNeoColor] = useState(NEO_COLORS[0]);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showCategory, setShowCategory] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('theme'); // 'theme' | 'format' | 'text'
  const [scaleFactor, setScaleFactor] = useState(0.85);

  const cardRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Sync initial quote when opened
  useEffect(() => {
    if (initialQuote) {
      setActiveQuote(initialQuote);
    } else if (allQuotes.length > 0 && !activeQuote) {
      setActiveQuote(allQuotes[0]);
    }
  }, [initialQuote, allQuotes]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !activeQuote) return null;

  // Shuffle quote
  const handleShuffleQuote = () => {
    if (!allQuotes || allQuotes.length === 0) return;
    const filtered = allQuotes.filter(q => q.id !== activeQuote.id);
    const pool = filtered.length > 0 ? filtered : allQuotes;
    const randomQuote = pool[Math.floor(Math.random() * pool.length)];
    setActiveQuote(randomQuote);
  };

  // Current Aspect Ratio config
  const currentRatio = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];

  // Dynamically calculate the scale to perfectly fit ANY screen (especially mobile) without clipping
  useEffect(() => {
    if (!isOpen) return;

    const computeScale = () => {
      if (!previewContainerRef.current) return;
      const stageW = previewContainerRef.current.clientWidth;
      const stageH = previewContainerRef.current.clientHeight;
      if (!stageW || !stageH) return;

      const targetW = currentRatio.width;
      const targetH = currentRatio.height;
      const availW = Math.max(120, stageW - 24);
      const availH = Math.max(120, stageH - 24);

      const scaleW = availW / targetW;
      const scaleH = availH / targetH;
      const bestScale = Math.min(scaleW, scaleH, 0.95);
      setScaleFactor(Math.max(0.22, Math.min(bestScale, 1.05)));
    };

    const timer = setTimeout(computeScale, 50);
    window.addEventListener('resize', computeScale);

    let resizeObserver;
    if (window.ResizeObserver && previewContainerRef.current) {
      resizeObserver = new ResizeObserver(computeScale);
      resizeObserver.observe(previewContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', computeScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isOpen, aspectRatio, currentRatio.width, currentRatio.height]);

  // Font size multiplier
  const getFontSizeStyle = () => {
    const quoteLength = activeQuote.quote.length;
    let base = 28;
    if (quoteLength > 180) base = 21;
    else if (quoteLength > 120) base = 24;
    else if (quoteLength < 60) base = 34;

    if (fontSize === 'sm') base *= 0.85;
    if (fontSize === 'lg') base *= 1.2;

    if (aspectRatio === '16:9') base *= 0.85;
    if (font === 'hand') base *= 1.18;

    return {
      fontSize: `${Math.round(base)}px`,
      lineHeight: font === 'hand' ? '1.25' : '1.35'
    };
  };

  // Export as PNG
  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      // High resolution export: 2.5x pixel ratio for retina screens
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const safeAuthor = (activeQuote.author || 'quote')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 24);
      const link = document.createElement('a');
      link.download = `noted-${safeAuthor}-${aspectRatio.replace(':', 'x')}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2400);
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        // Fallback to downloading if clipboard image write isn't supported
        handleDownload();
      }
    } catch (err) {
      console.error('Copy to clipboard failed, downloading instead:', err);
      handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  // Native Web Share (Instagram, WhatsApp, etc. on mobile)
  const handleShare = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true
      });

      if (blob && navigator.canShare) {
        const file = new File([blob], `noted-quote.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Quote by ${activeQuote.author}`,
            text: `"${activeQuote.quote}" — ${activeQuote.author}`
          });
          return;
        }
      }
      // If Web Share files is not supported:
      handleDownload();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        handleDownload();
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="modal-overlay studio-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(9, 10, 15, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="studio-modal-card"
        style={{
          width: '100%',
          maxWidth: '1240px',
          height: '92vh',
          maxHeight: '860px',
          background: 'var(--bg-surface)',
          border: 'var(--border-thick)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '10px 10px 0px #000000',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Studio Header */}
        <div style={{
          padding: '12px 20px',
          borderBottom: 'var(--border-thick)',
          background: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--c-lime)',
              border: '2px solid #000',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px #000'
            }}>
              <ImageIcon size={18} strokeWidth={2.5} color="#000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="font-display" style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  letterSpacing: '-0.3px',
                  margin: 0,
                  lineHeight: 1
                }}>
                  Quote Card Studio
                </h2>
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  background: '#000',
                  color: 'var(--c-lime)',
                  padding: '1px 6px',
                  borderRadius: '3px'
                }}>
                  HD EXPORT
                </span>
              </div>
              <p className="studio-header-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                Create viral social assets & wallpapers with one click
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleShuffleQuote}
              className="noted-btn"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title="Switch to another quote"
            >
              <Shuffle size={13} />
              <span className="btn-label">Random Quote</span>
            </button>

            <button
              onClick={onClose}
              className="noted-btn"
              style={{ padding: '6px 10px', background: '#000', color: '#fff' }}
              title="Close studio"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Studio Body: Left Preview, Right Controls */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }} className="studio-body-layout">

          {/* LEFT: Live Interactive Preview Stage */}
          <div
            ref={previewContainerRef}
            className="studio-stage"
            style={{
              flex: 1,
              background: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px), #1e2029',
              backgroundSize: '20px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Aspect Ratio Badge floating */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              background: 'rgba(0,0,0,0.7)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <span>{currentRatio.label}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ color: 'var(--c-lime)' }}>{currentRatio.id}</span>
            </div>

            {/* PREVIEW CONTAINER WITH DYNAMIC SCALING TO FIT ANY SCREEN */}
            <div
              className="studio-card-outer"
              style={{
                width: `${Math.round(currentRatio.width * scaleFactor)}px`,
                height: `${Math.round(currentRatio.height * scaleFactor)}px`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 20px 50px -15px rgba(0,0,0,0.6)',
                transition: 'width 0.18s ease, height 0.18s ease'
              }}
            >
              <div
                className="studio-card-wrapper"
                style={{
                  width: `${currentRatio.width}px`,
                  height: `${currentRatio.height}px`,
                  transform: `scale(${scaleFactor})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* THE TARGET CARD TO RENDER AND EXPORT */}
                <div
                  ref={cardRef}
                  id="studio-export-card"
                  style={{
                    width: `${currentRatio.width}px`,
                    height: `${currentRatio.height}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: theme === 'notebook'
                      ? (aspectRatio === '16:9' ? '36px 40px 36px 82px' : '44px 38px 44px 84px')
                      : (aspectRatio === '16:9' ? '36px 48px' : '48px 42px'),
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
                    ...getThemeContainerStyles(theme, neoColor)
                  }}
                >
                {/* THEME BACKGROUND ACCENTS */}
                {renderThemeBackdrop(theme)}

                {/* CARD HEADER */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2,
                  marginBottom: '16px'
                }}>
                  {/* Category Chip */}
                  {showCategory ? (
                    <div style={getCategoryBadgeStyle(theme, neoColor)}>
                      {theme === 'cyberpunk' && '// '}
                      {(activeQuote.category || 'WISDOM').toUpperCase()}
                      {theme === 'lofi' && ' • ARCHIVE'}
                    </div>
                  ) : <div />}

                  {/* Header Mark */}
                  <div style={getHeaderMarkStyle(theme)}>
                    {theme === 'neo' && 'N° 026'}
                    {theme === 'cyberpunk' && '[SYS_OK]'}
                    {theme === 'swiss' && 'FOLIO. 88'}
                    {theme === 'lofi' && '★ EST. 2026 ★'}
                    {theme === 'notebook' && 'DATE: ___ / ___ / 2026  •  PAGE 01'}
                    {theme === 'aurora' && '✦ NOTED'}
                  </div>
                </div>

                {/* MAIN QUOTE BODY */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  textAlign: alignment
                }}>
                  {/* Big quotation mark accent for swiss/neo */}
                  {theme === 'swiss' && (
                    <div style={{
                      width: '40px',
                      height: '4px',
                      background: '#e63946',
                      marginBottom: '24px'
                    }} />
                  )}

                  <p
                    style={{
                      ...getFontSizeStyle(),
                      fontFamily: getFontFamilyValue(font),
                      fontWeight: font === 'hand' ? 700 : font === 'serif' ? 600 : 800,
                      letterSpacing: font === 'mono' ? '-0.5px' : '-0.2px',
                      margin: 0,
                      ...getQuoteTextColor(theme)
                    }}
                  >
                    &ldquo;{activeQuote.quote}&rdquo;
                  </p>

                  {/* Author Attribution */}
                  <div style={{
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'
                  }}>
                    <span style={getAuthorBadgeStyle(theme)}>
                      {theme === 'cyberpunk' && '> '}— {activeQuote.author}
                    </span>
                  </div>
                </div>

                {/* CARD FOOTER WATERMARK */}
                {showWatermark && (
                  <div style={{
                    position: 'relative',
                    zIndex: 2,
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: getWatermarkBorder(theme),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    ...getWatermarkColor(theme)
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: theme === 'neo' ? '0px' : '50%',
                        background: theme === 'cyberpunk' ? '#00f0ff' : theme === 'aurora' ? '#ffffff' : '#000000'
                      }} />
                      <span>NOTED.</span>
                      <span style={{ opacity: 0.6 }}>— Sticky wisdom</span>
                    </div>

                    <div style={{ opacity: 0.8 }}>
                      noted-quotes.vercel.app
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* RIGHT: Control Customizer Panel */}
          <div
            className="studio-sidebar"
            style={{
              width: '380px',
              borderLeft: 'var(--border-thick)',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              overflowY: 'auto'
            }}
          >
            {/* Control Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: 'var(--border-thick)',
              background: 'var(--bg-main)',
              flexShrink: 0
            }}>
              <button
                onClick={() => setActiveTab('theme')}
                style={{
                  padding: '10px 8px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: 'none',
                  borderRight: 'var(--border-thin)',
                  background: activeTab === 'theme' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'theme' ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Palette size={14} />
                <span>Theme</span>
              </button>

              <button
                onClick={() => setActiveTab('format')}
                style={{
                  padding: '10px 8px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: 'none',
                  borderRight: 'var(--border-thin)',
                  background: activeTab === 'format' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'format' ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Layers size={14} />
                <span>Aspect</span>
              </button>

              <button
                onClick={() => setActiveTab('text')}
                style={{
                  padding: '10px 8px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: 'none',
                  background: activeTab === 'text' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'text' ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Type size={14} />
                <span>Type</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              {/* TAB 1: THEMES */}
              {activeTab === 'theme' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '10px'
                    }}>
                      Select Visual Theme
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {THEMES.map(th => {
                        const isSelected = theme === th.id;
                        return (
                          <div
                            key={th.id}
                            onClick={() => {
                              setTheme(th.id);
                              if (th.id === 'notebook') setFont('hand');
                            }}
                            style={{
                              padding: '10px 12px',
                              border: isSelected ? '2px solid #000000' : '1.5px solid var(--border-color, #e0e0e0)',
                              borderRadius: 'var(--radius-sm)',
                              background: isSelected ? 'var(--bg-main)' : 'var(--bg-surface)',
                              boxShadow: isSelected ? '3px 3px 0px #000000' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.12s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                border: '1.5px solid rgba(0,0,0,0.3)',
                                background: th.previewBg,
                                flexShrink: 0
                              }} />
                              <div>
                                <div style={{
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  fontFamily: 'var(--font-display)',
                                  color: 'var(--text-main)'
                                }}>
                                  {th.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {th.tagline}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 size={16} color="var(--c-lime)" fill="#000000" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* If Neo-brutalist: Color Swatches */}
                  {theme === 'neo' && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        Paper Accent Color
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {NEO_COLORS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setNeoColor(c)}
                            title={c.name}
                            style={{
                              height: '38px',
                              background: c.bg,
                              border: neoColor.id === c.id ? '2.5px solid #000' : '1.5px solid rgba(0,0,0,0.25)',
                              borderRadius: '4px',
                              boxShadow: neoColor.id === c.id ? '2px 2px 0px #000' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.65rem'
                            }}
                          >
                            {neoColor.id === c.id && <Check size={14} color="#000" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Watermark Toggle */}
                  <div style={{
                    padding: '12px',
                    border: 'var(--border-thin)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
                        NOTED. Watermark
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Include branding & link on card
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#000000' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FORMAT & RATIO */}
              {activeTab === 'format' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '10px'
                    }}>
                      Select Aspect Ratio
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {ASPECT_RATIOS.map(ratio => {
                        const Icon = ratio.icon;
                        const isSelected = aspectRatio === ratio.id;
                        return (
                          <div
                            key={ratio.id}
                            onClick={() => setAspectRatio(ratio.id)}
                            style={{
                              padding: '14px 10px',
                              border: isSelected ? '2px solid #000' : '1.5px solid var(--border-color, #e0e0e0)',
                              borderRadius: 'var(--radius-sm)',
                              background: isSelected ? 'var(--c-lime)' : 'var(--bg-surface)',
                              boxShadow: isSelected ? '3px 3px 0px #000' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              gap: '6px',
                              transition: 'all 0.12s ease'
                            }}
                          >
                            <Icon size={20} color={isSelected ? '#000' : 'var(--text-secondary)'} />
                            <div>
                              <div style={{
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                color: isSelected ? '#000' : 'var(--text-main)',
                                fontFamily: 'var(--font-display)'
                              }}>
                                {ratio.id}
                              </div>
                              <div style={{
                                fontSize: '0.68rem',
                                color: isSelected ? 'rgba(0,0,0,0.7)' : 'var(--text-muted)',
                                marginTop: '2px'
                              }}>
                                {ratio.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Elements display */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '10px'
                    }}>
                      Card Badges
                    </label>

                    <div style={{
                      padding: '12px',
                      border: 'var(--border-thin)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Show Category Tag</span>
                      <input
                        type="checkbox"
                        checked={showCategory}
                        onChange={(e) => setShowCategory(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#000' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TYPOGRAPHY */}
              {activeTab === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Font Family */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '10px'
                    }}>
                      Font Family
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {FONTS.map(f => {
                        const isSelected = font === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => setFont(f.id)}
                            style={{
                              padding: '10px 8px',
                              border: isSelected ? '2px solid #000' : '1.5px solid var(--border-color, #e0e0e0)',
                              borderRadius: '4px',
                              background: isSelected ? 'var(--c-lilac)' : 'var(--bg-surface)',
                              boxShadow: isSelected ? '2px 2px 0px #000' : 'none',
                              cursor: 'pointer',
                              fontFamily: f.family,
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#000'
                            }}
                          >
                            {f.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      Text Size
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['sm', 'md', 'lg'].map(size => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          style={{
                            padding: '8px',
                            border: fontSize === size ? '2px solid #000' : '1.5px solid var(--border-color, #e0e0e0)',
                            borderRadius: '4px',
                            background: fontSize === size ? 'var(--c-peach)' : 'var(--bg-surface)',
                            boxShadow: fontSize === size ? '2px 2px 0px #000' : 'none',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          {size === 'sm' ? 'Compact' : size === 'md' ? 'Regular' : 'Heroic'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      Alignment
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { id: 'left', icon: AlignLeft },
                        { id: 'center', icon: AlignCenter },
                        { id: 'right', icon: AlignRight }
                      ].map(item => {
                        const Icon = item.icon;
                        const isSelected = alignment === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setAlignment(item.id)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: isSelected ? '2px solid #000' : '1.5px solid var(--border-color, #e0e0e0)',
                              borderRadius: '4px',
                              background: isSelected ? '#000' : 'var(--bg-surface)',
                              color: isSelected ? '#fff' : 'var(--text-main)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Export Action Footer */}
            <div
              className="studio-export-footer"
              style={{
                padding: '14px 20px',
                borderTop: 'var(--border-thick)',
                background: 'var(--bg-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flexShrink: 0,
                position: 'sticky',
                bottom: 0,
                zIndex: 20
              }}
            >
              {/* Primary Download Button */}
              <button
                id="studio-download-btn"
                onClick={handleDownload}
                disabled={isExporting}
                className="noted-btn btn-lime"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  justifyContent: 'center'
                }}
              >
                <Download size={16} strokeWidth={2.5} />
                <span>{isExporting ? 'Generating Asset...' : 'Download Image (PNG)'}</span>
              </button>

              {/* Secondary Actions: Copy & Share */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopyImage}
                  disabled={isExporting}
                  className="noted-btn"
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    fontSize: '0.8rem',
                    justifyContent: 'center',
                    background: copiedSuccess ? '#c8f135' : 'var(--bg-surface)'
                  }}
                  title="Copy image directly to clipboard"
                >
                  {copiedSuccess ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                  <span>{copiedSuccess ? 'Image Copied!' : 'Copy Image'}</span>
                </button>

                <button
                  onClick={handleShare}
                  disabled={isExporting}
                  className="noted-btn"
                  style={{
                    padding: '9px 12px',
                    fontSize: '0.8rem',
                    justifyContent: 'center'
                  }}
                  title="Share directly to Stories / Apps"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers for themes
function getFontFamilyValue(font) {
  switch (font) {
    case 'hand': return 'var(--font-hand)';
    case 'serif': return 'var(--font-serif)';
    case 'mono': return 'var(--font-mono)';
    default: return 'var(--font-display)';
  }
}

function getThemeContainerStyles(theme, neoColor) {
  switch (theme) {
    case 'neo':
      return {
        background: neoColor.bg,
        border: '4px solid #000000',
        borderRadius: '4px',
        boxShadow: '12px 12px 0px #000000'
      };
    case 'cyberpunk':
      return {
        background: '#090a10',
        border: '1.5px solid rgba(0, 240, 255, 0.45)',
        borderRadius: '6px',
        boxShadow: '0 0 35px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05)'
      };
    case 'swiss':
      return {
        background: '#faf9f5',
        border: '1px solid #1a1a1a',
        borderRadius: '0px',
        boxShadow: 'none'
      };
    case 'lofi':
      return {
        background: '#f4ede2',
        border: '2px solid #8c7862',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 40px rgba(140, 120, 98, 0.15), 6px 6px 0px rgba(140, 120, 98, 0.35)'
      };
    case 'notebook':
      return {
        background: '#fcfbf7',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, #d8e3ed 31px, #d8e3ed 32px)',
        backgroundPosition: '0 8px',
        border: '1px solid #d5d0c6',
        borderRadius: '3px',
        boxShadow: '0 16px 36px -8px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.1)'
      };
    case 'aurora':
      return {
        background: 'linear-gradient(135deg, #1b0a2a 0%, #3e1259 40%, #ff5e62 85%, #ff9966 100%)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
      };
    default:
      return {};
  }
}

function renderThemeBackdrop(theme) {
  if (theme === 'neo') {
    return (
      <>
        {/* Top Washi Tape Graphic */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-1deg)',
          width: '120px',
          height: '24px',
          background: 'rgba(255,255,255,0.7)',
          border: '1px dashed rgba(0,0,0,0.35)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 3
        }} />
      </>
    );
  }
  if (theme === 'cyberpunk') {
    return (
      <>
        {/* Cyberpunk corner markers */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', color: '#00f0ff', fontSize: '10px', fontFamily: 'monospace' }}>⌜</div>
        <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#00f0ff', fontSize: '10px', fontFamily: 'monospace' }}>⌝</div>
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#00f0ff', fontSize: '10px', fontFamily: 'monospace' }}>⌞</div>
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', color: '#00f0ff', fontSize: '10px', fontFamily: 'monospace' }}>⌟</div>
        {/* Subtle grid line */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />
      </>
    );
  }
  if (theme === 'notebook') {
    return (
      <>
        {/* Dog-Ear Folded Corner at Top-Right */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 28px 28px 0',
          borderColor: 'transparent #242630 transparent transparent',
          zIndex: 4,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '28px',
          height: '28px',
          background: 'linear-gradient(135deg, transparent 50%, #e2dcce 50%)',
          boxShadow: '-2px 2px 4px rgba(0,0,0,0.12)',
          zIndex: 3,
          pointerEvents: 'none'
        }} />

        {/* Double Red Margin Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '68px',
          width: '1.5px',
          background: '#e57373',
          opacity: 0.85,
          zIndex: 1,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '72px',
          width: '1px',
          background: '#f8bbd0',
          opacity: 0.7,
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Realistic Spiral Wire Coils on Left Edge */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '6px',
          width: '42px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          padding: '24px 0',
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                height: '18px'
              }}
            >
              {/* Paper punch hole */}
              <div style={{
                position: 'absolute',
                left: '16px',
                width: '10px',
                height: '14px',
                borderRadius: '3px',
                background: '#1a1c24',
                boxShadow: 'inset 1.5px 1.5px 3px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.85)'
              }} />

              {/* Metallic 3D wire ring loop */}
              <div style={{
                position: 'absolute',
                left: '0px',
                width: '32px',
                height: '9px',
                borderRadius: '6px',
                background: 'linear-gradient(180deg, #71717a 0%, #d4d4d8 35%, #ffffff 55%, #52525b 100%)',
                boxShadow: '0 2px 3px rgba(0,0,0,0.3)',
                transform: 'rotate(-4deg)'
              }} />
            </div>
          ))}
        </div>

        {/* Realistic Paper Texture Gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0px, transparent 45px, transparent calc(100% - 25px), rgba(0,0,0,0.04) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
      </>
    );
  }
  if (theme === 'aurora') {
    return (
      <div style={{
        position: 'absolute',
        inset: '16px',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        pointerEvents: 'none'
      }} />
    );
  }
  return null;
}

function getCategoryBadgeStyle(theme, neoColor) {
  switch (theme) {
    case 'neo':
      return {
        background: '#000000',
        color: neoColor.bg,
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        fontSize: '0.68rem',
        padding: '3px 10px',
        borderRadius: '2px',
        letterSpacing: '0.6px'
      };
    case 'cyberpunk':
      return {
        background: 'rgba(0, 240, 255, 0.1)',
        border: '1px solid #00f0ff',
        color: '#00f0ff',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.66rem',
        padding: '3px 8px',
        borderRadius: '2px',
        letterSpacing: '0.8px'
      };
    case 'swiss':
      return {
        color: '#111111',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '0.72rem',
        letterSpacing: '1.2px',
        textTransform: 'uppercase'
      };
    case 'lofi':
      return {
        border: '1px solid #8c7862',
        color: '#4a3b2c',
        fontFamily: 'var(--font-serif)',
        fontWeight: 700,
        fontSize: '0.68rem',
        padding: '2px 8px',
        borderRadius: '3px'
      };
    case 'notebook':
      return {
        display: 'inline-block',
        background: 'rgba(255, 235, 59, 0.65)',
        color: '#1a2233',
        fontFamily: 'var(--font-hand)',
        fontWeight: 700,
        fontSize: '0.98rem',
        padding: '1px 10px',
        borderRadius: '2px',
        transform: 'rotate(-1.5deg)',
        letterSpacing: '0.3px',
        borderBottom: '2px solid rgba(251, 192, 45, 0.5)'
      };
    case 'aurora':
      return {
        background: 'rgba(255,255,255,0.18)',
        color: '#ffffff',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '0.68rem',
        padding: '4px 12px',
        borderRadius: '99px',
        border: '1px solid rgba(255,255,255,0.3)',
        letterSpacing: '0.5px'
      };
    default:
      return {};
  }
}

function getHeaderMarkStyle(theme) {
  switch (theme) {
    case 'neo':
      return {
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        fontSize: '0.68rem',
        color: 'rgba(0,0,0,0.65)'
      };
    case 'cyberpunk':
      return {
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.65rem',
        color: '#ff0055',
        letterSpacing: '1px'
      };
    case 'swiss':
      return {
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.65rem',
        color: '#777777',
        letterSpacing: '1px'
      };
    case 'lofi':
      return {
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.65rem',
        color: '#8c7862'
      };
    case 'notebook':
      return {
        fontFamily: 'var(--font-hand)',
        fontWeight: 700,
        fontSize: '0.92rem',
        color: '#65748a',
        letterSpacing: '0.5px'
      };
    case 'aurora':
      return {
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.68rem',
        color: 'rgba(255,255,255,0.75)'
      };
    default:
      return {};
  }
}

function getQuoteTextColor(theme) {
  switch (theme) {
    case 'neo':
      return { color: '#000000' };
    case 'cyberpunk':
      return {
        color: '#f0f6fc',
        textShadow: '0 0 12px rgba(0, 240, 255, 0.3)'
      };
    case 'swiss':
      return { color: '#0d0d0d' };
    case 'lofi':
      return { color: '#2b2118' };
    case 'notebook':
      return { color: '#16253d' };
    case 'aurora':
      return {
        color: '#ffffff',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
      };
    default:
      return { color: '#000000' };
  }
}

function getAuthorBadgeStyle(theme) {
  switch (theme) {
    case 'neo':
      return {
        display: 'inline-block',
        background: '#ffffff',
        color: '#000000',
        border: '2px solid #000000',
        boxShadow: '3px 3px 0px #000000',
        padding: '5px 14px',
        borderRadius: '3px',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '0.85rem'
      };
    case 'cyberpunk':
      return {
        display: 'inline-block',
        background: 'rgba(0, 240, 255, 0.08)',
        color: '#00f0ff',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        padding: '4px 12px',
        borderRadius: '3px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.8rem',
        letterSpacing: '0.4px'
      };
    case 'swiss':
      return {
        display: 'inline-block',
        color: '#444444',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '0.9rem',
        borderLeft: '2px solid #e63946',
        paddingLeft: '10px'
      };
    case 'lofi':
      return {
        display: 'inline-block',
        color: '#4a3b2c',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize: '0.92rem'
      };
    case 'notebook':
      return {
        display: 'inline-block',
        color: '#16253d',
        fontFamily: 'var(--font-hand)',
        fontWeight: 700,
        fontSize: '1.28rem',
        borderBottom: '1.5px solid #c2d3e4',
        paddingBottom: '2px'
      };
    case 'aurora':
      return {
        display: 'inline-block',
        background: 'rgba(255, 255, 255, 0.15)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        padding: '5px 14px',
        borderRadius: '99px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '0.84rem'
      };
    default:
      return {};
  }
}

function getWatermarkBorder(theme) {
  switch (theme) {
    case 'neo': return '2px solid rgba(0,0,0,0.18)';
    case 'cyberpunk': return '1px solid rgba(0, 240, 255, 0.2)';
    case 'swiss': return '1px solid rgba(0,0,0,0.15)';
    case 'lofi': return '1px dashed #8c7862';
    case 'notebook': return '1px dashed #c0d0df';
    case 'aurora': return '1px solid rgba(255, 255, 255, 0.15)';
    default: return '1px solid rgba(0,0,0,0.1)';
  }
}

function getWatermarkColor(theme) {
  switch (theme) {
    case 'neo': return { color: 'rgba(0,0,0,0.7)' };
    case 'cyberpunk': return { color: '#00f0ff' };
    case 'swiss': return { color: '#555555' };
    case 'lofi': return { color: '#6e5d4c' };
    case 'notebook': return { color: '#65748a' };
    case 'aurora': return { color: 'rgba(255,255,255,0.85)' };
    default: return { color: 'rgba(0,0,0,0.7)' };
  }
}
