/**
 * Crossing's two tiers: Easy, which the solver's two deductions finish, and
 * Unreasonable, a board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countFills}, which writes a whole
 * number into one run after another and backs out where two runs disagree on
 * a square. It keeps no candidates and narrows nothing, so it shares nothing
 * with the solver or the search over it, and can say whether those two are
 * right that a board has one answer.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import cReference from "./__fixtures__/crossing-c-reference.json" with { type: "json" };
import { crossingGame } from "./index.ts";
import { answerOf, searchAnswers, solveCrossing } from "./solver.ts";
import {
  type CrossingNumber,
  type CrossingParams,
  type CrossingPuzzle,
  compareNumbers,
  makePuzzle,
  newState,
  status,
} from "./state.ts";

/** How many ways the numbers go into the runs, one to a run, counted as far
 * as `limit`. Listed numbers differ, so each way is a different grid. */
function countFills(puzzle: CrossingPuzzle, limit = 2): number {
  const { runs, numbers, w, h } = puzzle;
  // Each run after the first is the one sharing most squares with those
  // before it, so a number that cannot go there is found before the rest
  // are tried.
  const order: number[] = [];
  const covered = new Set<number>();
  while (order.length < runs.length) {
    let best = -1;
    let most = -1;
    runs.forEach((run, r) => {
      if (order.includes(r)) return;
      const shared = run.cells.filter((c) => covered.has(c)).length;
      if (shared > most) {
        most = shared;
        best = r;
      }
    });
    order.push(best);
    for (const c of runs[best]?.cells ?? []) covered.add(c);
  }

  const grid = new Uint8Array(w * h);
  const used = new Uint8Array(numbers.length);
  let count = 0;
  const place = (at: number): void => {
    if (at === order.length) {
      // A listed number left over is a run short: no answer.
      if (used.every((u) => u === 1)) count++;
      return;
    }
    const cells = runs[order[at] as number]?.cells ?? [];
    for (let l = 0; l < numbers.length && count < limit; l++) {
      const number = numbers[l] as CrossingNumber;
      if (used[l] || number.length !== cells.length) continue;
      if (cells.some((c, k) => grid[c] !== 0 && grid[c] !== number[k])) continue;
      const blank = cells.filter((c) => grid[c] === 0);
      cells.forEach((c, k) => {
        grid[c] = number[k] as number;
      });
      used[l] = 1;
      place(at + 1);
      used[l] = 0;
      for (const c of blank) grid[c] = 0;
    }
  };
  place(0);
  return count;
}

const sized = (w: number, h: number, diff: number, sym = false): CrossingParams => ({
  w,
  h,
  sym,
  diff,
});

const solverFinishes = (puzzle: CrossingPuzzle): boolean =>
  solveCrossing(puzzle).status === "valid";

const puzzleOf = (w: number, h: number, desc: string): CrossingPuzzle =>
  newState(sized(w, h, DIFF_EASY), desc).puzzle;

/** A 5x5 board with one answer, on which the solver stops short. */
const NEEDS_SEARCH = "a2a3a3a2a1a1a6,16,34,36,44,49,74,76,79,145,7853,35544";
/** A 5x5 board the solver finishes: upstream's, from the differential. */
const SOLVER_FINISHES = (cReference.fixtures[0] as { desc: string }).desc;
/** Two four-square runs a wall apart, and two numbers either could hold. */
const MANY_ANSWERS = "4d4,1234,5678";
/** An across run of four and a down run of two from its first square, which
 * 1234 and 56 cannot share. */
const NO_ANSWER = "5c,56,1234";

describe("the fill counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    expect(countFills(puzzleOf(5, 5, SOLVER_FINISHES))).toBe(1);
    expect(countFills(puzzleOf(4, 3, MANY_ANSWERS), 100)).toBe(2);
    expect(countFills(puzzleOf(4, 2, NO_ANSWER))).toBe(0);
    // Three runs of two with nothing shared take three numbers six ways.
    const walls = Uint8Array.of(0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1);
    const apart = makePuzzle(6, 3, walls, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    expect(countFills(apart, 100)).toBe(6);
  });
});

