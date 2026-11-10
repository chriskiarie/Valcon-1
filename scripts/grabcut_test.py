import cv2
import numpy as np
from PIL import Image
from pathlib import Path

root = Path(__file__).resolve().parents[1]
src = cv2.imread(str(root / "assets-source" / "5y-val-source.jpeg"))
h, w = src.shape[:2]
mask = np.full((h, w), cv2.GC_BGD, np.uint8)
mask[18 : h - 18, 12 : w - 12] = cv2.GC_PR_FGD
# Seed the obvious airframe: dark livery and bright fuselage, but not grey bg.
b, g, r = cv2.split(src.astype(np.float32))
mx = np.maximum(np.maximum(b, g), r)
mn = np.minimum(np.minimum(b, g), r)
spread = mx - mn
bright = mx > 218
dark = mx < 90
seed = (bright | dark | (spread > 12)) & (mask == cv2.GC_PR_FGD)
mask[seed] = cv2.GC_FGD
bgd = np.zeros((1, 65), np.float64)
fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(src, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# keep components > 120
n, labels, stats, _ = cv2.connectedComponentsWithStats(alpha, 8)
out = np.zeros_like(alpha)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] >= 120:
        out[labels == i] = 255
# fill holes
flood = out.copy()
m = np.zeros((h + 2, w + 2), np.uint8)
cv2.floodFill(flood, m, (0, 0), 255)
out[flood == 0] = 255
out = cv2.erode(out, np.ones((3, 3), np.uint8), 1)
out = cv2.GaussianBlur(out, (3, 3), 0.5)
print("coverage", (out > 128).mean(), "bbox", cv2.boundingRect((out > 8).astype(np.uint8)))
ys, xs = np.where(out > 8)
print("bbox tight", xs.min(), xs.max(), ys.min(), ys.max())

rgba = np.dstack([cv2.cvtColor(src, cv2.COLOR_BGR2RGB), out])
cut = Image.fromarray(rgba, "RGBA")
big = cut.resize((cut.width * 3, cut.height * 3), Image.LANCZOS)
base = Image.new("RGB", big.size, (14, 42, 71))
base.paste(big, (0, 0), big)
base.save(root / "docs" / "cutout" / "grabcut-test.png")
