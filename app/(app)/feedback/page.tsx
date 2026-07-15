import FeedbackForm from "@/components/feedback/feedback-form";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Send feedback",
};

export default async function FeedbackPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading mb-2 text-2xl font-bold tracking-tight">
        Send feedback
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ideas, bugs, or a feature you wish existed — it comes straight to us and
        shapes what we build next.
      </p>
      <div className="rounded-2xl border p-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
