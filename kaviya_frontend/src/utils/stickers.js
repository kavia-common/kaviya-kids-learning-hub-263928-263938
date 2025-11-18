//
// PUBLIC_INTERFACE
// Sticker utilities for inventory management and canvas persistence using localStorage.
//
/**
 * This module manages the kid's sticker inventory and sticker canvas pages.
 * Storage keys:
 * - kaviya.stickers.inventory: { categories: { [category: string]: { id, name, emoji, count, rarity }[] }, streak:number }
 * - kaviya.stickers.canvas: { placed: Array<PlacedSticker> }
 *
 * PUBLIC_INTERFACE
 * - getInventory(): returns inventory object
 * - addSticker(stickerId, amount = 1): increments inventory count for given sticker
 * - awardForQuiz({score,total,perfect,streakBonus}): returns array of awarded stickers (with ids) and persists them
 * - getCanvas(): returns { placed: PlacedSticker[] }
 * - saveCanvas(placed): persists canvas placed stickers
 * - getAllStickersFlat(): returns flat list of all known stickers
 */
/** @typedef {{ id:string, name:string, emoji:string, category:string, rarity:'common'|'rare'|'epic' }} StickerDef */
/** @typedef {{ id:string, x:number, y:number, scale:number, rotation:number }} PlacedSticker */

const INV_KEY = 'kaviya.stickers.inventory';
const CANVAS_KEY = 'kaviya.stickers.canvas';
const STREAK_KEY = 'kaviya.stickers.streak';

// Catalog of available stickers
const STICKER_CATALOG = [
  { id: 'animal_fox', name: 'Foxy', emoji: '🦊', category: 'Animals', rarity: 'common' },
  { id: 'animal_penguin', name: 'Waddle', emoji: '🐧', category: 'Animals', rarity: 'common' },
  { id: 'animal_unicorn', name: 'Spark', emoji: '🦄', category: 'Animals', rarity: 'rare' },
  { id: 'nature_sun', name: 'Sunny', emoji: '🌞', category: 'Nature', rarity: 'common' },
  { id: 'nature_rainbow', name: 'Rainbow', emoji: '🌈', category: 'Nature', rarity: 'rare' },
  { id: 'nature_star', name: 'Star', emoji: '🌟', category: 'Nature', rarity: 'common' },
  { id: 'trophy_medal', name: 'Medal', emoji: '🏅', category: 'Rewards', rarity: 'common' },
  { id: 'trophy_trophy', name: 'Trophy', emoji: '🏆', category: 'Rewards', rarity: 'rare' },
  { id: 'trophy_crown', name: 'Crown', emoji: '👑', category: 'Rewards', rarity: 'epic' },
];

/**
 * Build default inventory structure from catalog, with counts default to 0.
 */
function defaultInventory() {
  const categories = {};
  for (const s of STICKER_CATALOG) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push({ id: s.id, name: s.name, emoji: s.emoji, count: 0, rarity: s.rarity });
  }
  return { categories };
}

// PUBLIC_INTERFACE
export function getAllStickersFlat() {
  /** Returns the sticker catalog definitions as a flat array */
  return STICKER_CATALOG.slice();
}

// PUBLIC_INTERFACE
export function getInventory() {
  /** Load inventory from localStorage or initialize defaults */
  try {
    const raw = localStorage.getItem(INV_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  const inv = defaultInventory();
  try {
    localStorage.setItem(INV_KEY, JSON.stringify(inv));
  } catch {}
  return inv;
}

// INTERNAL: save
function saveInventory(inv) {
  try {
    localStorage.setItem(INV_KEY, JSON.stringify(inv));
  } catch {}
}

// PUBLIC_INTERFACE
export function addSticker(stickerId, amount = 1) {
  /**
   * Increments count for a specific sticker in inventory. No-op if id not found.
   */
  const inv = getInventory();
  let changed = false;
  for (const cat of Object.keys(inv.categories)) {
    const arr = inv.categories[cat];
    const item = arr.find((s) => s.id === stickerId);
    if (item) {
      item.count = Math.max(0, Number(item.count || 0) + Number(amount || 0));
      changed = true;
      break;
    }
  }
  if (changed) saveInventory(inv);
  return changed;
}

// PUBLIC_INTERFACE
export function awardForQuiz({ score, total, perfect = false, streakBonus = false }) {
  /**
   * Awards stickers based on quiz results.
   * Rules:
   * - Always award one common sticker for finishing.
   * - If score/total >= 0.8 : add an extra reward sticker (can be common).
   * - If perfect: award a rare trophy or unicorn/rainbow at random.
   * - If streakBonus (>=3 perfect streaks): award epic Crown.
   * Returns array of sticker ids that were awarded.
   */
  const awarded = [];

  // Always one common: choose from common pool deterministically by score hash
  const commons = STICKER_CATALOG.filter((s) => s.rarity === 'common');
  if (commons.length) {
    const idx = score % commons.length;
    awarded.push(commons[idx].id);
  }

  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.8 && commons.length) {
    const idx2 = (score + total) % commons.length;
    awarded.push(commons[idx2].id);
  }

  if (perfect) {
    const rarePool = STICKER_CATALOG.filter((s) => s.rarity === 'rare');
    if (rarePool.length) {
      const idx3 = (score * 7 + total) % rarePool.length;
      awarded.push(rarePool[idx3].id);
    }
  }

  if (streakBonus) {
    const crown = STICKER_CATALOG.find((s) => s.id === 'trophy_crown');
    if (crown) awarded.push(crown.id);
  }

  // Persist awards
  for (const id of awarded) addSticker(id, 1);

  // Update streak counter if perfect
  try {
    const prev = Number(JSON.parse(localStorage.getItem(STREAK_KEY) || '0')) || 0;
    const next = perfect ? prev + 1 : 0;
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  } catch {}

  return awarded;
}

// PUBLIC_INTERFACE
export function getStreak() {
  /** Returns current perfect-score streak count */
  try {
    return Number(JSON.parse(localStorage.getItem(STREAK_KEY) || '0')) || 0;
  } catch {
    return 0;
  }
}

// PUBLIC_INTERFACE
export function getCanvas() {
  /** Load the sticker canvas state (placed stickers) */
  try {
    const raw = localStorage.getItem(CANVAS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { placed: [] };
}

// PUBLIC_INTERFACE
export function saveCanvas(placed) {
  /** Persist the placed sticker array to localStorage */
  try {
    localStorage.setItem(CANVAS_KEY, JSON.stringify({ placed: placed || [] }));
  } catch {}
}

// PUBLIC_INTERFACE
export function consumeFromInventory(stickerId) {
  /**
   * Decrease inventory count when a sticker is placed onto canvas.
   * Returns true if successful.
   */
  const inv = getInventory();
  for (const cat of Object.keys(inv.categories)) {
    const item = inv.categories[cat].find((s) => s.id === stickerId);
    if (item && item.count > 0) {
      item.count -= 1;
      saveInventory(inv);
      return true;
    }
  }
  return false;
}

// PUBLIC_INTERFACE
export function returnToInventory(stickerId) {
  /**
   * Increase inventory count when a sticker is removed from canvas.
   */
  addSticker(stickerId, 1);
}
