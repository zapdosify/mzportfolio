import { Suspense, lazy, useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import IndexMenu from "../components/navigation/IndexMenu";
import ContactDialog from "../components/contact/ContactDialog";
import ModeSwitch from "../components/mode/ModeSwitch";
import { rememberedScroll, useModeStore } from "../hooks/useModeStore";
import { scrollToInstant } from "../hooks/lenisInstance";
import { businessCopy } from "../data/businessContent";
import { identity } from "../data/siteContent";

// The business portfolio is a second, self-contained world. It is loaded on
// demand — a visitor who never touches the switch never downloads it, and the
// design portfolio's bundle is unchanged.
const BusinessPortfolio = lazy(
  () => import("../components/business/BusinessPortfolio"),
);

export default function RootLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const mode = useModeStore((s) => s.mode);
  const target = useModeStore((s) => s.target);
  const switching = useModeStore((s) => s.switching);
  /* Non-null only while the switch is being dragged: the portfolio being
     revealed underneath the live one. See ModeSwitch / modePos.ts. */
  const preview = useModeStore((s) => s.preview);

  /**
   * The crossfade half of the mode transition. Opacity ONLY — a transform
   * here would re-anchor every position:fixed descendant (the header, the
   * warp overlay, the modals). The slight positional move lives inside the
   * business page, on its own content.
   *
   * A drag does not use it at all: the reveal IS the transition, so the two
   * layers simply sit one over the other and a seam moves between them.
   */
  const layerClass = (m: "design" | "business") => {
    if (preview === m) return "mode-layer mode-reveal";
    // The live layer while something is revealed over it. `isolation` keeps
    // its own fixed chrome (header at z 40, the business progress bar at 60)
    // inside its own stacking context, so nothing of the outgoing portfolio
    // can paint through the page arriving on top of it.
    if (preview) return "mode-layer mode-under";
    if (switching) return mode === target ? "mode-layer mode-in" : "mode-layer mode-out";
    return "mode-layer";
  };

  const showDesign = mode === "design" || preview === "design";
  const showBusiness = mode === "business" || preview === "business";
  const designRevealed = preview === "design";
  const businessRevealed = preview === "business";

  const designScrollRef = useRef<HTMLDivElement>(null);
  const businessScrollRef = useRef<HTMLDivElement>(null);

  /* The revealed layer is a viewport-sized fixed panel, so it carries its own
     scroller. Seeding it with the position that mode was left at means the
     visitor is looking at exactly the frame the release will land on, and the
     swap has nothing to correct. */
  useLayoutEffect(() => {
    if (!preview) return;
    const el = preview === "design" ? designScrollRef.current : businessScrollRef.current;
    if (el) el.scrollTop = rememberedScroll(preview);
  }, [preview]);

  /* ...and on the frame the swap happens, the document takes that position
     over. Before paint, so the page never shows the old offset first.
     `switching` is the crossfade path, which restores its own scroll. */
  const lastModeRef = useRef(mode);
  useLayoutEffect(() => {
    if (lastModeRef.current === mode) return;
    lastModeRef.current = mode;
    if (switching) return;
    scrollToInstant(rememberedScroll(mode));
  }, [mode, switching]);

  // `target` leads `mode`, so the page chrome — background, switch colours,
  // browser theme — starts interpolating the instant the switch is thrown,
  // and is already settled by the time the content finishes swapping.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.mode = target;
    document.title =
      target === "business"
        ? `${identity.name} — ${businessCopy.subtitle}`
        : `${identity.name} — Design Portfolio`;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", target === "business" ? "#f7f7f3" : "#050505");
  }, [target]);

  // Move focus to main content on route change (a11y), and crossfade the
  // incoming page up from the shared black background so route swaps never
  // hard-cut (the landing warp settles to the same black). Opacity only —
  // a transform here would re-anchor position:fixed descendants.
  //
  // ⚠️ Returning to design mode remounts `#main`, which fires this effect
  // without any route having changed. Focusing there would yank the keyboard
  // off the mode switch the visitor just operated (so their next arrow key
  // would do nothing), and would fade the page a second time on top of the
  // mode crossfade. Only a genuine path change should do either.
  const lastPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (mode !== "design") {
      // A drag has the design side mounted and visible underneath already.
      // Record its path now so the commit that follows is not mistaken for a
      // route change — that would fade the page the visitor just wiped in.
      if (preview === "design") lastPathRef.current = location.pathname;
      return;
    }
    const first = lastPathRef.current === null;
    const pathChanged = !first && lastPathRef.current !== location.pathname;
    lastPathRef.current = location.pathname;
    if (!first && !pathChanged) return;
    const main = document.getElementById("main");
    if (!main) return;
    main.focus({ preventScroll: true });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      main.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    }
  }, [location.pathname, mode, preview]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Shared chrome: fixed, top centre, and the one thing that survives
          the transition untouched so the switch never appears to move. */}
      <ModeSwitch />

      {/* Both portfolios are mounted while a drag runs, and each keeps the
          same key and the same shape throughout — the layer being revealed
          becomes the live one without React remounting a thing, which is what
          keeps the swap free of a blank frame or a replayed entrance. */}
      {showDesign && (
        <div
          key="design"
          className={layerClass("design")}
          data-reveal-mode={designRevealed ? "design" : undefined}
          inert={designRevealed || undefined}
        >
          <div className="mode-layer-scroll" ref={designScrollRef}>
            {!isLanding && <div className="starfield" aria-hidden="true" />}
            {/* Landing chrome (title, INDEX, legend) is baked into the concept art;
                hotspots on the landing handle the interactive bits instead. */}
            {!isLanding && <Header />}
            {/* Two layers means two <main>s for as long as the drag lasts; the
                one being revealed is not the document's main landmark yet. */}
            <main id={designRevealed ? undefined : "main"} tabIndex={-1}>
              <Outlet />
            </main>
            {!isLanding && <Footer />}
            <IndexMenu />
            <ContactDialog />
          </div>
        </div>
      )}

      {showBusiness && (
        <div
          key="business"
          className={layerClass("business")}
          data-reveal-mode={businessRevealed ? "business" : undefined}
          inert={businessRevealed || undefined}
        >
          <div className="mode-layer-scroll" ref={businessScrollRef}>
            <Suspense
              fallback={businessRevealed ? null : <div className="mode-loading" />}
            >
              <BusinessPortfolio />
            </Suspense>
          </div>
        </div>
      )}

      <ScrollRestoration />
    </>
  );
}
