/**
 * Business rule: every order requires a current-application document upload
 * before Stripe Checkout can be created, regardless of price. The price is
 * still validated because every payment path must fail closed when the
 * server-owned offering is malformed.
 */
export function requiresDocumentsForPrice(priceDollars: number): boolean {
  if (
    !Number.isSafeInteger(priceDollars) ||
    priceDollars <= 0 ||
    priceDollars > 10_000
  ) {
    throw new Error("Invalid server-owned order price");
  }
  return true;
}
