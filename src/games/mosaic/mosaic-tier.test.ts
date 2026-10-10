/**
 * Mosaic's two tiers: Easy, which the one rule finishes, and Unreasonable, a
 * board with one answer that it does not reach.
 *
 * The answer counts here come from {@link countAnswers}, which shades or
 * clears one square after another in reading order and backs out where a
 * number beside it already has too many shaded or too few left. It deduces
 * nothing and picks no square, so it shares nothing with the rule or the
 * search over it, and can say whether those two are right that a board has
 * one answer.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import { mosaicGame } from "./index.ts";
import { answerOf, searchAnswers, solveGameActual } from "./solver.ts";
import {
  type MosaicBoard,
  type MosaicMove,
  type MosaicParams,
  newState,
  STATE_MARK_MASK,
  STATE_MARKED,
  status,
} from "./state.ts";

/** How many ways every square of `board` can be shaded or left clear so that
 * each number counts the shaded squares of its block, as far as `limit`. */
function countAnswers(board: MosaicBoard, limit = 2): number {
  const { width: w, height: h, clues } = board;
  const size = w * h;
  /** 1 shaded, 0 clear, -1 not yet decided. */
  const grid = new Int8Array(size).fill(-1);
  const blockOf = (pos: number): number[] => {
    const out: number[] = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x = (pos % w) + dx;
        const y = Math.floor(pos / w) + dy;
        if (x >= 0 && x < w && y >= 0 && y < h) out.push(y * w + x);
      }
    return out;
  };
  const blocks = Array.from({ length: size }, (_, pos) => blockOf(pos));
  /** Whether the number at `pos`, if any, can still come out right. */
  const holds = (pos: number): boolean => {
    const clue = clues[pos] as number;
    if (clue < 0) return true;
    let shaded = 0;
    let open = 0;
    for (const c of blocks[pos] as number[]) {
      if (grid[c] === 1) shaded++;
      else if (grid[c] === -1) open++;
    }
    return shaded <= clue && clue <= shaded + open;
  };
  let count = 0;
  const fill = (pos: number): void => {
    if (pos === size) {
      count++;
      return;
    }
    for (const mark of [1, 0]) {
      if (count >= limit) break;
      grid[pos] = mark;
      if ((blocks[pos] as number[]).every(holds)) fill(pos + 1);
    }
    grid[pos] = -1;
  };
  fill(0);
  return count;
}

const sized = (
  width: number,
  height: number,
  diff: number,
  aggressive = true,
): MosaicParams => ({ width, height, aggressive, diff });

const boardOf = (w: number, h: number, desc: string): MosaicBoard =>
  newState(sized(w, h, DIFF_EASY), desc).board;

/** A 5x5 board with one answer, on which the rule stops after three numbers. */
const NEEDS_SEARCH = "0b4c4b4a6a3d3a2c";
/** A 3x3 board the rule finishes: every square shaded. */
const RULE_FINISHES = "464696464";
/** A lone 5 in the middle of a 3x3 board, which fits many ways. */
const MANY_ANSWERS = "d5d";
/** A corner that counts none and a middle that counts all nine. */
const NO_ANSWER = "0c9d";

describe("the answer counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    expect(countAnswers(boardOf(3, 3, RULE_FINISHES))).toBe(1);
    // Five of nine squares shaded: 126 ways.
    expect(countAnswers(boardOf(3, 3, MANY_ANSWERS), 1000)).toBe(126);
    expect(countAnswers(boardOf(3, 3, NO_ANSWER))).toBe(0);
    expect(countAnswers(boardOf(5, 5, NEEDS_SEARCH), 1000)).toBe(1);
    // No number at all leaves every square free.
    expect(countAnswers(boardOf(3, 3, "i"), 1000)).toBe(512);
  });
});

