import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

/**
 * PUBLIC_INTERFACE
 * PetContext provides a virtual pet state and helpers so UI can react to the learner:
 * - petMood: current pet expression ('neutral' | 'happy' | 'confused' | 'excited')
 * - setPetMood(mood): set explicit mood
 * - xp: lightweight progression points
 * - feedPet(): basic interaction that cheers the pet and awards XP
 * - encourage(type): trigger a brief encouragement animation/message
 */
export const PetContext = createContext(null);

// PUBLIC_INTERFACE
export function usePet() {
  /** Hook access for consumers that prefer a hook form */
  return useContext(PetContext);
}

export const PetProvider = ({ children }) => {
  const [petMood, setPetMood] = useState('neutral');
  const [xp, setXp] = useState(0);
  const [lastEncourage, setLastEncourage] = useState(null);

  useEffect(() => {
    // Lightweight idle xp tick
    const t = setTimeout(() => setXp(x => x + 1), 2000);
    return () => clearTimeout(t);
  }, [xp]);

  const feedPet = useCallback(() => {
    setPetMood('happy');
    setXp(x => x + 5);
    setLastEncourage('treat');
    setTimeout(() => setLastEncourage(null), 1200);
  }, []);

  // PUBLIC_INTERFACE
  const encourage = useCallback((type = 'cheer') => {
    // type: 'cheer' | 'encourage' | 'soothe'
    setLastEncourage(type);
    if (type === 'soothe') setPetMood('confused');
    else if (type === 'cheer') setPetMood('excited');
    else setPetMood('happy');
    const restore = setTimeout(() => {
      setLastEncourage(null);
      setPetMood('neutral');
    }, 1400);
    return () => clearTimeout(restore);
  }, []);

  return (
    <PetContext.Provider value={{ petMood, setPetMood, xp, feedPet, encourage, lastEncourage }}>
      {children}
    </PetContext.Provider>
  );
};
