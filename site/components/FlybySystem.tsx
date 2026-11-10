"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

const PLANE_ASPECT = 185 / 960;
const BASE_PITCH = 10.34;
const TAIL_NAVY = "#0C1B32";
const NEAR_ANCHOR = { x: 0.222, y: 0.72 };
const FAR_ANCHOR = { x: 0.212, y: 0.493 };

const MAX_DPR = 1.5;
const PATH_STEP = 6;
const RIBBON_MS = 800;
const COOLDOWN_MS = 6000;
const MAX_COVERAGE = 0.2;
const DESKTOP_BUDGET = 140;
const MOBILE_BUDGET = 60;
const DESKTOP_EMIT_STEP = 7;
const MOBILE_EMIT_STEP = 10;
const HERO_DELAY_MS = 800;

type Direction = "ltr" | "rtl";
type TriggerKind = "hero" | "fleet" | "departure";
type CardState = { left: number; top: number; width: number };

type PathPoint = { x: number; y: number; climb: number; s: number };
type Point = { x: number; y: number };

type Particle = {
  x0: number;
  y0: number;
  born: number;
  life: number;
  d0: number;
  d1: number;
  sprite: number;
  phase: number;
  jitterAmp: number;
  jitterFreq: number;
  vy: number;
};

type RibbonPoint = { x: number; y: number; t: number };

type Flight = {
  kind: TriggerKind;
  direction: Direction;
  path: PathPoint[];
  length: number;
  planeW: number;
  planeH: number;
  budget: number;
  emitStep: number;
  isMobile: boolean;
  bankAmp: number;
  bankPhase: number;
  progress: { s: number };
  lastEmitS: number;
  tween: gsap.core.Tween | null;
  finished: boolean;
};

type Band = { top: number; bottom: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function collectAvoidRects(vw: number, vh: number) {
  const rects: DOMRect[] = [];
  document.querySelectorAll<HTMLElement>("[data-flyby-avoid]").forEach((element) => {
    if (element.closest(".fleet-modal")) return;
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    if (rect.bottom < 0 || rect.top > vh) return;
    const style = window.getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none") return;
    if (Number.parseFloat(style.opacity) === 0) return;
    rects.push(rect);
  });
  return rects;
}

function mergeRects(rects: DOMRect[], margin: number) {
  const expanded = rects
    .map((rect) => ({
      top: rect.top - margin,
      bottom: rect.bottom + margin,
    }))
    .sort((a, b) => a.top - b.top);

  const merged: Band[] = [];
  for (const rect of expanded) {
    const last = merged[merged.length - 1];
    if (!last || rect.top > last.bottom) {
      merged.push({ top: rect.top, bottom: rect.bottom });
    } else {
      last.bottom = Math.max(last.bottom, rect.bottom);
    }
  }
  return merged;
}

function findBands(
  avoid: DOMRect[],
  minTop: number,
  maxBottom: number,
  minHeight: number,
) {
  const merged = mergeRects(avoid, 16);
  const bands: Band[] = [];
  let cursor = minTop;

  for (const rect of merged) {
    const top = Math.max(minTop, rect.top);
    if (top - cursor >= minHeight) {
      bands.push({ top: cursor, bottom: top });
    }
    cursor = Math.max(cursor, Math.min(maxBottom, rect.bottom));
  }

  if (maxBottom - cursor >= minHeight) {
    bands.push({ top: cursor, bottom: maxBottom });
  }

  return bands;
}

function pickBand(bands: Band[], preferred: number) {
  let best: Band | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const band of bands) {
    const center = (band.top + band.bottom) / 2;
    const distance = Math.abs(center - preferred);
    if (distance < bestDistance) {
      best = band;
      bestDistance = distance;
    }
  }

  return best;
}

function sampleLine(a: Point, b: Point, out: Point[]) {
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const steps = Math.max(1, Math.ceil(distance / 4));
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
}

function sampleQuad(a: Point, control: Point, b: Point, out: Point[]) {
  const steps = 14;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const c = 1 - t;
    out.push({
      x: c * c * a.x + 2 * c * t * control.x + t * t * b.x,
      y: c * c * a.y + 2 * c * t * control.y + t * t * b.y,
    });
  }
}

