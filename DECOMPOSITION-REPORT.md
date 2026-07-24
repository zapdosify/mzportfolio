# Scene Decomposition Feasibility Report
**Pixel Archipelago — flattened images → layered, reusable render architecture**
Prepared 2026-07-20 · Status: **AWAITING APPROVAL — no app changes or asset regeneration performed**

Goal: reconstruct the world from independently-rendered layers (parallax, per-object hover, isolated animation) while **preserving the approved artwork**. This report tests, with real image processing, how much of the existing art can be decomposed before any redraw is considered.

Method: analysed all 24 approved PNGs with Pillow + numpy — luminance histograms, void/content segmentation, connected-component island separability, and **proof-of-concept alpha extraction** (results in `scratchpad/decomp/`).

---

## 1 · Scene Decomposition Analysis (every approved image)

The defining property of this art style: **it is light-on-pure-black**. Measured across all 24 images:

| Band (luminance) | Meaning | Share of pixels |
|---|---|---|
| `< 18` | pure-black **void** (background) | **84–89%** |
| `18–45` | faint fog / dotted routes / far islets | 5–9% |
| `≥ 45` | solid **content** (islands, buildings, labels, planet) | 5–11% |

Mean image luminance is ~11–19 / 255. This is the ideal case for decomposition: **the background is already "empty," so content separates from void by luminance alone** — no ML segmentation or hand-masking required.

Per-image figures for all 24 files are in `scratchpad/decomp/report.json`; they are consistent to within a few percent, so one extraction pipeline serves every scene.

## 2 · Proposed Layer Hierarchy

Reconstruct each scene as a composited stack (matches your parallax spec):

| Layer | Source | Parallax | z | Hover / anim |
|---|---|---|---|---|
| Background void | CSS `--black` fill | — | 0 | — |
| Starfield | **procedural** (generated, not from PNG) | 0.05 | 1 | twinkle |
| Nebula / atmosphere | subtle CSS radial glows | 0.10 | 2 | drift |
| Far islets | extracted **faint band** (18–45) of the PNG | 0.20 | 3 | — |
| Midground islands | island sprites (alpha-extracted) | 0.40 | 4 | glow |
| **Main islands / landmarks** | **island sprites (alpha-extracted)** | 0.70 | 5 | **glow + hover + float** |
| Central planet | extracted planet sprite (or replaced by live orb) | 0.5 | 6 | — |
| Orb navigator | live canvas (already built) | 1.0 | 7 | interactive |
| HUD (name, index, nameplates) | **DOM text** (already built) | fixed | 8 | interactive |

Bridges/dotted routes and foreground rocks are addressed in §5.

## 3 · Asset Extraction Plan (pipeline, uses existing art only)

1. **Luminance → alpha**: `A = clip((L − 10)/245, 0, 1)^1.1`. Verified — turns the 84–89% void fully transparent while preserving content and its soft glow (which fades to transparent naturally, so composites look native, not "cut out").
2. **Landing world map** → split into **13 island sprites + 1 planet sprite** by cropping position-windows at each island's known % coordinate (the same coordinates already in `categories.ts`). Verified on 4 samples (App Design, Website Design, Renders, Contact) — each island isolates cleanly.
3. **Category interiors** → extract the hero island from the cleaner `landmark.png` (not the `page-preview.png`, whose baked UI panels we already replace with DOM).
4. **Faint layer** (optional) → extract the 18–45 band as one low-opacity "far islets + routes" sprite for depth.
5. Trim each sprite to its content bounding box; record anchor `x%,y%,w,h`, `parallax`, `z` into a **`world-manifest.json`**.
6. React composites the manifest as layered elements; parallax driven by orb/pointer offset. **No pixel is redrawn.**

Output: ~14 island/planet PNGs (landing) + 13 landmark PNGs (interiors) + 1 faint layer, all derived from approved art.

## 4 · Successfully Reusable Elements (verified)

