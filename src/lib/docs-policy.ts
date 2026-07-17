export const DOCUMENTS_REQUIRED_MIN_PRICE_DOLLARS = 250;

/**
 * Business rule: $225 orders may continue to Stripe with or without a current
 * document upload. Orders priced at $250 or more must have a document from the
 * current application before Stripe Checkout can be created. The price is
 * server-owned and deliberately validated here so malformed offerings fail
 * closed instead of accidentally weakening the payment gate.
 */
export function requiresDocumentsForPrice(priceDollars: number): boolean {
  if (
    !Number.isSafeInteger(priceDollars) ||
    priceDollars <= 0 ||
    priceDollars > 10_000
  ) {
    throw new Error("Invalid server-owned order price");
  }
  return priceDollars >= DOCUMENTS_REQUIRED_MIN_PRICE_DOLLARS;
}
