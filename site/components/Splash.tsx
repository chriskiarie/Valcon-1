"use client";

import { useEffect, useRef } from "react";

/**
 * First-visit intro: a frosted-glass screen over the page with a small loader in the middle.
 * When the page is ready the loader pulses, "Welcome aboard" appears, and the frost melts away from many
 * points at once (radial masks growing at different speeds), like ice clearing on a window.
 * Shown once per browser session; skipped for reduced motion. The head script in lib/intro.ts (INTRO_INIT_SCRIPT) decides that
 * (data-intro="on" on <html>); this component runs the sequence and then switches it off.
 */

const MIN_SHOW = 650; // the loader is always visible this long, ms
const MAX_WAIT = 3000; // never wait longer than this for the page, ms
const MELT = 1300; // longest single melt, ms

type Seed = { x: number; y: number; delay: number; dur: number };

function makeSeeds(w: number, h: number): Seed[] {
  // A jittered grid so every part of the screen has a melt point, with random timing so it clears unevenly.
  const cols = w < 700 ? 3 : 5;
  const rows = w < 700 ? 5 : 3;
  const seeds: Seed[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seeds.push({
        x: ((c + 0.15 + Math.random() * 0.7) / cols) * w,
        y: ((r + 0.15 + Math.random() * 0.7) / rows) * h,
        delay: Math.random() * 350,
        dur: 800 + Math.random() * 500,
      });
    }
  }
  return seeds;
}

export function Splash() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frostRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const frost = frostRef.current;
    const bar = barRef.current;
    if (html.dataset.intro !== "on" || !root || !frost || !bar) return;

    try {
      sessionStorage.setItem("valcon-intro", "1");
    } catch {
      /* private mode: it may show again next visit */
    }

    const setProgress = (p: number) => {
      bar.style.transform = `scaleX(${p})`;
    };
    setProgress(0);

    let done = false;
    let raf = 0;
    const timers: number[] = [];
    const t0 = performance.now();
    let pageReady = false;
    let finishing = false;
    let progress = 0;

    const cleanup = () => {
      done = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      delete html.dataset.intro;
    };

    const melt = () => {
      const w = innerWidth;
      const h = innerHeight;
      const seeds = makeSeeds(w, h);
      const reach = Math.hypot(w, h) * 2.2;
      const supported = typeof CSS !== "undefined" && "registerProperty" in CSS;

      root.classList.add("is-melting");
      html.dataset.intro = "melting"; // releases scrolling and clicks while the frost clears

      if (!supported) {
        frost.animate({ opacity: [1, 0] }, { duration: 900, fill: "forwards", easing: "ease-out" });
        timers.push(window.setTimeout(cleanup, 1300));
        return;
      }

      seeds.forEach((_, i) => {
        try {
          (CSS as unknown as { registerProperty: (d: object) => void }).registerProperty({
            name: `--m${i}`,
            syntax: "<length>",
            inherits: false,
            initialValue: "0px",
          });
        } catch {
          /* already registered */
        }
      });

      const layers = seeds.map(
        (s, i) =>
          `radial-gradient(circle at ${s.x.toFixed(0)}px ${s.y.toFixed(0)}px, transparent calc(var(--m${i}) * 0.5), #000 var(--m${i}))`,
      );
      const mask = layers.join(",");
      frost.style.setProperty("mask-image", mask);
      frost.style.setProperty("-webkit-mask-image", mask);
      frost.style.setProperty("mask-composite", "intersect");
      frost.style.setProperty("-webkit-mask-composite", "source-in");

      let last = 0;
      seeds.forEach((s, i) => {
        const a = frost.animate(
          { [`--m${i}`]: ["0px", `${reach}px`] } as unknown as Keyframe[],
          { duration: s.dur, delay: s.delay, easing: "cubic-bezier(0.35, 0, 0.25, 1)", fill: "forwards" },
        );
        last = Math.max(last, s.delay + s.dur);
        void a;
      });
      timers.push(window.setTimeout(cleanup, Math.min(last, MELT + 350) + 200));
    };

    const finish = () => {
      if (finishing || done) return;
      finishing = true;
      cancelAnimationFrame(raf);
      // Fill the ring, then pulse, then let the welcome appear as the frost starts to go.
      const from = progress;
      const start = performance.now();
      const fill = (now: number) => {
        const k = Math.min(1, (now - start) / 200);
        setProgress(from + (1 - from) * k);
        if (k < 1) requestAnimationFrame(fill);
      };
      requestAnimationFrame(fill);
      timers.push(window.setTimeout(() => root.classList.add("is-go"), 220));
      timers.push(window.setTimeout(melt, 560));
    };

    // Smooth, honest-looking progress: eases toward 90% while the page loads, completes when it is ready.
    const tick = (now: number) => {
      if (done || finishing) return;
      const t = now - t0;
      progress = 0.9 * (1 - Math.exp(-t / 380));
      setProgress(progress);
      if (pageReady && t >= MIN_SHOW) finish();
      else if (t >= MAX_WAIT) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const markReady = () => {
      pageReady = true;
    };
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    Promise.all([loaded, fontsReady]).then(markReady, markReady);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="splash" ref={rootRef} aria-hidden="true">
      <div className="splash__frost" ref={frostRef} />
      <div className="splash__core">
        <div className="splash__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="splash__icon" src="/images/brand/valcon-icon.png" alt="" width={414} height={360} decoding="async" />
        </div>
        <span className="splash__line">
          <span className="splash__bar" ref={barRef} />
        </span>
      </div>
      <div className="splash__welcome">
        <p className="splash__hello">Welcome aboard</p>
        <p className="splash__tag">Valcon Air Solutions · Nairobi</p>
      </div>
    </div>
  );
}
