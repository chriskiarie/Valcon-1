/** Illustration for the quote card: the Valcon jet mark in white over a soft glow. */
export function ClosingArt() {
  return (
    <div className="closing__art" aria-hidden="true">
      <span className="closing__art-glow" />
      <picture>
        <source type="image/webp" srcSet="/images/brand/jet-mark.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="closing__art-img" src="/images/brand/jet-mark.png" alt="" width={900} height={539} loading="lazy" decoding="async" />
      </picture>
    </div>
  );
}
