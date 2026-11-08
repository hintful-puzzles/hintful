/**
 * Why a step of Net's ladder holds, in the terms a player records: the ways
 * a tile can turn, each ruled out by a known side, a loop, a group sealed
 * off, or a tile beside it left no way to turn. The ladder
 * (`net.description.yaml`) decides each step; this says why, for the hint's
 * words, reading the same facts a player can record: **side notes** (a wire
 * crosses this side, or none does), **locks**, and the **walls** the board
 * shows. A tile's own orientation is unknown until it is locked, however it
 * happens to be turned.
 *
 * A way of turning a tile is ruled out at a rung of the ladder by the first
 * of these that holds, each rung adding one:
 *
 * - **side** (`fit`): it contradicts a wall, a note, or a locked neighbor;
 * - **loop**: its new wires join two tiles the known wires already join;
 * - **sealed** (`seal`): its wires, and the tiles they could run on to,
 *   reach fewer tiles than there are. A wire runs on across a side some way
 *   of each tile there wires, between tiles that are not dead ends, and ends
 *   at a dead end;
 * - **neighbor** (`strand`): turned so, it leaves a tile beside it no way
 *   to turn that fits the known sides and closes no loop.
 *
 * Each mirrors the description's statement of that rung, and `hint.ts`
 * refuses a step whose ways this does not rule out as the ladder did.
 */

import { Dsf } from "../../engine/dsf.ts";
import { anticlockwise, DIRECTIONS, opposite } from "../../engine/square-edges.ts";
import { offset } from "../../engine/wires.ts";
import type { NetGeometry } from "./solver.ts";
import {
  LOCKED,
  type NetState,
  NOTE_NONE,
  NOTE_UNKNOWN,
  NOTE_WIRE,
  sideIndex,
} from "./state.ts";

/** What is known about the side between two tiles. */
type Known = typeof NOTE_UNKNOWN | typeof NOTE_WIRE | typeof NOTE_NONE;

/** Where a known side comes from: a wall, a note, or a locked tile beside it
 * (which one), in the order a sentence would rather cite them. */
export type SideSource =
  | { readonly kind: "wall" }
  | { readonly kind: "note" }
  | { readonly kind: "lock"; readonly at: number };

/** A side, named from tile `at` in direction `dir`. */
export interface Side {
  readonly at: number;
  readonly dir: number;
}

/** The recorded facts, read from a state and extended as a plan records more. */
export class Facts {
  readonly w: number;
  readonly h: number;
  /** Per tile, its wire mask (orientation irrelevant until locked). */
  readonly wires: Uint8Array;
  readonly locked: Uint8Array;
  /** How many tiles there are, each with a wire: the size of the network. */
  readonly area: number;
  /** Per tile and direction (`i * 16 + dir`), what is known of that side. */
  private readonly known: Uint8Array;
  private readonly source: SideSource[];

  constructor(
    readonly s: NetState,
    readonly g: NetGeometry,
  ) {
    const n = s.w * s.h;
    this.w = s.w;
    this.h = s.h;
    this.wires = Uint8Array.from(s.tiles, (t) => t & 0xf);
    this.locked = Uint8Array.from(s.tiles, (t) => (t & LOCKED ? 1 : 0));
    this.area = n;
    this.known = new Uint8Array(n * 16);
    this.source = new Array(n * 16);
    for (let i = 0; i < n; i++)
      for (const d of DIRECTIONS) {
        const x = i % s.w;
        const y = Math.floor(i / s.w);
        // A side that joins no tile, across the edge of a grid that does
        // not wrap there, is the wall the board draws round it.
        if (s.barriers[i] & d || g.sideEdge[i * 16 + d] < 0)
          this.put(i, d, NOTE_NONE, { kind: "wall" });
        const note = s.sides[sideIndex(s, x, y, d)] as Known;
        if (note !== NOTE_UNKNOWN && this.get(i, d) === NOTE_UNKNOWN)
          this.put(i, d, note, { kind: "note" });
      }
    for (let i = 0; i < n; i++) if (this.locked[i]) this.lock(i, s.tiles[i] & 0xf);
  }

