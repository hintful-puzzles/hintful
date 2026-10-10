/*
 * The firing census of ABCD's `runDeductionFixpoint` ladder: which rungs the
 * generated corpus reaches. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * **Why a census rather than a board comparison.** Every technique is sound and
 * only ever removes candidates, so any order reaches the same fixpoint, and the
 * corpus is dealt by the generator, which is gated on the very solver under
 * test. Silencing the runs rung (2026-09-26) left all 24 board comparisons
 * against upstream's hand-written loop green, because the weakened solver then
 * dealt only boards it could finish; the census went red, and so did 11 of the
 * differential's 18 fixtures. Runs fires on almost every board it could:
 * measured over 40 boards per preset, on 16 of the 40 at 4x4 with every clue
 * shown and on 34 to 40 everywhere else.
 *
 * ABCD is untiered, so there is one cap.
 */
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newAbcdDesc } from "./generator.ts";
import { newSolverBoard, type SolverBoard, solveBoard } from "./solver.ts";
import { type AbcdParams, EASY_PRESETS, newState } from "./state.ts";

/** Every shape on the menu, plus the diagonal board with its clues hidden and
 * a thin board: hidden clues are what make the runs technique work for its
 * living, and diagonal mode rules out more per placement. All Easy, since an
 * Easy board is the one the ladder finishes. */
const SHAPES: AbcdParams[] = [
  ...EASY_PRESETS,
  { w: 6, h: 6, n: 5, diag: true, removenums: true, diff: DIFF_EASY },
  { w: 3, h: 9, n: 3, diag: false, removenums: true, diff: DIFF_EASY },
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
    const { numbers } = newState(params, desc);
    return {
      label,
      board: (): Board => ({ b: newSolverBoard(params, numbers), numbers }),
    };
  }),
);

describeLadderCensus<Board>({
  game: "abcd",
  rungs: ["satisfied", "singles", "runs"],
  unreached: {},
  caps: [0],
  cases,
  solve: ({ b, numbers }, _cap, firings) => solveBoard(b, numbers, firings),
});
