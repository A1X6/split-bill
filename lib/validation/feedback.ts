import { z } from "zod";

export const FEEDBACK_CATEGORIES = [
  "feature",
  "bug",
  "question",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_MAX = 2000;

export const feedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(FEEDBACK_MAX, `Keep it under ${FEEDBACK_MAX} characters.`),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
