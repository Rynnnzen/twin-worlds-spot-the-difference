// Drawing only: scene definitions in, pixels out. Each scene is rendered once
// per side into a 600x420 offscreen canvas — the left panel exactly as defined,
// the right panel with the active differences applied — and the renderer blits
// those canvases into the frame. The magnifier samples the same cached artwork,
// so the lens never shows HUD or markers. Both panels share one seeded sprinkle
// pass, drawn from the scene's own seed, so they can only differ where a
// difference says so.

import { createRandom, randomInt } from './random.js';

/** The centre of a shape, used by resize and flip. */
function shapeCentre(shape) {
  switch (shape.k) {
    case 'rect':
    case 'rrect':
    case 'grad':
      return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
    case 'tri':
    case 'poly': {
      const xs = shape.p.filter((_, i) => i % 2 === 0);
      const ys = shape.p.filter((_, i) => i % 2 === 1);
      return {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2,
      };
    }
    case 'line':
      return { x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 };
    default:
      return { x: shape.x, y: shape.y };
  }
}

/** A copy of `shape` moved by (dx, dy). */
function moved(shape, dx, dy) {
  const copy = { ...shape };
  if (copy.x !== undefined) copy.x += dx;
  if (copy.y !== undefined) copy.y += dy;
  if (copy.x1 !== undefined) {
    copy.x1 += dx;
    copy.x2 += dx;
    copy.y1 += dy;
    copy.y2 += dy;
  }
  if (copy.p) copy.p = copy.p.map((v, i) => v + (i % 2 === 0 ? dx : dy));
  return copy;
}

/** A copy of `shape` scaled by `scale` about its own centre. */
function resized(shape, scale) {
  const c = shapeCentre(shape);
  const copy = { ...shape };
  const sx = (v) => c.x + (v - c.x) * scale;
  const sy = (v) => c.y + (v - c.y) * scale;
  if (copy.x !== undefined) copy.x = sx(copy.x);
  if (copy.y !== undefined) copy.y = sy(copy.y);
  if (copy.w !== undefined) copy.w *= scale;
  if (copy.h !== undefined) copy.h *= scale;
  if (copy.r !== undefined) copy.r *= scale;
  if (copy.rx !== undefined) copy.rx *= scale;
  if (copy.ry !== undefined) copy.ry *= scale;
  if (copy.x1 !== undefined) {
    copy.x1 = sx(copy.x1);
    copy.x2 = sx(copy.x2);
    copy.y1 = sy(copy.y1);
    copy.y2 = sy(copy.y2);
  }
  if (copy.p) copy.p = copy.p.map((v, i) => (i % 2 === 0 ? sx(v) : sy(v)));
  return copy;
}

/** A copy of `shape` mirrored left-to-right about its own centre. */
function flipped(shape) {
  const c = shapeCentre(shape);
  const copy = { ...shape };
  const fx = (v) => 2 * c.x - v;
  if (copy.x !== undefined && (shape.k === 'rect' || shape.k === 'rrect' || shape.k === 'grad')) {
    copy.x = fx(copy.x + copy.w);
  }
  if (copy.x1 !== undefined) {
    const x1 = fx(copy.x1);
    const x2 = fx(copy.x2);
    copy.x1 = x2;
    copy.x2 = x1;
  }
  if (copy.p) copy.p = copy.p.map((v, i) => (i % 2 === 0 ? fx(v) : v));
  if (shape.k === 'arc') {
    const a0 = Math.PI - copy.a1;
    const a1 = Math.PI - copy.a0;
    copy.a0 = a0;
    copy.a1 = a1;
  }
  return copy;
}

