/**
 * The edge-clue Latin square's solver: the game's described ladder
 * (`ClueKind.ladder`) and the answer check its rules compile to
 * (`ClueKind.isAnswer`), on the shared `LatinSolver` (`engine/latin.ts`),
 * whose forcing chains and recursion are the search above the ladder.
 */

import type { DeductionRecord } from "../deduction-record.ts";
import { latinSolver } from "../latin.ts";
import { type ClueKind, DIFF_RECURSIVE } from "./state.ts";

/**
 * Solve the `o × o` board (with clue `flags`) into `soln` (0 = blank), up to
 * difficulty `maxdiff`. Returns the difficulty level reached, or a
 * `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel. Each tier runs
 * the techniques the game's description places at it, and the recursive tier
 * the engine's forcing chains and recursion. When `cubeOut` is given it
 * receives the final candidate cube (the generator grades clues by it).
 */
export function solveEdgeClues(
  o: number,
  kind: ClueKind,
  flags: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
  cubeOut?: Uint8Array,
  recorder?: (rec: DeductionRecord) => void,
): number {
  return latinSolver(soln, o, {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    isAnswer: (grid) => kind.isAnswer(grid, o, flags),
    cubeOut,
    recorder,
    ladder: kind.ladder(o, flags),
  });
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed givens/entries only — never the player's notes), up to `maxdiff`, and
 * return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it. This is the raw
 * deduction script a hint narrates. `grid` is treated read-only (a working copy
 * is solved internally).
 */
export function recordEdgeClueDeductions(
  o: number,
  kind: ClueKind,
  flags: Int32Array,
  grid: Uint8Array,
  maxdiff: number,
): DeductionRecord[] {
  const ops: DeductionRecord[] = [];
  solveEdgeClues(o, kind, flags, grid.slice(), maxdiff, undefined, (rec) =>
    ops.push(rec),
  );
  return ops;
}
