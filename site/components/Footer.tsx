import Link from "next/link";
import { getSite } from "@/lib/content";
import { hasEmail, hasPhone, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";
import { Wordmark } from "@/components/Wordmark";

export function Footer({ compact = false }: { compact?: boolean }) {
  const site = getSite();
  const phone = hasPhone(site);
  const whatsapp = hasWhatsapp(site);
  const email = hasEmail(site);

  return (
    <footer className={`site-footer ${compact ? "site-footer--compact" : ""}`.trim()}>
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Wordmark site={site} variant="full" />
            <p>{site.tagline}</p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="footer__contact">
            {phone ? <a href={`tel:${site.phoneTel}`}>{site.phone}</a> : null}
            {whatsapp ? (
              <a href={whatsappHref(site)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
            {email ? <a href={mailtoHref(site)}>{site.email}</a> : null}
            {!phone && !whatsapp && !email ? (
              <Link href="/contact/">Contact</Link>
            ) : null}
            {site.socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__smallprint">
            <span>
              &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </span>
            {site.notices.footerNote ? <span>{site.notices.footerNote}</span> : null}
          </div>
          <p className="footer__credits">
            Images:{" "}
            {site.credits.map((credit, index) => (
              <span key={credit.source}>
                {index > 0 ? "; " : ""}
                <a href={credit.source} target="_blank" rel="noopener noreferrer">
                  {credit.title}
                </a>{" "}
                by {credit.author} ({credit.licence}; {credit.usedFor.toLowerCase()}
                {credit.note ? `, ${credit.note.toLowerCase()}` : ""})
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
