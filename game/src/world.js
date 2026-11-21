// The game's rules and state, with no drawing and no browser in it: the eight
// scenes, the differences in play per mode, guesses, score and streak, hints,
// the countdown, and campaign progression. Time is measured in seconds elapsed
// while playing (the loop does not tick while paused), so pausing freezes the
// clock, the hint cooldown and the streak window together.

import { HINT_COOLDOWN_SEC, HINT_SHOW_SEC, MAX_MULTIPLIER, MODES, SCORE_PER_FIND, STREAK_WINDOW_SEC } from './config.js';
import { activeDifferences } from './differences.js';
import { SCENES } from './scenes.js';

export const STATUS_PLAYING = 'playing';
export const STATUS_SCENE_DONE = 'scene-done';
export const STATUS_TIME_UP = 'time-up';
export const STATUS_CAMPAIGN_DONE = 'campaign-done';

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

export function createWorld() {
  const state = {
    mode: 'classic',
    sceneIndex: 0,
    found: new Set(),
    foundOrder: [],
    foundAt: new Map(),
    score: 0,
    multiplier: 1,
    streak: 0,
    lastFindAt: -Infinity,
    elapsed: 0,
    timeLeft: 0,
    hintsLeft: 0,
    hintReadyAt: 0,
    hintReveal: null,
    status: STATUS_PLAYING,
    completed: new Set(),
    totalFound: 0,
    floats: [],
    misses: 0,
  };

  /** The differences in play for the current scene and mode. */
  function active() {
    return activeDifferences(state.sceneIndex, state.mode);
  }

  function remaining() {
    return active().length - state.found.size;
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.foundOrder = [];
    state.foundAt = new Map();
    state.hintReveal = null;
    state.floats = [];
    const mode = MODES[state.mode];
    state.timeLeft = mode.seconds;
    state.hintsLeft = mode.hints;
    state.hintReadyAt = 0;
    state.status = STATUS_PLAYING;
  }

  function startCampaign(mode) {
    state.mode = mode;
    state.score = 0;
    state.multiplier = 1;
    state.streak = 0;
    state.lastFindAt = -Infinity;
    state.elapsed = 0;
    state.completed = new Set();
    state.totalFound = 0;
    state.misses = 0;
    startScene(0);
  }

  function switchMode(mode) {
    state.mode = mode;
    startScene(state.sceneIndex);
  }

  /**
   * A guess at panel-local (x, y) on either picture. Returns what happened:
   * found (with the difference and the points scored), miss, already (a spot
   * found before — harmless) or none (not playing).
   */
  function applyGuess(x, y) {
    if (state.status !== STATUS_PLAYING) return { type: 'none' };
    for (const d of active()) {
      if (state.found.has(d.id)) continue;
      if (distance(x, y, d.hx, d.hy) > (d.hr ?? 26)) continue;
      state.found.add(d.id);
      state.foundOrder.push(d.id);
      state.foundAt.set(d.id, state.elapsed);
      state.totalFound += 1;
      const withinWindow = state.elapsed - state.lastFindAt <= STREAK_WINDOW_SEC;
      state.streak = withinWindow ? state.streak + 1 : 1;
      state.lastFindAt = state.elapsed;
      state.multiplier = Math.min(MAX_MULTIPLIER, state.streak);
      const points = SCORE_PER_FIND * state.multiplier;
      state.score += points;
      state.floats.push({ x: d.hx, y: d.hy, text: `+${points}`, at: state.elapsed });
      if (remaining() === 0) {
        state.completed.add(state.sceneIndex);
        const bonus = state.timeLeft > 0 ? Math.round(state.timeLeft) * 5 : 0;
        state.score += bonus;
        state.status = STATUS_SCENE_DONE;
      }
      return { type: 'found', diff: d, points, multiplier: state.multiplier };
    }
    for (const d of active()) {
      if (!state.found.has(d.id)) continue;
      if (distance(x, y, d.hx, d.hy) <= (d.hr ?? 26)) return { type: 'already', diff: d };
    }
    state.misses += 1;
    state.streak = 0;
    state.multiplier = 1;
    const mode = MODES[state.mode];
    if (mode.penaltySec > 0) state.timeLeft = Math.max(0, state.timeLeft - mode.penaltySec);
    return { type: 'miss' };
  }

  /** Spend one hint: briefly highlight an unfound difference on both panels. */
  function useHint() {
    if (state.status !== STATUS_PLAYING) return null;
    if (state.hintsLeft <= 0) return null;
    if (state.elapsed < state.hintReadyAt) return null;
    const unfound = active().filter((d) => !state.found.has(d.id));
    if (unfound.length === 0) return null;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    state.hintsLeft -= 1;
    state.hintReadyAt = state.elapsed + HINT_COOLDOWN_SEC;
    state.hintReveal = { diff: pick, until: state.elapsed + HINT_SHOW_SEC };
    state.streak = 0;
    state.multiplier = 1;
    return pick;
  }

  /** Advance the clock by dt seconds. Returns 'timeout' when the clock runs out. */
  function tick(dt) {
    if (state.status !== STATUS_PLAYING) return null;
    state.elapsed += dt;
    if (state.hintReveal && state.elapsed >= state.hintReveal.until) state.hintReveal = null;
    state.floats = state.floats.filter((f) => state.elapsed - f.at < 0.6);
    const mode = MODES[state.mode];
    if (mode.seconds > 0) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.status = STATUS_TIME_UP;
        return 'timeout';
      }
    }
    return null;
  }

  /** Move to the next scene. Returns false when the campaign is complete. */
  function nextScene() {
    if (state.sceneIndex + 1 >= SCENES.length) {
      state.status = STATUS_CAMPAIGN_DONE;
      return false;
    }
    startScene(state.sceneIndex + 1);
    return true;
  }

  function retryScene() {
    startScene(state.sceneIndex);
  }

  function continueRelaxed() {
    state.mode = 'relaxed';
    startScene(state.sceneIndex);
  }

  return {
    state,
    active,
    remaining,
    startScene,
    startCampaign,
    switchMode,
    applyGuess,
    useHint,
    tick,
    nextScene,
    retryScene,
    continueRelaxed,
  };
}
