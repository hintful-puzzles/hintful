/**
 * Group solver: the ladder `group.description.yaml` states, compiled, with the
 * reason each technique records for the hint, and the answer check its rules
 * compile to, on the shared `LatinSolver` (`engine/latin.ts`), whose forcing
 * chains and recursion are the search above the ladder. The tiers, by display
 * name and constant:
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

import { latinSpace } from "../../engine/describe-runtime.ts";
import { type CellMarks, uncluedRung } from "../../engine/ladder-runtime.ts";
import {
  type DeductionRecord,
  type LatinReason,
  latinLadder,
  latinSolver,
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

// --- the described ladder ----------------------------------------------------

const cellAt = (o: number, c: number): Point => ({ x: c % o, y: (c / o) | 0 });

/** Which way an element fails as the identity, for the reason of the
 * firing that rules it out: `o·a ≠ o` first, else `a·o ≠ o`. */
function identityElim(
  { a, o }: group.NotIdentityBinding,
  solver: CellMarks,
): GroupReason {
  const w = solver.sp.w;
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

const describedLadder = latinLadder(group, {
  associativity: uncluedRung(
    group.associativity,
    ({ a, b, c, p, q, l, r }, cell, n, solver): GroupReason => {
      const o = solver.sp.w;
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
    const { x, y } = cellAt(solver.sp.w, w0);
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
});

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
  return latinSolver(grid, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    isAnswer: (g) => group.isAnswer(g, latinSpace(w)),
    recorder,
    ladder: describedLadder,
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
