import Link from "next/link";
import { getSite } from "@/lib/content";
import { hasEmail, hasPhone, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";
import { SOCIAL_ICONS, SOCIAL_LABELS } from "@/lib/socials";
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
            <Wordmark site={site} variant="full" reversed />
          </div>

          <nav className="footer__col" aria-label="Footer">
            <h2 className="footer__head">Explore</h2>
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="footer__col">
            <h2 className="footer__head">Contact</h2>
            {site.address.trim() ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.base}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.address}, {site.base}
              </a>
            ) : null}
            {phone ? <a href={`tel:${site.phoneTel}`}>{site.phone}</a> : null}
            {whatsapp ? (
              <a href={whatsappHref(site)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
            {email ? <a href={mailtoHref(site)}>{site.email}</a> : null}
            {!phone && !whatsapp && !email ? <Link href="/contact/">Contact</Link> : null}
            {site.hours.map((row) => (
              <span key={row.days}>
                {row.days}, {row.time}
              </span>
            ))}
          </div>

          {site.socials.length > 0 ? (
            <div className="footer__col">
              <h2 className="footer__head">Follow</h2>
              {site.socials.map((social) => {
                const icon = social.platform ? SOCIAL_ICONS[social.platform] : null;
                return (
                  <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="footer__social">
                    {icon ? (
                      <svg className="footer__social-icon" viewBox={icon.viewBox} aria-hidden="true">
                        <path d={icon.path} />
                      </svg>
                    ) : null}
                    {social.platform ? SOCIAL_LABELS[social.platform] : social.label}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="footer__bottom">
          <div className="footer__smallprint">
            <span>
              &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </span>
            {site.notices.footerNote ? <span>{site.notices.footerNote}</span> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
