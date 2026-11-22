/**
 * A fill game's deal: sample an answer, check it is one, derive its clues,
 * and keep the board the ladder finishes at the asked tier and not at the
 * tier below. Its desc is the clues, and its `aux` the answer
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 7).
 */

import { retryLimit } from "../contract/retry-limit.ts";
import type { RandomState } from "../random/index.ts";
import type { ClueList, GridSpace } from "../solve/describe-runtime.ts";
import { encodeAnswer } from "./answer.ts";
import { type LadderedFillModule, newBoard, solveBoard, spaceOf } from "./board.ts";
import { encodeDesc, type FillDeal, type FillParams } from "./game-id.ts";
import { sampleAnswer } from "./sample.ts";

/** A board's clues, by kind. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** A fill module whose deal samples its answer. */
export type DealtFillModule<C> = LadderedFillModule<C> & {
  deriveClues(g: ArrayLike<number>, sp: GridSpace): C;
};

export function dealFill<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
): { desc: string; aux: string } {
  const { sample } = deal;
  if (sample === null) throw new Error("deal: the description samples no answer");
  const sp = spaceOf(module, p);
  const attempt = retryLimit("fill: deal");
  for (;;) {
    attempt();
    const g = sampleAnswer(sample, sp, rs);
    if (g === null) continue;
    const clues = module.deriveClues(g, sp);
    if (!module.isAnswer(g, sp, clues)) continue;
    const board = newBoard(module, p.w, p.h, clues);
    if (solveBoard(module, board, p.diff).verdict !== "solved") continue;
    if (p.diff > 0 && solveBoard(module, board, p.diff - 1).verdict === "solved")
      continue;
    return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(g) };
  }
}
