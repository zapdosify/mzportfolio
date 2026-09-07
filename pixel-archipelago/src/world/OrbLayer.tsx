import { useEffect, useRef, type RefObject } from "react";
import type { Category } from "../data/types";
import styles from "./OrbLayer.module.css";

interface Props {
  categories: Category[];
  initial: { x: number; y: number }; // % coords
  reducedMotion: boolean;
  paused: boolean; // e.g. when the Index overlay is open
  onProximity: (categoryId: string | null) => void;
  onEnter: (categoryId: string) => void;
  onMoveEnd: (pos: { x: number; y: number }) => void; // persist % position
  /**
   * Optional element whose CSS custom properties track the orb: `--rx`/`--ry`
   * (orb centre as a % of the stage) and `--reveal-on` (1 while the pointer is
   * over the scene, else 0). Drives the colour-reveal mask without re-rendering.
   */
  revealRef?: RefObject<HTMLImageElement | null>;
}

interface Vec {
  x: number;
  y: number;
}

/**
 * Canvas orb navigator drawn over the archipelago art.
 * Logic runs in CSS-pixel space; drawing is DPR-scaled for crisp pixels.
 * The orb is a progressive enhancement — full keyboard access is provided by
 * the nameplate links; here Enter/Space activates the nearest island.
 */
