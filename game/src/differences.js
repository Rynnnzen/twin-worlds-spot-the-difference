// The 64 differences: eight per scene, one per region (A..H). Each difference
// names how the RIGHT panel changes from the left: remove a shape, recolour it,
// move it, resize it, flip it, add a new shape, or replace it with another.
// `hx, hy` is the hit centre in panel-local coordinates and `hr` the hit radius
// (moved features get a wider radius covering both positions). Relaxed mode
// plays the first five differences of each scene (regions A..E); the other three
// objects then match exactly on both panels.

import { MODES } from './config.js';

// Difference types:
//   remove  { obj }                    the shape is missing on the right
//   recolor { obj, color }             the shape has another fill on the right
//   move    { obj, dx, dy }            the shape sits elsewhere on the right
//   resize  { obj, scale }             the shape is scaled about its centre
//   flip    { obj }                    the shape is mirrored left-to-right
//   add     { shape }                  a shape only the right panel has
//   replace { obj, shape }             the right panel draws `shape` instead

export const DIFFERENCES = [
  [
    { id: 's0a', region: 'A', type: 'remove', obj: 'vane-finial', hx: 80, hy: 70, hr: 26 },
    { id: 's0b', region: 'B', type: 'recolor', obj: 'pennant-2', color: '#2a9d8f', hx: 250, hy: 68, hr: 26 },
    { id: 's0c', region: 'C', type: 'flip', obj: 'crescent-orn', hx: 490, hy: 76, hr: 26 },
    { id: 's0d', region: 'D', type: 'remove', obj: 'cup-handle', hx: 168, hy: 193, hr: 26 },
    { id: 's0e', region: 'E', type: 'move', obj: 'latch', dx: 0, dy: 12, hx: 420, hy: 202, hr: 32 },
    { id: 's0f', region: 'F', type: 'add', shape: { k: 'ellipse', x: 100, y: 332, rx: 8, ry: 4, c: '#5f9e6e' }, hx: 100, hy: 332, hr: 26 },
    { id: 's0g', region: 'G', type: 'resize', obj: 'pastry-mid', scale: 1.4, hx: 290, hy: 338, hr: 26 },
    { id: 's0h', region: 'H', type: 'remove', obj: 'cloth-stripe', hx: 515, hy: 359, hr: 26 },
  ],
  [
    { id: 's1a', region: 'A', type: 'remove', obj: 'roof-crossbar', hx: 85, hy: 80, hr: 26 },
    { id: 's1b', region: 'B', type: 'recolor', obj: 'hanging-pot', color: '#b39ddb', hx: 250, hy: 63, hr: 26 },
    { id: 's1c', region: 'C', type: 'flip', obj: 'vine-curl', hx: 490, hy: 82, hr: 26 },
    { id: 's1d', region: 'D', type: 'add', shape: { k: 'half', x: 205, y: 258, r: 9, c: '#e2725b' }, hx: 205, hy: 250, hr: 26 },
    { id: 's1e', region: 'E', type: 'remove', obj: 'split-leaf', hx: 420, hy: 192, hr: 26 },
    { id: 's1f', region: 'F', type: 'move', obj: 'snail-spot', dx: 12, dy: 0, hx: 72, hy: 348, hr: 32 },
    { id: 's1g', region: 'G', type: 'resize', obj: 'packet-label', scale: 1.83, hx: 285, hy: 340, hr: 26 },
    { id: 's1h', region: 'H', type: 'remove', obj: 'wheel-spoke', hx: 515, hy: 340, hr: 26 },
  ],
  [
    { id: 's2a', region: 'A', type: 'remove', obj: 'antenna-notch', hx: 80, hy: 84, hr: 26 },
    { id: 's2b', region: 'B', type: 'flip', obj: 'gauge-arrow', hx: 250, hy: 57, hr: 26 },
    { id: 's2c', region: 'C', type: 'recolor', obj: 'windsock-seg', color: '#ffb08a', hx: 497, hy: 76, hr: 26 },
    { id: 's2d', region: 'D', type: 'add', shape: { k: 'circle', x: 168, y: 200, r: 4, c: '#fdf6e3' }, hx: 168, hy: 200, hr: 26 },
    { id: 's2e', region: 'E', type: 'resize', obj: 'prop-blade', scale: 0.8, hx: 420, hy: 230, hr: 26 },
    { id: 's2f', region: 'F', type: 'remove', obj: 'satchel-patch', hx: 70, hy: 340, hr: 26 },
    { id: 's2g', region: 'G', type: 'move', obj: 'wrench', dx: 14, dy: 0, hx: 296, hy: 321, hr: 32 },
    { id: 's2h', region: 'H', type: 'remove', obj: 'ladder-rung', hx: 516, hy: 346, hr: 26 },
  ],
  [
    { id: 's3a', region: 'A', type: 'remove', obj: 'cap-spot', hx: 80, hy: 70, hr: 26 },
    { id: 's3b', region: 'B', type: 'flip', obj: 'arch-emblem', hx: 250, hy: 66, hr: 26 },
    { id: 's3c', region: 'C', type: 'recolor', obj: 'parcel-tag', color: '#7fe0b2', hx: 490, hy: 74, hr: 26 },
    { id: 's3d', region: 'D', type: 'remove', obj: 'mailbox-flag', hx: 190, hy: 182, hr: 26 },
    { id: 's3e', region: 'E', type: 'move', obj: 'drawer-pull', dx: 14, dy: 0, hx: 427, hy: 193, hr: 32 },
    { id: 's3f', region: 'F', type: 'add', shape: { k: 'rrect', x: 81, y: 318, w: 10, h: 12, r: 1, c: '#e2725b' }, hx: 86, hy: 324, hr: 26 },
    { id: 's3g', region: 'G', type: 'resize', obj: 'spool-hole', scale: 2, hx: 285, hy: 340, hr: 26 },
    { id: 's3h', region: 'H', type: 'remove', obj: 'parcel-band', hx: 504, hy: 345, hr: 26 },
  ],
  [
    { id: 's4a', region: 'A', type: 'remove', obj: 'roof-mark', hx: 80, hy: 104, hr: 26 },
    { id: 's4b', region: 'B', type: 'flip', obj: 'fish-charm', hx: 254, hy: 66, hr: 26 },
    { id: 's4c', region: 'C', type: 'recolor', obj: 'parasol-patch', color: '#d9a05b', hx: 490, hy: 100, hr: 26 },
    { id: 's4d', region: 'D', type: 'remove', obj: 'teapot-knob', hx: 155, hy: 188, hr: 26 },
    { id: 's4e', region: 'E', type: 'add', shape: { k: 'circle', x: 432, y: 200, r: 4, c: '#c96f6f' }, hx: 432, hy: 200, hr: 26 },
    { id: 's4f', region: 'F', type: 'move', obj: 'crab-mark', dx: -12, dy: 0, hx: 60, hy: 344, hr: 32 },
    { id: 's4g', region: 'G', type: 'resize', obj: 'stone-inset', scale: 1.75, hx: 285, hy: 340, hr: 26 },
    { id: 's4h', region: 'H', type: 'remove', obj: 'towel-stripe', hx: 515, hy: 347, hr: 26 },
  ],
  [
    { id: 's5a', region: 'A', type: 'remove', obj: 'gear-tooth', hx: 80, hy: 43, hr: 26 },
    { id: 's5b', region: 'B', type: 'replace', obj: 'minute-hand', shape: { k: 'line', x1: 250, y1: 65, x2: 268, y2: 50, w: 3, c: '#232347' }, hx: 259, hy: 57, hr: 26 },
    { id: 's5c', region: 'C', type: 'recolor', obj: 'bird-ribbon', color: '#2a9d8f', hx: 487, hy: 62, hr: 26 },
    { id: 's5d', region: 'D', type: 'flip', obj: 'display-key', hx: 154, hy: 246, hr: 26 },
    { id: 's5e', region: 'E', type: 'remove', obj: 'pendulum-bead', hx: 426, hy: 258, hr: 26 },
    { id: 's5f', region: 'F', type: 'add', shape: { k: 'circle', x: 30, y: 360, r: 4, c: '#f2c94c' }, hx: 30, hy: 360, hr: 26 },
    { id: 's5g', region: 'G', type: 'resize', obj: 'winding-knob', scale: 1.7, hx: 285, hy: 340, hr: 26 },
    { id: 's5h', region: 'H', type: 'remove', obj: 'border-diamond', hx: 516, hy: 320, hr: 26 },
  ],
  [
    { id: 's6a', region: 'A', type: 'remove', obj: 'frost-branch', hx: 70, hy: 70, hr: 26 },
    { id: 's6b', region: 'B', type: 'flip', obj: 'emblem-stroke', hx: 251, hy: 59, hr: 26 },
    { id: 's6c', region: 'C', type: 'recolor', obj: 'radio-knob', color: '#e5534b', hx: 528, hy: 96, hr: 26 },
    { id: 's6d', region: 'D', type: 'remove', obj: 'grille-slot', hx: 155, hy: 224, hr: 26 },
    { id: 's6e', region: 'E', type: 'move', obj: 'steam-curl', dx: 12, dy: 0, hx: 438, hy: 160, hr: 32 },
    { id: 's6f', region: 'F', type: 'add', shape: { k: 'circle', x: 66, y: 360, r: 8, c: '#f2c94c' }, hx: 66, hy: 360, hr: 26 },
    { id: 's6g', region: 'G', type: 'resize', obj: 'tin-badge', scale: 1.7, hx: 286, hy: 340, hr: 26 },
    { id: 's6h', region: 'H', type: 'remove', obj: 'thermos-stripe', hx: 515, hy: 349, hr: 26 },
  ],
  [
    { id: 's7a', region: 'A', type: 'remove', obj: 'dish-dot', hx: 80, hy: 78, hr: 26 },
    { id: 's7b', region: 'B', type: 'flip', obj: 'constellation-hook', hx: 250, hy: 70, hr: 26 },
    { id: 's7c', region: 'C', type: 'recolor', obj: 'jar-stopper', color: '#2ec4b6', hx: 466, hy: 52, hr: 26 },
    { id: 's7d', region: 'D', type: 'remove', obj: 'leaf-vein', hx: 155, hy: 205, hr: 26 },
    { id: 's7e', region: 'E', type: 'move', obj: 'cabinet-label', dx: 0, dy: 14, hx: 423, hy: 193, hr: 32 },
    { id: 's7f', region: 'F', type: 'add', shape: { k: 'ring', x: 70, y: 352, r: 12, w: 3, c: '#f2c94c' }, hx: 70, hy: 352, hr: 26 },
    { id: 's7g', region: 'G', type: 'resize', obj: 'telescope-knob', scale: 1.7, hx: 285, hy: 340, hr: 26 },
    { id: 's7h', region: 'H', type: 'remove', obj: 'mosaic-seg', hx: 516, hy: 396, hr: 26 },
  ],
];

/** All eight differences of one scene. */
export function differencesFor(sceneIndex) {
  return DIFFERENCES[sceneIndex] ?? [];
}

/** The differences active in a mode: the first N of the scene, in region order. */
export function activeDifferences(sceneIndex, mode) {
  const count = MODES[mode]?.diffs ?? 8;
  return differencesFor(sceneIndex).slice(0, count);
}

/** One difference by its id, or undefined. */
export function differenceById(sceneIndex, id) {
  return differencesFor(sceneIndex).find((d) => d.id === id);
}
