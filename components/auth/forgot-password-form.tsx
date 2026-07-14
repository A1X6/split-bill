"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Ignore the result deliberately: showing the same confirmation whether or
    // not the address has an account is what stops this leaking who's a user.
    // (Better Auth also dummies out the DB lookup for unknown emails to defeat
    // timing attacks.)
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Check your inbox</CardTitle>
          <CardDescription>
            If an account exists for {email}, we&apos;ve sent a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href="/login">Back to log in</Link>}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
