"use client";

import { useState } from "react";
import type { Site } from "@/lib/types";
import { hasEmail, mailtoHref } from "@/lib/contact";
import { EMAIL_RE, FORM_KEY, sendEnquiry } from "@/lib/enquiry";
import { CheckIcon, PlaneIcon } from "./FormIcons";

type Fields = { name: string; reply: string; message: string };
const EMPTY: Fields = { name: "", reply: "", message: "" };

/** A short message form for general questions. Trip quotes live on the quote page. */
export function ContactForm({ site }: { site: Site }) {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [error, setError] = useState("");
  const [state, setState] = useState<"" | "sending" | "sent" | "mail">("");

  const set = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const reply = form.reply.trim();
    if (!form.name.trim()) return setError("Please add your name.");
    if (!reply) return setError("Add an email address or phone number so we can reply.");
    if (reply.includes("@") && !EMAIL_RE.test(reply)) return setError("That email address does not look right.");
    if (!form.message.trim()) return setError("Write us a short message.");
    const trap = event.currentTarget.elements.namedItem("botcheck") as HTMLInputElement | null;
    if (trap?.checked) return;

    const subject = `Website message - ${form.name.trim()}`;
    const message = `${form.message.trim()}\n\nName: ${form.name.trim()}\nReply to: ${reply}`;
    if (!FORM_KEY) {
      if (hasEmail(site)) {
        window.location.href = mailtoHref(site, subject, message);
        setState("mail");
      }
      return;
    }
    setState("sending");
    const result = await sendEnquiry({ subject, name: form.name.trim(), email: reply.includes("@") ? reply : "", message });
    if (result === "sent") {
      setState("sent");
      setForm(EMPTY);
    } else {
      setState("");
      setError(`We could not send that just now. Please try again, or email ${site.email} or call ${site.phone}.`);
    }
  }

  if (state === "sent") {
    return (
      <div className="fx-done" role="status">
        <span className="fx-done__tick"><CheckIcon /></span>
        <h3>Message sent.</h3>
        <p>Thank you. We will be in touch shortly.</p>
        <button type="button" className="fx-link" onClick={() => setState("")}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="fx" onSubmit={onSubmit} noValidate>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="fx-hp" />
      <div className="fx-row">
        <div className="fx-field">
          <label htmlFor="cf-name">Your name</label>
          <input id="cf-name" autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="fx-field">
          <label htmlFor="cf-reply">Email or phone</label>
          <input id="cf-reply" autoComplete="email" placeholder="How should we reply?" value={form.reply} onChange={set("reply")} />
        </div>
      </div>
      <div className="fx-field">
        <label htmlFor="cf-msg">Message</label>
        <textarea id="cf-msg" rows={4} placeholder="How can we help?" value={form.message} onChange={set("message")} />
      </div>
      <p className="fx-status" role="status" aria-live="polite" data-state={error ? "error" : state === "mail" ? "ok" : ""}>
        {error || (state === "mail" ? `Your email app should have opened with the message ready to send. If not, write to ${site.email}.` : "")}
      </p>
      <button type="submit" className="fx-submit" disabled={state === "sending"}>
        <span>{state === "sending" ? "Sending..." : "Send message"}</span>
        <PlaneIcon />
      </button>
    </form>
  );
}
