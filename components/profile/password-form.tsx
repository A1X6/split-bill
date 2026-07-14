"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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

export default function PasswordForm() {
  const [hasCredential, setHasCredential] = useState<boolean | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // A Google-only account has no password to change. Detect a credential
  // account before offering the form.
  useEffect(() => {
    authClient.listAccounts().then(({ data }) => {
      setHasCredential(
        Boolean(data?.some((a) => a.providerId === "credential"))
      );
    });
  }, []);

  if (hasCredential === false) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            You sign in with Google, so there&apos;s no password to manage here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setSaving(false);

    if (changeError) {
      setError(changeError.message || "Couldn't change your password.");
      return;
    }
    setCurrent("");
    setNext("");
    toast.success("Password changed. Other sessions were signed out.");
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Changing it signs out your other devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              required
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next">New password</Label>
            <Input
              id="next"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
