/**
 * Mending a division into regions until a game's deductions finish it, for a
 * board whose regions are its only clue. Such a division dealt at random
 * seldom has one answer (a random 8x8 one-star Star Battle division almost
 * never does), so the generator moves single cells between regions
 * that are there, keeping each region connected and no smaller than a least
 * size, until it has.
 *
 * The game says what its deductions leave open, what second answers its
 * search meets, and whether its easier tier finishes the board too. The
 * answer the board is dealt for is the game's: it holds the cells that carry
 * it still, so that the answer fits the regions before and after.
 */

import { type RandomState, randomUpto } from "./random/index.ts";
import { adjacentCells } from "./redivide.ts";

/** What the game's deductions, capped at the tier asked for, make of the
 * division as it stands. */
export interface MendReading<Position> {
  /** The cells they leave undecided, in reading order. */
  readonly open: readonly number[];
  /** Where they stopped, which {@link MendJudge.others} searches from. */
  readonly position: Position;
}

/** The game's judge of a division, read again after every move. */
export interface MendJudge<Position> {
  /** The deductions capped at the tier asked for. */
  deduce(): MendReading<Position>;
  /**
   * Second answers a search from `position` meets, none where it meets none.
   * Each is the cells at which moving a cell to another region breaks it, in
   * reading order: for a board of placed things, where that answer places
   * them, so that one region holds one too many and the other one too few.
   */
  others(position: Position): number[][];
  /** Whether the deductions a tier lower finish the division too; `null` at
   * the lowest tier, which no board is too easy for. */
  readonly tooEasy: (() => boolean) | null;
}

export interface DivisionMend<Position> {
  readonly grid: { readonly w: number; readonly h: number };
  /** Each cell's region, changed in place. */
  readonly regions: Int32Array;
  /** The cells that never move: where the dealt answer has what a region
   * counts. */
  readonly fixed: ReadonlySet<number>;
  /** The fewest cells a region may be left with. */
  readonly smallest: number;
  readonly judge: MendJudge<Position>;
  readonly rng: RandomState;
  /** The moves made toward a board, over every draw of one deal, which this
   * adds to. A board the easier tier finishes too walks on for as many. */
  readonly spent: { moves: number };
}

/** The moves of a cell at one board before it is given up, for each cell of
 * its area. A board that needs more is going round in circles. */
const MENDS_PER_CELL = 2;

/** The moves a board may make without leaving fewer cells open than it ever
 * has before it is given up: a fresh draw comes right sooner than one that
 * has stopped coming closer (measured on Star Battle). */
const STALL = 30;

/** After a search that met no second answer, the moves that may go by
 * without one leaving fewer cells open before the search is asked again. The
 * search is the costly part of a move, and a board it found nothing in
 * seldom gains a second answer from a cell the deductions left open. */
const QUIET = 20;

/** Whether the region of `cell` is still one piece, and no smaller than
 * `smallest`, without it. */
function sparable(m: DivisionMend<unknown>, cell: number): boolean {
  const { regions } = m;
  const rest: number[] = [];
  regions.forEach((r, i) => {
    if (r === regions[cell] && i !== cell) rest.push(i);
  });
  if (rest.length < m.smallest) return false;
  const left = new Set(rest);
  const stack = [rest[0]];
  left.delete(rest[0]);
  for (let i = stack.pop(); i !== undefined; i = stack.pop())
    for (const j of adjacentCells(m.grid, i)) if (left.delete(j)) stack.push(j);
  return left.size === 0;
}

/**
 * Change `m.regions` until the judge's deductions finish the board and the
 * easier tier's do not, and say whether that was reached.
 *
 * Each pass takes one cell that is not fixed into a region beside it, the
 * regions staying connected. Where the board has another answer the cell is
 * one the judge says breaks it. Where it has none, the cell is one the
 * deductions left open, and the move is kept unless it leaves more cells open
 * than before.
 *
 * A board the easier tier finishes too takes moves that keep it finished
 * until the easier tier stops on it, for as many moves as the deal has made
 * toward a board that comes right: past that, starting again is as cheap.
 * Where a board is quick to come right that is soon, and where it is slow, a
 * board that came right is worth a long walk.
 */
export function mendDivision<Position>(m: DivisionMend<Position>): boolean {
  const { grid, regions, fixed, judge, rng, spent } = m;
  const cells = grid.w * grid.h;

  /** Each way to take one of `from` into a region beside it. */
  const waysFrom = (from: Iterable<number>): [cell: number, to: number][] => {
    const ways: [cell: number, to: number][] = [];
    for (const cell of from) {
      if (fixed.has(cell) || !sparable(m, cell)) continue;
      for (const j of adjacentCells(grid, cell))
        if (regions[j] !== regions[cell]) ways.push([cell, regions[j]]);
    }
    return ways;
  };

  /** Move a cell, and keep the move where `keep` says so of the board it
   * makes. Gives the cell where the move was kept. */
  const move = (
    ways: readonly [cell: number, to: number][],
    keep: (next: MendReading<Position>) => boolean,
  ): number | null => {
    const [cell, to] = ways[randomUpto(rng, ways.length)];
    const was = regions[cell];
    regions[cell] = to;
    const next = judge.deduce();
    if (!keep(next)) {
      regions[cell] = was;
      return null;
    }
    at = next;
    return cell;
  };

  let at = judge.deduce();
  // Second answers the search has met that still fit the regions. A move
  // breaks those it is told it breaks and leaves the rest, so the search is
  // asked only when none is left.
  let others: number[][] = [];
  // Whether the board has changed since the search was last asked. A move
  // taken back leaves the board as it was.
  let changed = true;
  // The search last met no second answer, and the moves since one last left
  // fewer cells open.
  let quiet = false;
  let sinceGain = 0;
  let fewest = at.open.length;
  let sinceFewest = 0;
  // The moves the walk toward a harder board has left.
  let walk: number | null = null;
  for (let moves = 0; moves < MENDS_PER_CELL * cells; moves++) {
    if (at.open.length === 0) {
      // A move taken back leaves the easier tier where it was.
      if (judge.tooEasy === null || (changed && !judge.tooEasy())) return true;
      walk ??= spent.moves;
      if (walk-- <= 0) return false;
      const ways = waysFrom(regions.keys());
      if (ways.length === 0) return false;
      changed = move(ways, (next) => next.open.length === 0) !== null;
      continue;
    }
    if (sinceFewest >= STALL) return false;
    spent.moves++;
    const resting = quiet && sinceGain < QUIET;
    if (changed && others.length === 0 && !resting) {
      others = judge.others(at.position);
      quiet = others.length === 0;
      sinceGain = 0;
    }
    changed = false;
    const other = others.length > 0 ? others[0] : null;
    let ways = waysFrom(other ?? at.open);
    // Another answer none of whose cells can move is broken up from
    // anywhere: the next pass meets a different one.
    if (ways.length === 0 && other) ways = waysFrom(regions.keys());
    if (ways.length === 0) {
      if (!resting) return false;
      // The open cells have nowhere to go: ask the search after all.
      sinceGain = QUIET;
      changed = true;
      continue;
    }
    const before = at.open.length;
    const cell = move(ways, (next) => other !== null || next.open.length <= before);
    sinceGain = at.open.length < before ? 0 : sinceGain + 1;
    if (cell !== null) {
      changed = true;
      others = others.filter((breaks) => !breaks.includes(cell));
    }
    if (at.open.length < fewest) {
      fewest = at.open.length;
      sinceFewest = 0;
    } else sinceFewest++;
  }
  return false;
}
