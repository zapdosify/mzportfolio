# CONTEXT — Pixel Archipelago Portfolio (session handoff)

**Read this first in a new session.** Last updated: **2026-07-27** (all 6 phases done, plus a
media-presentation pass: full-width board decks, real Lightbox zoom, ten looping videos, and
the Manifesto typeset as a book). Working tree clean, build green, **ready to deploy**.

**What changed most recently** — jump to §9's last four entries for the detail:
board decks read edge-to-edge (BookBabies · HODL · Frontline · Magenta Moves), the Lightbox
zooms to native pixels, HODL's hero and the Manifesto's nine chapter cards are crossfade-looped
video, and the Manifesto's text spreads are now 4,705 words of real DOM text.

**⚡ GIT IS LIVE.** `main`, local only — **no remote** (nothing is backed up off this machine).
Commit at every milestone. Media (~780M of masters) is in history; `.gitignore` excludes
`node_modules/` and `dist/`.

**Dev server + caches:** nothing is running and `dist/` + `node_modules/.vite` were cleared at
the end of the last session — `npm run dev` will do a cold (slightly slower) first start. That
is expected, not a fault.

Project root: `C:\Users\zab\Desktop\Portfolio 2026\`
App root: `pixel-archipelago/` · Dev: `npm run dev` (port 5173) · Build: `npm run build`

---

## 1 · What this is

Rebuilding **Mohammed Zaabi Noor's** design portfolio (previously a Wix site at
`mznoor8.wixsite.com/portfolio`) as a **"Pixel Archipelago"** — a dark, monochrome,
explorable world where each of 13 portfolio categories is a floating pixel-art island.
The visual identity is fixed and approved; it must not be redesigned.

**Feel:** interactive digital exhibition · monochrome archipelago · minimal sci-fi interface · premium editorial in pixel art.
**Not:** a colorful retro game, RPG, arcade UI, or generic card-grid portfolio.

---

## 2 · Current status

| Phase | Status |
|---|---|
| 1 — Scaffold + content migration | ✅ complete |
| 2 — World engine (orb navigator) | ✅ complete |
| 3 — Interior page template | ✅ complete |
| 4 — All 13 categories + detail pages | ✅ complete |
| 5 — Responsive + accessibility pass | ✅ complete (2026-07-24) |
| 6 — Performance + QA + deploy docs | ✅ complete (2026-07-24) |
| Post — content pass + polish | ✅ complete (2026-07-25) |

**ALL SIX PHASES COMPLETE.** The site is deploy-ready (see `pixel-archipelago/DEPLOY.md`).

Also complete: content audit (`BUILD-PLAN.md`), scene-decomposition report (`DECOMPOSITION-REPORT.md`), About page (portrait + résumé timelines + linked award).

---

## 3 · Stack & architecture

React + Vite + TypeScript + React Router + Zustand + GSAP. Canvas for the orb; **all text/content is semantic DOM** (never rendered into canvas).

```
pixel-archipelago/src/
├── app/          RootLayout.tsx (header hidden on landing; route crossfade), router.tsx
│                 — interior pages are React.lazy behind Suspense; Landing stays eager
├── pages/        Landing/, CategoryPage.tsx, ProjectDetail.tsx, About.tsx, Contact.tsx, NotFound.tsx
├── components/   layout/(Header,Footer,CategoryBanner) navigation/IndexMenu
│                 gallery/(Gallery,Lightbox) project/ProjectCard
│                 media/(MediaFigure, AmbientVideo, VideoEmbed)
│                 story/StoryScroll      contact/ContactDialog
├── world/        OrbLayer.tsx (cursor-following orb), Starfield.tsx
├── data/         categories.ts, projects.ts, solarpunkStory.ts, siteContent.ts,
│                 types.ts, mediaDimensions.ts (generated), worldManifest.json
├── hooks/        useWorldStore.ts (Zustand: orb pos, explored, indexOpen, contactOpen,
│                 reducedMotion; partially persisted)
│                 useHeroReveal.ts, useStaggerReveal.ts (GSAP ScrollTrigger)
└── styles/       tokens.css, global.css, interior.module.css
```

**Routes:** `/` + 13 categories (`/app-design`, `/website-design`, `/visual-artwork`, `/manifesto-design`, `/exhibition-design`, `/poster-design`, `/animation`, `/documentary`, `/renders`, `/3d-lettering`, `/t-mobile`, `/about`, `/contact`) + `/:categoryId/:slug` project details.

---

## 4 · The landing page (most iterated — read before touching)

Layer order inside a fixed-aspect stage (`1672 × 941`):
1. `public/images/landing/background.png` — starfield void (parallax factor ~0.03)
2. `public/images/landing/islands.png` — **keyed-transparent** islands composite (~0.10 parallax)
3. Central **yellow pulsing orb** (DOM, at `49.5% / 50.4%`) — core + glow + emitted ring
4. **DOM nameplates** — 13 clickable/hover plates, positioned by `PLATE_X` / `PLATE_Y` in `Landing.tsx`
5. `OrbLayer` canvas — white orb that **follows the cursor** (system cursor hidden: `cursor:none`)
6. **HUD** (fixed, no parallax): title, "Move to Explore", Index button, world map, status legend

### Hard-won decisions — do not regress
- **Use the layered approach**, not a single flattened image, and **not** per-island sprites (that lost the bridges/centre platform and drifted from the concept).
- `islands.png` was derived from `Individual Elements/Archipelago islands without nameplate.png`, which has **no alpha** (baked grey gradient). It was keyed with `tools/key_composite.py` (progressive edge-aware flood). **Keep the full original frame — no cropping** — so % coords map 1:1 to the stage.
- The baked ringed planet was cut out with `tools/erase_orb.py` and replaced by the DOM yellow orb.
- Nameplate x-positions were measured from the art with `tools/measure_labels.py`; Animation & Documentary were then nudged right by hand (`58.9`, `76.9`).
- Numbers were removed from nameplates; labels are centred.
- The DOM header is **hidden on the landing** (baked/HUD chrome is used instead) — see `RootLayout.tsx`.
- All motion respects `prefers-reduced-motion`.

### Nameplate clicks & the canvas z-order trap (fixed — do not regress)
The nameplate `<Link>`s once appeared dead. **Cause:** the `OrbLayer` canvas is a direct child of
`.stage` at `z-index:2`, while the plates' `z-index:4` lives *inside* `.worldLayer`, whose `.parallax`
`transform` creates a stacking context — so that 4 can't escape above the canvas. The canvas (default
`pointer-events`) then swallowed every click. **Fix:** `OrbLayer.module.css` sets the canvas
`pointer-events:none`; its tap-to-snap `pointerdown` moved from the canvas to the `.stage`, and
`pointermove` stays on `window`, so orb tracking is unchanged. The whole plate (the 152px Link box) is
the target, not just the label.

### Landing → category "warp" transition (`Landing.tsx` `go()`)
All landing navigations (plates, orb Enter, enter-prompt, sr-nav) funnel through one `go(route)`:
plays a `.warp` light-bloom overlay, then `navigate()`. (**Timing was reworked to 650ms —
see the 2026-07-23 entry in §9; the original 300ms value is historical.**)
A `leavingRef` latch makes repeated
clicks fire **once** (double-nav guard). Plates keep their real `<Link to>` (href/right-click intact)
but `onClick` `preventDefault`s to run the transition; Enter uses the native link-click path, and
`onKeyDown` adds **Space** activation. Under reduced motion `go()` navigates immediately (no warp).

### Orb-powered colour reveal (`.colorReveal` + `OrbLayer` `revealRef`)
`public/images/landing/Colored_Archipelago.png` (1672×941, **opaque RGB**, no alpha — matches the art
geometry 1:1) sits over the mono islands inside `.worldLayer`, so both share the box + parallax and
stay pixel-aligned (verified 0px drift at mobile/tablet/desktop). A feathered circle follows the orb
via two CSS custom props (`--rx`/`--ry`, in stage %) that **`OrbLayer` writes each frame** (reusing its
existing rAF loop; no React re-render). Because the colour asset has no alpha, the reveal is **two
intersected masks** — the orb radial-gradient AND `islands.png`'s own alpha (`mask-composite:intersect`
/ `-webkit-…: source-in`) — so colour never spills onto the background. `--reveal-rx` is a % of width;
`--reveal-ry = calc(--reveal-rx * 1.777)` compensates for the box aspect so it reads as a true circle.
`--reveal-on` (0/1, opacity-transitioned) hides it when the pointer leaves the scene. Disabled under
reduced motion in **both** the JS gate and a CSS `display:none`. ⚠️ The reveal centre ignores the ≤~1%
parallax offset between stage-space and the parallaxed world layer — imperceptible with the feather;
don't "fix" it by pulling the colour image out of `.worldLayer` (that breaks mono/colour alignment).

### Orb-click colour BURST (`Landing.tsx` `triggerBurst` + `.colorBurst` / `.pulse`)
Clicking the centre orb floods **every** island with colour, holds, then fades back — distinct from the
mouse-following `.colorReveal` above.

- The centre orb is now a real **`<button>`** (`aria-label="Illuminate the archipelago in colour"`),
  not a decorative div. Native button ⇒ Enter/Space activation for free; a `::after` gives it a ≥44px
  hit target even though the visual is ~13–40px. Focus shows a ring on `.orbCore`.
- **z-order fix:** the orb is `z-index:5` (above the `z-index:4` plates). On small screens the large
  nameplates crowd the centre and overlapped the orb (`/animation` + `/poster-design` plates sat on top),
  blocking taps — raising it fixes mobile without affecting desktop. Also, `.plates` ul is now
  `pointer-events:none` with `.plate` `pointer-events:auto`, so the gaps between plates (incl. the orb)
  are clickable.
- **Second colour layer** `.colorBurst` (same `Colored_Archipelago.png`, same box/parallax → 0px drift,
  verified desktop+mobile) revealed by an **expanding** radial mask centred at `49.5% 50.4%`, intersected
  with `islands.png` alpha (colour never leaves the islands). Radius animates via a registered
  **`@property --burst-rx`** (0→135%) so it interpolates smoothly. A visible `.pulse` ring (transform
  `scale(0.15→16)` + fade) emits from the orb's on-screen centre.
- **Timeline:** expand 0.9s → hold 5s → fade 1.5s (`burstFade` delayed 5.9s), total ~7.4s. React state
  `burstOn` mounts the layers; **`burstId` (a key) bumps on every click so repeated clicks REMOUNT and
  restart cleanly** — always exactly one `.colorBurst` + one `.pulse`, no stacked timers/pulses (a single
  `burstTimer` ref is cleared+reset each click, and on unmount).
- **Reduced motion:** no pulse, no expand — `.colorBurstReduced` sets `--burst-rx:135%` (instant full
  reveal), holds 5s, then fades (total ~6.5s). Gated by the same merged `reducedMotion` value.
- The localized `.colorReveal` keeps running underneath; the full burst simply dominates, then the
  localized reveal is already present as the burst fades (seamless hand-back).
- ⚠️ **Reduced-motion burst is UNVERIFIED by observation** — the preview pane can't emulate
  `prefers-reduced-motion` and the store toggle isn't exposed there. Logic is in place; confirm by eye.

### Nameplate hover: no more box ABOVE the plate
The per-plate `.tooltip` (which opened *above* the plate and covered the islands) was **removed**. On
hover/focus the info now appears only in the **bottom-centre enter-prompt** (`.enterPrompt`) — its
condition was broadened to fire on hover, not just orb-proximity (the old `!hoverId` guard is gone).
One box, at the bottom, never obscuring the art.

---

## 5 · Content (already migrated — do not invent facts)

**16 projects** + About/Contact. 14 were scraped from the old Wix site and stored as markdown in
`projects/` and `pages/`, then typed into `src/data/projects.ts`; Solarpunk was added
2026-07-24 from the user's own capstone files.

| Category | Projects |
|---|---|
| App Design | BookBabies · HODL · Frontline Readiness |
| Website Design | Ripple Symposium *(written case + looping motion piece; no site screenshots)* |
| Visual Artwork | Digital Painting (10 pieces) |
| Manifesto Design | Design Manifesto · **Worldbuilding Through Solarpunk** (masters, 2023) |
| Exhibition Design | Exhibit Design (3 sub-cases) · **Avengers Exhibition Design** (2026-07-27) |
| Poster Design | Poster series (9) |
| Animation | Animated Shorts (3 videos) |
| Documentary | The Social Pandemic, 2021 (4 videos) |
| Renders | 3D Animation (5 videos) |
| 3D Lettering | 3D Lettering (4 videos) |
| T-Mobile | Magenta Moves |

Media: `images/` (102 files ≈194 MB) and `videos/` (16 × 1080p MP4 ≈160 MB) at project root;
web copies live under `pixel-archipelago/public/media/`.

### Known content gaps — mark as missing, never fabricate
Most **years**, **clients**, and **collaborators** are unknown (only Documentary = 2021, award = 2019).
Ripple has **no website screenshots** (it does now have the looping motion piece).
T-Mobile's 3D viewer isn't downloadable. Most external film/flipbook links were never real
`href`s and render as "— unavailable" chips — **except the documentary's full film**, which
is now a real YouTube embed (2026-07-24); its stale chip was removed.

---

### Media layout is measured, not guessed (Phase 4 — do not regress)
The original hand-written `ratio: "portrait"` hints **disagreed with the real files**, and
`object-fit: cover` was cropping design work (BookBabies' 1.37 landscape boards were being
crushed into 3:4 frames, losing ~45% of each). Fixed by deriving aspect from disk truth:

- `tools/measure_media.py` → generates `src/data/mediaDimensions.ts` (102 assets, intrinsic w×h).
  **Regenerate after adding/replacing any image**: `py tools/measure_media.py`.
- `MediaFigure` reads those dimensions, sets `aspect-ratio` per asset, and uses
  **`object-fit: contain` — never `cover`** (cropping misrepresents design work).
- Videos have no measured entry; they inherit their **poster's** aspect (posters are exported at
  video resolution — verified: poster 0.562 vs real video 1080×1920).
- Assets with aspect < 0.35 are long **app-flow scroll sheets** (e.g. HODL 1940×15099). They get a
  bounded `max-height:70vh` frame that **scrolls internally** — uncropped, but layout-safe.
- `ratio` in the data is now only a deliberate override; passing nothing is correct.
- `ProjectCard` thumbs intentionally keep a uniform 4:3 `cover` crop (card grids need uniformity),
  anchored `center top` so tall covers show their masthead.

**Asset reality vs. the old plan:** posters are **square 4000×4000**, not vertical — the build plan's
"posters stay vertical" predates measurement. Animation holds 2 vertical (9:16) + 1 landscape short.

### Project gallery display system (`components/gallery/`)
`Gallery.tsx` + `Lightbox.tsx` — clickable thumbnail grid → full-screen viewer.

- **Two-layer principle:** thumbnails are **uniform tiles** (`object-fit:cover`, `object-position:center top`;
  4:3 for `grid`, 3:4 for `posters`) for a tidy, gapped grid; the **Lightbox shows the full, uncropped
  asset**. Cropping only ever happens in the thumbnail, so no work is misrepresented. This replaced the
  earlier ragged true-aspect grid that read as "one long sequence."
- **Lightbox** (`role=dialog`, `aria-modal`): full image on a 92% scrim, prev/next (buttons + ←/→ keys +
  touch swipe), `NN / NN` counter, caption, Esc / backdrop-click to close. **Focus trap + focus restore
  to the opening tile**, body-scroll lock, reduced-motion aware. Tall flow-sheets (aspect < 0.35, e.g.
  HODL's 0.13) render **scrollable** (`max-height:82vh; overflow-y:auto`) instead of shrunk.
- **Videos are NOT in the lightbox** — `variant="cinema"` still renders inline `MediaFigure` players with
  their own controls, and that early-return path is untouched (keeps out of MediaFigure, which the other
  chat owns). Only `type!=="video"` items enter the lightbox list; the tile's index maps into that
  images-only array, not the raw `items` array.
- Icons are inline SVG (no emoji), per the ui-ux-pro-max rule. The skill's style/color/font output was
  **not** applied — the grayscale / IBM Plex Mono identity is locked (see §6).

### Hero text reveal (`hooks/useHeroReveal.ts`)
GSAP **ScrollTrigger** entrance on every interior hero (CategoryPage, ProjectDetail, About, Contact —
**not** the landing page). Each direct child ("line") of `.heroText` fades in and slides up from 40px
below, staggered 0.15s (`duration 0.6, ease power2.out`, `start: "top 85%"`, `once: true`).

- GSAP 3.15 + ScrollTrigger are bundled deps (not CDN); this is the first GSAP use in the app and it
  adds ~114kB to the JS bundle. `gsap.registerPlugin(ScrollTrigger)` runs once at module load.
- Wrapped in `gsap.context(...)` scoped to the hero; cleanup is `ctx.revert()` so the "from" state is
  fully undone (no stuck-invisible text) on unmount/HMR.
- **Reduced-motion:** if `store.reducedMotion` OR `prefers-reduced-motion`, it no-ops and leaves the
  text visible — never animates.
- ⚠️ **The hook takes a `deps` array that must identify the page** (`[category?.id]`, `[project?.id]`).
  React reuses the same `CategoryPage`/`ProjectDetail` instance when navigating between two category
  (or two project) pages, so without the id dep the effect never re-runs and the reveal wouldn't
  replay. About/Contact are distinct components that remount, so they pass no dep. Verified live: lines
  start op~0/y40 and cascade in with the 0.15s stagger, and it replays on category→category SPA nav.

### Category page banner (`components/layout/CategoryBanner.tsx`)
**All 13 interior pages** — the 11 project categories plus About and Contact — open with that
page's **`landmark.png`** (the cinematic island scene) as a full-bleed background banner with a
subtle scroll parallax.

About keeps its **avatar** in the hero: that is the person, not the island, so it is not
a duplicate of the banner. (It was a circular photographic portrait until 2026-07-28 — see §9.) Contact's old `heroArt` *was* the landmark, so it was removed when the
banner took over.

- Height is the shared token `--banner-h` (tokens.css) — the banner and `.hasBanner` both read it,
  so they can never drift apart. **It must live in `:root`, not on the page div** — the banner is a
  *sibling* of the page content and would not inherit it.
- Parallax factor **0.28**, driven by a passive `scroll` listener with rAF coalescing (not a
  permanent rAF polling loop, which burned frames while idle). Disabled under `prefers-reduced-motion`
  in **both** JS and CSS.
- The banner is `aria-hidden` with an empty `alt` — the landmark art has the category name **baked
  into its nameplate**, and the page `<h1>` already announces it. Do not add alt text here.
- A `mask-image` fades the art out at 46%→100%, and a scrim gradient keeps type legible. The page
  content sits at `z-index:1` and starts inside the faded zone.
- `pagePreviewImage` in `categories.ts` is now **unused** (the landmark replaced it) — dead data,
  safe to remove in a later cleanup. `heroArt` styles are now used by **ProjectDetail only**.

⚠️ **Verifying motion in the Browser pane doesn't work**: it reports `document.hidden === true`, so
neither `requestAnimationFrame` nor real `scroll` events ever fire. Exercise handlers with
`window.scrollTo(...)` + `window.dispatchEvent(new Event('scroll'))` instead. Screenshots also
time out there; rely on DOM/`getComputedStyle` assertions.

## 6 · Design tokens (in `styles/tokens.css`)

Grayscale only — colour appears **only inside project imagery**, plus the single yellow centre orb.
`--black:#050505 · --near-black:#090909 · --surface-dark:#101010 · --surface-mid:#171717 ·`
`--border-dark:#292929 · --border-active:#575757 · --text-muted:#777 · --text-secondary:#B6B6B6 · --text-primary:#F2F2F2`

