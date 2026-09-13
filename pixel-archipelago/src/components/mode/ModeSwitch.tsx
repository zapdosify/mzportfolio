import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { forgetScroll, useModeStore, type PortfolioMode } from "../../hooks/useModeStore";
import { INTRO_SEEN_KEY } from "../../pages/Landing/introKey";
import {
  basePos,
  EASE_GLIDE,
  EASE_SETTLE,
  getModePos,
  setModePos,
  stopModePos,
  tweenModePos,
} from "./modePos";
import styles from "./ModeSwitch.module.css";

const OPTIONS: { mode: PortfolioMode; label: string }[] = [
  { mode: "design", label: "Design" },
  { mode: "business", label: "Business Analytics" },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const other = (m: PortfolioMode): PortfolioMode =>
  m === "business" ? "design" : "business";

/* Matches the pill's own `transform 460ms var(--ease-out)`: a release is the
   same settle it has always been, now with the reveal locked to it. */
const SETTLE_MS = 460;

/* A slide under its own power is a different thing from a release. It crosses
   the whole viewport from a standing start and it is the only chance to watch
   the glass thin out, so it is given about twice the time — paced by distance,
   so a change of mind half way back does not drag. */
const GLIDE_MS = 920;
const GLIDE_MIN_MS = 340;

/** The business chunk, once it has actually arrived. The reveal shows the real
 *  component, so it cannot start until there is something to show. Module
 *  scope, not a ref: one fetch per tab, not per mount. */
let businessReady = false;
let businessChunk: Promise<unknown> | null = null;

/* Same specifier as RootLayout's lazy import, so Vite resolves it to the same
   chunk. Called the moment the visitor shows intent — hover, focus, or the
   press that starts a drag — and, before any of that, once on idle.

   Intent is not enough on its own. The switch pulls five files — the page,
   its CSS, SplitWords and its CSS, and GSAP, ~69 kB. Vite preloads them in
   parallel, so this is not a waterfall; the problem is simply that ALL of
   them have to arrive before React can render anything, and until they do the
   Suspense fallback is an empty viewport with the crossfade already running.
   Off a dev server that is a few milliseconds from local disk. Over a real
   connection it is the entire visible lag, and a hover 200ms ahead of the
   click does not cover it. Fetching on idle moves it into dead time, seconds
   before anyone reaches for the switch. */
function warmBusiness(): Promise<unknown> {
  if (!businessChunk) {
    businessChunk = import("../business/BusinessPortfolio").then(
      () => {
        businessReady = true;
      },
      () => {
        businessChunk = null; // let the next hover try again
      },
    );
  }
  return businessChunk;
}

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
 *
 * Dragging it does not wait for the release: the destination portfolio is
 * mounted underneath and revealed by a seam pinned to `--mode-pos`, so half a
 * drag is half of each page. See `modePos.ts` and RootLayout.
 */
export default function ModeSwitch() {
  const target = useModeStore((s) => s.target);
  const switching = useModeStore((s) => s.switching);
  const setMode = useModeStore((s) => s.setMode);
  const preview = useModeStore((s) => s.preview);
  const beginPreview = useModeStore((s) => s.beginPreview);
  const cancelPreview = useModeStore((s) => s.cancelPreview);
  const commitPreview = useModeStore((s) => s.commitPreview);

  const navigate = useNavigate();
  const location = useLocation();

  /* Pull the other portfolio during idle time, so the first switch is not
     paying for five chained requests at the moment it is asked for.
     `requestIdleCallback` will not fire while the landing's intro is still
     animating, so this cannot compete with the art for the main thread; the
     timeout is the backstop for a page that never goes idle.

     Skipped on a metered or very slow connection, where 69 kB of a portfolio
     the visitor may never open is not a trade worth making for them. Hover,
     focus and press still warm it there — the behaviour this replaces. */
  useEffect(() => {
    if (target !== "design" || businessReady) return;
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /2g$/.test(conn.effectiveType)) return;

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => warmBusiness(), { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(warmBusiness, 2000);
    return () => window.clearTimeout(id);
  }, [target]);

  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /* Only WHETHER a drag is running, never where it is: the position lives in
     `--mode-pos`, so following the finger costs no React work at all. */
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    id: number;
    startX: number;
    moved: boolean;
    from: PortfolioMode;
    dest: PortfolioMode;
    revealing: boolean;
  } | null>(null);
  /* When a pointer made the choice. Pointer capture usually retargets the
     click that follows to the track rather than the label, but not on every
     platform — so a click this close behind a pointerup is the tail of it,
     not a second choice. Keyboard activation arrives with no pointer behind
     it and is always honoured. */
  const handledAt = useRef(0);

  const restPos = basePos(target);

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

  // A settle still running when this unmounts would keep writing to <html>.
  useEffect(() => stopModePos, []);

  /** Pointer x -> 0..1, where 0 is the centre of Design and 1 the centre of
   *  Business Analytics. A plain tap therefore resolves to the label under
   *  the finger, and a drag tracks it continuously. */
  const fracFromX = (clientX: number) => {
    const track = trackRef.current;
    const a = btnRefs.current[0];
    const b = btnRefs.current[1];
    if (!track || !a || !b) return getModePos();
    const r = track.getBoundingClientRect();
    const c0 = a.offsetLeft + a.offsetWidth / 2;
    const c1 = b.offsetLeft + b.offsetWidth / 2;
    if (c1 === c0) return getModePos();
    return clamp01((clientX - r.left - c0) / (c1 - c0));
  };

  /**
   * The Design half always means the design homepage — from a category index,
   * from business mode, from anywhere. Returns whether a navigation happened.
   *
   * `quiet` is for the case where the design portfolio is not on screen (we
   * are in business mode): the URL is corrected in place, so no history entry
   * is added and the page the visitor is looking at does not move.
   */
  const goDesignHome = useCallback(
    (quiet: boolean) => {
      if (location.pathname === "/") return false;
      navigate("/", { replace: quiet, preventScrollReset: quiet });
      // Whatever interior page that remembered scroll belonged to, it is not
      // where this is going any more.
      forgetScroll("design");
      return true;
    },
    [location.pathname, navigate],
  );

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Whether the destination can be shown underneath while the drag runs.
   * Both answers are about honesty rather than taste: with nothing real to
   * reveal, the switch falls back to the crossfade it has always had instead
   * of wiping a blank panel across the screen.
   */
  const canReveal = (dest: PortfolioMode) => {
    if (switching) return false;
    if (dest === "business") return businessReady;
    // The design side reveals the landing, and the landing raises the galaxy
    // intro on its first run of a tab — a curtain that would hide the switch
    // the visitor is mid-drag on. Only reveal once that has been seen.
    try {
      return !!sessionStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      return false;
    }
  };

  /**
   * Run the seam to `landing` and settle there — commit if it is the other
   * portfolio, drop the reveal if it is the one we started in.
   *
   * Every way of working the switch ends here: a released drag, a click, a
   * tap, an arrow key. `powered` is the one thing that separates them. A
   * release carries the visitor's own momentum and keeps the switch's original
   * 460ms ease-out; a slide that starts from rest is slower, eased at both
   * ends, and paced by how far it actually has to travel.
   */
  const settleTo = useCallback(
    (landing: PortfolioMode, powered: boolean) => {
      const to = basePos(landing);
      const ms = reduced()
        ? 0
        : powered
          ? Math.max(GLIDE_MIN_MS, GLIDE_MS * Math.abs(to - getModePos()))
          : SETTLE_MS;
      tweenModePos(to, ms, powered ? EASE_GLIDE : EASE_SETTLE, () => {
        if (landing === target) cancelPreview();
        else commitPreview(landing);
        setDragging(false);
      });
    },
    [cancelPreview, commitPreview, target],
  );

  /**
   * A deliberate choice of one half — click, tap or arrow key. The
   * destination portfolio is mounted underneath and the seam is driven
   * across it on the clock, so pressing a label plays the same reveal a drag
   * does instead of a crossfade.
   */
  const selectMode = useCallback(
    (m: PortfolioMode) => {
      if (m === target) {
        // This half already. If a reveal of the other one is on its way in,
        // this is a change of mind: send it back.
        if (preview) {
          settleTo(target, true);
          return;
        }
        // Otherwise the only thing left to do is be on its homepage.
        if (m === "design") goDesignHome(false);
        return;
      }

      // The other half. Correct the design URL now, while that world is
      // still off screen, so what slides in is what this lands on.
      if (m === "design") goDesignHome(true);

      if (!canReveal(m)) {
        // Nothing real to reveal — the crossfade the switch has always had.
        setMode(m);
        return;
      }

      if (preview !== m) {
        // Seed the seam at the origin before the destination mounts, so its
        // first painted frame is fully clipped. Already mid-gesture (a tap
        // during a slide, a grabbed pill let go), it stays where it is and
        // carries on from there.
        setModePos(basePos(target));
        beginPreview(m);
      }
      setDragging(true);
      settleTo(m, true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beginPreview, goDesignHome, preview, setMode, settleTo, target],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (switching) return;
    // Freezes a slide in flight too: whatever is on screen is now the
    // pointer's to carry.
    stopModePos();
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      moved: false,
      from: target,
      dest: other(target),
      revealing: false,
    };
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
    if (!d.moved) {
      if (Math.abs(e.clientX - d.startX) < 4) return;
      d.moved = true;
      // Seed the seam at the origin BEFORE the destination mounts, so its
      // first painted frame is fully clipped rather than a flash of the
      // whole page.
      setModePos(basePos(d.from));
      if (canReveal(d.dest)) {
        d.revealing = true;
        // Correct the design URL now, while the design portfolio is still
        // off screen — what is revealed has to be what a release lands on.
        if (d.dest === "design") goDesignHome(true);
        beginPreview(d.dest);
      } else if (d.dest === "business" && !switching) {
        // First touch of the tab: there is no hover to have warmed the chunk
        // on. Start the reveal the moment it lands instead of giving this
        // drag no reveal at all — `--mode-pos` is already following the
        // finger, so it arrives correctly clipped rather than flashing in.
        warmBusiness().then(() => {
          if (dragRef.current !== d || !businessReady) return;
          d.revealing = true;
          beginPreview("business");
        });
      }
      setDragging(true);
    }
    setModePos(fracFromX(e.clientX));
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
    handledAt.current = performance.now();

    if (!d.moved) {
      /* A tap. It resolves here rather than in the button's own click,
         because pointer capture retargets that click to the track and the
         label never sees it. `fracFromX` reads which half the pointer came
         up over, so a tap still means the label under the finger. */
      if (commit) selectMode(fracFromX(e.clientX) >= 0.5 ? "business" : "design");
      else if (preview) settleTo(target, true);
      else setDragging(false);
      return;
    }

    // The same threshold the switch has always used — past halfway commits,
    // anything short of it returns to the portfolio the drag started in.
    const frac = commit ? fracFromX(e.clientX) : basePos(d.from);
    const landing: PortfolioMode = frac >= 0.5 ? "business" : "design";

    if (!d.revealing) {
      // No reveal was possible, so this release is the crossfade the switch
      // has always had — but it still lands on the same place a click would.
      setDragging(false);
      if (landing !== d.from) selectMode(landing);
      return;
    }

    // The swap happens on the frame the seam reaches the edge: the landing
    // portfolio is already covering the viewport, so nothing flickers.
    settleTo(landing, false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: PortfolioMode | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "Home") next = "design";
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "End") next = "business";
    if (!next) return;
    e.preventDefault();
    selectMode(next);
    btnRefs.current[next === "business" ? 1 : 0]?.focus();
  };

  return (
    <div className={`mode-dock ${styles.dock}`}>
      <div
        ref={trackRef}
        className={`${styles.track} ${dragging ? styles.dragging : ""}`}
        data-mode={target}
        role="radiogroup"
        aria-label="Portfolio mode"
        /* While a drag is live the pill reads the same variable the reveal
           does, so the two cannot drift apart by even a frame. */
        style={{ ["--pos" as string]: dragging ? "var(--mode-pos)" : String(restPos) }}
        onPointerEnter={warmBusiness}
        onFocusCapture={warmBusiness}
        onPointerDown={(e) => {
          warmBusiness();
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
            onClick={() => {
              // A pointer already resolved this on pointerup; what arrives
              // here that close behind is its own click. Keyboard and
              // assistive-tech activation come through with no pointer.
              if (performance.now() - handledAt.current < 700) return;
              selectMode(o.mode);
            }}
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
