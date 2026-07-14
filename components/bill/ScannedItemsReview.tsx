import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanReceiptResult, Participant } from "@/lib/types";

interface ReviewRow {
  id: string;
  name: string;
  cost: string;
  quantity: string;
  users: string[];
}

interface ScannedItemsReviewProps {
  scan: ScanReceiptResult;
  users: Participant[];
  onAddItems: (items: { name: string; cost: number; quantity: number; users: string[] }[]) => void;
  onDismiss: () => void;
}

let rowCounter = 0;
const nextRowId = () => `scan-${Date.now()}-${rowCounter++}`;

export default function ScannedItemsReview({
  scan,
  users,
  onAddItems,
  onDismiss,
}: ScannedItemsReviewProps) {
  const [rows, setRows] = useState<ReviewRow[]>(() =>
    scan.items.map((item) => ({
      id: nextRowId(),
      name: item.name,
      cost: item.price.toFixed(2),
      quantity: String(item.quantity),
      users: [],
    }))
  );
  const [error, setError] = useState("");

  const updateRow = (id: string, patch: Partial<ReviewRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const toggleUser = (id: string, userId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              users: row.users.includes(userId)
                ? row.users.filter((u) => u !== userId)
                : [...row.users, userId],
            }
          : row
      )
    );
  };

  const toggleEveryone = (id: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, users: row.users.length === users.length ? [] : users.map((u) => u.id) }
          : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextRowId(), name: "", cost: "", quantity: "1", users: [] },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddAll = () => {
    setError("");

    if (users.length === 0) {
      setError("Add at least one person first, then assign the items.");
      return;
    }
    if (rows.length === 0) {
      setError("There are no items to add.");
      return;
    }

    const parsed = rows.map((row) => ({
      row,
      name: row.name.trim(),
      cost: parseFloat(row.cost),
      quantity: parseInt(row.quantity),
    }));

    const invalid = parsed.find(
      (p) =>
        !p.name ||
        isNaN(p.cost) ||
        p.cost <= 0 ||
        isNaN(p.quantity) ||
        p.quantity <= 0 ||
        p.row.users.length === 0
    );
    if (invalid) {
      setError(
        `Check "${invalid.name || "unnamed item"}": every item needs a name, a cost above 0, a quantity, and at least one person.`
      );
      return;
    }

    onAddItems(
      parsed.map((p) => ({
        name: p.name,
        cost: p.cost,
        quantity: p.quantity,
        users: p.row.users,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {scan.items.length} item{scan.items.length === 1 ? "" : "s"}
        {scan.total !== null && (
          <>
            {" "}
            · receipt total{" "}
            <span className="font-mono tabular-nums">
              {scan.currency ?? "$"}
              {scan.total.toFixed(2)}
            </span>
          </>
        )}{" "}
        · read by{" "}
        <span className="font-mono">{scan.model.replace(":free", "")}</span>
      </p>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="space-y-3 rounded-xl border bg-muted/40 p-4"
          >
            <div className="flex items-start gap-2">
              <div className="grid flex-grow gap-2 sm:grid-cols-[1fr_110px_80px]">
                <Input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  placeholder="Item name"
                  aria-label="Item name"
                />
                <Input
                  type="number"
                  value={row.cost}
                  onChange={(e) => updateRow(row.id, { cost: e.target.value })}
                  step="0.01"
                  min="0"
                  placeholder="Cost"
                  aria-label="Cost"
                  className="font-mono tabular-nums"
                />
                <Input
                  type="number"
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(row.id, { quantity: e.target.value })
                  }
                  min="1"
                  placeholder="Qty"
                  aria-label="Quantity"
                  className="font-mono tabular-nums"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove item"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(row.id)}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                For:
              </span>
              {users.map((user) => (
                <Button
                  key={user.id}
                  type="button"
                  size="xs"
                  variant={row.users.includes(user.id) ? "default" : "outline"}
                  aria-pressed={row.users.includes(user.id)}
                  className="rounded-full"
                  onClick={() => toggleUser(row.id, user.id)}
                >
                  {user.name}
                </Button>
              ))}
              {users.length > 1 && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="rounded-full border border-dashed"
                  onClick={() => toggleEveryone(row.id)}
                >
                  Everyone
                </Button>
              )}
              {users.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Add people above to assign this item
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full border border-dashed text-muted-foreground"
        onClick={addRow}
      >
        <Plus data-icon="inline-start" />
        Add another item
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={handleAddAll}
        >
          Add {rows.length} item{rows.length === 1 ? "" : "s"} to bill
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={onDismiss}>
          Discard
        </Button>
      </div>
    </div>
  );
}
