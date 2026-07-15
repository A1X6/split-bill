"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

const COOLDOWN_SECONDS = 60;

/**
 * Shown after signup and after an unverified sign-in attempt. In both cases a
 * verification email was just sent by the server, so the resend button starts
 * on a cooldown; the server also rate-limits the resend endpoint.
 */
export default function VerifyEmailNotice({ email }: { email: string }) {
  const [seconds, setSeconds] = useState(COOLDOWN_SECONDS);
  const [sending, setSending] = useState(false);

  // Tick the cooldown down. setState lives in the timer callback (deferred), not
  // synchronously in the effect body.
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const resend = async () => {
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });
    setSending(false);
    if (error) {
      toast.error(
        error.message || "Couldn't resend just yet — give it a moment.",
      );
      return;
    }
    toast.success("Verification link sent.");
    setSeconds(COOLDOWN_SECONDS);
  };

  const waiting = seconds > 0;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <span className="mb-1 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <MailCheck className="size-5" />
        </span>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We sent a verification link to <strong>{email}</strong>. Click it to
          confirm your address, then you can log in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={sending || waiting}
          onClick={resend}
        >
          {sending
            ? "Sending…"
            : waiting
              ? `Resend link in ${seconds}s`
              : "Resend link"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Wrong address?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Start over
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