describe("crossing's search for a board's answers", () => {
  const answers = (w: number, h: number, desc: string, budget?: number) =>
    searchAnswers(puzzleOf(w, h, desc), budget).kind;

  it("says one, several or none", () => {
    expect(answers(5, 5, NEEDS_SEARCH)).toBe("one");
    expect(answers(5, 5, SOLVER_FINISHES)).toBe("one");
    expect(answers(4, 3, MANY_ANSWERS)).toBe("several");
    expect(answers(4, 2, NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The solver finishes a board in the one position the search starts from.
    expect(answers(5, 5, SOLVER_FINISHES, 1)).toBe("one");
    expect(answers(5, 5, NEEDS_SEARCH, 1)).toBe("out-of-reach");
    expect(answers(5, 5, NEEDS_SEARCH, 2)).toBe("out-of-reach");
  });

  it("is told by the solver that a square is left with no digit", () => {
    // Narrowing empties the shared square and then has nothing more to do,
    // which is a contradiction and not a board merely short of finished.
    expect(solveCrossing(puzzleOf(4, 2, NO_ANSWER)).status).toBe("invalid");
    expect(solveCrossing(puzzleOf(4, 3, MANY_ANSWERS)).status).toBe("progress");
  });

  it("agrees with the fill count on boards of every kind", () => {
    // Dealt boards' walls under fresh digits, which have an answer and often
    // several, and the same with one listed number swapped for a stranger,
    // which mostly have none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (puzzle: CrossingPuzzle, label: string): void => {
      const answer = searchAnswers(puzzle);
      tally[answer.kind]++;
      const fills = countFills(puzzle);
      expect(answer.kind, label).toBe(
        fills === 0 ? "none" : fills === 1 ? "one" : "several",
      );
    };
    for (const [w, h] of [
      [4, 3],
      [5, 4],
      [5, 5],
      [6, 6],
    ] as const) {
      const p = sized(w, h, DIFF_EASY);
      for (let seed = 0; seed < 150; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const dealt = newState(p, crossingGame.newDesc(p, rng).desc).puzzle;
        const grid = Uint8Array.from({ length: w * h }, () => 1 + randomUpto(rng, 9));
        const numbers = dealt.runs
          .map((run): CrossingNumber => run.cells.map((c) => grid[c] as number))
          .sort(compareNumbers);
        const repeats = numbers.some(
          (n, k) => k > 0 && compareNumbers(n, numbers[k - 1] as CrossingNumber) === 0,
        );
        if (repeats) continue;
        const label = `${w}x${h} seed ${seed}`;
        judge(makePuzzle(w, h, dealt.walls, numbers), label);

        const strange = numbers.map((n) => [...n]);
        const swapped = strange[randomUpto(rng, strange.length)] as number[];
        const k = randomUpto(rng, swapped.length);
        swapped[k] = ((swapped[k] as number) % 9) + 1;
        strange.sort(compareNumbers);
        if (
          strange.some(
            (n, i) => i > 0 && compareNumbers(n, strange[i - 1] as number[]) === 0,
          )
        )
          continue;
        judge(makePuzzle(w, h, dealt.walls, strange), `${label}, one number changed`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(200);
    expect(tally.several).toBeGreaterThan(50);
    expect(tally.none).toBeGreaterThan(50);
  });
});

describe("an Unreasonable Crossing board", () => {
  it.each([
    sized(4, 2, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE),
    sized(7, 7, DIFF_UNREASONABLE),
    sized(9, 9, DIFF_UNREASONABLE),
    sized(9, 9, DIFF_UNREASONABLE, true),
    sized(3, 12, DIFF_UNREASONABLE),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = crossingGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solverFinishes(state.puzzle), desc).toBe(false);
      expect(countFills(state.puzzle), desc).toBe(1);
      // No square is left that no number reaches, as at Easy.
      const { walls, acrossRun, downRun } = state.puzzle;
      walls.forEach((wall, i) => {
        if (!wall) expect(Math.max(acrossRun[i] ?? -1, downRun[i] ?? -1)).not.toBe(-1);
      });
      // And the answer Solve and the mistake check go by is that grid.
      const solved = crossingGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(status(crossingGame.executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  // The smallest boards there are carry the tier.
  describeDealtTiers(crossingGame, ["4x2du", "2x4du", "4x3du", "4x4Sdu"]);
  // The largest the bound admits, wide and thin.
  describeDealtTiers(crossingGame, ["13x13du", "12x15du", "4x45du", "2x40du"], {
    seldom: true,
  });

  const refusal = (id: string) =>
    paramsError(crossingGame, crossingGame.decodeParams(id), true);

  it.each([
    "13x13du",
    "13x14du",
    "10x18Sdu",
    "3x60du",
    "2x40du",
  ])("%s is inside the bound on Unreasonable boards", (id) => {
    expect(refusal(id)).toBeNull();
  });

  it.each([
    // Each is dealt at Easy, and takes over a second here or is never found.
    "14x14du",
    "15x15Sdu",
    "9x25du",
    "5x40du",
  ])("%s is refused at Unreasonable and dealt at Easy", (id) => {
    expect(refusal(id)).toMatch(/at most 182 for an Unreasonable puzzle/);
    expect(refusal(id.replace("du", "de"))).toBeNull();
  });

  it("a thin board is refused at either tier where none is dealt", () => {
    for (const tier of ["de", "du"]) {
      expect(refusal(`2x40${tier}`)).toBeNull();
      expect(refusal(`2x41${tier}`)).toMatch(/2 squares across.*at most 80/);
      expect(refusal(`61x3${tier}`)).toMatch(/3 squares across.*at most 180/);
      expect(refusal(`4x46${tier}`)).toMatch(/4 squares across.*at most 180/);
    }
    expect(refusal("5x45de")).toBeNull();
    // A board that arrives with its description is not held to any of them.
    expect(
      paramsError(crossingGame, sized(2, 60, DIFF_UNREASONABLE), false),
    ).toBeNull();
  });
});

describe("a pasted Crossing board", () => {
  const load = (id: string) => {
    const me = new Midend(crossingGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`5x5:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5de:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5du:${NEEDS_SEARCH}`)).toBe("5x5du");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`5x5:${SOLVER_FINISHES}`)).toBe("5x5de");
    expect(load(`5x5de:${SOLVER_FINISHES}`)).toBe("5x5de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`4x3:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x3du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x2:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Crossing board", () => {
  it("stops where the solver does, and goes on from a digit tried rightly", () => {
    const p = sized(5, 5, DIFF_UNREASONABLE);
    const me = new Midend(crossingGame);
    expect(me.newGameFromId(`5x5du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const { walls } = state.puzzle;
    const firstEmpty = () => state.grid.findIndex((digit, i) => !digit && !walls[i]);

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = crossingGame.hint?.(state);
        plan?.ok;
        plan = crossingGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = crossingGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(crossingGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    const open = firstEmpty();
    const at = { x: open % 5, y: Math.floor(open / 5) };
    const right = answer.solution[open] as number;
    // A digit tried wrongly is what the mistake check is there to catch.
    const tried = crossingGame.executeMove(state, {
      kind: "set",
      ...at,
      digit: (right % 9) + 1,
    });
    expect(crossingGame.findMistakes?.(tried)).toEqual([{ ...at, kind: "cell" }]);

    // Trying digits rightly, one empty square at a time, the hint finishes it.
    for (let tries = 0; status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(25);
      const i = firstEmpty();
      const move = {
        kind: "set",
        x: i % 5,
        y: Math.floor(i / 5),
        digit: answer.solution[i] as number,
      } as const;
      state = crossingGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(status(state)).toBe("solved");
  });
});
