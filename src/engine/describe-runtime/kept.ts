/** What is kept over the marks between a technique's calls: the groups
 * edges join, and a definition's values (`describe-runtime.ts`). */

import { keptCheck, keptReadChecked } from "./checks.ts";
import type { Marks } from "./marks.ts";
import { mergeSorted } from "./sets.ts";
import type { GridSpace } from "./space.ts";

/** The cells joined across a set of edges: `of(c)` is `c`'s group in
 * reading order, one list that each of its cells reads, so a cell is in a
 * group exactly where `of` gives it that list. */
export interface EdgeGroups {
  of(c: number): readonly number[];
  /** Where the groups are kept on the marks, what has changed in them. */
  readonly changes?: GroupChanges;
}

/**
 * The changes to kept groups since they were last made afresh (`made`
 * counts the times): for each join, the smaller group's squares, and for
 * each split, the squares of the group split. Whether two squares share a
 * group changes only for squares of one of these, so a binding that reads
 * none of them reads the same.
 */
export interface GroupChanges {
  readonly made: number;
  readonly changed: readonly (readonly number[])[];
}

/** A set of edges {@link edgeGroups} joined: the space, a hash and a copy of
 * the set, and the groups. */
interface JoinedSet {
  sp: GridSpace;
  hash: number;
  edges: number[];
  groups: EdgeGroups;
}

/** How many sets {@link edgeGroups} keeps: a ladder binds one a value of
 * the domain in each of several rungs (Filling's nine numbers). */
const KEPT_SETS = 32;
const joinedSets: JoinedSet[] = [];
let nextKept = 0;

/**
 * The cells joined across the edges `E`, for reading {@link through} from
 * many cells over one set: `of(c)` is `through(c, E)`, each group listed
 * once it is read. The groups of the sets last asked for are kept while one
 * is asked for again: each rung of a ladder binds its sets afresh after
 * every firing, and most firings leave them as they were (Separate's walls,
 * Filling's room for each number).
 */
export function edgeGroups(sp: GridSpace, E: readonly number[]): EdgeGroups {
  let hash = E.length;
  for (const e of E) hash = Math.imul(hash ^ e, 0x9e3779b1);
  for (const kept of joinedSets)
    if (
      kept.hash === hash &&
      kept.sp === sp &&
      kept.edges.length === E.length &&
      E.every((e, i) => e === kept.edges[i])
    )
      return kept.groups;
  const joined = { sp, hash, edges: E.slice(), groups: joinedAcross(sp, E) };
  joinedSets[nextKept] = joined;
  nextKept = (nextKept + 1) % KEPT_SETS;
  return joined.groups;
}

function joinedAcross(sp: GridSpace, E: readonly number[]): EdgeGroups {
  const n = sp.cells.length;
  const root = (p: Int32Array, i: number): number => {
    while (p[i] !== i) {
      p[i] = p[p[i]];
      i = p[i];
    }
    return i;
  };
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  for (const e of E)
    parent[root(parent, sp.edgeEnds[2 * e])] = root(parent, sp.edgeEnds[2 * e + 1]);
  // Each cell's group, by cell: the cells are met in reading order, so each
  // group's list is too. A root's list is made when its first cell is met.
  const byRoot = new Array<number[]>(n);
  const groupOf = new Array<number[]>(n);
  for (let x = 0; x < n; x++) {
    const r = root(parent, x);
    let group = byRoot[r];
    if (group === undefined) {
      group = [];
      byRoot[r] = group;
    }
    group.push(x);
    groupOf[x] = group;
  }
  const none: readonly number[] = [];
  return { of: (c) => (c < 0 ? none : groupOf[c]) };
}

/** Whether edge `e` is in a set {@link keptEdgeGroups} keeps, by the marks
 * at the edge or at its two squares; `a` is the one number the set's
 * statement reads from outside it (0 where it reads none). */
export type EdgeHolds<C> = (
  b: Marks,
  sp: GridSpace,
  cl: C,
  e: number,
  a: number,
) => boolean;

const NO_CELLS: readonly number[] = [];

