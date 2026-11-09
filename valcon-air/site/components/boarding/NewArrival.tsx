"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";

/**
 * NewArrival — Section 28 boarding-pass "New arrival" band (Concept B Nightfall).
 *
 * Departure-board motif with split-flap style rows showing:
 *   Registration: 5Y-VAL
 *   Aircraft:     Bombardier CRJ200 LR
 *   Origin:       Calgary
 *   Destination:  Wilson Airport
 *   Status:       Delivered
 *
 * Characters flip once as the band scrolls into view.
 * No times, dates, or other claims.
 * Stacked rows on mobile.
 * Eyebrow contrast ≥ 4.5:1.
 */
export default function NewArrival() {
  const [flipped, setFlipped] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  const rows = [
    { label: "Registration", value: "5Y-VAL" },
    { label: "Aircraft", value: "Bombardier CRJ200 LR" },
    { label: "Origin", value: "Calgary" },
    { label: "Destination", value: "Wilson Airport" },
    { label: "Status", value: "Delivered" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = revealRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !flipped) {
            setFlipped(true);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [flipped]);

  return (
    <section className="home-section" id="new-arrival">
      <Container>
        <Reveal>
          <div ref={revealRef} className="new-arrival-band">
            <p className="eyebrow new-arrival-eyebrow">New arrival</p>
            <div className="new-arrival-board">
              {rows.map((row) => (
                <div key={row.label} className="new-arrival-row">
                  <span className="new-arrival-label">{row.label}</span>
                  <SplitFlap value={row.value} flipped={flipped} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * SplitFlap — single character flipping display.
 */
type SplitFlapProps = {
  value: string;
  flipped: boolean;
};

function SplitFlap({ value, flipped }: SplitFlapProps) {
  return (
    <span className="split-flap">
      {value.split("").map((ch, i) => (
        <span key={i} className="split-flap-char">
          <span className="split-flap-top">{flipped ? ch : " "}</span>
          <span className="split-flap-bottom">{ch}</span>
          <span className="split-flap-front">{ch}</span>
        </span>
      ))}
    </span>
  );
}