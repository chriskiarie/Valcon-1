/* ============================================================
   Concept B Nightfall — Flyby Director
   
   Triggers, lane selection, cooldowns, and lifecycle for the
   three flybys. Everything runs on time, not on scroll.
   ============================================================ */

import { PLANE_IMAGES, PlaneImage, pickPlane } from "@/lib/flyby/planes";
import { makeFlybyPath, pathPositionAt } from "@/lib/flyby/path";
import { ContrailRenderer } from "@/lib/flyby/contrail";

export type FlybyKind = "hero-load" | "fleet-transition" | "final-approach";

export type FlybyTrigger = {
  kind: FlybyKind;
  fired: boolean;
  cooldownUntil: number;
};

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

/** Global cooldown between flybys (seconds). */
const FLYBY_COOLDOWN_SEC = 6;

/** Minimum time since page load before hero flyby (seconds). */
const HERO_DELAY_SEC = 0.4;

/** Trigger thresholds (fraction of element in view). */
const FLEET_TRIGGER_VIEW = 0.3;
const CLOSING_TRIGGER_VIEW = 0.25;

/**
 * FlybyDirector manages the three flyby triggers and delegates
 * animation to a FlybyPlaneController.
 */
export class FlybyDirector {
  private controller: FlybyPlaneController | null = null;
  private triggers: Map<FlybyKind, FlybyTrigger>;
  private lastFlybyTime = 0;
  private isRunning = false;

  // Trigger elements (set externally via registerTriggerElement)
  private fleetHeadingEl: HTMLElement | null = null;
  private closingBandEl: HTMLElement | null = null;

  constructor() {
    this.triggers = new Map([
      ["hero-load", { kind: "hero-load", fired: false, cooldownUntil: 0 }],
      [
        "fleet-transition",
        { kind: "fleet-transition", fired: false, cooldownUntil: 0 },
      ],
      [
        "final-approach",
        { kind: "final-approach", fired: false, cooldownUntil: 0 },
      ],
    ]);
  }

  /** Inject the plane controller (called by FlybyLayer after mount). */
  setController(controller: FlybyPlaneController) {
    this.controller = controller;
  }

  /** Register DOM elements whose intersection triggers flybys. */
  registerTriggerElements({
    fleetHeading,
    closingBand,
  }: {
    fleetHeading?: HTMLElement;
    closingBand?: HTMLElement;
  }) {
    this.fleetHeadingEl = fleetHeading ?? null;
    this.closingBandEl = closingBand ?? null;
  }

  /** Start the director loop. Call once after mount. */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFlybyTime = performance.now() / 1000;

    // Hero flyby: fires after a short delay
    setTimeout(() => {
      this.tryFire("hero-load");
    }, HERO_DELAY_SEC * 1000);

