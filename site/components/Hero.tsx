import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { getHome } from "@/lib/content";

export function Hero() {
  const { hero } = getHome();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <picture>
          <source media="(min-width: 768px)" type="image/avif" srcSet={`${hero.image.desktop}.avif`} />
          <source media="(min-width: 768px)" type="image/webp" srcSet={`${hero.image.desktop}.webp`} />
          <source media="(min-width: 768px)" type="image/jpeg" srcSet={`${hero.image.desktop}.jpg`} />
          <source type="image/avif" srcSet={`${hero.image.mobile}.avif`} />
          <source type="image/webp" srcSet={`${hero.image.mobile}.webp`} />
          <img
            className="hero__img"
            src={`${hero.image.mobile}.jpg`}
            alt={hero.image.alt}
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
        <div className="hero__copy" data-flyby-avoid>
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1 id="hero-title" className="hero__title">
            {hero.title}
          </h1>
          <p className="hero__support">{hero.support}</p>
          <div className="hero__actions">
            <Button href="/contact/#quote" variant="on-dark">
              {hero.primaryCta}
            </Button>
            <Button href="/fleet/" variant="on-dark-outline">
              {hero.secondaryCta}
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
