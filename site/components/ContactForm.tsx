"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import type { Service, Site } from "@/lib/types";
import { hasEmail, hasWhatsapp, mailtoHref, whatsappHref } from "@/lib/contact";

type Fields = {
  name: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  date: string;
  passengers: string;
  notes: string;
};

// Web3Forms access key (public by design). It emails each enquiry to the inbox the key was issued for.
// When it is not set, the form falls back to opening the visitor's email app.
const FORM_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const FORM_URL = "https://api.web3forms.com/submit";

const EMPTY: Fields = { name: "", email: "", phone: "", from: "", to: "", date: "", passengers: "", notes: "" };

export function ContactForm({ site, services }: { site: Site; services: Service[] }) {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<"" | "email" | "delivered" | "copied">("");
  const [sending, setSending] = useState(false);
  const serviceRef = useRef<HTMLSelectElement>(null);

  // A services card links here as /contact/?service=<slug>. Set the dropdown once, without
  // making it a controlled field, so the first render still matches the server output.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("service");
    const select = serviceRef.current;
    if (!slug || !select) return;
    if (!services.some((item) => item.slug === slug)) return;
    select.value = slug;
  }, [services]);

  const set = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  function buildMessage() {
    const service = serviceRef.current?.value ?? "";
    const serviceTitle = services.find((item) => item.slug === service)?.title;
    const route = [form.from.trim(), form.to.trim()].filter(Boolean).join(" to ");
    return [
      "Hello Valcon Air,",
      "",
      "I would like a quote.",
      "",
      serviceTitle ? `Service: ${serviceTitle}` : "",
      route ? `Route: ${route}` : "",
      form.date ? `Date: ${form.date}` : "",
      form.passengers ? `Passengers: ${form.passengers}` : "",
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
      "",
      `Name: ${form.name.trim()}`,
      form.email.trim() ? `Email: ${form.email.trim()}` : "",
      form.phone.trim() ? `Phone: ${form.phone.trim()}` : "",
    ]
      .filter((line, index, all) => !(line === "" && (index === 0 || all[index - 1] === "")))
      .join("\n");
  }

  function validate(): boolean {
    if (!form.name.trim()) {
      setError("Please add your name.");
      return false;
    }
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (!email && !phone) {
      setError("Add an email address or a phone number so we can reply.");
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email address does not look right.");
      return false;
    }
    return true;
  }

  const canWhatsapp = hasWhatsapp(site);
  const canEmail = hasEmail(site);
  const canSubmit = canEmail || Boolean(FORM_KEY);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate() || sending) return;
    if (FORM_KEY) {
      const honeypot = (event.currentTarget as HTMLFormElement).elements.namedItem("botcheck") as HTMLInputElement | null;
      if (honeypot?.checked) return;
      setSending(true);
      try {
        const response = await fetch(FORM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: FORM_KEY,
            subject: `Quote request - ${form.name.trim()}`,
            from_name: "Valcon Air website",
            name: form.name.trim(),
            email: form.email.trim() || undefined,
            message: buildMessage(),
            botcheck: "",
          }),
        });
        const result = (await response.json()) as { success?: boolean };
        if (!response.ok || !result.success) throw new Error("rejected");
        setSent("delivered");
        setForm(EMPTY);
        if (serviceRef.current) serviceRef.current.value = "";
      } catch {
        setError(`We could not send that just now. Please try again, or email ${site.email} or call ${site.phone}.`);
      } finally {
        setSending(false);
      }
      return;
    }
    if (canEmail) {
      window.location.href = mailtoHref(site, `Quote request - ${form.name.trim()}`, buildMessage());
      setSent("email");
    }
  }

  function onWhatsApp() {
    if (!validate()) return;
    window.open(whatsappHref(site, buildMessage()), "_blank", "noopener,noreferrer");
  }

  async function onCopy() {
    if (!validate()) return;
    try {
      await navigator.clipboard.writeText(buildMessage());
      setSent("copied");
    } catch {
      setError("Could not copy. Please email or call us instead.");
    }
  }

  return (
    <form className="qf" onSubmit={onSubmit} noValidate>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="qf__hp" />
      <div className="qf__grid">
        <div className="qf__field">
          <label htmlFor="qf-name">Your name</label>
          <input id="qf-name" name="name" autoComplete="name" required value={form.name} onChange={set("name")} />
        </div>
        <div className="qf__field">
          <label htmlFor="qf-email">Email</label>
          <input
            id="qf-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
          />
        </div>
        <div className="qf__field">
          <label htmlFor="qf-phone">Phone or WhatsApp</label>
          <input
            id="qf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+254 ..."
            value={form.phone}
            onChange={set("phone")}
          />
        </div>
        <div className="qf__field">
          <label htmlFor="qf-service">Service</label>
          <select ref={serviceRef} id="qf-service" name="service" defaultValue="">
            <option value="">Not sure yet</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
        <div className="qf__field">
          <label htmlFor="qf-from">Flying from</label>
          <input id="qf-from" name="from" placeholder="e.g. Wilson Airport" value={form.from} onChange={set("from")} />
        </div>
        <div className="qf__field">
          <label htmlFor="qf-to">Flying to</label>
          <input id="qf-to" name="to" placeholder="e.g. Mombasa" value={form.to} onChange={set("to")} />
        </div>
        <div className="qf__field">
          <label htmlFor="qf-date">Travel date</label>
          <input id="qf-date" name="date" type="date" value={form.date} onChange={set("date")} />
        </div>
        <div className="qf__field">
          <label htmlFor="qf-pax">Passengers</label>
          <input
            id="qf-pax"
            name="passengers"
            type="number"
            min="1"
            max="50"
            inputMode="numeric"
            value={form.passengers}
            onChange={set("passengers")}
          />
        </div>
        <div className="qf__field qf__field--full qf__field--notes">
          <label htmlFor="qf-notes">Notes</label>
          <textarea
            id="qf-notes"
            name="notes"
            rows={1}
            placeholder="Luggage, return flight, special requests..."
            value={form.notes}
            onChange={set("notes")}
          />
        </div>
      </div>

      <p className="qf__status" role="status" aria-live="polite" data-state={error ? "error" : sent ? "ok" : ""}>
        {error ||
          (sent === "delivered"
            ? "Thank you. Your quote request has been sent and we will reply during office hours."
            : sent === "email"
            ? `Your email app should have opened with the quote request ready to send. If nothing opened, write to ${site.email} or tap Copy.`
            : sent === "copied"
              ? "Copied. Paste it into an email or message to us."
              : "")}
      </p>

      <div className="qf__actions">
        {canSubmit ? (
          <Button type="submit" variant="solid" disabled={sending}>
            {sending ? "Sending..." : "Send quote request"}
          </Button>
        ) : null}
        {canWhatsapp ? (
          <Button variant="outline" onClick={onWhatsApp} ariaLabel="Send on WhatsApp">
            WhatsApp
          </Button>
        ) : null}
        <button type="button" className="qf__copy" onClick={onCopy}>
          Copy enquiry
        </button>
        {!canWhatsapp && !canSubmit ? <p className="form-unavailable">{site.messages.contactUnconfirmed}</p> : null}
      </div>
      <p className="qf__note">
        {FORM_KEY
          ? "Your request goes straight to our team. We reply during office hours."
          : "This opens your email app with everything filled in. We reply during office hours."}
      </p>
    </form>
  );
}
