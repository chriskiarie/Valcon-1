"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { getServices } from "@/lib/content";
import ServiceZoomModal from "@/components/ServiceZoomModal";

const REVEAL_VARIANTS = ["left", "right", "below", "pop"] as const;

export function ServicesSection() {
  const services = getServices();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [activeService, setActiveService] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  return (
    <section className="section services" aria-labelledby="services-title">
      <Container>
        <span className="eyebrow" data-reveal="below">
          What we do
        </span>
        <h2 id="services-title" className="section-title" data-reveal="left">
          Services
        </h2>
        <div className="services__grid" style={{ marginTop: "var(--space-8)" }}>
          {services.map((service, index) => {
            const variant = REVEAL_VARIANTS[index % REVEAL_VARIANTS.length];
            return (
              <article
                key={service.slug}
                className="service-card"
                data-reveal={variant}
                style={{ animationDelay: `${index * 90}ms` }}
              >
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
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__summary">{service.summary}</p>
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
              </article>
            );
          })}
        </div>
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
