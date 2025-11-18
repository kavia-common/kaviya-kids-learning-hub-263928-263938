import React, { useEffect, useRef, useState } from 'react';
import './styles/Journal.css';

/**
 * PUBLIC_INTERFACE
 * JournalPage component
 * 
 * Provides a Learning Journal with two tabs:
 * - Draw: simple canvas drawing with color, size, undo, clear, and save
 * - Voice: record audio via MediaRecorder with timer and save
 * Also includes a Gallery of saved entries (drawings + audio) with view/play/delete.
 * 
 * Storage: localStorage under key 'kavia_journal_entries' storing metadata and content.
 * - Drawing entries: content is dataURL string.
 * - Audio entries: content is dataURL (base64) for simplicity (no IndexedDB dependency).
 * 
 * Accessibility: buttons have aria-labels, focus order via DOM, and ARIA live region for confirmations.
 */
const STORAGE_KEY = 'kavia_journal_entries';

const theme = {
  primary: '#1E3A8A', // Corporate Navy
  secondary: '#F59E0B', // Cheerful gold accent
  bg: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#111827',
  success: '#059669',
  error: '#DC2626',
};

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch {
    // ignore persistence failures
  }
}

function useAriaLive() {
  const [message, setMessage] = useState('');
  const announce = (msg) => {
    setMessage('');
    // ensure screen readers announce changes
    setTimeout(() => setMessage(msg), 50);
  };
  return { message, announce };
}

function ToolbarButton({ label, onClick, children }) {
  return (
    <button
      className="jrnl-btn"
      aria-label={label}
      onClick={onClick}
      type="button"
    >
      {children || label}
    </button>
  );
}

function SectionCard({ title, description, children, right }) {
  return (
    <section className="jrnl-card" aria-label={title}>
      <div className="jrnl-card-header">
        <div>
          <h2 className="jrnl-card-title">{title}</h2>
          {description && <p className="jrnl-card-desc">{description}</p>}
        </div>
        {right ? <div className="jrnl-card-right">{right}</div> : null}
      </div>
      <div className="jrnl-card-body">{children}</div>
    </section>
  );
}

function PadToolbar({ color, setColor, size, setSize, onUndo, onClear }) {
  return (
    <div className="jrnl-toolbar" role="toolbar" aria-label="Drawing tools">
      <label className="jrnl-label" htmlFor="penColor">Pen color</label>
      <input
        id="penColor"
        type="color"
        value={color}
        aria-label="Choose pen color"
        onChange={(e) => setColor(e.target.value)}
        className="jrnl-color"
      />
      <label className="jrnl-label" htmlFor="penSize">Pen size</label>
      <input
        id="penSize"
        type="range"
        min="2"
        max="24"
        value={size}
        aria-valuemin={2}
        aria-valuemax={24}
        aria-label="Choose pen size"
        onChange={(e) => setSize(parseInt(e.target.value, 10))}
        className="jrnl-range"
      />
      <ToolbarButton label="Undo" onClick={onUndo}>↩ Undo</ToolbarButton>
      <ToolbarButton label="Clear canvas" onClick={onClear}>🧹 Clear</ToolbarButton>
    </div>
  );
}

