import { Container } from "@/components/Container";
import { ParallaxPanel } from "@/components/ParallaxPanel";

export function IntroFeature() {
  return (
    <section className="section intro" aria-labelledby="intro-title">
      <Container>
        <div className="intro__grid">
          <div>
            <span className="eyebrow" data-reveal="left">
              The operator
            </span>
            <h2 id="intro-title" className="intro__statement" data-reveal="left">
              A base at Wilson Airport. A first aircraft on the register. A considered way to fly.
            </h2>
            <p className="intro__support" data-reveal="below">
              Valcon Air is based at Wilson Airport, Nairobi. Its first aircraft, a Bombardier CRJ200
              LR registered 5Y-VAL, has recently been delivered.
            </p>
          </div>
          <ParallaxPanel />
        </div>
      </Container>
    </section>
  );
}
