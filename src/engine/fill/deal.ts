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
import { placeSymmetricBlacks } from "../generate/symmetric-blacks.ts";
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
  boardSizeOf,
  type Clues,
  type FillBoard,
  marksOf,
  newBoard,
  solveBoard,
  spaceOf,
} from "./board.ts";
import {
  encodeDesc,
  type FillDeal,
  type FillParams,
  givenOf,
  optionOf,
  partitionOf,
  piecesOf,
  sizesOf,
  variationsOf,
} from "./game-id.ts";
import { type GrowSizes, growPartition } from "./grow.ts";
import { latinNumbers } from "./latin-numbers.ts";
import {
  type BuiltSample,
  type FirstCells,
  rampedShare,
  type ScatterSample,
  sampleAnswer,
  sampleDominoes,
  sampleLines,
  samplePicture,
  samplePieces,
} from "./sample.ts";
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
 * beside the partitions grown round it and the clues the params give
 * (`givenOf`); and where it grows a partition, what the parts hold on a
 * board. */
export type DealtFillModule<C> = SearchedFillModule<C> & {
  deriveClues(
    g: ArrayLike<number>,
    sp: GridSpace,
    grown: Grown,
    given: ReturnType<typeof givenOf>,
    /** A random one of `n`, which a kind dealt one in each group is put at
     * (`deal.oneIn`). */
    pick?: (n: number) => number,
  ): C;
  growBy?(sp: GridSpace, sizes: Readonly<Record<string, number>>): GrowSizes;
};

