#!/usr/bin/env python3
"""Make hero illustrations transparent: flood-fill white background from edges,
   feather alpha, downscale for web. Output: assets/hero/*.png"""
import os
from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter

HERO = Path(__file__).resolve().parent.parent / "assets" / "hero"
TOL = 26          # bg tolerance vs pure white
MAX_DIM = 1400    # web size

def bg_mask(im):
    px = im.load()
    w, h = im.size
    visited = [[False] * h for _ in range(w)]
    mask = [[False] * h for _ in range(w)]
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            dq.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        if visited[x][y]:
            continue
        visited[x][y] = True
        r, g, b = px[x, y][:3]
        if max(r, g, b) >= 255 - TOL and min(r, g, b) >= 255 - TOL - 24:
            mask[x][y] = True
            for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    dq.append((nx, ny))
    return mask

for jpg in sorted(HERO.glob("*.jpg")):
    im = Image.open(jpg).convert("RGB")
    im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)
    w, h = im.size
    mask = bg_mask(im)
    alpha = Image.new("L", (w, h), 0)
    apx = alpha.load()
    for x in range(w):
        for y in range(h):
            if not mask[x][y]:
                apx[x, y] = 255
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.6))
    rgba = im.convert("RGBA")
    rgba.putalpha(alpha)
    out = jpg.with_suffix(".png")
    rgba.save(out)
    print(out.name, rgba.size)

print("DONE")
