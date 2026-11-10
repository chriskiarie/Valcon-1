import { Button } from "@/components/Button";
import { getSite } from "@/lib/content";

export function ClosingCTA() {
  const site = getSite();
  const hasWhatsapp = site.whatsapp.trim().length > 0;
  const hasEmail = site.email.trim().length > 0;

  return (
    <div className="closing" data-flyby-trigger="final" data-reveal="below">
      <span className="eyebrow">Start a conversation</span>
      <h2 className="closing__title" data-flyby-avoid>Request a quote</h2>
      <p className="closing__support" data-flyby-avoid>
        Tell us where you are going and the shape of the trip. We will take it from there.
      </p>
      <div className="closing__actions" data-flyby-avoid>
        <Button href="/contact/#quote" variant="on-dark">
          Start an enquiry
        </Button>
        {hasWhatsapp ? (
          <Button
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
              "Hello Valcon Air, I’d like to enquire about a flight.",
            )}`}
            variant="on-dark-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </Button>
        ) : null}
        {hasEmail ? (
          <Button href={`mailto:${site.email}`} variant="on-dark-outline">
            Email
          </Button>
        ) : null}
        {!hasWhatsapp && !hasEmail ? (
          <Button href="/fleet/" variant="on-dark-outline">
            View the fleet
          </Button>
        ) : null}
      </div>
    </div>
  );
}
