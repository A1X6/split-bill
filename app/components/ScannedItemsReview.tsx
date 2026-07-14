import { useState } from "react";
import { ScanReceiptResult, User } from "../types";

interface ReviewRow {
  id: string;
  name: string;
  cost: string;
  quantity: string;
  users: string[];
}

interface ScannedItemsReviewProps {
  scan: ScanReceiptResult;
  users: User[];
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Found {scan.items.length} item{scan.items.length === 1 ? "" : "s"}
          {scan.total !== null && <> · receipt total {scan.currency ?? "$"}{scan.total.toFixed(2)}</>}
          {" "}· read by <span className="font-mono">{scan.model.replace(":free", "")}</span>
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 space-y-3"
          >
            <div className="flex gap-2 items-start">
              <div className="grid gap-2 sm:grid-cols-[1fr_110px_90px] flex-grow">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  placeholder="Item name"
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={row.cost}
                  onChange={(e) => updateRow(row.id, { cost: e.target.value })}
                  step="0.01"
                  min="0"
                  placeholder="Cost"
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                  min="1"
                  placeholder="Qty"
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">For:</span>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(row.id, user.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    row.users.includes(user.id)
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {user.name}
                </button>
              ))}
              {users.length > 1 && (
                <button
                  type="button"
                  onClick={() => toggleEveryone(row.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  Everyone
                </button>
              )}
              {users.length === 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Add people above to assign this item
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + Add another item
      </button>

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddAll}
          className="flex-1 px-6 py-3 text-white font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-sm transition-all"
        >
          Add {rows.length} item{rows.length === 1 ? "" : "s"} to bill
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
