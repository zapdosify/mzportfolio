/**
 * The switch drag's single source of truth: one number, 0 → 1, published as
 * the `--mode-pos` custom property on <html>.
 *
 * 0 is Design, 1 is Business Analytics — the same scale the pill has always
 * used. Everything that has to follow the finger reads it from CSS: the pill
 * itself, and the seam that reveals the destination portfolio underneath. It
 * is deliberately NOT React state. A drag writes it many times per second and
 * both portfolios are mounted while it does, so a re-render per pointermove
 * would be the one thing this interaction cannot afford.
 */

const VAR = "--mode-pos";

let current = 0;
let raf = 0;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Where the pill rests for a given mode. */
export const basePos = (mode: "design" | "business") => (mode === "business" ? 1 : 0);

export function setModePos(v: number) {
  current = clamp01(v);
  document.documentElement.style.setProperty(VAR, String(current));
}

export function getModePos() {
  return current;
}

export function clearModePos() {
  document.documentElement.style.removeProperty(VAR);
}

export type Easing = (p: number) => number;

/* A CSS cubic-bezier solved in JS. GSAP would do this too, but it is not in
   the eager chunk and the switch is — see the code-splitting note in
   CONTEXT §1. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (p) => {
    let t = p;
    for (let i = 0; i < 5; i += 1) {
      const slope = slopeX(t);
      if (slope === 0) break;
      t -= (sampleX(t) - p) / slope;
    }
    t = clamp01(t);
    return ((ay * t + by) * t + cy) * t;
  };
}

/**
 * A released drag: the site's own `--ease-out`, so the pill settles on exactly
 * the curve its CSS transition always used. It is front-loaded — half the
 * distance in the first tenth of the time — which is right for a gesture that
 * already has the visitor's hand behind it.
 */
export const EASE_SETTLE = cubicBezier(0.16, 1, 0.3, 1);

/**
 * A slide under its own power — a click, a tap, an arrow key. This one starts
 * from rest, so it eases in as well as out, and it is chosen to be EVEN: its
 * fastest moment is only ~1.5x its average, against ~3x for the settle curve,
 * which is the whole difference between a sheet being drawn across and a snap.
 * Roughly a third of the sweep is spent between a fifth and three fifths
 * revealed, which is where the glass is worth looking at, and it does not
 * stall out over the last tenth the way a curve ending flat does.
 */
export const EASE_GLIDE = cubicBezier(0.38, 0.06, 0.62, 0.94);

/** Stop any settle already in flight (a second drag started, or we unmounted). */
export function stopModePos() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

/**
 * Run the pill — and the seam locked to it — home. `done` fires on the frame
 * the value lands, which is when the swap is safe to commit: the destination
 * is covering the viewport by then, so nothing flickers.
 */
export function tweenModePos(
  to: number,
  ms: number,
  ease: Easing,
  done: () => void,
) {
  stopModePos();
  const from = current;
  if (ms <= 0 || from === to) {
    setModePos(to);
    done();
    return;
  }
  const started = performance.now();
  const step = (now: number) => {
    const t = clamp01((now - started) / ms);
    setModePos(from + (to - from) * ease(t));
    if (t < 1) {
      raf = requestAnimationFrame(step);
      return;
    }
    raf = 0;
    done();
  };
  raf = requestAnimationFrame(step);
}
