"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { PlaneIllustration } from "@/components/PlaneIllustration";

gsap.registerPlugin(MotionPathPlugin);

type Direction = "ltr" | "rtl";
type FlybyKey = "hero" | "fleet" | "final";

// ── Persistent trail data types ──────────────────────────────────────────────

type RibbonPoint = {
  x: number;
  y: number;
  age: number;
  life: number;
  width: number;
  alpha: number;
  stream: "left" | "right"; // the two sub-streams per engine
};

type Wisp = {
  x: number;
  y: number;
  age: number;
  life: number;
  scale: number;
  alpha: number;
  rotation: number;
  phase: number; // for wisp lateral drift over time
};

// ── Trail renderer ──────────────────────────────────────────────────────────

function renderRibbon(
  ctx: CanvasRenderingContext2D,
  points: RibbonPoint[],
  isDarkBackground: boolean,
  dpr: number
) {
  if (points.length < 2) return;

  // Two sub-streams: points split left/right with age-driven drift
  const leftPoints: RibbonPoint[] = [];
  const rightPoints: RibbonPoint[] = [];

  for (const p of points) {
    const drift = (p.age / p.life) * 6; // max 6 px drift between sub-streams
    if (p.stream === "left") {
      leftPoints.push({ ...p, x: p.x - drift });
    } else {
      rightPoints.push({ ...p, x: p.x + drift });
    }
  }

  // Shade pass colour
  const shadeColor = isDarkBackground
    ? "rgba(69,32,106,0.20)"
    : "rgba(69,32,106,0.12)";

  // Draw left sub-stream
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Width animation: grows 3→28 over life, alpha eases 0.6→0
  function pointWidth(age: number, life: number) {
    const w = 3 + (25 * (age / life)); // 3 to 28
    const a = 0.6 * (1 - age / life); // 0.6 to 0
    return { width: w * dpr, alpha: a };
  }

  // Shade pass
  ctx.strokeStyle = shadeColor;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 3 * dpr; // base, will be overridden per-segment

  for (let i = 1; i < leftPoints.length; i += 1) {
    const p0 = leftPoints[i - 1];
    const p1 = leftPoints[i];
    const w0 = pointWidth(p0.age, p0.life);
    const w1 = pointWidth(p1.age, p1.life);
    ctx.globalAlpha = Math.max(p0.alpha, p1.alpha) * 0.6;
    ctx.lineWidth = (w0.width + w1.width) / 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  // Right sub-stream
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 3 * dpr;

  for (let i = 1; i < rightPoints.length; i += 1) {
    const p0 = rightPoints[i - 1];
    const p1 = rightPoints[i];
    const w0 = pointWidth(p0.age, p0.life);
    const w1 = pointWidth(p1.age, p1.life);
    ctx.globalAlpha = Math.max(p0.alpha, p1.alpha) * 0.6;
    ctx.lineWidth = (w0.width + w1.width) / 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  // White highlight pass (on top)
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5 * dpr;

  // Left highlight
  for (let i = 1; i < leftPoints.length; i += 1) {
    const p0 = leftPoints[i - 1];
    const p1 = leftPoints[i];
    const w0 = pointWidth(p0.age, p0.life);
    const w1 = pointWidth(p1.age, p1.life);
    ctx.globalAlpha = Math.min(p0.alpha, p1.alpha) * 0.4;
    ctx.lineWidth = Math.max(1, (w0.width + w1.width) / 4);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  // Right highlight
  for (let i = 1; i < rightPoints.length; i += 1) {
    const p0 = rightPoints[i - 1];
    const p1 = rightPoints[i];
    const w0 = pointWidth(p0.age, p0.life);
    const w1 = pointWidth(p1.age, p1.life);
    ctx.globalAlpha = Math.min(p0.alpha, p1.alpha) * 0.4;
    ctx.lineWidth = Math.max(1, (w0.width + w1.width) / 4);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  ctx.restore();
}

function renderWisps(
  ctx: CanvasRenderingContext2D,
  wisps: Wisp[],
  dpr: number
) {
  if (wisps.length === 0) return;

  for (const w of wisps) {
    const effectiveScale = w.scale * (1 - w.age / w.life); // fade out
    const effectiveAlpha = w.alpha * (1 - w.age / w.life);
    if (effectiveAlpha < 0.002) continue;

    ctx.save();
    ctx.globalAlpha = effectiveAlpha;
    ctx.translate(w.x, w.y);
    ctx.rotate(w.rotation);
    ctx.scale(effectiveScale * dpr, effectiveScale * dpr);

    // Draw a soft cloud-puff: radial gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveScale * 12);
    gradient.addColorStop(0, `rgba(255,255,255,${effectiveAlpha * 0.8})`);
    gradient.addColorStop(0.5, `rgba(124,116,184,${effectiveAlpha * 0.5})`);
    gradient.addColorStop(1, "rgba(69,32,106,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(-effectiveScale * 6, -effectiveScale * 6, effectiveScale * 12, effectiveScale * 12);
    ctx.restore();
  }
}

// ── Main FlybySystem component ──────────────────────────────────────────────

type TrailState = {
  ribbon: RibbonPoint[][];
  wisps: Wisp[];
  lastFrame: number;
  frameTimes: number[];
};

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
    if (reduce) {
      // Hide plane and clear any active trail
      if (planeMaybe) {
        planeMaybe.style.display = "none";
        planeMaybe.style.opacity = "";
        planeMaybe.style.willChange = "";
      }
      return;
    }

    const contextMaybe = canvasMaybe.getContext("2d");
    if (!contextMaybe) return;

    // Bind const values for inner functions
    const canvas = canvasMaybe;
    const plane = planeMaybe;
    const pathEl = pathMaybe;
    const ctx = contextMaybe;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    ctx.scale(dpr, dpr);

    // Reduced-motion guard already checked above; continue with trail only
    const isDarkBackground =
      getComputedStyle(document.body).getPropertyValue("--color-bg").trim() === "#1e1230";

    // ── Trail state ────────────────────────────────────────────────────────
    let ribbon: RibbonPoint[][] = [[], []]; // [leftEngine, rightEngine]
    let wisps: Wisp[] = [];
    let lastFrame = 0;
    const frameTimes: number[] = [];
    let animationId = 0;
    let running = false;
    let planeHidden = false;
    let activeFlyby: "hero" | "fleet" | "final" | null = null;
    let planeTransform = { x: 0, y: 0, rotation: 0 };
    let engineAnchors = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };

    // ── Engine anchor computation (from plane transform) ─────────────────────
    function computeEngineAnchors() {
      const w = plane.offsetWidth || 200;
      const h = plane.offsetHeight || 80;
      const offsetX = w / 2;
      const offsetY = h / 2;

      // Left engine exhaust (rear fuselage)
      engineAnchors.left = {
        x: planeTransform.x - offsetX * 0.45 + Math.cos(planeTransform.rotation) * 12,
        y: planeTransform.y - offsetY * 0.45 + Math.sin(planeTransform.rotation) * 12,
      };

      // Right engine exhaust
      engineAnchors.right = {
        x: planeTransform.x - offsetX * 0.45 - Math.cos(planeTransform.rotation) * 12,
        y: planeTransform.y - offsetY * 0.45 - Math.sin(planeTransform.rotation) * 12,
      };
    }

    // ── Ribbon point generation ────────────────────────────────────────────
    function generateRibbonPoints(
      engine: "left" | "right",
      maxPoints: number
    ): RibbonPoint[] {
      const cap = 300; // max points per engine
      const anchors = engineAnchors[engine];
      const points: RibbonPoint[] = [];

      // Sample points; each "live" point resides 6 s, travels downward at 180 px/s
      let t = 0;
      const maxT = 6; // seconds of trail visible

      while (t < maxT && points.length < cap) {
        const progress = t / maxT;
        const baseX = anchors.x;
        const baseY = anchors.y + progress * 180;

        // Two sub-streams drift apart with age (0→6 px)
        const streamDrift = (t / maxT) * 6;
        const xLeft = baseX - streamDrift + (Math.random() - 0.5) * 2;
        const xRight = baseX + streamDrift + (Math.random() - 0.5) * 2;
        const y = baseY + (Math.random() - 0.5) * 2;

        // Left stream point
        points.push({
          x: xLeft,
          y,
          age: 0,
          life: 6,
          width: 3,
          alpha: 0.6,
          stream: "left",
        });

        // Right stream point
        points.push({
          x: xRight,
          y,
          age: 0,
          life: 6,
          width: 3,
          alpha: 0.6,
          stream: "right",
        });

        t += 6 / 180; // advance time step (6 px at 180 px/s)
      }

      return points;
    }

    // ── Wisp spawning ───────────────────────────────────────────────────────
    function spawnWisps(engine: "left" | "right") {
      if (wisps.length >= 80) return; // desktop cap
      if (wisps.length >= 36 && window.matchMedia("(max-width: 767px)").matches)
        return; // mobile cap

      // Sample along the ribbon every 24–32 px
      const anchors = engineAnchors[engine];
      // Estimate trail length from anchor positions
      const dx = 0; // engines are side-by-side, trail goes downward
      const dy = 180; // 6 s at 180 px/s
      const trailLength = Math.hypot(dx, dy);

      const sampleCount = Math.max(1, Math.floor(trailLength / 28));
      for (let i = 0; i < sampleCount; i += 1) {
        if (wisps.length >= 80) break;
        if (wisps.length >= 36 && !window.matchMedia("(max-width: 767px)").matches) break;

        const t = (i / sampleCount) * trailLength;
        const offset = (Math.random() - 0.5) * 10; // -5 to +5 px lateral
        // Position behind the engine anchor
        const wx = anchors.x;
        const wy = anchors.y + dy; // down the trail
        const life = 8 + Math.random() * 4; // 8→12 s
        const scale = 0.5 + Math.random() * 1.7; // 0.5→2.2
        const alpha = 0.35 + Math.random() * 0.15; // 0.35→0.5
        const rotation = Math.random() * Math.PI * 2;
        const phase = Math.random() * Math.PI * 2; // for lateral drift over time

        wisps.push({
          x: wx,
          y: wy,
          age: 0,
          life,
          scale,
          alpha,
          rotation,
          phase,
        });
      }
    }

    // ── Animation loop ──────────────────────────────────────────────────────
    function tick(now: number) {
      if (!running) return;

      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;

      // Track frame time for adaptive quality
      frameTimes.push(dt);
      if (frameTimes.length > 20) frameTimes.shift();

      const avgFrameTime =
        frameTimes.reduce((a: number, b: number) => a + b, 0) / frameTimes.length;
      const qualityTooSlow = avgFrameTime > 0.024; // 24 ms

      // Adaptive quality: if too slow, halve wisps, then sample ribbon every 10 px effectively
      if (qualityTooSlow) {
        // Reduce wisp count by half (keep at least 1)
        wisps.length = Math.max(1, Math.ceil(wisps.length / 2));
      }

      // Age and update ribbons
      for (let eng = 0; eng < 2; eng += 1) {
        const points = ribbon[eng];
        for (const p of points) {
          p.age += dt;
        }

        // Remove dead points (age >= life)
        ribbon[eng] = points.filter((p) => p.age < p.life);

        // Spawn fresh points at the rear (age reset) if under cap
        if (points.length < 300) {
          const newPoints = generateRibbonPoints(eng === 0 ? "left" : "right", 300);
          // Interleave: new points at the bottom (oldest), old points above
          ribbon[eng] = [...newPoints, ...points].filter(
            (p, i) => i < 300,
          );
        }
      }

      // Age and update wisps
      for (let i = wisps.length - 1; i >= 0; i -= 1) {
        wisps[i].age += dt;
        if (wisps[i].age >= wisps[i].life) {
          wisps.splice(i, 1);
          continue;
        }

        // Lateral drift over life using phase
        const drift = Math.sin(wisps[i].phase || 0 + wisps[i].age * 0.3) * 0.5;
        wisps[i].x += drift;
        wisps[i].y += 20 * dt; // downward drift
      }

      // Spawn wisps occasionally
      if (Math.random() < 0.03) {
        spawnWisps("left");
        spawnWisps("right");
      }

      // Clear canvas back to origin (viewport coordinates)
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Render ribbons (two-engine, two-pass)
      renderRibbon(ctx, ribbon[0] as RibbonPoint[], isDarkBackground, dpr);
      renderRibbon(ctx, ribbon[1] as RibbonPoint[], isDarkBackground, dpr);

      // Render wisps
      renderWisps(ctx, wisps, dpr);

      animationId = window.requestAnimationFrame(tick);
    }

    // ── Start loop ────────────────────────────────────────────────────────
    function startLoop() {
      if (running || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      animationId = window.requestAnimationFrame(tick);
    }

    function stopLoop() {
      running = false;
      if (animationId) {
        window.cancelAnimationFrame(animationId);
        animationId = 0;
      }
      ribbon = [[], []];
      wisps = [];
    }

    // ── Resize handler ────────────────────────────────────────────────────
    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stopLoop();
        planeHidden = true;
        if (plane) {
          plane.style.display = "none";
          plane.style.opacity = "";
          plane.style.willChange = "";
        }
      }, 150);
    }

    // ── Visibility change ───────────────────────────────────────────────────
    function onVisibilityChange() {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    }

    // ── Compute initial anchors ────────────────────────────────────────────
    computeEngineAnchors();

    // Initial ribbon generation
    ribbon[0] = generateRibbonPoints("left", 300);
    ribbon[1] = generateRibbonPoints("right", 300);

    // Start the loop
    startLoop();

    // Event listeners
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopLoop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (animationId) window.cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [
    canvasRef,
    planeRef,
    pathRef,
  ]);

  return (
    <>
      <canvas ref={canvasRef} className="contrail-canvas" aria-hidden="true" />
      <svg className="flyby-path" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke="none" />
      </svg>
      <div
        ref={planeRef}
        className="flyby-plane"
        data-active="false"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: "0",
          pointerEvents: "none",
          zIndex: 70,
        }}
      >
        <PlaneIllustration className="flyby-plane-svg" />
      </div>
    </>
  );
}