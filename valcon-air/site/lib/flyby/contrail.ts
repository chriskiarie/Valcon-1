/* ============================================================
   Concept B Nightfall — ContrailRenderer
   
   Persistent, attached cloud trail emitted from engine exhaust
   anchors. Uses procedural sprite generation on an offscreen
   canvas. Two render passes: shade sprites first, then highlight
   sprites. Adaptive quality based on frame time budget.
   ============================================================ */

export type TrailAnchor = { x: number; y: number };

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  growth: number;
  tint: "highlight" | "shade";
  offsetX: number;
  offsetY: number;
};

/** Procedural cloud sprite generator on offscreen canvas. */
export class ContrailSpriteGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteSize = 24;

  private highlightSprites: HTMLCanvasElement[] = [];
  private shadeSprites: HTMLCanvasElement[] = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.spriteSize;
    this.canvas.height = this.spriteSize;
    this.ctx = this.canvas.getContext("2d")!;
    this.generateSprites();
  }

  private generateSprites() {
    // 4 cloud-puff variants per tint
    for (let variant = 0; variant < 4; variant += 1) {
      this.highlightSprites.push(this.makeSprite("highlight", variant));
      this.shadeSprites.push(this.makeSprite("shade", variant));
    }
  }

  private makeSprite(tint: "highlight" | "shade", variant: number) {
    const { ctx, spriteSize } = this;
    ctx.clearRect(0, 0, spriteSize, spriteSize);

    const cx = spriteSize / 2;
    const cy = spriteSize / 2;
    const seed = variant * 0.7 + 0.3;

    // 6-9 overlapping radial gradients with random offsets
    const blobCount = 6 + (variant % 4);
    for (let i = 0; i < blobCount; i += 1) {
      const angle = (i / blobCount) * Math.PI * 2 + seed;
      const radius = 4 + (variant % 3) * 3 + Math.sin(i * 2.3) * 6;
      const bx = cx + Math.cos(angle) * (radius * 0.4);
      const by = cy + Math.sin(angle) * (radius * 0.4);
      const br = radius * (0.6 + Math.cos(i * 1.7) * 0.4);

      const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, br);

      if (tint === "highlight") {
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.4)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else {
        // Deep blue shade
        gradient.addColorStop(0, "rgba(20, 40, 80, 0.5)");
        gradient.addColorStop(0.6, "rgba(20, 40, 80, 0.15)");
        gradient.addColorStop(1, "rgba(20, 40, 80, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft low-frequency noise for wispy edges
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    for (let i = 0; i < 3; i += 1) {
      const nx = Math.random() * spriteSize;
      const ny = Math.random() * spriteSize;
      const nr = spriteSize * (0.4 + Math.random() * 0.3);
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      ng.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      ng.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    // Return as an offscreen canvas copy
    const out = document.createElement("canvas");
    out.width = spriteSize;
    out.height = spriteSize;
    out.getContext("2d")!.drawImage(this.canvas, 0, 0);
    return out;
  }

  getHighlightSprite(index: number): HTMLCanvasElement {
    return this.highlightSprites[index % this.highlightSprites.length];
  }

  getShadeSprite(index: number): HTMLCanvasElement {
    return this.shadeSprites[index % this.shadeSprites.length];
  }
}

export class ContrailRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private sprites: ContrailSpriteGenerator;
  private particles: Particle[] = [];
  private ribbon: TrailAnchor[] = [];
  private readonly maxRibbon = 40;
  private frameCount = 0;
  private lastFrameTime = 0;
  private avgFrameTime = 16;
  private adaptiveBudget = true;
  private particleBudget = 140; // desktop default
  private animationId: number | null = null;
  private isRunning = false;

  constructor(canvas: HTMLCanvasElement, isDesktop: boolean) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sprites = new ContrailSpriteGenerator();
    this.particleBudget = isDesktop ? 140 : 60;
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.canvas.style.width = `${this.canvas.offsetWidth}px`;
    this.canvas.style.height = `${this.canvas.offsetHeight}px`;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /** Emit particles from an exhaust anchor. */
  emit(x: number, y: number, index: number) {
    if (!this.isRunning) return;

    const count = Math.random() < 0.7 ? 1 : 2;
    for (let i = 0; i < count; i += 1) {
      const tint: "highlight" | "shade" =
        Math.random() < 0.5 ? "highlight" : "shade";
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -(4 + Math.random() * 6), // upward drift
        size: 0.6 + Math.random() * 0.6,
        alpha: 0,
        life: 0,
        maxLife: 2.6 + Math.random() * 0.8,
        growth: 0.6,
        rotation: Math.random() * Math.PI * 2,
        tint,
        offsetX: (Math.random() - 0.5) * 6,
        offsetY: (Math.random() - 0.5) * 3,
      });
    }

    // Add to ribbon buffer
    this.ribbon.push({ x, y });
    if (this.ribbon.length > this.maxRibbon) {
      this.ribbon.shift();
    }
  }

  private subStepEmit(anchors: TrailAnchor[], prevAnchors: TrailAnchor[]) {
    if (!this.ctx || !this.isRunning) return;

    for (let i = 0; i < anchors.length; i += 1) {
      const curr = anchors[i];
      const prev = prevAnchors[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.ceil(dist / 5);
      if (steps <= 1) {
        this.emit(curr.x, curr.y, i);
        continue;
      }
      // Cap at 40 particles per frame per anchor
      const cappedSteps = Math.min(steps, 40);
      for (let s = 0; s < cappedSteps; s += 1) {
        const t = s / cappedSteps;
        this.emit(prev.x + dx * t, prev.y + dy * t, i);
      }
    }
  }

  private update(dt: number) {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.avgFrameTime = this.avgFrameTime * 0.9 + frameTime * 0.1;

    // Adaptive quality
    if (this.adaptiveBudget) {
      if (this.avgFrameTime > 24) {
        this.particleBudget = Math.max(30, Math.floor(this.particleBudget * 0.5));
      } else if (this.avgFrameTime < 16 && this.particleBudget < 140) {
        this.particleBudget = Math.min(140, Math.floor(this.particleBudget * 1.1));
      }
    }

    const invMaxLife = 1 / 3.4; // approximate
    const surviving: Particle[] = [];

    for (const p of this.particles) {
      p.life += dt;
      if (p.life >= p.maxLife) continue;

      const t = p.life / p.maxLife;

      // Position with drift and jitter
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.x += (Math.random() - 0.5) * 6 * dt * 60;

      // Size grows 0.6x to 2.4x
      const easeT = 1 - Math.pow(1 - t, 2);
      p.size = p.size * (0.6 + (2.4 - 0.6) * easeT);

      // Alpha eases out quadratically from ~0.7 with soft start
      p.alpha = Math.max(0, 0.7 * (1 - easeT) * (1 - t * 0.5));

      p.rotation += dt * 0.5;
      surviving.push(p);
    }

    this.particles = surviving;
    this.frameCount += 1;
  }

  private draw() {
    if (!this.ctx) return;

    const { width, height } = this.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.ctx.clearRect(0, 0, width, height);

    if (this.particles.length === 0 && this.ribbon.length === 0) return;

    // Draw shade sprites first (offset 3px down, 1.25x size)
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      if (p.tint !== "shade") continue;
      const sprite = this.sprites.getShadeSprite(i);
      const size = p.size * 18 * 1.25;
      const alpha = p.alpha * 0.35;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(p.x + p.offsetX + 3, p.y + p.offsetY + 3);
      this.ctx.rotate(p.rotation);
      this.ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      this.ctx.restore();
    }

    // Draw highlight sprites
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      if (p.tint !== "highlight") continue;
      const sprite = this.sprites.getHighlightSprite(i);
      const size = p.size * 18;
      const alpha = p.alpha;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(p.x + p.offsetX, p.y + p.offsetY);
      this.ctx.rotate(p.rotation);
      this.ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      this.ctx.restore();
    }

    // Draw ribbon core behind aircraft
    if (this.ribbon.length > 2) {
      this.ctx.save();
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      for (let i = 1; i < this.ribbon.length; i += 1) {
        const t = i / (this.ribbon.length - 1);
        const width = 2 * (1 - t); // tapered 2px down to 0
        const alpha = 0.5 * (1 - t);
        this.ctx.beginPath();
        this.ctx.moveTo(this.ribbon[i - 1].x, this.ribbon[i - 1].y);
        this.ctx.lineTo(this.ribbon[i].x, this.ribbon[i].y);
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
  }

  private loop() {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.update(dt);
    this.draw();

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    } else {
      this.animationId = null;
    }
  }

  start() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    this.ribbon = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /** Set the engine exhaust anchor positions in viewport coords. */
  setAnchors(anchors: TrailAnchor[]) {
    if (!this.isRunning) return;
    this.subStepEmit(anchors, this.ribbon.slice(-anchors.length) || []);
  }

  resize() {
    this.resizeCanvas();
  }

  getParticleCount() {
    return this.particles.length;
  }
}