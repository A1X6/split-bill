import "server-only";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { friendships, user } from "@/lib/db/schema";

/** A friend or a person in a search result. Never carries an email. */
export interface FriendSummary {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

export type FriendRelation =
  | "none"
  | "friends"
  | "incoming" // they requested me
  | "outgoing"; // I requested them

export interface PendingRequest {
  friendshipId: string;
  user: FriendSummary;
}

function summaryOf(row: {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  image: string | null;
}): FriendSummary {
  return {
    id: row.id,
    name: row.name,
    username: row.displayUsername ?? row.username,
    image: row.image,
  };
}

/**
 * Everyone the user is accepted friends with, each tagged with the friendship
 * row id (needed to remove them). One row per pair, so we pick whichever side
 * isn't the current user.
 */
export async function getAcceptedFriends(
  userId: string,
): Promise<(FriendSummary & { friendshipId: string })[]> {
  const requesterRows = await db
    .select({
      friendshipId: friendships.id,
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
    })
    .from(friendships)
    .innerJoin(user, eq(user.id, friendships.requesterId))
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    );

  const addresseeRows = await db
    .select({
      friendshipId: friendships.id,
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
    })
    .from(friendships)
    .innerJoin(user, eq(user.id, friendships.addresseeId))
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    );

  const addresseeByFriendship = new Map(
    addresseeRows.map((r) => [r.friendshipId, r]),
  );

  // For each friendship, the friend is whichever joined row isn't the current
  // user: the requester side unless that's me, in which case the addressee.
  return requesterRows.map((requesterRow) => {
    const friendRow =
      requesterRow.id !== userId
        ? requesterRow
        : addresseeByFriendship.get(requesterRow.friendshipId)!;
    return { ...summaryOf(friendRow), friendshipId: requesterRow.friendshipId };
  });
}

/** Incoming pending requests addressed to the user. */
export async function getIncomingRequests(
  userId: string,
): Promise<PendingRequest[]> {
  const rows = await db
    .select({
      friendshipId: friendships.id,
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
    })
    .from(friendships)
    .innerJoin(user, eq(user.id, friendships.requesterId))
    .where(
      and(
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    );

  return rows.map((r) => ({
    friendshipId: r.friendshipId,
    user: summaryOf(r),
  }));
}

/** Outgoing pending requests the user has sent. */
export async function getOutgoingRequests(
  userId: string,
): Promise<PendingRequest[]> {
  const rows = await db
    .select({
      friendshipId: friendships.id,
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
    })
    .from(friendships)
    .innerJoin(user, eq(user.id, friendships.addresseeId))
    .where(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.status, "pending"),
      ),
    );

  return rows.map((r) => ({
    friendshipId: r.friendshipId,
    user: summaryOf(r),
  }));
}
