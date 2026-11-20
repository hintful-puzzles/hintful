/**
 * Tier-1 tests for a deal's census: what `npm run deal-walk` reads of a
 * generator, and what the tests' load window counts. A count lands in the
 * census taken around it and nowhere else, and a draw thrown away is still
 * `null` to its caller.
 */
import { describe, expect, it } from "vitest";
import { drawRejected, newDealCensus, takingCensus } from "./deal-census.ts";
import { retryLimit } from "./retry-limit.ts";

/** A generator's shape: a guarded loop whose draws are thrown away at a
 * named stage until the third. */
function deal(): number {
  const attempt = retryLimit("test: generation");
  for (let n = 1; ; n++) {
    attempt();
    const drawn = n < 3 ? drawRejected("test: too early") : n;
    if (drawn !== null) return drawn;
  }
}

describe("deal census", () => {
  it("counts a deal's tries and the stages its draws were thrown away at", () => {
    const census = newDealCensus();
    expect(takingCensus(census, deal)).toBe(3);
    expect([...census.tries]).toEqual([["test: generation", 3]]);
    expect([...census.rejected]).toEqual([["test: too early", 2]]);
  });

  it("counts into the census taken innermost, and none outside one", () => {
    const outer = newDealCensus();
    const inner = newDealCensus();
    expect(drawRejected("test: uncounted")).toBeNull();
    takingCensus(outer, () => {
      takingCensus(inner, deal);
      drawRejected("test: outer");
    });
    expect([...inner.rejected]).toEqual([["test: too early", 2]]);
    expect([...outer.rejected]).toEqual([["test: outer", 1]]);
    expect(outer.tries.size).toBe(0);
  });
});
