# Pixel Archipelago — session handoff

Everything below is **on `main`** (the perf branch was merged; the business work
was committed straight to `main`). Working tree clean, `npm run build` green.

Last updated at `d5ebfea`. Runtime deps: `react`, `react-dom`, `react-router`,
`zustand`, `gsap`, and **`lenis`** (added in § 3, extended to the design side in § 4).

Both portfolios now share one motion vocabulary: `components/motion/` (`SplitWords`,
`SectionHead`) and `hooks/` (`useLenis`, `lenisInstance`, `useMagnetic`, `useTilt`).

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

- ⚠️ **Nothing in the eager entry chunk may import `gsap`.** `useModeStore`, `RootLayout`
  and `ModeSwitch` are all downloaded before first paint; an import chain from any of them
  into GSAP drags its 44 KB chunk onto the design landing page's critical path and undoes
  CP1/CP2. This already happened once — `useModeStore` needed a Lenis scroll helper, which
  lived in `useLenis.ts` next to the GSAP import (entry went 57.5 → 63.1 KB gzip). Fix was
  `hooks/lenisInstance.ts`, which holds the instance and helpers and has **no runtime
  imports at all** (its `Lenis` import is type-only). Keep it that way. Check with:
  `grep -oE 'from"\./[A-Za-z0-9._-]+\.js"' dist/assets/index-*.js | sort -u` — after a
  build the entry chunk should list only `react-vendor` and `rolldown-runtime`.
- Entry chunk is **57.53 KB gzip** as of `d5ebfea` — unchanged by both motion passes,
  which is the point. The "51 KB" in the CP2 row above is the figure at `9840b63`, before
  the business case-study content landed — it is history, not the current baseline.
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
| `46cce0d` | two lines of visitor-facing copy that read as working notes reworded; the placeholder-era code comments across the three business files de-staled and the dead `MethodSlots` helper removed |

**Copy rule, learned the hard way.** The credentials footnote used to read "Issuer badge
artwork can be dropped in later; every entry links out to its verification page now" — a
note-to-self that shipped to the page. The owner's standing instruction: this is a
showcase, not a diary. Nothing about unfinished implementation work, and nothing
conversational, belongs in `businessCopy`.

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
- The 4 charts are **drawn natively** from `src/data/businessCharts.ts` (see § 3).
  The WebPs under `public/media/business/` are no longer rendered but are kept as
  the verified record. The AI evaluation matrix renders as a native HTML table.

### What's still open for the business portfolio

- **Issuer badge artwork.** The `credentials` grid shows the abstract `BadgeMark`
  because no `image` is set. Drop the real badges (Credly / Coursera / CITI) into
  `public/media/badges/` and set `image` per entry — the grid already grows to fit
  and titles render at full strength once `image` or `href` is present.
- **Original Tableau corrections** — before turning on any "view the dashboard /
  workbook" link, apply each project's `reviewNotes` (day-of-month → real dates,
  HHMM aggregation, currency-comparison logic, etc.). Until then the four native
  exhibits are the only data shown.
- **The hourly chart's ten non-peak bars are transcribed, not sourced** — see § 3.
  They are accurate to the exhibit's own display precision (~0.05%). If the
  workbook is ever corrected, re-derive them from the data rather than the image.
- The **design-side About page** (`src/data/siteContent.ts`) still lists the
  degree as `"M.S. Business Analytics"` — left as-is; spell out to match if wanted.
- Optional: rename `Anayltics Portfolio-Package/` → `Analytics…`.
- Contact fields in `website-content.json` were `null`; the live site already
  pulls real email / LinkedIn / location from `siteContent.ts`.

---

## 3 · Cinematic pass — native charts + motion system

| commit | what |
|---|---|
| `09e490f` | the 4 exhibits rebuilt as native charts (`businessCharts.ts`, `BusinessChart.tsx` + `.module.css`) |
| `0a40459` | GSAP/ScrollTrigger choreography, Lenis smooth scroll, `SplitWords`, `useMagnetic`, reading progress — plus the entry-chunk fix |

