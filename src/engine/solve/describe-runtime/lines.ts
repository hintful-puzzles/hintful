/** Walks along the grid: rays, steps, the chains the marks make, and the
 * edges a walk crosses (`describe-runtime.ts`). */

import type { Marks } from "./marks.ts";
import type { GridSpace } from "./space.ts";

const rays = new WeakMap<GridSpace, Map<number, readonly number[]>>();
/** The space asked last and its rays, by `c` and `n`. */
let raySpace: GridSpace | null = null;
let lastRays = new Map<number, readonly number[]>();

/** `ray(c, n)`: the cells from `n` on, each a step from `c` to `n` further,
 * up to the grid's edge. Built once a space, `c` and `n`: a technique asks
 * it of every arm of every cell it binds, every pass (Range's `seen`), and
 * building it each time was a quarter of a large board's deal. */
export function ray(sp: GridSpace, c: number, n: number): readonly number[] {
  if (sp !== raySpace) {
    let bySpace = rays.get(sp);
    if (bySpace === undefined) {
      bySpace = new Map();
      rays.set(sp, bySpace);
    }
    raySpace = sp;
    lastRays = bySpace;
  }
  const key = c * sp.cells.length + n;
  const known = lastRays.get(key);
  if (known !== undefined) return known;
  const dx = (n % sp.w) - (c % sp.w);
  const dy = ((n / sp.w) | 0) - ((c / sp.w) | 0);
  const out: number[] = [];
  for (
    let x = n % sp.w, y = (n / sp.w) | 0;
    x >= 0 && x < sp.w && y >= 0 && y < sp.h;
    x += dx, y += dy
  )
    out.push(y * sp.w + x);
  lastRays.set(key, out);
  return out;
}

/** `step(c, d)`: the cell beside `c` in direction `d`, numbered as the
 * slots are, 1 up, 2 down, 3 left, 4 right; none off the grid, and for any
 * other `d`. */
export function step(sp: GridSpace, c: number, d: number): number {
  const x = c % sp.w;
  const y = (c / sp.w) | 0;
  switch (d) {
    case 1:
      return y > 0 ? c - sp.w : -1;
    case 2:
      return y + 1 < sp.h ? c + sp.w : -1;
    case 3:
      return x > 0 ? c - 1 : -1;
    case 4:
      return x + 1 < sp.w ? c + 1 : -1;
    default:
      return -1;
  }
}

/** The compass's steps, from up clockwise, as `compass` numbers them from 1. */
const COMPASS_DX = [0, 1, 1, 1, 0, -1, -1, -1];
const COMPASS_DY = [-1, -1, 0, 1, 1, 1, 0, -1];

/**
 * `compass(c, a, k)`: the cell `k` squares from `c` along compass direction
 * `a`, numbered from 1 up and clockwise, so 2 is up and right and 8 up and
 * left; none off the grid, and for `k` below 1 or any other `a`.
 */
export function compass(sp: GridSpace, c: number, a: number, k: number): number {
  if (c < 0 || k < 1 || a < 1 || a > 8) return -1;
  const x = (c % sp.w) + k * COMPASS_DX[a - 1];
  const y = ((c / sp.w) | 0) + k * COMPASS_DY[a - 1];
  return x >= 0 && x < sp.w && y >= 0 && y < sp.h ? y * sp.w + x : -1;
}

/** The cells a chain has reached, by the walk that reached them. */
let reached = new Int32Array(0);
let walk = 0;

/**
 * `chain(c)`: `c` and the cells its value names (the answer's `to`), each
 * from the one before, ending at a cell whose value names no cell or one
 * already reached; in reading order, the order the soundness checker can
 * give a set the marks decide. `next` is the cell a cell's value names, `-1`
 * where it has none.
 */
