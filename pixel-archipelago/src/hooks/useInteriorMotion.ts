import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWorldStore } from "./useWorldStore";
import { useLenis } from "./useLenis";
import { useTilt } from "./useTilt";

gsap.registerPlugin(ScrollTrigger);

/**
 * The interior pages' shared choreography — category, project, about, contact.
 *
 * Targets are opted in by data attribute, never by class name. That is
 * deliberate: `ProjectDetail` embeds ExhibitScroll, StoryScroll and BookScroll,
 * each of which already runs its own reveal, and a broad `.section p` selector
 * would have two systems animating the same opacity. Anything without an
 * attribute below is left entirely alone.
 *
 *   [data-hero]        the hero block; its sequence plays on mount, not scroll
 *   [data-hero-line]   a hero text line (breadcrumb, tagline, meta row)
 *   [data-hero-title]  the h1, expected to contain SplitWords' [data-word]s
 *   [data-hero-art]    the framed hero image or title sequence
 *   [data-reveal]      a block that rises in as it arrives
 *   [data-reveal-title] a heading whose words lift out of their masks
 *   [data-stagger]     a container whose direct children arrive in sequence
 *
 * Every tween is a `from`, so the DOM's resting state is the finished page:
 * with reduced motion, a failed GSAP chunk, or this hook never running, the
 * page is complete and readable rather than blank.
 *
 * @param deps  Something that identifies the page (category or project id).
 *   React reuses this component instance across sibling routes, so without a
 *   dep the effect never re-runs and the second project you open never
 *   animates. This replaced `useHeroReveal`, which carried the same warning.
 */
export function useInteriorMotion<T extends HTMLElement = HTMLElement>(
  deps: unknown[] = [],
) {
  const rootRef = useRef<T>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);

  const reduced = useMemo(
    () =>
      storeRM ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    [storeRM],
  );

  /* The smooth-scroll engine belongs to the interior pages, not to the app.
     The landing is a single fixed screen that never scrolls AND sits in the
     eager entry chunk — mounting the engine app-wide would pull GSAP into
     first paint and undo the code splitting (see CONTEXT.md § 1). */
  useLenis(true, reduced);

  /* The hero frame leans toward the pointer.
     This is the one place on the design side where a tilt is additive: every
     clickable plate and card already owns its `transform` through an authored
     CSS hover, and doubling up there strands the entrance mid-tween. The hero
     art is not interactive and has no hover state, and the parallax below
     drives the picture INSIDE the frame — different element, so the two never
     write the same property. */
  useTilt(rootRef, "[data-hero-art]", reduced, { max: 4, scale: 1 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      /* ---------- Hero: one composed sequence, played on arrival ---------- */
      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });

      hero
        .from("[data-hero-line]", {
          opacity: 0,
          y: 18,
          duration: 0.6,
          stagger: 0.09,
        })
        .from(
          "[data-hero-title] [data-word]",
          { yPercent: 112, duration: 0.85, stagger: 0.05 },
          0.12,
        )
        /* The frame wipes open and the picture inside settles back from a
           slight push-in — the plate arrives rather than fading up. */
        .from(
          "[data-hero-art]",
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.95,
            ease: "power4.out",
          },
          0.18,
        )
        .from(
          "[data-hero-art] :is(img, video)",
          { scale: 1.14, duration: 1.3, ease: "power3.out" },
          0.18,
        );

      /* ---------- Headings ---------- */
      gsap.utils.toArray<HTMLElement>("[data-reveal-title]").forEach((el) => {
        const words = el.querySelectorAll<HTMLElement>("[data-word]");
        if (!words.length) return;
        gsap.from(words, {
          yPercent: 112,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      /* ---------- Blocks ----------
         `clearProps` matters more than it looks. Several interior elements —
         ProjectCard and the gallery tiles especially — own their `transform`
         through an authored CSS hover with a transition on it. While GSAP
         holds an inline transform the two fight, and the entrance strands
         itself part-finished (opacity arrives, the rise does not). Dropping
         the inline styles on completion hands the property cleanly back to
         CSS, and since the end state of a `from` tween IS the element's
         natural state, there is nothing to lose by clearing it. */
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 26,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      /* ---------- Sequenced children ---------- */
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        const items = Array.from(el.children) as HTMLElement[];
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });

      /* ---------- Hero art drifts as the hero leaves ----------
         Scrubbed and bounded. The frame is `overflow: hidden` and the picture
         is scaled slightly past it, so the drift never bares an edge. */
      const art = root.querySelector<HTMLElement>("[data-hero-art] :is(img, video)");
      if (art) {
        gsap.fromTo(
          art,
          { yPercent: -3.5 },
          {
            yPercent: 3.5,
            ease: "none",
            scrollTrigger: {
              trigger: root.querySelector("[data-hero]") ?? root,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, root);

    /* Interior pages are image- and video-heavy and lazily loaded; every one
       that decodes below the fold shifts the triggers under it. Re-measure
       once layout settles and again when the webfonts land. */
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);

  /* Magnetic controls, bound once to the page rather than per button —
     `useMagnetic` takes a single element, and the return strip has two.
     Kept in its own effect because this is pointer-driven, not scroll-driven,
     and has nothing to do with the ScrollTrigger context above. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const setters = new WeakMap<
      HTMLElement,
      { x: (v: number) => void; y: (v: number) => void }
    >();
    const settersFor = (el: HTMLElement) => {
      let t = setters.get(el);
      if (!t) {
        t = {
          x: gsap.quickTo(el, "x", { duration: 0.42, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.42, ease: "power3.out" }),
        };
        setters.set(el, t);
      }
      return t;
    };

    const MAX = 12;
    const clamp = (n: number) => Math.max(-MAX, Math.min(MAX, n));
    let active: HTMLElement | null = null;

    const release = (el: HTMLElement | null) => {
      if (!el) return;
      const t = settersFor(el);
      t.x(0);
      t.y(0);
    };

    const onMove = (e: PointerEvent) => {
      const btn =
        (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (btn !== active) {
        release(active);
        active = btn;
      }
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const t = settersFor(btn);
      t.x(clamp((e.clientX - (r.left + r.width / 2)) * 0.3));
      t.y(clamp((e.clientY - (r.top + r.height / 2)) * 0.3));
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
      root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { x: 0, y: 0 });
      });
    };
  }, [reduced]);

  return { rootRef, reduced };
}
