"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResponsiveImage } from "@/lib/types";

/** How long each photo stays before the next one fades in. Matches --hero-hold in globals.css. */
const HOLD_MS = 7000;

type SlideState = "active" | "leaving" | "idle";

/**
 * Photo background for the home banner. One photo shows as a still image; two or more crossfade slowly.
 * The progress line under the active photo is the timer: when its animation ends, the next photo comes in.
 * That keeps the line and the fade in step, and pausing the line pauses the slideshow.
 */
export function HeroSlideshow({ slides }: { slides: ResponsiveImage[] }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      if (next === active) return;
      setLeaving(active);
      setActive(next);
    },
    [active],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || count < 2) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  const playing = !paused && inView && pageVisible;

  return (
    <>
      <div className="hero__media" ref={rootRef}>
        {slides.map((slide, i) => {
          const state: SlideState = i === active ? "active" : i === leaving ? "leaving" : "idle";
          return (
            <picture
              key={slide.desktop}
              className="hero__slide"
              data-state={state}
              onTransitionEnd={() => {
                if (i === active) setLeaving(null);
              }}
            >
              <source media="(orientation: landscape)" type="image/avif" srcSet={`${slide.desktop}.avif`} />
              <source media="(orientation: landscape)" type="image/webp" srcSet={`${slide.desktop}.webp`} />
              <source media="(orientation: landscape)" type="image/jpeg" srcSet={`${slide.desktop}.jpg`} />
              <source type="image/avif" srcSet={`${slide.mobile}.avif`} />
              <source type="image/webp" srcSet={`${slide.mobile}.webp`} />
              <img
                className="hero__img"
                src={`${slide.mobile}.jpg`}
                alt={i === active ? slide.alt : ""}
                width={900}
                height={1400}
                {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const, fetchPriority: "low" as const })}
                decoding="async"
              />
            </picture>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="hero__controls" data-playing={playing ? "true" : "false"} style={{ ["--hero-hold" as string]: `${HOLD_MS}ms` }}>
          <div className="hero__dots" role="group" aria-label="Banner photos">
            {slides.map((slide, i) => (
              <button
                key={slide.desktop}
                type="button"
                className="hero__dot"
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => go(i)}
              >
                <span className="hero__dot-line">
                  {i === active ? (
                    <span
                      key={active}
                      className="hero__dot-fill"
                      onAnimationEnd={() => go((active + 1) % count)}
                    />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="hero__pause"
            aria-label={paused ? "Play banner slideshow" : "Pause banner slideshow"}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path d="M2.5 1.5h2.6v9H2.5zM6.9 1.5h2.6v9H6.9z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      ) : null}
    </>
  );
}
