// Tier-1 solver + generator: the compiled ladder's techniques and
// contradictions, solveGameActual, generator validity and minimization, the
// solve-command bitmap, and findMistakes.
import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { validateDesc } from "../../engine/desc-error.ts";
import { filledBy, spokenOf } from "../../engine/described-hint.ts";
import { ladderWalk, TIERS } from "../../engine/ladder-runtime.ts";
import { randomNew } from "../../engine/random/index.ts";
import { mosaicGame } from "./index.ts";
import {
  deductionTier,
  encodeSolution,
  findMistakes,
  hintWalk,
  newDesc,
  solveGameActual,
} from "./solver.ts";
import {
  cluesLeft,
  DIFF_NORMAL,
  executeMove,
  newState,
  STATE_BLANK,
  STATE_MARKED,
  STATE_UNMARKED,
} from "./state.ts";

const boardOf = (side: number, desc: string) =>
  newState({ width: side, height: side, aggressive: true, diff: DIFF_EASY }, desc)
    .board;

/** Every firing the hint's walk makes from `grid` (all empty where none is
 * given), each the arm it says, the numbers it names and the squares it
 * decides, and how the walk ended. */
function walked(side: number, desc: string, grid = new Uint8Array(side * side)) {
  const state = {
    ...newState({ width: side, height: side, aggressive: true, diff: DIFF_EASY }, desc),
    cells: grid,
  };
  const { marks, entries } = hintWalk(state);
  const walk = ladderWalk(marks, entries, { [TIERS]: DIFF_NORMAL }, () => []);
  const fired: {
    rung: string;
    clue: number;
    other?: number;
    need?: number;
    by?: number;
    cells: number[];
  }[] = [];
  let f = walk.next();
  for (; f !== null && f !== "contradiction"; f = walk.next()) {
    const { says } = spokenOf<{ arm: string; terms: Record<string, number> }>(f);
    const { clue, other, need, by } = says.terms;
    fired.push({
      rung: says.arm,
      clue,
      ...(other === undefined ? {} : { other, need, by }),
      cells: filledBy(f),
    });
  }
  const verdict =
    f === "contradiction"
      ? f
      : marks.grid.includes(STATE_UNMARKED)
        ? "stuck"
        : "solved";
  return { verdict, fired };
}

