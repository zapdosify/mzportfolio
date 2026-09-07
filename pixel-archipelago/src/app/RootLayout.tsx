import { Suspense, lazy, useEffect, useRef } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import IndexMenu from "../components/navigation/IndexMenu";
import ContactDialog from "../components/contact/ContactDialog";
import ModeSwitch from "../components/mode/ModeSwitch";
import { useModeStore } from "../hooks/useModeStore";
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

  /**
   * The crossfade half of the mode transition. Opacity ONLY — a transform
   * here would re-anchor every position:fixed descendant (the header, the
   * warp overlay, the modals). The slight positional move lives inside the
   * business page, on its own content.
   */
  const layer = switching
    ? mode === target
      ? "mode-layer mode-in"
      : "mode-layer mode-out"
    : "mode-layer";

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
    if (mode !== "design") return;
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
  }, [location.pathname, mode]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Shared chrome: fixed, top centre, and the one thing that survives
          the transition untouched so the switch never appears to move. */}
      <ModeSwitch />

      {mode === "business" ? (
        <div key="business" className={layer}>
          <Suspense fallback={<div className="mode-loading" />}>
            <BusinessPortfolio />
          </Suspense>
        </div>
      ) : (
        <div key="design" className={layer}>
          {!isLanding && <div className="starfield" aria-hidden="true" />}
          {/* Landing chrome (title, INDEX, legend) is baked into the concept art;
              hotspots on the landing handle the interactive bits instead. */}
          {!isLanding && <Header />}
          <main id="main" tabIndex={-1}>
            <Outlet />
          </main>
          {!isLanding && <Footer />}
          <IndexMenu />
          <ContactDialog />
        </div>
      )}

      <ScrollRestoration />
    </>
  );
}
