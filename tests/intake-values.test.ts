import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidDateOfBirth,
  normalizeUsPhone,
} from "../src/lib/intake-values.ts";

test("date of birth validation rejects impossible calendar dates", () => {
  const now = new Date("2026-07-14T12:00:00.000Z");
  assert.equal(isValidDateOfBirth("1990-02-28", now), true);
  assert.equal(isValidDateOfBirth("1990-02-31", now), false);
  assert.equal(isValidDateOfBirth("2026-07-15", now), false);
  assert.equal(isValidDateOfBirth("1900-01-01", now), false);
});

test("US phone normalization produces one consistent E.164-like value", () => {
  assert.equal(normalizeUsPhone("(734) 338-9453"), "+17343389453");
  assert.equal(normalizeUsPhone("1-734-338-9453"), "+17343389453");
  assert.equal(normalizeUsPhone("7343389453123"), null);
});
