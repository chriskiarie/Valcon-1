"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { PLANE_PATH } from "@/lib/plane";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cueRef = useRef<HTMLAnchorElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    // Cursor-reactive light (desktop only)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      setCursorPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    root.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      root.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    let mm: ReturnType<typeof gsap.matchMedia> | undefined;
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions;
          const isDesktop = Boolean(conditions?.isDesktop);
          const isMobile = Boolean(conditions?.isMobile);
          const rm = Boolean(conditions?.reducedMotion);
          const variant = isDesktop ? "desktop" : "mobile";
          const svg = root.querySelector<SVGSVGElement>(
            `.hero-flight--${variant}`,
          );
          const pathEl = svg?.querySelector<SVGPathElement>(".hero-flight-path");
          const planeEl = svg?.querySelector<SVGGElement>(".hero-plane");

          if (!pathEl || !planeEl) {
            return undefined;
          }

          const copyChildren = gsap.utils.toArray<HTMLElement>(
            ".hero-copy > *",
            root,
          );

          if (rm) {
            gsap.set(pathEl, { strokeDashoffset: 0, opacity: 0.35 });
            gsap.set(planeEl, { autoAlpha: 0 });
            // Add simple contrail SVG element
            const existingContrail = root.querySelector(".contrail-svg");
            if (existingContrail) existingContrail.remove();
            return undefined;
          }

          const length = pathEl.getTotalLength();

          gsap.set(pathEl, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
          gsap.set(planeEl, { autoAlpha: 1, willChange: "transform" });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            onComplete: () => gsap.set(planeEl, { willChange: "auto" }),
          });

          tl.from(
            imageRef.current,
            { opacity: 0, scale: 1.06, duration: 1.6 },
            0,
          )
            .to(pathEl, { strokeDashoffset: 0, duration: 2.2 }, 0.3)
            .to(
              planeEl,
              {
                duration: 2.2,
                motionPath: {
                  path: pathEl,
                  align: pathEl,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: true,
                },
              },
              0.3,
            )
            .to(pathEl, { opacity: 0.35, duration: 0.8 }, 2.6)
            .from(copyChildren, { opacity: 0, y: 24, duration: isMobile ? 0.4 : 0.7, stagger: 0.08 }, 0.9);

          // Add flying plane with cloud contrail after the plane animation
          addFlyingPlaneEffect(root, isDesktop, isMobile);
        },
      );

      return () => {
        mm?.revert();
        ctx.revert();
      };
    }, root);

    // Scroll cue handling
    const cue = root.querySelector(".hero-cue");
    if (cue) {
      const onScroll = () => {
        if (window.scrollY > 24) {
          cue.classList.add("is-hidden");
        }
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => window.removeEventListener("scroll", onScroll);
    }

    return undefined;
  }, []);

  useEffect(() => {
    const cue = rootRef.current?.querySelector(".hero-cue");

    if (!cue) {
      return undefined;
    }

    const onScroll = () => {
      if (window.scrollY > 24) {
        cue.classList.add("is-hidden");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="hero on-dark" id="hero" ref={rootRef}>
      <picture className="hero-media">
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero/hero-mobile.avif"
          type="image/avif"
          width="900"
          height="1400"
        />
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero/hero-mobile.webp"
          type="image/webp"
          width="900"
          height="1400"
        />
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero/hero-mobile.jpg"
          type="image/jpeg"
          width="900"
          height="1400"
        />
        <source
          srcSet="/images/hero/hero-desktop.avif"
          type="image/avif"
          width="1920"
          height="1080"
        />
        <source
          srcSet="/images/hero/hero-desktop.webp"
          type="image/webp"
          width="1920"
          height="1080"
        />
        <img
          alt="Valcon Air regional jet fleet"
          className="hero-img"
          decoding="async"
          fetchPriority="high"
          height="1080"
          loading="eager"
          ref={imageRef}
          src="/images/hero/hero-desktop.jpg"
          width="1920"
        />
      </picture>

      <div aria-hidden="true" className="hero-overlay" />
      <div aria-hidden="true" className="hero-text-scrim" />
      <div
        aria-hidden="true"
        className="hero-cursor-light"
        style={{
          left: `${cursorPos.x}%`,
          top: `${cursorPos.y}%`,
        }}
      />

      <canvas
        className="flyby-canvas"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      <svg
        aria-hidden="true"
        className="hero-flight hero-flight--desktop"
        focusable="false"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 810"
      >
        <path
          className="hero-flight-path"
          d={`M -120 640 C 260 660 520 430 820 350 C 1080 280 1300 190 1560 130`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <g className="hero-plane">
          <g transform="scale(0.733333)">
            <path d={PLANE_PATH} fill="currentColor" />
          </g>
        </g>
      </svg>

      <svg
        aria-hidden="true"
        className="hero-flight hero-flight--mobile"
        focusable="false"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 390 844"
      >
        <path
          className="hero-flight-path"
          d={`M -60 600 C 80 600 170 470 260 370 C 320 305 380 250 460 200`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <g className="hero-plane">
          <g transform="scale(0.466667)">
            <path d={PLANE_PATH} fill="currentColor" />
          </g>
        </g>
      </svg>

      <Container className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Wilson Airport, Nairobi</p>
          <h1 className="hero-title">A quieter way to fly.</h1>
          <p className="hero-lede">
            Regional travel from Wilson Airport.
          </p>
          <div className="hero-actions">
            <Button href="/contact/#quote" variant="on-dark">
              Request a Quote
            </Button>
            <Button href="/fleet/" variant="outline">
              View the Fleet
            </Button>
          </div>
        </div>
      </Container>

      <a
        aria-label="Scroll to content"
        className="hero-cue"
        href="#intro"
        ref={cueRef}
      >
        <span aria-hidden="true" className="hero-cue-line" />
        <span className="hero-cue-label">Scroll</span>
      </a>
    </section>
  );
}

/* ============================
   FLYING PLANE WITH CLOUD EFFECT (Section 23 Enhanced)
   ============================ */

// Add flying plane with cloud contrail effect after the plane animation
function addFlyingPlaneEffect(
  root: HTMLElement,
  isDesktop: boolean,
  isMobile: boolean,
) {
  const container = root.querySelector(".hero-inner");
  if (!container) return;

  const width = isDesktop ? 1440 : 360;
  const height = isMobile ? 844 : 900;

  // Create main flight path group
  const flightGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  flightGroup.setAttribute("class", "flying-plane-effect");
  flightGroup.setAttribute("pointer-events", "none");

  // Get the flight path
  const pathEl = root.querySelector<SVGPathElement>(".hero-flight-path");
  if (!pathEl) return;

  const totalLength = pathEl.getTotalLength();

  // Create cloud contrail path
  const contrailPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  contrailPath.setAttribute("stroke", "rgba(255, 255, 255, 0.3)");
  contrailPath.setAttribute("stroke-width", "3");
  contrailPath.setAttribute("stroke-linecap", "round");
  contrailPath.setAttribute("opacity", "0.8");

  // Animation: draw the contrail as the plane flies
  const drawAnim = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate",
  );
  drawAnim.setAttribute("attributeName", "stroke-dashoffset");
  drawAnim.setAttribute("values", `${totalLength}; 0`);
  drawAnim.setAttribute("dur", isDesktop ? "8s" : "5s");
  drawAnim.setAttribute("begin", "0s");
  drawAnim.setAttribute("fill", "freeze");
  contrailPath.appendChild(drawAnim);

  // Fade out the contrail
  const fadeAnim = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate",
  );
  fadeAnim.setAttribute("attributeName", "opacity");
  fadeAnim.setAttribute("values", "0.8; 0");
  fadeAnim.setAttribute("dur", isDesktop ? "2s" : "1.5s");
  fadeAnim.setAttribute("begin", "5s");
  fadeAnim.setAttribute("fill", "freeze");
  contrailPath.appendChild(fadeAnim);

  // Add some cloud puffs along the path
  const cloudCount = isDesktop ? 5 : 3;
  for (let i = 0; i < cloudCount; i++) {
    const cloudX = (totalLength * (i + 1) / (cloudCount + 1)) / totalLength * 100;
    const cloudY = 20 + (Math.random() * 20);
    const cloudD = `
      M ${cloudX} ${cloudY}
      A ${20 + Math.random() * 10} ${10 + Math.random() * 10} 0 1 1 ${40 + Math.random() * 20} 0
      A ${20 + Math.random() * 10} ${10 + Math.random() * 10} 0 1 1 ${cloudX} ${cloudY}
    `;
    const cloud = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cloud.setAttribute("d", cloudD);
    cloud.setAttribute("fill", "rgba(255, 255, 255, 0.4)");
    cloud.setAttribute("opacity", "0.6");
    const cloudAnim = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "animateTransform",
    );
    cloudAnim.setAttribute("attributeName", "transform");
    cloudAnim.setAttribute("type", "translate");
    cloudAnim.setAttribute("dur", isDesktop ? "8s" : "5s");
    cloudAnim.setAttribute("repeatCount", "indefinite");
    cloudAnim.setAttribute("values", `translate(0,0) translate(${20 + Math.random() * 30}px, 0) translate(0,0)`);
    cloud.appendChild(cloudAnim);
    contrailPath.appendChild(cloud);
  }

  // Create the plane icon at the start of the path
  const planeIcon = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  planeIcon.setAttribute("cx", "0");
  planeIcon.setAttribute("cy", "0");
  planeIcon.setAttribute("r", "3");
  planeIcon.setAttribute("fill", "white");
  const planeAnim = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animateMotion",
  );
  planeAnim.setAttribute("dur", isDesktop ? "8s" : "5s");
  planeAnim.setAttribute("repeatCount", "indefinite");
  planeAnim.setAttribute("path", pathEl.getAttribute("d") || "");
  planeIcon.appendChild(planeAnim);

  // Add the plane to the path position animation
  const planeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  planeGroup.appendChild(planeIcon);
  contrailPath.appendChild(planeGroup);

  flightGroup.appendChild(contrailPath);
  container.appendChild(flightGroup);
}