import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ExhibitImage, ExhibitScene, ProjectMedia } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import { useWorldStore } from "../../hooks/useWorldStore";
import Lightbox from "../gallery/Lightbox";
import styles from "./ExhibitScroll.module.css";

/**
 * How much slower than the page a full-bleed plate travels, as a fraction of
 * its own height, and the hard cap on that travel.
 *
 * Both matter. Scaled to the plate's height the drift reads the same on a wide
 * spread and a tall one; the cap stops a very tall plate from drifting far
 * enough to crowd the scene above or below it (the gap between scenes is 96px).
 */
const PARALLAX = 0.1;
const PARALLAX_MAX = 40;

/** Inline aspect from the measured file, so lazy images reserve their space. */
const aspectOf = (src: string) => {
  const d = dimensionsFor(src);
  return d ? { aspectRatio: `${d[0]} / ${d[1]}` } : undefined;
};

/**
 * How narrow an item in a close-up row may get before the row wraps. A pair of
 * mockups wants to stay large; a six-up strip of bookmarks is meant to be read
 * as a set, so it is allowed to go much narrower before breaking.
 *
 * On a phone a pair goes full width, one per row — squeezed to half of 375px a
 * ticket mockup is too small to read, and the min-width clamp would break the
 * proportional widths that give the row its shared height anyway.
 */
const detailMins = (count: number): CSSProperties =>
  ({
    // A wrapped flex row stretches its orphan to full width, so the minimum for
    // a six-up strip is set low enough that six always fit on one line right
    // down to the 640px breakpoint — never 5 + 1.
    "--min": count <= 2 ? "220px" : count <= 3 ? "180px" : "84px",
    "--min-sm": count <= 2 ? "100%" : count <= 3 ? "45%" : "28%",
  }) as CSSProperties;

/**
 * A clickable plate. The frame is the image's own measured aspect, so it is a
 * frame and never a crop.
 *
 * Declared at module level, not inside ExhibitScroll: a component defined in a
 * render body is a new type on every render, so opening the lightbox would
 * remount all 35 plates — throwing away their decoded images and destroying the
 * button the Lightbox needs to restore focus to on close.
 */
function Plate({
  image,
  index,
  onOpen,
  className = "",
  sizeHint,
}: {
  image: ExhibitImage;
  index: number;
  onOpen: (i: number) => void;
  className?: string;
  sizeHint?: string;
}) {
  const dims = dimensionsFor(image.src);
  return (
    <figure className={`${styles.figure} ${className}`}>
      <button
        type="button"
        className={styles.plate}
        style={aspectOf(image.src)}
        onClick={() => onOpen(index)}
        aria-label={`Enlarge: ${image.alt}`}
      >
        <img
          src={image.src}
          alt={image.alt}
          width={dims?.[0]}
          height={dims?.[1]}
          sizes={sizeHint}
          loading="lazy"
          decoding="async"
        />
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
      {image.caption && <figcaption className={styles.caption}>{image.caption}</figcaption>}
    </figure>
  );
}

/**
 * A spatial project, read as a walk.
 *
 * The page is a sequence of scenes rather than a grid of thumbnails: full-bleed
 * plates, alternating image/text spreads, close-up rows and a closing poster
 * gallery, in the order a visitor would meet them. Every image keeps its own
 * true aspect and its own colour — the interface around it stays monochrome.
 *
 * Semantics first: real headings, <figure>/<figcaption>, and an ordered set of
 * <section>s, so the case reads correctly with CSS and JS off. Motion only adds
 * emphasis — a one-shot rise-in per scene and a slow drift on flagged plates,
 * both dropped entirely under reduced motion.
 *
 * Every image across every scene shares one Lightbox, in scene order, so any
 * plate can be opened and zoomed to native pixels.
 */
