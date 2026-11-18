import Link from "next/link";
import type { Site } from "@/lib/types";

/**
 * The logo image when one is set, otherwise the text wordmark.
 * "compact" is the short, wide logo for the top menu (falls back to the full logo); "full" is the stacked logo.
 */
export function Wordmark({
  site,
  asLink = true,
  variant = "compact",
  reversed = false,
}: {
  site: Site;
  asLink?: boolean;
  variant?: "compact" | "full";
  /** For dark backgrounds: the two-tone white logo, or a white silhouette for an uploaded logo. */
  reversed?: boolean;
}) {
  const logo = variant === "compact" ? (site.logoCompact ?? site.logo) : site.logo;
  // The emblem sits beside the wide logo in the top menu, but only when the wide logo is the name alone.
  const icon = variant === "compact" && site.logoCompact ? site.logoIcon : null;
  const isDefaultLogo = logo?.src === "/images/brand/valcon-logo.png";
  const logoSrc = reversed && isDefaultLogo ? "/images/brand/valcon-logo-white.png" : logo?.src;
  const reversedClass = reversed && !isDefaultLogo ? " wordmark__image--reversed" : "";
  const inner = logo ? (
    <span className="wordmark__lockup">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="wordmark__image wordmark__image--icon"
          src={icon.src}
          alt={icon.alt}
          width={icon.width}
          height={icon.height}
          decoding="async"
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`wordmark__image wordmark__image--${variant}${reversedClass}`}
        src={logoSrc}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        decoding="async"
      />
    </span>
  ) : (
    <>
      <span className="wordmark__valcon">{site.wordmark.primary}</span>
      <span className="wordmark__air">{site.wordmark.secondary}</span>
    </>
  );

  if (!asLink) return <>{inner}</>;
  return (
    <Link className="wordmark" href="/" aria-label={`${site.name} home`}>
      {inner}
    </Link>
  );
}
