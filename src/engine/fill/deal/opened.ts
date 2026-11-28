/**
 * First cells laid on what an opening leaves (`first.opened`): cells opened
 * one at a time in a random order until no two by two block lacks an open
 * cell and the open cells are joined, every cell left then laid, the cells
 * opened again where it never gets there. Upstream crossing.c's
 * `crossing_gen_walls`, whose walls are what it leaves.
 */

import { shuffle } from "../../board/shuffle.ts";
import { retryLimit } from "../../contract/retry-limit.ts";
import { orbitOf, type Symmetry } from "../../generate/symmetry.ts";
import type { RandomState } from "../../random/index.ts";

const UNSET = 0;
const LAID = 1;
const OPEN = 2;

/**
 * Whether every two by two block holds an open cell; and, in the same pass,
 * a cell laid wherever its block's other three are open, so no block is open
 * whole, with its orbit. The four corners of a block are tried in turn, each
 * seeing what the one before it laid, as upstream's
 * `crossing_gen_walls_checkpool` does: the cells it lays here decide the
 * board. Upstream lays the cell alone, which on a board even in a side left
 * a tenth of its symmetric 7x6 layouts asymmetric (2026-11-28).
 */
function poolsClosed(
  w: number,
  h: number,
  cells: Uint8Array,
  orbit: (c: number) => readonly number[],
): boolean {
  let ok = true;
  for (let y = 0; y < h - 1; y++)
    for (let x = 0; x < w - 1; x++) {
      const block = [y * w + x, y * w + x + 1, (y + 1) * w + x, (y + 1) * w + x + 1];
      if (block.every((c) => cells[c] !== OPEN)) ok = false;
      for (const c of block)
        if (block.every((o) => o === c || cells[o] === OPEN))
          for (const o of orbit(c)) cells[o] = LAID;
    }
  return ok;
}

/** Whether the open cells are one piece, joined side to side; none open is
 * no piece. */
function joined(w: number, h: number, cells: Uint8Array): boolean {
  const start = cells.indexOf(OPEN);
  if (start < 0) return false;
  const seen = new Uint8Array(w * h);
  const stack = [start];
  seen[start] = 1;
  let reached = 0;
  while (stack.length > 0) {
    const c = stack.pop() as number;
    reached++;
    const x = c % w;
    const near = [
      x > 0 ? c - 1 : -1,
      x < w - 1 ? c + 1 : -1,
      c >= w ? c - w : -1,
      c + w < w * h ? c + w : -1,
    ];
    for (const n of near)
      if (n >= 0 && seen[n] === 0 && cells[n] === OPEN) {
        seen[n] = 1;
        stack.push(n);
      }
  }
  return reached === cells.reduce((k, v) => k + (v === OPEN ? 1 : 0), 0);
}

/** Every cell of a `w` by `h` board, 1 where the opening leaves it to be
 * laid and 0 where it is open, each cell opened and laid with its orbit
 * under `symmetry`. */
export function opening(
  w: number,
  h: number,
  symmetry: Symmetry,
  rs: RandomState,
): Uint8Array {
  const attempt = retryLimit(`deal: an opening (${w}x${h})`);
  for (;;) {
    attempt();
    const cells = opened(w, h, symmetry, rs);
    if (cells !== null) return cells.map((v) => (v === OPEN ? 0 : 1));
  }
}

/** One opening's cells, or `null` where it tried every cell and never
 * stopped: a cell it lays is never opened, so the open cells may never join
 * (a fifth of 7x7 openings), and upstream deals such a board as it stands. */
function opened(
  w: number,
  h: number,
  symmetry: Symmetry,
  rs: RandomState,
): Uint8Array | null {
  const n = w * h;
  const cells = new Uint8Array(n);
  const order = Array.from({ length: n }, (_, i) => i);
  shuffle(order, rs);
  const orbit = (c: number): readonly number[] => orbitOf(symmetry, w, h, c);
  for (const c of order) {
    // Tried before each opening, and it lays cells as it goes.
    if (poolsClosed(w, h, cells, orbit) && joined(w, h, cells)) return cells;
    for (const o of orbit(c)) if (cells[o] === UNSET) cells[o] = OPEN;
  }
  return poolsClosed(w, h, cells, orbit) && joined(w, h, cells) ? cells : null;
}
