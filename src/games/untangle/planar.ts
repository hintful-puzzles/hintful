/**
 * A crossing-free straight-line layout of a graph from its edges alone, so
 * Untangle can solve (and hint) a board whose generator's solution it does
 * not have: a shared game ID, or a resumed save.
 *
 * Three stages, each a textbook algorithm:
 *
 *  1. **Left-right planarity** (Brandes, "The Left-Right Planarity Test",
 *     2009; de Fraysseix & Rosenstiehl): a DFS orientation, the conflict-pair
 *     test, then the sign resolution that yields a rotation system — each
 *     vertex's neighbors in clockwise order. `null` for a non-planar graph,
 *     which only a hand-typed description can be.
 *  2. **Triangulation** of every face but the outer one, after joining the
 *     components and making the graph biconnected, so a canonical ordering
 *     exists. The added edges are scaffolding: dropping them from a
 *     crossing-free drawing leaves it crossing-free.
 *  3. **de Fraysseix–Pach–Pollack** shift drawing over a canonical ordering:
 *     integer coordinates on a `(2n-4) × (n-2)` grid, planar by construction.
 *
 * The rotation system is `cw`/`ccw` successor maps per half-edge plus a first
 * neighbor per vertex. Which way round "clockwise" is does not matter — a
 * mirror image of a planar drawing is planar — only that every stage reads
 * the maps the same way.
 */

import { retryLimit } from "../../engine/retry-limit.ts";
import type { Edge } from "./state.ts";

/** Every walk below closes on a consistent rotation system; a bug that
 * corrupts one would otherwise spin the worker for ever. A walk visits at most
 * every half-edge (under `6n` once triangulated), and triangulating a face can
 * revisit each of them once per edge it adds. */
const walkBound = (n: number): (() => void) =>
  retryLimit("untangle planar layout: a walk that must close", (6 * n + 6) ** 2);

/** A rotation system under construction. Half-edge `v→w` is keyed `v*n+w`. */
class Embedding {
  readonly cw = new Map<number, number>();
  readonly ccw = new Map<number, number>();
  readonly first: number[];
  readonly degree: number[];

  constructor(readonly n: number) {
    this.first = new Array<number>(n).fill(-1);
    this.degree = new Array<number>(n).fill(0);
  }

  private key(v: number, w: number): number {
    return v * this.n + w;
  }

  has(v: number, w: number): boolean {
    return this.cw.has(this.key(v, w));
  }

  cwOf(v: number, w: number): number {
    return this.cw.get(this.key(v, w)) as number;
  }

  ccwOf(v: number, w: number): number {
    return this.ccw.get(this.key(v, w)) as number;
  }

  /** Insert `v→w` clockwise after `v→ref` (or as `v`'s only half-edge). */
  addCw(v: number, w: number, ref: number): void {
    this.degree[v]++;
    if (ref < 0) {
      this.cw.set(this.key(v, w), w);
      this.ccw.set(this.key(v, w), w);
      this.first[v] = w;
      return;
    }
    const after = this.cwOf(v, ref);
    this.cw.set(this.key(v, ref), w);
    this.cw.set(this.key(v, w), after);
    this.ccw.set(this.key(v, after), w);
    this.ccw.set(this.key(v, w), ref);
  }

  /** Insert `v→w` counterclockwise before `v→ref`; it takes over as the
   * first neighbor if `ref` was. */
  addCcw(v: number, w: number, ref: number): void {
    if (ref < 0) {
      this.addCw(v, w, -1);
      return;
    }
    this.addCw(v, w, this.ccwOf(v, ref));
    if (ref === this.first[v]) this.first[v] = w;
  }

  addFirst(v: number, w: number): void {
    this.addCcw(v, w, this.first[v]);
    this.first[v] = w;
  }

  neighborsCw(v: number): number[] {
    const out: number[] = [];
    const start = this.first[v];
    if (start < 0) return out;
    let w = start;
    const step = walkBound(this.n);
    do {
      step();
      out.push(w);
      w = this.cwOf(v, w);
    } while (w !== start);
    return out;
  }

  /** The half-edge after `v→w` walking round the face on its right. */
  nextFaceNode(v: number, w: number): number {
    return this.ccwOf(w, v);
  }
}

// --- 1. left-right planarity -----------------------------------------------

interface Interval {
  low: number;
  high: number;
}

