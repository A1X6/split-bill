import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { billShares, user, type BillShare } from "@/lib/db/schema";

/** Every share sent for one bill (owner side). Used to render status chips. */
export async function getBillShares(
  billId: string,
  ownerId: string,
): Promise<BillShare[]> {
  return db
    .select()
    .from(billShares)
    .where(and(eq(billShares.billId, billId), eq(billShares.ownerId, ownerId)))
    .orderBy(desc(billShares.sentAt));
}

export interface ReceivedShare extends BillShare {
  fromName: string;
}

/**
 * Every share addressed to this user (recipient side), newest first. Rendered
 * entirely from the snapshot columns plus the sender's current name — one
 * indexed lookup, no join to bills.
 */
export async function getReceivedShares(
  userId: string,
): Promise<ReceivedShare[]> {
  const rows = await db
    .select({
      share: billShares,
      fromName: user.name,
    })
    .from(billShares)
    .innerJoin(user, eq(user.id, billShares.ownerId))
    .where(eq(billShares.recipientUserId, userId))
    .orderBy(desc(billShares.sentAt));

  return rows.map((r) => ({ ...r.share, fromName: r.fromName }));
}

/** The share behind the read-only recipient view, scoped so a guessed id 404s. */
export async function getReceivedShare(
  shareId: string,
  userId: string,
): Promise<ReceivedShare | null> {
  const [row] = await db
    .select({
      share: billShares,
      fromName: user.name,
    })
    .from(billShares)
    .innerJoin(user, eq(user.id, billShares.ownerId))
    .where(
      and(
        eq(billShares.id, shareId),
        eq(billShares.recipientUserId, userId),
      ),
    )
    .limit(1);

  if (!row) return null;
  return { ...row.share, fromName: row.fromName };
}

export interface BillShareStats {
  /** Shares sent for this bill. */
  total: number;
  /** Recipient marked paid, awaiting the owner's confirmation. */
  paid: number;
  /** Owner confirmed receipt — settled. */
  confirmed: number;
}

/**
 * Per-bill share stats for the owner's dashboard ("settled x/y"). One grouped
 * query for all the bills on the page; bills with no shares are simply absent
 * from the map.
 */
export async function getShareStatsForBills(
  billIds: string[],
  ownerId: string,
): Promise<Map<string, BillShareStats>> {
  if (billIds.length === 0) return new Map();

  const rows = await db
    .select({
      billId: billShares.billId,
      total: sql<number>`count(*)::int`,
      paid: sql<number>`coalesce(sum(case when ${billShares.status} = 'paid' then 1 else 0 end), 0)::int`,
      confirmed: sql<number>`coalesce(sum(case when ${billShares.status} = 'confirmed' then 1 else 0 end), 0)::int`,
    })
    .from(billShares)
    .where(
      and(
        eq(billShares.ownerId, ownerId),
        inArray(billShares.billId, billIds),
      ),
    )
    .groupBy(billShares.billId);

  return new Map(
    rows.map((r) => [
      r.billId,
      { total: r.total, paid: r.paid, confirmed: r.confirmed },
    ]),
  );
}

/** Count of pending shares awaiting this user's response — the nav badge. */
export async function getPendingShareCount(userId: string): Promise<number> {
  const rows = await db
    .select({ id: billShares.id })
    .from(billShares)
    .where(
      and(
        eq(billShares.recipientUserId, userId),
        eq(billShares.status, "pending"),
      ),
    );
  return rows.length;
}