- ✅ **Full-scene content/void separation** — proven (see `verify_landing.png`: void fully transparent over a checkerboard).
- ✅ **All 13 islands as independent sprites** — separated by void; crop-by-position is reliable.
- ✅ Central **planet & orb glow**, **star specks**, **baked nameplate labels**, **UI mini-panels on islands** — all preserved inside their island sprite.
- ✅ Soft **glow halos** — extract as semi-transparent alpha, composite naturally.
- ✅ Every category **landmark.png** hero island — same pipeline.

**Effectively 100% of the approved pixels are preserved and reused.** Decomposition is fully achievable **down to the island level**, automatically, with zero regeneration.

## 5 · Problematic Elements (cannot be cleanly isolated)

These are **granularity** limits, not reuse limits — the pixels are kept; they just can't be split into finer independent objects from a flat raster:

| # | Element | Why it can't be auto-isolated |
|---|---|---|
| P1 | **Sub-island parts** (building vs foreground rock vs stairs vs bridge *within one island*) | Same luminance range and spatially contiguous — no depth/edge cue to separate them. |
| P2 | **Inter-island bridges / dotted routes** | Faint (18–45 band), thin, and overlap the void; extractable only as one low-fidelity "faint" layer, not as crisp individual bridges. |
| P3 | **Shared atmospheric fog / shadows** | Blended (screen/multiply) into the scene; extracting leaves halos/holes. |
| P4 | **Baked nameplate text as a separable object** | Bakes into the island sprite. (Non-issue: we already render live DOM nameplates and can mask the baked text if desired.) |
| P5 | **True 3D perspective** | Each AI island has a slightly different implied camera — fine for 2.5D billboard parallax, wrong for real 3D. |

## 6 · Recommended Solution per Problematic Element

| # | Recommendation |
|---|---|
| P1 | **No redraw needed for the current design.** Treat each island as one billboard sprite — this already delivers parallax, hover, and float animation per island. Only if you later want *within-island* motion (e.g. a bridge lighting independently) would targeted redraws help — **defer until requested.** |
| P2 | Use the **procedural route layer**: draw bridges/orbital dotted lines as crisp SVG/canvas between island anchors (better looking and animatable than the faint extraction). Keep the faint extraction only as optional background depth. |
| P3 | **Replace with procedural fog** (CSS/canvas radial gradients) — cheaper, animatable, and avoids extraction holes. |
| P4 | **Mask baked labels** out of island sprites (known positions) so the live DOM nameplates are the single source — improves accessibility and crispness. Minor, optional. |
| P5 | Keep **2.5D billboard parallax** (subtle). No 3D reconstruction. Matches your "subtle, cinematic — do not exaggerate" note. |

**None of these require regenerating the approved artwork.** Bridges and fog become *procedural additions*, not replacements.

## 7 · Estimated Reusable Artwork

- **Pixel/content reuse: ~100%** — every lit pixel of the approved art is preserved.
- **Automatic decomposition granularity achieved: island-level (13/13 islands + planet + per-category landmark).**
- **Not auto-extractable: sub-island parts (~0% automatic)** — but judged **unnecessary** for the approved design; procedural layers cover bridges/fog/routes better.

**Bottom line: the approved artwork is sufficient. We can move to a fully layered, parallaxed, per-object-interactive architecture using existing assets only — no asset regeneration required.**

---

## Proposed next step (needs your approval)
On approval I will, **using existing art only**:
1. Add the extraction pipeline (`scripts/extract-layers.py`) → island/planet sprites + `world-manifest.json`.
2. Rebuild the landing as a **layered composited scene** (procedural starfield + fog + faint depth, alpha island sprites, procedural bridges, live orb, DOM HUD) with subtle parallax and per-island hover/float — replacing the single flattened `archipelago-home.png`.
3. Apply the same island-sprite treatment to category-page heroes.

No redraws. If, later, you want sub-island animation (P1), I'll return with a specific, minimal redraw proposal for just those pieces — never a blanket regeneration.
