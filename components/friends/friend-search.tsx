"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchUsers, sendFriendRequest } from "@/lib/actions/friends";
import type { SearchResult } from "@/lib/actions/friends";
import { initialsOf } from "@/lib/initials";

export default function FriendSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Results tagged with the query they answer, so "searching" can be derived
  // rather than set synchronously in the effect (a react-hooks violation).
  const [found, setFound] = useState<{
    query: string;
    items: SearchResult[];
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 3) return;
    const timer = setTimeout(async () => {
      const items = await searchUsers(trimmed);
      setFound({ query: trimmed, items });
    }, 350);
    return () => clearTimeout(timer);
  }, [trimmed]);

  const results = found && found.query === trimmed ? found.items : null;
  const searching = trimmed.length >= 3 && results === null;

  const handleAdd = (target: SearchResult) => {
    startTransition(async () => {
      const result = await sendFriendRequest(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.autoAccepted
          ? `You and ${target.name} are now friends.`
          : `Request sent to ${target.name}.`
      );
      router.refresh();
      // Reflect the new state without a re-search.
      setFound((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((r) =>
                r.id === target.id
                  ? {
                      ...r,
                      relation: result.autoAccepted ? "friends" : "outgoing",
                    }
                  : r
              ),
            }
          : prev
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by @username or exact email"
          className="pl-9"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
        />
        {searching && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {query.trim().length > 0 && query.trim().length < 3 && (
        <p className="text-sm text-muted-foreground">
          Type at least 3 characters.
        </p>
      )}

      {results !== null && results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground">
          No one found. Check the spelling, or try their exact email.
        </p>
      )}

      {results && results.length > 0 && (
        <ul className="divide-y rounded-xl border">
          {results.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-3 p-3"
            >
              <Avatar className="size-9">
                {person.image ? <AvatarImage src={person.image} alt="" /> : null}
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                  {initialsOf(person.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{person.name}</div>
                {person.username && (
                  <div className="truncate text-xs text-muted-foreground">
                    @{person.username}
                  </div>
                )}
              </div>
              {person.relation === "none" && (
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => handleAdd(person)}
                >
                  <UserPlus data-icon="inline-start" />
                  Add
                </Button>
              )}
              {person.relation === "outgoing" && (
                <span className="text-sm text-muted-foreground">Requested</span>
              )}
              {person.relation === "incoming" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => handleAdd(person)}
                >
                  Accept
                </Button>
              )}
              {person.relation === "friends" && (
                <span className="text-sm text-muted-foreground">Friends</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
