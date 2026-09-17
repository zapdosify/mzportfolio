# Pixel Archipelago — session handoff

Everything below is **on `main`** (the perf branch was merged; the business work
was committed straight to `main`).

Both portfolios now share one motion vocabulary: `components/motion/` (`SplitWords`,
`SectionHead`) and `hooks/` (`useLenis`, `lenisInstance`, `useMagnetic`, `useTilt`).
Runtime deps: `react`, `react-dom`, `react-router`, `zustand`, `gsap`, and **`lenis`**
(added in § 3, extended to the design side in § 4).

---

## 0 · State at the last pause — 17 September 2026

**Section 10 is the most recent work** — EMBERDEEP, the owner's first game,
playable on its own case-study page, on branch `feature/emberdeep` (not merged,
not pushed, not deployed at the time of writing).

**Section 9 is the one to read before touching the business side** — its dark
teal rebuild, the orb in both worlds, and the switch's first-use cost. ⚠️ It
invalidates every "light world" / "paper" / "ink" description written before it,
in this file and in the root `CONTEXT.md` § 11, and it retunes two colour values
inside § 8's glass. Read § 9.1 and § 9.2 before trusting anything earlier about
how the business side looks.

The table below is the verification from the *earlier* pause at `e783919`;
sections 5, 7, 8, 9 and 10 each carry their own.

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
5. **`dist/` is 241 MB.** Interior project media, not on any critical path, but
   there are a dozen-plus single images over 1 MB (Avengers posters, Solarpunk
   spreads, HODL screens). Nothing has been measured on those pages; if one ever
   feels heavy on mobile, start there and use the `preview` launch config, not the
   dev server (§ 9.5).

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
  overlay rendered by `RootLayout`, and the business half of the site has no URL
  of its own (see the comment in `useModeStore.ts`).
  ⚠️ **The design half does move now.** Since § 8 the switch's Design side always
  means the design *homepage*, so leaving an interior page through the switch
  rewrites the URL to `/` — in place (`replace` + `preventScrollReset`), while
  the design world is off screen, so no history entry is added and nothing on
  screen moves. Nothing else in either mode touches the router.
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

> ⚠️ **Overturned on 2026-09-12 (`b600c64`), at the user's explicit request** — see
> § 9.1. The page is dark now, so the light-vs-dark premise above is gone: the two
> worlds are told apart by *hue* (amber archipelago, teal analytics) rather than by
> inversion, and the switch's own two states were repainted to match. The second half
> of the objection was the real one and it still holds — a dark page must not be
> allowed to drift into dashboard idiom and assert what the copy refuses to claim,
> which is why § 9.1 spends the accent budget on hairlines, eyebrows and exactly one
> measured figure per exhibit rather than on panels, gauges and glow. The chart
> colours below changed with it: supporting series `#0f766e`, the finding `#22d3ee`.
> **The numbers themselves did not** — the provenance rules under "The four charts"
> are untouched and still binding.

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

---

## 8 · The portfolio switch reveals while you drag — 10 September 2026

| commit | what |
|---|---|
| `806787a` | The switch stops deciding on release. Both portfolios are mounted for the length of the gesture and a seam pinned to the drag position moves between them, the destination arriving behind a sheet of liquid glass that thins as the drag advances. Click, tap and the arrow keys play the same reveal on the clock instead of the crossfade. |

Half a drag is now half of each page. Pause at 40% and you are looking at both
portfolios at once, with the boundary where your finger left it.

### How it's wired

- **`components/mode/modePos.ts` (new)** owns the gesture as ONE number,
  published as `--mode-pos` on `<html>` — 0 is Design, 1 is Business Analytics,
  the same scale the pill always used. It is written straight from the pointer
  and **never through React**: the pill, the seam and the glass all read that
  one variable from CSS, so they cannot drift apart by a frame and following
  the finger costs no re-renders at all. The file also holds the two easings
  (solved from CSS cubic-beziers, since GSAP is not in the eager chunk and the
  switch is) and the rAF tween.
- **`useModeStore` gained `preview`** — the mode mounted *underneath* the live
  one while a drag runs — plus `beginPreview` / `cancelPreview` /
  `commitPreview`. `commitPreview` swaps with no crossfade and no `switching`:
  the drag has already performed the transition, and a second one on top of the
  visitor's own gesture is exactly what this was replacing.
