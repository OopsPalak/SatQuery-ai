"""Alignment helpers: resizing two arrays onto a common pixel grid so they
can be diffed or fused. This is a pragmatic array-level alignment used by
the mock/baseline pipeline; a production system would align on the
geographic grid via app.geospatial.reprojection before ever reaching numpy.
"""
from __future__ import annotations


def align_arrays(arr_a, arr_b):
    """Resize the larger array down to the smaller array's HxW so the two
    can be compared pixel-for-pixel. Returns (arr_a, arr_b) at matching size."""
    import numpy as np

    ha, wa = arr_a.shape[:2]
    hb, wb = arr_b.shape[:2]
    target_h, target_w = min(ha, hb), min(wa, wb)

    def _resize(arr, h, w):
        if arr.shape[:2] == (h, w):
            return arr
        try:
            from PIL import Image

            img = Image.fromarray(arr)
            img = img.resize((w, h))
            return np.array(img)
        except Exception:  # noqa: BLE001
            # Nearest-neighbour crop as an absolute last resort.
            return arr[:h, :w]

    return _resize(arr_a, target_h, target_w), _resize(arr_b, target_h, target_w)
