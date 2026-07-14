"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleButton from "@/components/auth/google-button";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Could not sign in.");
          setLoading(false);
        },
      }
    );
  };

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
            <Label htmlFor="password">Password</Label>
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
