import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

/**
 * PUBLIC_INTERFACE
 * PetContext provides a virtual pet state and helpers so UI can react to the learner.
 *
 * Provided values:
 * - state: {
 *     stage: number,          // 1..n evolution stage
 *     mood: 'neutral' | 'happy' | 'confused' | 'excited',
 *     xp: number,
 *     minimized: boolean,     // whether the widget is minimized
 *     position: { x: number, y: number } // left/bottom offsets in px
 *   }
 * - settings: {
 *     mute: boolean,
 *     reduceMotion: boolean
 *   }
 * - setSettings(partial): update settings fields
 * - toggleMinimized(): toggle minimized state
 * - setPosition(x,y): update widget position (left/bottom)
 * - feedPet(): cheer pet and add XP
 * - encourage(type): brief encouragement message and mood
 *
 * Notes:
 * - All browser APIs (localStorage/window/document) are guarded for non-browser environments.
 */
export const PetContext = createContext(null);

// PUBLIC_INTERFACE
export function usePet() {
  /** Hook access for consumers that prefer a hook form */
  return useContext(PetContext);
}

export const PetProvider = ({ children }) => {
  // Internal canonical state used by PetWidget
  const [state, setState] = useState(() => ({
    stage: 1,
    mood: 'neutral',
    xp: 0,
    minimized: false,
    // default position: 24px from left, 24px from bottom
    position: { x: 24, y: 24 },
  }));

  // Settings for sound/motion
  const [settings, setSettingsState] = useState(() => ({
    mute: false,
    reduceMotion: false,
  }));

  // Transient last encouragement tag
  const [lastEncourage, setLastEncourage] = useState(null);

  // Idle XP tick (guard against SSR)
  useEffect(() => {
    const t = setTimeout(() => {
      setState(s => ({ ...s, xp: s.xp + 1 }));
    }, 2000);
    return () => clearTimeout(t);
  }, [state.xp]);

  // Allow saving/restoring position from localStorage when available
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('petWidget.position');
        if (saved) {
          const pos = JSON.parse(saved);
          if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
            setState(s => ({ ...s, position: { x: pos.x, y: pos.y } }));
          }
        }
        const savedSettings = window.localStorage.getItem('petWidget.settings');
        if (savedSettings) {
          const ss = JSON.parse(savedSettings);
          setSettingsState(prev => ({ ...prev, ...ss }));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('petWidget.position', JSON.stringify(state.position));
      }
    } catch {
      // ignore
    }
  }, [state.position]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('petWidget.settings', JSON.stringify(settings));
      }
    } catch {
      // ignore
    }
  }, [settings]);

  const setSettings = useCallback((partial) => {
    setSettingsState(prev => ({ ...prev, ...partial }));
  }, []);

  const toggleMinimized = useCallback(() => {
    setState(s => ({ ...s, minimized: !s.minimized }));
  }, []);

  const setPosition = useCallback((x, y) => {
    setState(s => ({ ...s, position: { x: Math.max(0, x || 0), y: Math.max(0, y || 0) } }));
  }, []);

  // Keep convenient accessors compatible with earlier API for mood/xp
  const setPetMood = useCallback((mood) => {
    setState(s => ({ ...s, mood }));
  }, []);

  const feedPet = useCallback(() => {
    setState(s => ({ ...s, mood: 'happy', xp: s.xp + 5 }));
    setLastEncourage('treat');
    const t = setTimeout(() => setLastEncourage(null), 1200);
    return () => clearTimeout(t);
  }, []);

  // PUBLIC_INTERFACE
  const encourage = useCallback((type = 'cheer') => {
    setLastEncourage(type);
    setState(s => {
      const mood = type === 'soothe' ? 'confused' : (type === 'cheer' ? 'excited' : 'happy');
      return { ...s, mood };
    });
    const restore = setTimeout(() => {
      setLastEncourage(null);
      setState(s => ({ ...s, mood: 'neutral' }));
    }, 1400);
    return () => clearTimeout(restore);
  }, []);

  // Derive stage from XP simple thresholds (keeps PetWidget display meaningful)
  useEffect(() => {
    setState(s => {
      let stage = 1;
      if (s.xp >= 50) stage = 3;
      else if (s.xp >= 15) stage = 2;
      return s.stage === stage ? s : { ...s, stage };
    });
  }, [state.xp]);

  // Expose the combined context value expected by PetWidget and other consumers
  const ctxValue = {
    state,
    settings,
    setSettings,
    toggleMinimized,
    setPosition,
    // legacy/alternate consumers:
    petMood: state.mood,
    setPetMood,
    xp: state.xp,
    feedPet,
    encourage,
    lastEncourage,
  };

  return (
    <PetContext.Provider value={ctxValue}>
      {children}
    </PetContext.Provider>
  );
};
