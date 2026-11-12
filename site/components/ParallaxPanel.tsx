"use client";

import { useEffect, useRef } from "react";
import type { Home } from "@/lib/types";

export function ParallaxPanel({ image }: { image: Home["intro"]["image"] }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const lineArtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panelMaybe = panelRef.current;
    const mediaMaybe = mediaRef.current;
    const lineArtMaybe = lineArtRef.current;
    if (!panelMaybe || !mediaMaybe || !lineArtMaybe) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Re-bind after the guards so the hoisted helpers below keep the narrowed types.
    const panel = panelMaybe;
    const media = mediaMaybe;
    const lineArt = lineArtMaybe;

    let frame = 0;
    let ticking = false;

    function update() {
      ticking = false;
      const rect = panel.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
      const range = window.matchMedia("(max-width: 767px)").matches ? 0.5 : 1;

      const imageOffset = (progress - 0.5) * rect.height * 0.16 * range;
      const lineOffset = (progress - 0.5) * rect.height * -0.28 * range;
      const rotation = progress * 25;

      media.style.transform = `translate3d(0, ${imageOffset.toFixed(2)}px, 0)`;
      lineArt.style.transform = `translate3d(0, ${lineOffset.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg)`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      media.style.transform = "";
      lineArt.style.transform = "";
    };
  }, []);

  return (
    <div ref={panelRef} className="parallax" data-reveal="right">
      <div ref={mediaRef} className="parallax__media">
        <picture>
          <source media="(min-width: 768px)" type="image/avif" srcSet={`${image.desktop}.avif`} />
          <source media="(min-width: 768px)" type="image/webp" srcSet={`${image.desktop}.webp`} />
          <source type="image/avif" srcSet={`${image.mobile}.avif`} />
          <source type="image/webp" srcSet={`${image.mobile}.webp`} />
          <img
            src={`${image.mobile}.webp`}
            alt={image.alt}
            width={900}
            height={1125}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <div className="parallax__duotone" aria-hidden="true" />
      <div className="parallax__grain" aria-hidden="true" />
      <div ref={lineArtRef} className="parallax__lineart" aria-hidden="true">
        <svg viewBox="0 0 600 750" fill="none">
          <circle cx="300" cy="375" r="250" stroke="currentColor" strokeOpacity="0.45" strokeDasharray="2 10" />
          <circle cx="300" cy="375" r="185" stroke="currentColor" strokeOpacity="0.32" strokeDasharray="1 8" />
          <circle cx="300" cy="375" r="120" stroke="currentColor" strokeOpacity="0.22" />
          <path d="M300 95v34M300 621v34M20 375h34M546 375h34" stroke="currentColor" strokeOpacity="0.55" />
          <path d="M300 155l8 12h-16l8-12ZM300 583l8 12h-16l8-12Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </div>
      {image.caption ? <p className="parallax__caption">{image.caption}</p> : null}
    </div>
  );
}
