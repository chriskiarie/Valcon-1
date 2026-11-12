import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { getPages, getSite } from "@/lib/content";
import { hasDirectContact, hasEmail, hasPhone, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: getPages().contact.metaDescription,
};

export default function ContactPage() {
  const site = getSite();
  const { contact } = getPages();

  return (
    <div className="page">
      <section className="interior-hero" aria-labelledby="contact-title">
        <Container>
          <span className="eyebrow" data-reveal="left">
            {site.base}
          </span>
          <h1 id="contact-title" className="interior-hero__title" data-reveal="left">
            {contact.title}
          </h1>
          <p className="interior-hero__lede" data-reveal="below">
            {contact.lede}
          </p>
        </Container>
      </section>

      <section className="section" aria-labelledby="enquiry-title" id="enquiry">
        <Container>
          <div className="quote-panel" id="quote" data-reveal="below">
            <span className="eyebrow">{contact.panelEyebrow}</span>
            <h2 id="enquiry-title" className="quote-panel__title">
              {contact.panelTitle}
            </h2>

            <ContactForm site={site} />

            {hasDirectContact(site) ? (
              <div className="contact-details" data-reveal="below">
                <h3>Contact details</h3>
                <div className="contact-list">
                  {hasWhatsapp(site) ? (
                    <div className="contact-item">
                      <a
                        href={whatsappHref(site, site.messages.whatsappGeneral)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                      <span>{site.whatsapp}</span>
                    </div>
                  ) : null}
                  {hasPhone(site) ? (
                    <div className="contact-item">
                      <a href={`tel:${site.phoneTel}`}>Phone</a>
                      <span>{site.phone}</span>
                    </div>
                  ) : null}
                  {hasEmail(site) ? (
                    <div className="contact-item">
                      <a href={mailtoHref(site)}>Email</a>
                      <span>{site.email}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}