Type: **IBM Plex Mono** for display/UI/labels (uppercase, tracked) · **Inter** for long-form prose.
Deliberate override: the `/ui-ux-pro-max` skill suggests Press Start 2P + VT323 — **rejected**, VT323 body copy fails readability on long case studies.

---

## 7 · Environment

Node LTS 24.18 + npm 11.16 and Python 3.14 (`py` launcher) were installed via winget during this project.
Python needs **Pillow + numpy** for the asset scripts in `tools/`, plus **pymupdf**
(`py -m pip install pymupdf`, added 2026-07-24) to read/extract the capstone PDFs.

**ffmpeg** (winget `Gyan.FFmpeg`, added 2026-07-23) does all video work — re-encoding and
poster-frame extraction. New shells have `ffmpeg`/`ffprobe` on PATH; if a shell predates the
install, the binaries are at
`%LOCALAPPDATA%/Microsoft/WinGet/Packages/Gyan.FFmpeg…/ffmpeg-8.1.2-full_build/bin/`.
Gotchas hit in practice: `-ss` past a clip's end silently produces a broken file (check
durations first), and some sources need `-strict unofficial` for JPEG poster extraction.

Bash tool has TLS issues fetching remote images — **use PowerShell + `Invoke-WebRequest -UseBasicParsing`** for downloads.

