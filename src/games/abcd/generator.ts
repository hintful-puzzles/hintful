/**
 * ABCD board generation — idiomatic port of `new_game_desc` (`abcd.c`).
 *
 * Fill the grid with random legal letters, and accept the fill only if the
 * deductive solver drives its clue counts to a unique solution; otherwise
 * retry. If `removenums`, greedily hide clues (in a shuffled order) while the
 * puzzle stays uniquely solvable. That is an Easy board, and upstream's only
 * kind. An Unreasonable one is a fill with one answer that the solver does
 * not reach, which the search in `solver.ts` proves.
 *
 * The Easy pass reproduces the C desc byte-for-byte: the RNG surface is exactly one
 * `randomUpto` per fill cell plus, for hard mode, one `shuffle` of the clue
 * indices, and `solveAbcd` is deterministic. Because every accept/reject and
 * every clue removal is solver-gated, the differential's one byte-match
 * validates the fill order, the solver's every verdict and the codec together.
 *
 * Large boards can take many attempts; `validateParams`' size bound keeps a
 * player off the ones that never generate.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { placeLetter, searchAnswers, solveAbcd } from "./solver.ts";
import {
  type AbcdParams,
  cuboid,
  EMPTY,
  horClue,
  NO_NUMBER,
  verClue,
} from "./state.ts";

/**
 * ABCD's larger boards legitimately need far more attempts than the house
 * default. Sized against what `validateParams`' `MAX_GENERABLE_AREA` admits:
 * the slowest admitted configuration measured is 8×9 n5 at 1 acceptance in
 * 30,788, so 250,000 attempts leaves it a ~0.03% chance of exhausting the
 * budget, and every other admitted configuration is far safer. A firing here is
 * therefore a defect, as `retryLimit` assumes, not a board a player
 * legitimately asked for: the size bound, not this cap, keeps a player off an
 * ungenerable board.
 */
const ABCD_MAX_ATTEMPTS = 250_000;

/** The clue counts of one random fill, in reading order. `placeLetter` (no
 * `remaining`) keeps the partial grid no-touch-legal, so every cell always has
 * a candidate and the fill never dead-ends. */
function drawClues(p: AbcdParams, rng: RandomState): Int32Array {
  const { w, h, n } = p;
  const grid = new Int8Array(w * h).fill(EMPTY);
  const cube = new Uint8Array(w * h * n).fill(1); // all candidates open
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const letters: number[] = [];
      for (let i = 0; i < n; i++) if (cube[cuboid(x, y, i, n, w)]) letters.push(i);
      placeLetter(p, grid, cube, x, y, letters[randomUpto(rng, letters.length)]);
    }
  }

  const numbers = new Int32Array((w + h) * n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const letter = grid[y * w + x] - 1;
      numbers[horClue(y, letter, n)]++;
      numbers[verClue(x, letter, n, h)]++;
    }
  }
  return numbers;
}

/** Hide clues one at a time in a shuffled order, each only while `keeps`
 * still holds of what is left. */
function hideClues(
  numbers: Int32Array,
  rng: RandomState,
  keeps: (numbers: Int32Array) => boolean,
): void {
  const indices = Array.from(numbers, (_, i) => i);
  shuffle(indices, rng);
  for (const idx of indices) {
    const clue = numbers[idx];
    numbers[idx] = NO_NUMBER;
    if (!keeps(numbers)) numbers[idx] = clue; // put it back
  }
}

/** An Easy board, as upstream deals it: a fill whose clues the ladder solves,
 * with clues then hidden while it still does. */
function easyClues(p: AbcdParams, rng: RandomState): Int32Array {
  const deduced = (numbers: Int32Array) => solveAbcd(p, numbers).status === "solved";
  const attempt = retryLimit(
    `abcd: generation (${p.w}x${p.h} n${p.n})`,
    ABCD_MAX_ATTEMPTS,
  );
  let numbers: Int32Array;
  do {
    attempt();
    numbers = drawClues(p, rng);
  } while (!deduced(numbers));
  if (p.removenums) hideClues(numbers, rng, deduced);
  return numbers;
}

/**
 * The squares an Unreasonable deal may fill before it gives up, so a larger
 * board is given fewer fills: a fill of a small board costs microseconds and
 * of a large one milliseconds. The rarest size `validateParams` admits is
 * 7x8 with eight letters, one fill in about 600, which this gives 10,700.
 *
 * Running out is not a defect here as it is at Easy. Between the sizes proved
 * to have no such board and the ones that deal at once are small ones nobody
 * has enumerated at every letter count (3x6 with three letters has none), and
 * a player who asks for one waits a second or two and is told none was found.
 */
const UNREASONABLE_SQUARES = 600_000;

/**
 * The positions the search may try when a clue is hidden from an Unreasonable
 * board, far under the 2,000 it has by default. Hiding stops only when the search
 * can no longer prove one answer, so it runs every board up to whatever the
 * search is allowed: under the full budget a 6x6 came out needing a median of
 * 1,728 positions, where a board with every clue showing needs 9. This holds
 * a board with clues hidden to about what the harder boards without need.
 */
const HIDING_BUDGET = 30;

/**
 * An Unreasonable board: one answer, which the ladder does not reach.
 *
 * With every clue showing, that is a fill the ladder stops short on and the
 * search proves has one answer. With clues to hide, the fill need only have
 * one answer, since hiding is what stops the ladder: clues go while the
 * search still proves one within {@link HIDING_BUDGET}, and the board is kept
 * if the ladder then stops short, as it does on most.
 */
function unreasonableClues(p: AbcdParams, rng: RandomState): Int32Array {
  const deduced = (numbers: Int32Array) => solveAbcd(p, numbers).status === "solved";
  const one = (numbers: Int32Array, budget?: number) =>
    searchAnswers(p, numbers, budget).kind === "one";
  const attempt = retryLimit(
    `abcd: Unreasonable generation (${p.w}x${p.h} n${p.n})`,
    Math.ceil(UNREASONABLE_SQUARES / (p.w * p.h)),
  );
  for (;;) {
    attempt();
    const numbers = drawClues(p, rng);
    if (!p.removenums) {
      if (!deduced(numbers) && one(numbers)) return numbers;
      continue;
    }
    if (!one(numbers, HIDING_BUDGET)) continue;
    hideClues(numbers, rng, (left) => one(left, HIDING_BUDGET));
    if (!deduced(numbers)) return numbers;
  }
}

export function newAbcdDesc(p: AbcdParams, rng: RandomState): { desc: string } {
  const numbers = p.diff === DIFF_EASY ? easyClues(p, rng) : unreasonableClues(p, rng);
  // The comma-terminated clue list, `-` for a hidden clue.
  return { desc: Array.from(numbers, (v) => `${v === NO_NUMBER ? "-" : v},`).join("") };
}
