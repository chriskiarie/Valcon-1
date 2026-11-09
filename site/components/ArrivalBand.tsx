"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/Button";

function RoutePlane() {
  return (
    <svg viewBox="0 0 40 18" fill="currentColor" aria-hidden="true">
      <path d="M38 8.6c1.2.2 1.2 1.6 0 1.8l-9.4 1.5-7.3 5.2-2.1-.3 3.7-4.7-8.7.7-3 2-1.7-.3 1.5-2.8-1.5-2.8 1.7-.3 3 2 8.7.7-3.7-4.7 2.1-.3 7.3 5.2L38 8.6Z" />
    </svg>
  );
}

export function ArrivalBand() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          card.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  function openAircraft() {
    window.dispatchEvent(new CustomEvent("valcon:open-aircraft", { detail: "crj200-lr-5y-val" }));
  }

  return (
    <section className="section arrival" aria-labelledby="arrival-title">
      <div className="container">
        <div ref={cardRef} className="arrival__card" data-reveal="below">
          <div className="arrival__rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="arrival__stub">
            <span className="arrival__stub-label">Registration</span>
            <strong className="arrival__reg">5Y-VAL</strong>
          </div>

          <div className="arrival__body">
            <span className="eyebrow">New arrival</span>
            <h2 id="arrival-title" className="arrival__title">
              Bombardier CRJ200 LR
            </h2>
            <p>Delivered to Wilson Airport, Nairobi</p>
            <div className="arrival__route">
              <span>Delivery</span>
              <span className="arrival__track">
                <span className="arrival__route-plane">
                  <RoutePlane />
                </span>
              </span>
              <span>Wilson Airport</span>
            </div>
            <div>
              <Button variant="on-dark" onClick={openAircraft}>
                View the fleet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
