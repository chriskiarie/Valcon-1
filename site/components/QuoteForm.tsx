"use client";

import { useEffect, useRef, useState } from "react";
import type { Service, Site } from "@/lib/types";
import { hasEmail, mailtoHref } from "@/lib/contact";
import { EMAIL_RE, FORM_KEY, sendEnquiry } from "@/lib/enquiry";
import { CheckIcon, PlaneIcon, SwapIcon } from "./FormIcons";

type Fields = { name: string; email: string; phone: string; from: string; to: string; date: string; notes: string };
const EMPTY: Fields = { name: "", email: "", phone: "", from: "", to: "", date: "", notes: "" };

/** The trip-details form: choose a service, plan the route, and send for a quote. */
export function QuoteForm({ site, services }: { site: Site; services: Service[] }) {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [pax, setPax] = useState(1);
  const [error, setError] = useState("");
  const [state, setState] = useState<"" | "sending" | "sent" | "mail">("");
  const chipsRef = useRef<HTMLFieldSetElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // A services card links here as /quote/?service=<slug>. Tick that chip once, without making the group controlled.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("service");
    if (!slug) return;
    const input = chipsRef.current?.querySelector<HTMLInputElement>(`input[value="${CSS.escape(slug)}"]`);
    if (input) input.checked = true;
  }, []);

  const set = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  function chosenService() {
    const slug = chipsRef.current?.querySelector<HTMLInputElement>("input:checked")?.value ?? "";
    return services.find((item) => item.slug === slug)?.title ?? "";
  }

  function buildMessage() {
    const route = [form.from.trim(), form.to.trim()].filter(Boolean).join(" to ");
    return [
      "Hello Valcon Air,",
      "",
      "I would like a quote.",
      "",
      chosenService() ? `Service: ${chosenService()}` : "",
      route ? `Route: ${route}` : "",
      form.date ? `Date: ${form.date}` : "",
      `Passengers: ${pax}`,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
      "",
      `Name: ${form.name.trim()}`,
      form.email.trim() ? `Email: ${form.email.trim()}` : "",
      form.phone.trim() ? `Phone: ${form.phone.trim()}` : "",
    ]
      .filter((line, index, all) => !(line === "" && (index === 0 || all[index - 1] === "")))
      .join("\n");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    if (!form.name.trim()) return setError("Please add your name.");
    if (!form.email.trim() && !form.phone.trim()) return setError("Add an email address or a phone number so we can reply.");
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) return setError("That email address does not look right.");
    const trap = event.currentTarget.elements.namedItem("botcheck") as HTMLInputElement | null;
    if (trap?.checked) return;

    const subject = `Quote request - ${form.name.trim()}`;
    if (!FORM_KEY) {
      if (hasEmail(site)) {
        window.location.href = mailtoHref(site, subject, buildMessage());
        setState("mail");
      }
      return;
    }
    setState("sending");
    const result = await sendEnquiry({ subject, name: form.name.trim(), email: form.email.trim(), message: buildMessage() });
    if (result === "sent") {
      setState("sent");
      setForm(EMPTY);
      setPax(1);
    } else {
      setState("");
      setError(`We could not send that just now. Please try again, or email ${site.email} or call ${site.phone}.`);
    }
  }

  if (state === "sent") {
    return (
      <div className="fx-done" role="status">
        <span className="fx-done__tick"><CheckIcon /></span>
        <h3>Quote request sent.</h3>
        <p>Thank you. Our team will reply with a clear, tailored quote during office hours.</p>
        <button type="button" className="fx-link" onClick={() => setState("")}>Send another request</button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="fx" onSubmit={onSubmit} noValidate>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="fx-hp" />

      <fieldset className="fx-chips" ref={chipsRef}>
        <legend>What do you need?</legend>
        {services.map((service) => (
          <label key={service.slug} className="fx-chip">
            <input type="radio" name="service" value={service.slug} />
            <span>{service.title}</span>
          </label>
        ))}
      </fieldset>

      <div className="fx-route">
        <div className="fx-field">
          <label htmlFor="fx-from">Flying from</label>
          <input id="fx-from" placeholder="Wilson Airport" value={form.from} onChange={set("from")} />
        </div>
        <button
          type="button"
          className="fx-swap"
          aria-label="Swap origin and destination"
          onClick={() => setForm((c) => ({ ...c, from: c.to, to: c.from }))}
        >
          <SwapIcon />
        </button>
        <div className="fx-field">
          <label htmlFor="fx-to">Flying to</label>
          <input id="fx-to" placeholder="Mombasa" value={form.to} onChange={set("to")} />
        </div>
      </div>

      <div className="fx-row">
        <div className="fx-field">
          <label htmlFor="fx-date">Travel date</label>
          <input id="fx-date" type="date" value={form.date} onChange={set("date")} />
        </div>
        <div className="fx-field">
          <span className="fx-label" id="fx-pax-label">Passengers</span>
          <div className="fx-step" role="group" aria-labelledby="fx-pax-label">
            <button type="button" onClick={() => setPax((n) => Math.max(1, n - 1))} aria-label="Fewer passengers">&minus;</button>
            <output aria-live="polite">{pax}</output>
            <button type="button" onClick={() => setPax((n) => Math.min(50, n + 1))} aria-label="More passengers">+</button>
          </div>
        </div>
      </div>

      <div className="fx-row">
        <div className="fx-field">
          <label htmlFor="fx-name">Your name</label>
          <input id="fx-name" autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="fx-field">
          <label htmlFor="fx-phone">Phone or WhatsApp</label>
          <input id="fx-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+254 ..." value={form.phone} onChange={set("phone")} />
        </div>
      </div>

      <div className="fx-row">
        <div className="fx-field">
          <label htmlFor="fx-email">Email</label>
          <input id="fx-email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
        </div>
        <div className="fx-field">
          <label htmlFor="fx-notes">Notes</label>
          <input id="fx-notes" placeholder="Luggage, return flight, special requests" value={form.notes} onChange={set("notes")} />
        </div>
      </div>

      <p className="fx-status" role="status" aria-live="polite" data-state={error ? "error" : state === "mail" ? "ok" : ""}>
        {error || (state === "mail" ? `Your email app should have opened with the request ready to send. If not, write to ${site.email}.` : "")}
      </p>

      <button type="submit" className="fx-submit" disabled={state === "sending"}>
        <span>{state === "sending" ? "Sending..." : "Send quote request"}</span>
        <PlaneIcon />
      </button>
    </form>
  );
}
