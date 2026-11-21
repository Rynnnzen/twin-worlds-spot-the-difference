// Pointer and keyboard input, with no game rules in it: mouse position and
// clicks in field coordinates, single-press key events, and the set of keys
// currently held (for the crosshair). Arrow keys, Space and Tab are captured
// so the page never scrolls or moves focus while playing.

export function createInput(canvas, toField) {
  let mouse = null;
  const clicks = [];
  const pressed = [];
  const held = new Set();

  const CAPTURED = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Tab']);

  canvas.addEventListener('mousemove', (event) => {
    mouse = toField(event.clientX, event.clientY);
  });
  canvas.addEventListener('mouseleave', () => {
    mouse = null;
  });
  canvas.addEventListener('click', (event) => {
    const point = toField(event.clientX, event.clientY);
    if (point) clicks.push(point);
  });
  window.addEventListener('keydown', (event) => {
    if (CAPTURED.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    held.add(event.code);
    pressed.push(event.code);
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
  });
  window.addEventListener('blur', () => {
    held.clear();
  });

  return {
    /** The mouse position in field coordinates, or null outside the field. */
    mouse() {
      return mouse;
    },
    /** Clicks since the last call, in field coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** Key codes pressed since the last call (no repeats). */
    takePressed() {
      return pressed.splice(0, pressed.length);
    },
    /** Whether a key code is currently held down. */
    held(code) {
      return held.has(code);
    },
  };
}
