import { create } from "zustand";
import { scrollToInstant } from "./lenisInstance";

/**
 * Portfolio mode — the two worlds this site holds.
 *
 * `design` is the existing Pixel Archipelago (routed, dark, explorable).
 * `business` is a single continuous landing page (light, editorial).
 *
 * Deliberately NOT a route. Everything about the design portfolio —
 * which page you were on, how far you had scrolled, the orb's position,
 * which islands you had explored — survives a trip to business mode and
 * back, because the URL never changes and the store is untouched. That
 * reliability was the priority; a shareable /business URL was not asked
 * for and would have cost it.
 */
export type PortfolioMode = "design" | "business";

/* Transition: content dissolves out, swaps, and rises back in, while the
   header and the mode switch stay put and let their colours interpolate
   across the whole span. 620ms end to end. */
export const MODE_OUT_MS = 260;
export const MODE_IN_MS = 360;
export const MODE_TOTAL_MS = MODE_OUT_MS + MODE_IN_MS;

const STORAGE_KEY = "mzn-portfolio-mode";

interface ModeState {
  /** the mode whose content is mounted right now */
  mode: PortfolioMode;
  /** where the switch is pointing — leads `mode` during a transition */
  target: PortfolioMode;
  /** true for the length of the crossfade */
  switching: boolean;
  /**
   * The mode mounted *underneath* the live one while the switch is being
   * dragged, so the destination portfolio is revealed continuously instead of
   * appearing on release. Null whenever no drag is in flight — the second
   * portfolio is not mounted at rest.
   */
  preview: PortfolioMode | null;
  setMode: (m: PortfolioMode) => void;
  _commit: (m: PortfolioMode) => void;
  _settle: () => void;
  /** Mount `m` underneath. Called once, when a drag passes its slop. */
  beginPreview: (m: PortfolioMode) => void;
  /** Drop it again — the drag came back short of the threshold. */
  cancelPreview: () => void;
  /** The drag crossed: `m` is already covering the viewport, so swap now. */
  commitPreview: (m: PortfolioMode) => void;
}

/** First-time visitors always start in Design (the signature experience).
 *  A returning visitor resumes the mode they left in — but only at the
 *  root. A deep link into a design page must show that design page. */
function initialMode(): PortfolioMode {
  if (typeof window === "undefined") return "design";
  if (window.location.pathname !== "/") return "design";
  try {
    return localStorage.getItem(STORAGE_KEY) === "business" ? "business" : "design";
  } catch {
    return "design";
  }
}

/* Kept outside React so they survive every re-render. */
const scrollMemory: Record<PortfolioMode, number> = { design: 0, business: 0 };

/** Where a mode was left. The drag reveal needs it twice: to show the hidden
 *  portfolio at the position it will actually land on, and to put the document
 *  there on the frame the swap happens. */
export const rememberedScroll = (m: PortfolioMode) => scrollMemory[m] ?? 0;

/** The switch always lands on a portfolio's homepage, so a route change to it
 *  invalidates whatever scroll that mode had remembered. */
export const forgetScroll = (m: PortfolioMode) => {
  scrollMemory[m] = 0;
};
let swapTimer: number | null = null;
let settleTimer: number | null = null;

function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const useModeStore = create<ModeState>()((set, get) => {
  const start = initialMode();
  return {
    mode: start,
    target: start,
    switching: false,
    preview: null,

    _commit: (m) => set({ mode: m }),
    _settle: () => set({ switching: false }),

    beginPreview: (m) => {
      const { target, preview, switching } = get();
      if (switching || m === target || preview === m) return;
      set({ preview: m });
    },

    cancelPreview: () => {
      if (get().preview) set({ preview: null });
    },

    commitPreview: (next) => {
      const { target } = get();
      // The outgoing mode is still the one owning the document scroll.
      scrollMemory[target] = window.scrollY;

      if (swapTimer) window.clearTimeout(swapTimer);
      if (settleTimer) window.clearTimeout(settleTimer);
      swapTimer = null;
      settleTimer = null;

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the switch still works, it just won't be remembered */
      }

      // No crossfade: the drag has already performed the transition, and the
      // destination is covering the viewport at full opacity. Anything else
      // here would be a second transition on top of the one the visitor made.
      set({ mode: next, target: next, preview: null, switching: false });
    },

    setMode: (next) => {
      const { target } = get();
      if (next === target) return;

      // Remember where the outgoing mode was, so returning to it lands
      // exactly where the visitor left off.
      scrollMemory[target] = window.scrollY;

      if (swapTimer) window.clearTimeout(swapTimer);
      if (settleTimer) window.clearTimeout(settleTimer);

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the switch still works, it just won't be remembered */
      }

      const restoreScroll = () => {
        // Wait a frame so the incoming tree has laid out before we scroll it.
        // Routed through the smooth-scroll helper: when business mode is the
        // incoming half, Lenis owns the scroll position and a raw
        // `window.scrollTo` is undone on its next frame.
        requestAnimationFrame(() => scrollToInstant(scrollMemory[next] ?? 0));
      };

      if (prefersReduced()) {
        set({ target: next, mode: next, switching: false, preview: null });
        restoreScroll();
        return;
      }

      // `target` moves now (the chrome starts interpolating immediately);
      // `mode` follows once the outgoing content has faded.
      set({ target: next, switching: true, preview: null });
      swapTimer = window.setTimeout(() => {
        get()._commit(next);
        restoreScroll();
        swapTimer = null;
      }, MODE_OUT_MS);
      settleTimer = window.setTimeout(() => {
        get()._settle();
        settleTimer = null;
      }, MODE_TOTAL_MS);
    },
  };
});
