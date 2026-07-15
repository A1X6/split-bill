import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { BillItem, Participant } from "../../types";
import { user } from "./auth";
import { paymentMethods } from "./payments";

export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled bill"),
    taxRate: real("tax_rate").notNull().default(0),
    currency: text("currency").notNull().default("EGP"),
    participants: jsonb("participants")
      .$type<Participant[]>()
      .notNull()
      .default([]),
    items: jsonb("items").$type<BillItem[]>().notNull().default([]),
    // Who paid — a Participant.id within this bill's jsonb (not a FK).
    payerParticipantId: text("payer_participant_id"),
    // The payment method to attach when sending shares. SET NULL on delete so
    // removing a payment method never deletes bills.
    paymentMethodId: uuid("payment_method_id").references(
      () => paymentMethods.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("bills_userId_updatedAt_idx").on(table.userId, table.updatedAt.desc()),
  ],
);

export const billsRelations = relations(bills, ({ one }) => ({
  owner: one(user, {
    fields: [bills.userId],
    references: [user.id],
  }),
}));

export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;
