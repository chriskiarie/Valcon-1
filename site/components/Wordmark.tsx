import Link from "next/link";
import type { Site } from "@/lib/types";

/** Logo image when the client has uploaded one, otherwise the text wordmark. */
export function Wordmark({ site, asLink = true }: { site: Site; asLink?: boolean }) {
  const inner = site.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="wordmark__image"
      src={site.logo.src}
      alt={site.logo.alt}
      width={site.logo.width}
      height={site.logo.height}
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
