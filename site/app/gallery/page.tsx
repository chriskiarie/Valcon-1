import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { GalleryGrid, type GalleryItem } from "@/components/GalleryGrid";
import { GalleryPlaceholders, type GalleryPlaceholder } from "@/components/GalleryPlaceholders";
import gallery from "@/content/gallery.json";
import more from "@/content/gallery-more.json";

export const metadata: Metadata = {
  title: "Aircraft gallery",
  description: "Photos of Valcon Air's aircraft, starting with 5Y-VAL, a Bombardier CRJ200, from the ground and the air.",
};

export default function GalleryPage() {
  return (
    <div className="page">
      <section className="interior-hero gal-hero" aria-labelledby="gallery-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            Valcon Air
          </span>
          <h1 id="gallery-title" className="interior-hero__title" data-reveal="left">
            The aircraft gallery.
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            Our Bombardier CRJ200 at Wilson Airport and above the clouds. More aircraft and cabin photos are on the way.
          </p>
        </Container>
      </section>

      <section className="gal-wrap" aria-label="Aircraft photos">
        <Container>
          <div className="gal-group">
            <header className="gal-group__head">
              <span className="eyebrow">5Y-VAL</span>
              <h2 className="section-title">Bombardier CRJ200 LR</h2>
            </header>
            <GalleryGrid items={gallery as GalleryItem[]} />
          </div>

          <div className="gal-group">
            <header className="gal-group__head">
              <span className="eyebrow">{more.eyebrow}</span>
              <h2 className="section-title">{more.title}</h2>
              <p className="gal-group__text">{more.text}</p>
            </header>
            <GalleryPlaceholders items={more.placeholders as GalleryPlaceholder[]} />
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}