describe("one number alone", () => {
  it("a number that fills its block shades all of it", () => {
    expect(walked(3, "d9d")).toEqual({
      verdict: "solved",
      fired: [{ rung: "needsAll", clue: 4, cells: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
    });
  });

  it("a number with all its shaded squares clears the rest of its block", () => {
    const grid = new Uint8Array(9);
    grid[0] = STATE_MARKED;
    expect(walked(3, "d1d", grid)).toEqual({
      verdict: "solved",
      fired: [{ rung: "met", clue: 4, cells: [1, 2, 3, 4, 5, 6, 7, 8] }],
    });
  });

  it("finds the marks inconsistent where a number cannot be met", () => {
    expect(walked(3, "d2d", new Uint8Array(9).fill(STATE_BLANK)).verdict).toBe(
      "contradiction",
    );
    expect(walked(3, "d0d", new Uint8Array(9).fill(STATE_MARKED)).verdict).toBe(
      "contradiction",
    );
  });

  it("solveGameActual recovers the image from a parsed desc", () => {
    // The all-black 3×3 board.
    const sol = solveGameActual(boardOf(3, "464696464"));
    expect(sol).not.toBeNull();
    expect(Array.from(sol as Uint8Array)).toEqual(new Array(9).fill(STATE_MARKED));
  });

  it("solveGameActual returns null when deduction stalls", () => {
    // A lone central clue 5 on 3×3 determines nothing.
    expect(solveGameActual(boardOf(3, "d5d"))).toBeNull();
  });
});

describe("the comparison of two numbers", () => {
  it("shades the squares a number has outside another's block when it needs that many more", () => {
    // A corner 1 and the 3 beside it. Neither decides anything alone: the 3
    // has six squares and the 1 four.
    expect(walked(3, "13g")).toEqual({
      verdict: "stuck",
      fired: [{ rung: "needsMore", clue: 1, other: 0, need: 3, by: 2, cells: [2, 5] }],
    });
  });

  it("clears a number's other squares when one inside its block needs as many", () => {
    // A corner 2 and the 2 beside it, whose block holds the corner's.
    expect(walked(3, "22g")).toEqual({
      verdict: "stuck",
      fired: [{ rung: "sameNeed", clue: 0, other: 1, need: 2, by: 0, cells: [2, 5] }],
    });
  });

  it("finishes a board that one number at a time does not", () => {
    const desc = "0b4c4b4a6a3d3a2c";
    expect(deductionTier(boardOf(5, desc))).toBe(DIFF_NORMAL);
    const rungs = walked(5, desc).fired.map((f) => f.rung);
    expect(rungs).toContain("needsMore");
    expect(rungs).toContain("sameNeed");
  });

  it("is asked only where no number decides anything alone", () => {
    // Every square shaded: each number needs all it has.
    expect(deductionTier(boardOf(3, "464696464"))).toBe(DIFF_EASY);
    const rungs = walked(3, "464696464").fired.map((f) => f.rung);
    expect(new Set(rungs)).toEqual(new Set(["needsAll"]));
  });
});

describe("generator", () => {
  it("generates valid, deduction-solvable boards across sizes and modes", () => {
    for (const [n, aggressive, seed] of [
      [3, true, "alpha"],
      [5, true, "bravo"],
      [10, true, "charlie"],
      [7, false, "delta"],
    ] as const) {
      const p = { width: n, height: n, aggressive, diff: DIFF_EASY };
      const { desc } = newDesc(p, randomNew(seed));
      expect(validateDesc(mosaicGame, p, desc), `desc for ${n}/${seed}`).toBeNull();
      const state = newState(p, desc);
      expect(deductionTier(state.board), `Easy for ${n}/${seed}`).toBe(DIFF_EASY);
      // Some clue must survive minimization.
      expect(cluesLeft(state)).toBeGreaterThan(0);
    }
  });

  it("deals an aggressive Easy board no number of which one number at a time can spare", () => {
    const p = { width: 6, height: 6, aggressive: true, diff: DIFF_EASY };
    const { board } = newState(p, newDesc(p, randomNew("echo")).desc);
    const shown = [...board.clues.keys()].filter((pos) => board.clues[pos] >= 0);
    expect(shown.length).toBeGreaterThan(0);
    for (const pos of shown) {
      const clues = Int8Array.from(board.clues);
      clues[pos] = -1;
      expect(deductionTier({ ...board, clues }), `without ${pos}`).not.toBe(DIFF_EASY);
    }
  });
});

describe("solve command + findMistakes", () => {
  it("encodeSolution packs marked cells MSB-first", () => {
    const cells = new Uint8Array(9).fill(STATE_MARKED);
    expect(encodeSolution(cells)).toBe("ff80");
    const alt = Uint8Array.from([
      STATE_MARKED,
      STATE_BLANK,
      STATE_MARKED,
      STATE_BLANK,
      STATE_MARKED,
      STATE_BLANK,
      STATE_MARKED,
      STATE_BLANK,
      STATE_MARKED,
    ]);
    expect(encodeSolution(alt)).toBe("aa80");
  });

  it("flags a determined cell that contradicts the solution", () => {
    // All-black board: blanking any cell is a mistake; marking is not.
    let state = newState(
      { width: 3, height: 3, aggressive: true, diff: DIFF_EASY },
      "464696464",
    );
    expect(findMistakes(state)).toEqual([]);
    state = executeMove(state, { type: "toggle", x: 1, y: 0, double: true }); // blank
    expect(findMistakes(state)).toEqual([{ x: 1, y: 0 }]);
    state = executeMove(state, { type: "toggle", x: 1, y: 0, double: true }); // → black
    expect(findMistakes(state)).toEqual([]);
  });

  it("reports nothing when deduction cannot determine the board", () => {
    const state = newState(
      { width: 3, height: 3, aggressive: true, diff: DIFF_EASY },
      "d5d",
    );
    expect(findMistakes(state)).toEqual([]);
  });
});
