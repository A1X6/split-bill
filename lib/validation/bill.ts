import { z } from "zod";

export const participantSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
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
    currency: z.string().max(8).nullable(),
    participants: z.array(participantSchema).max(50),
    items: z.array(itemSchema).max(200),
  })
  .superRefine((data, ctx) => {
    // Referential integrity jsonb can't enforce: every assignment must
    // point at a participant that exists on this bill.
    const ids = new Set(data.participants.map((p) => p.id));
    data.items.forEach((item, index) => {
      if (item.users.some((userId) => !ids.has(userId))) {
        ctx.addIssue({
          code: "custom",
          message: `Item "${item.name}" is assigned to an unknown participant.`,
          path: ["items", index, "users"],
        });
      }
    });
  });

export type BillUpdateInput = z.infer<typeof billUpdateSchema>;
