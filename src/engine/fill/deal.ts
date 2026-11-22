/**
 * A fill game's deal: draw an answer, check it is one, derive its clues,
 * hide what `deal.hide` says may go, and keep the board the ladder finishes
 * at the asked tier and not at the tier below; or, at a search tier, the
 * board with one answer that the search proves and the ladder does not
 * reach. Its desc is the clues, and its `aux` the answer
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 7).
 */

import { shuffle } from "../board/shuffle.ts";
import { retryLimit } from "../contract/retry-limit.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import { dealUnreasonable } from "../solve/answer-search.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  type Partition,
} from "../solve/describe-runtime.ts";
import {
  ladderTechniques,
  runLadder,
  type Said,
  TIERS,
} from "../solve/ladder-runtime.ts";
import { encodeAnswer } from "./answer.ts";
import {
  type Clues,
  type FillBoard,
  ladderOf,
  marksOf,
  newBoard,
  solveBoard,
  spaceOf,
} from "./board.ts";
import {
  encodeDesc,
  type FillDeal,
  type FillParams,
  partitionOf,
  sizesOf,
  variationsOf,
} from "./game-id.ts";
import { type GrowSizes, growPartition } from "./grow.ts";
import { sampleAnswer, sampleDominoes, sampleLines } from "./sample.ts";
import {
  type SearchedFillModule,
  searchBoard,
  searchedPositions,
  searches,
} from "./search.ts";

/** The partitions a deal grew round its answer, by name: none where it grows
 * none. */
type Grown = Readonly<Record<string, Partition>>;

/** The positions the mend's search for a second answer may try from where
 * the ladder stops. Where it finds none in that many, the board is taken to
 * have one answer the ladder does not reach (Norinori's, 2026-11-16). */
const MEND_SEARCH_BUDGET = 24;

/** What a firing of a technique reads of the clues, by its bindings: the
 * clue at each cell named, and each clue named by its index in its kind
 * (`techniques`' `reads`). */
interface Reads {
  readonly cells: readonly string[];
  readonly clues: Readonly<Record<string, string>>;
}

/** A fill module whose deal samples its answer: its clues derived from it,
 * beside the partitions grown round it and the sizes the params give; and
 * where it grows a partition, what the parts hold on a board. */
export type DealtFillModule<C> = SearchedFillModule<C> & {
  deriveClues(
    g: ArrayLike<number>,
    sp: GridSpace,
    grown: Grown,
    sizes: Readonly<Record<string, number>>,
  ): C;
  growBy?(sp: GridSpace, sizes: Readonly<Record<string, number>>): GrowSizes;
};

/**
 * Which try of a search tier's deal starts from every clue and not from a
 * board of the lowest tier. A board stripped from every clue is left with
 * more undecided (Mosaic's 10x10: a median of 62 squares of 100, against 41),
 * but no board of the lowest tier strips to some of the smallest boards
 * (none of Mosaic's 3x3 in five million tries), so one try in this many
 * gives them a deal and leaves the larger boards as they were.
 */
const EVERY_CLUE_DRAW = 8;

/**
 * Where the deal is not thorough, the clues a search tier's strip hides at
 * once before it asks the ladder, going through a run a clue at a time only
 * where the ladder stops without it: a long run pays only while most pass.
 * Mosaic's, measured 2026-10-11 at 100x100: a board took 10 s a clue at a
 * time, 5 s in runs of 16 and 1 to 3 s in runs of 6.
 */
