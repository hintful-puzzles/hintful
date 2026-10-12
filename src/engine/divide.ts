/**
 * Dividing a rectangle into connected regions of unequal size, in three
 * walks. The game supplies its rule and the walk is the same for every game:
 *
 * - {@link mergeNeighbors} joins neighboring regions in a random order
 *   wherever the game allows the join. The rule is a predicate on what two
 *   regions hold.
 * - {@link growFromSeeds} grows a region from each seed, all at once, until
 *   the grid is full. The rule is where the seeds are, or how many.
 * - {@link growToSize} grows one region at a time to a size the game draws.
 *
 * Each returns what `divvy.ts` returns: a `Dsf` over the cells, read for
 * which cells share a region.
 *
 * The draws of each walk, and their order, decide which board a seed deals in
 * Rome, Map and Seismic. Map's and Rome's are upstream's, and their frozen
 * fixtures pin them.
 */

import { Dsf } from "./dsf.ts";
import { type RandomState, randomUpto } from "./random/index.ts";
import { shuffle } from "./shuffle.ts";

/** The rectangle to divide. */
export interface DividedGrid {
  w: number;
  h: number;
}

// --- merge neighbors while the game allows it --------------------------------

/**
 * A game's rule for joining regions, over `T`: what the game keeps about a
 * region to decide a join by (the arrows in it, how many stars it holds, its
 * size).
 */
export interface MergeRule<T> {
  /** What the region of `cell` holds before any join. Asked once for each
   * region of the division the walk starts from, with one of its cells. */
  of(cell: number): T;
  /** What two neighboring regions would hold as one, or `null` where the game
   * forbids the join. It is asked of a pair more than once, and answers the
   * same each time. */
  join(a: T, b: T): T | null;
  /** The division to start from, which is left as it was. Absent, every cell
   * starts as a region of its own. */
  from?: Dsf;
}

/** The division a merge starts from, and what each of its regions holds, at
 * the region's root. */
function startOf<T>(p: DividedGrid, rule: MergeRule<T>): [Dsf, Map<number, T>] {
  const regions = rule.from?.clone() ?? new Dsf(p.w * p.h);
  const held = new Map<number, T>();
  for (let i = 0; i < p.w * p.h; i++) {
    const root = regions.canonify(i);
    if (!held.has(root)) held.set(root, rule.of(root));
  }
  return [regions, held];
}

/** Join the regions of cells `i1` and `i2`, which hold `joined` as one. */
function join<T>(
  regions: Dsf,
  held: Map<number, T>,
  i1: number,
  i2: number,
  joined: T,
): void {
  held.delete(regions.canonify(i1));
  held.delete(regions.canonify(i2));
  regions.merge(i1, i2);
  held.set(regions.canonify(i1), joined);
}

/**
 * Join neighboring regions in a random order wherever `rule` allows it: every
 * pair of cells that share an edge is visited once, shuffled, and the regions
 * of a pair are joined unless they are one already or `rule.join` refuses.
 * What is left is a division in which the rule refuses every pair of
 * neighboring regions. How many regions that is falls out of the rule.
 */
export function mergeNeighbors<T>(
  p: DividedGrid,
  rng: RandomState,
  rule: MergeRule<T>,
): Dsf {
  const { w, h } = p;
  const wh = w * h;
  const [regions, held] = startOf(p, rule);

  // A pair across a vertical edge is its left cell's index, and a pair across
  // a horizontal edge is its upper cell's index plus `wh`.
  const pairs: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) pairs.push(y * w + x);
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) pairs.push(wh + y * w + x);
  }
  shuffle(pairs, rng);

  for (const pair of pairs) {
    const i1 = pair % wh;
    const i2 = pair >= wh ? i1 + w : i1 + 1;
    const r1 = regions.canonify(i1);
    const r2 = regions.canonify(i2);
    if (r1 === r2) continue;
    const joined = rule.join(held.get(r1) as T, held.get(r2) as T);
    if (joined !== null) join(regions, held, i1, i2, joined);
  }

  return regions;
}

