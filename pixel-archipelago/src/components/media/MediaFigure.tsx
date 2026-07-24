import type { ProjectMedia } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import styles from "./MediaFigure.module.css";

/**
 * Below this width/height ratio an asset is a long "scroll sheet" (a whole app
 * flow exported as one tall image). Fitting one to its own aspect would make a
 * ~2000px-tall grid cell, so it gets a bounded, scrollable frame instead —
 * still uncropped, just paged.
 */
const TALL_LIMIT = 0.35;

export default function MediaFigure({
  media,
  className = "",
}: {
  media: ProjectMedia;
  className?: string;
}) {
  // Videos are keyed by their poster, which is exported at the video's own size.
  const measured = dimensionsFor(media.type === "video" ? media.poster : media.src);
  const width = media.width ?? measured?.[0];
  const height = media.height ?? measured?.[1];
  const aspect = width && height ? width / height : undefined;
  const isTall = aspect !== undefined && aspect < TALL_LIMIT;

  // An explicit `ratio` stays an override; otherwise the real asset decides.
  const ratioClass = media.ratio ? styles[media.ratio] : "";

  return (
    <figure className={`${styles.figure} ${ratioClass} ${className}`}>
      <div
        className={`${styles.frame} ${isTall ? styles.tall : ""}`}
        style={!media.ratio && aspect && !isTall ? { aspectRatio: `${width} / ${height}` } : undefined}
      >
        {media.type === "video" ? (
          <video
            className={styles.media}
            src={media.src}
            poster={media.poster}
            width={width}
            height={height}
            controls
            playsInline
            preload="none"
            aria-label={media.alt}
          />
        ) : (
          <img
            className={styles.media}
            src={media.src}
            alt={media.alt ?? ""}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      {media.caption && <figcaption className={styles.caption}>{media.caption}</figcaption>}
      {isTall && (
        <figcaption className={styles.hint}>Scroll to view the full flow</figcaption>
      )}
    </figure>
  );
}
