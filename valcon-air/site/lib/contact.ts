export const WHATSAPP_MESSAGE =
  "Hello Valcon Air, I’d like to enquire about a flight.";

export function whatsappHref(number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

export function emailHref(email: string): string {
  const address = email.replace(/^\[placeholder\]\s*/i, "").trim();
  return `mailto:${address}`;
}
