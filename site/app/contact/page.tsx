import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { getPages, getServices, getSite } from "@/lib/content";
import { hasEmail, hasPhone, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: getPages().contact.metaDescription,
};

export default function ContactPage() {
  const site = getSite();
  const services = getServices();
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
          <div className="quote-layout">
            <div className="quote-panel" id="quote" data-reveal="below">
              <span className="eyebrow">{contact.panelEyebrow}</span>
              <h2 id="enquiry-title" className="quote-panel__title">
                Request a quote
              </h2>
              <p>Tell us where you need to go and when. Our team will respond with a clear, tailored quote.</p>
              <ContactForm site={site} services={services} />
            </div>

            <aside className="quote-aside" aria-label="Contact details" data-reveal="below">
              <h3 className="quote-aside__title">Prefer to talk?</h3>
              <ul className="quote-aside__list">
                {hasPhone(site) ? (
                  <li>
                    <span>Call</span>
                    <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
                  </li>
                ) : null}
                {hasWhatsapp(site) ? (
                  <li>
                    <span>WhatsApp</span>
                    <a href={whatsappHref(site, site.messages.whatsappGeneral)} target="_blank" rel="noopener noreferrer">
                      {site.whatsapp}
                    </a>
                  </li>
                ) : null}
                {hasEmail(site) ? (
                  <li>
                    <span>Email</span>
                    <a href={mailtoHref(site)}>{site.email}</a>
                  </li>
                ) : null}
                {site.address.trim() ? (
                  <li>
                    <span>Visit</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.base}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {site.address}, {site.base}
                    </a>
                  </li>
                ) : null}
                {site.hours.map((row) => (
                  <li key={row.days}>
                    <span>Hours</span>
                    <p>
                      {row.days}, {row.time}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}