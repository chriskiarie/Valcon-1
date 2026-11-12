import type { Site } from "@/lib/types";

export function hasPhone(site: Site) {
  return site.phoneTel.trim().length > 0;
}

export function hasWhatsapp(site: Site) {
  return site.whatsapp.trim().length > 0;
}

export function hasEmail(site: Site) {
  return site.email.trim().length > 0;
}

export function hasDirectContact(site: Site) {
  return hasPhone(site) || hasWhatsapp(site) || hasEmail(site);
}

/** WhatsApp number must be digits only (country code, no plus). */
export function whatsappHref(site: Site, text?: string) {
  const number = site.whatsapp.replace(/\D/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${number}${query}`;
}

export function mailtoHref(site: Site, subject?: string, body?: string) {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${site.email.trim()}${params.length ? `?${params.join("&")}` : ""}`;
}

export function aircraftMessage(site: Site, aircraftName: string) {
  return site.messages.whatsappAircraft.replace("{aircraft}", aircraftName);
}
