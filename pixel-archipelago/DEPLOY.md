# Deploying the Pixel Archipelago portfolio

**The live site is on Hostinger, and it is published by hand.** Build locally,
then upload the contents of `dist/` to `public_html`. Nothing deploys itself:
there is no CI, no GitHub Action and no deploy hook, so **pushing to GitHub does
not change the live site**.

The `vercel.json` and `public/_redirects` files in this repo are for other hosts
and are inert on Hostinger — `public/.htaccess`'s own header comment records that
this is exactly why deep links were once 404ing in production.

## Build

```bash
npm ci
npm run build
```

Output lands in `dist/` — a fully static site (HTML + hashed JS/CSS chunks +
`media/` and `games/` assets). No server-side code.

`dist/` is about **368 MB**, most of it two payloads that dwarf the app code:

| Payload | Size |
|---|---|
| `public/games/emberdeep/v1/` (the Godot web export) | ~126 MB |
| `public/media/` (images + 1080p video) | ~240 MB |
| JS/CSS bundle | under 1 MB |

## Publishing to Hostinger

Upload the **contents** of `dist/` into `public_html` — the files themselves,
not the `dist` folder. Either hPanel's File Manager or FTP works.

**`.htaccess` must go up with them.** It is a dotfile, so hPanel's File Manager
hides it by default (Settings → Show hidden files) and many FTP clients skip it.
Without it every deep link — `/about`, `/website-design/emberdeep` — returns a
404, because React Router needs unknown paths served `index.html`. This is the
single most common way a deploy of this site goes wrong.

The game is large and slow to transfer. When only the app changed, uploading
`index.html`, `assets/` and whatever media changed is enough; `games/` only needs
re-uploading after a re-export from the game repo.

### Why not Hostinger's git deploy

It can pull this repo, but it cannot serve it. `dist/` is gitignored (`.gitignore`
line 11) and no build output is committed anywhere, and static hosting runs no
build step — so a pull would put `src/` and `package.json` on the server and
nothing a browser can load. The game's binaries are committed to git rather than
Git LFS (see `CONTEXT.md`) so that any pull gets them, but that decision does not
by itself make git deploy usable here.

## Other hosts

If the site ever moves, the configs are already in the tree:

| Host | SPA fallback config | Notes |
|---|---|---|
| Netlify | `public/_redirects` | drag-and-drop of a built `dist/` also works |
| Vercel | `vercel.json` | build command `npm run build`, publish dir `dist` |
| nginx | — | `try_files $uri $uri/ /index.html;` |
| Apache / LiteSpeed | `public/.htaccess` | what Hostinger actually uses |

Node 20+ (built on Node 24). **GitHub Pages is not suitable**: soft 1 GB repo and
100 MB-per-file limits against an 872 MB history, and no clean SPA fallback.

## Cache headers

Hashed files under `assets/` never change content under the same name, so they
are safe to cache for a year; media changes rarely.

```
/assets/*  Cache-Control: public, max-age=31536000, immutable
/media/*   Cache-Control: public, max-age=604800
```

Currently only partly in place: `public/.htaccess` sets a 7-day expiry for
images and mp4 but nothing for JS, CSS, fonts, `.wasm` or `.pck`, and
`vercel.json` covers only `/games/`. Worth completing — the bundle is
content-hashed, so a long cache costs nothing and is never stale.

## Media pipeline notes

- Masters live at the repo root (`images/`, `videos/`) and are **not** deployed;
  the site serves optimized copies from `public/media/`.
- After adding or replacing any image: `py tools/measure_media.py`
  (regenerates `src/data/mediaDimensions.ts`, which drives layout). Skipping this
  is what causes layout shift — the page sizes every figure from that table.
- ffmpeg (winget: Gyan.FFmpeg) was used to re-encode video (H.264 CRF 23,
  faststart) and extract poster frames.
- The EMBERDEEP case-study images are generated, not hand-made: rerun
  `tools/portfolio/build_case_media.py` in the game repo and copy the result
  into `public/media/images/emberdeep/`. Some of them carry text drawn into the
  picture, which no search of this repo can find — check the images themselves
  after a rebuild.

## Pre-deploy checklist

- [ ] `npm run build` completes clean
- [ ] Spot-check `/`, one category, one project detail, `/about`, `/contact`
- [ ] Deep-link a project URL directly — on the deployed site, not the dev
      server (this is what catches a missing `.htaccess`)
- [ ] Check a video plays and a lightbox opens on the deployed URL
- [ ] Load the EMBERDEEP page and press Play; the game is ~130 MB, so confirm it
      actually starts rather than assuming
