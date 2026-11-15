"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Container } from "@/components/Container";
import type { Home } from "@/lib/types";

type FleetCopy = Home["fleet"];
type Shot = { image: string; alt: string };

function Picture({ image, alt, className }: { image: string; alt: string; className?: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`${image}.avif`} />
      <source type="image/webp" srcSet={`${image}.webp`} />
      <img className={className} src={`${image}.jpg`} alt={alt} decoding="async" />
    </picture>
  );
}

/** The fleet screen: one wide window onto the aircraft. The photo stays put while the page scrolls past it. Click to go immersive. */
export function FleetWindow({ copy }: { copy: FleetCopy }) {
  const win = copy.window;
  const frameRef = useRef<HTMLButtonElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const originRect = useRef<DOMRect | null>(null);

  const shots: Shot[] = win ? [{ image: win.image, alt: win.alt }, ...win.more] : [];

  const openViewer = useCallback(() => {
    if (frameRef.current) originRect.current = frameRef.current.getBoundingClientRect();
    setIndex(0);
    setOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    const viewer = viewerRef.current;
    const rect = frameRef.current?.getBoundingClientRect();
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!viewer || !rect || calm) {
      setOpen(false);
      return;
    }
    const to = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 1.5rem)`;
    const anim = viewer.animate([{ clipPath: "inset(0px round 0rem)" }, { clipPath: to }], {
      duration: 520,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    });
    anim.onfinish = () => setOpen(false);
  }, []);

  const go = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track || shots.length === 0) return;
      const i = (next + shots.length) % shots.length;
      track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
      setIndex(i);
    },
    [shots.length],
  );

  // Expand from the window's own rectangle to the full screen.
  useEffect(() => {
    if (!open) return;
    const viewer = viewerRef.current;
    const rect = originRect.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (viewer && rect && !calm) {
      const from = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 1.5rem)`;
      viewer.animate([{ clipPath: from }, { clipPath: "inset(0px round 0rem)" }], {
        duration: 620,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    viewer?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, go, closeViewer]);

  // Keep the counter in step with swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!open || !track) return;
    function onScroll() {
      if (!track) return;
      setIndex(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [open]);

  if (!win) return null;

  return (
    <section className="section fleet-pane" aria-labelledby="fleet-pane-title">
      <Container>
        <div className="fleet-pane__head">
          <h2 id="fleet-pane-title" className="fleet-pane__title">
            {copy.heading}
          </h2>
          <p className="fleet-pane__lead">{win.lead}</p>
        </div>
        <button
          ref={frameRef}
          type="button"
          className="fleet-pane__frame"
          onClick={openViewer}
          aria-label={`${win.openLabel}: ${win.alt}`}
        >
          <span className="fleet-pane__pane">
            <Picture image={win.image} alt="" className="fleet-pane__img" />
          </span>
          <span className="fleet-pane__hint">{win.openLabel}</span>
        </button>
        <div className="fleet-pane__foot">
          <p className="fleet-pane__caption">{win.caption}</p>
          <Link className="fleet-pane__link" href={win.galleryHref}>
            {win.galleryLabel}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </Container>

      {open
        ? createPortal(
            <div
              ref={viewerRef}
              className="fleet-viewer"
              role="dialog"
              aria-modal="true"
              aria-label={win.caption}
              tabIndex={-1}
            >
              <div ref={trackRef} className="fleet-viewer__track">
                {shots.map((shot, i) => (
                  <div key={shot.image} className="fleet-viewer__slide" aria-hidden={i !== index}>
                    <Picture image={shot.image} alt={shot.alt} />
                  </div>
                ))}
              </div>
              <div className="fleet-viewer__bar">
                <span className="fleet-viewer__count">
                  {index + 1} / {shots.length}
                </span>
                <span className="fleet-viewer__caption">{win.caption}</span>
                <button type="button" className="fleet-viewer__close" onClick={closeViewer} aria-label="Close">
                  &times;
                </button>
              </div>
              {shots.length > 1 ? (
                <>
                  <button type="button" className="fleet-viewer__nav fleet-viewer__nav--prev" onClick={() => go(index - 1)} aria-label="Previous photo">
                    &larr;
                  </button>
                  <button type="button" className="fleet-viewer__nav fleet-viewer__nav--next" onClick={() => go(index + 1)} aria-label="Next photo">
                    &rarr;
                  </button>
                </>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
