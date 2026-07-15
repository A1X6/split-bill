"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { billShares, bills, user } from "@/lib/db/schema";
import { appUrl, sendEmail } from "@/lib/email";
import { billShareEmail } from "@/lib/email/templates";
import { formatMoney } from "@/lib/currency";
import { getAcceptedFriends } from "@/lib/friends";
import { resolveDefaultPaymentMethod } from "@/lib/payments";
import { requireUser } from "@/lib/session";
import { calculateUserTotals } from "@/lib/split";

type ActionResult = { ok: true } | { ok: false; error: string };

const idSchema = z.uuid();
const recipientsSchema = z.array(z.string().min(1).max(64)).min(1).max(50);

/**
 * Send (or re-send) a bill to a set of recipients. Everything the recipient
 * acts on is snapshotted here — amount, currency, and a copy of the payer's
 * payment method — so it survives later edits or a deleted payment method.
 *
 * No transaction (the Neon HTTP driver has none): the whole fan-out is a single
 * INSERT ... ON CONFLICT DO UPDATE, so send and re-send are one atomic path.
 */
export async function sendBillShares(
  billId: string,
  recipientUserIds: string[],
): Promise<{ ok: true; sent: number } | { ok: false; error: string }> {
  const me = await requireUser();

  const parsedId = idSchema.safeParse(billId);
  if (!parsedId.success) return { ok: false, error: "Bill not found." };

  const parsedRecipients = recipientsSchema.safeParse(recipientUserIds);
  if (!parsedRecipients.success) {
    return { ok: false, error: "Select at least one person to send to." };
  }
  // De-dupe so the ON CONFLICT target never sees the same pair twice in one
  // statement (Postgres rejects a command that affects a row a second time).
  const requestedIds = [...new Set(parsedRecipients.data)];

  // Owner-scoped load — a non-owner (or a guessed id) gets nothing.
  const [bill] = await db
    .select()
    .from(bills)
    .where(and(eq(bills.id, parsedId.data), eq(bills.userId, me.id)))
    .limit(1);
  if (!bill) return { ok: false, error: "Bill not found." };

  if (!bill.payerParticipantId) {
    return { ok: false, error: "Choose who paid first." };
  }

  const payer = bill.participants.find((p) => p.id === bill.payerParticipantId);
  if (!payer) {
    return { ok: false, error: "Choose who paid first." };
  }

  // userId -> participant, for linked participants only. This is what makes a
  // recipient billable: they must be a real account on this bill.
  const participantByUserId = new Map(
    bill.participants
      .filter((p) => p.userId)
      .map((p) => [p.userId as string, p]),
  );

  const friendIds = new Set(
    (await getAcceptedFriends(me.id)).map((f) => f.id),
  );

  // Every recipient must be an accepted friend, a linked participant on this
  // bill, and not the payer. Reject the whole call on any bad one rather than
  // silently sending to a subset.
  for (const recipientId of requestedIds) {
    const participant = participantByUserId.get(recipientId);
    if (!participant) {
      return { ok: false, error: "Someone selected isn't on this bill." };
    }
    if (participant.id === bill.payerParticipantId) {
      return { ok: false, error: "You can't send the payer their own bill." };
    }
    if (!friendIds.has(recipientId)) {
      return { ok: false, error: "You can only send to accepted friends." };
    }
  }

  // Server-side recompute — never trust a client-supplied amount.
  const totals = calculateUserTotals(
    bill.participants,
    bill.items,
    bill.taxRate,
  );

  // Only attach a payment method when the payer is the owner — my InstaPay is
  // only the right destination when I'm the one who paid. If a friend paid, the
  // recipient view falls back to "ask them how to pay".
  const payerIsOwner = payer.userId === me.id;
  const method = payerIsOwner
    ? await resolveDefaultPaymentMethod(me.id, bill.paymentMethodId)
    : null;

  // The whole bill, snapshotted so the recipient can see every item and their
  // share. Participants are name-only — never leak other people's account ids.
  const participantsSnapshot = bill.participants.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const rows = requestedIds.map((recipientId) => {
    const participant = participantByUserId.get(recipientId)!;
    const amount = totals[participant.id]?.total ?? 0;
    return {
      billId: bill.id,
      ownerId: me.id,
      recipientUserId: recipientId,
      participantId: participant.id,
      amount,
      currency: bill.currency,
      billTitle: bill.title,
      payerName: payer.name,
      paymentMethodType: method?.type ?? null,
      paymentMethodLabel: method?.label ?? null,
      paymentMethodValue: method?.value ?? null,
      itemsSnapshot: bill.items,
      participantsSnapshot,
      taxRateSnapshot: bill.taxRate,
    };
  });

  // One statement for all N recipients. On re-send, re-open to pending when the
  // amount changed OR the share was declined — a re-send is the mechanism the
  // recipient's "ask them to re-send" hint points at, so it must clear a dispute
  // and give them their actions back. A cosmetic edit to an accepted/paid share
  // leaves it exactly as it was.
  const saved = await db
    .insert(billShares)
    .values(rows)
    .onConflictDoUpdate({
      target: [billShares.billId, billShares.recipientUserId],
      set: {
        participantId: sql`excluded.participant_id`,
        amount: sql`excluded.amount`,
        currency: sql`excluded.currency`,
        billTitle: sql`excluded.bill_title`,
        payerName: sql`excluded.payer_name`,
        paymentMethodType: sql`excluded.payment_method_type`,
        paymentMethodLabel: sql`excluded.payment_method_label`,
        paymentMethodValue: sql`excluded.payment_method_value`,
        itemsSnapshot: sql`excluded.items_snapshot`,
        participantsSnapshot: sql`excluded.participants_snapshot`,
        taxRateSnapshot: sql`excluded.tax_rate_snapshot`,
        sentAt: sql`now()`,
        updatedAt: sql`now()`,
        // A changed amount re-opens the share and wipes any paid/confirmed
        // state — the friend must re-pay the new amount. A cosmetic edit leaves
        // an already-settled share exactly as it was.
        status: sql`case when ${billShares.amount} <> excluded.amount or ${billShares.status} = 'declined' then 'pending' else ${billShares.status} end`,
        respondedAt: sql`case when ${billShares.amount} <> excluded.amount or ${billShares.status} = 'declined' then null else ${billShares.respondedAt} end`,
        paidAt: sql`case when ${billShares.amount} <> excluded.amount or ${billShares.status} = 'declined' then null else ${billShares.paidAt} end`,
        confirmedAt: sql`case when ${billShares.amount} <> excluded.amount or ${billShares.status} = 'declined' then null else ${billShares.confirmedAt} end`,
      },
    })
    .returning({
      id: billShares.id,
      recipientUserId: billShares.recipientUserId,
      amount: billShares.amount,
      currency: billShares.currency,
      billTitle: billShares.billTitle,
    });

  // Best-effort notifications, after the response flushes. Email is never a
  // mechanism — the in-app row above is the source of truth.
  after(async () => {
    const recipients = await db
      .select({ id: user.id, email: user.email, name: user.name })
      .from(user)
      .where(inArray(user.id, requestedIds));
    const emailById = new Map(recipients.map((r) => [r.id, r]));

    for (const share of saved) {
      const recipient = emailById.get(share.recipientUserId);
      if (!recipient) continue;
      await sendEmail({
        to: recipient.email,
        subject: `${me.name} sent you a bill`,
        html: billShareEmail({
          fromName: me.name,
          billTitle: share.billTitle,
          amount: formatMoney(share.amount, share.currency),
          url: `${appUrl()}/shared/${share.id}`,
        }),
      });
    }
  });

  revalidatePath(`/bills/${bill.id}`);
  revalidatePath("/dashboard");
  return { ok: true, sent: saved.length };
}