function DrawingPad({ onSave }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const [strokes, setStrokes] = useState([]); // for undo/clear
  const [currentPath, setCurrentPath] = useState([]);
  const [penColor, setPenColor] = useState('#1E3A8A');
  const [penSize, setPenSize] = useState(6);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    // set size responsive
    const parent = canvas.parentElement;
    const width = Math.min(parent.clientWidth - 20, 1000);
    const height = Math.min(480, Math.max(240, Math.round((parent.clientWidth - 20) * 0.56)));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
    redraw(); // redraw any strokes after resize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes.length]);

  const getCanvasOffset = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  };

  const startDraw = (x, y) => {
    drawing.current = true;
    const newPath = [{ x, y, color: penColor, size: penSize }];
    setCurrentPath(newPath);
  };

  const moveDraw = (x, y) => {
    if (!drawing.current) return;
    setCurrentPath((p) => [...p, { x, y, color: penColor, size: penSize }]);
    drawSegment();
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentPath.length > 1) {
      setStrokes((s) => [...s, currentPath]);
    }
    setCurrentPath([]);
  };

  const drawSegment = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const path = currentPath;
    if (path.length < 2) return;
    const last = path[path.length - 2];
    const curr = path[path.length - 1];
    ctx.strokeStyle = curr.color;
    ctx.lineWidth = curr.size;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // since ctx scaled by dpr but we draw with CSS pixels, we should not multiply
    strokes.forEach((path) => {
      for (let i = 1; i < path.length; i += 1) {
        const a = path[i - 1];
        const b = path[i];
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.size;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  };

  const onUndo = () => {
    setStrokes((s) => {
      const next = s.slice(0, -1);
      setTimeout(redraw, 0);
      return next;
    });
  };

  const onClear = () => {
    setStrokes([]);
    setTimeout(redraw, 0);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const { left, top } = getCanvasOffset();
    startDraw(e.clientX - left, e.clientY - top);
  };
  const handleMouseMove = (e) => {
    if (!drawing.current) return;
    const { left, top } = getCanvasOffset();
    moveDraw(e.clientX - left, e.clientY - top);
  };
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const { left, top } = getCanvasOffset();
    startDraw(t.clientX - left, t.clientY - top);
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    const { left, top } = getCanvasOffset();
    moveDraw(t.clientX - left, t.clientY - top);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave({
      id: `draw_${Date.now()}`,
      type: 'drawing',
      title: title.trim() || 'My Drawing',
      createdAt: new Date().toISOString(),
      content: dataUrl,
    });
    setTitle('');
  };

  return (
    <div>
      <PadToolbar
        color={penColor}
        setColor={setPenColor}
        size={penSize}
        setSize={setPenSize}
        onUndo={onUndo}
        onClear={onClear}
      />
      <div className="jrnl-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="jrnl-canvas"
          role="img"
          aria-label="Drawing canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={endDraw}
          tabIndex={0}
        />
      </div>
      <div className="jrnl-save-row">
        <label htmlFor="drawTitle" className="jrnl-label">Title (optional)</label>
        <input
          id="drawTitle"
          type="text"
          value={title}
          placeholder="e.g., Volcano sketch"
          onChange={(e) => setTitle(e.target.value)}
          className="jrnl-input"
        />
        <button type="button" className="jrnl-cta" onClick={saveDrawing} aria-label="Save drawing">
          Save Drawing
        </button>
      </div>
    </div>
  );
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function VoiceRecorder({ onSave }) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!(navigator.mediaDevices && window.MediaRecorder);
    setSupported(ok);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const start = async () => {
    if (!supported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          // base64 dataURL for simplicity; no extra deps
          const dataUrl = reader.result;
          onSave({
            id: `audio_${Date.now()}`,
            type: 'audio',
            title: title.trim() || 'My Voice Note',
            createdAt: new Date().toISOString(),
            content: dataUrl,
            durationMs: Date.now() - startTimeRef.current,
          });
          setTitle('');
          setDuration(0);
        };
        reader.readAsDataURL(blob);
        // stop tracks
        rec.stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      rec.start(250);
      startTimeRef.current = Date.now();
      setRecording(true);
      timerRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 200);
    } catch (e) {
      // ignore for now; permissions or device not found
      setRecording(false);
    }
  };

  const stop = () => {
    if (!recording || !recRef.current) return;
    setRecording(false);
    recRef.current.stop();
  };

  if (!supported) {
    return (
      <div className="jrnl-fallback" role="alert">
        Your browser does not support recording. Try Chrome, Edge, or a modern browser.
      </div>
    );
  }

  return (
    <div className="jrnl-voice">
      <div className="jrnl-voice-row">
        <div className={`jrnl-pill ${recording ? 'on' : ''}`} aria-live="polite">
          {recording ? 'Recording…' : 'Ready'}
        </div>
        <div className="jrnl-timer" aria-label="Recording duration">
          {formatDuration(duration)}
        </div>
      </div>
      <div className="jrnl-voice-controls" role="group" aria-label="Voice controls">
        {!recording ? (
          <button type="button" className="jrnl-cta" onClick={start} aria-label="Start recording">● Start</button>
        ) : (
          <button type="button" className="jrnl-stop" onClick={stop} aria-label="Stop recording">■ Stop</button>
        )}
      </div>
      <div className="jrnl-save-row">
        <label htmlFor="voiceTitle" className="jrnl-label">Title (optional)</label>
        <input
          id="voiceTitle"
          type="text"
          value={title}
          placeholder="e.g., Planet facts"
          onChange={(e) => setTitle(e.target.value)}
          className="jrnl-input"
        />
      </div>
    </div>
  );
}

