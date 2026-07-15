import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentMethods, type PaymentMethod } from "@/lib/db/schema";

/**
 * A user's payment methods, default first then newest — the "tolerant read"
 * that lets a deleted default fall through to the next method without a repair
 * write. Server-only: never expose a userId-parameterised reader as a callable
 * action, or a client could read anyone's methods.
 */
export async function listPaymentMethods(
  userId: string,
): Promise<PaymentMethod[]> {
  return db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
}

/** The one method to attach to a bill by default: explicit pick, else the read order. */
export async function resolveDefaultPaymentMethod(
  userId: string,
  preferredId: string | null,
): Promise<PaymentMethod | null> {
  if (preferredId) {
    const [preferred] = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, preferredId),
          eq(paymentMethods.userId, userId),
        ),
      );
    if (preferred) return preferred;
  }
  const [fallback] = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt))
    .limit(1);
  return fallback ?? null;
}
