/**
 * Pattern's two tiers: Easy, which the lines decide, and Unreasonable, a board
 * with one answer that they do not reach.
 *
 * The answer counts here come from {@link countPictures}, which lays whole
 * rows and reads the columns as they grow. It shares nothing with the line
 * deduction or the search over it, so it can say whether those two are right
 * that a board has one answer.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { dealRare } from "../../engine/testing/dealt.ts";
import { patternGame } from "./index.ts";
import { findMistakes, linesDecide, searchAnswers, solveState } from "./solver.ts";
import {
  computeRuns,
  encodeClues,
  executeMove,
  GRID_EMPTY,
  GRID_FULL,
  GRID_UNKNOWN,
  newState,
  type PatternParams,
  type PatternState,
  status,
} from "./state.ts";

/** The runs of shaded squares along `cells`, in order. */
function runsOf(cells: readonly number[]): number[] {
  const runs: number[] = [];
  let run = 0;
  for (const c of cells) {
    if (c) run++;
    else if (run) {
      runs.push(run);
      run = 0;
    }
  }
  if (run) runs.push(run);
  return runs;
}

/** Whether a column filled from the top as far as `cells` can still come to
 * `clue`: its finished runs are the clue's first, and a run still open at the
 * bottom is no longer than the next. `whole` asks for the clue exactly. */
function columnFits(
  cells: readonly number[],
  clue: readonly number[],
  whole: boolean,
): boolean {
  const runs = runsOf(cells);
  if (whole) return runs.length === clue.length && runs.every((r, i) => r === clue[i]);
  if (runs.length > clue.length) return false;
  const open = cells.at(-1) === 1;
  return runs.every((r, i) =>
    open && i === runs.length - 1 ? r <= (clue[i] as number) : r === clue[i],
  );
}

/** How many pictures fit `clues`, counted as far as `limit`. */
function countPictures(
  w: number,
  h: number,
  clues: readonly (readonly number[])[],
  limit = 2,
): number {
  const rowFits = Array.from({ length: h }, (_, y) => {
    const clue = clues[w + y] as readonly number[];
    const fits: number[][] = [];
    for (let bits = 0; bits < 1 << w; bits++) {
      const row = Array.from({ length: w }, (_, x) => (bits >> x) & 1);
      if (columnFits(row, clue, true)) fits.push(row);
    }
    return fits;
  });
  const columns: number[][] = Array.from({ length: w }, () => []);
  let count = 0;
  const lay = (y: number): void => {
    if (y === h) {
      count++;
      return;
    }
    for (const row of rowFits[y] as number[][]) {
      row.forEach((v, x) => {
        (columns[x] as number[]).push(v);
      });
      const fits = columns.every((cells, x) =>
        columnFits(cells, clues[x] as readonly number[], y === h - 1),
      );
      if (fits) lay(y + 1);
      for (const cells of columns) cells.pop();
      if (count >= limit) return;
    }
  };
  lay(0);
  return count;
}

const sized = (w: number, h: number, diff: number): PatternParams => ({ w, h, diff });

/** A 5x5 board with one answer, which the lines leave nine squares short of. */
const NEEDS_SEARCH = "1.1/3/3/3/2/3/3/3/2/1.1";
/** A 5x5 board the lines decide. */
const LINES_DECIDE = "4/2.2/2/1/2/2/2/1/3.1/4";
/** The two diagonals of a 2x2 both fit. */
const TWO_ANSWERS = "1/1/1/1";
/** Two full columns and two empty rows. */
const NO_ANSWER = "2/2//";

describe("the picture counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (w: number, h: number, desc: string) =>
      countPictures(w, h, newState(sized(w, h, DIFF_EASY), desc).common.clues);
    expect(count(2, 2, TWO_ANSWERS)).toBe(2);
    expect(count(2, 2, NO_ANSWER)).toBe(0);
    expect(count(2, 2, "2/2/2/2")).toBe(1);
    expect(count(5, 5, LINES_DECIDE)).toBe(1);
  });
});

