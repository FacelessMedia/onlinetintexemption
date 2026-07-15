import assert from "node:assert/strict";
import test from "node:test";
import { validatedDocsExplainerVideoUrl } from "../src/lib/docs-explainer-video.ts";

const VALID_ID = "abcDEF1234567890";
const VALID_URL = `https://app.heygen.com/embeds/${VALID_ID}`;

test("accepts an exact HTTPS HeyGen embed URL", () => {
  assert.equal(validatedDocsExplainerVideoUrl(VALID_URL), VALID_URL);
});

test("strips a fragment from an otherwise valid embed URL", () => {
  assert.equal(
    validatedDocsExplainerVideoUrl(`${VALID_URL}#untrusted-fragment`),
    VALID_URL
  );
});

test("rejects URL forms outside the explicit host and path allowlist", () => {
  const invalid = [
    `http://app.heygen.com/embeds/${VALID_ID}`,
    `https://user:password@app.heygen.com/embeds/${VALID_ID}`,
    `https://example.com/embeds/${VALID_ID}`,
    `https://app.heygen.com.evil.example/embeds/${VALID_ID}`,
    `https://app.heygen.com/share/${VALID_ID}`,
    `https://app.heygen.com/embeds/${VALID_ID}?`,
    `https://app.heygen.com/embeds/${VALID_ID}?autoplay=1`,
    "https://app.heygen.com/embeds/short",
    `https://app.heygen.com/embeds/${"a".repeat(121)}`,
    "javascript:alert(1)",
  ];
  for (const value of invalid) {
    assert.equal(validatedDocsExplainerVideoUrl(value), null, value);
  }
});

test("returns null for missing or malformed configuration", () => {
  assert.equal(validatedDocsExplainerVideoUrl(undefined), null);
  assert.equal(validatedDocsExplainerVideoUrl("   "), null);
  assert.equal(validatedDocsExplainerVideoUrl("not a URL"), null);
});
