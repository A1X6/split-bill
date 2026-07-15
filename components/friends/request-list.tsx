"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { respondToFriendRequest } from "@/lib/actions/friends";
import type { PendingRequest } from "@/lib/friends";
import { initialsOf } from "@/lib/initials";

interface RequestListProps {
  incoming: PendingRequest[];
  outgoing: PendingRequest[];
}

export default function RequestList({ incoming, outgoing }: RequestListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const respond = (friendshipId: string, action: "accept" | "decline") => {
    startTransition(async () => {
      const result = await respondToFriendRequest(friendshipId, action);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "accept" ? "Friend added." : "Request declined.");
      router.refresh();
    });
  };

  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending requests. Search above to add friends.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {incoming.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Incoming
          </h3>
          <ul className="divide-y rounded-xl border">
            {incoming.map((req) => (
              <li key={req.friendshipId} className="flex items-center gap-3 p-3">
                <Avatar className="size-9">
                  {req.user.image ? (
                    <AvatarImage src={req.user.image} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {initialsOf(req.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{req.user.name}</div>
                  {req.user.username && (
                    <div className="truncate text-xs text-muted-foreground">
                      @{req.user.username}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => respond(req.friendshipId, "accept")}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => respond(req.friendshipId, "decline")}
                >
                  Decline
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Sent
          </h3>
          <ul className="divide-y rounded-xl border">
            {outgoing.map((req) => (
              <li key={req.friendshipId} className="flex items-center gap-3 p-3">
                <Avatar className="size-9">
                  {req.user.image ? (
                    <AvatarImage src={req.user.image} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {initialsOf(req.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{req.user.name}</div>
                  {req.user.username && (
                    <div className="truncate text-xs text-muted-foreground">
                      @{req.user.username}
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">Pending</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
