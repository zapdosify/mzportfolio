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

/* ---------- 3 · strata: banded line density ---------- */
const STRATA = (() => {
  const r = rng(31337);
  const rows: { y: number; x: number; w: number; op: number }[] = [];
  let y = 22;
  while (y < 284) {
    // density peaks toward the middle of the block
    const t = (y - 22) / 262;
    const gap = 4 + 12 * Math.abs(Math.cos(t * Math.PI));
    const w = 70 + r() * 250 * (0.4 + 0.75 * Math.sin(t * Math.PI));
    rows.push({ y, x: 34 + r() * 26, w, op: 0.1 + r() * 0.3 });
    y += gap;
  }
  return rows;
})();

export type CoverKind = "contour" | "orbit" | "strata";

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
          <line
            x1={ORBIT.cx - 168}
            y1={ORBIT.cy}
            x2={ORBIT.cx + 168}
            y2={ORBIT.cy}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.16"
          />
          {ORBIT.dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.rad} fill="currentColor" opacity="0.4" />
          ))}
        </>
      )}

      {kind === "strata" &&
        STRATA.map((row, i) => (
          <line
            key={i}
            x1={row.x}
            y1={row.y}
            x2={row.x + row.w}
            y2={row.y}
            stroke="currentColor"
            strokeWidth="1"
            opacity={row.op}
          />
        ))}
    </svg>
  );
}
