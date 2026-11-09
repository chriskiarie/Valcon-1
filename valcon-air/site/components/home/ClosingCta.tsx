"use client";

import Container from "@/components/Container";
import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";
import { emailHref, whatsappHref } from "@/lib/contact";
import { getSite } from "@/lib/content";
import { registerFlybyTriggers } from "@/components/flyby/FlybyLayer";

export default function ClosingCta() {
  const site = getSite();
  const showWhatsApp = Boolean(site.whatsapp);
  const showEmail = Boolean(site.email);
  const closingBandRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (closingBandRef.current) {
      registerFlybyTriggers({ closingBand: closingBandRef.current });
    }
  }, []);

  return (
    <section className="home-section">
      <Container>
        <Reveal variant="left">
          <div ref={closingBandRef} className="closing-band on-dark">
            <p className="eyebrow">Start a conversation</p>
            <h2 className="band-title">Request a quote</h2>
            <p className="band-note">
              Tell us your route, dates and passenger count, and the team will respond with availability.
            </p>
            <div className="quote-actions">
              {showWhatsApp && (
                <a
                  className="btn btn--on-dark"
                  href={whatsappHref(site.whatsapp)}
                  rel="noreferrer"
                  target="_blank"
                >
                  WhatsApp
                </a>
              )}
              {showEmail && (
                <a className="btn btn--outline" href={emailHref(site.email)}>
                  Email
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}