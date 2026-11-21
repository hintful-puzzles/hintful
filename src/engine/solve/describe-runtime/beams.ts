/** Beams and sightlines bent by what a cell holds: Black Box's beam, and a
 * sightline through mirrors (`describe-runtime.ts`). */

import type { ClueList } from "./clues.ts";
import type { Marks } from "./marks.ts";
import type { GridSpace } from "./space.ts";

/** A cell's content as a beam reads it: `true` where it holds what deflects
 * one, `false` where it is empty, `null` where nothing says. */
export type Deflects = (c: number) => boolean | null;

/** The steps a beam takes, clockwise from up, as `(dx, dy)`. */
const STEPS = [0, -1, 1, 0, 0, 1, -1, 0];

/**
 * Where a beam fired in from slot `s` goes, Black Box's physics, as one
 * number: the slot it comes out at, `s` itself where it is reflected, and
 * `sp.slots.length` where a deflecting cell absorbs it, or, where it first
 * looks at a cell `holds` says nothing of and that cell decides what it does,
 * `~c` for that cell. A beam meeting a deflecting cell head-on is absorbed;
 * one diagonally ahead turns it away; one beside the square it enters by
 * reflects it before it enters, and a head-on one there absorbs it first.
 * One tracer for an answer and for partial marks, so they cannot disagree.
 */
export function traceBeam(sp: GridSpace, s: number, holds: Deflects): number {
  const { w, h } = sp;
  let x: number;
  let y: number;
  let dir: number;
  if (s < w) [x, y, dir] = [s, -1, 2];
  else if (s < 2 * w) [x, y, dir] = [s - w, h, 0];
  else if (s < 2 * w + h) [x, y, dir] = [-1, s - 2 * w, 1];
  else [x, y, dir] = [w, s - 2 * w - h, 3];
  /** What lies ahead of `(x, y)`, turned `side` steps from the beam's way
   * first (-1 left, 1 right): off the grid, never a deflecting cell. */
  const look = (side: number): { at: number; v: boolean | null } => {
    const d = 2 * dir;
    let ax = x + STEPS[d];
    let ay = y + STEPS[d + 1];
    if (side !== 0) {
      const e = 2 * ((dir + side + 4) % 4);
      ax += STEPS[e];
      ay += STEPS[e + 1];
    }
    if (ax < 0 || ay < 0 || ax >= w || ay >= h) return { at: -1, v: false };
    const at = ay * w + ax;
    return { at, v: holds(at) };
  };
  const front = look(0);
  if (front.v === null) return ~front.at;
  if (front.v) return sp.slots.length;
  const left = look(-1);
  const right = look(1);
  if (left.v || right.v) return s;
  if (left.v === null) return ~left.at;
  if (right.v === null) return ~right.at;
  x += STEPS[2 * dir];
  y += STEPS[2 * dir + 1];
  for (;;) {
    if (y < 0) return x;
    if (y >= h) return w + x;
    if (x < 0) return 2 * w + y;
    if (x >= w) return 2 * w + h + y;
    const ahead = look(0);
    if (ahead.v === null) return ~ahead.at;
    if (ahead.v) return sp.slots.length;
    const l = look(-1);
    if (l.v === null) return ~l.at;
    if (l.v) {
      dir = (dir + 1) % 4;
      continue;
    }
    const r = look(1);
    if (r.v === null) return ~r.at;
    if (r.v) {
      dir = (dir + 3) % 4;
      continue;
    }
    x += STEPS[2 * dir];
    y += STEPS[2 * dir + 1];
  }
}

/** What a cell holds as a sightline reads it: 1 a mirror `\`, 2 a mirror
 * `/`, 0 none. */
export type MirrorAt = (c: number) => number;

/** A sightline: every cell it passes, mirrors included, in the order it
 * passes them, and the slot it comes out at. */
export interface Sightline {
  readonly visits: readonly number[];
  readonly exit: number;
}

/**
 * The sightline in from slot `s` (Undead's): straight on through each cell,
 * turned a quarter turn by each mirror, and out at the slot it reaches. It
 * never comes back out at `s`, since a mirror never turns it right round.
 * One tracer for the game, the compiled code and the checker.
 */
export function traceSight(sp: GridSpace, s: number, mirrorAt: MirrorAt): Sightline {
  let at = sightEntry(sp, s);
  const visits: number[] = [];
  for (;;) {
    const next = sightAhead(sp, at);
    if (next.exit >= 0) return { visits, exit: next.exit };
    visits.push(next.c);
    at = { c: next.c, dir: sightTurn(at.dir, mirrorAt(next.c)) };
  }
}

/** Where a sightline stands: a cell, or `-1` beyond the slot it comes in
 * from, and the way it heads, clockwise from up. */
export interface SightAt {
  readonly c: number;
  readonly dir: number;
  /** The cell off the grid it stands on, before it enters. */
  readonly x?: number;
  readonly y?: number;
}

