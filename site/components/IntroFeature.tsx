import { Container } from "@/components/Container";
import { LoopVideo } from "@/components/LoopVideo";
import { ParallaxPanel } from "@/components/ParallaxPanel";
import { getHome } from "@/lib/content";

/** The second screen. With two clips it is a film band: a clip each side, the statement between. */
export function IntroFeature() {
  const { intro, gallery } = getHome();
  const [left, right] = gallery.videos;

  const copy = (
    <div className="intro__copy">
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
  );

  if (left && right) {
    return (
      <section className="section intro intro--film" aria-labelledby="intro-title" data-glow="dark">
        <Container>
          <div className="intro__film">
            <div className="intro__clip intro__clip--left" data-reveal="below">
              <LoopVideo src={left.src} caption={left.caption} />
            </div>
            {copy}
            <div className="intro__clip intro__clip--right" data-reveal="below">
              <LoopVideo src={right.src} caption={right.caption} />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="section intro" aria-labelledby="intro-title">
      <Container>
        <div className="intro__grid">
          {copy}
          <ParallaxPanel image={intro.image} />
        </div>
      </Container>
    </section>
  );
}
