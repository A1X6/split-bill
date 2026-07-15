"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Submit button for the `createBill` form. `createBill` inserts then redirects,
 * and during that round-trip a plain button stays enabled — a double-tap would
 * create two empty bills. useFormStatus disables it and shows progress while the
 * action is pending. Must be rendered inside the <form>.
 */
export function NewBillButton({
  children,
  size = "default",
}: {
  children: React.ReactNode;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} disabled={pending}>
      <Plus data-icon="inline-start" />
      {pending ? "Creating…" : children}
    </Button>
  );
}
