import assert from "node:assert/strict";
import test from "node:test";
import { detectSensitiveData } from "../src/lib/support-chat-guards.ts";

test("support chat rejects obvious personal, medical, and payment data", () => {
  const blocked = [
    "Email me at person@example.com",
    "My phone is (734) 555-1212",
    "SSN 123-45-6789",
    "DOB: 01/02/1990",
    "I live at 123 Main Street",
    "Diagnosis: migraine; Patient Name: Example Person",
    "I have lupus and severe migraines",
    "My child had eye surgery and takes medication",
    "My card is 4242 4242 4242 4242",
  ];
  for (const input of blocked) assert.notEqual(detectSensitiveData(input), null, input);
});

test("support chat permits general process questions without pasted records", () => {
  const allowed = [
    "What kinds of documents are generally useful?",
    "Can a 225 dollar order continue without documents?",
    "How does the secure upload work?",
    "Does selecting a condition mean approval?",
  ];
  for (const input of allowed) assert.equal(detectSensitiveData(input), null, input);
});
