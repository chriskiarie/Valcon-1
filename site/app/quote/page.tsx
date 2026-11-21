import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { QuoteForm } from "@/components/QuoteForm";
import { getServices, getSite } from "@/lib/content";
import { hasPhone } from "@/lib/contact";
import quote from "@/content/quote.json";

export const metadata: Metadata = {
  title: "Request a quote",
  description: quote.metaDescription,
};

export default function QuotePage() {
  const site = getSite();
  const services = getServices();

  return (
    <div className="page">
      <section className="fx-stage" aria-labelledby="quote-title">
        <Container>
          <div className="fx-card" data-reveal="below">
            <aside className="fx-card__side">
              <span className="eyebrow eyebrow--on-dark">{quote.eyebrow}</span>
              <h1 id="quote-title" className="fx-card__title">{quote.title}</h1>
              <p className="fx-card__lede">{quote.lede}</p>
              <h2 className="fx-card__steps-title">{quote.stepsTitle}</h2>
              <ol className="fx-steps">
                {quote.steps.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
              <p className="fx-card__talk">
                {quote.talkTitle}{" "}
                {hasPhone(site) ? <a href={`tel:${site.phoneTel}`}>{site.phone}</a> : <Link href="/contact/">Contact us</Link>}
              </p>
            </aside>
            <div className="fx-card__main">
              <QuoteForm site={site} services={services} />
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}
