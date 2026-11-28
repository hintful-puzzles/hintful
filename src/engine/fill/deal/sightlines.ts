/**
 * The sightlines a build fills first (`sample.sightlines`): each a filling
 * its two end clues single out, so the ladder's reading of a sightline
 * decides it. Upstream undead.c's `get_unique`, run in `new_game_desc` until
 * the tier's `filling` of squares is left; the build decides the rest.
 */

import { type RandomState, randomUpto } from "../../random/index.ts";
import { type ClueList, type GridSpace, sights } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type FillParams, sizesOf } from "../game-id.ts";
import type { DealtFillModule } from "./context.ts";

/** One sightline: its two slots and the cells it passes. */
interface Sightline {
  readonly from: number;
  readonly to: number;
  readonly cells: readonly number[];
}

/**
 * `start` with sightlines filled, the fewest cells first, until no more than
 * the tier's `open` cells are undecided (0): on each, its undecided cells
 * take, at random, one of the fillings of their domains whose two end
 * clues no other filling derives, and keep their values where none is
 * alone. `clues` holds the kind the sightlines pass through.
 */
export function sightlinesLaid<C extends Clues<C>>(
  module: DealtFillModule<C>,
  kinds: { readonly through: string; readonly ends: string },
  start: Uint8Array,
  sp: GridSpace,
  clues: C,
  p: FillParams,
  rs: RandomState,
): Uint8Array {
  const { sightClue, sightlinesOpen } = module;
  if (sightClue === undefined || sightlinesOpen === undefined)
    throw new Error("deal: sightlines, and no clue they derive or cells they leave");
  const g = start.slice();
  const read = { ...clues, ...sizesOf(p) } as C;
  let open = sp.cells.filter((c) => g[c] === 0).length;
  const most = sightlinesOpen(sp, read, p.diff, open);
  const sets = sights(sp, clues[kinds.through as keyof C] as ClueList);
  const lines: Sightline[] = [];
  for (const [i, s] of sp.slots.entries()) {
    const to = sets[i].exit;
    if (s < to) lines.push({ from: s, to, cells: sets[i].all });
  }
  // Stable, so lines alike in length keep the slots' order, where upstream's
  // qsort leaves their order unspecified.
  lines.sort((a, b) => a.cells.length - b.cells.length);
  for (const line of lines) {
    if (open <= most) break;
    const cells = line.cells.filter((c) => g[c] === 0);
    if (cells.length === 0) continue;
    const domains = cells.map((c) => valuesOf(module.domainOf(sp, clues, c)));
    const pick = uniqueFilling(
      cells,
      domains,
      (filled) => {
        for (const [k, c] of cells.entries()) g[c] = filled[k];
        return (
          sightClue(g, sp, clues, line.from) * (2 * sp.cells.length + 1) +
          sightClue(g, sp, clues, line.to)
        );
      },
      rs,
    );
    for (const [k, c] of cells.entries()) g[c] = pick === null ? 0 : pick[k];
    if (pick !== null) open -= cells.length;
  }
  return g;
}

/** The values a domain mask holds, lowest first. */
function valuesOf(mask: number): number[] {
  const out: number[] = [];
  for (let m = mask; m !== 0; m &= m - 1) out.push(31 - Math.clz32(m & -m));
  return out;
}

/** A filling of `cells` from `domains` whose `key` no other filling has, at
 * random among them; `null` where there is none. */
function uniqueFilling(
  cells: readonly number[],
  domains: readonly (readonly number[])[],
  key: (filled: readonly number[]) => number,
  rs: RandomState,
): number[] | null {
  const at = new Array<number>(cells.length).fill(0);
  const filled = domains.map((d) => d[0]);
  const seen = new Map<number, number[] | null>();
  for (;;) {
    const k = key(filled);
    seen.set(k, seen.has(k) ? null : filled.slice());
    let i = 0;
    while (i < cells.length && at[i] === domains[i].length - 1) {
      at[i] = 0;
      filled[i] = domains[i][0];
      i++;
    }
    if (i === cells.length) break;
    at[i]++;
    filled[i] = domains[i][at[i]];
  }
  const alone = [...seen.values()].filter((f): f is number[] => f !== null);
  return alone.length === 0 ? null : alone[randomUpto(rs, alone.length)];
}
