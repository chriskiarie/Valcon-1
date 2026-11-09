/* ============================================================
   Concept B Nightfall — Flyby path generation
   
   makeFlybyPath returns cubic bezier points from off-screen to
   off-screen, plus position and tangent at t (0..1).
   All coordinates are in viewport pixels.
   ============================================================ */

export type FlybyPath = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  length: number;
};

/** Evaluate cubic bezier position at t (0..1). */
function bezierPoint(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
): number {
  const c = 1 - t;
  return (
    c * c * c * p0 +
    3 * c * c * t * p1 +
    3 * c * t * t * p2 +
    t * t * t * p3
  );
}

/** Evaluate cubic bezier tangent (derivative) at t (0..1). */
function bezierTangent(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
): number {
  const c = 1 - t;
  return (
    3 * c * c * (p1 - p0) +
    6 * c * t * (p2 - p1) +
    3 * t * t * (p3 - p2)
  );
}

/** Approximate total bezier length by sampling. */
function bezierLength(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  samples = 50,
): number {
  let length = 0;
  let prevX = bezierPoint(0, p0x, p1x, p2x, p3x);
  let prevY = bezierPoint(0, p0y, p1y, p2y, p3y);
  for (let i = 1; i <= samples; i += 1) {
    const t = i / samples;
    const x = bezierPoint(t, p0x, p1x, p2x, p3x);
    const y = bezierPoint(t, p0y, p1y, p2y, p3y);
    length += Math.hypot(x - prevX, y - prevY);
    prevX = x;
    prevY = y;
  }
  return length;
}

/**
 * Create a flyby path from off-screen to off-screen.
 *
 * @param options.direction - "left" | "right" travel direction
 * @param options.altitude - y position as fraction of viewport height [0-1]
 * @param options.curve - curve intensity [0-1], higher = more arched
 * @param options.descent - if true, path descends toward end (final approach)
 * @param options.viewportWidth - viewport width in px
 * @param options.viewportHeight - viewport height in px
 */
export function makeFlybyPath({
  direction,
  altitude,
  curve,
  descent = false,
  viewportWidth,
  viewportHeight,
}: {
  direction: "left" | "right";
  altitude: number;
  curve: number;
  descent?: boolean;
  viewportWidth: number;
  viewportHeight: number;
}): FlybyPath {
  const margin = 260; // off-screen distance
  const y = viewportHeight * altitude;

  const startX = direction === "right" ? -margin : viewportWidth + margin;
  const endX = direction === "right" ? viewportWidth + margin : -margin;

  // Control points for a smooth curve
  let cp1y = y;
  let cp2y = y;

  if (descent) {
    // Final approach: descends toward the end
    cp1y = y - viewportHeight * 0.08;
    cp2y = y + viewportHeight * 0.12;
  } else if (curve > 0) {
    // Gentle arch
    const arch = viewportHeight * curve * 0.15;
    cp1y = y - arch;
    cp2y = y - arch * 0.5;
  }

  const computedLength = bezierLength(
    startX,
    y,
    startX + (endX - startX) * 0.25,
    cp1y,
    startX + (endX - startX) * 0.75,
    cp2y,
    endX,
    y,
  );

  const path: FlybyPath = {
    startX,
    startY: y,
    endX,
    endY: y,
    cp1x: startX + (endX - startX) * 0.25,
    cp1y,
    cp2x: startX + (endX - startX) * 0.75,
    cp2y,
    length: computedLength,
  };

  return path;
}

/** Get position and tangent angle (degrees) at t (0..1) along the path. */
export function pathPositionAt(
  path: FlybyPath,
  t: number,
): { x: number; y: number; angle: number } {
  const x = bezierPoint(t, path.startX, path.cp1x, path.cp2x, path.endX);
  const y = bezierPoint(t, path.startY, path.cp1y, path.cp2y, path.endY);
  const dx = bezierTangent(t, path.startX, path.cp1x, path.cp2x, path.endX);
  const dy = bezierTangent(t, path.startY, path.cp1y, path.cp2y, path.endY);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { x, y, angle };
}