/**
 * Which try of a search tier's deal starts from every clue and not from a
 * board of the lowest tier. A board stripped from every clue is left with
 * more undecided (Mosaic's 10x10: a median of 62 squares of 100, against 41),
 * but no board of the lowest tier strips to some of the smallest boards
 * (none of Mosaic's 3x3 in five million tries), so one try in this many
 * gives them a deal and leaves the larger boards as they were. A deal of
 * `stripFrom: everyClue` starts every try so: Sticks' 8x10 took up to 3.7 s
 * from boards of the lowest tier and 1.7 s from every clue, against 2.6 s
 * for its hand-written generator, which did the same (2026-11-22).
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
  if ("scatter" in sample && sample.climb === true)
    return climbFill(module, deal, sample, p, rs);
  const sp = spaceOf(module, boardSizeOf(module, p));
  const variations = variationsOf(p);
  const sizes = sizesOf(p);
  const given = givenOf(deal, p);
  const board = (clues: C): FillBoard<C> =>
    newBoard(module, sp.w, sp.h, clues, variations);
  const finishes = (clues: C, cap: number): boolean =>
    solveBoard(module, board(clues), cap).verdict === "solved";
  const thorough = p.thorough ?? true;
  const kinds = hiddenKinds(deal, p);
  const kind = (kinds.length === 0 ? undefined : kinds[0]) as keyof C | undefined;
  if (kinds.length > 1 && deal.symmetric !== undefined)
    throw new Error("deal: a symmetric hide is of one kind");
  /** The clues with only `shown` of the hidden kinds, by their index in one
   * numbering of them all (`offsetsOf`). */
  const keeping = (clues: C, shown: readonly number[]): C =>
    keepingAll(clues, deal, kinds, sp, shown);
  /** Every hidden clue's index in that numbering. */
  const allShown = (clues: C): number[] => {
    const offsets = offsetsOf(clues, kinds);
    return Array.from({ length: offsets[offsets.length - 1] }, (_, i) => i);
  };
  const spent = { moves: 0 };
  /** The partition grown round `g` for tier `tier`, by its name, where the
   * deal grows one; `null` where this draw grew none. */
  const grownRound = (g: Uint8Array, tier: number): Grown | null => {
    const { grow } = deal;
    if (grow === undefined) return {};
    if (module.growBy === undefined)
      throw new Error("deal: a grown partition with no growBy");
    const withParts = (parts: Int32Array): C =>
      module.deriveClues(g, sp, { [grow.partition]: partitionOf(parts) }, given);
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
  /** The clues with the deal's Latin kind numbered round answer `g`, where
   * it has one. */
  const numbered = (clues: C, g: Uint8Array): C => {
    const { latin } = deal;
    if (latin === undefined) return clues;
    const n = sp.cells.length;
    const v = latinNumbers(g, sp, latin.under, rs);
    return { ...clues, [latin.kind]: clueList(sp.cells, v, n) };
  };
  /** The draws so far, which a ramp of the `first` cells' share counts. */
  let layouts = 0;
  const draw = (tier: number): { g: Uint8Array; clues: C } | null => {
    const g =
      "build" in sample
        ? buildAnswer(module, deal, sample, sp, p, rs, layouts++)
        : "dominoes" in sample
          ? sampleDominoes(sample, sp, rs)
          : "lines" in sample
            ? sampleLines(sample, sp, sizes, rs)
            : "picture" in sample
              ? samplePicture(sample, sp, rs)
              : "pieces" in sample
                ? samplePieces(sample, sp.w, sp.h, piecesOf(deal, p), rs)
                : sampleAnswer(
                    sample,
                    sp,
                    rs,
                    sample.first === undefined
                      ? null
                      : firstLaid(sample.first, deal, p, rs, layouts++),
                  );
    if (g === null) return null;
    const grown = grownRound(g, tier);
    if (grown === null) return null;
    const derived = numbered(
      module.deriveClues(g, sp, grown, given, (n) => randomUpto(rs, n)),
      g,
    );
    if (!module.isAnswer(g, sp, derived, variations)) return null;
    if (kind === undefined) return { g, clues: derived };
    const list = derived[kind] as ClueList;
    // A clue whose partner square has none cannot be shown symmetrically.
    const shown =
      deal.symmetric === undefined
        ? allShown(derived)
        : shownOf(list).filter((i) => partnerOf(list, i) >= 0);
    return { g, clues: keeping(derived, shown) };
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
    let shown = allShown(clues);
    // A firing reads only the clues its bindings name, so the board finishes
    // without the clues the ladder never read; where a technique reads one
    // its bindings do not name, it does not, and every clue is tried. A unit
    // goes only where none of it was read.
    const read = cluesRead(module, board(clues), 0, kinds);
    const pruned = unitsOf(clues, shown)
      .filter((u) => u.some((i) => read.has(i)))
      .flat()
      .sort((a, b) => a - b);
    if (finishes(keeping(clues, pruned), 0)) shown = pruned;
    for (let t = 0; t <= tier; t++) {
      const order = unitsOf(clues, shown);
      shuffle(order, rs);
      const tries = thorough ? order : order.slice(0, t === 0 ? 0 : Math.min(p.w, p.h));
      for (const unit of tries) {
        const without = shown.filter((j) => !unit.includes(j));
        if (finishes(keeping(clues, without), t)) shown = without;
      }
    }
    return keeping(clues, shown);
  };

  if (searches(module) && p.diff === module.tiers.length - 1 && kind === undefined) {
    // Every clue is shown, so a board is drawn again until the tier below
    // stops short of it and the search proves one answer (upstream
    // pattern.c's Unreasonable: most such pictures have several).
    const top = p.diff - 1;
    const got = dealUnreasonable<{ g: Uint8Array; clues: C }>({
      label: `fill: ${module.tiers[p.diff]} deal (${p.w}x${p.h})`,
      draw: () => draw(p.diff),
      deduced: (b) => finishes(b.clues, top),
      answer: (b, budget) => searchBoard(module, board(b.clues), budget),
    });
    return { desc: encodeDesc(deal, sp, got.clues), aux: encodeAnswer(got.g) };
  }
  if (searches(module) && p.diff === module.tiers.length - 1) {
    if (kind === undefined) throw new Error("deal: a search tier hides no clue");
    const top = p.diff - 1;
    let draws = 0;
    let answer: Uint8Array = new Uint8Array(0);
    type Held = { all: C; shown: number[] };
    const held = (b: Held): C => keeping(b.all, b.shown);
    const got = dealUnreasonable<Held>({
      label: `fill: ${module.tiers[p.diff]} deal (${p.w}x${p.h})`,
      draw() {
        // A board of the lowest tier is drawn until there is one, so the
        // every-clue try is one in its count of boards and not of pictures,
        // most of which the lowest tier does not finish (the miscount took
        // Mosaic's 10x10 median left undecided from 43 to 65).
        const every = deal.stripFrom === "everyClue" || ++draws % EVERY_CLUE_DRAW === 0;
        const attempt = retryLimit(`fill: ${module.tiers[0]} board to strip`);
        for (;;) {
          attempt();
          const drawn = draw(0);
          if (drawn === null) continue;
          const clues = every ? drawn.clues : hideUpTo(drawn.clues, 0);
          if (clues === null) continue;
          answer = drawn.g;
          return { all: clues, shown: allShown(clues) };
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
    // A board the hide flag asked to hide a kind hides one of it (upstream
    // boats.c refused a stripped board that showed every number).
    if (deal.hideFlag !== undefined && p.hides === true && !hidesAny(clues, deal, sp))
      continue;
    return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(drawn.g) };
  }
}

/** One draw of a climb in this many samples every cell afresh, so a climb
 * caught where it cannot get out starts over (upstream clusters.c's
 * `force`). */
const RESTART_EVERY = 100;

/** The positions the search of a climb's candidate at a search tier may try.
 * A candidate with several answers costs the search its whole budget to prove
 * so: at 5,000, a 9x11 Clusters deal took up to 143 s, and at this at most
 * 2.3 s in six (2026-10-28). */
const CLIMB_SEARCH = 200;

/**
 * The deal of a sample that climbs (`sample.climb`): a draw keeps the cells
 * the ladder decided on the last one the deal refused and samples the rest,
 * and one the tier below finishes has a cell turned to the other value, so
 * the draws climb toward a board of the tier instead of starting afresh.
 * The answer is the one the ladder or the search finds, which an unpaired
 * board's (`deal.unpair`) is, and not the sample. Upstream's clusters.c
 * `clusters_generate`, which climbed five times faster than fresh draws at
 * 7x7 Normal and seven at 8x8 (measured 2026-10-27).
 */
function climbFill<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  sample: ScatterSample,
  p: FillParams,
  rs: RandomState,
): { desc: string; aux: string } {
  if (deal.grow !== undefined) throw new Error("deal: a climb grows no partition");
  const sp = spaceOf(module, boardSizeOf(module, p));
  const variations = variationsOf(p);
  const given = givenOf(deal, p);
  const board = (clues: C): FillBoard<C> =>
    newBoard(module, sp.w, sp.h, clues, variations);
  const { value, share } = sample.scatter;
  if (share <= 0) throw new Error("deal: a climb samples no cell");
  const other = (v: number): number => (v === value ? sample.rest : value);
  /** What the ladder decided on the last draw, 0 on a cell it left open. */
  const position = new Uint8Array(sp.cells.length);
  let draws = 0;
  /** A board's clues as the next draw deals them, or `null` where it dealt
   * none. */
  const drawn = (): C | null => {
    const whole = ++draws % RESTART_EVERY === 0;
    const g = sampleAnswer(sample, sp, rs, whole ? null : position) as Uint8Array;
    const clues =
      sample.mend === true
        ? mended(module, g, sp, given, variations, other)
        : module.deriveClues(g, sp, {}, given, (n) => randomUpto(rs, n));
    if (clues === null || !module.isAnswer(g, sp, clues, variations)) {
      position.fill(0);
      return null;
    }
    return deal.unpair === undefined
      ? clues
      : unpaired(clues, deal.unpair as keyof C, sp);
  };
  /** The board the tier below the asked one leaves, `null` where it is no
   * board of the asked tier: the climb's next step is taken from where the
   * ladder stopped, and a board it finished, too easy, has a cell turned. */
  const below = (clues: C, tier: number): FillBoard<C> | null => {
    const b = board(clues);
    if (tier === 0) return b;
    const got = solveBoard(module, b, tier - 1);
    position.set(got.values);
    if (got.verdict === "solved") {
      const c = sp.cells[randomUpto(rs, sp.cells.length)];
      position[c] = other(position[c]);
    }
    return got.verdict === "unsolved" ? { ...b, values: got.values } : null;
  };

  if (searches(module) && p.diff === module.tiers.length - 1) {
    const top = p.diff - 1;
    let answer: Uint8Array = new Uint8Array(0);
    const clues = dealUnreasonable<C>({
      label: `fill: ${module.tiers[p.diff]} climb (${p.w}x${p.h})`,
      draw() {
        const clues = drawn();
        return clues !== null && below(clues, p.diff) !== null ? clues : null;
      },
      deduced: (clues) => solveBoard(module, board(clues), top).verdict === "solved",
      answer(clues, budget) {
        const got = searchBoard(module, board(clues), budget ?? CLIMB_SEARCH);
        if (got.kind === "one") answer = got.solution;
        return got;
      },
    });
    return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(answer) };
  }

  const attempt = retryLimit("fill: climb");
  for (;;) {
    attempt();
    const clues = drawn();
    if (clues === null) continue;
    const from = below(clues, p.diff);
    if (from === null) continue;
    const got = solveBoard(module, from, p.diff);
    position.set(got.values);
    if (got.verdict === "solved")
      return { desc: encodeDesc(deal, sp, clues), aux: encodeAnswer(got.values) };
  }
}

/**
 * The clues `g` deals once each cell a rule breaks at has taken the other
 * value, the first in reading order at a time, until none breaks; `null`
 * where turning a cell for each of the board's cells left one breaking.
 * Upstream's clusters.c turns a tile with none of its color beside it so.
 */
function mended<C>(
  module: DealtFillModule<C>,
  g: Uint8Array,
  sp: GridSpace,
  given: ReturnType<typeof givenOf>,
  variations: readonly string[],
  other: (v: number) => number,
): C | null {
  for (let turned = 0; turned <= sp.cells.length; turned++) {
    const clues = module.deriveClues(g, sp, {}, given);
    let first = Number.POSITIVE_INFINITY;
    for (const v of module.violations(g, sp, clues, variations))
      for (const c of v.at) first = Math.min(first, c);
    if (first === Number.POSITIVE_INFINITY) return clues;
    g[first] = other(g[first]);
  }
  return null;
}

/**
 * The clues with each two of kind `kind` side by side and alike taken off,
 * in reading order, each paired with the nearest earlier of its neighbors
 * first. Two alike side by side may be meant only by each other: upstream's
 * clusters.c takes them off, so a board's answer need not keep them.
 */
function unpaired<C extends Clues<C>>(clues: C, kind: keyof C, sp: GridSpace): C {
  const list = clues[kind] as ClueList;
  const off = new Set<number>();
  for (const [i, c] of list.at.entries()) {
    if (off.has(i)) continue;
    const earlier = sp.adj4[c].filter((o) => o < c).sort((a, b) => b - a);
    for (const o of earlier) {
      const j = list.byAt[o];
      if (j < 0 || off.has(j) || list.v[j] !== list.v[i]) continue;
      off.add(i);
      off.add(j);
      break;
    }
  }
  const shown = shownOf(list).filter((i) => !off.has(i));
  return keepingOf(clues, kind, shown, sp.cells.length);
}

/** The indices of a list's clues. */
const shownOf = (list: ClueList): number[] => Array.from(list.at.keys());

/** The kinds the deal hides on a board of `p` (`deal.hide`), in one random
 * order together: the hide flag's too where `p` has it on. */
const hiddenKinds = (deal: FillDeal, p: FillParams): readonly string[] => {
  const kinds =
    deal.hide === undefined
      ? []
      : typeof deal.hide === "string"
        ? [deal.hide]
        : deal.hide;
  return deal.hideFlag !== undefined && p.hides === true
    ? [...kinds, deal.hideFlag.kind]
    : kinds;
};

/** Whether `clues` hide one of the hide flag's kind: fewer than its
 * universe. */
function hidesAny<C extends Clues<C>>(
  clues: C,
  deal: FillDeal,
  sp: GridSpace,
): boolean {
  const kind = deal.hideFlag?.kind;
  if (kind === undefined) return false;
  return (
    (clues[kind as keyof C] as ClueList).at.length < sp[deal.universes[kind]].length
  );
}

/** Where each hidden kind's clues start in one numbering of them all, the
 * kinds in turn, and after the last where they end. */
function offsetsOf<C extends Clues<C>>(clues: C, kinds: readonly string[]): number[] {
  const out = [0];
  for (const k of kinds)
    out.push(out[out.length - 1] + (clues[k as keyof C] as ClueList).at.length);
  return out;
}

/** The clues with only the clues `shown` of the hidden kinds, by their
 * indices in one numbering of them all ({@link offsetsOf}). */
function keepingAll<C extends Clues<C>>(
  clues: C,
  deal: FillDeal,
  kinds: readonly string[],
  sp: GridSpace,
  shown: readonly number[],
): C {
  const offsets = offsetsOf(clues, kinds);
  let kept = clues;
  for (const [n, k] of kinds.entries()) {
    const of = shown.filter((i) => i >= offsets[n] && i < offsets[n + 1]);
    kept = keepingOf(
      kept,
      k as keyof C,
      of.map((i) => i - offsets[n]),
      sp[deal.universes[k]].length,
      n === 0 ? (deal.leaves as keyof C | undefined) : undefined,
    );
  }
  return kept;
}

/** The clues with only the clues `shown` of kind `kind`, by their indices
 * in its list. Where kind `leaves` lies under `kind` (`deal.leaves`), it is
 * dealt on each cell a clue of `kind` is hidden from, and on none it is shown
 * on. */
function keepingOf<C extends Clues<C>>(
  clues: C,
  kind: keyof C,
  shown: readonly number[],
  elements: number,
  leaves?: keyof C,
): C {
  const all = clues[kind] as ClueList;
  const kept = {
    ...clues,
    [kind]: clueList(
      shown.map((i) => all.at[i]),
      shown.map((i) => all.v[i]),
      elements,
    ),
  };
  if (leaves === undefined) return kept;
  const on = new Set(shown.map((i) => all.at[i]));
  const under = [...(clues[leaves] as ClueList).at, ...all.at]
    .filter((c, i, cs) => !on.has(c) && cs.indexOf(c) === i)
    .sort((a, b) => a - b);
  return {
    ...kept,
    [leaves]: clueList(
      under,
      under.map(() => 0),
      elements,
    ),
  };
}

/**
 * The clues of the kinds `kinds`, by their index in one numbering of them
 * all ({@link offsetsOf}), that a firing of the ladder read on its way to
 * finishing `board` at tier `cap`: each one a binding of the firing names,
 * by its cell or by its index.
 */
function cluesRead<C extends Clues<C>>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  cap: number,
  kinds: readonly string[],
): ReadonlySet<number> {
  const offsets = offsetsOf(board.dealt, kinds);
  const lists = kinds.map((k) => board.dealt[k as keyof C] as ClueList);
  const reads = module.techniques as unknown as Readonly<
    Record<string, { readonly reads?: Reads }>
  >;
  const read = new Set<number>();
  /** Each hidden clue at cell `c`, read. */
  const readAt = (c: number) => {
    for (const [n, list] of lists.entries())
      if (list.byAt[c] >= 0) read.add(offsets[n] + list.byAt[c]);
  };
  const { marks, entries } = marksOf(module, board);
  let current: Reads | null = null;
  marks.recorder = (rec) => {
    if (current === null) return;
    const binding = (
      rec.reason as Partial<Said<Readonly<Record<string, number>>, unknown>>
    ).binding;
    // A technique run on placing strikes inside the placement, with no
    // binding of its own: it reads the cell placed, which the firing that
    // placed it named, and each cell it strikes.
    if (binding === undefined) {
      readAt(rec.y * board.w + rec.x);
      return;
    }
    for (const name of current.cells) readAt(binding[name]);
    for (const [name, of] of Object.entries(current.clues)) {
      const n = kinds.indexOf(of);
      if (n >= 0) read.add(offsets[n] + binding[name]);
    }
  };
  // Every firing of a pass, as the solve makes them: one a pass would read
  // the whole board again for each.
  marks.wholePasses = true;
  runLadder(
    marks,
    ladderTechniques(marks, entries, { [TIERS]: cap }, {}, (e) => {
      current = reads[e.id]?.reads ?? null;
      return 0;
    }),
  );
  return read;
}