/**
 * Join neighboring regions until `count` are left, or return `null` where
 * the rule refuses every join before then: the rule cannot be met from here,
 * and the caller draws again.
 *
 * Each join is of the region with the fewest neighbors it may join, a tie
 * broken at random, to one of those neighbors at random. A region with one
 * choice left is joined before its neighbor is taken by another, which a
 * random order of joins does not see. Measured 2026-10-12 on one-star regions
 * to be joined into regions of two stars on a 10x10, and of three on a 14x14:
 * this order met the rule in 76% and 60% of tries, and a random order in 4%
 * and under 0.1%.
 *
 * A join costs a pass over the grid, so the walk is for a division of some
 * tens of regions (`from` a grown one), not for one of single cells on a
 * large board.
 */
export function mergeToCount<T>(
  p: DividedGrid,
  rng: RandomState,
  rule: MergeRule<T>,
  count: number,
): Dsf | null {
  const { w, h } = p;
  const [regions, held] = startOf(p, rule);

  while (held.size > count) {
    // For each region, a cell of each neighbor it may join, by the
    // neighbor's root.
    const choices = new Map<number, Map<number, number>>();
    const consider = (i1: number, i2: number): void => {
      const r1 = regions.canonify(i1);
      const r2 = regions.canonify(i2);
      if (r1 === r2 || choices.get(r1)?.has(r2)) return;
      if (rule.join(held.get(r1) as T, held.get(r2) as T) === null) return;
      for (const [from, to, cell] of [
        [r1, r2, i2],
        [r2, r1, i1],
      ]) {
        const known = choices.get(from);
        if (known) known.set(to, cell);
        else choices.set(from, new Map([[to, cell]]));
      }
    };
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (x < w - 1) consider(y * w + x, y * w + x + 1);
        if (y < h - 1) consider(y * w + x, (y + 1) * w + x);
      }

    let fewest = Number.POSITIVE_INFINITY;
    let tightest: number[] = [];
    for (const [root, beside] of choices) {
      if (beside.size < fewest) {
        fewest = beside.size;
        tightest = [root];
      } else if (beside.size === fewest) tightest.push(root);
    }
    if (tightest.length === 0) return null;

    const root = tightest[randomUpto(rng, tightest.length)];
    const beside = [...(choices.get(root) as Map<number, number>).values()];
    const cell = beside[randomUpto(rng, beside.length)];
    const joined = rule.join(
      held.get(root) as T,
      held.get(regions.canonify(cell)) as T,
    );
    join(regions, held, root, cell, joined as T);
  }

  return held.size === count ? regions : null;
}

// --- grow from seeds, all at once ---------------------------------------------

/** `n` different cells of the grid at random, to grow a region from each. */
export function scatterSeeds(p: DividedGrid, n: number, rng: RandomState): number[] {
  const cells = Array.from({ length: p.w * p.h }, (_, i) => i);
  if (n > cells.length) throw new Error("scatterSeeds: more seeds than cells");
  const seeds: number[] = [];
  let k = cells.length;
  for (let i = 0; i < n; i++) {
    const j = randomUpto(rng, k);
    seeds.push(cells[j]);
    cells[j] = cells[--k];
  }
  return seeds;
}

// A cumulative-frequency table over the cells (upstream `map.c`'s `cf_*`):
// `table[0]` is the total, and the cell a count falls on is found in
// O(log n).

function cfAdd(table: Int32Array, sym: number, count: number): void {
  let bit = 1;
  while (sym !== 0) {
    if (sym & bit) {
      table[sym] += count;
      sym &= ~bit;
    }
    bit <<= 1;
  }
  table[0] += count;
}

/** Total count of symbols with value less than `sym`. */
function cfClookup(table: Int32Array, n: number, sym: number): number {
  if (sym === 0) return 0;
  let count = table[0];
  let bit = 1;
  while (bit < n) bit <<= 1;
  let limit = n;
  while (bit > 0) {
    const index = ((sym + bit - 1) & ~(bit * 2 - 1)) + bit;
    if (index < limit) {
      count -= table[index];
      limit = index;
    }
    bit >>= 1;
  }
  return count;
}