function resample(raw: Point[]): PathPoint[] {
  if (raw.length < 2) return [];

  const out: PathPoint[] = [];
  let distance = 0;
  let previous = raw[0];
  out.push({ x: previous.x, y: previous.y, climb: 0, s: 0 });

  for (let i = 1; i < raw.length; i += 1) {
    const target = raw[i];
    let dx = target.x - previous.x;
    let dy = target.y - previous.y;
    let gap = Math.hypot(dx, dy);
    if (gap < 1e-6) continue;

    while (gap >= PATH_STEP) {
      const t = PATH_STEP / gap;
      const next = {
        x: previous.x + dx * t,
        y: previous.y + dy * t,
      };
      distance += PATH_STEP;
      out.push({ x: next.x, y: next.y, climb: 0, s: distance });
      previous = next;
      dx = target.x - previous.x;
      dy = target.y - previous.y;
      gap = Math.hypot(dx, dy);
    }
  }

  const final = raw[raw.length - 1];
  const last = out[out.length - 1];
  const tailGap = Math.hypot(final.x - last.x, final.y - last.y);
  if (tailGap > 0.5) {
    distance += tailGap;
    out.push({ x: final.x, y: final.y, climb: 0, s: distance });
  }

  for (let i = 0; i < out.length; i += 1) {
    const a = out[Math.max(0, i - 1)];
    const b = out[Math.min(out.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    out[i].climb = (Math.atan2(-dy, Math.abs(dx)) * 180) / Math.PI;
  }

  return out;
}

function buildPath(start: Point, end: Point, climbDeg: number): PathPoint[] {
  const dx = end.x - start.x;
  const direction = Math.sign(dx) || 1;
  const span = Math.abs(dx);
  const availableRise = Math.max(0, start.y - end.y);
  const climbRad = (climbDeg * Math.PI) / 180;
  const desiredRise = span * Math.tan(climbRad);
  const rise = Math.min(availableRise, desiredRise);
  const climbSpan = Math.max(0, rise / Math.tan(climbRad));
  const levelSpan = Math.max(0, span - climbSpan);
  const raw: Point[] = [];

  const corner = {
    x: start.x + direction * climbSpan,
    y: start.y - rise,
  };

  if (levelSpan < 2 || rise < 2) {
    raw.push(start, end);
  } else {
    const radius = Math.min(70, climbSpan * 0.35, levelSpan * 0.35);
    const cornerIn = {
      x: corner.x - direction * radius * Math.cos(climbRad),
      y: corner.y + radius * Math.sin(climbRad),
    };
    const cornerOut = { x: corner.x + direction * radius, y: corner.y };

    raw.push(start);
    sampleLine(start, cornerIn, raw);
    sampleQuad(cornerIn, corner, cornerOut, raw);
    sampleLine(cornerOut, end, raw);
  }

  return resample(raw);
}

function pointAt(path: PathPoint[], s: number): PathPoint {
  if (path.length === 0) return { x: 0, y: 0, climb: 0, s: 0 };
  if (s <= 0) return path[0];
  if (s >= path[path.length - 1].s) return path[path.length - 1];

  let low = 0;
  let high = path.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (path[mid].s < s) low = mid + 1;
    else high = mid;
  }

  const b = path[low];
  const a = path[Math.max(0, low - 1)];
  const gap = b.s - a.s || 1;
  const t = (s - a.s) / gap;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    climb: a.climb + (b.climb - a.climb) * t,
    s,
  };
}

function anchorPoint(
  cx: number,
  cy: number,
  rotation: number,
  direction: Direction,
  fraction: { x: number; y: number },
  planeW: number,
  planeH: number,
) {
  let ox = (fraction.x - 0.5) * planeW;
  const oy = (fraction.y - 0.5) * planeH;
  if (direction === "rtl") ox = -ox;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cx + ox * cos - oy * sin,
    y: cy + ox * sin + oy * cos,
  };
}

function rotationFor(direction: Direction, climb: number, bank: number) {
  return direction === "rtl"
    ? climb - BASE_PITCH - bank
    : BASE_PITCH - climb + bank;
}

