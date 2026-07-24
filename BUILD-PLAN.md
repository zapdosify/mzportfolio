# Pixel Archipelago Portfolio — Pre-Build Plan & Content Audit
**Mohammed Zaabi Noor — Design Portfolio**
Prepared 2026-07-20 · Status: **AWAITING APPROVAL before production code**

This document delivers the eight required pre-build artifacts from the master prompt:
1. Content migration audit · 2. Category mapping · 3. Sitemap · 4. World layout · 5. Design-system summary · 6. Technical architecture · 7. Implementation phases · 8. Missing-content list

---

## 1 · Content Migration Audit

All content was already extracted from the live site (`mznoor8.wixsite.com/portfolio`) and stored under `projects/`, `pages/`, `images/` (102 files), and `videos/` (16 files). Nothing needs re-scraping.

| # | Existing page / project | Real title | New category | New route | Assets available | Missing info | Status |
|---|---|---|---|---|---|---|---|
| 1 | /appdesign | **BookBabies** (sleep + audiobooks) | App Design | /app-design/bookbabies | 22 UI images + full 5-step process writeup | client, exact year | ✅ ready |
| 2 | /project-2 | **HODL** (crypto asset mgmt) | App Design | /app-design/hodl | 7 images (personas, storyboards, app) + writeup | year | ✅ ready |
| 3 | /project-3 | **Sales Frontline Readiness App** (T-Mobile concept) | App Design | /app-design/frontline-readiness | 6 images + writeup | year | ✅ ready |
| 4 | /website-design | **Ripple Symposium Website** | Website Design | /website-design/ripple | writeup + tagline only | ⚠ **screenshots (page was text-only)**, year | ⚠ text ready, imagery gap |
| 5 | /visualartwork | **Digital Painting** (Visual Artwork) | Visual Artwork | /visual-artwork/digital-painting | 10 full-res artworks + writeup | individual titles/years | ✅ ready |
| 6 | /manifesto | **Design Manifesto** | Manifesto Design | /manifesto-design/design-manifesto | 1 image + full writeup | external flipbook/site URLs | ✅ ready |
| 7 | /exhibitiondesign | **Exhibit Design** (3 sub-projects) | Exhibition Design | /exhibition-design/exhibit-design | 10 images + 3 full writeups | years | ✅ ready |
| 8 | /posters | **Poster Design** (ideology series) | Poster Design | /poster-design/poster-design | 9 posters + 10 titles + writeup | per-poster mapping, year | ✅ ready |
| 9 | /animation | **Animated Shorts** | Animation | /animation/animated-shorts | 3 videos (1080p) + writeup | titles/durations | ✅ ready |
| 10 | /documentary | **The Social Pandemic** (2021) | Documentary | /documentary/social-pandemic | 4 videos + logo + writeup | full film/trailer URLs, credits | ✅ ready |
| 11 | /renders | **3D Animation (Renders)** | Renders | /renders/renders | 5 videos + 7 piece titles + writeup | 2 of 7 pieces have no video | ✅ ready |
| 12 | /3dlettering | **3D Lettering** | 3D Lettering | /3d-lettering/3d-lettering | 4 videos (named) + writeup | — | ✅ ready |
| 13 | /t-mobile | **Magenta Moves** ("Meeting in a Box") | T-Mobile | /t-mobile/magenta-moves | 20 images + full writeup | 3D-viewer model, dates | ✅ ready |
| 14 | /about | About | About | /about | bio, services, tools, 2019 award | portrait, résumé file, education dates | ✅ ready |
| 15 | /contact | Contact | Contact | /contact | email, phone, address, 3 socials | availability status | ✅ ready |

**Content-preservation guarantee:** every project, write-up, section label, tool list, and asset URL is preserved verbatim in the `projects/*.md` files. No project is dropped. No facts will be invented — gaps are marked "missing," never filled.

---

## 2 · Category Mapping

| Category | Route | Real projects mapped | Depth |
|---|---|---|---|
| App Design | /app-design | BookBabies, HODL, Frontline Readiness | **3 projects** (richest) |
| Website Design | /website-design | Ripple Symposium | 1 (imagery gap) |
| Visual Artwork | /visual-artwork | Digital Painting (10 pieces) | 1 project, gallery-heavy |
| Manifesto Design | /manifesto-design | Design Manifesto | 1 |
| Exhibition Design | /exhibition-design | Exhibit Design → Geometric Harmony · BMX Pop-Up · Avengers Museum | 1 project / 3 sub-cases |
| Poster Design | /poster-design | Poster Design series (9–10 posters) | 1 series |
| Animation | /animation | Animated Shorts (3 videos) | 1, video |
| Documentary | /documentary | The Social Pandemic | 1, video |
| Renders | /renders | 3D Animation renders (5 videos) | 1, video |
| 3D Lettering | /3d-lettering | 3D Lettering (4 videos) | 1, video |
| T-Mobile | /t-mobile | Magenta Moves | 1 (internship) |
| About | /about | Bio / services / tools / award | page |
| Contact | /contact | Email / phone / socials / location | page |