- **`RootLayout` renders both layers** whenever `preview` is set, each with a
  stable `key` and the same shape throughout, so the layer being revealed
  becomes the live one **without React remounting anything**. That is the whole
  trick behind a swap with no blank frame and no replayed entrance. The revealed
  layer is a fixed, `inert`, viewport-sized panel carrying its own scroller,
  seeded to the position that mode was left at, and the document takes that
  position over in a `useLayoutEffect` on the frame of the swap.
- **The live page underneath is left completely alone** — no clip, no
  transform, nothing that would re-anchor its fixed chrome or leave its scroll
  needing correction. Only the arriving layer moves.
- **One seam, at `x = --mode-pos * 100vw`**, with Business to its left and
  Design to its right. That is the same geometry read from either direction,
  which is why the return trip is the identical gesture reversed rather than a
  second implementation.
- **Two timings, deliberately different.** A released drag keeps the switch's
  original 460ms `--ease-out` — it still has the visitor's hand behind it. A
  slide under its own power (click, tap, arrow key) starts from rest, so it
  runs 920ms on `cubic-bezier(0.38, 0.06, 0.62, 0.94)` and is **paced by
  distance**, so a change of mind half way back does not drag on. The glide
  curve was chosen numerically rather than by eye: its fastest moment is ~1.5x
  its average against ~3x for the settle curve, which is the whole difference
  between a sheet being drawn across and a snap.
- **The glass is pure CSS** — ⚠️ but read § 9.2 first: its business-side
  `--glass-lift` and specular gradient were tuned for a *paper* destination and
  were retuned in `b600c64` when that side went dark. Everything else below is
  still exact. It lives in `global.css` after the `.mode-reveal` rules and
  interpolated from `--mode-pos` through `--mode-reveal-p` (direction-normalised
  so 0 always means "just appearing") and `--mg` (how much glass is left).
  `::after` is the pane — `backdrop-filter: blur() saturate() brightness()`, an
  rgba tint, a 1px border on the leading edge, negative-spread inset glows —
  sized to the revealed band only so the browser never blurs a backdrop that is
  then thrown away. `::before` is the specular catch riding the seam, halved by
  the clip so what shows is light gathering *into* the glass. Every value
  reaches exact identity at full reveal: no blur, tint, shadow or residue.
- **The switch always lands on a portfolio's homepage now.** See the ⚠️ in § 2:
  the Design half means `/`, rewritten in place at the moment the reveal starts.

### Gotchas, each of which cost real time

- **Never put `filter` inside `.mode-reveal`.** The reference this glass came
  from leans on `filter: blur() drop-shadow() brightness()` for its gloss.
  Using it inverted the **entire** revealed page — light text on black.
  `.mode-reveal` carries a `clip-path` and is therefore a *backdrop root*, and
  a filtered element anywhere inside one makes Chrome build that root's
  backdrop image without its opaque background. The softness lives in the
  gradient ramp instead: an eleven-stop gradient IS an analytic blur, and it
  costs nothing per frame.
- **Pointer capture retargets the click.** `setPointerCapture` on the track is
  what lets a drag keep tracking outside the pill, but it also retargets the
  following `mouseup`/`click` to the track, so a label's own `onClick` never
  fires — press "Business Analytics" and nothing happens. A tap must therefore
  be resolved on `pointerup`, from `fracFromX` (which half the pointer came up
  over), exactly as the switch always did before this work briefly changed it.
  Any click arriving within 700ms of that is its own tail and is ignored;
  keyboard and assistive-tech activation arrive with no pointer behind them and
  are always honoured.
- **The live layer needs `isolation: isolate`** while something is revealed over
  it, or its own fixed chrome escapes upward — the business reading-progress bar
  sits at z-index 60 and the reveal panel at 44. `isolation` was chosen over
  anything else that makes a stacking context because it does **not** also make
  a containing block for `position: fixed`.
- **Still exactly ONE smooth-scroll engine.** `BusinessPortfolio` calls
  `useLenis(mode === "business")`, so a business page mounted as a *reveal*
  starts no engine. This is also why the design side only ever reveals the
  **landing**: any interior design page pulls in `useInteriorMotion`, which
  calls `useLenis(true, …)` unconditionally, and business mode's engine is
  still running underneath it. Verified at every point in both directions —
  `html.classList` carries `lenis` in business mode and nothing in design mode,
  including mid-reveal.
- **Business choreography waits for `live`.** Its GSAP context is built only
  once `mode === "business"`; measuring ScrollTriggers from inside the fixed
  reveal panel arms every one of them against the wrong page's scroll, and the
  sections then never arrive. A page already wiped into view skips its entrance
  (`wasRevealed` ref — same idea as `hasOpenedCase` in § 2).
