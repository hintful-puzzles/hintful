/**
 * A clue one a value, on the `counting` fixture: a number beside each row
 * and column for each of the values 1 to `k`, `k` a size the params give
 * as a number; the board's answer built on no clue; and the walk of notes
 * on a board with no unit, whose placed number reaches only as far as its
 * technique strikes.
 */

import { describe, expect, it } from "vitest";
import * as counting from "../../generated/engine/testing/fixtures/counting/counting.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import type { HintStep } from "../contract/game.ts";
import type { CandidateReading } from "../hint/candidate-hint.ts";
import { randomNew } from "../random/index.ts";
import { perPlace } from "../solve/describe-runtime.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillHint } from "./hint.ts";
import type { FillMove } from "./notes.ts";

const game = fillGame("counting", counting);
type Board = FillBoard<counting.Dealt>;

const dealt = (id: string, seed: string): Board => {
  const p = game.decodeParams(id);
  return game.newState(p, game.newDesc(p, randomNew(seed)).desc);
};

/** How many of `d` the cells `cells` of `g` hold. */
const holding = (g: ArrayLike<number>, cells: readonly number[], d: number) =>
  cells.filter((c) => g[c] === d).length;

describe("a size that is a number", () => {
  it("is written after the grid as its letter and the number", () => {
    const p = game.decodeParams("4x5k4");
    expect(p).toMatchObject({ w: 4, h: 5, sizes: { k: 4 } });
    expect(game.encodeParams(p, false)).toBe("4x5k4");
    // A board that names none has the default.
    expect(game.decodeParams("4x5").sizes).toEqual({ k: 3 });
  });

  it("refuses a number outside its range, even in a brief ID", () => {
    expect(game.validateParams?.(game.decodeParams("4x4k5"), false)).toMatch(
      /Values must be between 2 and 4/,
    );
    expect(game.validateParams?.(game.decodeParams("4x4k2"), false)).toBeNull();
  });

  it("is a number in the Custom dialog, and said in a board's name", () => {
    const field = game.paramConfig?.find((i) => i.kw === "values");
    expect(field?.type).toBe("string");
    const p = game.decodeParams("4x4k4");
    expect(field?.get(p)).toBe("4");
    expect(field?.label?.words?.(p)).toBe("4 values");
  });
});

describe("a clue one a value", () => {
  it("is dealt for each line and value, as many as the answer holds", () => {
    for (const id of ["4x4k3", "4x3k3", "4x4k4"])
      for (const seed of ["a", "b", "c"]) {
        const b = dealt(id, seed);
        const sp = spaceOf(counting, b);
        const g = solveBoard(counting, b, 0).values;
        const k = game.decodeParams(id).sizes?.["k"] ?? 0;
        const { count } = b.dealt;
        expect(count.at.length).toBe(sp.lines.length * k);
        for (const L of sp.lines)
          for (let d = 1; d <= k; d++)
            expect(count.valueAt[perPlace(L, d)]).toBe(holding(g, sp.lineCells[L], d));
      }
  });

  it("is written each line's values in turn, rows then columns, and read back", () => {
    const p = game.decodeParams("4x3k3");
    const b = dealt("4x3k3", "w");
    const sp = spaceOf(counting, b);
    const desc = game.newDesc(p, randomNew("w")).desc;
    const numbers = desc.split(",").slice(0, -1).map(Number);
    expect(numbers.length).toBe(sp.lines.length * 3);
    // The rows first, then the columns.
    expect(sp.lines.map((L) => sp.lineCells[L][0])).toEqual([0, 4, 8, 0, 1, 2, 3]);
    sp.lines.forEach((L, i) => {
      for (let d = 1; d <= 3; d++)
        expect(numbers[3 * i + d - 1]).toBe(b.dealt.count.valueAt[perPlace(L, d)]);
    });
    // A hidden clue is a `-`, which a board reads as none.
    const hidden = `-,${desc.slice(desc.indexOf(",") + 1)}`;
    const read = game.newState(p, hidden);
    expect(read.dealt.count.valueAt[perPlace(sp.lines[0], 1)]).toBe(-1);
    // A line holds a clue for each value, and no more.
    expect(validateDesc(game, p, `${desc}1,`)).not.toBeNull();
    expect(validateDesc(game, p, desc.slice(0, -2))).not.toBeNull();
  });

  it("is dealt on an answer built on no clue, which the ladder finishes", () => {
    // A blank board's count of every value is 0, no answer's: a build read
    // off it dealt nothing.
    for (const seed of ["a", "b", "c", "d"]) {
      const b = dealt("4x4k3", seed);
      expect(solveBoard(counting, b, 0).verdict).toBe("solved");
    }
  });
});

describe("the walk of notes on a board with no unit", () => {
  const plan = (
    b: Board,
    reading: CandidateReading,
  ): HintStep<FillMove, FillHint>[] => {
    const got = game.hint.plan(b, undefined, {
      ...game.newUi(b),
      candidateReading: reading,
    });
    if (!got.ok) throw new Error(`no plan: ${JSON.stringify(got)}`);
    return got.steps;
  };

  it("finishes a board under either reading, a placement striking its neighbors", () => {
    const rungs = new Set<string>();
    let boards = 0;
    for (const reading of ["populate", "implicit"] as const)
      for (const seed of ["a", "b", "c", "d"]) {
        let b = dealt("4x4k3", `${reading}${seed}`);
        for (let k = 0; game.status(b) !== "solved"; k++) {
          if (k > 200) throw new Error("the walk runs on");
          const [step] = plan(b, reading);
          rungs.add(step.rung);
          b = game.executeMove(b, step.move);
        }
        boards++;
      }
    expect(boards).toBe(8);
    expect(rungs.has("full")).toBe(true);
    expect(rungs.has("hiddenSingle")).toBe(false);
  });

  it("says how far a placed number reaches in the description's words", () => {
    // A number placed, so the opening clean has something to strike.
    const b = dealt("4x4k3", "w");
    const n = solveBoard(counting, b, 0).values[5];
    const placed = game.executeMove(b, { type: "set", x: 1, y: 1, n, pencil: false });
    const steps = plan(placed, "populate");
    expect(steps.find((s) => s.rung === "clean")?.explanation).toBe(
      "Now clear the easy ones: cross out any number already beside its square.",
    );
  });
});
