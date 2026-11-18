/**
 * Ball Sort's search: every position the pours can reach from a board, and
 * how far each is from sorted.
 *
 * A dealt board reaches few positions (a few thousand at seven colors with
 * two empty tubes, measured in `add-ball-sort`'s proposal), so the search
 * enumerates them all, taking two positions that differ only in the order of
 * their tubes as one, and then works back from the sorted ones. That one
 * enumeration answers everything the game asks: the fewest pours that sort the
 * board, the first of them, whether a position is lost, and whether each rival
 * pour still leaves a board that can be sorted. Being exhaustive, it proves a
 * loss as surely as it finds a finish; only its budget, counted in positions,
 * can leave a position unsettled.
 */

import { bestBy } from "../../engine/best-by.ts";
import type { SearchOutcome } from "../../engine/search-outcome.ts";
import { type BallsortPour, type BallsortState, legalPour, rulesOf } from "./state.ts";

/** A position as the search holds it: each tube's balls from the bottom,
 * tube after tube, 0 past the top. */
type Packed = Uint8Array;

/** The search's own copy of the description's pour, played on the packed
 * board: `ballsort.test.ts` holds the two to agreement. */
export class Tubes {
  constructor(
    readonly w: number,
    readonly h: number,
  ) {}

  pack(s: BallsortState): Packed {
    const { w, h } = this;
    const p = new Uint8Array(w * h);
    for (let t = 0; t < w; t++) {
      let k = 0;
      for (let y = h - 1; y >= 0; y--) {
        const v = s.ball[y * w + t];
        if (v !== 0) p[t * h + k++] = v;
      }
    }
    return p;
  }

  height(p: Packed, t: number): number {
    const { h } = this;
    let n = 0;
    while (n < h && p[t * h + n] !== 0) n++;
    return n;
  }

  /** How many balls pouring `from` into `to` moves, 0 where it may not. */
  amount(p: Packed, from: number, to: number): number {
    const { h } = this;
    const nf = this.height(p, from);
    if (nf === 0 || from === to) return 0;
    const nt = this.height(p, to);
    if (nt === h) return 0;
    const color = p[from * h + nf - 1];
    if (nt > 0 && p[to * h + nt - 1] !== color) return 0;
    let run = 1;
    while (run < nf && p[from * h + nf - 1 - run] === color) run++;
    return Math.min(run, h - nt);
  }

  pour(p: Packed, from: number, to: number, n: number): Packed {
    const { h } = this;
    const q = p.slice();
    const nf = this.height(p, from);
    const nt = this.height(p, to);
    const color = p[from * h + nf - 1];
    for (let i = 0; i < n; i++) {
      q[from * h + nf - 1 - i] = 0;
      q[to * h + nt + i] = color;
    }
    return q;
  }

  sorted(p: Packed): boolean {
    const { w, h } = this;
    for (let t = 0; t < w; t++) {
      const v = p[t * h];
      for (let k = 1; k < h; k++) if (p[t * h + k] !== v) return false;
    }
    return true;
  }

  /** The same key for every order of the same tubes. */
  key(p: Packed): string {
    const { w, h } = this;
    const codes: number[] = [];
    for (let t = 0; t < w; t++) {
      let code = 0;
      for (let k = h - 1; k >= 0; k--) code = code * 16 + p[t * h + k];
      codes.push(code);
    }
    return codes.sort((a, b) => a - b).join(",");
  }
}

/** Every position reachable from a board, each with the fewest pours that
 * sort it, or none where nothing does. */
export class Reach {
  private readonly tubes: Tubes;
  private readonly dist = new Map<string, number>();

  private constructor(s: BallsortState) {
    this.tubes = new Tubes(s.w, s.h);
  }

