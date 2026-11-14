import { Button } from "@/components/Button";
import { getHome, getSite } from "@/lib/content";
import { hasEmail, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";

export function ClosingCTA() {
  const site = getSite();
  const { closing } = getHome();
  const whatsapp = hasWhatsapp(site);
  const email = hasEmail(site);

  return (
    <div className="closing" data-reveal="below">
      <span className="eyebrow">{closing.eyebrow}</span>
      <h2 className="closing__title" data-flyby-avoid>{closing.title}</h2>
      <p className="closing__support" data-flyby-avoid>
        {closing.support}
      </p>
      <div className="closing__actions" data-flyby-avoid>
        <Button href="/contact/#quote" variant="on-dark">
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
        {email ? (
          <Button href={mailtoHref(site)} variant="on-dark-outline">
            Email
          </Button>
        ) : null}
        {!whatsapp && !email ? (
          <Button href="/fleet/" variant="on-dark-outline">
            View the fleet
          </Button>
        ) : null}
      </div>
    </div>
  );
}
