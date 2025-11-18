import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePet } from '../context/PetContext';

/**
 * PUBLIC_INTERFACE
 * PetWidget
 * Floating, draggable, minimizable virtual pet companion with small settings popover.
 * - Idle animations and mood reactions with accessible messages
 * - Settings: mute sounds, reduce motion
 * - Uses Corporate Navy + cheerful accents
 */
export default function PetWidget() {
  const { state, toggleMinimized, setPosition, settings, setSettings } = usePet();
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Character per stage
  const character = useMemo(() => {
    if (state.stage === 1) return { label: 'Hatchling', emoji: '🐣', bg: '#1E3A8A' };
    if (state.stage === 2) return { label: 'Playful', emoji: '🐱', bg: '#2563EB' };
    return { label: 'Hero', emoji: '🦊', bg: '#059669' };
  }, [state.stage]);

  const moodEmote = useMemo(() => {
    switch (state.mood) {
      case 'happy': return { text: 'Yay! That was great!', emoji: '🎉' };
      case 'confused': return { text: 'Hmm, let’s try again!', emoji: '🤔' };
      case 'excited': return { text: 'Woohoo! You rock!', emoji: '✨' };
      default: return { text: 'Here to help!', emoji: '💫' };
    }
  }, [state.mood]);

  // Drag handlers
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      setDragging(true);
      el.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      setPosition(e.clientX - 40, window.innerHeight - e.clientY - 40); // translate to left/bottom offsets
    };
    const onPointerUp = (e) => {
      setDragging(false);
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, setPosition]);

  // Compute CSS transform from left/bottom offsets
  const containerStyle = {
    position: 'fixed',
    left: `${state.position.x}px`,
    bottom: `${state.position.y}px`,
    zIndex: 70,
    userSelect: 'none',
  };

  // Reduced motion preference
  const animEnabled = !settings.reduceMotion;

  return (
    <aside
      role="complementary"
      aria-label="Virtual pet companion"
      style={containerStyle}
    >
      <div
        ref={dragRef}
        style={{
          background: '#FFFFFF',
          border: '2px solid rgba(17,24,39,0.08)',
          borderRadius: 16,
          boxShadow: '0 12px 26px rgba(17,24,39,0.18)',
          width: 220,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            background: '#1E3A8A',
            color: '#fff',
            padding: '8px 10px',
            borderBottom: '2px solid #F59E0B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              aria-hidden="true"
              style={{
                height: 26,
                width: 26,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                color: '#111827',
                fontWeight: 900,
                border: '2px solid #B45309',
                boxShadow: '0 4px 10px rgba(245,158,11,0.35)',
                fontSize: 14,
              }}
            >
              P
            </div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              Buddy • Lv.{state.stage}
            </div>
          </div>

          <div role="group" aria-label="Pet actions" style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              title="Settings"
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen(s => !s)}
              style={iconBtnStyle}
            >
              ⚙️
            </button>
            <button
              type="button"
              title={state.minimized ? 'Expand pet' : 'Minimize pet'}
              aria-pressed={state.minimized}
              onClick={toggleMinimized}
              style={iconBtnStyle}
            >
              {state.minimized ? '➕' : '➖'}
            </button>
          </div>
        </div>

        {!state.minimized ? (
          <div style={{ padding: 10, display: 'grid', gap: 8 }}>
            {/* Pet avatar with idle/mood animation */}
            <div
              aria-live="polite"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  height: 56,
                  width: 56,
                  minWidth: 56,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: character.bg,
                  color: '#fff',
                  border: '2px solid rgba(17,24,39,0.2)',
                  boxShadow: '0 10px 18px rgba(0,0,0,0.12)',
                  fontSize: 30,
                  animation: animEnabled ? (state.mood === 'happy'
                    ? 'petBounce 900ms ease'
                    : state.mood === 'confused'
                    ? 'petTilt 900ms ease'
                    : state.mood === 'excited'
                    ? 'petPulse 1100ms ease'
                    : 'petFloat 3s ease-in-out infinite') : 'none',
                }}
              >
                <span aria-hidden="true">{character.emoji}</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>
                  {character.label}
                </div>
                <div style={{ fontSize: 12, color: '#374151' }}>
                  {moodEmote.emoji} {moodEmote.text}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#6B7280' }}>
                  XP {state.xp}
                </div>
              </div>
            </div>

            {/* Tiny legend */}
            <div
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                padding: 8,
                background: '#F9FAFB',
              }}
            >
              <div style={{ fontSize: 12, color: '#1E3A8A', fontWeight: 800 }}>
                Tips
              </div>
              <div style={{ fontSize: 12, color: '#374151' }}>
                Drag me anywhere. I’ll cheer when you get answers right! ✨
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden="true">🐾</span>
            <span style={{ fontSize: 12, color: '#111827' }}>Buddy is resting...</span>
          </div>
        )}
      </div>

      {settingsOpen && (
        <PetSettingsPopover
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          setSettings={setSettings}
        />
      )}

      {/* Keyframe styles */}
      <style>{`
        @keyframes petFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        @keyframes petBounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px) scale(1.04); }
        }
        @keyframes petTilt {
          0%,100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(6deg); }
        }
        @keyframes petPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>
    </aside>
  );
}

function PetSettingsPopover({ onClose, settings, setSettings }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    dialogRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && prev.focus) prev.focus();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="Pet settings"
      aria-modal="false"
      tabIndex={-1}
      ref={dialogRef}
      style={{
        position: 'absolute',
        left: 0,
        bottom: '100%',
        transform: 'translateY(-8px)',
        width: 220,
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        boxShadow: '0 12px 24px rgba(17,24,39,0.20)',
        padding: 10,
        zIndex: 80,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontWeight: 800, color: '#1E3A8A' }}>Settings</div>
        <button type="button" onClick={onClose} aria-label="Close settings" style={iconBtnStyle}>✖️</button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <label style={settingRowStyle}>
          <input
            type="checkbox"
            checked={!!settings.mute}
            onChange={e => setSettings({ mute: e.target.checked })}
          /> Mute sounds
        </label>
        <label style={settingRowStyle}>
          <input
            type="checkbox"
            checked={!!settings.reduceMotion}
            onChange={e => setSettings({ reduceMotion: e.target.checked })}
          /> Reduce motion
        </label>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  border: '2px solid #F59E0B',
  background: '#fff',
  color: '#1E3A8A',
  borderRadius: 999,
  padding: '4px 8px',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 8px 18px rgba(245,158,11,0.25)',
  fontSize: 12,
};

const settingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: '#111827',
};
