import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact page for the Valcon Air concept preview. Direct contact details are being confirmed.",
};

export default function ContactPage() {
  const site = getSite();
  const hasContact = Boolean(site.phoneTel || site.email || site.whatsapp);

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
            Valcon Air Solutions Limited is based at Wilson Airport, Nairobi. Direct contact details
            are being confirmed for this concept preview.
          </p>
        </Container>
      </section>

      <section className="section" aria-labelledby="quote-title" id="quote">
        <Container>
          <div className="quote-panel" data-reveal="below">
            <span className="eyebrow">Enquiries</span>
            <h2 id="quote-title" className="quote-panel__title">
              Request a quote
            </h2>
            <p>
              {hasContact
                ? "Use the contact details in the footer, or return to the fleet to choose an aircraft."
                : "The enquiry form is the next step for this demo. Until contact details are confirmed, please use the fleet page to explore the aircraft."}
            </p>
            <div className="quote-panel__actions">
              <Button href="/fleet/" variant="solid">
                View the fleet
              </Button>
              <Button href="/" variant="outline">
                Back to home
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
