// The eight scenes of Twin Worlds: each one is a flat-vector paper-cut picture
// in panel-local coordinates (0..600 wide, 0..420 high), drawn back to front from
// a list of simple shapes. Objects that a difference touches carry an `id`;
// differences.js refers to those ids. `sprinkle` adds seeded texture (stars,
// pebbles, leaves) drawn identically on both panels from the scene's own seed,
// so the two pictures can only differ where a difference says so.
//
// Shape kinds (drawn by art.js):
//   grad   { x, y, w, h, c1, c2 }            vertical gradient rectangle
//   rect   { x, y, w, h, c }                 filled rectangle (x, y = top-left)
//   rrect  { x, y, w, h, r, c }              rounded rectangle
//   circle { x, y, r, c }                    filled circle (x, y = centre)
//   ellipse{ x, y, rx, ry, c }               filled ellipse
//   tri    { p: [x1,y1,x2,y2,x3,y3], c }     filled triangle
//   poly   { p: [x1,y1,...], c }             filled polygon
//   line   { x1, y1, x2, y2, w, c }          stroked line
//   ring   { x, y, r, w, c }                 stroked circle
//   arc    { x, y, r, a0, a1, w, c }         stroked arc (radians)
//   half   { x, y, r, c }                    filled dome (x, y = centre of base)
//   star   { x, y, r, c }                    four-point sparkle
// Any shape may carry `a` (opacity 0..1) and `id` (difference target).