**Cross-links (related work, no content duplication):** Frontline Readiness ↔ T-Mobile; Renders ↔ 3D Lettering ↔ Animation (shared 3D/motion craft); Documentary ↔ Animation (motion graphics).

---

## 3 · Sitemap

```
/                         Landing — the explorable archipelago (world map)
├── /app-design           3 projects + process + archive
│   ├── /bookbabies
│   ├── /hodl
│   └── /frontline-readiness
├── /website-design       → /ripple
├── /visual-artwork       → /digital-painting  (gallery)
├── /manifesto-design     → /design-manifesto
├── /exhibition-design    → /exhibit-design  (3 sub-cases in-page)
├── /poster-design        → /poster-design  (series)
├── /animation            → /animated-shorts
├── /documentary          → /social-pandemic
├── /renders              → /renders
├── /3d-lettering         → /3d-lettering
├── /t-mobile             → /magenta-moves
├── /about
└── /contact
```
Every route is a real, deep-linkable, semantic page reachable **both** by exploring the world **and** by the accessible text Index. Project detail = route `/category/project-slug`.

---

## 4 · World-Map Coordinate Plan

Resolution-independent positions (normalized %, origin top-left) taken from `archipelago-home.png`. Planet/navigator origin ≈ (47.7%, 49.5%).

| # | Island | x % | y % | Landmark motif |
|---|---|---|---|---|
| 1 | App Design | 47.7 | 15.8 | smartphone monolith + UI panels |
| 2 | Website Design | 28.7 | 24.2 | browser frame + responsive screens |
| 3 | Visual Artwork | 65.5 | 24.2 | hanging gallery frames |
| 4 | Manifesto Design | 81.9 | 33.7 | editorial page tower + scroll |
| 5 | Exhibition Design | 18.7 | 45.3 | temple/pavilion + banners |
| 6 | Poster Design | 36.3 | 51.6 | poster billboards on steps |
| 7 | Animation | 57.6 | 49.5 | zoetrope film-reel drum |
| 8 | Documentary | 72.8 | 53.2 | projector + screen + film strip |
| 9 | Renders | 23.4 | 67.9 | wireframe cube/gem portal |
| 10 | 3D Lettering | 35.1 | 70.5 | giant "AR/Az" 3D letters |
| 11 | T-Mobile | 62.0 | 72.6 | telecom signal tower |
| 12 | About | 76.0 | 73.7 | observatory dome + timeline |
| 13 | Contact | 47.7 | 87.9 | beacon tower + signal rings |

Connections: orbital dotted lines from planet to each island, plus pixel bridges/stairs between adjacent islands, matching the concept art. Each island gets an `activationRadius` (~9% of world width) for proximity highlight → Enter prompt.

---

## 5 · Design-System Summary

**Direction:** dark, monochrome, cinematic pixel-art — an explorable spatial archive. Reconciled with the `/ui-ux-pro-max` skill: I keep the prompt's precise grayscale tokens and a **mono-display + clean-sans-body** pairing (the skill's generic Press Start 2P + VT323-for-body suggestion is rejected because VT323 body copy fails the skill's own `readable-font-size` / contrast rules for long case studies).

**Color tokens** (grayscale only; color appears *only inside project imagery*):
```css
--black:#050505; --near-black:#090909; --surface-dark:#101010; --surface-mid:#171717;
--border-dark:#292929; --border-active:#575757; --text-muted:#777; --text-secondary:#B6B6B6;
--text-primary:#F2F2F2; --white:#FFF;
```
Brightness hierarchy: orb/selected/title = pure white → primary text soft-white → secondary gray → borders dark-gray → surfaces near-black → world negative space black.

**Typography:**
- Display / UI / labels / metadata → **IBM Plex Mono** (or Geist Mono) — uppercase, tracked, pixel-adjacent.
- Long-form (case studies, bio, captions) → **Inter** (or Geist) for readability.
- Type scale 12 · 14 · 16 · 18 · 24 · 32 · 48+; body 16px min, line-height 1.5–1.6, measure 60–75ch.

