"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Shown once a session when a user hasn't picked a @username — without one,
 * friends can only find them by exact email. Dismissed in-memory; it returns
 * on next load until they set a handle (at which point the server stops
 * rendering it).
 */
export default function UsernameNudge() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <Alert className="mb-6 flex items-start gap-3">
      <UserPlus className="size-4" />
      <div className="flex-1">
        <AlertTitle>Pick a username</AlertTitle>
        <AlertDescription>
          Add a @username so friends can find you and split bills together.
        </AlertDescription>
        <Button
          size="sm"
          className="mt-3"
          nativeButton={false}
          render={<Link href="/profile">Set username</Link>}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss"
        className="text-muted-foreground"
        onClick={() => setDismissed(true)}
      >
        <X />
      </Button>
    </Alert>
  );
}
