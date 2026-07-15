import "server-only";
import { Resend } from "resend";

const DEFAULT_FROM = "Splitza <onboarding@resend.dev>";

let client: Resend | null = null;
let warned = false;

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * The base URL for links inside emails. Reuses BETTER_AUTH_URL, which is
 * already required, so email adds no new mandatory config.
 */
export function appUrl(): string {
  return process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

/**
 * Send an email. NEVER throws and NEVER blocks a flow — email is a notification,
 * not a mechanism. Resolves false on any failure (missing key, Resend error,
 * network throw).
 *
 * Note: Resend's onboarding@resend.dev sender only delivers to the account
 * owner's own address. Sending to anyone else returns a 403 error until a
 * domain is verified, which is exactly why this must degrade silently.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (!warned) {
      warned = true;
      console.warn(
        "[email] RESEND_API_KEY is not set — email notifications are disabled.",
      );
    }
    return false;
  }

  client ??= new Resend(key);

  try {
    // Resend returns { data, error } rather than throwing on API failures, but
    // a network fault still throws — hence both the error check and the catch.
    const { error } = await client.emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.warn(`[email] send failed: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      `[email] send threw: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}
