"use client";

import { useState } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import ServiceZoomModal from "@/components/home/ServiceZoomModal";
import { getServices } from "@/lib/content";

const REVEAL_VARIANTS: Array<"left" | "right" | "below" | "pop"> = [
  "left",
  "right",
  "below",
  "pop",
];

export default function ServicesStrip() {
  const services = getServices();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [activeService, setActiveService] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  return (
    <section className="home-section" aria-label="Services">
      <Container>
        <ul className="services-grid">
          {services.map((service, index) => {
            const variant = REVEAL_VARIANTS[index % REVEAL_VARIANTS.length];
            return (
              <li
                key={service.slug}
                className="service-card-wrapper"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <Reveal variant={variant} className="service-card">
                  <div className="service-media">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="service-image"
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="400"
                    />
                  </div>
                  <h2 className="service-title">{service.title}</h2>
                  <p className="service-copy">
                    {service.summary.replace(/\[placeholder\]/gi, "").trim()}
                  </p>
                </Reveal>
                <button
                  className="service-zoom-btn"
                  onClick={() => {
                    setActiveService({
                      src: service.image,
                      alt: service.title,
                      title: service.title,
                    });
                    setZoomOpen(true);
                  }}
                >
                  <span className="service-zoom-label">Open image</span>
                  <span className="service-zoom-icon">↗</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
      {activeService && (
        <ServiceZoomModal
          isOpen={zoomOpen}
          onClose={() => {
            setZoomOpen(false);
            setActiveService(null);
          }}
          src={activeService.src}
          alt={activeService.alt}
          title={activeService.title}
        />
      )}
    </section>
  );
}
