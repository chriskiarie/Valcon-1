import { getHome, getSite } from "@/lib/content";
import { SOCIAL_ICONS, SOCIAL_LABELS } from "@/lib/socials";
import type { Social } from "@/lib/types";

const MAX_SOCIALS = 6;

function SocialTile({ social }: { social: Social }) {
  const platform = social.platform;
  const known = platform ? platform in SOCIAL_LABELS : false;
  const label = known
    ? SOCIAL_LABELS[platform as keyof typeof SOCIAL_LABELS]
    : social.label?.trim() || "Social link";
  const icon = known
    ? SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS]
    : null;

  return (
    <a
      className="socials-band__tile"
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
    >
      <span className="socials-band__icon" aria-hidden="true">
        {icon ? (
          <svg viewBox={icon.viewBox} xmlns="http://www.w3.org/2000/svg">
            <path d={icon.path} />
          </svg>
        ) : (
          <span className="socials-band__initial">{label.slice(0, 2)}</span>
        )}
      </span>
    </a>
  );
}

/**
 * The socials band under the closing card. It stays out of the page until at
 * least one account has a link, so the client can add them one at a time.
 */
export function SocialsBand() {
  const site = getSite();
  const { socials: copy } = getHome();
  const socials = (site.socials ?? [])
    .filter((social) => social.href?.trim())
    .slice(0, MAX_SOCIALS);

  if (!socials.length) return null;

  return (
    <div className="socials-band-wrap" data-reveal="below">
      <section className="socials-band" aria-label="Social media" data-flyby-avoid>
        {copy.title || copy.line ? (
          <div className="socials-band__copy">
            {copy.title ? (
              <p className="socials-band__title">{copy.title}</p>
            ) : null}
            {copy.line ? <p className="socials-band__line">{copy.line}</p> : null}
          </div>
        ) : null}

        <nav className="socials-band__links" aria-label="Social accounts">
          {socials.map((social) => (
            <SocialTile key={social.href} social={social} />
          ))}
        </nav>
      </section>
    </div>
  );
}