interface ConflictPair {
  left: Interval;
  right: Interval;
}

const NONE = -1;

const emptyInterval = (): Interval => ({ low: NONE, high: NONE });
const isEmpty = (i: Interval): boolean => i.low === NONE && i.high === NONE;

/** The rotation system of a planar graph, or `null` when it is not planar. */
function lrEmbedding(n: number, edges: readonly Edge[]): Embedding | null {
  if (n > 2 && edges.length > 3 * n - 6) return null;

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  }

  // Oriented edges, numbered as the DFS orients them.
  const src: number[] = [];
  const dst: number[] = [];
  const edgeId = new Map<number, number>();
  const oriented = (v: number, w: number): number => edgeId.get(v * n + w) ?? NONE;

  const height = new Array<number>(n).fill(NONE);
  const parentEdge = new Array<number>(n).fill(NONE);
  const lowpt: number[] = [];
  const lowpt2: number[] = [];
  const nesting: number[] = [];
  const out: number[][] = Array.from({ length: n }, () => []);
  const roots: number[] = [];

  const orient = (v: number): void => {
    const e = parentEdge[v];
    for (const w of adj[v]) {
      if (oriented(v, w) !== NONE || oriented(w, v) !== NONE) continue;
      const vw = src.length;
      src.push(v);
      dst.push(w);
      edgeId.set(v * n + w, vw);
      out[v].push(vw);
      lowpt[vw] = height[v];
      lowpt2[vw] = height[v];
      if (height[w] === NONE) {
        parentEdge[w] = vw;
        height[w] = height[v] + 1;
        orient(w);
      } else {
        lowpt[vw] = height[w];
      }
      nesting[vw] = 2 * lowpt[vw] + (lowpt2[vw] < height[v] ? 1 : 0);
      if (e !== NONE) {
        if (lowpt[vw] < lowpt[e]) {
          lowpt2[e] = Math.min(lowpt[e], lowpt2[vw]);
          lowpt[e] = lowpt[vw];
        } else if (lowpt[vw] > lowpt[e]) {
          lowpt2[e] = Math.min(lowpt2[e], lowpt[vw]);
        } else {
          lowpt2[e] = Math.min(lowpt2[e], lowpt2[vw]);
        }
      }
    }
  };
  for (let v = 0; v < n; v++) {
    if (height[v] !== NONE) continue;
    height[v] = 0;
    roots.push(v);
    orient(v);
  }

  const m = src.length;
  const ref = new Array<number>(m).fill(NONE);
  const side = new Array<number>(m).fill(1);
  const lowptEdge = new Array<number>(m).fill(NONE);
  const stackBottom: (ConflictPair | null)[] = new Array(m).fill(null);
  const S: ConflictPair[] = [];
  const top = (): ConflictPair | null => (S.length > 0 ? S[S.length - 1] : null);
  const conflicting = (i: Interval, b: number): boolean =>
    !isEmpty(i) && lowpt[i.high] > lowpt[b];
  const lowest = (p: ConflictPair): number => {
    if (isEmpty(p.left)) return lowpt[p.right.low];
    if (isEmpty(p.right)) return lowpt[p.left.low];
    return Math.min(lowpt[p.left.low], lowpt[p.right.low]);
  };
  const swap = (p: ConflictPair): void => {
    const t = p.left;
    p.left = p.right;
    p.right = t;
  };

  const byNesting = (v: number): number[] =>
    out[v].slice().sort((a, b) => nesting[a] - nesting[b]);
  let ordered = Array.from({ length: n }, (_, v) => byNesting(v));

  const addConstraints = (ei: number, e: number): boolean => {
    const P: ConflictPair = { left: emptyInterval(), right: emptyInterval() };
    do {
      const Q = S.pop() as ConflictPair;
      if (!isEmpty(Q.left)) swap(Q);
      if (!isEmpty(Q.left)) return false;
      if (lowpt[Q.right.low] > lowpt[e]) {
        if (isEmpty(P.right)) P.right = { ...Q.right };
        else ref[P.right.low] = Q.right.high;
        P.right.low = Q.right.low;
      } else {
        ref[Q.right.low] = lowptEdge[e];
      }
    } while (top() !== stackBottom[ei]);
    for (;;) {
      const T = top();
      if (T === null || !(conflicting(T.left, ei) || conflicting(T.right, ei))) break;
      const Q = S.pop() as ConflictPair;
      if (conflicting(Q.right, ei)) swap(Q);
      if (conflicting(Q.right, ei)) return false;
      ref[P.right.low] = Q.right.high;
      if (Q.right.low !== NONE) P.right.low = Q.right.low;
      if (isEmpty(P.left)) P.left = { ...Q.left };
      else ref[P.left.low] = Q.left.high;
      P.left.low = Q.left.low;
    }
    if (!(isEmpty(P.left) && isEmpty(P.right))) S.push(P);
    return true;
  };

  const removeBackEdges = (e: number): void => {
    const u = src[e];
    while (S.length > 0 && lowest(top() as ConflictPair) === height[u]) {
      const P = S.pop() as ConflictPair;
      if (P.left.low !== NONE) side[P.left.low] = -1;
    }
    if (S.length > 0) {
      const P = S.pop() as ConflictPair;
      while (P.left.high !== NONE && dst[P.left.high] === u)
        P.left.high = ref[P.left.high];
      if (P.left.high === NONE && P.left.low !== NONE) {
        ref[P.left.low] = P.right.low;
        side[P.left.low] = -1;
        P.left.low = NONE;
      }
      while (P.right.high !== NONE && dst[P.right.high] === u) {
        P.right.high = ref[P.right.high];
      }
      if (P.right.high === NONE && P.right.low !== NONE) {
        ref[P.right.low] = P.left.low;
        side[P.right.low] = -1;
        P.right.low = NONE;
      }
      S.push(P);
    }
    if (lowpt[e] < height[u]) {
      const T = top() as ConflictPair;
      const hl = T.left.high;
      const hr = T.right.high;
      ref[e] = hl !== NONE && (hr === NONE || lowpt[hl] > lowpt[hr]) ? hl : hr;
    }
  };

  const test = (v: number): boolean => {
    const e = parentEdge[v];
    for (const ei of ordered[v]) {
      const w = dst[ei];
      stackBottom[ei] = top();
      if (ei === parentEdge[w]) {
        if (!test(w)) return false;
      } else {
        lowptEdge[ei] = ei;
        S.push({ left: emptyInterval(), right: { low: ei, high: ei } });
      }
      if (lowpt[ei] < height[v]) {
        if (ei === ordered[v][0]) lowptEdge[e] = lowptEdge[ei];
        else if (!addConstraints(ei, e)) return false;
      }
    }
    if (e !== NONE) removeBackEdges(e);
    return true;
  };
  for (const r of roots) if (!test(r)) return null;

  const sign = (e: number): number => {
    // Iterative form of the recursive sign resolution: follow the ref chain,
    // then fold the sides back down it.
    const chain: number[] = [];
    let x = e;
    while (ref[x] !== NONE) {
      chain.push(x);
      x = ref[x];
    }
    for (let i = chain.length - 1; i >= 0; i--) {
      const c = chain[i];
      side[c] *= side[ref[c]];
      ref[c] = NONE;
    }
    return side[e];
  };
  for (let e = 0; e < m; e++) nesting[e] *= sign(e);
  ordered = Array.from({ length: n }, (_, v) => byNesting(v));

  const emb = new Embedding(n);
  for (let v = 0; v < n; v++) {
    let prev = NONE;
    for (const e of ordered[v]) {
      emb.addCw(v, dst[e], prev);
      prev = dst[e];
    }
  }
  const leftRef = new Array<number>(n).fill(NONE);
  const rightRef = new Array<number>(n).fill(NONE);
  const place = (v: number): void => {
    for (const ei of ordered[v]) {
      const w = dst[ei];
      if (ei === parentEdge[w]) {
        emb.addFirst(w, v);
        leftRef[v] = w;
        rightRef[v] = w;
        place(w);
      } else if (side[ei] === 1) {
        emb.addCw(w, v, rightRef[w]);
      } else {
        emb.addCcw(w, v, leftRef[w]);
        leftRef[w] = v;
      }
    }
  };
  for (const r of roots) place(r);
  return emb;
}

