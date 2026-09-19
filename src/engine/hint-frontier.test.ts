/**
 * `HintFrontier`: the rule on its own, then the rule as the player meets it in
 * every game that has one.
 */
import { describe, expect, it } from "vitest";
import { type FrontierCandidate, HintFrontier } from "./hint-frontier.ts";
import { randomNew } from "./random/index.ts";
import { membersNotMentioning } from "./testing/enrollment.ts";
import { HINT_GAMES, leafPresets } from "./testing/hint-games.ts";
import { planContinuity } from "./testing/plan-continuity.ts";
import type { Point } from "./types.ts";

type Step = { highlights: { targets: Point[] } };

/** A candidate reading `reads` that, taken, pushes one step writing `writes`
 * and logs its name. */
function cand(
  name: string,
  reads: Point[],
  writes: Point[],
  steps: Step[],
  log: string[],
): FrontierCandidate {
  return {
    reads,
    take: () => {
      steps.push({ highlights: { targets: writes } });
      log.push(name);
    },
  };
}

describe("HintFrontier", () => {
  const at = (x: number, y: number): Point => ({ x, y });

  it("takes the rung order's first choice when nothing has been written yet", () => {
    const steps: Step[] = [];
    const log: string[] = [];
    const f = new HintFrontier(4);
    expect(
      f.take(
        [
          [],
          [cand("a", [at(0, 0)], [at(0, 0)], steps, log)],
          [cand("b", [], [], steps, log)],
        ],
        steps,
      ),
    ).toBe(true);
    expect(log).toEqual(["a"]);
    expect(f.take([[], []], steps)).toBe(false);
  });

  it("prefers a later rung's candidate that continues the last step", () => {
    const steps: Step[] = [];
    const log: string[] = [];
    const f = new HintFrontier(4);
    f.take([[cand("first", [], [at(1, 1)], steps, log)]], steps);
    f.take(
      [
        [cand("far single", [at(3, 3)], [at(3, 3)], steps, log)],
        [cand("near strike", [at(1, 1), at(1, 2)], [at(1, 2)], steps, log)],
      ],
      steps,
    );
    expect(log).toEqual(["first", "near strike"]);
  });

  it("prefers the most recent step, and reaches back three", () => {
    const steps: Step[] = [];
    const log: string[] = [];
    const f = new HintFrontier(4);
    for (const x of [0, 1, 2, 3])
      f.take([[cand(`w${x}`, [], [at(x, 0)], steps, log)]], steps);
    // w3 is the latest; w1 two back; w0 four back, past the frontier.
    const pick = (cands: FrontierCandidate[][]) => {
      f.take(cands, steps);
      return log[log.length - 1];
    };
    expect(
      pick([
        [cand("reads w1", [at(1, 0)], [at(1, 3)], steps, log)],
        [cand("reads w3", [at(3, 0)], [at(3, 3)], steps, log)],
      ]),
    ).toBe("reads w3");
    // Now the frontier is w1, w2, w3's successor: w0 is out of reach, so a
    // candidate reading only it is no better than the rung order.
    expect(
      pick([
        [cand("rung first", [at(2, 2)], [at(2, 2)], steps, log)],
        [cand("reads w0", [at(0, 0)], [at(0, 3)], steps, log)],
      ]),
    ).toBe("rung first");
  });

  it("ignores reads and writes off the board", () => {
    const steps: Step[] = [];
    const log: string[] = [];
    const f = new HintFrontier(3);
    // A clue at x = 3 would alias the next row's first cell if indexed blindly.
    f.take([[cand("clue", [], [at(3, 0)], steps, log)]], steps);
    expect(
      (() => {
        f.take(
          [
            [cand("rung first", [], [at(2, 2)], steps, log)],
            [cand("aliased", [at(0, 1)], [at(0, 1)], steps, log)],
          ],
          steps,
        );
        return log[log.length - 1];
      })(),
    ).toBe("rung first");
  });
});

/**
 * The games whose hint plans choose through a `HintFrontier` — derived from
 * each game's own comment-stripped source (it walks its plan with
 * `runCandidatePlan`, which owns the frontier), never declared.
 */
const FRONTIER_GAMES: readonly string[] = (() => {
  const ids = HINT_GAMES.map(([id]) => id);
  const without = new Set(membersNotMentioning(ids, "runCandidatePlan("));
  return ids.filter((id) => !without.has(id));
})();

/**
 * The share of a plan's jumps (a step reading nothing its predecessor wrote)
 * that passed over an available firing which did read it, read off the plans by
 * `planContinuity` and not by the games' own candidate lists.
 *
 * Measured on this corpus (every leaf preset, two seeds) when the frontier
 * landed: **3.9–8.3%** per game, against **14.8–32.1%** for the scan order it
 * replaced. The residual is firings the frontier is deliberately not offered —
 * strikes past the solver's next placement, and singles it has not recorded.
 * So the bound separates the two with room on both sides, and a game that
 * stops building its candidate lists, or a comparator that stops preferring
 * continuity, fails it. Never assert on the jumps alone: some are forced, and a
 * guard that fails on a forced jump gets switched off rather than fixed
 * (`order-hints-from-the-frontier` D6).
 */
const MAX_AVOIDABLE = 0.1;

describe("hint plans continue from their previous step where they can", () => {
  it("finds the games that have a frontier", () => {
    expect(FRONTIER_GAMES).toContain("solo");
    expect(FRONTIER_GAMES.length).toBeGreaterThan(1);
  });

  for (const id of FRONTIER_GAMES) {
    const game = HINT_GAMES.find(([g]) => g === id)?.[1];
    it(`${id}: few jumps pass over a firing that continued`, () => {
      if (!game) throw new Error(`${id} is not a hint game`);
      let jumps = 0;
      let avoidable = 0;
      for (const p of leafPresets(game.presets())) {
        for (let s = 0; s < 2; s++) {
          const { desc } = game.newDesc(
            p.params,
            randomNew(`continuity-${p.title}-${s}`),
          );
          const c = planContinuity(game, game.newState(p.params, desc));
          jumps += c.jumps;
          avoidable += c.avoidable;
        }
      }
      expect(jumps).toBeGreaterThan(50);
      expect(avoidable / jumps).toBeLessThan(MAX_AVOIDABLE);
    });
  }
});