    // Scroll-based triggers for fleet and closing band
    this.handleScroll();
    window.addEventListener("scroll", () => this.handleScroll(), {
      passive: true,
    });
  }

  /** Stop all flybys. Call on unmount, modal open, or tab hide. */
  stop() {
    this.isRunning = false;
    this.controller?.stop();
    window.removeEventListener("scroll", () => this.handleScroll());
  }

  /** Modal open/close — pause flybys while modal is open. */
  setModalOpen(open: boolean) {
    if (open) {
      this.controller?.stop();
    }
  }

  private now() {
    return performance.now() / 1000;
  }

  private tryFire(kind: FlybyKind) {
    const trigger = this.triggers.get(kind);
    if (!trigger || trigger.fired) return;
    if (this.now() < trigger.cooldownUntil) return;
    if (this.controller?.isActive()) return;

    const now = this.now();
    if (now - this.lastFlybyTime < FLYBY_COOLDOWN_SEC) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isDesktop = viewportWidth >= 768;

    let path: ReturnType<typeof makeFlybyPath>;
    let plane: PlaneImage;
    let durationSec: number;

    let altitude = 0;

    if (kind === "hero-load") {
      // Left to right, upper band of viewport
      altitude = 0.22 + Math.random() * 0.12; // 22-34% from top
      path = makeFlybyPath({
        direction: "right",
        altitude,
        curve: 0.3,
        viewportWidth,
        viewportHeight,
      });
      plane = pickPlane(null, Math.random() < 0.5 ? 0 : 3); // image (1) or (4)
      durationSec = 7 + Math.random() * 3; // 7-10s
    } else if (kind === "fleet-transition") {
      // Right to left, mid height
      altitude = 0.45 + Math.random() * 0.15; // 45-60% from top
      path = makeFlybyPath({
        direction: "left",
        altitude,
        curve: 0.2,
        viewportWidth,
        viewportHeight,
      });
      plane = pickPlane(null, 1); // image (2) climbing
      durationSec = 5 + Math.random() * 2; // 5-7s
    } else {
      // final-approach: left to right, descending curve
      altitude = 0.55 + Math.random() * 0.15;
      path = makeFlybyPath({
        direction: "right",
        altitude,
        curve: 0.4,
        descent: true,
        viewportWidth,
        viewportHeight,
      });
      plane = PLANE_IMAGES[2]; // image (3) descending
      durationSec = 7 + Math.random() * 3; // 7-10s
    }

    // Lane avoidance: check if path band intersects protected elements
    if (!this.isLaneFree(path, viewportHeight)) {
      // Try nearest free margin
      const alternateAltitude = altitude > 0.5 ? 0.15 : 0.85;
      path = makeFlybyPath({
        direction: path.startX < path.endX ? "right" : "left",
        altitude: alternateAltitude,
        curve: kind === "final-approach" ? 0.4 : 0.2,
        descent: kind === "final-approach",
        viewportWidth,
        viewportHeight,
      });
      if (!this.isLaneFree(path, viewportHeight)) {
        // Skip this flyby
        trigger.fired = true;
        trigger.cooldownUntil = now + FLYBY_COOLDOWN_SEC;
        return;
      }
    }

    this.fireFlyby(path, plane, durationSec, kind);
    trigger.fired = true;
    trigger.cooldownUntil = now + FLYBY_COOLDOWN_SEC;
    this.lastFlybyTime = now;
  }

  private fireFlyby(
    path: ReturnType<typeof makeFlybyPath>,
    plane: PlaneImage,
    durationSec: number,
    kind: FlybyKind,
  ) {
    if (!this.controller) return;

    const startTime = this.now();
    const endTime = startTime + durationSec;

    const animate = () => {
      if (!this.isRunning || !this.controller) return;

      const t = Math.min((this.now() - startTime) / durationSec, 1);
      const pos = pathPositionAt(path, t);

      // Plane transform: translate + rotate to tangent + base angle
      // scaleX(-1) for right-to-left, applied before rotation
      const isRtl = path.startX > path.endX;
      const baseAngle = plane.baseAngle;
      const totalAngle = isRtl ? pos.angle + 180 + baseAngle : pos.angle + baseAngle;

      // Scale depth: 0.92 to 1.0 along path
      const scale = 0.92 + (1 - t) * 0.08;

      // Final approach: scale down to 0.55 and fade over last 15%
      let finalScale = scale;
      let finalAlpha = 1;
      if (kind === "final-approach" && t > 0.85) {
        const landT = (t - 0.85) / 0.15;
        finalScale = scale * (1 - landT * 0.45); // to 0.55
        finalAlpha = 1 - landT;
      }

      this.controller.startFlyby(
        path,
        plane,
        durationSec,
        () => {
          // Flyby complete
        },
      );

      // Set contrail anchors from exhaust positions
      // Transform exhaust anchors by plane's current transform
      const cx = pos.x;
      const cy = pos.y;
      const angleRad = (totalAngle * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const flip = isRtl ? -1 : 1;

      const anchors = plane.exhaustAnchors.map(([ax, ay]) => {
        // Anchor is a fraction of image width/height
        // Image is scaled: width * scale, height * scale
        const px = ax * plane.width * scale;
        const py = ay * plane.height * scale;
        // Rotate and flip
        const rx = flip * (px * cos - py * sin);
        const ry = flip * (px * sin + py * cos);
        return { x: cx + rx, y: cy + ry };
      });

      this.controller.setAnchors(anchors);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Flyby finished
        this.controller.stop();
      }
    };

    requestAnimationFrame(animate);
  }

  /** Check if a path's vertical band (plane height + 40px) intersects protected elements. */
  private isLaneFree(
    path: ReturnType<typeof makeFlybyPath>,
    viewportHeight: number,
  ): boolean {
    if (!this.fleetHeadingEl && !this.closingBandEl) return true;

    // Sample several points along the path
    for (let t = 0; t <= 1; t += 0.1) {
      const pos = pathPositionAt(path, t);
      const bandTop = pos.y - 40;
      const bandBottom = pos.y + 40;

      if (this.fleetHeadingEl) {
        const rect = this.fleetHeadingEl.getBoundingClientRect();
        if (
          pos.x >= rect.left - 100 &&
          pos.x <= rect.right + 100 &&
          bandBottom >= rect.top &&
          bandTop <= rect.bottom
        ) {
          return false;
        }
      }
      if (this.closingBandEl) {
        const rect = this.closingBandEl.getBoundingClientRect();
        if (
          pos.x >= rect.left - 100 &&
          pos.x <= rect.right + 100 &&
          bandBottom >= rect.top &&
          bandTop <= rect.bottom
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private handleScroll() {
    if (!this.isRunning) return;

    // Fleet transition trigger
    if (this.fleetHeadingEl && !this.triggers.get("fleet-transition")!.fired) {
      const rect = this.fleetHeadingEl.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const inView =
        rect.top < viewHeight * FLEET_TRIGGER_VIEW &&
        rect.bottom > 0;
      if (inView) {
        this.tryFire("fleet-transition");
      }
    }

    // Final approach trigger
    if (this.closingBandEl && !this.triggers.get("final-approach")!.fired) {
      const rect = this.closingBandEl.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const inView =
        rect.top < viewHeight * CLOSING_TRIGGER_VIEW &&
        rect.bottom > 0;
      if (inView) {
        this.tryFire("final-approach");
      }
    }
  }
}

/** Singleton director instance. */
export const flybyDirector = new FlybyDirector();