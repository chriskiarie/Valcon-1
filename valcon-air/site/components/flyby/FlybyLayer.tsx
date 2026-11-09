"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { FlybyPlaneController } from "@/lib/flyby/director";
import { flybyDirector } from "@/lib/flyby/director";
import { ContrailRenderer } from "@/lib/flyby/contrail";
import { PlaneImage } from "@/lib/flyby/planes";
import { makeFlybyPath, pathPositionAt } from "@/lib/flyby/path";

/**
 * FlybyLayer — Concept B Nightfall flyby system.
 *
 * A single fixed full-viewport overlay mounted once in the root layout.
 * Contains one canvas (the trail) and one plane element (navy silhouette).
 * Runs on time, not on scroll. One plane at a time. Reduced-motion: off.
 *
 * Layering: above page content (z 55), below header / modal / scrim.
 */
export default function FlybyLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLImageElement>(null);
  const navLightsRef = useRef<HTMLDivElement>(null);
  const contrailRef = useRef<ContrailRenderer | null>(null);
  const rafRef = useRef<number | null>(null);

  // Animation state stored in refs (mutable, not render state)
  const stateRef = useRef({
    startTime: 0,
    durationSec: 0,
    currentPath: null as ReturnType<typeof makeFlybyPath> | null,
    currentPlane: null as PlaneImage | null,
    isRtl: false,
    isFinalApproach: false,
    onComplete: null as (() => void) | null,
  });

  // Plane dimensions from useState with lazy initializer
  const [planeWidth, setPlaneWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth >= 768 ? 240 : 150;
  });
  const [planeHeight, setPlaneHeight] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const w = window.innerWidth >= 768 ? 240 : 150;
    return (w * 160) / 640;
  });

  useEffect(() => {
    const handleResize = () => {
      const d = window.innerWidth >= 768;
      const w = d ? 240 : 150;
      setPlaneWidth(w);
      setPlaneHeight((w * 160) / 640);
      contrailRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stopFlyby = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (planeRef.current) {
      planeRef.current.style.opacity = "0";
      planeRef.current.style.transform = "none";
    }
    if (navLightsRef.current) {
      navLightsRef.current.style.opacity = "0";
    }
    stateRef.current.currentPath = null;
    stateRef.current.currentPlane = null;
    stateRef.current.onComplete = null;
    contrailRef.current?.stop();
  }, []);

  const startFlyby = useCallback(
    (
      path: ReturnType<typeof makeFlybyPath>,
      plane: PlaneImage,
      durationSecParam: number,
      onComplete: () => void,
    ) => {
      stopFlyby();

      stateRef.current.currentPath = path;
      stateRef.current.currentPlane = plane;
      stateRef.current.durationSec = durationSecParam;
      stateRef.current.startTime = performance.now();
      stateRef.current.isRtl = path.startX > path.endX;
      stateRef.current.isFinalApproach = false;
      stateRef.current.onComplete = onComplete;

      const img = planeRef.current;
      const lights = navLightsRef.current;
      if (!img || !lights) return;

      img.src = plane.src;
      img.style.opacity = "1";
      img.style.width = `${planeWidth}px`;
      img.style.height = "auto";
      img.style.transformOrigin = "center center";

      lights.style.opacity = "1";

      contrailRef.current?.start();

      const animate = () => {
        const s = stateRef.current;
        if (!s.currentPath || !s.currentPlane) return;

        const elapsed = (performance.now() - s.startTime) / 1000;
        const t = Math.min(elapsed / s.durationSec, 1);

        const pos = pathPositionAt(s.currentPath, t);

        const plane = s.currentPlane;
        if (!plane) return;

        // Plane transform: translate + rotate to tangent + base angle
        // scaleX(-1) for right-to-left, applied BEFORE rotation
        const baseAngle = plane.baseAngle;
        const totalAngle = s.isRtl ? pos.angle + 180 + baseAngle : pos.angle + baseAngle;

        // Scale depth: 0.92 to 1.0 along path
        let scale = 0.92 + (1 - t) * 0.08;

        // Final approach: scale down to 0.55 and fade over last 15%
        let alpha = 1;
        if (s.isFinalApproach && t > 0.85) {
          const landT = (t - 0.85) / 0.15;
          scale *= 1 - landT * 0.45;
          alpha = 1 - landT;
        }

        const flip = s.isRtl ? -1 : 1;

        img.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${flip}) scale(${scale}) rotate(${totalAngle}deg)`;
        img.style.opacity = String(alpha);
        lights.style.opacity = String(alpha);

        // Update contrail anchors from exhaust positions
        const angleRad = (totalAngle * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        const anchors = plane.exhaustAnchors.map(([ax, ay]) => {
          const px = ax * plane.width * scale;
          const py = ay * plane.height * scale;
          const rx = flip * (px * cos - py * sin);
          const ry = flip * (px * sin + py * cos);
          return { x: pos.x + rx, y: pos.y + ry };
        });

        contrailRef.current?.setAnchors(anchors);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          stopFlyby();
          s.onComplete?.();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [stopFlyby, planeWidth, planeHeight],
  );

  // Register controller with director — director calls startFlyby ONCE per flyby
  useEffect(() => {
    const controller: FlybyPlaneController = {
      startFlyby,
      stop: stopFlyby,
      setAnchors: (anchors) => {
        contrailRef.current?.setAnchors(anchors);
      },
      isActive: () => stateRef.current.currentPath !== null,
    };

    flybyDirector.setController(controller);
    flybyDirector.start();

    return () => {
      flybyDirector.stop();
      stopFlyby();
    };
  }, [startFlyby, stopFlyby]);

  // Page visibility / tab hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopFlyby();
        flybyDirector.stop();
      } else {
        flybyDirector.start();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stopFlyby]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="flyby-layer"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 55,
        width: "100vw",
        height: "100vh",
      }}
    >
      <canvas
        ref={canvasRef}
        className="flyby-contrail-canvas"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <img
        ref={planeRef}
        className="flyby-plane"
        alt=""
        style={{
          position: "absolute",
          pointerEvents: "none",
          zIndex: 10,
          opacity: "0",
          willChange: "transform",
          // Navy silhouette shadow — matches brief: drop-shadow(0 28px 22px rgba(11,22,38,0.22))
          filter:
            "drop-shadow(0 28px 22px rgba(11, 22, 38, 0.22)) drop-shadow(0 8px 16px rgba(11, 22, 38, 0.12))",
        }}
      />
      <div
        ref={navLightsRef}
        className="flyby-nav-lights"
        style={{
          position: "absolute",
          pointerEvents: "none",
          zIndex: 11,
          opacity: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Red nav light at left wingtip */}
        <div
          className="flyby-nav-light flyby-nav-light-red"
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#ff3b3b",
            boxShadow: "0 0 6px #ff3b3b",
            marginTop: "-2px",
          }}
        />
        {/* White strobe at tail */}
        <div
          className="flyby-nav-light flyby-nav-light-strobe"
          style={{
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 0 8px #ffffff",
            marginTop: "-2px",
            animation: "strobe 1s infinite",
          }}
        />
        {/* Green nav light at right wingtip */}
        <div
          className="flyby-nav-light flyby-nav-light-green"
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#3bff3b",
            boxShadow: "0 0 6px #3bff3b",
            marginTop: "-2px",
          }}
        />
      </div>
    </div>
  );
}

/** Register trigger elements with the director after mount. */
export function registerFlybyTriggers({
  fleetHeading,
  closingBand,
}: {
  fleetHeading?: HTMLElement;
  closingBand?: HTMLElement;
}) {
  flybyDirector.registerTriggerElements({ fleetHeading, closingBand });
}

/** Pause/resume flybys when modal opens/closes. */
export function setFlybyModalOpen(open: boolean) {
  flybyDirector.setModalOpen(open);
}
