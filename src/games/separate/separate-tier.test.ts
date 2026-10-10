/**
 * Separate's two tiers: Easy, which the solver's three rungs finish, and
 * Unreasonable, a board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countDivisions}, which lays whole
 * regions down one after another, each through the first square not yet in
 * one, and keeps a region only if its letters all differ. It walls nothing
 * and joins nothing, so it shares nothing with the solver or the search over
 * it, and can say whether those two are right that a board has one answer.
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
import { separateGame } from "./index.ts";
import { answerOf, searchAnswers, solveToBorders } from "./solver.ts";
import {
  newState,
  type SeparateMove,
  type SeparateParams,
  type SeparateShape,
  status,
} from "./state.ts";

/** How many ways the grid divides into connected regions of `k` squares, no
 * region holding a letter twice, as far as `limit`. */
function countDivisions(p: SeparateShape, letters: Uint8Array, limit = 2): number {
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

  let count = 0;
  const lay = (id: number): void => {
    const first = region.indexOf(-1);
    if (first < 0) {
      count++;
      return;
    }
    // Every connected set of `k` free squares through `first` whose letters
    // all differ, each once.
    const seen = new Set<string>();
    const grow = (cells: number[]): void => {
      if (count >= limit) return;
      const key = [...cells].sort((a, b) => a - b).join(",");
      if (seen.has(key)) return;
      seen.add(key);
      if (cells.length === k) {
        for (const c of cells) region[c] = id;
        lay(id + 1);
        for (const c of cells) region[c] = -1;
        return;
      }
      for (const c of cells)
        for (const b of beside(c))
          if (
            region[b] === -1 &&
            !cells.includes(b) &&
            cells.every((held) => letters[held] !== letters[b])
          )
            grow([...cells, b]);
    };
    grow([first]);
  };
  lay(0);
  return count;
}

const sized = (w: number, h: number, k: number, diff: number): SeparateParams => ({
  w,
  h,
  k,
  diff,
});

const lettersOf = (desc: string): Uint8Array =>
  Uint8Array.from(desc, (c) => c.charCodeAt(0) - 65);

const FOUR = { w: 4, h: 4, k: 4 };
/** A 4x4 board with one answer, on which the solver stops short. */
const NEEDS_SEARCH = "BACACCBBADCDBDDA";
/** A 4x4 board the solver finishes. */
const SOLVER_FINISHES = "ABAADBBDCADCCDCB";
/** Each row holds one of each letter, and so does each 2x2 block: the rows
 * are one division and the blocks another. */
const MANY_ANSWERS = "ABCDCDABABCDCDAB";
/** Sixteen As: no two squares can share a region. */
const NO_ANSWER = "AAAAAAAAAAAAAAAA";

describe("the division counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    expect(countDivisions(FOUR, lettersOf(SOLVER_FINISHES))).toBe(1);
    expect(countDivisions(FOUR, lettersOf(NEEDS_SEARCH), 100)).toBe(1);
    expect(countDivisions(FOUR, lettersOf(NO_ANSWER))).toBe(0);
    // With every letter different a division is any division: a 2x2 board
    // into dominoes two ways, a 3x2 board into threes three ways (two rows,
    // or two Ls either way round), a 4x4 board into fours 117 ways.
    const any = (w: number, h: number, k: number) =>
      countDivisions(
        { w, h, k },
        Uint8Array.from({ length: w * h }, (_, i) => i),
        1000,
      );
    expect(any(2, 2, 2)).toBe(2);
    expect(any(3, 2, 3)).toBe(3);
    expect(any(4, 4, 4)).toBe(117);
    // A strip divides one way.
    expect(countDivisions({ w: 6, h: 1, k: 3 }, lettersOf("ABCCAB"))).toBe(1);
  });
});

