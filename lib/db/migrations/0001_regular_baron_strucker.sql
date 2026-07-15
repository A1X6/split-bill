-- Backfill before the NOT NULL: `currency` was nullable and the receipt scanner
-- wrote whatever the vision model said ("$", "USD", "€"). Bills written before
-- this all rendered a "$", so unknown values land on USD rather than the new
-- EGP default — reading them as EGP would restate what those bills said.
UPDATE "bills" SET "currency" = CASE
  WHEN "currency" IS NULL THEN 'USD'
  WHEN upper(trim("currency")) IN ('USD', '$', 'US$') THEN 'USD'
  WHEN upper(trim("currency")) IN ('EGP', 'E£', 'LE', 'L.E.') OR trim("currency") = 'ج.م' THEN 'EGP'
  WHEN upper(trim("currency")) = 'EUR' OR trim("currency") = '€' THEN 'EUR'
  WHEN upper(trim("currency")) = 'GBP' OR trim("currency") = '£' THEN 'GBP'
  WHEN upper(trim("currency")) = 'JPY' OR trim("currency") = '¥' THEN 'JPY'
  WHEN upper(trim("currency")) = 'INR' OR trim("currency") = '₹' THEN 'INR'
  WHEN upper(trim("currency")) = 'TRY' OR trim("currency") = '₺' THEN 'TRY'
  WHEN upper(trim("currency")) IN (
    'SAR', 'AED', 'KWD', 'QAR', 'JOD', 'CNY', 'CAD', 'AUD', 'CHF', 'SEK', 'ZAR'
  ) THEN upper(trim("currency"))
  ELSE 'USD'
END;--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "currency" SET DEFAULT 'EGP';--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "currency" SET NOT NULL;
