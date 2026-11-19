/** Illustration for the quote card: the Valcon Air logo in white over a soft glow. */
export function ClosingArt() {
  return (
    <div className="closing__art" aria-hidden="true">
      <span className="closing__art-glow" />
      <picture>
        <source type="image/webp" srcSet="/images/brand/valcon-logo-white.webp" />
        <img className="closing__art-img" src="/images/brand/valcon-logo-white.png" alt="" width={640} height={369} loading="lazy" decoding="async" />
      </picture>
    </div>
  );
}
