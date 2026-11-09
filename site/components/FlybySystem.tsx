"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── Types ──────────────────────────────────────────────────────────────────────

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  driftX: number;
  driftY: number;
};

// ── Particle system (contrail) ────────────────────────────────────────────────

function spawnParticle(
  particles: Particle[],
  x: number,
  y: number,
  isMobile: boolean,
): void {
  const cap = isMobile ? 60 : 140;
  if (particles.length >= cap) return;

  const count = isMobile ? 1 : 2;
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(1.5 + Math.random() * 2.5), // upward drift
      size: 0.4 + Math.random() * 0.6,
      alpha: 0.55 + Math.random() * 0.25,
      life: 0,
      maxLife: 2.6 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: -(0.5 + Math.random() * 1.5),
    });
  }
}

function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.life += dt;
    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }
    const t = p.life / p.maxLife;
    const ease = 1 - Math.pow(1 - t, 2);
    // Position drift
    p.x += p.vx * dt * 60 + p.driftX * dt * 60;
    p.y += p.vy * dt * 60 + p.driftY * dt * 60;
    // Turbulence
    p.x += (Math.random() - 0.5) * 0.8 * dt * 60;
    p.y += (Math.random() - 0.5) * 0.4 * dt * 60;
    // Size grows 0.4→2.4
    p.size = p.size * (0.4 + (2.4 - 0.4) * ease);
    // Alpha fades quadratically
    p.alpha = Math.max(0, (0.75 * (1 - ease)) * (1 - t * 0.3));
    // Rotation
    p.rotation += dt * 0.3;
  }
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  dpr: number,
): void {
  if (particles.length === 0) return;

  // Shade pass (behind)
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    const size = p.size * 18 * 1.25;
    const alpha = p.alpha * 0.3;
    ctx!.save();
    ctx!.globalAlpha = alpha;
    ctx!.translate(p.x, p.y);
    ctx!.rotate(p.rotation);
    const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    grad.addColorStop(0, "rgba(70,95,135,0.5)");
    grad.addColorStop(0.6, "rgba(70,95,135,0.15)");
    grad.addColorStop(1, "rgba(70,95,135,0)");
    ctx!.fillStyle = grad;
    ctx!.fillRect(-size / 2, -size / 2, size, size);
    ctx!.restore();
  }

  // Highlight pass (on top)
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    const size = p.size * 18;
    const alpha = p.alpha;
    ctx!.save();
    ctx!.globalAlpha = alpha;
    ctx!.translate(p.x, p.y);
    ctx!.rotate(p.rotation);
    const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.85)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx!.fillStyle = grad;
    ctx!.fillRect(-size / 2, -size / 2, size, size);
    ctx!.restore();
  }
}

// ── Main component ────────────────────────────────────────────────────────────

const FLIGHT_DURATION = 12; // seconds (10-14 range)
const FLIGHT_INTERVAL = 25; // seconds (20-30 range)
const PLANE_IMG = "/images/flyby/5y-val.jpg";

