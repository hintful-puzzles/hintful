/**
 * Pegs' solver: a beam search that finds a way to one peg, and a depth-first
 * search that proves there is none.
 *
 * The two are kept apart because they are good at different things, which is a
 * measurement (`add-pegs-hint` design D1): the beam solved every preset's
 * opening and every soluble position measured, while the depth-first search
 * never found a solution the beam missed but is the only one of the two that
 * can say a position is lost.
 */

import type { Allowance, Verdict } from "../../engine/rival-judging.ts";
import type { SearchOutcome } from "../../engine/search-outcome.ts";
import { GRID_OBST, GRID_PEG, type PegsState } from "./state.ts";

/** A jump as three grid indices: the peg that jumps, the peg it takes, and the
 * hole it lands in. */
export interface Jump {
  readonly from: number;
  readonly over: number;
  readonly to: number;
}

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** The board's geometry, fixed for a game: its holes, in search order, and
 * every jump a peg could ever make between them. */
class PegsBoard {
  /** The grid index of each hole, by its search index. */
  readonly holes: readonly number[];
  /** Every jump between holes, as search indices: from, over, to. */
  readonly jumps: Int32Array;
  /** Each hole's neighbors on the board, by search index, -1 padded to four. */
  private readonly nbrs: Int32Array;
  /** For each hole, the jumps landing in it, as offsets into `jumps`. */
  private readonly landing: readonly number[][];

  constructor(s: PegsState) {
    const { w, h, grid } = s;
    const indexOf = new Int32Array(w * h).fill(-1);
    const holes: number[] = [];
    grid.forEach((v, i) => {
      if (v !== GRID_OBST) {
        indexOf[i] = holes.length;
        holes.push(i);
      }
    });
    this.holes = holes;
    this.nbrs = new Int32Array(holes.length * 4).fill(-1);
    const jumps: number[] = [];
    holes.forEach((i, si) => {
      const x = i % w;
      const y = (i - x) / w;
      let found = 0;
      for (const [dx, dy] of DIRECTIONS) {
        const inside = (k: number) =>
          x + k * dx >= 0 && x + k * dx < w && y + k * dy >= 0 && y + k * dy < h;
        if (!inside(1)) continue;
        const over = indexOf[(y + dy) * w + x + dx];
        if (over < 0) continue;
        this.nbrs[si * 4 + found++] = over;
        if (!inside(2)) continue;
        const to = indexOf[(y + 2 * dy) * w + x + 2 * dx];
        if (to >= 0) jumps.push(si, over, to);
      }
    });
    this.jumps = Int32Array.from(jumps);
    this.landing = holes.map(() => []);
    for (let k = 0; k < jumps.length; k += 3) this.landing[jumps[k + 2]].push(k);
  }

  /** The pegs of `s`, by search index. */
  pegsOf(s: PegsState): Uint8Array {
    return Uint8Array.from(this.holes, (i) => (s.grid[i] === GRID_PEG ? 1 : 0));
  }

  /** The jump at offset `k` into `jumps`, in grid indices. */
  jumpAt(k: number): Jump {
    const { holes, jumps } = this;
    return {
      from: holes[jumps[k]],
      over: holes[jumps[k + 1]],
      to: holes[jumps[k + 2]],
    };
  }

  /** The offsets of the jumps `pegs` can make now. */
  legal(pegs: Uint8Array): number[] {
    const { jumps } = this;
    const out: number[] = [];
    for (let k = 0; k < jumps.length; k += 3) {
      if (pegs[jumps[k]] && pegs[jumps[k + 1]] && !pegs[jumps[k + 2]]) out.push(k);
    }
    return out;
  }

