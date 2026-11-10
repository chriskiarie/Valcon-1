import type { Metadata } from "next";
import Container from "@/components/Container";
import { emailHref, whatsappHref } from "@/lib/contact";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const site = getSite();

  return (
    <div className="page-shell">
      <Container>
        <div className="page-intro">
          <p className="eyebrow">{site.base}</p>
          <h1 className="page-title">Contact</h1>
          <p className="page-description">
            [placeholder] Contact and enquiry information will be confirmed by
            the operator.
          </p>
        </div>

        <div className="page-body">
          <div className="quote-panel on-dark" id="quote">
            <h2 className="quote-panel-title">Request a quote</h2>
            <p className="quote-panel-copy">
              [placeholder] The enquiry form will be added in a later step. For
              now, use the contact details below.
            </p>
            <div className="quote-actions">
              <a
                className="btn btn--on-dark"
                href={whatsappHref(site.whatsapp)}
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>
              <a className="btn btn--outline" href={emailHref(site.email)}>
                Email
              </a>
            </div>
          </div>

          <div className="facts-grid">
            <div className="fact-card">
              <p className="fact-label">Phone</p>
              <a className="fact-value" href={`tel:${site.phoneTel}`}>
                {site.phone}
              </a>
            </div>

            <div className="fact-card">
              <p className="fact-label">Email</p>
              <a className="fact-value" href={emailHref(site.email)}>
                {site.email}
              </a>
            </div>

            <div className="fact-card">
              <p className="fact-label">Base</p>
              <p className="fact-value">{site.base}</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
