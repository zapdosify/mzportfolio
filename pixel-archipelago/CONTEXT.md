# Pixel Archipelago — session handoff

## Performance optimization pass (branch `perf/optimize-assets-and-code`)

Committed:

| commit | scope | result |
|---|---|---|
| `df103b4` | dev config port fallback (`autoPort`) | 5173 collisions no longer block `preview` |
| `76332ea` | **CP1** landing first paint | landing art 5.6 MB → 370 KB (lossless WebP); Intro lazy-chunked; fonts non-blocking; also folded in the earlier landing colour/orb work + starfield fix |
| `9840b63` | **CP2** vendor chunk split | app chunk 139 → 51 KB gzip; `react-vendor` (91 KB) + `gsap` (44 KB) cache independently; `ANALYZE=1 npm run build` → `dist/stats.html` |
| `ea4c109` | **CP3** media → WebP | `public/` 415 → 240 MB; 209 images → WebP q88 (downscaled to ≤2560px); dead `worldManifest.json` + `images/islands/*` + 2 unused portraits removed |
| `f2dc37c` | **CP4** code cleanup | `react-router-dom` → `react-router` (drops a dep; ~0 bytes); delete unused `src/world/Starfield.tsx`; tidy `manualChunks` matcher |

Verified per checkpoint: `npm run build` + `oxlint` clean; browser-crawled the
landing, every category page, and the heaviest project pages (avengers
ExhibitScroll, design-manifesto BookScroll, bookbabies / digital-painting
galleries) — no broken images, all `/media` requests serve `image/webp`;
CP4 nav crawl (landing → category → project → back → deep link) clean.

### Optimization pass — closed

- **Videos: left as-is by decision.** At CRF 20 (visually transparent) none of
  the 28 clips re-encoded to even 8 % smaller — they're already efficiently
  encoded; the size is inherent to their length/resolution. Cutting them would
  need a real fidelity trade (CRF ≈ 23 and/or a resolution cap).
  `scripts/reencode-videos.sh` stays in the tree if that's ever revisited.
- `ts-prune` + an orphan-file scan found no other dead exports or unused modules.
- `npm audit` reports pre-existing dep-tree vulnerabilities (not from this work)
  — left for a deliberate `npm audit fix` review.
- Nothing merged — all of the above is on branch `perf/optimize-assets-and-code`.

### Notes / gotchas

- `Colored_Archipelago.webp` is a **fully opaque** frame (black sky included).
  Any layer that draws it over the scene must be masked by `islands.webp`'s
  alpha (see `.colorReveal` / `.colorBurst` / `.colorBase` in
  `Landing.module.css`) or it hides the L0 starfield.
- The archipelago now renders in colour by default (`.colorBase`), so the orb's
  colour-reveal spotlight and click-burst are effectively inert — kept as-is per
  the owner's request. If revisited, they could be removed.
- `mediaDimensions.ts` values were **not** regenerated after the 2560px
  downscale — aspect ratios shift < 0.1%, which is imperceptible for the
  aspect-box layout that consumes them. Regenerate if exact px ever matter.
