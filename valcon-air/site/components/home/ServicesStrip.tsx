"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { getServices } from "@/lib/content";

export default function ServicesStrip() {
  const services = getServices();

  return (
    <section className="home-section" aria-label="Services">
      <Container>
        <Reveal variant="right">
          <ul className="services-grid">
            {services.map((service) => (
              <li className="service-card" key={service.slug}>
                <h2 className="service-title">{service.title}</h2>
                <p className="service-copy">
                  {service.summary.replace(/\[placeholder\]/gi, "").trim()}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}