"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { respondToShare } from "@/lib/actions/shares";

export default function ShareActions({ shareId }: { shareId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const respond = (action: "accept" | "decline") => {
    startTransition(async () => {
      const result = await respondToShare(shareId, action);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "accept" ? "Marked as accepted." : "Declined.");
      router.refresh();
    });
  };

  return (
    <div className="flex gap-3">
      <Button
        type="button"
        className="flex-1"
        disabled={pending}
        onClick={() => respond("accept")}
      >
        <Check data-icon="inline-start" />
        Accept
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        disabled={pending}
        onClick={() => respond("decline")}
      >
        <X data-icon="inline-start" />
        Decline
      </Button>
    </div>
  );
}
