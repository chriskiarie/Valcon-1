"use client";

import { useEffect, useRef, useState } from "react";
import { getAircraft } from "@/lib/content";

/**
 * FleetRow — Concept B Nightfall fleet cards.
 *
 * Real jet photos (illustrative) in "night cabin window" frames:
 * dark glass, faint warm cabin glow at the edge on hover,
 * reveal animation when card enters view.
 * No readable airline liveries or foreign registrations anywhere.
 * One consistent color grade across the set.
 */
export default function FleetRow({
  onCardClick,
}: {
  onCardClick?: (slug: string) => void;
}) {
  const aircraft = getAircraft();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 },
    );

    aircraft.forEach((item) => {
      const el = document.getElementById(`fleet-card-${item.slug}`);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [aircraft]);

  return (
    <ul className="fleet-row">
      {aircraft.map((item) => {
        const isRevealed = revealed.has(item.slug);
        return (
          <li
            className={`fleet-card ${isRevealed ? "is-revealed" : ""}${
              onCardClick ? " fleet-card-clickable" : ""
            }`}
            id={`fleet-card-${item.slug}`}
            key={item.slug}
            onClick={() => onCardClick?.(item.slug)}
            style={{
              opacity: isRevealed ? 1 : 0,
              transform: isRevealed ? "translateY(0)" : "translateY(20px)",
              cursor: onCardClick ? "pointer" : "default",
            }}
          >
            <div className="fleet-media">
              {item.hero.desktop ? (
                <img
                  src={item.hero.desktop}
                  alt={item.hero.alt}
                  className="fleet-photo"
                />
              ) : null}
              {/* Dark glass night cabin window frame */}
              <div className="fleet-glass" />
              {/* Warm cabin glow at edge on hover */}
              <div className="fleet-cabin-glow" />
              {item.registrations.length > 0 ? (
                <div className="fleet-registration">
                  {item.registrations[0]}
                </div>
              ) : null}
            </div>

            <div className="fleet-body">
              <div className="fleet-header">
                <h3 className="fleet-name">{item.name}</h3>
                <span className="status-pill">
                  {item.isPlaceholder ? "Sample" : "In fleet"}
                </span>
              </div>

              {item.summary ? (
                <p className="fleet-summary">{item.summary}</p>
              ) : null}

              {item.features.length > 0 ? (
                <ul className="fleet-features">
                  {item.features.map((feature) => (
                    <li key={feature} className="feature-item">
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}