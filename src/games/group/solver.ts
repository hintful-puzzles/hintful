/**
 * Group solver: the ladder `group.description.yaml` states, compiled, and the
 * answer check its rules compile to, on the shared `LatinSolver`
 * (`engine/latin.ts`), whose forcing chains and recursion are the search above
 * the ladder. The tiers, by display name and constant:
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
import { type Ladder, uncluedRung } from "../../engine/ladder-runtime.ts";
import {
  type LatinReason,
  type LatinSolver,
  latinLadder,
  latinSolver,
} from "../../engine/latin.ts";
import type { Point } from "../../engine/types.ts";
import * as group from "./group.compiled.ts";
import { DIFF_UNREASONABLE } from "./state.ts";

/** Why a Group-specific step placed or struck, as the hint narrates and
 * highlights it. Combined with {@link LatinReason} (the generic positional
 * and set steps) it covers every technique; the `kind` fields never collide.
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

/** A reason a Group hint step gives. */
export type HintReason = GroupReason | LatinReason;

const cellAt = (w: number, c: number): Point => ({ x: c % w, y: (c / w) | 0 });

/** An associativity firing's reason, for its placement in `cell`, on `grid`
 * as it stood before the placement. */
export function associativityReason(
  { a, b, c, p, q, l, r }: group.AssociativitySays["terms"],
  cell: number,
  grid: ArrayLike<number>,
  w: number,
): GroupReason {
  const knownLeft = cell === r;
  return {
    kind: "associativity",
    a,
    b,
    c,
    ab: grid[p],
    bc: grid[q],
    v: grid[knownLeft ? l : r],
    knownLeft,
    abCell: cellAt(w, p),
    bcCell: cellAt(w, q),
    thirdCell: cellAt(w, knownLeft ? l : r),
  };
}

/** An identity firing's reason: the product in `w0` revealed `e`. */
export function identityFillReason(
  { w0, e }: group.IdentitySays["terms"],
  grid: ArrayLike<number>,
  w: number,
): GroupReason {
  const { x, y } = cellAt(w, w0);
  return {
    kind: "identityFill",
    e,
    viaX: x,
    viaY: y,
    a: y + 1,
    b: x + 1,
    prod: grid[w0],
  };
}

/** A notIdentity firing's reason: which way `a` fails as the identity,
 * `o·a ≠ o` first, else `a·o ≠ o`. */
export function identityElimReason(
  { a, o }: group.NotIdentitySays["terms"],
  grid: ArrayLike<number>,
  w: number,
): GroupReason {
  const right = (o - 1) * w + (a - 1);
  const left = !(grid[right] !== 0 && grid[right] !== o);
  const c = left ? (a - 1) * w + (o - 1) : right;
  const { x: wx, y: wy } = cellAt(w, c);
  return { kind: "identityElim", elem: a, other: o, product: grid[c], wx, wy, left };
}

// --- the described ladder ----------------------------------------------------

/** The ladder `group.description.yaml` states. */
export const groupLadder: Ladder<LatinSolver> = latinLadder(group, {
  associativity: uncluedRung(group.associativity),
  identity: uncluedRung(group.identity),
  notIdentity: uncluedRung(group.notIdentity),
});

// --- driver ----------------------------------------------------------------

/**
 * Solve a Group Cayley table in place up to difficulty `maxdiff`: `grid` holds
 * the givens (0 = blank) and receives the first solution found. Returns the
 * difficulty reached or one of latin.ts's sentinels, as `group.c`'s `solver()`
 * does.
 */
export function solveGroup(grid: Uint8Array, w: number, maxdiff: number): number {
  return latinSolver(grid, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    isAnswer: (g) => group.isAnswer(g, latinSpace(w)),
    ladder: groupLadder,
  });
}
