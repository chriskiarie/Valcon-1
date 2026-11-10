/* ============================================================
   Concept B Nightfall — Flyby Director (simplified)
   
   Fires ONE flyby on page load: plane travels left to right
   across the upper band of the viewport with a simple straight
   flight path. Reduced-motion: off.
   ============================================================ */

import { PLANE_IMAGES, PlaneImage, pickPlane } from "@/lib/flyby/planes";
import { makeFlybyPath, pathPositionAt } from "@/lib/flyby/path";

export type FlybyKind = "hero-load";

export interface FlybyPlaneController {
  /** Start a flyby with the given path and plane image. */
  startFlyby: (
    path: ReturnType<typeof makeFlybyPath>,
    plane: PlaneImage,
    durationSec: number,
    onComplete: () => void,
  ) => void;
  /** Stop any active flyby immediately. */
  stop: () => void;
  /** Set the contrail engine exhaust anchor positions. */
  setAnchors: (anchors: { x: number; y: number }[]) => void;
  /** Whether a flyby is currently active. */
  isActive: () => boolean;
}

/** Minimum time since page load before hero flyby (seconds). */
const HERO_DELAY_SEC = 0.6;

/**
 * FlybyDirector — fires a single left-to-right hero flyby on load.
 */
export class FlybyDirector {
  private controller: FlybyPlaneController | null = null;
  private isRunning = false;
  private hasFired = false;

  /** Inject the plane controller (called by FlybyLayer after mount). */
  setController(controller: FlybyPlaneController) {
    this.controller = controller;
  }

  /** Start the director. Fires the hero flyby after a short delay. */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    setTimeout(() => {
      this.tryFire("hero-load");
    }, HERO_DELAY_SEC * 1000);
  }

  /** Stop all flybys. Call on unmount or tab hide. */
  stop() {
    this.isRunning = false;
    this.controller?.stop();
  }

  /** Modal open/close — pause flybys while modal is open. */
  setModalOpen(open: boolean) {
    if (open) {
      this.controller?.stop();
    }
  }

  private tryFire(kind: FlybyKind) {
    if (!this.isRunning || this.hasFired) return;
    if (this.controller?.isActive()) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Straight left-to-right path, upper band of viewport
    const altitude = 0.28 + Math.random() * 0.10; // 28-38% from top
    const path = makeFlybyPath({
      direction: "right",
      altitude,
      curve: 0, // straight line
      viewportWidth,
      viewportHeight,
    });

    const plane = pickPlane(null, 0); // level flight silhouette
    const durationSec = 8 + Math.random() * 2; // 8-10s

    this.controller?.startFlyby(path, plane, durationSec, () => {
      // Flyby complete
    });

    this.hasFired = true;
  }
}

/** Singleton director instance. */
export const flybyDirector = new FlybyDirector();
