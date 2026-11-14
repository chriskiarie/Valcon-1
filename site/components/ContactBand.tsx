"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Container } from "@/components/Container";
import { hasEmail, hasPhone, mailtoHref } from "@/lib/contact";
import type { Home, Site } from "@/lib/types";

function FlightPlane() {
  return (
    <svg viewBox="0 0 40 18" fill="currentColor" aria-hidden="true">
      <path d="M38 8.6c1.2.2 1.2 1.6 0 1.8l-9.4 1.5-7.3 5.2-2.1-.3 3.7-4.7-8.7.7-3 2-1.7-.3 1.5-2.8-1.5-2.8 1.7-.3 3 2 8.7.7-3.7-4.7 2.1-.3 7.3 5.2L38 8.6Z" />
    </svg>
  );
}

/** A plane flies a fixed straight path across the page, drawing a line and revealing the contact details as it passes. */
export function ContactBand({ site, copy }: { site: Site; copy: Home["visit"] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.classList.add("is-flying");
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items: { label: string; content: React.ReactNode }[] = [];
  if (site.address.trim()) {
    items.push({
      label: copy.addressLabel,
      content: (
        <>
          {site.address}
          <br />
          {site.base}
        </>
      ),
    });
  }
  if (hasPhone(site)) {
    items.push({ label: copy.phoneLabel, content: <a href={`tel:${site.phoneTel}`}>{site.phone}</a> });
  }
  if (hasEmail(site)) {
    items.push({ label: copy.emailLabel, content: <a href={mailtoHref(site)}>{site.email}</a> });
  }
  if (site.hours.length > 0) {
    items.push({
      label: copy.hoursLabel,
      content: (
        <>
          {site.hours.map((row) => (
            <span key={row.days} className="contact-band__hours">
              {row.days}
              <br />
              {row.time}
            </span>
          ))}
        </>
      ),
    });
  }
  if (items.length === 0) return null;

  return (
    <section ref={ref} className="section contact-band" aria-labelledby="visit-title">
      <Container>
        <div className="contact-band__head" data-flyby-avoid>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2 id="visit-title" className="contact-band__title">
            {copy.title}
          </h2>
          {copy.line ? <p className="contact-band__line-copy">{copy.line}</p> : null}
        </div>

        <div className="contact-band__path" aria-hidden="true">
          <span className="contact-band__baseline" />
          <span className="contact-band__trail" />
          <span className="contact-band__flight">
            <span className="contact-band__plane">
              <FlightPlane />
            </span>
          </span>
        </div>

        <dl className="contact-band__grid" data-flyby-avoid>
          {items.map((item, index) => (
            <div key={item.label} className="contact-band__item" style={{ "--i": index } as CSSProperties}>
              <dt>{item.label}</dt>
              <dd>{item.content}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
