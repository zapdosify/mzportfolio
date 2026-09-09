# Pixel Archipelago — session handoff

Everything below is **on `main`** (the perf branch was merged; the business work
was committed straight to `main`).

Both portfolios now share one motion vocabulary: `components/motion/` (`SplitWords`,
`SectionHead`) and `hooks/` (`useLenis`, `lenisInstance`, `useMagnetic`, `useTilt`).
Runtime deps: `react`, `react-dom`, `react-router`, `zustand`, `gsap`, and **`lenis`**
(added in § 3, extended to the design side in § 4).

---

## 0 · State at the last pause — 8 September 2026

Section 5 (the mobile pass) is the most recent work. The table below is the
verification from the *earlier* pause at `e783919`; section 5 carries its own.

Verified at that commit, not assumed:

| check | result |
|---|---|
| working tree | clean |
| `tsc --noEmit` | passes |
| `npm run lint` | clean apart from 5 pre-existing `router.tsx` fast-refresh warnings |
| `npm run build` | green, 1.09s |
| entry chunk | 57.53 kB gzip — unchanged across both motion passes |
| eager critical path | `index` + `react-vendor` + `rolldown-runtime`, **no gsap** |

✅ **Backed up.** `origin` → github.com/zapdosify/mzportfolio, `main` pushed and tracking.
Raw source media (`videos/`, `images/`, `Website Redesign Assets/`, `Individual Elements/`
at the project root — never used by the deployed site) was stripped from history first,
since one file exceeded GitHub's 100MB hard limit; `.git` went 1.7GB → 778MB. Those
folders are still on disk, just gitignored. Commit hashes from before that rewrite (e.g.
the `e783919`/`72 commits` this section used to cite) no longer exist — don't chase them.

### Picking up from here

Nothing is half-finished; the four sections below are each complete. What is genuinely
open, in rough priority:

1. **Back the repo up** (above).
2. **Issuer badge artwork** for the business credentials grid — § 2. The only visible
   placeholder left anywhere on the site.
3. **Original Tableau corrections** before any live workbook link — § 2.
4. Small stuff: the `Anayltics` folder typo, the About-page degree wording — § 2.

Deliberately *not* done, with the reasoning recorded so it is not re-litigated: no hero
pin (§ 4), no charts on the design side (§ 4), no tilt on cards or gallery tiles (§ 4),
no Three.js on interior pages (§ 4), no motion on the landing at all (§ 4 — it is the
eager chunk and must stay GSAP-free).

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

---

## 5 · Mobile optimization pass

| commit | what |
|---|---|
| `3eaa8f4` | breakpoint scale + `--gutter`/`--tap` tokens; header, footer, landing |
| `59a0eb4` | content modules: cards, galleries, process, matrix, WordField |
| (this)   | remaining touch targets, landing clearances, sweep fixes |

Brief was to make both portfolios feel designed for a phone rather than
shrunk onto one, without touching the desktop design. **Every rule added is
inside a phone-tier media query**, and `--gutter` resolves to `--space-6` —
its previous hard-coded value — above 640px. Verified unchanged at 1440:
gutter 24px, header 60px/112px, 4-column card grid, plates shown, srNav
hidden, full "← Return to World", role and breadcrumb visible.

### The breakpoint scale (documented in `tokens.css`)

`1180 / 900 / 640 / 430 / 360`. Before this there were eight ad-hoc values
and **nothing at all below 560px**, so 320, 375, 390 and 430 all rendered
identically. The two `620px` tiers migrated onto 640. `760` (landing world
map, `--switch-clear`), `560` (ContactDialog, ModeSwitch), `860`/`1000`
(business page) are load-bearing where they sit and are named in the token
file as legacy — migrate one only with a reason, not for tidiness.

### What was actually broken, and why

- **The landing at 320×568 put the chip nav on top of the archipelago.**
  `.srNav` was `position: absolute; bottom:` against `.world`, which only
  works while 13 chips fit in the gap under a letterboxed stage. It is a
  real grid row now, so they cannot collide; slack is spread with
  `align-content: space-evenly` (title / art / chips read as three bands);
  the page scrolls when the chips genuinely don't fit, with `.stage` taking
  over clipping so the layers' −32px parallax bleed still can't escape.
- ⚠️ **Do not give `.stage` a `height` on mobile.** The first attempt set
  `height: 100%` to let the art grow. That makes `height` definite, which
  silently disables `aspect-ratio`: the box went to 390×382 (1.02) instead
  of 1.777 and only `object-fit: contain` kept the art from stretching. It
  buys nothing anyway — the stage is capped at 100% width on a portrait
  phone, so it cannot use the extra height.
