import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { FleetExperience } from "@/components/FleetExperience";
import { Footer } from "@/components/Footer";
import { getAircraft, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fleet",
  description:
    "The Valcon Air concept fleet page, led by the Bombardier CRJ200 LR registered 5Y-VAL.",
};

export default function FleetPage() {
  const site = getSite();
  const aircraft = getAircraft();

  return (
    <div className="page">
      <section className="interior-hero" aria-labelledby="fleet-page-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            Wilson Airport, Nairobi
          </span>
          <h1 id="fleet-page-title" className="interior-hero__title" data-reveal="left">
            The fleet
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            The first aircraft is a Bombardier CRJ200 LR registered 5Y-VAL. More detail follows as
            the operator confirms it.
          </p>
        </Container>
      </section>

      <FleetExperience aircraft={aircraft} site={site} variant="page" />
      <Footer />
    </div>
  );
}