// --- 2. triangulation ------------------------------------------------------

/** Walk the face starting at half-edge `start→next`, adding an edge wherever
 * the walk revisits a vertex so every face boundary is a simple cycle.
 * Returns the face, or `[]` if its half-edge was already walked. */
function biconnectFace(
  emb: Embedding,
  start: number,
  next: number,
  seen: Set<number>,
): number[] {
  const n = emb.n;
  if (seen.has(start * n + next)) return [];
  seen.add(start * n + next);
  let v1 = start;
  let v2 = next;
  const face = [start];
  const inFace = new Set(face);
  let v3 = emb.nextFaceNode(v1, v2);
  const step = walkBound(n);
  while (v2 !== start || v3 !== next) {
    step();
    if (inFace.has(v2)) {
      emb.addCw(v1, v3, v2);
      emb.addCcw(v3, v1, v2);
      seen.add(v2 * n + v3);
      seen.add(v3 * n + v1);
      v2 = v1;
    } else {
      inFace.add(v2);
      face.push(v2);
    }
    v1 = v2;
    const w = v3;
    v3 = emb.nextFaceNode(v2, v3);
    v2 = w;
    seen.add(v1 * n + v2);
  }
  return face;
}

function triangulateFace(emb: Embedding, a: number, b: number): void {
  let v1 = a;
  let v2 = b;
  let v3 = emb.nextFaceNode(v1, v2);
  let v4 = emb.nextFaceNode(v2, v3);
  if (v1 === v2 || v1 === v3) return;
  const step = walkBound(emb.n);
  while (v1 !== v4) {
    step();
    if (emb.has(v1, v3)) {
      v1 = v2;
      v2 = v3;
      v3 = v4;
    } else {
      emb.addCw(v1, v3, v2);
      emb.addCcw(v3, v1, v2);
      v2 = v3;
      v3 = v4;
    }
    v4 = emb.nextFaceNode(v2, v3);
  }
}

