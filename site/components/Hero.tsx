import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { getHome } from "@/lib/content";

export function Hero() {
  const { hero } = getHome();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroSlideshow slides={hero.slides} />
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
            <Button href="/contact/#quote" variant="solid">
              {hero.primaryCta}
            </Button>
            <Button href="/fleet/" variant="outline">
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
