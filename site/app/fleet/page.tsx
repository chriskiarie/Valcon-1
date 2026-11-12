import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { FleetExperience } from "@/components/FleetExperience";
import { Footer } from "@/components/Footer";
import { getAircraft, getHome, getPages, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fleet",
  description: getPages().fleet.metaDescription,
};

export default function FleetPage() {
  const site = getSite();
  const aircraft = getAircraft();
  const home = getHome();
  const { fleet } = getPages();

  return (
    <div className="page">
      <section className="interior-hero" aria-labelledby="fleet-page-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            {fleet.eyebrow}
          </span>
          <h1 id="fleet-page-title" className="interior-hero__title" data-reveal="left">
            {fleet.title}
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            {fleet.lede}
          </p>
        </Container>
      </section>

      <FleetExperience aircraft={aircraft} site={site} copy={home.fleet} variant="page" />
      <Footer />
    </div>
  );
}
