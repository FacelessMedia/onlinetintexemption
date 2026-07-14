import assert from "node:assert/strict";
import test from "node:test";
import {
  DOCS_REQUIRED_MIN_PRICE,
  requiresDocumentsForPrice,
} from "../src/lib/docs-policy.ts";

test("document threshold is immutable at $250", () => {
  assert.equal(DOCS_REQUIRED_MIN_PRICE, 250);
  assert.equal(requiresDocumentsForPrice(225), false);
  assert.equal(requiresDocumentsForPrice(249), false);
  assert.equal(requiresDocumentsForPrice(250), true);
  assert.equal(requiresDocumentsForPrice(350), true);
});

test("invalid server-owned prices fail closed", () => {
  for (const value of [0, -1, 249.99, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => requiresDocumentsForPrice(value));
  }
});
