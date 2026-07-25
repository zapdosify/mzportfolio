import { useEffect, useRef, useState } from "react";
import type { AmbientVideo } from "../../data/types";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./HeroLoop.module.css";

/**
 * A silent, looping title sequence shown in a project hero's art slot, in
 * place of a still cover image.
 *
 * Same rules as AmbientVideo (decorative motion): muted + loop + playsInline so
 * autoplay is allowed, only running while on screen, and under reduced motion it
 * shows the poster with real controls instead of playing by itself.
 */
export default function HeroLoop({ video }: { video: AmbientVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const storeRM = useWorldStore((s) => s.reducedMotion);
  const [reduced, setReduced] = useState(false);
  /** true whenever the sequence is not actually running (never started, paused,
      off-screen, autoplay refused, or stalled) — the poster covers all of them */
  const [idle, setIdle] = useState(true);

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
        // play() rejects when the browser defers autoplay — harmless, the
        // poster stays up.
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [storeRM]);

  return (
    <div className={styles.frame}>
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
        onPlaying={() => setIdle(false)}
        onPause={() => setIdle(true)}
        onWaiting={() => setIdle(true)}
        onStalled={() => setIdle(true)}
        aria-label={video.caption ?? "Looping title sequence"}
      />
      {/* The sequence opens on black, and the `poster` attribute stops applying
          once any frame has been decoded — so a browser that defers or suspends
          autoplay is left showing a black box. This keeps the poster over the
          video for as long as it is not actually running. */}
      {idle && video.poster && (
        <img className={styles.poster} src={video.poster} alt="" aria-hidden="true" />
      )}
    </div>
  );
}
