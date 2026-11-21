// The magnifier lens: a circular 2x zoom of the raw panel artwork under the
// pointer. It samples the cached panel canvases, so it never shows HUD or
// markers. The lens sits offset from the pointer and is clamped inside the
// picture it magnifies.

import { LENS, LEFT_PANEL, RIGHT_PANEL } from './config.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function inside(point, panel) {
  return (
    point.x >= panel.x &&
    point.x <= panel.x + panel.width &&
    point.y >= panel.y &&
    point.y <= panel.y + panel.height
  );
}

/** Draw the lens for a pointer at field coordinates `at`, or nothing. */
export function drawLens(ctx, panels, at) {
  let panel = null;
  let art = null;
  if (inside(at, LEFT_PANEL)) {
    panel = LEFT_PANEL;
    art = panels.left;
  } else if (inside(at, RIGHT_PANEL)) {
    panel = RIGHT_PANEL;
    art = panels.right;
  } else {
    return;
  }
  const localX = at.x - panel.x;
  const localY = at.y - panel.y;
  const srcSize = LENS.diameter / LENS.zoom;
  const sx = clamp(localX - srcSize / 2, 0, panel.width - srcSize);
  const sy = clamp(localY - srcSize / 2, 0, panel.height - srcSize);

  const radius = LENS.diameter / 2;
  let cx = at.x + 46;
  let cy = at.y - 46;
  cx = clamp(cx, panel.x + radius, panel.x + panel.width - radius);
  cy = clamp(cy, panel.y + radius, panel.y + panel.height - radius);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(art, sx, sy, srcSize, srcSize, cx - radius, cy - radius, LENS.diameter, LENS.diameter);
  ctx.restore();

  ctx.strokeStyle = '#fdf6d8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(253, 246, 216, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(at.x, at.y);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
}
