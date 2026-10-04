/**
 * What Net's Check & Save flags: a lock or a side note the solution
 * contradicts. A tile turned wrong but not locked is not a mistake — it is the
 * player still working.
 */

import { D, R } from "../../engine/wires.ts";
import { netSolver } from "./solver.ts";
import {
  LOCKED,
  type NetState,
  NOTE_NONE,
  NOTE_UNKNOWN,
  NOTE_WIRE,
  sideIndex,
} from "./state.ts";

export type NetMistake =
  | { readonly kind: "tile"; readonly x: number; readonly y: number }
  /** A side note, named as a move names it: from the tile left of it (`R`) or
   * above it (`D`). */
  | {
      readonly kind: "side";
      readonly x: number;
      readonly y: number;
      readonly dir: number;
    };

/** The solver's answer per tile (with `LOCKED` where it settles the tile),
 * which depends only on the board's wires and walls, so it is kept per board:
 * every state of one game shares its `barriers` array. */
const solutions = new WeakMap<Uint8Array, Uint8Array>();

function netSolution(s: NetState): Uint8Array {
  let sol = solutions.get(s.barriers);
  if (!sol) {
    sol = Uint8Array.from(s.tiles, (t) => t & 0xf);
    netSolver(s.w, s.h, sol, s.barriers, s.wrapping);
    solutions.set(s.barriers, sol);
  }
  return sol;
}

export function findMistakes(s: NetState): readonly NetMistake[] {
  const sol = netSolution(s);
  const out: NetMistake[] = [];
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      if (
        s.tiles[i] & LOCKED &&
        sol[i] & LOCKED &&
        (s.tiles[i] & 0xf) !== (sol[i] & 0xf)
      )
        out.push({ kind: "tile", x, y });
    }
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      for (const dir of [R, D]) {
        const note = s.sides[sideIndex(s, x, y, dir)];
        if (note === NOTE_UNKNOWN || !(sol[i] & LOCKED)) continue;
        const wire = (sol[i] & dir) !== 0;
        if ((note === NOTE_WIRE && !wire) || (note === NOTE_NONE && wire))
          out.push({ kind: "side", x, y, dir });
      }
    }
  return out;
}
