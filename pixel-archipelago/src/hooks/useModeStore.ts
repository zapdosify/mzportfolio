import { create } from "zustand";

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
  setMode: (m: PortfolioMode) => void;
  _commit: (m: PortfolioMode) => void;
  _settle: () => void;
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

    _commit: (m) => set({ mode: m }),
    _settle: () => set({ switching: false }),

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
        requestAnimationFrame(() =>
          window.scrollTo({ top: scrollMemory[next] ?? 0, behavior: "instant" as ScrollBehavior }),
        );
      };

      if (prefersReduced()) {
        set({ target: next, mode: next, switching: false });
        restoreScroll();
        return;
      }

      // `target` moves now (the chrome starts interpolating immediately);
      // `mode` follows once the outgoing content has faded.
      set({ target: next, switching: true });
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
