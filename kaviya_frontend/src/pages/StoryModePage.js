import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * StoryModePage
 * A comic-style interactive story mode at /story for "Math Mountain - Chapter 1".
 *
 * Features:
 * - Panel-based "comic" story; keyboard navigation (Left/Right arrows) and buttons (Back/Next)
 * - Progress persistence to localStorage (kaviya.story.math.chapter, kaviya.story.math.panel)
 * - Lightweight audio narration placeholders: no audio libs; shows ARIA-live updates and "muted" state
 * - Accessibility:
 *    - Focus management between panels
 *    - aria-live="polite" region for narration status
 *    - Buttons have labels and are keyboard friendly
 * - Preferences:
 *    - Narration mute/unmute
 *    - Reduce motion (disables panel slide animation)
 * - Styling: Corporate Navy with cheerful gold accents
 */
export default function StoryModePage() {
  const navigate = useNavigate();

  // Story structure definition
  const CHAPTER_KEY = 'kaviya.story.math.chapter';
  const PANEL_KEY = 'kaviya.story.math.panel';
  const PREF_KEY = 'kaviya.story.prefs';

  const [chapter, setChapter] = useState(1);
  const [panelIndex, setPanelIndex] = useState(0);
  const [prefs, setPrefs] = useState({ mute: false, reduceMotion: false });
  const [announce, setAnnounce] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const liveRegionRef = useRef(null);
  const panelRef = useRef(null);

  // Define scripted panels for "Math Mountain - Chapter 1"
  const panels = useMemo(() => {
    return [
      {
        id: 'mmc1-p1',
        title: 'Welcome to Math Mountain',
        emoji: '⛰️',
        text: 'Our hero begins the climb up Math Mountain. To reach the summit, they must solve number puzzles along the way!',
        tip: 'Press Right Arrow or Next to continue.',
      },
      {
        id: 'mmc1-p2',
        title: 'Friendly Guide',
        emoji: '🦊',
        text: 'A friendly fox appears: “Numbers can be fun! Try counting steps in groups to go faster.”',
        tip: 'Groups of 2, 5, and 10 are super helpful.',
      },
      {
        id: 'mmc1-p3',
        title: 'Bridge of Even Numbers',
        emoji: '🌉',
        text: 'To cross the bridge, choose even numbers only. The planks glow when you step on 2, 4, 6, 8!',
        tip: 'Even numbers can be split into two equal groups.',
      },
      {
        id: 'mmc1-p4',
        title: 'Summit Challenge',
        emoji: '🏔️',
        text: 'At the summit, a big door has gears labeled with 3 × 4. Turn them correctly to unlock the treasure of knowledge!',
        tip: 'Multiplication is repeated addition.',
      },
      {
        id: 'mmc1-p5',
        title: 'You Did It!',
        emoji: '🏆',
        text: 'Great job reaching the peak! You’re ready to try a Math Quiz and earn XP.',
        tip: 'Choose “Start Quiz” below to practice.',
      },
    ];
  }, []);

  // Load persisted progress and preferences
  useEffect(() => {
    try {
      const savedChapter = Number(JSON.parse(localStorage.getItem(CHAPTER_KEY) || '1')) || 1;
      const savedPanel = Number(JSON.parse(localStorage.getItem(PANEL_KEY) || '0')) || 0;
      const savedPrefs = JSON.parse(localStorage.getItem(PREF_KEY) || 'null') || { mute: false, reduceMotion: false };
      setChapter(savedChapter);
      setPanelIndex(Math.min(savedPanel, panels.length - 1));
      setPrefs(savedPrefs);
    } catch {
      // ignore storage issues
    }
  }, [panels.length]);

  // Persist progress and prefs when they change (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CHAPTER_KEY, JSON.stringify(chapter));
        localStorage.setItem(PANEL_KEY, JSON.stringify(panelIndex));
        localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
      } catch {
        // ignore storage
      }
    }, 120);
    return () => clearTimeout(t);
  }, [chapter, panelIndex, prefs]);

  // Announce narration status
  useEffect(() => {
    setAnnounce(prefs.mute ? 'Narration muted.' : 'Narration ready.');
  }, [prefs.mute]);

  // Focus the current panel on change
  useEffect(() => {
    const t = setTimeout(() => {
      panelRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [panelIndex]);

  // Keyboard navigation: Left/Right to switch panels
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        nextPanel();
      } else if (e.key === 'ArrowLeft') {
        prevPanel();
      } else if (e.key.toLowerCase() === 'p') {
        toggleNarration();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelIndex, prefs.mute]);

  function nextPanel() {
    setIsPlaying(false);
    setPanelIndex((i) => Math.min(panels.length - 1, i + 1));
  }

  function prevPanel() {
    setIsPlaying(false);
    setPanelIndex((i) => Math.max(0, i - 1));
  }

  function toggleNarration() {
    if (prefs.mute) {
      setAnnounce('Narration is muted.');
      setIsPlaying(false);
      return;
    }
    // Lightweight "narration" placeholder: simulate play/stop state and announce
    setIsPlaying((p) => {
      const next = !p;
      setAnnounce(next ? 'Playing narration.' : 'Narration paused.');
      return next;
    });
  }

  function togglePref(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  const current = panels[panelIndex];
  const isFirst = panelIndex === 0;
  const isLast = panelIndex === panels.length - 1;

  const styles = getStyles(prefs.reduceMotion);

  return (
    <main aria-labelledby="story-title" style={styles.wrap}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.icon} aria-hidden="true">📚</div>
            <div>
              <h1 id="story-title" style={styles.title}>Story Mode • Math Mountain</h1>
              <p style={styles.subtitle}>Chapter {chapter} • Panel {panelIndex + 1} of {panels.length}</p>
            </div>
          </div>

          {/* Controls */}
          <div style={styles.controls} role="group" aria-label="Story preferences">
            <button
              type="button"
              onClick={() => togglePref('mute')}
              aria-pressed={prefs.mute}
              title={prefs.mute ? 'Unmute narration' : 'Mute narration'}
              style={{ ...styles.smallBtn, borderColor: prefs.mute ? '#6B7280' : '#F59E0B', color: prefs.mute ? '#6B7280' : '#1E3A8A' }}
            >
              {prefs.mute ? '🔇 Muted' : '🔊 Sound'}
            </button>
            <button
              type="button"
              onClick={() => togglePref('reduceMotion')}
              aria-pressed={prefs.reduceMotion}
              title={prefs.reduceMotion ? 'Enable animations' : 'Reduce motion'}
              style={{ ...styles.smallBtn, borderColor: prefs.reduceMotion ? '#6B7280' : '#1E3A8A', color: '#1E3A8A' }}
            >
              {prefs.reduceMotion ? '🧘 Reduced' : '✨ Motion'}
            </button>
          </div>
        </header>

        {/* ARIA live region for narration status */}
        <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" style={styles.visuallyHidden}>
          {announce}
        </div>

        {/* Panel */}
        <section
          ref={panelRef}
          tabIndex={0}
          role="region"
          aria-label={`${current.title}. ${current.text}`}
          style={styles.panel}
          className={prefs.reduceMotion ? '' : 'story-slide-in'}
        >
          <div style={styles.panelTop}>
            <div style={styles.panelEmoji} aria-hidden="true">{current.emoji}</div>
            <h2 style={styles.panelTitle}>{current.title}</h2>
          </div>
          <p style={styles.panelText}>{current.text}</p>

          <div style={styles.tipRow}>
            <span style={styles.tipLabel}>Tip:</span>
            <span style={styles.tipText}>{current.tip}</span>
          </div>

          {/* Narration controls (placeholder) */}
          <div style={styles.narrationRow}>
            <button
              type="button"
              onClick={toggleNarration}
              aria-pressed={isPlaying}
              disabled={prefs.mute}
              style={{ ...styles.primaryBtn, ...(prefs.mute ? styles.disabledBtn : {}) }}
              title={prefs.mute ? 'Narration is muted' : isPlaying ? 'Pause narration' : 'Play narration'}
            >
              {prefs.mute ? 'Narration Muted' : isPlaying ? 'Pause Narration ⏸' : 'Play Narration ▶'}
            </button>
            <span style={styles.narrationStatus} role="status" aria-live="polite">
              {prefs.mute ? 'Muted' : isPlaying ? 'Playing…' : 'Idle'}
            </span>
          </div>
        </section>

        {/* Navigation */}
        <nav aria-label="Story navigation" style={styles.navRow}>
          <button
            type="button"
            onClick={prevPanel}
            disabled={isFirst}
            style={{ ...styles.secondaryBtn, ...(isFirst ? styles.disabledBtn : {}) }}
          >
            ◀ Back
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={nextPanel}
              style={styles.primaryBtn}
              autoFocus
            >
              Next ▶
            </button>
          ) : (
            <div style={styles.endActions}>
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={() => navigate('/quiz/math')}
                title="Start Math Quiz"
              >
                Start Quiz 🔢
              </button>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => navigate('/dashboard')}
                title="Return to World Map"
              >
                Back to Map 🗺️
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Local keyframes */}
      {!prefs.reduceMotion && (
        <style>{`
          .story-slide-in {
            animation: storySlideIn 260ms ease both;
          }
          @keyframes storySlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </main>
  );
}

function getStyles(reduceMotion) {
  return {
    wrap: {
      minHeight: '100vh',
      padding: '28px 16px 48px',
      background:
        'radial-gradient(1200px 600px at 20% 20%, rgba(30, 58, 138, 0.06), transparent), ' +
        'radial-gradient(1000px 500px at 80% 30%, rgba(245, 158, 11, 0.08), transparent), ' +
        'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
    },
    container: {
      maxWidth: 980,
      margin: '0 auto',
      display: 'grid',
      gap: 16,
    },
    header: {
      background: '#fff',
      borderRadius: 18,
      border: '1px solid rgba(17, 24, 39, 0.06)',
      padding: 14,
      boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
    icon: {
      height: 44,
      width: 44,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
      color: '#fff',
      border: '2px solid #F59E0B',
      boxShadow: '0 8px 18px rgba(30, 58, 138, 0.35)',
      fontSize: 22,
    },
    title: { margin: 0, fontSize: 22, color: '#1E3A8A', letterSpacing: '-0.01em' },
    subtitle: { margin: 0, color: '#374151', fontSize: 13 },
    controls: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    smallBtn: {
      border: '2px solid #1E3A8A',
      background: '#fff',
      color: '#1E3A8A',
      borderRadius: 999,
      padding: '8px 12px',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(30,58,138,0.20)',
      fontSize: 12,
    },
    panel: {
      background: '#fff',
      borderRadius: 18,
      border: '1px solid rgba(17, 24, 39, 0.06)',
      padding: 16,
      boxShadow: '0 10px 30px rgba(17,24,39,0.15)',
      display: 'grid',
      gap: 10,
      outline: 'none',
    },
    panelTop: { display: 'flex', alignItems: 'center', gap: 10 },
    panelEmoji: {
      height: 44,
      width: 44,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #1E3A8A22, #F59E0B22)',
      fontSize: 22,
    },
    panelTitle: { margin: 0, fontSize: 20, color: '#111827' },
    panelText: { margin: 0, color: '#374151', fontSize: 16 },
    tipRow: { display: 'flex', alignItems: 'baseline', gap: 8 },
    tipLabel: { fontWeight: 800, color: '#1E3A8A' },
    tipText: { color: '#374151' },
    narrationRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' },
    narrationStatus: { fontSize: 12, color: '#6B7280' },
    navRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap',
    },
    endActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
    primaryBtn: {
      border: 'none',
      background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
      color: '#fff',
      borderRadius: 999,
      padding: '12px 16px',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 12px 24px rgba(30, 58, 138, 0.35)',
      fontSize: 14,
    },
    secondaryBtn: {
      border: '2px solid #F59E0B',
      background: '#fff',
      color: '#1E3A8A',
      borderRadius: 999,
      padding: '12px 16px',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 10px 22px rgba(245,158,11,0.25)',
      fontSize: 14,
    },
    disabledBtn: {
      opacity: 0.7,
      cursor: 'not-allowed',
      boxShadow: 'none',
      filter: 'grayscale(0.2)',
    },
    visuallyHidden: {
      position: 'absolute',
      left: -9999,
      width: 1,
      height: 1,
      overflow: 'hidden',
    },
  };
}
