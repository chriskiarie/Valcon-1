// Web3Forms access key (public by design). It emails each enquiry to the inbox the key was issued for.
// When it is not set, the forms fall back to opening the visitor's email app.
export const FORM_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const FORM_URL = "https://api.web3forms.com/submit";

export type SendResult = "sent" | "failed" | "unavailable";

export async function sendEnquiry(input: { subject: string; name: string; email: string; message: string }): Promise<SendResult> {
  if (!FORM_KEY) return "unavailable";
  try {
    const response = await fetch(FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: FORM_KEY,
        subject: input.subject,
        from_name: "Valcon Air website",
        name: input.name,
        email: input.email || undefined,
        message: input.message,
        botcheck: "",
      }),
    });
    const result = (await response.json()) as { success?: boolean };
    return response.ok && result.success ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
