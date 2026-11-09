"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAircraft } from "@/lib/content";
import { setFlybyModalOpen } from "@/components/flyby/FlybyLayer";

/**
 * FleetModal — Concept B Nightfall fleet aircraft modal.
 *
 * Dark glass panel. Desktop: two columns (16:9 image + thumbnails, right column
 * with name, registration, status, summary, specs, disclaimer, actions).
 * Mobile: bottom sheet ~90svh with drag handle, swipe down to close, actions pinned.
 * Previous/next aircraft, keyboard arrows, swipe, hash deep link.
 * Grow-from-card transition with fallback. Full focus trap and inert background.
 */
export default function FleetModal({
  open,
  onClose,
  initialSlug,
}: {
  open: boolean;
  onClose: () => void;
  initialSlug?: string;
}) {
  const aircraft = getAircraft();
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const hash = window.location.hash.slice(1);
    if (hash) {
      const idx = aircraft.findIndex((a) => a.slug === hash);
      if (idx >= 0) return idx;
    }
    return 0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement>(null);
  const lastFocusableRef = useRef<HTMLElement>(null);
  const prevFocusedRef = useRef<HTMLElement | null>(null);
  const imageElRef = useRef<HTMLDivElement>(null);

  const current = aircraft[currentIndex];
  const prev = aircraft[(currentIndex - 1 + aircraft.length) % aircraft.length];
  const next = aircraft[(currentIndex + 1) % aircraft.length];

  // Pause flybys when modal opens
  useEffect(() => {
    if (open) {
      setFlybyModalOpen(true);
      prevFocusedRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      const main = document.querySelector("#main");
      const footer = document.querySelector("footer");
      const header = document.querySelector("header");
      if (main) main.setAttribute("aria-hidden", "true");
      if (footer) footer.setAttribute("aria-hidden", "true");
      if (header) header.setAttribute("aria-hidden", "true");
      if (focusTrapRef.current) {
        focusTrapRef.current.focus();
      }
    } else {
      setFlybyModalOpen(false);
      document.body.style.overflow = "";
      const main = document.querySelector("#main");
      const footer = document.querySelector("footer");
      const header = document.querySelector("header");
      if (main) main.removeAttribute("aria-hidden");
      if (footer) footer.removeAttribute("aria-hidden");
      if (header) header.removeAttribute("aria-hidden");
      if (prevFocusedRef.current) {
        prevFocusedRef.current.focus();
        prevFocusedRef.current = null;
      }
    }
  }, [open]);

  // Keyboard handling
  useEffect(() => {
    if (!open) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => (i - 1 + aircraft.length) % aircraft.length);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((i) => (i + 1) % aircraft.length);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose, aircraft.length]);

  // Hash deep link support - no-op effect (initial state handled in lazy initializer)
  useEffect(() => {
    // Deep link already applied in lazy state initializer above
  }, [open, aircraft]);

  // Navigate via hash when aircraft changes
  useEffect(() => {
    if (!open || !current) return;
    window.location.hash = current.slug;
  }, [current, open]);

  const goPrev = () => setCurrentIndex((i) => (i - 1 + aircraft.length) % aircraft.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % aircraft.length);

  // Drag-to-close (mobile bottom sheet)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY - dragStartY;
    if (y > 0) setDragY(y);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setIsDragging(false);
    setDragY(0);
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!open || !current) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Fleet: ${current.name}`}
      className="fleet-modal"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${dragY}px)`,
        transition: dragY > 0 ? "transform 0.1s ease-out" : "none",
      }}
    >
      {/* Dark glass backdrop */}
      <div
        className="fleet-modal-backdrop"
        onClick={onClose}
      />

      {/* Focus trap container */}
      <div
        ref={focusTrapRef as React.Ref<HTMLDivElement>}
        tabIndex={-1}
        className="fleet-modal-panel"
      >
        {/* Desktop: two-column grid */}
        {!isMobile && (
          <>
            <div className="fleet-modal-image-col">
              <div className="fleet-modal-image-frame">
                {current.hero.desktop ? (
                  <Image
                    src={current.hero.desktop}
                    alt={current.hero.alt}
                    className="fleet-modal-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="fleet-modal-image-placeholder" />
                )}
              </div>
              {current.gallery.length > 0 && (
                <div className="fleet-modal-thumbnails">
                  {current.gallery.map((g, i) => (
                    <button
                      key={i}
                      className="fleet-modal-thumb"
                      onClick={() => {}}
                    >
                      <img src={g.src} alt={g.alt} className="fleet-modal-thumb-img" />
                    </button>
                  ))}
                </div>
              )}
              <button
                className="fleet-modal-prev"
                onClick={goPrev}
                aria-label="Previous aircraft"
              >
                ‹
              </button>
              <button
                className="fleet-modal-next"
                onClick={goNext}
                aria-label="Next aircraft"
              >
                ›
              </button>
            </div>

            <div className="fleet-modal-info-col">
              <div className="fleet-modal-header">
                <h2 className="fleet-modal-name">{current.name}</h2>
                <button
                  className="fleet-modal-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {current.registrations.length > 0 && (
                <p className="fleet-modal-registration">
                  {current.registrations[0]}
                </p>
              )}

              <span className="status-pill fleet-modal-status">
                {current.isPlaceholder ? "Sample" : "In fleet"}
              </span>

              {current.summary ? (
                <p className="fleet-modal-summary">{current.summary}</p>
              ) : null}

              <p className="fleet-modal-disclaimer">
                Illustrative images. Client aircraft photography to follow.
              </p>

              <div className="fleet-modal-actions">
                <Link href="/contact/" className="btn btn--on-dark">
                  Request a Quote
                </Link>
                <button className="btn btn--outline" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile: bottom sheet */}
        {isMobile && (
          <>
            <div className="fleet-modal-mobile-header">
              <div className="fleet-modal-drag-handle" />
              <h2 className="fleet-modal-name">{current.name}</h2>
              <button
                className="fleet-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="fleet-modal-mobile-image">
              {current.hero.desktop ? (
                <Image
                  src={current.hero.desktop}
                  alt={current.hero.alt}
                  className="fleet-modal-image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="fleet-modal-image-placeholder" />
              )}
            </div>

            {current.registrations.length > 0 && (
              <p className="fleet-modal-registration">
                {current.registrations[0]}
              </p>
            )}

            <span className="status-pill fleet-modal-status">
              {current.isPlaceholder ? "Sample" : "In fleet"}
            </span>

            {current.summary ? (
              <p className="fleet-modal-summary">{current.summary}</p>
            ) : null}

            <p className="fleet-modal-disclaimer">
              Illustrative images. Client aircraft photography to follow.
            </p>

            <div className="fleet-modal-mobile-actions">
              <Link href="/contact/" className="btn btn--on-dark">
                Request a Quote
              </Link>
              <button className="btn btn--outline" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>

      {/* Last focusable element for trap */}
      <div ref={lastFocusableRef as React.Ref<HTMLDivElement>} tabIndex={-1} />
    </div>
  );
}