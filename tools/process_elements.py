import os, json
from PIL import Image, ImageDraw

SRC = r"C:\Users\zab\Desktop\Portfolio 2026\Individual Elements"
OUT = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\islands"
os.makedirs(OUT, exist_ok=True)

def trim_alpha(im, thr=12, pad=6):
    im = im.convert("RGBA")
    a = im.split()[3].point(lambda v: 255 if v > thr else 0)
    box = a.getbbox()
    if not box:
        return im
    l, t, r, b = box
    l = max(0, l - pad); t = max(0, t - pad)
    r = min(im.width, r + pad); b = min(im.height, b + pad)
    return im.crop((l, t, r, b))

def key_white(im, thresh=30):
    """Flood-fill near-white background from the 4 corners to transparent,
    preserving interior white (screens, highlights) not connected to the edge."""
    im = im.convert("RGB")
    MARK = (255, 0, 255)
    for xy in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1),
               (im.width // 2, 0), (im.width // 2, im.height - 1)]:
        try:
            ImageDraw.floodfill(im, xy, MARK, thresh=thresh)
        except Exception:
            pass
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, _ = px[x, y]
            if r == 255 and g == 0 and b == 255:
                px[x, y] = (0, 0, 0, 0)
    return im

def key_orb(path, lo=246, hi=253):
    """White orb on baked checkerboard -> luminance smoothstep to alpha."""
    im = Image.open(path).convert("RGB")
    px = im.load()
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    op = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum <= lo:
                a = 0
            elif lum >= hi:
                a = 255
            else:
                a = int((lum - lo) / (hi - lo) * 255)
            op[x, y] = (255, 255, 255, a)
    return out

transparent = {
    "animation": "Animation.png", "about": "About.png", "documentary": "Documentary.png",
    "manifesto-design": "Manifesto Design.png", "poster-design": "Poster Design.png",
    "t-mobile": "T-Mobile.png", "visual-artwork": "Visual Artwork.png",
    "website-design": "Website Design.png", "3d-lettering": "3D Lettering.png",
}
white_bg = {"app-design": "App Design.png", "exhibition-design": "Exhibition Design.png"}

results = {}

for cid, fn in transparent.items():
    im = trim_alpha(Image.open(os.path.join(SRC, fn)))
    im.save(os.path.join(OUT, f"{cid}.png"))
    results[cid] = im.size

for cid, fn in white_bg.items():
    im = trim_alpha(key_white(Image.open(os.path.join(SRC, fn))))
    im.save(os.path.join(OUT, f"{cid}.png"))
    results[cid] = im.size

# Renders + Contact cropped from the (white-bg) composite, then keyed.
comp = Image.open(os.path.join(SRC, "Archipelago islands without nameplate .png")).convert("RGB")
W, H = comp.size  # 1672x941
crops = {
    # tight-ish pixel boxes (l,t,r,b) chosen to isolate each island
    "renders":  (150, 545, 470, 830),
    "contact":  (600, 720, 980, 941),
}
for cid, box in crops.items():
    sub = comp.crop(box)
    im = trim_alpha(key_white(sub))
    im.save(os.path.join(OUT, f"{cid}.png"))
    results[cid] = im.size

# Center orb
orb = trim_alpha(key_orb(os.path.join(SRC, "ORB.png")), thr=8, pad=10)
orb.save(os.path.join(r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images", "orb.png"))
results["orb"] = orb.size

print(json.dumps({k: {"w": v[0], "h": v[1], "aspect": round(v[0]/v[1], 3)} for k, v in results.items()}, indent=1))
