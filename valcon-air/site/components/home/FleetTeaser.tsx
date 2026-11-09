"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import FleetRow from "@/components/home/FleetRow";

export default function FleetTeaser() {
  const fleetHeadingRef = useRef<HTMLHeadingElement>(null);

  return (
    <section className="home-section" aria-labelledby="fleet-teaser-title">
      <Container>
        <Reveal variant="left">
          <div className="section-heading-row">
            <p className="chapter-label">02 Fleet</p>
            <h2
              ref={fleetHeadingRef}
              className="section-title"
              id="fleet-teaser-title"
            >
              The fleet
            </h2>
            <Link className="text-link" href="/fleet/" prefetch={false}>
              View the fleet
            </Link>
          </div>
          <FleetRow />
        </Reveal>
      </Container>
    </section>
  );
}