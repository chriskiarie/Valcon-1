"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type Shape = {
  className: string;
  depth: number;
  style: CSSProperties;
};

const shapes: Shape[] = [
  {
    className: "geometry__ring",
    depth: 0.12,
    style: { top: "6%", right: "-12rem", width: "36rem", height: "36rem", "--shape-opacity": 0.09 } as CSSProperties,
  },
  {
    className: "geometry__ring",
    depth: 0.22,
    style: { top: "48%", left: "-9rem", width: "24rem", height: "24rem", "--shape-opacity": 0.105 } as CSSProperties,
  },
  {
    className: "geometry__ring",
    depth: 0.16,
    style: { bottom: "8%", right: "5%", width: "15rem", height: "15rem", "--shape-opacity": 0.13 } as CSSProperties,
  },
  {
    className: "geometry__dots",
    depth: 0.3,
    style: { top: "34%", right: "2%", width: "11rem", height: "11rem", "--shape-opacity": 0.115 } as CSSProperties,
  },
  {
    className: "geometry__dots",
    depth: 0.18,
    style: { bottom: "16%", left: "8%", width: "9rem", height: "9rem", "--shape-opacity": 0.1 } as CSSProperties,
  },
  {
    className: "geometry__triangle",
    depth: 0.34,
    style: { top: "25%", left: "6%", width: "0.9rem", height: "0.8rem", "--shape-opacity": 0.16 } as CSSProperties,
  },
  {
    className: "geometry__triangle",
    depth: 0.26,
    style: { top: "62%", right: "11%", width: "1.1rem", height: "1rem", "--shape-opacity": 0.13 } as CSSProperties,
  },
  {
    className: "geometry__diamond",
    depth: 0.2,
    style: { top: "12%", left: "43%", width: "0.7rem", height: "0.7rem", "--shape-opacity": 0.1 } as CSSProperties,
  },
  {
    className: "geometry__arc",
    depth: 0.14,
    style: { top: "16%", left: "18%", width: "14rem", height: "14rem", "--shape-opacity": 0.06 } as CSSProperties,
  },
  {
    className: "geometry__arc",
    depth: 0.28,
    style: { bottom: "22%", right: "14%", width: "12rem", height: "12rem", "--shape-opacity": 0.065 } as CSSProperties,
  },
];

export function BackgroundGeometry() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>(".geometry__shape"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduce) {
      return;
    }

    let frame = 0;
    let running = true;
    let pointerX = -9999;
    let pointerY = -9999;
    let scrollY = window.scrollY;
    const state = elements.map(() => ({ x: 0, y: 0 }));
    const bases = elements.map(() => ({ x: 0, y: 0 }));

    function measure() {
      scrollY = window.scrollY;
      for (let index = 0; index < elements.length; index += 1) {
        const element = elements[index];
        bases[index] = {
          x: element.offsetLeft + element.offsetWidth / 2,
          y: element.offsetTop + element.offsetHeight / 2,
        };
      }
    }

    function onPointerMove(event: PointerEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;
    }

    function onScroll() {
      scrollY = window.scrollY;
    }

    function tick() {
      if (!running) return;

      for (let index = 0; index < elements.length; index += 1) {
        const element = elements[index];
        const depth = Number(element.dataset.depth || "0.2");
        const base = bases[index];
        const current = state[index];
        let targetX = 0;
        let targetY = 0;
        let near = false;

        if (finePointer && pointerX > -1000) {
          const dx = base.x - pointerX;
          const dy = base.y - pointerY;
          const distance = Math.hypot(dx, dy);
          if (distance < 160 && distance > 0.01) {
            const strength = 1 - distance / 160;
            targetX = (dx / distance) * 12 * strength;
            targetY = (dy / distance) * 12 * strength;
            near = distance < 90;
          }
        }

        current.x += (targetX - current.x) * 0.08;
        current.y += (targetY - current.y) * 0.08;

        const drift = Math.max(-120, Math.min(120, -scrollY * depth * 0.06));
        element.style.transform = `translate3d(${current.x.toFixed(2)}px, ${(drift + current.y).toFixed(2)}px, 0)`;
        element.style.opacity = near ? "0.14" : "";
      }

      frame = window.requestAnimationFrame(tick);
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = window.requestAnimationFrame(tick);
      }
    }

    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    frame = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={rootRef} className="geometry" aria-hidden="true">
      {shapes.map((shape, index) => {
        const isArc = shape.className === "geometry__arc";
        return (
          <div
            key={index}
            className={`geometry__shape ${shape.className}`}
            data-depth={shape.depth}
            style={shape.style}
          >
            {isArc ? (
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="86" strokeDasharray="2 10" />
                <circle cx="100" cy="100" r="63" strokeDasharray="1 7" opacity="0.7" />
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
