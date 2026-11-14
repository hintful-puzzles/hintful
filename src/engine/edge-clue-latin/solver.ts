/**
 * The edge-clue Latin square's solver: the game's described ladder
 * (`ClueKind.ladder`) and the answer check its rules compile to
 * (`ClueKind.isAnswer`), on the shared `LatinSolver` (`engine/latin.ts`),
 * whose forcing chains and recursion are the search above the ladder.
 */

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
): number {
  return latinSolver(soln, o, {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    isAnswer: (grid) => kind.isAnswer(grid, o, flags),
    cubeOut,
    ladder: kind.ladder(o, flags),
  });
}
