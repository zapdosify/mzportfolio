/**
 * Temporary project covers — abstract line drawings, generated once at module
 * load so they are identical on every render and every visit.
 *
 * Deliberately not charts. No axes, no legends, no dashboard furniture: three
 * quiet geometric fields that hold the cover slot until real artwork replaces
 * them (set `image` on the project in data/businessContent.ts).
 */

const VB = { w: 400, h: 300 };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/* ---------- 1 · contour: nested closed level curves ---------- */
function contourPaths(): string[] {
  const r = rng(4711);
  const cx = 218;
  const cy = 150;
  const harmonics = [
    { k: 3, a: 0.13, p: r() * 6.28 },
    { k: 5, a: 0.07, p: r() * 6.28 },
    { k: 2, a: 0.09, p: r() * 6.28 },
  ];
  const out: string[] = [];
  for (let ring = 0; ring < 11; ring++) {
    const base = 16 + ring * 13.5;
    const pts: string[] = [];
    for (let i = 0; i <= 140; i++) {
      const th = (i / 140) * Math.PI * 2;
      let m = 1;
      for (const hm of harmonics) m += hm.a * Math.sin(th * hm.k + hm.p + ring * 0.16);
      const rad = base * m;
      pts.push(`${(cx + rad * Math.cos(th) * 1.28).toFixed(1)},${(cy + rad * Math.sin(th)).toFixed(1)}`);
    }
    out.push(`M${pts.join("L")}Z`);
  }
  return out;
}
const CONTOURS = contourPaths();

/* ---------- 2 · orbit: rings, arcs and points at rest ---------- */
const ORBIT = (() => {
  const r = rng(90210);
  const cx = 205;
  const cy = 150;
  const rings = [26, 48, 71, 96, 122, 149].map((rad, i) => ({
    rad,
    // each ring is drawn as one long arc with a gap, so the field breathes
    dash: `${(rad * (1.1 + r() * 3.4)).toFixed(0)} ${(rad * 1.6).toFixed(0)}`,
    rot: r() * 360,
    op: 0.32 - i * 0.03,
  }));
  const dots = Array.from({ length: 17 }, () => {
    const ri = Math.floor(r() * rings.length);
    const th = r() * Math.PI * 2;
    return {
      x: cx + rings[ri].rad * Math.cos(th),
      y: cy + rings[ri].rad * Math.sin(th) * 0.92,
      rad: 1.1 + r() * 2.6,
    };
  });
  return { cx, cy, rings, dots };
})();

/* ---------- 3 · drift: short strokes following a smooth angle field ---------- */
/* Bucketed into three opacity tiers and emitted as three <path>s rather than
   several hundred <line>s — same drawing, a fraction of the DOM. */
const DRIFT = (() => {
  const r = rng(20260907);
  const tiers: string[][] = [[], [], []];
  for (let gy = 14; gy < 292; gy += 13) {
    for (let gx = 16; gx < 390; gx += 15) {
      const x = gx + (r() - 0.5) * 7;
      const y = gy + (r() - 0.5) * 7;
      // three harmonics — enough to curve, too few to look noisy
      const a =
        Math.sin(x * 0.0105) * 1.15 +
        Math.cos(y * 0.0165) * 0.95 +
        Math.sin((x + y) * 0.0062) * 0.85;
      const len = 4.5 + 6.5 * Math.abs(Math.sin(x * 0.0085 + y * 0.011));
      const dx = Math.cos(a) * len;
      const dy = Math.sin(a) * len;
      const t = Math.abs(Math.cos(y * 0.0125 + x * 0.004));
      const tier = t > 0.66 ? 2 : t > 0.33 ? 1 : 0;
      tiers[tier].push(
        `M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`,
      );
    }
  }
  return tiers.map((d, i) => ({ d: d.join(""), op: 0.12 + i * 0.11 }));
})();

export type CoverKind = "contour" | "orbit" | "drift";

export default function Cover({ kind, className }: { kind: CoverKind; className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "contour" &&
        CONTOURS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === 4 ? 1.1 : 0.6}
            opacity={i === 4 ? 0.42 : 0.26 - i * 0.012}
          />
        ))}

      {kind === "orbit" && (
        <>
          {ORBIT.rings.map((ring, i) => (
            <circle
              key={i}
              cx={ORBIT.cx}
              cy={ORBIT.cy}
              r={ring.rad}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              strokeDasharray={ring.dash}
              opacity={ring.op}
              transform={`rotate(${ring.rot.toFixed(1)} ${ORBIT.cx} ${ORBIT.cy})`}
            />
          ))}
          {ORBIT.dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.rad} fill="currentColor" opacity="0.4" />
          ))}
        </>
      )}

      {kind === "drift" &&
        DRIFT.map((band, i) => (
          <path
            key={i}
            d={band.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity={band.op}
          />
        ))}
    </svg>
  );
}