/** The groups one set of edges joins, kept over one marks. */
class EdgeGroupsKept implements GroupChanges {
  epoch = -1;
  read = 0;
  made = 0;
  changed: (readonly number[])[] = [];
  sp: GridSpace | null = null;
  cl: unknown = null;
  parent = new Int32Array(0);
  /** Whether each edge is in the set. */
  in = new Uint8Array(0);
  /** Each cell's group, in reading order: every cell of a group holds the
   * one list, and a list once made is never changed. */
  groupOf: (readonly number[])[] = [];
  /** Whether `groupOf` has been handed out since it was last copied: a
   * handle reads the groups as they were when it was taken, so a join
   * after it writes a copy. */
  handed = false;
  constructor(
    private readonly holds: EdgeHolds<unknown>,
    private readonly a: number,
  ) {}

  root(i: number): number {
    const p = this.parent;
    while (p[i] !== i) {
      p[i] = p[p[i]];
      i = p[i];
    }
    return i;
  }

  rebuild(b: Marks, sp: GridSpace, cl: unknown): void {
    this.epoch = b.epoch;
    this.read = b.log.length;
    this.made++;
    this.changed = [];
    this.sp = sp;
    this.cl = cl;
    const n = sp.cells.length;
    const edges = sp.edgeEnds.length / 2;
    if (this.parent.length !== n) this.parent = new Int32Array(n);
    if (this.in.length !== edges) this.in = new Uint8Array(edges);
    for (let i = 0; i < n; i++) this.parent[i] = i;
    for (let e = 0; e < edges; e++) {
      const now = this.holds(b, sp, cl, e, this.a);
      this.in[e] = now ? 1 : 0;
      if (now)
        this.parent[this.root(sp.edgeEnds[2 * e])] = this.root(sp.edgeEnds[2 * e + 1]);
    }
    const byRoot = new Array<number[]>(n);
    const groupOf = new Array<number[]>(n);
    for (let x = 0; x < n; x++) {
      const r = this.root(x);
      let group = byRoot[r];
      if (group === undefined) {
        group = [];
        byRoot[r] = group;
      }
      group.push(x);
      groupOf[x] = group;
    }
    this.groupOf = groupOf;
    this.handed = false;
  }

  /** A copy for a fork of the marks these are caught up with, which reads
   * the fork's log from its start. The two share their lists until either
   * changes them. */
  fork(): EdgeGroupsKept {
    const k = new EdgeGroupsKept(this.holds, this.a);
    k.epoch = this.epoch;
    k.sp = this.sp;
    k.cl = this.cl;
    k.parent = this.parent.slice();
    k.in = this.in.slice();
    k.groupOf = this.groupOf;
    k.handed = true;
    this.handed = true;
    return k;
  }

  /** The lists about to change, copied first where a handle reads them. */
  writable(): (readonly number[])[] {
    if (this.handed) {
      this.groupOf = this.groupOf.slice();
      this.handed = false;
    }
    return this.groupOf;
  }

  /** Join edge `e`'s squares' groups into one new list. */
  join(e: number): void {
    const sp = this.sp as GridSpace;
    const p = this.root(sp.edgeEnds[2 * e]);
    const q = this.root(sp.edgeEnds[2 * e + 1]);
    if (p === q) return;
    this.parent[p] = q;
    const g = this.writable();
    const a = g[sp.edgeEnds[2 * e]];
    const b = g[sp.edgeEnds[2 * e + 1]];
    this.changed.push(a.length <= b.length ? a : b);
    const merged = mergeSorted(a, b);
    for (const x of merged) g[x] = merged;
  }

  /** Join `group`'s squares afresh across the edges still in the set, where
   * one has left it: only its own squares can come apart, and their parents
   * all lie among them. */
  split(group: readonly number[]): void {
    const sp = this.sp as GridSpace;
    this.changed.push(group);
    if (this.mine.length !== this.parent.length)
      this.mine = new Int32Array(this.parent.length);
    const mark = ++this.marked;
    for (const x of group) {
      this.parent[x] = x;
      this.mine[x] = mark;
    }
    for (const x of group) {
      const across = sp.edgeAdj[x];
      const by = sp.cellEdges[x];
      for (let k = 0; k < across.length; k++)
        if (across[k] > x && this.mine[across[k]] === mark && this.in[by[k]] === 1)
          this.parent[this.root(x)] = this.root(across[k]);
    }
    const g = this.writable();
    const lists = new Map<number, number[]>();
    for (const x of group) {
      const r = this.root(x);
      let list = lists.get(r);
      if (list === undefined) {
        list = [];
        lists.set(r, list);
      }
      list.push(x);
      g[x] = list;
    }
  }

