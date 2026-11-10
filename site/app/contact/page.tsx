import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { getSite } from "@/lib/content";
import type { Site } from "@/lib/types";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact page for the Valcon Air concept preview. Direct contact details are being confirmed.",
};

export default function ContactPage() {
  const site = getSite() as Site;

  return (
    <div className="page">
      <section className="interior-hero" aria-labelledby="contact-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            {site.base}
          </span>
          <h1 id="contact-title" className="interior-hero__title" data-reveal="left">
            Contact
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            Valcon Air Solutions Limited is based at Wilson Airport, Nairobi. Direct contact
            details are being confirmed for this concept preview.
          </p>
        </Container>
      </section>

      <section className="section" aria-labelledby="enquiry-title" id="enquiry">
        <Container>
          <div className="quote-panel" data-reveal="below">
            <span className="eyebrow">Enquiries</span>
            <h2 id="enquiry-title" className="quote-panel__title">
              Get in touch
            </h2>

            <ContactForm site={site} />

            {/* Contact details section - only when values exist */}
            {site.phone || site.email || site.whatsapp && (
              <div className="contact-details" data-reveal="below">
                <h3>Contact details</h3>
                <div className="contact-list">
                  {site.whatsapp && (
                    <div className="contact-item">
                      <a
                        href={`https://wa.me/${site.whatsapp}?target=5Y-VAL`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Message on WhatsApp"
                      >
                        WhatsApp
                      </a>
                      <span>{site.whatsapp}</span>
                    </div>
                  )}
                  {site.phone && (
                    <div className="contact-item">
                      <a href={`tel:${site.phone}`} target="_blank" rel="noopener noreferrer">
                        Phone
                      </a>
                      <span>{site.phone}</span>
                    </div>
                  )}
                  {site.email && (
                    <div className="contact-item">
                      <a href={`mailto:${site.email}`} target="_blank" rel="noopener noreferrer">
                        Email
                      </a>
                      <span>{site.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* To confirm with the client - only when contact details exist */}
            {site.phone || site.email || site.whatsapp && (
              <div className="client-confirmation" data-reveal="below">
                <h3>To confirm with the client</h3>
                <ul>
                  <li>Verify aircraft registration and airworthiness</li>
                  <li>Confirm landing slot availability at destination airports</li>
                  <li>Validate operator insurance coverage for international routes</li>
                  <li>Confirm passenger manifest and customs documentation</li>
                  <li>Review fuel requirements and alternate aerodrome planning</li>
                </ul>
                <p className="client-note">
                  These items must be confirmed with the client before finalising any
                  charter or commercial arrangement.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}