  neighbor(i: number, d: number): number {
    const o = offset(i % this.w, Math.floor(i / this.w), d, this.w, this.h);
    return o.y * this.w + o.x;
  }
  get(i: number, d: number): Known {
    return this.known[i * 16 + d] as Known;
  }
  from(i: number, d: number): SideSource {
    return this.source[i * 16 + d];
  }
  private put(i: number, d: number, v: Known, src: SideSource): void {
    const j = this.neighbor(i, d);
    this.known[i * 16 + d] = v;
    this.source[i * 16 + d] = src;
    if (this.g.sideEdge[i * 16 + d] < 0) return;
    this.known[j * 16 + opposite(d)] = v;
    this.source[j * 16 + opposite(d)] = src;
  }
  /** Record a note on side `d` of tile `i`. */
  note(i: number, d: number, v: Known): void {
    this.put(i, d, v, { kind: "note" });
  }
  /** Record tile `i` locked showing `wires`. A side already known keeps its
   * source: a note stays the reason a later step cites. */
  lock(i: number, wires: number): void {
    this.locked[i] = 1;
    this.wires[i] = wires;
    for (const d of DIRECTIONS)
      if (this.get(i, d) === NOTE_UNKNOWN)
        this.put(i, d, wires & d ? NOTE_WIRE : NOTE_NONE, { kind: "lock", at: i });
  }
  /** What `look` reads with tile `i` locked showing `wires`. The lock is
   * taken back after. */
  assuming<T>(i: number, wires: number, look: () => T): T {
    const was = this.wires[i];
    const wasLocked = this.locked[i];
    const open = DIRECTIONS.filter((d) => this.get(i, d) === NOTE_UNKNOWN);
    this.lock(i, wires);
    const seen = look();
    for (const d of open) {
      this.known[i * 16 + d] = NOTE_UNKNOWN;
      this.known[this.neighbor(i, d) * 16 + opposite(d)] = NOTE_UNKNOWN;
    }
    this.locked[i] = wasLocked;
    this.wires[i] = was;
    return seen;
  }
}

/** The distinct ways a tile's wires can be turned. */
function turnings(wires: number): number[] {
  const out = [wires];
  for (let w = anticlockwise(wires); w !== wires; w = anticlockwise(w)) out.push(w);
  return out;
}

const arms = (wires: number): number => DIRECTIONS.filter((d) => wires & d).length;

/** A way of turning contradicts known sides; `sides` are all of them, from
 * the tile. */
interface Clash {
  readonly kind: "side";
  readonly sides: readonly Side[];
}

/** A way of turning joins, by its new wires in `dirs`, tiles the known wires
 * already join; `path` is the known-wire route between them. */
interface Loop {
  readonly kind: "loop";
  readonly dirs: readonly number[];
  readonly path: readonly number[];
}

/** Why one way of turning a tile is ruled out. */
export type Why =
  | Clash
  | Loop
  /** It would close `group` off from the rest of the grid: the tiles its
   * wires reach, and run on to. */
  | { readonly kind: "sealed"; readonly group: readonly number[] }
  /** It leaves tile `at`, beside it, no way to turn: `ways` are all of that
   * tile's, each with why it cannot be once this one is turned so. A side
   * the two tiles share is known there only while this one is turned so. */
  | {
      readonly kind: "neighbor";
      readonly at: number;
      readonly ways: readonly { readonly wires: number; readonly why: Clash | Loop }[];
    };

/** The ways a tile can turn that a rung leaves, and why each other is out. */
export interface Survey {
  readonly alive: readonly number[];
  readonly ruledOut: readonly { readonly wires: number; readonly why: Why }[];
}

function wiredComponents(f: Facts): Dsf {
  const n = f.w * f.h;
  const dsf = new Dsf(n);
  for (let i = 0; i < n; i++)
    for (const d of DIRECTIONS)
      if (f.get(i, d) === NOTE_WIRE) dsf.merge(i, f.neighbor(i, d));
  return dsf;
}