function particleFrame(particle: Particle, now: number) {
  const age = (now - particle.born) / 1000;
  const t = Math.min(1, age / particle.life);
  const growth = 1 - Math.pow(1 - Math.min(1, age / (particle.life * 0.85)), 2);
  const diameter = particle.d0 + (particle.d1 - particle.d0) * growth;
  const jitter =
    Math.sin(particle.phase + age * particle.jitterFreq) *
    particle.jitterAmp *
    Math.min(1, age / 0.6);
  return {
    x: particle.x0 + jitter,
    y: particle.y0 + particle.vy * age,
    diameter,
    t,
  };
}

function highlightAlpha(t: number) {
  if (t < 0.06) return 0.45 * (t / 0.06);
  return 0.45 * Math.pow(1 - (t - 0.06) / 0.94, 2);
}

function coverageOf(particles: Particle[], now: number, vw: number, vh: number) {
  let area = 0;
  for (const particle of particles) {
    const { diameter } = particleFrame(particle, now);
    area += Math.PI * (diameter / 2) * (diameter / 2);
  }
  return area / Math.max(1, vw * vh);
}

function makePuffSprites() {
  const sprites: HTMLCanvasElement[] = [];

  for (let variant = 0; variant < 4; variant += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const base = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    base.addColorStop(0, "rgba(248,252,255,0.98)");
    base.addColorStop(0.4, "rgba(236,245,255,0.64)");
    base.addColorStop(0.74, "rgba(216,230,248,0.22)");
    base.addColorStop(1, "rgba(216,230,248,0)");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 64, 64);

    for (let i = 0; i < 8; i += 1) {
      const x = 17 + Math.random() * 30;
      const y = 17 + Math.random() * 30;
      const radius = 7 + Math.random() * 12;
      const blob = ctx.createRadialGradient(x, y, 0, x, y, radius);
      blob.addColorStop(0, `rgba(255,255,255,${0.22 + Math.random() * 0.14})`);
      blob.addColorStop(0.55, "rgba(240,247,255,0.12)");
      blob.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    sprites.push(canvas);
  }

  return sprites;
}

function makeShadeSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, "rgba(70,95,135,1)");
    gradient.addColorStop(0.55, "rgba(70,95,135,0.55)");
    gradient.addColorStop(1, "rgba(70,95,135,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return canvas;
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  diameter: number,
  alpha: number,
) {
  if (alpha <= 0.002) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, x - diameter / 2, y - diameter / 2, diameter, diameter);
  ctx.globalAlpha = 1;
}

