/**
 * The hide: of a board dealt with every clue shown, the clues of the hidden
 * kinds that may go, tried in units (a clue, or its orbit under the deal's
 * symmetry) in the order the deal hides them. The runners of `deal.ts` and
 * the search tier's (`search-tier.ts`) call it.
 */

import { shuffle } from "../../board/shuffle.ts";
import { orbitOf } from "../../generate/symmetry.ts";
import type { ClueList } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { cluesRead } from "./clues-read.ts";
import type { DealContext } from "./context.ts";
import { byIndex, keepingAll, offsetsOf } from "./keeping.ts";

/**
 * Draws in a row the lowest tier does not finish with every clue before a
 * deal keeps one a higher tier finishes and hides from it there. Mosaic's
 * narrow boards (40x5, 3x50 at Normal) are seldom finished by Easy and gave
 * up after 10,000 draws without this; at 64 no menu board of Mosaic, Light
 * Up or Boats deals with a different count of instructions than with none,
 * where 32 cost Mosaic's 8x10 Normal 37% (2026-11-23).
 */
const SHORT_OF_LOWEST_RUN = 64;

export interface Hide<C> {
  /** The clues with only `shown` of the hidden kinds, by their index in one
   * numbering of them all (`offsetsOf`). */
  keeping(clues: C, shown: readonly number[]): C;
  /** Every hidden clue's index in that numbering, but those of a kind hidden
   * whole: a board that does not finish without them is drawn again. */
  allShown(clues: C): number[];
  /** The indices of the clues at the squares of clue `i`'s orbit under the
   * deal's symmetry, its own first, or `null` where a square has none. */
  orbitClues(list: ClueList, i: number): number[] | null;
  /** The clues `shown` in the units they are hidden in. */
  unitsOf(clues: C, shown: readonly number[]): number[][];
  /** `units`, shuffled, in the order the deal hides them. */
  hideOrder(clues: C, units: number[][]): number[][];
  /** The clues with each of the hidden kinds' that may go hidden; `null`
   * where the lowest tier does not finish the board with every clue. */
  hideUpTo(clues: C, tier: number, forSearch?: boolean): C | null;
}

