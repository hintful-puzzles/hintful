/**
 * Palisade's two tiers: Easy, which the solver's six deductions finish, and
 * Unreasonable, a board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countDivisions}, which lays whole
 * regions down one after another, each through the first square not yet in
 * one, and checks a region's clues as it is laid. It decides no edge and
 * joins nothing, so it shares nothing with the solver or the search over it,
 * and can say whether those two are right that a board has one answer.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { BORDER, DISABLED } from "../../engine/border-grid.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { palisadeGame } from "./index.ts";
import { answerOf, searchAnswers, solveToBorders } from "./solver.ts";
import {
  EMPTY,
  newState,
  type PalisadeMove,
  type PalisadeParams,
  type PalisadeShape,
  status,
} from "./state.ts";

/** How many ways the grid divides into regions of `k` squares so that every
 * clue counts the sides of its square that lie on a region's edge, as far as
 * `limit`. */
function countDivisions(p: PalisadeShape, clues: Int8Array, limit = 2): number {
  const { w, h, k } = p;
  const wh = w * h;
  /** The region each square is in, -1 while it is in none. */
  const region = new Int32Array(wh).fill(-1);
  const beside = (i: number): number[] => {
    const out: number[] = [];
    if (i % w > 0) out.push(i - 1);
    if (i % w < w - 1) out.push(i + 1);
    if (i >= w) out.push(i - w);
    if (i + w < wh) out.push(i + w);
    return out;
  };
  /** A laid region's clues: every side of a square of it that does not lead
   * to another square of it is an edge. */
  const cluesHold = (cells: readonly number[]): boolean =>
    cells.every((c) => {
      if (clues[c] === EMPTY) return true;
      const inside = beside(c).filter((b) => cells.includes(b)).length;
      return clues[c] === 4 - inside;
    });

  let count = 0;
  const lay = (id: number): void => {
    const first = region.indexOf(-1);
    if (first < 0) {
      count++;
      return;
    }
    // Every connected set of `k` free squares through `first`, each once.
    const seen = new Set<string>();
    const grow = (cells: number[]): void => {
      if (count >= limit) return;
      if (cells.length === k) {
        const key = [...cells].sort((a, b) => a - b).join(",");
        if (seen.has(key)) return;
        seen.add(key);
        if (!cluesHold(cells)) return;
        for (const c of cells) region[c] = id;
        lay(id + 1);
        for (const c of cells) region[c] = -1;
        return;
      }
      const key = `p${[...cells].sort((a, b) => a - b).join(",")}`;
      if (seen.has(key)) return;
      seen.add(key);
      for (const c of cells)
        for (const b of beside(c))
          if (region[b] === -1 && !cells.includes(b)) grow([...cells, b]);
    };
    grow([first]);
  };
  lay(0);
  return count;
}

const sized = (w: number, h: number, k: number, diff: number): PalisadeParams => ({
  w,
  h,
  k,
  diff,
});

const cluesOf = (p: PalisadeShape, desc: string): Int8Array =>
  newState({ ...p, diff: DIFF_EASY }, desc).clues;

const FIVE = { w: 5, h: 5, k: 5 };
/** A 5x5 board with one answer, on which the solver stops short. */
const NEEDS_SEARCH = "a1b2e1g22d2";
/** A 5x5 board the solver finishes. */
const SOLVER_FINISHES = "a1b2c2a1g22d2";
/** No clue at all: every division of the grid fits. */
const MANY_ANSWERS = "";
/** A square walled on all four sides is a region of one. */
const NO_ANSWER = "4";

describe("the division counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    expect(countDivisions(FIVE, cluesOf(FIVE, SOLVER_FINISHES))).toBe(1);
    expect(countDivisions(FIVE, cluesOf(FIVE, NEEDS_SEARCH), 100)).toBe(1);
    expect(countDivisions(FIVE, cluesOf(FIVE, NO_ANSWER))).toBe(0);
    // A strip divides one way; a 2x2 board into dominoes two ways; a 3x2
    // board into threes three ways (two rows, or two Ls either way round); a
    // 4x4 board into fours 117 ways.
    expect(
      countDivisions({ w: 6, h: 1, k: 3 }, cluesOf({ w: 6, h: 1, k: 3 }, "")),
    ).toBe(1);
    const none = (w: number, h: number, k: number) =>
      countDivisions({ w, h, k }, new Int8Array(w * h).fill(EMPTY), 1000);
    expect(none(2, 2, 2)).toBe(2);
    expect(none(3, 2, 3)).toBe(3);
    expect(none(4, 4, 4)).toBe(117);
  });
});

