/**
 * ABCD's two tiers: Easy, which the three techniques finish, and
 * Unreasonable, a board with one answer that they do not reach.
 *
 * The answer counts here come from {@link countGrids}, which writes letters
 * in reading order and checks each line's counts as it fills. It shares
 * nothing with the ladder or the search over it, so it can say whether those
 * two are right that a board has one answer.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { abcdGame } from "./index.ts";
import { answerOf, searchAnswers, solveAbcd } from "./solver.ts";
import {
  type AbcdParams,
  type AbcdState,
  EMPTY,
  horClue,
  NO_NUMBER,
  newState,
  newUi,
  status,
  verClue,
} from "./state.ts";

/** How many grids fit `numbers`, counted as far as `limit`. */
function countGrids(p: AbcdParams, numbers: Int32Array, limit = 2): number {
  const { w, h, n, diag } = p;
  const grid = new Int8Array(w * h);
  const rows = new Int32Array(h * n);
  const cols = new Int32Array(w * n);
  /** Whether a line's count of a letter can still come to its clue: not over
   * it, and exactly it once the line is `full`. */
  const fits = (clue: number, held: number, full: boolean): boolean =>
    clue === NO_NUMBER || (full ? held === clue : held <= clue);
  let count = 0;
  const write = (i: number): void => {
    if (i === w * h) {
      count++;
      return;
    }
    const x = i % w;
    const y = (i - x) / w;
    for (let c = 0; c < n && count < limit; c++) {
      const g = c + 1;
      if (x > 0 && grid[i - 1] === g) continue;
      if (y > 0 && grid[i - w] === g) continue;
      if (diag && y > 0 && x > 0 && grid[i - w - 1] === g) continue;
      if (diag && y > 0 && x < w - 1 && grid[i - w + 1] === g) continue;
      grid[i] = g;
      rows[y * n + c]++;
      cols[x * n + c]++;
      // A row is full at its last cell and a column in the last row, and a
      // full line must hold its count of every letter, this one or not.
      let ok = true;
      for (let k = 0; k < n && ok; k++)
        ok =
          fits(
            numbers[horClue(y, k, n)] as number,
            rows[y * n + k] as number,
            x === w - 1,
          ) &&
          fits(
            numbers[verClue(x, k, n, h)] as number,
            cols[x * n + k] as number,
            y === h - 1,
          );
      if (ok) write(i + 1);
      rows[y * n + c]--;
      cols[x * n + c]--;
    }
    grid[i] = 0;
  };
  write(0);
  return count;
}

const sized = (
  w: number,
  h: number,
  n: number,
  diff: number,
  rules: Partial<AbcdParams> = {},
): AbcdParams => ({ w, h, n, diag: false, removenums: false, diff, ...rules });

const ladderFinishes = (state: AbcdState): boolean =>
  solveAbcd(state.params, state.numbers).status === "solved";

/** A 4x4 board with one answer, on which the ladder places six letters. */
const NEEDS_SEARCH = "1,1,2,0,0,1,1,2,0,1,2,1,2,0,1,1,1,0,2,1,1,1,1,1,1,1,1,1,0,1,2,1,";
/** A 4x4 board the ladder finishes. */
const LADDER_FINISHES =
  "1,0,1,2,2,0,2,0,0,2,2,0,2,0,0,2,2,0,1,1,1,1,1,1,2,0,2,0,0,1,1,2,";
/** A 3x3 board with every clue hidden. */
const MANY_ANSWERS = "-,".repeat(18);
/** A 2x2 board whose top row may hold none of its three letters. */
const NO_ANSWER = `0,0,0,${"-,".repeat(9)}`;

describe("the grid counter these tests judge by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (w: number, n: number, desc: string, limit?: number) => {
      const p = sized(w, w, n, DIFF_EASY);
      return countGrids(p, newState(p, desc).numbers, limit);
    };
    expect(count(4, 4, LADDER_FINISHES)).toBe(1);
    expect(count(2, 3, NO_ANSWER)).toBe(0);
    // Three letters on 2x2 under the no-touch rule alone: three for the first
    // cell, two for the one beside it, and three ways to fill the row below.
    expect(count(2, 3, "-,".repeat(12), 100)).toBe(18);
    // Under the rule against diagonal touching all four cells differ.
    const diag = sized(2, 2, 5, DIFF_EASY, { diag: true });
    expect(countGrids(diag, newState(diag, "-,".repeat(20)).numbers, 1000)).toBe(120);
  });
});

