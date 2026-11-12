"""Cut the 5Y-VAL aircraft out of the supplied checkerboard screenshot.

The source JPEG is a screenshot of a transparent PNG: the checkerboard is
baked into the pixels and there is no alpha channel. We run the supplied
render through rembg (u2net), remove the last neutral checkerboard squares
that cling to the silhouette, de-fringe the edge, and export alpha WebP at
960 px and 480 px wide.

Run:  python scripts/cutout_aircraft.py
"""

from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets-source" / "5y-val-source.jpeg"
OUT_DIR = ROOT / "site" / "public" / "images" / "flyby"
DOC_DIR = ROOT / "docs" / "cutout"
DOC_DIR.mkdir(parents=True, exist_ok=True)
OUT_DIR.mkdir(parents=True, exist_ok=True)

NAVY = (14, 42, 71)  # --color-brand #0e2a47


def rembg_alpha(rgb: np.ndarray) -> np.ndarray:
    """u2net matte, with the remaining neutral checker squares stripped."""
    image = Image.fromarray(rgb)
    cut = remove(image, session=new_session("u2net"), post_process_mask=True)
    alpha = np.array(cut)[..., 3]

    # Keep the airframe; drop detached speckle (a stray 23x5 sliver by the tail).
    n, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 16).astype(np.uint8), 8)
    keep = np.zeros_like(alpha)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= 400:
            keep[labels == i] = alpha[labels == i]
    alpha = keep

    # A few 8 px checkerboard squares survive where they touch the airframe.
    # They are neutral grey and small; the aircraft's grey structures
    # (horizontal stabiliser, wing) are much larger, so only remove small
    # neutral islands that touch transparency.
    lum = rgb.mean(axis=2)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    neutral = ((spread <= 5) & (lum >= 118) & (lum <= 238) & (alpha > 16)).astype(np.uint8)
    touching_bg = cv2.dilate((alpha <= 16).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    n, labels, stats, _ = cv2.connectedComponentsWithStats(neutral, 8)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 700:
            continue
        component = labels == i
        if np.any(component & touching_bg):
            alpha[component] = 0

    # Binary matte: erode 1 px, feather 0.5 px.
    mask = (alpha >= 128).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    flood = mask.copy()
    fmask = np.zeros((mask.shape[0] + 2, mask.shape[1] + 2), np.uint8)
    cv2.floodFill(flood, fmask, (0, 0), 255)
    mask[flood == 0] = 255
    mask = cv2.erode(mask, np.ones((3, 3), np.uint8), iterations=1)
    mask = cv2.GaussianBlur(mask, (3, 3), 0.5)
    return mask


def bleed_colour(rgb: np.ndarray, alpha: np.ndarray, iterations: int = 6) -> np.ndarray:
    """Extend opaque colours under the transparent edge so no pale halo shows."""
    out = rgb.astype(np.float32).copy()
    opaque = alpha > 220
    kernel = np.ones((3, 3), np.uint8)
    for _ in range(iterations):
        dilated = cv2.dilate(out, kernel)
        grown = cv2.dilate(opaque.astype(np.uint8), kernel) > 0
        fill = grown & ~opaque
        out[fill] = dilated[fill]
        opaque = opaque | fill
    return out


def premultiplied_resize(rgba: np.ndarray, width: int) -> np.ndarray:
    h, w = rgba.shape[:2]
    height = round(h * width / w)
    rgb = rgba[..., :3].astype(np.float32) / 255.0
    a = rgba[..., 3].astype(np.float32) / 255.0
    pre = np.dstack([rgb * a[..., None], a])
    resized = cv2.resize(pre, (width, height), interpolation=cv2.INTER_AREA)
    out_a = resized[..., 3:4]
    with np.errstate(divide="ignore", invalid="ignore"):
        out_rgb = np.where(out_a > 0, resized[..., :3] / out_a, 0)
    out = np.concatenate([np.clip(out_rgb, 0, 1), np.clip(out_a, 0, 1)], axis=2)
    return (out * 255.0 + 0.5).astype(np.uint8)


def measure(rgb: np.ndarray, alpha: np.ndarray) -> dict:
    h, w = alpha.shape
    # Fuselage crown: topmost silhouette between the tail and the nose curve.
    xs, ys = [], []
    for x in range(int(w * 0.36), int(w * 0.88)):
        col = np.where(alpha[:, x] > 160)[0]
        if col.size == 0:
            continue
        xs.append(x)
        ys.append(col[0])
    xs = np.asarray(xs, dtype=np.float64)
    ys = np.asarray(ys, dtype=np.float64)
    slope, _ = np.polyfit(xs, ys, 1)
    pitch = float(np.degrees(np.arctan(-slope)))

    # Tail navy: median of a clean patch on the vertical stabiliser.
    patch = rgb[int(h * 0.28) : int(h * 0.36), int(w * 0.17) : int(w * 0.21)]
    navy = np.median(patch.reshape(-1, 3), axis=0).astype(int)
    navy_hex = "#{:02X}{:02X}{:02X}".format(*navy)

    bbox = cv2.boundingRect((alpha > 8).astype(np.uint8))
    return {
        "source_size": [w, h],
        "alpha_bbox": [int(v) for v in bbox],
        "base_pitch_deg": round(pitch, 2),
        "tail_navy_hex": navy_hex,
        "tail_navy_rgb": [int(v) for v in navy],
        "near_engine_anchor": [0.222, 0.72],
        "far_engine_anchor": [0.212, 0.493],
    }


def composite(rgba: np.ndarray, colour: tuple[int, int, int], zoom: int = 3) -> Image.Image:
    img = Image.fromarray(rgba)
    big = img.resize((img.width * zoom, img.height * zoom), Image.LANCZOS)
    base = Image.new("RGB", big.size, colour)
    base.paste(big, (0, 0), big)
    return base


def main() -> None:
    bgr = cv2.imread(str(SRC), cv2.IMREAD_COLOR)
    if bgr is None:
        raise SystemExit(f"Could not read {SRC}")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32)

    alpha = rembg_alpha(rgb.astype(np.uint8))
    colour = bleed_colour(rgb, alpha)

    ys, xs = np.where(alpha > 8)
    x0, x1 = max(0, xs.min() - 2), min(rgb.shape[1], xs.max() + 3)
    y0, y1 = max(0, ys.min() - 2), min(rgb.shape[0], ys.max() + 3)
    rgba = np.dstack([colour[y0:y1, x0:x1], alpha[y0:y1, x0:x1]]).astype(np.uint8)

    Image.fromarray(rgba).save(DOC_DIR / "5y-val-cutout.png")

    for width in (960, 480):
        out = premultiplied_resize(rgba, width)
        path = OUT_DIR / f"5y-val-{width}.webp"
        quality = 86
        while quality >= 60:
            Image.fromarray(out).save(
                path, "WEBP", quality=quality, method=6, alpha_quality=100
            )
            if path.stat().st_size <= 90_000:
                break
            quality -= 4
        print(f"{path.name}: {out.shape[1]}x{out.shape[0]} {path.stat().st_size/1024:.1f} KB q={quality}")

    info = measure(rgb, alpha)
    info["output"] = {"960": "5y-val-960.webp", "480": "5y-val-480.webp"}
    (DOC_DIR / "measurements.json").write_text(json.dumps(info, indent=2), encoding="utf-8")
    print(json.dumps(info, indent=2))

    # 300% proof sheets.
    cut = Image.open(OUT_DIR / "5y-val-960.webp").convert("RGBA")
    arr = np.array(cut)
    for name, colour_bg in (
        ("black", (0, 0, 0)),
        ("white", (255, 255, 255)),
        ("navy", NAVY),
    ):
        composite(arr, colour_bg, zoom=3).save(DOC_DIR / f"5y-val-on-{name}-300.png")

    # Detail crops at 300% (nose, tail/winglet, engine).
    big = cut.resize((cut.width * 3, cut.height * 3), Image.LANCZOS)
    for name, box in (
        ("nose", (big.width - 1000, 0, big.width, 600)),
        ("tail", (0, 0, 900, 900)),
        ("engine", (450, 450, 1250, 1000)),
    ):
        base = Image.new("RGB", (box[2] - box[0], box[3] - box[1]), NAVY)
        piece = big.crop(box)
        base.paste(piece, (0, 0), piece)
        base.save(DOC_DIR / f"5y-val-{name}-navy-300.png")


if __name__ == "__main__":
    main()
