import { useEffect, useRef, useState } from "react";
import type { ProjectMedia, StoryBeat } from "../../data/types";
import { useWorldStore } from "../../hooks/useWorldStore";
import Lightbox from "../gallery/Lightbox";
import styles from "./StoryScroll.module.css";

/**
 * The publication, then the address.
 *
 * The printed spreads are shown first, full width and uncropped, in page
 * order — they are a designed artifact and are read as designed. Clicking
 * one opens the shared Lightbox so the print can be read at full size.
 * The speech follows underneath as numbered chapters.
 *
 * Structure is semantic first — an ordered list of <section>s with real
 * headings, so the whole thing reads correctly with CSS and JS off. Motion
 * only adds emphasis:
 *   · a sticky rail tracks reading progress and names the current chapter
 *   · each chapter rises in once as it enters the viewport
 * Both are disabled under reduced motion, where every chapter is visible.
 */
export default function StoryScroll({
  beats,
  spreads = [],
}: {
  beats: StoryBeat[];
  spreads?: ProjectMedia[];
}) {
  const rootRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      storeRM || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(root.children) as HTMLElement[];

    if (reduced) {
      items.forEach((el) => el.classList.add(styles.shown));
      return;
    }

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.shown);
            reveal.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    const track = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = items.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    items.forEach((el) => {
      reveal.observe(el);
      track.observe(el);
    });

    // Reading progress across the speech (rAF-coalesced passive scroll).
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = root.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const done = total > 0 ? -r.top / total : 0;
        setProgress(Math.min(1, Math.max(0, done)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      reveal.disconnect();
      track.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [storeRM, beats]);

  if (!beats.length && !spreads.length) return null;

  return (
    <div className={styles.wrap}>
      {/* ---------- The publication, as printed ---------- */}
      {spreads.length > 0 && (
        <ol className={styles.spreads}>
          {spreads.map((sp, i) => (
            <li key={sp.src} className={styles.spreadItem}>
              <button
                type="button"
                className={styles.spread}
                onClick={() => setOpen(i)}
                aria-label={`Enlarge spread ${i + 1} of ${spreads.length}`}
              >
                <img src={sp.src} alt={sp.alt ?? ""} loading="lazy" decoding="async" />
                <span className={styles.spreadNum} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")} / {String(spreads.length).padStart(2, "0")}
                </span>
                <span className={styles.expand} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                    <path
                      d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                    />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {/* ---------- The address ---------- */}
      {beats.length > 0 && (
        <div className={styles.speech}>
          <div className={styles.speechHead}>
            <h3 className={styles.speechTitle}>The Address</h3>
            <p className={styles.speechNote}>
              Delivered at the Ripple graduate symposium, alongside the publication above.
            </p>
          </div>

          {/* Reading rail — decorative; the headings carry the real structure */}
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.railCount}>
              {String(active + 1).padStart(2, "0")} / {String(beats.length).padStart(2, "0")}
            </span>
            <span className={styles.railTrack}>
              <span className={styles.railFill} style={{ transform: `scaleY(${progress})` }} />
            </span>
            <span className={styles.railLabel}>{beats[active]?.chapter}</span>
          </div>

          <ol className={styles.beats} ref={rootRef}>
            {beats.map((b, i) => (
              <li key={`${b.chapter}-${i}`} className={styles.beat}>
                <section aria-labelledby={`beat-${i}`}>
                  <p className={styles.chapter}>
                    <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                    {b.chapter}
                  </p>
                  <h4 id={`beat-${i}`} className={styles.beatTitle}>
                    {b.title}
                  </h4>

                  <div className={styles.body}>
                    {b.text.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}

                    {b.quote && (
                      <blockquote className={styles.quote}>
                        <p>{b.quote.text}</p>
                        <cite>{b.quote.source}</cite>
                      </blockquote>
                    )}
                  </div>

                  {b.aside && (
                    <p className={styles.aside}>
                      <span aria-hidden="true">✎ </span>
                      {b.aside}
                    </p>
                  )}
                </section>
              </li>
            ))}
          </ol>
        </div>
      )}

      {open !== null && (
        <Lightbox
          items={spreads}
          index={open}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
        />
      )}
    </div>
  );
}
