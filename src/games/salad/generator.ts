/**
 * Salad's generator — `latinGenerate` plus solver-gated clue removal.
 *
 * Both modes build a complete order-`o` Latin square (the shared RNG-faithful
 * `latinGenerate`), read its symbols above `nums` as the empty squares — a
 * cheap way to draw a random pseudo-Latin solution with exactly `o − nums`
 * empties per line — turn that into a full clue set, and then remove clues one
 * at a time in a shuffled order, keeping each removal only while the puzzle
 * still solves by pure deduction at the target difficulty. Because every
 * removal is gated on the solver's verdict, a change to the solver changes which
 * boards exist (docs/games/solver-and-generator.md § "Solver-gated generation").
 *
 * Two upstream quality rules are reproduced verbatim:
 *
 * - **Number Ball** throws the whole puzzle away when every hole can be placed
 *   without entering a single number (`DIFF_HOLESONLY`) — such a board never
 *   exercises the concept. Upstream's documentation says this mode still
 *   "doesn't create puzzles that make good use of the concept"; the solver
 *   reasons about the empties directly, which is the prerequisite it names, but
 *   a better *generator* for the mode is still unwritten.
 * - **ABC End View** below 8×8 forces an *empty* grid (border clues only), and
 *   simply retries when that is not solvable.
 */

import { latinGenerate } from "../../engine/latin.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { saladSolve } from "./solver.ts";
import {
  borderScans,
  CIRCLE,
  CROSS,
  DIFF_EASY,
  DIFF_HOLESONLY,
  GAMEMODE_NUMBERS,
  letterChar,
  type SaladBoard,
  type SaladParams,
  scanDir,
  scratchBoard,
  serialize,
  symbolChar,
} from "./state.ts";

/**
 * Runaway backstop for both generation loops, raised above the house default.
 *
 * The tier gate (`tooEasy`) makes these rejection-sampling loops, and Normal
 * boards are genuinely rare in the Number Ball mode: measured over 25 runs per
 * preset, `numbers 5x5 n3` costs a **median of 486 candidates and a worst of
 * 4,419** (`letters` modes cost 2–85). The house default of 10,000 is only ~2x
 * that worst case, so it would eventually fire on a perfectly legal seed — and
 * exhaustion throws, in a player's face. This is `retry-limit.ts`'s own "wrong
 * for a rare-but-legal seed" case; the bound stays, but far enough out that
 * reaching it means a tier has become unreachable rather than merely thin.
 */
const MAX_ATTEMPTS = 50_000;

function blankBoard(p: SaladParams): SaladBoard {
  const o2 = p.order * p.order;
  return {
    order: p.order,
    nums: p.nums,
    mode: p.mode,
    borderclues: new Uint8Array(p.order * 4),
    gridclues: new Uint8Array(o2),
    grid: new Uint8Array(o2),
    holes: new Uint8Array(o2),
  };
}

/** Does the puzzle described by `base`'s clues still solve at `diff`, from a
 * blank working board? */
function solvesAt(base: SaladBoard, diff: number): boolean {
  return saladSolve(scratchBoard(base), diff);
}

/**
 * The tier gate: a board must need the difficulty it was asked for.
 *
 * Stripping only ever makes a board harder, so the fully-stripped board is its
 * hardest form — and if *that* still falls to the tier below, the tier the
 * player chose is not the tier they got. Returns true when the candidate must
 * be thrown away.
 *
 * Upstream has no such gate: it strips clues while the board still solves at
 * the target tier and publishes whatever that leaves. Measured over this game's
 * frozen C fixtures, **12 of its 13 top-tier boards were solvable one tier
 * down**, and over 80 freshly generated boards the rate was 71/80 — at 5×5 and
 * 6×6, every single board.
 */
function tooEasy(base: SaladBoard, diff: number): boolean {
  if (diff <= DIFF_EASY) return false;
  return solvesAt(base, diff - 1);
}

