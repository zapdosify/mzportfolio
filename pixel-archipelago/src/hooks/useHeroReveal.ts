import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWorldStore } from "./useWorldStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals the direct children ("lines") of a hero text block as they scroll
 * into view: each line fades in and slides up from 40px below its resting
 * position, staggered by 0.15s, driven by GSAP ScrollTrigger.
 *
 * Attach the returned ref to the element whose children are the lines
 * (e.g. the `.heroText` container). Honours prefers-reduced-motion — reduced
 * users get the fully-visible text with no animation.
 *
 * `deps` should identify the current page (e.g. the category or project id).
 * React reuses the same component instance when navigating between two
 * category (or two project) pages, so without this the effect never re-runs
 * and the reveal wouldn't replay. Changing a dep re-triggers the animation.
 */
export function useHeroReveal<T extends HTMLElement = HTMLDivElement>(
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
    const lines = Array.from(el.children) as HTMLElement[];
    if (reduced || lines.length === 0) return; // leave text visible, unanimated

    // Scope every tween/trigger so cleanup fully reverts the "from" state.
    const ctx = gsap.context(() => {
      gsap.from(lines, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          // hero sits above the fold on load, so this fires once on entry
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeRM, ...deps]);

  return ref;
}
