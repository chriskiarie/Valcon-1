"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Container from "@/components/Container";

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
    // Scroll cue handling
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
