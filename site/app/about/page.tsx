import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { InView } from "@/components/InView";
import { Lines } from "@/components/Lines";
import { NetworkArt, PillarIcon, ServiceIcon, VisionArt } from "@/components/AboutArt";
import about from "@/content/about.json";

export const metadata: Metadata = {
  title: "About",
  description: about.metaDescription,
};

export default function AboutPage() {
  const { vision, approach, services, partnership } = about;

  return (
    <div className="page">
      <section className="interior-hero ab-hero" aria-labelledby="about-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            {about.eyebrow}
          </span>
          <h1 id="about-title" className="interior-hero__title ab-hero__title" data-reveal="left">
            {about.title}
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            {about.lede}
          </p>
        </Container>
      </section>

      <section className="ab-section" aria-labelledby="ab-vision">
        <Container>
          <div className="ab-split">
            <div className="ab-copy">
              <span className="eyebrow" data-reveal="below">
                {vision.eyebrow}
              </span>
              <h2 id="ab-vision" className="section-title" data-reveal="left">
                <Lines text={vision.heading} />
              </h2>
              {vision.paragraphs.map((p) => (
                <p key={p} className="ab-text" data-reveal="below">
                  {p}
                </p>
              ))}
            </div>
            <InView className="ab-art">
              <VisionArt label={vision.artLabel} />
            </InView>
          </div>
        </Container>
      </section>

      <section className="ab-section" aria-labelledby="ab-approach">
        <Container>
          <div className="ab-copy ab-copy--wide">
            <span className="eyebrow" data-reveal="below">
              {approach.eyebrow}
            </span>
            <h2 id="ab-approach" className="section-title" data-reveal="left">
              <Lines text={approach.heading} />
            </h2>
            {approach.paragraphs.map((p) => (
              <p key={p} className="ab-text" data-reveal="below">
                {p}
              </p>
            ))}
          </div>
          <ul className="ab-pillars">
            {approach.pillars.map((pillar) => (
              <li key={pillar.id}>
                <InView className="ab-card">
                  <div className="ab-card__icon ab-card__icon--small">
                    <PillarIcon id={pillar.id} />
                  </div>
                  <h3 className="ab-card__title">{pillar.title}</h3>
                  <p className="ab-card__text">{pillar.text}</p>
                </InView>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="ab-section ab-section--tint" aria-labelledby="ab-services">
        <Container>
          <div className="ab-copy ab-copy--wide">
            <span className="eyebrow" data-reveal="below">
              {services.eyebrow}
            </span>
            <h2 id="ab-services" className="section-title" data-reveal="left">
              <Lines text={services.heading} />
            </h2>
            {services.paragraphs.map((p) => (
              <p key={p} className="ab-text" data-reveal="below">
                {p}
              </p>
            ))}
          </div>
          <ul className="ab-services">
            {services.cards.map((card) => (
              <li key={card.id}>
                <InView className="ab-card ab-card--service">
                  <div className="ab-card__icon">
                    <ServiceIcon id={card.id} />
                  </div>
                  <h3 className="ab-card__title">{card.title}</h3>
                  <p className="ab-card__text">{card.text}</p>
                </InView>
              </li>
            ))}
          </ul>
          <div className="ab-cta-row" data-reveal="below">
            <Button href="/#services" variant="outline">
              {services.linkLabel}
            </Button>
          </div>
        </Container>
      </section>

      <section className="ab-section ab-close" aria-labelledby="ab-partnership">
        <Container>
          <div className="ab-split ab-split--flip">
            <div className="ab-copy">
              <span className="eyebrow" data-reveal="below">
                {partnership.eyebrow}
              </span>
              <h2 id="ab-partnership" className="section-title" data-reveal="left">
                <Lines text={partnership.heading} />
              </h2>
              {partnership.paragraphs.map((p) => (
                <p key={p} className="ab-text" data-reveal="below">
                  {p}
                </p>
              ))}
              <div className="ab-cta-row" data-reveal="below">
                <Button href="/contact/">{partnership.primaryLabel}</Button>
                <Button href="/fleet/" variant="outline">
                  {partnership.secondaryLabel}
                </Button>
              </div>
            </div>
            <InView className="ab-art">
              <NetworkArt />
            </InView>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