- **The landing's first-run galaxy intro** raises `html[data-intro]`, which
  hides the switch. A design reveal is therefore only allowed once
  `sessionStorage["pa:intro-seen"]` is set — otherwise a drag would raise the
  curtain over the control being dragged. Same fallback to the old crossfade if
  the business chunk has not landed yet, though a drag that starts before it
  arrives picks the reveal up mid-gesture the moment it does.
- **Two `<main>`s for the length of a drag**, so the revealed one drops its
  `id="main"` until it is live.
- **`RootLayout`'s route-crossfade effect** must record the path while a design
  reveal is mounted, or the commit that follows looks like a route change and
  fades the page the visitor just wiped in.

### Verified, not assumed

Driven in a real browser, both directions, desktop and mobile (375×812):

| check | result |
|---|---|
| partial drag → release | returns to the origin, scroll intact, no history entry |
| full drag → release | swaps; document height and scroll both correct |
| slow (30-step) / fast / repeated drags | reveal node never recreated (`recreated: 0`) |
| grabbing the pill mid-slide | takes over at the pointer |
| reversing a slide mid-flight | 414ms measured against 408ms predicted by the distance pacing |
| glass interpolation | 12.35px blur at 5% revealed → 6.5px at 50% → exactly 0 at 100% |
| frame pacing, glass on vs off | median 13.3ms both; p95 13.6 vs 13.5 — no measurable cost |
| powered slide pacing | 2·8·12·14·17·15·15·9·6·1 % of distance per 100ms |
| switcher from an index page | `/renders` → `/` on click; a drag back reveals the landing, not the category page |
| a drag ending over a label | no click fires, no navigation |
| Lenis instances | exactly one at every point in both directions |
| `tsc` / `lint` / `build` | green; 5 pre-existing `router.tsx` warnings only |
| bundle | entry 167.67 → 168.01 kB (+190 B gzip), CSS 37.03 → 39.15 kB (+410 B gzip), business chunk unchanged |

**Not verified:** `prefers-reduced-motion` under real OS emulation — the rule
was confirmed present in the built stylesheet and its exact declaration tested
by injection, but the media query itself was never flipped. Enter/Space on the
switch could not be driven either (the automation's synthetic key events do not
activate *any* native button on the page); it was tested through `.click()`,
which is what the browser dispatches for it. And **Safari is untested** — the
glass leans on `backdrop-filter`, which Safari supports, but the backdrop-root
behaviour in the first gotcha was only ever reproduced in Chrome.

---

## 9 · Teal Insight, the orb in both worlds, and the switch's first-use cost — 12 September 2026

| commit | what |
|---|---|
| `b600c64` | The business portfolio stops being the light counterweight and becomes a dark teal one. Four full-width project rows become four equal cards. |
| `5d7f60f` | The landing's hidden cursor is scoped to the region the orb can actually reach, so the index button can be aimed at again. |
| `03ceceb` | The orb crosses into the business world as a soft white glow, and the switch stops paying for that world's chunk at the moment it is asked for. |

### 9.1 · The business portfolio is dark now (`b600c64`)

⚠️ **This invalidates every "light world" / "paper" / "ink" claim written before
it**, here and in the root `CONTEXT.md` § 11. The art direction it replaced was
soft white paper with near-black ink; what is there now is a faintly teal black.
The *discipline* is unchanged — hairlines instead of boxes, generous margins,
measured asymmetry, one accent family and no chart furniture. Only the ground
moved.

The ground is the point, and it is why this reads as cohesive rather than
painted-on: `#071417` is not a neutral black, it is a desaturated dark teal, and
surfaces step up through `#0b1d21` to `#10262b`. The accents then sit *in* the
page instead of on top of it.

The accent family is a hierarchy, enforced rather than decorative, and the
contrast ratios are what enforce it (all against `#071417`):

| token | value | on the ground | allowed to carry |
|---|---|---|---|
| `--biz-teal-deep` | `#0f766e` | 3.4:1 | borders, fills, de-emphasised bars — **never text** |
| `--biz-teal` | `#14b8a6` | 7.5:1 | the primary accent: eyebrows, rules, icons, badge marks |
| `--biz-cyan` | `#22d3ee` | 10.4:1 | what you can act on, and the one measured figure per exhibit |
| `--biz-sky` | `#0ea5e9` | 6.8:1 | occasional secondary |
| `--biz-muted` | `#a6b8bc` | 9.1:1 | lede, standfirst, card copy |
| `--biz-faint` | `#7a9297` | 5.7:1 | eyebrow values, notes, axis labels, badge lines |

