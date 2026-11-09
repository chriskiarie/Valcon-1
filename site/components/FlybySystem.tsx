"use client";

import { useEffect, useRef, useState } from "react";

const PLANE_IMG = "/images/flyby/5y-val.jpg";

export function FlybySystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLImageElement>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const stateRef = useRef({
    particles: [] as { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number }[],
    running: false,
    rafId: 0,
    lastTime: 0,
    flightActive: false,
    flightStart: 0,
    disposed: false,
    nextTimer: 0,
    lastEmit: 0,
    isMobile: false,
  });

  // Check reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Main animation effect
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const plane = planeRef.current;
    if (!canvas || !plane) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    state.isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Setup canvas
    function resizeCanvas() {
      canvas!.width = Math.round(window.innerWidth * dpr);
      canvas!.height = Math.round(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, 1, 0, 0);
    }
    resizeCanvas();

    // Flight path
    let pathStartX = -300;
    let pathEndX = window.innerWidth + 300;
    let pathStartY = window.innerHeight * 0.3;
    let pathEndY = pathStartY + (Math.random() - 0.5) * window.innerHeight * 0.1;
    let cp1y = pathStartY + (Math.random() - 0.5) * window.innerHeight * 0.06;
    let cp2y = pathEndY + (Math.random() - 0.5) * window.innerHeight * 0.06;

    function bezier(t: number, p0: number, p1: number, p2: number, p3: number) {
      const c = 1 - t;
      return c * c * c * p0 + 3 * c * c * t * p1 + 3 * c * t * t * p2 + t * t * t * p3;
    }

    function bezierTangent(t: number, p0: number, p1: number, p2: number, p3: number) {
      const c = 1 - t;
      return 3 * c * c * (p1 - p0) + 6 * c * t * (p2 - p1) + 3 * t * t * (p3 - p2);
    }

    // Start a flight
    function startFlight() {
      if (state.disposed) return;
      if (state.flightActive) return;
      // Wait for particles to dissolve
      if (state.particles.length > 5) {
        state.nextTimer = window.setTimeout(startFlight, 500);
        return;
      }

      // New random path
      pathStartY = window.innerHeight * (0.2 + Math.random() * 0.2);
      pathEndY = pathStartY + (Math.random() - 0.5) * window.innerHeight * 0.12;
      cp1y = pathStartY + (Math.random() - 0.5) * window.innerHeight * 0.08;
      cp2y = pathEndY + (Math.random() - 0.5) * window.innerHeight * 0.08;
      pathStartX = -300;
      pathEndX = window.innerWidth + 300;

      state.flightActive = true;
      state.flightStart = performance.now();
      state.lastEmit = 0;
      plane!.style.opacity = "1";
      plane!.style.visibility = "visible";
    }

    // Animation tick
    function tick(now: number) {
      if (state.disposed) return;

      const dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      // Clear canvas
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i -= 1) {
        const p = state.particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          state.particles.splice(i, 1);
          continue;
        }
        const t = p.life / p.maxLife;
        const ease = 1 - Math.pow(1 - t, 2);
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.x += (Math.random() - 0.5) * 0.6 * dt * 60;
        p.y += (Math.random() - 0.5) * 0.3 * dt * 60;
        p.size = p.size * (0.4 + (2.4 - 0.4) * ease);
        p.alpha = Math.max(0, 0.7 * (1 - ease) * (1 - t * 0.3));
      }

      // Render particles
      for (const p of state.particles) {
        const size = p.size * 18;
        ctx!.save();
        ctx!.globalAlpha = p.alpha * 0.3;
        ctx!.translate(p.x, p.y);
        const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, size * 0.625);
        grad.addColorStop(0, "rgba(70,95,135,0.5)");
        grad.addColorStop(0.6, "rgba(70,95,135,0.15)");
        grad.addColorStop(1, "rgba(70,95,135,0)");
        ctx!.fillStyle = grad;
        ctx!.fillRect(-size / 2, -size / 2, size, size);
        ctx!.restore();
      }
      for (const p of state.particles) {
        const size = p.size * 18;
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.translate(p.x, p.y);
        const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, size / 2);
        grad.addColorStop(0, "rgba(255,255,255,0.85)");
        grad.addColorStop(0.5, "rgba(255,255,255,0.35)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.fillStyle = grad;
        ctx!.fillRect(-size / 2, -size / 2, size, size);
        ctx!.restore();
      }

      // Flight animation
      if (state.flightActive) {
        const elapsed = (now - state.flightStart) / 1000;
        const t = Math.min(elapsed / 12, 1);

        const x = bezier(t, pathStartX, pathStartX + (pathEndX - pathStartX) * 0.25, pathStartX + (pathEndX - pathStartX) * 0.75, pathEndX);
        const y = bezier(t, pathStartY, cp1y, cp2y, pathEndY);

        const dx = bezierTangent(t, pathStartX, pathStartX + (pathEndX - pathStartX) * 0.25, pathStartX + (pathEndX - pathStartX) * 0.75, pathEndX);
        const dy = bezierTangent(t, pathStartY, cp1y, cp2y, pathEndY);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const bank = Math.sin(t * Math.PI) * 5;
        const scale = 0.9 + (1 - t) * 0.1;

        plane!.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle + bank}deg) scale(${scale})`;
        plane!.style.opacity = "1";
        plane!.style.visibility = "visible";

        // Emit contrail particles
        if (now - state.lastEmit > 50) {
          const rad = (angle + bank) * (Math.PI / 180);
          const tailX = x - Math.cos(rad) * 60 * scale;
          const tailY = y - Math.sin(rad) * 60 * scale;
          const cap = state.isMobile ? 60 : 140;
          if (state.particles.length < cap) {
            const count = state.isMobile ? 1 : 2;
            for (let i = 0; i < count; i += 1) {
              state.particles.push({
                x: tailX + (Math.random() - 0.5) * 4,
                y: tailY + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -(1.5 + Math.random() * 2.5),
                size: 0.4 + Math.random() * 0.6,
                alpha: 0.55 + Math.random() * 0.25,
                life: 0,
                maxLife: 2.6 + Math.random() * 1.2,
              });
            }
          }
          state.lastEmit = now;
        }

        // Flight done
        if (t >= 1) {
          state.flightActive = false;
          plane!.style.opacity = "0";
          plane!.style.visibility = "hidden";

          // Schedule next flight
          const wait = 20000 + Math.random() * 10000; // 20-30s
          state.nextTimer = window.setTimeout(() => {
            startFlight();
          }, wait);
        }
      }

      state.rafId = requestAnimationFrame(tick);
    }

    // Click handler
    function handlePlaneClick(e: MouseEvent) {
      e.stopPropagation();
      if (!state.flightActive) return;
      const rect = plane!.getBoundingClientRect();
      setCardPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setCardVisible(true);
    }

    plane!.addEventListener("click", handlePlaneClick);
    plane!.style.pointerEvents = "auto";
    plane!.style.cursor = "pointer";

    // Visibility change
    function onVisibilityChange() {
      if (document.hidden) {
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      } else {
        state.lastTime = performance.now();
        state.rafId = requestAnimationFrame(tick);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Resize
    function onResize() {
      resizeCanvas();
      state.isMobile = window.innerWidth < 768;
    }
    window.addEventListener("resize", onResize, { passive: true });

    // Start first flight after 1s
    state.nextTimer = window.setTimeout(() => {
      startFlight();
    }, 1000);

    // Start animation loop
    state.lastTime = performance.now();
    state.rafId = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      state.disposed = true;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.nextTimer) clearTimeout(state.nextTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      plane!.removeEventListener("click", handlePlaneClick);
      state.particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [reducedMotion]);

  // Close card on outside click
  useEffect(() => {
    if (!cardVisible) return;
    const handler = () => setCardVisible(false);
    const timer = setTimeout(() => document.addEventListener("click", handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handler);
    };
  }, [cardVisible]);

  if (reducedMotion) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="contrail-canvas"
        aria-hidden="true"
        style={{ zIndex: 5 }}
      />
      <img
        ref={planeRef}
        src={PLANE_IMG}
        alt=""
        draggable={false}
        className="flyby-plane"
        data-active="false"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          width: "clamp(12rem, 22vw, 20rem)",
          height: "auto",
          opacity: 0,
          visibility: "hidden",
          pointerEvents: "auto",
          cursor: "pointer",
          transformOrigin: "50% 50%",
          filter: "drop-shadow(0 8px 16px rgba(11, 22, 38, 0.3))",
        }}
      />

      {cardVisible && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: `${Math.min(cardPos.x, window.innerWidth - 280)}px`,
            top: `${cardPos.y + 20}px`,
            zIndex: 100,
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: "var(--radius-card)",
            padding: "var(--space-6)",
            maxWidth: "260px",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
            animation: "flyby-card-in 0.3s var(--ease-out) forwards",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "var(--text-lg)",
              fontWeight: 500,
              color: "var(--color-ink)",
            }}
          >
            5Y-VAL
          </h3>
          <p
            style={{
              margin: "var(--space-2) 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--color-ink-muted)",
              lineHeight: 1.5,
            }}
          >
            The beginning of Valcon Air.
          </p>
          <p
            style={{
              margin: "var(--space-2) 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--color-ink-muted)",
              lineHeight: 1.5,
            }}
          >
            The first aircraft on the Valcon Air register, based at Wilson Airport, Nairobi.
          </p>
          <a
            href="/fleet/"
            style={{
              display: "inline-block",
              marginTop: "var(--space-4)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            Explore the fleet →
          </a>
        </div>
      )}
    </>
  );
}
