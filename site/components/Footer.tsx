import Link from "next/link";
import { getSite } from "@/lib/content";

export function Footer({ compact = false }: { compact?: boolean }) {
  const site = getSite();
  const hasPhone = site.phoneTel.trim().length > 0;
  const hasWhatsapp = site.whatsapp.trim().length > 0;
  const hasEmail = site.email.trim().length > 0;

  return (
    <footer className={`site-footer ${compact ? "site-footer--compact" : ""}`.trim()}>
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link className="wordmark" href="/" aria-label="Valcon Air home">
              <span className="wordmark__valcon">VALCON</span>
              <span className="wordmark__air">AIR</span>
            </Link>
            <p>{site.tagline}</p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <Link href="/">Home</Link>
            <Link href="/fleet/">Fleet</Link>
            <Link href="/contact/">Contact</Link>
          </nav>

          <div className="footer__contact">
            {hasPhone ? <a href={`tel:${site.phoneTel}`}>{site.phone}</a> : null}
            {hasWhatsapp ? (
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
            {hasEmail ? <a href={`mailto:${site.email}`}>{site.email}</a> : null}
            {!hasPhone && !hasWhatsapp && !hasEmail ? (
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
            <span>Demo draft. Content is placeholder.</span>
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
