"use client";

import { useState } from "react";
import { Button } from "./Button";
import type { Site } from "@/lib/types";

export function ContactForm({ site }: { site: Site }) {
  const [form, setForm] = useState({
    from: "",
    dates: "",
    passengers: "",
    notes: "",
  });

  const handleWhatsApp = () => {
    const { from, dates, passengers, notes } = form;
    const parts = [
      "Hello,",
      "I am interested in your aviation services.",
      from ? `From: ${from}` : "",
      dates ? `Dates: ${dates}` : "",
      passengers ? `Passengers: ${passengers}` : "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter((s) => s.length > 0)
      .join("\n");

    const url = new URL("https://wa.me/");
    url.searchParams.set("text", encodeURIComponent(parts));
    window.open(url.toString(), "_blank");
  };

  const handleMailto = () => {
    const { from, dates, passengers, notes } = form;
    const subject = "Enquiry - Valcon Air";
    const body = [
      "Hello,",
      "I am interested in your aviation services.",
      from ? `From: ${from}` : "",
      dates ? `Dates: ${dates}` : "",
      passengers ? `Passengers: ${passengers}` : "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter((s) => s.length > 0)
      .join("\n");

    if (!site.email) return;

    const url = new URL(`mailto:${site.email}`);
    url.searchParams.set("subject", encodeURIComponent(subject));
    url.searchParams.set("body", encodeURIComponent(body));
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="enquiry-form" data-reveal="below">
      <h3>Compose your enquiry</h3>

      <div className="form-row">
        <label className="form-label">From (your email or name)</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="form-input"
          value={form.from}
          onChange={(e) =>
            setForm({ ...form, from: e.target.value })
          }
        />
      </div>

      <div className="form-row">
        <label className="form-label">Dates of travel</label>
        <input
          type="date"
          className="form-input"
          value={form.dates}
          onChange={(e) => setForm({ ...form, dates: e.target.value })}
        />
      </div>

      <div className="form-row">
        <label className="form-label">Number of passengers</label>
        <input
          type="number"
          min="1"
          className="form-input"
          value={form.passengers}
          onChange={(e) =>
            setForm({ ...form, passengers: e.target.value })
          }
        />
      </div>

      <div className="form-row">
        <label className="form-label">Notes or special requests</label>
        <textarea
          className="form-input"
          rows={3}
          placeholder="e.g. Sightseeing circuit, photography, etc."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        ></textarea>
      </div>

      <div className="form-actions">
        <Button variant="solid" onClick={handleWhatsApp} ariaLabel="Open WhatsApp">
          WhatsApp
        </Button>
        <Button variant="outline" onClick={handleMailto} ariaLabel="Send email">
          Email
        </Button>
        <Button variant="outline" href="/fleet/" className="ml-auto">
          View fleet
        </Button>
      </div>
    </div>
  );
}