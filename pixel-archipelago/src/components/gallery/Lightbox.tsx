import { useCallback, useEffect, useRef } from "react";
import type { ProjectMedia } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import styles from "./Lightbox.module.css";

/** Below this ratio an asset is a long "scroll sheet" — shown scrollable, not shrunk. */
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

  const count = items.length;
  const media = items[index];
  const hasNav = count > 1;

  const go = useCallback(
    (delta: number) => onNavigate((index + delta + count) % count),
    [index, count, onNavigate],
  );

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

  // Keyboard: Esc closes, arrows navigate, Tab is trapped inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" && hasNav) {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" && hasNav) {
        e.preventDefault();
        go(-1);
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
  }, [go, hasNav, onClose]);

  // Touch swipe to navigate.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || !hasNav) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
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
      onClick={(e) => {
        // Click on the backdrop (not the image or controls) closes.
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.bar}>
        <span className={styles.counter}>
          {hasNav ? `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}` : ""}
        </span>
        <button ref={closeBtnRef} className={styles.iconBtn} onClick={onClose} aria-label="Close viewer">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </button>
      </div>

      {hasNav && (
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

      <figure className={`${styles.stage} ${isTall ? styles.tall : ""}`}>
        <img
          key={media.src}
          className={styles.image}
          src={media.src}
          alt={media.alt ?? ""}
          width={dims?.[0]}
          height={dims?.[1]}
          decoding="async"
        />
        {media.caption && <figcaption className={styles.caption}>{media.caption}</figcaption>}
      </figure>

      {hasNav && (
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