export const SCENES = [
  {
    id: 0,
    name: 'Apricot Rooftop Breakfast',
    tag: 'Sunrise over terracotta rooftops',
    seed: 11,
    sky: { c1: '#ffab5e', c2: '#ffe3b3' },
    sprinkle: { kind: 'birds', count: 5, area: [30, 20, 560, 90], c: '#8a5a3b' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#ffab5e', c2: '#ffe3b3' },
      { k: 'circle', x: 505, y: 62, r: 46, c: '#ffd97a', a: 0.55 },
      { k: 'circle', x: 505, y: 62, r: 30, c: '#ffdf8a' },
      { k: 'ellipse', x: 140, y: 52, rx: 52, ry: 18, c: '#fff3da', a: 0.9 },
      { k: 'ellipse', x: 330, y: 38, rx: 44, ry: 15, c: '#fff3da', a: 0.9 },
      { k: 'ellipse', x: 120, y: 120, rx: 60, ry: 16, c: '#ffd9a8', a: 0.8 },
      // Distant rooftops.
      { k: 'rect', x: 0, y: 210, w: 120, h: 90, c: '#d98d5f' },
      { k: 'tri', p: [0, 210, 60, 170, 120, 210], c: '#b35f3d' },
      { k: 'rect', x: 480, y: 200, w: 120, h: 100, c: '#d98d5f' },
      { k: 'tri', p: [480, 200, 540, 162, 600, 200], c: '#b35f3d' },
      // Main houses.
      { k: 'rect', x: 30, y: 230, w: 150, h: 140, c: '#f7e3c3' },
      { k: 'tri', p: [22, 232, 105, 178, 188, 232], c: '#c96f45' },
      { k: 'rect', x: 220, y: 220, w: 160, h: 150, c: '#f2d9b0' },
      { k: 'tri', p: [212, 222, 300, 166, 388, 222], c: '#c96f45' },
      { k: 'rect', x: 420, y: 235, w: 150, h: 135, c: '#f7e3c3' },
      { k: 'tri', p: [412, 237, 495, 182, 578, 237], c: '#c96f45' },
      // Weather vane on the left roof (A).
      { k: 'line', x1: 80, y1: 100, x2: 80, y2: 178, w: 3, c: '#6b4a35' },
      { k: 'tri', p: [62, 108, 98, 108, 80, 96], c: '#6b4a35' },
      { k: 'circle', x: 80, y: 70, r: 7, c: '#f2c94c', id: 'vane-finial' },
      // Pennant string with a crescent ornament (B, C).
      { k: 'line', x1: 150, y1: 58, x2: 560, y2: 58, w: 2, c: '#8a5a3b' },
      { k: 'tri', p: [190, 58, 210, 58, 200, 78], c: '#e2725b' },
      { k: 'tri', p: [238, 58, 262, 58, 250, 80], c: '#e2725b', id: 'pennant-2' },
      { k: 'tri', p: [292, 58, 312, 58, 302, 77], c: '#f2c94c' },
      { k: 'tri', p: [348, 58, 368, 58, 358, 79], c: '#e2725b' },
      { k: 'tri', p: [404, 58, 424, 58, 414, 77], c: '#f2c94c' },
      { k: 'arc', x: 490, y: 76, r: 13, a0: 0.6, a1: 4.4, w: 5, c: '#f2c94c', id: 'crescent-orn' },
      // Windows, doors, awnings.
      { k: 'rect', x: 60, y: 260, w: 34, h: 44, c: '#7fb3c8' },
      { k: 'rect', x: 120, y: 260, w: 34, h: 44, c: '#7fb3c8' },
      { k: 'rect', x: 250, y: 252, w: 36, h: 46, c: '#7fb3c8' },
      { k: 'rect', x: 310, y: 252, w: 36, h: 46, c: '#7fb3c8' },
      { k: 'rect', x: 450, y: 262, w: 34, h: 44, c: '#7fb3c8' },
      { k: 'rect', x: 510, y: 262, w: 34, h: 44, c: '#7fb3c8' },
      { k: 'rect', x: 100, y: 315, w: 40, h: 55, c: '#a05a3c' },
      { k: 'rect', x: 285, y: 310, w: 40, h: 60, c: '#a05a3c' },
      // Balcony with a breakfast cup (D).
      { k: 'rect', x: 128, y: 205, w: 58, h: 8, c: '#a05a3c' },
      { k: 'rect', x: 132, y: 178, w: 8, h: 28, c: '#a05a3c' },
      { k: 'rect', x: 174, y: 178, w: 8, h: 28, c: '#a05a3c' },
      { k: 'rrect', x: 146, y: 182, w: 20, h: 22, r: 3, c: '#fff6e6', id: 'cup' },
      { k: 'arc', x: 168, y: 193, r: 7, a0: -1.2, a1: 1.2, w: 3, c: '#fff6e6', id: 'cup-handle' },
      // Window latch (E).
      { k: 'rect', x: 415, y: 188, w: 10, h: 16, c: '#6b4a35', id: 'latch' },
      // Foreground terrace.
      { k: 'rect', x: 0, y: 372, w: 600, h: 48, c: '#c98d5e' },
      { k: 'rect', x: 0, y: 372, w: 600, h: 6, c: '#a96f45' },
      // Planter (F).
      { k: 'rrect', x: 48, y: 340, w: 44, h: 32, r: 4, c: '#b35f3d' },
      { k: 'circle', x: 62, y: 330, r: 12, c: '#5f9e6e' },
      { k: 'circle', x: 80, y: 326, r: 10, c: '#6fae7d' },
      // Breakfast table with pastries (G).
      { k: 'rect', x: 230, y: 348, w: 130, h: 10, c: '#8a5a3b' },
      { k: 'rect', x: 244, y: 358, w: 10, h: 40, c: '#8a5a3b' },
      { k: 'rect', x: 336, y: 358, w: 10, h: 40, c: '#8a5a3b' },
      { k: 'ellipse', x: 262, y: 340, rx: 13, ry: 9, c: '#e8b06a' },
      { k: 'ellipse', x: 290, y: 338, rx: 12, ry: 9, c: '#e8b06a', id: 'pastry-mid' },
      { k: 'ellipse', x: 318, y: 340, rx: 13, ry: 9, c: '#e8b06a' },
      { k: 'circle', x: 290, y: 334, r: 3, c: '#a05a3c' },
      // Folded picnic cloth (H).
      { k: 'rrect', x: 478, y: 332, w: 74, h: 40, r: 6, c: '#fdf6e3' },
      { k: 'rect', x: 478, y: 342, w: 74, h: 6, c: '#e2725b' },
      { k: 'rect', x: 478, y: 356, w: 74, h: 6, c: '#e2725b', id: 'cloth-stripe' },
    ],
  },
  {
    id: 1,
    name: 'Glasshouse After Rain',
    tag: 'Mint foliage under fogged glass',
    seed: 23,
    sky: { c1: '#bfe3cf', c2: '#eef7ec' },
    sprinkle: { kind: 'droplets', count: 14, area: [20, 20, 560, 200], c: '#a8d4e6' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#bfe3cf', c2: '#eef7ec' },
      { k: 'ellipse', x: 300, y: 40, rx: 90, ry: 26, c: '#ffffff', a: 0.55 },
      // Glasshouse frame.
      { k: 'line', x1: 40, y1: 30, x2: 40, y2: 380, w: 6, c: '#7a9a8a' },
      { k: 'line', x1: 560, y1: 30, x2: 560, y2: 380, w: 6, c: '#7a9a8a' },
      { k: 'line', x1: 40, y1: 30, x2: 560, y2: 30, w: 6, c: '#7a9a8a' },
      { k: 'line', x1: 40, y1: 130, x2: 560, y2: 130, w: 4, c: '#7a9a8a' },
      { k: 'line', x1: 300, y1: 30, x2: 300, y2: 130, w: 4, c: '#7a9a8a' },
      { k: 'line', x1: 60, y1: 80, x2: 110, y2: 80, w: 4, c: '#7a9a8a', id: 'roof-crossbar' },
      { k: 'line', x1: 490, y1: 80, x2: 540, y2: 80, w: 4, c: '#7a9a8a' },
      // Hanging pots (B).
      { k: 'line', x1: 200, y1: 30, x2: 200, y2: 52, w: 2, c: '#7a9a8a' },
      { k: 'rrect', x: 184, y: 52, w: 32, h: 22, r: 4, c: '#c98d5e' },
      { k: 'circle', x: 192, y: 48, r: 8, c: '#5f9e6e' },
      { k: 'circle', x: 208, y: 46, r: 7, c: '#6fae7d' },
      { k: 'line', x1: 250, y1: 30, x2: 250, y2: 52, w: 2, c: '#7a9a8a' },
      { k: 'rrect', x: 234, y: 52, w: 32, h: 22, r: 4, c: '#c98d5e', id: 'hanging-pot' },
      { k: 'circle', x: 242, y: 48, r: 8, c: '#5f9e6e' },
      { k: 'circle', x: 258, y: 46, r: 7, c: '#6fae7d' },
      // Vine with a curl (C).
      { k: 'line', x1: 470, y1: 30, x2: 470, y2: 90, w: 3, c: '#4e8a5f' },
      { k: 'arc', x: 490, y: 82, r: 12, a0: 2.4, a1: 5.6, w: 3, c: '#4e8a5f', id: 'vine-curl' },
      { k: 'ellipse', x: 462, y: 60, rx: 9, ry: 5, c: '#5f9e6e' },
      { k: 'ellipse', x: 478, y: 48, rx: 9, ry: 5, c: '#6fae7d' },
      // Workbench and watering can (D).
      { k: 'rect', x: 90, y: 260, w: 180, h: 12, c: '#8a6a4a' },
      { k: 'rect', x: 104, y: 272, w: 10, h: 100, c: '#8a6a4a' },
      { k: 'rect', x: 246, y: 272, w: 10, h: 100, c: '#8a6a4a' },
      { k: 'rrect', x: 130, y: 216, w: 44, h: 44, r: 8, c: '#7fb3c8', id: 'watering-can' },
      { k: 'tri', p: [174, 228, 196, 218, 174, 244], c: '#7fb3c8' },
      { k: 'arc', x: 152, y: 212, r: 10, a0: 3.4, a1: 6.0, w: 4, c: '#5d93a8' },
      // Split-leaf plant (E).
      { k: 'rrect', x: 400, y: 300, w: 54, h: 40, r: 5, c: '#b35f3d' },
      { k: 'line', x1: 427, y1: 300, x2: 427, y2: 210, w: 4, c: '#4e8a5f' },
      { k: 'ellipse', x: 402, y: 220, rx: 22, ry: 10, c: '#3f7d52' },
      { k: 'ellipse', x: 452, y: 216, rx: 22, ry: 10, c: '#3f7d52' },
      { k: 'ellipse', x: 408, y: 250, rx: 20, ry: 9, c: '#4e8a5f' },
      { k: 'ellipse', x: 420, y: 192, rx: 20, ry: 9, c: '#4e8a5f', id: 'split-leaf' },
      { k: 'ellipse', x: 448, y: 252, rx: 20, ry: 9, c: '#5f9e6e' },
      // Floor, snail (F), seed packet (G), trolley (H).
      { k: 'rect', x: 0, y: 372, w: 600, h: 48, c: '#a8c8a0' },
      { k: 'circle', x: 70, y: 352, r: 14, c: '#d9a05b', id: 'snail' },
      { k: 'circle', x: 66, y: 348, r: 4, c: '#8a5a3b', id: 'snail-spot' },
      { k: 'ellipse', x: 88, y: 360, rx: 12, ry: 6, c: '#e8c98a' },
      { k: 'rrect', x: 262, y: 322, w: 46, h: 50, r: 4, c: '#fdf6e3', id: 'seed-packet' },
      { k: 'circle', x: 285, y: 340, r: 6, c: '#e2725b', id: 'packet-label' },
      { k: 'line', x1: 272, y1: 358, x2: 298, y2: 358, w: 2, c: '#9aa1b1' },
      { k: 'rect', x: 480, y: 318, w: 80, h: 10, c: '#8a6a4a' },
      { k: 'rect', x: 492, y: 288, w: 10, h: 30, c: '#8a6a4a' },
      { k: 'rect', x: 538, y: 288, w: 10, h: 30, c: '#8a6a4a' },
      { k: 'circle', x: 515, y: 340, r: 20, c: '#6b4a35', id: 'trolley-wheel' },
      { k: 'circle', x: 515, y: 340, r: 12, c: '#a8c8a0' },
      { k: 'line', x1: 515, y1: 328, x2: 515, y2: 352, w: 3, c: '#6b4a35', id: 'wheel-spoke' },
      { k: 'line', x1: 503, y1: 340, x2: 527, y2: 340, w: 3, c: '#6b4a35' },
    ],
  },
  {
    id: 2,
    name: 'Cloudtail Repair Depot',
    tag: 'A breezy sky platform of brass and canvas',
    seed: 37,
    sky: { c1: '#8fc3e8', c2: '#e8f4fc' },
    sprinkle: { kind: 'clouds', count: 4, area: [20, 20, 560, 100], c: '#ffffff' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#8fc3e8', c2: '#e8f4fc' },
      { k: 'ellipse', x: 120, y: 48, rx: 60, ry: 18, c: '#ffffff', a: 0.9 },
      { k: 'ellipse', x: 420, y: 36, rx: 70, ry: 20, c: '#ffffff', a: 0.9 },
      // Antenna (A).
      { k: 'line', x1: 80, y1: 90, x2: 80, y2: 220, w: 4, c: '#8a6a4a' },
      { k: 'line', x1: 66, y1: 104, x2: 94, y2: 104, w: 4, c: '#8a6a4a' },
      { k: 'line', x1: 70, y1: 84, x2: 90, y2: 84, w: 4, c: '#8a6a4a', id: 'antenna-notch' },
      { k: 'circle', x: 80, y: 70, r: 6, c: '#e5534b' },
      // Weather gauge with arrow (B).
      { k: 'circle', x: 250, y: 65, r: 26, c: '#fdf6e3' },
      { k: 'ring', x: 250, y: 65, r: 26, w: 4, c: '#b08d4f' },
      { k: 'tri', p: [250, 48, 258, 62, 242, 62], c: '#e5534b', id: 'gauge-arrow' },
      { k: 'circle', x: 250, y: 65, r: 4, c: '#6b4a35' },
      // Windsock (C).
      { k: 'line', x1: 470, y1: 40, x2: 470, y2: 130, w: 4, c: '#8a6a4a' },
      { k: 'poly', p: [470, 58, 522, 66, 522, 86, 470, 92], c: '#e2725b' },
      { k: 'poly', p: [488, 62, 506, 64, 506, 89, 488, 89], c: '#fdf6e3', id: 'windsock-seg' },
      // Platform and hangar.
      { k: 'rect', x: 0, y: 300, w: 600, h: 120, c: '#b08d4f' },
      { k: 'rect', x: 0, y: 300, w: 600, h: 10, c: '#8a6a4a' },
      { k: 'rect', x: 200, y: 170, w: 220, h: 130, c: '#d9c08a' },
      { k: 'tri', p: [190, 172, 310, 120, 430, 172], c: '#a05a3c' },
      { k: 'rect', x: 280, y: 220, w: 60, h: 80, c: '#6b4a35' },
      // Tool cabinet with a bolt to add (D).
      { k: 'rrect', x: 120, y: 180, w: 64, h: 120, r: 6, c: '#7fb3c8', id: 'tool-cabinet' },
      { k: 'line', x1: 152, y1: 180, x2: 152, y2: 300, w: 2, c: '#5d93a8' },
      { k: 'circle', x: 144, y: 240, r: 4, c: '#fdf6e3' },
      { k: 'circle', x: 160, y: 240, r: 4, c: '#fdf6e3' },
      // Propeller (E).
      { k: 'circle', x: 420, y: 195, r: 10, c: '#6b4a35' },
      { k: 'ellipse', x: 420, y: 160, rx: 8, ry: 30, c: '#c9a86a' },
      { k: 'ellipse', x: 420, y: 230, rx: 8, ry: 30, c: '#c9a86a', id: 'prop-blade' },
      { k: 'ellipse', x: 385, y: 195, rx: 30, ry: 8, c: '#c9a86a' },
      { k: 'ellipse', x: 455, y: 195, rx: 30, ry: 8, c: '#c9a86a' },
      // Workbench with wrench (G) and satchel (F).
      { k: 'rect', x: 230, y: 330, w: 150, h: 10, c: '#8a6a4a' },
      { k: 'rect', x: 244, y: 340, w: 10, h: 50, c: '#8a6a4a' },
      { k: 'rect', x: 356, y: 340, w: 10, h: 50, c: '#8a6a4a' },
      { k: 'rrect', x: 272, y: 312, w: 34, h: 18, r: 4, c: '#9aa1b1', id: 'wrench' },
      { k: 'circle', x: 306, y: 321, r: 7, c: '#9aa1b1' },
      { k: 'rrect', x: 44, y: 322, w: 52, h: 42, r: 8, c: '#a05a3c', id: 'satchel' },
      { k: 'rrect', x: 58, y: 332, w: 24, h: 16, r: 3, c: '#e8c98a', id: 'satchel-patch' },
      { k: 'line', x1: 44, y1: 322, x2: 70, y2: 306, w: 4, c: '#6b4a35' },
      // Service ladder (H).
      { k: 'line', x1: 500, y1: 300, x2: 500, y2: 392, w: 5, c: '#8a6a4a' },
      { k: 'line', x1: 532, y1: 300, x2: 532, y2: 392, w: 5, c: '#8a6a4a' },
      { k: 'line', x1: 500, y1: 322, x2: 532, y2: 322, w: 4, c: '#8a6a4a' },
      { k: 'line', x1: 500, y1: 346, x2: 532, y2: 346, w: 4, c: '#8a6a4a', id: 'ladder-rung' },
      { k: 'line', x1: 500, y1: 370, x2: 532, y2: 370, w: 4, c: '#8a6a4a' },
      // Crates and barrel.
      { k: 'rrect', x: 120, y: 322, w: 44, h: 44, r: 4, c: '#c9a86a' },
      { k: 'line', x1: 120, y1: 322, x2: 164, y2: 366, w: 2, c: '#8a6a4a' },
      { k: 'rrect', x: 440, y: 330, w: 36, h: 48, r: 6, c: '#7fb3c8' },
    ],
  },
  {
    id: 3,
    name: 'Mushroom Mailroom',
    tag: 'An underground post office of glowing fungi',
    seed: 53,
    sky: { c1: '#232347', c2: '#3b3b6e' },
    sprinkle: { kind: 'spores', count: 16, area: [20, 20, 560, 380], c: '#a8f0c8' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#232347', c2: '#3b3b6e' },
      // Cave wall and arch.
      { k: 'ellipse', x: 300, y: 430, rx: 340, ry: 180, c: '#2e2e55' },
      { k: 'arc', x: 300, y: 210, r: 150, a0: 3.14159, a1: 6.28318, w: 10, c: '#4a4a7d' },
      // Great mushroom canopy (A).
      { k: 'half', x: 80, y: 120, r: 64, c: '#e2725b' },
      { k: 'rect', x: 70, y: 120, w: 20, h: 60, c: '#f7e3c3' },
      { k: 'circle', x: 60, y: 78, r: 9, c: '#fdf6e3' },
      { k: 'circle', x: 80, y: 70, r: 7, c: '#fdf6e3', id: 'cap-spot' },
      { k: 'circle', x: 102, y: 84, r: 8, c: '#fdf6e3' },
      { k: 'circle', x: 48, y: 100, r: 6, c: '#fdf6e3' },
      { k: 'circle', x: 112, y: 104, r: 5, c: '#fdf6e3' },
      // Sorting arch with crescent emblem (B).
      { k: 'rect', x: 200, y: 120, w: 200, h: 150, c: '#4a4a7d' },
      { k: 'half', x: 300, y: 122, r: 100, c: '#4a4a7d' },
      { k: 'arc', x: 250, y: 66, r: 12, a0: 0.6, a1: 4.4, w: 5, c: '#f2c94c', id: 'arch-emblem' },
      { k: 'rrect', x: 224, y: 150, w: 46, h: 56, r: 4, c: '#f2b64c' },
      { k: 'rrect', x: 278, y: 150, w: 46, h: 56, r: 4, c: '#f2b64c' },
      { k: 'rrect', x: 332, y: 150, w: 46, h: 56, r: 4, c: '#f2b64c' },
      { k: 'rrect', x: 224, y: 216, w: 46, h: 40, r: 4, c: '#8a6a4a' },
      { k: 'rrect', x: 278, y: 216, w: 46, h: 40, r: 4, c: '#8a6a4a' },
      { k: 'rrect', x: 332, y: 216, w: 46, h: 40, r: 4, c: '#8a6a4a' },
      // Hanging parcel tag (C).
      { k: 'line', x1: 490, y1: 30, x2: 490, y2: 58, w: 2, c: '#f7e3c3' },
      { k: 'rrect', x: 478, y: 58, w: 24, h: 32, r: 3, c: '#f2b64c', id: 'parcel-tag' },
      { k: 'circle', x: 490, y: 66, r: 3, c: '#232347' },
      // Brass mailbox with flag (D).
      { k: 'rrect', x: 128, y: 180, w: 54, h: 64, r: 8, c: '#c9a86a', id: 'mailbox' },
      { k: 'half', x: 155, y: 182, r: 27, c: '#c9a86a' },
      { k: 'line', x1: 182, y1: 196, x2: 182, y2: 176, w: 3, c: '#8a6a4a' },
      { k: 'tri', p: [182, 176, 198, 182, 182, 188], c: '#e5534b', id: 'mailbox-flag' },
      { k: 'rect', x: 148, y: 244, w: 14, h: 40, c: '#8a6a4a' },
      // Drawer cabinet with pull (E).
      { k: 'rrect', x: 400, y: 170, w: 90, h: 110, r: 6, c: '#6b4a35', id: 'drawer-cabinet' },
      { k: 'rect', x: 408, y: 180, w: 74, h: 26, c: '#8a6a4a' },
      { k: 'rect', x: 408, y: 214, w: 74, h: 26, c: '#8a6a4a' },
      { k: 'rect', x: 408, y: 248, w: 74, h: 24, c: '#8a6a4a' },
      { k: 'circle', x: 420, y: 193, r: 6, c: '#f2c94c', id: 'drawer-pull' },
      { k: 'circle', x: 445, y: 227, r: 6, c: '#f2c94c' },
      { k: 'circle', x: 445, y: 260, r: 6, c: '#f2c94c' },
      // Root staircase.
      { k: 'line', x1: 520, y1: 300, x2: 580, y2: 150, w: 8, c: '#5d4a7d' },
      { k: 'line', x1: 512, y1: 280, x2: 540, y2: 280, w: 6, c: '#5d4a7d' },
      { k: 'line', x1: 528, y1: 240, x2: 556, y2: 240, w: 6, c: '#5d4a7d' },
      { k: 'line', x1: 544, y1: 200, x2: 572, y2: 200, w: 6, c: '#5d4a7d' },
      // Floor, stool with envelope (F), spool (G), parcels (H).
      { k: 'rect', x: 0, y: 372, w: 600, h: 48, c: '#1d1d38' },
      { k: 'rect', x: 48, y: 330, w: 44, h: 42, c: '#8a6a4a', id: 'stool' },
      { k: 'rrect', x: 42, y: 318, w: 56, h: 14, r: 3, c: '#fdf6e3', id: 'envelope' },
      { k: 'line', x1: 42, y1: 318, x2: 70, y2: 330, w: 1, c: '#c9b896' },
      { k: 'line', x1: 98, y1: 318, x2: 70, y2: 330, w: 1, c: '#c9b896' },
      { k: 'circle', x: 285, y: 340, r: 22, c: '#c9a86a', id: 'spool' },
      { k: 'circle', x: 285, y: 340, r: 5, c: '#232347', id: 'spool-hole' },
      { k: 'line', x1: 263, y1: 340, x2: 307, y2: 340, w: 2, c: '#8a6a4a' },
      { k: 'rrect', x: 470, y: 318, w: 70, h: 54, r: 5, c: '#b08d4f', id: 'parcel' },
      { k: 'rect', x: 500, y: 318, w: 8, h: 54, c: '#e2725b', id: 'parcel-band' },
      { k: 'rect', x: 470, y: 340, w: 70, h: 8, c: '#e2725b' },
      // Small glowing mushrooms.
      { k: 'half', x: 180, y: 372, r: 18, c: '#7fe0b2' },
      { k: 'rect', x: 174, y: 372, w: 12, h: 14, c: '#f7e3c3' },
      { k: 'half', x: 360, y: 372, r: 14, c: '#7fe0b2' },
      { k: 'rect', x: 355, y: 372, w: 10, h: 12, c: '#f7e3c3' },
      { k: 'half', x: 430, y: 372, r: 20, c: '#a8f0c8' },
      { k: 'rect', x: 423, y: 372, w: 14, h: 16, c: '#f7e3c3' },
    ],
  },
  {
    id: 4,
    name: 'Tidepool Tea Pavilion',
    tag: 'Jade shallows and pink stone at golden hour',
    seed: 67,
    sky: { c1: '#ffd9a0', c2: '#cfeee0' },
    sprinkle: { kind: 'ripples', count: 8, area: [20, 250, 560, 120], c: '#ffffff' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#ffd9a0', c2: '#cfeee0' },
      { k: 'circle', x: 520, y: 60, r: 28, c: '#ffdf8a' },
      { k: 'ellipse', x: 150, y: 50, rx: 60, ry: 16, c: '#fff3da', a: 0.9 },
      // Pavilion roof with carved tile mark (A).
      { k: 'rect', x: 40, y: 130, w: 220, h: 130, c: '#f2c9c0' },
      { k: 'tri', p: [28, 132, 150, 66, 272, 132], c: '#c96f6f' },
      { k: 'line', x1: 80, y1: 96, x2: 80, y2: 112, w: 3, c: '#8a4a4a', id: 'roof-mark' },
      { k: 'circle', x: 150, y: 60, r: 8, c: '#f2c94c' },
      { k: 'rect', x: 90, y: 170, w: 40, h: 60, c: '#7fb3c8' },
      { k: 'rect', x: 170, y: 170, w: 40, h: 60, c: '#7fb3c8' },
      { k: 'rect', x: 130, y: 200, w: 40, h: 60, c: '#a05a3c' },
      // Fish charm (B).
      { k: 'line', x1: 250, y1: 40, x2: 250, y2: 56, w: 2, c: '#8a5a3b' },
      { k: 'poly', p: [236, 66, 252, 56, 262, 66, 272, 58, 272, 74, 262, 66, 252, 76], c: '#e2725b', id: 'fish-charm' },
      // Parasol with centre patch (C).
      { k: 'line', x1: 490, y1: 120, x2: 490, y2: 260, w: 4, c: '#8a6a4a' },
      { k: 'half', x: 490, y: 122, r: 58, c: '#f2c9c0' },
      { k: 'circle', x: 490, y: 100, r: 12, c: '#8a4a7d', id: 'parasol-patch' },
      { k: 'line', x1: 490, y1: 122, x2: 446, y2: 122, w: 2, c: '#c96f6f' },
      { k: 'line', x1: 490, y1: 122, x2: 534, y2: 122, w: 2, c: '#c96f6f' },
      // Tea table with teapot (D).
      { k: 'rect', x: 110, y: 240, w: 110, h: 10, c: '#8a6a4a' },
      { k: 'rect', x: 124, y: 250, w: 10, h: 60, c: '#8a6a4a' },
      { k: 'rect', x: 196, y: 250, w: 10, h: 60, c: '#8a6a4a' },
      { k: 'circle', x: 155, y: 212, r: 22, c: '#7fb3c8', id: 'teapot' },
      { k: 'tri', p: [177, 206, 194, 198, 177, 220], c: '#7fb3c8' },
      { k: 'arc', x: 134, y: 212, r: 9, a0: 1.6, a1: 4.7, w: 3, c: '#5d93a8' },
      { k: 'circle', x: 155, y: 188, r: 5, c: '#f2c94c', id: 'teapot-knob' },
      { k: 'rrect', x: 196, y: 226, w: 14, h: 14, r: 2, c: '#fdf6e3' },
      // Decorative shell (E).
      { k: 'half', x: 420, y: 210, r: 26, c: '#f2c9c0', id: 'shell' },
      { k: 'line', x1: 420, y1: 184, x2: 420, y2: 210, w: 2, c: '#c96f6f' },
      { k: 'line', x1: 408, y1: 188, x2: 404, y2: 210, w: 2, c: '#c96f6f' },
      { k: 'line', x1: 432, y1: 188, x2: 436, y2: 210, w: 2, c: '#c96f6f' },
      // Shallows and stepping stones (G).
      { k: 'rect', x: 0, y: 300, w: 600, h: 120, c: '#7fc8b8' },
      { k: 'ellipse', x: 120, y: 330, rx: 40, ry: 12, c: '#a8ddd0' },
      { k: 'ellipse', x: 285, y: 342, rx: 34, ry: 11, c: '#f2e3c9', id: 'stepping-stone' },
      { k: 'ellipse', x: 285, y: 340, rx: 8, ry: 4, c: '#c9a86a', id: 'stone-inset' },
      { k: 'ellipse', x: 460, y: 330, rx: 40, ry: 12, c: '#a8ddd0' },
      // Crab (F).
      { k: 'ellipse', x: 70, y: 348, rx: 22, ry: 14, c: '#e2725b', id: 'crab' },
      { k: 'circle', x: 66, y: 344, r: 4, c: '#fdf6e3', id: 'crab-mark' },
      { k: 'circle', x: 76, y: 340, r: 3, c: '#232347' },
      { k: 'line', x1: 52, y1: 356, x2: 40, y2: 366, w: 3, c: '#e2725b' },
      { k: 'line', x1: 88, y1: 356, x2: 100, y2: 366, w: 3, c: '#e2725b' },
      // Folded towel (H).
      { k: 'rrect', x: 480, y: 322, w: 70, h: 36, r: 6, c: '#fdf6e3' },
      { k: 'rect', x: 480, y: 332, w: 70, h: 5, c: '#7fb3c8' },
      { k: 'rect', x: 480, y: 344, w: 70, h: 5, c: '#7fb3c8', id: 'towel-stripe' },
      // Lanterns.
      { k: 'line', x1: 340, y1: 30, x2: 340, y2: 60, w: 2, c: '#8a5a3b' },
      { k: 'rrect', x: 328, y: 60, w: 24, h: 30, r: 6, c: '#f2b64c' },
      { k: 'line', x1: 560, y1: 150, x2: 560, y2: 180, w: 2, c: '#8a5a3b' },
      { k: 'rrect', x: 548, y: 180, w: 24, h: 30, r: 6, c: '#f2b64c' },
    ],
  },
  {
    id: 5,
    name: 'Clockwork Conservatory',
    tag: 'Copper, dusty rose and theatrical shadows',
    seed: 71,
    sky: { c1: '#e8c9b8', c2: '#f7e8dc' },
    sprinkle: { kind: 'dust', count: 12, area: [20, 20, 560, 380], c: '#c9a86a' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#e8c9b8', c2: '#f7e8dc' },
      // Wall panels and window.
      { k: 'rect', x: 0, y: 0, w: 600, h: 30, c: '#c9a86a' },
      { k: 'rect', x: 40, y: 60, w: 120, h: 150, c: '#f2e3c9' },
      { k: 'rect', x: 440, y: 60, w: 120, h: 150, c: '#f2e3c9' },
      // Decorative gear (A).
      { k: 'circle', x: 80, y: 70, r: 26, c: '#b08d4f', id: 'gear' },
      { k: 'circle', x: 80, y: 70, r: 14, c: '#e8c9b8' },
      { k: 'rect', x: 76, y: 38, w: 8, h: 10, c: '#b08d4f', id: 'gear-tooth' },
      { k: 'rect', x: 76, y: 92, w: 8, h: 10, c: '#b08d4f' },
      { k: 'rect', x: 48, y: 66, w: 10, h: 8, c: '#b08d4f' },
      { k: 'rect', x: 102, y: 66, w: 10, h: 8, c: '#b08d4f' },
      // Clock with minute hand (B).
      { k: 'circle', x: 250, y: 65, r: 30, c: '#fdf6e3' },
      { k: 'ring', x: 250, y: 65, r: 30, w: 4, c: '#b08d4f' },
      { k: 'line', x1: 250, y1: 65, x2: 250, y2: 44, w: 3, c: '#232347', id: 'minute-hand' },
      { k: 'line', x1: 250, y1: 65, x2: 262, y2: 72, w: 4, c: '#232347' },
      { k: 'circle', x: 250, y: 65, r: 4, c: '#e5534b' },
      // Bird automaton with ribbon (C).
      { k: 'line', x1: 490, y1: 30, x2: 490, y2: 52, w: 2, c: '#8a6a4a' },
      { k: 'ellipse', x: 490, y: 72, rx: 20, ry: 14, c: '#c9a86a', id: 'bird-body' },
      { k: 'tri', p: [508, 70, 522, 64, 522, 76], c: '#c9a86a' },
      { k: 'tri', p: [478, 62, 492, 56, 496, 68], c: '#e2725b', id: 'bird-ribbon' },
      { k: 'circle', x: 484, y: 68, r: 3, c: '#232347' },
      // Display cushion with key (D).
      { k: 'rrect', x: 120, y: 220, w: 76, h: 54, r: 10, c: '#c96f6f', id: 'cushion' },
      { k: 'poly', p: [136, 240, 140, 234, 146, 234, 148, 240, 168, 240, 172, 246, 168, 252, 148, 252, 146, 258, 140, 258, 136, 252], c: '#f2c94c', id: 'display-key' },
      // Pendulum with counterweight beads (E).
      { k: 'line', x1: 420, y1: 120, x2: 420, y2: 250, w: 3, c: '#8a6a4a' },
      { k: 'circle', x: 420, y: 262, r: 18, c: '#b08d4f', id: 'pendulum' },
      { k: 'circle', x: 414, y: 256, r: 4, c: '#e2725b' },
      { k: 'circle', x: 426, y: 258, r: 4, c: '#e2725b', id: 'pendulum-bead' },
      { k: 'circle', x: 420, y: 268, r: 4, c: '#e2725b' },
      // Copper pipe with rivet to add (F).
      { k: 'line', x1: 30, y1: 300, x2: 30, y2: 400, w: 10, c: '#b08d4f', id: 'copper-pipe' },
      { k: 'line', x1: 30, y1: 300, x2: 120, y2: 300, w: 10, c: '#b08d4f' },
      { k: 'circle', x: 30, y: 330, r: 4, c: '#8a6a4a' },
      // Music box with winding knob (G).
      { k: 'rrect', x: 250, y: 310, w: 70, h: 52, r: 6, c: '#a05a3c', id: 'music-box' },
      { k: 'rect', x: 250, y: 310, w: 70, h: 10, c: '#c96f45' },
      { k: 'circle', x: 285, y: 340, r: 7, c: '#f2c94c', id: 'winding-knob' },
      { k: 'line', x1: 320, y1: 336, x2: 320, y2: 344, w: 3, c: '#f2c94c' },
      // Cabinet with painted border diamonds (H).
      { k: 'rrect', x: 470, y: 300, w: 90, h: 80, r: 6, c: '#7a5a8a', id: 'cabinet' },
      { k: 'poly', p: [488, 312, 496, 320, 488, 328, 480, 320], c: '#f2c94c' },
      { k: 'poly', p: [516, 312, 524, 320, 516, 328, 508, 320], c: '#f2c94c', id: 'border-diamond' },
      { k: 'poly', p: [544, 312, 552, 320, 544, 328, 536, 320], c: '#f2c94c' },
      { k: 'rect', x: 488, y: 340, w: 54, h: 28, c: '#5d4a7d' },
      // Floor and rug.
      { k: 'rect', x: 0, y: 380, w: 600, h: 40, c: '#8a6a4a' },
      { k: 'ellipse', x: 150, y: 392, rx: 90, ry: 12, c: '#c96f6f', a: 0.8 },
      // Potted plant.
      { k: 'rrect', x: 360, y: 330, w: 36, h: 30, r: 4, c: '#b35f3d' },
      { k: 'circle', x: 372, y: 320, r: 12, c: '#5f9e6e' },
      { k: 'circle', x: 386, y: 316, r: 10, c: '#6fae7d' },
    ],
  },
  {
    id: 6,
    name: 'Polar Radio Kitchen',
    tag: 'Blue twilight outside, orange stove glow inside',
    seed: 83,
    sky: { c1: '#2e3a5c', c2: '#7d8fb5' },
    sprinkle: { kind: 'snow', count: 14, area: [20, 20, 560, 200], c: '#ffffff' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#2e3a5c', c2: '#7d8fb5' },
      // Window with frost pattern (A).
      { k: 'rrect', x: 40, y: 40, w: 110, h: 110, r: 8, c: '#a8c8e8' },
      { k: 'line', x1: 95, y1: 40, x2: 95, y2: 150, w: 4, c: '#5d6a8a' },
      { k: 'line', x1: 40, y1: 95, x2: 150, y2: 95, w: 4, c: '#5d6a8a' },
      { k: 'line', x1: 60, y1: 60, x2: 80, y2: 80, w: 2, c: '#ffffff', id: 'frost-branch' },
      { k: 'line', x1: 70, y1: 60, x2: 70, y2: 70, w: 2, c: '#ffffff' },
      { k: 'line', x1: 120, y1: 120, x2: 140, y2: 140, w: 2, c: '#ffffff' },
      { k: 'circle', x: 130, y: 60, r: 12, c: '#fdf6e3', a: 0.9 },
      // Pennant with abstract emblem (B).
      { k: 'line', x1: 200, y1: 40, x2: 310, y2: 40, w: 2, c: '#f7e3c3' },
      { k: 'tri', p: [238, 40, 264, 40, 251, 74], c: '#e2725b', id: 'pennant-emblem' },
      { k: 'line', x1: 244, y1: 52, x2: 258, y2: 66, w: 3, c: '#fdf6e3', id: 'emblem-stroke' },
      { k: 'tri', p: [280, 40, 300, 40, 290, 68], c: '#f2c94c' },
      // Radio with tuning knob (C).
      { k: 'rrect', x: 450, y: 50, w: 100, h: 64, r: 8, c: '#8a6a4a', id: 'radio' },
      { k: 'rect', x: 462, y: 62, w: 44, h: 18, c: '#f2b64c' },
      { k: 'line', x1: 470, y1: 96, x2: 470, y2: 102, w: 3, c: '#5d4a35' },
      { k: 'circle', x: 528, y: 96, r: 8, c: '#fdf6e3', id: 'radio-knob' },
      { k: 'line', x1: 500, y1: 40, x2: 520, y2: 20, w: 2, c: '#c9b896' },
      // Stove and kettle (E).
      { k: 'rrect', x: 360, y: 220, w: 140, h: 120, r: 8, c: '#4a4a55', id: 'stove' },
      { k: 'rect', x: 380, y: 240, w: 100, h: 60, c: '#f2b64c' },
      { k: 'circle', x: 420, y: 196, r: 24, c: '#7fb3c8', id: 'kettle' },
      { k: 'tri', p: [444, 190, 460, 182, 444, 204], c: '#7fb3c8' },
      { k: 'arc', x: 420, y: 172, r: 10, a0: 3.4, a1: 6.0, w: 3, c: '#5d93a8' },
      { k: 'arc', x: 432, y: 160, r: 8, a0: 1.2, a1: 4.4, w: 3, c: '#ffffff', a: 0.8, id: 'steam-curl' },
      // Portable heater with grille (D).
      { k: 'rrect', x: 120, y: 190, w: 70, h: 90, r: 8, c: '#c96f45', id: 'heater' },
      { k: 'line', x1: 132, y1: 210, x2: 178, y2: 210, w: 4, c: '#5d2a1a' },
      { k: 'line', x1: 132, y1: 224, x2: 178, y2: 224, w: 4, c: '#5d2a1a', id: 'grille-slot' },
      { k: 'line', x1: 132, y1: 238, x2: 178, y2: 238, w: 4, c: '#5d2a1a' },
      { k: 'circle', x: 155, y: 262, r: 6, c: '#f2c94c' },
      // Counter, mitten (F), biscuit tin (G), thermos (H).
      { k: 'rect', x: 0, y: 340, w: 600, h: 80, c: '#6b4a35' },
      { k: 'rect', x: 0, y: 340, w: 600, h: 8, c: '#8a6a4a' },
      { k: 'rrect', x: 44, y: 330, w: 44, h: 52, r: 12, c: '#e2725b', id: 'mitten' },
      { k: 'circle', x: 82, y: 344, r: 9, c: '#e2725b' },
      { k: 'rrect', x: 260, y: 322, w: 52, h: 56, r: 6, c: '#7fb3c8', id: 'biscuit-tin' },
      { k: 'circle', x: 286, y: 340, r: 7, c: '#f2c94c', id: 'tin-badge' },
      { k: 'line', x1: 260, y1: 334, x2: 312, y2: 334, w: 2, c: '#5d93a8' },
      { k: 'rrect', x: 500, y: 318, w: 30, h: 60, r: 10, c: '#3fae7a', id: 'thermos' },
      { k: 'rect', x: 500, y: 332, w: 30, h: 6, c: '#fdf6e3' },
      { k: 'rect', x: 500, y: 346, w: 30, h: 6, c: '#fdf6e3', id: 'thermos-stripe' },
      { k: 'circle', x: 515, y: 312, r: 8, c: '#2c3040' },
      // Hanging mugs and shelf.
      { k: 'rect', x: 200, y: 130, w: 140, h: 10, c: '#8a6a4a' },
      { k: 'rrect', x: 216, y: 104, w: 20, h: 26, r: 3, c: '#fdf6e3' },
      { k: 'rrect', x: 250, y: 104, w: 20, h: 26, r: 3, c: '#f2b64c' },
      { k: 'rrect', x: 284, y: 104, w: 20, h: 26, r: 3, c: '#7fe0b2' },
      { k: 'circle', x: 560, y: 300, r: 16, c: '#f2b64c' },
    ],
  },
  {
    id: 7,
    name: 'Comet Seed Archive',
    tag: 'Violet space, golden shelves, botanical specimens',
    seed: 97,
    sky: { c1: '#2a1a4a', c2: '#5d4a8a' },
    sprinkle: { kind: 'stars', count: 18, area: [20, 20, 560, 180], c: '#fdf6d8' },
    objects: [
      { k: 'grad', x: 0, y: 0, w: 600, h: 420, c1: '#2a1a4a', c2: '#5d4a8a' },
      // Comet.
      { k: 'line', x1: 330, y1: 40, x2: 430, y2: 90, w: 3, c: '#f2c94c', a: 0.7 },
      { k: 'circle', x: 330, y: 40, r: 10, c: '#fdf6d8' },
      { k: 'star', x: 360, y: 60, r: 7, c: '#fdf6d8' },
      // Satellite dish (A).
      { k: 'line', x1: 80, y1: 100, x2: 80, y2: 150, w: 4, c: '#c9b896' },
      { k: 'half', x: 80, y: 92, r: 26, c: '#c9b896', id: 'dish' },
      { k: 'circle', x: 80, y: 78, r: 4, c: '#e5534b', id: 'dish-dot' },
      // Wall plaque with constellation hook (B).
      { k: 'rrect', x: 220, y: 40, w: 60, h: 60, r: 6, c: '#3b2d6e' },
      { k: 'poly', p: [238, 56, 258, 56, 262, 62, 250, 62, 250, 84, 244, 84, 244, 62, 238, 62], c: '#f2c94c', id: 'constellation-hook' },
      { k: 'circle', x: 238, y: 56, r: 3, c: '#fdf6d8' },
      { k: 'circle', x: 262, y: 62, r: 3, c: '#fdf6d8' },
      // Specimen jars (C).
      { k: 'rect', x: 440, y: 100, w: 120, h: 10, c: '#8a6a4a' },
      { k: 'rrect', x: 452, y: 56, w: 28, h: 44, r: 6, c: '#7fc8b8', a: 0.9 },
      { k: 'circle', x: 466, y: 52, r: 8, c: '#f2c94c', id: 'jar-stopper' },
      { k: 'rrect', x: 494, y: 56, w: 28, h: 44, r: 6, c: '#e8a8b8', a: 0.9 },
      { k: 'circle', x: 508, y: 52, r: 8, c: '#f2c94c' },
      { k: 'rrect', x: 536, y: 56, w: 24, h: 44, r: 6, c: '#a8c8e8', a: 0.9 },
      // Pressed leaf frame (D).
      { k: 'rrect', x: 120, y: 170, w: 70, h: 70, r: 6, c: '#f7e3c3', id: 'leaf-frame' },
      { k: 'ellipse', x: 155, y: 205, rx: 20, ry: 12, c: '#5f9e6e' },
      { k: 'line', x1: 138, y1: 205, x2: 172, y2: 205, w: 2, c: '#3f7d52', id: 'leaf-vein' },
      { k: 'line', x1: 148, y1: 198, x2: 152, y2: 212, w: 1, c: '#3f7d52' },
      // Cabinet with label (E).
      { k: 'rrect', x: 380, y: 160, w: 110, h: 140, r: 6, c: '#6b4a35', id: 'seed-cabinet' },
      { k: 'rect', x: 392, y: 172, w: 86, h: 30, c: '#8a6a4a' },
      { k: 'rect', x: 392, y: 210, w: 86, h: 30, c: '#8a6a4a' },
      { k: 'rect', x: 392, y: 248, w: 86, h: 30, c: '#8a6a4a' },
      { k: 'rrect', x: 408, y: 180, w: 30, h: 12, r: 2, c: '#fdf6e3', id: 'cabinet-label' },
      { k: 'rrect', x: 408, y: 218, w: 30, h: 12, r: 2, c: '#fdf6e3' },
      // Telescope with knob (G).
      { k: 'line', x1: 285, y1: 300, x2: 285, y2: 380, w: 6, c: '#8a6a4a' },
      { k: 'line', x1: 260, y1: 380, x2: 310, y2: 380, w: 6, c: '#8a6a4a' },
      { k: 'poly', p: [240, 300, 330, 282, 336, 300, 246, 318], c: '#7fb3c8', id: 'telescope' },
      { k: 'circle', x: 285, y: 300, r: 10, c: '#5d93a8' },
      { k: 'circle', x: 285, y: 340, r: 7, c: '#f2c94c', id: 'telescope-knob' },
      // Seed capsule (F).
      { k: 'rrect', x: 52, y: 318, w: 36, h: 54, r: 14, c: '#7fe0b2', id: 'seed-capsule' },
      { k: 'circle', x: 70, y: 336, r: 6, c: '#3fae7a' },
      // Floor mosaic (H).
      { k: 'rect', x: 0, y: 380, w: 600, h: 40, c: '#3b2d6e' },
      { k: 'poly', p: [480, 388, 492, 396, 480, 404, 468, 396], c: '#f2c94c' },
      { k: 'poly', p: [516, 388, 528, 396, 516, 404, 504, 396], c: '#f2c94c', id: 'mosaic-seg' },
      { k: 'poly', p: [552, 388, 564, 396, 552, 404, 540, 396], c: '#f2c94c' },
      // Shelves of specimen boxes.
      { k: 'rect', x: 200, y: 130, w: 140, h: 10, c: '#8a6a4a' },
      { k: 'rrect', x: 212, y: 102, w: 26, h: 28, r: 3, c: '#c96f6f' },
      { k: 'rrect', x: 246, y: 102, w: 26, h: 28, r: 3, c: '#7fc8b8' },
      { k: 'rrect', x: 280, y: 102, w: 26, h: 28, r: 3, c: '#f2b64c' },
      { k: 'rect', x: 40, y: 250, w: 90, h: 10, c: '#8a6a4a' },
      { k: 'rrect', x: 52, y: 222, w: 26, h: 28, r: 3, c: '#a8c8e8' },
      { k: 'rrect', x: 86, y: 222, w: 26, h: 28, r: 3, c: '#e8a8b8' },
    ],
  },
];

/** The scene at `index`, or the first scene for an out-of-range index. */
export function sceneAt(index) {
  return SCENES[Math.max(0, Math.min(SCENES.length - 1, index))];
}
