import { Container } from "@/components/Container";
import { getServices } from "@/lib/content";

export function ServicesSection() {
  const services = getServices();
  const variants = ["left", "pop", "right"] as const;

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
          {services.map((service, index) => (
            <article
              key={service.slug}
              className="service-card"
              data-reveal={variants[index % variants.length]}
            >
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__summary">{service.summary}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
