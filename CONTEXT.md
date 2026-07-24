# CONTEXT — Pixel Archipelago Portfolio (session handoff)

**Read this first in a new session.** Last updated: 2026-07-23 (evening — git + motion rework + QA sweep)

**⚡ GIT IS NOW LIVE.** `git init` done on `main` (local only, no remote). Commit at every
milestone. History so far: initial snapshot → motion rework → responsive landing →
poster/banner/header fixes → QA sweep. Media (~780M) is in history; ignore file excludes
node_modules/dist.

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
| 4 — All 13 categories + detail pages | 🟨 **IN PROGRESS** — media/layout truth pass done |
| 5 — Responsive + accessibility pass | ⬜ pending |
| 6 — Performance + QA + deploy docs | ⬜ pending |

Also complete: content audit (`BUILD-PLAN.md`), scene-decomposition report (`DECOMPOSITION-REPORT.md`), About page (portrait + résumé timelines + linked award).

---

## 3 · Stack & architecture

React + Vite + TypeScript + React Router + Zustand + GSAP. Canvas for the orb; **all text/content is semantic DOM** (never rendered into canvas).

```
pixel-archipelago/src/
├── app/          RootLayout.tsx (header hidden on landing), router.tsx
├── pages/        Landing/, CategoryPage.tsx, ProjectDetail.tsx, About.tsx, Contact.tsx, NotFound.tsx
├── components/   layout/(Header,Footer,CategoryBanner) navigation/IndexMenu
│                 gallery/(Gallery,Lightbox) project/ProjectCard media/MediaFigure
├── world/        OrbLayer.tsx (cursor-following orb), Starfield.tsx
├── data/         categories.ts, projects.ts, siteContent.ts, types.ts, worldManifest.json
├── hooks/        useWorldStore.ts (Zustand: orb pos, explored, indexOpen, reducedMotion; persisted)
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
plays a ~300ms `.warp` light-bloom overlay, then `navigate()`. A `leavingRef` latch makes repeated
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

14 projects + About/Contact, scraped from the old Wix site and stored as markdown in
`projects/` and `pages/`, then typed into `src/data/projects.ts`.

| Category | Projects |
|---|---|
| App Design | BookBabies · HODL · Frontline Readiness |
| Website Design | Ripple Symposium *(text-only — no imagery exists)* |
| Visual Artwork | Digital Painting (10 pieces) |
| Manifesto Design | Design Manifesto |
| Exhibition Design | Exhibit Design (3 sub-cases) |
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
Ripple has **no screenshots**. External film/flipbook links were never real `href`s. T-Mobile's 3D viewer isn't downloadable.

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

About keeps its circular **portrait** in the hero: that is the person, not the island, so it is not
a duplicate of the banner. Contact's old `heroArt` *was* the landmark, so it was removed when the
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
Python needs **Pillow + numpy** for the asset scripts in `tools/`.
Bash tool has TLS issues fetching remote images — **use PowerShell + `Invoke-WebRequest -UseBasicParsing`** for downloads.

---

## 8 · Reference docs

- `BUILD-PLAN.md` — content audit, category mapping, sitemap, world coordinates, phases
- `DECOMPOSITION-REPORT.md` — layer/asset decomposition analysis
- `SITE-STRUCTURE.md` — old-site content index + asset inventory
- `tools/` — asset pipeline scripts (keying, orb erase, label measuring, downloads, résumé extraction)

---

## 9 · ⏭️ Resume here

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

**Still open:**
1. ⚠️ **Verify by eye** (preview pane can't): reduced-motion burst path; the new warp +
   crossfade feel at real frame rate; ambient ripple softness (tune blur/opacity to taste).
2. **Ripple** (`/website-design/ripple`) still has no imagery — renders the `imageryPending` note.
   Decide: leave flagged, or source/commission visuals.
3. Remaining gallery tuning: `grid` variant tiles that read mostly-dark for tall dark-bodied
   flow sheets (BookBabies gallery tiles 2–3) — acceptable, revisit if desired.
4. The **résumé download is still .docx** — the earlier question about swapping to PDF remains open.
5. Phase 5 leftovers: tablet/landscape passes, focus-visible audit, dynamic-type/zoom check.
6. Phase 6: perf (495kB JS bundle — code-split GSAP?), media compression (ffmpeg now available),
   deploy docs.

**⚠️ Concurrency note:** for much of this work a second chat was editing the same tree (esp.
`components/gallery/*`, `MediaFigure`, `projects.ts`) with no git safety net. Before trusting any single
file, re-read it — another session may have changed it. Consider `git init` to get a net.

**Dev-server note:** the root `.claude/launch.json` config `dev` binds 5173; a second config
`dev-alt` (port 5183, `autoPort`) was added so a session can start its own server when 5173 is
held by another chat.