/** The cells `first` deals its value on, by the share and the symmetry the
 * options give, 0 on every other. Upstream's lightup.c `set_blacks`. */
function firstLaid(
  first: FirstCells,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
  draw: number,
): Uint8Array {
  const start = new Uint8Array(p.w * p.h);
  placeSymmetricBlacks({
    w: p.w,
    h: p.h,
    blackpc: rampedShare(first.ramp, optionOf(deal, p, first.share), draw),
    symm: optionOf(deal, p, first.symmetry),
    rs,
    isBlack: (x, y) => start[y * p.w + x] === first.value,
    setBlack: (x, y, on) => {
      start[y * p.w + x] = on ? first.value : 0;
    },
  });
  return start;
}

/**
 * An answer built by the ladder (`sample: build`): a random value of its
 * domain, or the build's one value, on a random undecided cell, then every
 * cell the whole ladder decides from those, until none is left; `null` where
 * a placement left no answer. The board is built on the clues a blank board
 * derives, which are none where the clues are the placed cells (Unruly's
 * givens). Upstream's unruly.c `unruly_fill_game`. With `first`, its value is
 * dealt first on a share of the cells, as symmetric as the options ask, and
 * the build is on the clues those cells derive with every clue of the hidden
 * kind hidden (Light Up's walls, upstream's lightup.c `set_blacks`).
 */
