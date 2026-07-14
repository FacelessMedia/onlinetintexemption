import assert from "node:assert/strict";
import test from "node:test";
import {
  FLEET_SITE_HOSTS,
  FLEET_SITE_STATE_SLUGS,
  getFleetStatePrice,
  isAllowedFleetSite,
  isAllowedFleetSiteState,
  normalizeFleetSiteHost,
} from "../src/lib/fleet-sites.ts";

test("all 42 configured fleet domains are accepted with and without www", () => {
  assert.equal(FLEET_SITE_HOSTS.length, 42);
  assert.equal(new Set(FLEET_SITE_HOSTS).size, 42);
  for (const domain of FLEET_SITE_HOSTS) {
    assert.equal(isAllowedFleetSite(domain), true, domain);
    assert.equal(isAllowedFleetSite(`www.${domain}`), true, `www.${domain}`);
    assert.equal(isAllowedFleetSite(`https://www.${domain}/book`), true, domain);
  }
});

test("central webhook enforces each host's exact allowed state", () => {
  const allMappedStates = new Set(
    Object.values(FLEET_SITE_STATE_SLUGS).flatMap((states) => [...states])
  );
  for (const domain of FLEET_SITE_HOSTS) {
    const states = FLEET_SITE_STATE_SLUGS[domain];
    assert.ok(states.length > 0, domain);
    for (const state of states) {
      assert.equal(isAllowedFleetSiteState(domain, state), true, `${domain}/${state}`);
      assert.ok(getFleetStatePrice(state), `missing price for ${domain}/${state}`);
    }
    if (domain !== "onlinetintexemption.com") {
      assert.equal(states.length, 1, `${domain} must be single-state`);
      const wrongState = [...allMappedStates].find((state) => !states.includes(state as never));
      assert.ok(wrongState);
      assert.equal(
        isAllowedFleetSiteState(domain, wrongState as string),
        false,
        `${domain} incorrectly accepted ${wrongState}`
      );
    }
  }
  assert.equal(isAllowedFleetSiteState("floridatintexemption.com", "new-york"), false);
  assert.equal(isAllowedFleetSiteState("newyorktintlaw.com", "florida"), false);
  assert.equal(isAllowedFleetSiteState("onlinetintexemption.com", "delaware"), false);
  assert.equal(isAllowedFleetSiteState("delawaretintexemption.com", "delaware"), true);
});

test("fleet host normalization rejects lookalikes", () => {
  assert.equal(normalizeFleetSiteHost(" WWW.OnlineTintExemption.com. "), "onlinetintexemption.com");
  assert.equal(isAllowedFleetSite("onlinetintexemption.com.attacker.example"), false);
  assert.equal(isAllowedFleetSite("evil-onlinetintexemption.com"), false);
  assert.equal(isAllowedFleetSite("onlinetintexemption.com:443.evil.example"), false);
  assert.equal(isAllowedFleetSite("https://onlinetintexemption.com@evil.example"), false);
  assert.equal(isAllowedFleetSite(""), false);
});

test("central webhook pricing covers dedicated Delaware and Massachusetts sites", () => {
  assert.equal(getFleetStatePrice("delaware"), 250);
  assert.equal(getFleetStatePrice("massachusetts"), 250);
  assert.equal(getFleetStatePrice("new-york"), 350);
  assert.equal(getFleetStatePrice("unknown"), undefined);
});
