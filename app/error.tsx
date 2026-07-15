"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import StatusScreen from "@/components/status-screen";
import { Button } from "@/components/ui/button";

/**
 * Route-segment error boundary (App Router). Catches uncaught render/data
 * errors below the root layout and shows a branded fallback with a working
 * retry. Must be a Client Component per the App Router convention.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it for logging; in production the message is redacted to a digest.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code={error.digest ? `ERROR · ${error.digest}` : "ERROR"}
      icon={<TriangleAlert className="size-6" />}
      title="Something didn't add up"
      description="We hit an unexpected error on our end. You can try again, or head back home."
    >
      <Button size="lg" onClick={() => reset()}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={
          <Link href="/">
            <Home className="size-4" />
            Go home
          </Link>
        }
      />
    </StatusScreen>
  );
}
