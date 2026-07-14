import assert from "node:assert/strict";
import test from "node:test";
import {
  issueUploadReceipt,
  verifyUploadReceipt,
} from "../src/lib/upload-receipt.ts";

const originalSecret = process.env.ORDER_TOKEN_SECRET;
process.env.ORDER_TOKEN_SECRET = "test-order-token-secret-that-is-at-least-32-characters";

const subject = {
  orderJti: "order-one",
  contactId: "contact-one",
  siteName: "national-site",
};

test.after(() => {
  if (originalSecret === undefined) delete process.env.ORDER_TOKEN_SECRET;
  else process.env.ORDER_TOKEN_SECRET = originalSecret;
});

test("upload receipt verifies only for its bound order, contact, and site", () => {
  const receipt = issueUploadReceipt(subject, 10_000);
  assert.doesNotThrow(() => verifyUploadReceipt(receipt, subject, 10_001));
  assert.throws(() =>
    verifyUploadReceipt(receipt, { ...subject, orderJti: "order-two" }, 10_001)
  );
  assert.throws(() =>
    verifyUploadReceipt(receipt, { ...subject, contactId: "contact-two" }, 10_001)
  );
  assert.throws(() =>
    verifyUploadReceipt(receipt, { ...subject, siteName: "other-site" }, 10_001)
  );
});

test("upload receipt rejects tampering and expiration", () => {
  const receipt = issueUploadReceipt(subject, 10_000);
  const tampered = `${receipt.slice(0, -1)}${receipt.endsWith("a") ? "b" : "a"}`;
  assert.throws(() => verifyUploadReceipt(tampered, subject, 10_001));
  assert.throws(
    () => verifyUploadReceipt(receipt, subject, 11_801),
    /expired/i
  );
});