/** Count of symbol `sym`. */
function cfSlookup(table: Int32Array, n: number, sym: number): number {
  let count = table[sym];
  for (let bit = 1; sym + bit < n && !(sym & bit); bit <<= 1) count -= table[sym + bit];
  return count;
}

/** Largest symbol whose cumulative frequency is <= `count`. */
function cfWhichsym(table: Int32Array, n: number, count: number): number {
  let bit = 1;
  while (bit < n) bit <<= 1;
  let sym = 0;
  let top = table[0];
  while (bit > 0) {
    if (sym + bit < n) {
      if (count >= top - table[sym + bit]) sym += bit;
      else top -= table[sym + bit];
    }
    bit >>= 1;
  }
  return sym;
}

// A free cell is likelier to be taken by a region that touches it on more
// sides: taking it then shortens the region's border, where a cell touched on
// one side lengthens it, so the regions come out compact.
const WEIGHT_ONE_SIDE = 2;
const WEIGHT_TWO_SIDES = 3;
const WEIGHT_MORE_SIDES = 4;

/**
 * Which regions can take the free cell `(x, y)`, and at what weight (upstream
 * `extend_options`). With `index < 0`, the total weight; otherwise the region
 * that `index` falls on.
 *
 * A region can take a cell beside it only where its cells around the cell
 * are one run, so that no region comes to enclose another.
 */
function extendOptions(
  p: DividedGrid,
  n: number,
  owner: Int32Array,
  around: Int32Array,
  x: number,
  y: number,
  index: number,
): number {
  const { w, h } = p;
  if (owner[y * w + x] >= 0) return 0;

  // The eight cells around this one, in order round it.
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const at = dy < 0 ? 6 - dx : dy > 0 ? 2 + dx : 2 * (1 + dx);
      if (x + dx >= 0 && x + dx < w && y + dy >= 0 && y + dy < h)
        around[at] = owner[(y + dy) * w + (x + dx)];
      else around[at] = -1;
    }

  let total = 0;
  for (let c = 0; c < n; c++) {
    let sides = 0;
    for (let i = 0; i < 8; i += 2) if (around[i] === c) sides++;
    if (!sides) continue;

    let runs = 0;
    for (let i = 0; i < 8; i++)
      if (around[i] === c && around[(i + 1) & 7] !== c) runs++;
    if (runs > 1) continue;

    const weight =
      sides === 1
        ? WEIGHT_ONE_SIDE
        : sides === 2
          ? WEIGHT_TWO_SIDES
          : WEIGHT_MORE_SIDES;

    total += weight;
    if (index >= 0 && index < weight) return c;
    index -= weight;
  }

  return total;
}

/**
 * Grow a region from each of `seeds` until the grid is full (upstream
 * `genmap`): a free cell and a region beside it are drawn together, by
 * weight, and the region takes the cell. There are as many regions as seeds,
 * each holds its seed, and none encloses another.
 *
 * What a draw costs grows with the number of seeds.
 */
export function growFromSeeds(
  p: DividedGrid,
  seeds: readonly number[],
  rng: RandomState,
): Dsf {
  const { w, h } = p;
  const wh = w * h;
  const n = seeds.length;
  const owner = new Int32Array(wh).fill(-1);
  const around = new Int32Array(8);
  seeds.forEach((seed, i) => {
    if (owner[seed] >= 0) throw new Error("growFromSeeds: two seeds on one cell");
    owner[seed] = i;
  });

  // The weight of every free cell's options.
  const weights = new Int32Array(wh);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      cfAdd(weights, y * w + x, extendOptions(p, n, owner, around, x, y, -1));

  while (weights[0] > 0) {
    const draw = randomUpto(rng, weights[0]);
    const cell = cfWhichsym(weights, wh, draw);
    const x = cell % w;
    const y = Math.floor(cell / w);
    owner[cell] = extendOptions(
      p,
      n,
      owner,
      around,
      x,
      y,
      draw - cfClookup(weights, wh, cell),
    );

    for (let yy = Math.max(y - 1, 0); yy < Math.min(y + 2, h); yy++)
      for (let xx = Math.max(x - 1, 0); xx < Math.min(x + 2, w); xx++)
        cfAdd(
          weights,
          yy * w + xx,
          -cfSlookup(weights, wh, yy * w + xx) +
            extendOptions(p, n, owner, around, xx, yy, -1),
        );
  }

  const regions = new Dsf(wh);
  owner.forEach((region, i) => {
    if (region < 0) throw new Error("growFromSeeds: a cell no region could take");
    regions.merge(i, seeds[region]);
  });
  return regions;
}

