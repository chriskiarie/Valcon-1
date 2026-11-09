"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ParallaxLayer — Concept B Nightfall second-screen parallax.
 *
 * A night cloud-top / wing image with deep navy duotone and a line-art
 * overlay. Image layer moves +/-12% on scroll; overlay counter-moves and
 * rotates 0-25 degrees. Mobile range halved. Static with reduced motion.
 */
export default function ParallaxLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768;
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (reducedMotion || !layerRef.current || !imageRef.current || !overlayRef.current) {
      return;
    }

    const layer = layerRef.current;
    const image = imageRef.current;
    const overlay = overlayRef.current;

    // Parallax ranges
    const imageRange = isDesktop ? 0.12 : 0.06; // +/-12% desktop, +/-6% mobile
    const overlayRange = isDesktop ? 0.12 : 0.06;
    const maxRotation = isDesktop ? 25 : 0; // overlay rotates 0-25deg desktop only

    const handleScroll = () => {
      const rect = layer.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Only animate when the layer is in the viewport
      if (rect.bottom <= 0 || rect.top >= viewHeight) return;

      // Scroll progress through the layer (-1 to 1)
      const progress = (viewHeight - rect.top) / (viewHeight + rect.height);

      // Clamp progress to [0, 1]
      const p = Math.max(0, Math.min(1, progress));

      // Image layer: parallax translate (moves with scroll)
      const imageY = (p - 0.5) * 2 * imageRange * 100; // percentage
      image.style.transform = `translate3d(0, ${imageY}%, 0)`;

      // Overlay: counter-move (opposite direction) + rotate
      const overlayY = -(p - 0.5) * 2 * overlayRange * 100;
      const overlayRotation = (p - 0.5) * 2 * maxRotation;
      overlay.style.transform = `translate3d(0, ${overlayY}%, 0) rotate(${overlayRotation}deg)`;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion, isDesktop]);

  return (
    <div
      ref={layerRef}
      className="parallax-layer"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isDesktop ? "60svh" : "50svh",
        background: "#060b14",
      }}
    >
      {/* Parallax image layer: night cloud-top / wing, deep navy duotone */}
      <div
        ref={imageRef}
        className="parallax-image"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0e2a47 0%, #1a2e4a 50%, #0e2a47 100%)",
          backgroundImage:
            "linear-gradient(135deg, #0e2a47 0%, #1a2e4a 50%, #0e2a47 100%), " +
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E\")",
          backgroundBlendMode: "multiply",
          backgroundSize: "100% 100%, 200px 200px",
          willChange: "transform",
        }}
      />
      {/* Line-art overlay: white at 20-30% opacity, counter-moves and rotates */}
      <div
        ref={overlayRef}
        className="parallax-overlay"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.22) 100%)",
          backgroundSize: "200% 100%",
          backgroundRepeat: "no-repeat",
          willChange: "transform",
        }}
      />
    </div>
  );
}