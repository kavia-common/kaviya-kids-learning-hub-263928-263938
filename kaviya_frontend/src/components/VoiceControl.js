import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * VoiceControl
 * 
 * This component encapsulates Web Speech API voice navigation:
 * - Toggle on/off with persistent preference (localStorage)
 * - Continuous listening when enabled, with debounced intent parsing
 * - Supports commands:
 *   "Start quiz", "Go to Math Island", "Go to Science Island",
 *   "Open Sticker Book", "Open Mini-Games", "Go Home", "Open Story Mode"
 * - Announces results via ARIA-live for accessibility
 * - Gracefully falls back on unsupported browsers and shows tooltip
 * - Corporate Navy styling, keyboard accessible
 * 
 * Props:
 * - id: string (optional) unique id for control
 * - initialEnabled: boolean (optional) used if localStorage missing
 * 
 * Returns: A toggle button with status and privacy note tooltip
 */
const VoiceControl = ({ id = 'voice-control', initialEnabled = false }) => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialEnabled;
      const saved = window.localStorage.getItem('kaviya.voice.enabled');
      return saved !== null ? saved === 'true' : initialEnabled;
    } catch {
      return initialEnabled;
    }
  });
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const recognitionRef = useRef(null);
  const intentTimerRef = useRef(null);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  // Corporate Navy theme colors (aligned with style guide)
  const styles = useMemo(
    () => ({
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
      },
      toggle: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: enabled ? '#1E3A8A' : '#FFFFFF',
        color: enabled ? '#FFFFFF' : '#1E3A8A',
        border: '2px solid #1E3A8A',
        borderRadius: '999px',
        padding: '6px 12px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: enabled ? '0 2px 6px rgba(30,58,138,0.25)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'background-color 150ms ease, color 150ms ease, box-shadow 150ms ease',
      },
      indicator: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: enabled ? (listening ? '#059669' : '#F59E0B') : '#9CA3AF',
        border: '1px solid rgba(0,0,0,0.1)',
      },
      statusText: {
        fontSize: '0.9rem',
      },
      privacyWrap: {
        position: 'relative',
      },
      privacyBtn: {
        background: 'transparent',
        border: 'none',
        color: '#1E3A8A',
        fontWeight: 600,
        cursor: 'pointer',
        textDecoration: 'underline',
      },
      tooltip: {
        position: 'absolute',
        top: '120%',
        right: 0,
        zIndex: 20,
        width: '280px',
        background: '#FFFFFF',
        color: '#111827',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      },
      ariaLive: {
        position: 'absolute',
        left: '-9999px',
        height: '1px',
        width: '1px',
        overflow: 'hidden',
      },
    }),
    [enabled, listening]
  );

  // Detect Web Speech API support
  useEffect(() => {
    // Guard for non-browser/SSR environments
    if (typeof window === 'undefined') {
      setSupported(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      // If still enabled, restart for continuous listening
      if (enabled) {
        try {
          recognition.start();
        } catch {
          /* Swallow to avoid errors when rapid toggles occur */
        }
      }
    };
    recognition.onerror = () => {
      // Provide a short failure announcement but remain graceful
      setAnnouncement('Voice recognition error occurred. You can try toggling voice off and on again.');
    };
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res[0]) {
          transcript += res[0].transcript;
        }
      }
      const normalized = transcript.trim().toLowerCase();
      if (normalized) {
        setLastHeard(normalized);
        // Debounce intent handling to avoid multiple rapid triggers
        if (intentTimerRef.current) clearTimeout(intentTimerRef.current);
        intentTimerRef.current = setTimeout(() => handleIntent(normalized), 400);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (intentTimerRef.current) clearTimeout(intentTimerRef.current);
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist preference and start/stop recognition on toggle
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kaviya.voice.enabled', String(enabled));
      }
    } catch {
      /* ignore persistence errors */
    }

    const recognition = recognitionRef.current;
    if (!supported || !recognition) return;

    if (enabled) {
      // Start listening
      try {
        recognition.start();
      } catch {
        // If start called while already starting, swallow error
      }
    } else {
      // Stop listening
      try {
        recognition.stop();
      } catch {
        /* ignore stop errors */
      }
    }
  }, [enabled, supported]);

  // Parse the intent from heard text and navigate
  const handleIntent = useCallback(
    (text) => {
      const t = text.toLowerCase();
      // Map commands to routes
      // Prefer specific keywords to avoid accidental triggers
      const go = (path, announceText) => {
        navigate(path);
        setAnnouncement(announceText);
      };

      if (t.includes('start quiz') || t.includes('start the quiz') || t.includes('open quiz')) {
        go('/quiz/math', 'Opening Quiz page.');
        return;
      }
      if (t.includes('math island') || t.includes('go to math')) {
        // Navigate to world map (dashboard) then kid can choose Math
        go('/dashboard', 'Going to Math Island.');
        return;
      }
      if (t.includes('science island') || t.includes('go to science')) {
        go('/dashboard', 'Going to Science Island.');
        return;
      }
      if (t.includes('sticker book') || t.includes('open stickers') || t.includes('open sticker')) {
        go('/stickers', 'Opening Sticker Book.');
        return;
      }
      if (t.includes('mini game') || t.includes('mini-games') || t.includes('open mini') || t.includes('open games')) {
        go('/mini-games', 'Opening Mini-Games hub.');
        return;
      }
      if (t.includes('go home') || t.includes('home')) {
        go('/', 'Going home.');
        return;
      }
      if (t.includes('story mode') || t.includes('open story')) {
        go('/story', 'Opening Story Mode.');
        return;
      }

      // No intent matched, announce best-effort status
      setAnnouncement('Heard: ' + text);
    },
    [navigate]
  );

  const onToggle = useCallback(() => {
    setEnabled((prev) => !prev);
    // Set a short ARIA announcement of status
    setAnnouncement((prev) => {
      const nextState = !enabled;
      return nextState ? 'Voice navigation enabled.' : 'Voice navigation disabled.';
    });
  }, [enabled]);

  // Keyboard accessibility: Enter/Space toggle
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  // Tooltip open/close for privacy
  const [showTooltip, setShowTooltip] = useState(false);
  const toggleTooltip = useCallback(() => {
    setShowTooltip((s) => !s);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleOutside = (e) => {
      if (!tooltipRef.current) return;
      if (!tooltipRef.current.contains(e.target) && e.target !== buttonRef.current) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const tooltipContent = supported
    ? 'Privacy note: Your voice commands are processed locally by your browser using the Web Speech API. Audio is not sent to our servers. You can turn this feature on or off at any time.'
    : 'Voice navigation is not supported in this browser. Try Chrome, Edge, or another browser with Web Speech API support.';

  return (
    <div style={styles.container}>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        aria-pressed={enabled}
        aria-describedby={`${id}-privacy`}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        style={styles.toggle}
        title={supported ? 'Toggle voice navigation' : 'Voice not supported'}
        disabled={!supported}
      >
        <span aria-hidden="true" style={styles.indicator} />
        <span style={styles.statusText}>{enabled ? (listening ? 'Voice: Listening' : 'Voice: On') : 'Voice: Off'}</span>
      </button>

      <div style={styles.privacyWrap}>
        <button
          id={`${id}-privacy`}
          type="button"
          onClick={toggleTooltip}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setShowTooltip(false);
            }
          }}
          aria-expanded={showTooltip}
          aria-controls={`${id}-tooltip`}
          style={styles.privacyBtn}
          title="Privacy & Support"
        >
          {supported ? 'Privacy' : 'Why unavailable?'}
        </button>
        {showTooltip && (
          <div
            id={`${id}-tooltip`}
            role="dialog"
            aria-modal="false"
            ref={tooltipRef}
            style={styles.tooltip}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>{tooltipContent}</p>
            {supported && (
              <>
                <hr style={{ margin: '8px 0', borderColor: '#E5E7EB' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563' }}>
                  Try saying: “Start quiz”, “Open Mini-Games”, “Go Home”.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ARIA live region for screen reader users */}
      <div aria-live="polite" aria-atomic="true" style={styles.ariaLive}>
        {announcement}
      </div>

      {/* Visual last heard hint for sighted users (non-intrusive) */}
      {enabled && lastHeard && (
        <span style={{ fontSize: '0.8rem', color: '#4B5563' }} aria-hidden="true" title="Last heard">
          “{lastHeard.length > 48 ? lastHeard.slice(0, 48) + '…' : lastHeard}”
        </span>
      )}
    </div>
  );
};

export default VoiceControl;
