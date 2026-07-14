import { ScannedItem, ScannedTax, ScanReceiptResult } from "@/lib/types";
import { auth } from "@/lib/auth";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free vision-capable models on OpenRouter, tried in order.
// `jsonMode` marks models that support the `response_format` parameter.
const MODELS: { id: string; jsonMode: boolean }[] = [
  { id: "google/gemma-4-31b-it:free", jsonMode: true },
  { id: "google/gemma-4-26b-a4b-it:free", jsonMode: true },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", jsonMode: false },
];

const SYSTEM_PROMPT = `You are a receipt and menu parser. The user sends a photo of a restaurant receipt, bill, or menu order. Extract the data and reply with ONLY a JSON object, no markdown, no explanations.

JSON shape:
{
  "items": [{ "name": string, "price": number, "quantity": number }],
  "taxes": [{ "name": string, "rate": number }],
  "currency": string or null,
  "total": number or null
}

Rules:
- "items": every purchased line item. "price" is the UNIT price (if the line shows a total for quantity > 1, divide by the quantity). "quantity" is a positive integer, default 1.
- Never include subtotal, tax, service charge, tip, discount, or total lines as items.
- "taxes": every percentage-based addition on the receipt (VAT, sales tax, service charge, etc.) with "rate" as the percent number (14 for 14%). If the receipt only shows a tax AMOUNT, derive the rate as amount / subtotal * 100 rounded to 2 decimals. If there are no taxes, use an empty array.
- "currency": the currency code or symbol if visible, else null.
- "total": the final grand total printed on the receipt, else null.
- Use plain numbers (no currency symbols, no thousands separators).`;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // ~8MB of base64 payload

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Pull the first JSON object out of a model reply that may include fences or prose. */
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("No JSON object in model reply");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/[^0-9.\-]/g, ""));
    if (!isNaN(n) && isFinite(n)) return n;
  }
  return null;
}

function normalizeResult(raw: unknown): {
  items: ScannedItem[];
  taxes: ScannedTax[];
  currency: string | null;
  total: number | null;
} {
  const obj = (raw ?? {}) as Record<string, unknown>;

  const items: ScannedItem[] = (Array.isArray(obj.items) ? obj.items : [])
    .map((entry): ScannedItem | null => {
      const it = (entry ?? {}) as Record<string, unknown>;
      const name = typeof it.name === "string" ? it.name.trim() : "";
      const price = toNumber(it.price);
      const quantity = Math.max(1, Math.round(toNumber(it.quantity) ?? 1));
      if (!name || price === null || price <= 0) return null;
      return { name, price, quantity };
    })
    .filter((it): it is ScannedItem => it !== null);

  const taxes: ScannedTax[] = (Array.isArray(obj.taxes) ? obj.taxes : [])
    .map((entry): ScannedTax | null => {
      const t = (entry ?? {}) as Record<string, unknown>;
      const name = typeof t.name === "string" && t.name.trim() ? t.name.trim() : "Tax";
      const rate = toNumber(t.rate);
      if (rate === null || rate <= 0 || rate >= 100) return null;
      return { name, rate };
    })
    .filter((t): t is ScannedTax => t !== null);

  return {
    items,
    taxes,
    currency: typeof obj.currency === "string" && obj.currency.trim() ? obj.currency.trim() : null,
    total: toNumber(obj.total),
  };
}

/** Compound taxes multiplicatively: 14% and 12% -> (1.14 * 1.12 - 1) * 100 = 27.68 */
function combineTaxRates(taxes: ScannedTax[]): number {
  const factor = taxes.reduce((acc, t) => acc * (1 + t.rate / 100), 1);
  return Math.round((factor - 1) * 100 * 100) / 100;
}

async function callModel(
  apiKey: string,
  model: { id: string; jsonMode: boolean },
  image: string
): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/split-bill",
      "X-Title": "Split Bill",
    },
    body: JSON.stringify({
      model: model.id,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the items and taxes from this receipt." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      ...(model.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${model.id} responded ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`${model.id} returned an empty reply`);
  }
  return content;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return jsonError("Sign in to scan receipts.", 401);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonError(
      "OPENROUTER_API_KEY is not set. Create a free key at https://openrouter.ai/keys and add it to .env.local.",
      500
    );
  }

  let image: unknown;
  try {
    ({ image } = await request.json());
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  if (typeof image !== "string" || !/^data:image\/(png|jpe?g|webp);base64,/.test(image)) {
    return jsonError("Send a base64 data URL of a PNG, JPEG, or WebP image.", 400);
  }
  if (image.length > MAX_IMAGE_BYTES) {
    return jsonError("Image is too large. Please use a smaller photo.", 413);
  }

  const models = process.env.OPENROUTER_MODEL
    ? [{ id: process.env.OPENROUTER_MODEL, jsonMode: false }, ...MODELS]
    : MODELS;

  const errors: string[] = [];
  for (const model of models) {
    try {
      const reply = await callModel(apiKey, model, image);
      const normalized = normalizeResult(extractJson(reply));
      if (normalized.items.length === 0) {
        throw new Error(`${model.id} found no items in the image`);
      }
      const result: ScanReceiptResult = {
        ...normalized,
        combinedTaxRate: combineTaxRates(normalized.taxes),
        model: model.id,
      };
      return Response.json(result);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  const rateLimited = errors.some((e) => e.includes(" 429"));
  return jsonError(
    rateLimited
      ? "The free AI models are rate-limited right now. Wait a minute and try again."
      : `Could not read the receipt. Try a clearer, well-lit photo. (${errors[errors.length - 1] ?? "unknown error"})`,
    502
  );
}