const HIDING_RUN = 6;

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
  const sizes = sizesOf(p);
  const board = (clues: C): FillBoard<C> =>
    newBoard(module, p.w, p.h, clues, variations);
  const finishes = (clues: C, cap: number): boolean =>
    solveBoard(module, board(clues), cap).verdict === "solved";
  const thorough = p.thorough ?? true;
  const kind = deal.hide as keyof C | undefined;
  const elements = kind === undefined ? 0 : sp[deal.universes[kind as string]].length;
  const spent = { moves: 0 };
  /** The partition grown round `g` for tier `tier`, by its name, where the
   * deal grows one; `null` where this draw grew none. */
  const grownRound = (g: Uint8Array, tier: number): Grown | null => {
    const { grow } = deal;
    if (grow === undefined) return {};
    if (module.growBy === undefined)
      throw new Error("deal: a grown partition with no growBy");
    const withParts = (parts: Int32Array): C =>
      module.deriveClues(g, sp, { [grow.partition]: partitionOf(parts) }, sizes);
    const parts = growPartition(
      { ...grow, ...module.growBy(sp, sizes) },
      sp,
      g,
      tier,
      (parts) => ({
        deduce() {
          const got = solveBoard(module, board(withParts(parts)), tier);
          const open = sp.cells.filter((c) => got.values[c] === 0);
          return { open, position: got.values };
        },
        others: (position) =>
          (
            searchedPositions(
              module,
              board(withParts(parts)),
              {
                start: position,
                cap: tier,
                budget: MEND_SEARCH_BUDGET,
                last: (c) => g[c],
              },
              2,
            ) ?? []
          )
            .map((values) => sp.cells.filter((c) => values[c] === grow.value))
            .filter((cells) => cells.some((c) => g[c] !== grow.value)),
        tooEasy: tier === 0 ? null : () => finishes(withParts(parts), tier - 1),
      }),
      rs,
      spent,
    );
    return parts === null ? null : { [grow.partition]: partitionOf(parts) };
  };
  /** An answer and its clues, every one shown, or `null` where this draw
   * gave none. `tier` is the tier a grown partition is mended for. */
  const draw = (tier: number): { g: Uint8Array; clues: C } | null => {
    const g =
      "build" in sample
        ? buildAnswer(module, sp, p, rs)
        : "dominoes" in sample
          ? sampleDominoes(sample, sp, rs)
          : "lines" in sample
            ? sampleLines(sample, sp, sizes, rs)
            : sampleAnswer(sample, sp, rs);
    if (g === null) return null;
    const grown = grownRound(g, tier);
    if (grown === null) return null;
    const derived = module.deriveClues(g, sp, grown, sizes);
    if (!module.isAnswer(g, sp, derived, variations)) return null;
    // A clue whose partner square has none cannot be shown symmetrically.
    if (kind === undefined || deal.symmetric === undefined)
      return { g, clues: derived };
    const list = derived[kind] as ClueList;
    const paired = shownOf(list).filter((i) => partnerOf(list, i) >= 0);
    return { g, clues: keeping(derived, kind, paired, elements) };
  };
  /** The index of the clue at clue `i`'s partner square under the deal's
   * symmetry, `-1` where it has none: a half turn takes a cell to the cell
   * as far from the end as it is from the start. */
  const partnerOf = (list: ClueList, i: number): number => {
    if (deal.universes[kind as string] !== "cells")
      throw new Error("deal: a symmetric hide is of clues at cells");
    return list.byAt[sp.cells.length - 1 - list.at[i]];
  };
  /** The clues `shown` in the units they are hidden in: each with its
   * partner where the deal is symmetric, alone otherwise. */
  const unitsOf = (clues: C, shown: readonly number[]): number[][] => {
    if (deal.symmetric === undefined) return shown.map((i) => [i]);
    const list = clues[kind as keyof C] as ClueList;
    const of = new Set(shown);
    const out: number[][] = [];
    for (const i of shown) {
      const j = partnerOf(list, i);
      if (j === i || !of.has(j)) out.push([i]);
      else if (i < j) out.push([i, j]);
    }
    return out;
  };
  /**
   * The clues with each of `kind`'s that may go hidden, a tier at a time from
   * the lowest up to `tier`, or `null` where the lowest does not finish the
   * board with every clue shown. A board of a tier is one of the tier below
   * with more hidden: one whose every clue the lowest tier does not finish is
   * slow to hide from, each try asking the higher tier (Mosaic's 10x10 Normal
   * deal took twice as long and its 20x25 three times, measured 2026-11-22).
   * Thorough, every clue is tried at each tier; otherwise none at the lowest
   * and as many as the board's shorter side at each above it.
   */
  const hideUpTo = (clues: C, tier: number): C | null => {
    if (kind === undefined) return clues;
    if (!finishes(clues, 0)) return null;
    let shown = shownOf(clues[kind] as ClueList);
    // A firing reads only the clues its bindings name, so the board finishes
    // without the clues the ladder never read; where a technique reads one
    // its bindings do not name, it does not, and every clue is tried. A unit
    // goes only where none of it was read.
    const read = cluesRead(module, board(clues), 0, kind as string);
    const pruned = unitsOf(clues, shown)
      .filter((u) => u.some((i) => read.has(i)))
      .flat()
      .sort((a, b) => a - b);
    if (finishes(keeping(clues, kind, pruned, elements), 0)) shown = pruned;
    for (let t = 0; t <= tier; t++) {
      const order = unitsOf(clues, shown);
      shuffle(order, rs);
      const tries = thorough ? order : order.slice(0, t === 0 ? 0 : Math.min(p.w, p.h));
      for (const unit of tries) {
        const without = shown.filter((j) => !unit.includes(j));
        if (finishes(keeping(clues, kind, without, elements), t)) shown = without;
      }
    }
    return keeping(clues, kind, shown, elements);
  };

  if (searches(module) && p.diff === module.tiers.length - 1) {
    if (kind === undefined) throw new Error("deal: a search tier hides no clue");
    const top = p.diff - 1;
    let draws = 0;
    let answer: Uint8Array = new Uint8Array(0);
    type Held = { all: C; shown: number[] };
    const held = (b: Held): C => keeping(b.all, kind, b.shown, elements);
    const got = dealUnreasonable<Held>({
      label: `fill: ${module.tiers[p.diff]} deal (${p.w}x${p.h})`,
      draw() {
        // A board of the lowest tier is drawn until there is one, so the
        // every-clue try is one in its count of boards and not of pictures,
        // most of which the lowest tier does not finish (the miscount took
        // Mosaic's 10x10 median left undecided from 43 to 65).
        const every = ++draws % EVERY_CLUE_DRAW === 0;
        const attempt = retryLimit(`fill: ${module.tiers[0]} board to strip`);
        for (;;) {
          attempt();
          const drawn = draw(0);
          if (drawn === null) continue;
          const clues = every ? drawn.clues : hideUpTo(drawn.clues, 0);
          if (clues === null) continue;
          answer = drawn.g;
          return { all: clues, shown: shownOf(clues[kind] as ClueList) };
        }
      },
      strip(b, one) {
        const order = unitsOf(b.all, b.shown);
        shuffle(order, rs);
        const hide = (run: readonly number[]) => {
          b.shown = b.shown.filter((j) => !run.includes(j));
        };
        const show = (run: readonly number[]) => {
          b.shown = [...b.shown, ...run].sort((x, y) => x - y);
        };
        if (thorough) {
          for (const unit of order) {
            hide(unit);
            if (!one()) show(unit);
          }
          return;
        }
        // The search is asked only of the unit whose loss stops the ladder,
        // and hiding stops at the first it keeps hidden, so the board keeps
        // the rest of its clues.
        const ladderFinishes = () => finishes(held(b), top);
        for (let from = 0; from < order.length; from += HIDING_RUN) {
          const run = order.slice(from, from + HIDING_RUN);
          hide(run.flat());
          if (ladderFinishes()) continue;
          show(run.flat());
          for (const unit of run) {
            hide(unit);
            if (ladderFinishes()) continue;
            if (one()) return;
            show(unit);
          }
        }
      },
      deduced: (b) => finishes(held(b), top),
      answer: (b, budget) => searchBoard(module, board(held(b)), budget),
    });
    return { desc: encodeDesc(deal, sp, held(got)), aux: encodeAnswer(answer) };
  }

  const attempt = retryLimit("fill: deal");
  for (;;) {
    attempt();
    const drawn = draw(p.diff);
    if (drawn === null) continue;
    const clues = hideUpTo(drawn.clues, p.diff);
    if (clues === null || !finishes(clues, p.diff)) continue;
    if (p.diff > 0 && finishes(clues, p.diff - 1)) continue;
    return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(drawn.g) };
  }
}

