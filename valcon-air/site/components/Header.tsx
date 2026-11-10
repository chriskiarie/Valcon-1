"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Container from "@/components/Container";
import MobileMenu from "@/components/MobileMenu";
import type { Site } from "@/lib/types";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/fleet/" },
  { label: "Contact", href: "/contact/" },
];

type HeaderProps = {
  site: Site;
  tone?: "light" | "dark";
};

function isCurrent(pathname: string, href: string) {
  const current = pathname.replace(/\/+$/, "") || "/";
  const target = href.replace(/\/+$/, "") || "/";

  return current === target;
}

export default function Header({ site, tone = "dark" }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuOpen = openForPath === pathname;
  // The home hero runs under the header, so the header starts light and
  // switches to its solid, dark-text state once the sentinel is passed.
  const overHero = pathname === "/" && !scrolled && !menuOpen;
  const activeTone = overHero ? "light" : tone;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 768px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpenForPath(null);
      }
    };

    desktop.addEventListener("change", closeAtDesktop);

    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, [menuOpen]);

  const closeMenu = useCallback(() => setOpenForPath(null), []);

  return (
    <>
      <div aria-hidden="true" className="scroll-sentinel" ref={sentinelRef} />
      <header
        className="site-header"
        data-scrolled={scrolled}
        data-tone={activeTone}
      >
        <Container className="header-inner">
          <Link
            aria-label={`${site.name} home`}
            className="header-wordmark"
            href="/"
            prefetch={false}
          >
            {site.name.toUpperCase()}
          </Link>

          <div className="header-actions">
            <nav aria-label="Primary" className="header-nav">
              {navigation.map((item) => (
                <Link
                  aria-current={
                    isCurrent(pathname, item.href) ? "page" : undefined
                  }
                  className="header-link"
                  href={item.href}
                  key={item.href}
                  prefetch={false}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {site.phone && (
              <a className="header-phone" href={`tel:${site.phoneTel}`}>
                <span className="header-phone-short">Call</span>
                <span className="header-phone-full">{site.phone}</span>
              </a>
            )}
            <a className="btn btn--outline" href="/contact/">Contact</a>
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="menu-button"
            onClick={() => setOpenForPath(menuOpen ? null : pathname)}
            ref={menuButtonRef}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="menu-button-icon"
              fill="none"
              focusable="false"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
              ) : (
                <path
                  d="M4 8h16M4 16h16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
              )}
            </svg>
          </button>
        </Container>
      </header>

      {menuOpen ? (
        <MobileMenu
          menuButtonRef={menuButtonRef}
          onClose={closeMenu}
          site={site}
        />
      ) : null}
    </>
  );
}
