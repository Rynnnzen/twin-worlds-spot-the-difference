// Twin Worlds — boot, screen flow and the animation loop.
//
// Screens: title, play, paused, scene-done, time-up, confirm-leave, atlas and
// campaign-done. The loop reads input, forwards clicks to the renderer's hit
// regions, moves the keyboard crosshair, ticks the world clock and paints one
// frame. Shot mode (?shot=start|play|end) stages one deterministic frame and
// sets window.__shotReady once it has been painted twice.

import { FIELD, LEFT_PANEL, MODE_ORDER, RIGHT_PANEL } from './config.js';
import { createWorld, STATUS_PLAYING, STATUS_SCENE_DONE, STATUS_TIME_UP } from './world.js';
import { createInput } from './input.js';
import {
  createRenderer,
  SCREEN_ATLAS,
  SCREEN_CAMPAIGN_DONE,
  SCREEN_CONFIRM_LEAVE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_SCENE_DONE,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
} from './render.js';
import { renderScenePair, renderScenePanel } from './art.js';
import { sceneAt, SCENES } from './scenes.js';
import { stageShot } from './shots.js';
import { readBest, saveBest } from './storage.js';

const params = new URLSearchParams(window.location.search);
const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);

let panelKey = '';
let panels = null;

/** The cached left/right canvases of the current scene and mode. */
function currentPanels() {
  const key = `${world.state.sceneIndex}:${world.state.mode}`;
  if (key !== panelKey) {
    panels = renderScenePair(sceneAt(world.state.sceneIndex), world.active());
    panelKey = key;
  }
  return panels;
}

let thumbs = null;

/** The eight left panels, rendered once for the title and atlas screens. */
function currentThumbs() {
  if (!thumbs) {
    thumbs = SCENES.map((scene) => renderScenePanel(scene, [], 'left'));
  }
  return thumbs;
}