describe("palisade's search for a board's answers", () => {
  const answers = (desc: string, budget?: number) =>
    searchAnswers(FIVE, cluesOf(FIVE, desc), budget).kind;

  it("says one, several or none", () => {
    expect(answers(NEEDS_SEARCH)).toBe("one");
    expect(answers(SOLVER_FINISHES)).toBe("one");
    expect(answers(MANY_ANSWERS)).toBe("several");
    expect(answers(NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The solver finishes a board in the one position the search starts from.
    expect(answers(SOLVER_FINISHES, 1)).toBe("one");
    expect(answers(NEEDS_SEARCH, 1)).toBe("out-of-reach");
    expect(answers(NEEDS_SEARCH, 2)).toBe("out-of-reach");
  });

  // The positions each board takes, to the one. A wrong assumption that the
  // verdict did not call impossible at once costs more, and the count decides
  // which boards are dealt and which pasted ones open. Each board is one that
  // takes more with the named part of the verdict left out (15, 19, 39, 11).
  it.each([
    ["a region past its size", 6, 8, 6, "a3i2c0g1b2a1d2d3b12b22", 11],
    ["a wall inside a region", 4, 4, 4, "f33b3c2", 13],
    ["a clue that cannot be met", 5, 5, 5, "a3a12b2i1", 17],
    ["a region that cannot grow", 5, 5, 5, "a31c2b2h32d2", 7],
  ] as const)("is told at once of %s", (_what, w, h, k, desc, positions) => {
    const p = { w, h, k };
    const clues = cluesOf(p, desc);
    expect(searchAnswers(p, clues, positions - 1).kind).toBe("out-of-reach");
    expect(searchAnswers(p, clues, positions).kind).toBe("one");
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with clues taken away,
    // which often have several; and with one clue changed, which mostly have
    // none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (p: PalisadeShape, clues: Int8Array, label: string): void => {
      const answer = searchAnswers(p, clues);
      tally[answer.kind]++;
      const count = countDivisions(p, clues);
      expect(answer.kind, label).toBe(
        count === 0 ? "none" : count === 1 ? "one" : "several",
      );
    };
    for (const [w, h, k] of [
      [3, 3, 3],
      [4, 3, 4],
      [4, 4, 4],
      [3, 6, 6],
      [5, 5, 5],
    ] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${seed}`);
        const p = sized(w, h, k, seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE);
        const dealt = newState(p, palisadeGame.newDesc(p, rng).desc).clues;
        const label = `${w}x${h}n${k} seed ${seed}`;
        judge(p, dealt, label);

        const shown = Array.from(dealt, (c, i) => (c === EMPTY ? -1 : i)).filter(
          (i) => i >= 0,
        );
        if (shown.length === 0) continue;
        const fewer = dealt.slice();
        for (let gone = 0; gone < 2; gone++)
          fewer[shown[randomUpto(rng, shown.length)] as number] = EMPTY;
        judge(p, fewer, `${label}, clues taken away`);

        const changed = dealt.slice();
        const at = shown[randomUpto(rng, shown.length)] as number;
        changed[at] = ((changed[at] as number) + 1) % 4;
        judge(p, changed, `${label}, one clue changed`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(250);
    expect(tally.several).toBeGreaterThan(80);
    expect(tally.none).toBeGreaterThan(80);
  });
});

describe("an Unreasonable Palisade board", () => {
  it.each([
    sized(3, 2, 3, DIFF_UNREASONABLE),
    sized(4, 4, 4, DIFF_UNREASONABLE),
    sized(5, 5, 5, DIFF_UNREASONABLE),
    sized(4, 6, 6, DIFF_UNREASONABLE),
    sized(6, 6, 4, DIFF_UNREASONABLE),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = palisadeGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solveToBorders(p, state.clues), desc).toBeNull();
      expect(countDivisions(p, state.clues), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that division.
      const solved = palisadeGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(status(palisadeGame.executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  // The smallest boards that carry the tier.
  describeDealtTiers(palisadeGame, ["3x2n3du", "2x4n4du", "3x3n3du"]);
  // The largest preset.
  describeDealtTiers(palisadeGame, ["12x15n10du"], { seldom: true });

  // A strip, and a board in regions of one, divide one way whatever the
  // clues, and the solver finds that way with no clue at all. A clue takes no
  // deduction away, so it finishes every such board that has an answer.
  it.each([
    [1, 4, 2],
    [6, 1, 3],
    [1, 12, 4],
    [30, 1, 5],
    [2, 2, 1],
    [3, 4, 1],
  ] as const)("the solver finishes a clueless %dx%d board in regions of %d", (w, h, k) => {
    const p = { w, h, k };
    const none = new Int8Array(w * h).fill(EMPTY);
    expect(solveToBorders(p, none)).not.toBeNull();
    expect(countDivisions(p, none)).toBe(1);
  });

  describeAbsentTiers(palisadeGame, ["1x4n2du", "6x1n3du", "2x2n1du", "3x4n1du"]);
});

describe("a pasted Palisade board", () => {
  const load = (id: string) => {
    const me = new Midend(palisadeGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`5x5n5:${NEEDS_SEARCH}`)).toBe("5x5n5du");
    expect(load(`5x5n5de:${NEEDS_SEARCH}`)).toBe("5x5n5du");
    expect(load(`5x5n5du:${NEEDS_SEARCH}`)).toBe("5x5n5du");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`5x5n5:${SOLVER_FINISHES}`)).toBe("5x5n5de");
    expect(load(`5x5n5de:${SOLVER_FINISHES}`)).toBe("5x5n5de");
  });

  it("with several answers, or none, is refused", () => {
    // `5x5n5:a` is the board `untiered-load.test.ts` held as one deduction
    // does not finish: it has no clue, and so every division for an answer.
    expect(load("5x5n5:a")).toBe(DESC_NOT_UNIQUE);
    expect(load("5x5n5du:a")).toBe(DESC_NOT_UNIQUE);
    expect(load(`5x5n5:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Palisade board", () => {
  it("stops where the solver does, and goes on from an edge tried rightly", () => {
    const p = sized(5, 5, 5, DIFF_UNREASONABLE);
    const me = new Midend(palisadeGame);
    expect(me.newGameFromId(`5x5n5du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const wallAt = (i: number, dir: number) =>
      ((answer.solution[i] as number) & BORDER(dir)) !== 0;
    /** The first edge the player has neither walled nor ruled out, as the
     * move that decides it the way the answer has it (or the other way). */
    const firstOpen = (rightly: boolean): PalisadeMove | null => {
      for (let i = 0; i < 25; i++)
        for (const dir of [1, 2]) {
          const x = i % 5;
          const y = Math.floor(i / 5);
          if ((dir === 1 && x === 4) || (dir === 2 && y === 4)) continue;
          const b = BORDER(dir);
          if ((state.borders[i] as number) & (b | DISABLED(b))) continue;
          const wall = wallAt(i, dir) === rightly;
          const j = dir === 1 ? i + 1 : i + 5;
          const back = BORDER((dir + 2) % 4);
          return {
            type: "edges",
            edits: [
              { x, y, flag: wall ? b : DISABLED(b) },
              { x: j % 5, y: Math.floor(j / 5), flag: wall ? back : DISABLED(back) },
            ],
          };
        }
      return null;
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = palisadeGame.hint?.(state);
        plan?.ok;
        plan = palisadeGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = palisadeGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(palisadeGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // An edge tried wrongly is what the mistake check is there to catch.
    const wrong = firstOpen(false);
    if (!wrong) throw new Error("no undecided edge where the hint stopped");
    const tried = palisadeGame.executeMove(state, wrong);
    expect(palisadeGame.findMistakes?.(tried)?.length).toBeGreaterThan(0);

    // Trying edges rightly, one at a time, the hint finishes the board.
    for (let tries = 0; status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(40);
      const move = firstOpen(true);
      if (!move) break;
      state = palisadeGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(status(state)).toBe("solved");
  });
});

describe("the tier in Palisade's params", () => {
  it("is refused only where no board has it", () => {
    const refusal = (id: string) =>
      paramsError(palisadeGame, palisadeGame.decodeParams(id), true);
    expect(refusal("5x5n5du")).toBeNull();
    expect(refusal("1x4n2de")).toBeNull();
    expect(refusal("1x4n2du")).toBe("No 1x4 puzzle in regions of 2 is Unreasonable.");
    expect(refusal("3x4n1du")).toBe("No 3x4 puzzle in regions of 1 is Unreasonable.");
  });

  it("bounds an Unreasonable board at the largest preset's area", () => {
    const refusal = (id: string) =>
      paramsError(palisadeGame, palisadeGame.decodeParams(id), true);
    expect(refusal("12x15n10du")).toBeNull();
    expect(refusal("9x20n6du")).toBeNull();
    expect(refusal("14x13n7du")).toMatch(/at most 180 for an Unreasonable puzzle/);
    expect(refusal("14x13n7de")).toBeNull();
    // A board that arrives with its description is not held to it.
    expect(
      paramsError(palisadeGame, sized(15, 20, 10, DIFF_UNREASONABLE), false),
    ).toBeNull();
  });
});