/** The indices of a list's clues. */
const shownOf = (list: ClueList): number[] => Array.from(list.at.keys());

/** The clues with only the clues `shown` of kind `kind`, by their indices
 * in its list. */
function keeping<C extends Clues<C>>(
  clues: C,
  kind: keyof C,
  shown: readonly number[],
  elements: number,
): C {
  const all = clues[kind] as ClueList;
  return {
    ...clues,
    [kind]: clueList(
      shown.map((i) => all.at[i]),
      shown.map((i) => all.v[i]),
      elements,
    ),
  };
}

/**
 * The clues of kind `kind`, by index, that a firing of the ladder read on its
 * way to finishing `board` at tier `cap`: each one a binding of the firing
 * names, by its cell or by its index.
 */
function cluesRead<C extends Clues<C>>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  cap: number,
  kind: string,
): ReadonlySet<number> {
  const list = board.dealt[kind as keyof C] as ClueList;
  const reads = module.techniques as unknown as Readonly<
    Record<string, { readonly reads?: Reads }>
  >;
  const read = new Set<number>();
  const { marks } = marksOf(module, board);
  let current: Reads | null = null;
  marks.recorder = (rec) => {
    if (current === null) return;
    const binding = (rec.reason as Said<Readonly<Record<string, number>>, unknown>)
      .binding;
    for (const name of current.cells) {
      const k = list.byAt[binding[name]];
      if (k >= 0) read.add(k);
    }
    for (const [name, of] of Object.entries(current.clues))
      if (of === kind) read.add(binding[name]);
  };
  // Every firing of a pass, as the solve makes them: one a pass would read
  // the whole board again for each.
  marks.wholePasses = true;
  runLadder(
    marks,
    ladderTechniques(
      marks,
      ladderOf(module, board).entries,
      { [TIERS]: cap },
      {},
      (e) => {
        current = reads[e.id]?.reads ?? null;
        return 0;
      },
    ),
  );
  return read;
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
  const blank = module.deriveClues(new Uint8Array(sp.cells.length), sp, {}, sizesOf(p));
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
