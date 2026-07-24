import numpy as np
from PIL import Image
from collections import deque
import sys

p = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\landing\islands.png"
im = Image.open(p).convert("RGBA")
W, H = im.size
arr = np.asarray(im).copy()
alpha = arr[:, :, 3]
mask = alpha > 12  # include faint ring glow

# seed on the planet body (tight central window)
sx0, sx1 = int(0.46*W), int(0.505*W)
sy0, sy1 = int(0.46*H), int(0.505*H)
sub = mask[sy0:sy1, sx0:sx1]
ys, xs = np.nonzero(sub)
if len(xs) == 0:
    print("no seed found"); sys.exit(1)
seed = (int(xs.mean())+sx0, int(ys.mean())+sy0)

# BFS 8-connected over mask
visited = np.zeros_like(mask)
q = deque([seed])
visited[seed[1], seed[0]] = True
comp = []
while q:
    x, y = q.popleft()
    comp.append((x, y))
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            nx, ny = x+dx, y+dy
            if 0 <= nx < W and 0 <= ny < H and not visited[ny, nx] and mask[ny, nx]:
                visited[ny, nx] = True
                q.append((nx, ny))

cx = np.array([c[0] for c in comp]); cy = np.array([c[1] for c in comp])
bx0, bx1, by0, by1 = cx.min(), cx.max(), cy.min(), cy.max()
ctrx, ctry = (bx0+bx1)/2, (by0+by1)/2
print(f"component size={len(comp)}  bbox x[{bx0}-{bx1}] y[{by0}-{by1}] (w={bx1-bx0} h={by1-by0})")
print(f"orb centre: {ctrx/W*100:.2f}% , {ctry/H*100:.2f}%")

if len(comp) > 20000:
    print("WARNING: component too large, likely spilled into islands — NOT clearing")
    sys.exit(1)

# clear the component + a small dilation to remove any 1-2px halo
pad = 3
yy, xx = np.array([c[1] for c in comp]), np.array([c[0] for c in comp])
for x, y in zip(xx, yy):
    arr[max(0,y-pad):y+pad+1, max(0,x-pad):x+pad+1, 3] = 0

out = Image.fromarray(arr, "RGBA")
out.save(p)
print("erased orb, saved", p)

# preview the region over black
prev = out.crop((int(0.40*W), int(0.36*H), int(0.57*W), int(0.55*H)))
bg = Image.new("RGBA", prev.size, (10,10,12,255)); bg.alpha_composite(prev)
pv = r"C:\Users\zab\AppData\Local\Temp\claude\C--Users-zab-Desktop-Portfolio-2026\e85f2ddc-b4a1-488c-86a0-5bb1cd35a417\scratchpad\orb_erased.png"
bg.convert("RGB").save(pv); print("preview", pv)
