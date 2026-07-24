import numpy as np
from PIL import Image

p = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\landing\islands.png"
im = Image.open(p).convert("RGBA")
W, H = im.size
a = np.asarray(im)[:, :, 3]

# central gap window where the orb floats (between poster/animation, above platform)
x0, x1 = int(0.42*W), int(0.55*W)
y0, y1 = int(0.38*H), int(0.53*H)
win = a[y0:y1, x0:x1]
ys, xs = np.nonzero(win > 24)
print(f"image {W}x{H}")
print(f"window x[{x0}-{x1}] y[{y0}-{y1}]  ({(x0/W*100):.1f}-{(x1/W*100):.1f}% , {(y0/H*100):.1f}-{(y1/H*100):.1f}%)")
if len(xs):
    bx0, bx1 = xs.min()+x0, xs.max()+x0
    by0, by1 = ys.min()+y0, ys.max()+y0
    cx, cy = (bx0+bx1)/2, (by0+by1)/2
    print(f"orb content bbox px: x[{bx0}-{bx1}] y[{by0}-{by1}]  w={bx1-bx0} h={by1-by0}")
    print(f"orb centre: {cx/W*100:.1f}% , {cy/H*100:.1f}%   (px {cx:.0f},{cy:.0f})")
    print(f"orb pixels in window: {len(xs)}")
else:
    print("no content found in window")

# save a preview crop over black
crop = im.crop((x0, y0, x1, y1))
bg = Image.new("RGBA", crop.size, (10,10,12,255))
bg.alpha_composite(crop)
out = r"C:\Users\zab\AppData\Local\Temp\claude\C--Users-zab-Desktop-Portfolio-2026\e85f2ddc-b4a1-488c-86a0-5bb1cd35a417\scratchpad\orb_window.png"
bg.convert("RGB").save(out)
print("saved", out)
