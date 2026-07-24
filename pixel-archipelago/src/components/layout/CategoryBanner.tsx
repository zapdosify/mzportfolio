import { useEffect, useMemo, useRef } from "react";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./CategoryBanner.module.css";

/** How much slower than the page the art travels. Deliberately subtle. */
const FACTOR = 0.28;

export default function CategoryBanner({ src }: { src: string }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);

  const reducedMotion = useMemo(
    () =>
      storeRM ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    [storeRM],
  );

  useEffect(() => {
    if (reducedMotion) return;
    const inner = innerRef.current;
    if (!inner) return;

    let raf = 0;
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      // Once the banner has scrolled well clear there is nothing to move.
      if (y > window.innerHeight * 1.5) return;
      inner.style.setProperty("--banner-y", `${(y * FACTOR).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      // rAF never fires on a hidden document, which would drop the update
      // entirely and leave the banner stale when the tab is shown again.
      if (document.hidden) update();
      else raf = requestAnimationFrame(update);
    };

    update(); // sync to whatever scroll position we mounted at
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div className={styles.banner} aria-hidden="true">
      <div className={styles.inner} ref={innerRef}>
        {/* decorative: the page's <h1> already names the category */}
        <img src={src} alt="" className={`${styles.img} pixelated`} fetchPriority="high" />
        <div className={styles.scrim} />
      </div>
    </div>
  );
}
