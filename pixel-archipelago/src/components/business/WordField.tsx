import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./WordField.module.css";

/**
 * The signature background: business vocabulary arranged as a slow, turning
 * column of type.
 *
 * It is a *volume*, not a word cloud. Terms are distributed up a vertical
 * axis by the golden angle (so they never line up into visible rows), on a
 * spindle whose radius swells at mid-height and whose axis leans gently —
 * that curve is what stops it reading as a cylinder. Each term is drawn at
 * one of three scales; depth is expressed as scale and opacity, so words at
 * the back of the turn are barely there and words at the front are the
 * largest thing on screen that still isn't readable-loud.
 *
 * Everything is decorative. The host is `aria-hidden`, has no pointer
 * events, and is masked so it fades out over the column of foreground text.
 */

export interface WordFieldProps {
  terms: string[];
  /** static composition, no loop */
  reducedMotion: boolean;
  /** visitor pressed the pause control */
  paused: boolean;
}

interface Placement {
  text: string;
  /** angle around the axis, radians */
  theta: number;
  /** height along the axis, 0 (top) → 1 (bottom) */
  v: number;
  /** 0 far / small · 1 mid · 2 near / large */
  tier: 0 | 1 | 2;
  /** vertical bob */
  bobAmp: number;
  bobRate: number;
  phase: number;
}

/* ---------- composition constants (the knobs) ---------- */
const SPIN = (Math.PI * 2) / 96; // one full revolution per 96 seconds
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // 2.3999… — never repeats alignment
/* per-tier font sizes live in the stylesheet (.t0/.t1/.t2); only the
   depth-driven part of scale and opacity is computed per frame */
const TIER_ALPHA = [0.52, 0.76, 1];
const OPACITY_MAX = 0.21;
const DESKTOP_COUNT = 30;
const MOBILE_COUNT = 14;

/** deterministic PRNG — the composition is tuned, not re-rolled per visit */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compose(terms: string[], count: number, mobile: boolean): Placement[] {
  const rnd = mulberry32(0x5eed17);
  const out: Placement[] = [];
  // A tier pattern rather than pure chance: guarantees a few big anchors and
  // a lot of distant small type, in an order that doesn't read as a cycle.
  const tiers: (0 | 1 | 2)[] = [0, 1, 0, 2, 0, 1, 0, 0, 1, 2, 0, 1, 0, 0];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    out.push({
      text: terms[i % terms.length],
      theta: i * GOLDEN + rnd() * 0.35,
      v: 0.02 + t * 0.96 + (rnd() - 0.5) * 0.05,
      tier: tiers[i % tiers.length],
      bobAmp: mobile ? 0 : 5 + rnd() * 9,
      bobRate: 0.05 + rnd() * 0.09,
      phase: rnd() * Math.PI * 2,
    });
  }
  return out;
}

export default function WordField({ terms, reducedMotion, paused }: WordFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* Elapsed animation time. A ref, so a pause/resume — or a resize that
     restarts the render effect — picks up exactly where the motion left off. */
  const tRef = useRef(0);
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const on = () => setMobile(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const words = useMemo(
    () => compose(terms, mobile ? MOBILE_COUNT : DESKTOP_COUNT, mobile),
    [terms, mobile],
  );

  /* Live values the render loop reads without being restarted — the loop's
     own deps stay minimal so it is never torn down mid-motion. */
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let w = 0;
    let h = 0;
    const readBox = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
    };
    readBox();

    const zCache: number[] = [];

    /** one composed frame at time `t` seconds */
    const frame = (t: number) => {
      if (!w || !h) readBox();
      const list = wordsRef.current;
      const axisX = mobile ? w * 0.5 : w * 0.8;
      const curve = mobile ? w * 0.03 : w * 0.055;
      const R = Math.max(170, Math.min(w * (mobile ? 0.42 : 0.26), 470));
      const span = h * 1.18;
      const top = h * 0.5 - span / 2;
      const spin = t * SPIN;

      for (let i = 0; i < list.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        const p = list[i];
        const a = p.theta + spin;
        // spindle: widest at mid-height, drawn in at both ends
        const r = R * (0.72 + 0.28 * Math.sin(p.v * Math.PI));
        // and a gentle lean, so the volume curves rather than stacking straight
        const cx = axisX + curve * Math.sin(p.v * Math.PI * 1.15 - 0.5);
        const x = cx + r * Math.sin(a);
        const depth = (Math.cos(a) + 1) / 2; // 0 at the back, 1 at the front
        const y = top + p.v * span + Math.sin(t * p.bobRate + p.phase) * p.bobAmp;
        const s = 0.7 + 0.42 * depth;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
        // depth^1.6 — the back of the turn falls away fast, so the volume
        // reads as a volume instead of an evenly-lit cloud
        el.style.opacity = (
          OPACITY_MAX *
          TIER_ALPHA[p.tier] *
          (0.1 + 1.05 * Math.pow(depth, 1.6))
        ).toFixed(3);
        const z = Math.round(depth * 40);
        if (zCache[i] !== z) {
          el.style.zIndex = String(z);
          zCache[i] = z;
        }
      }
    };

    const ro = new ResizeObserver(() => {
      readBox();
      frame(tRef.current);
    });
    ro.observe(host);

    frame(tRef.current);

    // Static composition: draw the pose once and stop.
    if (reducedMotion) return () => ro.disconnect();

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp tab-switch jumps
      last = now;
      if (!pausedRef.current && !document.hidden) {
        tRef.current += dt;
        frame(tRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // `paused` is read through a ref on purpose: pausing must not rebuild
    // the field, it must only stop advancing time.
  }, [reducedMotion, mobile, words]);

  return (
    <div
      ref={hostRef}
      className={`${styles.field} ${mobile ? styles.mobile : ""}`}
      aria-hidden="true"
    >
      {words.map((p, i) => (
        <span
          key={`${p.text}-${i}`}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          className={`${styles.word} ${styles[`t${p.tier}`]}`}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}
