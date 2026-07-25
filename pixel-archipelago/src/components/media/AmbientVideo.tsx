import { useEffect, useRef, useState } from "react";
import type { AmbientVideo as AmbientVideoData } from "../../data/types";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./AmbientVideo.module.css";

/**
 * A silent, looping motion piece presented as a full-bleed band — the
 * project's title sequence rather than a video you operate.
 *
 * It is decorative motion, so it follows the rules for decorative motion:
 *   · muted + playsInline + loop, so browsers allow autoplay
 *   · only plays while on screen (IntersectionObserver) — off-screen video
 *     is a pointless drain on battery and decode budget
 *   · under reduced motion it does NOT autoplay; the poster is shown and a
 *     real play control appears, so the content is still reachable
 */
export default function AmbientVideo({ video }: { video: AmbientVideoData }) {
  const ref = useRef<HTMLVideoElement>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isReduced =
      storeRM || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(isReduced);
    if (isReduced) {
      el.pause();
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // play() rejects if the browser defers autoplay — harmless here,
          // the poster stays up and the controls fallback still works.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [storeRM]);

  return (
    <figure className={styles.band}>
      <video
        ref={ref}
        className={styles.video}
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reduced}
        aria-label={video.caption ?? "Looping motion piece"}
      />
      <span className={styles.vignette} aria-hidden="true" />
      {video.caption && <figcaption className={styles.caption}>{video.caption}</figcaption>}
    </figure>
  );
}
