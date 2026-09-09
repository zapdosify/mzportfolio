"""Derive the site's favicon set + link-preview image from the two masters.

Masters (not deployed):  Desktop/Mobile Game Concept/Favicon.png, Link Preview.png
Outputs:                 pixel-archipelago/public/

Re-run after replacing either master:  py tools/build_brand_assets.py
"""

from pathlib import Path

from PIL import Image

SRC = Path.home() / "Desktop" / "Mobile Game Concept"
OUT = Path(__file__).resolve().parent.parent / "pixel-archipelago" / "public"
BG = (5, 5, 5)  # matches <meta name="theme-color">

# --- favicons -------------------------------------------------------------
# The master is a transparent orb with a wide, very faint glow halo. Crop to
# the visible art (alpha > 12) so the mark still reads at 16px, then pad ~6%.
master = Image.open(SRC / "Favicon.png").convert("RGBA")
x0, y0, x1, y1 = master.split()[3].point(lambda p: 255 if p > 12 else 0).getbbox()
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
half = int(max(x1 - x0, y1 - y0) * 0.53)
icon = master.crop((cx - half, cy - half, cx + half, cy + half))

for size in (16, 32, 192):
    icon.resize((size, size), Image.LANCZOS).save(OUT / f"favicon-{size}.png")

icon.resize((256, 256), Image.LANCZOS).save(
    OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
)

# iOS crops to a rounded square and composites on white, so bake the dark
# ground in and inset the art a little.
apple = Image.new("RGBA", (180, 180), (*BG, 255))
inset = icon.resize((160, 160), Image.LANCZOS)
apple.alpha_composite(inset, (10, 10))
apple.convert("RGB").save(OUT / "apple-touch-icon.png")

# --- link preview ---------------------------------------------------------
# JPEG, not PNG: lossless would be 637 kB against 154 kB here, and while
# that clears LinkedIn's 5 MB cap, WhatsApp quietly drops previews over
# ~300 kB. q95 rather than q90 because pixel art is precisely what JPEG
# ringing damages — hard 1px edges — and the extra 50 kB is cheap.
# Named og-card.jpg, not og-image.jpg: LinkedIn cached a negative verdict
# against the old URL while it was briefly 404ing behind the CDN, and a
# per-URL cache is only beatable with a URL it has never seen.
# Master is 1731x909 (1.904) — the 1200x630 card ratio (1.905), so a straight
# resize costs nothing.
Image.open(SRC / "Link Preview.png").convert("RGB").resize(
    (1200, 630), Image.LANCZOS
).save(OUT / "og-card.jpg", quality=95, optimize=True, progressive=True)

for f in sorted(OUT.glob("favicon*")) + [
    OUT / "apple-touch-icon.png",
    OUT / "og-card.jpg",
]:
    if f.exists():
        print(f"{f.name:24} {f.stat().st_size / 1024:7.1f} KB")