`--biz-faint` is deliberately **not** the lighter sibling from the brief. It
carries every small label on the page, so it has to stay faint *and* clear AA on
its own. Anything lighter stops being faint; anything darker fails.

**The project row is the one structural change.** Four full-width rows, each
carrying a four-field definition list (`question` / `summary` / `methods` /
`outcome`), became four equal cards: cover, title, `standfirst`, method tags, and
one `↗`. Nothing was removed from `businessContent.ts` — the question, the
evidence and the key insight are all restated at length in the case study each
card opens, which is where they were always going to be read properly.

The card mechanics that are easy to break:

- **`.card` takes `isolation: isolate` permanently.** The internal highlight sits
  at `z-index: -1` — above the card's own background, beneath all of its content
  — and a stacking context that only exists on hover would not do.
- **`.cardBody` is deliberately unpositioned.** The click overlay is
  `.cardOpen::after { inset: 0 }`, and its containing block has to be `.card`. Give
  `.cardBody` `position: relative` and the overlay silently shrinks to the text
  area, leaving the cover unclickable.
- **The hover scale belongs to the art *inside* `.coverInner`, never to
  `.coverInner` itself.** GSAP owns that element's transform for the cover
  parallax. Two systems writing one property is a bug waiting for a scroll.
- **The card stagger uses `clearProps: "transform"`.** Without it a GSAP `from`
  tween leaves `transform: translate(0,0)` inline on every card, and an inline
  transform silently beats the CSS hover lift for the rest of the visit.
- Four across is a **desktop** layout. It halves at 1180px, not 900 — four
  columns inside 1024px is ~200px of card. Single column below 640px.
- Everything interactive is inside `@media (hover: hover)`, so a tap does not
  leave a card stuck in its hover state.

**Three shared things had to be repainted**, because they encoded "business =
the light world". All three are scoped to that mode alone, and the design
portfolio is untouched:

- `html[data-mode="business"] body`, its focus ring (now cyan) and its skip link.
- `.track[data-mode="business"]` on the switch. Both portfolios are dark now, so
  the two states read as a change of hue rather than as an inversion.
- **The drag reveal's business half — see the correction to § 8 below.**

### 9.2 · Correction to § 8: the glass's business side

§ 8 describes the liquid-glass reveal as it was built, against a paper
destination. The mechanism, geometry and timings there are all still exact. Two
*colour* values in it were tuned for white and are no longer, and § 8 should be
read with this attached:

- **`--glass-lift` went `-4%` → `9%`.** Paper seen through the pane sat back a
  little; a dark page lifts, the way the design side always did. Business is the
  shade lighter of the two dark worlds, so it lifts slightly less than Design's
  `11%`.
- **The `::before` specular catch was a dark shade either side of a bright core**
  — which is how a real pane reads on a white surface, and is invisible on this
  one. It is now the same specular ramp the design world uses, with the faintest
  teal in the falloff so the edge belongs to the page it is uncovering. Same
  eleven stops, same positions, same opacity curve; only what the light is made
  of changed.

The `filter`-inside-a-backdrop-root gotcha in § 8 still stands and is still the
most expensive mistake available in that file.

### 9.3 · The landing's cursor could not reach the index (`5d7f60f`)

Reported as "the orb stops before the index and I can't click it". The button was
never unclickable — hover fired, hit-testing found it, the panel opened. What was
missing was any *visible pointer* up there, which feels identical.

Two regions that were assumed to be one:

- **`.stage`** is locked to the art's 1672:941. The orb is drawn on a canvas
  sized to that box and clamped inside it, so it physically cannot leave.
- **`.hud`** (title, index, world map, legend) spans the whole `.world`.

`cursor: none` was on `.world` — everywhere. On any viewport **taller than
16:9** the stage letterboxes, and the index button lands in a band with no orb
*and* no cursor:

| viewport | stage top | orb's highest reach | button bottom | dead band |
|---|---|---|---|---|
| 1195×910 (1.31) | 123px | y=143 | y=62 | **81px** |
| 1100×1000 (1.10) | 195px | y=213 | y=62 | **151px** |
| 1600×900 (16:9) | 4px | y=31 | y=62 | overlaps — no bug |

