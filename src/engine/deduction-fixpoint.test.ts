import { describe, expect, it } from "vitest";
import type {
  CompiledTechniques,
  DeductionFixpointOptions,
  DeductionTechnique,
  FiringTally,
  SingleFiringOptions,
} from "./deduction-fixpoint.ts";
import * as fixpoint from "./deduction-fixpoint.ts";
import { StepBudgetExceeded, stepBudget } from "./step-budget.ts";

// The loop is tested on hand-built ladders, which a game may not hand it: a
// game's ladder comes from `ladder-runtime.ts`, where grading and caps are
// tested.
type Hand<O> = Omit<O, "techniques"> & { techniques: readonly DeductionTechnique[] };
const compiled = (techniques: readonly DeductionTechnique[]) =>
  techniques as CompiledTechniques;
const runDeductionFixpoint = (opts: Hand<DeductionFixpointOptions>) =>
  fixpoint.runDeductionFixpoint({ ...opts, techniques: compiled(opts.techniques) });
const singleFirings = (opts: Hand<SingleFiringOptions>) =>
  fixpoint.singleFirings({ ...opts, techniques: compiled(opts.techniques) });

/** A technique whose tier is its position. */
const rung = (index: number, run: () => number): DeductionTechnique => ({
  id: `rung-${index}`,
  tier: index,
  run,
});

describe("runDeductionFixpoint", () => {
  it("makes one pass when no technique ever fires", () => {
    const calls: number[] = [];
    const techniques = [
      rung(0, () => {
        calls.push(0);
        return 0;
      }),
      rung(1, () => {
        calls.push(1);
        return 0;
      }),
    ];
    const res = runDeductionFixpoint({ techniques });
    expect(res).toEqual({ impossible: false });
    expect(calls).toEqual([0, 1]);
  });

  it("restarts from the first technique the moment any technique fires", () => {
    // Technique 0 fires twice then stops; technique 1 fires once then stops.
    // Because the ladder restarts from the top on every firing, technique 0 is
    // re-tried before technique 1 each time it has work left.
    let r0 = 2;
    let r1 = 1;
    const order: string[] = [];
    const techniques = [
      rung(0, () => {
        order.push("r0");
        if (r0 > 0) {
          r0--;
          return 1;
        }
        return 0;
      }),
      rung(1, () => {
        order.push("r1");
        if (r1 > 0) {
          r1--;
          return 1;
        }
        return 0;
      }),
    ];
    const res = runDeductionFixpoint({ techniques });
    expect(res).toEqual({ impossible: false });
    // r0, r0 (each firing restarts before r1 is tried), then r0 miss → r1 fire,
    // then r0 miss → r1 miss → stop.
    expect(order).toEqual(["r0", "r0", "r0", "r1", "r0", "r1"]);
  });

  it("stops with impossible when a technique reports a contradiction", () => {
    const techniques = [rung(0, () => 0), rung(1, () => -1), rung(2, () => 1)];
    const res = runDeductionFixpoint({ techniques });
    expect(res.impossible).toBe(true);
  });

  it("calls beforeTechnique once before every technique attempt", () => {
    const before: string[] = [];
    let fireOnce = true;
    const techniques = [
      rung(0, () => {
        if (fireOnce) {
          fireOnce = false;
          return 1;
        }
        return 0;
      }),
      rung(1, () => 0),
    ];
    runDeductionFixpoint({ techniques, beforeTechnique: (t) => before.push(t.id) });
    // Pass 1: beforeTechnique(0) then technique 0 fires → restart. Pass 2:
    // beforeTechnique(0), miss, beforeTechnique(1), miss → stop.
    expect(before).toEqual(["rung-0", "rung-0", "rung-1"]);
  });

  it("reaches the same verdict with and without a budget (recorder on/off)", () => {
    const build = (): DeductionTechnique[] => {
      let r0 = 3;
      let r1 = 2;
      return [rung(0, () => (r0-- > 0 ? 1 : 0)), rung(1, () => (r1-- > 0 ? 1 : 0))];
    };
    const off = runDeductionFixpoint({ techniques: build() });
    const on = runDeductionFixpoint({
      techniques: build(),
      budget: stepBudget("test"),
    });
    expect(on).toEqual(off);
  });

  it("trips the step budget on a technique that progresses without terminating", () => {
    const techniques = [rung(0, () => 1)]; // always fires, never converges
    expect(() =>
      runDeductionFixpoint({ techniques, budget: stepBudget("runaway", 1000) }),
    ).toThrow(StepBudgetExceeded);
  });

  it("runs unguarded without a budget (generator path) — no throw on many iterations", () => {
    let n = 100_000;
    const techniques = [rung(0, () => (n-- > 0 ? 1 : 0))];
    expect(() => runDeductionFixpoint({ techniques })).not.toThrow();
  });

  // --- the budget names the technique responsible ------------------------

  describe("non-termination attribution", () => {
    it("names the runaway technique by firing count", () => {
      const techniques: DeductionTechnique[] = [
        { id: "honest", tier: 0, run: () => 0 },
        { id: "liar", tier: 0, run: () => 1 }, // always "fires", never converges
      ];
      let thrown: unknown;
      try {
        runDeductionFixpoint({ techniques, budget: stepBudget("runaway", 50) });
      } catch (e) {
        thrown = e;
      }
      expect(thrown).toBeInstanceOf(StepBudgetExceeded);
      const { message } = thrown as StepBudgetExceeded;
      // The original diagnosis survives...
      expect(message).toContain("did not terminate");
      // ...and now answers its own question.
      expect(message).toContain("Techniques by firings: liar ×50");
      expect(message).not.toContain("honest");
    });

    it("orders the tally most-fired first, so the liar leads", () => {
      let honest = 3;
      const techniques: DeductionTechnique[] = [
        { id: "honest", tier: 0, run: () => (honest-- > 0 ? 1 : 0) },
        { id: "liar", tier: 0, run: () => 1 },
      ];
      let message = "";
      try {
        runDeductionFixpoint({ techniques, budget: stepBudget("runaway", 40) });
      } catch (e) {
        message = (e as StepBudgetExceeded).message;
      }
      expect(message).toMatch(/Techniques by firings: liar ×\d+, honest ×3\./);
    });

    it("counts nothing without a budget — the generator path is untouched", () => {
      // The attribution map is allocated only when a budget is passed. Asserted
      // through the one observable the runner has: an unbudgeted run of the same
      // ladder must behave identically, including throwing nothing to augment.
      let n = 10;
      const techniques: DeductionTechnique[] = [
        { id: "counted-nowhere", tier: 0, run: () => (n-- > 0 ? 1 : 0) },
      ];
      expect(runDeductionFixpoint({ techniques })).toEqual({ impossible: false });
    });

    it("passes a non-budget error through unchanged", () => {
      const boom = new Error("technique blew up");
      const techniques: DeductionTechnique[] = [
        {
          id: "explodes",
          tier: 0,
          run: () => {
            throw boom;
          },
        },
      ];
      expect(() =>
        runDeductionFixpoint({ techniques, budget: stepBudget("x") }),
      ).toThrow(boom);
    });
  });
});

