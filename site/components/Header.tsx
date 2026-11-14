"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Site } from "@/lib/types";
import { Button } from "@/components/Button";
import { MobileMenu } from "@/components/MobileMenu";
import { ActionBar } from "@/components/ActionBar";
import { Wordmark } from "@/components/Wordmark";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export function Header({
  site,
  overHero,
}: {
  site: Site;
  overHero?: boolean;
}) {
  const pathname = usePathname();
  const home = pathname === "/";
  const transparentOverHero = overHero ?? home;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!transparentOverHero) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [transparentOverHero]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  const solid = !transparentOverHero || scrolled;

  return (
    <>
      <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
      <header
        className={[
          "site-header",
          solid ? "site-header--solid" : "",
          transparentOverHero ? "site-header--over-hero" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="container site-header__inner">
          <Wordmark site={site} />

          <nav className="site-nav" aria-label="Primary">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                className="site-nav__link"
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <Button
              href="/contact/#quote"
              variant="solid"
              className="site-header__quote"
            >
              Request a quote
            </Button>
          </div>

          <button
            ref={buttonRef}
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-toggle__lines" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        site={site}
        id="mobile-menu"
      />
      <ActionBar site={site} hidden={menuOpen} />
    </>
  );
}