export default function ExhibitScroll({ scenes }: { scenes: ExhibitScene[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);

  const reduced = useMemo(
    () =>
      storeRM ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    [storeRM],
  );

  // One flat, ordered list of every image in the walk. The lightbox indexes
  // into this, so a plate opened from the last scene still navigates back
  // through the whole case.
  const images = useMemo(() => {
    const out: ExhibitImage[] = [];
    for (const sc of scenes) {
      if (sc.kind === "full" || sc.kind === "split") out.push(sc.image);
      else if (sc.kind === "details" || sc.kind === "plates") out.push(...sc.items);
    }
    return out;
  }, [scenes]);

  const lightboxItems: ProjectMedia[] = useMemo(
    () =>
      images.map((im) => ({
        type: "image" as const,
        src: im.src,
        alt: im.alt,
        caption: im.caption,
      })),
    [images],
  );

  // Index lookup by src — scenes are rendered independently, so each image
  // needs to know where it sits in the flat list without threading a counter
  // through every branch.
  const indexOf = useMemo(() => {
    const m = new Map<string, number>();
    images.forEach((im, i) => {
      if (!m.has(im.src)) m.set(im.src, i);
    });
    return m;
  }, [images]);

  // Publish the viewport width WITHOUT the scrollbar, which the full-bleed
  // scenes break out to. `100vw` counts the scrollbar and would make this the
  // one page on the site wider than its own viewport. Layout effect, so the
  // first paint is already correct; unconditional, since this is layout and
  // not motion.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const setVw = () =>
      el.style.setProperty("--vw", `${document.documentElement.clientWidth}px`);
    setVw();
    window.addEventListener("resize", setVw);
    return () => window.removeEventListener("resize", setVw);
  }, []);

  // Scene reveal + plate parallax. One observer and one scroll listener for the
  // whole case, rather than a hook per scene.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scenesEls = Array.from(
      root.querySelectorAll<HTMLElement>(`[data-scene]`),
    );
    const plates = Array.from(root.querySelectorAll<HTMLElement>(`[data-parallax]`));

    if (reduced) {
      scenesEls.forEach((el) => el.classList.add(styles.shown));
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
      // Fire once the scene is properly into the viewport, not the instant its
      // top edge appears. A full-bleed plate is taller than most of the screen,
      // so a small threshold at the bottom edge meant the 700ms fade finished
      // while the plate was still below the fold — the reveal was over before
      // it was ever looked at. Threshold 0 with a deep bottom margin fires when
      // the top edge crosses ~78% of the viewport, for tall and short alike.
      { rootMargin: "0px 0px -22% 0px", threshold: 0 },
    );
    scenesEls.forEach((el) => reveal.observe(el));

    if (!plates.length) return () => reveal.disconnect();

    let raf = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      for (const el of plates) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        // 0 when the plate's centre is at the viewport centre; ±1 at the edges.
        const centred = (r.top + r.height / 2 - vh / 2) / vh;
        const y = Math.max(
          -PARALLAX_MAX,
          Math.min(PARALLAX_MAX, centred * PARALLAX * r.height),
        );
        el.style.setProperty("--plate-y", `${y.toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      // rAF never fires on a hidden document; run inline so the value can't
      // go stale while the tab is backgrounded.
      if (document.hidden) update();
      else raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      reveal.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced, scenes]);

  if (!scenes.length) return null;

  /** Bound form of the module-level Plate — every plate needs the same two. */
  const plate = (image: ExhibitImage, className?: string, sizeHint?: string) => (
    <Plate
      image={image}
      index={indexOf.get(image.src) ?? 0}
      onOpen={setOpen}
      className={className}
      sizeHint={sizeHint}
    />
  );

  return (
    <div className={styles.wrap} ref={rootRef}>
      {scenes.map((sc, i) => {
        const key = `${sc.kind}-${i}`;

        switch (sc.kind) {
          case "marker":
            return (
              <section key={key} data-scene className={`${styles.scene} ${styles.marker}`}>
                <p className={styles.markerNum} aria-hidden="true">
                  {sc.number}
                </p>
                <div>
                  <h3 className={styles.markerTitle}>{sc.title}</h3>
                  {sc.text && <p className={styles.markerText}>{sc.text}</p>}
                </div>
              </section>
            );

          case "full":
            return (
              <section key={key} data-scene className={`${styles.scene} ${styles.fullScene}`}>
                {/* Every full-bleed plate drifts. It was opt-in at first, which
                    left eight of the ten cinematic beats completely static. */}
                <div className={styles.fullPlate} data-parallax>
                  {plate(sc.image, styles.fullFigure, "100vw")}
                </div>
                {sc.label && <p className={styles.label}>{sc.label}</p>}
              </section>
            );

          case "split":
            return (
              <section
                key={key}
                data-scene
                className={`${styles.scene} ${styles.split} ${
                  sc.side === "right" ? styles.imageRight : styles.imageLeft
                }`}
                aria-labelledby={`${key}-h`}
              >
                <div className={styles.splitMedia}>
                  {plate(sc.image, undefined, "(max-width: 900px) 100vw, 50vw")}
                </div>
                <div className={styles.splitText}>
                  <h3 id={`${key}-h`} className={styles.splitTitle}>
                    {sc.title}
                  </h3>
                  {sc.text.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            );

          case "note":
            return (
              <section
                key={key}
                data-scene
                className={`${styles.scene} ${styles.note}`}
                {...(sc.title ? { "aria-labelledby": `${key}-h` } : {})}
              >
                {sc.title && (
                  <h3 id={`${key}-h`} className={styles.splitTitle}>
                    {sc.title}
                  </h3>
                )}
                {sc.text.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            );

          case "details":
            return (
              <section key={key} data-scene className={styles.scene} aria-labelledby={`${key}-h`}>
                {sc.title && (
                  <h3 id={`${key}-h`} className={styles.rowTitle}>
                    {sc.title}
                  </h3>
                )}
                <ul className={styles.details} style={detailMins(sc.items.length)}>
                  {sc.items.map((im) => {
                    const d = dimensionsFor(im.src);
                    return (
                      <li
                        key={im.src}
                        // Grow in proportion to this item's own aspect against a
                        // zero basis, so a row of mixed shapes shares one height.
                        style={{ "--ar": d ? d[0] / d[1] : 1 } as CSSProperties}
                      >
                        {plate(
                          im,
                          undefined,
                          `(max-width: 640px) 50vw, ${Math.round(100 / sc.items.length)}vw`,
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );

          case "facts":
            return (
              <section key={key} data-scene className={styles.scene} aria-labelledby={`${key}-h`}>
                <h3 id={`${key}-h`} className={styles.rowTitle}>
                  {sc.title}
                </h3>
                <dl className={styles.facts}>
                  {sc.items.map(([k, v]) => (
                    <div key={k} className={styles.fact}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            );

          case "plates":
            return (
              <section key={key} data-scene className={styles.scene} aria-labelledby={`${key}-h`}>
                {sc.title && (
                  <h3 id={`${key}-h`} className={styles.rowTitle}>
                    {sc.title}
                  </h3>
                )}
                <ul className={styles.plates}>
                  {sc.items.map((im) => (
                    <li key={im.src}>
                      {plate(
                        im,
                        undefined,
                        "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw",
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
        }
      })}

      {open !== null && (
        <Lightbox
          items={lightboxItems}
          index={open}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
        />
      )}
    </div>
  );
}