/** The known-wire route from `a` to `b`, which must be joined. */
function wiredPath(f: Facts, a: number, b: number): number[] {
  const prev = new Map<number, number>([[a, a]]);
  const queue = [a];
  for (let q = 0; q < queue.length; q++) {
    const t = queue[q];
    if (t === b) break;
    for (const d of DIRECTIONS) {
      if (f.get(t, d) !== NOTE_WIRE) continue;
      const u = f.neighbor(t, d);
      if (prev.has(u)) continue;
      prev.set(u, t);
      queue.push(u);
    }
  }
  const out = [b];
  for (let t = b; t !== a; ) {
    t = prev.get(t) ?? a;
    out.push(t);
  }
  return out.reverse();
}

/** The known sides turning `i` to `w` contradicts. */
function clashOf(f: Facts, i: number, w: number): Clash | null {
  const clash = DIRECTIONS.filter((d) => {
    const k = f.get(i, d);
    return k !== NOTE_UNKNOWN && (k === NOTE_WIRE) !== ((w & d) !== 0);
  });
  return clash.length > 0
    ? { kind: "side", sides: clash.map((dir) => ({ at: i, dir })) }
    : null;
}

/** The loop turning `i` to `w` closes, across sides not yet known, through
 * tiles the known wires (`comps`) already join. */
function loopOf(f: Facts, i: number, w: number, comps: Dsf): Loop | null {
  const joined: { d: number; t: number }[] = [];
  for (const d of DIRECTIONS) {
    if (!(w & d) || f.get(i, d) !== NOTE_UNKNOWN) continue;
    const t = f.neighbor(i, d);
    const twin = comps.equivalent(t, i)
      ? { d: 0, t: i }
      : joined.find((j) => comps.equivalent(j.t, t));
    if (twin)
      return {
        kind: "loop",
        dirs: twin.d ? [twin.d, d] : [d],
        path: wiredPath(f, twin.t, t),
      };
    joined.push({ d, t });
  }
  return null;
}

/** Whether some way tile `t` can turn that fits its known sides wires side
 * `d`. */
function usable(f: Facts, t: number, d: number): boolean {
  return turnings(f.wires[t]).some((w) => (w & d) !== 0 && clashOf(f, t, w) === null);
}

/**
 * Where a wire can run on, for the facts as they stand: across the sides
 * some way of each tile there wires, between two tiles that are not dead
 * ends, and on to the dead ends beside.
 */
class Runs {
  constructor(private readonly f: Facts) {}

  /** Whether a wire can cross side `d` of tile `i`: both tiles either side
   * lead on, and some way of each wires it. */
  private passes(i: number, d: number): boolean {
    const f = this.f;
    const j = f.neighbor(i, d);
    return (
      arms(f.wires[i]) > 1 &&
      arms(f.wires[j]) > 1 &&
      usable(f, i, d) &&
      usable(f, j, opposite(d))
    );
  }

  /** The tiles a wire from tile `i` across its side `d` could reach: the
   * tile `j` there, and on from each side `j` could carry it on across, the
   * run past it across sides of neither `i` nor `j`. */
  reach(i: number, d: number): number[] {
    const f = this.f;
    const j = f.neighbor(i, d);
    const into = f.g.sideEdge[i * 16 + d];
    const out = new Set([j]);
    const shut = new Set<number>();
    for (const t of [i, j])
      for (const e of DIRECTIONS) {
        const edge = f.g.sideEdge[t * 16 + e];
        if (edge >= 0) shut.add(edge);
      }
    const inSide = DIRECTIONS.find((e) => f.g.sideEdge[j * 16 + e] === into) ?? 0;
    for (const e of DIRECTIONS) {
      const y = f.g.sideEdge[j * 16 + e];
      if (y < 0 || y === into) continue;
      const carries = turnings(f.wires[j]).some(
        (w) => (w & inSide) !== 0 && (w & e) !== 0 && clashOf(f, j, w) === null,
      );
      if (carries) for (const t of this.runAvoiding(f.neighbor(j, e), shut)) out.add(t);
    }
    return [...out];
  }

