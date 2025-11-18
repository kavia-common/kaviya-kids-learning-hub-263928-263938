import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 * PetContext
 * Global provider for the Virtual Pet Companion.
 *
 * Persisted keys in localStorage:
 * - kaviya.pet.stage: number (1..3)
 * - kaviya.pet.xp: number
 * - kaviya.pet.mood: 'idle' | 'happy' | 'confused' | 'excited'
 * - kaviya.pet.position: { x:number, y:number } relative to viewport
 * - kaviya.pet.minimized: boolean
 * - kaviya.pet.settings: { mute:boolean, reduceMotion:boolean }
 *
 * Levels:
 *  1: Hatchling (0-99 XP)
 *  2: Playful (100-249 XP)
 *  3: Hero (250+ XP)
 */

// Types
const initialState = {
  stage: 1,
  xp: 0,
  mood: 'idle', // idle|happy|confused|excited
  minimized: false,
  position: { x: 24, y: 84 }, // default bottom-left offset (px) from left/bottom
  settings: { mute: false, reduceMotion: false },
  lastReactionTs: 0,
};

const STORAGE_KEYS = {
  stage: 'kaviya.pet.stage',
  xp: 'kaviya.pet.xp',
  mood: 'kaviya.pet.mood',
  minimized: 'kaviya.pet.minimized',
  position: 'kaviya.pet.position',
  settings: 'kaviya.pet.settings',
};

function computeStage(xp) {
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload };
    case 'ADD_XP': {
      const nextXp = Math.max(0, state.xp + (action.amount || 0));
      const nextStage = computeStage(nextXp);
      return { ...state, xp: nextXp, stage: nextStage };
    }
    case 'SET_MOOD':
      return { ...state, mood: action.mood, lastReactionTs: Date.now() };
    case 'SET_MINIMIZED':
      return { ...state, minimized: !!action.minimized };
    case 'SET_POSITION':
      return { ...state, position: { x: action.x, y: action.y } };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    default:
      return state;
  }
}

const PetContext = createContext(null);

// PUBLIC_INTERFACE
export function usePet() {
  /**
   * Hook to access pet state and actions.
   * Returns { state, reactToAnswer(isCorrect), reactToResult(mood), addXp(amount), toggleMinimized(), setPosition(x,y), settings, setSettings(partial) }
   */
  return useContext(PetContext);
}

// PUBLIC_INTERFACE
export function PetProvider({ children }) {
  /**
   * Provider that loads persisted state, exposes actions, and auto-saves to localStorage.
   */
  const [state, dispatch] = useReducer(reducer, initialState);
  const persistTimer = useRef(null);

  // Load from storage on mount
  useEffect(() => {
    try {
      const loaded = {
        stage: Number(JSON.parse(localStorage.getItem(STORAGE_KEYS.stage) || '1')) || 1,
        xp: Number(JSON.parse(localStorage.getItem(STORAGE_KEYS.xp) || '0')) || 0,
        mood: JSON.parse(localStorage.getItem(STORAGE_KEYS.mood) || '"idle"') || 'idle',
        minimized: !!JSON.parse(localStorage.getItem(STORAGE_KEYS.minimized) || 'false'),
        position: JSON.parse(localStorage.getItem(STORAGE_KEYS.position) || 'null') || { x: 24, y: 84 },
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || 'null') || { mute: false, reduceMotion: false },
      };
      loaded.stage = computeStage(loaded.xp);
      dispatch({ type: 'LOAD', payload: loaded });
    } catch {
      // keep defaults
    }
  }, []);

  // Persist debounced
  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.stage, JSON.stringify(state.stage));
        localStorage.setItem(STORAGE_KEYS.xp, JSON.stringify(state.xp));
        localStorage.setItem(STORAGE_KEYS.mood, JSON.stringify(state.mood));
        localStorage.setItem(STORAGE_KEYS.minimized, JSON.stringify(state.minimized));
        localStorage.setItem(STORAGE_KEYS.position, JSON.stringify(state.position));
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
      } catch {
        // ignore storage errors
      }
    }, 120);
    return () => clearTimeout(persistTimer.current);
  }, [state.stage, state.xp, state.mood, state.minimized, state.position, state.settings]);

  const addXp = useCallback((amount) => {
    dispatch({ type: 'ADD_XP', amount: Number(amount || 0) });
  }, []);

  const setMoodTemp = useCallback((mood, durationMs = 1600) => {
    dispatch({ type: 'SET_MOOD', mood });
    if (durationMs > 0) {
      setTimeout(() => dispatch({ type: 'SET_MOOD', mood: 'idle' }), durationMs);
    }
  }, []);

  // PUBLIC_INTERFACE
  const reactToAnswer = useCallback((isCorrect) => {
    /**
     * Trigger pet reaction to an answer selection.
     * - Correct -> mood 'happy' and tiny XP +2
     * - Incorrect -> mood 'confused'
     */
    if (isCorrect) {
      setMoodTemp('happy');
      addXp(2);
    } else {
      setMoodTemp('confused');
    }
  }, [addXp, setMoodTemp]);

  // PUBLIC_INTERFACE
  const reactToResult = useCallback((mood) => {
    /**
     * Trigger pet reaction to post-quiz mood: 'happy' | 'confused' | 'excited'
     */
    const allowed = ['happy', 'confused', 'excited'];
    const next = allowed.includes(mood) ? mood : 'happy';
    setMoodTemp(next, 2200);
  }, [setMoodTemp]);

  // PUBLIC_INTERFACE
  const toggleMinimized = useCallback(() => {
    dispatch({ type: 'SET_MINIMIZED', minimized: !state.minimized });
  }, [state.minimized]);

  // PUBLIC_INTERFACE
  const setPosition = useCallback((x, y) => {
    const nx = Math.max(0, Math.min(window.innerWidth - 80, x));
    const ny = Math.max(0, Math.min(window.innerHeight - 80, y));
    dispatch({ type: 'SET_POSITION', x: nx, y: ny });
  }, []);

  // PUBLIC_INTERFACE
  const setSettings = useCallback((partial) => {
    dispatch({ type: 'SET_SETTINGS', settings: partial || {} });
  }, []);

  const value = useMemo(() => ({
    state,
    addXp,
    reactToAnswer,
    reactToResult,
    toggleMinimized,
    setPosition,
    settings: state.settings,
    setSettings,
  }), [state, addXp, reactToAnswer, reactToResult, toggleMinimized, setPosition, setSettings]);

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}