describe("singleFirings", () => {
  /** A rung that fires `times` times, then has nothing left to do. */
  const firesTimes = (index: number, times: number, log: string[]) =>
    rung(index, () => {
      log.push(`r${index}`);
      return times-- > 0 ? 1 : 0;
    });

  it("returns one firing per call, restarting from the top each time", () => {
    const log: string[] = [];
    const ladder = singleFirings({
      techniques: [firesTimes(0, 1, log), firesTimes(1, 2, log)],
      budget: stepBudget("single"),
    });
    const ids: (string | null)[] = [];
    for (let i = 0; i < 4; i++) ids.push(ladder.next()?.id ?? null);
    expect(ids).toEqual(["rung-0", "rung-1", "rung-1", null]);
    // Each call starts at rung 0, and a call stops at the rung that fired.
    expect(log).toEqual(["r0", "r0", "r1", "r0", "r1", "r0", "r1"]);
    expect(ladder.impossible()).toBe(false);
  });

  it("returns a firing even when the caller will hide it", () => {
    // The driver has no notion of a firing worth showing: a rung that fires
    // records nothing here, and it is still handed back rather than skipped.
    const ladder = singleFirings({
      techniques: [firesTimes(0, 1, []), firesTimes(1, 1, [])],
      budget: stepBudget("hidden"),
    });
    expect(ladder.next()?.id).toBe("rung-0");
    expect(ladder.next()?.id).toBe("rung-1");
  });

  it("an exhausted ladder answers null, and keeps answering it", () => {
    const log: string[] = [];
    const ladder = singleFirings({
      techniques: [firesTimes(0, 0, log)],
      budget: stepBudget("exhausted"),
    });
    expect(ladder.next()).toBeNull();
    expect(ladder.next()).toBeNull();
    expect(ladder.impossible()).toBe(false);
    expect(log).toEqual(["r0", "r0"]);
  });

  it("a contradiction is sticky: null, impossible, and no rung runs again", () => {
    const log: string[] = [];
    const ladder = singleFirings({
      techniques: [
        firesTimes(0, 1, log),
        rung(1, () => {
          log.push("r1");
          return -1;
        }),
      ],
      budget: stepBudget("contradiction"),
    });
    expect(ladder.next()?.id).toBe("rung-0");
    expect(ladder.impossible()).toBe(false);
    expect(ladder.next()).toBeNull();
    expect(ladder.impossible()).toBe(true);
    const ran = log.length;
    expect(ladder.next()).toBeNull();
    expect(log.length).toBe(ran);
  });

  it("calls beforeTechnique before each rung it asks, as the fixpoint does", () => {
    const seen: string[] = [];
    let quiet = 1;
    const ladder = singleFirings({
      techniques: [
        { id: "quiet", tier: 0, run: () => (quiet-- > 0 ? 0 : 1) },
        { id: "easy", tier: 0, run: () => 1 },
      ],
      budget: stepBudget("hooks"),
      beforeTechnique: (t) => seen.push(t.id),
    });
    expect(ladder.next()?.id).toBe("easy");
    expect(seen).toEqual(["quiet", "easy"]);
    expect(ladder.next()?.id).toBe("quiet");
    expect(seen).toEqual(["quiet", "easy", "quiet"]);
  });

  it("tallies into the caller's census across calls", () => {
    const firings: FiringTally = new Map();
    const ladder = singleFirings({
      techniques: [firesTimes(0, 2, []), firesTimes(1, 1, [])],
      budget: stepBudget("tally"),
      firings,
    });
    while (ladder.next()) {}
    expect([...firings]).toEqual([
      ["rung-0", 2],
      ["rung-1", 1],
    ]);
  });

  it("names a technique that runs away across many calls", () => {
    const ladder = singleFirings({
      techniques: [{ id: "liar", tier: 0, run: () => 1 }],
      budget: stepBudget("runaway", 30),
    });
    let message = "";
    try {
      for (;;) ladder.next();
    } catch (e) {
      message = (e as StepBudgetExceeded).message;
    }
    // One firing per call, so only a tally that outlives the call can blame it.
    expect(message).toMatch(/Techniques by firings: liar ×30\./);
  });
});

