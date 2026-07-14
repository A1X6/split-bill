/**
 * One formatter behind every money value in the app.
 *
 * The locale is pinned deliberately: money renders in both server components
 * (the dashboard, shared bills) and client components (the editor). A locale
 * that varies by environment would produce a different string on each side and
 * hydration would mismatch.
 */
const LOCALE = "en-US";

export const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "AED", name: "UAE Dirham" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "JOD", name: "Jordanian Dinar" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "ZAR", name: "South African Rand" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

/** New bills start here. */
export const DEFAULT_CURRENCY: CurrencyCode = "EGP";

/**
 * Where unrecognised values land. Not the default: every bill written before
 * currencies existed rendered a "$", so reading those rows as EGP would
 * restate history.
 */
export const FALLBACK_CURRENCY: CurrencyCode = "USD";

const KNOWN = new Set<string>(CURRENCY_CODES);

/** Symbols and spellings the receipt scanner emits, mapped to ISO codes. */
const SYMBOL_TO_CODE: Record<string, CurrencyCode> = {
  $: "USD",
  US$: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
  "₺": "TRY",
  "E£": "EGP",
  LE: "EGP",
  "L.E.": "EGP",
  "ج.م": "EGP",
  "﷼": "SAR",
  "د.إ": "AED",
};

/**
 * The receipt scanner asks a vision model for "the currency code or symbol",
 * so it hands back anything: "USD", "$", "egp", "€", nonsense. Everything that
 * reaches the database has to come through here first — `billUpdateSchema`
 * rejects non-ISO codes, and a rejected payload fails the *whole* autosave.
 */
export function normalizeCurrency(
  raw: string | null | undefined,
): CurrencyCode | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  if (KNOWN.has(upper)) return upper as CurrencyCode;

  return SYMBOL_TO_CODE[trimmed] ?? SYMBOL_TO_CODE[upper] ?? null;
}

/** Any value read back from the database, coerced to something renderable. */
export function toCurrencyCode(raw: string | null | undefined): CurrencyCode {
  return normalizeCurrency(raw) ?? FALLBACK_CURRENCY;
}

// Building an Intl.NumberFormat is expensive and every results table would
// otherwise build one per cell.
const formatters = new Map<string, Intl.NumberFormat>();

function formatter(code: string): Intl.NumberFormat {
  let cached = formatters.get(code);
  if (!cached) {
    cached = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    });
    formatters.set(code, cached);
  }
  return cached;
}

export function formatMoney(
  amount: number,
  code: string | null | undefined,
): string {
  const resolved = toCurrencyCode(code);
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return formatter(resolved).format(value);
  } catch {
    // Intl throws RangeError on a code it doesn't know. Defence in depth: a
    // legacy row the backfill missed should render ugly, not crash the page.
    return `${resolved} ${value.toFixed(2)}`;
  }
}

/**
 * Minor units vary: JPY has none, KWD has three. Cost inputs that hardcode
 * step="0.01" are wrong for both.
 */
export function currencyDigits(code: string | null | undefined): number {
  const resolved = toCurrencyCode(code);
  try {
    return formatter(resolved).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function currencyStep(code: string | null | undefined): string {
  const digits = currencyDigits(code);
  return digits === 0 ? "1" : `0.${"0".repeat(digits - 1)}1`;
}

export function currencyPlaceholder(code: string | null | undefined): string {
  return (0).toFixed(currencyDigits(code));
}

export function currencySymbol(code: string | null | undefined): string {
  const resolved = toCurrencyCode(code);
  try {
    const part = formatter(resolved)
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? resolved;
  } catch {
    return resolved;
  }
}
