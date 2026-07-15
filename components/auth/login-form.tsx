"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { signIn } from "@/lib/auth-client";

// Friendly copy for the OAuth callback error codes that can land back on /login.
// account_not_linked fires when Google's email matches an existing password
// account that isn't verified yet — better-auth blocks the link to prevent
// takeover, so we tell the user how to move forward instead of showing a code.
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "This email already has a password account that isn't verified yet. Log in with your password below to finish verifying — after that, Continue with Google works too.",
};

function oauthMessage(code?: string): string {
  if (!code) return "";
  return OAUTH_ERROR_MESSAGES[code] ?? "Google sign-in didn't complete. Please try again.";
}

export default function LoginForm({ oauthError }: { oauthError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => oauthMessage(oauthError));
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await signIn.email(
      { email, password, callbackURL: "/dashboard" },
      {
        onSuccess: () => {
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          // 403 = email not verified; the server just re-sent the link.
          if (ctx.error.status === 403) {
            setUnverifiedEmail(email);
          } else {
            setError(ctx.error.message || "Could not sign in.");
          }
          setLoading(false);
        },
      }
    );
  };

  if (unverifiedEmail) {
    return <VerifyEmailNotice email={unverifiedEmail} />;
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Log in to pick up where you left off.</CardDescription>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