Brief was "cinematic, premium, data-driven, Apple-level polish." The **paper/ink art
direction was kept deliberately** — the whole budget went on motion and structure, not a
reskin. A dark "dashboard" idiom was considered and rejected: it breaks the light-vs-dark
premise the mode switch is built on, and it visually asserts exactly what the case-study
copy carefully refuses to claim.

### The four charts

`src/data/businessCharts.ts` is the single source. Three kinds render from it: `columns`
(hourly share), `rows` (city share, delay causes) and `stats` (EVV validation).

**Provenance — read this before touching any number.** `cityShare`, `delayCauses` and
`evvValidation` are printed as data labels on the source exhibit *and* restated in
`businessContent.ts`; two independent sources agree, so they are exact. `hourlyShare`
prints only its 12.3% peak — the other ten bars were transcribed from
`phase-2/assets/supermarket-hourly-share.png` against its 2% gridlines. **The
transcription sums to 99.95%**, which is what confirms hours 10–20 are the complete set
and the readings are sound. The 19:00 bar uses the printed 12.3%, not a reading.

Each chart's `caption` / `notes` are quoted from its exhibit and several are **more
precise than the case-study prose** (the EVV note that the ten missing client IDs *may
overlap* the amount exceptions, for one). They are the reason these charts can be shown
without overclaiming — do not drop or soften them.

Charts are DOM+CSS, not SVG, so text stays legible and responsive at any width. Bars
animate on `transform` only (`scaleX`/`scaleY`), so a page of charts never thrashes layout.

### Motion system

- **Lenis is the site's one smooth-scroll engine.** It runs in business mode
  (`BusinessPortfolio`) and on the design side's interior pages (§ 4), and is destroyed
  when either leaves. Verified clean across repeated mode switches.
  *(This entry originally said a document-wide instance "would fight" the design side's
  scroll components. That was a defensive assumption, not a measurement — § 4 tested it
  and it is false.)*
- **Every programmatic scroll in business mode must go through `scrollToInstant` /
  `smoothScrollTo`** (`lenisInstance.ts`). Lenis runs its own rAF loop, so a bare
  `window.scrollTo` is overwritten on the next frame and the page drifts back. This is why
  `useModeStore`, the popstate handler and `BusinessCaseStudy` all call the helper.
- **No Three.js was added.** Ornamental WebGL behind a text-and-data portfolio is exactly
  the "shader as background noise" the brief for this work rules out.

### Cinematic-pass gotchas

- **`[data-reveal]` no longer defaults to `opacity: 0`.** It used to, which meant no JS =
  blank page. Every resting state is now the *finished* state and GSAP animates `from`
  hidden. Keep it that way: reduced motion and a failed GSAP chunk both need to leave a
  readable page. Same rule in `SplitWords.module.css` and `BusinessChart.module.css`.
- **Chart bars and counters are started BY their ScrollTrigger, not bound to it.** Bound,
  a tween writes its start value into the DOM on creation — every stat panel below the
  fold read **"0 / 0 / 0.00%"** until scrolled to, and stayed at zero for good if a
  trigger mismeasured. Started via `onEnter`, the published figure stands until the
  animation actually begins.
- **ScrollTrigger must be refreshed when the case-study view mounts** (it changes document
  height by thousands of px) **and after `document.fonts.ready`** (webfont swap reflows
  every heading). Both are wired; without them reveals arm against positions the elements
  no longer occupy.
- **`SplitWords` keeps real spaces between the word masks**, so the element's accessible
  name is the ordinary sentence. Verified: the `h1` reads "Turning complexity into clear
  decisions." Do not switch to margin-based word spacing — inline-block spans swallow the
  whitespace and screen readers get word soup.