describe("mosaic's search for a board's answers", () => {
  const answers = (w: number, h: number, desc: string, budget?: number) =>
    searchAnswers(boardOf(w, h, desc), budget).kind;

  it("says one, several or none", () => {
    expect(answers(5, 5, NEEDS_SEARCH)).toBe("one");
    expect(answers(3, 3, RULE_FINISHES)).toBe("one");
    expect(answers(3, 3, MANY_ANSWERS)).toBe("several");
    expect(answers(3, 3, NO_ANSWER)).toBe("none");
    // A square no number counts is free, so the board has two answers.
    expect(answers(3, 3, "i")).toBe("several");
  });

  it("says neither once its budget is spent", () => {
    // The rule finishes a board in the one position the search starts from.
    expect(answers(3, 3, RULE_FINISHES, 1)).toBe("one");
    expect(answers(5, 5, NEEDS_SEARCH, 1)).toBe("out-of-reach");
    expect(answers(5, 5, NEEDS_SEARCH, 3)).toBe("out-of-reach");
  });

  // With one position to spend the search can only say "none" of a board the
  // rule calls impossible as it runs, so each of these is the rule's own
  // verdict. In both the middle number's block still has empty squares when
  // it goes wrong, which upstream's rule waits to be full before noticing.
  it.each([
    ["more shaded than its number", "4c3d"],
    ["too few squares left for its number", "0c6d"],
  ] as const)("is told by the rule of a block with %s", (_what, desc) => {
    expect(answers(3, 3, desc, 1)).toBe("none");
    expect(countAnswers(boardOf(3, 3, desc))).toBe(0);
  });

  it("is not told a board merely short of finished is impossible", () => {
    expect(answers(3, 3, MANY_ANSWERS, 1)).toBe("out-of-reach");
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with clues taken away,
    // which often have several; and with one clue changed, which mostly have
    // none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (board: MosaicBoard, label: string): void => {
      const answer = searchAnswers(board);
      tally[answer.kind]++;
      const count = countAnswers(board);
      expect(answer.kind, label).toBe(
        count === 0 ? "none" : count === 1 ? "one" : "several",
      );
    };
    for (const [w, h] of [
      [3, 3],
      [4, 3],
      [4, 4],
      [5, 5],
    ] as const) {
      for (let seed = 0; seed < 60; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(w, h, seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE);
        const dealt = newState(p, mosaicGame.newDesc(p, rng).desc).board;
        const label = `${w}x${h} seed ${seed}`;
        judge(dealt, label);

        const shown = Array.from(dealt.clues, (c, i) => (c >= 0 ? i : -1)).filter(
          (i) => i >= 0,
        );
        const fewer = Int8Array.from(dealt.clues);
        for (let gone = 0; gone < 2; gone++)
          fewer[shown[randomUpto(rng, shown.length)] as number] = -1;
        judge({ ...dealt, clues: fewer }, `${label}, clues taken away`);

        const changed = Int8Array.from(dealt.clues);
        const at = shown[randomUpto(rng, shown.length)] as number;
        changed[at] = ((changed[at] as number) + 1) % 5;
        judge({ ...dealt, clues: changed }, `${label}, one clue changed`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(240);
    expect(tally.several).toBeGreaterThan(80);
    expect(tally.none).toBeGreaterThan(80);
  });
});

describe("an Unreasonable Mosaic board", () => {
  it.each([
    sized(3, 3, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE),
    sized(4, 6, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE, false),
    sized(6, 5, DIFF_UNREASONABLE, false),
  ])("%o is dealt with one answer that the rule does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = mosaicGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solveGameActual(state.board), desc).toBeNull();
      expect(countAnswers(state.board), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that picture.
      const solved = mosaicGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(status(mosaicGame.executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  it("keeps most of its numbers where generation is not aggressive", () => {
    // Hiding stops at the first clue whose loss stops the rule.
    const shown = (aggressive: boolean): number => {
      const p = sized(10, 10, DIFF_UNREASONABLE, aggressive);
      const { desc } = mosaicGame.newDesc(p, randomNew("kept"));
      return newState(p, desc).board.clues.filter((c) => c >= 0).length;
    };
    expect(shown(false)).toBeGreaterThan(shown(true) + 5);
  });

  // The smallest board there is carries the tier, and so do the thinnest.
  describeDealtTiers(mosaicGame, ["3x3du", "3x3h0du", "3x20du", "4x20du"]);
  // The largest aggressive board, the largest preset, and the largest board.
  describeDealtTiers(mosaicGame, ["30x30du", "50x50h0du", "100x100h0du"], {
    seldom: true,
  });
});

describe("the shape of a Mosaic board", () => {
  const refusal = (id: string) =>
    paramsError(mosaicGame, mosaicGame.decodeParams(id), true);

  it.each([
    "3x20de",
    "20x4du",
    "5x30de",
    "9x50de",
    "10x100de",
    "15x200h0du",
    "20x500h0de",
    "30x30du",
    "100x100h0du",
  ])("%s is inside the bounds", (id) => {
    expect(refusal(id)).toBeNull();
  });

  it.each([
    ["3x21de", /3 squares across can be at most 20 long/],
    ["21x4du", /4 squares across can be at most 20 long/],
    ["5x31de", /5 squares across can be at most 30 long/],
    ["8x51h0de", /8 squares across can be at most 50 long/],
    ["101x12de", /12 squares across can be at most 100 long/],
    ["19x201h0du", /19 squares across can be at most 200 long/],
  ] as const)("%s is refused as too long for its width", (id, why) => {
    expect(refusal(id)).toMatch(why);
  });

  it.each([
    "31x30du",
    "50x50du",
  ])("%s is refused at Unreasonable with aggressive generation only", (id) => {
    expect(refusal(id)).toMatch(/at most 900 squares/);
    expect(refusal(id.replace("du", "de"))).toBeNull();
    expect(refusal(id.replace("du", "h0du"))).toBeNull();
  });

  it("a board that arrives with its description is not held to them", () => {
    expect(paramsError(mosaicGame, sized(3, 400, DIFF_EASY), false)).toBeNull();
    expect(paramsError(mosaicGame, sized(50, 50, DIFF_UNREASONABLE), false)).toBeNull();
  });
});

describe("a pasted Mosaic board", () => {
  const load = (id: string) => {
    const me = new Midend(mosaicGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`5x5:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5de:${NEEDS_SEARCH}`)).toBe("5x5du");
    expect(load(`5x5du:${NEEDS_SEARCH}`)).toBe("5x5du");
  });

  it("that the rule finishes opens as Easy", () => {
    expect(load(`3x3:${RULE_FINISHES}`)).toBe("3x3de");
    expect(load(`3x3de:${RULE_FINISHES}`)).toBe("3x3de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`3x3:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x3du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x3:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
    // The board `untiered-load.test.ts` held as one deduction does not
    // finish: it has no answer at all.
    expect(load("3x3:1b45c1")).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Mosaic board", () => {
  it("stops where the rule does, and goes on from a square tried rightly", () => {
    const p = sized(5, 5, DIFF_UNREASONABLE);
    const me = new Midend(mosaicGame);
    expect(me.newGameFromId(`5x5du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const firstEmpty = () => state.cells.findIndex((c) => (c & STATE_MARK_MASK) === 0);

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = mosaicGame.hint?.(state);
        plan?.ok;
        plan = mosaicGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = mosaicGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(mosaicGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    const open = firstEmpty();
    const right = answer.solution[open] as number;
    // A square tried wrongly is what the mistake check is there to catch.
    const tried = mosaicGame.executeMove(state, {
      type: "fill",
      cells: [open],
      mark: right === STATE_MARKED ? STATE_MARK_MASK - STATE_MARKED : STATE_MARKED,
    });
    expect(mosaicGame.findMistakes?.(tried)).toEqual([
      { x: open % 5, y: Math.floor(open / 5) },
    ]);

    // Trying squares rightly, one at a time, the hint finishes the board.
    for (let tries = 0; status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(25);
      const i = firstEmpty();
      const move: MosaicMove = {
        type: "fill",
        cells: [i],
        mark: answer.solution[i] as number,
      };
      state = mosaicGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(status(state)).toBe("solved");
  });
});