**Texture & effects:** starfields, sparse dithering, stepped/pixel edges, block-built islands, thin illuminated paths, controlled glow on the orb and active states. No heavy grain.

**Motion:** slow, atmospheric, intentional — orbiting rings, subtle parallax, dimensional page transitions (island expands → interior). Durations 150–400ms for UI; camera easing longer. Full `prefers-reduced-motion` fallback → static world + instant routes.

**Chrome per page:** header `MOHAMMED ZAABI NOOR / DESIGN PORTFOLIO` · `INDEX ☰` · `← RETURN TO WORLD` · breadcrumb `WORLD / CATEGORY / PROJECT` · footer flourish.

**Interior page template (shared):** hero (title + one-line desc + landmark visual) → Selected Works (discipline-specific framed panels, *not* generic cards) → Process (only the stages that match the real work) → Archive → Related → Return to World.

Tokens will be persisted to `design-system/MASTER.md` + per-page overrides.

---

## 6 · Technical Architecture

Stack (per prompt): **React + Vite + TypeScript + React Router + Canvas/PixiJS world layer + GSAP (transitions only) + Zustand (world state) + CSS Modules**.

- **World layer** (Canvas/PixiJS): islands, orb, camera, particles, collisions, proximity. Low logical resolution + nearest-neighbor scaling for crisp pixels.
- **DOM/React layer**: all text, galleries, metadata, forms, index — semantic & accessible. **No project text rendered in Canvas.**
- **State (Zustand)**: orb position, camera, explored islands, sound + reduced-motion prefs → persisted to `localStorage` so Return-to-World restores position.
- **Data**: typed content model (`data/projects.ts`, `categories.ts`, `experience.ts`, `siteContent.ts`) generated from the `projects/*.md` audit. Pages read data; nothing hardcoded in components.
- **Accessibility spine**: the text Index + semantic routes are a complete, equal alternative to the world. Keyboard nav, focus states, alt text, video captions/transcripts, skip links, heading hierarchy.

Folder structure follows the prompt's `src/{app,components,world,pages,data,styles,hooks,utils}` layout.

---

## 7 · Implementation Phases (proposed build order)

1. **Scaffold** — Vite+TS+Router project, tokens, fonts, layout shell, header/footer/index, data model, migrate all content into typed data. *(no visuals yet — proves content integrity)*
2. **World prototype** — Canvas engine: archipelago render from concept, orb + movement (WASD/arrows/click/drag), camera, proximity highlight, Enter prompt, Return-to-World, saved position, reduced-motion mode. Wire **4 islands** end-to-end.
3. **Interior template** — build the shared category-page system + project-detail route using App Design (richest, 3 projects) as the reference implementation.
4. **All 13 categories + detail pages** — roll the template across every category with real migrated content, galleries, and functional 1080p videos. Design T-Mobile/About/Contact interiors from the landmark art.
5. **Responsive + a11y pass** — mobile world alternative (tap-to-enter + zoomable map), tablet, keyboard/screen-reader test, contrast, captions.
6. **Performance + QA** — image optimization (WebP/AVIF), lazy routes/galleries, sprite atlases, link validation, content-completeness report.
7. **Docs + deploy** — "how to add/replace a project" guide + deployment instructions.

Recommend building **incrementally with checkpoints** after Phase 2 and Phase 3 so you can course-correct the feel before we scale to all 13.

---

## 8 · Missing-Content List (to fill or formally mark "missing")

These will be shown as *"—"* / omitted rather than invented:
- **Years/dates** for most projects (only Documentary = 2021, About award = 2019 are known).
- **Client/organization** names (only T-Mobile is explicit).
- **Collaborator/credit** names (Documentary & Ripple were team projects — names not on old site).
- **Ripple Symposium screenshots** — old page was text-only; no site imagery captured. *(Options: you provide screenshots, or we link out / render a text-forward case.)*
- **External links** — Documentary film/trailer & Manifesto flipbook/website ("found here") had no real hrefs in the DOM.
- **T-Mobile 3D "Meeting in a Box" model** — streamed viewer, not downloadable.
- **About**: portrait image, résumé/CV file, education & employment dates.
- **Per-poster titles→images** and **per-artwork titles** mapping (we have the images and the title list, but not a confirmed 1:1 pairing).

---

### Approval gate
Per the master prompt, I will **not** write production code until this audit is approved. On approval I'll begin at Phase 1 (scaffold + content migration) and check in after the Phase 2 world prototype.
