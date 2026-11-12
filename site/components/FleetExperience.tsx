"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Site, Aircraft, Home } from "@/lib/types";
import { aircraftMessage, hasWhatsapp, whatsappHref } from "@/lib/contact";
import { Button } from "@/components/Button";
import { PlaneIllustration } from "@/components/PlaneIllustration";

function webpFromAvif(path: string) {
  return path.replace(/\.avif$/i, ".webp");
}

function statusLabel(aircraft: Aircraft) {
  if (aircraft.status === "coming-soon") return "Sample";
  return "In fleet";
}

function focusableElements(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function FleetExperience({
  aircraft,
  site,
  copy,
  variant,
}: {
  aircraft: Aircraft[];
  site: Site;
  copy: Home["fleet"];
  variant: "teaser" | "page";
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const touchStartRef = useRef(0);

  const selected = aircraft.find((item) => item.slug === openSlug) || null;

  const openModal = useCallback((slug: string, trigger?: HTMLButtonElement | null) => {
    lastTriggerRef.current = trigger || null;
    setOpenSlug(slug);
    window.history.replaceState(null, "", `#fleet-${slug}`);
  }, []);

  const closeModal = useCallback(() => {
    const closingSlug = openSlug;
    setOpenSlug(null);
    if (window.location.hash.startsWith("#fleet-")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    window.requestAnimationFrame(() => {
      const target = lastTriggerRef.current || (closingSlug ? cardRefs.current.get(closingSlug) : null);
      target?.focus();
      lastTriggerRef.current = null;
    });
  }, [openSlug]);

  useEffect(() => {
    function openFromHash() {
      if (!window.location.hash.startsWith("#fleet-")) return;
      const slug = window.location.hash.slice("#fleet-".length);
      if (aircraft.some((item) => item.slug === slug)) {
        setOpenSlug(slug);
      }
    }

    function openFromEvent(event: Event) {
      const slug = (event as CustomEvent<string>).detail;
      if (slug && aircraft.some((item) => item.slug === slug)) {
        lastTriggerRef.current = null;
        setOpenSlug(slug);
        window.history.replaceState(null, "", `#fleet-${slug}`);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("valcon:open-aircraft", openFromEvent);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("valcon:open-aircraft", openFromEvent);
    };
  }, [aircraft]);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".fleet-card[data-slug]"));
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-uncovered");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.22 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!openSlug) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    body.classList.add("modal-open");

    const background = [".site-main", ".site-header", ".concept-pill", ".skip-link"]
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .filter((element): element is HTMLElement => element !== null);
    background.forEach((element) => element.setAttribute("inert", ""));

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = focusableElements(modalRef.current);
      if (focusable.length === 0) return;

      if (!modalRef.current.contains(document.activeElement)) {
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
      body.classList.remove("modal-open");
      background.forEach((element) => element.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openSlug, closeModal]);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (!modalRef.current || modalRef.current.scrollTop > 0) return;
    touchStartRef.current = event.touches[0].clientY;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const end = event.changedTouches[0]?.clientY ?? touchStartRef.current;
    if (end - touchStartRef.current > 100) {
      closeModal();
    }
  }

  const heading = variant === "teaser" ? copy.heading : copy.pageHeading;

  return (
    <>
      <section
        className="section fleet-section"
        aria-labelledby={variant === "teaser" ? "fleet-title" : undefined}
        aria-label={variant === "teaser" ? undefined : "Fleet"}
      >
        <div className="container">
          {variant === "teaser" ? (
            <div className="fleet-heading-row" data-flyby-avoid>
              <h2
                id="fleet-title"
                className="section-title"
                data-flyby-trigger="fleet"
                data-reveal="left"
              >
                {heading}
              </h2>
              <a className="text-link" href="/fleet/" data-reveal="right">
                {copy.linkLabel}
              </a>
            </div>
          ) : null}

          <div className={`fleet-grid fleet-grid--${variant}`}>
            {aircraft.map((item, index) => {
              const hasImage = Boolean(item.hero.desktop);
              const reveal = index === 0 ? "left" : index === 1 ? "pop" : "right";
              return (
                <button
                  key={item.slug}
                  ref={(node) => {
                    if (node) cardRefs.current.set(item.slug, node);
                  }}
                  className="fleet-card"
                  type="button"
                  data-slug={item.slug}
                  data-flyby-avoid
                  data-reveal={reveal}
                  aria-haspopup="dialog"
                  onClick={(event) => openModal(item.slug, event.currentTarget)}
                >
                  <span className="fleet-window">
                    <span className="fleet-window__inner">
                      {hasImage ? (
                        <picture>
                          <source type="image/avif" srcSet={item.hero.desktop} />
                          <source type="image/webp" srcSet={webpFromAvif(item.hero.desktop)} />
                          <img
                            className="fleet-window__img"
                            src={webpFromAvif(item.hero.desktop)}
                            alt=""
                            width={1200}
                            height={800}
                            loading="lazy"
                            decoding="async"
                          />
                        </picture>
                      ) : (
                        <span className="fleet-window__placeholder">
                          <PlaneIllustration />
                        </span>
                      )}
                    </span>
                    <span className="fleet-window__reflection" aria-hidden="true" />
                    <span
                      className="fleet-window__shade"
                      style={{ "--shade-delay": `${index * 120}ms` } as React.CSSProperties}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="fleet-card__body">
                    <span className="fleet-card__title">{item.name}</span>
                    <span className="fleet-card__meta">
                      {item.registrations.length > 0 ? (
                        <span className="fleet-card__reg">{item.registrations.join(", ")}</span>
                      ) : (
                        <span>Registration to follow</span>
                      )}
                      <span className={`pill ${item.status === "active" ? "pill--active" : ""}`}>
                        {statusLabel(item)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {site.notices.illustrativeImages ? (
            <p className="fleet-note" data-reveal="below" data-flyby-avoid>
              {site.notices.illustrativeImages}
            </p>
          ) : null}
        </div>
      </section>

      {selected
        ? createPortal(
            <div className="fleet-modal">
              <div className="fleet-modal__backdrop" aria-hidden="true" onClick={closeModal} />
              <div
                ref={modalRef}
                className="fleet-modal__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="fleet-modal-title"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="fleet-modal__media">
                  {selected.hero.desktop ? (
                    <picture>
                      <source type="image/avif" srcSet={selected.hero.desktop} />
                      <source type="image/webp" srcSet={webpFromAvif(selected.hero.desktop)} />
                      <img
                        src={webpFromAvif(selected.hero.desktop)}
                        alt={selected.hero.alt}
                        width={1200}
                        height={800}
                        decoding="async"
                      />
                    </picture>
                  ) : null}
                  <button
                    ref={closeRef}
                    className="fleet-modal__close"
                    type="button"
                    aria-label="Close aircraft details"
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                </div>
                <div className="fleet-modal__body">
                  <h2 id="fleet-modal-title" className="fleet-modal__title">
                    {selected.name}
                  </h2>
                  <div className="fleet-modal__meta">
                    {selected.registrations.length > 0 ? (
                      <span className="fleet-card__reg">{selected.registrations.join(", ")}</span>
                    ) : (
                      <span>Registration to follow</span>
                    )}
                    <span className={`pill ${selected.status === "active" ? "pill--active" : ""}`}>
                      {statusLabel(selected)}
                    </span>
                  </div>
                  <p className="fleet-modal__summary">{selected.summary}</p>
                  {selected.features.length > 0 ? (
                    <ul>
                      {selected.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}
                  {site.notices.illustrativeImages ? (
                    <p className="fleet-modal__disclaimer">{site.notices.illustrativeImages}</p>
                  ) : null}
                  <div className="fleet-modal__actions">
                    <Button
                      href={
                        hasWhatsapp(site)
                          ? whatsappHref(site, aircraftMessage(site, selected.name))
                          : "/contact/#quote"
                      }
                      variant="solid"
                      target={hasWhatsapp(site) ? "_blank" : undefined}
                      rel={hasWhatsapp(site) ? "noopener noreferrer" : undefined}
                    >
                      Request a quote
                    </Button>
                    <Button variant="outline" onClick={closeModal}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
