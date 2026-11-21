/** Connectivity over a set of cells: runs, connected sets, matchings, cuts,
 * and the cells a search reaches (`describe-runtime.ts`). */

import type { GridSpace } from "./space.ts";

/** `stretch(L, c, S)`: the cells of the line `L` round `c`, in `L`'s order,
 * each in `S` with none outside it between: the maximal run of `S` along `L`
 * holding `c`, none where `S` or `L` does not hold `c`. */
export function stretch(
  L: readonly number[],
  c: number,
  S: readonly number[],
): readonly number[] {
  const i = L.indexOf(c);
  if (i < 0 || !S.includes(c)) return [];
  let a = i;
  while (a > 0 && S.includes(L[a - 1])) a--;
  let b = i + 1;
  while (b < L.length && S.includes(L[b])) b++;
  return L.slice(a, b);
}

/** `stretch(L, c, {x in cells(L) where P})` with `P` tested from `c`
 * outward, `inS` its test: the run reads its own squares and the two that
 * end it, and nothing else of the line. */
export function stretchWhere(
  L: readonly number[],
  c: number,
  inS: (x: number) => boolean,
): readonly number[] {
  const i = L.indexOf(c);
  if (i < 0 || !inS(c)) return [];
  let a = i;
  while (a > 0 && inS(L[a - 1])) a--;
  let b = i + 1;
  while (b < L.length && inS(L[b])) b++;
  return L.slice(a, b);
}

/** `connected(S)`: whether the cells `S` are one group, each reaching every
 * other through members side by side. None and one are. */
export function connected(sp: GridSpace, S: readonly number[]): boolean {
  if (S.length < 2) return true;
  const inS = new Uint8Array(sp.w * sp.h);
  for (const c of S) inS[c] = 1;
  const queue = [S[0]];
  inS[S[0]] = 2;
  for (let i = 0; i < queue.length; i++)
    for (const p of sp.adj4[queue[i]])
      if (inS[p] === 1) {
        inS[p] = 2;
        queue.push(p);
      }
  return queue.length === S.length;
}

/**
 * `matched(A, B)`: whether the cells `A` and `B` pair off one to one, each
 * member of `A` with a member of `B` side by side (Tents' tents and trees).
 * Kuhn's augmenting paths, from each member of `A` in turn.
 */
export function matched(
  sp: GridSpace,
  A: readonly number[],
  B: readonly number[],
): boolean {
  if (A.length !== B.length) return false;
  const n = sp.w * sp.h;
  const inB = new Uint8Array(n);
  for (const c of B) inB[c] = 1;
  const partner = new Int32Array(n).fill(-1);
  const seen = new Int32Array(n).fill(-1);
  const augment = (a: number, round: number): boolean => {
    for (const b of sp.adj4[a]) {
      if (inB[b] === 0 || seen[b] === round) continue;
      seen[b] = round;
      if (partner[b] < 0 || augment(partner[b], round)) {
        partner[b] = a;
        return true;
      }
    }
    return false;
  };
  for (let i = 0; i < A.length; i++) if (!augment(A[i], i)) return false;
  return true;
}

/**
 * `cuts(S)`: the members of `S` without which the rest are not one group, in
 * `S`'s order. A depth-first search counts, for each member, the pieces its
 * own group falls into without it (Hopcroft and Tarjan's articulation
 * points, a group of one falling into none), and the rest are one group
 * where that leaves one piece in all.
 */
export function cuts(sp: GridSpace, S: readonly number[]): readonly number[] {
  const n = sp.w * sp.h;
  const inS = new Uint8Array(n);
  for (const c of S) inS[c] = 1;
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  const pieces = new Int32Array(n);
  const parent = new Int32Array(n).fill(-1);
  const next = new Int32Array(n);
  let time = 0;
  let groups = 0;
  for (const root of S) {
    if (disc[root] >= 0) continue;
    groups++;
    disc[root] = low[root] = time++;
    const stack = [root];
    while (stack.length > 0) {
      const v = stack[stack.length - 1];
      const around = sp.adj4[v];
      if (next[v] < around.length) {
        const u = around[next[v]++];
        if (!inS[u]) continue;
        if (disc[u] < 0) {
          parent[u] = v;
          disc[u] = low[u] = time++;
          stack.push(u);
        } else if (u !== parent[v]) low[v] = Math.min(low[v], disc[u]);
        continue;
      }
      stack.pop();
      const p = parent[v];
      if (p < 0) continue;
      low[p] = Math.min(low[p], low[v]);
      if (low[v] >= disc[p]) pieces[p]++;
    }
  }
  // Without c, its own group's pieces stand beside the other groups, and a
  // member other than a root keeps the piece holding its parent.
  return S.filter((c) => groups - 1 + pieces[c] + (parent[c] >= 0 ? 1 : 0) >= 2);
}

/**
 * `cut_edges(E)`: the members of `E` whose two cells `E` joins only through
 * them, in `E`'s order. One depth-first search over the cells, across the
 * members (Tarjan's bridges): the edge a cell was reached by is one where
 * nothing below the cell reaches back above it. It answers for every member
 * what `end2(e) not in through(end1(e), E - {e})` asks of one, each of which
 * is a walk of its own.
 */
