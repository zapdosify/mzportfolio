import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectMedia } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import styles from "./Lightbox.module.css";

/** Below this ratio an asset is a long "scroll sheet" — fitted to width, scrolled. */
const TALL_LIMIT = 0.35;

export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: ProjectMedia[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  /** false = fit to screen, true = 1:1 with the asset's real pixels (pan by drag) */
  const [zoomed, setZoomed] = useState(false);

  const count = items.length;
  const media = items[index];
  const hasNav = count > 1;

  const go = useCallback(
    (delta: number) => onNavigate((index + delta + count) % count),
    [index, count, onNavigate],
  );

  // Every new asset starts fitted, and the pan position resets with it.
  useEffect(() => {
    setZoomed(false);
    viewportRef.current?.scrollTo(0, 0);
  }, [index]);

  // Remember what to focus on close, and move focus into the dialog on open.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    return () => restoreFocusRef.current?.focus?.();
  }, []);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toggleZoom = useCallback(() => setZoomed((z) => !z), []);

  // Zooming in centres the view horizontally, so the magnified detail is what
  // was already in the middle of the frame rather than the top-left corner.
  // Vertically it stays at the top: these assets are read downward.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !zoomed) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = 0;
  }, [zoomed]);

  // Keyboard: Esc closes, arrows navigate (fitted only — while zoomed they pan),
  // Z toggles zoom, Tab is trapped inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        toggleZoom();
      } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && hasNav && !zoomed) {
        e.preventDefault();
        go(e.key === "ArrowRight" ? 1 : -1);
      } else if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, hasNav, onClose, toggleZoom, zoomed]);

  // Touch swipe navigates — but only while fitted, so panning a zoomed asset
  // never jumps to the next one.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || !hasNav || zoomed) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  // Drag to pan while zoomed.
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!zoomed || e.pointerType === "touch") return; // touch pans natively
    const el = viewportRef.current;
    if (!el) return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = viewportRef.current;
    if (!drag.current || !el) return;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    viewportRef.current?.releasePointerCapture?.(e.pointerId);
  };

  if (!media) return null;

  const dims = dimensionsFor(media.type === "video" ? media.poster : media.src);
  const aspect = dims ? dims[0] / dims[1] : undefined;
  const isTall = aspect !== undefined && aspect < TALL_LIMIT;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={media.alt ? `${media.alt} — enlarged` : "Enlarged image"}
      ref={dialogRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.bar}>
        <span className={styles.counter}>
          {hasNav ? `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}` : ""}
        </span>
        <div className={styles.barActions}>
          <button
            className={styles.iconBtn}
            onClick={toggleZoom}
            aria-pressed={zoomed}
            aria-label={zoomed ? "Fit image to screen" : "Zoom to full size"}
            title={zoomed ? "Fit to screen (Z)" : "Zoom to full size (Z)"}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path
                d={zoomed ? "M7.5 10.5h6" : "M7.5 10.5h6M10.5 7.5v6"}
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
            </svg>
          </button>
          <button ref={closeBtnRef} className={styles.iconBtn} onClick={onClose} aria-label="Close viewer">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {hasNav && !zoomed && (
        <button
          className={`${styles.nav} ${styles.prev}`}
          onClick={() => go(-1)}
          aria-label="Previous image"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </button>
      )}

      <div
        ref={viewportRef}
        className={`${styles.viewport} ${zoomed ? styles.zoomed : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={(e) => {
          // Clicking the empty area around the asset closes.
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <figure className={`${styles.stage} ${isTall && !zoomed ? styles.tall : ""}`}>
          <img
            key={media.src}
            className={styles.image}
            src={media.src}
            alt={media.alt ?? ""}
            width={dims?.[0]}
            height={dims?.[1]}
            decoding="async"
            draggable={false}
            onClick={toggleZoom}
          />
          {media.caption && <figcaption className={styles.caption}>{media.caption}</figcaption>}
        </figure>
      </div>

      {hasNav && !zoomed && (
        <button
          className={`${styles.nav} ${styles.next}`}
          onClick={() => go(1)}
          aria-label="Next image"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </button>
      )}
    </div>
  );
}
