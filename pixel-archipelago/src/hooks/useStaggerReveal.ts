import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWorldStore } from "./useWorldStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Staggered entrance for grid/list items: as the container scrolls into
 * view, its direct children rise 24px and fade in, 60ms apart.
 *
 * Still used by Gallery and BookScroll, which manage their own containers.
 * The interior *pages* get the same gesture from `useInteriorMotion`'s
 * `[data-stagger]`; this is the standalone form for components.
 *
 * Attach the returned ref to the grid/list element (children = the items).
 * Honours prefers-reduced-motion (items simply stay visible). Pass `deps`
 * that identify the page (e.g. category id) — component instances are
 * reused across sibling routes, so the effect must re-run to replay.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLElement>(
  deps: unknown[] = [],
) {
  const ref = useRef<T>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      storeRM ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(el.children) as HTMLElement[];
    if (reduced || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeRM, ...deps]);

  return ref;
}