export function cutEdges(sp: GridSpace, E: readonly number[]): readonly number[] {
  const n = sp.cells.length;
  const inE = new Uint8Array(sp.edgeEnds.length / 2);
  for (const e of E) inE[e] = 1;
  const disc = new Int32Array(n).fill(-1);
  const low = new Int32Array(n);
  // The edge each cell was reached by, -1 at a root.
  const via = new Int32Array(n).fill(-1);
  const next = new Int32Array(n);
  const bridge = new Uint8Array(inE.length);
  let time = 0;
  for (const e of E) {
    for (let end = 0; end < 2; end++) {
      const root = sp.edgeEnds[2 * e + end];
      if (disc[root] >= 0) continue;
      disc[root] = low[root] = time++;
      const stack = [root];
      while (stack.length > 0) {
        const v = stack[stack.length - 1];
        const across = sp.edgeAdj[v];
        if (next[v] < across.length) {
          const k = next[v]++;
          const x = sp.cellEdges[v][k];
          if (!inE[x] || x === via[v]) continue;
          const u = across[k];
          if (disc[u] < 0) {
            via[u] = x;
            disc[u] = low[u] = time++;
            stack.push(u);
          } else low[v] = Math.min(low[v], disc[u]);
          continue;
        }
        stack.pop();
        const x = via[v];
        if (x < 0) continue;
        const p =
          sp.edgeEnds[2 * x] === v ? sp.edgeEnds[2 * x + 1] : sp.edgeEnds[2 * x];
        low[p] = Math.min(low[p], low[v]);
        if (low[v] > disc[p]) bridge[x] = 1;
      }
    }
  }
  return E.filter((e) => bridge[e] === 1);
}

/** The set, square and answers {@link reaches} last searched: a technique
 * asks of one group's reach once for each square in it. */
let reachSet: readonly number[] | null = null;
let reachLength = -1;
let reachFrom = -1;
let reachSpace: GridSpace | null = null;
/** How many members `c` reaches with each square taken out, by square, -1
 * where the square is not one `c` reaches. */
let reachKept = new Int32Array(0);
/** The search's own arrays, a square each, kept between searches. */
let reachIn = new Uint8Array(0);
let reachDisc = new Int32Array(0);
let reachLow = new Int32Array(0);
let reachSize = new Int32Array(0);
let reachLost = new Int32Array(0);
let reachParent = new Int32Array(0);
let reachNext = new Int32Array(0);

/**
 * `reaches(c, S, t)`: how many members of `S` the square `c` reaches through
 * members side by side once `t` is taken out, `c` among them; 0 where `c` is
 * `t` or not in `S`. One search from `c` answers every `t` (Hopcroft and
 * Tarjan's: a member cuts off each child in the search tree whose subtree
 * reaches no higher than it), so it is kept for the set and square last
 * asked. A set is read as it was first asked: the compiled code never
 * changes one it has bound.
 */
export function reaches(
  sp: GridSpace,
  c: number,
  S: readonly number[],
  t: number,
): number {
  if (
    S !== reachSet ||
    S.length !== reachLength ||
    c !== reachFrom ||
    sp !== reachSpace
  )
    searchReach(sp, c, S);
  if (c < 0 || t === c) return 0;
  const kept = t < 0 ? -1 : reachKept[t];
  // A square outside c's group takes nothing from it.
  return kept >= 0 ? kept : reachKept[c];
}

function searchReach(sp: GridSpace, c: number, S: readonly number[]): void {
  reachSet = S;
  reachLength = S.length;
  reachFrom = c;
  reachSpace = sp;
  const n = sp.w * sp.h;
  if (reachKept.length < n) {
    reachKept = new Int32Array(n);
    reachIn = new Uint8Array(n);
    reachDisc = new Int32Array(n);
    reachLow = new Int32Array(n);
    reachSize = new Int32Array(n);
    reachLost = new Int32Array(n);
    reachParent = new Int32Array(n);
    reachNext = new Int32Array(n);
  }
  reachKept.fill(-1, 0, n);
  const inS = reachIn;
  const disc = reachDisc;
  const low = reachLow;
  const size = reachSize;
  const lost = reachLost;
  const parent = reachParent;
  const next = reachNext;
  // Only the members are read before they are written.
  for (const x of S) {
    inS[x] = 1;
    disc[x] = -1;
    size[x] = 0;
    lost[x] = 0;
    parent[x] = -1;
    next[x] = 0;
  }
  if (c < 0 || !inS[c]) {
    for (const x of S) inS[x] = 0;
    if (c >= 0) reachKept[c] = 0;
    return;
  }
  const order: number[] = [];
  let time = 0;
  disc[c] = low[c] = time++;
  const stack = [c];
  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    const around = sp.adj4[v];
    if (next[v] < around.length) {
      const u = around[next[v]++];
      if (!inS[u]) continue;
      if (disc[u] < 0) {
        parent[u] = v;
        disc[u] = low[u] = time++;
        stack.push(u);
      } else if (u !== parent[v]) low[v] = Math.min(low[v], disc[u]);
      continue;
    }
    stack.pop();
    order.push(v);
    size[v] += 1;
    const p = parent[v];
    if (p < 0) continue;
    size[p] += size[v];
    low[p] = Math.min(low[p], low[v]);
    if (low[v] >= disc[p]) lost[p] += size[v];
  }
  const total = size[c];
  reachKept[c] = total;
  for (const v of order) if (v !== c) reachKept[v] = total - 1 - lost[v];
  for (const x of S) inS[x] = 0;
}
