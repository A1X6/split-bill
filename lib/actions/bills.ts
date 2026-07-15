"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { bills, paymentMethods } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { billUpdateSchema } from "@/lib/validation/bill";

const idSchema = z.uuid();

export async function createBill(): Promise<never> {
  const user = await requireUser();
  const [bill] = await db
    .insert(bills)
    .values({ userId: user.id })
    .returning({ id: bills.id });
  revalidatePath("/dashboard");
  redirect(`/bills/${bill.id}`);
}

export async function updateBill(
  id: string,
  input: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Bill not found." };
  }

  const parsed = billUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid bill data." };
  }

  // IDOR guard: paymentMethodId is the one client-settable field that points at
  // another table. zod can't check ownership, so verify it here — otherwise a
  // crafted autosave could attach a stranger's InstaPay method to this bill and
  // the share fan-out would snapshot their details. Reject the whole save
  // rather than silently null it, so the failure is visible.
  if (parsed.data.paymentMethodId !== null) {
    const owned = await db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, parsed.data.paymentMethodId),
          eq(paymentMethods.userId, user.id)
        )
      )
      .limit(1);
    if (owned.length === 0) {
      return { ok: false, error: "Invalid payment method." };
    }
  }

  const updated = await db
    .update(bills)
    .set(parsed.data)
    .where(and(eq(bills.id, parsedId.data), eq(bills.userId, user.id)))
    .returning({ id: bills.id });

  if (updated.length === 0) {
    return { ok: false, error: "Bill not found." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBill(id: string): Promise<void> {
  const user = await requireUser();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return;

  await db
    .delete(bills)
    .where(and(eq(bills.id, parsedId.data), eq(bills.userId, user.id)));

  revalidatePath("/dashboard");
}