---

## 8 · Reference docs

- `BUILD-PLAN.md` — content audit, category mapping, sitemap, world coordinates, phases
- `DECOMPOSITION-REPORT.md` — layer/asset decomposition analysis
- `SITE-STRUCTURE.md` — old-site content index + asset inventory
- `tools/` — asset pipeline scripts (keying, orb erase, label measuring, downloads, résumé extraction)

---

## 9 · Session log (history — newest at the bottom)

*Kept for the "why", not for what to do next. **Jump to §10 for that.***

**Phase 4 status.** The shared template turned out to already cover every case (videos, sub-projects,
process, missing links), and all content was already typed in `projects.ts`. So Phase 4 was not new
page-building — it was a **verification + correctness pass**. Done so far:

- ✅ Audited all 116 media references against disk — every path resolves, no 404s.
- ✅ All 27 routes (13 categories + 14 detail//page routes) return 200, no console errors.
- ✅ Verified 1080p video streams and plays.
- ✅ Fixed the cropping bug + measured-aspect pipeline (see §5 above) — `npm run build` clean.
- ✅ **Lightbox / full-size viewer built** (§ gallery display system) — click-to-enlarge, keyboard, swipe.
- ✅ **Hero scroll reveal** (§ hero text reveal), **category banners** (§), **orb colour reveal + click
  burst** (§4), **nameplate nav + warp transition** (§4) — all landed and building green.
- ✅ About portrait swapped to `public/images/about/New_Headshot.jpg` (1024×1024) via
  `siteContent.ts` `portraitImage`. Old `portrait.png` left in place, now unreferenced.

### 2026-07-23 evening session (creative-director polish pass) — DONE
All committed, build green, verified in preview where the pane allows:

- **Orb motion rework (user-requested):** breath/glow 3.8s→6.4s; hard emit ring → two soft
  blurred gradient ripples (6.4s cycle, half-period offset — one wave always travelling).
  Click pulse 900ms hard ring → 2.4s feathered blurred wave; colour-burst expand rides the
  same wavefront (2.4s, same easing; timeline expand 2.4/hold 5/fade 1.5 — JS total 8900ms).
- **Warp transition rework (user-requested):** 650ms bloom that settles to solid black
  (`.warp::after`), navigate at 620ms under cover; stage zooms slightly (`.stageLeaving`);
  ALL route changes crossfade in via WAAPI opacity fade on `#main` in RootLayout (480ms,
  reduced-motion aware; opacity only — transform would re-anchor fixed descendants).
- **Responsive landing:** `.stage` is a size container; plates `clamp(96px, 9.1cqw, 152px)`
  + label `clamp(0.46rem, 0.6cqw, 0.62rem)`; tracking/padding tighten under `@container
  (max-width:1400px)` so the longest labels fit. **≤640px: plates hidden entirely; the srNav
  becomes a visible plate-styled chip grid under the art** (13 plates can't fit 375px);
  legend hidden, titleBlock given right:128px wrap room.
- **Black poster fix:** animation short 01 + documentary 01 posters were fade-in black
  frames (lum 0 and 3 of 255). Regenerated with ffmpeg `thumbnail` filter (installed
  **Gyan.FFmpeg via winget** — at `%LOCALAPPDATA%/Microsoft/WinGet/Packages/Gyan.FFmpeg…/bin`,
  new shells have it on PATH). Both public/media and root images/ copies replaced;
  measure_media.py re-run (dimensions unchanged). Doc film is only 18.9s — frame taken ~9s+.
- **Banner ghost-title fix:** CategoryBanner mask now fades art fully by 85% height
  (42% hold → 0.35 @66% → transparent 85%) — the baked nameplate no longer ghosts behind H1.
- **Header legibility:** stronger gradient (0.92→0.72@62%→0) + blur(6px) with matching
  mask-image so the blur fades with the gradient (no hard edge).
- **⚠️ Undefined-token bug class:** `--space-5` does not exist (scale jumps 4→6). Two uses
  invalidated whole declarations (resume bullets: zero indent, em-dash struck through text;
  process cards: ALL padding lost). Audited: no other undefined tokens remain. When adding
  spacing, only use tokens that exist in tokens.css.
- **Poster gallery:** tiles 3:4 → **1:1** (assets are square 4000×4000 wall mockups; zero crop).
- Verified: Lightbox (dialog semantics, arrows, Esc, focus trap), contact mailto/tel links,
  About/Contact/ProjectDetail heroes, 404 page, production build clean.

### 2026-07-24 Phase 5 session — COMPLETE
- **Responsive:** interior pages verified at 375/768; mobile banner mask steepened
  (ghost nameplate fix at short banner heights); everything stacks cleanly.
- **A11y:** IndexMenu is now a real modal (scroll lock, Tab trap, focus restore to opener —
  verified live: open→focus in input, Esc→closed+restored). Global :focus-visible, skip link,
  h1/h2 hierarchy confirmed. Touch targets: plates get an invisible ±10px vertical hit
  extension (`.plate::after` inset), mobile chips min-height 44px, touch-action manipulation.
- **Sound toggle REMOVED** — no audio exists in the app; soundOn/toggleSound purged from the
  store + persisted state. Don't re-add a control without a feature behind it.
- **Motion system:** new `hooks/useStaggerReveal.ts` (ScrollTrigger, y24/0.5s/60ms stagger,
  once, reduced-motion aware, deps-keyed like useHeroReveal). On CategoryPage grids + all
  Gallery variants. IndexMenu rows cascade via `--i` CSS delay (gated no-preference).
  Press feedback (:active 1px nudge) on tiles/chips/buttons/header actions.
- **Verified:** all 27 routes render (client-side sweep, proper H1s), zero console errors,
  build green (496kB / 165kB gzip).

### 2026-07-24 Phase 6 session — COMPLETE
- **Code-split:** interior pages are React.lazy (Suspense fallback null — black void +
  route crossfade cover the fetch). Entry 496→351kB (gzip 165→113); GSAP in a lazy chunk.
  Landing stays eager. NOTE: automated route sweeps must allow >150ms for first lazy mount.
- **Media optimized (web copies only — root images/ + videos/ are untouched masters):**
  JPEGs ≤2560px q82 progressive; 4 tall PNG flow sheets → 1280px wide; videos H.264
  CRF23+faststart. public/media: ~355MB → ~232MB. `measure_media.py` re-run.
  Scratch script: optimize_images.py logic described in commit 80c3a27.
- **Deploy ready:** `pixel-archipelago/DEPLOY.md` + `public/_redirects` + `vercel.json`
  (SPA fallback). Recommended host: Netlify/Vercel, publish dir `dist`.

### 2026-07-24 pre-deploy content pass — COMPLETE
Eight requested changes, all landed and verified live:

- **Contact/socials:** location → "Phoenix, Arizona" (street address gone), **phone removed**
  (field + `tel:` link + `socials.phone`), LinkedIn → `/in/mzaabi/`, **Instagram removed**
  everywhere (Contact chips + Footer + data). Socials = LinkedIn · DeviantArt · email.
- **No archives:** CategoryPage no longer splits featured/rest. All projects render under
  Selected Works (featured first). `Archive` appears nowhere in src.
- **Documentary film:** `components/media/VideoEmbed` — YouTube `SwhkFe3__Ps` behind a
  **click-to-load facade** (thumbnail only until play is pressed; zero iframes/scripts/cookies
  on page view; player is youtube-nocookie). Verified: 0 iframes before click, 1 after.
- **Ripple motion:** `components/media/AmbientVideo` — silent looping title band under the
  hero. muted+loop+playsInline for autoplay; plays only while on-screen (IntersectionObserver);
  under reduced motion it does NOT autoplay (poster + real controls). Audio stripped in encode.
  Ripple's `imageryPending` flag removed.
- **NEW PROJECT — Worldbuilding Through Solarpunk** (`/manifesto-design/solarpunk`).
  ⚠️ **Category choice was mine**: Manifesto Design ("manifestos that declare intent"), since
  it's a declaration about how we should live. It is cross-linked both ways with Ripple
  (the symposium) and Design Manifesto. Move it by changing `categoryId` + the two
  `projectIds` arrays if you'd rather it sit elsewhere.
- **The publication + address** (`components/story/StoryScroll`): the **6 printed spreads
  shown whole** (uncropped, page order, `NN / 06` badge, click → shared Lightbox), then the
  speech underneath as **21 numbered chapters** ("The Address") with quotes and margin notes.
  ⚠️ **This replaced an earlier cropped-illustration layout** — 27 crops were cut from the
  spreads and interleaved with the text, but they framed awkwardly and the user rejected
  them (2026-07-25). The crops were deleted; **do not reintroduce them.** The publication is
  a designed artifact and is read as designed.
  Source files live OUTSIDE the repo at `Desktop/University Stuff after grad/`:
  `Publication.pdf` (6 spreads @4800×3000 — note the 8.7MB "Final Publication.pdf" in
  `videos/Ripple/` is only the LAST spread) and
  `Capstone final files/Final speech done and duster.pdf`.
  ⚠️ The speech PDF drops "ti"/"tt" ligatures on text extraction ("corporaons"). The story
  text was therefore transcribed from the **spread images**, which render clean. All wording
  is Mohammed's own; handwritten margin notes kept as `aside`. Nothing invented.
  Cover image is the talk's title frame (`solarpunk-talk-poster.jpg`, the UTOPIA globe).
- **Types gained** `story` / `ambientVideo` / `embeds`; `mediaDimensions.ts` → 137 assets.
- **PyMuPDF was installed** (`py -m pip install pymupdf`) to read/extract the PDFs.

### 2026-07-25 final polish — COMPLETE

**Card alignment (user-reported).** Project cards sized to their own content, so a card with
a longer title / subtitle / year badge grew taller than its neighbour (seen on Manifesto
Design). Cause: `.gallery` had `align-items:start`, which stops grid items stretching to the
row height.
- `.gallery` → `align-items:stretch`, and the stretch is passed through the `<li>` wrappers.
- `ProjectCard` fills the row (`height:100%`); `.thumb` is `flex:none` (keeps 4:3), `.meta`
  takes the leftover, and **`View →` is pinned with `margin-top:auto`** so a row shares one
  baseline. Gallery tiles got the same treatment.
- **Audited all 27 routes at 375 / 768 / 1280**: every row of cards, tiles, process steps,
  spreads and plates is 0px delta in height and width. Remaining width variance is limited to
  chips / tags / meta pairs / buttons — content-hugging by design, **leave them alone**.

**Contact composer** (`components/contact/ContactDialog`). "Send a message →" (Contact) and
**Email** (footer) now open a styled modal with Name / Your email / Subject / Message.
- ⚠️ **The site is static — nothing is sent from the page.** Submit builds a `mailto:` and
  hands off to the visitor's own mail app. **The UI says so explicitly** before ("the website
  doesn't send it for you") and after ("nothing has been sent yet"). The confirmation step
  offers a copy-address button + selectable address for anyone with no mail client.
  **Do not reword these into "message sent".**
- The user chose the mail-app handoff over Netlify Forms / Web3Forms / Formspree when asked
  (2026-07-25). To switch to real delivery later, only the submit handler changes — the
  dialog is already built.
- Form handling: visible labels, inline errors with `role="alert"`, `aria-invalid` +
  `aria-describedby`, focus moves to the first invalid field, 16px inputs (no iOS zoom),
  ≥44px targets, Esc / Tab-trap / scroll-lock / focus-restore shared with IndexMenu+Lightbox,
  message capped at 1800 chars (mailto gets unreliable past ~2k).
- **Fields reset on every open.** The dialog stays mounted for the page's life, so drafts used
  to persist and had to be deleted by hand — the user asked for blank every time. The grey
  "Portfolio enquiry" in Subject is a *placeholder*, not a value; empty subject becomes
  "Portfolio enquiry from {name}".
- Store gained `contactOpen` / `setContactOpen` (not persisted).

### 2026-07-25 late session — media presentation pass

**Ripple card art.** `/website-design`'s Ripple card had no cover, so it drew the `◇`
placeholder. Now uses the symposium wordmark, sourced from
`Website Redesign Assets/…/categories/website-design/Ripple Wordmark.png` (1152×648, white
on transparent) → `public/media/images/ripple-symposium-website/ripple-wordmark.png`.
- Two new `Project` fields: **`cardImage`** (thumbnail override read by `ProjectCard` **only**,
  so it never becomes the detail-page hero — the hero already has the looping motion band)
  and **`cardImageFit: "contain"`**. The contain variant keeps the 4:3 box so row heights stay
  level (the 2026-07-25 alignment work) but insets the mark 24px instead of cropping it.
- ⚠️ A wider `Ripple Wordmark (DF).png` (3346×947) also exists on the Desktop; the one filed
  under the project's own assets was chosen.

**Product images now match the old Wix presentation (user-requested).** Verified against
`mznoor8.wixsite.com/portfolio/appdesign` + `/project-2`: the old site renders **every board at
the content width, at its true aspect, uncropped, stacked in sequence** — including the tall
app-flow sheets (it rendered HODL's at 984×7655, page height 22,024px). It never used a
thumbnail grid.
- New Gallery variant **`boards`**, selected per project by the new **`galleryVariant`** field
  (not by category). Applied to **BookBabies (22), HODL (7), Frontline Readiness (6),
  Magenta Moves (20)**. Measured: HODL now 998×7767 / page 22,693px — the old site's layout.
- ⚠️ The aspect is set **inline from `mediaDimensions`**, not via `aspect-ratio: auto`. That
  keyword *discards* the width/height attribute hint, so every lazy board collapsed to height 0
  before loading. Do not "simplify" it back.
- This deliberately reverts the "uniform tiles" principle **for these four projects only** —
  every other gallery keeps the cropped grid (verified: Digital Painting still 3-col `cover`).

**Lightbox gained real zoom.** The old `.tall .image { overflow-y: auto }` did nothing — an
`<img>` ignores overflow — so tall sheets were just squashed into 82vh with no way to magnify.
- Fit ⇄ 100% toggle: button, click the image, or **Z**. Zoomed renders at native pixels
  (verified 1282×9964 for a 1280×9962 asset) with drag-to-pan; centred horizontally on zoom,
  top-anchored vertically.
- While zoomed, prev/next and swipe are suppressed (panning must not navigate). Every new
  asset opens fitted. Verified: Esc closes, focus restores to the opening tile, scroll unlocks.

**HODL hero is now the looping title sequence** (`components/media/HeroLoop`), replacing the
still cover. Source `videos/Crypto APP/HODL.mp4` → `public/media/videos/hodl-crypto-app/hodl-loop.mp4`.
- Encode **trimmed to 4.2s**: the original's last ~1s is dead black (measured via `signalstats`
  YAVG — content runs 0.17→3.5s), which looped badly. Audio stripped, CRF23 + faststart, 266kB.
- ⚠️ **A poster overlay is required.** The `poster` attribute stops applying once *any* frame
  decodes, and the sequence opens on black — so a deferred/suspended autoplay showed a black
  box. `HeroLoop` keeps a poster `<img>` over the video whenever it is `idle`
  (paused/waiting/stalled), not merely "not yet started".
- ⚠️ Its poster needed `.frame .poster` specificity to beat `.heroArt img { object-fit: cover }`
  from `interior.module.css`, which was cropping the poster while the video stayed `contain`.

**Preview-pane gotchas hit this session** (all documented in §10, all cost time):
screenshots served **stale frames** repeatedly (a hero that looked black was in fact painting);
the console buffer **persists across navigations and even server restarts**, so HMR-era
`ReferenceError`s from a half-finished rename kept reappearing — confirm against `tsc -b` and
whether the component still renders, not the buffer.

**Boards are edge-to-edge** (follow-up request): `gap:0` and no tile border/radius/background,
so consecutive spreads butt together as one continuous document. Verified 0px on every seam of
all board projects. ⚠️ Measure **after** the stagger reveal settles — mid-animation each row is
still offset (seams read 0.5→6px, growing down the page). That is `useStaggerReveal`, not layout.

**Design Manifesto is now the whole book** (`/manifesto-design/design-manifesto`), replacing the
single box render. 27 spreads of *Manifesto of Awakening* in page order, `galleryVariant: "boards"`.
Sources: `images/design-manifesto/` (27 spreads @3840×2160 + 8 chapter videos @4K).
- **The 8 chapter title cards exist as both stills and motion pieces**, so each video plays in
  place of its still spread. Card→video map (verified frame by frame, not assumed):
  `9→ch1 Torch · 11→ch2 Bonfire · 13→ch3 Journey · 15→ch4 Oasis · 17→ch5 Stray Path ·
  19→ch6 Weary Traveller · 21→ch7 Final Ascent · 22→ch8 Enlightenment`.
  Spreads 9/11/13/15/17/19/21/22 are therefore **not** in the gallery — their videos are.
  Book order is card-then-text throughout (…19 card, 20 text, 21 card, 21a text, 22 card, 23a text…).
- ⚠️ **The masters do not loop cleanly** — measured mean abs frame delta between last and first
  frame: ch8 was **51/255** (arms sweep in then vanish), ch2/4/6/7 also cut. Each web copy is
  re-encoded with **its own tail crossfaded over its head** (0.8s), so the output's last frame
  equals its first. All eight now measure **< 1.0/255**. Recipe is in the commit; if these are
  ever re-encoded, do the crossfade again or the loops will visibly pop.
- **`HeroLoop` was renamed `LoopVideo`** — now shared by the hero art slot and the board deck.
  In a deck it renders with **no player chrome, no tile, no lightbox**: silent, looping,
  IntersectionObserver-gated (8 videos on one page — off-screen ones must stay paused).
- Media: 4K → 2560px q82 spreads + 1920px CRF23 loops. **340MB of source video → 15.3MB served.**
  Build script kept at `scratchpad/manifesto_media.py` (logic described in the commit).

⚠️ **PowerShell + `git commit -m @'…'@` breaks if the message contains a double quote** — the
native-arg re-parse splits it and git reads the words as pathspecs. Use `git commit -F <file>`.

### 2026-07-25 — Manifesto text spreads → real typeset text — COMPLETE

The Manifesto's 15 text spreads were flat 4K images of type (unsearchable, unselectable,
invisible to screen readers, illegible on a phone). They are now **real DOM text — 4,705
words**. The emblem, PROLOGUE, EPILOGUE and the nine loop videos remain as media in the
same reading order, so it still reads as a book.

- **`src/data/manifestoBook.ts` is the text.** Edit that. `MANIFESTO-TRANSCRIPT.md` at the
  repo root is the provenance record — where each passage came from, and every edit made.
- ⚠️ **The docx supplied as "the source" is an EARLIER DRAFT than the printed book**
  (`E:\…\GRA 521\final manifesto pdf\manifesto\final document.docx`). Chapter 6 opens
  completely differently, chapters 7–8 are reworded throughout, chapter 5's closing passage
  is absent, and chapter 4's final paragraph was **cut from the book** (do not restore it).
  Trusting it would have published the wrong draft for roughly a fifth of the manifesto.
  Kept at `tools/manifesto-docx-extract.txt` **only** to verify shared passages word for
  word. The 93MB `Design Manifesto.pdf` on the Desktop is fully rasterised — not a source.
- **Editorial rule (user-approved, in that order):** typos → then grammar and punctuation
  to standard, all silent, no `[sic]`. **Voice is not up for editing** — the second-person
  address, rhetorical questions and long cumulative sentences stay. Two changes are worth
  knowing: the "mental copulations" clause was printed three times and is deduplicated
  (~30 words, the largest single edit), and the archetype list had "Imaginative, imaginative"
  and "strict and strict". Full log in the transcript.
- **`BookScroll`** (`components/story/`) renders `BookBlock[]` — plate · chapter · prose ·
  lead · epigraph · pull · verse · list · aside · closing. Present `book` on a Project and
  it **replaces the gallery** (ProjectDetail guards the gallery with `!project.book`).
- Typeset in the **site's** voice, not the artefact's: Plex Mono for structure, Inter for
  prose, grayscale, measure 71ch. A pastiche of the book's geometric sans on dark red would
  read as a broken copy of it. The six phrases the book coloured as reference links are real
  links (`manifestoLinks`), marked with a rule since the palette has no colour to spend.
- Verified: 35 blocks, 9 videos, 3 plates, gallery gone, no horizontal overflow at 375 or
  desktop, all 12 routes render, build green.

### 2026-07-27 — NEW PROJECT: Avengers Exhibition Design — COMPLETE

`/exhibition-design/avengers-exhibition`, a second project on the Exhibition Design page.
**The existing `exhibit-design` project was not touched** (verified live: same H1, same three
sub-cases, same 10-tile gallery). Source: 35 images in `Website Redesign Assets/…/categories/
exhibition-design/Avengers Exhibition/` — a 22-page project book, Unreal renders, 10 posters,
6 bookmarks, tickets and the exhibit pass.

- **`components/exhibit/ExhibitScroll`** renders a new `ExhibitScene[]` block union — `marker ·
  full · split · note · details · facts · plates`. Present `exhibit` on a Project and it
  **replaces the gallery** (ProjectDetail guards the gallery with `!project.exhibit`, same
  pattern as `book`). The script lives in **`src/data/avengersExhibition.ts`** — edit that.
- **Everything is a scene, not a tile.** Full-bleed plates, alternating image/text spreads
  (R/L/R/L/R/L/R at desktop, image-first when stacked), close-up rows, a spec strip, and the
  poster wall last. Order follows the book's own five parts — Venue, Introduction, Research,
  Marketing, Exhibition — resequenced so the spatial renders build to a climax.
- ⚠️ **`100vw` was the wrong full-bleed unit.** It counts the scrollbar, which made this the
  only page on the site wider than its own viewport (712 vs 704). Fixed with `--vw`, written
  from `document.documentElement.clientWidth` in a **layout** effect (unconditional — it is
  layout, not motion) and updated on resize. Verified 0px overflow at 375/660/768/1280.
- ⚠️ **`Plate` must stay at module level.** It was first written inside `ExhibitScroll`'s body,
  which makes it a new component type on every render — opening the lightbox remounted all 35
  plates, so the Lightbox's focus-restore had no button left to return to (caught by asserting
  `document.activeElement === btn` after Esc; it was false, now true).
