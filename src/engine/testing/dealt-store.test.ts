/**
 * The store through which a run's workers share their boards, as the suite's
 * setup installs it (`scripts/checks/dealt-store.ts`). Read through the
 * interface, since `src/` has no Node types and `scripts/` no tests the suite
 * runs.
 */
import { afterAll, describe, expect, it } from "vitest";
import { type DealStore, shareDealsThrough } from "./dealt.ts";

describe("the boards a run's workers share", () => {
  // Read by putting it back at once: a worker shares through one store.
  const installed: DealStore | null = shareDealsThrough(null);
  shareDealsThrough(installed);
  afterAll(() => {
    shareDealsThrough(installed);
  });

  it("is installed in every worker of a run", () => {
    expect(installed).not.toBeNull();
  });

  it("makes the first worker to ask the one to deal, and hands its board on", () => {
    const store = installed as DealStore;
    const key = "dealt-store.test|5x5#0";
    expect(store.take(key)).toBeNull();
    store.put(key, { cpu: 3, board: { desc: "d", aux: "a" } });
    expect(store.take(key)).toEqual({ cpu: 3, board: { desc: "d", aux: "a" } });
  });

  it("keeps keys apart whatever characters the params hold", () => {
    const store = installed as DealStore;
    store.put("dealt-store.test|3/4:x#0", { cpu: 1, board: { desc: "slash" } });
    expect(store.take("dealt-store.test|3%2F4:x#0")).toBeNull();
    // Guess's params differ in case alone, which a Mac's file names ignore.
    store.put("dealt-store.test|c6p4g10Bm#0", { cpu: 1, board: { desc: "B" } });
    expect(store.take("dealt-store.test|c6p4g10bm#0")).toBeNull();
  });
});