export function chain(
  sp: GridSpace,
  next: (c: number) => number,
  c: number,
): readonly number[] {
  if (c < 0) return [];
  if (reached.length < sp.cells.length) reached = new Int32Array(sp.cells.length);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  const out: number[] = [];
  for (let at = c; at >= 0 && reached[at] !== walk; at = next(at)) {
    reached[at] = walk;
    out.push(at);
  }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/**
 * The chains of every cell of some marks at once, kept while their values
 * stand: each cell's chain read as a tree of the cells leading into the
 * cell it ends at, so that its length and whether it holds a cell are
 * lookups. Each cell names one cell, so a group holds at most one loop, and
 * each cell of a loop roots a tree of its own.
 */
interface Chains {
  placed: number;
  epoch: number;
  /** `|chain(c)|`. */
  len: Int32Array;
  /** The cell each cell's tree is rooted at: the cell its chain ends at,
   * or the first cell of the loop it runs into. */
  root: Int32Array;
  /** Each cell's loop, by one of its cells, -1 for none. */
  loop: Int32Array;
  /** When the walk of the trees enters each cell and leaves it: a cell's
   * chain holds the cells whose interval holds its own. */
  enter: Int32Array;
  leave: Int32Array;
  /** The cell entered at each tick of the walk's clock, -1 at a tick that
   * leaves one: a cell's tree is the cells entered between its ticks. */
  tick: Int32Array;
}

/** The key the marks keep their {@link Chains} under. */
const CHAINS = Symbol("chains");

function chainsOf(sp: GridSpace, b: Marks, next: (c: number) => number): Chains {
  const was = b.kept.get(CHAINS) as Chains | undefined;
  if (was !== undefined && was.placed === b.placed && was.epoch === b.epoch) return was;
  const n = sp.cells.length;
  const to = new Int32Array(n);
  for (let c = 0; c < n; c++) to[c] = next(c);
  const loop = new Int32Array(n).fill(-1);
  // 0 unseen, 1 on the walk being made, 2 done.
  const seen = new Uint8Array(n);
  const path: number[] = [];
  for (let c = 0; c < n; c++) {
    path.length = 0;
    let at = c;
    while (at >= 0 && seen[at] === 0) {
      seen[at] = 1;
      path.push(at);
      at = to[at];
    }
    if (at >= 0 && seen[at] === 1)
      for (let i = path.indexOf(at); i < path.length; i++) loop[path[i]] = at;
    for (const p of path) seen[p] = 2;
  }
  const loopSize = new Int32Array(n);
  for (let c = 0; c < n; c++) if (loop[c] >= 0) loopSize[loop[c]]++;
  // The trees: each cell off a loop under the cell it names.
  const first = new Int32Array(n).fill(-1);
  const sibling = new Int32Array(n).fill(-1);
  for (let c = n - 1; c >= 0; c--) {
    if (loop[c] >= 0 || to[c] < 0) continue;
    sibling[c] = first[to[c]];
    first[to[c]] = c;
  }
  const len = new Int32Array(n);
  const root = new Int32Array(n);
  const enter = new Int32Array(n);
  const leave = new Int32Array(n);
  const tick = new Int32Array(2 * n).fill(-1);
  const stack: number[] = [];
  // Each cell is pushed as it is entered, and left once its last child has
  // been: `child` is the next of its children to enter.
  const child = first;
  let clock = 0;
  for (let r = 0; r < n; r++) {
    if (loop[r] < 0 && to[r] >= 0) continue;
    root[r] = r;
    len[r] = loop[r] >= 0 ? loopSize[loop[r]] : 1;
    tick[clock] = r;
    enter[r] = clock++;
    stack.push(r);
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const k = child[top];
      if (k < 0) {
        leave[top] = clock++;
        stack.pop();
        continue;
      }
      child[top] = sibling[k];
      root[k] = r;
      len[k] = len[top] + 1;
      tick[clock] = k;
      enter[k] = clock++;
      stack.push(k);
    }
  }
  const made: Chains = {
    placed: b.placed,
    epoch: b.epoch,
    len,
    root,
    loop,
    enter,
    leave,
    tick,
  };
  b.kept.set(CHAINS, made);
  return made;
}

/** `|chain(c)|` on the marks, from their kept chains. */
export function chainLength(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  c: number,
): number {
  return c < 0 ? 0 : chainsOf(sp, b, next).len[c];
}

/** Whether `x` is in `chain(c)` on the marks, from their kept chains. */
export function chainHas(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  x: number,
  c: number,
): boolean {
  if (x < 0 || c < 0) return false;
  const s = chainsOf(sp, b, next);
  const r = s.root[c];
  if (s.loop[x] >= 0) return s.loop[x] === s.loop[r];
  return s.root[x] === r && s.enter[x] <= s.enter[c] && s.leave[c] <= s.leave[x];
}