function isVisible(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

export function FlybySystem() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const planeImgRef = useRef<HTMLImageElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [card, setCard] = useState<CardState | null>(null);

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!card) return;
    const onPointerDown = (event: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setCard(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCard(null);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [card]);

  useEffect(() => {
    if (!mounted || reducedMotion) return;

    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    const plane = planeRef.current;
    const planeImg = planeImgRef.current;
    if (!overlay || !canvas || !plane || !planeImg) return;

    const canvasEl = canvas;
    const planeEl = plane;
    const planeImgEl = planeImg;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const debugEnabled =
      new URLSearchParams(window.location.search).get("flybydebug") === "1";
    overlay.dataset.debug = debugEnabled ? "true" : "false";

    if (debugEnabled) {
      (
        window as unknown as {
          __flybyDebug?: { pause: () => void; resume: () => void };
        }
      ).__flybyDebug = {
        pause: () => gsap.ticker.sleep(),
        resume: () => gsap.ticker.wake(),
      };
    }

    let disposed = false;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    const sprites = makePuffSprites();
    const shadeSprite = makeShadeSprite();
    const particles: Particle[] = [];
    const ribbon: RibbonPoint[] = [];

    let flight: Flight | null = null;
    let cooldownUntil = 0;
    let lastTick = performance.now();
    let fps = 60;
    let retryTimer = 0;
    let heroTimer = 0;
    let heroImageTimer = 0;

    const consumed = new Set<TriggerKind>();
    const pending = new Set<TriggerKind>();

    const ctx2d = ctx;

    function resizeCanvas() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvasEl.width = Math.round(vw * dpr);
      canvasEl.height = Math.round(vh * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, vw, vh);
    }

    function clearTrail() {
      particles.length = 0;
      ribbon.length = 0;
      ctx2d.clearRect(0, 0, vw, vh);
    }

    function hidePlane() {
      planeEl.dataset.active = "false";
      setCard(null);
    }

    function resetAll(applyCooldown = true) {
      if (flight) {
        flight.finished = true;
        flight.tween?.kill();
        flight = null;
      }
      clearTrail();
      hidePlane();
      if (applyCooldown) {
        cooldownUntil = performance.now() + COOLDOWN_MS;
        schedulePendingRetry();
      }
    }

    function isModalOpen() {
      return (
        document.body.classList.contains("modal-open") ||
        document.querySelector(".fleet-modal") !== null
      );
    }

    function triggerVisible(kind: TriggerKind) {
      if (kind === "hero") return isVisible(".hero");
      if (kind === "fleet") return isVisible('[data-flyby-trigger="fleet"]');
      return isVisible('[data-flyby-trigger="final"]');
    }

    function headerBottom() {
      const header = document.querySelector<HTMLElement>(".site-header");
      return header ? header.getBoundingClientRect().bottom : 0;
    }

    function makeFlight(kind: TriggerKind): Flight | null {
      const isMobile = vw < 768;
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const baseWidth = isMobile
        ? rand(11, 13) * rem
        : 20 * rem;
      const scale = rand(0.92, 1);
      const planeW = baseWidth * scale;
      const planeH = planeW * PLANE_ASPECT;
      const climbDeg = rand(8, 12);
      const climbRad = (climbDeg * Math.PI) / 180;
      const budget = isMobile ? MOBILE_BUDGET : DESKTOP_BUDGET;
      const emitStep = isMobile ? MOBILE_EMIT_STEP : DESKTOP_EMIT_STEP;
      const direction: Direction = kind === "fleet" ? "rtl" : "ltr";

      const avoid = collectAvoidRects(vw, vh);
      const top = headerBottom() + 16;
      const bottom = vh - 16;
      const minBandHeight = planeH + 32;
      const bands = findBands(avoid, top, bottom, minBandHeight);

      let start: Point;
      let end: Point;

      if (kind === "departure") {
        const action = document.querySelector<HTMLElement>(
          ".closing__actions a, .closing__actions button",
        );
        const actionRect = action?.getBoundingClientRect();
        const preferred =
          actionRect && actionRect.top < vh
            ? actionRect.top
            : vh * 0.72;
        const startBand = pickBand(
          findBands(avoid, top, Math.max(top + 80, preferred - 8), planeH + 48),
          preferred - 120,
        );

        const startY = startBand
          ? startBand.bottom - planeH / 2 - 8
          : Math.min(vh - planeH / 2 - 12, preferred - planeH / 2 - 20);
        const startX = Math.max(
          vw * 0.55,
          actionRect ? actionRect.right + 18 : vw * 0.62,
        );
        const endX = vw + planeW / 2 + 40;
        const span = endX - startX;
        const rise = span * Math.tan(climbRad);
        const endY = startY - rise;

        start = { x: startX, y: startY };
        end = { x: endX, y: endY };
      } else {
        const band = pickBand(
          bands,
          kind === "hero" ? vh * 0.24 : vh * 0.22,
        );

        if (!band) return null;

        const startY = band.bottom - planeH / 2 - 6;
        const endY = band.top + planeH / 2 + 6;
        if (startY - endY < 16) return null;

        const startX = direction === "ltr"
          ? -planeW / 2 - 40
          : vw + planeW / 2 + 40;
        const endX = direction === "ltr"
          ? vw + planeW / 2 + 40
          : -planeW / 2 - 40;

        start = { x: startX, y: startY };
        end = { x: endX, y: endY };
      }

      const path = buildPath(start, end, climbDeg);
      if (path.length < 4) return null;

      return {
        kind,
        direction,
        path,
        length: path[path.length - 1].s,
        planeW,
        planeH,
        budget,
        emitStep,
        isMobile,
        bankAmp: rand(1.2, 3),
        bankPhase: rand(0, Math.PI * 2),
        progress: { s: 0 },
        lastEmitS: 0,
        tween: null,
        finished: false,
      };
    }

    function emitAt(cx: number, cy: number, climb: number, bank: number, now: number) {
      if (!flight) return;

      const coverage = coverageOf(particles, now, vw, vh);
      if (coverage > MAX_COVERAGE) {
        while (
          particles.length > 0 &&
          coverageOf(particles, now, vw, vh) > MAX_COVERAGE
        ) {
          particles.shift();
        }
        if (coverageOf(particles, now, vw, vh) > MAX_COVERAGE) return;
      }

      const rotation = rotationFor(flight.direction, climb, bank);
      const anchor = anchorPoint(
        cx,
        cy,
        rotation,
        flight.direction,
        NEAR_ANCHOR,
        flight.planeW,
        flight.planeH,
      );

      if (particles.length >= flight.budget) particles.shift();
      const life = rand(5.5, 7);
      particles.push({
        x0: anchor.x + rand(-2.5, 2.5),
        y0: anchor.y + rand(-2.5, 2.5),
        born: now,
        life,
        d0: 16,
        d1: (flight.isMobile ? 40 : 56) * rand(0.92, 1.08),
        sprite: Math.floor(Math.random() * sprites.length),
        phase: rand(0, Math.PI * 2),
        jitterAmp: rand(1, 6),
        jitterFreq: rand(1.5, 3.5),
        vy: -rand(4, 10),
      });

      ribbon.push({ x: anchor.x, y: anchor.y, t: now });
    }

    function endFlight(now: number) {
      if (!flight || flight.finished) return;
      flight.finished = true;
      flight.tween?.kill();
      flight = null;
      hidePlane();
      cooldownUntil = now + COOLDOWN_MS;
      schedulePendingRetry();
    }

    function startFlight(kind: TriggerKind) {
      if (disposed || flight) return;
      if (isModalOpen()) return;
      if (performance.now() < cooldownUntil) return;

      const next = makeFlight(kind);
      if (!next) return;

      flight = next;
      setCard(null);

      planeEl.style.width = `${next.planeW}px`;
      planeEl.style.height = `${next.planeH}px`;
      planeImgEl.style.width = "100%";
      planeImgEl.style.height = "100%";
      planeEl.dataset.active = "true";
      planeEl.dataset.direction = next.direction;

      next.tween = gsap.to(next.progress, {
        s: next.length,
        duration: (next.isMobile ? 7 : 9) * rand(0.85, 1.15),
        ease: "none",
        onComplete: () => {
          endFlight(performance.now());
        },
      });
    }

    function requestFlight(kind: TriggerKind) {
      if (consumed.has(kind)) return;
      consumed.add(kind);
      if (isModalOpen()) return;

      if (flight || performance.now() < cooldownUntil) {
        pending.add(kind);
        schedulePendingRetry();
        return;
      }

      if (!triggerVisible(kind)) return;
      startFlight(kind);
    }

    function processPending() {
      retryTimer = 0;
      if (disposed || pending.size === 0) return;

      if (isModalOpen()) {
        pending.clear();
        return;
      }

      const now = performance.now();
      for (const kind of Array.from(pending)) {
        if (!triggerVisible(kind)) {
          pending.delete(kind);
          continue;
        }
        if (flight || now < cooldownUntil) continue;
        pending.delete(kind);
        startFlight(kind);
        break;
      }

      if (pending.size > 0) schedulePendingRetry();
    }

    function schedulePendingRetry() {
      if (retryTimer || pending.size === 0) return;
      retryTimer = window.setTimeout(processPending, 400);
    }

    function renderParticles(now: number) {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        if (now - particles[i].born >= particles[i].life * 1000) {
          particles.splice(i, 1);
        }
      }

      for (const particle of particles) {
        const frame = particleFrame(particle, now);
        drawSprite(
          ctx2d,
          shadeSprite,
          frame.x,
          frame.y + 2,
          frame.diameter * 1.25,
          0.16 * Math.pow(1 - frame.t, 1.4),
        );
      }

      for (const particle of particles) {
        const frame = particleFrame(particle, now);
        drawSprite(
          ctx2d,
          sprites[particle.sprite] || sprites[0],
          frame.x,
          frame.y,
          frame.diameter,
          highlightAlpha(frame.t),
        );
      }
    }

    function renderRibbon(now: number) {
      ctx2d.lineCap = "round";

      while (ribbon.length > 0 && now - ribbon[0].t > RIBBON_MS * 1.5) {
        ribbon.shift();
      }

      for (let i = 1; i < ribbon.length; i += 1) {
        const a = ribbon[i - 1];
        const b = ribbon[i];
        const fade = Math.max(0, 1 - (now - b.t) / RIBBON_MS);
        if (fade <= 0) continue;

        ctx2d.strokeStyle = `rgba(70,95,135,${0.12 * fade})`;
        ctx2d.lineWidth = 1 + 2 * fade;
        ctx2d.beginPath();
        ctx2d.moveTo(a.x, a.y);
        ctx2d.lineTo(b.x, b.y);
        ctx2d.stroke();

        ctx2d.strokeStyle = `rgba(255,255,255,${0.4 * fade})`;
        ctx2d.lineWidth = 0.6 + 1.4 * fade;
        ctx2d.beginPath();
        ctx2d.moveTo(a.x, a.y);
        ctx2d.lineTo(b.x, b.y);
        ctx2d.stroke();
      }

      ctx2d.lineWidth = 1;
    }

    function updateDebug(coverage: number) {
      if (!debugRef.current) return;
      debugRef.current.textContent = [
        `FPS ${fps.toFixed(0)}`,
        `particles ${particles.length}/${flight ? flight.budget : 0}`,
        `coverage ${(coverage * 100).toFixed(1)}%`,
        `flight ${flight ? flight.kind : "—"}`,
        `pitch ${BASE_PITCH.toFixed(2)}°`,
        `tail ${TAIL_NAVY}`,
        `anchors ${NEAR_ANCHOR.x},${NEAR_ANCHOR.y} / ${FAR_ANCHOR.x},${FAR_ANCHOR.y}`,
      ].join("\n");
    }

    function tick() {
      if (disposed) return;

      const now = performance.now();
      const delta = Math.max(1, now - lastTick);
      lastTick = now;
      fps = fps * 0.9 + (1000 / delta) * 0.1;

      ctx2d.clearRect(0, 0, vw, vh);

      if (flight) {
        if (isModalOpen()) {
          resetAll(true);
        } else {
          const s = Math.min(flight.progress.s, flight.length);
          const point = pointAt(flight.path, s);
          const progress = flight.length > 0 ? s / flight.length : 1;
          const bank =
            Math.sin(progress * Math.PI * 2 + flight.bankPhase) * flight.bankAmp;
          const rotation = rotationFor(flight.direction, point.climb, bank);

          planeEl.style.transform = `translate3d(${point.x - flight.planeW / 2}px, ${
            point.y - flight.planeH / 2
          }px, 0) rotate(${rotation}deg) scaleX(${
            flight.direction === "rtl" ? -1 : 1
          })`;

          while (s - flight.lastEmitS >= flight.emitStep) {
            flight.lastEmitS += flight.emitStep;
            const emitPoint = pointAt(flight.path, flight.lastEmitS);
            const emitProgress =
              flight.length > 0 ? flight.lastEmitS / flight.length : 1;
            const emitBank =
              Math.sin(emitProgress * Math.PI * 2 + flight.bankPhase) *
              flight.bankAmp;
            emitAt(emitPoint.x, emitPoint.y, emitPoint.climb, emitBank, now);
          }

          if (flight.progress.s >= flight.length) {
            endFlight(now);
          }
        }
      }

      renderParticles(now);
      renderRibbon(now);

      const coverage = coverageOf(particles, now, vw, vh);
      updateDebug(coverage);
    }

    function onPlaneClick(event: MouseEvent) {
      event.stopPropagation();
      if (!flight) return;

      const rect = planeEl.getBoundingClientRect();
      const cardWidth = Math.min(260, vw - 24);
      const cardHeight = 178;
      const header = headerBottom();
      const actionBar = document.querySelector<HTMLElement>(".action-bar");
      const actionBarHeight = actionBar ? actionBar.getBoundingClientRect().height : 0;

      let left = rect.left + rect.width / 2 - cardWidth / 2;
      let top = rect.bottom + 12;
      if (top + cardHeight > vh - actionBarHeight - 12) {
        top = rect.top - cardHeight - 12;
      }

      left = clamp(left, 12, vw - cardWidth - 12);
      top = clamp(top, header + 12, vh - cardHeight - actionBarHeight - 12);
      setCard({ left, top, width: cardWidth });
    }

    function onResize() {
      resetAll(true);
      resizeCanvas();
    }

    function onVisibilityChange() {
      if (document.hidden) resetAll(true);
    }

    function onPopState() {
      resetAll(true);
    }

    function onHeroReady() {
      if (disposed) return;
      heroTimer = window.setTimeout(() => {
        if (disposed) return;
        if (!isVisible(".hero")) {
          consumed.add("hero");
          return;
        }
        requestFlight("hero");
      }, HERO_DELAY_MS);
    }

    const heroImage = document.querySelector<HTMLImageElement>(".hero__img");
    const startHero = () => {
      if (disposed) return;
      window.clearTimeout(heroImageTimer);
      if (heroImage?.decode) {
        heroImage.decode().catch(() => undefined).finally(onHeroReady);
      } else {
        onHeroReady();
      }
    };

    if (heroImage) {
      if (heroImage.complete) {
        startHero();
      } else {
        heroImage.addEventListener("load", startHero, { once: true });
        heroImageTimer = window.setTimeout(startHero, 2500);
      }
    } else {
      onHeroReady();
    }

    const fleetTrigger = document.querySelector('[data-flyby-trigger="fleet"]');
    const finalTrigger = document.querySelector('[data-flyby-trigger="final"]');

    const fleetObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          requestFlight("fleet");
          fleetObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.3 },
    );

    const finalObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          requestFlight("departure");
          finalObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.25 },
    );

    if (fleetTrigger) fleetObserver.observe(fleetTrigger);
    if (finalTrigger) finalObserver.observe(finalTrigger);

    planeEl.addEventListener("click", onPlaneClick);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    window.addEventListener("popstate", onPopState);
    document.addEventListener("visibilitychange", onVisibilityChange);

    resizeCanvas();
    lastTick = performance.now();
    gsap.ticker.add(tick);

    const context = gsap.context(() => undefined);

    return () => {
      disposed = true;
      context.revert();
      gsap.ticker.remove(tick);
      window.clearTimeout(retryTimer);
      window.clearTimeout(heroTimer);
      window.clearTimeout(heroImageTimer);
      if (flight) {
        flight.tween?.kill();
        flight = null;
      }
      fleetObserver.disconnect();
      finalObserver.disconnect();
      planeEl.removeEventListener("click", onPlaneClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      heroImage?.removeEventListener("load", startHero);
      clearTrail();
      planeEl.dataset.active = "false";
      planeEl.style.transform = "";
      if (debugEnabled) {
        delete (
          window as unknown as { __flybyDebug?: unknown }
        ).__flybyDebug;
      }
    };
  }, [mounted, reducedMotion]);

  if (!mounted || reducedMotion) return null;

  return createPortal(
    <>
      <div ref={overlayRef} className="flyby-overlay" aria-hidden="true">
        <canvas ref={canvasRef} className="flyby-canvas" />
        <div ref={planeRef} className="flyby-plane" data-active="false">
          <img
            ref={planeImgRef}
            className="flyby-plane__img"
            src="/images/flyby/5y-val-960.webp"
            srcSet="/images/flyby/5y-val-480.webp 480w, /images/flyby/5y-val-960.webp 960w"
            sizes="(max-width: 767px) 208px, 320px"
            alt=""
            draggable={false}
            decoding="async"
          />
          <span className="flyby-anchor flyby-anchor--near" />
          <span className="flyby-anchor flyby-anchor--far" />
        </div>
        <div ref={debugRef} className="flyby-debug" />
      </div>

      {card ? (
        <div
          ref={cardRef}
          className="flyby-card"
          style={{ left: card.left, top: card.top, width: card.width }}
          role="dialog"
          aria-label="5Y-VAL aircraft details"
        >
          <button
            type="button"
            className="flyby-card__close"
            aria-label="Close aircraft details"
            onClick={() => setCard(null)}
          >
            ×
          </button>
          <span className="flyby-card__eyebrow">In fleet</span>
          <strong className="flyby-card__title">5Y-VAL</strong>
          <span className="flyby-card__subtitle">Bombardier CRJ200 LR</span>
          <p className="flyby-card__copy">
            Recently delivered to Wilson Airport, Nairobi.
          </p>
          <a
            className="flyby-card__link"
            href="#fleet-crj200-lr-5y-val"
            onClick={(event) => {
              event.preventDefault();
              window.dispatchEvent(
                new CustomEvent("valcon:open-aircraft", {
                  detail: "crj200-lr-5y-val",
                }),
              );
              setCard(null);
            }}
          >
            View in fleet
          </a>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
