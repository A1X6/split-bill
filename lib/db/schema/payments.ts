import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * A person's payment destinations — an InstaPay link, or a QR code stored as a
 * base64 image.
 *
 * There is deliberately NO partial unique index on (userId) WHERE is_default.
 * Postgres checks unique indexes per-row as an UPDATE walks the table, so the
 * single-statement `SET is_default = (id = $1)` used to switch the default
 * would transiently have two true rows and abort — and a unique *index* can't
 * be DEFERRABLE. Uniqueness of the default comes from the shape of that write
 * plus a tolerant read (order by is_default desc, created_at desc).
 */
export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'instapay_link' | 'instapay_qr'
    label: text("label").notNull(),
    value: text("value").notNull(), // an https URL, or a data:image/...;base64 string
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("payment_methods_userId_idx").on(table.userId)],
);

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  owner: one(user, {
    fields: [paymentMethods.userId],
    references: [user.id],
  }),
}));

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type PaymentMethodType = "instapay_link" | "instapay_qr";