That last row is why it survived to production: on a 16:9 monitor the letterbox
closes up and the orb reaches the button. It only appears once the window is
taller than the art, which is most laptops the moment a window is not full
height.

**The fix is to scope the hidden cursor to the region the orb actually covers**
— `cursor: none` moved from `.world` to `.stage` (and `.stage a, .stage button`),
with `.hud button, .hud a, .srNav a` given `cursor: pointer`. It is the same
trade the phone layout at the bottom of `Landing.module.css` already makes when
the orb goes away, applied in space instead of at a breakpoint.

The OS arrow now appears in the letterbox bands. That is the intended signal
that you have stepped off the scene, and it is what makes the button findable.

**Deliberately not taken:** letting the orb roam the full viewport by moving its
canvas from `.stage` to `.world`. The orb's coordinates are percent-of-stage, and
both the island proximity test and the position persisted to the store read them
that way. That is a refactor, not a fix for this.

### 9.4 · The orb is one object in two palettes (`03ceceb`)

`src/world/orbArt.ts` (new) is now the **only** place the orb is drawn — same
trail, same three orbiting rings and their particles, same breathing core, same
radii and timings. `OrbLayer` lost sixty lines and calls it with `ORB_AMBER`;
`components/business/BusinessOrb.tsx` calls it with `ORB_WHITE`. Edit the drawing
once and both worlds move together, which was the whole reason not to copy it.

`ORB_WHITE` is white at the core and along the rings with only the faintest cool
cast in the falloff — enough that the light belongs to the teal ground, not so
much that it reads as a cyan orb. `drawOrb`'s optional `scale` swells the body
(glow, rings, core) without touching the trail, which belongs to the path
travelled rather than to the orb.

**What differs is the world, not the orb.** The archipelago is a *scene*: its orb
lives inside the stage and proximity to an island is the entire point. The
business page is a *document*, so the orb is simply the pointer — one
viewport-fixed canvas, no clamp, no proximity, `pointer-events: none`. That is
deliberate and it is the direct lesson of § 9.3: **a hidden cursor is only safe
when the thing replacing it can reach every pixel.** A full-viewport canvas
cannot have that bug.

Two guards, both load-bearing:

- **`cursor: none` is keyed on `html[data-biz-orb]`** (the rule lives in
  `global.css`, not the module, because the canvas covers the mode switch too).
  `BusinessOrb` raises that flag only once the orb is actually drawn. Before the
  first mouse move the orb does not know where the pointer is, and hiding the
  cursor then would leave the visitor with **no pointer at all** until they
  happened to move one. The flag drops again when the pointer leaves the window,
  while the page is frozen behind a mode drag, and on unmount.
- **Fine pointers only.** On a coarse pointer the effect bails before wiring
  anything up, the canvas is `display: none`, and the page keeps its ordinary
  cursor.

The orb swells 1.32× over `a, button, [role="button"]`, which is what replaces
the pointer affordance the native cursor would have given. Under reduced motion
it still follows — it is a cursor, it has to exist — but without trail, ring
rotation or breathing.

### 9.5 · The switch's first-use cost (`03ceceb`)

Reported as: switching to Business is slow deployed, fine on the dev server. That
is the wrong way round, and the inversion was the whole clue.

It is the first time the browser needs that portfolio at all. The click pulls
**five files, ~69 kB** — the page, its CSS, `SplitWords` and its CSS, and **GSAP
(44 kB, the bulk of it)**. Vite preloads a lazy chunk's dependency graph in
parallel, so this is **not** a waterfall; the problem is simply that all of them
must arrive before React can render anything, and until they do the Suspense
fallback is an empty viewport with the crossfade already running. Off a dev
server that is milliseconds from local disk. Over a real connection it is the
entire visible lag.

A prefetch already existed on hover, focus and press, and it works — but only if
the visitor dwells. A hover 200ms ahead of the click does not cover 69 kB.

**So the chunk is fetched on idle**, well before anyone reaches for the switch,
with intent kept as the fallback. `requestIdleCallback` will not fire while the
landing's intro is animating, so it cannot compete with the art for the main
thread. Skipped on `saveData` or a 2G connection, where 69 kB of a portfolio the
visitor may never open is not a trade worth making for them.

Measured on the production build (`npm run preview`), clicking cold with no
dwell:

| | network at click | frames > 32ms | worst frame |
|---|---|---|---|
| before | 5 requests, 69 kB | 1 | 63ms |
| after | **0** | **0** | **27ms** |

