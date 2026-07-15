"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import GoogleButton from "@/components/auth/google-button";
import VerifyEmailNotice from "@/components/auth/verify-email-notice";
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
import { authClient, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  isValidUsername,
  normalizeUsername,
  USERNAME_HINT,
} from "@/lib/validation/username";

// The async availability result, tagged with the username it applies to, so
// "checking" is derived (result doesn't match current input) rather than set
// synchronously in the effect — which the react-hooks rule forbids.
type Availability = { username: string; available: boolean } | null;

export default function SignupForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [availability, setAvailability] = useState<Availability>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  // Derived during render: the normalized handle, whether it's well-formed, and
  // whether it's worth an availability round-trip.
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

  // The stored result only counts when it matches what's typed now.
  const resolved =
    availability && availability.username === normalized ? availability : null;
  const showInvalid = normalized !== "" && !formatValid;
  const showChecking = needsCheck && !resolved;
  const showAvailable = Boolean(resolved?.available);
  const showTaken = resolved ? !resolved.available : false;
  // Block submit only on things we know are wrong (empty, malformed, or
  // confirmed-taken). A still-pending or errored availability check never
  // deadlocks the button — the server is the final arbiter of uniqueness.
  const usernameBlocked = !normalized || showInvalid || showTaken;

  if (awaitingVerification) {
    return <VerifyEmailNotice email={email} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameBlocked) return;
    setError("");
    setLoading(true);
    await signUp.email(
      {
        name: name.trim(),
        username: normalized,
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          setAwaitingVerification(true);
        },
        onError: (ctx) => {
          if (ctx.error.code === "USERNAME_IS_ALREADY_TAKEN") {
            setAvailability({ username: normalized, available: false });
            setError("That username is already taken.");
          } else {
            setError(ctx.error.message || "Could not create your account.");
          }
          setLoading(false);
        },
      }
    );
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Free to use — start splitting in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <GoogleButton onError={setError} />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 border-t border-dashed" />
          or
          <div className="h-px flex-1 border-t border-dashed" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
                (showTaken || showInvalid) && "text-destructive"
              )}
            >
              {showTaken
                ? "That username is already taken."
                : showInvalid
                  ? USERNAME_HINT
                  : showAvailable
                    ? "Available."
                    : "How friends find you. " + USERNAME_HINT}
            </p>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || usernameBlocked}
          >
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
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
