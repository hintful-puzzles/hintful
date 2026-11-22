/**
 * A fill game's deal: draw an answer, check it is one, derive its clues,
 * hide what `deal.hide` says may go, and keep the board the ladder finishes
 * at the asked tier and not at the tier below. Its desc is the clues, and
 * its `aux` the answer (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 7).
 */

import { shuffle } from "../board/shuffle.ts";
import { retryLimit } from "../contract/retry-limit.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import { type ClueList, clueList, type GridSpace } from "../solve/describe-runtime.ts";
import { encodeAnswer } from "./answer.ts";
import { type LadderedFillModule, newBoard, solveBoard, spaceOf } from "./board.ts";
import { encodeDesc, type FillDeal, type FillParams, variationsOf } from "./game-id.ts";
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
  const variations = variationsOf(p);
  const finishes = (clues: C, cap: number): boolean =>
    solveBoard(module, newBoard(module, p.w, p.h, clues, variations), cap).verdict ===
    "solved";
  const attempt = retryLimit("fill: deal");
  for (;;) {
    attempt();
    const g =
      "build" in sample ? buildAnswer(module, sp, p, rs) : sampleAnswer(sample, sp, rs);
    if (g === null) continue;
    let clues = module.deriveClues(g, sp);
    if (!module.isAnswer(g, sp, clues, variations)) continue;
    if (deal.hide !== undefined) {
      const kind = deal.hide as keyof C;
      clues = hidden(clues, kind, sp[deal.universes[deal.hide]].length, rs, (c) =>
        finishes(c, p.diff),
      );
    }
    if (!finishes(clues, p.diff)) continue;
    if (p.diff > 0 && finishes(clues, p.diff - 1)) continue;
    return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(g) };
  }
}

/**
 * An answer built by the ladder (`sample: build`): a random value of its
 * domain on a random undecided cell, then every cell the whole ladder decides
 * from those, until none is left; `null` where a placement left no answer.
 * The board is built on the clues a blank board derives, which are none
 * where the clues are the placed cells (Unruly's givens). Upstream's
 * unruly.c `unruly_fill_game`.
 */
function buildAnswer<C extends Clues<C>>(
  module: DealtFillModule<C>,
  sp: GridSpace,
  p: FillParams,
  rs: RandomState,
): Uint8Array | null {
  const blank = module.deriveClues(new Uint8Array(sp.cells.length), sp);
  const board = newBoard(module, p.w, p.h, blank, variationsOf(p));
  const top = module.tiers.length - 1;
  const g = board.values.slice();
  const order = Array.from(sp.cells);
  shuffle(order, rs);
  for (const c of order) {
    if (g[c] !== 0) continue;
    const values: number[] = [];
    for (let m = module.domainOf(sp, blank, c); m !== 0; m &= m - 1)
      values.push(31 - Math.clz32(m & -m));
    g[c] = values[randomUpto(rs, values.length)];
    const got = solveBoard(module, { ...board, values: g }, top);
    if (got.verdict === "impossible") return null;
    g.set(got.values);
  }
  return g;
}

/**
 * The clues with each of kind `kind`'s taken off, in a random order, where
 * the board still `finishes` without it: upstream's winnowing of a full
 * board's givens.
 */
function hidden<C extends Clues<C>>(
  clues: C,
  kind: keyof C,
  elements: number,
  rs: RandomState,
  finishes: (clues: C) => boolean,
): C {
  const all = clues[kind];
  const kept = new Uint8Array(all.at.length).fill(1);
  const order = Array.from(all.at.keys());
  shuffle(order, rs);
  const keeping = (): C => {
    const at: number[] = [];
    const v: number[] = [];
    kept.forEach((k, i) => {
      if (k === 0) return;
      at.push(all.at[i]);
      v.push(all.v[i]);
    });
    return { ...clues, [kind]: clueList(at, v, elements) };
  };
  for (const i of order) {
    kept[i] = 0;
    if (!finishes(keeping())) kept[i] = 1;
  }
  return keeping();
}
