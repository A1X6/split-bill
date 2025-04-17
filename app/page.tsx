"use client";

import { useState } from "react";
import { User, Item, UserTotal } from "./types";
import UserManagement from "./components/UserManagement";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import Results from "./components/Results";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxRate, setTaxRate] = useState("");
  const [taxError, setTaxError] = useState(false);

  const handleAddUser = (user: User) => {
    setUsers([...users, user]);
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    setItems(
      items.map((item) => ({
        ...item,
        users: item.users.filter((id) => id !== userId),
      }))
    );
  };

  const handleAddItem = (
    name: string,
    cost: number,
    quantity: number,
    selectedUsers: string[]
  ) => {
    const newItem: Item = {
      id: Date.now().toString(),
      name,
      cost,
      quantity,
      users: selectedUsers,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateTaxRate = (value: string) => {
    setTaxRate(value);
    setTaxError(
      value !== "" && (isNaN(parseFloat(value)) || parseFloat(value) < 0)
    );
  };

  const calculateUserTotals = () => {
    const userTotals: Record<string, UserTotal> = {};

    users.forEach((user) => {
      userTotals[user.id] = {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      };
    });

    items.forEach((item) => {
      const numUsers = item.users.length;
      const costPerUser = (item.cost * item.quantity) / numUsers;

      item.users.forEach((userId) => {
        if (userTotals[userId]) {
          userTotals[userId].items.push({
            name: item.name,
            cost: item.cost,
            quantity: item.quantity,
          });
          userTotals[userId].subtotal += costPerUser;
        }
      });
    });

    const taxRateValue = taxRate ? parseFloat(taxRate) / 100 : 0;

    Object.keys(userTotals).forEach((userId) => {
      const tax = userTotals[userId].subtotal * taxRateValue;
      userTotals[userId].tax = tax;
      userTotals[userId].total = userTotals[userId].subtotal + tax;
    });

    return userTotals;
  };

  const calculateOverallTotal = () => {
    const userTotals = calculateUserTotals();
    return Object.values(userTotals).reduce((sum, user) => sum + user.total, 0);
  };

  const handleReset = () => {
    setUsers([]);
    setItems([]);
    setTaxRate("");
    setTaxError(false);
  };

  const userTotals = calculateUserTotals();
  const overallTotal = calculateOverallTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3">
            Split the Bill
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Split expenses effortlessly with friends
          </p>
        </header>

        <div className="space-y-6">
          {/* User Management Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6">
              <UserManagement
                users={users}
                onAddUser={handleAddUser}
                onRemoveUser={handleRemoveUser}
              />
            </div>
          </div>

          {/* Tax Rate Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Tax Rate
              </h2>
              <div className="flex items-center">
                <input
                  type="number"
                  placeholder="Tax percentage"
                  min="0"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => updateTaxRate(e.target.value)}
                  className={`flex-grow px-4 py-3 rounded-xl border ${
                    taxError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
                />
                <span className="ml-2 text-gray-600 dark:text-gray-300 text-lg">
                  %
                </span>
              </div>
              {taxError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Please enter a valid tax rate (0 or greater)
                </p>
              )}
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Add Items
              </h2>
              <ItemForm users={users} onAddItem={handleAddItem} />
              <ItemList
                items={items}
                users={users}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

          {/* Results Card */}
          {users.length > 0 && items.length > 0 && !taxError && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Results
                </h2>
                <Results
                  users={users}
                  userTotals={userTotals}
                  taxRate={taxRate}
                  overallTotal={overallTotal}
                />
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="flex justify-center py-6">
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
