import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PlayableGame as PlayableGameData } from "../../data/types";
import { scrollToInstant } from "../../hooks/lenisInstance";
import { dimensionsFor } from "../../data/mediaDimensions";
import { CharacterLayer, mountTouchControls, type LayerState } from "./character-layer";
import InlineMarks from "../game/InlineMarks";
import "./character-layer.css";
import styles from "./PlayableGame.module.css";

/**
 * A game, playable on the page — the same click-to-load pattern as
 * VideoEmbed: until the visitor asks, there is only a poster and a button,
 * so the ~130 MB build costs nothing to anyone just reading.
 *
 * Once it is running, the CharacterLayer listens for the game handing its
 * heroine to the page and walks her over the article. The layer and the
 * touch controls are torn down with this component, so leaving the page
 * leaves nothing behind.
 *
 * The iframe must stay on this site's own origin: both sides of the
 * postMessage handoff reject any other.
 */
export default function PlayableGame({ game }: { game: PlayableGameData }) {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<LayerState>("idle");
  // Phones and tablets load the game and the touch controls work, but no real
  // device has been tested and the textures are desktop-compressed — so they
  // are told so before they spend the download.
  const [coarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const touchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!started || !iframe) return;
    const layer = new CharacterLayer({
      iframe,
      spriteBase: game.sprites,
      returnButton: returnRef.current,
      status: statusRef.current,
      onState: setState,
      // Looked up per call: the project page owns Lenis, and it is the
      // one engine allowed to move the document (CONTEXT § 8).
      lenis: { scrollTo: (y) => scrollToInstant(y) },
    });
    const untouch = touchRef.current ? mountTouchControls(touchRef.current, layer) : () => {};
    return () => {
      untouch();
      layer.destroy();
    };
  }, [started, game.sprites]);

  const showTouch = coarse && (state === "game" || state === "outside");
  const posterSize = dimensionsFor(game.poster);

  return (
    <section className={styles.wrap} aria-label="Play the game">
      <div className={styles.player} data-state={state}>
        {started ? (
          <iframe
            ref={iframeRef}
            className={styles.frame}
            src={game.src}
            title={game.title}
            // The click on Play is the gesture that lets its soundtrack start.
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
            onLoad={(e) => e.currentTarget.focus({ preventScroll: true })}
          />
        ) : (
          <>
            <img
              className={styles.poster}
              src={game.poster}
              alt={game.posterAlt}
              width={posterSize?.[0]}
              height={posterSize?.[1]}
              decoding="async"
            />
            <button type="button" className={styles.start} onClick={() => setStarted(true)}>
              {coarse ? (
                <>
                  <strong>Play anyway</strong>
                  <small>Best on desktop · {game.size}</small>
                </>
              ) : (
                <>
                  <strong>Play in browser</strong>
                  <small>{game.size} · best on a desktop browser</small>
                </>
              )}
            </button>
          </>
        )}
      </div>

      <div className={styles.bar}>
        <span>
          {game.controls.map(([keys, action], i) => (
            <span key={action}>
              {i > 0 && " · "}
              {keys.map((k, j) => (
                <span key={k}>
                  {j > 0 && " / "}
                  <kbd className={styles.kbd}>{k}</kbd>
                </span>
              ))}{" "}
              {action}
            </span>
          ))}
        </span>
        {game.tip && (
          <span>
            <InlineMarks text={game.tip} kbdClass={styles.kbd} />
          </span>
        )}
        <button
          ref={returnRef}
          type="button"
          className={styles.returnBtn}
          hidden={state !== "outside"}
        >
          Send Ilva back inside · Esc
        </button>
      </div>
      <p ref={statusRef} className="sr-only" role="status" aria-live="polite" />

      {/* Fixed to the viewport, so kept out of the article: an ancestor's
          entrance transform would otherwise pin them to the page instead. */}
      {started &&
        createPortal(
          <div
            ref={touchRef}
            className={styles.touch}
            data-visible={showTouch || undefined}
            aria-label="Touch controls"
          >
            <div className={styles.stick} data-touch-stick="" aria-hidden="true">
              <div className={styles.knob} data-touch-knob="" />
            </div>
            <div className={styles.buttons}>
              <button type="button" data-touch-run="" aria-pressed="false">
                Run
              </button>
              <button
                type="button"
                data-touch-press="jump"
                className={state === "outside" ? styles.inert : undefined}
              >
                Jump
              </button>
              <button type="button" data-touch-press="crouch">
                Duck
              </button>
              <button type="button" data-touch-press="interact">
                E
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
