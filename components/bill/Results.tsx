import { formatMoney } from "@/lib/currency";
import { Participant, UserTotal } from "@/lib/types";

interface ResultsProps {
  users: Participant[];
  userTotals: Record<string, UserTotal>;
  taxRate: string;
  overallTotal: number;
  currency: string;
}

export default function Results({
  users,
  userTotals,
  taxRate,
  overallTotal,
  currency,
}: ResultsProps) {
  return (
    <div className="space-y-6">
      {/* Overall total — receipt footer */}
      <div className="receipt-edge rounded-t-xl bg-primary px-6 pt-5 pb-9 text-primary-foreground">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs tracking-[0.25em] opacity-90">
            TOTAL BILL
          </span>
          <span className="font-mono text-3xl font-bold tabular-nums">
            {formatMoney(overallTotal, currency)}
          </span>
        </div>
      </div>

      {/* Per-person cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {users.map((user) => {
          const userTotal = userTotals[user.id];
          if (!userTotal) return null;

          return (
            <div key={user.id} className="rounded-xl bg-muted/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading font-semibold">{user.name}</h3>
                <span className="font-mono text-lg font-bold text-primary tabular-nums">
                  {formatMoney(userTotal.total, currency)}
                </span>
              </div>

              {userTotal.items.length > 0 ? (
                <>
                  <div className="space-y-1.5">
                    {userTotal.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {item.name}
                          {item.quantity > 1 && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs tabular-nums">
                              ×{item.quantity}
                            </span>
                          )}
                        </span>
                        {/* This person's cut, not the line total — the two
                            differ whenever an item is shared. */}
                        <span className="font-mono tabular-nums">
                          {formatMoney(item.share, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1 border-t border-dashed pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono tabular-nums">
                        {formatMoney(userTotal.subtotal, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tax ({taxRate || "0"}%)
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatMoney(userTotal.tax, currency)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No items assigned yet
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
