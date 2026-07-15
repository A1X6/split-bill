import { z } from "zod";
import { CURRENCY_CODES } from "../currency";

export const participantSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  // Optional, NOT nullable: a legacy participant is just {id, name}, and an
  // unset userId is dropped by JSON.stringify rather than written as null — so
  // existing bills stay byte-identical.
  userId: z.string().max(64).optional(),
});

export const itemSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  cost: z.number().positive().finite(),
  quantity: z.number().int().min(1).max(999),
  users: z.array(z.string().min(1).max(100)).max(50),
});

export const billUpdateSchema = z
  .object({
    title: z.string().max(120),
    taxRate: z.number().min(0).max(100),
    // An ISO code, never a symbol. Anything the receipt scanner produces goes
    // through normalizeCurrency() first — a value that fails here fails the
    // whole payload, and the bill silently stops autosaving.
    currency: z.enum(CURRENCY_CODES),
    participants: z.array(participantSchema).max(50),
    items: z.array(itemSchema).max(200),
    // Who paid — a Participant.id in this bill's jsonb. Nullable: a bill may
    // have no payer chosen yet.
    payerParticipantId: z.string().max(100).nullable(),
    // The payment method to attach when sending shares. Ownership is NOT
    // checkable here (it references another table) — updateBill re-verifies it
    // belongs to the caller. See the IDOR note in lib/actions/bills.ts.
    paymentMethodId: z.uuid().nullable(),
  })
  .superRefine((data, ctx) => {
    // The split math keys totals by participant id, so a duplicate id would
    // quietly merge two people into one.
    const ids = new Set<string>();
    const userIds = new Set<string>();
    data.participants.forEach((participant, index) => {
      if (ids.has(participant.id)) {
        ctx.addIssue({
          code: "custom",
          message: "Two participants share the same id.",
          path: ["participants", index, "id"],
        });
      }
      ids.add(participant.id);

      // The same account can't appear twice — otherwise a friend gets billed
      // twice and the share fan-out has two rows for one recipient.
      if (participant.userId) {
        if (userIds.has(participant.userId)) {
          ctx.addIssue({
            code: "custom",
            message: "That person is already on this bill.",
            path: ["participants", index, "userId"],
          });
        }
        userIds.add(participant.userId);
      }
    });

    // Referential integrity jsonb can't enforce: every assignment must
    // point at a participant that exists on this bill.
    data.items.forEach((item, index) => {
      if (item.users.some((userId) => !ids.has(userId))) {
        ctx.addIssue({
          code: "custom",
          message: `Item "${item.name}" is assigned to an unknown participant.`,
          path: ["items", index, "users"],
        });
      }
    });

    // The payer must be someone actually on the bill.
    if (data.payerParticipantId !== null && !ids.has(data.payerParticipantId)) {
      ctx.addIssue({
        code: "custom",
        message: "The payer isn't a participant on this bill.",
        path: ["payerParticipantId"],
      });
    }
  });

export type BillUpdateInput = z.infer<typeof billUpdateSchema>;
