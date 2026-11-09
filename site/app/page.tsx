import { ArrivalBand } from "@/components/ArrivalBand";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Container } from "@/components/Container";
import { FleetExperience } from "@/components/FleetExperience";
import { FlybySystem } from "@/components/FlybySystem";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { IntroFeature } from "@/components/IntroFeature";
import { ServicesSection } from "@/components/ServicesSection";
import { getAircraft, getSite } from "@/lib/content";

export default function Home() {
  const site = getSite();
  const aircraft = getAircraft();

  return (
    <div className="page page--home">
      <Hero />
      <FlybySystem />
      <IntroFeature />
      <FleetExperience aircraft={aircraft} site={site} variant="teaser" />
      <ArrivalBand />
      <ServicesSection />
      <div className="final-screen">
        <div className="final-screen__main">
          <Container>
            <ClosingCTA />
          </Container>
        </div>
        <Footer compact />
      </div>
    </div>
  );
}
