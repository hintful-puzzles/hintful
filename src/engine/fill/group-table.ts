/**
 * An answer drawn as a group's table (`deal.sample.group`): a group of the
 * board's order from the shipped tables, its generators multiplied out from
 * the identity's row (upstream group.c's `new_game_desc`), and its elements
 * then permuted at random. Row `a`, column `b` holds `a·b`, the elements
 * numbered from 1, the identity 1 in the tables.
 */

import { shuffle } from "../board/shuffle.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import type { Under } from "./params/under.ts";

/** By order, the groups a deal draws from, each its generators: a
 * permutation of the elements, written as capital letters from `A`. */
export interface GroupSample {
  readonly group: {
    readonly tables: Readonly<Record<string, readonly (readonly string[])[]>>;
    /** The ruleset or variation under which the identity is permuted with
     * the rest, and its lines and another element's dealt no clue. */
    readonly hidden?: Under;
  };
}

/**
 * The table of the group whose generators are `gens`, on `order` elements:
 * the identity's row is the elements in order, and each generator takes a
 * row reached to the row of the element it maps the row's first to. `null`
 * where the rows reached do not fill the table.
 */
export function groupTable(order: number, gens: readonly string[]): Uint8Array | null {
  const t = new Uint8Array(order * order);
  for (let i = 0; i < order; i++) t[i] = i + 1;
  const queue = [1];
  for (let qh = 0; qh < queue.length; qh++) {
    const row = (queue[qh] - 1) * order;
    for (const gen of gens) {
      const image = (v: number) => gen.charCodeAt(v - 1) - 64;
      const next = image(t[row]);
      const at = (next - 1) * order;
      if (t[at] !== 0) continue;
      for (let k = 0; k < order; k++) t[at + k] = image(t[row + k]);
      queue.push(next);
    }
  }
  return t.includes(0) ? null : t;
}

/**
 * A group's table on the square board `sp`, of a group of its order drawn
 * from `tables`, its elements permuted at random: all of them where
 * `hidden`, else all but the identity, which stays 1. `blank` is the cells
 * that are dealt no clue: where `hidden`, the identity's row and column and
 * those of another element at random, so neither the identity nor the one
 * pair of lines left blank gives it away.
 */
export function sampleGroup(
  sample: GroupSample,
  sp: GridSpace,
  rs: RandomState,
  hidden: boolean,
): { g: Uint8Array; blank: readonly number[] } {
  const n = sp.w;
  const groups = sample.group.tables[String(n)];
  if (sp.h !== n || groups === undefined)
    throw new Error(`sample group: no group of order ${n} on a ${sp.w}x${sp.h} board`);
  const table = groupTable(n, groups[randomUpto(rs, groups.length)]);
  if (table === null) throw new Error(`sample group: a table of order ${n} unfilled`);
  const perm = Array.from({ length: n }, (_, i) => i);
  const start = hidden ? 0 : 1;
  const rest = perm.slice(start);
  shuffle(rest, rs);
  perm.splice(start, rest.length, ...rest);
  const g = new Uint8Array(n * n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      g[perm[i] * n + perm[j]] = perm[table[i * n + j] - 1] + 1;
  if (!hidden) return { g, blank: [] };
  const lines = [perm[0], perm[1 + randomUpto(rs, n - 1)]];
  const blank: number[] = [];
  for (let c = 0; c < n * n; c++)
    if (lines.includes(c % n) || lines.includes(Math.floor(c / n))) blank.push(c);
  return { g, blank };
}
