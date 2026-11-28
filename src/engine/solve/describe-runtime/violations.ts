/**
 * What a compiled `violations` reads a board still being filled through: a
 * read of an undecided element stops the term reading it, which is then
 * neither true nor false of the board, since some completion may make it
 * either. A term whose evaluation read only decided elements has the value
 * it has on every completion, so its verdict is exact; that is the whole of
 * the soundness argument for a term the compiler does not bound itself.
 */

import type { GridSpace } from "./space.ts";

/** A statement of the description the board, as far as it is filled,
 * already breaks: no completion makes it true. */
export interface Violation {
  /** The statement broken: a rule's name, `shape.<i>` for the i-th shape
   * entry, `<variation>.shape.<i>` and `<variation>.<rule>` for a
   * variation's, `clue.<kind>` for a clue's meaning, or `domain` for a
   * value no square of its kind may hold. */
  readonly rule: string;
  /** The clue broken, its index in its kind's list; -1 for a rule. */
  readonly clue: number;
  /** The answer's elements, cells or edges, the violation is at: those it
   * binds; where it binds none, those its deciding term names (the tents
   * of a row with too many); where that names none, those it read. A
   * clue's may be empty, the clue itself being where it is. */
  readonly at: readonly number[];
  /** Where the description labels the statement's breach (`breaches`), its
   * labels in this binding; absent where it labels none, or where a label
   * read a square still open. */
  readonly labels?: readonly BreachLabel[];
}

/** A label a breach is drawn as: on square `at`, at `place`, its text each
 * string as written and each number as the board draws that value. */
export interface BreachLabel {
  readonly at: number;
  readonly place: "above" | "below";
  readonly says: readonly (string | number)[];
}

/** Thrown by a read of an undecided element; caught by the term it stops. */
const UNDECIDED: unique symbol = Symbol("undecided");

/** The element whose read stopped the last term stopped, or -1 where that
 * was no one element's. */
let stop = -1;

/** Rethrow `e` unless it is an undecided read's stop. */
export function undecided(e: unknown): void {
  if (e !== UNDECIDED) throw e;
}

/** The element the last stop was at, or -1 (read straight after the catch,
 * before anything else may stop). */
export function stoppedAt(): number {
  return stop;
}

/** Stop the term unless `known`: for a set the check could not read the
 * members of, which a quantifier over it then cannot range over. */
export function decidedIf(known: boolean): void {
  if (known) return;
  stop = -1;
  throw UNDECIDED;
}

/**
 * The verdict on a term `f` that one undecided element `x` stopped, taken
 * over each value `mask` lets `x` hold: `0` (false) where every value makes
 * the term false, `1` where every one makes it true, and `2` (undecided)
 * otherwise, or where another undecided read stops it. Sound because some
 * value of `mask` is `x`'s on every completion. `g` holds each value at `x`
 * while `f` runs, and 0 there after.
 */
export function overDomain(
  g: Int32Array,
  x: number,
  mask: number,
  rd: number[],
  f: () => boolean,
): number {
  let seen = 0;
  const n0 = rd.length;
  for (let d = 1; d < 32; d++) {
    if (!((mask >> d) & 1)) continue;
    g[x] = d;
    rd.length = n0;
    try {
      seen |= f() ? 1 : 2;
    } catch (e) {
      undecided(e);
      seen = 3;
      break;
    }
  }
  g[x] = 0;
  return seen === 1 ? 1 : seen === 2 ? 0 : 2;
}

/** `value(x)` on a board being filled: `-1` for `none`, the value where it
 * is decided, recorded in `rd`; an undecided one stops the term. */
export function heldIn(g: ArrayLike<number>, x: number, rd: number[]): number {
  if (x < 0) return -1;
  const v = g[x];
  if (v > 0) {
    rd.push(x);
    return v;
  }
  stop = x;
  throw UNDECIDED;
}

/** `known(x)` on a board being filled: on every completion every element
 * is known, so an undecided one stops the term. */
export function knownIn(g: ArrayLike<number>, x: number, rd: number[]): boolean {
  if (x < 0) return false;
  if (g[x] > 0) {
    rd.push(x);
    return true;
  }
  stop = x;
  throw UNDECIDED;
}

/** Stop the term unless every element of `els` is decided: for a runtime
 * call that reads the grid itself (`beamOf`). */
export function decidedAll(g: ArrayLike<number>, els: readonly number[]): void {
  for (const x of els)
    if (!(g[x] > 0)) {
      stop = -1;
      throw UNDECIDED;
    }
}

/**
 * `matched(A, B)` on a board being filled, each set as the cells sure to be
 * in it (`must`) and those that may be (`may`): the cells of a group that
 * cannot all be paired on any completion. A member of A pairs with a member
 * of B beside it, so the A it must hold in a group joined by sides through
 * `mustA` and `mayB` need as many B there (Hall's condition on that group),
 * and the same with the sides exchanged. Empty where no group is short;
 * that the whole pairing holds is then the exact check's, once every cell
 * is decided.
 */
