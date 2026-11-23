"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryItem = { image: string; ext: string; alt: string; caption: string; size: string; focus?: string; fit?: string };

function Pic({ item, className }: { item: GalleryItem; className?: string }) {
  const style = item.focus ? { objectPosition: item.focus } : undefined;
  return (
    <picture>
      <source type="image/avif" srcSet={`${item.image}.avif`} />
      {item.ext !== "webp" ? <source type="image/webp" srcSet={`${item.image}.webp`} /> : null}
      <img className={`${className ?? ""}${item.fit === "contain" ? " is-contain" : ""}`} style={style} src={`${item.image}.${item.ext}`} alt={item.alt} decoding="async" />
    </picture>
  );
}

/** An uneven grid of frosted-glass tiles. Click one for a glass lightbox. */
export function GalleryGrid({ items, extra }: { items: GalleryItem[]; extra?: React.ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const step = useCallback(
    (by: number) => setOpen((i) => (i === null ? i : (i + by + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    boxRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  // While the lightbox is open the header folds away into a single drop (see .site-header in globals.css).
  const viewing = open !== null;
  useEffect(() => {
    if (!viewing) return;
    document.documentElement.dataset.lightbox = "open";
    return () => {
      delete document.documentElement.dataset.lightbox;
    };
  }, [viewing]);

  const item = open === null ? null : items[open];

  return (
    <>
      <ul className="gal">
        {items.map((it, i) => (
          <li key={it.image} className={`gal__cell${it.size ? ` gal__cell--${it.size}` : ""}`} style={{ ["--i" as string]: i }}>
            <button type="button" className="gal__tile" onClick={() => setOpen(i)} aria-label={`Open: ${it.alt}`}>
              <Pic item={it} className="gal__img" />
              <span className="gal__chip">{it.caption}</span>
            </button>
          </li>
        ))}
        {extra}
      </ul>

      {item ? (
        <div
          ref={boxRef}
          className="gal-box"
          role="dialog"
          aria-modal="true"
          aria-label={item.caption}
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(null);
          }}
        >
          <figure className="gal-box__fig">
            <Pic item={{ ...item }} className="gal-box__img" key={item.image} />
            <figcaption className="gal-box__cap">
              <span>{item.caption}</span>
              <span>
                {(open ?? 0) + 1} / {items.length}
              </span>
            </figcaption>
          </figure>
          <button type="button" className="gal-box__btn gal-box__close" onClick={() => setOpen(null)} aria-label="Close">
            &times;
          </button>
          {items.length > 1 ? (
            <>
              <button type="button" className="gal-box__btn gal-box__prev" onClick={() => step(-1)} aria-label="Previous photo">
                &larr;
              </button>
              <button type="button" className="gal-box__btn gal-box__next" onClick={() => step(1)} aria-label="Next photo">
                &rarr;
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
