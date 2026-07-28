import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Intro.module.css";

export const INTRO_SENTENCE =
  "The idea you tossed away was probably the best one you've ever had.";

/** Shown once per tab session, not once per mount. */
export const INTRO_SEEN_KEY = "pa:intro-seen";

/**
 * Beat sheet, in ms from mount. Total ~6.5s — inside the 5–7s brief.
 * Beats overlap deliberately: the orb starts building while the last text
 * particles are still arriving, so it reads as absorption rather than as two
 * animations played back to back.
 */
const T = {
  starsIn: 320,
  wordStart: 340,
  /** Tightened from 152/620 so the sentence lands sooner and simply sits
      there — the hold is the point, not the entrance. */
  wordStagger: 120,
  wordConverge: 560,
  holdEnd: 3600,
  dissolve: 3600,
  /** Long enough to read as travel. At 760ms the pixels were gone before they
      had visibly gone anywhere. */
  dissolveSpan: 1100,
  /** Spread of per-particle launch delay — this is what makes it a stream
      arriving into the orb rather than one synchronised swarm. */
  dissolveStagger: 520,
  orbCore: 4180,
  ring1: 4340,
  ring2: 4680,
  ring3: 5020,
  pulse: 5320,
  reveal: 5700,
  end: 6500,
} as const;

/** Crossfade out of the overlay: full when the timeline runs it, quick on skip. */
const CLOSE_MS = 760;
const CLOSE_MS_SKIP = 300;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

interface Particle {
  tx: number; // target, in the assembled sentence
  ty: number;
  sx: number; // scattered origin
  sy: number;
  w: number; // word index — drives the progressive reveal
  j: number; // timing jitter, so nothing moves in lockstep
  cx: number; // dissolve path control-point offset
  cy: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
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
  const [phase, setPhase] = useState<"playing" | "closing">("playing");
  const [closeMs, setCloseMs] = useState(CLOSE_MS);
  /** Latched: the click handler, the key handler and the timeline all call finish. */
  const finishedRef = useRef(false);
  /** Live orb centre, shared with the CSS radial reveal. */
  const orbRef = useRef({ x: 0, y: 0 });

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

  const skip = useCallback(() => finish(true), [finish]);

  /* ------------------------------------------------------------------ *
   * Reduced motion: no assembly, no particles, no travel. The sentence
   * fades up, holds, fades out. Opacity only, ~1.5s.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!reducedMotion) return;
    orbRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const id = window.setTimeout(() => finish(false), 1000);
    return () => window.clearTimeout(id);
  }, [reducedMotion, finish]);

  /* ------------------------------------------------------------------ *
   * Unmount once the closing crossfade has played.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (phase !== "closing") return;
    const id = window.setTimeout(onDone, closeMs);
    return () => window.clearTimeout(id);
  }, [phase, closeMs, onDone]);

  /* ------------------------------------------------------------------ *
   * Any deliberate input dismisses it. An intro that ignores you is worse
   * than no intro; the Skip button remains for discoverability.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return; // let focus reach the Skip button
      skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  /* ------------------------------------------------------------------ *
   * The full intro.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;
    let particles: Particle[] = [];
    let stars: Star[] = [];
    let dpr = 1;
    let vw = 0;
    let vh = 0;
    let orbUnit = 56;
    let px = 3; // drawn "pixel" size
    let start = 0;

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
    };

    /** Canvas, starfield and orb position — everything the first beat needs. */
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

