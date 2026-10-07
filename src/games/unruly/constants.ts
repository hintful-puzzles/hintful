/**
 * Unruly's vocabulary: cell values and difficulty levels.
 *
 * These live apart from `state.ts` to break a runtime import cycle: `state.ts`
 * needs the validators in `solver.ts` (`isComplete`), and `solver.ts` needs this
 * vocabulary. `solver.ts`'s remaining import from `state.ts` is types only,
 * which `verbatimModuleSyntax` erases.
 */
import { tierNames } from "../../engine/difficulty.ts";

// --- cell values (upstream `enum { EMPTY, N_ONE, N_ZERO, BOGUS }`) -------
// BOGUS is a solver-internal temporary fill, so it lives in solver.ts.
export const EMPTY = 0;
export const ONE = 1;
export const ZERO = 2;
export type Cell = typeof EMPTY | typeof ONE | typeof ZERO;

/** Which member of the collection's two-state pair (`TWO`, `TWO_NAMES`,
 * `TWO_SHAPES`) a filled cell is. */
export const pairIndex = (filled: number): 0 | 1 => (filled === ONE ? 0 : 1);

// --- difficulty (upstream DIFFLIST: Trivial, Easy, Normal) ---------------
// The `DIFF_*` identifiers are upstream's rung labels, which the solver and the
// differential are written in. The menu shows the collection's tier names by
// position, so `DIFF_TRIVIAL` reads as "Easy".
export const DIFF_TRIVIAL = 0;
export const DIFF_EASY = 1;
export const DIFF_NORMAL = 2;
export const DIFF_COUNT = 3;
export const DIFF_NAMES: readonly string[] = tierNames(DIFF_COUNT);
export const DIFF_CHARS = "ten"; // ENCODE chars, indexed by difficulty