  /**
   * The pegs no jump can ever involve again, by search index: a peg with no peg
   * beside it, beside which no peg can ever arrive.
   *
   * "Can ever arrive" over-approximates the game: every peg stays where it is
   * while new ones appear wherever two in a line could jump in, until nothing
   * changes. A real game reaches no more than that, so a peg this calls frozen
   * really is, and with any other peg on the board the game can no longer end
   * with one.
   */
  frozen(pegs: Uint8Array): number[] {
    const { nbrs, jumps, landing } = this;
    const n = pegs.length;
    const reach = pegs.slice();
    for (let grew = true; grew; ) {
      grew = false;
      for (let c = 0; c < n; c++) {
        if (reach[c]) continue;
        if (landing[c].some((k) => reach[jumps[k]] && reach[jumps[k + 1]])) {
          reach[c] = 1;
          grew = true;
        }
      }
    }
    const out: number[] = [];
    for (let p = 0; p < n; p++) {
      if (!pegs[p]) continue;
      const touched = [0, 1, 2, 3].some((d) => {
        const q = nbrs[p * 4 + d];
        return q >= 0 && reach[q] === 1;
      });
      if (!touched) out.push(p);
    }
    return out;
  }

  /** How compact `pegs` is, lower being better: the sides of pegs that face
   * anything but another peg. A scattered board has many and an isolated peg
   * scores four, which is what a finish has to avoid. */
  spread(pegs: Uint8Array): number {
    const { nbrs } = this;
    let sides = 0;
    for (let p = 0; p < pegs.length; p++) {
      if (!pegs[p]) continue;
      for (let d = 0; d < 4; d++) {
        const q = nbrs[p * 4 + d];
        if (q < 0 || !pegs[q]) sides++;
      }
    }
    return sides;
  }
}

/** Exact, never hashed: a collision would make a soluble position read as lost.
 * Up to three sixteen-bit words the key is a number, exact below 2^53, which a
 * `Set` holds far faster. */
function keyOf(pegs: Uint8Array): number | string {
  const words: number[] = [];
  for (let i = 0; i < pegs.length; i += 16) {
    let word = 0;
    for (let b = 0; b < 16 && i + b < pegs.length; b++) word |= pegs[i + b] << b;
    words.push(word);
  }
  if (words.length <= 3) return words.reduceRight((k, word) => k * 65536 + word, 0);
  return String.fromCharCode(...words);
}

function play(board: PegsBoard, pegs: Uint8Array, k: number, peg: 0 | 1): void {
  const { jumps } = board;
  pegs[jumps[k]] = peg;
  pegs[jumps[k + 1]] = peg;
  pegs[jumps[k + 2]] = peg ? 0 : 1;
}

/**
 * Each level keeps the `width` most compact positions one jump on from the
 * last, so a level is one peg fewer. Stable sort and insertion-ordered maps
 * keep it deterministic, which a hint needs: the same position must give the
 * same plan. `null` when no finish was found, which never means there is none;
 * an `allowance` that runs out ends the search the same way.
 */
function beam(
  board: PegsBoard,
  start: Uint8Array,
  width: number,
  allowance: Allowance = { left: Number.POSITIVE_INFINITY },
): number[] | null {
  interface Node {
    readonly pegs: Uint8Array;
    readonly parent: Node | null;
    readonly k: number;
    readonly spread: number;
  }
  let level: Node[] = [{ pegs: start, parent: null, k: -1, spread: 0 }];
  for (let left = start.reduce((a, b) => a + b, 0); left > 1; left--) {
    const next = new Map<number | string, Node>();
    for (const node of level) {
      for (const k of board.legal(node.pegs)) {
        if (--allowance.left < 0) return null;
        const pegs = node.pegs.slice();
        play(board, pegs, k, 0);
        const key = keyOf(pegs);
        if (!next.has(key)) {
          next.set(key, { pegs, parent: node, k, spread: board.spread(pegs) });
        }
      }
    }
    if (next.size === 0) return null;
    level = [...next.values()].sort((a, b) => a.spread - b.spread).slice(0, width);
  }
  const path: number[] = [];
  for (let node = level[0]; node.parent; node = node.parent) path.push(node.k);
  return path.reverse();
}