  /** {@link run} from `u`, its group joined across no side in `shut`. */
  private runAvoiding(u: number, shut: ReadonlySet<number>): number[] {
    const f = this.f;
    const group = new Set([u]);
    const todo = [u];
    for (let t = todo.pop(); t !== undefined; t = todo.pop())
      for (const d of DIRECTIONS) {
        const edge = f.g.sideEdge[t * 16 + d];
        if (edge < 0 || shut.has(edge) || !this.passes(t, d)) continue;
        const z = f.neighbor(t, d);
        if (group.has(z)) continue;
        group.add(z);
        todo.push(z);
      }
    const out = new Set(group);
    for (const t of group) {
      if (arms(f.wires[t]) < 2) continue;
      for (const d of DIRECTIONS) {
        if (f.g.sideEdge[t * 16 + d] < 0) continue;
        const z = f.neighbor(t, d);
        if (arms(f.wires[z]) === 1 && usable(f, t, d) && usable(f, z, opposite(d)))
          out.add(z);
      }
    }
    return [...out];
  }
}

/** What turning `i` to `wires` would close off from the rest, where its
 * wires and the tiles they could reach reach fewer tiles than there are. */
function sealedBy(f: Facts, i: number, wires: number, runs: Runs): Why | null {
  const reached = new Set([i]);
  for (const d of DIRECTIONS)
    if (wires & d) for (const t of runs.reach(i, d)) reached.add(t);
  if (reached.size >= f.area) return null;
  reached.delete(i);
  return { kind: "sealed", group: [...reached] };
}

/**
 * Why turning `i` to `wires` leaves a tile beside it no way to turn: each
 * way of that tile contradicts the known sides, this one's as turned so
 * among them, or closes a loop through the known wires and this one's.
 */
function strandedBy(f: Facts, i: number, wires: number): Why | null {
  return f.assuming(i, wires, () => {
    const comps = wiredComponents(f);
    for (const d of DIRECTIONS) {
      if (f.g.sideEdge[i * 16 + d] < 0) continue;
      const j = f.neighbor(i, d);
      if (j === i || DIRECTIONS.every((e) => f.get(j, e) !== NOTE_UNKNOWN)) continue;
      const ways: { wires: number; why: Clash | Loop }[] = [];
      for (const w of turnings(f.wires[j])) {
        const why = clashOf(f, j, w) ?? loopOf(f, j, w, comps);
        if (why === null) break;
        ways.push({ wires: w, why });
      }
      if (ways.length === turnings(f.wires[j]).length)
        return { kind: "neighbor", at: j, ways };
    }
    return null;
  });
}

/** The rungs of the ladder, in its order: each rules out what the ones
 * before it do, and more. */
export const RUNGS = ["fit", "loop", "seal", "strand"] as const;
export type Rung = (typeof RUNGS)[number];

/** Every way tile `i` could turn, and why each the rung `rung` rules out
 * is: by the first reason that holds, in the rungs' order. */
export function survey(f: Facts, i: number, rung: Rung): Survey {
  const k = RUNGS.indexOf(rung);
  const comps = k >= 1 ? wiredComponents(f) : null;
  const runs = k >= 2 ? new Runs(f) : null;
  const alive: number[] = [];
  const ruledOut: { wires: number; why: Why }[] = [];
  for (const w of turnings(f.wires[i])) {
    const why =
      clashOf(f, i, w) ??
      (comps && loopOf(f, i, w, comps)) ??
      (runs && sealedBy(f, i, w, runs)) ??
      (k >= 3 ? strandedBy(f, i, w) : null);
    if (why) ruledOut.push({ wires: w, why });
    else alive.push(w);
  }
  return { alive, ruledOut };
}

/** One fact a step adds, and the reasons it rests on: the ways of turning the
 * tile that would have said otherwise, each with why it cannot. */
export type Step =
  | {
      readonly kind: "note";
      readonly at: number;
      readonly dir: number;
      readonly value: typeof NOTE_WIRE | typeof NOTE_NONE;
      readonly alive: readonly number[];
      readonly because: readonly { readonly wires: number; readonly why: Why }[];
    }
  | {
      readonly kind: "lock";
      readonly at: number;
      readonly wires: number;
      readonly because: readonly { readonly wires: number; readonly why: Why }[];
    };

/** Apply a step's fact to `f`. */
export function record(f: Facts, step: Step): void {
  if (step.kind === "note") f.note(step.at, step.dir, step.value);
  else f.lock(step.at, step.wires);
}
