/**
 * The orb's drawing — one source of truth for both worlds.
 *
 * The archipelago's navigator and the business portfolio's cursor are the
 * same object lit differently: the same trail, the same three orbiting rings
 * with their particles, the same breathing core, the same timings and the
 * same radii. Only the palette differs, so the two can never drift apart by
 * someone editing one and forgetting the other.
 *
 * Clearing the canvas is the caller's job — the two canvases are different
 * sizes and only the caller knows its own.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface OrbPalette {
  /** Trail dots: an "r,g,b" triplet. Alpha is applied per dot as it fades. */
  trail: string;
  /** Outer glow gradient, at stops 0 / 0.3 / 1. */
  glowInner: string;
  glowMid: string;
  glowOuter: string;
  ring: string;
  particle: string;
  core: string;
  coreShadow: string;
}

/** The archipelago: warm amber, matching the centre orb and the pulse wave. */
export const ORB_AMBER: OrbPalette = {
  trail: "255,214,140",
  glowInner: "rgba(255,224,160,0.55)",
  glowMid: "rgba(255,205,110,0.18)",
  glowOuter: "rgba(255,205,90,0)",
  ring: "rgba(255,216,150,0.5)",
  particle: "rgba(255,232,180,0.9)",
  core: "#fff3d6",
  coreShadow: "rgba(255,205,90,0.95)",
};

/**
 * Business Analytics: the same orb as a soft white glow.
 *
 * White at the core and along the rings, with only the faintest cool cast in
 * the falloff — enough that the light belongs to the teal ground it is
 * crossing, not so much that it reads as a cyan orb. On #071417 the core
 * carries easily; it is the outer halo that has to stay soft, or the thing
 * stops being a glow and becomes a headlight.
 */
export const ORB_WHITE: OrbPalette = {
  trail: "226,240,242",
  glowInner: "rgba(255,255,255,0.5)",
  glowMid: "rgba(212,240,246,0.16)",
  glowOuter: "rgba(190,232,240,0)",
  ring: "rgba(240,250,252,0.5)",
  particle: "rgba(255,255,255,0.92)",
  core: "#ffffff",
  coreShadow: "rgba(224,248,255,0.95)",
};

/** Longest trail either world keeps. */
export const ORB_TRAIL_MAX = 14;

export function drawOrb(
  c: CanvasRenderingContext2D,
  p: Vec,
  trail: Vec[],
  /** seconds — `performance.now() / 1000` */
  t: number,
  palette: OrbPalette,
  reducedMotion: boolean,
  /**
   * Swells the orb's body — glow, rings and core — without touching the
   * trail, which belongs to the path travelled rather than to the orb. The
   * business cursor uses it to answer an interactive element; the
   * archipelago leaves it at 1.
   */
  scale = 1,
) {
  // trail
  for (let i = 0; i < trail.length; i++) {
    const tp = trail[i];
    const a = (i / trail.length) * 0.28;
    c.beginPath();
    c.arc(tp.x, tp.y, 2 + i * 0.25, 0, Math.PI * 2);
    c.fillStyle = `rgba(${palette.trail},${a})`;
    c.fill();
  }

  // outer glow
  const glowR = 34 * scale;
  const glow = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
  glow.addColorStop(0, palette.glowInner);
  glow.addColorStop(0.3, palette.glowMid);
  glow.addColorStop(1, palette.glowOuter);
  c.fillStyle = glow;
  const box = glowR + 6;
  c.fillRect(p.x - box, p.y - box, box * 2, box * 2);

  // orbiting rings
  const rings = [
    { rx: 20 * scale, ry: 8 * scale, rot: reducedMotion ? 0.4 : t * 0.7 },
    { rx: 15 * scale, ry: 18 * scale, rot: reducedMotion ? -0.6 : -t * 0.5 + 1 },
    { rx: 24 * scale, ry: 13 * scale, rot: reducedMotion ? 1.2 : t * 0.35 + 2 },
  ];
  for (const r of rings) {
    c.save();
    c.translate(p.x, p.y);
    c.rotate(r.rot);
    c.beginPath();
    c.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
    c.strokeStyle = palette.ring;
    c.lineWidth = 1;
    c.stroke();
    // orbiting particle on the ring
    if (!reducedMotion) {
      const px = Math.cos(t * 1.5 + r.rot) * r.rx;
      const py = Math.sin(t * 1.5 + r.rot) * r.ry;
      c.beginPath();
      c.arc(px, py, 1.6, 0, Math.PI * 2);
      c.fillStyle = palette.particle;
      c.fill();
    }
    c.restore();
  }

  // core (breathing)
  const breathe = reducedMotion ? 1 : 1 + Math.sin(t * 1.6) * 0.12;
  c.beginPath();
  c.arc(p.x, p.y, 5 * breathe * scale, 0, Math.PI * 2);
  c.fillStyle = palette.core;
  c.shadowColor = palette.coreShadow;
  c.shadowBlur = 16;
  c.fill();
  c.shadowBlur = 0;
}
