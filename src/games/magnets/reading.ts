/**
 * What the board says about a square that a player can read straight off it:
 * the placed poles, the `?` marks and the clue counts, and nothing else.
 *
 * The solver keeps three "cannot be" bits per square and the game lets a player
 * write only one of them, the `?` (cannot be neutral, which is a fact about the
 * whole domino). The other two never need a mark, because every writer of them
 * is a rule over things already on the board: a placed pole rules its own sign
 * out of its neighbors, a line whose count is met (counting the magnets marked
 * `?` along it) rules that sign out of its other squares, and a domino's ends
 * are opposite poles, so ruling + out of one end rules − out of the other.
 * `magnets-reading.test.ts` holds every bit the solver ever sets to that claim.
 *
 * So a hint citing "this square can't be +" cites a fact the player can check,
 * and {@link whyNot} is where the sentence finds out why.
 */

import type { MagnetsLine } from "./solver.ts";
import {
  COLUMN,
  GS_NOTNEUTRAL,
  GS_SET,
  inGrid,
  type MagnetsCommon,
  NEGATIVE,
  opposite,
  POSITIVE,
  ROW,
} from "./state.ts";

/** What the reading needs: a game state, or the solver's scratch. */
export interface ReadableBoard {
  readonly w: number;
  readonly h: number;
  readonly common: MagnetsCommon;
  readonly grid: ArrayLike<number>;
  readonly flags: ArrayLike<number>;
}

/** Why a square cannot hold a pole, in terms the board shows. */
export type NotReason =
  /** An orthogonal neighbor already holds that pole. */
  | { kind: "touch"; at: number }
  /**
   * The line's clue for that pole is met: `placed` of them are on the board and
   * each of the `magnets` (a marked magnet lying along the line, named by its
   * first square) brings one more.
   */
  | { kind: "full"; line: MagnetsLine; placed: number; magnets: number[] }
  /** The domino's other end cannot hold the opposite pole. */
  | { kind: "partner"; at: number; inner: NotReason };

const ORTHO = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

const isSet = (b: ReadableBoard, i: number): boolean => (b.flags[i] & GS_SET) !== 0;

/** An undecided square the player has marked as half of a magnet. */
const isMarkedMagnet = (b: ReadableBoard, i: number): boolean =>
  !isSet(b, i) && (b.flags[i] & GS_NOTNEUTRAL) !== 0;

/** The squares of a line, in order. */
export function lineCells(b: ReadableBoard, line: MagnetsLine): number[] {
  const out: number[] = [];
  if (line.roworcol === ROW) {
    for (let x = 0; x < b.w; x++) out.push(line.num * b.w + x);
  } else {
    for (let y = 0; y < b.h; y++) out.push(y * b.w + line.num);
  }
  return out;
}

/** The line's clue for `which`: its + or − count, its neutral count, or −1. */
export function lineTarget(b: ReadableBoard, line: MagnetsLine, which: number): number {
  const counts = line.roworcol === ROW ? b.common.rowcount : b.common.colcount;
  return counts[line.num * 3 + which];
}

/** How many of the line's squares are placed as `which`. */
export function placedIn(b: ReadableBoard, line: MagnetsLine, which: number): number {
  return lineCells(b, line).filter((i) => isSet(b, i) && b.grid[i] === which).length;
}

/**
 * The marked magnets lying wholly along a line (each named by its first
 * square), leaving out the domino holding `except`. Each brings exactly one +
 * and one − to the line, whichever way round it turns out to be.
 */
function magnetsAlong(b: ReadableBoard, line: MagnetsLine, except: number): number[] {
  const cells = lineCells(b, line);
  const on = new Set(cells);
  return cells.filter((i) => {
    const j = b.common.dominoes[i];
    return j > i && on.has(j) && i !== except && j !== except && isMarkedMagnet(b, i);
  });
}

/** Why square `i` cannot hold `which`, from the square itself. */
function directly(b: ReadableBoard, i: number, which: number): NotReason | null {
  const x = i % b.w;
  const y = Math.floor(i / b.w);
  for (const [dx, dy] of ORTHO) {
    const n = (y + dy) * b.w + (x + dx);
    if (inGrid(b.w, b.h, x + dx, y + dy) && isSet(b, n) && b.grid[n] === which) {
      return { kind: "touch", at: n };
    }
  }
  for (const line of [
    { roworcol: ROW, num: y },
    { roworcol: COLUMN, num: x },
  ]) {
    const target = lineTarget(b, line, which);
    if (target < 0) continue;
    const placed = placedIn(b, line, which);
    const magnets = magnetsAlong(b, line, i);
    if (placed + magnets.length === target) {
      return { kind: "full", line, placed, magnets };
    }
  }
  return null;
}

/**
 * Why the board says square `i` cannot hold pole `which`, or `null` when it
 * does not say so. The square's own reasons come first; failing those, its
 * domino's other end cannot hold the opposite pole.
 */
export function whyNot(b: ReadableBoard, i: number, which: number): NotReason | null {
  if (which !== POSITIVE && which !== NEGATIVE) {
    throw new Error("magnets whyNot: only a pole is read this way");
  }
  const own = directly(b, i, which);
  if (own) return own;
  const j = b.common.dominoes[i];
  if (j === i) return null;
  const inner = directly(b, j, opposite(which));
  return inner ? { kind: "partner", at: j, inner } : null;
}