/**
 * Whether any line of jumps from `pegs` leaves one peg, searched to
 * exhaustion within `budget` positions: the line's offsets, `"lost"` when every
 * line was searched, or `null` past the budget or the `allowance`.
 */
function exhaust(
  board: PegsBoard,
  start: Uint8Array,
  budget: number,
  allowance: Allowance = { left: Number.POSITIVE_INFINITY },
): number[] | "lost" | null {
  const pegs = start.slice();
  let left = pegs.reduce((a, b) => a + b, 0);
  const lost = new Set<number | string>();
  const path: number[] = [];
  let work = 0;

  const dfs = (): boolean | null => {
    if (left === 1) return true;
    const key = keyOf(pegs);
    if (lost.has(key)) return false;
    if (++work > budget || --allowance.left < 0) return null;
    if (board.frozen(pegs).length === 0) {
      for (const k of board.legal(pegs)) {
        play(board, pegs, k, 0);
        left--;
        path.push(k);
        const r = dfs();
        if (r !== false) return r;
        path.pop();
        play(board, pegs, k, 1);
        left++;
      }
    }
    lost.add(key);
    return false;
  };

  const r = dfs();
  return r === null ? null : r ? path : "lost";
}

/** What a search established about a position. */
export type Finish = SearchOutcome<Jump>;

/** How many positions the proof of loss may visit: about half a second here,
 * measured 2026-10-02. */
const PROOF_BUDGET = 300_000;

/** A line of jumps from `s` that leaves one peg, a proof that none does, or
 * neither, past the search's reach. */
export function findFinish(s: PegsState, proofBudget = PROOF_BUDGET): Finish {
  const board = new PegsBoard(s);
  const pegs = board.pegsOf(s);
  const found = (path: readonly number[]): Finish => ({
    kind: "found",
    line: path.map((k) => board.jumpAt(k)),
  });
  for (const width of [300, 3000]) {
    const path = beam(board, pegs, width);
    if (path) return found(path);
  }
  const r = exhaust(board, pegs, proofBudget);
  if (r === "lost") return { kind: "lost" };
  return r === null ? { kind: "out-of-reach" } : found(r);
}

/** Whether `s` is lost, proved within `budget` positions: true only when every
 * line of jumps was searched and none leaves one peg. */
export function provedLost(s: PegsState, budget: number): boolean {
  const board = new PegsBoard(s);
  return exhaust(board, board.pegsOf(s), budget) === "lost";
}

/**
 * Whether `s` can still finish, from what searches costing at most `proof`
 * positions of their own, and no more than `allowance` holds, can settle.
 * A narrow beam first, since most positions that can finish are easy to finish
 * from; then the proof of loss.
 */
export function judge(s: PegsState, allowance: Allowance, proof: number): Verdict {
  const board = new PegsBoard(s);
  const pegs = board.pegsOf(s);
  if (pegs.reduce((a, b) => a + b, 0) === 1) return "finishes";
  for (const width of [30, 300]) {
    if (beam(board, pegs, width, allowance)) return "finishes";
  }
  if (allowance.left <= 0) return "unknown";
  const r = exhaust(board, pegs, proof, allowance);
  return r === "lost" ? "lost" : r === null ? "unknown" : "finishes";
}

/** The pegs of `s` no jump can ever involve again, as grid indices; empty on a
 * finished board, whose last peg is alone by right. */
export function frozenPegs(s: PegsState): number[] {
  const board = new PegsBoard(s);
  const pegs = board.pegsOf(s);
  if (pegs.reduce((a, b) => a + b, 0) < 2) return [];
  return board.frozen(pegs).map((p) => board.holes[p]);
}

/** Every jump `s` can make now. */
export function legalJumps(s: PegsState): Jump[] {
  const board = new PegsBoard(s);
  return board.legal(board.pegsOf(s)).map((k) => board.jumpAt(k));
}
