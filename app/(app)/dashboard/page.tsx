import { desc, eq } from "drizzle-orm";
import { MessageSquarePlus, ReceiptText } from "lucide-react";
import Link from "next/link";
import BillCard from "@/components/dashboard/BillCard";
import { NewBillButton } from "@/components/dashboard/new-bill-button";
import SharedWithYou from "@/components/dashboard/shared-with-you";
import { Button } from "@/components/ui/button";
import { createBill } from "@/lib/actions/bills";
import { db } from "@/lib/db";
import { bills } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { getReceivedShares, getShareStatsForBills } from "@/lib/shares";

export const metadata = {
  title: "Your bills",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [userBills, receivedShares] = await Promise.all([
    db.query.bills.findMany({
      where: eq(bills.userId, user.id),
      orderBy: [desc(bills.updatedAt)],
    }),
    getReceivedShares(user.id),
  ]);

  // Per-bill "settled x/y" for the cards — one grouped query for the whole page.
  const shareStats = await getShareStatsForBills(
    userBills.map((b) => b.id),
    user.id,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SharedWithYou shares={receivedShares} />

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
          <NewBillButton size="lg">New bill</NewBillButton>
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
            <NewBillButton>Start your first bill</NewBillButton>
          </form>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              stats={shareStats.get(bill.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <MessageSquarePlus className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold">
              Help shape Splitza
            </h2>
            <p className="text-sm text-muted-foreground">
              Got a feature idea or hit a bug? Tell us — it goes straight to
              the team.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          className="shrink-0"
          render={<Link href="/feedback">Send feedback</Link>}
        />
      </div>
    </div>
  );
}
