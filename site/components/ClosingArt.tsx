/** Illustration for the quote card: the Valcon "V" mark in white over a soft glow. */
export function ClosingArt() {
  return (
    <div className="closing__art" aria-hidden="true">
      <span className="closing__art-glow" />
      <picture>
        <source type="image/webp" srcSet="/images/brand/valcon-v-white.webp" />
        <img className="closing__art-img" src="/images/brand/valcon-v-white.png" alt="" width={338} height={300} loading="lazy" decoding="async" />
      </picture>
    </div>
  );
}
