"use client";

import { whatsappHref } from "@/lib/contact";
import type { Site } from "@/lib/types";

type ActionBarProps = {
  site: Site;
};

export default function ActionBar({ site }: ActionBarProps) {
  return (
    <nav aria-label="Quick actions" className="action-bar">
      {site.phone && (
        <a className="action-bar-link" href={`tel:${site.phoneTel}`}>
          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            viewBox="0 0 24 24"
          >
            <path d="M7.1 3.8 9 7.2c.3.5.2 1.1-.2 1.5l-1.4 1.4a14.2 14.2 0 0 0 6.5 6.5l1.4-1.4c.4-.4 1-.5 1.5-.2l3.4 1.9c.5.3.8.9.7 1.5l-.4 2.4c-.1.7-.7 1.2-1.4 1.2C10.7 22 2 13.3 2 4.9c0-.7.5-1.3 1.2-1.4l2.4-.4c.6-.1 1.2.2 1.5.7Z" />
          </svg>
          <span>Call</span>
        </a>
      )}
      {site.whatsapp && (
        <a
          className="action-bar-link"
          href={whatsappHref(site.whatsapp)}
          rel="noreferrer"
          target="_blank"
        >
          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            viewBox="0 0 24 24"
          >
            <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4.1Z" />
            <path d="M8.3 7.9c.3-.1.7 0 .9.4l.9 1.7c.1.3.1.6-.1.8l-.7.7a7.3 7.3 0 0 0 3.2 3.2l.7-.7c.2-.2.5-.3.8-.1l1.7.9c.4.2.5.6.4.9l-.4 1.2c-.2.5-.7.8-1.2.7A10.9 10.9 0 0 1 6.4 9.5c-.1-.5.2-1 .7-1.2l1.2-.4Z" />
          </svg>
          <span>WhatsApp</span>
        </a>
      )}
      <a className="action-bar-link" href="/contact/#quote">
        <svg
          aria-hidden="true"
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          viewBox="0 0 24 24"
        >
          <path d="M5 3.5h10l4 4v13H5v-17Z" />
          <path d="M15 3.5v4h4M8.5 12h7M8.5 16h5" />
        </svg>
        <span>Request a Quote</span>
      </a>
    </nav>
  );
}