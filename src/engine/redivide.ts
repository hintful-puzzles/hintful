/**
 * Dividing a few neighboring regions of a division again, for a generator
 * that mends a division where it fails and does not throw it away.
 *
 * A division is each cell's region, as a label that says only which cells
 * share one, and every region holds `k` cells.
 */

import { DX, DY, outOfBounds } from "./border-grid.ts";
import { type RandomState, randomUpto } from "./random/index.ts";

/** A grid divided into regions of `k`. */
export interface DivisionShape {
  w: number;
  h: number;
  k: number;
}

/** The cells across each edge of `i` that is not on the rim. */
export function adjacentCells(p: { w: number; h: number }, i: number): number[] {
  const out: number[] = [];
  const x = i % p.w;
  const y = Math.floor(i / p.w);
  for (let dir = 0; dir < 4; dir++) {
    const xx = x + DX[dir];
    const yy = y + DY[dir];
    if (!outOfBounds(xx, yy, p.w, p.h)) out.push(yy * p.w + xx);
  }
  return out;
}

/** Whether `cells` are one connected piece. */
function connected(p: DivisionShape, cells: number[]): boolean {
  const left = new Set(cells);
  const stack = [cells[0]];
  left.delete(cells[0]);
  for (let i = stack.pop(); i !== undefined; i = stack.pop()) {
    for (const j of adjacentCells(p, i)) if (left.delete(j)) stack.push(j);
  }
  return left.size === 0;
}

/** The tries at one piece before a re-division is given up. Most pieces
 * grown at random leave the rest in two parts. */
const PEEL_TRIES = 20;

/**
 * A connected piece of `k` cells of `pool`, grown at random from a random
 * cell, whose removal leaves the rest connected. Null if no try gave one.
 * `pool` is connected and holds more than `k` cells, so a piece short of `k`
 * always has a cell of the pool beside it.
 *
 * A `ringless` piece takes only a cell beside one of its own, so that no four
 * of its cells are a square and none go round a cell outside it: its cells
 * joined edge to edge are a tree. Such a piece can have nowhere to grow.
 */
function peel(
  p: DivisionShape,
  pool: number[],
  rng: RandomState,
  ringless: boolean,
): number[] | null {
  for (let tries = 0; tries < PEEL_TRIES; tries++) {
    const piece = new Set([pool[randomUpto(rng, pool.length)]]);
    for (let size = 1; size < p.k; size++) {
      // A cell beside two of the piece is listed twice, and so likelier.
      let beside = [...piece]
        .flatMap((i) => adjacentCells(p, i))
        .filter((j) => pool.includes(j) && !piece.has(j));
      if (ringless)
        beside = beside.filter((j) => beside.indexOf(j) === beside.lastIndexOf(j));
      if (beside.length === 0) break;
      piece.add(beside[randomUpto(rng, beside.length)]);
    }
    if (
      piece.size === p.k &&
      connected(
        p,
        pool.filter((i) => !piece.has(i)),
      )
    )
      return [...piece];
  }
  return null;
}

/**
 * Divide the cells of the regions `ids`, which are connected, among them
 * again at random. False if it could not, with `regions` left part-written.
 * With `ringless`, every region but the last is grown as a tree; the last is
 * what the others leave, and may not be one.
 */
export function redivide(
  p: DivisionShape,
  regions: Int32Array,
  ids: readonly number[],
  rng: RandomState,
  ringless = false,
): boolean {
  let pool: number[] = [];
  regions.forEach((region, i) => {
    if (ids.includes(region)) pool.push(i);
  });
  // The last region is what the others leave.
  for (const id of ids.slice(0, -1)) {
    const piece = peel(p, pool, rng, ringless);
    if (piece === null) return false;
    for (const i of piece) regions[i] = id;
    pool = pool.filter((i) => !piece.includes(i));
  }
  for (const i of pool) regions[i] = ids[ids.length - 1];
  return true;
}

/** The regions with a cell beside one of `ids`, those apart. */
export function regionsBeside(
  p: DivisionShape,
  regions: Int32Array,
  ids: readonly number[],
): number[] {
  const beside = new Set<number>();
  regions.forEach((region, i) => {
    if (!ids.includes(region)) return;
    for (const j of adjacentCells(p, i))
      if (!ids.includes(regions[j])) beside.add(regions[j]);
  });
  return [...beside];
}
