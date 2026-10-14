import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Pinning thoughts to the board...",
  "Gathering curated wisdom...",
  "Arranging 1,500+ sticky notes...",
  "Almost ready for you..."
];

export default function Preloader({ isReady, onFinish }) {
  const [progress, setProgress] = useState(15);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Cycle playful messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Smooth progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(old => {
        if (old >= 92) return old;
        return old + Math.floor(Math.random() * 8 + 4);
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // When parent says app is ready, complete progress to 100% and exit
  useEffect(() => {
    if (isReady) {
      setProgress(100);
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const finishTimer = setTimeout(() => {
          onFinish && onFinish();
        }, 450);
        return () => clearTimeout(finishTimer);
      }, 350);
      return () => clearTimeout(exitTimer);
    }
  }, [isReady, onFinish]);

  return (
    <div className={`preloader-overlay ${isExiting ? 'exit' : ''}`}>
      <div className="preloader-content">
        {/* Stacked Sticky Notes Illusion */}
        <div className="preloader-stack">
          {/* Back Note (Lilac) */}
          <div className="preloader-card card-back" />
          
          {/* Middle Note (Coral) */}
          <div className="preloader-card card-middle" />

          {/* Main Front Note (Lime) */}
          <div className="preloader-card card-front">
            {/* Top Tape Sticker */}
            <div className="card-tape" />

            {/* Logo Stamp */}
            <div className="card-stamp font-display">
              N.
            </div>

            <div className="card-brand font-display">
              NOTED.
            </div>

            <p className="card-tagline">
              STICKY WISDOM FOR THE MODERN MIND
            </p>

            {/* Handwritten Animated Thought */}
            <div className="card-message-box">
              <p className="card-message font-hand">
                &ldquo;{LOADING_MESSAGES[msgIndex]}&rdquo;
              </p>
            </div>

            {/* Progress Tape Bar */}
            <div className="card-progress-track">
              <div 
                className="card-progress-fill" 
                style={{ width: `${progress}%` }} 
              />
            </div>

            <div className="card-footer-info font-mono">
              <span>DAILY EDITION</span>
              <span>{Math.min(100, progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
