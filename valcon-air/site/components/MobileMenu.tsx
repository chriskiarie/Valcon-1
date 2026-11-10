"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { emailHref, whatsappHref } from "@/lib/contact";
import type { Site } from "@/lib/types";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const navigation = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/fleet/" },
  { label: "Contact", href: "/contact/" },
];

type MobileMenuProps = {
  site: Site;
  onClose: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
};

function isVisible(element: HTMLElement) {
  return element.getClientRects().length > 0;
}

export default function MobileMenu({
  site,
  onClose,
  menuButtonRef,
}: MobileMenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = menuButtonRef.current;

    if (!dialog) {
      return;
    }

    const firstInDialog = dialog.querySelector<HTMLElement>(focusableSelector);
    firstInDialog?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-menu-open", "true");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = [
        ...(trigger ? [trigger] : []),
        ...Array.from(
          dialog.querySelectorAll<HTMLElement>(focusableSelector),
        ),
      ].filter(isVisible);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !focusable.includes(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.documentElement.removeAttribute("data-menu-open");
      trigger?.focus();
    };
  }, [menuButtonRef, onClose]);

  return (
    <div
      aria-labelledby="mobile-menu-title"
      aria-modal="true"
      className="mobile-menu"
      id="mobile-menu"
      ref={dialogRef}
      role="dialog"
    >
      <div className="mobile-menu-panel">
        <h2 className="sr-only" id="mobile-menu-title">
          Site menu
        </h2>

        <p className="eyebrow">{site.base}</p>

        <nav aria-label="Mobile" className="mobile-menu-nav">
          {navigation.map((item) => (
            <Link
              className="mobile-menu-link"
              href={item.href}
              key={item.href}
              onClick={onClose}
              prefetch={false}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-contact">
          <p className="mobile-menu-contact-label">Contact</p>
          <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
          <a
            href={whatsappHref(site.whatsapp)}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp
          </a>
          <a href={emailHref(site.email)}>{site.email}</a>
        </div>
      </div>
    </div>
  );
}