export function hideOf<C extends Clues<C>>(cx: DealContext<C>): Hide<C> {
  const { module, deal, p, rs, sp, thorough, finishes, board } = cx;
  const { kinds, kind, symmetry, whole, lowest } = cx.hide;
  const keeping = (clues: C, shown: readonly number[]): C =>
    keepingAll(clues, deal, kinds, sp, shown);
  const allShown = (clues: C): number[] => {
    const offsets = offsetsOf(clues, kinds);
    const hiddenWhole = (i: number): boolean =>
      whole.includes(kinds[offsets.findLastIndex((o) => o <= i)]);
    return Array.from({ length: offsets[offsets.length - 1] }, (_, i) => i).filter(
      (i) => !hiddenWhole(i),
    );
  };
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
  /** What the hide's formulas read: the clues, and the board's sizes. */
  const withSizes = (clues: C): C => ({ ...clues, ...cx.sizes });
  /** The indices of the clues the hide never takes (a hidden kind's
   * `keep`), but of a kind this board hides whole. */
  const keptOf = (clues: C): Set<number> => {
    const out = new Set<number>();
    const { hideKeep } = module;
    if (hideKeep === undefined) return out;
    const offsets = offsetsOf(clues, kinds);
    const read = withSizes(clues);
    for (const [n, k] of kinds.entries()) {
      if (whole.includes(k)) continue;
      const list = clues[k as keyof C] as ClueList;
      for (const [i, at] of list.at.entries())
        if (hideKeep(sp, read, k, at)) out.add(offsets[n] + i);
    }
    return out;
  };
  /** The clues of `run`, and every clue the hide keeps. */
  const withKept = (clues: C, run: readonly number[]): number[] => {
    const kept = keptOf(clues);
    if (kept.size === 0) return [...run].sort(byIndex);
    for (const i of run) kept.add(i);
    return [...kept].sort(byIndex);
  };
  /** Each with those of its orbit still shown where the deal is symmetric,
   * alone otherwise; none the hide keeps. */
  const unitsOf = (clues: C, allShown: readonly number[]): number[][] => {
    const kept = keptOf(clues);
    const shown = kept.size === 0 ? allShown : allShown.filter((i) => !kept.has(i));
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
  /** Each kind's index among `kinds` of the kind it is hidden `after`, or
   * -1: one this board does not hide leaves it free. */
  const afterOf = kinds.map((k) => {
    const a = deal.hide?.find((h) => h.kind === k)?.after;
    return a === undefined ? -1 : kinds.indexOf(a);
  });
  const follows = afterOf.some((a) => a >= 0);
  /** For clue `i` of a kind hidden `after` another, the index of that
   * kind's clue at its place; -1 where it has none. */
  const leaderOf = (clues: C): ((i: number) => number) => {
    if (!follows) return () => -1;
    const offsets = offsetsOf(clues, kinds);
    return (i) => {
      const k = offsets.findLastIndex((o) => o <= i);
      const a = afterOf[k];
      if (a < 0) return -1;
      const at = (clues[kinds[k] as keyof C] as ClueList).at[i - offsets[k]];
      const j = (clues[kinds[a] as keyof C] as ClueList).byAt[at];
      return j < 0 ? -1 : offsets[a] + j;
    };
  };
  /** `order` with each unit of a kind hidden `after` another moved to
   * straight after the unit its leader is in, where one is. */
  const following = (clues: C, order: number[][]): number[][] => {
    if (!follows) return order;
    const lead = leaderOf(clues);
    const unitOf = new Map<number, number[]>();
    for (const u of order) for (const i of u) unitOf.set(i, u);
    const behind = new Map<number[], number[][]>();
    const out: number[][] = [];
    for (const u of order) {
      const leader = unitOf.get(lead(u[0]));
      if (leader === undefined) out.push(u);
      else behind.set(leader, [...(behind.get(leader) ?? []), u]);
    }
    return out.flatMap((u) => [u, ...(behind.get(u) ?? [])]);
  };
  /** Every unit of the kinds hidden `first` before any of the rest, each
   * side in a random order, and a kind's units ranked by its `by`
   * taking its places in that order higher first, so the kinds stay mixed
   * as they fell. A unit is of its first clue's kind and ranks as it does. */
  const ranked = (clues: C, units: number[][]): number[][] => {
    shuffle(units, rs);
    const firsts = (deal.hide ?? []).filter((h) => h.first === true).map((h) => h.kind);
    const { hideRank } = module;
    if (firsts.length === 0 && hideRank === undefined) return units;
    const offsets = offsetsOf(clues, kinds);
    const kindOf = (u: readonly number[]): number =>
      offsets.findLastIndex((o) => o <= u[0]);
    let order = units;
    if (hideRank !== undefined) {
      const read = withSizes(clues);
      const rank = (u: readonly number[]): number => {
        const k = kindOf(u);
        const list = clues[kinds[k] as keyof C] as ClueList;
        return hideRank(sp, read, kinds[k], list.at[u[0] - offsets[k]]);
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
    if (firsts.length === 0) return order;
    const later = (u: readonly number[]): number =>
      firsts.includes(kinds[kindOf(u)]) ? 0 : 1;
    // A stable sort keeps each side's units in their order.
    return order.sort((a, b) => later(a) - later(b));
  };
  /** The units ranked, each of a kind hidden `after` another then straight
   * after its leader's. */
  const hideOrder = (clues: C, units: number[][]): number[][] =>
    following(clues, ranked(clues, units));
  /**
   * The shortest run from the end of `units` whose clues alone of the
   * hidden kinds tier `t` finishes the board with, found by halving: the
   * whole of them finishes it. A thorough hide tries each of the run after
   * it, as it would each of the whole: a board of 100 clues of which 15
   * stay is some 7 solves and 15, not 100 (Boats' 10x10, 2026-11-23).
   *
   * The end, since a hide in order drops the units it tries first: kept from
   * the start, the givens hidden `first` alone stayed, and a Mathrax Easy
   * board showed no clue.
   */
  const shortestRun = (clues: C, units: readonly number[][], t: number): number[] => {
    let lo = 0;
    let hi = units.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (
        finishes(
          keeping(clues, withKept(clues, units.slice(units.length - mid).flat())),
          t,
        )
      )
        hi = mid;
      else lo = mid + 1;
    }
    return withKept(clues, units.slice(units.length - hi).flat());
  };
  /**
   * Hidden at the lowest tier, and then at `tier`.
   *
   * Hiding at a tier above the lowest is slow, each try asking the higher
   * tier, so a draw the lowest does not finish is drawn again, though it is
   * a board of a higher one, until {@link SHORT_OF_LOWEST_RUN} such draws
   * in a row: then it is hidden from at the lowest tier up to `tier` that
   * finishes it. Hidden from so at once, Mosaic's 12x15 Normal deal took
   * 84 ms against 43, its Unreasonable 240 against 131, and Light Up's 12x16
   * Normal 68 against 80, bundled (2026-11-23). The tiers between the lowest
   * and `tier` hide nothing that `tier` would not and cost a pass each
   * (Boats' 10x10 Hard, 507 solves a deal against 404 without them).
   * Thorough, each tier keeps its shortest run and then tries every clue of
   * it; otherwise none is tried at the lowest and as many as the board's
   * shorter side at `tier`.
   *
   * `forSearch` hides at that one tier, and skips the shortest run, for a
   * hide a search's strip follows: the shortest run there took Mosaic's 12x15
   * Unreasonable deal from 2.6 G instructions to 4.4 and Bricks' 8x10 from
   * 0.51 to 0.46 (2026-11-23).
   */
  const hideUpTo = (clues: C, tier: number, forSearch = false): C | null => {
    if (kind === null) return clues;
    // A draw the asked tier does not finish the lowest does not either, and
    // the lowest's solve is the cheaper; the deal holds the board to the
    // asked tier once its clues are hidden. Asking the asked tier first cost
    // Mosaic's 8x10 Normal deal a third more (2026-11-23).
    let from = lowest;
    if (finishes(clues, from)) cx.shortOfLowest = 0;
    else {
      if (++cx.shortOfLowest < SHORT_OF_LOWEST_RUN) return null;
      from = lowest + 1;
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
    const pruned = withKept(
      clues,
      unitsOf(clues, shown)
        .filter((u) => u.some((i) => read.has(i) || later(i)))
        .flat(),
    );
    if (finishes(keeping(clues, pruned), from)) shown = pruned;
    const lead = leaderOf(clues);
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
        // A clue hidden `after` another stays while that one is shown.
        if (follows && shown.includes(lead(unit[0]))) continue;
        const without = shown.filter((j) => !unit.includes(j));
        if (finishes(keeping(clues, without), t)) shown = without;
      }
    }
    return keeping(clues, shown);
  };
  return { keeping, allShown, orbitClues, unitsOf, hideOrder, hideUpTo };
}
