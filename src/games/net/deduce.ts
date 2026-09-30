/**
 * Net's deductions as a player makes them, from facts a player can record:
 * **side notes** (a wire crosses this side, or none does), **locks**, and the
 * **walls** the board shows. A tile's own orientation is unknown until it is
 * locked, however it happens to be turned.
 *
 * Every step derives one new fact from the recorded ones:
 *
 * - **note**: every way a tile can still turn carries a wire across one of its
 *   sides, or none does, so that side can be noted;
 * - **lock**: only one way survives, so the tile can be turned and locked.
 *
 * A way of turning a tile survives unless:
 *
 * - **side**: it contradicts a wall, a note, or a locked neighbor;
 * - **loop**: its new wires join two tiles the noted and locked wires already
 *   join, which would close a loop;
 * - **sealed**: it closes a group off from the rest of the grid. The group is
 *   the tile, whatever the known wires join to it, and whatever its new wires
 *   reach; it is sealed when no tile in it has a wire to spare that could
 *   still lead out.
 *
 * `add-net-hint`'s design measures what these reach. The hint projects this
 * engine one step at a time, simplest first; the generator projects it whole,
 * keeping only boards it finishes.
 */

import { Dsf } from "../../engine/dsf.ts";
import {
  anticlockwise,
  DIRECTIONS,
  offset,
  opposite,
  wireCount,
} from "../../engine/wires.ts";
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
  /** Per tile and direction (`i * 16 + dir`), what is known of that side. */
  private readonly known: Uint8Array;
  private readonly source: SideSource[];

  constructor(readonly s: NetState) {
    const n = s.w * s.h;
    this.w = s.w;
    this.h = s.h;
    this.wires = Uint8Array.from(s.tiles, (t) => t & 0xf);
    this.locked = Uint8Array.from(s.tiles, (t) => (t & LOCKED ? 1 : 0));
    this.known = new Uint8Array(n * 16);
    this.source = new Array(n * 16);
    for (let i = 0; i < n; i++)
      for (const d of DIRECTIONS) {
        const x = i % s.w;
        const y = Math.floor(i / s.w);
        if (s.barriers[i] & d) this.put(i, d, NOTE_NONE, { kind: "wall" });
        const note = s.sides[sideIndex(s, x, y, d)] as Known;
        if (note !== NOTE_UNKNOWN && !(s.barriers[i] & d))
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
    this.known[j * 16 + opposite(d)] = v;
    this.source[i * 16 + d] = src;
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
  get done(): boolean {
    return this.locked.every((l) => l === 1);
  }
}

/** The distinct ways a tile's wires can be turned. */
function turnings(wires: number): number[] {
  const out = [wires];
  for (let w = anticlockwise(wires); w !== wires; w = anticlockwise(w)) out.push(w);
  return out;
}

/** Why one way of turning a tile is ruled out. */
export type Why =
  /** It contradicts known sides; `sides` are all of them, from the tile. */
  | { readonly kind: "side"; readonly sides: readonly Side[] }
  /** Its new wires in `dirs` join tiles the known wires already join; `path`
   * is the known-wire route between them. */
  | {
      readonly kind: "loop";
      readonly dirs: readonly number[];
      readonly path: readonly number[];
    }
  /** It would close `group` off from the rest of the grid. */
  | { readonly kind: "sealed"; readonly group: readonly number[] };

interface Survey {
  readonly alive: readonly number[];
  readonly ruledOut: readonly { readonly wires: number; readonly why: Why }[];
}

function wiredComponents(f: Facts): Dsf {
  const n = f.w * f.h;
  const dsf = new Dsf(n);
  for (let i = 0; i < n; i++)
    for (const d of [1, 8])
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

function sealedBy(f: Facts, i: number, wires: number, comps: Dsf): number[] | null {
  const n = f.w * f.h;
  const group = new Set<number>();
  const addComponent = (t: number) => {
    const c = comps.canonify(t);
    for (let u = 0; u < n; u++) if (comps.canonify(u) === c) group.add(u);
  };
  addComponent(i);
  for (const d of DIRECTIONS)
    if (wires & d && f.get(i, d) === NOTE_UNKNOWN) addComponent(f.neighbor(i, d));
  if (group.size >= n) return null;
  for (const t of group) {
    if (t === i) {
      for (const d of DIRECTIONS)
        if (wires & d && !group.has(f.neighbor(t, d))) return null;
      continue;
    }
    // The wires it still has to place, beyond those the group already takes.
    let used = 0;
    for (const d of DIRECTIONS) {
      if (!group.has(f.neighbor(t, d))) continue;
      if (f.get(t, d) === NOTE_WIRE) used++;
      else if (
        f.neighbor(t, d) === i &&
        wires & opposite(d) &&
        f.get(t, d) === NOTE_UNKNOWN
      )
        used++;
    }
    if (wireCount(f.wires[t]) - used <= 0) continue;
    for (const d of DIRECTIONS)
      if (f.get(t, d) !== NOTE_NONE && !group.has(f.neighbor(t, d))) return null;
  }
  return [...group];
}

/** Every way tile `i` could turn, and why each ruled-out one is. */
function survey(f: Facts, i: number, comps: Dsf = wiredComponents(f)): Survey {
  const alive: number[] = [];
  const ruledOut: { wires: number; why: Why }[] = [];
  for (const w of turnings(f.wires[i])) {
    const clash = DIRECTIONS.filter((d) => {
      const k = f.get(i, d);
      return k !== NOTE_UNKNOWN && (k === NOTE_WIRE) !== ((w & d) !== 0);
    });
    if (clash.length > 0) {
      ruledOut.push({
        wires: w,
        why: { kind: "side", sides: clash.map((dir) => ({ at: i, dir })) },
      });
      continue;
    }
    const joined: { d: number; t: number }[] = [];
    let loop: Why | null = null;
    for (const d of DIRECTIONS) {
      if (!(w & d) || f.get(i, d) !== NOTE_UNKNOWN) continue;
      const t = f.neighbor(i, d);
      const twin = comps.equivalent(t, i)
        ? { d: 0, t: i }
        : joined.find((j) => comps.equivalent(j.t, t));
      if (twin) {
        loop = {
          kind: "loop",
          dirs: twin.d ? [twin.d, d] : [d],
          path: wiredPath(f, twin.t, t),
        };
        break;
      }
      joined.push({ d, t });
    }
    if (loop) {
      ruledOut.push({ wires: w, why: loop });
      continue;
    }
    const group = sealedBy(f, i, w, comps);
    if (group) ruledOut.push({ wires: w, why: { kind: "sealed", group } });
    else alive.push(w);
  }
  return { alive, ruledOut };
}

/** How hard a step is to see, by the hardest reason it cites: walls alone,
 * then notes and locks, then a loop, then a sealed group. */
function difficulty(whys: readonly Why[], f: Facts): number {
  let d = 0;
  for (const why of whys) {
    if (why.kind === "loop") d = Math.max(d, 2);
    else if (why.kind === "sealed") d = Math.max(d, 3);
    else if (why.sides.some((s) => f.from(s.at, s.dir).kind !== "wall"))
      d = Math.max(d, 1);
  }
  return d;
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

/**
 * The next fact one step of reasoning adds to `f`, or `null` when deduction has
 * run out: the easiest step there is, a lock before a note of the same
 * difficulty, then reading order.
 */
export function nextStep(f: Facts): Step | null {
  const n = f.w * f.h;
  const comps = wiredComponents(f);
  let best: Step | null = null;
  let bestRank = Number.POSITIVE_INFINITY;
  const consider = (step: Step, rank: number) => {
    if (rank < bestRank) {
      best = step;
      bestRank = rank;
    }
  };
  for (let i = 0; i < n; i++) {
    if (f.locked[i]) continue;
    const r = survey(f, i, comps);
    if (r.alive.length === 1) {
      const because = r.ruledOut;
      consider(
        { kind: "lock", at: i, wires: r.alive[0], because },
        difficulty(
          because.map((b) => b.why),
          f,
        ) *
          2 *
          n +
          i,
      );
      continue;
    }
    for (const d of DIRECTIONS) {
      if (f.get(i, d) !== NOTE_UNKNOWN) continue;
      const wire = r.alive.every((w) => w & d);
      if (!wire && !r.alive.every((w) => !(w & d))) continue;
      // Only the ways that would say otherwise about this side need a reason.
      const because = r.ruledOut.filter((b) => ((b.wires & d) !== 0) !== wire);
      consider(
        {
          kind: "note",
          at: i,
          dir: d,
          value: wire ? NOTE_WIRE : NOTE_NONE,
          alive: r.alive,
          because,
        },
        difficulty(
          because.map((b) => b.why),
          f,
        ) *
          2 *
          n +
          n +
          i,
      );
    }
  }
  return best;
}

/** Apply a step's fact to `f`. */
export function record(f: Facts, step: Step): void {
  if (step.kind === "note") f.note(step.at, step.dir, step.value);
  else f.lock(step.at, step.wires);
}

/** Whether the engine finishes the board from its opening position. */
export function finishes(s: NetState): boolean {
  const f = new Facts(s);
  for (let step = nextStep(f); step !== null; step = nextStep(f)) record(f, step);
  return f.done;
}
