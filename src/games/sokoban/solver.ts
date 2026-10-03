/**
 * Sokoban's solver: a best-first search over pushes, run from both ends.
 *
 * A position is the barrels and the pits where they stand, and the region the
 * player can walk to, so every walk within a region is one position and the
 * search moves from push to push. One side searches forward from the board,
 * pushing; the other searches back from the finished board, pulling, which is
 * how the generator built the level. Each expands the position whose barrels
 * lie fewest pushes from where that side is going, and the line is found
 * where the two meet. Measured on generated levels
 * (`judge-rivals-for-search-hints` design D1), each side alone solved openings the other could not.
 *
 * Both sides prune only positions that are lost for good, so a side that runs
 * out of positions has proved the board lost.
 */

import type { Allowance } from "../../engine/rival-judging.ts";
import {
  DEEP_PIT,
  isBarrel,
  isOnTarget,
  PIT,
  type SokobanState,
  WALL,
} from "./state.ts";

/** A push: the barrel's grid index, and the direction as an index into
 * {@link DIRS}. */
export interface Push {
  readonly barrel: number;
  readonly dir: number;
}

/** Left, up, right and down, as (dx, dy). */
export const DIRS = [
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
] as const;

const FLOOR = 0;
const WALLED = 1;
const PIT_CELL = 2;
const DEEP_CELL = 3;

/** A position the search holds: the barrels and the terrain, which a pit
 * filled by a barrel changes, and where the player stands. */
export interface Position {
  readonly barrels: Uint8Array;
  readonly terrain: Uint8Array;
  readonly player: number;
}

/** The board's fixed facts and the walking the search does on it. */
export class SokobanBoard {
  readonly w: number;
  readonly n: number;
  readonly target: Uint8Array;
  private readonly wall: Uint8Array;
  /** Pushes from each square to the nearest target, for a barrel alone on the
   * board; -1 where none can be reached. */
  readonly dist: Int32Array;
  /** Whether every barrel is needed on a target and the terrain never changes:
   * no pits, and no more barrels than targets. Only then is a barrel stuck
   * off a target a lost game. */
  readonly tight: boolean;
  /** Whether the finished board is known: {@link tight}, with as many barrels
   * as targets, so the search can also run back from it. */
  readonly exact: boolean;
  /** Each square's neighbor in each of {@link DIRS}, -1 off the board. */
  private readonly nbr: Int32Array;
  private readonly seen: Int32Array;
  private stamp = 0;
  private readonly queue: Int32Array;
  private toTargets: Int32Array[] | null = null;

