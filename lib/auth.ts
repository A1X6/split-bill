import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "./db";
import { sendEmail } from "./email";
import { resetPasswordEmail, verifyEmail } from "./email/templates";
import {
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_PATTERN,
} from "./validation/username";

// Google sign-in only activates once credentials are configured, so the app
// still runs (email/password only) before the OAuth client is set up.
const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // No sign-in until the address is confirmed. A sign-in attempt with an
    // unverified email is rejected (403) and re-sends the link (sendOnSignIn).
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const sent = await sendEmail({
        to: user.email,
        subject: "Reset your Splitza password",
        html: resetPasswordEmail({ name: user.name, url }),
      });
      // Without a verified Resend domain the email never arrives. Printing the
      // link keeps the flow testable in development — but never in production,
      // where logging a reset token would be a credential leak.
      if (!sent && process.env.NODE_ENV !== "production") {
        console.log(`[dev] Password reset link for ${user.email}: ${url}`);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const sent = await sendEmail({
        to: user.email,
        subject: "Verify your Splitza email",
        html: verifyEmail({ name: user.name, url }),
      });
      // Same dev fallback as password reset — printed only outside production.
      if (!sent && process.env.NODE_ENV !== "production") {
        console.log(`[dev] Verification link for ${user.email}: ${url}`);
      }
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // link valid for one hour
  },
  // Server-side throttle on the email-sending endpoints (best-effort in-memory,
  // per instance). The client resend button adds a visible cooldown on top.
  // enabled:true forces it on in development too — better-auth otherwise only
  // rate-limits in production, which would leave the resend endpoint unthrottled
  // whenever the app runs in dev.
  rateLimit: {
    enabled: true,
    customRules: {
      "/send-verification-email": { window: 300, max: 3 },
      "/sign-in/email": { window: 60, max: 10 },
      "/forget-password": { window: 300, max: 3 },
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  plugins: [
    username({
      minUsernameLength: USERNAME_MIN,
      maxUsernameLength: USERNAME_MAX,
      // The plugin's default validator also allows dots; ours matches the app's
      // [a-z0-9_] rule so a direct API call can't create a handle the UI would
      // later reject. Lowercased first because the plugin stores it lowercased.
      usernameValidator: (value) => USERNAME_PATTERN.test(value.toLowerCase()),
    }),
  ],
});
