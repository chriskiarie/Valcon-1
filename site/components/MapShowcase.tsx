"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
/** Countries that show a real flag on hover. Flag artwork: flag-icons (MIT), in /public/images/flags. */
const FLAG_CODES = ["ke", "ug", "so", "tz", "et", "ss", "dj"];

export type City = { id: string; name: string; country: string; text: string; image: string; credit?: string; creditUrl?: string };

const INTERVAL = 6000;

/**
 * Wraps the map and a city card that slides through places. The active city is written to
 * `data-active` so the map can highlight its dot with CSS alone. Routes draw in on first view.
 */
export function MapShowcase({ cities, children }: { cities: City[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [flag, setFlag] = useState<{ cc: string; x: number; y: number } | null>(null);

  // Warm the flag files so the first hover pops straight away.
  useEffect(() => {
    for (const code of FLAG_CODES) {
      const img = new window.Image();
      img.src = `/images/flags/${code}.svg`;
    }
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setLive(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live || paused || cities.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % cities.length), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [live, paused, index, cities.length]);

  const active = cities[index];

  return (
    <div
      ref={ref}
      className={`eamap__layout${live ? " is-live" : ""}`}
      data-active={active?.id}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="eamap__stage"
        onMouseOver={(event) => {
          const target = (event.target as Element).closest?.("[data-cc]");
          const cc = target?.getAttribute("data-cc");
          if (!target || !cc || !FLAG_CODES.includes(cc)) {
            setFlag(null);
            return;
          }
          setFlag({ cc, x: Number(target.getAttribute("data-fx")), y: Number(target.getAttribute("data-fy")) });
        }}
        onMouseLeave={() => setFlag(null)}
      >
        {children}
        {flag ? (
          <span key={flag.cc} className="eamap__flag" style={{ left: `${flag.x}%`, top: `${flag.y}%` }} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/flags/${flag.cc}.svg`} alt="" width={72} height={54} decoding="async" />
          </span>
        ) : null}
      </div>

      {cities.length > 0 ? (
        <aside className="eamap__card" aria-label="Places we fly to" aria-live="polite">
          <div className="eamap__slides">
            {cities.map((city, i) => (
              <figure
                key={city.id}
                className={`eamap__slide${i === index ? " is-on" : ""}`}
                aria-hidden={i === index ? undefined : true}
              >
                <div className={`eamap__photo eamap__photo--${(i % 4) + 1}`}>
                  {city.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={city.image} alt={`${city.name}, ${city.country}`} loading="lazy" />
                  ) : (
                    <span className="eamap__photo-name" aria-hidden="true">
                      {city.name}
                    </span>
                  )}
                  {city.credit && city.creditUrl ? (
                    <a
                      className="eamap__credit"
                      href={city.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={i === index ? 0 : -1}
                    >
                      {city.credit}
                    </a>
                  ) : null}
                </div>
                <figcaption>
                  <span className="eamap__country">{city.country}</span>
                  <strong className="eamap__city">{city.name}</strong>
                  <span className="eamap__blurb">{city.text}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="eamap__dots" role="tablist" aria-label="Choose a place">
            {cities.map((city, i) => (
              <button
                key={city.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={city.name}
                className={`eamap__tab${i === index ? " is-on" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
