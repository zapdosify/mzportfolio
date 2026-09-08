import type Lenis from "lenis";

/**
 * The live Lenis instance, and the scroll helpers that need to reach it.
 *
 * Deliberately separate from `useLenis.ts`, and deliberately free of runtime
 * imports — the `Lenis` import above is type-only and disappears at compile
 * time. `useModeStore` is part of the eager entry chunk, so anything it
 * imports is downloaded before first paint; pulling it in from `useLenis`
 * would drag GSAP (44 KB gzip, its own long-lived chunk) into the landing
 * page's critical path and undo the code-splitting work in CONTEXT.md § 1.
 *
 * Everything scroll-related that non-business code needs lives here.
 * `useLenis.ts` owns the engine's lifecycle and registers it through
 * `setLenis`.
 */

let instance: Lenis | null = null;

/** Called only by `useLenis` as the engine starts and stops. */
export function setLenis(l: Lenis | null) {
  instance = l;
}

/**
 * Jump to an absolute offset immediately.
 *
 * Every programmatic scroll in business mode must go through here: Lenis
 * runs its own animation loop, so a bare `window.scrollTo` is overwritten on
 * the next frame and the page drifts back. Falls through to the native call
 * whenever Lenis is not running (design mode, reduced motion).
 */
export function scrollToInstant(y: number) {
  if (instance) {
    instance.scrollTo(y, { immediate: true, force: true });
    return;
  }
  window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
}

/**
 * Glide to an element (or offset). Used by in-page anchors, which would
 * otherwise be animated by the browser and by Lenis at the same time.
 */
export function smoothScrollTo(target: HTMLElement | number, reduced = false) {
  if (instance && !reduced) {
    instance.scrollTo(target, { duration: 1.1 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  } else {
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
}
