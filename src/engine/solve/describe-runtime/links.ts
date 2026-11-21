/** The groups of points the marks link, kept over the marks with a sum of
 * a term over each group (`describe-runtime.ts`). */

import { keptCheck, keptReadChecked } from "./checks.ts";
import type { Marks } from "./marks.ts";
import { mergeSorted } from "./sets.ts";
import type { GridSpace } from "./space.ts";

/**
 * A sum over a group of points of what `term` gives each, kept at the
 * group's root: added together as two groups join, and moved by the change
 * in a point's term as a placement touches it. A term reads the marks only
 * at the squares round its point, so a placement changes only its own
 * square's points' terms.
 */
export type LinkTerm<C> = (b: Marks, sp: GridSpace, cl: C, q: number) => number;

interface LinkSum {
  term: unknown;
  cl: unknown;
  at: (q: number) => number;
  /** Each point's term, and each root's sum. */
  value: Float64Array;
  sum: Float64Array;
}

/** The marks {@link linkedOf} last read, at which epoch and how far into its
 * log, and the groups of points their diagonals join, as a union-find: each
 * point's parent and group size, the diagonal each square was joined at (0
 * for none), every group's points by its root, once listed, and the sums kept
 * over the groups. */
let linkMarks: Marks | null = null;
let linkSpace: GridSpace | null = null;
let linkEpoch = -1;
let linkRead = 0;
let linkParent = new Int32Array(0);
let linkSize = new Int32Array(0);
let linkJoined = new Int8Array(0);
let linkListed = false;
const linkMembers = new Map<number, number[]>();
const linkSums: LinkSum[] = [];

function linkRoot(i: number): number {
  while (linkParent[i] !== i) {
    linkParent[i] = linkParent[linkParent[i]];
    i = linkParent[i];
  }
  return i;
}

/** Join square `c`'s points as diagonal `v` does, merging the groups' lists
 * and sums into the larger group's. False where the square was joined at the
 * other diagonal, which the marks have taken back. */
function linkJoin(sp: GridSpace, c: number, v: number): boolean {
  const was = linkJoined[c];
  if (v === was) return true;
  if (was !== 0) return false;
  linkJoined[c] = v;
  const ps = sp.cellPoints[c];
  let p = linkRoot(v === 1 ? ps[0] : ps[1]);
  let q = linkRoot(v === 1 ? ps[3] : ps[2]);
  if (p === q) return true;
  if (linkSize[p] > linkSize[q]) [p, q] = [q, p];
  linkParent[p] = q;
  linkSize[q] += linkSize[p];
  // A list handed out stays as it was, since a technique may place while it
  // reads one, so the joined group's is a new list, in point order as a
  // listing from scratch gives it.
  if (linkListed) {
    linkMembers.set(q, mergeSorted(linkMembers.get(q) ?? [], linkMembers.get(p) ?? []));
    linkMembers.delete(p);
  }
  for (const s of linkSums) s.sum[q] += s.sum[p];
  return true;
}

/** Move each kept sum by the change in the terms of square `c`'s points. */
function linkTouch(sp: GridSpace, c: number): void {
  for (const s of linkSums)
    for (const q of sp.cellPoints[c]) {
      const now = s.at(q);
      s.sum[linkRoot(q)] += now - s.value[q];
      s.value[q] = now;
    }
}

/**
 * The groups of points the diagonals `b` holds join, brought up to date from
 * the cells `b` has placed since they were last read, as the hand-written
 * solver kept them: a placement joins at most two groups. Marks set
 * wholesale since, or whose square has lost or changed its diagonal, are
 * joined afresh from their grid.
 */
function linkGroups(sp: GridSpace, b: Marks): void {
  linkCatchUp(sp, b);
  if (keptCheck) checkLinked(sp, b);
}

function linkCatchUp(sp: GridSpace, b: Marks): void {
  if (b === linkMarks && sp === linkSpace && b.epoch === linkEpoch) {
    const { log } = b;
    if (linkRead === log.length) return;
    for (; linkRead < log.length; linkRead++) {
      const c = log[linkRead];
      const raw = b.grid[c];
      if (!linkJoin(sp, c, raw === 1 || raw === 2 ? raw : 0)) break;
      linkTouch(sp, c);
    }
    if (linkRead === log.length) return;
  }
  linkMarks = b;
  linkSpace = sp;
  linkEpoch = b.epoch;
  linkRead = b.log.length;
  const n = sp.points.length;
  if (linkParent.length < n) {
    linkParent = new Int32Array(n);
    linkSize = new Int32Array(n);
  }
  for (let i = 0; i < n; i++) {
    linkParent[i] = i;
    linkSize[i] = 1;
  }
  if (linkJoined.length < sp.cells.length) linkJoined = new Int8Array(sp.cells.length);
  linkJoined.fill(0);
  linkMembers.clear();
  linkListed = false;
  linkSums.length = 0;
  for (const c of sp.cells) {
    const raw = b.grid[c];
    linkJoin(sp, c, raw === 1 || raw === 2 ? raw : 0);
  }
}