/**
 * Upstream `salad_strip_clues`: walk `clues` in a shuffled order, blanking each
 * non-empty entry and putting it back if the puzzle stops solving. `clues` is
 * one of `base`'s own arrays, so the solver sees each tentative removal.
 */
function stripClues(
  base: SaladBoard,
  rs: RandomState,
  clues: Uint8Array,
  diff: number,
): void {
  const spaces: number[] = [];
  for (let i = 0; i < clues.length; i++) spaces.push(i);
  shuffle(spaces, rs);

  for (const j of spaces) {
    const temp = clues[j];
    if (temp === 0) continue;
    clues[j] = 0;
    if (!solvesAt(base, diff)) clues[j] = temp;
  }
}

/** Upstream `salad_new_numbers_desc`. */
function newNumbersDesc(p: SaladParams, rs: RandomState): string {
  const o = p.order;
  const o2 = o * o;
  const nums = p.nums;
  const diff = p.diff;
  const attempt = retryLimit("salad: Number Ball generation", MAX_ATTEMPTS);

  for (;;) {
    attempt();
    const square = latinGenerate(o, rs);
    const base = blankBoard(p);
    const gridclues = base.gridclues;
    for (let i = 0; i < o2; i++) {
      gridclues[i] = square[i] > nums ? CROSS : square[i];
    }

    const spaces: number[] = [];
    for (let i = 0; i < o2; i++) spaces.push(i);
    shuffle(spaces, rs);

    for (const j of spaces) {
      let temp = gridclues[j];
      if (temp === 0) continue;

      // Weaken first: a hole or a bare ball goes away entirely, a numbered ball
      // drops to a bare ball ("something lives here, but not which symbol").
      gridclues[j] = temp === CROSS || temp === CIRCLE ? 0 : CIRCLE;
      if (!solvesAt(base, diff)) {
        gridclues[j] = temp;
        continue;
      }

      // Then try to remove what is left of it.
      temp = gridclues[j];
      if (temp === 0) continue;
      gridclues[j] = 0;
      if (!solvesAt(base, diff)) gridclues[j] = temp;
    }

    // Quality check: reject a board whose holes all fall out with no number
    // entered at all.
    if (solvesAt(base, DIFF_HOLESONLY)) continue;
    // Tier gate: it must *need* the difficulty requested.
    if (tooEasy(base, diff)) continue;
    return serialize(gridclues, (v) => symbolChar(GAMEMODE_NUMBERS, v));
  }
}

/** Upstream `salad_new_letters_desc`. */
function newLettersDesc(p: SaladParams, rs: RandomState): string {
  const o = p.order;
  const o2 = o * o;
  const nums = p.nums;
  const diff = p.diff;
  // Quality check: with a small grid, force the puzzle to be border-clues-only.
  const nogrid = o < 8;
  const attempt = retryLimit("salad: ABC End View generation", MAX_ATTEMPTS);

  for (;;) {
    attempt();
    const square = latinGenerate(o, rs);
    const base = blankBoard(p);
    const { gridclues, borderclues } = base;
    for (let i = 0; i < o2; i++) {
      gridclues[i] = square[i] <= nums ? square[i] : CROSS;
    }

    // Derive every border clue from the full solution.
    for (let i = 0; i < o; i++) {
      for (const s of borderScans(i, o)) {
        borderclues[s.clue] = scanDir(gridclues, null, s.start, s.step, s.end, false);
      }
    }

    if (nogrid) {
      gridclues.fill(0);
      if (!solvesAt(base, diff)) continue;
    } else {
      stripClues(base, rs, gridclues, diff);
    }
    stripClues(base, rs, borderclues, diff);

    // Tier gate: it must *need* the difficulty requested.
    if (tooEasy(base, diff)) continue;

    return `${serialize(borderclues, letterChar)},${serialize(gridclues, letterChar)}`;
  }
}

export function newSaladDesc(p: SaladParams, rng: RandomState): { desc: string } {
  return {
    desc: p.mode === GAMEMODE_NUMBERS ? newNumbersDesc(p, rng) : newLettersDesc(p, rng),
  };
}
