import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_REGENERATE,
  RetryLimitExceeded,
  retryLimit,
  underDealDeadline,
  underDealTries,
} from "./retry-limit.ts";

afterEach(() => vi.restoreAllMocks());

describe("retryLimit", () => {
  it("allows exactly `max` attempts before giving up", () => {
    const attempt = retryLimit("t", 3);
    expect(() => {
      attempt();
      attempt();
      attempt();
    }).not.toThrow();
    expect(() => attempt()).toThrow(RetryLimitExceeded);
  });

  it("bounds a loop that never succeeds", () => {
    let rounds = 0;
    expect(() => {
      const attempt = retryLimit("tents: generation", 7);
      for (;;) {
        attempt();
        rounds++;
      }
    }).toThrow(RetryLimitExceeded);
    expect(rounds).toBe(7);
  });

  it("names the loop and the budget in the message", () => {
    let err: unknown;
    try {
      const attempt = retryLimit("net: shuffle", 5);
      for (;;) attempt();
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(RetryLimitExceeded);
    expect((err as RetryLimitExceeded).label).toBe("net: shuffle");
    expect((err as RetryLimitExceeded).max).toBe(5);
    expect((err as Error).message).toBe("net: shuffle: gave up after 5 attempts");
    expect((err as Error).name).toBe("RetryLimitExceeded");
  });

  it("never fires for a loop that succeeds within budget", () => {
    let rounds = 0;
    expect(() => {
      const attempt = retryLimit("t", 1000);
      for (;;) {
        attempt();
        if (++rounds === 3) break;
      }
    }).not.toThrow();
    expect(rounds).toBe(3);
  });

  it("gives each guard an independent budget", () => {
    const outer = retryLimit("outer", 2);
    const inner = retryLimit("inner", 2);
    outer();
    inner();
    inner();
    // `inner` is spent; `outer` still has an attempt left.
    expect(() => inner()).toThrow(RetryLimitExceeded);
    expect(() => outer()).not.toThrow();
  });

  it("defaults to the house budget", () => {
    let rounds = 0;
    expect(() => {
      const attempt = retryLimit("t");
      for (;;) {
        attempt();
        rounds++;
      }
    }).toThrow(RetryLimitExceeded);
    expect(rounds).toBe(MAX_REGENERATE);
  });

  it("allows a test that deals a rare board more tries, and only while it deals", () => {
    const runOut = (): number => {
      let rounds = 0;
      const attempt = retryLimit("t");
      try {
        for (;;) {
          attempt();
          rounds++;
        }
      } catch {
        return rounds;
      }
    };
    expect(underDealTries(3 * MAX_REGENERATE, runOut)).toBe(3 * MAX_REGENERATE);
    expect(runOut()).toBe(MAX_REGENERATE);
    // A count that is the algorithm's is not raised.
    expect(() =>
      underDealTries(3 * MAX_REGENERATE, () => {
        const attempt = retryLimit("t", 2);
        for (;;) attempt();
      }),
    ).toThrow("t: gave up after 2 attempts");
  });

  it("reads no clock where no deadline is armed", () => {
    const now = vi.spyOn(performance, "now");
    const attempt = retryLimit("t", 3);
    attempt();
    expect(now).not.toHaveBeenCalled();
  });
});

describe("a guard under a deal's deadline", () => {
  /** A clock that moves one millisecond each time it is read: once to arm
   * the deadline, and once a try after that. */
  function tickingClock(): void {
    let ms = 0;
    vi.spyOn(performance, "now").mockImplementation(() => ms++);
  }

  /** The tries a loop that never succeeds makes before it gives up. */
  function triesUntilItGivesUp(deadlineMs: number, max?: number): number {
    let rounds = 0;
    expect(() =>
      underDealDeadline(deadlineMs, () => {
        const attempt = retryLimit("t", max);
        for (;;) {
          attempt();
          rounds++;
        }
      }),
    ).toThrow(RetryLimitExceeded);
    return rounds;
  }

  it("given no count, gives up at the deadline and not at the house count", () => {
    tickingClock();
    expect(triesUntilItGivesUp(3 * MAX_REGENERATE)).toBe(3 * MAX_REGENERATE);
  });

  it("given a count, still gives up at the count", () => {
    tickingClock();
    expect(triesUntilItGivesUp(1000, 7)).toBe(7);
  });

  it("given a count, gives up at the deadline where that comes first", () => {
    tickingClock();
    expect(triesUntilItGivesUp(5, 1000)).toBe(5);
  });

  it("says that it was the deadline, and how many tries were made", () => {
    tickingClock();
    expect(() =>
      underDealDeadline(2, () => {
        const attempt = retryLimit("net: generation");
        for (;;) attempt();
      }),
    ).toThrow("net: generation: gave up after 2 attempts, at the deal's deadline");
  });

  it("is disarmed once the deal returns, and once it throws", () => {
    tickingClock();
    expect(underDealDeadline(5, () => "dealt")).toBe("dealt");
    expect(triesUntilItGivesUp(5)).toBe(5);
    // The clock is long past both deadlines, and neither is still armed.
    let rounds = 0;
    const attempt = retryLimit("t", 50);
    expect(() => {
      for (;;) {
        attempt();
        rounds++;
      }
    }).toThrow("t: gave up after 50 attempts");
    expect(rounds).toBe(50);
  });
});
