/**
 * Mosaic's deduction: what follows from the numbers and the squares decided
 * so far, one firing at a time. The solver and the search run it to where it
 * stops (`solver.ts`), and the hint narrates each firing (`hint.ts`), so the
 * two cannot disagree about which boards deduction finishes.
 *
 * Two ideas. A number alone: it has its shaded squares, or needs every square
 * it has left (upstream's `solve_cell`). Two numbers whose blocks overlap:
 * they differ only by the squares one counts and the other does not, so where
 * the first needs as many more than the second as it has empty squares the
 * second does not count, those are all shaded and the second's own are all
 * clear. Upstream has no such comparison, and deals only boards the first idea
 * finishes.
 */

import type { Deduced } from "../../engine/answer-search.ts";
import {
  countAround,
  type MosaicBoard,
  STATE_BLANK,
  STATE_MARKED,
  STATE_UNMARKED,
} from "./state.ts";

/** The deduction's four steps, simplest first. */
export const MOSAIC_RUNGS = ["met", "needsAll", "needsMore", "sameNeed"] as const;
export type MosaicRung = (typeof MOSAIC_RUNGS)[number];

/**
 * One step of the deduction: `cells`, all empty, all take {@link markOf} the
 * rung. Squares and numbers are indices into the board.
 *
 * - `met`: `clue` has its shaded squares, so the rest of its block is clear.
 * - `needsAll`: `clue` needs every square it has left, so they are shaded.
 * - `needsMore`: `clue` needs `by` more shaded squares than `other` does, and
 *   has `by` empty squares outside `other`'s block: `cells`, which are shaded.
 * - `sameNeed`: `clue` and `other` need the same number more, and `clue` has
 *   no empty square outside `other`'s block, so `other`'s empty squares
 *   outside `clue`'s, `cells`, are clear.
 */
export type Firing =
  | {
      readonly rung: "met" | "needsAll";
      readonly clue: number;
      readonly cells: number[];
    }
  | {
      readonly rung: "needsMore" | "sameNeed";
      readonly clue: number;
      readonly other: number;
      readonly cells: number[];
      /** The shaded squares `clue` still needs. */
      readonly need: number;
      /** How many more that is than `other` needs: none for `sameNeed`. */
      readonly by: number;
    };

/** The mark a rung gives its squares. */
export function markOf(rung: MosaicRung): number {
  return rung === "met" || rung === "sameNeed" ? STATE_BLANK : STATE_MARKED;
}

/** Where a number whose block overlaps another's can lie from it, nearest
 * first: a pair side by side is the easiest for a player to see, so it is the
 * one found where several would do. */
const BESIDE: readonly (readonly [dx: number, dy: number])[] = (() => {
  const out: [number, number][] = [];
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) if (dx !== 0 || dy !== 0) out.push([dx, dy]);
  const far = ([dx, dy]: [number, number]) =>
    10 * Math.max(Math.abs(dx), Math.abs(dy)) + Math.abs(dx) + Math.abs(dy);
  return out.sort((p, q) => far(p) - far(q));
})();

/** The empty squares of the block of `a`, or of those only the ones outside
 * the block of `b`: their count, and into `into` the squares themselves. */
function emptyOf(
  board: MosaicBoard,
  grid: Uint8Array,
  a: number,
  b: number | null,
  into: number[] | null = null,
): number {
  const { width: w, height: h } = board;
  const ax = a % w;
  const ay = Math.floor(a / w);
  const bx = b === null ? ax : b % w;
  const by = b === null ? ay : Math.floor(b / w);
  let count = 0;
  for (let y = Math.max(0, ay - 1); y <= Math.min(h - 1, ay + 1); y++)
    for (let x = Math.max(0, ax - 1); x <= Math.min(w - 1, ax + 1); x++) {
      if (grid[y * w + x] !== STATE_UNMARKED) continue;
      if (b !== null && Math.abs(x - bx) <= 1 && Math.abs(y - by) <= 1) continue;
      count++;
      into?.push(y * w + x);
    }
  return count;
}

function squares(
  board: MosaicBoard,
  grid: Uint8Array,
  a: number,
  b: number | null,
): number[] {
  const out: number[] = [];
  emptyOf(board, grid, a, b, out);
  return out;
}

/** What the number at `i` decides alone. */
function alone(
  board: MosaicBoard,
  grid: Uint8Array,
  i: number,
): Firing | "contradiction" | null {
  const { width: w, height: h, clues } = board;
  const n = clues[i] as number;
  const { marked, blank, total } = countAround(w, h, grid, i % w, Math.floor(i / w));
  // Said of a block with squares still empty too: a search has to be told of
  // a wrong assumption as it happens.
  if (marked > n || total - blank < n) return "contradiction";
  if (marked + blank === total) return null;
  const rung = marked === n ? "met" : total - blank === n ? "needsAll" : null;
  return rung && { rung, clue: i, cells: squares(board, grid, i, null) };
}