Two things worth knowing before optimising this further:

- **Repeat switches already fetched nothing.** This was only ever a
  first-switch-per-visit cost, which is exactly why it is easy to miss and easy
  to mis-attribute to the transition's rendering.
- **The header's `backdrop-filter` is not the problem.** It was the obvious
  suspect — a fixed full-width element blurring a backdrop the word field
  animates continuously. Measured with and without, on the business hero: **75fps
  either way** (13.34ms vs 13.30ms). Left alone.

`.claude/launch.json` gained a `preview` entry so the production build can be
served locally the way this was diagnosed. **Diagnose anything performance-shaped
there, never on the dev server** — that difference is this entire section.

### Gotchas, each of which cost real time

- **A GSAP `from` tween leaves an inline transform behind.** It beats every CSS
  hover rule for the rest of the visit, silently. `clearProps: "transform"` on any
  entrance tween whose target also has a CSS hover transform.
- **An absolutely-positioned `::after` resolves against the nearest *positioned*
  ancestor.** Positioning an intermediate wrapper for a z-index is enough to
  shrink a full-card click overlay to the text area without any visible error.
- **`.page button:focus-visible` (0,2,1) outranks `.cardOpen:focus-visible`
  (0,2,0).** The card-specific reset needs the `.page` compound or the card wears
  two focus rings — the overlay's and the icon's.
- **Vite's CSS-module HMR can return an empty `styles` object** after a module is
  rewritten from outside the editor. A chart rendered completely unstyled and the
  production build was fine; a hard reload fixed it. Suspect the dev server before
  the stylesheet, and confirm against `dist/`.
- **The Browser pane's synthetic key events do not activate native buttons.**
  Same finding as § 8. Test activation through `.click()`; a button that "does not
  respond to Enter" in the pane is the harness, not the page. Verify against a
  control you have not touched before believing otherwise.
- **rAF is throttled to ~1fps when the pane is not fronted.** Any frame-timing
  measurement taken while it is hidden is worthless and *looks* plausible — check
  `document.visibilityState` before trusting a number.

### Verified, not assumed

Driven in a real browser. The palette work on the dev server, everything
performance-shaped on `npm run preview` against the production build.

| check | result |
|---|---|
| 4-up grid at 1200px | 4 × 248.5px, even gaps, all four cards exactly 473px tall, no overflow |
| responsive | 1024px → 2 columns; 375px → 1 column, no horizontal scroll |
| card hover | lift −5px, border .14→.34, surface `#0b1d21`→`#10262b`, glow .68→1, art `scale(1.035) saturate(1.12) brightness(1.06)`, icon cyan + `translate(3px,-3px)` |
| whole card clickable | hit test at the cover centre returns the button; accessible name `Read the case study: {title}` |
| keyboard | focus ring drawn around the card, not the icon; `:has()` brightening confirmed |
| reduced motion (business) | 4 cards at opacity 1, `transform: none`, no inline styles, no progress bar, Lenis off |
| touch | `hover: hover` false — no sticky hover after tap; card tap target 331×452 |
| charts | supporting series `#0f766e`, the finding `#22d3ee`, stat values 49.6px cyan |
| drag reveal, mid-gesture | `--mode-pos` 0.657, panel `rgb(7,20,23)`, `--glass-lift` 9%, teal specular, `blur(4.45px) saturate(1.29) brightness(1.03)` |
| design portfolio after the orb refactor | unchanged — orb tracked to POSTER DESIGN, lit the nameplate, raised the enter card |
| landing cursor fix | index `cursor: pointer`, letterbox bands `auto`, stage and nameplates still `none` |
| orb cursor handoff | before any mouse move flag `null` + cursor `auto`; after, flag `on` + cursor `none` |
| leaving business mode | flag cleared, cursor `auto`, one canvas left |
| prefetch ordering, fresh visit | landing art completes at 45ms, business prefetch starts at 55ms |
| `tsc` / `lint` / `build` | green; 5 pre-existing `router.tsx` warnings only |

**Not verified:** `prefers-reduced-motion` under real OS emulation — same
limitation as § 8; the CSS rules were read back out of the loaded stylesheet and
the JS paths tested by patching `window.matchMedia`, but the media query itself
was never flipped. **Safari is untested** for all of it. And every frame number
above is one machine through the Browser pane — the business page measured 75fps,
but that is a capped display on a desktop GPU and says nothing about a laptop on
battery.

---