  /** The squares of the group a split is under way in, by a count of splits. */
  mine = new Int32Array(0);
  marked = 0;

  /** Catch up from the marks' log: a placement can change only the edges
   * whose condition reads its index, the edge itself where `byEdge`, else
   * the square's own edges. The edges that leave the set split their groups
   * before those that join it join theirs. */
  update(b: Marks, sp: GridSpace, cl: unknown, byEdge: boolean): EdgeGroups {
    if (b.epoch !== this.epoch || sp !== this.sp || cl !== this.cl)
      this.rebuild(b, sp, cl);
    const { log } = b;
    const changed = byEdge ? [0] : [0, 0, 0, 0, 0, 0, 0, 0];
    for (; this.read < log.length; this.read++) {
      const x = log[this.read];
      let n = 0;
      if (byEdge) changed[n++] = x;
      else for (const e of sp.cellEdges[x]) changed[n++] = e;
      let left = false;
      for (let i = 0; i < n; i++) {
        const e = changed[i];
        const now = this.holds(b, sp, cl, e, this.a);
        if (now === (this.in[e] === 1)) changed[i] = -1;
        else {
          this.in[e] = now ? 1 : 0;
          if (!now) left = true;
        }
      }
      if (left)
        for (let i = 0; i < n; i++) {
          const e = changed[i];
          if (e < 0 || this.in[e] === 1) continue;
          const group = this.groupOf[sp.edgeEnds[2 * e]];
          // A group two edges left is split once: the first split gives its
          // squares new lists.
          if (this.groupOf[group[0]] === group) this.split(group);
        }
      for (let i = 0; i < n; i++) {
        const e = changed[i];
        if (e >= 0 && this.in[e] === 1) this.join(e);
      }
    }
    if (keptCheck) checkKeptGroups(b, sp, cl, this.holds, this.a, this.groupOf);
    this.handed = true;
    const groupOf = this.groupOf;
    return { of: (c) => (c < 0 ? NO_CELLS : groupOf[c]), changes: this };
  }
}

function checkKeptGroups(
  b: Marks,
  sp: GridSpace,
  cl: unknown,
  holds: EdgeHolds<unknown>,
  a: number,
  groupOf: readonly (readonly number[])[],
): void {
  const fresh = joinedAcross(
    sp,
    sp.edges.filter((e) => holds(b, sp, cl, e, a)),
  );
  for (const c of sp.cells) {
    const want = fresh.of(c);
    const got = groupOf[c];
    if (want.length !== got.length || want.some((x, i) => x !== got[i]))
      throw new Error(`kept edge groups: square ${c} is in [${got}], not [${want}]`);
  }
  keptReadChecked();
}

/**
 * The cells joined across the edges `holds` is true of, as {@link edgeGroups}
 * joins a set it is given, kept on the marks: caught up from their log, a
 * placement rechecking only the edges it could change, so a set that grows
 * as values are placed (the edges with no wall, the pairs of equal numbers)
 * is joined an edge at a time. An edge that leaves the set starts it again
 * from the marks, as does a new epoch. `byEdge` says the answer is on the
 * edges, so a placement is at an edge; otherwise it is at a square.
 */
export function keptEdgeGroups<C>(
  sp: GridSpace,
  b: Marks,
  cl: C,
  holds: EdgeHolds<C>,
  a: number,
  byEdge: boolean,
): EdgeGroups {
  let byA = b.kept.get(holds) as Map<number, EdgeGroupsKept> | undefined;
  if (byA === undefined) {
    byA = new Map();
    b.kept.set(holds, byA);
  }
  let kept = byA.get(a);
  if (kept === undefined) {
    kept = new EdgeGroupsKept(holds as EdgeHolds<unknown>, a);
    byA.set(a, kept);
  }
  return kept.update(b, sp, cl, byEdge);
}

