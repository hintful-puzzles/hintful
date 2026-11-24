/**
 * A fill game's deal: draw an answer, check it is one, derive its clues,
 * hide what `deal.hide` says may go, and keep the board the ladder finishes
 * at the asked tier and not at the tier below; or, at a search tier, the
 * board with one answer that the search proves and the ladder does not
 * reach. Its desc is the clues, and its `aux` the answer
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 7).
 */

import { shuffle } from "../board/shuffle.ts";
import { drawRejected } from "../contract/deal-census.ts";
import { retryLimit } from "../contract/retry-limit.ts";
import { placeSymmetricBlacks } from "../generate/symmetric-blacks.ts";
import { orbitOf, SET_BLACKS_SYMM } from "../generate/symmetry.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import { dealUnreasonable } from "../solve/answer-search.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  type Partition,
} from "../solve/describe-runtime.ts";
import {
  type Caps,
  ladderTechniques,
  runLadder,
  type Said,
} from "../solve/ladder-runtime.ts";
import { encodeAnswer } from "./answer.ts";
import {
  type Clues,
  capsOf,
  type FillBoard,
  marksOf,
  newBoard,
  paramSpaceOf,
  solveBoard,
  spaceOf,
} from "./board.ts";
import { encodeDesc } from "./desc.ts";
import { dividePartition } from "./divide.ts";
import { firstKindEach } from "./first-kind.ts";
import {
  dividesOn,
  elementCount,
  type FillDeal,
  type FillParams,
  givenOf,
} from "./game-id.ts";
import { type GrowSizes, growPartition } from "./grow.ts";
import { latinNumbers } from "./latin-numbers.ts";
import { type OneKindModule, oneKindEach } from "./one-kind.ts";
import { within } from "./params/bounds.ts";
import { variationsOf } from "./params/modifiers.ts";
import { optionOf, symmetricOf, symmetryOf } from "./params/options.ts";
import { sizesOf } from "./params/settings.ts";
import { piecesOf } from "./params/tally.ts";
import {
  type BuiltSample,
  type FirstCells,
  rampedShare,
  type ScatterSample,
  sampleAnswer,
  sampleDominoes,
  sampleLatin,
  sampleLines,
  samplePicture,
  samplePieces,
} from "./sample.ts";
import {
  type SearchedFillModule,
  searchAgainst,
  searchBoard,
  searchedPositions,
  searches,
} from "./search.ts";
import { partitionOf } from "./segments/segment.ts";

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
export type DealtFillModule<C> = SearchedFillModule<C> &
  OneKindModule<C> & {
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
    /** Where a hidden clue of `kind` at `at` goes in the hide, read on the
     * clues as dealt (`deal.hideBy`): a higher one is hidden first. */
    hideRank?(sp: GridSpace, cl: C, kind: string, at: number): number;
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

/**
 * Draws in a row the lowest tier does not finish with every clue before a
 * deal keeps one a higher tier finishes and hides from it there. Mosaic's
 * narrow boards (40x5, 3x50 at Normal) are seldom finished by Easy and gave
 * up after 10,000 draws without this; at 64 no menu board of Mosaic, Light
 * Up or Boats deals with a different count of instructions than with none,
 * where 32 cost Mosaic's 8x10 Normal 37% (2026-11-23).
 */
const SHORT_OF_LOWEST_RUN = 64;

/** The positions the search for an answer under a divided partition may try
 * (`sample: { search: true }`) before the draw is thrown away and the
 * partition divided again. */
const ANSWER_SEARCH_BUDGET = 2_000;

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
  const sp = paramSpaceOf(module, p);
  const variations = variationsOf(p);
  const sizes = sizesOf(p);
  const given = givenOf(deal, p);
  const board = (clues: C): FillBoard<C> =>
    newBoard(module, sp.w, sp.h, clues, variations);
  const finishes = (clues: C, cap: number | Caps): boolean =>
    solveBoard(module, board(clues), cap).verdict === "solved";
  /** For each other scale this board's ladder runs an entry of, the caps of
   * the asked tier with that scale a tier under its top: a board is held to
   * need the top of each, as it is held to need the asked tier. */
  const belowTops: readonly Caps[] = Object.entries(module.scales ?? {})
    .filter(
      ([scale, tiers]) =>
        tiers.length > 1 &&
        module.ladder.some(
          (e) =>
            e.scale === scale &&
            (e.variation === undefined || variations.includes(e.variation)),
        ),
    )
    .map(([scale, tiers]) => ({
      ...capsOf(module, p.diff),
      [scale]: tiers.length - 2,
    }));
  const thorough = p.thorough ?? true;
  const kinds = hiddenKinds(deal, p);
  const kind = (kinds.length === 0 ? undefined : kinds[0]) as keyof C | undefined;
  const symmetry = symmetricOf(deal, p);
  if (kinds.length > 1 && symmetry !== "none")
    throw new Error("deal: a symmetric hide is of one kind");
  /** The clues with only `shown` of the hidden kinds, by their index in one
   * numbering of them all (`offsetsOf`). */
  const keeping = (clues: C, shown: readonly number[]): C =>
    keepingAll(clues, deal, kinds, sp, shown);
  /** The hidden kinds this board hides whole (`deal.hideWhole`). */
  const whole = kinds.filter((k) => {
    const h = deal.hideWhole?.[k];
    return (
      h !== undefined &&
      p.diff < h.below &&
      (h.with === undefined || variations.includes(h.with)) &&
      within(h.bounds, p)
    );
  });
  /** Every hidden clue's index in that numbering, but those of a kind hidden
   * whole: a board that does not finish without them is drawn again. */
  const allShown = (clues: C): number[] => {
    const offsets = offsetsOf(clues, kinds);
    const hiddenWhole = (i: number): boolean =>
      whole.includes(kinds[offsets.findLastIndex((o) => o <= i)]);
    return Array.from({ length: offsets[offsets.length - 1] }, (_, i) => i).filter(
      (i) => !hiddenWhole(i),
    );
  };
  const spent = { moves: 0 };
  /** The partition grown round `g` for tier `tier`, by its name, where the
   * deal grows one; `null` where this draw grew none. */
  /** The partitions divided apart from the answer, by name, where the deal
   * divides any; `null` where this draw left a cell alone. */
  const divided = (): Grown | null => {
    const out: Record<string, Partition> = {};
    for (const divide of dividesOn(deal, variations)) {
      const parts = dividePartition(divide, sp, sizes, rs);
      if (parts === null) return drawRejected("fill: the division left a cell alone");
      out[divide.partition] = partitionOf(parts);
    }
    return out;
  };
  const grownRound = (g: Uint8Array, tier: number): Grown | null => {
    const { grow, divide } = deal;
    if (divide !== undefined) return divided();
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
  /**
   * The tier a build ladders at, which climbs a tier at each build that met
   * a dead end or built an answer that breaks a rule. A higher tier steers
   * some builds clear of both (Unruly's 12x16 built at the lowest took 1,169
   * draws a deal and 3 at its whole ladder, Singles' 12x12 Tricky 259 and 1)
   * and decides nothing in others, where it is only paid for (Light Up's
   * 12x16 built the same answers at the lowest, a third of the cost;
   * 2026-11-23).
   */
  let buildTier = 0;
  const climbBuild = (stage: string): null => {
    buildTier = Math.min(buildTier + 1, module.tiers.length - 1);
    return drawRejected(stage);
  };
  const built = (sample: BuiltSample): Uint8Array | null => {
    const g = buildAnswer(module, deal, sample, sp, p, rs, layouts++, buildTier);
    return g === DEAD_END ? climbBuild("fill: the build met a dead end") : g;
  };
  /** An answer and the partition it is searched under, divided first; `null`
   * where the division or the search came to nothing. */
  const searched = (): { g: Uint8Array; grown: Grown } | null => {
    const grown = divided();
    if (grown === null) return null;
    const blank = new Uint8Array(sp.cells.length);
    const found = searchedPositions(
      module,
      board(module.deriveClues(blank, sp, grown, given)),
      { budget: ANSWER_SEARCH_BUDGET, random: rs },
      1,
    );
    if (found === null || found.length === 0)
      return drawRejected("fill: the search found no answer under the partition");
    return { g: found[0], grown };
  };
  const draw = (tier: number): { g: Uint8Array; clues: C } | null => {
    if ("search" in sample) {
      const got = searched();
      return got === null ? null : dealt(got.g, got.grown, tier);
    }
    const g =
      "build" in sample
        ? built(sample)
        : "dominoes" in sample
          ? sampleDominoes(sample, sp, rs)
          : "lines" in sample
            ? sampleLines(sample, sp, sizes, rs)
            : "picture" in sample
              ? samplePicture(sample, sp, rs)
              : "pieces" in sample
                ? samplePieces(sample, sp.w, sp.h, piecesOf(deal, p), rs)
                : "latin" in sample
                  ? sampleLatin(sp, rs)
                  : sampleAnswer(
                      sample,
                      sp,
                      rs,
                      sample.first === undefined
                        ? null
                        : firstLaid(sample.first, deal, p, rs, layouts++),
                    );
    if (g === null) return drawRejected("fill: the sample drew no answer");
    const grown = grownRound(g, tier);
    return grown === null ? null : dealt(g, grown, tier);
  };
  /** Answer `g`'s clues on the partitions `grown`, every one shown but those
   * of a kind hidden whole; `null` where they are no board. */
  const dealt = (
    g: Uint8Array,
    grown: Grown,
    tier: number,
  ): { g: Uint8Array; clues: C } | null => {
    // The board's units, where it deals the partition among them.
    const on = spaceOf(module, {
      w: sp.w,
      h: sp.h,
      dealt: { ...sizes, ...grown },
      variations,
    });
    const derived = oneKindEach(
      module,
      deal,
      on,
      firstKindEach(
        deal,
        p,
        numbered(
          module.deriveClues(g, on, grown, given, (n) => randomUpto(rs, n)),
          g,
        ),
      ),
      tier,
      p.only === true,
      rs,
    );
    if (derived === null) return drawRejected("fill: a part suits none of the kinds");
    if (!module.isAnswer(g, on, derived, variations))
      return "build" in sample
        ? climbBuild("fill: the answer built breaks a rule")
        : drawRejected("fill: the answer drawn breaks a rule");
    if (kind === undefined) return { g, clues: derived };
    const list = derived[kind] as ClueList;
    // A clue a square of whose orbit has none cannot be shown symmetrically.
    const shown =
      symmetry === "none"
        ? allShown(derived)
        : shownOf(list).filter((i) => orbitClues(list, i) !== null);
    return { g, clues: keeping(derived, shown) };
  };
  /** The indices of the clues at the squares of clue `i`'s orbit under the
   * deal's symmetry, its own first, or `null` where a square has none. */
  const orbitClues = (list: ClueList, i: number): number[] | null => {
    if (deal.universes[kind as string] !== "cells")
      throw new Error("deal: a symmetric hide is of clues at cells");
    const out: number[] = [];
    for (const c of orbitOf(symmetry, sp.w, sp.h, list.at[i])) {
      const j = list.byAt[c];
      if (j < 0) return null;
      out.push(j);
    }
    return out;
  };
  /** The clues `shown` in the units they are hidden in: each with those of
   * its orbit still shown where the deal is symmetric, alone otherwise. */
  const unitsOf = (clues: C, shown: readonly number[]): number[][] => {
    if (symmetry === "none") return shown.map((i) => [i]);
    const list = clues[kind as keyof C] as ClueList;
    const of = new Set(shown);
    const out: number[][] = [];
    for (const i of shown) {
      const unit = (orbitClues(list, i) ?? [i]).filter((j) => of.has(j));
      // Once, at the orbit's first clue still shown.
      if (Math.min(...unit) === i) out.push(unit);
    }
    return out;
  };
  /** `units`, shuffled, in the order the deal hides them: every unit of the
   * kinds `deal.hideFirst` names before any of the rest, each side in a
   * random order, and a kind's units ranked by `deal.hideBy` taking its
   * places in that order higher first, so the kinds stay mixed as they
   * fell. A unit is of its first clue's kind and ranks as it does. */
  const hideOrder = (clues: C, units: number[][]): number[][] => {
    shuffle(units, rs);
    const { hideFirst } = deal;
    const { hideRank } = module;
    if (hideFirst === undefined && hideRank === undefined) return units;
    const offsets = offsetsOf(clues, kinds);
    const kindOf = (u: readonly number[]): number =>
      offsets.findLastIndex((o) => o <= u[0]);
    let order = units;
    if (hideRank !== undefined) {
      const rank = (u: readonly number[]): number => {
        const k = kindOf(u);
        const list = clues[kinds[k] as keyof C] as ClueList;
        return hideRank(sp, clues, kinds[k], list.at[u[0] - offsets[k]]);
      };
      // Each kind's units, higher first, a stable sort keeping those ranked
      // alike in their random order; then dealt back into the kind's places.
      const byKind = kinds.map((_, k) =>
        units
          .filter((u) => kindOf(u) === k)
          .map((u) => ({ u, rank: rank(u) }))
          .sort((a, b) => b.rank - a.rank)
          .map(({ u }) => u),
      );
      const next = kinds.map(() => 0);
      order = units.map((u) => {
        const k = kindOf(u);
        return byKind[k][next[k]++];
      });
    }
    if (hideFirst === undefined) return order;
    const later = (u: readonly number[]): number =>
      hideFirst.includes(kinds[kindOf(u)]) ? 0 : 1;
    // A stable sort keeps each side's units in their order.
    return order.sort((a, b) => later(a) - later(b));
  };
  /**
   * The shortest run from the end of `units` whose clues alone of the
   * hidden kinds tier `t` finishes the board with, found by halving: the
   * whole of them finishes it. A thorough hide tries each of the run after
   * it, as it would each of the whole: a board of 100 clues of which 15
   * stay is some 7 solves and 15, not 100 (Boats' 10x10, 2026-11-23).
   *
   * The end, since a hide in order drops the units it tries first: kept from
   * the start, `deal.hideFirst`'s givens alone stayed, and a Mathrax Easy
   * board showed no clue.
   */
  const shortestRun = (clues: C, units: readonly number[][], t: number): number[] => {
    let lo = 0;
    let hi = units.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (
        finishes(
          keeping(
            clues,
            units
              .slice(units.length - mid)
              .flat()
              .sort(byIndex),
          ),
          t,
        )
      )
        hi = mid;
      else lo = mid + 1;
    }
    return units
      .slice(units.length - hi)
      .flat()
      .sort(byIndex);
  };
  /**
   * The clues with each of `kind`'s that may go hidden: at the lowest tier,
   * and then at `tier`; `null` where the lowest does not finish the board
   * with every clue shown.
   *
   * Hiding at a tier above the lowest is slow, each try asking the higher
   * tier, so a draw the lowest does not finish is drawn again, though it is
   * a board of a higher one, until {@link SHORT_OF_LOWEST_RUN} such draws
   * in a row: then it is hidden from at the lowest tier up to `tier` that
   * finishes it. Hidden from so at once, Mosaic's 12x15 Normal deal took
   * 84 ms against 43, its Unreasonable 240 against 131, and Light Up's 12x16
   * Normal 68 against 80, bundled (2026-11-23). The tiers between the lowest and `tier` hide nothing that
   * `tier` would not and cost a pass each (Boats' 10x10 Hard, 507 solves a
   * deal against 404 without them). Thorough, each tier keeps its shortest
   * run and then tries every clue of it; otherwise none is tried at the
   * lowest and as many as the board's shorter side at `tier`.
   *
   * `forSearch` hides at that one tier, and skips the shortest run, for a
   * hide a search's strip follows: the shortest run there took Mosaic's 12x15 Unreasonable deal from 2.6 G instructions
   * to 4.4 and Bricks' 8x10 from 0.51 to 0.46 (2026-11-23).
   */
  let shortOfLowest = 0;
  const hideUpTo = (clues: C, tier: number, forSearch = false): C | null => {
    if (kind === undefined) return clues;
    // A draw the asked tier does not finish the lowest does not either, and
    // the lowest's solve is the cheaper; the deal holds the board to the
    // asked tier once its clues are hidden. Asking the asked tier first cost
    // Mosaic's 8x10 Normal deal a third more (2026-11-23).
    let from = 0;
    if (finishes(clues, 0)) shortOfLowest = 0;
    else {
      if (++shortOfLowest < SHORT_OF_LOWEST_RUN) return null;
      from = 1;
      while (from <= tier && !finishes(clues, from)) from++;
      if (from > tier) return null;
    }
    let shown = allShown(clues);
    // A firing reads only the clues its bindings name, so the board finishes
    // without the clues the ladder never read; where a technique reads one
    // its bindings do not name, it does not, and every clue is tried. A unit
    // goes only where none of it was read.
    const read = cluesRead(module, board(clues), from, kinds);
    // A kind `from` reads none of is one only a higher tier reads (a sign
    // above a Latin square's singles): kept whole for `tier` to hide from,
    // where pruned at `from` no board of `tier` was left. It costs Boats'
    // 10x10 Normal and Tricky deals 20 to 24 ms against 11 to 14
    // (2026-11-23).
    const offsets = offsetsOf(clues, kinds);
    const unread = kinds.map((_, n) => {
      if (tier === from) return false;
      for (let j = offsets[n]; j < offsets[n + 1]; j++) if (read.has(j)) return false;
      return true;
    });
    const later = (i: number): boolean => unread[offsets.findLastIndex((o) => o <= i)];
    const pruned = unitsOf(clues, shown)
      .filter((u) => u.some((i) => read.has(i) || later(i)))
      .flat()
      .sort(byIndex);
    if (finishes(keeping(clues, pruned), from)) shown = pruned;
    const atFrom = (units: number[][]): number[][] =>
      units.filter((u) => !u.some(later));
    if (thorough && !forSearch) {
      const order = hideOrder(clues, atFrom(unitsOf(clues, shown)));
      // `from` reads none of the kept, so finishes as well without them.
      const kept = shown.filter(later);
      shown = [...shortestRun(clues, order, from), ...kept].sort(byIndex);
    }
    for (const t of tier > from && !forSearch ? [from, tier] : [from]) {
      const units = unitsOf(clues, shown);
      let order = hideOrder(clues, t === from ? atFrom(units) : units);
      // The asked tier halves first as well: a kind `from` reads none of
      // comes to it whole, and Adjacent's 5x5 Hard tried its 25 givens one
      // at a time there, 26 solves a draw against 7 (2026-11-23).
      if (thorough && t !== from) {
        shown = shortestRun(clues, order, t);
        order = hideOrder(clues, unitsOf(clues, shown));
      }
      const tries = thorough
        ? order
        : order.slice(0, t === from ? 0 : Math.min(p.w, p.h));
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
      answer: (b, budget) => searchAgainst(module, board(b.clues), b.g, budget),
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
        // A board the lowest tier finishes is drawn until there is one, and
        // hidden from at that tier, so the every-clue try is one in its count
        // of boards and not of pictures, most of which the ladder does not
        // finish (the miscount took Mosaic's 10x10 median left undecided from
        // 43 to 65).
        const every = deal.stripFrom === "everyClue" || ++draws % EVERY_CLUE_DRAW === 0;
        const attempt = retryLimit("fill: a board to strip");
        for (;;) {
          attempt();
          const drawn = draw(0);
          if (drawn === null) continue;
          const clues = every ? drawn.clues : hideUpTo(drawn.clues, top, true);
          if (clues === null) {
            drawRejected("fill: the lowest tier stops short of every clue");
            continue;
          }
          answer = drawn.g;
          return { all: clues, shown: allShown(clues) };
        }
      },
      strip(b, one) {
        const order = hideOrder(b.all, unitsOf(b.all, b.shown));
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
      answer: (b, budget) => searchAgainst(module, board(held(b)), answer, budget),
    });
    return { desc: encodeDesc(deal, sp, held(got)), aux: encodeAnswer(answer) };
  }

  const attempt = retryLimit("fill: deal");
  for (;;) {
    attempt();
    const drawn = draw(p.diff);
    if (drawn === null) continue;
    const clues = hideUpTo(drawn.clues, p.diff);
    if (clues === null) {
      drawRejected("fill: the lowest tier stops short of every clue");
      continue;
    }
    if (!finishes(clues, p.diff)) {
      drawRejected("fill: the tier stops short with the clues left");
      continue;
    }
    if (p.diff > 0 && finishes(clues, p.diff - 1)) {
      drawRejected("fill: the tier below finishes the board");
      continue;
    }
    // Upstream's solo.c merges Killer cages until the grade is
    // `DIFF_KINTERSECT` on the killer scale as well as the asked tier.
    if (belowTops.some((caps) => finishes(clues, caps))) {
      drawRejected("fill: another scale's tier below its top finishes the board");
      continue;
    }
    // A board the hide flag asked to hide a kind hides one of it (upstream
    // boats.c refused a stripped board that showed every number).
    if (deal.hideFlag !== undefined && p.hides === true && !hidesAny(clues, deal, sp)) {
      drawRejected("fill: the board hides none of the flag's kind");
      continue;
    }
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
  const sp = paramSpaceOf(module, p);
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
    const derived =
      sample.mend === true
        ? mended(module, g, sp, given, variations, other)
        : module.deriveClues(g, sp, {}, given, (n) => randomUpto(rs, n));
    const clues = derived === null ? null : firstKindEach(deal, p, derived);
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

const byIndex = (a: number, b: number): number => a - b;

/** The indices of a list's clues. */
const shownOf = (list: ClueList): number[] => Array.from(list.at.keys());

/** The kinds the deal hides on a board of `p` (`deal.hide`), but one kept
 * whole below its tier (`deal.hideFrom`): the hide flag's too where `p` has
 * it on. */
const hiddenKinds = (deal: FillDeal, p: FillParams): readonly string[] => {
  const kinds = (
    deal.hide === undefined
      ? []
      : typeof deal.hide === "string"
        ? [deal.hide]
        : deal.hide
  ).filter((k) => p.diff >= (deal.hideFrom?.[k] ?? 0));
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
    (clues[kind as keyof C] as ClueList).at.length < elementCount(deal, sp, clues, kind)
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
      elementCount(deal, sp, clues, k),
    );
  }
  return kept;
}