export function unmatched(
  sp: GridSpace,
  mustA: readonly number[],
  mayA: readonly number[],
  mustB: readonly number[],
  mayB: readonly number[],
): number[] {
  return [...short(sp, mustA, mayB), ...short(sp, mustB, mayA)];
}

/** The edges with one end among `cells` and the other not: a region's
 * outline, by which a region of the wrong size is named on a board whose
 * answer is its edges. */
export function rimEdges(sp: GridSpace, cells: readonly number[]): number[] {
  const inside = new Set(cells);
  const out: number[] = [];
  for (const c of cells)
    for (const e of sp.cellEdges[c]) {
      const a = sp.edgeEnds[2 * e];
      if (!inside.has(a === c ? sp.edgeEnds[2 * e + 1] : a)) out.push(e);
    }
  return out;
}

/**
 * `connected(S)` on a board being filled, `S` as the cells sure to be in it
 * (`must`) and those that may be (`may`): `null` where every completion may
 * still join the sure members, and otherwise where the set breaks, the cells
 * surely out of it that touch two of the groups the possible members fall
 * into, each group holding a sure member (Range's shaded squares that cut
 * the clear ones apart). Every such group is as much to blame as the
 * others, so where nothing surely out touches two of them, every sure
 * member is named.
 */
export function apart(
  sp: GridSpace,
  must: readonly number[],
  may: readonly number[],
): number[] | null {
  if (must.length < 2) return null;
  const n = sp.w * sp.h;
  const group = new Int32Array(n).fill(-2);
  for (const c of may) group[c] = -1;
  const queue: number[] = [];
  for (const start of may) {
    if (group[start] !== -1) continue;
    group[start] = start;
    queue.length = 0;
    queue.push(start);
    for (let i = 0; i < queue.length; i++)
      for (const p of sp.adj4[queue[i]])
        if (group[p] === -1) {
          group[p] = start;
          queue.push(p);
        }
  }
  const held = new Set(must.map((c) => group[c]));
  if (held.size < 2) return null;
  const wall: number[] = [];
  for (let c = 0; c < n; c++) {
    if (group[c] !== -2) continue;
    let first = -1;
    for (const p of sp.adj4[c]) {
      const g = group[p];
      if (!held.has(g)) continue;
      if (first < 0) first = g;
      else if (g !== first) {
        wall.push(c);
        break;
      }
    }
  }
  return wall.length > 0 ? wall : [...must];
}

/**
 * "Every cell of `need` reaches every other through the edges of `E`" on a
 * board being filled, `E` as the edges sure to be in it (`mustE`) and those
 * that may be (`mayE`): `null` where every completion may still join them,
 * and otherwise where it breaks. A group the possible edges make that holds
 * a cell of `need` is finished where no edge in it is undecided, and only
 * then is it sure to be cut off as it stands (Spokes' hubs with every line
 * drawn and the rest of the board out of reach): each finished group's
 * edges are named, or, for a cell with none, the edges ruled out round it.
 * Which of two unfinished groups is wrong is not certain, so they name
 * nothing.
 */
export function apartThrough(
  sp: GridSpace,
  need: readonly number[],
  mustE: readonly number[],
  mayE: readonly number[],
): number[] | null {
  if (need.length < 2) return null;
  const n = sp.cells.length;
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const root = (c: number): number => {
    let r = c;
    while (parent[r] !== r) r = parent[r];
    while (parent[c] !== r) [c, parent[c]] = [parent[c], r];
    return r;
  };
  for (const e of mayE) {
    const a = root(sp.edgeEnds[2 * e]);
    const b = root(sp.edgeEnds[2 * e + 1]);
    if (a !== b) parent[a] = b;
  }
  const held = new Set(need.map(root));
  if (held.size < 2) return null;
  const sure = new Set(mustE);
  const open = new Set<number>();
  for (const e of mayE) if (!sure.has(e)) open.add(root(sp.edgeEnds[2 * e]));
  const may = new Set(mayE);
  const out: number[] = [];
  for (const g of held) {
    if (open.has(g)) continue;
    const own = mustE.filter((e) => root(sp.edgeEnds[2 * e]) === g);
    if (own.length > 0) {
      out.push(...own);
      continue;
    }
    for (let c = 0; c < n; c++)
      if (root(c) === g)
        for (const e of sp.cellEdges[c])
          if (!may.has(e) && !out.includes(e)) out.push(e);
  }
  return out;
}

/**
 * The bounds `lo`..`hi` of a definition the player's mark on its element
 * narrows: the least and greatest value whose mark term `of` the mark's
 * values `mask` hold (a Tracks square marked track has two rails). Where no
 * value is left the mark disagrees with the board, and the board's own
 * bounds stand.
 */
