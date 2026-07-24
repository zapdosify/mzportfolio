import { useEffect } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import IndexMenu from "../components/navigation/IndexMenu";

export default function RootLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  // Move focus to main content on route change (a11y).
  useEffect(() => {
    const main = document.getElementById("main");
    if (main) main.focus({ preventScroll: true });
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
