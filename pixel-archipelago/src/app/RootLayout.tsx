import { useEffect } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import IndexMenu from "../components/navigation/IndexMenu";

export default function RootLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  // Move focus to main content on route change (a11y), and crossfade the
  // incoming page up from the shared black background so route swaps never
  // hard-cut (the landing warp settles to the same black). Opacity only —
  // a transform here would re-anchor position:fixed descendants.
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    main.focus({ preventScroll: true });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      main.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    }
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!isLanding && <div className="starfield" aria-hidden="true" />}
      {/* Landing chrome (title, INDEX, legend) is baked into the concept art;
          hotspots on the landing handle the interactive bits instead. */}
      {!isLanding && <Header />}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      {!isLanding && <Footer />}
      <IndexMenu />
      <ScrollRestoration />
    </>
  );
}
