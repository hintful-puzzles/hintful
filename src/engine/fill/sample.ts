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

import { type RandomState, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { matching } from "../solve/latin.ts";

type Near = "adj4" | "adj8";

export interface Sample {
  readonly scatter: {
    readonly value: number;
    readonly share: number;
    readonly apart?: Near;
  };
  readonly partner?: { readonly value: number; readonly along: Near };
  readonly rest: number;
}

/** How many cells a share of `n` is: rounded down, a share written as a
 * decimal never losing a cell to its binary fraction. */
const shareOf = (share: number, n: number): number => Math.floor(share * n + 1e-9);

/** An answer as `sample` draws it on `sp`, or `null` where this draw found no
 * room for every scattered cell or no partner for each. */
export function sampleAnswer(
  sample: Sample,
  sp: GridSpace,
  rs: RandomState,
): Uint8Array | null {
  const n = sp.cells.length;
  const { scatter, partner } = sample;
  const g = new Uint8Array(n);
  const order = Int32Array.from(sp.cells);
  let left = shareOf(scatter.share, n);
  for (let i = 0; left > 0 && i + left <= n; i++) {
    const which = i + randomUpto(rs, n - i);
    [order[i], order[which]] = [order[which], order[i]];
    const c = order[i];
    if (
      scatter.apart !== undefined &&
      sp[scatter.apart][c].some((o) => g[o] === scatter.value)
    )
      continue;
    g[c] = scatter.value;
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
  return g;
}