- **The interior header collapsed below 640px** — the name wrapped into
  "Return to World", which wrapped into Index. Each element now sheds what
  it can afford: the role line, then "Return to", then the word "Index".
  Both keep full `aria-label`s.
- **The header backdrop was letting scrolled content through its own text.**
  Its soft bottom edge is tuned for a 60px desktop header; the mode-switch
  band pushes the row ~52px lower on a phone, into the faded part. The cover
  now holds to 80% below 640px.
- **Two-up grids.** At 390px the phone rule left project cards 165px wide
  (titles over three lines) and artwork tiles 124px tall. One column gives
  both ~350px. Same for the process stepper, which was two 169px columns of
  ~24 characters.
- **The business evaluation matrix** is 620px of three prose columns — a
  sideways scroll nested in a vertical one, severing every sentence. Each
  row is a labelled block below 640px. ⚠️ `display: block` drops a table out
  of the accessibility tree, so `role="table|row|rowheader|cell"` is
  declared explicitly and the column headings ride on `data-label`.
- **The WordField** was still too loud at 0.5 on a phone: its near tier sets
  at ~37px, so a word crossing a paragraph read as a competing line of text.
  Desktop masks the field away from the copy; a phone cannot, so it gives up
  presence instead (0.26, near tiers capped).
- **"Move to Explore" is an instruction for a cursor.** On touch it reads
  "Tap to Explore" (both decorative/aria-hidden; the real instructions are
  in `.srNav`'s label). The walk-up enter prompt is hidden — no orb to walk,
  and it was `position: fixed` at exactly the chips' height.
- **Touch targets.** Footer social links were 19px, the header identity link
  12px, breadcrumb links 15px, chips/résumé button 37–41px. All 44px now
  (inline breadcrumb links get an inset hit area rather than a taller line).

### Verified

320×568, 375×667, 390×844, 430×932, 768×1024, 1440×900 — landing, category,
project detail, the book/story/exhibit renderers, About, Contact, Index
menu, Lightbox, contact dialog, business home and all four case studies.
Zero horizontal document overflow at every width. Only sub-44px control left
is the mode switch's inner button (38px) inside a **46px pill** — the
existing, deliberate geometry.

Two things that look like bugs and are not: `CategoryBanner`'s inner layer
overhangs the viewport by ~16px (intentional `scale(1.08)` parallax room,
clipped by `overflow: hidden`), and the landing art appears to stop short of
the right edge at 768 (the artwork's own starfield fading —
`elementFromPoint` confirms the stage reaches the edge).

Not changed, deliberately: the landing art is not cropped to a taller aspect
on portrait phones. It would make the islands bigger, but the colour layers
(`.colorBase` / `.colorReveal` / `.colorBurst`) are masked by
`islands.webp`'s alpha at the stage's own aspect, and re-fitting them is a
real risk to the one thing on the page that must not break.

### Follow-up: the landing became a vertical index below 640px

The owner's call, and it supersedes the "keep the archipelago as the visual
hero" reasoning above. Letterboxed onto a portrait phone the 1672×941
composition can only be a ~200px stamp — too small to read as an explorable
world, and it pushed the navigation below the fold. So on phones:

- **The archipelago is hidden** (`.islandsImg`, `.colorBase`,
  `.colorReveal`, `.colorBurst`, `.centerOrb`). Only `.bg` — the starfield
  void — survives, and `.stage` becomes `position: fixed; inset: 0` so the
  index scrolls over an unmoving backdrop. That also retires the cropping
  question above: there is no art left to crop.
- **The 13 destinations are a full-width vertical index** — one row each,
  58px tall, 10px apart, left-aligned, same border/type/colour as the
  plates. `:active` and `:focus-visible` carry the affordance; there is no
  hover on touch.
- ⚠️ **`.srNav`'s base rule centres it with `left: 50%` + a −50% translate.**
  Undoing only the transform shoves the column half a viewport right. Reset
  `left`/`right`/`bottom` too.
- **`.centerOrb` is `display: none` and that is safe.** Intro's
  `measureOrb()` falls back to the viewport centre on a zero-width rect,
  which is exactly where the galaxy should collapse on a phone. Verified:
  `--ox/--oy` = (195, 422) at 390×844. Do not "fix" this by keeping the orb
  visible.
- **`OrbLayer`'s canvas is hidden below 640px** (its own module). The orb is
  the cursor; with no cursor and no art to point at it just sat there
  glowing at its last position.
- `.world` gets `cursor: auto` back — `cursor: none` with no orb left a
  narrow desktop window with no pointer at all.

**The reveal is `IntersectionObserver`, not GSAP, and must stay that way.**
Landing is the eager entry chunk; importing GSAP here drags its 44 KB onto
the critical path (CONTEXT §1). Rows fade + lift 14px over 620ms, staggered
55ms within each batch — a row scrolled to alone is a batch of one and gets
no delay. Entry chunk 57.71 → 57.91 kB, still importing only `react-vendor`
and `rolldown-runtime` with zero gsap internals.

⚠️ **The rows are armed in JS (`data-nav-reveal`), never in CSS.** Resting
state is the *finished* state, so reduced motion, no JS, or an early bail
all leave a complete readable index rather than a blank column — the same
rule as the business page's `[data-reveal]`. Verified by disarming all 13
rows at runtime: 0 hidden, opacity 1, transform none.

Verified at 320/375/390/430: no horizontal overflow, no truncated labels,
rows full-width with consistent 58px height. At 768 and 1440 the
archipelago, plates, orb canvas, `cursor: none` and the hidden `srNav` are
all exactly as they were.

---

## 6 · Landing: the island graphic is now clickable, not just its nameplate

A live-user pain point: people were clicking the pixel-art building itself
(the picture) rather than the small nameplate chip below it, and nothing
happened. Fixed by adding a mouse/touch hit-area over each island's own
artwork, in `Landing.tsx` (`ISLAND_HIT`) + `Landing.module.css`
(`.islandHits`/`.islandHit`). Desktop/tablet only (≥640px) — see below.

### Why this couldn't just be "make the island clickable"

The islands are one flattened composite (`islands.webp`), not separate
per-island elements — deliberately, per §4's "hard-won decisions": bridges
and walkways connect every neighbour, and per-island sprites lost them once
before. There's no DOM node per island to attach a click handler to.

Tried automated segmentation first and it doesn't work here: a naive
alpha-channel flood-fill finds one giant connected blob (everything the
bridges touch) plus a few isolated scraps — confirmed the composite really
is one continuous shape, not thirteen separate ones. A local-window growth
algorithm (start a small box at each nameplate, grow outward until it stops
clipping opaque content) does better but still runs away through a bridge
or staircase cable into a neighbour if left unsupervised, because a cable
*is* "opaque content near the edge," same as the island itself.

**The actual method**: `tools/measure_island_boxes.py` runs that growth
pass and renders a debug overlay; the output is then hand-corrected against
the render where a box visibly swallowed a neighbour. The values hardcoded
into `ISLAND_HIT` are that corrected result — the script is a calibration
aid to rerun if the art or `PLATE_X`/`PLATE_Y` ever change, not a generator
whose output can be trusted unchecked.

### How it's wired

- One wrapper (`.islandHits`, `pointer-events: none`, like `.plates`) holds
  13 absolutely-positioned boxes (`.islandHit`, `pointer-events: auto`) —
  same split as the existing nameplate pattern, so gaps between boxes and
  the centre orb stay click-through.
- `z-index: 3` — below the nameplates (4) and centre orb (5), so both stay
  clickable even where a box's edge runs under either.
- Hovering a box sets `hoverId` exactly like hovering its nameplate does:
  the plate highlights and the bottom `enterPrompt` bar appears. Clicking
  calls the same `go(c.route)` the nameplate's own click handler uses —
  same warp transition, same everything. Verified live: hovering and
  clicking a picture (not its label) behaves identically to the nameplate
  for `website-design`, `contact`, `renders`, and `3d-lettering` (the last
  two chosen because their boxes have the widest overlap with each other,
  to confirm the boundary doesn't send a click to the wrong category).
- `aria-hidden="true"` on the whole group. The nameplate `<Link>` remains
  the one accessible/keyboard destination for each category; these divs are
  a mouse/touch convenience layered over what the picture already reads as,
  not a second route to the same place for assistive tech.
- Hidden below 640px (`.islandHits { display: none }`, same rule as
  `.islandsImg`/`.centerOrb` etc. in §5) — the archipelago art itself is
  hidden there, so there is nothing to click on and no reason to carry
  invisible hit-boxes over the mobile vertical index.
- A little box-to-box overlap is fine and expected — plain rectangles over
  irregular pixel art can't help it — as long as it lands on a shared
  walkway/gap and never on two islands' actual artwork at once. Checked
  visually against the debug render before committing to the values.

tsc, lint (5 pre-existing warnings) and build all green; entry chunk
57.91 → 58.13 kB gzip (the new data + JSX), still only `react-vendor` and
`rolldown-runtime`.

## 7 · Favicon + link-preview card — 9 September 2026

The site had shipped with the scaffold's placeholder `favicon.svg` and no
`og:image` at all, so every shared link rendered as a bare text card.

Both masters live outside the repo, in `~/Desktop/Mobile Game Concept/`
(`Favicon.png`, 1254² RGBA orb; `Link Preview.png`, 1731×909 MZN monogram
card). Everything the site serves is **derived** — regenerate with:

```bash
py tools/build_brand_assets.py
```

That script (at the project root, not in `pixel-archipelago/`) writes into
`public/`: `favicon.ico` (16/32/48), `favicon-16/32/192.png`,
`apple-touch-icon.png`, `og-image.jpg`. Don't hand-edit those files.

### Why the script does what it does

- **The favicon is cropped before it's scaled.** The master's orb sits inside
  a very wide, very faint glow halo — a full-frame alpha `getbbox()` returns
  almost the whole 1254² canvas, which would shrink the actual mark to a
  couple of pixels at 16px. So it thresholds alpha at `> 12` to find the
  *visible* art (908×873), squares that on its centre, and pads ~6%. The
  16px result still reads as an orb-in-a-ring; checked as a 4× NEAREST
  contact sheet, not assumed.
- **`apple-touch-icon.png` bakes in `#050505`** (the same value as
  `<meta name="theme-color">`) and insets the art by 10px. iOS composites a
  transparent touch icon onto white, which would blow out this artwork.
- **`og-image.jpg` is a straight resize.** The master is 1.904:1 and the card
  standard is 1200×630 = 1.905:1, so there's nothing to crop. JPEG q90
  progressive lands at ~103 kB, well inside the ~300 kB most scrapers fetch.
- **`favicon-512.png` was deliberately dropped.** There's no web manifest to
  reference it and 287 kB of unused PNG isn't worth shipping. Add it back
  (`for size in (...)`) if a manifest ever lands.

### The absolute-URL dependency

`og:image` / `og:url` / `twitter:image` are hardcoded to
`https://mznportfolio.com/…`. Scrapers won't resolve a root-relative
`og:image`, so these can't be path-only. Verified the domain is live and
serving this build (`curl` → 200, correct `<title>`). **If the site ever moves
or gains a canonical domain, these four `index.html` lines must move with
it** — nothing else in the codebase knows the site's own URL.

`favicon.svg` was deleted rather than left in place; nothing referenced it.
Build green; the icon/card files are static `public/` copies, so no chunk
changed.

### §7 addendum — what actually broke the LinkedIn card

The notes above were written before the card worked. Three causes were
found in sequence; **only the third was the real one**, so don't read the
first two as the fix.

1. **CDN WebP transcoding.** Hostinger's CDN converts images to WebP for any
   client whose `Accept` header allows it, at the same `.jpg` URL and with no
   `Vary: Accept`. LinkedIn's crawler sends `Accept: image/webp`, so it got
   WebP, which its previews don't support. Real bug, fixed two ways:
   `no-transform` in `.htaccess` (the CDN does honour it) **and** hPanel →
   Performance → CDN → Manage → Website optimisation → *WebP image
   compression* turned **off**. *Smart image optimisation* is still on; it
   was verified not to alter the card's dimensions. Not the cause, though —
   the card still failed after this.
2. **A cached 404.** `/og-image.jpg` was probed before it existed, and the
   CDN held that negative response for minutes. Renaming defeats a per-URL
   cache — but a URL LinkedIn had never seen failed identically, which
   killed this theory.
3. **The real cause: the card was a progressive JPEG.** `build_brand_assets.py`
   wrote it with `progressive=True` for web performance. Browsers decode
   that fine; LinkedIn's image pipeline reports "No image found". Rewriting
   it baseline (`SOF0`) fixed it immediately — Post Inspector ingested the
   image onto `media.licdn.com`. **The build script must keep
   `progressive=False`**; Pillow only writes progressive when asked, so a
   future edit could silently reintroduce this.

Ruled out along the way, so nobody re-treads it: markup (raw served bytes
are valid UTF-8, no BOM, well-formed `og:image`), `robots.txt` (404, hence
permissive), CDN traffic blocking (no IP or country rules), cold-cache fetch
timing (identical warm), and CDN security level (left at Medium — the page
fetch always succeeded, so LinkedIn was never being challenged).

Two operational notes:

- **Share the page URL, not the image URL.** Pasting
  `mznportfolio.com/landing.jpg` into a post makes LinkedIn render a generic
  "Web Link" card *of an image file*. The og: tags exist so that pasting
  `https://www.mznportfolio.com` builds the real card. This confusion is
  what the `landing.jpg` filename came from (`og-image` → `og-card` →
  `landing`, renamed on the assumption the name would be public; it isn't).
- **LinkedIn caches per exact URL string**, and trailing-slash variants are
  separate keys. Both `…com` and `…com/` were warmed via Post Inspector. Its
  share composer only re-fetches when the link is removed and re-pasted.

Card is baseline JPEG q95, 4:2:0, 1200×630, ~161 kB. Deliberately not PNG:
lossless is 637 kB, which clears LinkedIn's 5 MB cap but exceeds the ~300 kB
above which WhatsApp drops previews.
