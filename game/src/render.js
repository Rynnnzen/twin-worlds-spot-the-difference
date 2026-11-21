// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred. Everything the
// player sees — the two panels, the HUD, found markers, the lens, the title,
// the atlas and every overlay — is painted here. Clickable regions are exposed
// through hitRegions(view) so input can route clicks without knowing layout.

import { BUTTONS, FIELD, FONT, HUD, LEFT_PANEL, MARKER, MODES, MODE_ORDER, PALETTE, PANEL, RIGHT_PANEL, STRIP } from './config.js';
import { SCENES } from './scenes.js';
import { drawLens } from './magnifier.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_SCENE_DONE = 'scene-done';
export const SCREEN_TIME_UP = 'time-up';
export const SCREEN_CAMPAIGN_DONE = 'campaign-done';
export const SCREEN_ATLAS = 'atlas';
export const SCREEN_CONFIRM_LEAVE = 'confirm-leave';

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  /** Field coordinates of a client (mouse) point, or null outside the field. */
  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * ratio;
    const y = (clientY - rect.top) * ratio;
    const fx = (x - view.x) / view.scale;
    const fy = (y - view.y) / view.scale;
    if (fx < 0 || fy < 0 || fx > FIELD.width || fy > FIELD.height) return null;
    return { x: fx, y: fy };
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, weight) {
    const key = `${weight || ''}${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight ? `${weight} ` : ''}${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align || 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function buttonRect(id, x, y, w, h) {
    return { id, x, y, w, h };
  }

  function drawButton(rect, label, opts = {}) {
    const { hot = false, disabled = false, accent = false } = opts;
    context.fillStyle = disabled ? PALETTE.surface : accent ? PALETTE.mintDeep : hot ? PALETTE.buttonHot : PALETTE.button;
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.w, rect.h, 10);
    context.fill();
    context.strokeStyle = accent ? PALETTE.mint : PALETTE.muted;
    context.lineWidth = accent ? 2 : 1;
    context.stroke();
    context.fillStyle = disabled ? PALETTE.muted : PALETTE.text;
    text(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 7, opts.size || 20, disabled ? PALETTE.muted : PALETTE.text, 'center');
  }

  function drawFoundDots(state, active) {
    const cx = 24;
    const cy = HUD.controlsY + HUD.controlsH / 2;
    for (let i = 0; i < active.length; i += 1) {
      const found = state.found.has(active[i].id);
      context.fillStyle = found ? PALETTE.mint : PALETTE.surface;
      context.strokeStyle = PALETTE.muted;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(cx + 12 + i * 26, cy, 9, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      if (found) {
        context.fillStyle = PALETTE.backdrop;
        text('✓', cx + 12 + i * 26, cy + 5, 13, PALETTE.backdrop, 'center', 'bold');
      }
    }
    text(`Scene ${state.sceneIndex + 1} / ${SCENES.length}`, cx + 12 + active.length * 26 + 8, cy + 6, 18, PALETTE.muted, 'left');
  }

  function drawMarkers(viewData) {
    const { world, panels } = viewData;
    const state = world.state;
    const active = world.active();
    const now = state.elapsed;
    for (const d of active) {
      if (!state.found.has(d.id)) continue;
      const age = (now - (state.foundAt.get(d.id) ?? now)) * 1000;
      const pop = age < MARKER.popMs ? 1 + 0.35 * (1 - age / MARKER.popMs) : 1;
      const radius = MARKER.radius * pop;
      for (const panel of [LEFT_PANEL, RIGHT_PANEL]) {
        const cx = panel.x + d.hx;
        const cy = panel.y + d.hy;
        context.strokeStyle = PALETTE.ring;
        context.lineWidth = MARKER.lineWidth;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = PALETTE.check;
        context.beginPath();
        context.arc(cx + radius * 0.7, cy - radius * 0.7, 9, 0, Math.PI * 2);
        context.fill();
        text('✓', cx + radius * 0.7, cy - radius * 0.7 + 4, 12, PALETTE.backdrop, 'center', 'bold');
      }
    }
    // Floating score text over the right panel.
    for (const f of state.floats) {
      const age = (now - f.at) * 1000;
      const alpha = Math.max(0, 1 - age / 600);
      context.globalAlpha = alpha;
      text(f.text, RIGHT_PANEL.x + f.x, RIGHT_PANEL.y + f.y - 30 - age / 25, 20, PALETTE.gold, 'center', 'bold');
      context.globalAlpha = 1;
    }
    // Hint reveal: a pulsing dashed ring on both panels.
    if (state.hintReveal) {
      const d = state.hintReveal.diff;
      const pulse = 0.6 + 0.4 * Math.sin(now * 10);
      context.save();
      context.strokeStyle = PALETTE.amber;
      context.globalAlpha = pulse;
      context.lineWidth = 3;
      context.setLineDash([8, 6]);
      for (const panel of [LEFT_PANEL, RIGHT_PANEL]) {
        context.beginPath();
        context.arc(panel.x + d.hx, panel.y + d.hy, MARKER.radius + 4, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();
    }
    // Miss feedback: a fading red cross where the player clicked.
    if (viewData.miss && now - viewData.miss.at < 0.5) {
      const age = now - viewData.miss.at;
      context.globalAlpha = Math.max(0, 1 - age * 2);
      context.strokeStyle = PALETTE.coral;
      context.lineWidth = 3;
      const { x, y } = viewData.miss;
      context.beginPath();
      context.moveTo(x - 10, y - 10);
      context.lineTo(x + 10, y + 10);
      context.moveTo(x + 10, y - 10);
      context.lineTo(x - 10, y + 10);
      context.stroke();
      context.globalAlpha = 1;
    }
  }

  function drawPlayFrame(viewData, conceal) {
    const { world } = viewData;
    const state = world.state;
    const scene = SCENES[state.sceneIndex];
    const active = world.active();
    const mode = MODES[state.mode];
    const left = world.remaining();

    // Top row.
    text('TWIN WORLDS', 24, 38, 24, PALETTE.text, 'left', 'bold');
    text(scene.name, 24, 62, 18, PALETTE.muted, 'left');
    text(`${left} LEFT`, HUD.counterX, 48, 40, PALETTE.gold, 'left', 'bold');
    text(`${active.length - left} / ${active.length} found`, HUD.counterX, 70, 18, PALETTE.muted, 'left');
    text(`Score ${state.score}`, HUD.scoreX, 38, 24, PALETTE.text, 'left', 'bold');
    text(state.multiplier > 1 ? `Streak x${state.multiplier}` : 'Streak x1', HUD.scoreX, 62, 18, PALETTE.mint, 'left');
    if (mode.seconds > 0) {
      const total = Math.ceil(state.timeLeft);
      const mins = Math.floor(total / 60);
      const secs = total % 60;
      const urgent = state.timeLeft < 15;
      text(`${mins}:${String(secs).padStart(2, '0')}`, HUD.clockX, 48, 36, urgent ? PALETTE.coral : PALETTE.text, 'left', 'bold');
    } else {
      text('No clock', HUD.clockX, 48, 30, PALETTE.text, 'left', 'bold');
    }
    text(mode.label, HUD.clockX, 70, 18, PALETTE.muted, 'left');

    // Timer bar.
    const bar = HUD.timerBar;
    context.fillStyle = PALETTE.surface;
    context.beginPath();
    context.roundRect(bar.x, bar.y, bar.width, bar.height, 5);
    context.fill();
    if (mode.seconds > 0) {
      const frac = Math.max(0, state.timeLeft / mode.seconds);
      const color = state.timeLeft < 15 ? PALETTE.coral : state.timeLeft < 30 ? PALETTE.amber : PALETTE.mint;
      const pulse = state.timeLeft < 15 ? 0.7 + 0.3 * Math.sin(viewData.now / 120) : 1;
      context.globalAlpha = pulse;
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(bar.x, bar.y, bar.width * frac, bar.height, 5);
      context.fill();
      context.globalAlpha = 1;
    } else {
      text('Relaxed — take your time', bar.x + 4, bar.y + 9, 12, PALETTE.muted, 'left');
    }

    // Panel labels.
    text('ORIGINAL', LEFT_PANEL.x, HUD.labelY + 16, 16, PALETTE.muted, 'left', 'bold');
    text('FIND THE CHANGES', RIGHT_PANEL.x, HUD.labelY + 16, 16, PALETTE.muted, 'left', 'bold');
    if (state.found.size === 0 && state.misses === 0) {
      text('Click either picture to guess', LEFT_PANEL.x + LEFT_PANEL.width / 2, HUD.labelY + 16, 15, PALETTE.muted, 'center');
    }

    // Panels.
    for (const panel of [LEFT_PANEL, RIGHT_PANEL]) {
      context.fillStyle = PALETTE.panel;
      context.beginPath();
      context.roundRect(panel.x - 4, panel.y - 4, panel.width + 8, panel.height + 8, PANEL.radius + 4);
      context.fill();
    }
    if (!conceal && viewData.panels) {
      context.save();
      for (const [panel, art] of [[LEFT_PANEL, viewData.panels.left], [RIGHT_PANEL, viewData.panels.right]]) {
        context.beginPath();
        context.roundRect(panel.x, panel.y, panel.width, panel.height, PANEL.radius);
        context.clip();
        context.drawImage(art, panel.x, panel.y, panel.width, panel.height);
        context.restore();
        context.save();
      }
      context.restore();
      drawMarkers(viewData);
    } else if (conceal) {
      for (const panel of [LEFT_PANEL, RIGHT_PANEL]) {
        context.fillStyle = PALETTE.surface;
        context.beginPath();
        context.roundRect(panel.x, panel.y, panel.width, panel.height, PANEL.radius);
        context.fill();
        text('· · ·', panel.x + panel.width / 2, panel.y + panel.height / 2, 40, PALETTE.muted, 'center');
      }
    }

    // Crosshair for keyboard play.
    if (viewData.crosshair && !conceal) {
      const panel = viewData.crosshair.panel === 'left' ? LEFT_PANEL : RIGHT_PANEL;
      const cx = panel.x + viewData.crosshair.x;
      const cy = panel.y + viewData.crosshair.y;
      context.strokeStyle = PALETTE.gold;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(cx, cy, 14, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(cx - 20, cy);
      context.lineTo(cx - 8, cy);
      context.moveTo(cx + 8, cy);
      context.lineTo(cx + 20, cy);
      context.moveTo(cx, cy - 20);
      context.lineTo(cx, cy - 8);
      context.moveTo(cx, cy + 8);
      context.lineTo(cx, cy + 20);
      context.stroke();
    }

    // Controls row.
    drawFoundDots(state, active);
    const hintCooling = state.elapsed < state.hintReadyAt;
    const hintLabel = state.hintsLeft <= 0 ? 'Hint (0)' : hintCooling ? `Hint (${Math.ceil(state.hintReadyAt - state.elapsed)}s)` : `Hint (${state.hintsLeft})`;
    drawButton(
      buttonRect('hint', BUTTONS.hint.x, HUD.controlsY, BUTTONS.hint.width, HUD.controlsH),
      hintLabel,
      { disabled: state.hintsLeft <= 0 || hintCooling || left === 0 },
    );
    drawButton(buttonRect('pause', BUTTONS.pause.x, HUD.controlsY, BUTTONS.pause.width, HUD.controlsH), 'Pause');
    drawButton(buttonRect('lens', BUTTONS.lens.x, HUD.controlsY, BUTTONS.lens.width, HUD.controlsH), viewData.lensOn ? 'Lens: on' : 'Lens: off', { accent: viewData.lensOn });
    drawButton(buttonRect('mode', BUTTONS.mode.x, HUD.controlsY, BUTTONS.mode.width, HUD.controlsH), `Mode: ${mode.label}`);
    drawButton(buttonRect('atlas', BUTTONS.atlas.x, HUD.controlsY, BUTTONS.atlas.width, HUD.controlsH), 'Atlas');

    // Scene strip.
    for (let i = 0; i < SCENES.length; i += 1) {
      const x = STRIP.x + i * (STRIP.width + STRIP.gap);
      const done = state.completed.has(i);
      const current = i === state.sceneIndex;
      const label = `${i + 1}. ${SCENES[i].name.split(' ')[0]}${done ? ' ✓' : ''}`;
      drawButton(
        buttonRect(`scene-${i}`, x, HUD.stripY, STRIP.width, HUD.stripH),
        label,
        { accent: current, size: 15 },
      );
    }
    text('Mouse: click a difference on either picture · hover for the lens · Keys: arrows move, Enter guess, Tab switch picture, H hint, L lens, P pause, 1–8 scene', FIELD.width / 2, HUD.helpY + 12, 14, PALETTE.muted, 'center');

    // The lens sits above everything else.
    if (viewData.lensOn && viewData.lensAt && viewData.panels && !conceal) {
      drawLens(context, viewData.panels, viewData.lensAt);
    }
  }

  /** A centred overlay panel with a title, lines of text and a row of buttons. */
  function overlayLayout(lines, buttonCount) {
    const width = 640;
    const height = 120 + lines.length * 34 + 96;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    const buttons = [];
    const bw = buttonCount === 1 ? 240 : buttonCount === 2 ? 220 : 190;
    const gap = 16;
    const total = buttonCount * bw + (buttonCount - 1) * gap;
    for (let i = 0; i < buttonCount; i += 1) {
      buttons.push({ x: x + (width - total) / 2 + i * (bw + gap), y: y + height - 76, w: bw, h: 48 });
    }
    return { panel: { x, y, w: width, h: height }, buttons };
  }

  function drawOverlay(title, lines, buttons) {
    const layout = overlayLayout(lines, buttons.length);
    context.fillStyle = 'rgba(10, 11, 16, 0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const p = layout.panel;
    context.fillStyle = PALETTE.panel;
    context.beginPath();
    context.roundRect(p.x, p.y, p.w, p.h, 18);
    context.fill();
    context.strokeStyle = PALETTE.muted;
    context.lineWidth = 1;
    context.stroke();
    text(title, FIELD.width / 2, p.y + 62, 36, PALETTE.text, 'center', 'bold');
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, p.y + 120 + i * 34, 21, PALETTE.muted, 'center');
    }
    for (let i = 0; i < buttons.length; i += 1) {
      const r = layout.buttons[i];
      drawButton(buttonRect(buttons[i].id, r.x, r.y, r.w, r.h), buttons[i].label, { accent: buttons[i].accent, size: 20 });
    }
    return layout;
  }

  function drawTitle(viewData) {
    const { world, thumbs } = viewData;
    const state = world.state;
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    // Preview: the Mushroom Mailroom on the right.
    if (thumbs && thumbs[3]) {
      context.save();
      context.beginPath();
      context.roundRect(660, 70, 560, 392, 16);
      context.clip();
      context.drawImage(thumbs[3], 660, 70, 560, 392);
      context.restore();
      context.strokeStyle = PALETTE.muted;
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(660, 70, 560, 392, 16);
      context.stroke();
      text('Scene 4 · Mushroom Mailroom', 940, 484, 18, PALETTE.muted, 'center');
    }
    text('TWIN WORLDS', 48, 116, 54, PALETTE.text, 'left', 'bold');
    text('Spot the Difference', 48, 158, 30, PALETTE.mint, 'left');
    text('Eight miniature worlds · 64 differences to find', 48, 188, 19, PALETTE.muted, 'left');
    // Mode selector.
    text('Mode', 48, 232, 18, PALETTE.muted, 'left', 'bold');
    for (let i = 0; i < MODE_ORDER.length; i += 1) {
      const mode = MODE_ORDER[i];
      const x = 48 + i * 142;
      drawButton(buttonRect(`mode-${mode}`, x, 244, 130, 44), MODES[mode].label, { accent: state.mode === mode, size: 18 });
    }
    const mode = MODES[state.mode];
    const modeLine = mode.seconds > 0
      ? `${mode.diffs} differences a scene · ${mode.seconds}s a scene · ${mode.hints} hints`
      : `${mode.diffs} differences a scene · no clock · ${mode.hints} hints`;
    text(modeLine, 48, 316, 17, PALETTE.muted, 'left');
    drawButton(buttonRect('start', 48, 336, 280, 56), 'Start Expedition', { accent: true, size: 22 });
    drawButton(buttonRect('atlas', 48, 404, 280, 44), 'Explore the Atlas', { size: 18 });
    const best = viewData.best?.[state.mode] ?? 0;
    if (best > 0) text(`Best ${mode.label} score: ${best}`, 48, 474, 18, PALETTE.gold, 'left');
    // Thumbnail strip.
    text('The eight worlds — click one to start there', 38, 542, 17, PALETTE.muted, 'left');
    for (let i = 0; i < SCENES.length; i += 1) {
      const x = 38 + i * 152;
      if (thumbs && thumbs[i]) {
        context.save();
        context.beginPath();
        context.roundRect(x, 556, 140, 98, 10);
        context.clip();
        context.drawImage(thumbs[i], x, 556, 140, 98);
        context.restore();
      }
      context.strokeStyle = PALETTE.muted;
      context.lineWidth = 1;
      context.beginPath();
      context.roundRect(x, 556, 140, 98, 10);
      context.stroke();
      text(`${i + 1}. ${SCENES[i].name.split(' ')[0]}`, x + 70, 674, 13, PALETTE.muted, 'center');
      if (state.completed.has(i)) text('✓', x + 128, 576, 16, PALETTE.mint, 'center', 'bold');
    }
    text('Mouse and keyboard: arrows move the crosshair · Enter guesses · H hints · L lens · P pauses', FIELD.width / 2, 706, 14, PALETTE.muted, 'center');
  }

  function drawAtlas(viewData) {
    const { world, thumbs } = viewData;
    const state = world.state;
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    text('The Atlas', 42, 64, 36, PALETTE.text, 'left', 'bold');
    text('Eight worlds. Play any of them, in any order.', 42, 90, 18, PALETTE.muted, 'left');
    for (let i = 0; i < SCENES.length; i += 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 42 + col * 305;
      const y = 110 + row * 260;
      context.fillStyle = PALETTE.panel;
      context.beginPath();
      context.roundRect(x, y, 280, 240, 14);
      context.fill();
      if (thumbs && thumbs[i]) {
        context.save();
        context.beginPath();
        context.roundRect(x + 10, y + 10, 260, 182, 10);
        context.clip();
        context.drawImage(thumbs[i], x + 10, y + 10, 260, 182);
        context.restore();
      }
      text(`${i + 1}. ${SCENES[i].name}`, x + 14, y + 206, 17, PALETTE.text, 'left', 'bold');
      const done = state.completed.has(i);
      text(done ? '✓ Completed' : SCENES[i].tag, x + 14, y + 228, 15, done ? PALETTE.mint : PALETTE.muted, 'left');
    }
    drawButton(buttonRect('back', 42, 648, 160, 44), 'Back', { size: 18 });
  }

  function drawCampaignDone(viewData) {
    const { world, panels } = viewData;
    const state = world.state;
    // The final solved pair behind the results.
    if (panels) {
      context.globalAlpha = 0.45;
      context.drawImage(panels.left, LEFT_PANEL.x, LEFT_PANEL.y, LEFT_PANEL.width, LEFT_PANEL.height);
      context.drawImage(panels.right, RIGHT_PANEL.x, RIGHT_PANEL.y, RIGHT_PANEL.width, RIGHT_PANEL.height);
      context.globalAlpha = 1;
    }
    context.fillStyle = 'rgba(10, 11, 16, 0.6)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const lines = [
      `${state.totalFound} / 64 differences discovered`,
      `Final score: ${state.score}`,
      `Best ${MODES[state.mode].label}: ${viewData.best?.[state.mode] ?? state.score}`,
      '',
      'Every world, mapped twice. Well found.',
      '',
    ];
    const layout = drawOverlay('Expedition Complete', lines, [
      { id: 'replay-campaign', label: 'Play Again', accent: true },
      { id: 'atlas', label: 'Explore Atlas' },
      { id: 'title', label: 'Title' },
    ]);
    // Completion badges above the buttons.
    const y = layout.panel.y + 296;
    for (let i = 0; i < SCENES.length; i += 1) {
      const x = layout.panel.x + 36 + i * 72;
      context.fillStyle = state.completed.has(i) ? PALETTE.mintDeep : PALETTE.surface;
      context.beginPath();
      context.roundRect(x, y, 60, 30, 8);
      context.fill();
      text(`${i + 1} ✓`, x + 30, y + 21, 16, PALETTE.text, 'center', 'bold');
    }
  }

  /** Every clickable region of the current screen, in field coordinates. */
  function hitRegions(viewData) {
    const screen = viewData.screen;
    const regions = [];
    if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED || screen === SCREEN_SCENE_DONE || screen === SCREEN_TIME_UP || screen === SCREEN_CONFIRM_LEAVE) {
      if (screen === SCREEN_PLAY) {
        regions.push(buttonRect('panel-left', LEFT_PANEL.x, LEFT_PANEL.y, LEFT_PANEL.width, LEFT_PANEL.height));
        regions.push(buttonRect('panel-right', RIGHT_PANEL.x, RIGHT_PANEL.y, RIGHT_PANEL.width, RIGHT_PANEL.height));
        regions.push(buttonRect('hint', BUTTONS.hint.x, HUD.controlsY, BUTTONS.hint.width, HUD.controlsH));
        regions.push(buttonRect('pause', BUTTONS.pause.x, HUD.controlsY, BUTTONS.pause.width, HUD.controlsH));
        regions.push(buttonRect('lens', BUTTONS.lens.x, HUD.controlsY, BUTTONS.lens.width, HUD.controlsH));
        regions.push(buttonRect('mode', BUTTONS.mode.x, HUD.controlsY, BUTTONS.mode.width, HUD.controlsH));
        regions.push(buttonRect('atlas', BUTTONS.atlas.x, HUD.controlsY, BUTTONS.atlas.width, HUD.controlsH));
        for (let i = 0; i < SCENES.length; i += 1) {
          regions.push(buttonRect(`scene-${i}`, STRIP.x + i * (STRIP.width + STRIP.gap), HUD.stripY, STRIP.width, HUD.stripH));
        }
      }
      if (screen === SCREEN_PAUSED) {
        const layout = overlayLayout(['The pictures are hidden while you rest.'], 3);
        regions.push(buttonRect('resume', layout.buttons[0].x, layout.buttons[0].y, layout.buttons[0].w, layout.buttons[0].h));
        regions.push(buttonRect('restart', layout.buttons[1].x, layout.buttons[1].y, layout.buttons[1].w, layout.buttons[1].h));
        regions.push(buttonRect('quit', layout.buttons[2].x, layout.buttons[2].y, layout.buttons[2].w, layout.buttons[2].h));
      }
      if (screen === SCREEN_SCENE_DONE) {
        const lines = ['', '', ''];
        const layout = overlayLayout(lines, 3);
        regions.push(buttonRect('next-scene', layout.buttons[0].x, layout.buttons[0].y, layout.buttons[0].w, layout.buttons[0].h));
        regions.push(buttonRect('replay-scene', layout.buttons[1].x, layout.buttons[1].y, layout.buttons[1].w, layout.buttons[1].h));
        regions.push(buttonRect('atlas', layout.buttons[2].x, layout.buttons[2].y, layout.buttons[2].w, layout.buttons[2].h));
      }
      if (screen === SCREEN_TIME_UP) {
        const layout = overlayLayout(['', ''], 3);
        regions.push(buttonRect('retry', layout.buttons[0].x, layout.buttons[0].y, layout.buttons[0].w, layout.buttons[0].h));
        regions.push(buttonRect('relaxed', layout.buttons[1].x, layout.buttons[1].y, layout.buttons[1].w, layout.buttons[1].h));
        regions.push(buttonRect('quit', layout.buttons[2].x, layout.buttons[2].y, layout.buttons[2].w, layout.buttons[2].h));
      }
      if (screen === SCREEN_CONFIRM_LEAVE) {
        const layout = overlayLayout(['', ''], 2);
        regions.push(buttonRect('stay', layout.buttons[0].x, layout.buttons[0].y, layout.buttons[0].w, layout.buttons[0].h));
        regions.push(buttonRect('leave', layout.buttons[1].x, layout.buttons[1].y, layout.buttons[1].w, layout.buttons[1].h));
      }
      return regions;
    }
    if (screen === SCREEN_TITLE) {
      regions.push(buttonRect('start', 48, 336, 280, 56));
      regions.push(buttonRect('atlas', 48, 404, 280, 44));
      for (let i = 0; i < MODE_ORDER.length; i += 1) {
        regions.push(buttonRect(`mode-${MODE_ORDER[i]}`, 48 + i * 142, 244, 130, 44));
      }
      for (let i = 0; i < SCENES.length; i += 1) {
        regions.push(buttonRect(`thumb-${i}`, 38 + i * 152, 556, 140, 98));
      }
      return regions;
    }
    if (screen === SCREEN_ATLAS) {
      for (let i = 0; i < SCENES.length; i += 1) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        regions.push(buttonRect(`card-${i}`, 42 + col * 305, 110 + row * 260, 280, 240));
      }
      regions.push(buttonRect('back', 42, 648, 160, 44));
      return regions;
    }
    if (screen === SCREEN_CAMPAIGN_DONE) {
      const layout = overlayLayout(['', '', '', '', '', ''], 3);
      regions.push(buttonRect('replay-campaign', layout.buttons[0].x, layout.buttons[0].y, layout.buttons[0].w, layout.buttons[0].h));
      regions.push(buttonRect('atlas', layout.buttons[1].x, layout.buttons[1].y, layout.buttons[1].w, layout.buttons[1].h));
      regions.push(buttonRect('title', layout.buttons[2].x, layout.buttons[2].y, layout.buttons[2].w, layout.buttons[2].h));
      return regions;
    }
    return regions;
  }

  /** Paint one frame for the given view. */
  function draw(viewData) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    const screen = viewData.screen;
    const state = viewData.world.state;
    if (screen === SCREEN_TITLE) {
      drawTitle(viewData);
      return;
    }
    if (screen === SCREEN_ATLAS) {
      drawAtlas(viewData);
      return;
    }
    if (screen === SCREEN_CAMPAIGN_DONE) {
      drawCampaignDone(viewData);
      return;
    }
    drawPlayFrame(viewData, screen === SCREEN_PAUSED);
    if (screen === SCREEN_PAUSED) {
      drawOverlay('Paused', ['The pictures are hidden while you rest.'], [
        { id: 'resume', label: 'Resume', accent: true },
        { id: 'restart', label: 'Restart Scene' },
        { id: 'quit', label: 'Quit to Title' },
      ]);
    } else if (screen === SCREEN_SCENE_DONE) {
      const scene = SCENES[state.sceneIndex];
      const last = state.sceneIndex + 1 >= SCENES.length;
      drawOverlay('Scene Complete!', [
        `${scene.name} — ${world.active().length} / ${world.active().length} found`,
        `Score: ${state.score}`,
        last ? 'That was the last world.' : `Next: ${SCENES[state.sceneIndex + 1].name}`,
      ], [
        { id: 'next-scene', label: last ? 'See Results' : 'Next Scene', accent: true },
        { id: 'replay-scene', label: 'Replay Scene' },
        { id: 'atlas', label: 'Atlas' },
      ]);
    } else if (screen === SCREEN_TIME_UP) {
      drawOverlay("Time's Up", [
        `${world.active().length - world.remaining()} of ${world.active().length} found in this scene.`,
        'The hunt does not have to end here.',
      ], [
        { id: 'retry', label: 'Retry Scene', accent: true },
        { id: 'relaxed', label: 'Continue Relaxed' },
        { id: 'quit', label: 'Quit to Title' },
      ]);
    } else if (screen === SCREEN_CONFIRM_LEAVE) {
      const target = SCENES[viewData.pendingScene ?? 0];
      drawOverlay('Leave this scene?', [
        `Jump to ${target.name}?`,
        'Your progress in this scene will reset.',
      ], [
        { id: 'stay', label: 'Stay Here', accent: true },
        { id: 'leave', label: 'Leave' },
      ]);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, toField, hitRegions };
}
