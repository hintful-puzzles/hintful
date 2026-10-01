/**
 * What Mines' opened numbers prove, one teachable deduction at a time: the
 * hint's projection of `minesolve`'s reasoning (`solver.ts`), which the
 * generator uses only to learn *that* a board can be solved.
 *
 * **The board alone is the premise.** A number and the squares already opened
 * are facts; a flag is the player's claim, and Mines has no way to check one
 * without giving the mines away (`notApplicable.findMistakes`). So a flag
 * counts here only once a deduction has proved a mine under it, and a flag on a
 * square a deduction proves safe is a conflict the hint names.
 *
 * The rungs, cheapest first, each one step a player can take at a glance:
 *
 *  1. **One number.** It already touches its count of proven mines, so its
 *     other unopened squares are safe; or it has exactly as many unopened
 *     squares left as mines still to place, so all of them are mines.
 *  2. **Two numbers that share squares.** If the first still needs `a` and the
 *     second `b`, the shared squares hold at most `b`, so the first's own
 *     squares hold at least `a − b`. When that equals how many it has, they are
 *     all mines, and the second's own squares are all safe.
 *  3. **A number nested in another.** When every unopened square beside one
 *     number also touches another, the outer number's remaining squares hold
 *     exactly the difference of what they need, and that region takes rung 2's
 *     place of a number.
 *  4. **Counting the mines left.** Numbers whose unopened squares do not
 *     overlap account for a known total; when that is every mine left, every
 *     other unopened square is safe, and when the squares outside hold exactly
 *     the rest, they are all mines.
 *
 * Measured on 980 boards across every preset with "Ensure solubility" on
 * (2026-10-01, `derive-completion-from-the-position`'s design.md § "Mines'
 * hint"): these rungs never stalled, where the generator's solver had
 * certified each board. That is a sample, not a proof: upstream's solver can
 * chain regions without limit, and a board needing a deeper chain would end the
 * plan with the hint saying deduction has run out.
 */

import { COVERED, FLAG, type MinesState, QUERY } from "./state.ts";

/** What the deductions have proved about a square. */
const UNKNOWN = 0;
const PROVEN_MINE = 1;
const PROVEN_SAFE = 2;

/** The unopened squares one opened number still has to account for. */
export interface Group {
  /** The number's square. */
  readonly clue: number;
  /** Its value. */
  readonly value: number;
  /** Its unopened squares nothing has proved yet. */
  readonly cells: readonly number[];
  /** Mines still to place among {@link cells}. */
  readonly need: number;
  /** Its neighbors proved to be mines. */
  readonly mines: readonly number[];
}

/** A region rung 3 reads off a nested pair: `outer`'s squares beyond `inner`'s,
 * holding exactly {@link need} mines. */
export interface Region {
  readonly outer: Group;
  readonly inner: Group;
  readonly cells: readonly number[];
  readonly need: number;
}

/** One side of rung 2 or 3: a number, or a nested pair's region. */
export type Side = { readonly group: Group } | { readonly region: Region };

const cellsOf = (s: Side): readonly number[] =>
  "group" in s ? s.group.cells : s.region.cells;
const needOf = (s: Side): number => ("group" in s ? s.group.need : s.region.need);

export type Firing =
  | { readonly rung: "satisfied"; readonly group: Group; readonly safes: number[] }
  | { readonly rung: "full"; readonly group: Group; readonly mines: number[] }
  | {
      /** `heavy` needs more than `light`; its own squares are the mines and
       * `light`'s own squares the safe ones. */
      readonly rung: "pair";
      readonly heavy: Side;
      readonly light: Side;
      readonly shared: number[];
      readonly mines: number[];
      readonly safes: number[];
    }
  | {
      readonly rung: "count";
      /** Mines in the whole board, proved so far, and still to find. */
      readonly total: number;
      readonly found: number;
      readonly left: number;
      /** The numbers (and nested regions) counted, whose squares do not
       * overlap. */
      readonly members: readonly Side[];
      readonly counted: number[];
      readonly mines: number[];
      readonly safes: number[];
    };

const isOpened = (v: number): boolean => v >= 0 && v <= 8;
const isUnopened = (v: number): boolean => v === COVERED || v === FLAG || v === QUERY;

/** The squares around `i`, itself excluded. */
function neighbors(w: number, h: number, i: number): number[] {
  const x = i % w;
  const y = Math.floor(i / w);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) out.push(ny * w + nx);
    }
  return out;
}

/** Every opened number with an unopened square nothing has proved, row by row. */
function groups(s: MinesState, known: Int8Array): Group[] {
  const { w, h, grid } = s;
  const out: Group[] = [];
  for (let i = 0; i < w * h; i++) {
    if (!isOpened(grid[i])) continue;
    const cells: number[] = [];
    const mines: number[] = [];
    for (const j of neighbors(w, h, i)) {
      if (!isUnopened(grid[j])) continue;
      if (known[j] === PROVEN_MINE) mines.push(j);
      else if (known[j] === UNKNOWN) cells.push(j);
    }
    if (cells.length > 0)
      out.push({ clue: i, value: grid[i], cells, need: grid[i] - mines.length, mines });
  }
  return out;
}

/** `a`'s cells that `b` lacks. */
const minus = (a: readonly number[], b: readonly number[]): number[] => {
  const bs = new Set(b);
  return a.filter((c) => !bs.has(c));
};
const meet = (a: readonly number[], b: readonly number[]): number[] => {
  const bs = new Set(b);
  return a.filter((c) => bs.has(c));
};

