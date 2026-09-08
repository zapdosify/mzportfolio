import { useEffect } from "react";
import { gsap } from "gsap";

/**
 * Pointer-follow tilt for a set of cards, bound once to a container rather
 * than per card — a gallery can hold forty plates and forty listener pairs
 * is forty times the work for the same effect.
 *
 * Purely additive, like `useMagnetic`: the cards are ordinary links and
 * buttons without it. It engages only for a fine pointer, so touch and
 * keyboard users never chase a moving target, and it releases on leave,
 * window blur and tab hide so a card can never stay parked at an angle.
 *
 * Rotation is deliberately small. Past about 6° the card stops reading as a
 * plate catching the light and starts reading as a novelty.
 *
 * @param selector  CSS selector for the tiltable children, scoped to `ref`.
 */
export function useTilt(
  ref: React.RefObject<HTMLElement | null>,
  selector: string,
  reduced: boolean,
  { max = 5, scale = 1.012 }: { max?: number; scale?: number } = {},
) {
  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // One quickTo trio per card, created lazily and reused, so a pointermove
    // never allocates a tween.
    const setters = new WeakMap<
      HTMLElement,
      { rx: (v: number) => void; ry: (v: number) => void; s: (v: number) => void }
    >();

    const settersFor = (el: HTMLElement) => {
      let t = setters.get(el);
      if (!t) {
        t = {
          rx: gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" }),
          ry: gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" }),
          s: gsap.quickTo(el, "scale", { duration: 0.5, ease: "power3.out" }),
        };
        setters.set(el, t);
      }
      return t;
    };

    let active: HTMLElement | null = null;

    const release = (el: HTMLElement | null) => {
      if (!el) return;
      const t = settersFor(el);
      t.rx(0);
      t.ry(0);
      t.s(1);
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>(selector) ?? null;
      if (card !== active) {
        release(active);
        active = card;
        if (card) gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });
      }
      if (!card) return;
      const r = card.getBoundingClientRect();
      // -1 … 1 from the card's centre on each axis.
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const t = settersFor(card);
      // Pointer right tips the right edge away; pointer down tips the bottom
      // away — the card leans toward the cursor, as a real plate would.
      t.ry(Math.max(-1, Math.min(1, px)) * max);
      t.rx(Math.max(-1, Math.min(1, py)) * -max);
      t.s(scale);
    };

    const releaseAll = () => {
      release(active);
      active = null;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", releaseAll);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", releaseAll);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", releaseAll);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", releaseAll);
      // Clear every card that was ever touched, not just the active one.
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "transform" });
      });
    };
  }, [ref, selector, reduced, max, scale]);
}
