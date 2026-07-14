import { desc, eq } from "drizzle-orm";
import { Plus, ReceiptText } from "lucide-react";
import BillCard from "@/components/dashboard/BillCard";
import UsernameNudge from "@/components/dashboard/username-nudge";
import { Button } from "@/components/ui/button";
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
      {!user.username && <UsernameNudge />}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Your bills
          </h1>
          <p className="text-sm text-muted-foreground">
            Every bill autosaves — reopen one any time.
          </p>
        </div>
        <form action={createBill}>
          <Button type="submit" size="lg">
            <Plus data-icon="inline-start" />
            New bill
          </Button>
        </form>
      </div>

      {userBills.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <ReceiptText className="size-6" />
          </span>
          <h2 className="font-heading mb-1 text-lg font-semibold">
            No bills yet
          </h2>
          <p className="mx-auto mb-6 max-w-xs text-sm text-muted-foreground">
            Start your first bill, add the people you&apos;re with, and scan
            the receipt.
          </p>
          <form action={createBill}>
            <Button type="submit">
              <Plus data-icon="inline-start" />
              Start your first bill
            </Button>
          </form>
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
