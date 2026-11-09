"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { PlaneIllustration } from "@/components/PlaneIllustration";

gsap.registerPlugin(MotionPathPlugin);

type Direction = "ltr" | "rtl";
type FlybyKey = "hero" | "fleet" | "final";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  baseSize: number;
  jitter: number;
  phase: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function FlybySystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const canvasMaybe = canvasRef.current;
    const planeMaybe = planeRef.current;
    const pathMaybe = pathRef.current;
    if (!canvasMaybe || !planeMaybe || !pathMaybe) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const contextMaybe = canvasMaybe.getContext("2d");
    if (!contextMaybe) return;

    // Re-bind after the guards so the hoisted helpers below keep the narrowed types.
    const canvas = canvasMaybe;
    const plane = planeMaybe;
    const pathEl = pathMaybe;
    const context2d = contextMaybe;

    const ctx = gsap.context(() => {});
    const particles: Particle[] = [];
    const played = new Set<FlybyKey>();
    const observers: IntersectionObserver[] = [];
    const timeouts: number[] = [];
    let activeTimeline: gsap.core.Timeline | null = null;
    let activeKey: FlybyKey | null = null;
    let raf = 0;
    let running = false;
    let lastTime = 0;
    let cancelled = false;
    let resizeTimer = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let sprite: HTMLCanvasElement | null = null;

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    function makeSprite() {
      const size = 64;
      const offscreen = document.createElement("canvas");
      offscreen.width = size;
      offscreen.height = size;
      const spriteCtx = offscreen.getContext("2d");
      if (!spriteCtx) return offscreen;
      const gradient = spriteCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,0.55)");
      gradient.addColorStop(0.45, "rgba(255,255,255,0.26)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      spriteCtx.fillStyle = gradient;
      spriteCtx.fillRect(0, 0, size, size);
      return offscreen;
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      context2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function stopLoop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }

    function startLoop() {
      if (running || cancelled || document.hidden) return;
      running = true;
      lastTime = performance.now();
      raf = window.requestAnimationFrame(tick);
    }

    function tick(now: number) {
      if (!running || cancelled) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      context2d.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += dt;
        if (particle.age >= particle.life) {
          particles.splice(index, 1);
          continue;
        }

        const progress = particle.age / particle.life;
        particle.x += particle.vx * dt + Math.sin(particle.phase + particle.age * 1.7) * particle.jitter * dt;
        particle.y += particle.vy * dt;

        const size = particle.baseSize * (0.6 + 1.8 * progress);
        const alpha = 0.5 * Math.pow(1 - progress, 2);
        if (sprite && alpha > 0.002) {
          context2d.globalAlpha = alpha;
          context2d.drawImage(sprite, particle.x - size / 2, particle.y - size / 2, size, size);
        }
      }

      context2d.globalAlpha = 1;

      if (particles.length > 0) {
        raf = window.requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function emit(x: number, y: number) {
      const cap = isMobile() ? 60 : 140;
      if (particles.length >= cap) return;
      const count = Math.random() > 0.45 ? 2 : 1;
      for (let index = 0; index < count; index += 1) {
        if (particles.length >= cap) break;
        particles.push({
          x: x + (Math.random() * 2 - 1) * 2,
          y: y + (Math.random() * 2 - 1) * 2,
          vx: (Math.random() * 2 - 1) * 4,
          vy: -(4 + Math.random() * 6),
          age: 0,
          life: 2.6 + Math.random() * 0.8,
          baseSize: 8 + Math.random() * 8,
          jitter: Math.random() * 6,
          phase: Math.random() * Math.PI * 2,
        });
      }
      startLoop();
    }

    function finishFlyby() {
      if (activeTimeline) {
        activeTimeline.kill();
      }
      activeTimeline = null;
      activeKey = null;
      plane.dataset.active = "false";
      plane.style.opacity = "";
      plane.style.willChange = "";
    }

    function buildPath(options: {
      direction: Direction;
      baseAltitude: number;
      curve: number;
      target?: HTMLElement | null;
    }) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const jitter = (Math.random() * 2 - 1) * 0.12;
      const altitude = clamp(options.baseAltitude + jitter, 0.12, 0.8);
      const y = altitude * height;
      const offset = Math.random() * 0.08 * width;
      const startX = options.direction === "ltr" ? -width * 0.18 - offset : width * 1.18 + offset;
      const endX = options.direction === "ltr" ? width * 1.18 + offset : -width * 0.18 - offset;
      const c1x = startX + (endX - startX) * 0.3;
      const c2x = startX + (endX - startX) * 0.7;
      const curve = options.curve * height;
      const c1y = y + curve * 0.55;
      const c2y = y - curve * 0.35;
      let endY = y + curve * 0.12;

      if (options.target) {
        const rect = options.target.getBoundingClientRect();
        endY = clamp(rect.top + rect.height * 0.35, height * 0.32, height * 0.86);
      }

      return `M ${startX.toFixed(1)} ${y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(
        1,
      )} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    }

    function startFlyby(options: {
      key: FlybyKey;
      direction: Direction;
      baseAltitude: number;
      curve: number;
      target?: HTMLElement | null;
    }) {
      if (cancelled || activeKey) {
        played.add(options.key);
        return;
      }
      if (played.has(options.key)) return;
      played.add(options.key);

      const duration = (isMobile() ? 5.8 : 8.2) * (0.85 + Math.random() * 0.3);
      const directionSign = options.direction === "ltr" ? 1 : -1;
      pathEl.setAttribute("d", buildPath(options));
      const startPoint = pathEl.getPointAtLength(0);
      let previous = { x: startPoint.x, y: startPoint.y };

      activeKey = options.key;
      plane.dataset.active = "true";
      plane.style.opacity = "1";
      plane.style.willChange = "transform, opacity";

      ctx.add(() => {
        activeTimeline = gsap.timeline({
          defaults: { ease: "none" },
          onComplete: finishFlyby,
        });

        activeTimeline.to(
          plane,
          {
            duration,
            motionPath: {
              path: pathEl,
              align: pathEl,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
            },
            onUpdate: () => {
              const progress = activeTimeline?.progress() ?? 0;
              const x = Number(gsap.getProperty(plane, "x"));
              const y = Number(gsap.getProperty(plane, "y"));
              const angle = (Math.atan2(y - previous.y, x - previous.x) * 180) / Math.PI;
              const rotation = angle > 90 || angle < -90 ? angle - 180 : angle;
              let scale = 0.92 + 0.08 * progress;
              let opacity = 1;

              if (options.key === "final" && progress > 0.68) {
                const fade = (progress - 0.68) / 0.32;
                scale *= 1 - 0.38 * fade;
                opacity = 1 - fade;
              }

              gsap.set(plane, {
                rotation,
                scaleX: directionSign * scale,
                scaleY: scale,
                opacity,
              });

              const width = plane.offsetWidth;
              const radians = (angle * Math.PI) / 180;
              const tailX = x - Math.cos(radians) * width * 0.44;
              const tailY = y - Math.sin(radians) * width * 0.44;
              const perpendicular = radians + Math.PI / 2;
              const spread = 2.5;

              emit(tailX + Math.cos(perpendicular) * spread, tailY + Math.sin(perpendicular) * spread);
              emit(tailX - Math.cos(perpendicular) * spread, tailY - Math.sin(perpendicular) * spread);
              previous = { x, y };
            },
          },
          0,
        );
      });
    }

    function setupObservers() {
      const heroTimer = window.setTimeout(() => {
        startFlyby({ key: "hero", direction: "ltr", baseAltitude: isMobile() ? 0.2 : 0.22, curve: 0.18 });
      }, 420);
      timeouts.push(heroTimer);

      const fleetTrigger = document.querySelector<HTMLElement>('[data-flyby-trigger="fleet"]');
      if (fleetTrigger) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer.disconnect();
            const rect = fleetTrigger.getBoundingClientRect();
            const altitude = clamp((rect.top - 90) / window.innerHeight, 0.14, 0.44);
            startFlyby({ key: "fleet", direction: "rtl", baseAltitude: altitude, curve: -0.14 });
          },
          { rootMargin: "0px 0px -65% 0px", threshold: 0 },
        );
        observer.observe(fleetTrigger);
        observers.push(observer);
      }

      const finalTrigger = document.querySelector<HTMLElement>('[data-flyby-trigger="final"]');
      if (finalTrigger) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer.disconnect();
            startFlyby({
              key: "final",
              direction: "ltr",
              baseAltitude: 0.18,
              curve: 0.5,
              target: finalTrigger,
            });
          },
          { rootMargin: "0px 0px -28% 0px", threshold: 0 },
        );
        observer.observe(finalTrigger);
        observers.push(observer);
      }
    }

    function onScrollCue() {
      const cue = document.querySelector<HTMLElement>("[data-scroll-cue]");
      if (cue) cue.dataset.hidden = window.scrollY > 24 ? "true" : "false";
    }

    function onVisibility() {
      if (document.hidden) {
        stopLoop();
      } else if (activeKey) {
        startLoop();
      }
    }

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        if (activeKey) finishFlyby();
      }, 220);
    }

    sprite = makeSprite();
    resizeCanvas();
    setupObservers();
    onScrollCue();

    window.addEventListener("scroll", onScrollCue, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("scroll", onScrollCue);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(resizeTimer);
      stopLoop();
      particles.length = 0;
      finishFlyby();
      ctx.revert();
      if (context2d) {
        context2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="contrail-canvas" aria-hidden="true" />
      <svg className="flyby-path" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke="none" />
      </svg>
      <div ref={planeRef} className="flyby-plane" data-active="false" aria-hidden="true">
        <PlaneIllustration />
      </div>
    </>
  );
}