describe("abcd's search for a board's answers", () => {
  const answers = (w: number, n: number, desc: string, budget?: number) => {
    const p = sized(w, w, n, DIFF_EASY);
    return searchAnswers(p, newState(p, desc).numbers, budget).kind;
  };

  it("says one, several or none", () => {
    expect(answers(4, 4, NEEDS_SEARCH)).toBe("one");
    expect(answers(4, 4, LADDER_FINISHES)).toBe("one");
    expect(answers(3, 3, MANY_ANSWERS)).toBe("several");
    expect(answers(2, 3, NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The ladder finishes a board in the one position the search starts from.
    expect(answers(4, 4, LADDER_FINISHES, 1)).toBe("one");
    expect(answers(4, 4, NEEDS_SEARCH, 1)).toBe("out-of-reach");
    expect(answers(4, 4, NEEDS_SEARCH, 2)).toBe("out-of-reach");
  });

  it("agrees with the grid count on every 3x3 board of three letters, some clues hidden", () => {
    // Every fill's clue set, whole and with each third of its clues hidden in
    // turn: the hidden ones are where a full grid can leave nothing broken
    // and still be no answer.
    const p = sized(3, 3, 3, DIFF_EASY);
    const { w, h, n } = p;
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const seen = new Set<string>();
    const grid = new Int8Array(w * h);
    const judge = (numbers: Int32Array): void => {
      const key = numbers.join();
      if (seen.has(key)) return;
      seen.add(key);
      const answer = searchAnswers(p, numbers);
      tally[answer.kind]++;
      expect(answer.kind, key).toBe(countGrids(p, numbers) === 1 ? "one" : "several");
    };
    const fill = (i: number): void => {
      if (i === w * h) {
        const numbers = new Int32Array((w + h) * n);
        grid.forEach((g, k) => {
          numbers[horClue((k / w) | 0, g - 1, n)]++;
          numbers[verClue(k % w, g - 1, n, h)]++;
        });
        judge(numbers);
        for (let third = 0; third < 3; third++)
          judge(numbers.map((v, k) => (k % 3 === third ? NO_NUMBER : v)));
        return;
      }
      for (let g = 1; g <= n; g++) {
        if (i % w > 0 && grid[i - 1] === g) continue;
        if (i >= w && grid[i - w] === g) continue;
        grid[i] = g;
        fill(i + 1);
      }
    };
    fill(0);
    expect(seen.size).toBeGreaterThan(500);
    expect(tally.none + tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(200);
    expect(tally.several).toBeGreaterThan(20);
  });
});

describe("an Unreasonable ABCD board", () => {
  it.each([
    sized(4, 4, 4, DIFF_UNREASONABLE),
    sized(5, 5, 4, DIFF_UNREASONABLE),
    sized(6, 6, 4, DIFF_UNREASONABLE),
    sized(6, 6, 5, DIFF_UNREASONABLE, { diag: true }),
    sized(3, 8, 3, DIFF_UNREASONABLE),
    sized(3, 3, 3, DIFF_UNREASONABLE, { removenums: true }),
    sized(5, 5, 4, DIFF_UNREASONABLE, { removenums: true }),
    sized(6, 6, 5, DIFF_UNREASONABLE, { diag: true, removenums: true }),
  ])("%o is dealt with one answer that the ladder does not reach", (p) => {
    for (let seed = 0; seed < 4; seed++) {
      const { desc } = abcdGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(ladderFinishes(state), desc).toBe(false);
      expect(countGrids(p, state.numbers), desc).toBe(1);
      expect(state.numbers.includes(NO_NUMBER), desc).toBe(p.removenums);
      // And the answer Solve and the mistake check go by is that grid.
      const solved = abcdGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: no answer found`);
      expect(status(abcdGame.executeMove(state, solved.move)), desc).toBe("solved");
    }
  });

  it("exists on no board of up to nine squares with every clue showing", () => {
    // Every fill of three and four letters: where the ladder stops short, a
    // second grid fits. `validateParams` refuses these sizes on that count,
    // and at five letters and more on a count run once (the change that added
    // the tier has it).
    let stuck = 0;
    for (const [w, h] of [
      [2, 2],
      [2, 3],
      [3, 2],
      [2, 4],
      [3, 3],
    ] as const)
      for (const n of [3, 4]) {
        const p = sized(w, h, n, DIFF_EASY);
        const seen = new Set<string>();
        const grid = new Int8Array(w * h);
        const fill = (i: number): void => {
          if (i === w * h) {
            const numbers = new Int32Array((w + h) * n);
            grid.forEach((g, k) => {
              numbers[horClue((k / w) | 0, g - 1, n)]++;
              numbers[verClue(k % w, g - 1, n, h)]++;
            });
            const key = numbers.join();
            if (seen.has(key)) return;
            seen.add(key);
            if (solveAbcd(p, numbers).status === "solved") return;
            stuck++;
            expect(countGrids(p, numbers), key).toBe(2);
            return;
          }
          for (let g = 1; g <= n; g++) {
            if (i % w > 0 && grid[i - 1] === g) continue;
            if (i >= w && grid[i - w] === g) continue;
            grid[i] = g;
            fill(i + 1);
          }
        };
        fill(0);
      }
    expect(stuck).toBeGreaterThan(1000);
  });

  describeAbsentTiers(abcdGame, ["3x3n3du", "2x4n4du", "2x2n9du", "2x15n5Ddu"]);
  // Hidden clues give the smallest boards, and the two-wide ones under the
  // rule against diagonal touching, the tier they lack with every clue
  // showing; and the smallest sizes found to carry it with them all.
  describeDealtTiers(abcdGame, [
    "3x3n3Rdu",
    "2x2n3Rdu",
    "2x15n5DRdu",
    "3x4n4du",
    "4x4n3du",
  ]);
  // The largest board of each kind the bound admits.
  describeDealtTiers(
    abcdGame,
    ["10x10n3du", "8x8n4du", "7x8n8du", "9x9n5Ddu", "8x9n6Ddu", "4x14n7Ddu"],
    { seldom: true },
  );

  const refusal = (id: string) =>
    paramsError(abcdGame, abcdGame.decodeParams(id), true);

  it.each([
    "10x10n3du",
    "3x33n3du",
    "8x8n4du",
    "7x8n5du",
    "4x14n9du",
    "9x9n5Ddu",
    "8x9n6Ddu",
    "8x8n9Ddu",
    "4x14n7Ddu",
    "8x8n4Rdu",
  ])("%s is inside the bound on Unreasonable boards", (id) => {
    expect(refusal(id)).toBeNull();
  });

  it.each([
    // Each is dealt at Easy, and takes seconds or is never found here.
    "10x11n3du",
    "3x40n3du",
    "8x9n4du",
    "8x8n5du",
    "8x8n9du",
    "9x10n5Ddu",
    "9x9n6Ddu",
    "6x11n9Ddu",
    "4x15n7Ddu",
    "8x9n4Rdu",
  ])("%s is refused at Unreasonable and dealt at Easy", (id) => {
    expect(refusal(id)).toMatch(/no Unreasonable ABCD puzzle/);
    expect(refusal(id.replace("du", "de"))).toBeNull();
  });
});

describe("a pasted ABCD board", () => {
  const load = (id: string) => {
    const me = new Midend(abcdGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`4x4n4:${NEEDS_SEARCH}`)).toBe("4x4n4du");
    expect(load(`4x4n4de:${NEEDS_SEARCH}`)).toBe("4x4n4du");
    expect(load(`4x4n4du:${NEEDS_SEARCH}`)).toBe("4x4n4du");
  });

  it("that the ladder finishes opens as Easy", () => {
    expect(load(`4x4n4:${LADDER_FINISHES}`)).toBe("4x4n4de");
    expect(load(`4x4n4de:${LADDER_FINISHES}`)).toBe("4x4n4de");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`3x3n3:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x3n3du:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`2x2n3:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable ABCD board", () => {
  it("stops where the ladder does, and goes on from a letter tried rightly", () => {
    const p = sized(4, 4, 4, DIFF_UNREASONABLE);
    const me = new Midend(abcdGame);
    expect(me.newGameFromId(`4x4n4du:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const ui = newUi(state);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (
        let plan = abcdGame.hint?.(state, undefined, ui);
        plan?.ok;
        plan = abcdGame.hint?.(state, undefined, ui)
      )
        for (const step of plan.steps) {
          state = abcdGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    expect(followHint()).toBeGreaterThan(0);
    expect(status(state)).toBe("ongoing");
    expect(abcdGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    const open = state.grid.indexOf(EMPTY);
    const at = { x: open % 4, y: Math.floor(open / 4) };
    const right = (answer.solution[open] as number) - 1;
    const wrong = (right + 1) % 4;
    // A letter tried wrongly is what the mistake check is there to catch.
    const tried = abcdGame.executeMove(state, { type: "enter", ...at, letter: wrong });
    expect(abcdGame.findMistakes?.(tried)).toEqual([{ ...at, kind: "cell" }]);

    // Trying letters rightly, one empty cell at a time, the hint finishes it.
    for (let tries = 0; status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(16);
      const i = state.grid.indexOf(EMPTY);
      const move = {
        type: "enter",
        x: i % 4,
        y: Math.floor(i / 4),
        letter: (answer.solution[i] as number) - 1,
      } as const;
      state = abcdGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(status(state)).toBe("solved");
  });
});
