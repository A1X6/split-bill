import { BillItem, Participant, UserTotal } from "./types";

/**
 * Even split per item across its assigned participants; tax applied
 * proportionally to each participant's subtotal.
 */
export function calculateUserTotals(
  participants: Participant[],
  items: BillItem[],
  taxRatePercent: number
): Record<string, UserTotal> {
  const userTotals: Record<string, UserTotal> = {};

  participants.forEach((participant) => {
    userTotals[participant.id] = {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  });

  items.forEach((item) => {
    const numUsers = item.users.length;
    if (numUsers === 0) return;
    const costPerUser = (item.cost * item.quantity) / numUsers;

    item.users.forEach((userId) => {
      if (userTotals[userId]) {
        userTotals[userId].items.push({
          name: item.name,
          cost: item.cost,
          quantity: item.quantity,
        });
        userTotals[userId].subtotal += costPerUser;
      }
    });
  });

  const taxFactor = taxRatePercent > 0 ? taxRatePercent / 100 : 0;

  Object.keys(userTotals).forEach((userId) => {
    const tax = userTotals[userId].subtotal * taxFactor;
    userTotals[userId].tax = tax;
    userTotals[userId].total = userTotals[userId].subtotal + tax;
  });

  return userTotals;
}

export function calculateOverallTotal(
  participants: Participant[],
  items: BillItem[],
  taxRatePercent: number
): number {
  const userTotals = calculateUserTotals(participants, items, taxRatePercent);
  return Object.values(userTotals).reduce((sum, user) => sum + user.total, 0);
}
