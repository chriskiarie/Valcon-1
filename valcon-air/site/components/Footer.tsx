import Link from "next/link";
import Container from "@/components/Container";
import { emailHref, whatsappHref } from "@/lib/contact";
import type { Site } from "@/lib/types";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/fleet/" },
  { label: "Contact", href: "/contact/" },
];

type FooterProps = {
  site: Site;
};

export default function Footer({ site }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div>
            <p className="footer-wordmark">{site.name.toUpperCase()}</p>
            <p className="footer-copy">
              {site.base}. {site.tagline}
            </p>
          </div>

          <div>
            <h2 className="footer-heading">Explore</h2>
            <nav aria-label="Footer" className="footer-links">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href} prefetch={false}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="footer-heading">Contact</h2>
            <address className="footer-contact">
              {site.phone && (
                <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
              )}
              {site.whatsapp && (
                <a
                  href={whatsappHref(site.whatsapp)}
                  rel="noreferrer"
                  target="_blank"
                >
                  WhatsApp
                </a>
              )}
              {site.email && (
                <a href={emailHref(site.email)}>{site.email}</a>
              )}
              <span>{site.base}</span>
            </address>
          </div>

          {site.socials.length > 0 ? (
            <div>
              <h2 className="footer-heading">Follow</h2>
              <nav aria-label="Social" className="footer-links">
                {site.socials.map((social) => (
                  <a
                    href={social.href}
                    key={social.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {social.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="footer-concept-pill">
            Concept B · Nightfall
          </p>
        </div>

        <p className="footer-credit">
          Hero photo:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Sunset_At_The_Airport_(192242589).jpeg"
            rel="noreferrer"
            target="_blank"
          >
            Jongsun Lee
          </a>{" "}
          / Wikimedia Commons,{" "}
          <a
            href="https://creativecommons.org/licenses/by/3.0"
            rel="noreferrer"
            target="_blank"
          >
            CC BY 3.0
          </a>
        </p>
      </Container>
    </footer>
  );
}