/** `last(c)` on the marks, from their kept chains: the cell `c`'s chain
 * ends at, none where it runs into a loop. */
export function chainEnd(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  c: number,
): number {
  if (c < 0) return -1;
  const s = chainsOf(sp, b, next);
  return s.loop[s.root[c]] >= 0 ? -1 : s.root[c];
}

/** `last(c)` walked: the cell `c`'s chain ends at, none where it runs into
 * a loop. */
export function lastOf(next: (c: number) => number, c: number): number {
  const seen = new Set<number>();
  for (let at = c; at >= 0; at = next(at)) {
    if (seen.has(at)) return -1;
    seen.add(at);
    if (next(at) < 0) return at;
  }
  return -1;
}

/** The cells whose chain holds `x` on the marks, in reading order: `x`'s
 * tree read off the kept chains, or on a loop every cell running into it. */
export function chainHolders(
  sp: GridSpace,
  b: Marks,
  next: (c: number) => number,
  x: number,
): number[] {
  if (x < 0) return [];
  const s = chainsOf(sp, b, next);
  const out: number[] = [];
  if (s.loop[x] >= 0) {
    for (let k = 0; k < s.root.length; k++)
      if (s.loop[s.root[k]] === s.loop[x]) out.push(k);
    return out;
  }
  for (let t = s.enter[x]; t < s.leave[x]; t++) if (s.tick[t] >= 0) out.push(s.tick[t]);
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/**
 * `slash(c, k)`: the value cell `c` holds where its diagonal meets point
 * `k`, 1 for the one from above left to below right and 2 for the other;
 * none where `k` is not one of its points.
 */
export function slash(sp: GridSpace, c: number, k: number): number {
  if (c < 0 || k < 0) return -1;
  // Square c's corner above left is point c + y, and its other three are
  // 1, w + 1 and w + 2 past it.
  const d = k - c - ((c / sp.w) | 0);
  return d === 0 || d === sp.w + 2 ? 1 : d === 1 || d === sp.w + 1 ? 2 : -1;
}

/** The edges {@link through} may cross, set for one call. */
let crossable = new Uint8Array(0);

/**
 * `through(c, E)`: `c` and the cells reached from it across the edges `E`,
 * each between two orthogonal neighbors, in reading order.
 */
export function through(
  sp: GridSpace,
  c: number,
  E: readonly number[],
): readonly number[] {
  if (c < 0) return [];
  const n = sp.cells.length;
  if (reached.length < n) reached = new Int32Array(n);
  const edges = sp.edgeEnds.length / 2;
  if (crossable.length < edges) crossable = new Uint8Array(edges);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  for (const e of E) crossable[e] = 1;
  const out = [c];
  reached[c] = walk;
  for (let i = 0; i < out.length; i++) {
    const across = sp.edgeAdj[out[i]];
    const by = sp.cellEdges[out[i]];
    for (let k = 0; k < across.length; k++) {
      const q = across[k];
      if (reached[q] === walk || !crossable[by[k]]) continue;
      reached[q] = walk;
      out.push(q);
    }
  }
  for (const e of E) crossable[e] = 0;
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/**
 * `through(c, {e in edges where P})`: {@link through} over the edges `crosses`
 * holds of, asked only of the edges the walk from `c` meets. A set of edges
 * stated in place, not bound, is read this way, so a walk along one piece of
 * line costs the piece, not the board: a supposed line changes the set at
 * every look (Path's).
 */
export function throughWhere(
  sp: GridSpace,
  c: number,
  crosses: (e: number) => boolean,
): readonly number[] {
  if (c < 0) return [];
  const n = sp.cells.length;
  if (reached.length < n) reached = new Int32Array(n);
  if (++walk === 0x7fffffff) {
    reached.fill(0);
    walk = 1;
  }
  // `crosses` may walk too (a piece's ends read inside a stretch's test),
  // which takes the counter on: this walk's cells are the ones marked with
  // its own.
  const mine = walk;
  const out = [c];
  reached[c] = mine;
  for (let i = 0; i < out.length; i++) {
    const across = sp.edgeAdj[out[i]];
    const by = sp.cellEdges[out[i]];
    for (let k = 0; k < across.length; k++) {
      const q = across[k];
      if (reached[q] === mine || !crosses(by[k])) continue;
      reached[q] = mine;
      out.push(q);
    }
  }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}
