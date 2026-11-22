/**
 * A fill game's search tier: where its last tier is named Unreasonable, a
 * board of that tier is one the ladder stops short of and a search by trial
 * and error over the ladder proves has one answer
 * (`engine/solve/answer-search.ts`). The search is the engine's, so the
 * description states only the tier's name. Solve and the mistake check of
 * such a game go by the search's answer at every tier.
 */

import { SEARCH_TIER } from "../contract/difficulty.ts";
import { type Answer, answerCache, searchAnswers } from "../solve/answer-search.ts";
import type { ClueList, GridSpace } from "../solve/describe-runtime.ts";
import {
  asDealt,
  type FillBoard,
  type LadderedFillModule,
  solveBoard,
  spaceOf,
} from "./board.ts";

/** A fill module as the search reads it: its ladder, and where clues are
 * numbers on their cells, the cells each reads. */
export type SearchedFillModule<C> = LadderedFillModule<C> & NumberedModule;

/** The clue kinds written as numbers on their cells, and the cells each
 * number's meaning reads (`clueCells_<kind>`): its block. */
export interface NumberedModule {
  readonly numbers?: readonly string[];
  readonly clueCells?: Readonly<
    Record<string, (sp: GridSpace, at: number) => readonly number[]>
  >;
}

/** Whether the module's last tier is the search's. */
export const searches = (module: { readonly tiers: readonly string[] }): boolean =>
  module.tiers.at(-1) === SEARCH_TIER;

/**
 * The positions a search may try before it gives up, each a cell assumed one
 * way and the ladder run from it. It decides which boards of the tier exist:
 * one that needs more is thrown away when dealing and refused when pasted. A
 * dealt board needs `DEALING_BUDGET` at most, so the rest is room for a
 * pasted one. Mosaic's, measured 2026-10-11: running it out on a board with
 * half its clues gone takes 0.06 s at 30x30 and 0.2 s at 100x100.
 */
const SEARCH_BUDGET = 2_000;

/** Every cell of `board` as numbers, the numbers' kinds and their lists. */
function numbersOf<C>(
  module: NumberedModule,
  board: FillBoard<C>,
): { cells: (sp: GridSpace, at: number) => readonly number[]; list: ClueList }[] {
  const { clueCells } = module;
  if (clueCells === undefined) return [];
  return (module.numbers ?? []).map((kind) => ({
    cells: clueCells[kind],
    list: board.dealt[kind as keyof C] as ClueList,
  }));
}

/**
 * The board's answers up to two, by trial and error over the whole ladder:
 * where it stops, an open cell is assumed each value its domain allows, in
 * order. The cell is the first open one among the cells of the number with
 * the fewest open, where either way is likeliest to settle the rest of
 * them; with no such number, the first open cell.
 */
export function searchBoard<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  budget: number = SEARCH_BUDGET,
): Answer<Uint8Array> {
  // The tier below the search's is the whole ladder.
  const cap = module.tiers.length - 2;
  const dealt = asDealt(board);
  const sp = spaceOf(module, board);
  const numbers = numbersOf(module, board);
  return searchAnswers({
    start: dealt.values,
    deduce(values) {
      const got = solveBoard(module, { ...dealt, values }, cap);
      values.set(got.values);
      return got.verdict === "solved"
        ? "solved"
        : got.verdict === "impossible"
          ? "contradiction"
          : "stuck";
    },
    assume(values) {
      let at = values.indexOf(0);
      let fewest = Number.POSITIVE_INFINITY;
      for (const { cells, list } of numbers)
        for (const c of list.at) {
          const block = cells(sp, c);
          let open = 0;
          for (const d of block) if (values[d] === 0) open++;
          if (open === 0 || open >= fewest) continue;
          fewest = open;
          at = block.find((d) => values[d] === 0) as number;
        }
      if (at < 0) return [];
      const out: Uint8Array[] = [];
      for (let m = module.domainOf(sp, board.dealt, at); m !== 0; m &= m - 1) {
        const next = values.slice();
        next[at] = 31 - Math.clz32(m & -m);
        out.push(next);
      }
      return out;
    },
    solution: (values) => values,
    budget,
  });
}

/** Keyed on a board's clues, which every state of one game shares. */
const answers = answerCache<object, Uint8Array>();

/** What the search established of the board's answers, searched once a
 * deal. The player's values are not read. */
export function answerSearched<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
): Answer<Uint8Array> {
  return answers(board.dealt as object, () => searchBoard(module, board));
}
