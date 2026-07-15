import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * One row per pair of people. The request row *is* the friendship row: it
 * starts 'pending' and an accept flips it to 'accepted' — a single UPDATE, no
 * transaction (the Neon HTTP driver has none).
 */
export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // 'pending' | 'accepted'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // The whole crossing-case design: {A,B} is unique regardless of who
    // requested whom, enforced by the database. A simultaneous reverse request
    // hits this constraint and is handled as mutual consent.
    uniqueIndex("friendships_pair_uq").on(
      sql`least(${table.requesterId}, ${table.addresseeId})`,
      sql`greatest(${table.requesterId}, ${table.addresseeId})`,
    ),
    index("friendships_addressee_status_idx").on(
      table.addresseeId,
      table.status,
    ),
    index("friendships_requester_status_idx").on(
      table.requesterId,
      table.status,
    ),
    check("friendships_no_self", sql`${table.requesterId} <> ${table.addresseeId}`),
  ],
);

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(user, {
    fields: [friendships.requesterId],
    references: [user.id],
    relationName: "friendship_requester",
  }),
  addressee: one(user, {
    fields: [friendships.addresseeId],
    references: [user.id],
    relationName: "friendship_addressee",
  }),
}));

export type Friendship = typeof friendships.$inferSelect;