function buildAnswer<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  sample: BuiltSample,
  sp: GridSpace,
  p: FillParams,
  rs: RandomState,
  draw: number,
): Uint8Array | null {
  const { first } = sample;
  const start =
    first === undefined
      ? new Uint8Array(sp.cells.length)
      : firstLaid(first, deal, p, rs, draw);
  const derived = module.deriveClues(start, sp, {}, givenOf(deal, p));
  // A Latin kind is a Latin square's on the cells built round, so the ladder
  // reads numbers none of which repeats (upstream singles.c's new_game_desc).
  const { latin } = deal;
  const numbered =
    latin === undefined
      ? derived
      : {
          ...derived,
          [latin.kind]: clueList(
            sp.cells,
            latinNumbers(start, sp, latin.under, rs),
            sp.cells.length,
          ),
        };
  const blank =
    first === undefined || deal.hide === undefined
      ? numbered
      : keepingAll(numbered, deal, hiddenKinds(deal, p), sp, []);
  const board = newBoard(module, sp.w, sp.h, blank, variationsOf(p));
  // One set of marks the whole build, the ladder run again after each
  // placement: a fresh solve each time cost a 12x16 Light Up deal seconds.
  const { marks, ok, entries } = marksOf(module, board);
  if (!ok) return null;
  const ladder = ladderTechniques(
    marks,
    entries,
    { [TIERS]: module.tiers.length - 1 },
    {},
  );
  if (runLadder(marks, ladder)) return null;
  const build = sample.build === true ? null : sample.build;
  const order = Array.from(sp.cells);
  if (build?.order === "upward")
    order.sort((a, b) => Math.floor(b / sp.w) - Math.floor(a / sp.w) || a - b);
  else shuffle(order, rs);
  const open = order.filter((c) => board.fixed[c] === 0);
  // With a share, each cell in turn takes the build's value at that chance
  // where it may, and another value otherwise; without, the value alone.
  const only = build === null || build.share !== undefined ? null : build.value;
  for (const c of order) {
    if (marks.grid[c] !== 0) continue;
    const values: number[] = [];
    for (let m = module.domainOf(sp, blank, c); m !== 0; m &= m - 1) {
      const v = 31 - Math.clz32(m & -m);
      if (marks.has(c, v) && (only === null || v === only)) values.push(v);
    }
    if (values.length === 0) {
      if (only === null) return null;
      continue;
    }
    marks.place(c, pickValue(values, build, rs));
    if (runLadder(marks, ladder)) return null;
  }
  const least = build?.least;
  if (
    least !== undefined &&
    open.filter((c) => marks.grid[c] === build?.value).length < least * open.length
  )
    return null;
  return Uint8Array.from(marks.grid);
}

/** The value a build lays on a cell that may hold `values`: with a share,
 * the build's own at that chance and another otherwise; else one at random. */
function pickValue(
  values: readonly number[],
  build: Exclude<BuiltSample["build"], true> | null,
  rs: RandomState,
): number {
  const share = build?.share;
  if (build === null || share === undefined)
    return values[randomUpto(rs, values.length)];
  const others = values.filter((v) => v !== build.value);
  if (others.length === 0) return build.value;
  if (values.includes(build.value) && randomUpto(rs, CHANCE) < share * CHANCE)
    return build.value;
  return others[randomUpto(rs, others.length)];
}

/** The resolution a build's share is drawn at. */
const CHANCE = 1 << 20;