/** Join the components, make every face a simple cycle, and triangulate all
 * faces but the largest, which is returned as the outer face. */
function triangulate(emb: Embedding): number[] {
  const n = emb.n;
  // One vertex per component, joined in a chain.
  const comp = new Array<number>(n).fill(NONE);
  const reps: number[] = [];
  for (let s = 0; s < n; s++) {
    if (comp[s] !== NONE) continue;
    reps.push(s);
    const stack = [s];
    comp[s] = s;
    while (stack.length > 0) {
      const v = stack.pop() as number;
      for (const w of emb.neighborsCw(v)) {
        if (comp[w] === NONE) {
          comp[w] = s;
          stack.push(w);
        }
      }
    }
  }
  for (let i = 0; i + 1 < reps.length; i++) {
    emb.addFirst(reps[i], reps[i + 1]);
    emb.addFirst(reps[i + 1], reps[i]);
  }

  let outer: number[] = [];
  const faces: number[][] = [];
  const seen = new Set<number>();
  for (let v = 0; v < n; v++) {
    for (const w of emb.neighborsCw(v)) {
      const face = biconnectFace(emb, v, w, seen);
      if (face.length === 0) continue;
      faces.push(face);
      if (face.length > outer.length) outer = face;
    }
  }
  for (const face of faces) if (face !== outer) triangulateFace(emb, face[0], face[1]);
  return outer;
}

// --- 3. canonical ordering and the shift drawing ----------------------------

