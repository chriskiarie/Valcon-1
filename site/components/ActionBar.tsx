"use client";

import type { Site } from "@/lib/types";

const whatsappMessage = "Hello Valcon Air, I’d like to enquire about a flight.";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7.2 3.5 4.6 5.1c-.9.5-1.3 1.6-1 2.6 1.7 5.4 6 9.7 11.4 11.4 1 .3 2.1-.1 2.6-1l1.6-2.6-4.2-2-1.4 1.7c-2.1-1-3.8-2.7-4.8-4.8l1.7-1.4-2-4.2Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z" />
      <path d="M8.7 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.1.1-.2.3-.1.5.5 1 1.3 1.8 2.3 2.3.2.1.4 0 .5-.1l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.5.7-1.8.8-4.5-.9-5.8-2.2-1.3-1.3-2.4-3.2-1.9-4.9Z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 4.5h14v11H9l-4 4v-15Z" />
      <path d="M8.5 8.5h7M8.5 11.5h4.5" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 13.5 21 4l-5.5 16-3.5-6-6-2.5Z" />
      <path d="m12 14 4-4" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4.5 5.5h15v13h-15z" />
      <path d="m5 6 7 6 7-6" />
    </svg>
  );
}

export function ActionBar({ site, hidden }: { site: Site; hidden: boolean }) {
  const hasPhone = site.phoneTel.trim().length > 0;
  const hasWhatsapp = site.whatsapp.trim().length > 0;

  const first = hasPhone
    ? { href: `tel:${site.phoneTel}`, label: "Call", icon: <PhoneIcon /> }
    : { href: "/contact/", label: "Contact", icon: <ContactIcon /> };

  const second = hasWhatsapp
    ? {
        href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`,
        label: "WhatsApp",
        icon: <WhatsAppIcon />,
      }
    : { href: "/fleet/", label: "Fleet", icon: <PlaneIcon /> };

  return (
    <nav className="action-bar" data-hidden={hidden} aria-label="Quick actions">
      {[first, second, { href: "/contact/#quote", label: "Request a quote", icon: <QuoteIcon /> }].map(
        (item) => (
          <a
            key={item.label}
            className="action-bar__link"
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ),
      )}
    </nav>
  );
}
