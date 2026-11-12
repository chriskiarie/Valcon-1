"use client";

import { useState } from "react";
import { Button } from "./Button";
import type { Site } from "@/lib/types";
import { hasEmail, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";

export function ContactForm({ site }: { site: Site }) {
  const [form, setForm] = useState({
    from: "",
    dates: "",
    passengers: "",
    notes: "",
  });

  function buildMessage() {
    const { from, dates, passengers, notes } = form;
    return [
      "Hello,",
      "I am interested in your aviation services.",
      from ? `From: ${from}` : "",
      dates ? `Dates: ${dates}` : "",
      passengers ? `Passengers: ${passengers}` : "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter((line) => line.length > 0)
      .join("\n");
  }

  const canWhatsapp = hasWhatsapp(site);
  const canEmail = hasEmail(site);

  const handleWhatsApp = () => {
    if (!canWhatsapp) return;
    window.open(whatsappHref(site, buildMessage()), "_blank", "noopener,noreferrer");
  };

  const handleMailto = () => {
    if (!canEmail) return;
    window.location.href = mailtoHref(site, `Enquiry - ${site.name}`, buildMessage());
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
        {canWhatsapp ? (
          <Button variant="solid" onClick={handleWhatsApp} ariaLabel="Open WhatsApp">
            WhatsApp
          </Button>
        ) : null}
        {canEmail ? (
          <Button variant={canWhatsapp ? "outline" : "solid"} onClick={handleMailto} ariaLabel="Send email">
            Email
          </Button>
        ) : null}
        {!canWhatsapp && !canEmail ? (
          <p className="form-unavailable">{site.messages.contactUnconfirmed}</p>
        ) : null}
        <Button variant="outline" href="/fleet/" className="ml-auto">
          View fleet
        </Button>
      </div>
    </div>
  );
}