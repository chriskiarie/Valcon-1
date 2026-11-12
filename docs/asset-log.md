# Asset log

## 5Y-VAL aircraft render

- **File:** `assets-source/5y-val-source.jpeg` (original, untouched)
- **Supplied by:** the project team, livery render, source to be confirmed.
- **Original format:** JPEG, 1600 × 533, RGB. The supplied file is a screenshot of a transparent PNG: an 8 px checkerboard is baked into the pixels and there is no alpha channel.
- **Treatment:** background removed with rembg (u2net), residual neutral checker squares stripped, 1 px mask erosion, 0.5 px feather, edge colour bleed. The livery, wordmark, emblem and registration were not retouched.
- **Exports:** `site/public/images/flyby/5y-val-960.webp` (960 × 185, alpha, 20 KB) and `5y-val-480.webp` (480 × 92, alpha, 8 KB).
- **Measurements:** `basePitch` 10.34° nose-up. Tail navy sampled at `#0C1B32`. Engine-exhaust anchors as fractions of the cutout: near `(0.222, 0.72)`, far `(0.212, 0.493)` (far engine hidden behind the fuselage).
- **Proof sheets:** `docs/cutout/5y-val-on-black-300.png`, `-on-white-300.png`, `-on-navy-300.png`; detail crops `5y-val-{nose,tail,engine}-navy-300.png`.
- **Build script:** `scripts/cutout_aircraft.py`.
