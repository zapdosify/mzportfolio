import { useEffect, useRef, useState } from "react";
import type { StoryBeat } from "../../data/types";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./StoryScroll.module.css";

/**
 * A progressive scroll narrative: numbered chapters, each pairing the
 * publication's illustrations with the passage of the speech they carry.
 *
 * Structure is semantic first — an ordered list of <section>s with real
 * headings and <figure>/<figcaption>, so the whole story reads correctly
 * with CSS and JS off. Motion only adds emphasis:
 *   · a fixed rail tracks reading progress and names the current chapter
 *   · each beat rises in once as it enters the viewport (IntersectionObserver,
 *     not scroll handlers — no per-frame work)
 * Both are disabled under reduced motion, where every beat is simply visible.
 */
export default function StoryScroll({ beats }: { beats: StoryBeat[] }) {
  const rootRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
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

    // Reveal each beat once, and track which one owns the viewport centre.
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

    // Reading progress across the whole story (rAF-coalesced passive scroll).
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = root.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const done = total > 0 ? (-r.top) / total : 0;
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

  if (!beats.length) return null;

  return (
    <div className={styles.wrap}>
      {/* Reading rail — decorative; the headings below carry the real structure */}
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
              <h3 id={`beat-${i}`} className={styles.beatTitle}>
                {b.title}
              </h3>

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

              {b.images.length > 0 && (
                <div
                  className={`${styles.plates} ${
                    b.images.length > 1 ? styles.platesMulti : ""
                  }`}
                >
                  {b.images.map((img) => (
                    <figure key={img.src} className={styles.plate}>
                      <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
                    </figure>
                  ))}
                </div>
              )}

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
  );
}
