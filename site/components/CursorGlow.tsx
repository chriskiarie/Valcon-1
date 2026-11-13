"use client";

import { useEffect, useRef } from "react";

const DARK_SURFACES = ".closing, .mobile-menu, [data-glow='dark']";

/** A faint two-colour light that follows the mouse. Desktop only, off for reduced motion. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current;
    if (!glow) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let started = false;

    const draw = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (Math.abs(targetX - x) > 0.4 || Math.abs(targetY - y) > 0.4) {
        frame = window.requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        x = targetX;
        y = targetY;
        started = true;
      }
      const target = event.target instanceof Element ? event.target : null;
      glow.dataset.tone = target?.closest(DARK_SURFACES) ? "dark" : "light";
      glow.dataset.on = "true";
      if (!frame) frame = window.requestAnimationFrame(draw);
    };
    const onLeave = () => {
      glow.dataset.on = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" data-on="false" data-tone="light" aria-hidden="true" />;
}
