/**
 * A second grading scale, on the `grading` fixture: a Latin square in sum
 * cages with some numbers given, whose cage readings grade on a scale of
 * their own, `cages`, beside the tiers. No player asks a tier on it, so
 * every board is capped at its top, and dealt to need its top as it is
 * dealt to need the asked tier (upstream solo.c's Killer cages and
 * `kdiff`).
 */

import { describe, expect, it } from "vitest";
import * as grading from "../../generated/engine/testing/fixtures/grading/grading.compiled.ts";
import type { HintStep } from "../contract/game.ts";
import { randomNew } from "../random/index.ts";
import { TIERS } from "../solve/ladder-runtime.ts";
import { capsOf, type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillHint } from "./hint.ts";
import type { FillMove } from "./notes.ts";

const game = fillGame("grading", grading);
type Board = FillBoard<grading.Dealt>;
type Step = HintStep<FillMove, FillHint>;

const SETS = grading.SCALE.cages.sets;
const LAST = grading.SCALE.cages.last;
const params = (w: number, diff: number) => ({ w, h: w, diff });
const dealt = (w: number, diff: number, seed: string): Board => {
  const p = params(w, diff);
  return game.newState(p, game.newDesc(p, randomNew(seed)).desc);
};
const SEEDS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
// Dealt with no hold on the other scale, 22 of 200 boards of 4x4 at Easy
// finished on its lower tier, and none of 200 at 5x5 or 6x6, of either
// tier (2026-11-23): 40 such boards miss one at a chance under 1%.
const EASY_SEEDS = Array.from({ length: 40 }, (_, i) => `e${i}`);

describe("a board graded on a second scale", () => {
  it("is capped at the asked tier and at the top of every other scale", () => {
    expect(capsOf(grading, grading.TIER.easy)).toEqual({
      [TIERS]: grading.TIER.easy,
      cages: SETS,
    });
  });

  it("is dealt to need the top of the other scale, at each tier", () => {
    const boards = [
      ...EASY_SEEDS.map((seed) => ({ w: 4, diff: grading.TIER.easy, seed })),
      ...SEEDS.map((seed) => ({ w: 5, diff: grading.TIER.normal, seed })),
    ];
    for (const { w, diff, seed } of boards) {
      const b = dealt(w, diff, seed);
      const at = (cages: number) =>
        solveBoard(grading, b, { [TIERS]: diff, cages }).verdict;
      expect(at(SETS), `${diff} ${seed}`).toBe("solved");
      expect(at(LAST), `${diff} ${seed}`).not.toBe("solved");
      if (diff > 0)
        expect(solveBoard(grading, b, diff - 1).verdict, `${diff} ${seed}`).not.toBe(
          "solved",
        );
    }
  });

  it("is hinted to the end, the other scale's readings among the steps", () => {
    const rungs = new Set<string>();
    for (const seed of SEEDS.slice(0, 3)) {
      let b = dealt(5, grading.TIER.easy, seed);
      for (let k = 0; game.status(b) !== "solved"; k++) {
        if (k > 300) throw new Error("the walk runs on");
        const got = game.hint.plan(b, undefined, game.newUi(b));
        if (!got.ok) throw new Error(`no plan: ${JSON.stringify(got)}`);
        const [step]: Step[] = got.steps;
        rungs.add(step.rung);
        b = game.executeMove(b, step.move);
      }
    }
    expect(rungs).toContain("cageSets");
  });
});
