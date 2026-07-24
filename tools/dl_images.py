import os, re, urllib.request, ssl, sys, time

BASE = r"C:\Users\zab\Desktop\Portfolio 2026"
PROJ = os.path.join(BASE, "projects")
IMG_ROOT = os.path.join(BASE, "images")
os.makedirs(IMG_ROOT, exist_ok=True)

url_re = re.compile(r"https://static\.wixstatic\.com/media/\S+")
# line like: "- label — URL"  (em dash U+2014)
line_re = re.compile(r"^-\s*(.*?)\s*[—-]\s*(https://static\.wixstatic\.com/\S+)\s*$")

ctx = ssl.create_default_context()
headers = {"User-Agent": "Mozilla/5.0"}

def sanitize(name):
    name = name.strip()
    name = re.sub(r'[<>:"/\\|?*]', '_', name)
    name = re.sub(r'\s+', '_', name)
    return name[:60]

total_ok = total_fail = 0
summary = []

for fn in sorted(os.listdir(PROJ)):
    if not fn.endswith(".md"):
        continue
    slug = fn[:-3]
    path = os.path.join(PROJ, fn)
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    # only look in the Images/Media section
    imgs = []
    in_media = False
    for ln in lines:
        low = ln.lower()
        if low.startswith("## images") or low.startswith("## media"):
            in_media = True
            continue
        if in_media and ln.startswith("## "):
            in_media = False
        if not in_media:
            continue
        m = line_re.match(ln.rstrip("\n"))
        if m:
            label, url = m.group(1), m.group(2)
        else:
            um = url_re.search(ln)
            if not um:
                continue
            label, url = "", um.group(0)
        imgs.append((label, url.strip()))
    if not imgs:
        summary.append(f"{slug}: (no images)")
        continue
    outdir = os.path.join(IMG_ROOT, slug)
    os.makedirs(outdir, exist_ok=True)
    ok = fail = 0
    for i, (label, url) in enumerate(imgs, 1):
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        if len(ext) > 5:
            ext = ".jpg"
        base = sanitize(label) if label else url.split("/media/")[-1].split("~")[0].split(".")[0]
        fname = f"{i:02d}_{base}{ext}"
        dest = os.path.join(outdir, fname)
        if os.path.exists(dest) and os.path.getsize(dest) > 0:
            ok += 1
            continue
        data = None
        for attempt in range(5):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
                    data = r.read()
                break
            except Exception as e:
                last = e
                time.sleep(1.5 * (attempt + 1))
        if data:
            with open(dest, "wb") as out:
                out.write(data)
            ok += 1
        else:
            fail += 1
            print(f"  FAIL {url} -> {last}", file=sys.stderr)
        time.sleep(0.4)
    total_ok += ok
    total_fail += fail
    summary.append(f"{slug}: {ok} downloaded" + (f", {fail} failed" if fail else ""))

print("\n".join(summary))
print(f"\nTOTAL: {total_ok} downloaded, {total_fail} failed")
