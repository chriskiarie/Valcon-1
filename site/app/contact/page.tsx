import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { ChatIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/FormIcons";
import { getPages, getSite } from "@/lib/content";
import { hasEmail, hasPhone, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: getPages().contact.metaDescription,
};

type Tile = { key: string; label: string; value: ReactNode; href?: string; external?: boolean; icon: ReactNode };

export default function ContactPage() {
  const site = getSite();
  const { contact } = getPages();

  const tiles: Tile[] = [];
  if (hasPhone(site)) tiles.push({ key: "call", label: "Call", value: site.phone, href: `tel:${site.phoneTel}`, icon: <PhoneIcon /> });
  if (hasWhatsapp(site))
    tiles.push({ key: "wa", label: "WhatsApp", value: site.whatsapp, href: whatsappHref(site, site.messages.whatsappGeneral), external: true, icon: <ChatIcon /> });
  if (hasEmail(site)) tiles.push({ key: "mail", label: "Email", value: site.email, href: mailtoHref(site), icon: <MailIcon /> });
  if (site.address.trim())
    tiles.push({
      key: "visit",
      label: "Visit",
      value: `${site.address}, ${site.base}`,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.base}`)}`,
      external: true,
      icon: <PinIcon />,
    });
  if (site.hours.length)
    tiles.push({
      key: "hours",
      label: "Hours",
      value: site.hours.map((row) => `${row.days}, ${row.time}`).join(" · "),
      icon: <ClockIcon />,
    });

  return (
    <div className="page">
      <section className="interior-hero interior-hero--compact" aria-labelledby="contact-title">
        <Container>
          <div className="interior-hero__row">
            <div>
              <span className="eyebrow" data-reveal="left">{site.base}</span>
              <h1 id="contact-title" className="interior-hero__title" data-reveal="left">{contact.title}</h1>
            </div>
            <p className="interior-hero__lede" data-reveal="below">{contact.lede}</p>
          </div>
        </Container>
      </section>

      <section className="section ct-tiles-section" aria-label="Contact details">
        <Container>
          <ul className="ct-tiles">
            {tiles.map((tile, i) => {
              const inner = (
                <>
                  <span className="ct-tile__icon">{tile.icon}</span>
                  <span className="ct-tile__label">{tile.label}</span>
                  <span className="ct-tile__value">{tile.value}</span>
                </>
              );
              return (
                <li key={tile.key} style={{ ["--i" as string]: i }}>
                  {tile.href ? (
                    <a className="ct-tile" href={tile.href} {...(tile.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {inner}
                    </a>
                  ) : (
                    <div className="ct-tile ct-tile--static">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="fx-stage" aria-labelledby="message-title">
        <Container>
          <div className="fx-card fx-card--message" data-reveal="below">
            <aside className="fx-card__side">
              <span className="eyebrow eyebrow--on-dark">{contact.panelEyebrow}</span>
              <h2 id="message-title" className="fx-card__title">{contact.panelTitle}</h2>
              <p className="fx-card__lede">A question, a change to a booking, or anything else.</p>
              <p className="fx-card__talk">
                Planning a flight? <Link href="/quote/">Request a quote</Link>
              </p>
            </aside>
            <div className="fx-card__main">
              <ContactForm site={site} />
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}
