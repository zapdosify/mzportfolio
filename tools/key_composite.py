import numpy as np
from PIL import Image, ImageFilter
from collections import deque

SRC = r"C:\Users\zab\Desktop\Portfolio 2026\Individual Elements\Archipelago islands without nameplate.png"
OUT = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\images\landing\islands.png"

im = Image.open(SRC).convert("RGB")
W, H = im.size
L = np.asarray(im.convert("L"), dtype=np.int16)

# Progressive, edge-aware flood from the borders. Walk neighbours whose
# brightness is close to the current pixel (smooth gradient) and below a cap
# (never climb into bright island structure). Sharp island silhouette edges halt it.
DELTA = 14     # max neighbour brightness step treated as "same background"
CAP = 135      # never flood pixels brighter than this (island highlights)
visited = np.zeros((H, W), dtype=bool)
q = deque()

for x in range(W):
    for y in (0, H - 1):
        if L[y, x] <= CAP and not visited[y, x]:
            visited[y, x] = True; q.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        if L[y, x] <= CAP and not visited[y, x]:
            visited[y, x] = True; q.append((x, y))

while q:
    x, y = q.popleft()
    cur = L[y, x]
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and not visited[ny, nx]:
            v = L[ny, nx]
            if v <= CAP and abs(int(v) - int(cur)) <= DELTA:
                visited[ny, nx] = True
                q.append((nx, ny))

alpha = np.where(visited, 0, 255).astype(np.uint8)
a_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.8))  # soften edge
out = im.convert("RGBA")
out.putalpha(a_img)
# keep full original frame (no crop) so % coords map 1:1 to the stage
out.save(OUT)
print("saved", OUT, out.size, "bg-removed px:", int(visited.sum()), "/", W * H)
