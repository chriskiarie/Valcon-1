"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type Shape = {
  className: string;
  depth: number;
  style: CSSProperties;
};

const shapes: Shape[] = [
  { className: "geometry__ring", depth: 0.12, style: { top: "6%", right: "-12rem", width: "36rem", height: "36rem", "--shape-opacity": 0.16 } as CSSProperties },
  { className: "geometry__ring", depth: 0.22, style: { top: "48%", left: "-9rem", width: "24rem", height: "24rem", "--shape-opacity": 0.18 } as CSSProperties },
  { className: "geometry__ring geometry__ring--solid", depth: 0.16, style: { bottom: "8%", right: "5%", width: "15rem", height: "15rem", "--shape-opacity": 0.22 } as CSSProperties },
  { className: "geometry__ring geometry__ring--small", depth: 0.38, style: { top: "70%", left: "34%", width: "3.2rem", height: "3.2rem", "--shape-opacity": 0.3 } as CSSProperties },
  { className: "geometry__dots", depth: 0.3, style: { top: "34%", right: "2%", width: "11rem", height: "11rem", "--shape-opacity": 0.22 } as CSSProperties },
  { className: "geometry__dots", depth: 0.18, style: { bottom: "16%", left: "8%", width: "9rem", height: "9rem", "--shape-opacity": 0.2 } as CSSProperties },
  { className: "geometry__triangle", depth: 0.34, style: { top: "25%", left: "6%", width: "1.5rem", height: "1.3rem", "--shape-opacity": 0.32 } as CSSProperties },
  { className: "geometry__triangle", depth: 0.26, style: { top: "62%", right: "11%", width: "1.8rem", height: "1.6rem", "--shape-opacity": 0.28 } as CSSProperties },
  { className: "geometry__triangle", depth: 0.42, style: { top: "84%", left: "52%", width: "1.2rem", height: "1.05rem", "--shape-opacity": 0.26 } as CSSProperties },
  { className: "geometry__diamond", depth: 0.2, style: { top: "12%", left: "43%", width: "1.2rem", height: "1.2rem", "--shape-opacity": 0.3 } as CSSProperties },
  { className: "geometry__diamond geometry__diamond--solid", depth: 0.36, style: { top: "40%", left: "22%", width: "0.9rem", height: "0.9rem", "--shape-opacity": 0.26 } as CSSProperties },
  { className: "geometry__plus", depth: 0.32, style: { top: "18%", right: "22%", width: "1.5rem", height: "1.5rem", "--shape-opacity": 0.3 } as CSSProperties },
  { className: "geometry__plus", depth: 0.24, style: { bottom: "30%", left: "26%", width: "1.2rem", height: "1.2rem", "--shape-opacity": 0.26 } as CSSProperties },
  { className: "geometry__arc", depth: 0.14, style: { top: "16%", left: "18%", width: "14rem", height: "14rem", "--shape-opacity": 0.14 } as CSSProperties },
  { className: "geometry__arc", depth: 0.28, style: { bottom: "22%", right: "14%", width: "12rem", height: "12rem", "--shape-opacity": 0.16 } as CSSProperties },
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
    let lastScrollY = scrollY;
    let scrollVel = 0;
    const RADIUS = 300;
    const PUSH = 58;
    // Each shape is a spring: it is pushed off the pointer, then wobbles back to rest.
    const state = elements.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0, near: 0 }));
    const bases = elements.map(() => ({ x: 0, y: 0 }));
    const spin = elements.map((_, i) => ({ speed: 0.6 + (i % 5) * 0.35, phase: i * 1.7, bob: 5 + (i % 4) * 2.5 }));

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

    // A click sends a ring rippling out and kicks every shape nearby.
    function onPointerDown(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const ripple = document.createElement("span");
      ripple.className = "geometry__ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      root!.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 900);
      for (let index = 0; index < elements.length; index += 1) {
        const dx = bases[index].x - event.clientX;
        const dy = bases[index].y - event.clientY;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < 520) {
          const kick = (1 - distance / 520) * 14;
          state[index].vx += (dx / distance) * kick;
          state[index].vy += (dy / distance) * kick;
          state[index].vrot += kick * 0.8 * (dx > 0 ? 1 : -1);
        }
      }
    }

    let t0 = 0;
    function tick(now: number) {
      if (!running) return;
      if (!t0) t0 = now;
      const time = (now - t0) / 1000;

      scrollVel += ((scrollY - lastScrollY) - scrollVel) * 0.2;
      lastScrollY = scrollY;

      for (let index = 0; index < elements.length; index += 1) {
        const element = elements[index];
        const depth = Number(element.dataset.depth || "0.2");
        const base = bases[index];
        const cur = state[index];
        const idle = spin[index];
        let targetX = 0;
        let targetY = 0;
        let near = 0;

        if (finePointer && pointerX > -1000) {
          const dx = base.x - pointerX;
          const dy = base.y - pointerY;
          const distance = Math.hypot(dx, dy);
          if (distance < RADIUS && distance > 0.01) {
            near = 1 - distance / RADIUS;
            const strength = near * near * (3 - 2 * near);
            targetX = (dx / distance) * PUSH * strength;
            targetY = (dy / distance) * PUSH * strength;
          }
        }

        // Lazy ambient bob so the backdrop is alive even when nothing is touching it.
        const bobY = Math.sin(time * 0.55 * idle.speed + idle.phase) * idle.bob;
        const bobX = Math.cos(time * 0.4 * idle.speed + idle.phase) * idle.bob * 0.6;

        cur.vx += (targetX - cur.x) * 0.06;
        cur.vy += (targetY - cur.y) * 0.06;
        cur.vx *= 0.82;
        cur.vy *= 0.82;
        cur.x += cur.vx;
        cur.y += cur.vy;

        const targetRot = near * ((base.x - pointerX) > 0 ? 38 : -38) + Math.sin(time * 0.25 * idle.speed + idle.phase) * 6;
        cur.vrot += (targetRot - cur.rot) * 0.05;
        cur.vrot *= 0.84;
        cur.rot += cur.vrot;
        cur.near += (near - cur.near) * 0.14;

        const drift = Math.max(-140, Math.min(140, -scrollY * depth * 0.06)) - scrollVel * depth * 3.2;
        const scale = 1 + cur.near * 0.55;
        element.style.transform = `translate3d(${(cur.x + bobX).toFixed(2)}px, ${(drift + cur.y + bobY).toFixed(2)}px, 0) rotate(${cur.rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        element.style.setProperty("--near", cur.near.toFixed(3));
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
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    frame = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
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
            {shape.className.includes("geometry__plus") ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v18M3 12h18" />
              </svg>
            ) : null}
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
