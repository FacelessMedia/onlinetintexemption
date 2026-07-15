import assert from "node:assert/strict";
import test from "node:test";
import { requiresDocumentsForPrice } from "../src/lib/docs-policy.ts";

test("every valid order price requires current-application documents", () => {
  assert.equal(requiresDocumentsForPrice(1), true);
  assert.equal(requiresDocumentsForPrice(225), true);
  assert.equal(requiresDocumentsForPrice(249), true);
  assert.equal(requiresDocumentsForPrice(250), true);
  assert.equal(requiresDocumentsForPrice(350), true);
});

test("invalid server-owned prices fail closed", () => {
  for (const value of [0, -1, 249.99, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => requiresDocumentsForPrice(value));
  }
});
