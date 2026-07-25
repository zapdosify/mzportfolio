import { useState } from "react";
import type { VideoEmbed as VideoEmbedData } from "../../data/types";
import styles from "./VideoEmbed.module.css";

/**
 * A YouTube film, embedded facade-first: until the visitor chooses to play,
 * we render only YouTube's thumbnail and a play control — no iframe, no
 * third-party scripts, no cookies set on their behalf. Clicking loads the
 * player (via youtube-nocookie) and starts it.
 *
 * This keeps the page fast (an idle YouTube iframe costs ~1MB+ of JS) and
 * means simply visiting the page doesn't hand a visitor's data to Google.
 */
export default function VideoEmbed({ embed }: { embed: VideoEmbedData }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${embed.id}/maxresdefault.jpg`;

  return (
    <figure className={styles.frame}>
      <div className={styles.stage}>
        {playing ? (
          <iframe
            className={styles.player}
            src={`https://www.youtube-nocookie.com/embed/${embed.id}?autoplay=1&rel=0`}
            title={embed.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.facade}
            onClick={() => setPlaying(true)}
            aria-label={`Play ${embed.title} on YouTube`}
          >
            <img
              className={styles.thumb}
              src={thumb}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" focusable="false">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className={styles.hint} aria-hidden="true">Play on YouTube</span>
          </button>
        )}
      </div>
      <figcaption className={styles.caption}>
        {embed.title}
        {embed.caption && <span className={styles.sub}>{embed.caption}</span>}
      </figcaption>
    </figure>
  );
}