      stars = Array.from({ length: Math.round((vw * vh) / 9000) }, () => ({
        x: Math.random() * vw,
        y: Math.random() * vh,
        r: Math.random() < 0.86 ? 1 : 2,
        a: 0.18 + Math.random() * 0.5,
        tw: 0.4 + Math.random() * 2.2,
      }));
    };

    /** Rasterise the sentence, then sample it on a pixel grid. */
    const buildText = () => {
      // ---- rasterise the sentence, then sample it on a pixel grid -----
      // Sampling a real text render is what keeps the letterforms exactly the
      // site's typeface; hand-placed pixels would drift from it.
      const maxW = Math.min(vw * 0.82, 1000);
      const fs = Math.max(15, Math.min(38, vw / 30));
      px = Math.max(2, Math.round(fs / 11));
      const font = `600 ${fs}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.font = font;
      const spaceW = ctx.measureText(" ").width;
      const tracking = fs * 0.06;
      const widthOf = (s: string) =>
        ctx.measureText(s).width + tracking * Math.max(0, s.length - 1);

      const words = INTRO_SENTENCE.split(" ");

      // greedy wrap
      const lines: { words: string[]; idx: number[] }[] = [];
      let cur: { words: string[]; idx: number[] } = { words: [], idx: [] };
      let curW = 0;
      words.forEach((word, i) => {
        const w = widthOf(word);
        const next = cur.words.length ? curW + spaceW + w : w;
        if (cur.words.length && next > maxW) {
          lines.push(cur);
          cur = { words: [word], idx: [i] };
          curW = w;
        } else {
          cur.words.push(word);
          cur.idx.push(i);
          curW = next;
        }
      });
      if (cur.words.length) lines.push(cur);

      const lineH = fs * 1.62;
      const blockH = lines.length * lineH;
      const topY = vh / 2 - blockH / 2 - vh * 0.06;

      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.font = font;
      octx.textBaseline = "top";
      octx.fillStyle = "#fff";

      // Each word is drawn at a known box, so pixel → word is exact rather
      // than guessed from spacing.
      const bands: { x0: number; x1: number; y0: number; y1: number; w: number }[] = [];
      lines.forEach((line, li) => {
        const lineW =
          line.words.reduce((s, w) => s + widthOf(w), 0) + spaceW * (line.words.length - 1);
        let x = (vw - lineW) / 2;
        const y = topY + li * lineH;
        line.words.forEach((word, wi) => {
          const w = widthOf(word);
          // canvas has no letter-spacing, so step the glyphs by hand
          let gx = x;
          for (const ch of word) {
            octx.fillText(ch, gx, y);
            gx += octx.measureText(ch).width + tracking;
          }
          bands.push({ x0: x - 2, x1: x + w + 2, y0: y - 4, y1: y + fs * 1.35, w: line.idx[wi] });
          x += w + spaceW;
        });
      });

      // ---- sample -----------------------------------------------------
      const step = px;
      const rx0 = Math.max(0, Math.floor((vw - maxW) / 2) - 40);
      const rx1 = Math.min(vw, Math.ceil((vw + maxW) / 2) + 40);
      const ry0 = Math.max(0, Math.floor(topY) - 12);
      const ry1 = Math.min(vh, Math.ceil(topY + blockH) + 12);
      const img = octx.getImageData(
        Math.round(rx0 * dpr),
        Math.round(ry0 * dpr),
        Math.max(1, Math.round((rx1 - rx0) * dpr)),
        Math.max(1, Math.round((ry1 - ry0) * dpr)),
      );
      const iw = img.width;
      const ih = img.height;
      const data = img.data;

      const next: Particle[] = [];
      for (let y = ry0; y < ry1; y += step) {
        for (let x = rx0; x < rx1; x += step) {
          const ix = Math.round((x - rx0) * dpr);
          const iy = Math.round((y - ry0) * dpr);
          if (ix < 0 || iy < 0 || ix >= iw || iy >= ih) continue;
          if (data[(iy * iw + ix) * 4 + 3] < 130) continue;
          let w = 0;
          for (const b of bands) {
            if (x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) {
              w = b.w;
              break;
            }
          }
          // Scatter origin: a tight cloud around each pixel's own target, so a
          // word gathers inward instead of flying in. Kept short (was up to
          // 380px) — a long travel reads as a swoosh, not as pixels settling.
          const ang = Math.random() * Math.PI * 2;
          const dist = 14 + Math.random() * 46;
          next.push({
            tx: x,
            ty: y,
            sx: x + Math.cos(ang) * dist,
            sy: y + Math.sin(ang) * dist * 0.7,
            w,
            j: Math.random(),
            cx: (Math.random() - 0.5) * 260,
            cy: (Math.random() - 0.5) * 160,
          });
        }
      }
      particles = next;
    };

    const frame = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      const t = now - start;
      const { x: orbX, y: orbY } = orbRef.current;

      ctx.clearRect(0, 0, vw, vh);

      // ---------------- starfield ----------------
      const starA = clamp01(t / T.starsIn) * (1 - clamp01((t - T.reveal) / 500));
      if (starA > 0.01) {
        ctx.fillStyle = "#ffffff";
        for (const s of stars) {
          ctx.globalAlpha = s.a * (0.72 + 0.28 * Math.sin((t / 1000) * s.tw + s.x)) * starA;
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }

      // ---------------- the sentence ----------------
      const textFade = 1 - clamp01((t - T.reveal) / 420);
      if (textFade > 0.01 && particles.length) {
        // Pure white and uniformly opaque. Both matter: a per-pixel alpha
        // jitter made the sentence read as mottled grey rather than as clean
        // white pixels, and #f2f2f2 is the body-text token, not white.
        ctx.fillStyle = "#ffffff";
        for (const p of particles) {
          const wStart = T.wordStart + p.w * T.wordStagger + p.j * 50;
          const asm = clamp01((t - wStart) / T.wordConverge);
          if (asm <= 0) continue;
          // Plain deceleration — no overshoot. The previous easeOutBack made
          // each word punch into place, which is the emphasis being removed.
          const e = easeOutCubic(asm);

          let x = p.sx + (p.tx - p.sx) * e;
          let y = p.sy + (p.ty - p.sy) * e;
          // Once settled it simply stays: no flicker, no per-word glitch.
          let a = Math.min(1, asm * 2.2);

          // dissolve toward the orb along a curved path, accelerating in
          const d = clamp01((t - T.dissolve - p.j * T.dissolveStagger) / T.dissolveSpan);
          if (d > 0) {
            const ee = easeInCubic(d);
            const mx = (x + orbX) / 2 + p.cx;
            const my = (y + orbY) / 2 + p.cy;
            const inv = 1 - ee;
            x = inv * inv * x + 2 * inv * ee * mx + ee * ee * orbX;
            y = inv * inv * y + 2 * inv * ee * my + ee * ee * orbY;
            // Stay lit for most of the journey and extinguish only on arrival —
            // fading across the whole path made the travel invisible.
            const f = clamp01((d - 0.72) / 0.28);
            a *= (1 - f * f) * (1 + 0.35 * Math.min(1, d * 3));
          }

          ctx.globalAlpha = a * textFade;
          ctx.fillRect(x, y, px, px);
        }
      }

      // ---------------- the orb, powering up ----------------
      const coreT = clamp01((t - T.orbCore) / 520);
      if (coreT > 0) {
        const u = orbUnit;
        // absorbed light warms the core from white toward the live orb's gold,
        // so the handoff to the real orb is a continuation, not a swap
        const warm = clamp01((t - T.ring1) / 900);
        const pulse = t > T.pulse ? Math.sin(clamp01((t - T.pulse) / 420) * Math.PI) * 0.16 : 0;
        const fade = 1 - clamp01((t - T.reveal) / 360);

        const gr = Math.max(1, u * (0.5 + warm * 0.7) * (1 + pulse * 1.4));
        const g = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, gr);
        g.addColorStop(0, `rgba(255,${255 - Math.round(warm * 40)},${255 - Math.round(warm * 110)},${0.5 * coreT * fade})`);
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
        ctx.arc(orbX, orbY, Math.max(0.5, u * 0.1 * easeOutCubic(coreT) * (1 + pulse)), 0, Math.PI * 2);
        ctx.fill();

        // rings, constructed one at a time
        ctx.strokeStyle = "rgba(255,214,120,1)";
        ctx.lineWidth = 1;
        for (const rd of [
          { at: T.ring1, r: u * 0.34 },
          { at: T.ring2, r: u * 0.56 },
          { at: T.ring3, r: u * 0.84 },
        ]) {
          const rt = clamp01((t - rd.at) / 460);
          if (rt <= 0) continue;
          ctx.globalAlpha = rt * (0.34 + 0.3 * (1 - rt)) * coreT * fade;
          ctx.beginPath();
          ctx.arc(orbX, orbY, Math.max(0.5, rd.r * easeOutCubic(rt) * (1 + pulse * 0.8)), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      if (t >= T.reveal) finish(false);
      if (t < T.end + 600) raf = requestAnimationFrame(frame);
    };

    // The clock starts now, and the starfield beat plays immediately — the
    // font wait below overlaps it rather than delaying the whole intro. Waiting
    // first pushed the finish ~500ms past the 7s budget.
    layout();
    raf = requestAnimationFrame(frame);

    void (async () => {
      // The sentence is sampled from a real text render, so the webfont has to
      // resolve or the pixels are a fallback monospace. Never stall on it —
      // race a timeout well inside the first beat.
      try {
        await Promise.race([
          document.fonts.load('600 38px "IBM Plex Mono"').then(() => document.fonts.ready),
          new Promise((r) => window.setTimeout(r, 400)),
        ]);
      } catch {
        /* Font Loading API unavailable — the fallback monospace still reads */
      }
      if (!cancelled) buildText();
    })();

    // Rebuild on resize, so an orientation change can't strand the sentence.
    let rz = 0;
    const onResize = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (cancelled) return;
        layout();
        buildText();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    // rAF is suspended on a hidden tab. Without this, opening the site in a
    // background tab would leave the intro frozen over the page.
    const safety = window.setTimeout(() => finish(true), T.end + 1600);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(rz);
      window.clearTimeout(safety);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion, finish]);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${phase === "closing" ? styles.closing : ""} ${
        reducedMotion ? styles.reduced : ""
      }`}
      style={{ ["--close" as string]: `${closeMs}ms` }}
      onPointerDown={skip}
      aria-label="Introduction"
    >
      {reducedMotion ? (
        <p className={styles.staticLine}>{INTRO_SENTENCE}</p>
      ) : (
        <>
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
          {/* The canvas is only pixels; this is the sentence for assistive tech. */}
          <p className="sr-only">{INTRO_SENTENCE}</p>
        </>
      )}

      {/* Radial light, opening from the orb into the landing page */}
      {phase === "closing" && !reducedMotion && (
        <span className={styles.reveal} aria-hidden="true" />
      )}

      <button type="button" className={styles.skip} onClick={skip}>
        Skip intro
      </button>
    </div>
  );
}
