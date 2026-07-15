/** A person on a bill. Every participant added through the app is a linked
 * account (`userId` set) — that's what makes them shareable, now that splitting
 * is friends-only. Name-only rows exist only in legacy bills created before
 * that rule. */
export interface Participant {
  id: string;
  name: string;
  /** The linked account. Present for all app-created participants; absent only
   * on legacy name-only rows. */
  userId?: string;
}

/** A line item on a bill. `users` holds the participant ids sharing the item. */
export interface BillItem {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  users: string[];
}

export interface UserTotal {
  items: {
    name: string;
    cost: number;
    quantity: number;
    /** This person's cut of the line — the line total divided by everyone on it. */
    share: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

// --- Receipt scanning ---

export interface ScannedItem {
  name: string;
  price: number; // unit price
  quantity: number;
}

export interface ScannedTax {
  name: string;
  rate: number; // percent, e.g. 14 for 14%
}

export interface ScanReceiptResult {
  items: ScannedItem[];
  taxes: ScannedTax[];
  /**
   * Compound effective rate of all taxes applied multiplicatively,
   * e.g. 14% and 12% -> (1.14 * 1.12 - 1) * 100 = 27.68
   */
  combinedTaxRate: number;
  currency: string | null;
  total: number | null;
  model: string;
}
