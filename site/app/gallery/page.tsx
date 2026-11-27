import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { GalleryGrid, type GalleryItem } from "@/components/GalleryGrid";
import gallery from "@/content/gallery.json";
import more from "@/content/gallery-more.json";

export const metadata: Metadata = {
  title: "Aircraft gallery",
  description: "Photos of Valcon Air's aircraft: 5Y-VAL, a Bombardier CRJ200 LR, and our Fokker 50.",
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
            Our Bombardier CRJ200 and Fokker 50 at Wilson Airport.
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
              {more.eyebrow ? <span className="eyebrow">{more.eyebrow}</span> : null}
              <h2 className="section-title">{more.title}</h2>
              <p className="gal-group__text">{more.text}</p>
            </header>
            <GalleryGrid
              items={more.items as GalleryItem[]}
            />
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}
