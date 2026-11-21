// Best campaign scores, kept in localStorage (this browser only) with a version
// key, so a future layout can ignore scores it does not understand. Every access
// is guarded: storage can be off (private windows) and the game must not care.

import { BEST_KEY } from './config.js';

function readRaw() {
  try {
    return window.localStorage.getItem(BEST_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value) {
  try {
    window.localStorage.setItem(BEST_KEY, value);
  } catch {
    // Storage off: best scores last this visit only.
  }
}

/** The stored best scores as { mode: score }, or an empty object. */
export function readBest() {
  const raw = readRaw();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // A corrupt record is forgotten, not fatal.
  }
  return {};
}

/** Record `score` as the best for `mode` when it beats the stored one. */
export function saveBest(mode, score) {
  const best = readBest();
  if (typeof best[mode] === 'number' && best[mode] >= score) return best[mode];
  best[mode] = score;
  writeRaw(JSON.stringify(best));
  return score;
}

/** The stored best for one mode, or 0. */
export function bestFor(mode) {
  const best = readBest();
  return typeof best[mode] === 'number' ? best[mode] : 0;
}
