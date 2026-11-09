import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <picture>
          <source media="(min-width: 768px)" type="image/avif" srcSet="/images/hero/hero-desktop.avif" />
          <source media="(min-width: 768px)" type="image/webp" srcSet="/images/hero/hero-desktop.webp" />
          <source media="(min-width: 768px)" type="image/jpeg" srcSet="/images/hero/hero-desktop.jpg" />
          <source type="image/avif" srcSet="/images/hero/hero-mobile.avif" />
          <source type="image/webp" srcSet="/images/hero/hero-mobile.webp" />
          <img
            className="hero__img"
            src="/images/hero/hero-mobile.jpg"
            alt="An aircraft being handled on an airport apron at dusk."
            width={900}
            height={1400}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="hero__overlay" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />

      <Container className="hero__inner">
        <div className="hero__copy">
          <span className="eyebrow">Wilson Airport, Nairobi</span>
          <h1 id="hero-title" className="hero__title">
            Aviation, with a sense of place.
          </h1>
          <p className="hero__support">
            A concept preview for Valcon Air Solutions Limited, an aviation operator based at Wilson
            Airport, Nairobi.
          </p>
          <div className="hero__actions">
            <Button href="/contact/#quote" variant="on-dark">
              Request a quote
            </Button>
            <Button href="/fleet/" variant="on-dark-outline">
              View the fleet
            </Button>
          </div>
        </div>
      </Container>

      <div className="scroll-cue" data-scroll-cue data-hidden="false" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