/** The clues with only the clues `shown` of kind `kind`, by their indices
 * in its list. */
function keepingOf<C extends Clues<C>>(
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
    ladderTechniques(marks, entries, capsOf(module, cap), {}, (e) => {
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
  const symmetry = symmetryOf(deal, p, first.symmetry);
  const symm = SET_BLACKS_SYMM[symmetry];
  if (symm === undefined) throw new Error(`deal: first cells keep no ${symmetry}`);
  placeSymmetricBlacks({
    w: p.w,
    h: p.h,
    blackpc: rampedShare(first.ramp, optionOf(deal, p, first.share), draw),
    symm,
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
 * cell the ladder up to `tier` decides from those, until none is left;
 * {@link DEAD_END} where a placement left no answer or a cell undecided, and
 * `null` where the board offers none at all. The board is built on the clues a blank board
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
  tier: number,
): Uint8Array | typeof DEAD_END | null {
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
  const ladder = ladderTechniques(marks, entries, capsOf(module, tier), {});
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
      if (only === null) return DEAD_END;
      continue;
    }
    marks.place(c, pickValue(values, build, rs));
    if (runLadder(marks, ladder)) return DEAD_END;
  }
  if (marks.grid.includes(0)) return DEAD_END;
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

/** What a build returns where a placement left no answer or a cell undecided:
 * a sign that its ladder was too low to steer it. */
const DEAD_END = "dead end";

/** The resolution a build's share is drawn at. */
const CHANCE = 1 << 20;
