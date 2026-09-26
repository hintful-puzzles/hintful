/*
 * ABCD's `runDeductionFixpoint` ladder, proved equivalent to upstream's
 * hand-written loop (`solveBoardLegacy`). The harness and the argument for it
 * are `engine/testing/ladder-equivalence.ts`; this file is the declaration.
 *
 * **Why the loop needed proving rather than asserting.** Upstream reruns
 * techniques 1 and 2 in one pass and tries runs only when neither fired, which
 * reads as a solver that sweeps the whole ladder before restarting. It is the
 * runner's restart-at-first-firing walk: technique 1 retires the lines it finds
 * and places nothing, so the runner's second try of it, before technique 2,
 * finds nothing either.
 *
 * **The census is the half that bites here, not the board comparison.** Every
 * technique is sound and only ever removes candidates, so any order reaches the
 * same fixpoint, and the corpus is dealt by the generator, which is gated on the
 * very solver under test. Silencing the runs rung (2026-09-26) left all 24 board
 * comparisons green, because the weakened solver then dealt only boards it could
 * finish; the census went red, and so did 11 of the differential's 18 fixtures.
 * Runs fires on almost every board it could: measured over 40 boards per preset,
 * on 16 of the 40 at 4x4 with every clue shown and on 34 to 40 everywhere else.
 *
 * ABCD is untiered, so there is one cap.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderEquivalence } from "../../engine/testing/ladder-equivalence.ts";
import { newAbcdDesc } from "./generator.ts";
import {
  newSolverBoard,
  type SolverBoard,
  solveBoard,
  solveBoardLegacy,
} from "./solver.ts";
import { type AbcdParams, parseNumbers } from "./state.ts";

/** Every preset shape, plus diagonal mode and a thin board: hidden clues are
 * what make the runs technique work for its living, and diagonal mode rules
 * out more per placement. */
const SHAPES: AbcdParams[] = [
  { w: 4, h: 4, n: 4, diag: false, removenums: false },
  { w: 4, h: 4, n: 4, diag: false, removenums: true },
  { w: 5, h: 5, n: 4, diag: false, removenums: false },
  { w: 5, h: 5, n: 4, diag: false, removenums: true },
  { w: 6, h: 6, n: 4, diag: false, removenums: false },
  { w: 7, h: 7, n: 3, diag: false, removenums: false },
  { w: 6, h: 6, n: 5, diag: true, removenums: true },
  { w: 3, h: 9, n: 3, diag: false, removenums: true },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

interface Board {
  b: SolverBoard;
  numbers: Int32Array;
}

const cases = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `${params.w}x${params.h} n${params.n}${params.diag ? " diag" : ""}${params.removenums ? " hidden" : ""} ${seed}`;
    const { desc } = newAbcdDesc(params, randomNew(`abcd-ladder-${label}`));
    const numbers = parseNumbers(params, desc);
    return {
      label,
      board: (): Board => ({ b: newSolverBoard(params, numbers), numbers }),
    };
  }),
);

describeLadderEquivalence<Board>({
  game: "abcd",
  rungs: ["satisfied", "singles", "runs"],
  unreached: {},
  caps: [0],
  cases,
  viaRunner: ({ b, numbers }, _cap, firings) => solveBoard(b, numbers, firings),
  viaLegacy: ({ b, numbers }) => solveBoardLegacy(b, numbers),
  // Everything a rung writes: the placements, the candidate cube and the
  // per-line counts still owed.
  key: ({ b }) =>
    `${Array.from(b.grid).join(",")}|${Array.from(b.cube).join(",")}|${Array.from(b.remaining).join(",")}`,
});
