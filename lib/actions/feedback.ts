"use server";

import { sendEmail } from "@/lib/email";
import { feedbackEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/ratelimit";
import { requireUser } from "@/lib/session";
import { feedbackSchema } from "@/lib/validation/feedback";

type Result = { ok: boolean; error?: string };

/**
 * In-app feedback from a signed-in user. Rate-limited per user, then emailed to
 * the app owner (FEEDBACK_EMAIL) via Resend — from the app's verified sender,
 * with the user's address as reply-to so a reply reaches them directly. The
 * user's identity comes from the session, never the client.
 */
export async function sendFeedback(input: {
  category: string;
  message: string;
}): Promise<Result> {
  const user = await requireUser();

  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check your message.",
    };
  }

  // 3 submissions per hour per user — a cheap deterrent against spamming.
  if (!rateLimit(`feedback:${user.id}`, 3, 60 * 60 * 1000)) {
    return {
      ok: false,
      error: "You've sent a few already — please try again in a little while.",
    };
  }

  const to = process.env.FEEDBACK_EMAIL;
  if (!to) {
    console.warn(
      "[feedback] FEEDBACK_EMAIL is not set — feedback was not delivered.",
    );
    return {
      ok: false,
      error: "Feedback isn't set up right now. Please try again later.",
    };
  }

  const sent = await sendEmail({
    to,
    replyTo: user.email,
    subject: `Splitza feedback (${parsed.data.category}) from ${user.name}`,
    html: feedbackEmail({
      fromName: user.name,
      fromEmail: user.email,
      fromUsername: user.displayUsername ?? user.username ?? null,
      category: parsed.data.category,
      message: parsed.data.message,
    }),
  });

  if (!sent) {
    return {
      ok: false,
      error: "Couldn't send that just now — please try again in a moment.",
    };
  }

  return { ok: true };
}
