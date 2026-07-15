"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  disputeShare,
  markSharePaid,
  unmarkSharePaid,
} from "@/lib/actions/shares";

/**
 * The recipient's controls on a shared bill. Pending → "I've paid" / "Dispute";
 * once paid (before the owner confirms) → an undo. Confirmed/declined render
 * nothing — the page shows a static message instead.
 */
export default function RecipientActions({
  shareId,
  status,
}: {
  shareId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    success: string,
  ) =>
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }
      toast.success(success);
      router.refresh();
    });

  if (status === "pending") {
    return (
      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1"
          disabled={pending}
          onClick={() => run(() => markSharePaid(shareId), "Marked as paid.")}
        >
          <Check data-icon="inline-start" />
          I&apos;ve paid
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={pending}
          onClick={() => run(() => disputeShare(shareId), "Marked as disputed.")}
        >
          <X data-icon="inline-start" />
          Dispute
        </Button>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => run(() => unmarkSharePaid(shareId), "Undone.")}
      >
        <Undo2 data-icon="inline-start" />
        Undo — I haven&apos;t paid yet
      </Button>
    );
  }

  return null;
}