describe("singleFirings, continuing where the plan is", () => {
  /**
   * A board of firings, each a name that reads and writes elements; a rung
   * offers those of its rung still untaken. Taking one logs its name.
   */
  function ladderOf(
    rungs: readonly (readonly {
      name: string;
      reads: number[];
      writes: number[];
      /** Offered only once this firing has been taken. */
      after?: string;
    }[])[],
    log: string[],
    asked: string[] = [],
  ): DeductionTechnique[] {
    const taken = new Set<string>();
    return rungs.map((firings, k) => ({
      id: `rung-${k}`,
      tier: 0,
      run: () => {
        throw new Error("a continuing plan never runs a rung's first firing");
      },
      available: () => {
        asked.push(`rung-${k}`);
        return firings
          .filter(
            (f) => !taken.has(f.name) && (f.after === undefined || taken.has(f.after)),
          )
          .map((f) => ({
            reads: () => f.reads,
            writes: () => f.writes,
            take: () => {
              taken.add(f.name);
              log.push(f.name);
            },
          }));
      },
    }));
  }

  const plan = (techniques: DeductionTechnique[], calls: number): void => {
    const ladder = singleFirings({
      techniques,
      budget: stepBudget("continuing"),
      continuing: true,
    });
    for (let i = 0; i < calls; i++) ladder.next();
  };

  it("takes the firing that continues from the last one over an easier one elsewhere", () => {
    const log: string[] = [];
    plan(
      ladderOf(
        [
          [
            { name: "a", reads: [1], writes: [1] },
            { name: "far", reads: [9], writes: [9] },
          ],
          [{ name: "next to a", reads: [1], writes: [2] }],
        ],
        log,
      ),
      3,
    );
    // A fresh plan has no frontier, so it starts by the rung order; then the
    // harder firing that continues beats the easy one across the board.
    expect(log).toEqual(["a", "next to a", "far"]);
  });

  it("keeps its place through a firing that writes nothing it keys on", () => {
    const log: string[] = [];
    plan(
      ladderOf(
        [
          [
            { name: "line on 3", reads: [3], writes: [3] },
            { name: "line on 2", reads: [2], writes: [2] },
            { name: "join the 3", reads: [3], writes: [3], after: "cross 3" },
          ],
          // As many crosses as the frontier is deep: were each one a step of
          // its own, the 3 would have dropped out of it by the join.
          [
            { name: "cross 1", reads: [3, 2], writes: [] },
            { name: "cross 2", reads: [3, 2], writes: [], after: "cross 1" },
            { name: "cross 3", reads: [3, 2], writes: [], after: "cross 2" },
          ],
        ],
        log,
      ),
      6,
    );
    expect(log).toEqual([
      "line on 3",
      "cross 1",
      "cross 2",
      "cross 3",
      "join the 3",
      "line on 2",
    ]);
  });

  it("asks a dear rung only when no easier one continues", () => {
    const log: string[] = [];
    const asked: string[] = [];
    plan(
      ladderOf(
        [
          [
            { name: "a", reads: [1], writes: [1] },
            { name: "b", reads: [1], writes: [1] },
          ],
          [{ name: "dear", reads: [5], writes: [5] }],
        ],
        log,
        asked,
      ),
      2,
    );
    expect(log).toEqual(["a", "b"]);
    expect(asked).not.toContain("rung-1");
  });

  it("continues at no harder a tier than the ladder's order would fire", () => {
    const log: string[] = [];
    const techniques = ladderOf(
      [
        [
          { name: "a", reads: [1], writes: [1] },
          { name: "far", reads: [9], writes: [9] },
        ],
        [{ name: "hard next to a", reads: [1], writes: [2] }],
      ],
      log,
    ).map((t, k) => ({ ...t, tier: k }));
    plan(techniques, 3);
    expect(log).toEqual(["a", "far", "hard next to a"]);
  });

  it("asks a fallback only once every rung before it has nothing, and every rung after a prerequisite only once it has nothing", () => {
    const log: string[] = [];
    const [first, second, third] = ladderOf(
      [
        [{ name: "a", reads: [1], writes: [1] }],
        [{ name: "far", reads: [9], writes: [9] }],
        [{ name: "link next to a", reads: [1], writes: [1] }],
      ],
      log,
    );
    plan([first, second, { ...third, fallback: true }], 3);
    expect(log).toEqual(["a", "far", "link next to a"]);
    const kept: string[] = [];
    const [book, line, count] = ladderOf(
      [
        [
          { name: "flag", reads: [5], writes: [5] },
          { name: "flag again", reads: [6], writes: [6] },
        ],
        [{ name: "line by the flag", reads: [5], writes: [5] }],
        [{ name: "start", reads: [1], writes: [1] }],
      ],
      kept,
    );
    plan([{ ...count, id: "count" }, { ...book, prerequisite: true }, line], 4);
    // The count fires first by the order; then the bookkeeping runs dry
    // before the line beside it may continue from it.
    expect(kept).toEqual(["start", "flag", "flag again", "line by the flag"]);
  });

  it("stops on a rung's contradiction, and refuses a rung that offers nothing", () => {
    const contradicting = singleFirings({
      techniques: [
        { id: "broken", tier: 0, run: () => 0, available: () => "contradiction" },
      ],
      budget: stepBudget("contradiction"),
      continuing: true,
    });
    expect(contradicting.next()).toBeNull();
    expect(contradicting.impossible()).toBe(true);
    const undeclared = singleFirings({
      techniques: [{ id: "old", tier: 0, run: () => 0 }],
      budget: stepBudget("undeclared"),
      continuing: true,
    });
    expect(() => undeclared.next()).toThrow(/old.*available/);
  });
});