export default function OrbLayer({
  categories,
  initial,
  reducedMotion,
  paused,
  onProximity,
  onEnter,
  onMoveEnd,
  revealRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Mutable engine state kept in refs so the rAF loop never re-subscribes.
  const size = useRef({ w: 1, h: 1 });
  const pos = useRef<Vec>({ x: 0, y: 0 }); // px
  const vel = useRef<Vec>({ x: 0, y: 0 });
  const target = useRef<Vec | null>(null);
  const keys = useRef<Set<string>>(new Set());
  const activeId = useRef<string | null>(null);
  const trail = useRef<Vec[]>([]);
  const pausedRef = useRef(paused);
  const rmRef = useRef(reducedMotion);
  const latestPct = useRef<Vec>({ ...initial });
  const persistTimer = useRef<number | null>(null);
  const inside = useRef(false); // pointer currently over the scene
  const revealOn = useRef(-1); // last written --reveal-on (avoids redundant writes)

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    rmRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const stage = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();

    const pctToPx = (p: Vec): Vec => ({
      x: (p.x / 100) * size.current.w,
      y: (p.y / 100) * size.current.h,
    });
    const pxToPct = (p: Vec): Vec => ({
      x: (p.x / size.current.w) * 100,
      y: (p.y / size.current.h) * 100,
    });

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-anchor orb from its last % position so it stays put on resize.
      pos.current = pctToPx(latestPct.current);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();
    pos.current = pctToPx(initial);

    const persist = () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
      persistTimer.current = window.setTimeout(() => {
        onMoveEnd(latestPct.current);
      }, 400);
    };

    // ---- Input ----
    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        keys.current.add(k);
        target.current = null;
        e.preventDefault();
      } else if ((k === "enter" || k === " ") && activeId.current) {
        const ae = document.activeElement as HTMLElement | null;
        const tag = ae?.tagName ?? "";
        const interactive = ["INPUT", "TEXTAREA", "SELECT", "A", "BUTTON"].includes(tag) || !!ae?.isContentEditable;
        if (!interactive) {
          e.preventDefault();
          onEnter(activeId.current);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());

    const localPoint = (e: PointerEvent): Vec => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    // The orb continuously follows the cursor (no dragging needed). We only
    // update the target while the pointer is over the stage, so leaving the
    // scene (header/index) leaves the orb where it was.
    const onPointerMove = (e: PointerEvent) => {
      if (pausedRef.current) return;
      const p = localPoint(e);
      const { w, h } = size.current;
      const m = 24;
      if (p.x >= -m && p.y >= -m && p.x <= w + m && p.y <= h + m) {
        target.current = p;
        inside.current = true;
        keys.current.clear(); // pointer takes over from keyboard steering
      }
    };
    // The canvas is pointer-events:none so clicks reach the nameplates; the
    // orb's tap-to-snap listens on the stage instead.
    const onPointerDown = (e: PointerEvent) => {
      if (pausedRef.current) return;
      inside.current = true;
      target.current = localPoint(e); // immediate snap-to on touch tap
    };
    const onPointerEnter = () => {
      inside.current = true;
    };
    const onPointerLeave = () => {
      inside.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointerenter", onPointerEnter);
    stage.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointermove", onPointerMove);

    // ---- Loop ----
    const ACCEL = 1600; // px/s^2 (keyboard)
    const MAXV = 900; // px/s (keyboard cap)
    const FRICTION = 7;
    const FOLLOW = 24; // cursor-follow responsiveness (higher = less lag)

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { w, h } = size.current;

      if (!pausedRef.current) {
        const K = keys.current;
        let ax = 0;
        let ay = 0;
        if (K.has("arrowleft") || K.has("a")) ax -= 1;
        if (K.has("arrowright") || K.has("d")) ax += 1;
        if (K.has("arrowup") || K.has("w")) ay -= 1;
        if (K.has("arrowdown") || K.has("s")) ay += 1;
        const keyed = ax !== 0 || ay !== 0;
        const prevX = pos.current.x;
        const prevY = pos.current.y;

        if (keyed) {
          // keyboard steering overrides cursor follow
          target.current = null;
          const len = Math.hypot(ax, ay) || 1;
          vel.current.x += (ax / len) * ACCEL * dt;
          vel.current.y += (ay / len) * ACCEL * dt;
          const sp = Math.hypot(vel.current.x, vel.current.y);
          if (sp > MAXV) {
            vel.current.x = (vel.current.x / sp) * MAXV;
            vel.current.y = (vel.current.y / sp) * MAXV;
          }
          pos.current.x += vel.current.x * dt;
          pos.current.y += vel.current.y * dt;
        } else if (target.current) {
          // snappy cursor follow — frame-rate independent exponential smoothing
          const follow = 1 - Math.exp(-FOLLOW * dt);
          pos.current.x += (target.current.x - pos.current.x) * follow;
          pos.current.y += (target.current.y - pos.current.y) * follow;
          vel.current.x = (pos.current.x - prevX) / Math.max(dt, 1e-4);
          vel.current.y = (pos.current.y - prevY) / Math.max(dt, 1e-4);
        } else {
          const f = Math.exp(-FRICTION * dt);
          vel.current.x *= f;
          vel.current.y *= f;
          pos.current.x += vel.current.x * dt;
          pos.current.y += vel.current.y * dt;
        }

        // clamp to a soft margin
        pos.current.x = Math.max(w * 0.02, Math.min(w * 0.98, pos.current.x));
        pos.current.y = Math.max(h * 0.03, Math.min(h * 0.97, pos.current.y));

        const moving = Math.hypot(pos.current.x - prevX, pos.current.y - prevY) > 0.35;
        if (moving) {
          latestPct.current = pxToPct(pos.current);
          persist();
        }

        // proximity
        let nearest: string | null = null;
        let nearestD = Infinity;
        for (const c of categories) {
          const cp = pctToPx(c.worldPosition);
          const d = Math.hypot(cp.x - pos.current.x, cp.y - pos.current.y);
          const r = (c.activationRadius / 100) * w;
          if (d < r && d < nearestD) {
            nearestD = d;
            nearest = c.id;
          }
        }
        if (nearest !== activeId.current) {
          activeId.current = nearest;
          onProximity(nearest);
        }

        // trail
        if (!rmRef.current && moving) {
          trail.current.push({ ...pos.current });
          if (trail.current.length > 14) trail.current.shift();
        } else if (trail.current.length) {
          trail.current.shift();
        }
      }

      // Colour-reveal mask: track the orb centre (as a % of the stage) on the
      // reveal element. Disabled while paused, under reduced motion, or when the
      // pointer has left the scene — CSS transitions the fade for us.
      const rev = revealRef?.current;
      if (rev) {
        const active = !pausedRef.current && !rmRef.current && inside.current;
        if (active) {
          const pct = pxToPct(pos.current);
          rev.style.setProperty("--rx", `${pct.x.toFixed(2)}%`);
          rev.style.setProperty("--ry", `${pct.y.toFixed(2)}%`);
        }
        const on = active ? 1 : 0;
        if (on !== revealOn.current) {
          rev.style.setProperty("--reveal-on", String(on));
          revealOn.current = on;
        }
      }

      draw(ctx, now);
      raf = requestAnimationFrame(frame);
    };

    const draw = (c: CanvasRenderingContext2D, now: number) => {
      const { w, h } = size.current;
      c.clearRect(0, 0, w, h);
      const p = pos.current;
      const t = now / 1000;
      const rm = rmRef.current;

      // trail — warm amber, matching the centre orb and the pulse wave
      for (let i = 0; i < trail.current.length; i++) {
        const tp = trail.current[i];
        const a = (i / trail.current.length) * 0.28;
        c.beginPath();
        c.arc(tp.x, tp.y, 2 + i * 0.25, 0, Math.PI * 2);
        c.fillStyle = `rgba(255,214,140,${a})`;
        c.fill();
      }

      // outer glow
      const glow = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34);
      glow.addColorStop(0, "rgba(255,224,160,0.55)");
      glow.addColorStop(0.3, "rgba(255,205,110,0.18)");
      glow.addColorStop(1, "rgba(255,205,90,0)");
      c.fillStyle = glow;
      c.fillRect(p.x - 40, p.y - 40, 80, 80);

      // orbiting rings
      const rings = [
        { rx: 20, ry: 8, rot: rm ? 0.4 : t * 0.7 },
        { rx: 15, ry: 18, rot: rm ? -0.6 : -t * 0.5 + 1 },
        { rx: 24, ry: 13, rot: rm ? 1.2 : t * 0.35 + 2 },
      ];
      for (const r of rings) {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(r.rot);
        c.beginPath();
        c.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
        c.strokeStyle = "rgba(255,216,150,0.5)";
        c.lineWidth = 1;
        c.stroke();
        // orbiting particle on the ring
        if (!rm) {
          const px = Math.cos(t * 1.5 + r.rot) * r.rx;
          const py = Math.sin(t * 1.5 + r.rot) * r.ry;
          c.beginPath();
          c.arc(px, py, 1.6, 0, Math.PI * 2);
          c.fillStyle = "rgba(255,232,180,0.9)";
          c.fill();
        }
        c.restore();
      }

      // core (breathing) — hot near-white centre with a warm amber bloom,
      // echoing the .orbCore gradient (#fff6d8 → #ffd76b)
      const breathe = rm ? 1 : 1 + Math.sin(t * 1.6) * 0.12;
      c.beginPath();
      c.arc(p.x, p.y, 5 * breathe, 0, Math.PI * 2);
      c.fillStyle = "#fff3d6";
      c.shadowColor = "rgba(255,205,90,0.95)";
      c.shadowBlur = 16;
      c.fill();
      c.shadowBlur = 0;
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointermove", onPointerMove);
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
      onMoveEnd(latestPct.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