  constructor(s: SokobanState) {
    const { w, h, grid } = s;
    this.w = w;
    this.n = w * h;
    this.nbr = new Int32Array(this.n * 4).fill(-1);
    for (let c = 0; c < this.n; c++) {
      const x = c % w;
      const y = (c - x) / w;
      DIRS.forEach(({ dx, dy }, d) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) this.nbr[c * 4 + d] = ny * w + nx;
      });
    }
    this.target = Uint8Array.from(grid, (v) => (isOnTarget(v) ? 1 : 0));
    this.wall = Uint8Array.from(grid, (v) => (v === WALL ? 1 : 0));
    let barrels = 0;
    let targets = 0;
    let pits = false;
    for (const v of grid) {
      if (isBarrel(v)) barrels++;
      if (isOnTarget(v)) targets++;
      if (v === PIT || v === DEEP_PIT) pits = true;
    }
    this.tight = !pits && barrels <= targets;
    this.exact = !pits && barrels === targets;
    this.seen = new Int32Array(this.n);
    this.queue = new Int32Array(this.n);
    const maps: Int32Array[] = [];
    this.target.forEach((t, c) => {
      if (t && !this.wall[c]) maps.push(this.pushDistances(c, "to"));
    });
    this.dist = new Int32Array(this.n).fill(-1);
    for (const m of maps) {
      m.forEach((d, c) => {
        if (d >= 0 && (this.dist[c] < 0 || d < this.dist[c])) this.dist[c] = d;
      });
    }
    this.toTargets = maps;
  }

  /** The square one step from `c` in direction `d`, or -1 off the board. */
  step(c: number, d: number): number {
    return c < 0 ? -1 : this.nbr[c * 4 + d];
  }

  private open(c: number): boolean {
    return c >= 0 && this.wall[c] === 0;
  }

  /**
   * Pushes for a barrel alone on the board, between `c` and every square:
   * `"to"` counts the pushes from each square to `c`, `"from"` from `c` to
   * each square; -1 where none can be made.
   */
  pushDistances(c: number, way: "to" | "from"): Int32Array {
    const dist = new Int32Array(this.n).fill(-1);
    dist[c] = 0;
    const queue = [c];
    for (let q = 0; q < queue.length; q++) {
      const x = queue[q];
      for (let d = 0; d < 4; d++) {
        // Toward `c`, the barrel arrives at `x` from `next`, pushed from
        // beyond it; away from `c`, it leaves `x` for `next`, pushed from the
        // square behind `x`.
        const next = this.step(x, d);
        const stand = way === "to" ? this.step(next, d) : this.step(x, (d + 2) % 4);
        if (!this.open(next) || !this.open(stand) || dist[next] >= 0) continue;
        dist[next] = dist[x] + 1;
        queue.push(next);
      }
    }
    return dist;
  }

  /** The position `s` shows. */
  positionOf(s: SokobanState): Position {
    const { grid } = s;
    const barrels = Uint8Array.from(grid, (v) => (isBarrel(v) ? 1 : 0));
    const terrain = Uint8Array.from(grid, (v) =>
      v === WALL ? WALLED : v === PIT ? PIT_CELL : v === DEEP_PIT ? DEEP_CELL : FLOOR,
    );
    return { barrels, terrain, player: s.py * s.w + s.px };
  }

  /** Floods the squares the player can walk to from `from`: they fill the
   * first `count` entries of `queue` and carry the returned stamp in `seen`. */
  private flood(p: Position, from = p.player): { count: number; least: number } {
    const stamp = ++this.stamp;
    const seen = this.seen;
    const queue = this.queue;
    const { barrels, terrain } = p;
    seen[from] = stamp;
    queue[0] = from;
    let count = 1;
    let least = from;
    for (let q = 0; q < count; q++) {
      const c = queue[q];
      for (let d = 0; d < 4; d++) {
        const nc = this.step(c, d);
        if (nc < 0 || seen[nc] === stamp) continue;
        if (barrels[nc] || terrain[nc] !== FLOOR) continue;
        seen[nc] = stamp;
        queue[count++] = nc;
        if (nc < least) least = nc;
      }
    }
    return { count, least };
  }

  /** The squares the player can walk to in `p`. */
  region(p: Position): number[] {
    const { count } = this.flood(p);
    return Array.from(this.queue.subarray(0, count)).sort((a, b) => a - b);
  }

  /** Every push the player can walk to and make, by barrel then direction. */
  pushes(p: Position): Push[] {
    const { count } = this.flood(p);
    const { barrels, terrain } = p;
    const out: Push[] = [];
    for (let q = 0; q < count; q++) {
      const c = this.queue[q];
      for (let d = 0; d < 4; d++) {
        const b = this.step(c, d);
        if (b < 0 || !barrels[b]) continue;
        const t = this.step(b, d);
        if (t < 0 || barrels[t] || terrain[t] === WALLED) continue;
        out.push({ barrel: b, dir: d });
      }
    }
    // The flood's order depends on where the player stands, and the search
    // must not.
    return out.sort((a, b) => a.barrel - b.barrel || a.dir - b.dir);
  }

  /**
   * Every pull the player can walk to and make in `p`, labeled by the push
   * that undoes it: the player beside a barrel steps away from it, drawing it
   * after, onto the square the player left.
   */
  pulls(p: Position): { push: Push; next: Position }[] {
    const { count } = this.flood(p);
    const { barrels, terrain } = p;
    const stands: number[] = Array.from(this.queue.subarray(0, count));
    const out: { push: Push; next: Position }[] = [];
    for (const q of stands) {
      for (let d = 0; d < 4; d++) {
        const b = this.step(q, d);
        if (b < 0 || !barrels[b]) continue;
        const r = this.step(q, (d + 2) % 4);
        if (r < 0 || barrels[r] || terrain[r] !== FLOOR) continue;
        const next = barrels.slice();
        next[b] = 0;
        next[q] = 1;
        out.push({
          push: { barrel: q, dir: d },
          next: { barrels: next, terrain, player: r },
        });
      }
    }
    return out.sort((a, b) => a.push.barrel - b.push.barrel || a.push.dir - b.push.dir);
  }

  /** The position after `push`. */
  apply(p: Position, push: Push): Position {
    const t = this.step(push.barrel, push.dir);
    const barrels = p.barrels.slice();
    let terrain = p.terrain;
    barrels[push.barrel] = 0;
    if (terrain[t] === PIT_CELL) {
      terrain = terrain.slice();
      terrain[t] = FLOOR;
    } else if (terrain[t] !== DEEP_CELL) {
      barrels[t] = 1;
    }
    return { barrels, terrain, player: push.barrel };
  }

  /** Whether `p` is finished, by the game's own rule: no barrel off a
   * target, or no target or pit left to fill. */
  solved(p: Position): boolean {
    let freeBarrels = false;
    let freeTargets = false;
    for (let c = 0; c < this.n; c++) {
      if (p.barrels[c] && !this.target[c]) freeBarrels = true;
      if (p.terrain[c] === PIT_CELL || p.terrain[c] === DEEP_CELL) freeTargets = true;
      else if (this.target[c] && !p.barrels[c]) freeTargets = true;
    }
    return !freeBarrels || !freeTargets;
  }

  /**
   * A barrel off a target that no push can ever bring to one, in `p`, or -1;
   * only on a {@link tight} board, where every barrel is needed. With `at`,
   * only the barrel there and those beside it are looked at, which is all a
   * push into `at` can have changed.
   */
  stuck(p: Position, at?: number): number {
    if (!this.tight) return -1;
    if (at === undefined) {
      for (let c = 0; c < this.n; c++) {
        if (this.stuckKind(p, c) !== null) return c;
      }
      return -1;
    }
    if (at < 0 || !p.barrels[at]) return -1;
    if (this.stuckKind(p, at) !== null) return at;
    for (let d = 0; d < 4; d++) {
      const q = this.step(at, d);
      if (q >= 0 && this.stuckKind(p, q) !== null) return q;
    }
    return -1;
  }

  /**
   * Why the barrel at `c` can never reach a target, or null if it is on one
   * or might: `"dead"` where no push from its square leads to a target even
   * with the board to itself, `"frozen"` where it can never move again.
   */
  stuckKind(p: Position, c: number): "dead" | "frozen" | null {
    if (!this.tight || !p.barrels[c] || this.target[c]) return null;
    if (this.dist[c] < 0) return "dead";
    return this.frozen(p, c, []) ? "frozen" : null;
  }

  /** Every barrel of `p` off a target that can never reach one, in grid
   * order. */
  stuckBarrels(p: Position): number[] {
    const out: number[] = [];
    for (let c = 0; c < this.n; c++) if (this.stuckKind(p, c) !== null) out.push(c);
    return out;
  }

  /** Whether walls (or the board's edge) stand beside `c` on two sides that
   * meet: a corner, which no barrel pushed into can leave. */
  cornered(c: number): boolean {
    return [0, 1, 2, 3].some(
      (d) => !this.open(this.step(c, d)) && !this.open(this.step(c, (d + 1) % 4)),
    );
  }

  /**
   * Whether the barrel at `c` can never move again: along each axis a wall
   * stands beside it, both squares beside it are dead, or a barrel beside it
   * cannot move either. `held` are barrels already assumed frozen, standing in
   * as walls, which ends the recursion.
   */
  private frozen(p: Position, c: number, held: number[]): boolean {
    held.push(c);
    const along = (a: number, b: number): boolean => {
      const ca = this.step(c, a);
      const cb = this.step(c, b);
      const wallish = (q: number) => !this.open(q) || held.includes(q);
      if (wallish(ca) || wallish(cb)) return true;
      if (this.dist[ca] < 0 && this.dist[cb] < 0) return true;
      return [ca, cb].some((q) => p.barrels[q] === 1 && this.frozen(p, q, held));
    };
    const r = along(0, 2) && along(1, 3);
    held.pop();
    return r;
  }

  private readonly fences = new Map<string, boolean>();

  /**
   * Whether the barrel come to rest at `at` closes off squares the player can
   * no longer walk to, fenced by barrels that could not all reach targets even
   * with every other barrel gone. Taking barrels away only ever makes room, so
   * if those few cannot finish on their own, the board cannot finish at all.
   */
  fenced(p: Position, at: number): boolean {
    if (!this.tight) return false;
    const region = new Uint8Array(this.n);
    const { count } = this.flood(p);
    for (let i = 0; i < count; i++) region[this.queue[i]] = 1;
    const around = (c: number) =>
      [0, 1, 2, 3].map((d) => this.step(c, d)).filter((q) => q >= 0);
    // Pockets beside the barrel, or beside a barrel it now leans on.
    const starts = around(at);
    for (const q of around(at)) if (p.barrels[q]) starts.push(...around(q));
    const done = new Uint8Array(this.n);
    for (const q of starts) {
      if (done[q] || region[q] || p.barrels[q] || p.terrain[q] !== FLOOR) continue;
      // The pocket, the barrels around it, and the barrels those lean on.
      const fence = new Set<number>([at]);
      const pocket = [q];
      done[q] = 1;
      for (let i = 0; i < pocket.length && fence.size <= FENCE_MAX; i++) {
        for (const r of around(pocket[i])) {
          if (p.terrain[r] !== FLOOR) continue;
          if (p.barrels[r]) fence.add(r);
          else if (!done[r] && !region[r]) {
            done[r] = 1;
            pocket.push(r);
          }
        }
      }
      for (const c of [...fence]) {
        for (const r of around(c)) if (p.barrels[r]) fence.add(r);
      }
      if (fence.size > FENCE_MAX) continue;
      if ([...fence].every((c) => this.target[c])) continue;
      const barrels = new Uint8Array(this.n);
      for (const c of fence) barrels[c] = 1;
      const alone: Position = { barrels, terrain: p.terrain, player: p.player };
      const key = this.key(alone);
      let lost = this.fences.get(key);
      if (lost === undefined) {
        const r = searchFrom(this, alone, FENCE_BUDGET, { left: FENCE_BUDGET }, false);
        lost = r.kind === "lost";
        this.fences.set(key, lost);
      }
      if (lost) return true;
    }
    return false;
  }

  /** Names a position: its barrels and filled pits, and the least square of
   * the player's region. */
  key(p: Position): string {
    const parts: number[] = [this.flood(p).least];
    for (let c = 0; c < this.n; c++) if (p.barrels[c]) parts.push(c);
    let key = String.fromCharCode(...parts);
    if (!this.exact) {
      const pits: number[] = [];
      p.terrain.forEach((v, c) => {
        if (v === PIT_CELL) pits.push(c);
      });
      key += `|${String.fromCharCode(...pits)}`;
    }
    return key;
  }

  /** The search forward's guide: pushes to a target, summed over the barrels
   * paired with targets; on a board that is not tight, the count of barrels
   * off a target. */
  forwardEstimate(): (p: Position) => number {
    if (!this.tight) {
      return (p) => {
        let sum = 0;
        for (let c = 0; c < this.n; c++) if (p.barrels[c] && !this.target[c]) sum++;
        return sum;
      };
    }
    const maps = this.toTargets ?? [];
    const near = nearestLists(this.n, maps);
    return (p) => greedyPairing(near, p.barrels, this.n);
  }
}

