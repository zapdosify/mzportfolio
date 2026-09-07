import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Intro.module.css";
import { INTRO_SEEN_KEY } from "./introKey";

export { INTRO_SEEN_KEY };

/**
 * Beat sheet, in ms from the moment the core is pressed.
 *
 * Phase 1 — the galaxy — deliberately has NO clock. It turns, it answers the
 * cursor, and it waits. The visitor decides when the site begins, which is the
 * whole point of making the core a button rather than a timer.
 *
 * Phase 2 is the absorption + power-up that the text intro already used, kept
 * intact: the particles fall into the orb, the core lights, three rings build,
 * one pulse leaves, and a radial light opens onto the landing.
 */
const T = {
  absorbSpan: 1150,
  /** spread of per-particle launch delay — what makes it a stream, not a swarm */
  absorbStagger: 480,
  orbCore: 620,
  ring1: 860,
  ring2: 1160,
  ring3: 1460,
  pulse: 1760,
  reveal: 2080,
  end: 2820,
} as const;

/**
 * Galaxy geometry. Particles live in real 3D and are projected each frame, so
 * the cursor tilts an actual disc rather than skewing a flat picture — that
 * parallax between near and far arms is the effect being reproduced.
 */
const G = {
  arms: 2,
  /** radial bias < 1 crowds particles toward the core */
  radiusBias: 0.62,
  /** how far the arms wind, radians per unit radius. Enough for a clear
      spiral; past ~5 the arms wrap into each other and close into a ring. */
  spin: 4.0,
  /** scatter across an arm, as a fraction of galaxy radius */
  spread: 0.26,
  /** disc half-thickness, as a fraction of galaxy radius */
  thickness: 0.055,
  /** extra particles packed into the central bulge, which reads as the core */
  bulge: 340,
  /** Resting pitch of the disc, in radians measured from EDGE-on: the disc is
      squashed vertically by sin(tilt), so PI/2 is face-on and small values are
      a flat line. 1.15 (~66 deg) keeps the spiral readable while still showing
      the disc at an angle. Getting this backwards squashes it into a ring. */
  tilt: 1.15,
  /** idle rotation, radians per second */
  spinRate: 0.085,
  /** rotation added while the galaxy is falling in, radians per second */
  absorbSpin: 0.7,
} as const;

/** How the galaxy answers the pointer. */
const C = {
  /** pointer swing, radians */
  pitchRange: 0.3,
  yawRange: 0.42,
  /** Smoothing per 60Hz frame, framerate-normalised at use. 0.045 was a ~0.36s
      lag, which read as the galaxy dragging behind the cursor rather than
      answering it. */
  ease: 0.09,
  /** screen radius, px, inside which particles warm to the orb's gold */
  glowRadius: 200,
} as const;

/**
 * If nobody presses the core, go anyway. A portfolio must never trap a visitor
 * behind an animation. The timer resets on any pointer or key input, so someone
 * who is actually playing with the galaxy is never interrupted — it only fires
 * on a genuinely abandoned tab.
 */
const IDLE_ADVANCE_MS = 15000;

/** Crossfade out of the overlay: full when the timeline runs it, quick on skip. */
const CLOSE_MS = 760;
const CLOSE_MS_SKIP = 300;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
/** cheap approximation of a normal distribution, in −1..1 */
const randNorm = () => (Math.random() + Math.random() + Math.random()) / 1.5 - 1;

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
}

interface P {
  /** local 3D position, in galaxy-radius units */
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  /** twinkle phase */
  tw: number;
  /** absorb stagger, 0..1 */
  j: number;
  /** absorb path control-point offset, screen px */
  cx: number;
  cy: number;
}