- ⚠️ **A wrapped flex row stretches its orphan.** Close-up rows size each item by its own
  aspect (`--ar`, from `mediaDimensions`) against a zero basis, so mixed shapes share one
  height — verified 481/481px for the ticket+pass pair. But the 6-up bookmark strip landed
  5 + 1 at 704px with the last one full width. `--min` for a 4+ strip is now **84px**, low
  enough that six always fit on one line down to the 640px breakpoint. A pair goes **full
  width, one per row** below 640 — the min-width clamp would break the proportional widths
  anyway, and a half-of-375px ticket mockup is unreadable.
- **All copy is sourced, nothing invented.** Venue history, the six palette names + hexes
  (read off the spread at native res, not guessed: Crayola's Blue `#266EF6`, Electric Purple
  `#BF00FF`, American Orange `#FF8B00`, Boston University Red `#C60404`, Cyber Yellow
  `#FFD300`, American Green `#35B535`), the material schedule and the render labels all come
  from the book's own pages; the L-shaped-plan reasoning is Mohammed's existing write-up of
  the prompt. **Year, client and collaborators were not recorded and are omitted.** A
  `credits` line states it is an unaffiliated academic concept.
- The **palette strip is deliberately monochrome** — the swatches' real colours are visible in
  the research spread directly above it, and the interface never spends colour (§6).