/**
 * For each square, the goals a barrel there can be pushed to, nearest first,
 * packed as `distance * 1024 + goal`. `maps[g][c]` is the pushes from `c` to
 * goal `g`, -1 where it cannot get there.
 */
function nearestLists(n: number, maps: readonly Int32Array[]): Int32Array[] {
  const out: Int32Array[] = [];
  for (let c = 0; c < n; c++) {
    const list: number[] = [];
    maps.forEach((m, g) => {
      if (m[c] >= 0) list.push(m[c] * 1024 + g);
    });
    out.push(Int32Array.from(list.sort((a, b) => a - b)));
  }
  return out;
}

/** The most barrels a fence may have for {@link SokobanBoard.fenced} to
 * search them, and the positions that search may visit. */
const FENCE_MAX = 8;
const FENCE_BUDGET = 2000;

/** What a barrel the pairing leaves without a goal adds to it. */
const UNPAIRED = 20;

/**
 * Barrels paired with goals greedily, the nearest pair first, summing their
 * distances, so two barrels are not both counted toward one goal.
 */
function greedyPairing(
  near: readonly Int32Array[],
  barrels: Uint8Array,
  n: number,
): number {
  const bs: number[] = [];
  for (let c = 0; c < n; c++) if (barrels[c]) bs.push(c);
  const ptr = new Int32Array(bs.length);
  const done = new Uint8Array(bs.length);
  const taken = new Uint8Array(1024);
  let left = bs.length;
  let sum = 0;
  for (let v = 0; left > 0; v++) {
    for (let i = 0; i < bs.length; i++) {
      if (done[i]) continue;
      const list = near[bs[i]];
      while (ptr[i] < list.length && taken[list[ptr[i]] & 1023]) ptr[i]++;
      if (ptr[i] >= list.length) {
        done[i] = 1;
        left--;
        sum += UNPAIRED;
        continue;
      }
      const k = list[ptr[i]];
      if (k >> 10 <= v) {
        taken[k & 1023] = 1;
        done[i] = 1;
        left--;
        sum += k >> 10;
      }
    }
  }
  return sum;
}

