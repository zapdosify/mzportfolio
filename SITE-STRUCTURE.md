# Portfolio — Site Structure & Content Index

Source: **https://mznoor8.wixsite.com/portfolio** (published Wix site)
Owner: **Mohammed Zaabi Noor** — multidisciplinary designer
Captured: 2026-07-19

This folder holds all written content and image references extracted from the live site, for rebuilding the portfolio.

---

## Homepage

**Title tag:** Design Services | Visual Designer

**Hero intro:**
> Hi, I'm Mohammed Zaabi Noor
>
> Adept at blending artistic vision with technical prowess, I am a designer who crafts immersive and captivating experiences across various multimedia platforms. With a keen eye for detail and an unwavering commitment to innovation, I have honed my design expertise through a diverse range of projects, from interactive web experiences, graphic design, user experience design to captivating motion graphics. As a lifelong learner and creative problem solver, I embrace the challenges of an ever-evolving digital landscape, continuously refining my skills to stay at the forefront of design trends and technologies. With a distinctive flair for storytelling and a passion for enhancing user engagement, I consistently deliver visually stunning and memorable designs that captivate audiences and elevate brands.

**Homepage category blocks (as displayed, with hover/rollover thumbnails):**
1. **Selected Projects → Personal Projects** (6 rollover items)
2. **Video Production Projects** — labeled "Animation, Documentary" (2 rollover items)
3. **3D Projects** — labeled "Renders" (2 rollover items)
4. **Internship → T-Mobile** (1 rollover item)

Homepage also has: "Stay Up To Date / Latest on Instagram" (Instagram feed) and "Want To Collaborate? / Get In Touch" (→ /contact).

---

## Categories → Projects

### Internship
| Project | File | Page |
|---|---|---|
| Magenta Moves (T-Mobile "Meeting in a Box") | projects/internship-t-mobile.md | /t-mobile |

### Video Production Projects
| Project | File | Page |
|---|---|---|
| Animated Shorts | projects/animation-animated-shorts.md | /animation |
| The Social Pandemic (documentary, 2021) | projects/documentary-social-pandemic.md | /documentary |

### 3D Projects
| Project | File | Page |
|---|---|---|
| 3D Lettering | projects/3d-lettering.md | /3dlettering |
| 3D Animation (Renders) | projects/renders-3d-animation.md | /renders |

### Personal Projects (App / Graphic / Web / Spatial)
| Project | File | Page |
|---|---|---|
| BookBabies — sleep tracking + audiobooks (App Design "Project 1") | projects/bookbabies-app.md | /appdesign |
| HODL — crypto asset management (App "Project 2") | projects/hodl-crypto-app.md | /project-2 |
| Sales Frontline Readiness App (App "Project 3") | projects/frontline-readiness-app.md | /project-3 |
| Symposium Website — Ripple | projects/ripple-symposium-website.md | /website-design |
| Exhibit Design (Geometric Harmony, BMX Pop-Up, Avengers Museum) | projects/exhibition-design.md | /exhibitiondesign |
| Poster Design | projects/poster-design.md | /posters |
| Digital Painting (Visual Artwork) | projects/visual-artwork-digital-painting.md | /visualartwork |
| Design Manifesto | projects/design-manifesto.md | /manifesto |

### Standalone pages
| Page | File | URL |
|---|---|---|
| About | pages/about.md | /about |
| Contact | pages/contact.md | /contact |

---

## Assets on disk
```
images/   102 files, ~194 MB  (one folder per project)
videos/    16 files, ~160 MB  (3d-lettering, renders, animation, documentary)
```
- **Images**: original full-resolution Wix CDN links (the `/v1/...` transform suffix was stripped), downloaded per project.
- **Videos**: motion pieces pulled from `video.wixstatic.com` at **1080p MP4** — 3D Lettering (4), Renders (5), Animation (3), Documentary (4).

## Notes for the rebuild
- The App Design pages form a 3-project series navigated as **Project 1 / Project 2 / Project 3**: Project 1 = BookBabies (`/appdesign`), Project 2 = HODL (`/project-2`), Project 3 = Frontline Readiness (`/project-3`).
- **Ripple Symposium Website** (`/website-design`) is **text-only** on the published page — no gallery or embed exists to download (its live-preview/screenshots aren't present in the DOM).
- **T-Mobile** page has a "3D VIEWER" that is a streamed Wix 3D component — no downloadable model/video file is exposed.
- **Renders**: 5 video files were embedded although 7 piece titles are listed; some titles may share a reel.
- Several project pages reference **external video/flipbook links** ("can be found here") that are not exposed as real hrefs in the rendered DOM — they'd need to be pulled from the Wix editor to recover the actual URLs.
- **Site is a Free-plan Wix Editor site** (classic Editor, Velo enabled). No CMS collections back the projects — all project content is static page content, which is why it had to be scraped from the published pages rather than read from a database.

## Total captured
- 14 project write-ups (13 in homepage categories + Design Manifesto)
- 2 standalone pages (About, Contact)
- Homepage hero + structure
- 102 images (~194 MB) + 16 videos (~160 MB)