/** What the number at `a` decides with a number whose block overlaps its own.
 * Asked only where no number decides anything alone. */
function beside(
  board: MosaicBoard,
  grid: Uint8Array,
  a: number,
): Firing | "contradiction" | null {
  const { width: w, height: h, clues } = board;
  const ax = a % w;
  const ay = Math.floor(a / w);
  const tallyA = countAround(w, h, grid, ax, ay);
  if (tallyA.marked + tallyA.blank === tallyA.total) return null;
  const needA = (clues[a] as number) - tallyA.marked;
  for (const [dx, dy] of BESIDE) {
    const ox = ax + dx;
    const oy = ay + dy;
    if (ox < 0 || ox >= w || oy < 0 || oy >= h) continue;
    const b = oy * w + ox;
    if ((clues[b] as number) < 0) continue;
    const tallyB = countAround(w, h, grid, ox, oy);
    if (tallyB.marked + tallyB.blank === tallyB.total) continue;
    const needB = (clues[b] as number) - tallyB.marked;
    const onlyA = emptyOf(board, grid, a, b);
    const onlyB = emptyOf(board, grid, b, a);
    // The shaded squares only `a` counts, less those only `b` counts: the
    // squares both count cancel.
    const more = needA - needB;
    for (const [clue, other, need, by, only] of [
      [a, b, needA, more, onlyA],
      [b, a, needB, -more, onlyB],
    ] as const) {
      // Wrong only as a pair: a search is spared the positions it would take
      // to find that out a number at a time.
      if (by > only) return "contradiction";
      if (by !== only || onlyA + onlyB === 0) continue;
      const cells =
        by > 0 ? squares(board, grid, clue, other) : squares(board, grid, other, clue);
      return { rung: by > 0 ? "needsMore" : "sameNeed", clue, other, need, by, cells };
    }
  }
  return null;
}

/**
 * Deduce on `grid`, each square's mark, in place, until nothing more follows,
 * telling `fired` of each step as it is taken. `"solved"` is every square
 * decided and every number met.
 *
 * A number is asked again whenever a square of its block is decided, alone
 * first: two numbers are compared only where no number decides anything by
 * itself, so a plan uses the comparison only where it is needed.
 *
 * `since` is for a grid the deduction already stopped on, with one square
 * decided after: that square, so that only the numbers counting it are asked
 * to begin with. A search tries a board's positions this way, each one square
 * on from a stop.
 */
export function deduce(
  board: MosaicBoard,
  grid: Uint8Array,
  fired: ((firing: Firing) => void) | null = null,
  since: number | null = null,
): Deduced {
  const { width: w, height: h, clues } = board;
  /** The numbers still to ask, alone and beside another, and which are in. */
  const single: number[] = [];
  const paired: number[] = [];
  const inSingle = new Uint8Array(clues.length);
  const inPaired = new Uint8Array(clues.length);
  const ask = (i: number): void => {
    if ((clues[i] as number) < 0) return;
    if (!inSingle[i]) {
      inSingle[i] = 1;
      single.push(i);
    }
    if (!inPaired[i]) {
      inPaired[i] = 1;
      paired.push(i);
    }
  };
  /** Ask every number that counts square `c`. */
  const askAround = (c: number): void => {
    const cx = c % w;
    const cy = Math.floor(c / w);
    for (let y = Math.max(0, cy - 1); y <= Math.min(h - 1, cy + 1); y++)
      for (let x = Math.max(0, cx - 1); x <= Math.min(w - 1, cx + 1); x++)
        ask(y * w + x);
  };
  if (since === null) for (let i = 0; i < clues.length; i++) ask(i);
  else askAround(since);

  let s = 0;
  let p = 0;
  for (;;) {
    let firing: Firing | "contradiction" | null;
    if (s < single.length) {
      const i = single[s++] as number;
      inSingle[i] = 0;
      firing = alone(board, grid, i);
    } else if (p < paired.length) {
      const i = paired[p++] as number;
      inPaired[i] = 0;
      firing = beside(board, grid, i);
      // It may decide more with another number yet.
      if (firing !== null && firing !== "contradiction") {
        inPaired[i] = 1;
        paired.push(i);
      }
    } else break;
    if (firing === null) continue;
    if (firing === "contradiction") return "contradiction";
    fired?.(firing);
    const mark = markOf(firing.rung);
    for (const c of firing.cells) {
      grid[c] = mark;
      askAround(c);
    }
  }
  return grid.includes(STATE_UNMARKED) ? "stuck" : "solved";
}