## 10 · EMBERDEEP — a playable game on its own case-study page — 17 September 2026

| commit | what |
|---|---|
| `805dc9b` | A new Website Design card opens `/website-design/emberdeep`: the owner's quote, the Godot web build in a click-to-load iframe, and six sections of build diary. The game's heroine, Ilva, can walk out of the room and onto the article, use things on it, and walk back in. |

Branch `feature/emberdeep`. The owner approved the plan, the copy, the hosting
choice and a layout to try before any of it was written; pushing and deploying
each need a separate yes.

### Where it came from

The game lives in **another repo** and must not be edited from here:
`C:\Users\zab\Documents\Codex\2026-09-14\build-emberdeep-a-playable-top-down\outputs\emberdeep-godot`
(branch `interaction-lab`). Its `web/portfolio/` holds the handoff
(`HANDOFF.md`), the plan (`INTEGRATION.md`), the approved copy
(`CASE_STUDY.md`), the **postMessage contract** (`README.md`) and the
prototype page. The built files came from `…\build\portfolio-prototype\`. A
re-export runs in that repo (`tools/portfolio/export_web.ps1`), only with the
owner's agreement.

### Decisions the owner made (2026-09-17)

- **Hosting: committed to git.** `index.pck` is 92 MB — under GitHub's 100 MB
  hard limit, over its 50 MB warning — and each re-export adds ~130 MB of
  history. Git LFS was ruled out because Hostinger's git deploy is unlikely to
  fetch LFS objects.
- **Layout: a dedicated one** (the plan's "option 2"), on trial — "if I don't
  like it we'll go back to option 1", which is existing `exhibit` scenes plus
  two small new blocks. If that happens, `GameCaseBlock`'s `compare` and
  `problems` are the two to keep.
- **Copy: approved as written.** `src/data/emberdeepCaseStudy.ts` is verbatim.
- **Phones: poster + "Play anyway · Best on desktop".** No real device has
  been tested, and the textures are desktop-compressed.
- **Category:** the owner will rename "Website Design" to "Web / Game Design"
  later. Nothing here depends on the name.

### How it's wired

- **Data.** `Project` gained `play` (`PlayableGame`), `gameCaseStudy`
  (`GameCaseStudy`), `heading` (the page's own h1/subtitle when shorter than
  the card's: the card says "EMBERDEEP — A Night at Cinder Inn", the page
  says "EMBERDEEP") and `details` (replaces the generated Year/Role/Tools row;
  here it reads Role / Made with / Time). Content is in
  `src/data/emberdeepCaseStudy.ts`. Prose supports `**strong**`, `*em*` and
  `[[K]]` for a key, rendered by `components/game/InlineMarks.tsx`; no HTML
  is ever injected.
- **`components/media/PlayableGame.tsx`** follows `VideoEmbed`: a poster and a
  button until asked, then the iframe (`allow="autoplay; fullscreen; gamepad"`,
  focused on load). An effect builds the `CharacterLayer` and the touch
  controls and destroys both on unmount. The touch controls are portalled to
  `<body>`: they are `position: fixed`, and the interior motion's entrance
  transforms would otherwise pin them to the article.
- **`components/media/character-layer.ts`** is the game repo's
  `site/character-layer.js` with types added. Four deliberate additions, all
  because a React page unmounts and the prototype never did: `destroy()`
  removes the return-button listener and any highlight; the manifest is
  fetched once; `_hide()` clears the element she was standing on; and
  `mountTouchControls` returns a cleanup. **Change it only together with the
  game side** (the contract is in that repo's README).
- **`character-layer.css` is global**, not a module: the layer builds its own
  `ilva-*` elements, so hashed class names can never reach them. It is only
  loaded with the project-page chunk. Ilva sits at z 90: over the header (40)
  and the switch (45), under overlays (100) and modals (1000).
- **Scroll-follow goes through `scrollToInstant`**, looked up per call, so
  Lenis stays the one engine moving the document (§ 8). `lenisInstance.ts`
  also gained `getLenis()`, currently unused by the layer.
- **`components/game/GameCaseStudy.tsx`**: the quote, then numbered sections
  from blocks — `prose`, `timeline`, `pipeline`, `figures`, `compare`,
  `problems`, `stats` and `aside`. Headings are `SectionHead` (title + number
  as meta); frames take each image's measured aspect; every image opens in one
  shared `Lightbox`, in reading order. It replaces the gallery in
  `ProjectDetail`, as `book` and `exhibit` do.
- **Things Ilva can use** carry `data-ilva-interact="label"`: every figure
  ("Look", opens the Lightbox), each slider ("Swap", flips the split end to
  end), each problem card ("Read", then marked "✓ Read by Ilva"), and, on game
  pages only, the two return buttons. Her E press arrives as `element.click()`
  with `detail === 0`. The slider and the cards react only to that, so a
  visitor's own mouse click never reads as hers.
- **Hosting.** The site is on **Hostinger**, so the handoff's `vercel.json`
  headers would have done nothing. `public/games/.htaccess` sets
  `application/wasm`, deflate for the `.wasm` (40 → ~10 MB), and immutable
  caching for everything under the versioned folder. **A new export goes in
  `v2/`, never over `v1/`**, or visitors keep the old one for a year. The root
  `.htaccess` rule that 404s missing assets now covers `.wasm` and `.pck`, so a
  missing file fails loudly instead of returning the app shell. `vercel.json`
  carries the same caching for parity. No COOP/COEP: the build is
  single-threaded.
- **Repo plumbing.** A root `.gitattributes` marks `*.pck` and `*.wasm` binary,
  because a wrong guess on this `autocrlf` checkout would corrupt the game.
  oxlint ignores `public/games/**` (Godot's generated engine code).
  `mediaDimensions.ts` was regenerated: the 25 new images, plus 32 rows that
  were stale for images already committed (worst aspect drift 0.1%, no layout
  change). Three of the 25 images are shipped but not used by the copy:
  `fail-rig-weights`, `furniture-render-vs-painting`,
  `pipeline-registered-walk`.

### Bundle

Against the branch's starting point (`1680bbe`), built side by side:

| chunk | before | after |
|---|---|---|
| entry (`index`) | 168.72 kB / 59.64 gzip | 178.05 kB / 63.47 gzip |
| `ProjectDetail` (lazy) | 43.66 kB / 10.93 gzip | 67.41 kB / 17.96 gzip |

The +3.8 kB gzip on the entry is the case-study copy: `projects.ts` imports it,
the same way it already imports the Avengers, Manifesto and Solarpunk content.
GSAP is still off the critical path. The game itself costs nothing until
someone presses Play.

### Verified, not assumed

Local dev server, Browser pane, 1081×914 desktop and 375×812 touch emulation:

| check | result |
|---|---|
| card | renders in Website Design beside Ripple, same `ProjectCard` |
| page | h1 "EMBERDEEP", breadcrumb, Role / Made with / Time, 6 sections + Related, 21 images, none broken |
| before/after slider | `--split` follows the input; `aria-valuetext` reads both halves |
| Play | logo reveal, then the room; layer `game`, iframe focused, one Lenis |
| out of the room | through the door and off the edge in 2.25 s; full exit payload received; focus moved to Ilva |
| on the page | walks on `walk_S`, settles on `idle_S` at key-up; the page followed her 512 → 593 → 1216 through Lenis |
| E prompt | "E · Look" over the figure she stood on, and the figure lit |
| E press | opened that image in the Lightbox; Ilva paused; Escape closed the Lightbox only, and focus came back to her |
| problem card / slider | a mouse click (`detail 1`) left the card alone; her E marked it read; E flipped the slider 20% → 100% |
| Escape | sent her home: `emberdeep:returned`, focus to the game, nothing left lit, she stands on the landing |
| walking back in | across the east edge 0.8 s after arming; a key released afterwards was forwarded as `emberdeep:release` |
| leaving the page | iframe, layer and touch controls all removed; coming back shows a fresh Play button |
| phone | "Play anyway · Best on desktop · About 130 MB"; no horizontal overflow; touch controls appear once the game is ready; a real drag on the joystick sent input ramping toward 0.74, 0.67 and back to 0 |
| `tsc` / `lint` / `build` | green; 5 pre-existing `router.tsx` warnings only |

The only console error is the game's own: Godot warns that TAA needs the
Forward+ renderer (the web build uses Compatibility). It is harmless, and it
belongs to the game repo.

**Not verified:**
- **Real keyboard play.** The pane's automation can't hold two keys at once, so
  she was walked out with the game's joystick message (the same one the touch
  controls send). Her page walk was driven by key events sent to her element.
- **Hostinger itself.** The `.htaccess` rules, the `.wasm` content type and the
  92 MB file have not been through a deploy yet.
- **A real phone or tablet**, Safari, and `prefers-reduced-motion` under real
  OS emulation.
