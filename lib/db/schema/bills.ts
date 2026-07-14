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