- Media: 35 files, 197MB → **12.5MB** (≤2560px, q82 progressive, the Phase 6 recipe). Build
  script kept at `scratchpad/avengers_media.py`. `measure_media.py` re-run → **184 assets**.
- Verified: 28 scenes all reveal, 36 images 0 broken, lightbox counter reads `NN / 35` across
  the whole walk, Esc closes + restores focus, all 20 sampled routes render with 0px overflow,
  `tsc -b` and `npm run build` green (entry unchanged; ProjectDetail chunk +0.24kB).
- ⚠️ **The first cut of the motion was invisible, and the user said so.** Two separate causes,
  both since fixed — do not reintroduce either:
  - **Parallax was opt-in and moved the image inside a crop.** Only 2 of the 10 full-bleed
    plates set the flag, and on those the drift was ~63px on a 766px image *inside* a
    `scale(1.08)` frame, so nothing held still to read it against. It could not simply be
    turned up: travel inside the frame is paid for with more scale, and these are book
    spreads — more scale cuts type off the page. Now **every** full-bleed plate drifts, and
    the transform moves the **whole figure** against the page (`[data-parallax] .fullFigure`),
    so the image is `transform: none` and completely uncropped while its edge travels against
    the static label. Factor 0.10 of plate height, hard-capped at ±40px. Measured 80px of
    travel. The cap matters: the scene gap is 96px, so worst-case visual gap is 56px —
    verified, never overlaps. Consecutive scenes can only separate, never converge.
  - **Reveals finished below the fold.** `threshold: 0.08` + `rootMargin -10%` fired the
    700ms fade while a viewport-tall plate was still at the bottom edge. Now `threshold: 0`
    with `rootMargin -22%`, which fires when a scene's top crosses ~74% of the viewport
    (measured across all 28: 71–77%) — tall and short alike.
