import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getInventory, getCanvas, saveCanvas, getAllStickersFlat, consumeFromInventory, returnToInventory } from '../utils/stickers';

/**
 * PUBLIC_INTERFACE
 * StickerBookPage
 * A digital sticker book at /stickers featuring:
 * - Left: Inventory drawer (categories, counts)
 * - Center: Canvas area to place stickers and minimally drag, rotate, scale
 * - Right: Album grid preview
 * Accessibility:
 * - Buttons are labeled, focus-visible styles honored
 * - Keyboard helpers for moving selected sticker (arrows), rotate (R), scale (+/-)
 * Style:
 * - Corporate Navy with cheerful accents
 */
export default function StickerBookPage() {
  const [inventory, setInventory] = useState(getInventory());
  const [canvas, setCanvas] = useState(getCanvas()); // { placed: [] }
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Save on change (debounced)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCanvas(canvas.placed), 140);
    return () => clearTimeout(saveTimer.current);
  }, [canvas]);

  const allDefs = useMemo(() => getAllStickersFlat(), []);
  const placedWithMeta = useMemo(() => {
    return canvas.placed.map((p, idx) => ({ ...p, idx, def: allDefs.find((d) => d.id === p.id) }));
  }, [canvas.placed, allDefs]);

  function refreshInventory() {
    setInventory(getInventory());
  }

  // Add a sticker from inventory onto canvas at center-ish position
  function placeSticker(stickerId) {
    const ok = consumeFromInventory(stickerId);
    if (!ok) return;
    refreshInventory();
    const x = 240 + Math.round(Math.random() * 80);
    const y = 180 + Math.round(Math.random() * 80);
    const next = { id: stickerId, x, y, scale: 1, rotation: 0 };
    setCanvas((c) => ({ ...c, placed: [...c.placed, next] }));
    setSelectedId(canvas.placed.length); // focus last
  }

  function removeSticker(idx) {
    const item = canvas.placed[idx];
    if (!item) return;
    returnToInventory(item.id);
    refreshInventory();
    setCanvas((c) => {
      const next = c.placed.slice();
      next.splice(idx, 1);
      return { ...c, placed: next };
    });
    setSelectedId(null);
  }

  function setSticker(idx, partial) {
    setCanvas((c) => {
      const next = c.placed.slice();
      next[idx] = { ...next[idx], ...partial };
      return { ...c, placed: next };
    });
  }

  const styles = getStyles();

  return (
    <main aria-labelledby="stickers-title" style={styles.wrap}>
      <div style={styles.container}>
        {/* Drawer */}
        <aside style={{ ...styles.drawer, ...(drawerOpen ? {} : styles.drawerClosed) }}>
          <header style={styles.drawerHeader}>
            <div style={styles.drawerTitle}>
              <span aria-hidden="true">📦</span> Stickers
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen((s) => !s)}
              aria-pressed={drawerOpen}
              aria-label={drawerOpen ? 'Collapse sticker drawer' : 'Expand sticker drawer'}
              style={styles.drawerToggle}
            >
              {drawerOpen ? '◀' : '▶'}
            </button>
          </header>

          {drawerOpen && (
            <div style={styles.drawerBody}>
              {Object.keys(inventory.categories).map((cat) => (
                <section key={cat} aria-labelledby={`cat-${cat}`} style={styles.categorySection}>
                  <div style={styles.categoryHeader}>
                    <h3 id={`cat-${cat}`} style={styles.categoryTitle}>{cat}</h3>
                    <span style={styles.categoryCount}>
                      {inventory.categories[cat].reduce((sum, s) => sum + (s.count || 0), 0)}
                    </span>
                  </div>
                  <div style={styles.stickerGrid}>
                    {inventory.categories[cat].map((s) => (
                      <button
                        key={s.id}
                        style={{ ...styles.stickerBtn, opacity: s.count > 0 ? 1 : 0.5 }}
                        onClick={() => s.count > 0 && placeSticker(s.id)}
                        disabled={s.count <= 0}
                        title={`${s.name} (${s.count} available)`}
                        aria-label={`${s.name}, ${s.count} available`}
                      >
                        <span style={styles.stickerEmoji} aria-hidden="true">{s.emoji}</span>
                        <span style={styles.stickerName}>{s.name}</span>
                        <span style={styles.stickerQty}>×{s.count || 0}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </aside>

        {/* Canvas */}
        <section style={styles.canvasSection} aria-label="Sticker canvas">
          <header style={styles.canvasHeader}>
            <h1 id="stickers-title" style={styles.title}>Sticker Book</h1>
            <div style={styles.canvasActions}>
              <button type="button" style={styles.secondaryBtn} onClick={() => setCanvas({ placed: [] })}>
                Clear Canvas
              </button>
            </div>
          </header>

          <div
            role="application"
            aria-label="Sticker design area"
            style={styles.canvas}
            onDoubleClick={() => setSelectedId(null)}
          >
            {placedWithMeta.map((s, idx) => (
              <CanvasSticker
                key={idx}
                idx={idx}
                emoji={s.def?.emoji || '✨'}
                selected={selectedId === idx}
                x={s.x}
                y={s.y}
                scale={s.scale}
                rotation={s.rotation}
                onSelect={() => setSelectedId(idx)}
                onChange={(partial) => setSticker(idx, partial)}
                onRemove={() => removeSticker(idx)}
              />
            ))}
          </div>

          <footer style={styles.helpFooter}>
            <span style={styles.helpTitle}>Tips:</span> Drag to move. Use handles to rotate (↻) and scale (⤢).
            Keyboard: arrows to move, R to rotate, +/- to scale, Delete to remove.
          </footer>
        </section>

        {/* Album preview */}
        <aside style={styles.album} aria-label="Album preview">
          <div style={styles.albumHeader}>
            <div style={styles.albumTitle}><span aria-hidden="true">📖</span> Album</div>
          </div>
          <div style={styles.albumBody}>
            {placedWithMeta.length === 0 ? (
              <div style={styles.albumEmpty}>Place stickers on the canvas to see them here.</div>
            ) : (
              <div style={styles.albumGrid}>
                {placedWithMeta.map((s) => (
                  <div key={s.idx} style={styles.albumCard} title={s.def?.name}>
                    <div style={styles.albumEmoji} aria-hidden="true">{s.def?.emoji || '✨'}</div>
                    <div style={styles.albumMeta}>
                      <div style={styles.albumName}>{s.def?.name || 'Sticker'}</div>
                      <small style={styles.albumSmall}>
                        x:{Math.round(s.x)} y:{Math.round(s.y)} • {Math.round(s.scale * 100)}% • {Math.round(s.rotation)}°
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function CanvasSticker({ idx, emoji, selected, x, y, scale, rotation, onSelect, onChange, onRemove }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Pointer drag
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDown = (e) => {
      setDragging(true);
      onSelect?.();
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const rect = el.parentElement.getBoundingClientRect();
      const nx = Math.max(0, Math.min(rect.width, x + e.movementX));
      const ny = Math.max(0, Math.min(rect.height, y + e.movementY));
      onChange?.({ x: nx, y: ny });
    };
    const onUp = (e) => {
      setDragging(false);
      el.releasePointerCapture?.(e.pointerId);
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, x, y, onChange, onSelect]);

  // Keyboard controls when selected and focused
  useEffect(() => {
    const onKey = (e) => {
      if (!selected) return;
      let handled = true;
      if (e.key === 'ArrowUp') onChange?.({ y: Math.max(0, y - 4) });
      else if (e.key === 'ArrowDown') onChange?.({ y: y + 4 });
      else if (e.key === 'ArrowLeft') onChange?.({ x: Math.max(0, x - 4) });
      else if (e.key === 'ArrowRight') onChange?.({ x: x + 4 });
      else if (e.key.toLowerCase() === 'r') onChange?.({ rotation: rotation + 10 });
      else if (e.key === '+' || e.key === '=') onChange?.({ scale: Math.min(2.5, scale + 0.05) });
      else if (e.key === '-' || e.key === '_') onChange?.({ scale: Math.max(0.5, scale - 0.05) });
      else if (e.key === 'Delete' || e.key === 'Backspace') onRemove?.();
      else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, x, y, scale, rotation, onChange, onRemove]);

  const baseStyle = {
    position: 'absolute',
    left: x,
    top: y,
    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: 'center',
    cursor: 'grab',
    userSelect: 'none',
    outline: selected ? '3px solid #F59E0B' : 'none',
    outlineOffset: 4,
  };

  const stickerStyle = {
    height: 64,
    width: 64,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: '#FFFFFF',
    border: '2px solid rgba(17,24,39,0.08)',
    boxShadow: '0 12px 24px rgba(17,24,39,0.18)',
    fontSize: 36,
  };

  const handleStyle = {
    position: 'absolute',
    right: -10,
    top: -10,
    border: '2px solid #1E3A8A',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 999,
    height: 26,
    width: 26,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(30,58,138,0.25)',
  };

  const scaleStyle = {
    position: 'absolute',
    right: -10,
    bottom: -10,
    border: '2px solid #F59E0B',
    background: '#fff',
    color: '#1E3A8A',
    borderRadius: 999,
    height: 26,
    width: 26,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(245,158,11,0.25)',
  };

  const removeStyle = {
    position: 'absolute',
    left: -10,
    top: -10,
    border: '2px solid #DC2626',
    background: '#fff',
    color: '#DC2626',
    borderRadius: 999,
    height: 26,
    width: 26,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(220,38,38,0.25)',
  };

  return (
    <div ref={ref} style={baseStyle} tabIndex={0} role="button" aria-label={`Sticker ${emoji}`} onClick={onSelect}>
      <div style={stickerStyle} aria-hidden="true">{emoji}</div>
      {/* Rotate */}
      <button
        type="button"
        title="Rotate"
        aria-label="Rotate"
        onClick={(e) => { e.stopPropagation(); onChange?.({ rotation: rotation + 15 }); }}
        style={handleStyle}
      >
        ↻
      </button>
      {/* Scale */}
      <button
        type="button"
        title="Scale"
        aria-label="Scale up"
        onClick={(e) => { e.stopPropagation(); onChange?.({ scale: Math.min(2.5, scale + 0.1) }); }}
        style={scaleStyle}
      >
        ⤢
      </button>
      {/* Remove */}
      <button
        type="button"
        title="Remove"
        aria-label="Remove sticker"
        onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
        style={removeStyle}
      >
        ✖
      </button>
    </div>
  );
}

function getStyles() {
  return {
    wrap: {
      minHeight: '100vh',
      padding: '20px 12px 32px',
      background:
        'radial-gradient(1200px 600px at 20% 20%, rgba(30, 58, 138, 0.06), transparent), ' +
        'radial-gradient(1000px 500px at 80% 30%, rgba(245, 158, 11, 0.08), transparent), ' +
        'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
    },
    container: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '280px 1fr 280px',
      gap: 12,
    },
    // Drawer
    drawer: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid rgba(17,24,39,0.06)',
      boxShadow: '0 10px 28px rgba(17,24,39,0.12)',
      overflow: 'hidden',
      transition: 'width 200ms ease',
    },
    drawerClosed: {
      width: 64,
      minWidth: 64,
      maxWidth: 64,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      borderBottom: '2px solid #F59E0B',
      background: '#1E3A8A',
      color: '#fff',
    },
    drawerTitle: { fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center' },
    drawerToggle: {
      border: '2px solid #F59E0B',
      background: '#fff',
      color: '#1E3A8A',
      borderRadius: 999,
      padding: '4px 8px',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(245,158,11,0.25)',
      fontSize: 12,
    },
    drawerBody: { padding: 10, display: 'grid', gap: 10 },
    categorySection: {
      border: '1px solid rgba(17,24,39,0.06)',
      borderRadius: 12,
      padding: 8,
      background: '#fff',
    },
    categoryHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    categoryTitle: { margin: 0, fontSize: 14, color: '#111827' },
    categoryCount: {
      border: '2px solid #1E3A8A',
      color: '#1E3A8A',
      borderRadius: 10,
      padding: '2px 8px',
      fontWeight: 800,
      fontSize: 12,
      background: '#fff',
    },
    stickerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: 8,
      marginTop: 6,
    },
    stickerBtn: {
      border: '1px solid rgba(17,24,39,0.08)',
      background: '#fff',
      borderRadius: 12,
      padding: 8,
      display: 'grid',
      gridTemplateColumns: '32px 1fr auto',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    },
    stickerEmoji: { fontSize: 22 },
    stickerName: { fontSize: 13, color: '#111827', textAlign: 'left' },
    stickerQty: { fontWeight: 800, color: '#1E3A8A', fontSize: 12 },
    // Canvas
    canvasSection: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid rgba(17,24,39,0.06)',
      boxShadow: '0 10px 28px rgba(17,24,39,0.12)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      overflow: 'hidden',
    },
    canvasHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderBottom: '1px solid #E5E7EB',
    },
    title: {
      margin: 0,
      fontSize: 20,
      color: '#1E3A8A',
    },
    canvasActions: { display: 'flex', gap: 8 },
    secondaryBtn: {
      border: '2px solid #F59E0B',
      background: '#fff',
      color: '#1E3A8A',
      borderRadius: 999,
      padding: '8px 12px',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 10px 22px rgba(245,158,11,0.25)',
      fontSize: 14,
    },
    canvas: {
      position: 'relative',
      margin: 12,
      borderRadius: 12,
      border: '2px dashed #D1D5DB',
      background:
        'repeating-linear-gradient(0deg, #F9FAFB, #F9FAFB 20px, #F3F4F6 20px, #F3F4F6 40px)',
      minHeight: 420,
      overflow: 'hidden',
    },
    helpFooter: {
      padding: 10,
      borderTop: '1px solid #E5E7EB',
      fontSize: 12,
      color: '#6B7280',
    },
    helpTitle: { fontWeight: 800, color: '#1E3A8A' },
    // Album
    album: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid rgba(17,24,39,0.06)',
      boxShadow: '0 10px 28px rgba(17,24,39,0.12)',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
    },
    albumHeader: {
      padding: 12,
      borderBottom: '2px solid #F59E0B',
      background: '#1E3A8A',
      color: '#fff',
    },
    albumTitle: { fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center' },
    albumBody: { padding: 10 },
    albumEmpty: { color: '#6B7280', fontSize: 13 },
    albumGrid: { display: 'grid', gap: 8 },
    albumCard: {
      display: 'grid',
      gridTemplateColumns: '44px 1fr',
      gap: 8,
      alignItems: 'center',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: 8,
      background: '#fff',
    },
    albumEmoji: {
      height: 44,
      width: 44,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #1E3A8A22, #F59E0B22)',
      fontSize: 24,
    },
    albumMeta: { display: 'grid', alignContent: 'start' },
    albumName: { fontSize: 14, fontWeight: 700, color: '#111827' },
    albumSmall: { fontSize: 11, color: '#6B7280' },
  };
}
