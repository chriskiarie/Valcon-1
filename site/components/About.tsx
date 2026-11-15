import { Container } from "@/components/Container";
import { Lines } from "@/components/Lines";
import { getHome } from "@/lib/content";

/** The company story and values. Stays hidden until the client approves the wording. */
export function About() {
  const { about } = getHome();

  if (!about.show) return null;

  return (
    <section className="section about" aria-labelledby="about-title">
      <Container>
        <div className="about__grid">
          <div>
            <span className="eyebrow" data-reveal="below">
              {about.eyebrow}
            </span>
            <h2 id="about-title" className="section-title" data-reveal="left">
              <Lines text={about.heading} />
            </h2>
            <div className="about__story">
              {about.story.map((paragraph) => (
                <p key={paragraph} data-reveal="below">
                  {paragraph}
                </p>
              ))}
            </div>
            {about.closing ? (
              <p className="about__closing" data-reveal="below">
                {about.closing}
              </p>
            ) : null}
          </div>

          {about.values.length > 0 ? (
            <ul className="about__values">
              {about.values.map((value) => (
                <li key={value.title} className="about__value" data-reveal="below">
                  <h3 className="about__value-title">{value.title}</h3>
                  <p className="about__value-text">{value.text}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