/** {@link linked} on the marks' own values, outside any supposition: the
 * groups are kept up to date a placement, not walked each read. */
export function linkedOf(sp: GridSpace, b: Marks, k: number): readonly number[] {
  if (k < 0) return [];
  linkGroups(sp, b);
  if (!linkListed) {
    for (const p of sp.points) {
      const r = linkRoot(p);
      const group = linkMembers.get(r);
      if (group === undefined) linkMembers.set(r, [p]);
      else group.push(p);
    }
    linkListed = true;
  }
  return linkMembers.get(linkRoot(k)) ?? [];
}

/** The sum of `term` over {@link linkedOf}`(k)`, kept as the groups are
 * (0 where `k` is no point). */
export function linkedSum<C>(
  sp: GridSpace,
  b: Marks,
  cl: C,
  term: LinkTerm<C>,
  k: number,
): number {
  if (k < 0) return 0;
  linkGroups(sp, b);
  let s = linkSums.find((x) => x.term === term && x.cl === cl);
  if (s === undefined) {
    const n = sp.points.length;
    const at = (q: number): number => term(b, sp, cl, q);
    s = { term, cl, at, value: new Float64Array(n), sum: new Float64Array(n) };
    for (const q of sp.points) {
      s.value[q] = at(q);
      s.sum[linkRoot(q)] += s.value[q];
    }
    linkSums.push(s);
  }
  return s.sum[linkRoot(k)];
}

/** Whether `q` is in {@link linkedOf}`(k)`. */
export function linkedWith(sp: GridSpace, b: Marks, q: number, k: number): boolean {
  if (k < 0 || q < 0) return false;
  linkGroups(sp, b);
  return linkRoot(q) === linkRoot(k);
}

/**
 * The groups of points the diagonals `value` reads join, for reading one
 * grid many times (an answer check): `of(k)` is {@link linked}`(k)`, each
 * group listed once it is read.
 */
export function pointGroups(
  sp: GridSpace,
  value: (c: number) => number,
): { of(k: number): readonly number[] } {
  const parent = Int32Array.from(sp.points, (_, i) => i);
  const root = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  for (const c of sp.cells) {
    const v = value(c);
    if (v !== 1 && v !== 2) continue;
    const ps = sp.cellPoints[c];
    parent[root(v === 1 ? ps[0] : ps[1])] = root(v === 1 ? ps[3] : ps[2]);
  }
  let members: Map<number, number[]> | null = null;
  return {
    of(k) {
      if (k < 0) return [];
      if (members === null) {
        members = new Map();
        for (const p of sp.points) {
          const r = root(p);
          const group = members.get(r);
          if (group === undefined) members.set(r, [p]);
          else group.push(p);
        }
      }
      return members.get(root(k)) ?? [];
    },
  };
}

/** The points a walk has reached, by the walk that reached them. */
let met = new Int32Array(0);
let metWalk = 0;

/**
 * `linked(k)`: `k` and the points joined to it by the diagonals the cells
 * hold, in reading order. `value` reads a cell's value, `-1` where it has
 * none.
 */
export function linked(
  sp: GridSpace,
  value: (c: number) => number,
  k: number,
): readonly number[] {
  if (k < 0) return [];
  if (met.length < sp.points.length) met = new Int32Array(sp.points.length);
  if (++metWalk === 0x7fffffff) {
    met.fill(0);
    metWalk = 1;
  }
  const out = [k];
  met[k] = metWalk;
  for (let i = 0; i < out.length; i++) {
    const p = out[i];
    for (const c of sp.pointCells[p]) {
      const v = value(c);
      const at = sp.cellPoints[c].indexOf(p);
      if (v !== (at === 0 || at === 3 ? 1 : 2)) continue;
      const q = sp.cellPoints[c][3 - at];
      if (met[q] === metWalk) continue;
      met[q] = metWalk;
      out.push(q);
    }
  }
  return out.length > 1 ? out.sort((a, b) => a - b) : out;
}

/** The linked groups and their sums, against the marks' groups made afresh. */
function checkLinked(sp: GridSpace, b: Marks): void {
  const fresh = pointGroups(sp, (c) => b.value(c));
  for (const p of sp.points) {
    const want = fresh.of(p);
    for (const q of want)
      if (linkRoot(q) !== linkRoot(p))
        throw new Error(`kept linked groups: point ${q} is not with ${p}`);
    if (linkSize[linkRoot(p)] !== want.length)
      throw new Error(`kept linked groups: point ${p}'s group is not [${want}]`);
    if (want[0] !== p) continue;
    for (const s of linkSums) {
      const sum = want.reduce((t, q) => t + s.at(q), 0);
      if (s.sum[linkRoot(p)] !== sum)
        throw new Error(
          `kept linked sum: point ${p}'s group sums ${s.sum[linkRoot(p)]}, not ${sum}`,
        );
    }
  }
  keptReadChecked();
}