/** A sightline about to come in from slot `s`. */
export function sightEntry(sp: GridSpace, s: number): SightAt {
  const { w, h } = sp;
  if (s < w) return { c: -1, x: s, y: -1, dir: 2 };
  if (s < 2 * w) return { c: -1, x: s - w, y: h, dir: 0 };
  if (s < 2 * w + h) return { c: -1, x: -1, y: s - 2 * w, dir: 1 };
  return { c: -1, x: w, y: s - 2 * w - h, dir: 3 };
}

/** What lies a step ahead of a sightline: the cell it passes next, or the
 * slot it comes out at (`exit`, `-1` while it stays on the grid). */
export function sightAhead(sp: GridSpace, at: SightAt): { c: number; exit: number } {
  const { w, h } = sp;
  const x = (at.c < 0 ? (at.x as number) : at.c % w) + STEPS[2 * at.dir];
  const y = (at.c < 0 ? (at.y as number) : (at.c / w) | 0) + STEPS[2 * at.dir + 1];
  if (y < 0) return { c: -1, exit: x };
  if (y >= h) return { c: -1, exit: w + x };
  if (x < 0) return { c: -1, exit: 2 * w + y };
  if (x >= w) return { c: -1, exit: 2 * w + h + y };
  return { c: y * w + x, exit: -1 };
}

/** The way a sightline heads on from a cell holding `m` (0 none, 1 `\`, 2
 * `/`), having come in heading `dir`: `\` swaps down with right and up with
 * left, `/` down with left and up with right. */
export function sightTurn(dir: number, m: number): number {
  if (m === 1) return 3 - dir;
  if (m === 2) return dir ^ 1;
  return dir;
}

/** What `sight(s, M)` and its kin read of one sightline, each in the order
 * it first passes them: the cells other than mirrors it passes; those it
 * passes before its first mirror, each once, since it runs straight; those
 * it passes after one; those it passes twice after one, across and up or
 * down; and the slot it comes out at. A cell is passed at most twice, once
 * each way across. */
export interface SightSets {
  readonly all: readonly number[];
  readonly direct: readonly number[];
  readonly bent: readonly number[];
  readonly twice: readonly number[];
  readonly exit: number;
}

/** {@link SightSets} of the sightline from slot `s`. */
export function sightSets(sp: GridSpace, s: number, mirrorAt: MirrorAt): SightSets {
  const { visits, exit } = traceSight(sp, s, mirrorAt);
  const all: number[] = [];
  const direct: number[] = [];
  const bent: number[] = [];
  const twice: number[] = [];
  let mirrored = false;
  for (const c of visits) {
    if (mirrorAt(c) !== 0) {
      mirrored = true;
      continue;
    }
    if (!all.includes(c)) all.push(c);
    if (!mirrored) direct.push(c);
    else if (!bent.includes(c)) bent.push(c);
    else twice.push(c);
  }
  return { all, direct, bent, twice, exit };
}

/** Each board's sightlines, by the mirrors dealt: a clue list is never
 * changed once made. */
const sightCache = new WeakMap<
  ClueList,
  { sp: GridSpace; sets: readonly SightSets[] }
>();

/** Every slot's {@link SightSets}, the mirrors the clues `mirrors` deal
 * (1 `\`, 2 `/`), traced once a board. */
export function sights(sp: GridSpace, mirrors: ClueList): readonly SightSets[] {
  const kept = sightCache.get(mirrors);
  if (kept !== undefined && kept.sp === sp) return kept.sets;
  const mirrorAt = (c: number): number => Math.max(0, mirrors.valueAt[c]);
  const sets = sp.slots.map((s) => sightSets(sp, s, mirrorAt));
  sightCache.set(mirrors, { sp, sets });
  return sets;
}

/** The value a cell holds where it deflects a beam. */
const DEFLECTS = 1;

/** `beam(s)` on the marks: where the beam from slot `s` goes, `-1` where a
 * cell no value is placed in decides it; with `c` and `v`, as if `c` held
 * `v`. */
export function beam(sp: GridSpace, b: Marks, s: number, c = -1, v = 0): number {
  const r = traceBeam(sp, s, (d) =>
    d === c ? v === DEFLECTS : b.known(d) ? b.value(d) === DEFLECTS : null,
  );
  return r < 0 ? -1 : r;
}

/** `ahead(s)`: the first cell the beam from slot `s` looks at that decides
 * where it goes and holds no value, or `-1`. */
export function ahead(sp: GridSpace, b: Marks, s: number): number {
  const r = traceBeam(sp, s, (d) => (b.known(d) ? b.value(d) === DEFLECTS : null));
  return r < 0 ? ~r : -1;
}

/** `beam(s)` in an answer `g`. */
export function beamOf(sp: GridSpace, g: ArrayLike<number>, s: number): number {
  return traceBeam(sp, s, (d) => g[d] === DEFLECTS);
}
