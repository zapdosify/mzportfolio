import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "./lenisInstance";

gsap.registerPlugin(ScrollTrigger);

/**
 * The site's ONE smooth-scroll engine, deliberately scoped to business mode.
 *
 * The design portfolio drives its own scroll (ExhibitScroll, StoryScroll,
 * BookScroll, OrbLayer) and a document-wide inertia layer would fight all of
 * them, so Lenis is created when business mode mounts and destroyed the
 * moment it leaves. Nothing else in the app installs a scroll engine.
 *
 * Under reduced motion it never starts at all — native scrolling is the
 * accessible behaviour, not a shortened animation of it.
 *
 * The scroll helpers live in `lenisInstance.ts` so that callers outside
 * business mode can reach them without importing GSAP; see the note there.
 */
export function useLenis(active: boolean, reduced: boolean) {
  useEffect(() => {
    if (!active || reduced) return;

    const lenis = new Lenis({
      // Long enough to feel carried, short enough that a flick still lands.
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Touch devices already have native inertia; doubling it feels laggy.
      syncTouch: false,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Lenis needs every frame; GSAP's lag smoothing would drop the ones it
    // decides are too far apart and the scroll would stutter under load.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      // Hand lag smoothing back to the design side at GSAP's own defaults.
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
      ScrollTrigger.refresh();
    };
  }, [active, reduced]);
}
