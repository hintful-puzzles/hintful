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

import { DIFF_EASY, dealUnreasonable } from "../../engine/answer-search.ts";
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
  const attempt = retryLimit(`abcd: generation (${p.w}x${p.h} n${p.n})`);
  let numbers: Int32Array;
  do {
    attempt();
    numbers = drawClues(p, rng);
  } while (!deduced(numbers));
  if (p.removenums) hideClues(numbers, rng, deduced);
  return numbers;
}

/**
 * An Unreasonable board: one answer, which the ladder does not reach.
 *
 * With every clue showing, that is a fill the ladder stops short on and the
 * search proves has one answer. With clues to hide, the fill need only have
 * one answer the search proves as it is dealt, since hiding is what stops the
 * ladder, as it does on most. That holds a board with clues hidden to about
 * what the harder boards without need.
 */
function unreasonableClues(p: AbcdParams, rng: RandomState): Int32Array {
  return dealUnreasonable<Int32Array>({
    label: `abcd: Unreasonable generation (${p.w}x${p.h} n${p.n})`,
    draw: () => drawClues(p, rng),
    strip: p.removenums ? (numbers, one) => hideClues(numbers, rng, one) : undefined,
    deduced: (numbers) => solveAbcd(p, numbers).status === "solved",
    answer: (numbers, budget) => searchAnswers(p, numbers, budget),
  });
}

export function newAbcdDesc(p: AbcdParams, rng: RandomState): { desc: string } {
  const numbers = p.diff === DIFF_EASY ? easyClues(p, rng) : unreasonableClues(p, rng);
  // The comma-terminated clue list, `-` for a hidden clue.
  return { desc: Array.from(numbers, (v) => `${v === NO_NUMBER ? "-" : v},`).join("") };
}
