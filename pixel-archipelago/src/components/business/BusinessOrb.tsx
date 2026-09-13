import { useEffect, useRef } from "react";
import { drawOrb, ORB_WHITE, ORB_TRAIL_MAX, type Vec } from "../../world/orbArt";
import styles from "./BusinessOrb.module.css";

interface Props {
  /** Draw a still orb instead of an animated one. */
  reducedMotion: boolean;
  /** Freeze while the page is not the live one (e.g. behind a mode drag). */
  paused: boolean;
}

/**
 * The archipelago's orb, crossing the business portfolio as a soft white glow.
 *
 * Same object, same drawing (see orbArt.ts) — what differs is the world it is
 * in. The archipelago is a scene: the orb lives inside the art's fixed-aspect
 * stage, and proximity to an island is the whole point. This page is a
 * document, so the orb is simply the pointer: one viewport-fixed canvas, no
 * clamp, no proximity, nothing it cannot reach. That last part is deliberate —
 * a cursor that can be hidden while the real one is hidden too is the bug the
 * landing had, and a full-viewport canvas cannot have it.
 *
 * Fine pointers only. On touch there is nothing to follow, and the page keeps
 * its ordinary cursor.
 */
export default function BusinessOrb({ reducedMotion, paused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Engine state in refs: the loop must never re-subscribe on a render.
  const size = useRef({ w: 1, h: 1 });
  const pos = useRef<Vec>({ x: -200, y: -200 });
  const target = useRef<Vec | null>(null);
  const trail = useRef<Vec[]>([]);
  /** 0 → 1, eased. Carries the orb in and out as the pointer enters or leaves. */
  const alpha = useRef(0);
  /** 1 → 1.32, eased. The orb answering an interactive element. */
  const swell = useRef(1);
  const hot = useRef(false);
  const inside = useRef(false);
  /** Mirrors `data-biz-orb` on <html>, so it is only written when it changes. */
  const orbOn = useRef(false);
  const pausedRef = useRef(paused);
  const rmRef = useRef(reducedMotion);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    rmRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    // A coarse pointer has no cursor to replace. Bail before anything is
    // wired up, so touch devices pay nothing at all for this.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w, h };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Viewport coordinates throughout — the canvas is fixed, so clientX/Y is
    // already the right space and no rect maths is needed on every move.
    const onPointerMove = (e: PointerEvent) => {
      // Everything but a finger. A pen should get the orb; a touch should not,
      // and some environments report an empty pointerType for a real mouse,
      // so exclude rather than allow-list.
      if (pausedRef.current || e.pointerType === "touch") return;
      target.current = { x: e.clientX, y: e.clientY };
      if (!inside.current) {
        // Arriving (or returning): start from under the cursor rather than
        // sliding in from wherever it was last seen.
        pos.current = { x: e.clientX, y: e.clientY };
        trail.current.length = 0;
        inside.current = true;
      }
      const el = e.target as Element | null;
      hot.current = !!el?.closest?.("a, button, [role='button']");
    };
    const onPointerLeave = (e: PointerEvent) => {
      // relatedTarget null means the pointer left the window, not just one
      // element inside it.
      if (e.relatedTarget === null) inside.current = false;
    };
    const onBlur = () => {
      inside.current = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerLeave);
    window.addEventListener("blur", onBlur);

    const FOLLOW = 24; // same responsiveness as the archipelago's orb
    const FADE = 9;
    const SWELL = 12;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { w, h } = size.current;

      // Nothing to show and nothing pending: skip the work, keep the loop.
      if (document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const wanted = inside.current && !pausedRef.current ? 1 : 0;
      alpha.current += (wanted - alpha.current) * (1 - Math.exp(-FADE * dt));

      const wantSwell = hot.current && !pausedRef.current ? 1.32 : 1;
      swell.current += (wantSwell - swell.current) * (1 - Math.exp(-SWELL * dt));

      const prevX = pos.current.x;
      const prevY = pos.current.y;

      if (!pausedRef.current && target.current) {
        const follow = 1 - Math.exp(-FOLLOW * dt);
        pos.current.x += (target.current.x - pos.current.x) * follow;
        pos.current.y += (target.current.y - pos.current.y) * follow;
      }

      const moving = Math.hypot(pos.current.x - prevX, pos.current.y - prevY) > 0.35;
      if (!rmRef.current && moving && !pausedRef.current) {
        trail.current.push({ ...pos.current });
        if (trail.current.length > ORB_TRAIL_MAX) trail.current.shift();
      } else if (trail.current.length) {
        trail.current.shift();
      }

      /* The page hides the real cursor only while this one is actually
          drawn. Before the first mouse move there is no orb yet — it does not
          know where the pointer is — and hiding the cursor then would leave
          the visitor with no pointer at all until they happened to move. The
          same flag brings the cursor back when the pointer leaves the window
          or the page is frozen behind a mode drag. */
      const on = alpha.current > 0.02;
      if (on !== orbOn.current) {
        orbOn.current = on;
        if (on) document.documentElement.dataset.bizOrb = "on";
        else delete document.documentElement.dataset.bizOrb;
      }

      ctx.clearRect(0, 0, w, h);
      if (alpha.current > 0.004) {
        ctx.globalAlpha = alpha.current;
        drawOrb(
          ctx,
          pos.current,
          trail.current,
          now / 1000,
          ORB_WHITE,
          rmRef.current,
          swell.current,
        );
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      delete document.documentElement.dataset.bizOrb;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerLeave);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.orb} aria-hidden="true" />;
}