export function markRange(
  lo: number,
  hi: number,
  mask: number,
  of: (d: number) => number,
): readonly [number, number] {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [lo, hi];
  let least = Infinity;
  let most = -Infinity;
  for (let d = lo; d <= hi; d++) {
    const v = of(d);
    if (v < 0 || v > 31 || !((mask >> v) & 1)) continue;
    least = Math.min(least, d);
    most = d;
  }
  return least > most ? [lo, hi] : [least, most];
}

/**
 * The edges of `E` that lie on a cycle of `E`'s edges: each joins two cells
 * the rest of `E` joins too, so "no edge of E closes a loop" breaks at each
 * (Path's loop, every line of it). Every edge that is not a bridge of the
 * graph `E` makes, by one depth-first walk (Tarjan's bridges).
 */
export function cycleEdges(sp: GridSpace, E: readonly number[]): number[] {
  const ends: number[] = [];
  for (const e of E) ends.push(sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]);
  const on = cycleLinks(sp.cells.length, ends);
  return E.filter((_, i) => on[i] === 1);
}

/**
 * The squares of `lines`, triples of a square and the two points its
 * diagonal joins, whose diagonal lies on a cycle of the others: "no
 * diagonal closes a loop" breaks at each (Slant's loop, every diagonal of
 * it).
 */
export function cycleDiagonals(sp: GridSpace, lines: readonly number[]): number[] {
  const ends: number[] = [];
  for (let i = 0; i < lines.length; i += 3) ends.push(lines[i + 1], lines[i + 2]);
  const on = cycleLinks(sp.points.length, ends);
  const out: number[] = [];
  for (let i = 0; i < on.length; i++) if (on[i] === 1) out.push(lines[3 * i]);
  return out;
}

/**
 * Of the links `ends` lists by their two ends, among `n` nodes, 1 for each
 * on a cycle of the links: every link that is not a bridge of the graph they
 * make, by one depth-first walk (Tarjan's bridges).
 */
function cycleLinks(n: number, ends: readonly number[]): Uint8Array {
  const m = ends.length / 2;
  // Each node's links, as a compressed adjacency list.
  const start = new Int32Array(n + 1);
  for (const x of ends) start[x + 1]++;
  for (let i = 0; i < n; i++) start[i + 1] += start[i];
  const fill = start.slice(0, n);
  const links = new Int32Array(2 * m);
  for (let l = 0; l < m; l++) {
    links[fill[ends[2 * l]]++] = l;
    links[fill[ends[2 * l + 1]]++] = l;
  }
  const order = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  const bridge = new Uint8Array(m);
  let time = 0;
  // Each frame: the node, the link it was entered by, and how far through
  // its links the walk is.
  const node: number[] = [];
  const by: number[] = [];
  const at: number[] = [];
  for (let l0 = 0; l0 < m; l0++) {
    const root = ends[2 * l0];
    if (order[root] >= 0) continue;
    order[root] = low[root] = time++;
    node.push(root);
    by.push(-1);
    at.push(start[root]);
    while (node.length > 0) {
      const top = node.length - 1;
      const c = node[top];
      if (at[top] < start[c + 1]) {
        const l = links[at[top]++];
        // The link walked in by is not a way back, though another link
        // between the same two nodes is.
        if (l === by[top]) continue;
        const d = ends[2 * l] === c ? ends[2 * l + 1] : ends[2 * l];
        if (order[d] >= 0) {
          low[c] = Math.min(low[c], order[d]);
          continue;
        }
        order[d] = low[d] = time++;
        node.push(d);
        by.push(l);
        at.push(start[d]);
        continue;
      }
      node.pop();
      const l = by.pop() as number;
      at.pop();
      if (node.length === 0) continue;
      const parent = node[node.length - 1];
      low[parent] = Math.min(low[parent], low[c]);
      if (low[c] > order[parent]) bridge[l] = 1;
    }
  }
  return bridge.map((b) => 1 - b);
}

/** The members of `need` in each group of `need` and `give` joined by sides
 * where `need` outnumbers `give`. */
function short(
  sp: GridSpace,
  need: readonly number[],
  give: readonly number[],
): number[] {
  const n = sp.w * sp.h;
  const side = new Int8Array(n);
  for (const c of give) side[c] = 2;
  for (const c of need) side[c] = 1;
  const group = new Int32Array(n).fill(-1);
  const out: number[] = [];
  const stack: number[] = [];
  for (const start of need) {
    if (group[start] >= 0) continue;
    group[start] = start;
    stack.push(start);
    const members: number[] = [];
    let given = 0;
    while (stack.length > 0) {
      const c = stack.pop() as number;
      if (side[c] === 1) members.push(c);
      else given++;
      for (const p of sp.adj4[c]) {
        // A pairing joins a cell of one side to one of the other.
        if (side[p] === 0 || side[p] === side[c] || group[p] >= 0) continue;
        group[p] = start;
        stack.push(p);
      }
    }
    if (members.length > given) out.push(...members);
  }
  return out;
}