describe("separate's search for a board's answers", () => {
  const answers = (desc: string, budget?: number) =>
    searchAnswers(FOUR, lettersOf(desc), budget).kind;

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

  it("takes one position for every Easy board", () => {
    // The verdict agrees with the solver about what solved is.
    for (const [w, h, k] of [
      [4, 4, 4],
      [5, 5, 5],
      [6, 6, 4],
    ] as const) {
      const p = sized(w, h, k, DIFF_EASY);
      for (let seed = 0; seed < 10; seed++) {
        const { desc } = separateGame.newDesc(p, randomNew(`one-position-${seed}`));
        expect(searchAnswers(p, lettersOf(desc), 1).kind, desc).toBe("one");
      }
    }
  });

  // The positions the board takes, to the one. A region that cannot grow is
  // the only thing the verdict calls impossible, and it only prunes: a search
  // without it reaches the same answer in more positions (117 here). The
  // count decides which boards are dealt and which pasted ones open.
  it("is told at once of a region that cannot grow", () => {
    const p = { w: 5, h: 5, k: 5 };
    const letters = lettersOf("DEBDCCDBBCAAAEEECCDABDEAB");
    const positions = 13;
    expect(searchAnswers(p, letters, positions - 1).kind).toBe("out-of-reach");
    expect(searchAnswers(p, letters, positions).kind).toBe("one");
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with two letters swapped
    // anywhere, which often have several or none.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (p: SeparateShape, letters: Uint8Array, label: string): void => {
      const answer = searchAnswers(p, letters);
      tally[answer.kind]++;
      const count = countDivisions(p, letters);
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
        const dealt = lettersOf(separateGame.newDesc(p, rng).desc);
        const label = `${w}x${h}n${k} seed ${seed}`;
        judge(p, dealt, label);

        const swapped = dealt.slice();
        for (let swaps = 0; swaps < 2; swaps++) {
          const a = randomUpto(rng, w * h);
          const b = randomUpto(rng, w * h);
          const was = swapped[a] as number;
          swapped[a] = swapped[b] as number;
          swapped[b] = was;
        }
        judge(p, swapped, `${label}, letters swapped`);
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(250);
    expect(tally.several).toBeGreaterThan(40);
    expect(tally.none).toBeGreaterThan(40);
  });
});

