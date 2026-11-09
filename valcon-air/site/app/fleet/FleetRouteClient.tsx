"use client";

import { useState } from "react";
import Container from "@/components/Container";
import FleetPage from "@/components/home/FleetPage";
import FleetModal from "@/components/home/FleetModal";

export default function FleetRouteClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlug, setModalSlug] = useState<string | undefined>(undefined);

  // Hash deep link support
  if (typeof window !== "undefined") {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setModalSlug(hash);
      setModalOpen(true);
    }
  }

  return (
    <div className="page-shell">
      <Container>
        <div className="page-intro">
          <p className="eyebrow">Aircraft</p>
          <h1 className="page-title">Our Fleet</h1>
          <p className="page-description">
            Aircraft operated by Valcon Air, based at Wilson Airport, Nairobi.
          </p>
        </div>

        <FleetPage onCardClick={(slug) => {
          setModalSlug(slug);
          setModalOpen(true);
        }} />

        <FleetModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          initialSlug={modalSlug}
        />
      </Container>
    </div>
  );
}