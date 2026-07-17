import assert from "node:assert/strict";
import test from "node:test";
import { requiresDocumentsForPrice } from "../src/lib/docs-policy.ts";

test("documents become mandatory at the $250 checkout threshold", () => {
  assert.equal(requiresDocumentsForPrice(1), false);
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
