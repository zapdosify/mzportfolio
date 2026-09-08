import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Magnetic pointer attraction for a control.
 *
 * Purely additive: the element is a normal, fully usable button or link with
 * this doing nothing. It only engages for a fine pointer, so touch and
 * keyboard users are never asked to chase a moving target, and it snaps home
 * on leave, blur, window blur and tab hide — none of which can leave the
 * control parked away from its hit area.
 *
 * The offset is clamped, so a pointer crossing the far edge of a wide button
 * nudges it rather than flinging it across the layout.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(
  reduced: boolean,
  { strength = 0.3, max = 14 }: { strength?: number; max?: number } = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // quickTo keeps one tween alive per axis instead of spawning a new one
    // on every pointermove.
    const toX = gsap.quickTo(el, "x", { duration: 0.42, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.42, ease: "power3.out" });

    const clamp = (n: number) => Math.max(-max, Math.min(max, n));

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      toX(clamp((e.clientX - (r.left + r.width / 2)) * strength));
      toY(clamp((e.clientY - (r.top + r.height / 2)) * strength));
    };
    const release = () => {
      toX(0);
      toY(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", release);
    el.addEventListener("blur", release);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("blur", release);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [reduced, strength, max]);

  return ref;
}
