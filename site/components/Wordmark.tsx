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
}: {
  site: Site;
  asLink?: boolean;
  variant?: "compact" | "full";
}) {
  const logo = variant === "compact" ? (site.logoCompact ?? site.logo) : site.logo;
  const inner = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`wordmark__image wordmark__image--${variant}`}
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      decoding="async"
    />
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
