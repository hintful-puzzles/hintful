/**
 * A fill game's search tier: where its last tier is named Unreasonable, a
 * board of that tier is one the ladder stops short of and a search by trial
 * and error over the ladder proves has one answer
 * (`engine/solve/answer-search.ts`). The search is the engine's, so the
 * description states only the tier's name. Solve and the mistake check of
 * such a game go by the search's answer at every tier.
 */

import { SEARCH_TIER } from "../contract/difficulty.ts";
import { type Answer, answerCache, solvedPositions } from "../solve/answer-search.ts";
import type { ClueList, GridSpace, Partition } from "../solve/describe-runtime.ts";
import {
  asDealt,
  type FillBoard,
  type LadderedFillModule,
  solveBoard,
  spaceOf,
} from "./board.ts";
import type { FillDeal } from "./game-id.ts";

/** A fill module as the search reads it: its ladder, where clues are
 * numbers on their cells the cells each reads, and its deal's partitions. */
export type SearchedFillModule<C> = LadderedFillModule<C> &
  NumberedModule & { readonly deal?: FillDeal };

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

/** The groups of cells a search assumes in: each number's cells, its block,
 * and each part of a dealt partition. */
function groupsOf<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  sp: GridSpace,
): (readonly number[])[] {
  const out: (readonly number[])[] = [];
  const { clueCells } = module;
  if (clueCells !== undefined)
    for (const kind of module.numbers ?? [])
      for (const c of (board.dealt[kind as keyof C] as ClueList).at)
        out.push(clueCells[kind](sp, c));
  for (const kind of module.deal?.partitions ?? [])
    out.push(...(board.dealt[kind as keyof C] as Partition).cells);
  return out;
}

/** Where a search starts, how far the ladder runs, and in what order it
 * tries a cell's values. */
interface SearchFrom {
  /** The values to start from; the board as dealt where absent. */
  readonly start?: Uint8Array;
  /** The ladder's cap; the whole ladder below a search tier where absent. */
  readonly cap?: number;
  readonly budget?: number;
  /** The value cell `c` is assumed to hold last, so another answer is met
   * before one that has it; the domain's order where absent. */
  readonly last?: (c: number) => number;
}

/**
 * The positions a search by trial and error over the ladder solves, up to
 * `limit`, or `null` where the budget ran out first. Where the ladder stops,
 * an open cell is assumed each value its domain allows. The cell is the
 * first open one of the group with the fewest open, where either way is
 * likeliest to settle the rest of it; with no group, the first open cell.
 */
export function searchedPositions<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  from: SearchFrom,
  limit: number,
): Uint8Array[] | null {
  const cap = from.cap ?? module.tiers.length - 2;
  const dealt = asDealt(board);
  const sp = spaceOf(module, board);
  const groups = groupsOf(module, board, sp);
  return solvedPositions(
    {
      start: (from.start ?? dealt.values).slice(),
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
        for (const group of groups) {
          let open = 0;
          for (const d of group) if (values[d] === 0) open++;
          if (open === 0 || open >= fewest) continue;
          fewest = open;
          at = group.find((d) => values[d] === 0) as number;
        }
        if (at < 0) return [];
        const vs: number[] = [];
        for (let m = module.domainOf(sp, board.dealt, at); m !== 0; m &= m - 1)
          vs.push(31 - Math.clz32(m & -m));
        const last = from.last?.(at);
        if (last !== undefined && vs.includes(last))
          vs.sort((a, b) => (a === last ? 1 : b === last ? -1 : 0));
        return vs.map((v) => {
          const next = values.slice();
          next[at] = v;
          return next;
        });
      },
      solution: (values) => values,
      budget: from.budget ?? SEARCH_BUDGET,
    },
    limit,
  );
}

/** The board's answers up to two, by {@link searchedPositions} from the
 * board as dealt over the whole ladder. */
export function searchBoard<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  budget: number = SEARCH_BUDGET,
): Answer<Uint8Array> {
  const found = searchedPositions(module, board, { budget }, 2);
  if (found === null) return { kind: "out-of-reach" };
  if (found.length === 0) return { kind: "none" };
  if (found.length > 1) return { kind: "several" };
  return { kind: "one", solution: found[0] };
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
