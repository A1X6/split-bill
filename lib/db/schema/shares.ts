import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { bills } from "./bills";

/**
 * A bill sent to one recipient. Everything the recipient needs is snapshotted
 * at send time — the amount, the currency, and a copy of the payer's payment
 * method — so it stays valid even if the owner later edits the bill or deletes
 * the payment method. The recipient always acts on this snapshot.
 */
export const billShares = pgTable(
  "bill_shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    // Denormalized so owner-side checks (revoke) need no join to bills.
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipientUserId: text("recipient_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    participantId: text("participant_id").notNull(),

    // --- snapshot at send time ---
    amount: doublePrecision("amount").notNull(),
    currency: text("currency").notNull(),
    billTitle: text("bill_title").notNull(),
    payerName: text("payer_name").notNull(),
    paymentMethodType: text("payment_method_type"),
    paymentMethodLabel: text("payment_method_label"),
    paymentMethodValue: text("payment_method_value"),

    status: text("status").notNull().default("pending"), // pending | accepted | declined
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // One share per (bill, recipient) — sending again upserts this row.
    uniqueIndex("bill_shares_bill_recipient_uq").on(
      table.billId,
      table.recipientUserId,
    ),
    index("bill_shares_recipient_status_idx").on(
      table.recipientUserId,
      table.status,
    ),
    index("bill_shares_bill_idx").on(table.billId),
  ],
);

export const billSharesRelations = relations(billShares, ({ one }) => ({
  bill: one(bills, {
    fields: [billShares.billId],
    references: [bills.id],
  }),
  recipient: one(user, {
    fields: [billShares.recipientUserId],
    references: [user.id],
  }),
}));

export type BillShare = typeof billShares.$inferSelect;
