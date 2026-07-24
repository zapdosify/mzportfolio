import os, urllib.request, ssl, time, sys

BASE = r"C:\Users\zab\Desktop\Portfolio 2026"
ctx = ssl.create_default_context()
HDR = {"User-Agent":"Mozilla/5.0", "Referer":"https://mznoor8.wixsite.com/"}

def fetch(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True, os.path.getsize(dest)
    last=None
    for a in range(5):
        try:
            req = urllib.request.Request(url, headers=HDR)
            with urllib.request.urlopen(req, context=ctx, timeout=120) as r:
                data = r.read()
            with open(dest,"wb") as f: f.write(data)
            return True, len(data)
        except Exception as e:
            last=e; time.sleep(1.5*(a+1))
    print(f"  FAIL {url} -> {last}", file=sys.stderr)
    return False, 0

# --- Visual Artwork gallery images ---
va = ["37df46895b6c41bcbaeeec1ce64a836a","d0fa0937285145c29ed0870dbd4bfb90",
"9ca45f912b734844aa3f227e731d17db","1b9f8bc36f80420db8efb8110152e9f7",
"0fdf8ad3d2044456891a4806a85df2ef","f5ba0f6fdb0c4d0a8470553ade17e18a",
"994ca19913934969abe2bf37cc329238","c55dfed79a3b4980b74e9386ca5926fd",
"81714f57f4524f42abd36e295203f730","e79eac0fafa44c2391dab356afde0a18"]
vadir = os.path.join(BASE,"images","visual-artwork-digital-painting")
os.makedirs(vadir, exist_ok=True)
ok=0
for i,h in enumerate(va,1):
    url=f"https://static.wixstatic.com/media/53ff1d_{h}~mv2.jpg"
    s,_=fetch(url, os.path.join(vadir,f"{i:02d}_artwork.jpg"))
    ok+= s; time.sleep(0.3)
print(f"visual-artwork images: {ok}/{len(va)}")

# --- Videos per project ---
videos = {
 "3d-lettering":["0372be1e984844498112f91f292c7b36","b499e1c376484cea9bd8c05daa3c9bfa",
                 "88fc8abd93934f42abd7137f182a7e4f","7330f78424114a279eea66e2994836c2"],
 "renders-3d-animation":["27dc6fad649c401d9662655e17fe2e2c","b59e63f66586490eabf90ff6b31a2d41",
                 "2af2ed2f9db943ad812186077bbf1e66","b9c6d54a2bba41ec9b29934f6086b564",
                 "85e19669859b4d4eb2de8a42c0ab8d0a"],
 "animation-animated-shorts":["b0eba2c1f3b84a6a91366755fbe572ac","329c98fc64264ea8896bec0a97b90302",
                 "c568b7816c2d4c08b601550835c15f29"],
 "documentary-social-pandemic":["78c63e40fd2048539f279c81e9410fde","e99ccdaf214a46adb4e2641dd0b121aa",
                 "6c8124d78feb459aabdea19f9f8929ca","9bcd06ea8ff9438985590664f32f88a4"],
}
tot_ok=tot=0
for slug, ids in videos.items():
    vdir = os.path.join(BASE,"videos",slug)
    os.makedirs(vdir, exist_ok=True)
    ok=0
    for i,h in enumerate(ids,1):
        url=f"https://video.wixstatic.com/video/53ff1d_{h}/1080p/mp4/file.mp4"
        s,sz=fetch(url, os.path.join(vdir,f"{i:02d}_{h[:10]}.mp4"))
        ok+=s; time.sleep(0.4)
    tot_ok+=ok; tot+=len(ids)
    print(f"{slug} videos: {ok}/{len(ids)}")
print(f"\nVIDEOS TOTAL: {tot_ok}/{tot}")