export function FlybySystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [cardData, setCardData] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Internal mutable state (not React state)
  const stateRef = useRef({
    particles: [] as Particle[],
    running: false,
    rafId: 0,
    lastTime: 0,
    flightActive: false,
    flightStart: 0,
    flightEnd: 0,
    isMobile: false,
    dpr: 1,
    ctx: null as CanvasRenderingContext2D | null,
    disposed: false,
    nextFlightTimer: 0,
    // Contrail emission state
    lastEmit: 0,
    emitInterval: 0.05, // seconds between emissions
  });

  // ── Check reduced motion ──────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Setup canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const plane = planeRef.current;
    if (!canvas || !plane) return;

    const ctx = canvas!.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    state.ctx = ctx;
    state.isMobile = window.innerWidth < 768;
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Resize canvas
    function resizeCanvas() {
      const dpr = state.dpr;
      canvas!.width = Math.round(window.innerWidth * dpr);
      canvas!.height = Math.round(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, 1, 0, 0);
    }
    resizeCanvas();

    // ── Flight path ─────────────────────────────────────────────────────────
    // Straight left to right with slight vertical drift
    function getPathPoints() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const startY = h * (0.25 + Math.random() * 0.2); // upper band
      const endY = startY + (Math.random() - 0.5) * h * 0.15; // slight drift
      const cp1y = startY + (Math.random() - 0.5) * h * 0.08;
      const cp2y = endY + (Math.random() - 0.5) * h * 0.08;
      return { startX: -200, endX: w + 200, startY, endY, cp1y, cp2y };
    }

    function bezier(t: number, p0: number, p1: number, p2: number, p3: number) {
      const c = 1 - t;
      return c * c * c * p0 + 3 * c * c * t * p1 + 3 * c * t * t * p2 + t * t * t * p3;
    }

    function bezierTangent(t: number, p0: number, p1: number, p2: number, p3: number) {
      const c = 1 - t;
      return 3 * c * c * (p1 - p0) + 6 * c * t * (p2 - p1) + 3 * t * t * (p3 - p2);
    }

    let path: ReturnType<typeof getPathPoints> | null = null;

    // ── Animation loop ──────────────────────────────────────────────────────
    function tick(now: number) {
      if (state.disposed) return;

      const dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      // Clear canvas
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Update particles
      updateParticles(state.particles, dt);

      // Render particles (behind plane)
      renderParticles(ctx!, state.particles, state.dpr);

      // Flight animation
      if (state.flightActive && path) {
        const elapsed = (now - state.flightStart) / 1000;
        const t = Math.min(elapsed / FLIGHT_DURATION, 1);

        // Position along path
        const x = bezier(t, path.startX, path.startX + (path.endX - path.startX) * 0.25, path.startX + (path.endX - path.startX) * 0.75, path.endX);
        const y = bezier(t, path.startY, path.cp1y, path.cp2y, path.endY);

        // Tangent angle for banking
        const dx = bezierTangent(t, path.startX, path.startX + (path.endX - path.startX) * 0.25, path.startX + (path.endX - path.startX) * 0.75, path.endX);
        const dy = bezierTangent(t, path.startY, path.cp1y, path.cp2y, path.endY);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Bank angle (max 6°)
        const bank = Math.sin(t * Math.PI) * 6;

        // Scale (slight depth)
        const scale = 0.92 + (1 - t) * 0.08;

        // Update plane position
        plane!.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle + bank}deg) scale(${scale})`;
        plane!.style.opacity = "1";
        plane!.dataset.active = "true";

        // Emit contrail particles from behind the plane
        if (now - state.lastEmit > state.emitInterval * 1000) {
          // Tail position (behind plane, offset by rotation)
          const tailOffset = -80 * scale; // behind the plane
          const rad = (angle + bank) * (Math.PI / 180);
          const tailX = x + Math.cos(rad) * tailOffset;
          const tailY = y + Math.sin(rad) * tailOffset;
          spawnParticle(state.particles, tailX, tailY, state.isMobile);
          state.lastEmit = now;
        }

        // Check if flight is done
        if (t >= 1) {
          state.flightActive = false;
          plane!.style.opacity = "0";
          plane!.dataset.active = "false";
          plane!.style.transform = "none";

          // Schedule next flight after contrail dissolves
          // Wait for particles to clear (max life ~4s) + interval
          const dissolveWait = 4000 + Math.random() * 10000; // 4-14s
          state.nextFlightTimer = window.setTimeout(() => {
            startFlight();
          }, FLIGHT_INTERVAL * 1000 + dissolveWait);
        }
      }

      state.rafId = requestAnimationFrame(tick);
    }

    // ── Start a flight ──────────────────────────────────────────────────────
    function startFlight() {
      if (state.disposed) return;
      if (state.flightActive) return;
      // Wait for contrail to dissolve
      if (state.particles.length > 0) {
        state.nextFlightTimer = window.setTimeout(startFlight, 500);
        return;
      }

      path = getPathPoints();
      state.flightActive = true;
      state.flightStart = performance.now();
      state.lastEmit = 0;
    }

    // ── Click handler on plane ──────────────────────────────────────────────
    function handlePlaneClick(e: MouseEvent) {
      e.stopPropagation();
      if (!state.flightActive) return;
      // Get plane position
      const rect = plane!.getBoundingClientRect();
      setCardData({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setCardVisible(true);
    }

    // ── Click handler to close card ─────────────────────────────────────────
    function handleCardClose() {
      setCardVisible(false);
    }

    // Make plane clickable
    plane!.style.pointerEvents = "auto";
    plane!.style.cursor = "pointer";
    plane!.addEventListener("click", handlePlaneClick);

    // ── Visibility change ────────────────────────────────────────────────────
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

    // ── Resize handler ──────────────────────────────────────────────────────
    function onResize() {
      resizeCanvas();
      state.isMobile = window.innerWidth < 768;
    }
    window.addEventListener("resize", onResize, { passive: true });

    // ── Start first flight ──────────────────────────────────────────────────
    // Initial delay before first flight
    const initialDelay = 1000 + Math.random() * 1000;
    state.nextFlightTimer = window.setTimeout(() => {
      startFlight();
    }, initialDelay);

    // Start animation loop
    state.lastTime = performance.now();
    state.rafId = requestAnimationFrame(tick);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      state.disposed = true;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.nextFlightTimer) clearTimeout(state.nextFlightTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      plane!.removeEventListener("click", handlePlaneClick);
      state.particles = [];
      if (ctx) ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    };
  }, [reducedMotion]);

  // ── Card close on outside click ──────────────────────────────────────────
  useEffect(() => {
    if (!cardVisible) return;
    const handler = () => setCardVisible(false);
    const timer = setTimeout(() => {
      document.addEventListener("click", handler);
    }, 100);
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
      />
      <div
        ref={planeRef}
        className="flyby-plane"
        data-active="false"
        aria-hidden="true"
        style={{
          pointerEvents: "auto",
          cursor: "pointer",
        }}
      >
        <img
          src={PLANE_IMG}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0 8px 16px rgba(11, 22, 38, 0.25))",
          }}
        />
      </div>

      {/* Info card */}
      {cardVisible && (
        <div
          ref={cardRef}
          className="flyby-info-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: `${Math.min(cardData.x, window.innerWidth - 280)}px`,
            top: `${cardData.y + 20}px`,
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
