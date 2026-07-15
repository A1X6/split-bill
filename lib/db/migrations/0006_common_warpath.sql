ALTER TABLE "bill_shares" ADD COLUMN "items_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD COLUMN "participants_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD COLUMN "tax_rate_snapshot" real;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
-- The old standalone "accepted" acknowledgement is gone; the lifecycle is now
-- pending -> paid -> confirmed. Reset legacy accepted rows to pending (they had
-- no payment recorded), leaving declined/pending untouched.
UPDATE "bill_shares" SET "status" = 'pending' WHERE "status" = 'accepted';