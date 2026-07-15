"use client";

import { useTransition } from "react";
import { UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { removeFriend } from "@/lib/actions/friends";
import type { FriendSummary } from "@/lib/friends";
import { initialsOf } from "@/lib/initials";

interface FriendsListProps {
  friends: (FriendSummary & { friendshipId: string })[];
}

export default function FriendsList({ friends }: FriendsListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleRemove = (friendshipId: string, name: string) => {
    startTransition(async () => {
      const result = await removeFriend(friendshipId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Removed ${name}.`);
      router.refresh();
    });
  };

  if (friends.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Users className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          No friends yet. Search above to add someone.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-xl border">
      {friends.map((friend) => (
        <li key={friend.friendshipId} className="flex items-center gap-3 p-3">
          <Avatar className="size-9">
            {friend.image ? <AvatarImage src={friend.image} alt="" /> : null}
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              {initialsOf(friend.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{friend.name}</div>
            {friend.username && (
              <div className="truncate text-xs text-muted-foreground">
                @{friend.username}
              </div>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${friend.name}`}
                  className="text-muted-foreground hover:text-destructive"
                  disabled={pending}
                >
                  <UserMinus />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {friend.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;ll both need to send a new request to become friends
                  again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleRemove(friend.friendshipId, friend.name)}
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </li>
      ))}
    </ul>
  );
}
