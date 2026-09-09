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

⚠️ **There is no git remote. 72 commits exist only on this machine** — the whole project
history, both portfolios and every asset. `git remote -v` is empty and nothing has ever
been pushed. Setting up a remote is the highest-value thing to do before more work lands.

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
