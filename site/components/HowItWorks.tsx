import { Container } from "@/components/Container";
import { HOW_ART } from "@/components/HowArt";
import { HowTimeline } from "@/components/HowTimeline";
import { Lines } from "@/components/Lines";
import { getHome } from "@/lib/content";

/** The six stages from first message to touchdown. Hidden when switched off in the CMS. */
export function HowItWorks() {
  const { howItWorks } = getHome();

  if (!howItWorks.show || howItWorks.steps.length === 0) return null;

  return (
    <section className="section how" aria-labelledby="how-title">
      <Container>
        <span className="eyebrow" data-reveal="below">
          {howItWorks.eyebrow}
        </span>
        <h2 id="how-title" className="section-title how__title" data-reveal="left">
          <Lines text={howItWorks.heading} />
        </h2>
        <p className="how__intro" data-reveal="below">
          {howItWorks.intro}
        </p>

        <HowTimeline
          steps={howItWorks.steps}
          art={howItWorks.steps.map((step, index) => {
            const Art = HOW_ART[index % HOW_ART.length];
            return <Art key={step.title} />;
          })}
        />

        {howItWorks.acmiNote ? <p className="how__note">{howItWorks.acmiNote}</p> : null}
      </Container>
    </section>
  );
}
