# Pixel Archipelago — session handoff

Everything below is **on `main`** (the perf branch was merged; the business work
was committed straight to `main`). Working tree clean, `npm run build` green.

---

## 1 · Performance optimization pass — done & merged

Merge commit `691ef66` brought in branch `perf/optimize-assets-and-code`:

| commit | scope | result |
|---|---|---|
| `df103b4` | dev config | `autoPort` fallback so port 5173 collisions don't block `preview` |
| `76332ea` | **CP1** landing first paint | landing art 5.6 MB → 370 KB (lossless WebP); Intro lazy-chunked; fonts non-blocking; folded in the earlier landing colour/orb work + starfield fix |
| `9840b63` | **CP2** vendor chunk split | app chunk 139 → 51 KB gzip; `react-vendor` (91 KB) + `gsap` (44 KB) cache independently; `ANALYZE=1 npm run build` → `dist/stats.html` |
| `ea4c109` | **CP3** media → WebP | `public/` 415 → 240 MB; 209 images → WebP q88 (downscaled ≤2560px); dead `worldManifest.json` + `images/islands/*` + 2 unused portraits removed |
| `f2dc37c` | **CP4** code cleanup | `react-router-dom` → `react-router` (drops a dep, ~0 bytes); deleted unused `src/world/Starfield.tsx`; tidied the `manualChunks` matcher |

- **Videos left as-is by decision** — at CRF 20 none of the 28 clips re-encoded to
  even 8 % smaller (already efficient H.264). `scripts/reencode-videos.sh` stays
  in the tree if that's ever revisited with a higher CRF / resolution cap.
- `ts-prune` + an orphan-file scan found no other dead exports.
- `npm audit` reports pre-existing dep-tree vulnerabilities (not from this work).

### Perf gotchas

- `Colored_Archipelago.webp` is a **fully opaque** frame (black sky included). Any
  layer drawing it over the scene must be masked by `islands.webp`'s alpha (see
  `.colorReveal` / `.colorBurst` / `.colorBase` in `Landing.module.css`) or it
  hides the L0 starfield.
- The archipelago renders in colour by default (`.colorBase`), so the orb's
  colour-reveal spotlight and click-burst are effectively inert — kept as-is per
  the owner's request.
- `mediaDimensions.ts` values were **not** regenerated after the 2560px downscale
  — aspect ratios shift < 0.1 %, invisible to the aspect-box layout that uses
  them. Regenerate if exact px ever matter.

---

## 2 · Business Analytics portfolio — case studies + credentials

| commit | what |
|---|---|
| `fbac1a7` | Phase 2 content package added at repo root: `Anayltics Portfolio-Package/phase-2/` (framework doc, copy, `website-content.json`, 4 charts). **Folder name has a typo** — `Anayltics`. |
| `be8749d` | `businessContent.ts` — the 3 placeholders replaced with the **4 real projects** (card fields + a `caseStudy` block each), verbatim from the package |
| `b50672f` | `BusinessCaseStudy.tsx` + `.module.css` — the in-page case-study reader |
| `3d88bf9` | fix: homepage sections vanished on return from a case study (the reveal observer didn't re-run after the `<main>` remount) |
| `3e566e9` | `credentials` — the **9 LinkedIn certifications** (8 IBM + CITI), with verify links |
| `851637a` | closing line trimmed to "Open to analytics and strategy roles." |
| `b8598e7` | hero eyebrow: "MSc Business Analytics" → "Master of Science in Business Analytics" |

### How it's wired

- **Business mode is deliberately NOT routed** — it's a `useModeStore` state
  overlay rendered by `RootLayout`; the URL never changes (see the comment in
  `useModeStore.ts`).
- The **case-study reader is a state view** inside `BusinessPortfolio`, shown in
  place of the homepage `<main>` when `openSlug` is set. It `history.pushState`s
  with the URL kept identical, so browser **Back** and **Esc** close it and the
  homepage scroll position is restored; a reload with one open restores that view
  (`hasOpenedCase` ref, set in the click handler so StrictMode can't double-trip
  the reveal-on-return logic).
- All business content lives in **`src/data/businessContent.ts`**: `businessCopy`
  (hero/projects/learning/closing — the original design's copy, only the projects
  heading/note moved to a finished state), `businessProjects` (4, each with
  `caseStudy`: metadata, `hero` chart, `sections`, optional `supporting`,
  and — AI project only — `matrix`), `credentials` (9), `fieldTerms`.
- **`caseStudy.reviewNotes` are INTERNAL** — a to-do list for correcting the
  original Tableau workbooks before any live dashboard/workbook link is enabled.
  They are not rendered anywhere.
- The 4 charts are WebP under **`public/media/business/`**. The AI evaluation
  matrix renders as a native HTML table, never an image.

### What's still open for the business portfolio

- **Issuer badge artwork.** The `credentials` grid shows the abstract `BadgeMark`
  because no `image` is set. Drop the real badges (Credly / Coursera / CITI) into
  `public/media/badges/` and set `image` per entry — the grid already grows to fit
  and titles render at full strength once `image` or `href` is present.
- **Original Tableau corrections** — before turning on any "view the dashboard /
  workbook" link, apply each project's `reviewNotes` (day-of-month → real dates,
  HHMM aggregation, currency-comparison logic, etc.). Until then only the static
  WebP charts are used.
- The **design-side About page** (`src/data/siteContent.ts`) still lists the
  degree as `"M.S. Business Analytics"` — left as-is; spell out to match if wanted.
- Optional: rename `Anayltics Portfolio-Package/` → `Analytics…`.
- Contact fields in `website-content.json` were `null`; the live site already
  pulls real email / LinkedIn / location from `siteContent.ts`.