  /**
   * The positions reachable from `s`, or null where there are more than
   * `budget`. A breadth-first sweep finds them and records each pour between
   * them; a second, backward from the sorted ones along those pours, measures
   * the distance of each.
   */
  static of(s: BallsortState, budget = REACH_BUDGET): Reach | null {
    const r = new Reach(s);
    const { tubes } = r;
    const { w } = tubes;
    const ids = new Map<string, number>();
    const keys: string[] = [];
    const parents: number[][] = [];
    const sorted: number[] = [];
    const queue: Packed[] = [];
    const visit = (p: Packed): number => {
      const key = tubes.key(p);
      const known = ids.get(key);
      if (known !== undefined) return known;
      const id = keys.length;
      ids.set(key, id);
      keys.push(key);
      parents.push([]);
      queue.push(p);
      if (tubes.sorted(p)) sorted.push(id);
      return id;
    };
    visit(tubes.pack(s));
    for (let head = 0; head < queue.length; head++) {
      if (keys.length > budget) return null;
      const p = queue[head];
      for (let from = 0; from < w; from++) {
        for (let to = 0; to < w; to++) {
          const n = tubes.amount(p, from, to);
          if (n === 0) continue;
          const child = visit(tubes.pour(p, from, to, n));
          if (child !== head) parents[child].push(head);
        }
      }
    }
    const dist = new Int32Array(keys.length).fill(-1);
    const back = [...sorted];
    for (const id of sorted) dist[id] = 0;
    for (let head = 0; head < back.length; head++) {
      const id = back[head];
      for (const parent of parents[id]) {
        if (dist[parent] >= 0) continue;
        dist[parent] = dist[id] + 1;
        back.push(parent);
      }
    }
    keys.forEach((key, id) => {
      if (dist[id] >= 0) r.dist.set(key, dist[id]);
    });
    r.size = keys.length;
    r.live = r.dist.size;
    return r;
  }

  /** How many positions were reached, and how many of them can be sorted. */
  size = 0;
  live = 0;

  /** The fewest pours that sort `s`, or null where none does. `s` must be
   * reachable from the board this was built from. */
  distance(s: BallsortState): number | null {
    return this.dist.get(this.tubes.key(this.tubes.pack(s))) ?? null;
  }

  /**
   * The pours that sort `s` in the fewest. Of the pours that bring the board
   * one pour nearer, each is the one that leaves the most pours that can
   * still sort it, the first in order of the tube poured from and then into
   * on a tie: the player's room is the secondary objective, a tie-break among
   * equal gains. Each is so chosen from where the last left the board, so the
   * line from any position on it is the rest of it.
   */
  line(s: BallsortState): BallsortPour[] | null {
    let d = this.distance(s);
    if (d === null) return null;
    const out: BallsortPour[] = [];
    let at = s;
    while (d > 0) {
      const next = this.nearer(at, d);
      out.push(next.pour);
      at = next.board;
      d--;
    }
    return out;
  }

  private nearer(
    s: BallsortState,
    d: number,
  ): { pour: BallsortPour; board: BallsortState } {
    const nearer = this.pours(s).filter((p) => this.distance(p.board) === d - 1);
    const best = bestBy(nearer, (p) => this.liveRoom(p.board));
    if (best === null)
      throw new Error("ballsort: a position the search measured has no pour nearer");
    return best.item;
  }

  /** How many pours from `s` lead to a position that can still be sorted. */
  liveRoom(s: BallsortState): number {
    return this.pours(s).filter((p) => this.distance(p.board) !== null).length;
  }

  /** Every legal pour from `s` with the board after it, in order of the tube
   * poured from and then into. */
  private pours(s: BallsortState): { pour: BallsortPour; board: BallsortState }[] {
    const out: { pour: BallsortPour; board: BallsortState }[] = [];
    for (let from = 0; from < s.w; from++) {
      for (let to = 0; to < s.w; to++) {
        const pour: BallsortPour = { type: "pour", from, to };
        const m = legalPour(s, pour);
        if (m === null) continue;
        out.push({
          pour,
          board: { ...s, ball: rulesOf(s).play({ ball: s.ball }, m).ball },
        });
      }
    }
    return out;
  }
}

/** How many positions the search may reach before it gives up: a board the
 * menu deals reaches far fewer (`ballsort-generation.test.ts`). */
export const REACH_BUDGET = 400_000;

/** The fewest pours that sort `s`, a proof that none does, or neither, past
 * the search's budget. */
export function findFinish(
  s: BallsortState,
  budget = REACH_BUDGET,
): SearchOutcome<BallsortPour> {
  const reach = Reach.of(s, budget);
  if (reach === null) return { kind: "out-of-reach" };
  const line = reach.line(s);
  return line === null ? { kind: "lost" } : { kind: "found", line };
}
