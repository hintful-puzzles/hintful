/**
 * Group solver: the ladder `group.description.yaml` states, compiled, with the
 * reason each technique records for the hint, and the group validator, on the
 * shared `LatinSolver` (`engine/latin.ts`), whose forcing chains and recursion
 * are the search above the ladder. The tiers, by display name and constant:
 *
 *   Easy (`DIFF_TRIVIAL`)   → the library's singles.
 *   Normal (`DIFF_NORMAL`)  → associativity, and the identity's row and column.
 *   Tricky (`DIFF_HARD`)    → ruling elements out as the identity, then the
 *                             library's set elimination.
 *   Hard (`DIFF_EXTREME`)   → the library's fish and wing.
 *   Unreasonable            → the engine's forcing chains and recursion.
 *
 * Cells are numbered `y·o + x`; row `a`, column `b` holds the product `a·b`.
 */

import {
  type DeductionRecord,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
  type LatinSolver,
  latinSolver,
  uncluedRung,
} from "../../engine/latin.ts";
import type { Point } from "../../engine/types.ts";
import * as group from "./group.compiled.ts";
import { DIFF_UNREASONABLE } from "./state.ts";

/** Why a Group-specific deduction placed or eliminated — the premise the hint
 * narrates and highlights. Combined with {@link LatinReason} (the generic
 * positional/set deductions) it covers every technique the recording
 * solver fires; the `kind` fields never collide with the Latin ones.
 *
 * All cell fields are **grid** coordinates (`{x = col, y = row}`); the value
 * fields (`a`/`b`/`c`/…) are 1-based element numbers.
 */
export type GroupReason =
  /** Associativity forced a **placement**: the player has filled `a·b`, `b·c`
   * and one of `(a·b)·c` / `a·(b·c)`; since `(a·b)·c = a·(b·c)` in any group the
   * remaining fourth product is forced to the same value `v`. `knownLeft` = the
   * *left* association `(a·b)·c` is the one already filled (so `a·(b·c)` is the
   * cell placed); the three premise cells are carried for shading. */
  | {
      kind: "associativity";
      a: number;
      b: number;
      c: number;
      ab: number;
      bc: number;
      v: number;
      knownLeft: boolean;
      abCell: Point;
      bcCell: Point;
      thirdCell: Point;
    }
  /** The identity `e` is known (the filled cell `(viaX, viaY)` shows `a·b`
   * equals `a` or `b`, so the other factor is the identity), so the identity's
   * whole row and column are just the element labels — this cell is one of them
   * (a **placement**). */
  | {
      kind: "identityFill";
      e: number;
      viaX: number;
      viaY: number;
      a: number;
      b: number;
      prod: number;
    }
  /** Identity-hidden **elimination**: the filled product at `(wx, wy)` shows
   * `elem` combined with `other` gives `product` (≠ `other`), so `elem` can't be
   * the identity — its identity marks are struck. `left` = `elem` was the left
   * factor (`elem·other`), else the right (`other·elem`). */
  | {
      kind: "identityElim";
      elem: number;
      other: number;
      product: number;
      wx: number;
      wy: number;
      left: boolean;
    };

/** A reason attached to a recorded Group deduction. */
export type HintReason = GroupReason | LatinReason;

/** One recorded Group deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/**
 * A completed grid is a valid group table iff it is associative
 * (`(ab)c == a(bc)` for all `a,b,c`) — the generic Latin layers already ensure
 * Latin-square-hood, and identity + inverses follow (`group_valid`). Uses the
 * transposed `grid(x,y)` macro; only ever called on a full grid, so no blank
 * cell can index out of range.
 */
function groupValid(solver: LatinSolver): boolean {
  const w = solver.o;
  const gm = (x: number, y: number): number => solver.grid[y * w + x]; // grid(x,y)

  for (let i = 0; i < w; i++)
    for (let j = 0; j < w; j++)
      for (let k = 0; k < w; k++) {
        const ij = gm(i, j) - 1;
        const jk = gm(j, k) - 1;
        const ijK = gm(ij, k) - 1;
        const iJk = gm(i, jk) - 1;
        if (ijK !== iJk) return false;
      }

  return true;
}

// --- the described ladder ----------------------------------------------------

const cellAt = (o: number, c: number): Point => ({ x: c % o, y: (c / o) | 0 });

/** Which way an element fails as the identity, for the reason of the
 * firing that rules it out: `o·a ≠ o` first, else `a·o ≠ o`. */
function identityElim(
  { a, o }: group.NotIdentityBinding,
  solver: LatinSolver,
): GroupReason {
  const w = solver.o;
  const right = (o - 1) * w + (a - 1);
  const left = !(solver.known(right) && solver.value(right) !== o);
  const c = left ? (a - 1) * w + (o - 1) : right;
  const { x: wx, y: wy } = cellAt(w, c);
  return {
    kind: "identityElim",
    elem: a,
    other: o,
    product: solver.value(c),
    wx,
    wy,
    left,
  };
}

const GROUP_LADDER: Record<group.LadderId, LatinRung> = {
  "latin.hiddenSingle": LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": LATIN_RUNGS["latin.single"],
  associativity: uncluedRung(
    group.associativity,
    ({ a, b, c, p, q, l, r }, cell, n, solver): GroupReason => {
      const o = solver.o;
      const knownLeft = cell === r;
      return {
        kind: "associativity",
        a,
        b,
        c,
        ab: solver.value(p),
        bc: solver.value(q),
        v: n,
        knownLeft,
        abCell: cellAt(o, p),
        bcCell: cellAt(o, q),
        thirdCell: cellAt(o, knownLeft ? l : r),
      };
    },
  ),
  identity: uncluedRung(group.identity, ({ w0, e }, _c, _n, solver): GroupReason => {
    const { x, y } = cellAt(solver.o, w0);
    return {
      kind: "identityFill",
      e,
      viaX: x,
      viaY: y,
      a: y + 1,
      b: x + 1,
      prod: solver.value(w0),
    };
  }),
  notIdentity: uncluedRung(group.notIdentity, (binding, _c, _n, solver) =>
    identityElim(binding, solver),
  ),
  "latin.set": LATIN_RUNGS["latin.set"],
  "latin.fish": LATIN_RUNGS["latin.fish"],
  "latin.wing": LATIN_RUNGS["latin.wing"],
};

const describedLadder: LatinLadder = {
  ladder: group.ladder.map(({ id, tier }) => ({ tier, run: GROUP_LADDER[id] })),
};

// --- driver ----------------------------------------------------------------

/**
 * Solve a Group Cayley table in place up to difficulty `maxdiff`: `grid` holds
 * the givens (0 = blank) and receives the first solution found. Returns the
 * difficulty reached or one of latin.ts's sentinels, as `group.c`'s `solver()`
 * does. `recorder` (hint path only) captures every deduction in solver order.
 */
export function solveGroup(
  grid: Uint8Array,
  w: number,
  maxdiff: number,
  recorder?: (rec: DeductionRecord) => void,
): number {
  return latinSolver<null>(grid, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    valid: groupValid,
    ctx: null,
    recorder,
    ...describedLadder,
  });
}

/**
 * Every candidate elimination and placement the recording solver makes from
 * `grid`'s placed values (never the player's notes), up to `maxdiff`, in solver
 * order, each tagged with the rule and premise that forced it: the script a hint
 * narrates. `grid` is not modified.
 */
export function recordGroupDeductions(
  grid: Uint8Array,
  w: number,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  solveGroup(grid.slice(), w, maxdiff, (rec) => ops.push(rec as HintOp));
  return ops;
}
