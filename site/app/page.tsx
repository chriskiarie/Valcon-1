import { ArrivalBand } from "@/components/ArrivalBand";
import { ClosingCTA } from "@/components/ClosingCTA";
import { ContactBand } from "@/components/ContactBand";
import { Container } from "@/components/Container";
import { FleetWindow } from "@/components/FleetWindow";
import { FlybySystem } from "@/components/FlybySystem";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { IntroFeature } from "@/components/IntroFeature";
import { ServicesSection } from "@/components/ServicesSection";
import { VideoGallery } from "@/components/VideoGallery";
import { getHome, getServices, getSite } from "@/lib/content";

export default function Home() {
  const site = getSite();
  const home = getHome();
  const services = getServices();

  return (
    <div className="page page--home">
      <Hero />
      <FlybySystem />
      <IntroFeature />
      <FleetWindow copy={home.fleet} />
      <ArrivalBand copy={home.arrival} />
      <VideoGallery copy={home.gallery} />
      <ServicesSection services={services} copy={home.services} />
      <ContactBand site={site} copy={home.visit} />
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
