import numpy as np
from PIL import Image

im = Image.open(r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\landing\archipelago-home.png").convert("L")
W, H = im.size
A = np.asarray(im, dtype=np.uint8)

# current island x (%), label y (%)
worldx = {
 "app-design":47.7,"website-design":28.7,"visual-artwork":65.5,"manifesto-design":81.9,
 "exhibition-design":18.7,"poster-design":36.3,"animation":57.6,"documentary":72.8,
 "renders":23.4,"3d-lettering":35.1,"t-mobile":62.0,"about":76.0,"contact":47.7,
}
ploty = {
 "app-design":30.9,"website-design":30.9,"visual-artwork":30.9,"manifesto-design":34.7,
 "exhibition-design":51.3,"poster-design":51.6,"animation":51.9,"documentary":54.1,
 "renders":73.6,"3d-lettering":73.6,"t-mobile":76.1,"about":76.9,"contact":94.4,
}

print("id, oldx% -> measuredCenterX%")
for cid in worldx:
    cx = worldx[cid]/100*W
    cy = ploty[cid]/100*H
    x0, x1 = int(cx-0.09*W), int(cx+0.09*W)
    y0, y1 = int(cy-0.022*H), int(cy+0.022*H)
    x0=max(0,x0); x1=min(W,x1); y0=max(0,y0); y1=min(H,y1)
    band = A[y0:y1, x0:x1]
    mask = band > 145
    ys, xs = np.nonzero(mask)
    if len(xs) < 20:
        print(f"{cid:18s} {worldx[cid]:5.1f} -> (few px, keep)")
        continue
    # centroid, weighted by brightness
    w = band[ys, xs].astype(float)
    cxpx = (xs*w).sum()/w.sum() + x0
    print(f"{cid:18s} {worldx[cid]:5.1f} -> {cxpx/W*100:5.1f}")
