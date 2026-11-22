/**
 * An answer drawn at random as a description's `deal.sample` says: a value
 * scattered on a share of the cells, a partner beside each, matched one to
 * one, and the rest one other value. The clues are then the answer's, from
 * each kind's `means` (`deriveClues`), so no game writes its generator
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 7).
 *
 * The scatter and the matching are upstream's tents.c `new_game_desc`, which
 * is Tents' sample: a random order of the cells, each taken where it keeps
 * `apart` from those taken, and `matching`'s random maximum matching of the
 * scattered cells to the cells beside them.
 */

import { shuffle } from "../board/shuffle.ts";
import { type RandomState, randomBits, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { matching } from "../solve/latin.ts";

type Near = "adj4" | "adj8";

/** How a deal draws its answer: built by the ladder (`buildAnswer`),
 * scattered (`sampleAnswer`), or as dominoes (`sampleDominoes`). */
export type Sample = { readonly build: true } | ScatterSample | DominoSample;

/** Dominoes of `value`, two cells side by side, no two touching along a
 * side, packed densely; `rest` on every other cell. */
export interface DominoSample {
  readonly dominoes: { readonly value: number };
  readonly rest: number;
}

export interface ScatterSample {
  readonly scatter: {
    readonly value: number;
    readonly share: number;
    readonly apart?: Near;
    /** Each cell takes the value at `share`'s chance, so the count varies
     * from answer to answer: a small board then draws from every picture
     * (Mosaic's 3x3 has 512, and those with four shaded cells, 126). */
    readonly each?: true;
    /** The share is of the cells tried, in a random order, each taken where
     * it may be, so how many are taken varies and a draw always has room
     * (upstream's range.c). */
    readonly tried?: true;
    /** A cell is taken only where the cells not taken stay one group. */
    readonly joinedRest?: true;
  };
  readonly partner?: { readonly value: number; readonly along: Near };
  readonly rest: number;
  /** Whether a row or column holding nothing but `rest` is refused: upstream's
   * Tents rejects one as giving nothing away. */
  readonly noBareLine?: boolean;
}

/** How many cells a share of `n` is: rounded down, a share written as a
 * decimal never losing a cell to its binary fraction. */
const shareOf = (share: number, n: number): number => Math.floor(share * n + 1e-9);

/** An answer as `sample` draws it on `sp`, or `null` where this draw found no
 * room for every scattered cell or no partner for each, or left a line bare
 * that `noBareLine` refuses. */
export function sampleAnswer(
  sample: ScatterSample,
  sp: GridSpace,
  rs: RandomState,
): Uint8Array | null {
  const n = sp.cells.length;
  const { scatter, partner } = sample;
  const g = new Uint8Array(n);
  if (scatter.each === true) {
    if (scatter.apart !== undefined || partner !== undefined)
      throw new Error("sample: a value at each cell's chance keeps no distance");
    // A chance in 2^16, the share's own where it is a half.
    const odds = Math.round(scatter.share * 65536);
    for (const c of sp.cells)
      g[c] = randomBits(rs, 16) < odds ? scatter.value : sample.rest;
    return g;
  }
  const order = Int32Array.from(sp.cells);
  const share = shareOf(scatter.share, n);
  // Tried, the share is of the cells tried, and none need be taken.
  let left = scatter.tried === true ? 0 : share;
  let taken = 0;
  for (let i = 0; scatter.tried === true ? i < share : left > 0 && i + left <= n; i++) {
    const which = i + randomUpto(rs, n - i);
    [order[i], order[which]] = [order[which], order[i]];
    const c = order[i];
    if (
      scatter.apart !== undefined &&
      sp[scatter.apart][c].some((o) => g[o] === scatter.value)
    )
      continue;
    g[c] = scatter.value;
    if (
      scatter.joinedRest === true &&
      !restJoined(sp, g, scatter.value, n - taken - 1)
    ) {
      g[c] = 0;
      continue;
    }
    taken++;
    left--;
  }
  if (left > 0) return null;
  if (partner !== undefined) {
    // The cells that could partner one, numbered for the matching.
    const room = new Int32Array(n).fill(-1);
    const rooms: number[] = [];
    const lists: number[][] = [];
    for (const c of sp.cells) {
      if (g[c] !== scatter.value) continue;
      const list: number[] = [];
      for (const o of sp[partner.along][c]) {
        if (g[o] === scatter.value) continue;
        if (room[o] < 0) {
          room[o] = rooms.length;
          rooms.push(o);
        }
        list.push(room[o]);
      }
      lists.push(list);
    }
    const paired = matching(
      lists.length,
      rooms.length,
      lists,
      lists.map((l) => l.length),
      rs,
    );
    if (paired.includes(-1)) return null;
    for (const r of paired) g[rooms[r]] = partner.value;
  }
  for (const c of sp.cells) if (g[c] === 0) g[c] = sample.rest;
  if (
    sample.noBareLine === true &&
    sp.lines.some((L) => sp.lineCells[L].every((c) => g[c] === sample.rest))
  )
    return null;
  return g;
}

/** Whether the `count` cells of `g` not holding `value` are one group, side
 * by side. */
function restJoined(
  sp: GridSpace,
  g: Uint8Array,
  value: number,
  count: number,
): boolean {
  const start = sp.cells.find((c) => g[c] !== value);
  if (start === undefined) return true;
  const seen = new Uint8Array(g.length);
  seen[start] = 1;
  const stack = [start];
  let reached = 0;
  for (let c = stack.pop(); c !== undefined; c = stack.pop()) {
    reached++;
    for (const o of sp.adj4[c])
      if (!seen[o] && g[o] !== value) {
        seen[o] = 1;
        stack.push(o);
      }
  }
  return reached === count;
}

/** The rounds of {@link sampleDominoes}' refill. A greedy fill alone stops
 * at about 36% of the cells in dominoes at any size; 300 rounds reach about
 * 45% in under 10 ms at 10x10, and 1,500 only 48% for five times the cost
 * (measured on Norinori, 2026-11-16). */
const REFILL_ROUNDS = 300;

/**
 * Dominoes at random, no two side by side, packed as densely as
 * {@link REFILL_ROUNDS} rounds of a refill get them: take one domino away,
 * fill the grid again greedily, and keep the result where no fewer come
 * back. `null` where no domino fits.
 *
 * Density is what makes a partition grown round them come right: each of
 * Norinori's regions holds two of their cells, so the denser the dominoes the
 * smaller the regions, and a region's room for other answers grows with its
 * size. Packed so, a 10x10 Easy board deals in under a second where it took a
 * minute and more (2026-11-16). The refill is sen-ltd/norinori's
 * (`inducedMatching`, MIT).
 */
export function sampleDominoes(
  sample: DominoSample,
  sp: GridSpace,
  rs: RandomState,
): Uint8Array | null {
  const beside = sp.adj4;
  const held = new Uint8Array(sp.cells.length);
  // A cell is free while neither it nor a cell beside it is held.
  const free = (i: number): boolean =>
    held[i] === 0 && beside[i].every((j) => held[j] === 0);
  /** Dominoes in random order wherever one fits; how many. */
  const fill = (): number => {
    const order = Array.from(sp.cells);
    shuffle(order, rs);
    let placed = 0;
    for (const i of order) {
      if (!free(i)) continue;
      const partners = beside[i].filter(
        (j) => free(j) && beside[j].every((k) => k === i || held[k] === 0),
      );
      if (partners.length === 0) continue;
      held[i] = 1;
      held[partners[randomUpto(rs, partners.length)]] = 1;
      placed++;
    }
    return placed;
  };
  let count = fill();
  for (let round = 0; round < REFILL_ROUNDS && count > 0; round++) {
    const was = held.slice();
    const cells = sp.cells.filter((i) => held[i] === 1);
    const taken = cells[randomUpto(rs, cells.length)];
    // Its partner is the one held cell beside it.
    for (const j of [taken, ...beside[taken]]) held[j] = 0;
    const placed = fill();
    if (placed >= 1) count += placed - 1;
    else held.set(was);
  }
  if (count === 0) return null;
  return Uint8Array.from(held, (x) => (x === 1 ? sample.dominoes.value : sample.rest));
}
