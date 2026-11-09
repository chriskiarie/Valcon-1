import type { Metadata } from "next";
import Container from "@/components/Container";
import { getAircraft } from "@/lib/content";

export const metadata: Metadata = {
  title: "Image Credits",
};

export default function CreditsPage() {
  const aircraft = getAircraft();

  return (
    <div className="page-shell">
      <Container>
        <div className="page-intro">
          <p className="eyebrow">Image Credits</p>
          <h1 className="page-title">Image Credits</h1>
          <p className="page-description">
            All images on this site are illustrative placeholder assets until
            client photography is supplied. Credits below.
          </p>
        </div>

        <div className="page-body">
          <div className="credits-section">
            <h2 className="credits-section-title">Hero Photography</h2>
            <p className="credits-entry">
              Sunset at the airfield — Jongsun Lee / Wikimedia Commons,{" "}
              <a href="https://creativecommons.org/licenses/by/3.0" rel="noreferrer" target="_blank">
                CC BY 3.0
              </a>
            </p>
          </div>

          <div className="credits-section">
            <h2 className="credits-section-title">Fleet Aircraft</h2>
            {aircraft.map((a) => (
              <div key={a.slug} className="credits-aircraft">
                <h3 className="credits-aircraft-name">{a.name}</h3>
                <p className="credits-entry">
                  Illustrative placeholder image — to be replaced with client
                  photography.
                </p>
              </div>
            ))}
          </div>

          <div className="credits-section">
            <h2 className="credits-section-title">Flyby Aircraft</h2>
            <p className="credits-entry">
              SVG silhouette placeholders — original Valcon Air demo artwork.
              To be replaced with client photography.
            </p>
          </div>

          <div className="credits-section">
            <h2 className="credits-section-title">Gallery Images</h2>
            <p className="credits-entry">
              SVG placeholder images for cabin and interior views — to be
              replaced with client photography.
            </p>
          </div>

          <div className="credits-section">
            <h2 className="credits-section-title">Typefaces</h2>
            <p className="credits-entry">
              Display: Fraunces (Silvia Ferri Palleschi, Google Fonts,
              SIL Open Font License). Body: DM Sans (Colophon Foundry, Google
              Fonts, SIL Open Font License).
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}