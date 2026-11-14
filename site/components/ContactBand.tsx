"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/Container";
import { hasEmail, hasPhone, mailtoHref } from "@/lib/contact";
import type { Home, Site } from "@/lib/types";

/** The site's flyby plane makes one straight pass along the line, revealing each contact detail as it passes. */
export function ContactBand({ site, copy }: { site: Site; copy: Home["visit"] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fallback = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.classList.add("is-flying");
        observer.disconnect();
        // If the flyby cannot run (reduced motion, a modal, a slow device) the details still appear.
        fallback = window.setTimeout(() => {
          if (el.dataset.flyby) return;
          el.dataset.flyby = "done";
          el.querySelectorAll("[data-reveal-item]").forEach((item) => item.classList.add("is-revealed"));
          const trail = el.querySelector<HTMLElement>("[data-flyby-trail]");
          if (trail) trail.style.transform = "scaleX(1)";
        }, 8000);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
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
    <section ref={ref} className="section contact-band" aria-labelledby="visit-title" data-flyby-trigger="reveal">
      <Container>
        <div className="contact-band__head" data-flyby-avoid>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2 id="visit-title" className="contact-band__title">
            {copy.title}
          </h2>
          {copy.line ? <p className="contact-band__line-copy">{copy.line}</p> : null}
        </div>

        <div className="contact-band__path" aria-hidden="true">
          <span className="contact-band__baseline" data-flyby-line />
          <span className="contact-band__trail" data-flyby-trail />
        </div>

        <dl className="contact-band__grid" data-flyby-avoid>
          {items.map((item) => (
            <div key={item.label} className="contact-band__item" data-reveal-item>
              <dt>{item.label}</dt>
              <dd>{item.content}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
