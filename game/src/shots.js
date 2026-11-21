// The screenshot scenes behind ?shot=start|play|end (with &scene=N, &seed=N and
// an optional &lens=x,y). Each one plays the real rules forward from a fresh
// world — real guesses at real difference centres, a real countdown, a real
// score — so the frame is what a genuine game looks like and the same query
// always gives the same frame. Nothing here assigns a fabricated counter.

import { SCREEN_CAMPAIGN_DONE, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

// How each play screenshot is staged: seconds to run off the clock first, then
// the regions to find for real.
const PLAY_SHOTS = {
  0: { advanceSec: 0, find: [] },
  3: { advanceSec: 76, find: ['A', 'C', 'F', 'H'] },
  7: { advanceSec: 88, find: ['A', 'C', 'E'] },
};

const STEP = 1 / 60;

/** Stage the named scene and return the screen and lens state to draw. */
export function stageShot(name, world, params) {
  if (name === 'start') {
    world.startCampaign(params.get('mode') || 'classic');
    return { screen: SCREEN_TITLE, lensOn: false, lensAt: null };
  }
  if (name === 'end') {
    world.startCampaign('classic');
    for (let scene = 0; scene < 8; scene += 1) {
      for (const d of world.active()) world.applyGuess(d.hx, d.hy);
      world.nextScene();
    }
    return { screen: SCREEN_CAMPAIGN_DONE, lensOn: false, lensAt: null };
  }
  // &scene=N is 1-indexed: scene=4 is the Mushroom Mailroom, scene=8 the Comet
  // Seed Archive.
  const sceneIndex = Math.max(0, Math.min(7, (Number.parseInt(params.get('scene') ?? '4', 10) || 4) - 1));
  world.startCampaign('classic');
  world.startScene(sceneIndex);
  const plan = PLAY_SHOTS[sceneIndex] ?? { advanceSec: 60, find: ['A', 'B'] };
  for (let t = 0; t < plan.advanceSec; t += STEP) world.tick(STEP);
  for (const region of plan.find) {
    const d = world.active().find((x) => x.region === region);
    if (d) world.applyGuess(d.hx, d.hy);
  }
  const lensParam = params.get('lens');
  let lensAt = null;
  if (lensParam) {
    const [x, y] = lensParam.split(',').map(Number);
    if (Number.isFinite(x) && Number.isFinite(y)) lensAt = { x, y };
  }
  return { screen: SCREEN_PLAY, lensOn: lensAt !== null, lensAt };
}
