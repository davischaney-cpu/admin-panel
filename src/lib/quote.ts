export function calculateQuoteTotals(items: Array<{ quantity: number; unitCents: number }>, taxCents = 0, discountCents = 0) {
  const subtotalCents = items.reduce((sum, item) => sum + item.quantity * item.unitCents, 0);
  const totalCents = Math.max(0, subtotalCents + taxCents - discountCents);
  return { subtotalCents, totalCents };
}