- ⚠️ Still not seen by eye at real frame rate; verified by measuring transforms and reveal
  trigger points in the one pane tab that reports `document.hidden === false`. A freshly
  opened tab reports `true` and neither IntersectionObserver nor `scroll` fires there, so all
  28 scenes read as still-hidden. That is the pane, not the page.

### 2026-07-28 — About avatar, and HODL's card

- **HODL's card** had no `cardImage`, so it fell through to the first gallery asset — the white
  sitemap diagram, a blank rectangle beside its neighbours. Now the project's title card.
  ⚠️ The **web copy is pre-cropped to the tile's 4:3**, left-anchored
  (`scratchpad/hodl_card2.py`): the source is 16:9, and letting `object-fit: cover` do it
  centres the crop and slices the tagline mid-word ("Welcome" → "me to"). Left-anchored keeps
  the tagline whole and lets the wordmark bleed off the right, which reads as deliberate.
  `contain` (the Ripple wordmark treatment) was tried and rejected — it floats small between
  two full-bleed neighbours and reads like a placeholder.
- **About's portrait is now the pixel-art avatar**, `public/images/about/about-avatar.png`
  (1254², from `Website Redesign Assets/…/categories/about/About.png`).
  ⚠️ **The circular mask had to go with it.** The avatar is a square composition — corner HUD
  marks in all four corners and a "Pixel Archipelago" caption along the bottom edge — and
  `border-radius: 50%` cut every one of them. `.portraitImg` is now `100%`, square, radius
  `--radius`. The circle belonged to the photographic headshot.
  Shipped as an **8-bit grayscale PNG** (1659K → 571K): the CSS applies `grayscale(1)` anyway,
  so baking it in is visually identical. **Not resampled** — pixel art goes soft under a
  non-integer downscale. Alt text now describes an avatar, not a photograph.
  `New_Headshot.jpg` joins `portrait.png` as unreferenced-but-kept in `public/images/about/`.

