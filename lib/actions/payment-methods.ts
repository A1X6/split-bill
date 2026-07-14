"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { paymentMethods } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { paymentMethodSchema } from "@/lib/validation/payment";

const MAX_METHODS = 5;
const idSchema = z.uuid();

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createPaymentMethod(
  input: unknown,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireUser();

  const parsed = paymentMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, user.id));
  if (count >= MAX_METHODS) {
    return { ok: false, error: `You can have at most ${MAX_METHODS}.` };
  }

  const [created] = await db
    .insert(paymentMethods)
    .values({
      userId: user.id,
      type: parsed.data.type,
      label: parsed.data.label,
      value: parsed.data.value,
      // First method a user adds becomes their default.
      isDefault: count === 0,
    })
    .returning({ id: paymentMethods.id });

  revalidatePath("/profile");
  return { ok: true, id: created.id };
}

export async function updatePaymentMethod(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Not found." };

  const parsed = paymentMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }

  const updated = await db
    .update(paymentMethods)
    .set({
      type: parsed.data.type,
      label: parsed.data.label,
      value: parsed.data.value,
    })
    .where(
      and(
        eq(paymentMethods.id, parsedId.data),
        eq(paymentMethods.userId, user.id),
      ),
    )
    .returning({ id: paymentMethods.id });

  if (updated.length === 0) return { ok: false, error: "Not found." };

  revalidatePath("/profile");
  return { ok: true };
}

export async function deletePaymentMethod(id: string): Promise<ActionResult> {
  const user = await requireUser();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Not found." };

  // No repair write needed: reads pick the default with
  // `order by is_default desc, created_at desc limit 1`, so if the deleted row
  // was the default, the newest remaining method wins automatically.
  const deleted = await db
    .delete(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, parsedId.data),
        eq(paymentMethods.userId, user.id),
      ),
    )
    .returning({ id: paymentMethods.id });

  if (deleted.length === 0) return { ok: false, error: "Not found." };

  revalidatePath("/profile");
  return { ok: true };
}

export async function setDefaultPaymentMethod(
  id: string,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Not found." };

  // Ownership pre-check FIRST. A bare UPDATE with a bad id would silently clear
  // every one of this user's defaults (the SET below turns all others off).
  const [owned] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(
      and(eq(paymentMethods.id, parsedId.data), eq(paymentMethods.userId, user.id)),
    );
  if (!owned) return { ok: false, error: "Not found." };

  // One statement flips the old default off and the new one on — atomic
  // without a transaction.
  await db
    .update(paymentMethods)
    .set({ isDefault: sql`${paymentMethods.id} = ${parsedId.data}` })
    .where(eq(paymentMethods.userId, user.id));

  revalidatePath("/profile");
  return { ok: true };
}
