/** A person on a bill. Usually an ad-hoc display name; when linked to a real
 * account, `userId` is set (that's what makes them shareable). */
export interface Participant {
  id: string;
  name: string;
  /** Set when this participant is a registered user. Absent for ad-hoc names. */
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
