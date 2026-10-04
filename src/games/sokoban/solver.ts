/**
 * Sokoban's solver: a best-first search over pushes, run from both ends.
 *
 * A position is the barrels and the pits where they stand, and the region the
 * player can walk to, so every walk within a region is one position and the
 * search moves from push to push. One side searches forward from the board,
 * pushing; the other searches back from the finished board, pulling, which is
 * how the generator built the level. Each expands the position whose barrels
 * lie fewest pushes from where that side is going, and the line is found
 * where the two meet. Each side alone leaves openings unsolved that the two
 * solve together.
 *
 * What made the search reach the larger boards is how it ranks two positions
 * the estimate cannot tell apart. Both sides come within a few pushes of
 * done quickly and stall there: a barrel that went home early stands in the
 * way of the last ones, so the estimate has to rise before it can fall, and
 * with sixty barrels nearly every push raises it by one. The pushes that
 * matter are beside the barrels and targets still out of place, so a push
 * ranks behind the others by its distance from the nearest of those
 * (`farFrom`).
 *
 * Both sides leave out only positions that are lost for good, and pushes
 * that some line can do without (`searchPushes`), so a side that runs out of
 * positions has proved the board lost. The ranking only orders them.
 *
 * What was measured, and what was tried and dropped, is
 * `strengthen-the-sokoban-solver`'s design.
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
   * each square; -1 where none can be made. `shut` is a square taken as a wall.
   */
  pushDistances(c: number, way: "to" | "from", shut = -1): Int32Array {
    const dist = new Int32Array(this.n).fill(-1);
    dist[c] = 0;
    const queue = [c];
    const open = (q: number) => q !== shut && this.open(q);
    for (let q = 0; q < queue.length; q++) {
      const x = queue[q];
      for (let d = 0; d < 4; d++) {
        // Toward `c`, the barrel arrives at `x` from `next`, pushed from
        // beyond it; away from `c`, it leaves `x` for `next`, pushed from the
        // square behind `x`.
        const next = this.step(x, d);
        const stand = way === "to" ? this.step(next, d) : this.step(x, (d + 2) % 4);
        if (!open(next) || !open(stand) || dist[next] >= 0) continue;
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
   * The pushes worth searching from `p`: all of them, or only those into one
   * corral where the board has one that must be opened first.
   *
   * A corral is floor the player cannot walk to, with the barrels around it.
   * Where each push those barrels could ever be given either goes into the
   * corral and can be made now, or waits on another of them moving, nothing
   * done outside can change them, and the first push to touch one goes in.
   * Any line that finishes can make that push first and the rest after, in
   * the same order, so the others need not be searched from here. A corral
   * has to be opened where one of its barrels is off a target or, with
   * `fill`, where a target inside it is empty; one that has to be opened and
   * has no push into it leaves no pushes at all, the position being lost.
   */
  searchPushes(p: Position, fill: boolean): Push[] {
    const all = this.pushes(p);
    if (!this.tight) return all;
    const reach = this.stamp;
    const { seen, n } = this;
    const { barrels, terrain } = p;
    // The floor the player cannot reach, by connected piece.
    const piece = new Int32Array(n);
    const pieces: number[][] = [[]];
    for (let c = 0; c < n; c++) {
      if (piece[c] || barrels[c] || terrain[c] !== FLOOR || seen[c] === reach) continue;
      const squares = [c];
      piece[c] = pieces.length;
      for (let i = 0; i < squares.length; i++) {
        for (let d = 0; d < 4; d++) {
          const q = this.step(squares[i], d);
          if (q < 0 || piece[q] || barrels[q] || terrain[q] !== FLOOR) continue;
          piece[q] = pieces.length;
          squares.push(q);
        }
      }
      pieces.push(squares);
    }
    let best: Push[] | null = null;
    for (let k = 1; k < pieces.length; k++) {
      const inside = new Uint8Array(pieces.length);
      const fence = new Uint8Array(n);
      const fenceList: number[] = [];
      let needed = false;
      const enclose = (b: number) => {
        if (fence[b]) return;
        fence[b] = 1;
        fenceList.push(b);
        if (!this.target[b]) needed = true;
      };
      const take = (j: number) => {
        if (inside[j]) return;
        inside[j] = 1;
        for (const c of pieces[j]) {
          if (fill && this.target[c]) needed = true;
          for (let d = 0; d < 4; d++) {
            const q = this.step(c, d);
            if (q >= 0 && barrels[q]) enclose(q);
          }
        }
      };
      take(k);
      const into: Push[] = [];
      let shut = true;
      for (let i = 0; i < fenceList.length && shut; i++) {
        const b = fenceList[i];
        for (let d = 0; d < 4; d++) {
          const stand = this.step(b, (d + 2) % 4);
          const dest = this.step(b, d);
          // Never a push: a wall on either side, or a square no barrel
          // comes back from.
          if (!this.open(stand) || !this.open(dest) || this.dist[dest] < 0) continue;
          // Waiting on a barrel, which joins the fence.
          if (barrels[stand]) enclose(stand);
          else if (barrels[dest]) enclose(dest);
          // Waiting on the player getting inside.
          else if (seen[stand] !== reach) take(piece[stand]);
          else if (seen[dest] === reach) {
            // A push the player can make that stays outside.
            shut = false;
            break;
          } else {
            take(piece[dest]);
            into.push({ barrel: b, dir: d });
          }
        }
      }
      if (!shut || !needed) continue;
      if (best === null || into.length < best.length) best = into;
      if (into.length === 0) break;
    }
    if (best === null) return all;
    return best.sort((a, b) => a.barrel - b.barrel || a.dir - b.dir);
  }

  /** Steps from each square to the nearest one where `barrels` and `home`
   * differ, walls ignored. */
  farFrom(barrels: Uint8Array, home: Uint8Array): Int32Array {
    const far = new Int32Array(this.n).fill(-1);
    const queue = this.queue;
    let size = 0;
    for (let c = 0; c < this.n; c++) {
      if (!barrels[c] !== !home[c]) {
        far[c] = 0;
        queue[size++] = c;
      }
    }
    for (let i = 0; i < size; i++) {
      for (let d = 0; d < 4; d++) {
        const q = this.step(queue[i], d);
        if (q < 0 || far[q] >= 0) continue;
        far[q] = far[queue[i]] + 1;
        queue[size++] = q;
      }
    }
    return far;
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

  /**
   * The squares the barrel at `c` can be pushed to while every other barrel
   * stands where it is, the player starting where `p` has them: the pushes of
   * that one barrel, searched to the end.
   */
  routes(p: Position, c: number): Uint8Array {
    const reached = new Uint8Array(this.n);
    reached[c] = 1;
    const seen = new Set<number>();
    const todo: { at: number; p: Position }[] = [{ at: c, p }];
    for (let cur = todo.pop(); cur; cur = todo.pop()) {
      const { at, p: pos } = cur;
      const { least } = this.flood(pos);
      const stamp = this.stamp;
      if (seen.has(at * this.n + least)) continue;
      seen.add(at * this.n + least);
      for (let d = 0; d < 4; d++) {
        const stand = this.step(at, (d + 2) % 4);
        const t = this.step(at, d);
        if (stand < 0 || this.seen[stand] !== stamp) continue;
        if (t < 0 || pos.barrels[t] || pos.terrain[t] !== FLOOR) continue;
        reached[t] = 1;
        todo.push({ at: t, p: this.apply(pos, { barrel: at, dir: d }) });
      }
    }
    return reached;
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
    const pair = pairing(this.n, this.toTargets ?? []);
    return (p) => pair(p.barrels);
  }
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
 * `maps[g][c]` is the pushes from `c` to goal `g`, -1 where it cannot get
 * there.
 */
function pairing(
  n: number,
  maps: readonly Int32Array[],
): (barrels: Uint8Array) => number {
  // For each square, the goals a barrel there can reach, nearest first, and
  // how far each is.
  const goals: Int32Array[] = [];
  const dists: Int32Array[] = [];
  for (let c = 0; c < n; c++) {
    const reach: number[] = [];
    maps.forEach((m, g) => {
      if (m[c] >= 0) reach.push(g);
    });
    reach.sort((a, b) => maps[a][c] - maps[b][c] || a - b);
    goals.push(Int32Array.from(reach));
    dists.push(Int32Array.from(reach, (g) => maps[g][c]));
  }
  // Every position the search generates is paired, so nothing is allocated
  // per call.
  const at = new Int32Array(n);
  const ptr = new Int32Array(n);
  const done = new Uint8Array(n);
  const taken = new Uint8Array(maps.length);
  return (barrels) => {
    let count = 0;
    for (let c = 0; c < n; c++) if (barrels[c]) at[count++] = c;
    ptr.fill(0, 0, count);
    done.fill(0, 0, count);
    taken.fill(0);
    let left = count;
    let sum = 0;
    for (let v = 0; left > 0; v++) {
      for (let i = 0; i < count; i++) {
        if (done[i]) continue;
        const list = goals[at[i]];
        while (ptr[i] < list.length && taken[list[ptr[i]]]) ptr[i]++;
        if (ptr[i] >= list.length) {
          done[i] = 1;
          left--;
          sum += UNPAIRED;
          continue;
        }
        const far = dists[at[i]][ptr[i]];
        if (far <= v) {
          taken[list[ptr[i]]] = 1;
          done[i] = 1;
          left--;
          sum += far;
        }
      }
    }
    return sum;
  };
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
  /** Where this side is taking the barrels: a square that holds one there. */
  readonly home: Uint8Array;
  /** Whether the position a move made is lost for good, by a check cheap
   * enough to make of every position. */
  readonly lost: (next: Position, push: Push) => boolean;
  /** The same, by a check made only of a position about to be expanded,
   * which is one in some fifty of those generated. */
  readonly doomed: (p: Position, push: Push) => boolean;
}

/** Positions the search for a line may generate: the reach of the hint and of
 * Solve, and the most one search can keep a player waiting. Measured on the
 * presets' generated boards (`strengthen-the-sokoban-solver` design D8). */
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
  // The finished board is known and this is the board itself, not a few of
  // its barrels: what the back side and the ranking by distance both need.
  const ranked = whole && board.exact;

  const forward: Side = {
    seen: new Map(),
    frontier: new Frontier(),
    moves: (p) =>
      board
        .searchPushes(p, ranked)
        .map((push) => ({ push, next: board.apply(p, push) })),
    estimate: board.forwardEstimate(),
    home: board.target,
    lost: (next, push) => board.stuck(next, board.step(push.barrel, push.dir)) >= 0,
    doomed: (p, push) => whole && board.fenced(p, board.step(push.barrel, push.dir)),
  };
  const root: Node = { p: start, parent: null, push: null };
  forward.seen.set(board.key(start), root);
  forward.frontier.push(0, root);
  const sides = [forward];
  if (ranked) sides.push(backSide(board, start));

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
      if (node.push && side.doomed(here, node.push)) continue;
      const far = ranked ? board.farFrom(here.barrels, side.home) : null;
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
        // A push far from every barrel and target still out of place seldom
        // matters to them, and near the end almost every push is one: the
        // estimate counts for twice the steps between.
        const rank = far ? far[push.barrel] : 0;
        side.frontier.push(2 * side.estimate(next) + rank, child);
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
  const pair = pairing(n, maps);
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
    estimate: (p) => pair(p.barrels),
    home: start.barrels,
    lost: (next, push) => !reachable[push.barrel] && next.barrels[push.barrel] === 1,
    doomed: () => false,
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
