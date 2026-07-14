/**
 * Business rule: every order priced at $250 or more requires a current-order
 * document upload before Stripe Checkout can be created. This threshold is
 * intentionally code-owned and cannot be weakened or changed by environment
 * configuration.
 */
export const DOCS_REQUIRED_MIN_PRICE = 250 as const;

/**
 * Validate the server-owned price before applying the immutable threshold.
 * Throwing on an invalid price keeps every payment path fail-closed.
 */
export function requiresDocumentsForPrice(priceDollars: number): boolean {
  if (
    !Number.isSafeInteger(priceDollars) ||
    priceDollars <= 0 ||
    priceDollars > 10_000
  ) {
    throw new Error("Invalid server-owned order price");
  }
  return priceDollars >= DOCS_REQUIRED_MIN_PRICE;
}
