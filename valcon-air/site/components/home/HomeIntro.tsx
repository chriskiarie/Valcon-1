"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { getSite } from "@/lib/content";

export default function HomeIntro() {
  const site = getSite();

  return (
    <section className="home-section" id="intro">
      <Container>
        <Reveal variant="right">
          <p className="eyebrow">Valcon Air</p>
          <h1 className="intro-heading">
            Considered, quiet and dependable.
          </h1>
          <p className="intro-base">
            Valcon Air is based at {site.base}.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}