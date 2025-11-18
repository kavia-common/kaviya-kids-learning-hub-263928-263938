import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpinWheel.css';

/**
 * SpinWheel component
 *
 * PUBLIC_INTERFACE
 * This component renders an accessible Daily Spin Wheel with:
 * - 24h cooldown using localStorage timestamp
 * - Weighted rewards for XP boosts, avatar accessories, and mini-game tickets
 * - Fair-play constraint: avoid consecutive rare reward repeats
 * - Celebratory animations and ARIA-live narration for screen readers
 * - Updates localStorage on reward grant (xp, accessories inventory, ticket counters)
 * - CTA buttons to "Use ticket" (navigates to mini-games) or "Continue"
 *
 * Environment/Storage keys:
 * - lms.spin.lastSpinAt: ISO timestamp of last spin
 * - lms.spin.lastRewardId: last reward id (for fair-play)
 * - lms.profile.xp: numeric XP for the user profile (mocked client-side)
 * - lms.inventory.accessories: JSON string array of accessory ids
 * - lms.tickets.minigame: integer count
 *
 * Styling follows Corporate Navy: navy blue primary, gold accents, rounded visuals.
 */
const SPIN_STORAGE_KEYS = {
  lastSpinAt: 'lms.spin.lastSpinAt',
  lastRewardId: 'lms.spin.lastRewardId',
  xp: 'lms.profile.xp',
  accessories: 'lms.inventory.accessories',
  tickets: 'lms.tickets.minigame',
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Weighted reward pool with categories and probability weights.
// "rare" items must not repeat consecutively.
// weights should sum to 1 across all items.
const REWARDS_POOL = [
  { id: 'xp_25', label: '+25 XP', type: 'xp', amount: 25, weight: 0.22, rarity: 'common' },
  { id: 'xp_50', label: '+50 XP', type: 'xp', amount: 50, weight: 0.18, rarity: 'common' },
  { id: 'ticket_1', label: '+1 Mini-Game Ticket', type: 'ticket', amount: 1, weight: 0.20, rarity: 'common' },
  { id: 'ticket_2', label: '+2 Mini-Game Tickets', type: 'ticket', amount: 2, weight: 0.10, rarity: 'uncommon' },
  { id: 'acc_hat_red', label: 'Accessory: Red Hat', type: 'accessory', accessoryId: 'hat_red', weight: 0.10, rarity: 'uncommon' },
  { id: 'acc_cape_blue', label: 'Accessory: Blue Cape', type: 'accessory', accessoryId: 'cape_blue', weight: 0.08, rarity: 'rare' },
  { id: 'acc_glasses_star', label: 'Accessory: Star Glasses', type: 'accessory', accessoryId: 'glasses_star', weight: 0.06, rarity: 'rare' },
  { id: 'xp_100', label: '+100 XP', type: 'xp', amount: 100, weight: 0.06, rarity: 'rare' },
];

function getNow() {
  return new Date();
}

function canSpin(now = getNow()) {
  const last = localStorage.getItem(SPIN_STORAGE_KEYS.lastSpinAt);
  if (!last) return true;
  const lastDate = new Date(last);
  return now.getTime() - lastDate.getTime() >= ONE_DAY_MS;
}

function timeRemaining(now = getNow()) {
  const last = localStorage.getItem(SPIN_STORAGE_KEYS.lastSpinAt);
  if (!last) return 0;
  const lastDate = new Date(last);
  const diff = ONE_DAY_MS - (now.getTime() - lastDate.getTime());
  return diff > 0 ? diff : 0;
}

function formatDuration(ms) {
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${h}h ${m}m`;
}

function getAccessories() {
  try {
    const raw = localStorage.getItem(SPIN_STORAGE_KEYS.accessories);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAccessories(arr) {
  localStorage.setItem(SPIN_STORAGE_KEYS.accessories, JSON.stringify(arr));
}

function getXP() {
  const raw = localStorage.getItem(SPIN_STORAGE_KEYS.xp);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function setXP(n) {
  localStorage.setItem(SPIN_STORAGE_KEYS.xp, String(n));
}

function getTickets() {
  const raw = localStorage.getItem(SPIN_STORAGE_KEYS.tickets);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function setTickets(n) {
  localStorage.setItem(SPIN_STORAGE_KEYS.tickets, String(n));
}

/**
 * Draws a reward from the pool honoring weights and "no consecutive rare repeat".
 */
function drawReward() {
  const lastRewardId = localStorage.getItem(SPIN_STORAGE_KEYS.lastRewardId);

  const totalWeight = REWARDS_POOL.reduce((sum, r) => sum + r.weight, 0);
  // Attempt drawing with constraint. If the drawn reward violates, redraw up to N times then fallback.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let rnd = Math.random() * totalWeight;
    for (const r of REWARDS_POOL) {
      rnd -= r.weight;
      if (rnd <= 0) {
        // Fair-play constraint: avoid same rare reward consecutively
        if (lastRewardId && r.id === lastRewardId && (r.rarity === 'rare' || r.rarity === 'uncommon')) {
          // try again
          break;
        }
        return r;
      }
    }
  }
  // Fallback: pick the highest weight non-equal rare/uncommon if last rare; else first common
  const lastReward = REWARDS_POOL.find(r => r.id === localStorage.getItem(SPIN_STORAGE_KEYS.lastRewardId));
  if (lastReward && (lastReward.rarity === 'rare' || lastReward.rarity === 'uncommon')) {
    const alt = [...REWARDS_POOL]
      .filter(r => r.id !== lastReward.id)
      .sort((a, b) => b.weight - a.weight)[0];
    return alt || REWARDS_POOL[0];
  }
  return REWARDS_POOL[0];
}

export default function SpinWheel({ autoSpin = false, onAfterGrant }) {
  const [eligible, setEligible] = useState(canSpin());
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [ariaMessage, setAriaMessage] = useState('');
  const [cooldownMs, setCooldownMs] = useState(timeRemaining());
  const [hasFocus, setHasFocus] = useState(true);

  const navigate = useNavigate();
  const announceRef = useRef(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    const int = setInterval(() => {
      setEligible(canSpin());
      setCooldownMs(timeRemaining());
    }, 1000 * 30);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (autoSpin && eligible && !spinning && !result) {
      handleSpin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, eligible]);

  useEffect(() => {
    if (ariaMessage && announceRef.current) {
      // update to trigger screen reader announcement
      announceRef.current.textContent = ariaMessage;
    }
  }, [ariaMessage]);

  const segments = useMemo(() => {
    // Build labels around the wheel; duplicate smaller items to give visual variety
    return REWARDS_POOL.map(r => r.label);
  }, []);

  function grantReward(reward) {
    if (!reward) return;
    if (reward.type === 'xp') {
      const newXP = getXP() + (reward.amount || 0);
      setXP(newXP);
    } else if (reward.type === 'ticket') {
      const newTickets = getTickets() + (reward.amount || 0);
      setTickets(newTickets);
    } else if (reward.type === 'accessory') {
      const inv = getAccessories();
      // Avoid duplicate accessories; but allow if already present to still "win" and celebrate
      if (!inv.includes(reward.accessoryId)) {
        inv.push(reward.accessoryId);
        setAccessories(inv);
      }
    }
    localStorage.setItem(SPIN_STORAGE_KEYS.lastSpinAt, new Date().toISOString());
    localStorage.setItem(SPIN_STORAGE_KEYS.lastRewardId, reward.id);
  }

  function handleSpin() {
    if (!eligible || spinning) {
      setAriaMessage(!eligible ? 'Daily spin not available. Please come back later.' : 'Spin is already in progress.');
      return;
    }
    setResult(null);
    setSpinning(true);
    setAriaMessage('Spinning started. Get ready for your reward!');
    // Pick reward and compute target rotation angle
    const reward = drawReward();
    // Find index for visual target
    const index = REWARDS_POOL.findIndex(r => r.id === reward.id);
    const totalSegments = segments.length;
    const segmentAngle = 360 / totalSegments;
    // Target angle: align pointer at top; add multiple spins for animation
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 spins
    const targetAngle = spins * 360 + (360 - index * segmentAngle) - segmentAngle / 2;

    if (wheelRef.current) {
      wheelRef.current.style.setProperty('--target-rotate', `${targetAngle}deg`);
      // Trigger reflow to restart animation
      // eslint-disable-next-line no-unused-expressions
      wheelRef.current.offsetHeight;
      wheelRef.current.classList.remove('spun');
      wheelRef.current.classList.add('spinning');
    }

    // End of spin after CSS duration
    const SPIN_DURATION = 4200; // ms; keep in sync with CSS
    setTimeout(() => {
      if (wheelRef.current) {
        wheelRef.current.classList.remove('spinning');
        wheelRef.current.classList.add('spun');
      }
      grantReward(reward);
      setResult(reward);
      setSpinning(false);
      setEligible(false);
      setCooldownMs(timeRemaining());
      setAriaMessage(`Congratulations! You won ${reward.label}.`);
      if (typeof onAfterGrant === 'function') {
        onAfterGrant(reward);
      }
    }, SPIN_DURATION + 100);
  }

  function onUseTicket() {
    // Navigate to mini-games route (assumed existing or future)
    navigate('/mini-games');
  }

  function onContinue() {
    // Return back one step or to dashboard
    navigate(-1);
  }

  return (
    <div className="spin-layout" onFocus={() => setHasFocus(true)} onBlur={() => setHasFocus(false)}>
      <div className="spin-card" role="region" aria-labelledby="spin-title" aria-describedby="spin-desc">
        <h1 id="spin-title" className="spin-title">Daily Spin</h1>
        <p id="spin-desc" className="spin-subtitle">
          Spin once every 24 hours for prizes!
        </p>

        <div className="wheel-container">
          <div className="wheel" ref={wheelRef} aria-live="off" aria-label="Reward wheel" role="img">
            {segments.map((label, i) => (
              <div key={i} className="segment" style={{ '--i': i, '--count': segments.length }}>
                <span>{label}</span>
              </div>
            ))}
            <div className="wheel-center" aria-hidden="true">★</div>
          </div>
          <div className="pointer" aria-hidden="true">▼</div>
        </div>

        <div className="controls">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSpin}
            disabled={!eligible || spinning}
            aria-disabled={!eligible || spinning}
          >
            {spinning ? 'Spinning…' : eligible ? 'Spin Now' : `Come back in ${formatDuration(cooldownMs)}`}
          </button>
        </div>

        {result && (
          <div className="result-panel" role="status" aria-live="polite">
            <div className="celebrate-burst" aria-hidden="true" />
            <h2 className="result-title">You won: {result.label}!</h2>
            <p className="result-text">
              {result.type === 'xp' && 'Your XP has been increased.'}
              {result.type === 'ticket' && 'Your mini-game tickets have been updated.'}
              {result.type === 'accessory' && 'A new accessory has been added to your inventory!'}
            </p>

            <div className="cta-row">
              {result.type === 'ticket' && (
                <button type="button" className="btn-secondary" onClick={onUseTicket}>
                  Use Ticket
                </button>
              )}
              <button type="button" className="btn-outline" onClick={onContinue}>
                Continue
              </button>
            </div>
          </div>
        )}

        <div
          className="sr-only"
          aria-live="assertive"
          aria-atomic="true"
          ref={announceRef}
        />
      </div>

      {!hasFocus && (
        <div className="sr-only" aria-live="polite">Tip: Press tab to focus the Spin button.</div>
      )}
    </div>
  );
}