/**
 * Copy into `into` the groups kept over the marks `from` that have caught up
 * with them, for a fork of the marks whose log starts empty: each copy, by
 * the groups it copies. Whatever else is kept is made afresh on the fork.
 */
export function forkKept(
  from: Marks,
  into: Map<unknown, unknown>,
): Map<GroupChanges, GroupChanges> {
  const copies = new Map<GroupChanges, GroupChanges>();
  for (const [key, byA] of from.kept) {
    if (!(byA instanceof Map)) continue;
    const forked = new Map<number, EdgeGroupsKept>();
    for (const [a, kept] of byA)
      if (
        kept instanceof EdgeGroupsKept &&
        kept.epoch === from.epoch &&
        kept.read === from.log.length
      ) {
        const copy = kept.fork();
        forked.set(a, copy);
        copies.set(kept, copy);
      }
    if (forked.size > 0) into.set(key, forked);
  }
  return copies;
}

// --- definitions kept --------------------------------------------------------

/** A definition's values, by its argument: a sparse array, an argument not
 * yet read a hole. */
export type Kept<T> = T[];

/** Where one definition keeps its values: for each marks object or board it
 * is read on. */
export interface KeptStore<T> {
  /** The values kept for the marks `b`, emptied once a value has been
   * placed since, which is the one change to what a kept definition reads. A
   * marks object reads one board, so the board needs no key of its own. */
  marks(b: Marks): Kept<T>;
  /** The cells whose value on the marks `b` is `t`, in reading order: an
   * index of every cell's value, `of` reading each, made once a placement. */
  valued(
    b: Marks,
    of: (x: number) => T,
    cells: readonly number[],
    t: T,
  ): readonly number[];
  /** The values kept for the board `on` (its dealt clues, or its space where
   * it reads none), for as long as the board is: the definition reads
   * nothing a placement changes. */
  board(on: object): Kept<T>;
}

/** A store of one definition's values, which the compiled module makes once
 * for it. */
export function keptStore<T>(): KeptStore<T> {
  interface Held {
    placed: number;
    kept: Kept<T>;
    index: Map<T, number[]> | null;
  }
  const byMarks = new WeakMap<Marks, Held>();
  const byBoard = new WeakMap<object, Kept<T>>();
  const none: readonly number[] = [];
  // A run reads one marks object, or one board, many times over, so the last
  // one read is looked at first.
  let lastMarks: Marks | null = null;
  let last: Held = { placed: -1, kept: [], index: null };
  let lastBoard: object | null = null;
  let lastOfBoard: Kept<T> = [];
  const held = (b: Marks): Held => {
    if (b === lastMarks && b.placed === last.placed) return last;
    let at = byMarks.get(b);
    if (at === undefined || at.placed !== b.placed) {
      at = { placed: b.placed, kept: [], index: null };
      byMarks.set(b, at);
    }
    lastMarks = b;
    last = at;
    return at;
  };
  return {
    marks: (b) => held(b).kept,
    valued(b, of, cells, t) {
      const at = held(b);
      if (at.index === null) {
        const index = new Map<T, number[]>();
        for (const x of cells) {
          const v = of(x);
          const list = index.get(v);
          if (list === undefined) index.set(v, [x]);
          else list.push(x);
        }
        at.index = index;
      }
      return at.index.get(t) ?? none;
    },
    board(on) {
      if (on === lastBoard) return lastOfBoard;
      let kept = byBoard.get(on);
      if (kept === undefined) {
        kept = [];
        byBoard.set(on, kept);
      }
      lastBoard = on;
      lastOfBoard = kept;
      return kept;
    },
  };
}

const placedValues = keptStore<number>();

/** `{x in cells where value(x) = t}` on the marks `b`: the cells holding `t`,
 * `-1` for those holding none, in order, read off an index of every cell's
 * value made once a placement rather than a scan for each `t`. */
export function cellsValued(
  b: Marks,
  cells: readonly number[],
  t: number,
): readonly number[] {
  return placedValues.valued(b, (x) => b.grid[x] || -1, cells, t);
}
