"use server";

import { after } from "next/server";
import { and, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { friendships, user } from "@/lib/db/schema";
import { sendEmail, appUrl } from "@/lib/email";
import { friendRequestEmail } from "@/lib/email/templates";
import type { FriendRelation, FriendSummary } from "@/lib/friends";
import { rateLimit } from "@/lib/ratelimit";
import { requireUser } from "@/lib/session";

export interface SearchResult extends FriendSummary {
  relation: FriendRelation;
}

type ActionResult = { ok: true } | { ok: false; error: string };

const idSchema = z.uuid();

/**
 * Find a person to befriend — the enumeration boundary.
 *
 * Email must be an exact match, never a prefix, and the email is never returned
 * in the result. Username is a prefix match (min 3 chars, capped at 5). Both
 * paths exclude the current user. A best-effort rate limit raises the cost of
 * scraping the user table.
 */
export async function searchUsers(query: string): Promise<SearchResult[]> {
  const me = await requireUser();

  if (!rateLimit(`search:${me.id}`, 20, 60_000)) {
    return [];
  }

  const q = query.trim();
  if (q.length < 3) return [];

  const isEmail = q.includes("@") && z.string().email().safeParse(q).success;

  const matches = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
    })
    .from(user)
    .where(
      and(
        ne(user.id, me.id),
        isEmail
          ? // Exact, case-insensitive. Confirms an address has an account, but
            // never lets you walk the table with a prefix.
            sql`lower(${user.email}) = ${q.toLowerCase()}`
          : // Username prefix. The plugin stores usernames lowercased.
            like(user.username, `${q.toLowerCase()}%`),
      ),
    )
    .limit(5);

  if (matches.length === 0) return [];

  // Resolve each match's relationship to the current user in one query.
  const foundIds = matches.map((m) => m.id);
  const rels = await db
    .select({
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, me.id),
          inArray(friendships.addresseeId, foundIds),
        ),
        and(
          eq(friendships.addresseeId, me.id),
          inArray(friendships.requesterId, foundIds),
        ),
      ),
    );

  return matches.map((m): SearchResult => {
    const rel = rels.find(
      (r) => r.requesterId === m.id || r.addresseeId === m.id,
    );
    let relation: FriendRelation = "none";
    if (rel) {
      if (rel.status === "accepted") relation = "friends";
      else if (rel.requesterId === me.id) relation = "outgoing";
      else relation = "incoming";
    }
    return {
      id: m.id,
      name: m.name,
      username: m.displayUsername ?? m.username,
      image: m.image,
      relation,
    };
  });
}

/**
 * Send a friend request. No transaction needed: one INSERT ... ON CONFLICT DO
 * NOTHING, and if the pair already exists we branch on what's there — including
 * the crossing case, where they already requested us and our request is consent.
 */
export async function sendFriendRequest(
  targetUserId: string,
): Promise<{ ok: true; autoAccepted: boolean } | { ok: false; error: string }> {
  const me = await requireUser();

  if (targetUserId === me.id) {
    return { ok: false, error: "You can't add yourself." };
  }

  let inserted: { id: string }[];
  try {
    inserted = await db
      .insert(friendships)
      .values({ requesterId: me.id, addresseeId: targetUserId })
      .onConflictDoNothing()
      .returning({ id: friendships.id });
  } catch {
    // A crafted call with a non-existent target id trips the foreign key.
    return { ok: false, error: "That person couldn't be found." };
  }

  if (inserted.length > 0) {
    // A fresh request. Notify the addressee (best effort).
    after(async () => {
      const [target] = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, targetUserId));
      if (target) {
        await sendEmail({
          to: target.email,
          subject: `${me.name} sent you a friend request`,
          html: friendRequestEmail({
            toName: target.name,
            fromName: me.name,
            fromUsername: me.displayUsername ?? me.username ?? null,
            url: `${appUrl()}/friends`,
          }),
        });
      }
    });
    return { ok: true, autoAccepted: false };
  }

  // The pair already exists — find out how.
  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, me.id),
          eq(friendships.addresseeId, targetUserId),
        ),
        and(
          eq(friendships.requesterId, targetUserId),
          eq(friendships.addresseeId, me.id),
        ),
      ),
    );

  if (!existing) {
    return { ok: false, error: "Couldn't send the request." };
  }
  if (existing.status === "accepted") {
    return { ok: false, error: "You're already friends." };
  }
  if (existing.requesterId === me.id) {
    return { ok: false, error: "Request already sent." };
  }

  // The crossing case: they requested me first, and my request is consent.
  await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(
      and(
        eq(friendships.id, existing.id),
        eq(friendships.addresseeId, me.id),
        eq(friendships.status, "pending"),
      ),
    );
  revalidatePath("/friends");
  return { ok: true, autoAccepted: true };
}

/**
 * Accept or decline a request. Authorization is in the WHERE — you can only act
 * on a request addressed to you. Accept is one UPDATE; decline deletes the row
 * so the pair can request again later.
 */
export async function respondToFriendRequest(
  friendshipId: string,
  action: "accept" | "decline",
): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(friendshipId);
  if (!parsed.success) return { ok: false, error: "Request not found." };

  if (action === "accept") {
    const updated = await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(
        and(
          eq(friendships.id, parsed.data),
          eq(friendships.addresseeId, me.id),
          eq(friendships.status, "pending"),
        ),
      )
      .returning({ id: friendships.id });
    if (updated.length === 0) {
      return { ok: false, error: "Request not found." };
    }
  } else {
    const deleted = await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, parsed.data),
          eq(friendships.addresseeId, me.id),
          eq(friendships.status, "pending"),
        ),
      )
      .returning({ id: friendships.id });
    if (deleted.length === 0) {
      return { ok: false, error: "Request not found." };
    }
  }

  revalidatePath("/friends");
  return { ok: true };
}

/** Remove an accepted friend. Either side may do it. */
export async function removeFriend(friendshipId: string): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(friendshipId);
  if (!parsed.success) return { ok: false, error: "Friend not found." };

  const deleted = await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, parsed.data),
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterId, me.id),
          eq(friendships.addresseeId, me.id),
        ),
      ),
    )
    .returning({ id: friendships.id });

  if (deleted.length === 0) {
    return { ok: false, error: "Friend not found." };
  }

  revalidatePath("/friends");
  return { ok: true };
}