function Gallery({ entries, onDelete }) {
  if (!entries.length) {
    return (
      <div className="jrnl-empty" role="status" aria-live="polite">
        No journal entries yet. Create a drawing or record a voice note!
      </div>
    );
  }
  return (
    <div className="jrnl-gallery" role="list" aria-label="Journal entries gallery">
      {entries.map((e) => (
        <div key={e.id} className="jrnl-gallery-item" role="listitem" tabIndex={0} aria-label={`${e.type} entry`}>
          <div className="jrnl-thumb">
            {e.type === 'drawing' ? (
              <img src={e.content} alt={e.title || 'Drawing entry'} />
            ) : (
              <div className="jrnl-audio-thumb">
                <span role="img" aria-label="Audio">🔊</span>
                <div className="jrnl-audio-meta">
                  <div>{e.title || 'Voice Note'}</div>
                  <small>{e.durationMs ? formatDuration(e.durationMs) : ''}</small>
                </div>
              </div>
            )}
          </div>
          <div className="jrnl-item-body">
            <div className="jrnl-item-title">{e.title || (e.type === 'drawing' ? 'Drawing' : 'Voice Note')}</div>
            <div className="jrnl-item-sub">{new Date(e.createdAt).toLocaleString()}</div>
            <div className="jrnl-item-actions">
              {e.type === 'audio' ? (
                <audio controls src={e.content} aria-label="Play audio note" />
              ) : (
                <a href={e.content} target="_blank" rel="noreferrer" className="jrnl-btn ghost" aria-label="View drawing in new tab">View</a>
              )}
              <button
                className="jrnl-btn danger"
                aria-label="Delete entry"
                onClick={() => onDelete(e.id)}
                type="button"
              >
                Delete
              </button>
              <button
                className="jrnl-btn ghost"
                aria-label="Export or share"
                onClick={() => window.alert('Share coming soon!')}
                type="button"
              >
                Export/Share
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JournalPage() {
  const [tab, setTab] = useState('draw'); // draw | voice
  const [entries, setEntries] = useState([]);
  const { message, announce } = useAriaLive();

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const persist = (next) => {
    setEntries(next);
    saveEntries(next);
  };

  const handleSave = (entry) => {
    const next = [entry, ...entries];
    persist(next);
    announce(`${entry.type === 'drawing' ? 'Drawing' : 'Audio'} saved.`);
  };

  const handleDelete = (id) => {
    const next = entries.filter((e) => e.id !== id);
    persist(next);
    announce('Entry deleted.');
  };

  return (
    <div className="jrnl-page" style={{ background: theme.bg, color: theme.text }}>
      <div className="jrnl-hero">
        <h1 className="jrnl-title">Learning Journal</h1>
        <p className="jrnl-sub">Draw discoveries and record your voice notes. Save and review in your gallery!</p>
      </div>

      <div className="jrnl-tabs" role="tablist" aria-label="Journal Tabs">
        <button
          role="tab"
          aria-selected={tab === 'draw'}
          className={`jrnl-tab ${tab === 'draw' ? 'active' : ''}`}
          onClick={() => setTab('draw')}
          type="button"
        >
          ✏️ Draw
        </button>
        <button
          role="tab"
          aria-selected={tab === 'voice'}
          className={`jrnl-tab ${tab === 'voice' ? 'active' : ''}`}
          onClick={() => setTab('voice')}
          type="button"
        >
          🎤 Voice
        </button>
      </div>

      {tab === 'draw' && (
        <SectionCard
          title="Drawing Pad"
          description="Sketch your ideas. Choose your pen color and size."
          right={<span className="jrnl-badge">Creative</span>}
        >
          <DrawingPad onSave={handleSave} />
        </SectionCard>
      )}

      {tab === 'voice' && (
        <SectionCard
          title="Voice Recorder"
          description="Record your thoughts and learning moments."
          right={<span className="jrnl-badge">Expressive</span>}
        >
          <VoiceRecorder onSave={handleSave} />
        </SectionCard>
      )}

      <SectionCard
        title="Gallery"
        description="All your saved drawings and voice notes."
      >
        <Gallery entries={entries} onDelete={handleDelete} />
      </SectionCard>

      <div className="sr-only" aria-live="polite" aria-atomic="true">{message}</div>
    </div>
  );
}
