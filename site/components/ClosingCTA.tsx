import { Button } from "@/components/Button";
import { getHome, getSite } from "@/lib/content";
import { ClosingArt } from "@/components/ClosingArt";
import { hasEmail, hasPhone, hasWhatsapp, whatsappHref } from "@/lib/contact";

export function ClosingCTA() {
  const site = getSite();
  const { closing } = getHome();
  const whatsapp = hasWhatsapp(site);
  const email = hasEmail(site);

  return (
    <div className="closing" data-reveal="below">
      <div className="closing__main">
        <span className="eyebrow">{closing.eyebrow}</span>
      <h2 className="closing__title" data-flyby-avoid>{closing.title}</h2>
      <p className="closing__support" data-flyby-avoid>
        {closing.support}
      </p>
      <div className="closing__actions" data-flyby-avoid>
        <Button href="/quote/" variant="on-dark">
          {closing.primaryCta}
        </Button>
        {whatsapp ? (
          <Button
            href={whatsappHref(site, site.messages.whatsappGeneral)}
            variant="on-dark-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </Button>
        ) : null}
        {hasPhone(site) ? (
          <Button href={`tel:${site.phoneTel}`} variant="on-dark-outline">
            Call us
          </Button>
        ) : null}
        {!whatsapp && !email && !hasPhone(site) ? (
          <Button href="/fleet/" variant="on-dark-outline">
            View the fleet
          </Button>
        ) : null}
      </div>
      </div>
      <ClosingArt />
    </div>
  );
}
