import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { GalleryGrid, type GalleryItem } from "@/components/GalleryGrid";
import gallery from "@/content/gallery.json";

export const metadata: Metadata = {
  title: "Jet gallery",
  description: "Photos of 5Y-VAL, Valcon Air's Bombardier CRJ200, from the ground and the air.",
};

export default function GalleryPage() {
  return (
    <div className="page">
      <section className="interior-hero gal-hero" aria-labelledby="gallery-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            5Y-VAL
          </span>
          <h1 id="gallery-title" className="interior-hero__title" data-reveal="left">
            The jet gallery.
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            Our Bombardier CRJ200 at Wilson Airport and above the clouds. More angles and cabin photos are on the way.
          </p>
        </Container>
      </section>

      <section className="gal-wrap" aria-label="Photos of 5Y-VAL">
        <Container>
          <GalleryGrid items={gallery as GalleryItem[]} />
        </Container>
      </section>
      <Footer />
    </div>
  );
}
