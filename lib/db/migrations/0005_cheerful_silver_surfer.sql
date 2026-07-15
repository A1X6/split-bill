CREATE TABLE "bill_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"recipient_user_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text NOT NULL,
	"bill_title" text NOT NULL,
	"payer_name" text NOT NULL,
	"payment_method_type" text,
	"payment_method_label" text,
	"payment_method_value" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "payer_participant_id" text;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "payment_method_id" uuid;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD CONSTRAINT "bill_shares_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD CONSTRAINT "bill_shares_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_shares" ADD CONSTRAINT "bill_shares_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bill_shares_bill_recipient_uq" ON "bill_shares" USING btree ("bill_id","recipient_user_id");--> statement-breakpoint
CREATE INDEX "bill_shares_recipient_status_idx" ON "bill_shares" USING btree ("recipient_user_id","status");--> statement-breakpoint
CREATE INDEX "bill_shares_bill_idx" ON "bill_shares" USING btree ("bill_id");--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;