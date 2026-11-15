import { ArrivalBand } from "@/components/ArrivalBand";
import { About } from "@/components/About";
import { ClosingCTA } from "@/components/ClosingCTA";
import { ContactBand } from "@/components/ContactBand";
import { Container } from "@/components/Container";
import { FleetWindow } from "@/components/FleetWindow";
import { FlybySystem } from "@/components/FlybySystem";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { IntroFeature } from "@/components/IntroFeature";
import { ServicesSection } from "@/components/ServicesSection";
import { SocialsCard } from "@/components/SocialsCard";
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
      <HowItWorks />
      <About />
      <ContactBand site={site} copy={home.visit} />
      <div className="final-screen">
        <div className="final-screen__main">
          <Container>
            <ClosingCTA />
            <SocialsCard />
          </Container>
        </div>
        <Footer compact />
      </div>
    </div>
  );
}
