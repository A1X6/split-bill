import { desc, eq } from "drizzle-orm";
import BillCard from "@/components/dashboard/BillCard";
import { createBill } from "@/lib/actions/bills";
import { db } from "@/lib/db";
import { bills } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Your bills",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const userBills = await db.query.bills.findMany({
    where: eq(bills.userId, user.id),
    orderBy: [desc(bills.updatedAt)],
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your bills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Every bill autosaves — reopen one any time.
          </p>
        </div>
        <form action={createBill}>
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          >
            + New bill
          </button>
        </form>
      </div>

      {userBills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <h2 className="mb-1 font-semibold">No bills yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create your first bill to start splitting expenses with friends.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  );
}
