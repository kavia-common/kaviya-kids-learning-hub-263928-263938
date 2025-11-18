//
// Utility for persisting mini-games progress, XP, tickets, and stickers using localStorage.
// Keeps data isolated under a single key and provides safe helpers.
//
// PUBLIC_INTERFACE
export function getMiniGamesState() {
  /** Get the current mini-games state from localStorage. */
  try {
    const raw = localStorage.getItem("kkh_mini_games_state");
    if (!raw) {
      return {
        xp: 0,
        tickets: 0,
        completed: {}, // gameKey: { bestScore, timesPlayed, lastPlayedAt }
        stickers: [], // simple string stickers earned
      };
    }
    const parsed = JSON.parse(raw);
    return {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      tickets: typeof parsed.tickets === "number" ? parsed.tickets : 0,
      completed: parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
      stickers: Array.isArray(parsed.stickers) ? parsed.stickers : [],
    };
  } catch {
    return {
      xp: 0,
      tickets: 0,
      completed: {},
      stickers: [],
    };
  }
}

function saveMiniGamesState(state) {
  try {
    localStorage.setItem("kkh_mini_games_state", JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

// PUBLIC_INTERFACE
export function addXP(amount) {
  /** Add XP points to the mini-games pool and persist. */
  const st = getMiniGamesState();
  st.xp += Math.max(0, Number(amount || 0));
  saveMiniGamesState(st);
  return st.xp;
}

// PUBLIC_INTERFACE
export function addTicket(count = 1) {
  /** Add daily spin tickets (used by Spin Wheel) to the pool. */
  const st = getMiniGamesState();
  st.tickets += Math.max(0, Number(count || 0));
  saveMiniGamesState(st);
  return st.tickets;
}

// PUBLIC_INTERFACE
export function consumeTicket(count = 1) {
  /** Consume tickets (for Spin Wheel page to use). Safely floors at zero. */
  const st = getMiniGamesState();
  st.tickets = Math.max(0, st.tickets - Math.max(0, Number(count || 0)));
  saveMiniGamesState(st);
  return st.tickets;
}

// PUBLIC_INTERFACE
export function recordGameCompletion(gameKey, score, xpAward = 5, stickerName = null, ticketAward = 0) {
  /**
   * Record a game completion:
   * - Updates best score
   * - Increments times played
   * - Awards XP, optional sticker, optional spin ticket(s)
   */
  const st = getMiniGamesState();
  const prev = st.completed[gameKey] || { bestScore: 0, timesPlayed: 0, lastPlayedAt: null };
  const bestScore = Math.max(prev.bestScore || 0, Number(score || 0));
  st.completed[gameKey] = {
    bestScore,
    timesPlayed: (prev.timesPlayed || 0) + 1,
    lastPlayedAt: new Date().toISOString(),
  };
  if (xpAward && xpAward > 0) {
    st.xp += xpAward;
  }
  if (ticketAward && ticketAward > 0) {
    st.tickets += ticketAward;
  }
  if (stickerName && !st.stickers.includes(stickerName)) {
    st.stickers.push(stickerName);
  }
  saveMiniGamesState(st);
  return st;
}

// PUBLIC_INTERFACE
export function getTickets() {
  /** Get number of available spin tickets. */
  return getMiniGamesState().tickets;
}

// PUBLIC_INTERFACE
export function getXP() {
  /** Get current mini-games XP balance. */
  return getMiniGamesState().xp;
}

// PUBLIC_INTERFACE
export function getStickers() {
  /** Get stickers earned from mini-games. */
  return getMiniGamesState().stickers;
}

// PUBLIC_INTERFACE
export function getGameStats(gameKey) {
  /** Get stored stats for a specific game. */
  const st = getMiniGamesState();
  return st.completed[gameKey] || { bestScore: 0, timesPlayed: 0, lastPlayedAt: null };
}
