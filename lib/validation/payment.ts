import { z } from "zod";

/** ~300 KB decoded once base64 overhead is accounted for. */
const MAX_QR_CHARS = 400_000;

export const paymentMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("instapay_link"),
    label: z.string().trim().min(1).max(60),
    value: z
      .url()
      .max(500)
      .refine((u) => u.startsWith("https://"), "Must be an https link."),
  }),
  z.object({
    type: z.literal("instapay_qr"),
    label: z.string().trim().min(1).max(60),
    // PNG/JPEG/WebP only. SVG is excluded on purpose: this value is rendered
    // into <img src>, and an SVG data URL can carry a <script> — stored XSS.
    value: z
      .string()
      .regex(
        /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/,
        "Must be a PNG, JPEG, or WebP image.",
      )
      .max(MAX_QR_CHARS, "That image is too large."),
  }),
  z.object({
    type: z.literal("instapay_username"),
    label: z.string().trim().min(1).max(60),
    // An InstaPay address like `name@instapay`. Kept deliberately loose — it's
    // shown as copy-to-paste text, never rendered as HTML or a link. No spaces.
    value: z
      .string()
      .trim()
      .min(3, "That's too short.")
      .max(100)
      .regex(
        /^[A-Za-z0-9._@+-]+$/,
        "Use letters, numbers, and . _ @ + - only.",
      ),
  }),
]);

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
