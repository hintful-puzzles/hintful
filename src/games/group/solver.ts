/**
 * Group solver: the ladder `group.description.yaml` states, compiled, and the
 * answer check its rules compile to, on the shared `LatinSolver`
 * (`engine/solve/latin.ts`), whose forcing chains and recursion are the search above
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

import { latinSpace } from "../../engine/solve/describe-runtime.ts";
import type { Ladder } from "../../engine/solve/ladder-runtime.ts";
import {
  type LatinReason,
  type LatinSolver,
  latinLadder,
  latinSolver,
} from "../../engine/solve/latin.ts";
import type { Clauses } from "../../engine/stated.ts";
import * as group from "../../generated/games/group/group.compiled.ts";
import { DIFF_UNREASONABLE } from "./state.ts";

/** The terms a stated clause reads: element numbers, and cell indices, which
 * are numbered `y·o + x`. */
export type StatedTerms = Readonly<Record<string, number>>;

/** Why a Group-specific step placed or struck, as the hint narrates it: the
 * clause the description states for what holds, and the terms it reads
 * (`engine/stated.ts`). Combined with {@link LatinReason} (the generic
 * positional and set steps) it covers every technique; the `kind` fields never
 * collide. `identityElim` also names the element it rules out as the identity,
 * for its strike's words. */
export type GroupReason =
  | { kind: "associativity"; clause: Clauses; terms: StatedTerms }
  | { kind: "identityFill"; clause: Clauses; terms: StatedTerms }
  | { kind: "identityElim"; clause: Clauses; terms: StatedTerms; elem: number };

/** A reason a Group hint step gives. */
export type HintReason = GroupReason | LatinReason;

// --- the described ladder ----------------------------------------------------

/** The ladder `group.description.yaml` states. */
export const groupLadder: Ladder<LatinSolver> = latinLadder(group, null);

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
