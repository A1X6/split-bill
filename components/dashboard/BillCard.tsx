"use client";

import Link from "next/link";
import { useTransition } from "react";
import type { Bill } from "@/lib/db/schema/bills";
import { deleteBill } from "@/lib/actions/bills";
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

  const handleDelete = () => {
    // Upgraded to a styled confirm dialog in the redesign phase.
    if (!window.confirm(`Delete "${bill.title || "Untitled bill"}"?`)) return;
    startDelete(async () => {
      await deleteBill(bill.id);
    });
  };

  return (
    <div
      className={`relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-opacity dark:border-gray-700 dark:bg-gray-800 ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      <Link href={`/bills/${bill.id}`} className="block space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-8">
          {bill.title || "Untitled bill"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {bill.participants.length}{" "}
          {bill.participants.length === 1 ? "person" : "people"} ·{" "}
          {bill.items.length} {bill.items.length === 1 ? "item" : "items"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${total.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">
            {dateFormatter.format(new Date(bill.updatedAt))}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Delete ${bill.title || "Untitled bill"}`}
        className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
  );
}