/** One shape, painted onto `ctx`. */
export function drawShape(ctx, shape) {
  ctx.save();
  ctx.globalAlpha = shape.a ?? 1;
  ctx.fillStyle = shape.c ?? '#000000';
  ctx.strokeStyle = shape.c ?? '#000000';
  switch (shape.k) {
    case 'grad': {
      const g = ctx.createLinearGradient(0, shape.y, 0, shape.y + shape.h);
      g.addColorStop(0, shape.c1);
      g.addColorStop(1, shape.c2);
      ctx.fillStyle = g;
      ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
      break;
    }
    case 'rect':
      ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
      break;
    case 'rrect':
      ctx.beginPath();
      ctx.roundRect(shape.x, shape.y, shape.w, shape.h, shape.r ?? 4);
      ctx.fill();
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(shape.x, shape.y, shape.rx, shape.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'tri':
    case 'poly': {
      ctx.beginPath();
      ctx.moveTo(shape.p[0], shape.p[1]);
      for (let i = 2; i < shape.p.length; i += 2) ctx.lineTo(shape.p[i], shape.p[i + 1]);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'line':
      ctx.lineWidth = shape.w ?? 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      break;
    case 'ring':
      ctx.lineWidth = shape.w ?? 2;
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'arc':
      ctx.lineWidth = shape.w ?? 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r, shape.a0, shape.a1);
      ctx.stroke();
      break;
    case 'half':
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'star': {
      const r = shape.r;
      const q = r * 0.28;
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y - r);
      ctx.lineTo(shape.x + q, shape.y - q);
      ctx.lineTo(shape.x + r, shape.y);
      ctx.lineTo(shape.x + q, shape.y + q);
      ctx.lineTo(shape.x, shape.y + r);
      ctx.lineTo(shape.x - q, shape.y + q);
      ctx.lineTo(shape.x - r, shape.y);
      ctx.lineTo(shape.x - q, shape.y - q);
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

/** Seeded texture drawn identically on both panels. */
function drawSprinkle(ctx, scene) {
  const spec = scene.sprinkle;
  if (!spec) return;
  const random = createRandom(scene.seed * 7919 + 13);
  const [ax, ay, aw, ah] = spec.area;
  for (let i = 0; i < spec.count; i += 1) {
    const x = ax + random() * aw;
    const y = ay + random() * ah;
    switch (spec.kind) {
      case 'birds':
        ctx.strokeStyle = spec.c;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x - 5, y, 5, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(x + 5, y, 5, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        break;
      case 'stars':
        drawShape(ctx, { k: 'star', x, y, r: 3 + random() * 4, c: spec.c, a: 0.5 + random() * 0.5 });
        break;
      case 'clouds':
        drawShape(ctx, { k: 'ellipse', x, y, rx: 26 + random() * 22, ry: 8 + random() * 6, c: spec.c, a: 0.5 });
        break;
      case 'spores':
      case 'snow':
      case 'dust':
      case 'droplets':
        drawShape(ctx, { k: 'circle', x, y, r: 1.5 + random() * 2.5, c: spec.c, a: 0.35 + random() * 0.45 });
        break;
      case 'ripples':
        drawShape(ctx, { k: 'ellipse', x, y, rx: 10 + random() * 14, ry: 2.5, c: spec.c, a: 0.4 });
        break;
      default:
        break;
    }
  }
}

/**
 * Render one side of a scene into a fresh 600x420 canvas. `side` is 'left' or
 * 'right'; `active` is the list of differences in play (only the right side
 * applies them). The random generator is unused here on purpose: decoration is
 * seeded inside drawSprinkle, so the two sides can never drift apart.
 */
export function renderScenePanel(scene, active, side) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  const byId = new Map();
  for (const d of active) if (d.obj) byId.set(d.obj, d);
  const adds = side === 'right' ? active.filter((d) => d.type === 'add') : [];

  let sprinkled = false;
  for (const shape of scene.objects) {
    if (shape.k === 'grad' && !sprinkled) {
      drawShape(ctx, shape);
      drawSprinkle(ctx, scene);
      sprinkled = true;
      continue;
    }
    if (side === 'left' || !shape.id || !byId.has(shape.id)) {
      drawShape(ctx, shape);
      continue;
    }
    const d = byId.get(shape.id);
    if (d.type === 'remove') continue;
    if (d.type === 'recolor') drawShape(ctx, { ...shape, c: d.color });
    else if (d.type === 'move') drawShape(ctx, moved(shape, d.dx, d.dy));
    else if (d.type === 'resize') drawShape(ctx, resized(shape, d.scale));
    else if (d.type === 'flip') drawShape(ctx, flipped(shape));
    else if (d.type === 'replace') drawShape(ctx, d.shape);
    else drawShape(ctx, shape);
  }
  if (!sprinkled) drawSprinkle(ctx, scene);
  for (const d of adds) drawShape(ctx, d.shape);
  return canvas;
}

/** Both panels of a scene at once: { left, right } canvases. */
export function renderScenePair(scene, active) {
  return {
    left: renderScenePanel(scene, active, 'left'),
    right: renderScenePanel(scene, active, 'right'),
  };
}
