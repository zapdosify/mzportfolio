import { useState } from "react";
import type { ProjectMedia } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import MediaFigure from "../media/MediaFigure";
import LoopVideo from "../media/LoopVideo";
import Lightbox from "./Lightbox";
import { useStaggerReveal } from "../../hooks/useStaggerReveal";
import styles from "./Gallery.module.css";

export default function Gallery({
  items,
  variant = "grid",
}: {
  items: ProjectMedia[];
  /**
   * `boards` presents design decks the way the work was made to be read —
   * one board per row at the full column width and its own true aspect,
   * never cropped and never shrunk to a thumbnail.
   */
  variant?: "grid" | "posters" | "cinema" | "boards";
}) {
  const [open, setOpen] = useState<number | null>(null);
  // Staggered rise-in as the gallery scrolls into view (reduced-motion aware).
  // Keyed by the first asset — galleries are reused across sibling routes.
  const gridRef = useStaggerReveal<HTMLUListElement>([items[0]?.src]);
  const cinemaRef = useStaggerReveal<HTMLDivElement>([items[0]?.src]);

  /* No pointer tilt here either. `.tile` already has an authored hover in
     CSS — a 2px lift with the thumbnail scaling to 1.03 inside it — and a
     GSAP tilt on the same elements would be a second system writing
     `transform` over the top of it. */

  if (!items.length) return null;

  // Videos keep their inline players; only images open in the lightbox.
  const images = items.filter((m) => m.type !== "video");

  // Cinema (video) galleries render exactly as before.
  if (variant === "cinema") {
    return (
      <div className={`${styles.gallery} ${styles.cinema}`} ref={cinemaRef}>
        {items.map((m, i) => (
          <MediaFigure key={m.src + i} media={m} />
        ))}
      </div>
    );
  }

  return (
    <>
      <ul className={`${styles.gallery} ${styles[variant]}`} ref={gridRef}>
        {items.map((m, i) => {
          if (m.type === "video") {
            // Inside a deck a video is an animated spread, not something to
            // operate: it plays silently on loop and sits in the run of boards
            // with no player chrome, so the sequence reads unbroken.
            if (variant === "boards") {
              const vd = dimensionsFor(m.poster);
              return (
                <li
                  key={m.src + i}
                  className={styles.boardVideo}
                  style={vd ? { aspectRatio: `${vd[0]} / ${vd[1]}` } : undefined}
                >
                  <LoopVideo video={{ src: m.src, poster: m.poster, caption: m.alt }} />
                </li>
              );
            }
            return (
              <li key={m.src + i} className={styles.videoCell}>
                <MediaFigure media={m} />
              </li>
            );
          }
          const imageIndex = images.indexOf(m);
          // Boards render at their measured size so the browser reserves the
          // right space — a 22-board deck must not shift the page as it loads.
          const dims = variant === "boards" ? dimensionsFor(m.src) : undefined;
          return (
            <li key={m.src + i}>
              <button
                type="button"
                className={styles.tile}
                onClick={() => setOpen(imageIndex)}
                aria-label={`Enlarge${m.alt ? `: ${m.alt}` : " image"}`}
              >
                <img
                  className={styles.thumb}
                  src={m.src}
                  alt={m.alt ?? ""}
                  width={dims?.[0]}
                  height={dims?.[1]}
                  style={dims ? { aspectRatio: `${dims[0]} / ${dims[1]}` } : undefined}
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
                {m.caption && <span className={styles.tileCaption}>{m.caption}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {open !== null && (
        <Lightbox
          items={images}
          index={open}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
        />
      )}
    </>
  );
}
