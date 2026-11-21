"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/Container";
import type { Home, Service } from "@/lib/types";
import ServiceZoomModal from "@/components/ServiceZoomModal";

/** Paragraphs split on blank lines; **bold** marks a phrase to emphasise. */
function renderSummary(text: string) {
  return text
    .split(/\n\s*\n/)
    .filter((para) => para.trim())
    .map((para, i) => (
      <p key={i}>
        {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part,
        )}
      </p>
    ));
}

export function ServicesSection({
  services,
  copy,
}: {
  services: Service[];
  copy: Home["services"];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [activeService, setActiveService] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="section services"
      aria-labelledby="services-title"
    >
      <Container>
        <span className="eyebrow" data-reveal="below">
          {copy.eyebrow}
        </span>
        <h2 id="services-title" className="section-title" data-reveal="left">
          {copy.heading}
        </h2>
        <div className="services__grid" style={{ marginTop: "var(--space-8)" }}>
          {services.map((service, index) => (
            <article
              key={service.slug}
              className={`service-card ${revealed ? "is-revealed" : ""}`}
              style={{ transitionDelay: `${index * 120}ms` }}
              data-flyby-avoid
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
              <div className="service-card__summary">{renderSummary(service.summary)}</div>
              {service.bestFor ? (
                <p className="service-card__best">
                  <span className="service-card__best-label">{copy.bestForLabel}</span>
                  {service.bestFor}
                </p>
              ) : null}
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
                <span className="service-zoom-label">{copy.imageButtonLabel}</span>
                <span className="service-zoom-icon">↗</span>
              </button>
              <a className="service-card__quote" href={`/quote/?service=${service.slug}`}>
                {copy.quoteLabel}
                <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
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