### 2026-07-28 — First-load intro on the landing page

`pages/Landing/Intro.tsx` + `Intro.module.css`. A ~6.5s cinematic cold open:
starfield → the sentence *"The idea you tossed away was probably the best one you've ever
had."* assembles word by word out of scattered pixels → holds with a restrained flicker/glitch
→ dissolves into particles that stream into the centre orb → the orb powers up (core, then
three rings one at a time, then one pulse) → a radial light opens into the landing, which
settles in as void → islands → nameplates → HUD.

- **Once per tab session** (`sessionStorage` `pa:intro-seen`), read in the `useState`
  initialiser — not an effect — so the landing is never painted un-hidden for a frame first.
- **Zero layout shift by construction:** the landing is mounted and fully laid out from the
  first paint; the intro is a `position: fixed` overlay on top of it. Only opacity/transform
  ever change.
- **The sentence is sampled from a real text render**, not hand-placed: it is drawn to an
  offscreen canvas in IBM Plex Mono, then `getImageData` is sampled on a ~3px grid. Each word
  is drawn at a known box so pixel → word is exact, which is what makes the progressive
  word-by-word reveal possible. ⚠️ **Must await `document.fonts.load` first** or the pixels are
  a fallback monospace — but the await is raced against 400ms and runs *during* the starfield
  beat. Awaiting before starting the clock pushed the finish ~500ms past the 7s budget.
