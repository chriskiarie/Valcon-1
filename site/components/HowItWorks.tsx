import { Container } from "@/components/Container";
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
          {howItWorks.heading}
        </h2>
        <p className="how__intro" data-reveal="below">
          {howItWorks.intro}
        </p>

        <ol className="how__steps">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="how__step" data-reveal="below">
              <span className="how__num">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="how__step-title">{step.title}</h3>
              <p className="how__step-text">{step.text}</p>
            </li>
          ))}
        </ol>

        {howItWorks.acmiNote ? <p className="how__note">{howItWorks.acmiNote}</p> : null}
      </Container>
    </section>
  );
}
