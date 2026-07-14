import { useState } from "react";
import { UserPlus, Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { FriendSummary } from "@/lib/friends";
import { initialsOf } from "@/lib/initials";
import { Participant } from "@/lib/types";

interface CurrentUser {
  id: string;
  name: string;
  image: string | null;
}

interface ParticipantManagerProps {
  users: Participant[];
  onAddUser: (user: Participant) => void;
  onRemoveUser: (userId: string) => void;
  currentUser: CurrentUser;
  friends: FriendSummary[];
}

export default function ParticipantManager({
  users,
  onAddUser,
  onRemoveUser,
  currentUser,
  friends,
}: ParticipantManagerProps) {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(false);

  // Account ids already on the bill — used to disable duplicates.
  const linkedIds = new Set(
    users.map((u) => u.userId).filter((id): id is string => Boolean(id)),
  );
  const meAdded = linkedIds.has(currentUser.id);

  const handleAddName = () => {
    if (!userName.trim()) {
      setError(true);
      return;
    }
    onAddUser({ id: Date.now().toString(), name: userName.trim() });
    setUserName("");
    setError(false);
  };

  const handleAddMe = () => {
    if (meAdded) return;
    onAddUser({
      id: Date.now().toString(),
      name: currentUser.name,
      userId: currentUser.id,
    });
  };

  // Map a linked participant back to its friend/self summary for the avatar,
  // looked up live rather than stored — a denormalized image would go stale.
  const imageFor = (participant: Participant): string | null => {
    if (!participant.userId) return null;
    if (participant.userId === currentUser.id) return currentUser.image;
    return friends.find((f) => f.id === participant.userId)?.image ?? null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="min-w-[200px] flex-grow">
          <Input
            type="text"
            placeholder="Add a name — e.g. Maya"
            value={userName}
            aria-invalid={error || undefined}
            onChange={(e) => {
              setUserName(e.target.value);
              if (e.target.value.trim()) setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddName()}
          />
          {error && (
            <p className="mt-1 text-sm text-destructive">
              Enter a name to add someone
            </p>
          )}
        </div>
        <Button type="button" onClick={handleAddName} className="h-9">
          Add person
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMe}
          disabled={meAdded}
        >
          <UserPlus data-icon="inline-start" />
          {meAdded ? "You're on this bill" : "Add me"}
        </Button>
        {friends.length > 0 && (
          <AddFriendsDialog
            friends={friends}
            linkedIds={linkedIds}
            onAddUser={onAddUser}
          />
        )}
      </div>

      {users.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {users.map((user) => {
            const image = imageFor(user);
            return (
              <Badge
                key={user.id}
                variant="secondary"
                className="gap-1.5 rounded-full py-1 pr-1 pl-1.5 text-sm"
              >
                {user.userId ? (
                  <Avatar className="size-5">
                    {image ? <AvatarImage src={image} alt="" /> : null}
                    <AvatarFallback className="text-[10px]">
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="pl-1.5" />
                )}
                {user.name}
                <button
                  type="button"
                  onClick={() => onRemoveUser(user.id)}
                  aria-label={`Remove ${user.name}`}
                  className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                >
                  <X className="size-3.5" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddFriendsDialog({
  friends,
  linkedIds,
  onAddUser,
}: {
  friends: FriendSummary[];
  linkedIds: Set<string>;
  onAddUser: (user: Participant) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const timestamp = Date.now();
    let offset = 0;
    friends.forEach((friend) => {
      if (selected.has(friend.id)) {
        onAddUser({
          id: `${timestamp}-${offset++}`,
          name: friend.name,
          userId: friend.id,
        });
      }
    });
    setSelected(new Set());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Users data-icon="inline-start" />
            Add from friends
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add friends</DialogTitle>
          <DialogDescription>
            Pick friends to add to this bill.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {friends.map((friend) => {
            const already = linkedIds.has(friend.id);
            return (
              <li key={friend.id}>
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted aria-disabled:cursor-default aria-disabled:opacity-50"
                  aria-disabled={already || undefined}
                >
                  <Checkbox
                    checked={already || selected.has(friend.id)}
                    disabled={already}
                    onCheckedChange={() => toggle(friend.id)}
                  />
                  <Avatar className="size-8">
                    {friend.image ? (
                      <AvatarImage src={friend.image} alt="" />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {initialsOf(friend.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {friend.name}
                    </div>
                    {friend.username && (
                      <div className="truncate text-xs text-muted-foreground">
                        @{friend.username}
                      </div>
                    )}
                  </div>
                  {already && (
                    <span className="text-xs text-muted-foreground">Added</span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Cancel
              </Button>
            }
          />
          <Button type="button" onClick={handleAdd} disabled={selected.size === 0}>
            Add {selected.size > 0 ? selected.size : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
