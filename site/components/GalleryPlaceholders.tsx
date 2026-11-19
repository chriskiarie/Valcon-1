import { Fragment } from "react";

export type GalleryPlaceholder = { label: string; size: string };

/** Frosted tiles that hold a place for photos that have not arrived yet. */
export function GalleryPlaceholders({ items, bare = false }: { items: GalleryPlaceholder[]; bare?: boolean }) {
  const Wrap = bare ? Fragment : "ul";
  const wrapProps = bare ? {} : { className: "gal" };
  return (
    <Wrap {...wrapProps}>
      {items.map((it, i) => (
        <li key={it.label} className={`gal__cell${it.size ? ` gal__cell--${it.size}` : ""}`} style={{ ["--i" as string]: i }}>
          <div className="gal__tile gal__tile--empty">
            <svg className="gal__empty-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M8 16h8l3-5h10l3 5h8a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2z" />
              <circle cx="24" cy="26" r="7" />
            </svg>
            <span className="gal__empty-label">{it.label}</span>
            <span className="gal__empty-note">Photo to follow</span>
          </div>
        </li>
      ))}
    </Wrap>
  );
}
