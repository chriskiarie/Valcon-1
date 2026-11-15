import { getSite } from "@/lib/content";
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
      className="socials-card__tile"
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
    >
      <span className="socials-card__icon" aria-hidden="true">
        {icon ? (
          <svg viewBox={icon.viewBox} xmlns="http://www.w3.org/2000/svg">
            <path d={icon.path} />
          </svg>
        ) : (
          <span className="socials-card__initial">{label.slice(0, 2)}</span>
        )}
      </span>
    </a>
  );
}

export function SocialsCard() {
  const site = getSite();
  const socials = (site.socials ?? [])
    .filter((social) => social.href?.trim())
    .slice(0, MAX_SOCIALS);

  // Nothing to show until the client supplies their account links.
  if (!socials.length) return null;

  return (
    <div className="socials-card-wrap" data-reveal="below">
      <div className="socials-card">
        <div className="socials-card__wash" aria-hidden="true" />
        <div className="socials-card__body">
          <p className="socials-card__label">Socials</p>
          <nav className="socials-card__links" aria-label="Valcon on social media">
            {socials.map((social) => (
              <SocialTile key={social.href} social={social} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
