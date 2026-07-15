import assert from "node:assert/strict";
import test from "node:test";
import { withOpportunityStageLock } from "../src/lib/opportunity-stage-lock.ts";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("stage updates for one opportunity are serialized", async () => {
  let active = 0;
  let maximumActive = 0;
  const work = () =>
    withOpportunityStageLock("shared-opportunity", async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await pause(20);
      active -= 1;
    });

  await Promise.all([work(), work(), work()]);
  assert.equal(maximumActive, 1);
});

test("a failed stage update releases its owner-safe lock", async () => {
  await assert.rejects(
    withOpportunityStageLock("retry-opportunity", async () => {
      throw new Error("test failure");
    }),
    /test failure/
  );
  const result = await withOpportunityStageLock(
    "retry-opportunity",
    async () => "recovered"
  );
  assert.equal(result, "recovered");
});
