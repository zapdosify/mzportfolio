import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useModeStore, type PortfolioMode } from "../../hooks/useModeStore";
import styles from "./ModeSwitch.module.css";

const OPTIONS: { mode: PortfolioMode; label: string }[] = [
  { mode: "design", label: "Design" },
  { mode: "business", label: "Business Analytics" },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Two-position mode switch — the one piece of chrome that belongs to both
 * portfolios. It is fixed at the top centre and never moves, so it stays
 * anchored while everything underneath it dissolves and swaps.
 *
 * Click a label, drag the pill, tap, or use the arrow keys. It is a real
 * `radiogroup` with roving tabindex, so assistive tech announces it as
 * "Design, 1 of 2" rather than as two unrelated buttons.
 *
 * The pill's position AND width are interpolated from measured button
 * geometry (`--k0x/--k0w/--k1x/--k1w`), so the two halves can be sized by
 * their own labels instead of forced to equal columns — which is what lets
 * it stay compact down to a 320px screen.
 */
export default function ModeSwitch() {
  const target = useModeStore((s) => s.target);
  const setMode = useModeStore((s) => s.setMode);

  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const dragRef = useRef<{ id: number; startX: number; moved: boolean } | null>(null);

  const pos = drag ?? (target === "business" ? 1 : 0);

  /* Measure the two halves and hand the geometry to CSS. Re-measured on
     resize and on font load, both of which change label widths. */
  const measure = useCallback(() => {
    const track = trackRef.current;
    const a = btnRefs.current[0];
    const b = btnRefs.current[1];
    if (!track || !a || !b) return;
    track.style.setProperty("--k0x", String(a.offsetLeft));
    track.style.setProperty("--k0w", String(a.offsetWidth));
    track.style.setProperty("--k1x", String(b.offsetLeft));
    track.style.setProperty("--k1w", String(b.offsetWidth));
  }, []);

  useLayoutEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    // Montserrat/IBM Plex land after first paint; the labels change width.
    document.fonts?.ready.then(measure).catch(() => {});
  }, [measure]);

  /** Pointer x → 0..1, where 0 is the centre of Design and 1 the centre of
   *  Business Analytics. A plain tap therefore resolves to the label under
   *  the finger, and a drag tracks it continuously. */
  const fracFromX = (clientX: number) => {
    const track = trackRef.current;
    const a = btnRefs.current[0];
    const b = btnRefs.current[1];
    if (!track || !a || !b) return pos;
    const r = track.getBoundingClientRect();
    const c0 = a.offsetLeft + a.offsetWidth / 2;
    const c1 = b.offsetLeft + b.offsetWidth / 2;
    if (c1 === c0) return pos;
    return clamp01((clientX - r.left - c0) / (c1 - c0));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { id: e.pointerId, startX: e.clientX, moved: false };
    try {
      trackRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* no live pointer to capture — the drag still works off the events */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    // A few pixels of slop so a click stays a click (and animates smoothly)
    // instead of snapping the pill under the cursor.
    if (!d.moved && Math.abs(e.clientX - d.startX) < 4) return;
    d.moved = true;
    setDrag(fracFromX(e.clientX));
  };

  const endDrag = (e: React.PointerEvent, commit: boolean) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const frac = commit ? fracFromX(e.clientX) : pos;
    setDrag(null);
    if (commit) setMode(frac >= 0.5 ? "business" : "design");
  };

  /* Warm the business chunk the moment the visitor shows intent, so the
     first switch is as instant as every one after it. Same specifier as
     RootLayout's lazy import, so Vite resolves it to the same chunk. */
  const warmed = useRef(false);
  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    import("../business/BusinessPortfolio").catch(() => {
      warmed.current = false;
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: PortfolioMode | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "Home") next = "design";
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "End") next = "business";
    if (!next) return;
    e.preventDefault();
    setMode(next);
    btnRefs.current[next === "business" ? 1 : 0]?.focus();
  };

  return (
    <div className={`mode-dock ${styles.dock}`}>
      <div
        ref={trackRef}
        className={`${styles.track} ${drag !== null ? styles.dragging : ""}`}
        data-mode={target}
        role="radiogroup"
        aria-label="Portfolio mode"
        style={{ ["--pos" as string]: pos }}
        onPointerEnter={warm}
        onFocusCapture={warm}
        onPointerDown={(e) => {
          warm();
          onPointerDown(e);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
        onKeyDown={onKeyDown}
      >
        <span className={styles.indicator} aria-hidden="true" />
        {OPTIONS.map((o, i) => (
          <button
            key={o.mode}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={target === o.mode}
            tabIndex={target === o.mode ? 0 : -1}
            className={`${styles.option} ${target === o.mode ? styles.on : ""}`}
            onClick={() => setMode(o.mode)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {/* Announced on change; the switch itself keeps focus. */}
      <p className="sr-only" aria-live="polite">
        {target === "business" ? "Business Analytics portfolio" : "Design portfolio"}
      </p>
    </div>
  );
}
