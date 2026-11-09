import ClosingCta from "@/components/home/ClosingCta";
import FleetTeaser from "@/components/home/FleetTeaser";
import HomeIntro from "@/components/home/HomeIntro";
import NewestAddition from "@/components/home/NewestAddition";
import ServicesStrip from "@/components/home/ServicesStrip";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeIntro />
      <FleetTeaser />
      <NewestAddition />
      <ServicesStrip />
      <ClosingCta />
    </>
  );
}
