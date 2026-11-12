import { Container } from "@/components/Container";
import { ParallaxPanel } from "@/components/ParallaxPanel";
import { getHome } from "@/lib/content";

export function IntroFeature() {
  const { intro } = getHome();
  return (
    <section className="section intro" aria-labelledby="intro-title">
      <Container>
        <div className="intro__grid">
          <div>
            <span className="eyebrow" data-reveal="left">
              {intro.eyebrow}
            </span>
            <h2 id="intro-title" className="intro__statement" data-reveal="left">
              {intro.statement}
            </h2>
            <p className="intro__support" data-reveal="below">
              {intro.support}
            </p>
          </div>
          <ParallaxPanel image={intro.image} />
        </div>
      </Container>
    </section>
  );
}
