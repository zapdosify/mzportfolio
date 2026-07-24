import numpy as np
from PIL import Image
import os

SRC = r"C:\Users\zab\Desktop\Portfolio 2026\Individual Elements"
PUB = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\landing"

def report(path, label):
    im = Image.open(path)
    print(f"\n=== {label} ===")
    print(f"  file: {os.path.basename(path)}")
    print(f"  mode: {im.mode}   size: {im.size}   aspect: {im.size[0]/im.size[1]:.3f}")
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    print(f"  has alpha channel: {has_alpha}")
    rgba = im.convert("RGBA")
    a = np.asarray(rgba)[:, :, 3]
    L = np.asarray(im.convert("L"))
    W, H = im.size
    if has_alpha:
        transp = (a == 0).mean() * 100
        semi = ((a > 0) & (a < 255)).mean() * 100
        print(f"  fully transparent px: {transp:.1f}%   semi-transparent: {semi:.1f}%")
        # content bbox from alpha
        ys, xs = np.nonzero(a > 12)
        if len(xs):
            print(f"  alpha content bbox: x[{xs.min()}-{xs.max()}] y[{ys.min()}-{ys.max()}] of {W}x{H}")
    else:
        # no alpha -> analyse baked background
        corners = [tuple(np.asarray(rgba)[y, x, :3]) for (x, y) in
                   [(2,2),(W-3,2),(2,H-3),(W-3,H-3)]]
        print(f"  NO alpha. corner RGB: {corners}")
        print(f"  luminance: min={L.min()} max={L.max()} mean={L.mean():.1f}")
        dark = (L < 20).mean() * 100
        midgray = ((L >= 20) & (L < 130)).mean() * 100
        print(f"  near-black(<20): {dark:.1f}%   mid-gray bg-ish(20-130): {midgray:.1f}%")
        # is bg a flat black or a gradient? sample a horizontal line at mid-height
        row = L[H//2, ::W//10]
        print(f"  mid-row luminance samples: {list(row)}")

for f in ["Archipelago islands without nameplate.png", "Background.png"]:
    report(os.path.join(SRC, f), f)

if os.path.exists(os.path.join(PUB, "islands.png")):
    report(os.path.join(PUB, "islands.png"), "keyed islands.png (prior work, in public)")
