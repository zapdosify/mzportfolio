import os, json
import numpy as np
from PIL import Image

SRC = r"C:\Users\zab\Desktop\Portfolio 2026\Website Redesign Assets\MZN_Pixel_Archipelago_Website_Assets\public\images\landing\archipelago-home.png"
APP = r"C:\Users\zab\Desktop\Portfolio 2026\pixel-archipelago\public\world"
PREVIEW = r"C:\Users\zab\AppData\Local\Temp\claude\C--Users-zab-Desktop-Portfolio-2026\e85f2ddc-b4a1-488c-86a0-5bb1cd35a417\scratchpad\decomp"
os.makedirs(os.path.join(APP,"islands"), exist_ok=True); os.makedirs(PREVIEW, exist_ok=True)

ISLES = {
 "app-design":(47.7,15.8),"website-design":(28.7,24.2),"visual-artwork":(65.5,24.2),
 "manifesto-design":(81.9,33.7),"exhibition-design":(18.7,45.3),"poster-design":(36.3,51.6),
 "animation":(57.6,49.5),"documentary":(72.8,53.2),"renders":(23.4,67.9),
 "3d-lettering":(35.1,70.5),"t-mobile":(62.0,72.6),"about":(76.0,73.7),"contact":(47.7,87.9),
}
NAMEPLATES = {
 "app-design":(47.7,30.6,12,4.4),"website-design":(28.7,30.8,13,4.4),"visual-artwork":(65.5,30.6,13,4.4),
 "manifesto-design":(81.9,34.5,14,4.4),"exhibition-design":(18.7,50.9,15,4.4),"poster-design":(36.3,51.3,12.5,4.4),
 "animation":(57.6,51.7,10,4.4),"documentary":(72.8,53.8,12,4.4),"renders":(23.4,73.5,9,4.4),
 "3d-lettering":(35.1,73.5,12,4.4),"t-mobile":(62.0,75.9,10,4.4),"about":(76.0,76.6,8,4.4),
 "contact":(47.7,93.3,10,4.4),
}
CENTER=(47.7,49.5); CENTER_EXCL=8.0   # % radius around planet -> belongs to nobody (live orb)
MAXR=15.0  # % of width max assignment radius

im=Image.open(SRC).convert("RGB"); W,H=im.size
arr=np.asarray(im).astype(np.float32)
L=0.2126*arr[...,0]+0.7152*arr[...,1]+0.0722*arr[...,2]
alpha=(np.clip((L-10)/245,0,1)**1.1*255).astype(np.uint8)
rgba=np.dstack([np.asarray(im),alpha])

# work grid (full res is fine vectorized)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
px=xx/W*100; py=yy/H*100

names=list(ISLES.keys())
dist=np.full((H,W),1e9,np.float32); who=np.full((H,W),-1,np.int16)
for i,n in enumerate(names):
    ax,ay=ISLES[n]
    d=(px-ax)**2+(py-ay)**2
    closer=d<dist
    dist=np.where(closer,d,dist); who=np.where(closer,i,who)
# Voronoi cell membership: within max radius + outside central (orb) zone.
# Visibility comes from the SOFT luminance alpha, so dark rock bases are kept.
cdist=(px-CENTER[0])**2+(py-CENTER[1])**2
valid = (dist < MAXR**2) & (cdist > CENTER_EXCL**2)
who=np.where(valid,who,-1)
visible = (alpha > 12)  # any lit pixel (bright buildings + faint bases)

manifest=[]
for i,name in enumerate(names):
    cell=(who==i)
    m=cell & visible   # lit pixels belonging to this island's cell
    if not m.any():
        continue
    ys,xs=np.where(m)
    x0,x1=xs.min(),xs.max()+1; y0,y1=ys.min(),ys.max()+1
    # pad a little
    padx=int(0.008*W); pady=int(0.008*H)
    x0=max(0,x0-padx);y0=max(0,y0-pady);x1=min(W,x1+padx);y1=min(H,y1+pady)
    tile=rgba[y0:y1,x0:x1].copy()
    tmask=cell[y0:y1,x0:x1]
    # keep the soft alpha within this island's Voronoi cell; kill neighbour bleed
    tile[...,3]=np.where(tmask,tile[...,3],0)
    # mask baked nameplate
    nx,ny,nw,nh=NAMEPLATES[name]
    a0=int((nx-nw/2)/100*W)-x0;a1=int((nx+nw/2)/100*W)-x0
    b0=int((ny-nh/2)/100*H)-y0;b1=int((ny+nh/2)/100*H)-y0
    a0=max(0,a0);b0=max(0,b0);a1=min(tile.shape[1],a1);b1=min(tile.shape[0],b1)
    if a1>a0 and b1>b0: tile[b0:b1,a0:a1,3]=0
    Image.fromarray(tile,"RGBA").save(os.path.join(APP,"islands",f"{name}.png"))
    manifest.append({"id":name,"src":f"/world/islands/{name}.png",
        "cx":round((x0+x1)/2/W*100,2),"cy":round((y0+y1)/2/H*100,2),
        "w":round((x1-x0)/W*100,2),"h":round((y1-y0)/H*100,2)})

with open(os.path.join(APP,"manifest.json"),"w") as f:
    json.dump({"world":{"w":W,"h":H},"islands":manifest},f,indent=1)

# verify composite
def checker(w,h,sz=24,c1=(35,110,110),c2=(190,55,130)):
    img=np.zeros((h,w,3),np.uint8)
    for y in range(0,h,sz):
        for x in range(0,w,sz): img[y:y+sz,x:x+sz]=c1 if((x//sz+y//sz)%2==0) else c2
    return img
bg=Image.fromarray(checker(W,H),"RGB").convert("RGBA")
for m in manifest:
    t=Image.open(os.path.join(APP,"islands",m["id"]+".png")).convert("RGBA")
    x0=int((m["cx"]-m["w"]/2)/100*W);y0=int((m["cy"]-m["h"]/2)/100*H)
    bg.alpha_composite(t,(max(0,x0),max(0,y0)))
bg.convert("RGB").save(os.path.join(PREVIEW,"verify_islands_composite.png"))
print("islands:",len(manifest))
for m in manifest: print(f'  {m["id"]:18s} cx={m["cx"]:5.1f} cy={m["cy"]:5.1f} w={m["w"]:4.1f} h={m["h"]:4.1f}')
