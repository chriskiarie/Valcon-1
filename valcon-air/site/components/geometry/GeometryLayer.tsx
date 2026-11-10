"use client";

import { useEffect, useRef, useState } from "react";

/**
 * GeometryLayer — Concept B Nightfall site-wide background geometry.
 *
 * A star-map network of 14–20 nodes joined by hairlines (white at 6–9%).
 * Each node has a scroll parallax depth factor (0.1–0.4). Nodes brighten
 * near the cursor (desktop) and when a flyby plane passes. Rendered in
 * gutters and empty areas only; never reduces text contrast.
 */
export default function GeometryLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
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
    if (typeof window === "undefined") return;
    const handleMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate 14–20 nodes in gutters/empty areas (avoiding center content band)
  // Coordinates are 0–100 (percentage), scaled to viewport in SVG
  const nodeCount = isDesktop ? 18 : 14;
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    // Place nodes in left/right gutters, top/bottom bands — avoid center
    const side = i % 2 === 0 ? "left" : "right";
    const x =
      side === "left"
        ? 4 + (i % 5) * 12
        : 88 - (i % 5) * 12;
    const y = 12 + (i % 7) * 12;
    const depth = 0.1 + (i % 4) * 0.1; // 0.1 to 0.4
    return { id: `node-${i}`, x, y, depth, baseOpacity: 0.06 + (i % 3) * 0.01 };
  });

  return (
    <div
      ref={layerRef}
      className="geometry-layer"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1, // behind page content
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    >
      <svg
        ref={undefined as unknown as React.Ref<SVGSVGElement>}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="geometry-svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: reducedMotion ? "none" : "block",
        }}
      >
        <defs>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Hairlines connecting nearby nodes */}
        {nodes.map((node, i) => {
          const connections: { x1: number; y1: number; x2: number; y2: number }[] = [];
          for (let j = i + 1; j < nodes.length; j += 1) {
            const other = nodes[j];
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.hypot(dx, dy);
            // Connect nodes within ~25 units (percentage)
            if (dist < 25) {
              connections.push({ x1: node.x, y1: node.y, x2: other.x, y2: other.y });
            }
          }
          return connections.map((conn, k) => (
            <line
              key={`line-${i}-${k}`}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="0.5"
            />
          ));
        })}
        {/* Nodes with scroll parallax depth */}
        {nodes.map((node) => {
          // Scroll parallax: node moves based on depth * scrollY
          // Convert scrollY to percentage of viewport height
          const vh = typeof window !== "undefined" ? window.innerHeight : 100;
          const scrollPct = (scrollY / vh) * 100;
          const parallaxY = node.y + scrollPct * node.depth;
          // Cursor proximity brightens the node (desktop only)
          const cursorDist = Math.hypot(
            cursor.x * 100 - node.x,
            cursor.y * 100 - parallaxY,
          );
          const cursorGlow = isDesktop && !reducedMotion
            ? Math.max(0, 1 - cursorDist / 30) * 0.04
            : 0;
          const opacity = Math.min(0.15, node.baseOpacity + cursorGlow);
          return (
            <circle
              key={node.id}
              cx={node.x}
              cy={parallaxY}
              r={2}
              fill="#ffffff"
              opacity={opacity}
              style={
                reducedMotion
                  ? {}
                  : {
                      transition: "opacity 0.3s ease, transform 0.1s ease",
                      willChange: "transform, opacity",
                    }
              }
            />
          );
        })}
      </svg>
    </div>
  );
}