// --- grow one region at a time, to a drawn size --------------------------------

/**
 * Grow regions one at a time until the grid is full, each to the size the
 * game draws for it with `size`. It cannot fail: a region that has nowhere
 * left to grow ends short, so `size` is the largest a region can be and
 * smaller ones are dealt as well.
 *
 * - A region is seeded at the free cell with the fewest free neighbors, a tie
 *   broken at random. Corners, and the necks earlier regions leave, are taken
 *   before they are cut off, which keeps the board from filling with single
 *   cells.
 * - It grows into a free cell beside it drawn uniformly, which gives blobs
 *   where growing by fewest neighbors gives combs.
 */
export function growToSize(p: DividedGrid, rng: RandomState, size: () => number): Dsf {
  const { w, h } = p;
  const wh = w * h;
  const regions = new Dsf(wh);

  const free = new Uint8Array(wh).fill(1);
  let remaining = wh;

  const nb: number[] = [];
  const neighbors = (i: number): number[] => {
    nb.length = 0;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) nb.push(i - 1);
    if (x < w - 1) nb.push(i + 1);
    if (y > 0) nb.push(i - w);
    if (y < h - 1) nb.push(i + w);
    return nb;
  };
  const freeDegree = (i: number): number => {
    let n = 0;
    for (const j of neighbors(i)) if (free[j]) n++;
    return n;
  };

  const frontier: number[] = [];

  while (remaining > 0) {
    // Reservoir sampling makes the choice uniform among the cells tied for
    // fewest free neighbors.
    let seed = -1;
    let bestDegree = 5;
    let ties = 0;
    for (let i = 0; i < wh; i++) {
      if (!free[i]) continue;
      const d = freeDegree(i);
      if (d < bestDegree) {
        bestDegree = d;
        seed = i;
        ties = 1;
      } else if (d === bestDegree) {
        ties++;
        if (randomUpto(rng, ties) === 0) seed = i;
      }
    }

    const target = Math.min(size(), remaining);
    let cells = 1;
    free[seed] = 0;
    remaining--;
    frontier.length = 0;
    for (const j of neighbors(seed)) if (free[j]) frontier.push(j);

    while (cells < target && frontier.length > 0) {
      // An entry can be stale (taken by this region through another
      // neighbor) or listed twice, and is dropped here when drawn: keeping
      // the list unique would cost a lookup per push and deal the same.
      const k = randomUpto(rng, frontier.length);
      const cell = frontier[k];
      frontier[k] = frontier[frontier.length - 1];
      frontier.pop();
      if (!free[cell]) continue;

      free[cell] = 0;
      remaining--;
      regions.merge(seed, cell);
      cells++;
      for (const j of neighbors(cell)) if (free[j]) frontier.push(j);
    }
  }

  return regions;
}

// --- reading a division --------------------------------------------------------

/**
 * Each cell's region as a number from 0, the regions numbered in the order
 * their first cells are met reading the grid, so that two divisions that are
 * the same get the same numbers whatever built them.
 */
export function regionNumbers(regions: Dsf, cells: number): Int32Array {
  const numberOf = new Map<number, number>();
  return Int32Array.from({ length: cells }, (_, i) => {
    const root = regions.canonify(i);
    let number = numberOf.get(root);
    if (number === undefined) {
      number = numberOf.size;
      numberOf.set(root, number);
    }
    return number;
  });
}