/** Rung 2's test on an ordered pair, or `null`. */
function pairFiring(heavy: Side, light: Side): Firing | null {
  const shared = meet(cellsOf(heavy), cellsOf(light));
  if (shared.length === 0) return null;
  const mines = minus(cellsOf(heavy), cellsOf(light));
  const safes = minus(cellsOf(light), cellsOf(heavy));
  if (mines.length + safes.length === 0) return null;
  if (mines.length !== needOf(heavy) - needOf(light)) return null;
  return { rung: "pair", heavy, light, shared, mines, safes };
}

/** The most numbers (or nested regions) rung 4 adds up: past it the count
 * stops being something a player checks at a glance. Measured, no generated
 * board needed more than five (design.md § "Mines' hint"). */
const COUNT_SIZE = 5;
/** The most candidates rung 4 searches among, which bounds its cost on a
 * board stuck mid-game (a board dealt without "Ensure solubility"). */
const COUNT_CANDIDATES = 40;

/** The first deduction the board supports, or `null` when none of the rungs
 * fires. */
export function nextFiring(s: MinesState, known: Int8Array): Firing | null {
  const gs = groups(s, known);

  for (const g of gs) {
    if (g.need === 0) return { rung: "satisfied", group: g, safes: [...g.cells] };
    if (g.need === g.cells.length)
      return { rung: "full", group: g, mines: [...g.cells] };
  }

  for (const a of gs)
    for (const b of gs) {
      if (a === b) continue;
      const f = pairFiring({ group: a }, { group: b });
      if (f) return f;
    }

  // Rung 3. A region is never nested in another region: measured, no generated
  // board needs one (design.md § "Mines' hint"), and a region of a region is a
  // chain no sentence names at a glance.
  const numbers: Side[] = gs.map((group) => ({ group }));
  const regions: Side[] = [];
  const seen = new Set(gs.map((g) => [...g.cells].sort().join(",")));
  for (const outer of gs)
    for (const inner of gs) {
      if (outer === inner || inner.cells.length >= outer.cells.length) continue;
      if (minus(inner.cells, outer.cells).length > 0) continue;
      const cells = minus(outer.cells, inner.cells);
      const key = [...cells].sort().join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      regions.push({ region: { outer, inner, cells, need: outer.need - inner.need } });
    }
  // A region meets a number first; two regions only when that fails (measured:
  // one board in 980, design.md § "Mines' hint").
  for (const region of regions)
    for (const other of numbers) {
      const f = pairFiring(region, other) ?? pairFiring(other, region);
      if (f) return f;
    }
  for (const a of regions)
    for (const b of regions) {
      if (a === b) continue;
      const f = pairFiring(a, b);
      if (f) return f;
    }

  return countFiring(s, known, [...numbers, ...regions]);
}

/** Rung 4, with the fewest members that settle the squares outside them. */
function countFiring(
  s: MinesState,
  known: Int8Array,
  candidates: readonly Side[],
): Firing | null {
  const { grid } = s;
  let found = 0;
  const unknown: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (!isUnopened(grid[i])) continue;
    if (known[i] === PROVEN_MINE) found++;
    else if (known[i] === UNKNOWN) unknown.push(i);
  }
  if (unknown.length === 0) return null;
  const total = s.n;
  const left = total - found;
  const settle = (
    members: readonly Side[],
    counted: number[],
    need: number,
  ): Firing | null => {
    const outside = minus(unknown, counted);
    if (outside.length === 0) return null;
    const rest = left - need;
    if (rest !== 0 && rest !== outside.length) return null;
    return {
      rung: "count",
      total,
      found,
      left,
      members,
      counted,
      mines: rest === 0 ? [] : outside,
      safes: rest === 0 ? outside : [],
    };
  };

  const none = settle([], [], 0);
  if (none) return none;
  if (candidates.length > COUNT_CANDIDATES) return null;

  const pick: Side[] = [];
  const search = (
    start: number,
    size: number,
    used: Set<number>,
    need: number,
  ): Firing | null => {
    if (pick.length === size) return settle([...pick], [...used], need);
    for (let k = start; k < candidates.length; k++) {
      const m = candidates[k];
      const cells = cellsOf(m);
      if (need + needOf(m) > left) continue;
      // At most one region, for the same reason as rung 3's.
      if ("region" in m && pick.some((p) => "region" in p)) continue;
      if (cells.some((c) => used.has(c))) continue;
      pick.push(m);
      for (const c of cells) used.add(c);
      const f = search(k + 1, size, used, need + needOf(m));
      for (const c of cells) used.delete(c);
      pick.pop();
      if (f) return f;
    }
    return null;
  };
  for (let size = 1; size <= Math.min(COUNT_SIZE, candidates.length); size++) {
    const f = search(0, size, new Set(), 0);
    if (f) return f;
  }
  return null;
}

/** What a firing proves, written into `known`. */
export function learn(known: Int8Array, f: Firing): void {
  const mines = f.rung === "satisfied" ? [] : f.mines;
  const safes = f.rung === "full" ? [] : f.safes;
  for (const m of mines) known[m] = PROVEN_MINE;
  for (const c of safes) known[c] = PROVEN_SAFE;
}
