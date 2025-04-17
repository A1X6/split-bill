import { User, UserTotal } from "../types";

interface ResultsProps {
  users: User[];
  userTotals: Record<string, UserTotal>;
  taxRate: string;
  overallTotal: number;
}

export default function Results({
  users,
  userTotals,
  taxRate,
  overallTotal,
}: ResultsProps) {
  return (
    <div className="space-y-6">
      {/* Overall Total Card */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-blue-100">Total Bill</h3>
          <span className="text-3xl font-bold">${overallTotal.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full w-full animate-pulse"></div>
        </div>
      </div>

      {/* User Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {users.map((user) => {
          const userTotal = userTotals[user.id];
          if (!userTotal) return null;

          return (
            <div
              key={user.id}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {user.name}
                  </h3>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${userTotal.total.toFixed(2)}
                  </span>
                </div>

                {userTotal.items.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {userTotal.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span>{item.name}</span>
                            {item.quantity > 1 && (
                              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                                ×{item.quantity}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">
                            ${(item.cost * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Subtotal
                        </span>
                        <span className="text-gray-700 dark:text-gray-200">
                          ${userTotal.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Tax ({taxRate || "0"}%)
                        </span>
                        <span className="text-gray-700 dark:text-gray-200">
                          ${userTotal.tax.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No items assigned
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