describe("pattern's search for a board's answers", () => {
  const answers = (w: number, h: number, desc: string, budget?: number) => {
    const { clues } = newState(sized(w, h, DIFF_EASY), desc).common;
    return searchAnswers(w, h, clues, undefined, undefined, budget).kind;
  };

  it("says one, several or none", () => {
    expect(answers(5, 5, NEEDS_SEARCH)).toBe("one");
    expect(answers(5, 5, LINES_DECIDE)).toBe("one");
    expect(answers(2, 2, TWO_ANSWERS)).toBe("several");
    expect(answers(2, 2, NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The lines decide a board in the one position the search starts from.
    expect(answers(5, 5, LINES_DECIDE, 1)).toBe("one");
    expect(answers(5, 5, NEEDS_SEARCH, 1)).toBe("out-of-reach");
    expect(answers(5, 5, NEEDS_SEARCH, 2)).toBe("out-of-reach");
  });

  it("agrees with the picture count on every 3x4 board", () => {
    // 4,096 pictures, 36 of which have one answer the lines do not reach.
    const [w, h] = [3, 4];
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    let needSearch = 0;
    for (let bits = 0; bits < 1 << (w * h); bits++) {
      const state = boardOf(w, h, bits);
      const answer = searchAnswers(w, h, state.common.clues);
      tally[answer.kind]++;
      const pictures = countPictures(w, h, state.common.clues);
      expect(answer.kind).toBe(pictures === 1 ? "one" : "several");
      if (answer.kind === "one" && !linesDecide(state)) needSearch++;
    }
    expect(tally.none + tally["out-of-reach"]).toBe(0);
    expect(needSearch).toBe(36);
  });
});

/** The board whose answer is the picture `bits` spells, a square a bit. */
function boardOf(w: number, h: number, bits: number): PatternState {
  const grid = Uint8Array.from({ length: w * h }, (_, i) =>
    (bits >> i) & 1 ? GRID_FULL : GRID_EMPTY,
  );
  const clues: number[][] = [];
  for (let x = 0; x < w; x++) clues.push(computeRuns(grid, x, h, w) ?? []);
  for (let y = 0; y < h; y++) clues.push(computeRuns(grid, y * w, w, 1) ?? []);
  return newState(sized(w, h, DIFF_EASY), encodeClues(clues));
}

describe("an Unreasonable Pattern board", () => {
  it.each([
    [4, 4],
    [5, 5],
    [6, 6],
    [8, 8],
    [10, 10],
    [7, 12],
  ])("%ix%i is dealt with one answer that the lines do not reach", (w, h) => {
    const p = sized(w, h, DIFF_UNREASONABLE);
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = dealRare(
        patternGame,
        p,
        randomNew(`unreasonable-${w}x${h}-${seed}`),
      );
      const state = newState(p, desc);
      expect(linesDecide(state), desc).toBe(false);
      expect(countPictures(w, h, state.common.clues), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that picture.
      const answer = solveState(state);
      if (answer === null) throw new Error(`${desc}: no answer found`);
      const { clues } = state.common;
      for (let x = 0; x < w; x++)
        expect(computeRuns(answer, x, h, w)).toEqual(clues[x]);
      for (let y = 0; y < h; y++)
        expect(computeRuns(answer, y * w, w, 1)).toEqual(clues[w + y]);
    }
  });

  it("exists at no size up to 3x3, and at none one square wide", () => {
    // Every picture of each size: where the lines stop short, a second
    // picture fits. `validateParams` refuses these sizes on that count.
    let stuck = 0;
    for (const [w, h] of [
      [2, 2],
      [2, 3],
      [3, 2],
      [3, 3],
      [1, 7],
      [7, 1],
    ] as const) {
      for (let bits = 0; bits < 1 << (w * h); bits++) {
        const state = boardOf(w, h, bits);
        if (linesDecide(state)) continue;
        stuck++;
        expect(countPictures(w, h, state.common.clues)).toBe(2);
      }
    }
    // 2 + 12 + 12 + 128 pictures the lines do not decide, none a line wide.
    expect(stuck).toBe(154);
  });

  describeAbsentTiers(patternGame, ["3x3du", "2x3du", "1x5du"]);
  describeDealtTiers(patternGame, ["2x4du", "3x4du"]);
});

describe("a pasted Pattern board", () => {
  const load = (id: string) => {
    const me = new Midend(patternGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`5x5:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5de:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5du:${NEEDS_SEARCH}`)).toBe("5x5du");
  });

  it("that the lines decide opens as Easy", () => {
    expect(load(`5x5:${LINES_DECIDE}`)).toBe("5x5de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`2x2:${TWO_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`2x2du:${TWO_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`2x2:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Pattern board", () => {
  it("stops where the lines do, and goes on from a square tried rightly", () => {
    const p = sized(5, 5, DIFF_UNREASONABLE);
    const me = new Midend(patternGame);
    expect(me.newGameFromId(`5x5du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = solveState(state);
    if (answer === null) throw new Error("no answer found");

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = patternGame.hint?.(state);
        plan?.ok;
        plan = patternGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(findMistakes(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    const open = state.grid.indexOf(GRID_UNKNOWN);
    const at = { x: open % 5, y: Math.floor(open / 5), w: 1, h: 1 };
    const right = answer[open] === GRID_FULL ? GRID_FULL : GRID_EMPTY;
    const wrong = right === GRID_FULL ? GRID_EMPTY : GRID_FULL;
    // A square tried wrongly is what the mistake check is there to catch.
    const tried = executeMove(state, { type: "fill", value: wrong, ...at });
    expect(findMistakes(tried)).toEqual([{ x: at.x, y: at.y }]);

    const move = { type: "fill", value: right, ...at } as const;
    state = executeMove(state, move);
    me.playMoves([move]);
    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("solved");
  });
});
