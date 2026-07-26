import { useEffect, useRef, useState } from "react";
import type { AmbientVideo } from "../../data/types";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./LoopVideo.module.css";

/**
 * A silent, looping motion piece that fills whatever frame it is given — used
 * for a project hero's title sequence, and for the animated chapter cards that
 * stand in for still spreads inside a board deck.
 *
 * Decorative motion, so it follows the rules for decorative motion:
 *   · muted + loop + playsInline, so browsers allow autoplay
 *   · only plays while on screen (IntersectionObserver) — off-screen video is a
 *     pointless drain on battery and decode budget, and a deck can hold eight
 *   · under reduced motion it does NOT autoplay; the poster shows and real
 *     controls appear, so the content is still reachable
 */
export default function LoopVideo({ video }: { video: AmbientVideo }) {
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
      {/* These sequences open on their own artwork, and the `poster` attribute
          stops applying once any frame decodes — so a browser that defers or
          suspends autoplay is left showing whatever frame it stopped on. This
          keeps the poster over the video while it is not running, so a card
          that isn't playing is indistinguishable from a still spread. */}
      {idle && video.poster && (
        <img className={styles.poster} src={video.poster} alt="" aria-hidden="true" />
      )}
    </div>
  );
}