export default function Intro({
  reducedMotion,
  onReveal,
  onDone,
}: {
  reducedMotion: boolean;
  /** the radial light has started — the landing should begin settling in */
  onReveal: () => void;
  /** the overlay has finished and can be unmounted */
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"playing" | "closing">("playing");
  const [closeMs, setCloseMs] = useState(CLOSE_MS);
  /** Latched: the click handler, the key handler and the timeline all call finish. */
  const finishedRef = useRef(false);
  /** Live orb centre, shared with the CSS radial reveal and the core button. */
  const orbRef = useRef({ x: 0, y: 0 });
  /**
   * The absorption clock, and the eased rotation.
   *
   * ⚠️ These are component refs, NOT effect-local state, and that is load
   * bearing. `Landing` re-renders whenever the cursor moves (OrbLayer's
   * proximity callback sets state, and its move-end writes the orb position
   * into a store Landing subscribes to) and it passes `onReveal`/`onDone` as
   * inline arrows — so Intro receives new prop identities constantly. Anything
   * kept in the render effect's closure is therefore destroyed and rebuilt
   * mid-interaction: the galaxy snapped back to its start rotation on every
   * mouse move, and a press that had just set the absorb clock had it wiped
   * before the fall could run. Held here, both survive any re-init.
   */
  const absorbAtRef = useRef<number | null>(null);
  const rotRef = useRef({ yaw: 0, pitch: G.tilt, spun: 0 });
  /** Always-current callbacks, so no effect depends on a prop's identity. */
  const finishRef = useRef<(skipped: boolean) => void>(() => {});
  const onDoneRef = useRef(onDone);
  /** Drives the prompt/skip affordances away once the fall has begun. */
  const [absorbing, setAbsorbing] = useState(false);

  const finish = useCallback(
    (skipped: boolean) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      // Anchor the radial light on the orb before it paints.
      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--ox", `${orbRef.current.x}px`);
        root.style.setProperty("--oy", `${orbRef.current.y}px`);
      }
      setCloseMs(skipped ? CLOSE_MS_SKIP : CLOSE_MS);
      setPhase("closing");
      onReveal();
    },
    [onReveal],
  );

  useEffect(() => {
    finishRef.current = finish;
    onDoneRef.current = onDone;
  });

  const skip = useCallback(() => finishRef.current(true), []);

  /**
   * Press the core: start the fall. Idempotent, and it sets the clock DIRECTLY
   * rather than calling into the render effect — so it cannot be dropped just
   * because the effect happens to be re-initialising at that moment.
   */
  const enter = useCallback(() => {
    if (finishedRef.current || absorbAtRef.current !== null) return;
    absorbAtRef.current = performance.now();
    setAbsorbing(true);
  }, []);

  /* ------------------------------------------------------------------ *
   * Reduced motion: no galaxy, no particles, no travel. The overlay is a
   * held black frame that fades straight through to the landing.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!reducedMotion) return;
    orbRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const id = window.setTimeout(() => finishRef.current(false), 600);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  /* ------------------------------------------------------------------ *
   * Unmount once the closing crossfade has played.
   * ------------------------------------------------------------------ */
  /**
   * ⚠️ `onDone` is read from a ref and is NOT a dependency. It arrives from
   * Landing as an inline arrow, so its identity changes on every Landing
   * render — and Landing re-renders on pointer movement. With it in the deps
   * this timeout was cleared and restarted on every mouse move, so a visitor
   * who kept moving the cursor through the crossfade never got the overlay
   * unmounted: it sat at opacity 0 forever, with its capture-phase key handler
   * still swallowing every keystroke on the site underneath.
   */
  useEffect(() => {
    if (phase !== "closing") return;
    const id = window.setTimeout(() => onDoneRef.current(), closeMs);
    return () => window.clearTimeout(id);
  }, [phase, closeMs]);

  /* ------------------------------------------------------------------ *
   * Keyboard, and keeping it inside the overlay.
   *
   * ⚠️ The landing is mounted and fully interactive UNDERNEATH this overlay —
   * 13 nameplate links, the centre orb and the Index button are all still
   * focusable. The overlay is opaque so nothing can be clicked through it, but
   * a keypress goes to whatever holds focus, so Enter used to follow a landing
   * link and navigate away mid-intro. That barely showed on the old text intro
   * because any key dismissed it within a beat; this one WAITS, so the window
   * is now the whole visit. Hence: focus starts on the core, Tab is confined to
   * the overlay's two controls, and every other key is preventDefault-ed in the
   * capture phase before it can reach the page below.
   * ------------------------------------------------------------------ */
  // ⚠️ The core is deliberately NOT focused on mount. Calling .focus() on it
  // trips :focus-visible, so every visitor — mouse included — got a gold ring
  // drawn round the core on first paint, which reads as a UI artifact sitting
  // on the artwork. It buys nothing either: the handler below already stops
  // any key from reaching the page underneath, and the first Tab pulls focus
  // into the overlay anyway.

  useEffect(() => {
    if (reducedMotion) return;
    const onKey = (e: KeyboardEvent) => {
      // Once the handoff has begun the landing owns the keyboard again.
      if (finishedRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
        return;
      }
      if (e.key === "Tab") {
        // Two stops, and never out of the overlay.
        const stops = [coreRef.current, skipRef.current].filter(
          (el): el is HTMLButtonElement => !!el,
        );
        if (!stops.length) return;
        e.preventDefault();
        const i = stops.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.shiftKey
          ? stops[(i <= 0 ? stops.length : i) - 1]
          : stops[(i + 1) % stops.length];
        next.focus({ preventScroll: true });
        return;
      }
      // Everything else runs the intended transition. preventDefault matters:
      // without it Enter/Space would also activate whatever is focused below.
      e.preventDefault();
      enter();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [reducedMotion, skip, enter]);

  /* ------------------------------------------------------------------ *
   * The galaxy.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;
    let parts: P[] = [];
    let stars: Star[] = [];
    let dpr = 1;
    let vw = 0;
    let vh = 0;
    /** galaxy radius in px, and the perspective distance derived from it */
    let R = 300;
    let fov = 700;
    let orbUnit = 56;

    /** rotation targets are per-frame; the eased values live in rotRef */
    let yawTarget = 0;
    let pitchTarget = G.tilt;

    /** pointer, in screen px; null until the visitor actually moves */
    let ptr: { x: number; y: number } | null = null;

    let last = 0;

    // ---- sprites -----------------------------------------------------
    // One cached radial-gradient dot per colour, then drawImage per particle.
    // Building a gradient per particle per frame is what makes naive canvas
    // particle fields crawl; this keeps ~1500 additive dots comfortably at 60.
    const makeSprite = (rgb: string) => {
      const S = 32;
      const s = document.createElement("canvas");
      s.width = S;
      s.height = S;
      const c = s.getContext("2d");
      if (!c) return s;
      const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      // A hard bright centre with a fast falloff. A soft, wide gradient reads
      // as dust; the reference's stars are distinct points that happen to
      // bloom, so most of the sprite's energy lives in the middle 12%.
      g.addColorStop(0, `rgba(${rgb},1)`);
      g.addColorStop(0.12, `rgba(${rgb},0.92)`);
      g.addColorStop(0.3, `rgba(${rgb},0.26)`);
      g.addColorStop(0.62, `rgba(${rgb},0.05)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, S, S);
      return s;
    };
    // Grayscale galaxy, gold only where the cursor touches it and at the core —
    // the site's identity is monochrome plus the single yellow orb, so the
    // reference's blue/orange star tints are deliberately not reproduced.
    const spriteWhite = makeSprite("255,255,255");
    const spriteGold = makeSprite("255,215,107");

    /**
     * Position comes from the live orb, so the handoff lands on it exactly.
     * Scale deliberately does NOT: the real orb is only ~44px wide, and rings
     * built at that size were too small to read as a beat. The power-up is
     * sized to the viewport and the radial bloom covers the size change back
     * down to the real orb.
     */
    const measureOrb = () => {
      const r = document
        .querySelector<HTMLElement>("[data-orb-target]")
        ?.getBoundingClientRect();
      orbRef.current =
        r && r.width > 0
          ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          : { x: vw / 2, y: vh / 2 };
      orbUnit = Math.max(120, Math.min(vw, vh) * 0.22);
      // The core button and the closing radial light both sit on this.
      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--ox", `${orbRef.current.x}px`);
        root.style.setProperty("--oy", `${orbRef.current.y}px`);
      }
    };

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureOrb();

      R = Math.min(vw, vh) * 0.48;
      fov = R * 2.6;

      stars = Array.from({ length: Math.round((vw * vh) / 9000) }, () => ({
        x: Math.random() * vw,
        y: Math.random() * vh,
        r: Math.random() < 0.86 ? 1 : 2,
        a: 0.18 + Math.random() * 0.5,
        tw: 0.4 + Math.random() * 2.2,
      }));
    };

    /** Build the spiral once per layout. */
    const build = () => {
      // Density is what separates a spiral galaxy from a handful of dots. The
      // floor matters more than the cap: a small viewport still needs enough
      // particles for the arms to read as arms.
      const budget = Math.round(
        Math.min(2600, Math.max(1200, (vw * vh) / 420)),
      );
      const next: P[] = [];

      for (let i = 0; i < budget; i++) {
        // Bias toward the centre so the arms thin out as they go, the way a
        // real disc does — a uniform radius reads as a ring, not a galaxy.
        const rr = Math.pow(Math.random(), G.radiusBias);
        const radius = rr * R;
        const arm = i % G.arms;
        // Logarithmic winding: the further out, the further the arm has turned.
        const angle =
          (arm / G.arms) * Math.PI * 2 + rr * G.spin + randNorm() * 0.09;
        // Scatter grows with radius, so arms are tight near the core and
        // frayed at the rim.
        const sc = G.spread * R * (0.18 + rr);
        next.push({
          x: Math.cos(angle) * radius + randNorm() * sc,
          z: Math.sin(angle) * radius + randNorm() * sc,
          // The disc is thick at the bulge and thin at the rim.
          y: randNorm() * G.thickness * R * (1 - rr * 0.72),
          // Mostly small with an occasional bright giant — a uniform size is
          // what makes a particle field look like noise.
          size: 0.42 + Math.pow(Math.random(), 2.8) * 3.4,
          // Arms dim as they run out, so the core stays the brightest thing.
          alpha: (0.45 + Math.random() * 0.55) * (1 - rr * 0.34),
          tw: Math.random() * Math.PI * 2,
          j: Math.random(),
          cx: (Math.random() - 0.5) * 260,
          cy: (Math.random() - 0.5) * 160,
        });
      }

      // The bulge — a small dense sphere that reads as the glowing core.
      for (let i = 0; i < G.bulge; i++) {
        const rr = Math.pow(Math.random(), 2.1) * 0.12 * R;
        const a = Math.random() * Math.PI * 2;
        const b = Math.acos(2 * Math.random() - 1);
        next.push({
          x: rr * Math.sin(b) * Math.cos(a),
          y: rr * Math.cos(b) * 0.7,
          z: rr * Math.sin(b) * Math.sin(a),
          size: 0.45 + Math.random() * 1.5,
          alpha: 0.6 + Math.random() * 0.4,
          tw: Math.random() * Math.PI * 2,
          j: Math.random() * 0.4,
          cx: (Math.random() - 0.5) * 120,
          cy: (Math.random() - 0.5) * 90,
        });
      }

      parts = next;
    };

    const frame = (now: number) => {
      if (cancelled) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;

      const { x: orbX, y: orbY } = orbRef.current;
      const absorbAt = absorbAtRef.current;
      const tA = absorbAt === null ? -1 : now - absorbAt;
      /** 0 while waiting, ramping to 1 as the galaxy falls in */
      const fall = tA < 0 ? 0 : clamp01(tA / (T.absorbSpan + T.absorbStagger));

      // ---------------- rotation ----------------
      // Idle spin, plus a spin-up as everything falls inward.
      const rot = rotRef.current;
      rot.spun += dt * (G.spinRate + G.absorbSpin * fall);
      if (ptr) {
        const nx = (ptr.x / vw) * 2 - 1;
        const ny = (ptr.y / vh) * 2 - 1;
        yawTarget = nx * C.yawRange;
        pitchTarget = G.tilt + ny * C.pitchRange;
      } else {
        // Nobody has moved a pointer (or it is a touch device) — drift gently
        // so the galaxy is never dead still.
        yawTarget = Math.sin(now / 5200) * 0.16;
        pitchTarget = G.tilt + Math.cos(now / 6100) * 0.08;
      }
      // Framerate-independent smoothing. A flat per-frame lerp eases at a
      // different speed on a 60Hz and a 144Hz display; this converges over the
      // same wall-clock time on both.
      const k = 1 - Math.pow(1 - C.ease, dt * 60);
      rot.yaw += (yawTarget - rot.yaw) * k;
      rot.pitch += (pitchTarget - rot.pitch) * k;

      const ry = rot.yaw + rot.spun;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosP = Math.cos(rot.pitch);
      const sinP = Math.sin(rot.pitch);

      ctx.clearRect(0, 0, vw, vh);

      // ---------------- background starfield ----------------
      const starA = 1 - clamp01((tA - T.reveal) / 500);
      if (starA > 0.01) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#ffffff";
        for (const s of stars) {
          ctx.globalAlpha =
            s.a * (0.72 + 0.28 * Math.sin((now / 1000) * s.tw + s.x)) * starA * 0.7;
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }

      // ---------------- the galaxy ----------------
      // Additive, so overlapping arms bloom where they cross.
      ctx.globalCompositeOperation = "lighter";
      const galaxyFade = 1 - clamp01((tA - T.reveal) / 420);

      if (galaxyFade > 0.01) {
        for (const p of parts) {
          // spin about the disc axis, then pitch the disc toward the viewer
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;
          const y2 = p.y * cosP - z1 * sinP;
          const z2 = p.y * sinP + z1 * cosP;

          const persp = fov / (fov + z2);
          if (persp <= 0) continue;

          let sx = orbX + x1 * persp;
          let sy = orbY + y2 * persp;
          // Far side of the disc sits back and dims; near side comes forward.
          let a =
            p.alpha *
            (0.55 + 0.45 * clamp01((persp - 0.7) / 0.6)) *
            (0.8 + 0.2 * Math.sin(now / 900 + p.tw));
          let r = p.size * persp;

          // ---- cursor response ----
          // Particles near the pointer warm from white to the orb's gold and
          // swell slightly. This is the whole "the galaxy reacts to you" beat.
          let warm = 0;
          if (ptr && tA < 0) {
            const dx = sx - ptr.x;
            const dy = sy - ptr.y;
            const d2 = dx * dx + dy * dy;
            const g2 = C.glowRadius * C.glowRadius;
            if (d2 < g2) {
              const g = 1 - Math.sqrt(d2) / C.glowRadius;
              warm = g * g;
              a *= 1 + warm * 1.5;
              r *= 1 + warm * 0.7;
            }
          }

          // ---- the fall into the core ----
          if (tA >= 0) {
            const d = clamp01((tA - p.j * T.absorbStagger) / T.absorbSpan);
            if (d > 0) {
              const ee = easeInCubic(d);
              const mx = (sx + orbX) / 2 + p.cx;
              const my = (sy + orbY) / 2 + p.cy;
              const inv = 1 - ee;
              sx = inv * inv * sx + 2 * inv * ee * mx + ee * ee * orbX;
              sy = inv * inv * sy + 2 * inv * ee * my + ee * ee * orbY;
              // Stay lit for most of the journey and extinguish only on
              // arrival — fading across the whole path makes travel invisible.
              const f = clamp01((d - 0.72) / 0.28);
              a *= (1 - f * f) * (1 + 0.35 * Math.min(1, d * 3));
            }
          }

          a *= galaxyFade;
          if (a <= 0.004 || r <= 0.05) continue;

          if (warm > 0.02) {
            ctx.globalAlpha = Math.min(1, a * (1 - warm * 0.7));
            ctx.drawImage(spriteWhite, sx - r * 3, sy - r * 3, r * 6, r * 6);
            ctx.globalAlpha = Math.min(1, a * warm * 1.2);
            ctx.drawImage(spriteGold, sx - r * 4, sy - r * 4, r * 8, r * 8);
          } else {
            ctx.globalAlpha = Math.min(1, a);
            ctx.drawImage(spriteWhite, sx - r * 3, sy - r * 3, r * 6, r * 6);
          }
        }
      }

      // ---------------- the core, waiting then powering up ----------------
      if (tA < 0) {
        // Breathing glow — the affordance that says "press me". Matches the
        // real orb's 6.4s orbBreath so the handoff is a continuation.
        const breath = 0.5 + 0.5 * Math.sin((now / 6400) * Math.PI * 2);
        const cr = orbUnit * (0.3 + breath * 0.05);
        const g = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, cr);
        g.addColorStop(0, `rgba(255,252,240,${0.62 + breath * 0.16})`);
        g.addColorStop(0.18, `rgba(255,238,190,${0.34 + breath * 0.1})`);
        g.addColorStop(0.5, `rgba(255,215,107,${0.12 + breath * 0.05})`);
        g.addColorStop(1, "rgba(255,205,90,0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orbX, orbY, cr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff8e2";
        ctx.globalAlpha = 0.85 + breath * 0.15;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbUnit * 0.05 * (1 + breath * 0.12), 0, Math.PI * 2);
        ctx.fill();
      } else {
        const coreT = clamp01((tA - T.orbCore) / 520);
        if (coreT > 0) {
          const u = orbUnit;
          // absorbed light warms the core from white toward the live orb's
          // gold, so the handoff to the real orb is a continuation, not a swap
          const warm = clamp01((tA - T.ring1) / 900);
          const pulse =
            tA > T.pulse
              ? Math.sin(clamp01((tA - T.pulse) / 420) * Math.PI) * 0.16
              : 0;
          const fade = 1 - clamp01((tA - T.reveal) / 360);

          const gr = Math.max(1, u * (0.5 + warm * 0.7) * (1 + pulse * 1.4));
          const g = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, gr);
          g.addColorStop(
            0,
            `rgba(255,${255 - Math.round(warm * 40)},${255 - Math.round(warm * 110)},${0.5 * coreT * fade})`,
          );
          g.addColorStop(0.45, `rgba(255,205,90,${0.2 * coreT * fade})`);
          g.addColorStop(1, "rgba(255,205,90,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(orbX, orbY, gr, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = coreT * fade;
          ctx.fillStyle = `rgb(255,${255 - Math.round(warm * 30)},${255 - Math.round(warm * 80)})`;
          ctx.beginPath();
          ctx.arc(
            orbX,
            orbY,
            Math.max(0.5, u * 0.1 * easeOutCubic(coreT) * (1 + pulse)),
            0,
            Math.PI * 2,
          );
          ctx.fill();

          // rings, constructed one at a time
          ctx.strokeStyle = "rgba(255,214,120,1)";
          ctx.lineWidth = 1;
          for (const rd of [
            { at: T.ring1, r: u * 0.34 },
            { at: T.ring2, r: u * 0.56 },
            { at: T.ring3, r: u * 0.84 },
          ]) {
            const rt = clamp01((tA - rd.at) / 460);
            if (rt <= 0) continue;
            ctx.globalAlpha = rt * (0.34 + 0.3 * (1 - rt)) * coreT * fade;
            ctx.beginPath();
            ctx.arc(
              orbX,
              orbY,
              Math.max(0.5, rd.r * easeOutCubic(rt) * (1 + pulse * 0.8)),
              0,
              Math.PI * 2,
            );
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (tA >= T.reveal) finishRef.current(false);
      if (absorbAt === null || tA < T.end + 600) raf = requestAnimationFrame(frame);
    };

    // Latched, so a click, a keypress and the idle timer can all call it and
    // only the first one counts.
    const startAbsorb = () => {
      if (absorbAtRef.current !== null) return;
      absorbAtRef.current = performance.now();
    };

    // ---- idle escape hatch ------------------------------------------
    // Reset by real input, so this only ever fires on an abandoned tab.
    let idle = 0;
    const bumpIdle = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(startAbsorb, IDLE_ADVANCE_MS);
    };
    bumpIdle();

    // ---- pointer ----------------------------------------------------
    const onMove = (e: PointerEvent) => {
      ptr = { x: e.clientX, y: e.clientY };
      bumpIdle();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    layout();
    build();
    raf = requestAnimationFrame(frame);

    // Rebuild on resize, so an orientation change can't strand the galaxy.
    let rz = 0;
    const onResize = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (cancelled) return;
        layout();
        build();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    // rAF is suspended on a hidden tab. Without this, opening the site in a
    // background tab would leave the intro frozen over the page forever.
    const safety = window.setTimeout(
      () => finishRef.current(true),
      IDLE_ADVANCE_MS + T.end + 2000,
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(rz);
      window.clearTimeout(idle);
      window.clearTimeout(safety);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
    // ⚠️ deps are [reducedMotion] ONLY — see absorbAtRef above. Adding `finish`
    // (or any other identity that changes per render) rebuilds the galaxy on
    // every mouse move.
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${phase === "closing" ? styles.closing : ""} ${
        reducedMotion ? styles.reduced : ""
      }`}
      style={{ ["--close" as string]: `${closeMs}ms` }}
      // A stray click anywhere runs the intended transition rather than
      // cutting it — the core is the target, but nothing is punished for
      // missing it.
      onPointerDown={reducedMotion ? undefined : enter}
      aria-label="Introduction"
    >
      {!reducedMotion && (
        <>
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

          {/* The real control. The canvas only draws the glow; this is what
              carries the label, the focus ring and the ≥44px hit target. */}
          <button
            ref={coreRef}
            type="button"
            className={styles.core}
            onClick={enter}
            aria-label="Enter the archipelago"
          />

          {!absorbing && (
            <p className={styles.prompt} aria-hidden="true">
              Press the core
            </p>
          )}
        </>
      )}

      {/* Radial light, opening from the orb into the landing page */}
      {phase === "closing" && !reducedMotion && (
        <span className={styles.reveal} aria-hidden="true" />
      )}

      {!absorbing && (
        <button
          ref={skipRef}
          type="button"
          className={styles.skip}
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
        >
          Skip intro
        </button>
      )}
    </div>
  );
}