describe("an Unreasonable Separate board", () => {
  it.each([
    sized(4, 4, 4, DIFF_UNREASONABLE),
    sized(5, 5, 5, DIFF_UNREASONABLE),
    sized(6, 6, 4, DIFF_UNREASONABLE),
    sized(4, 6, 6, DIFF_UNREASONABLE),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = separateGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solveToBorders(p, state.letters), desc).toBeNull();
      expect(countDivisions(p, state.letters), desc).toBe(1);
      // And the answer Solve and the mistake check go by is that division.
      const solved = separateGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(status(separateGame.executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  // The smallest boards that carry the tier.
  describeDealtTiers(separateGame, ["4x2n4du", "3x3n3du", "6x2n3du"]);
  // Sizes the generator did not reach while it filled a division at random.
  describeDealtTiers(separateGame, ["9x9n3du", "8x8n4du", "8x8n8du"], { deals: 2 });
  // The largest preset.
  describeDealtTiers(separateGame, ["6x6n6du"], { seldom: true });

  // Every fill of a shape that holds each letter equally often, the first
  // square an A since renaming the letters changes nothing: none that the
  // solver leaves unfinished divides exactly one way. This is every board of
  // the shape, so it is a proof for it. With two letters it holds at any
  // size: a region is an A beside a B, and where such pairs fit one way only
  // some square has one neighbor left to take.
  it.each([
    [6, 1, 3],
    [8, 1, 4],
    [8, 1, 2],
    [2, 2, 2],
    [3, 2, 2],
    [4, 3, 2],
    [4, 4, 2],
    [3, 2, 3],
    [2, 3, 3],
  ] as const)("no %dx%d board with %d letters needs a search and has one answer", (w, h, k) => {
    const p = { w, h, k };
    const wh = w * h;
    const letters = new Uint8Array(wh);
    const used = new Int32Array(k);
    let fills = 0;
    let finished = 0;
    const fill = (i: number): void => {
      if (i === wh) {
        fills++;
        if (solveToBorders(p, letters)) finished++;
        else expect(countDivisions(p, letters), [...letters].join("")).not.toBe(1);
        return;
      }
      for (let letter = 0; letter < (i === 0 ? 1 : k); letter++) {
        if (used[letter] === wh / k) continue;
        used[letter] = (used[letter] as number) + 1;
        letters[i] = letter;
        fill(i + 1);
        used[letter] = (used[letter] as number) - 1;
      }
    };
    fill(0);
    expect(fills).toBeGreaterThan(2);
    expect(finished).toBeGreaterThan(0);
  });

  // The same count finds the tier where it is dealt, so it can see one.
  it("a 3x3 board with three letters can need a search and have one answer", () => {
    const p = { w: 3, h: 3, k: 3 };
    const letters = lettersOf("AABCBABCC");
    expect(solveToBorders(p, letters)).toBeNull();
    expect(countDivisions(p, letters)).toBe(1);
  });

  describeAbsentTiers(separateGame, ["6x1n3du", "1x4n2du", "4x4n2du", "3x2n3du"]);
});

describe("a pasted Separate board", () => {
  const load = (id: string) => {
    const me = new Midend(separateGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`4x4n4:${NEEDS_SEARCH}`)).toBe("4x4n4du");
    expect(load(`4x4n4de:${NEEDS_SEARCH}`)).toBe("4x4n4du");
    expect(load(`4x4n4du:${NEEDS_SEARCH}`)).toBe("4x4n4du");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`4x4n4:${SOLVER_FINISHES}`)).toBe("4x4n4de");
    expect(load(`4x4n4de:${SOLVER_FINISHES}`)).toBe("4x4n4de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`4x4n4:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4n4du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`4x4n4:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Separate board", () => {
  it("stops where the solver does, and goes on from an edge tried rightly", () => {
    const p = sized(4, 4, 4, DIFF_UNREASONABLE);
    const me = new Midend(separateGame);
    expect(me.newGameFromId(`4x4n4du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");
    const wallAt = (i: number, dir: number) =>
      ((answer.solution[i] as number) & BORDER(dir)) !== 0;
    /** The first edge the player has neither walled nor ruled out, as the
     * move that decides it the way the answer has it (or the other way). */
    const firstOpen = (rightly: boolean): SeparateMove | null => {
      for (let i = 0; i < 16; i++)
        for (const dir of [1, 2]) {
          const x = i % 4;
          const y = Math.floor(i / 4);
          if ((dir === 1 && x === 3) || (dir === 2 && y === 3)) continue;
          const b = BORDER(dir);
          if ((state.borders[i] as number) & (b | DISABLED(b))) continue;
          const wall = wallAt(i, dir) === rightly;
          const j = dir === 1 ? i + 1 : i + 4;
          const back = BORDER((dir + 2) % 4);
          return {
            type: "edges",
            edits: [
              { x, y, flag: wall ? b : DISABLED(b) },
              { x: j % 4, y: Math.floor(j / 4), flag: wall ? back : DISABLED(back) },
            ],
          };
        }
      return null;
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = separateGame.hint?.(state);
        plan?.ok;
        plan = separateGame.hint?.(state)
      )
        for (const step of plan.steps) {
          state = separateGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(separateGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // An edge tried wrongly is what the mistake check is there to catch.
    const wrong = firstOpen(false);
    if (!wrong) throw new Error("no undecided edge where the hint stopped");
    const tried = separateGame.executeMove(state, wrong);
    expect(separateGame.findMistakes?.(tried)?.length).toBeGreaterThan(0);

    // Trying edges rightly, one at a time, the hint finishes the board.
    for (let tries = 0; status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(24);
      const move = firstOpen(true);
      if (!move) break;
      state = separateGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(status(state)).toBe("solved");
  });
});

describe("the tier in Separate's params", () => {
  it("is refused only where no board has it", () => {
    const refusal = (id: string) =>
      paramsError(separateGame, separateGame.decodeParams(id), true);
    expect(refusal("5x5n5du")).toBeNull();
    expect(refusal("4x2n4du")).toBeNull();
    expect(refusal("3x3n3du")).toBeNull();
    expect(refusal("6x1n3de")).toBeNull();
    expect(refusal("6x1n3du")).toBe("No 6x1 puzzle with 3 letters is Unreasonable.");
    expect(refusal("4x4n2du")).toBe("No 4x4 puzzle with 2 letters is Unreasonable.");
    expect(refusal("2x3n3du")).toBe("No 2x3 puzzle with 3 letters is Unreasonable.");
    // A board that arrives with its description is not held to it.
    expect(
      paramsError(separateGame, sized(4, 4, 2, DIFF_UNREASONABLE), false),
    ).toBeNull();
  });
});