/**
 * The recipient marks their share paid (after actually sending the money).
 * Authorization is in the WHERE — only the recipient, and only while pending.
 * The owner still has to confirm receipt before it counts as settled.
 */
export async function markSharePaid(shareId: string): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(shareId);
  if (!parsed.success) return { ok: false, error: "Share not found." };

  const updated = await db
    .update(billShares)
    .set({ status: "paid", paidAt: sql`now()`, respondedAt: sql`now()` })
    .where(
      and(
        eq(billShares.id, parsed.data),
        eq(billShares.recipientUserId, me.id),
        eq(billShares.status, "pending"),
      ),
    )
    .returning({ id: billShares.id });

  if (updated.length === 0) {
    return { ok: false, error: "Share not found." };
  }

  revalidatePath(`/shared/${parsed.data}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * The recipient undoes a "paid" they marked by mistake — only allowed while the
 * owner hasn't confirmed yet (status still 'paid').
 */
export async function unmarkSharePaid(shareId: string): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(shareId);
  if (!parsed.success) return { ok: false, error: "Share not found." };

  const updated = await db
    .update(billShares)
    .set({ status: "pending", paidAt: null, respondedAt: null })
    .where(
      and(
        eq(billShares.id, parsed.data),
        eq(billShares.recipientUserId, me.id),
        eq(billShares.status, "paid"),
      ),
    )
    .returning({ id: billShares.id });

  if (updated.length === 0) {
    return { ok: false, error: "Couldn't undo — it may already be confirmed." };
  }

  revalidatePath(`/shared/${parsed.data}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * The owner confirms they received the money. Owner-scoped, and only from a
 * share the recipient has already marked paid.
 */
export async function confirmSharePayment(
  shareId: string,
): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(shareId);
  if (!parsed.success) return { ok: false, error: "Share not found." };

  const [row] = await db
    .update(billShares)
    .set({ status: "confirmed", confirmedAt: sql`now()` })
    .where(
      and(
        eq(billShares.id, parsed.data),
        eq(billShares.ownerId, me.id),
        eq(billShares.status, "paid"),
      ),
    )
    .returning({ billId: billShares.billId });

  if (!row) return { ok: false, error: "Nothing to confirm." };

  revalidatePath(`/bills/${row.billId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * The recipient disputes their share (wrong amount, not theirs, etc.). Allowed
 * from pending or paid, but not once the owner has confirmed.
 */
export async function disputeShare(shareId: string): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(shareId);
  if (!parsed.success) return { ok: false, error: "Share not found." };

  const updated = await db
    .update(billShares)
    .set({ status: "declined", paidAt: null, respondedAt: sql`now()` })
    .where(
      and(
        eq(billShares.id, parsed.data),
        eq(billShares.recipientUserId, me.id),
        inArray(billShares.status, ["pending", "paid"]),
      ),
    )
    .returning({ id: billShares.id });

  if (updated.length === 0) {
    return { ok: false, error: "Share not found." };
  }

  revalidatePath(`/shared/${parsed.data}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** The owner revokes a share they sent. Owner-scoped by the denormalized ownerId. */
export async function revokeShare(shareId: string): Promise<ActionResult> {
  const me = await requireUser();

  const parsed = idSchema.safeParse(shareId);
  if (!parsed.success) return { ok: false, error: "Share not found." };

  const [row] = await db
    .delete(billShares)
    .where(and(eq(billShares.id, parsed.data), eq(billShares.ownerId, me.id)))
    .returning({ billId: billShares.billId });

  if (!row) return { ok: false, error: "Share not found." };

  revalidatePath(`/bills/${row.billId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
