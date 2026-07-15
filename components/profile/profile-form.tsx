"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { compressImage } from "@/lib/compressImage";
import { cn } from "@/lib/utils";
import {
  isValidUsername,
  normalizeUsername,
  USERNAME_HINT,
} from "@/lib/validation/username";

interface ProfileFormProps {
  initialName: string;
  initialUsername: string | null;
  initialImage: string | null;
}

// The async lookup result, tagged with the username it applies to. Keeping the
// result keyed lets "checking" be derived (result doesn't match the current
// input yet) instead of set synchronously in the effect, which the react-hooks
// rule forbids.
type Availability = { username: string; available: boolean } | null;

export default function ProfileForm({
  initialName,
  initialUsername,
  initialImage,
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [image, setImage] = useState<string | null>(initialImage);
  const [availability, setAvailability] = useState<Availability>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Derived during render, not stored: a username is "unchanged" (no check
  // needed), empty, or badly formatted purely as a function of the input.
  const trimmedUsername = normalizeUsername(username);
  const usernameChanged = trimmedUsername !== (initialUsername ?? "");
  const formatValid = !trimmedUsername || isValidUsername(trimmedUsername);
  const needsCheck = usernameChanged && trimmedUsername !== "" && formatValid;

  // The async availability lookup. setState happens only inside the deferred
  // timer, never synchronously in the effect body.
  useEffect(() => {
    if (!needsCheck) return;
    const timer = setTimeout(async () => {
      const { data, error } = await authClient.isUsernameAvailable({
        username: trimmedUsername,
      });
      if (!error) {
        setAvailability({
          username: trimmedUsername,
          available: Boolean(data?.available),
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [trimmedUsername, needsCheck]);

  // The stored result only counts when it matches what's typed now.
  const resolved =
    availability && availability.username === trimmedUsername
      ? availability
      : null;
  const showInvalid = usernameChanged && trimmedUsername !== "" && !formatValid;
  const showChecking = needsCheck && !resolved;
  const showAvailable = Boolean(resolved?.available);
  const showTaken = resolved ? !resolved.available : false;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so re-selecting the same file (e.g. after Remove) fires onChange.
    e.target.value = "";
    if (!file) return;
    try {
      // Small: this lands in user.image, which the layout reads on every page.
      const dataUrl = await compressImage(file, {
        maxDimension: 256,
        quality: 0.8,
      });
      setImage(dataUrl);
    } catch {
      toast.error("Couldn't read that image.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showTaken || showInvalid) {
      return;
    }
    setSaving(true);
    const { error } = await authClient.updateUser({
      name: name.trim(),
      image: image ?? undefined,
      // Only send username when it actually changed — resending the same value
      // is fine but pointless, and sending empty would fail validation.
      ...(trimmedUsername && trimmedUsername !== (initialUsername ?? "")
        ? { username: trimmedUsername }
        : {}),
    });
    setSaving(false);

    if (error) {
      if (error.code === "USERNAME_IS_ALREADY_TAKEN") {
        setAvailability({ username: trimmedUsername, available: false });
        toast.error("That username is already taken.");
      } else {
        toast.error(error.message || "Couldn't save your profile.");
      }
      return;
    }

    toast.success("Profile updated.");
    router.refresh();
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how you appear to friends when splitting bills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {image ? <AvatarImage src={image} alt="" /> : null}
              <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Change photo
              </Button>
              {image ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 text-muted-foreground"
                  onClick={() => setImage(null)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
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
                    : "Friends can find you by @username or your email."}
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
