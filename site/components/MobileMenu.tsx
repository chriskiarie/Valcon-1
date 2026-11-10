"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Site } from "@/lib/types";

const nav = [
  { href: "/", label: "Home" },
  { href: "/fleet/", label: "Fleet" },
  { href: "/contact/", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

function focusableElements(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function MobileMenu({
  open,
  onClose,
  site,
  id,
}: {
  open: boolean;
  onClose: () => void;
  site: Site;
  id: string;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const background = [".site-main", ".site-header", ".concept-pill", ".skip-link"]
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .filter((element): element is HTMLElement => element !== null);
    background.forEach((element) => element.setAttribute("inert", ""));

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 20);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = focusableElements(panelRef.current);
      if (focusable.length === 0) return;

      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        focusable[0].focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      body.style.overflow = previousOverflow;
      background.forEach((element) => element.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      if (open) onClose();
    }
  }, [pathname, open, onClose]);

  const hasPhone = site.phoneTel.trim().length > 0;
  const hasWhatsapp = site.whatsapp.trim().length > 0;
  const hasEmail = site.email.trim().length > 0;
  const hasDirect = hasPhone || hasWhatsapp || hasEmail;

  return (
    <div
      ref={panelRef}
      id={id}
      className="mobile-menu"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      inert={!open}
    >
      <div className="mobile-menu__top">
        <span id={`${id}-title`} className="wordmark">
          <Image
            src="/images/logo.png"
            alt="Valcon Air"
            width={400}
            height={120}
            className="wordmark__logo"
          />
        </span>
        <button
          ref={closeRef}
          className="mobile-menu__close"
          type="button"
          aria-label="Close menu"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <nav className="mobile-menu__nav" aria-label="Mobile">
        {nav.map((item) => (
          <Link
            key={item.href}
            className="mobile-menu__link"
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mobile-menu__contact">
        {hasPhone ? (
          <a href={`tel:${site.phoneTel}`}>{site.phone}</a>
        ) : null}
        {hasWhatsapp ? (
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        ) : null}
        {hasEmail ? <a href={`mailto:${site.email}`}>{site.email}</a> : null}
        {!hasDirect ? (
          <>
            <p>Direct contact details are being confirmed for this concept preview.</p>
            <Link href="/contact/" onClick={onClose}>
              Contact
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