- The magnetic CTA (`useMagnetic`) engages only for `(pointer: fine)`, is clamped to 14px,
  and releases on leave/blur/visibilitychange. It is purely additive.

---

## 4 · Design portfolio — interior motion pass

| commit | what |
|---|---|
| `8f2f772` | `useInteriorMotion`, `useTilt`, `SectionHead`; `SplitWords` moved to `components/motion`; all four interior pages migrated; `useHeroReveal` deleted |
| `d5ebfea` | hero-art sticky pin built, measured, and removed |

Brief was the same as § 3 — cinematic motion, existing design untouched. Layout, colour,
type and content are unchanged; the only visual edit is `overflow: hidden` on `.portrait`
so the entrance push-in cannot overrun its rounded border.

### Where the motion lives, and why

`useInteriorMotion` is one shared choreography for CategoryPage, ProjectDetail, About and
Contact: a composed hero sequence, kinetic headings, scroll reveals, staggered children,
bounded hero-art parallax, and magnetic return controls.

**Targets are opted in by data attribute, never by class name** — `[data-hero]`,
`[data-hero-line]`, `[data-hero-title]`, `[data-hero-art]`, `[data-reveal]`,
`[data-reveal-title]`, `[data-stagger]`, `[data-magnetic]`. ProjectDetail embeds
ExhibitScroll, StoryScroll and BookScroll, each already running its own reveal; a broad
`.section p` selector would put two systems on one opacity. Anything unattributed is left
alone by design.

**Scoped to the interior pages on purpose.** The landing is a single fixed screen
(`overflow: hidden`, `scrollHeight === viewport`) that never scrolls, and it is in the
eager entry chunk — mounting the engine app-wide would pull GSAP into first paint and
break the § 1 rule. Interior pages are lazy and already imported GSAP, so they cost
nothing extra. Entry chunk is unchanged at 57.53 kB gzip; the cost sits in
ProjectDetail (10.70 → 10.91 kB gzip) and its three smaller siblings.

### Interior-pass gotchas

- ⚠️ **Never animate `transform` on an element that already has a CSS `transition` on
  it.** `.card` (ProjectCard) and `.tile` (Gallery) both own their transform through an
  authored hover — a 3px/2px lift on a 0.16s transition. Putting a GSAP `y` tween on the
  same element strands the entrance part-finished: opacity arrives at 1 and the rise
  freezes at `translate(0px, 24px)`, permanently. Two fixes are in place and both matter:
  the entrance tweens carry `clearProps: "transform,opacity"` so GSAP hands the property
  back on completion, and **there is no pointer tilt on cards or tiles** — their CSS hover
  already is the micro-interaction. `useTilt` is applied only to `[data-hero-art]`, which
  has no hover state, and whose *inner* image carries the parallax (different element, so
  never the same property).
- **Lenis and the bespoke scroll components coexist — this was tested, not assumed.**
  ExhibitScroll drives its plate parallax from a native `window` scroll listener; Lenis
  moves real document scroll, so the listener still fires. Confirmed live: `--plate-y`
  changes across scroll positions and scenes keep revealing. Same for CategoryBanner.
- **Route changes are fine.** react-router's `ScrollRestoration` and Lenis do not fight;
  navigating project → category → project lands at scroll 0 each time with the engine
  still attached.
- **No hero pin.** See the note in `interior.module.css` above `.hero` — it was built,
  measured at 77px of travel, and removed. StoryScroll (`position: sticky`) and
  CategoryBanner (scroll parallax) already provide those two moments.
- **There are no charts on the design side.** The brief asked for animated charts; the
  data is prose only (`projects.ts` has body/process/gallery/story/book/exhibit and no
  numeric series). Nothing was invented to satisfy it.
- `useStaggerReveal` survives for Gallery and BookScroll, which own their containers.
  `useHeroReveal` is gone — `useInteriorMotion` replaced every use.
