import { useState } from "react";
import { User } from "../types";

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
}

export default function UserManagement({
  users,
  onAddUser,
  onRemoveUser,
}: UserManagementProps) {
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
    <section className="rounded-xl bg-white p-6 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Add Users
      </h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-grow min-w-[200px]">
          <input
            type="text"
            placeholder="Enter user name"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              if (e.target.value.trim()) {
                setError(false);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
            className={`w-full px-4 py-2 rounded-lg border ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-gray-600 focus:border-blue-500"
            } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a valid name
            </p>
          )}
        </div>
        <button
          onClick={handleAddUser}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add User
        </button>
      </div>

      {users.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
            Added Users:
          </h3>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="group flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={() => onRemoveUser(user.id)}
                  className="opacity-100  ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none transition-opacity"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
