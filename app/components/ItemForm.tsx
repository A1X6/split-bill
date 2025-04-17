import { User } from "../types";
import { useState } from "react";

interface ItemFormProps {
  users: User[];
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
      setError("Please select at least one user");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Item Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter item name"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="cost"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Cost ($)
          </label>
          <input
            type="number"
            id="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="1"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Split Between
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => toggleUser(user.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedUsers.includes(user.id)
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        className="w-full px-6 py-3 text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm transition-all duration-150 ease-in-out hover:shadow-md"
      >
        Add Item
      </button>
    </form>
  );
}
