import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Participant } from "@/lib/types";

interface ParticipantManagerProps {
  users: Participant[];
  onAddUser: (user: Participant) => void;
  onRemoveUser: (userId: string) => void;
}

export default function ParticipantManager({
  users,
  onAddUser,
  onRemoveUser,
}: ParticipantManagerProps) {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(false);

  const handleAddUser = () => {
    if (!userName.trim()) {
      setError(true);
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: userName.trim(),
    };

    onAddUser(newUser);
    setUserName("");
    setError(false);
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
              if (e.target.value.trim()) {
                setError(false);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
          />
          {error && (
            <p className="mt-1 text-sm text-destructive">
              Enter a name to add someone
            </p>
          )}
        </div>
        <Button type="button" onClick={handleAddUser} className="h-9">
          Add person
        </Button>
      </div>

      {users.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="gap-1 rounded-full py-1 pr-1 pl-3 text-sm"
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
