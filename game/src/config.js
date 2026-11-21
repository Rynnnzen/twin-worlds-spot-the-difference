// Every tuning number, colour and layout constant for Twin Worlds in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to fit
// the window, so no rule below depends on the screen size. Each picture panel is
// a 600x420 scene; scene art uses panel-local coordinates (0..600, 0..420).

export const FIELD = { width: 1280, height: 720 };

// The two picture panels.
export const PANEL = { width: 600, height: 420, y: 142, gap: 32, radius: 14 };
export const LEFT_PANEL = { x: 24, y: PANEL.y, width: PANEL.width, height: PANEL.height };
export const RIGHT_PANEL = { x: 656, y: PANEL.y, width: PANEL.width, height: PANEL.height };

// HUD geometry.
export const HUD = {
  topY: 16,
  counterX: 530,
  scoreX: 760,
  clockX: 1040,
  timerBar: { x: 24, y: 86, width: 1232, height: 10 },
  labelY: 112,
  controlsY: 580,
  controlsH: 44,
  stripY: 638,
  stripH: 36,
  helpY: 700,
};

// Buttons on the controls row (y = HUD.controlsY, height = HUD.controlsH).
export const BUTTONS = {
  hint: { x: 420, width: 156 },
  pause: { x: 588, width: 104 },
  lens: { x: 704, width: 132 },
  mode: { x: 848, width: 180 },
  atlas: { x: 1040, width: 216 },
};

// Scene strip: eight numbered buttons.
export const STRIP = { x: 30, width: 142, gap: 12 };

// Found markers: a ring around the found spot on both panels.
export const MARKER = { radius: 23, lineWidth: 3, popMs: 180, floatMs: 500 };

// The magnifier lens.
export const LENS = { diameter: 120, zoom: 2 };

// Game modes. Relaxed plays a 5-difference subset with no clock and no penalty.
export const MODES = {
  classic: { label: 'Classic', diffs: 8, seconds: 120, hints: 2, penaltySec: 5 },
  relaxed: { label: 'Relaxed', diffs: 5, seconds: 0, hints: 2, penaltySec: 0 },
  expert: { label: 'Expert', diffs: 8, seconds: 75, hints: 0, penaltySec: 5 },
};
export const MODE_ORDER = ['classic', 'relaxed', 'expert'];

export const HINT_COOLDOWN_SEC = 8;
export const HINT_SHOW_SEC = 1.5;
export const STREAK_WINDOW_SEC = 15;
export const SCORE_PER_FIND = 100;
export const MAX_MULTIPLIER = 4;

// Clicks within this radius (panel-local px) of a difference centre count as a hit.
export const HIT_RADIUS = 26;
export const HIT_RADIUS_MOVED = 32;

export const PALETTE = {
  backdrop: '#14161f',
  surface: '#1d2029',
  panel: '#232633',
  ivory: '#f5efdd',
  text: '#eef1f5',
  muted: '#9aa1b1',
  mint: '#7fe0b2',
  mintDeep: '#3fae7a',
  amber: '#f2b64c',
  coral: '#e5534b',
  gold: '#f2c94c',
  ring: '#fdf6d8',
  check: '#7fe0b2',
  button: '#2c3040',
  buttonHot: '#3a3f52',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where best campaign scores are kept between visits (this browser only). */
export const BEST_KEY = 'twin-worlds.best.v1';
