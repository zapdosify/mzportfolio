# Calibration aid for ISLAND_HIT in Landing.tsx — the clickable region over
# each island's own graphic (not just its nameplate).
#
# The islands are one flattened composite (islands.webp) with bridges and
# walkways deliberately connecting every neighbour — there's no per-island
# DOM element to hang a click handler on, and no clean way to segment them
# by connected-component analysis: a naive alpha-channel flood-fill just
# finds one giant blob (everything the bridges touch) plus a few isolated
# scraps. Tried first; see the git history on this file's introducing commit
# if it needs revisiting.
#
# This script instead grows a small window outward from each category's
# known nameplate position (PLATE_X/PLATE_Y) until the window stops clipping
# opaque content on a side, one side at a time, capped so it can't run away
# too far.
#
# IMPORTANT — this alone is NOT sufficient. A generous cap still lets a thin
# bridge/staircase cable drag a window's growth into a neighbouring island,
# because a cable is "opaque content near the edge" exactly like the island
# itself is. The output MUST be checked against the debug render
# (island_boxes_debug.png) before use, and adjusted by eye where a box has
# visibly swallowed a neighbour or a connecting walkway. The values currently
# hardcoded in ISLAND_HIT were produced exactly that way: this script's
# output as a starting point, corrected by eye against the render.
#
# Run: python tools/measure_island_boxes.py
# (needs numpy, Pillow — same deps as measure_labels.py)

import numpy as np
from PIL import Image, ImageDraw

ART = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\landing\islands.webp"

# Nameplate positions (% of the 1672x941 stage) — must match PLATE_X/PLATE_Y
# in Landing.tsx. Y is the label row; islands float above it.
PLATE_X = {
    "app-design": 49.0, "website-design": 30.3, "visual-artwork": 67.1,
    "manifesto-design": 83.4, "exhibition-design": 19.9, "poster-design": 38.2,
    "animation": 58.9, "documentary": 76.9, "renders": 24.1, "3d-lettering": 35.8,
    "t-mobile": 63.8, "about": 77.3, "contact": 49.8,
}
PLATE_Y = {
    "app-design": 30.9, "website-design": 30.9, "visual-artwork": 30.9,
    "manifesto-design": 34.7, "exhibition-design": 51.3, "poster-design": 51.6,
    "animation": 51.9, "documentary": 54.1, "renders": 73.6, "3d-lettering": 73.6,
    "t-mobile": 76.1, "about": 76.9, "contact": 94.4,
}

GAP_BELOW = 1.3   # % of H — stop just above the label row itself
DEFAULT_CAP_W = 12.0   # % of W, half-width cap
DEFAULT_CAP_UP = 30.0  # % of H, upward-reach cap
CAP_W = {"contact": 15.0, "manifesto-design": 11.5}
CAP_UP = {"app-design": 34.0, "manifesto-design": 34.0, "contact": 30.0}

STEP = 0.4    # % per growth iteration
MARGIN = 0.5  # % of transparent margin required before a side is "stable"
MAX_ITERS = 90


def main():
    im = Image.open(ART).convert("RGBA")
    W, H = im.size
    alpha = np.asarray(im)[:, :, 3]
    mask = alpha > 40

    def measure(x0p, y0p, x1p, y1p):
        x0 = max(0, int(x0p / 100 * W)); x1 = min(W, int(x1p / 100 * W))
        y0 = max(0, int(y0p / 100 * H)); y1 = min(H, int(y1p / 100 * H))
        if x1 <= x0 or y1 <= y0:
            return None
        win = mask[y0:y1, x0:x1]
        ys, xs = np.nonzero(win)
        if len(xs) < 20:
            return None
        return (xs.min() + x0, ys.min() + y0, xs.max() + x0, ys.max() + y0)

    grown = {}
    for cid, px in PLATE_X.items():
        py = PLATE_Y[cid]
        hw, up = 6.0, 8.0
        cw, cu = CAP_W.get(cid, DEFAULT_CAP_W), CAP_UP.get(cid, DEFAULT_CAP_UP)
        for _ in range(MAX_ITERS):
            bbox = measure(px - hw, py - up, px + hw, py - GAP_BELOW)
            if bbox is None:
                hw, up = min(cw, hw + STEP), min(cu, up + STEP)
                continue
            bx0, by0, bx1, by1 = bbox
            left_m = (bx0 / W * 100) - (px - hw)
            right_m = (px + hw) - (bx1 / W * 100)
            top_m = (by0 / H * 100) - (py - up)
            grew = False
            if left_m < MARGIN and hw < cw:
                hw = min(cw, hw + STEP); grew = True
            if right_m < MARGIN and hw < cw:
                hw = min(cw, hw + STEP); grew = True
            if top_m < MARGIN and up < cu:
                up = min(cu, up + STEP); grew = True
            if not grew:
                break
        bbox = measure(px - hw, py - up, px + hw, py - GAP_BELOW)
        grown[cid] = bbox
        if bbox:
            bx0, by0, bx1, by1 = bbox
            print(f"{cid:18s} grown  x=[{bx0/W*100:5.1f},{bx1/W*100:5.1f}]  "
                  f"y=[{by0/H*100:5.1f},{by1/H*100:5.1f}]  (hw={hw:.1f} up={up:.1f})")
        else:
            print(f"{cid:18s} NO CONTENT FOUND — widen its starting window")

    # Debug render: grown (unverified) boxes in yellow-outlined dots + red boxes.
    dbg = im.convert("RGB").copy()
    draw = ImageDraw.Draw(dbg)
    for cid, bbox in grown.items():
        if bbox:
            draw.rectangle(bbox, outline=(255, 40, 40), width=3)
        px, py = PLATE_X[cid] / 100 * W, PLATE_Y[cid] / 100 * H
        draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=(255, 255, 0))
    out = "island_boxes_debug.png"
    dbg.save(out)
    print(f"\nsaved {out} - check it for boxes that bled into a neighbour via a\n"
          f"bridge/staircase before trusting any of the numbers above.")


if __name__ == "__main__":
    main()
