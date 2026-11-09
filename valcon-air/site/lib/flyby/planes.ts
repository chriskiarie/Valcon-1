/* ============================================================
   Concept B Nightfall — Flyby aircraft image pool
   
   Each entry describes one aircraft image used in flybys.
   All images are transparent WebP cutouts, side view, nose to
   the right. Nightfall treatment: desaturated ~85%, cool tint,
   lifted highlights. No readable airline name/logo/registration.
   ============================================================ */

export type PlaneImage = {
  /** Image source path */
  src: string;
  /** Intrinsic width in px */
  width: number;
  /** Intrinsic height in px */
  height: number;
  /** Image faces right (true) — used to flip for right-to-left flights */
  facesRight: boolean;
  /** Tail anchor as x/y fraction [0-1] — where nav-light strobe sits */
  tailAnchor: [number, number];
  /** Left wingtip anchor — red nav light */
  leftWingtipAnchor: [number, number];
  /** Right wingtip anchor — green nav light */
  rightWingtipAnchor: [number, number];
  /** Engine exhaust anchors (two) — contrail emission points */
  exhaustAnchors: [number, number][];
  /** Base rotation angle in degrees (image's natural nose-up angle) */
  baseAngle: number;
  /** Desktop scale factor applied to intrinsic width */
  desktopScale: number;
  /** Mobile scale factor applied to intrinsic width */
  mobileScale: number;
  /** Credit key into docs/asset-log.md */
  creditKey: string;
};

/**
 * Pool of aircraft images for flybys.
 *
 * Image (1) level flight — hero flyby uses (1) or (4).
 * Image (2) climbing ~8° nose-up.
 * Image (3) descending ~5° nose-down — final-approach always uses (3).
 * Image (4) gentle banked turn.
 *
 * At least two should be CRJ-family or similar regional jets.
 *
 * Note: These are SVG cutouts serving as placeholders until client-supplied
 * real aircraft photography is available. Replace src with WebP assets and
 * update creditKey accordingly.
 */
export const PLANE_IMAGES: PlaneImage[] = [
  {
    // (1) Level flight — CRJ-family regional jet
    src: "/images/flyby/plane-level.svg",
    width: 640,
    height: 160,
    facesRight: true,
    tailAnchor: [0.05, 0.5],
    leftWingtipAnchor: [0.08, 0.42],
    rightWingtipAnchor: [0.92, 0.42],
    exhaustAnchors: [[0.25, 0.55], [0.35, 0.55]],
    baseAngle: 0,
    desktopScale: 0.38, // ~240px wide
    mobileScale: 0.24,  // ~150px wide
    creditKey: "flyby-plane-1",
  },
  {
    // (2) Climbing ~8° nose-up
    src: "/images/flyby/plane-climbing.svg",
    width: 640,
    height: 160,
    facesRight: true,
    tailAnchor: [0.05, 0.55],
    leftWingtipAnchor: [0.08, 0.45],
    rightWingtipAnchor: [0.92, 0.45],
    exhaustAnchors: [[0.28, 0.58], [0.38, 0.58]],
    baseAngle: 8,
    desktopScale: 0.38,
    mobileScale: 0.24,
    creditKey: "flyby-plane-2",
  },
  {
    // (3) Descending ~5° nose-down — final approach always uses this
    src: "/images/flyby/plane-descending.svg",
    width: 640,
    height: 160,
    facesRight: true,
    tailAnchor: [0.05, 0.45],
    leftWingtipAnchor: [0.08, 0.38],
    rightWingtipAnchor: [0.92, 0.38],
    exhaustAnchors: [[0.22, 0.52], [0.32, 0.52]],
    baseAngle: -5,
    desktopScale: 0.38,
    mobileScale: 0.24,
    creditKey: "flyby-plane-3",
  },
  {
    // (4) Gentle banked turn
    src: "/images/flyby/plane-banked.svg",
    width: 640,
    height: 160,
    facesRight: true,
    tailAnchor: [0.05, 0.5],
    leftWingtipAnchor: [0.08, 0.4],
    rightWingtipAnchor: [0.92, 0.4],
    exhaustAnchors: [[0.26, 0.54], [0.36, 0.54]],
    baseAngle: 6,
    desktopScale: 0.38,
    mobileScale: 0.24,
    creditKey: "flyby-plane-4",
  },
] as const;

/** Pick a random plane from the pool, never the same as the previous one. */
export function pickPlane(
  previous: PlaneImage | null,
  forceIndex?: number,
): PlaneImage {
  if (forceIndex !== undefined) {
    return PLANE_IMAGES[forceIndex];
  }
  let candidate = PLANE_IMAGES[Math.floor(Math.random() * PLANE_IMAGES.length)];
  if (PLANE_IMAGES.length > 1 && previous) {
    let attempts = 0;
    while (candidate === previous && attempts < 10) {
      candidate = PLANE_IMAGES[Math.floor(Math.random() * PLANE_IMAGES.length)];
      attempts += 1;
    }
  }
  return candidate;
}

/** Get a plane by credit key. */
export function findPlaneByCreditKey(key: string): PlaneImage | undefined {
  return PLANE_IMAGES.find((p) => p.creditKey === key);
}