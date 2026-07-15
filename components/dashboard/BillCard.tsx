"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Bill } from "@/lib/db/schema/bills";
import { deleteBill } from "@/lib/actions/bills";
import { formatMoney } from "@/lib/currency";
import { calculateOverallTotal } from "@/lib/split";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function BillCard({ bill }: { bill: Bill }) {
  const [isDeleting, startDelete] = useTransition();

  const total = calculateOverallTotal(
    bill.participants,
    bill.items,
    bill.taxRate
  );
  const title = bill.title || "Untitled bill";

  const handleDelete = () => {
    startDelete(async () => {
      await deleteBill(bill.id);
    });
  };

  return (
    <Card
      className={`group relative rounded-2xl transition-all hover:shadow-md hover:ring-primary/40 ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      <CardContent>
        <Link
          href={`/bills/${bill.id}`}
          className="block space-y-2 outline-none"
        >
          <h3 className="font-heading truncate pr-8 font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {bill.participants.length}{" "}
            {bill.participants.length === 1 ? "person" : "people"} ·{" "}
            {bill.items.length} {bill.items.length === 1 ? "item" : "items"}
          </p>
          <div className="flex items-baseline justify-between border-t border-dashed pt-2">
            <span className="font-mono text-lg font-bold tabular-nums">
              {formatMoney(total, bill.currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              {dateFormatter.format(new Date(bill.updatedAt))}
            </span>
          </div>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${title}`}
                disabled={isDeleting}
                className="absolute top-3 right-3 text-muted-foreground opacity-100 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <Trash2 />
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{title}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                The bill and its split are gone for good. This can&apos;t be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep bill</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                Delete bill
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
