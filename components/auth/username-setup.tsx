"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  isValidUsername,
  normalizeUsername,
  USERNAME_HINT,
} from "@/lib/validation/username";

// Same availability-check shape as the signup and profile forms — the result is
// keyed by the username it answers so "checking" is derived, not set in-effect.
type Availability = { username: string; available: boolean } | null;

/**
 * The blocking step a user without a username lands on — reached after Google
 * sign-in (Google carries no username). Once set, the app-layout gate stops
 * redirecting here, so it shows exactly once.
 */
export default function UsernameSetup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<Availability>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalized = normalizeUsername(username);
  const formatValid = isValidUsername(normalized);
  const needsCheck = normalized !== "" && formatValid;

  useEffect(() => {
    if (!needsCheck) return;
    const timer = setTimeout(async () => {
      const { data, error } = await authClient.isUsernameAvailable({
        username: normalized,
      });
      if (!error) {
        setAvailability({
          username: normalized,
          available: Boolean(data?.available),
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [normalized, needsCheck]);

  const resolved =
    availability && availability.username === normalized ? availability : null;
  const showInvalid = normalized !== "" && !formatValid;
  const showChecking = needsCheck && !resolved;
  const showAvailable = Boolean(resolved?.available);
  const showTaken = resolved ? !resolved.available : false;
  const blocked = !normalized || showInvalid || showTaken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setSaving(true);
    setError("");
    const { error } = await authClient.updateUser({ username: normalized });
    if (error) {
      setSaving(false);
      if (error.code === "USERNAME_IS_ALREADY_TAKEN") {
        setAvailability({ username: normalized, available: false });
        setError("That username is already taken.");
      } else {
        setError(error.message || "Couldn't save that username.");
      }
      return;
    }
    // Set — into the app. refresh so the layout gate sees the new username.
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Pick your username</CardTitle>
        <CardDescription>
          One more step — this is how friends find you and split bills together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourhandle"
                className="pl-7"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2">
                {showChecking && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
                {showAvailable && <Check className="size-4 text-primary" />}
                {(showTaken || showInvalid) && (
                  <X className="size-4 text-destructive" />
                )}
              </span>
            </div>
            <p
              className={cn(
                "text-xs text-muted-foreground",
                (showTaken || showInvalid) && "text-destructive",
              )}
            >
              {showTaken
                ? "That username is already taken."
                : showInvalid
                  ? USERNAME_HINT
                  : showAvailable
                    ? "Available."
                    : "You can change it later in your profile. " +
                      USERNAME_HINT}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={saving || blocked}
          >
            {saving ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