function runShot(name) {
  const staged = stageShot(name, world, params);
  const viewData = {
    screen: staged.screen,
    world,
    panels: currentPanels(),
    thumbs: currentThumbs(),
    mouse: null,
    lensOn: staged.lensOn,
    lensAt: staged.lensAt,
    crosshair: null,
    pendingScene: null,
    best: {},
    now: 0,
    miss: null,
  };
  let painted = 0;
  function paint() {
    renderer.draw(viewData);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, renderer.toField);
  let screen = SCREEN_TITLE;
  let atlasReturn = SCREEN_TITLE;
  let pendingScene = null;
  let lensOn = false;
  let crosshair = null;
  let miss = null;
  let best = readBest();

  function announce(message) {
    statusEl.textContent = message;
  }

  function viewData(now) {
    return {
      screen,
      world,
      panels: currentPanels(),
      thumbs: currentThumbs(),
      mouse: input.mouse(),
      lensOn,
      lensAt: input.mouse(),
      crosshair,
      pendingScene,
      best,
      now,
      miss,
    };
  }

  function regionAt(point) {
    for (const r of renderer.hitRegions(viewData(performance.now()))) {
      if (point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h) return r.id;
    }
    return null;
  }

  function guessAt(point, panel) {
    const localX = point.x - panel.x;
    const localY = point.y - panel.y;
    const result = world.applyGuess(localX, localY);
    if (result.type === 'found') {
      const left = world.remaining();
      announce(left === 0 ? 'Scene complete!' : `Found one! ${left} left.`);
      if (world.state.status === STATUS_SCENE_DONE) screen = SCREEN_SCENE_DONE;
    } else if (result.type === 'miss') {
      miss = { x: point.x, y: point.y, at: world.state.elapsed };
      announce('Not a difference.');
    } else if (result.type === 'already') {
      announce('Already found.');
    }
  }

  function pickScene(index) {
    if (index === world.state.sceneIndex) return;
    const progress = world.state.found.size > 0 || world.state.elapsed > 5;
    if (progress && world.state.status === STATUS_PLAYING) {
      pendingScene = index;
      screen = SCREEN_CONFIRM_LEAVE;
    } else {
      world.startScene(index);
      screen = SCREEN_PLAY;
    }
  }

  function finishCampaign() {
    if (!world.nextScene()) {
      saveBest(world.state.mode, world.state.score);
      best = readBest();
      screen = SCREEN_CAMPAIGN_DONE;
      announce(`Expedition complete! Final score ${world.state.score}.`);
    } else {
      screen = SCREEN_PLAY;
    }
  }

  function handleRegion(id, point) {
    if (id === 'panel-left') return guessAt(point, LEFT_PANEL);
    if (id === 'panel-right') return guessAt(point, RIGHT_PANEL);
    if (id === 'hint') {
      const hint = world.useHint();
      announce(hint ? 'Hint: look at the pulsing ring.' : 'No hint available.');
      return;
    }
    if (id === 'pause') {
      screen = SCREEN_PAUSED;
      return;
    }
    if (id === 'lens') {
      lensOn = !lensOn;
      announce(lensOn ? 'Lens on.' : 'Lens off.');
      return;
    }
    if (id === 'mode') {
      const next = MODE_ORDER[(MODE_ORDER.indexOf(world.state.mode) + 1) % MODE_ORDER.length];
      world.switchMode(next);
      announce(`Mode: ${next}.`);
      return;
    }
    if (id === 'atlas') {
      atlasReturn = screen;
      screen = SCREEN_ATLAS;
      return;
    }
    if (id.startsWith('scene-')) {
      pickScene(Number(id.slice(6)));
      return;
    }
    if (id === 'stay') {
      screen = SCREEN_PLAY;
      pendingScene = null;
      return;
    }
    if (id === 'leave') {
      world.startScene(pendingScene);
      screen = SCREEN_PLAY;
      pendingScene = null;
      return;
    }
    if (id === 'resume') {
      screen = SCREEN_PLAY;
      return;
    }
    if (id === 'restart') {
      world.retryScene();
      screen = SCREEN_PLAY;
      return;
    }
    if (id === 'quit' || id === 'title') {
      screen = SCREEN_TITLE;
      return;
    }
    if (id === 'next-scene') {
      finishCampaign();
      return;
    }
    if (id === 'replay-scene' || id === 'retry') {
      world.retryScene();
      screen = SCREEN_PLAY;
      return;
    }
    if (id === 'relaxed') {
      world.continueRelaxed();
      screen = SCREEN_PLAY;
      return;
    }
    if (id === 'start') {
      world.startCampaign(world.state.mode);
      screen = SCREEN_PLAY;
      announce(`${SCENES[0].name}. Find ${world.active().length} differences.`);
      return;
    }
    if (id.startsWith('mode-')) {
      world.state.mode = id.slice(5);
      return;
    }
    if (id.startsWith('thumb-') || id.startsWith('card-')) {
      const index = Number(id.split('-')[1]);
      world.startCampaign(world.state.mode);
      world.startScene(index);
      screen = SCREEN_PLAY;
      announce(`${SCENES[index].name}. Find ${world.active().length} differences.`);
      return;
    }
    if (id === 'back') {
      screen = atlasReturn;
      return;
    }
    if (id === 'replay-campaign') {
      world.startCampaign(world.state.mode);
      screen = SCREEN_PLAY;
      return;
    }
  }

  function handleKeys() {
    for (const code of input.takePressed()) {
      if (screen === SCREEN_PLAY) {
        if (code.startsWith('Arrow')) {
          if (!crosshair) crosshair = { panel: 'left', x: 300, y: 210 };
        } else if (code === 'Enter' || code === 'Space') {
          if (crosshair) {
            const panel = crosshair.panel === 'left' ? LEFT_PANEL : RIGHT_PANEL;
            guessAt({ x: panel.x + crosshair.x, y: panel.y + crosshair.y }, panel);
          }
        } else if (code === 'KeyH') {
          handleRegion('hint');
        } else if (code === 'KeyL') {
          handleRegion('lens');
        } else if (code === 'KeyP') {
          handleRegion('pause');
        } else if (code === 'Tab') {
          if (crosshair) crosshair.panel = crosshair.panel === 'left' ? 'right' : 'left';
        } else if (code.startsWith('Digit')) {
          const index = Number(code.slice(5)) - 1;
          if (index >= 0 && index < SCENES.length) pickScene(index);
        }
      } else if (screen === SCREEN_PAUSED) {
        if (code === 'KeyP' || code === 'Escape' || code === 'Space') handleRegion('resume');
      } else if (screen === SCREEN_TITLE) {
        if (code === 'Enter' || code === 'Space') handleRegion('start');
      } else if (screen === SCREEN_SCENE_DONE) {
        if (code === 'Enter' || code === 'Space') handleRegion('next-scene');
      } else if (screen === SCREEN_TIME_UP) {
        if (code === 'Enter' || code === 'Space') handleRegion('retry');
      } else if (screen === SCREEN_CONFIRM_LEAVE) {
        if (code === 'Escape') handleRegion('stay');
        if (code === 'Enter') handleRegion('leave');
      } else if (screen === SCREEN_ATLAS) {
        if (code === 'Escape') handleRegion('back');
      } else if (screen === SCREEN_CAMPAIGN_DONE) {
        if (code === 'Enter' || code === 'Space') handleRegion('replay-campaign');
      }
    }
  }

  function moveCrosshair(dt) {
    if (screen !== SCREEN_PLAY || !crosshair) return;
    const speed = input.held('ShiftLeft') || input.held('ShiftRight') ? 60 : 180;
    if (input.held('ArrowLeft')) crosshair.x -= speed * dt;
    if (input.held('ArrowRight')) crosshair.x += speed * dt;
    if (input.held('ArrowUp')) crosshair.y -= speed * dt;
    if (input.held('ArrowDown')) crosshair.y += speed * dt;
    crosshair.x = Math.min(600, Math.max(0, crosshair.x));
    crosshair.y = Math.min(420, Math.max(0, crosshair.y));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
  });

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    handleKeys();
    for (const point of input.takeClicks()) {
      const id = regionAt(point);
      if (id) handleRegion(id, point);
    }
    moveCrosshair(dt);
    if (screen === SCREEN_PLAY) {
      if (world.tick(dt) === 'timeout') {
        screen = SCREEN_TIME_UP;
        announce("Time's up.");
      }
    }
    renderer.draw(viewData(now));
  }

  announce('Twin Worlds. Choose a mode and press Start Expedition.');
  requestAnimationFrame(frame);
}

const shot = params.get('shot');
if (shot) runShot(shot);
else runGame();