- ⚠️ **The settle cascade uses `animation-fill-mode: backwards`, never `forwards`.**
  `.plateItem` and `.centerOrb` are `translate(-50%,-50%)` centred and `.layer`/`.worldLayer`
  carry the parallax transform — a lingering forwards fill would freeze them and kill the
  pointer parallax for the rest of the session. Verified after the intro: `--mx` live, world
  layer translating, `animationName: none` on the plates.
- **Escape hatches:** a visible Skip button (delayed 900ms — offering an exit before anything
  has appeared reads as an apology for the content), plus any click or keypress dismisses it.
  Skip crossfades in 300ms rather than cutting; a hard cut reads as the glitch the brief rules
  out. Measured 332ms.
- ⚠️ **rAF is suspended on a hidden tab**, so opening the site in a background tab would strand
  the overlay over the page forever. A safety timer force-finishes at ~8s. **Verified in that
  exact state** — with 0 rAF ticks the overlay still cleared at 8005ms with the landing fully
  visible.
- **Reduced motion** (store flag OR `prefers-reduced-motion`) takes a separate branch: no
  canvas, no particles, no travel, no settle cascade — the sentence fades up as DOM text, holds,
  fades out. ~1.8s, opacity only. Verified.
- The canvas is `aria-hidden`; the sentence is also emitted as `sr-only` text.
- Bundle: entry 422 → 430kB (gzip 139 → 142). It has to be eager — it *is* the first paint.

⚠️ **Two tuning bugs found by looking at it, both fixed** — the first cut was measurably wrong:
  - Particles faded across the *whole* dissolve path (`1 - ee²`), so they were extinguished
    before they had visibly gone anywhere — the travel beat rendered nearly empty. Alpha now
    holds until 72% of the path then snuffs on arrival, and the span went 760→1100ms with a
    520ms per-particle stagger so it reads as a stream. Measured: 5/5 particles lit at 27% of
    the path, 2/5 still lit at 87%, absorbed by 5.3s — landing exactly while the rings build.
  - The orb's rings were scaled off the **real** 44px DOM orb, giving 15/25/37px radii —
    invisible. Ring scale is now viewport-derived (64/106/159px at 1280×860); only the orb's
    *position* still comes from `[data-orb-target]`, so the handoff still lands on it exactly.
    The radial bloom covers the size change back down.

**Text beat, revised on the user's note (2026-07-28) — keep it this way:**
"smoothly appear, stay for a bit, then proceed… minimal and neat… pixelated white, not
off-colour grey." Four changes, none of which should be reverted as "polish":
- **No overshoot.** The assembly eased with `easeOutBack`, which made each word *punch* into
  place. Now plain `easeOutCubic`.
- **No per-word glitch and no settled flicker.** Both removed outright, not softened.
- **Uniform pure white.** Two separate causes of the grey: the fill was `#f2f2f2` (the
  body-text token, not white), and every pixel carried a random base alpha of 0.55–1.0, which
  read as mottled grey. Alpha is now uniform and reaches exactly 1.
- **Short scatter.** Origins were up to ~380px out, which read as a swoosh; now 14–60px, so
  the pixels settle rather than fly.
- Timing retuned with it: stagger 152→120ms, converge 620→560ms, so the sentence completes at
  ~2.34s and simply sits there for ~1.26s before the dissolve. Total still ~6.5s.

⚠️ Beats 1–2 (assembly, hold) were confirmed by eye via a canvas contact sheet **before** that
revision. Everything after — the retuned stream, the power-up, and the whole minimal/white
text pass — is verified by code and numbers only, **not seen**: the preview pane went
`document.hidden` and rAF throttled to ~4fps, so the canvas freezes and contact sheets come
back blank. This needs one look by eye in a real browser.

---

## 10 · ⏭️ Resume here (next session)

The site is **finished and deploy-ready**. Nothing is half-done. Suggested order:

1. **Deploy** — see `pixel-archipelago/DEPLOY.md`. `npm run build` → publish `dist/` on
   Netlify or Vercel (SPA fallback configs for both are already committed). This also
   permanently fixes the "site won't load" problem, since it no longer depends on a dev server.
2. **A remote git backup** — the repo is local-only, so a disk failure loses everything.
   Offer to set up a GitHub remote; **confirm with the user before pushing** (outward action,
   and the history carries ~780M of media).

**Open items — all judgement calls for the user, none blocking:**
1. ⚠️ **Things only a human eye can confirm** (the Browser pane can't): reduced-motion orb
   burst; warp / crossfade / stagger feel at real frame rate; the 720p re-encode of the
   Solarpunk talk on a big screen; the ten looping videos actually playing; **and now — the
   Avengers walk's scene reveals and the parallax drift on its two flagged plates.**
   The pane suspends media (`document.hidden`), so every loop was verified by DOM assertion
   and by measuring the encoded files, never watched. Worth one pass by eye, especially the
   crossfaded loop seams on Manifesto chapter 8 and the HODL hero.
2. **Ripple** (`/website-design/ripple`) — the case study is written and the looping motion
   piece plays, but there are still no website screenshots. Leave, or source visuals.
3. **Two Manifesto passages were flagged, not silently rewritten** — chapter 2's
   "the more you gain knowledge, the more it genuinely opens up numerous doors" (agreement
   fixed, but the intended subject is a guess) and the deduplicated "mental copulations"
   clause. Both are the author's call; see `MANIFESTO-TRANSCRIPT.md`.
4. **Solarpunk category placement was my call**, not the user's: it sits in Manifesto Design,
   cross-linked with Ripple. One-line move if they disagree (`categoryId` + two `projectIds`).
5. Résumé download **stays .docx** (decided 2026-07-24 — don't re-raise).
6. Cosmetic cleanup: `pagePreviewImage` in `categories.ts` is dead data, and
   `design-manifesto`'s `gallery`/`galleryVariant` are now unreachable (`book` wins) —
   kept deliberately as the fallback if the book is ever pulled.

**Dev-server note:** the root `.claude/launch.json` config `dev` binds 5173; a second config
`dev-alt` (port 5183, `autoPort`) exists so a session can start its own server when 5173 is
held by another chat. **A dead dev server is the #1 cause of "the site won't load"** — it only
lives as long as the session that started it. Restart it, don't debug the app.

**Verifying in the Browser pane — known limits (don't chase these as bugs):**
- It reports `document.hidden === true`, so `requestAnimationFrame` and real `scroll` events
  never fire. Exercise handlers with `window.scrollTo(...)` +
  `window.dispatchEvent(new Event('scroll'))`.
- Screenshots sometimes ignore scroll position or time out. Fall back to DOM /
  `getComputedStyle` assertions — that is how most of this work was verified.
- `prefers-reduced-motion` cannot be emulated there.
- Lazy routes need >150ms before asserting, or a sweep sees "NO H1" on a page that is fine.
