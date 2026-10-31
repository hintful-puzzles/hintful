/**
 * The edge-clue Latin square's solver: the game's described ladder
 * (`ClueKind.ladder`) and the validator from `unequal.c`, on the shared
 * `LatinSolver` (`engine/latin.ts`), whose forcing chains and recursion are the
 * search above the ladder.
 */

import type { DeductionRecord } from "../deduction-record.ts";
import { type LatinSolver, latinSolver } from "../latin.ts";
import { ADJTHAN, breaksClue, type ClueKind, DIFF_RECURSIVE } from "./state.ts";

/** Every clue, dealt or (for a complete kind) missing, holds of the filled
 * grid. */
function clueValid(solver: LatinSolver, kind: ClueKind, flags: Int32Array): boolean {
  const o = solver.o;
  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      const v = solver.grid[y * o + x];
      for (const dir of ADJTHAN) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx < 0 || ny < 0 || nx >= o || ny >= o) continue;
        const flagged = (flags[y * o + x] & dir.f) !== 0;
        if (breaksClue(kind, flagged, v, solver.grid[ny * o + nx])) return false;
      }
    }
  }
  return true;
}

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
  // The clues are fixed for every recursion level, so the validator holds them
  // and the context is empty: the premise audit clones a context, and a kind
  // is functions.
  return latinSolver<null>(soln, o, {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    valid: (solver) => clueValid(solver, kind, flags),
    ctx: null,
    cubeOut,
    recorder,
    ...kind.ladder(o, flags),
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
