import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorldState {
  /** last orb position in world % coordinates (restored on Return to World) */
  orb: { x: number; y: number };
  /** category ids the visitor has visited */
  explored: string[];
  /** last category the visitor entered (used to place the orb back on return) */
  lastCategoryId: string | null;
  reducedMotion: boolean;
  indexOpen: boolean;
  /** the compose-a-message dialog (hands off to the visitor's mail app) */
  contactOpen: boolean;

  setOrb: (x: number, y: number) => void;
  markExplored: (categoryId: string) => void;
  setLastCategory: (categoryId: string | null) => void;
  setReducedMotion: (v: boolean) => void;
  setIndexOpen: (v: boolean) => void;
  setContactOpen: (v: boolean) => void;
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      orb: { x: 47.7, y: 49.5 }, // start at the central planet
      explored: [],
      lastCategoryId: null,
      reducedMotion: false,
      indexOpen: false,
      contactOpen: false,

      setOrb: (x, y) => set({ orb: { x, y } }),
      markExplored: (categoryId) =>
        set((s) =>
          s.explored.includes(categoryId)
            ? s
            : { explored: [...s.explored, categoryId] },
        ),
      setLastCategory: (categoryId) => set({ lastCategoryId: categoryId }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setIndexOpen: (v) => set({ indexOpen: v }),
      setContactOpen: (v) => set({ contactOpen: v }),
    }),
    {
      name: "mzn-archipelago",
      partialize: (s) => ({
        orb: s.orb,
        explored: s.explored,
        lastCategoryId: s.lastCategoryId,
      }),
    },
  ),
);
