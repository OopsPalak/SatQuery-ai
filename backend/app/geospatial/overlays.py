"""Generates PNG visual-evidence artifacts (bounding box overlays, change
heatmaps, before/after composites) written under RESULT_DIR and served
statically by FastAPI at /results/...
"""
from __future__ import annotations

from pathlib import Path


def draw_bounding_boxes(image_array, boxes: list[dict], out_path: Path) -> Path:
    """boxes: [{"bbox": [x1,y1,x2,y2], "label": str, "confidence": float}, ...]"""
    import numpy as np
    from PIL import Image, ImageDraw

    img = Image.fromarray(np.asarray(image_array).astype("uint8")).convert("RGB")
    draw = ImageDraw.Draw(img)
    for box in boxes:
        x1, y1, x2, y2 = box["bbox"]
        draw.rectangle([x1, y1, x2, y2], outline=(95, 212, 224), width=3)
        label = f'{box.get("label", "")} {box.get("confidence", 0):.0%}'.strip()
        draw.rectangle([x1, max(0, y1 - 14), x1 + 8 * len(label), y1], fill=(11, 14, 19))
        draw.text((x1 + 2, max(0, y1 - 13)), label, fill=(95, 212, 224))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    return out_path


def draw_change_heatmap(before_array, after_array, out_path: Path) -> Path:
    import numpy as np
    from PIL import Image

    a = np.asarray(before_array).astype("float32")
    b = np.asarray(after_array).astype("float32")
    if a.ndim == 3:
        a = a.mean(axis=2)
    if b.ndim == 3:
        b = b.mean(axis=2)

    diff = np.abs(a - b)
    if diff.max() > 0:
        diff = diff / diff.max()

    heat = np.zeros((*diff.shape, 3), dtype="uint8")
    heat[..., 0] = (diff * 255).astype("uint8")  # red channel intensity = magnitude of change
    heat[..., 1] = ((1 - diff) * 60).astype("uint8")
    heat[..., 2] = 30

    out_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(heat).save(out_path)
    return out_path


def save_array_as_png(array, out_path: Path) -> Path:
    import numpy as np
    from PIL import Image

    out_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.asarray(array).astype("uint8")).save(out_path)
    return out_path