/** A binary heap, least priority first, then first in. */
class Frontier<T> {
  private readonly items: { pri: number; seq: number; v: T }[] = [];
  private seq = 0;
  get size(): number {
    return this.items.length;
  }
  push(pri: number, v: T): void {
    const a = this.items;
    a.push({ pri, seq: this.seq++, v });
    for (let i = a.length - 1; i > 0; ) {
      const parent = (i - 1) >> 1;
      if (!this.less(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }
  pop(): T {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0 && last) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top.v;
  }
  private less(a: { pri: number; seq: number }, b: { pri: number; seq: number }) {
    return a.pri < b.pri || (a.pri === b.pri && a.seq < b.seq);
  }
}

interface Node {
  /** Held only while the node waits to be expanded. */
  p: Position | null;
  readonly parent: Node | null;
  /** Forward, the push that made this position; back, the push that undoes
   * the pull that made it. */
  readonly push: Push | null;
}

/** One end of the search. */
interface Side {
  readonly seen: Map<string, Node>;
  readonly frontier: Frontier<Node>;
  readonly moves: (p: Position) => { push: Push; next: Position }[];
  readonly estimate: (p: Position) => number;
  /** Whether the position a move made is lost for good. */
  readonly lost: (next: Position, push: Push) => boolean;
}

/** Positions the search for a line may generate: the reach of the hint and of
 * Solve. Measured on the presets' generated boards
 * (`judge-rivals-for-search-hints` design D1). */
export const PLAN_BUDGET = 100_000;

/** What a search established about a position. */
export type Finish =
  | { readonly kind: "found"; readonly pushes: readonly Push[] }
  | { readonly kind: "lost" }
  | { readonly kind: "out-of-reach" };

/**
 * A line of pushes from `s` that finishes, a proof that none does, or
 * neither once `budget` positions, or the `allowance`, run out.
 */
export function search(
  s: SokobanState,
  budget: number,
  allowance: Allowance = { left: Number.POSITIVE_INFINITY },
): Finish {
  const board = new SokobanBoard(s);
  return searchFrom(board, board.positionOf(s), budget, allowance);
}

/** {@link search} from a position on `board`. */
export function searchFrom(
  board: SokobanBoard,
  start: Position,
  budget: number,
  allowance: Allowance,
  whole = true,
): Finish {
  if (board.solved(start)) return { kind: "found", pushes: [] };
  if (board.stuck(start) >= 0) return { kind: "lost" };

  const forward: Side = {
    seen: new Map(),
    frontier: new Frontier(),
    moves: (p) => board.pushes(p).map((push) => ({ push, next: board.apply(p, push) })),
    estimate: board.forwardEstimate(),
    lost: (next, push) => {
      const at = board.step(push.barrel, push.dir);
      return board.stuck(next, at) >= 0 || (whole && board.fenced(next, at));
    },
  };
  const root: Node = { p: start, parent: null, push: null };
  forward.seen.set(board.key(start), root);
  forward.frontier.push(0, root);
  const sides = [forward];
  if (whole && board.exact) sides.push(backSide(board, start));

  /** The pushes from the start to forward node `f`, then on from back node
   * `b`'s position to the finish. */
  const stitch = (f: Node, b: Node | null): Finish => {
    const pushes: Push[] = [];
    for (let m: Node | null = f; m?.push; m = m.parent) pushes.push(m.push);
    pushes.reverse();
    for (let m: Node | null = b; m?.push; m = m.parent) pushes.push(m.push);
    return { kind: "found", pushes };
  };

  let work = 0;
  for (;;) {
    for (const side of sides) {
      const other = side === forward ? sides[1] : forward;
      // A side with nothing left to expand has seen every position on its
      // side of the line it prunes, which proves there is no line.
      if (side.frontier.size === 0) return { kind: "lost" };
      const node = side.frontier.pop();
      const here = node.p as Position;
      node.p = null;
      for (const { push, next } of side.moves(here)) {
        if (++work > budget || --allowance.left < 0) return { kind: "out-of-reach" };
        if (side.lost(next, push)) continue;
        const key = board.key(next);
        if (side.seen.has(key)) continue;
        const child: Node = { p: next, parent: node, push };
        if (side === forward) {
          if (board.solved(next)) return stitch(child, null);
          const meet = other?.seen.get(key);
          if (meet) return stitch(child, meet);
        } else {
          const meet = other.seen.get(key);
          if (meet) return stitch(meet, child);
        }
        side.seen.set(key, child);
        side.frontier.push(side.estimate(next), child);
      }
    }
  }
}

/**
 * The search back from the finished board: every target filled, the player in
 * any of the regions that leaves, pulling barrels toward where they stand in
 * `start`. A barrel pulled onto a square that no push from any of `start`'s
 * barrels reaches can never get back there, which is its prune.
 */
function backSide(board: SokobanBoard, start: Position): Side {
  const { n } = board;
  const homes: number[] = [];
  for (let c = 0; c < n; c++) if (start.barrels[c]) homes.push(c);
  const maps = homes.map((c) => board.pushDistances(c, "from"));
  const near = nearestLists(n, maps);
  const reachable = new Uint8Array(n);
  for (const m of maps) {
    m.forEach((d, c) => {
      if (d >= 0) reachable[c] = 1;
    });
  }
  const side: Side = {
    seen: new Map(),
    frontier: new Frontier(),
    moves: (p) => board.pulls(p),
    estimate: (p) => greedyPairing(near, p.barrels, n),
    lost: (next, push) => !reachable[push.barrel] && next.barrels[push.barrel] === 1,
  };
  const finished = board.target.slice();
  const covered = new Uint8Array(n);
  for (let c = 0; c < n; c++) {
    if (covered[c] || start.terrain[c] !== FLOOR || finished[c]) continue;
    const p: Position = { barrels: finished, terrain: start.terrain, player: c };
    for (const q of board.region(p)) covered[q] = 1;
    const root: Node = { p, parent: null, push: null };
    side.seen.set(board.key(p), root);
    side.frontier.push(side.estimate(p), root);
  }
  return side;
}
