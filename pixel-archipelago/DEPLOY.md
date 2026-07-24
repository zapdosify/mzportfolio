# Deploying the Pixel Archipelago portfolio

## Build

```bash
npm ci
npm run build
```

Output lands in `dist/` — a fully static site (HTML + JS/CSS chunks +
`media/` assets). No server-side code.

## Hosting requirements

1. **Static hosting** with support for a few hundred MB of assets
   (`public/media/` ships ~250 MB of optimized images + 1080p video).
2. **SPA fallback**: every unknown path must serve `index.html`
   (React Router uses the history API). Configs already included:
   - Netlify: `public/_redirects` (`/* /index.html 200`)
   - Vercel: `vercel.json` (`rewrites` → `/index.html`)
   - Other hosts (nginx example):
     `try_files $uri $uri/ /index.html;`
3. **GitHub Pages** is not recommended: soft 1 GB repo / 100 MB-per-file
   limits and no clean SPA fallback (404.html hack only).

## Recommended: Netlify or Vercel

Point the project root at `pixel-archipelago/`:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 20+ (built on Node 24) |

Drag-and-drop of a locally built `dist/` also works on Netlify.

## Cache headers (optional, recommended)

Hashed assets under `dist/assets/` are immutable — long cache is safe:

```
/assets/*  Cache-Control: public, max-age=31536000, immutable
/media/*   Cache-Control: public, max-age=604800
```

## Media pipeline notes

- Masters live at the repo root (`images/`, `videos/`) and are **not**
  deployed; the site serves optimized copies from `public/media/`.
- After adding or replacing any image: `py tools/measure_media.py`
  (regenerates `src/data/mediaDimensions.ts`, which drives layout).
- ffmpeg (winget: Gyan.FFmpeg) was used to re-encode video (H.264
  CRF 23, faststart) and extract poster frames.

## Pre-deploy checklist

- [ ] `npm run build` completes clean
- [ ] Spot-check `/`, one category, one project detail, `/about`, `/contact`
- [ ] Deep-link a project URL directly (verifies the SPA fallback)
- [ ] Check a video plays and a lightbox opens on the deployed URL
