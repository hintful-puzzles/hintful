/**
 * Task 2.3's timing: the stated ladder, interpreted, against the game's own
 * solver, on the same boards at the top deductive tier. Writes
 * `results-measure.txt`.
 */
import { describe, it } from "vitest";
import { adjacentBinding, type Binding, unequalBinding } from "./bindings.ts";
import { runLadder } from "./ladder.ts";
import { deal, label, seedsPerParams, writeResult } from "./pilot.ts";

const SEEDS = seedsPerParams(5);
const REPEAT = 5;

function time(f: () => void): number {
  const t0 = performance.now();
  for (let i = 0; i < REPEAT; i++) f();
  return (performance.now() - t0) / REPEAT;
}

describe("the interpreter's cost", () => {
  it("is measured against each game's own solver", () => {
    const lines = [
      `Seeds per params: ${SEEDS}; each timing the mean of ${REPEAT} runs.`,
      "",
    ];
    for (const b of [unequalBinding, adjacentBinding] as Binding<unknown, unknown>[]) {
      const own = b.ownLadder;
      if (own === undefined) continue;
      for (const params of b.params) {
        const mine: number[] = [];
        const theirs: number[] = [];
        for (let i = 0; i < SEEDS; i++) {
          const board = deal(b, params, `describe ${i}`);
          if (board === null) break;
          const cap = board.inst.d.tiers.length - 2;
          mine.push(time(() => runLadder(board.inst, cap)));
          theirs.push(time(() => own(board.state, cap)));
        }
        if (mine.length === 0) continue;
        const sum = (xs: number[]) => xs.reduce((a, x) => a + x, 0);
        lines.push(
          `${label(b, params)}: stated ${(sum(mine) / mine.length).toFixed(2)} ms, ` +
            `game ${(sum(theirs) / theirs.length).toFixed(3)} ms, ratio ${(sum(mine) / sum(theirs)).toFixed(0)}`,
        );
      }
    }
    writeResult("results-measure.txt", `${lines.join("\n")}\n`);
  });
});