/** A canonical ordering: each vertex with the contour neighbors it covers. */
function canonicalOrdering(emb: Embedding, outer: number[]): [number, number[]][] {
  const n = emb.n;
  const v1 = outer[0];
  const v2 = outer[1];
  const chords = new Array<number>(n).fill(0);
  const marked = new Set<number>();
  const ready = new Set(outer);
  const ccwNbr = new Map<number, number>();
  const cwNbr = new Map<number, number>();
  let prev = v2;
  for (let i = 2; i < outer.length; i++) {
    ccwNbr.set(prev, outer[i]);
    prev = outer[i];
  }
  ccwNbr.set(prev, v1);
  prev = v1;
  for (let i = outer.length - 1; i > 0; i--) {
    cwNbr.set(prev, outer[i]);
    prev = outer[i];
  }
  const isOuterNbr = (x: number, y: number): boolean =>
    ccwNbr.get(x) === y || cwNbr.get(x) === y;
  const onOuter = (x: number): boolean => !marked.has(x) && (ccwNbr.has(x) || x === v1);

  for (const v of outer) {
    for (const w of emb.neighborsCw(v)) {
      if (onOuter(w) && !isOuterNbr(v, w)) {
        chords[v]++;
        ready.delete(v);
      }
    }
  }

  const order: [number, number[]][] = new Array(n);
  order[0] = [v1, []];
  order[1] = [v2, []];
  ready.delete(v1);
  ready.delete(v2);
  for (let k = n - 1; k > 1; k--) {
    // The smallest ready vertex, so the layout does not hang on Set order.
    let v = Infinity;
    for (const r of ready) v = Math.min(v, r);
    ready.delete(v);
    marked.add(v);

    let wp = NONE;
    let wq = NONE;
    for (const w of emb.neighborsCw(v)) {
      if (marked.has(w) || !onOuter(w)) continue;
      if (w === v1) wp = v1;
      else if (w === v2) wq = v2;
      else if (cwNbr.get(w) === v) wp = w;
      else wq = w;
    }
    if (wp === NONE || wq === NONE) throw new Error("planar: no canonical ordering");

    const wpq = [wp];
    let w = wp;
    const step = walkBound(n);
    while (w !== wq) {
      step();
      const next = emb.ccwOf(v, w);
      wpq.push(next);
      cwNbr.set(w, next);
      ccwNbr.set(next, w);
      w = next;
    }
    if (wpq.length === 2) {
      if (--chords[wp] === 0) ready.add(wp);
      if (--chords[wq] === 0) ready.add(wq);
    } else {
      const inner = new Set(wpq.slice(1, -1));
      for (const x of inner) {
        ready.add(x);
        for (const y of emb.neighborsCw(x)) {
          if (onOuter(y) && !isOuterNbr(x, y)) {
            chords[x]++;
            ready.delete(x);
            if (!inner.has(y)) {
              chords[y]++;
              ready.delete(y);
            }
          }
        }
      }
    }
    order[k] = [v, wpq];
  }
  return order;
}

/** Integer grid positions from the de Fraysseix–Pach–Pollack shift method. */
function shiftDrawing(
  order: [number, number[]][],
  n: number,
): { x: number; y: number }[] {
  const left = new Array<number>(n).fill(NONE);
  const right = new Array<number>(n).fill(NONE);
  const dx = new Array<number>(n).fill(0);
  const y = new Array<number>(n).fill(0);
  const [a] = order[0];
  const [b] = order[1];
  const [c] = order[2];
  dx[b] = 1;
  dx[c] = 1;
  y[c] = 1;
  right[a] = c;
  right[c] = b;
  for (let k = 3; k < n; k++) {
    const [vk, contour] = order[k];
    const wp = contour[0];
    const wp1 = contour[1];
    const wq = contour[contour.length - 1];
    const wq1 = contour[contour.length - 2];
    const multi = contour.length > 2;
    dx[wp1]++;
    dx[wq]++;
    let span = 0;
    for (let i = 1; i < contour.length; i++) span += dx[contour[i]];
    dx[vk] = Math.floor((-y[wp] + span + y[wq]) / 2);
    y[vk] = Math.floor((y[wp] + span + y[wq]) / 2);
    dx[wq] = span - dx[vk];
    if (multi) dx[wp1] -= dx[vk];
    right[wp] = vk;
    right[vk] = wq;
    if (multi) {
      left[vk] = wp1;
      right[wq1] = NONE;
    } else {
      left[vk] = NONE;
    }
  }
  const pos: { x: number; y: number }[] = new Array(n);
  pos[a] = { x: 0, y: y[a] };
  const stack = [a];
  while (stack.length > 0) {
    const p = stack.pop() as number;
    for (const child of [left[p], right[p]]) {
      if (child === NONE) continue;
      pos[child] = { x: pos[p].x + dx[child], y: y[child] };
      stack.push(child);
    }
  }
  return pos;
}

/**
 * Integer grid coordinates at which no two of `edges` cross, or `null` if the
 * graph is not planar. Every vertex gets a distinct point, and no vertex lies
 * on an edge it is not an end of.
 */
export function planarLayout(
  n: number,
  edges: readonly Edge[],
): { x: number; y: number }[] | null {
  const emb = lrEmbedding(n, edges);
  if (emb === null) return null;
  if (n < 4)
    return [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ].slice(0, n);
  const outer = triangulate(emb);
  return shiftDrawing(canonicalOrdering(emb, outer), n);
}
