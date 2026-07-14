import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Participant } from "@/lib/types";

interface ItemFormProps {
  users: Participant[];
  onAddItem: (
    name: string,
    cost: number,
    quantity: number,
    selectedUsers: string[]
  ) => void;
}

export default function ItemForm({ users, onAddItem }: ItemFormProps) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter an item name");
      return;
    }

    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      setError("Please enter a valid cost");
      return;
    }

    const quantityValue = parseInt(quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one person");
      return;
    }

    onAddItem(name, costValue, quantityValue, selectedUsers);
    setName("");
    setCost("");
    setQuantity("1");
    setSelectedUsers([]);
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_130px_100px]">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item</Label>
          <Input
            type="text"
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Margherita pizza"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-cost">Cost ($)</Label>
          <Input
            type="number"
            id="item-cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="font-mono tabular-nums"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-quantity">Qty</Label>
          <Input
            type="number"
            id="item-quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            placeholder="1"
            className="font-mono tabular-nums"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Split between</Label>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add people above first, then pick who shares this item.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <Button
                key={user.id}
                type="button"
                size="sm"
                variant={selectedUsers.includes(user.id) ? "default" : "outline"}
                className="rounded-full"
                aria-pressed={selectedUsers.includes(user.id)}
                onClick={() => toggleUser(user.id)}
              >
                {user.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" size="lg">
        <Plus data-icon="inline-start" />
        Add item
      </Button>
    </form>
  );
}
