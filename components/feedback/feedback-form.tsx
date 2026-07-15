"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendFeedback } from "@/lib/actions/feedback";
import { FEEDBACK_MAX } from "@/lib/validation/feedback";

const CATEGORIES = [
  { value: "feature", label: "Feature idea" },
  { value: "bug", label: "Bug" },
  { value: "question", label: "Question" },
  { value: "other", label: "Other" },
] as const;

const MIN = 10;

export default function FeedbackForm() {
  const [category, setCategory] = useState<string>("feature");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const tooShort = message.trim().length < MIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tooShort) return;
    setLoading(true);
    const result = await sendFeedback({ category, message: message.trim() });
    setLoading(false);
    if (result.ok) {
      toast.success("Thanks — your feedback is on its way.");
      setMessage("");
      setCategory("feature");
    } else {
      toast.error(result.error ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>What&apos;s this about?</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.value}
              type="button"
              size="sm"
              variant={category === c.value ? "default" : "outline"}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your message</Label>
        <Textarea
          id="message"
          required
          rows={6}
          maxLength={FEEDBACK_MAX}
          placeholder="What would make Splitza better? A feature you wish existed, something confusing, or a bug you hit…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="text-right text-xs text-muted-foreground tabular-nums">
          {message.length}/{FEEDBACK_MAX}
        </p>
      </div>

      <Button type="submit" size="lg" disabled={loading || tooShort}>
        {loading ? "Sending…" : "Send feedback"}
      </Button>
    </form>
  );
}
