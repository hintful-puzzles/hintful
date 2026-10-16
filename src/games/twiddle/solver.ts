/**
 * Twiddle's planner: put the tiles in place in reading order, keeping every
 * finished tile where it is, the way a person solves it.
 *
 * A stage is the first cell whose tile is wrong. Its tile travels home by
 * **turns of blocks clear of the finished cells**, which cannot disturb them,
 * and where no such turn reaches (the end of a row, the last rows) by a
 * **sequence**: a run of turns whose net effect leaves every finished cell as
 * it was. The sequences come from a library built once per board shape:
 *
 * - commutators of two overlapping block turns (`a b a⁻¹ b⁻¹`), which move
 *   only a few tiles near where the blocks overlap;
 * - commutators of two of those whose supports meet in exactly one cell, which
 *   is always a three-tile cycle;
 * - for orientation, two sequences that move the same tiles the same way but
 *   turn them differently, one undone after the other: a twist in place;
 * - where one turn changes a parity no commutator can (a block of side 2, 6,
 *   10… is an odd permutation; an odd block turns each square color by a
 *   four-cycle), a turn times small sequences inside its own block;
 * - and every placing of those small sequences that conjugating by single
 *   turns reaches (`s c s⁻¹`), each by its shortest word.
 *
 * A sequence leaves the finished cells alone however the rest of the board
 * lies, so what it does to a stage is where it carries one tile. For each
 * stage a backward Dijkstra over the tile's (cell, turn) gives the cheapest
 * way home and its first sequence, independent of the board.
 *
 * **Recompute-stable, by a potential.** A plan is ranked by the prefix it
 * leaves in place and then by its length. Halfway through a sequence the
 * finished cells are disturbed, so the plan from there is found among the
 * *remainders* of the sequences the stage plans use, each tried on the board:
 * one that restores the prefix continues where the interrupted plan left off,
 * one turn shorter. Every hinted turn therefore lowers the rank, and a hint
 * recomputed after each turn arrives (`hints-search.md` § "Recompute-stable
 * plans"); `twiddle-hint.test.ts` walks it.
 */

import type { TwiddleMove, TwiddleState } from "./state.ts";
import { doRotate } from "./state.ts";

/** A turn by its index: block `t >> 1` in row-major order of top-left
 * corners, anticlockwise when `t` is even and clockwise when odd. The inverse
 * of turn `t` is `t ^ 1`. */
export type Turn = number;

/** What a run of turns does to any board: the tile that ends on cell `c`
 * started on `src[c]` and turned `od[c]` more quarter turns anticlockwise. */
interface Effect {
  readonly src: Int32Array;
  readonly od: Uint8Array;
}

/**
 * A turn's part in the technique its sequence was built by, which is what the
 * hint teaches:
 *
 * - `turn`: a single turn;
 * - a **cycle** `X Y X⁻¹ Y⁻¹` of two overlapping blocks: `first`, `second`,
 *   `firstBack`, `secondBack` (cut after `firstBack` it is a **tuck**);
 * - a cycle of two smaller cycles: `small1`, `small2`, `small1Back`,
 *   `small2Back`;
 * - **lining up** `S C S⁻¹`: `lineUp`, the inner roles, `lineBack`;
 * - a **twist**, two routes to the same tiles, one played back: `twist`,
 *   `twistBack`;
 * - a **swap**, a single turn of a block (`swap`) and then small sequences
 *   inside it, which keep their own roles: together they leave two tiles of
 *   the block exchanged;
 * - `learned`, a searched sequence, which has no technique to name.
 */
export type Role =
  | "turn"
  | "first"
  | "second"
  | "firstBack"
  | "secondBack"
  | "small1"
  | "small2"
  | "small1Back"
  | "small2Back"
  | "lineUp"
  | "lineBack"
  | "twist"
  | "twistBack"
  | "swap"
  | "learned";

interface Word {
  readonly effect: Effect;
  readonly turns: readonly Turn[];
  /** Each turn's part, one for one with `turns`. */
  readonly roles: readonly Role[];
}

/**
 * The turns with every turn canceled by its own inverse next to it, which a
 * conjugate's setup and its inner word can bring together: such a pair does
 * nothing, and a hint would say "turn it" and then "turn it back".
 */
function reduced(turns: readonly Turn[], roles: readonly Role[]): [Turn[], Role[]] {
  const ts: Turn[] = [];
  const rs: Role[] = [];
  turns.forEach((t, i) => {
    if (ts.length > 0 && ts[ts.length - 1] === (t ^ 1)) {
      ts.pop();
      rs.pop();
    } else {
      ts.push(t);
      rs.push(roles[i]);
    }
  });
  return [ts, rs];
}

const fill = (n: number, r: Role): Role[] => Array.from({ length: n }, () => r);

/** A library sequence, with what the planner reads off it. */
interface Sequence extends Word {
  /** Where the tile on each cell ends up. */
  readonly dest: Int32Array;
  /** The first cell the sequence changes: it leaves every cell before it. */
  readonly fix: number;
  /** The cells it changes. */
  readonly support: readonly number[];
}

const INF = 1 << 29;

/** The largest set of small sequences a library holds, against a custom
 * board large enough to make one unaffordable. No preset comes near it. */
const CLOSURE_CAP = 200_000;

/** How many cells a small sequence may change. Four is what the last cells
 * need: three for a cycle, four for a pair of swaps. */
const SMALL = 4;

/** The turn's move. */
export function turnMove(
  w: number,
  n: number,
  t: Turn,
): Extract<TwiddleMove, { type: "rotate" }> {
  const across = w - n + 1;
  const b = t >> 1;
  return {
    type: "rotate",
    x: b % across,
    y: Math.floor(b / across),
    dir: t & 1 ? -1 : 1,
  };
}

function compose(g: Effect, h: Effect): Effect {
  const size = g.src.length;
  const src = new Int32Array(size);
  const od = new Uint8Array(size);
  for (let c = 0; c < size; c++) {
    src[c] = g.src[h.src[c]];
    od[c] = (g.od[h.src[c]] + h.od[c]) & 3;
  }
  return { src, od };
}

function inverse(e: Effect): Effect {
  const size = e.src.length;
  const src = new Int32Array(size);
  const od = new Uint8Array(size);
  for (let c = 0; c < size; c++) {
    src[e.src[c]] = c;
    od[e.src[c]] = (4 - e.od[c]) & 3;
  }
  return { src, od };
}

function keyOf(e: Effect): string {
  return String.fromCharCode(...e.src) + String.fromCharCode(...e.od);
}

function supportOf(e: Effect): number[] {
  const out: number[] = [];
  for (let c = 0; c < e.src.length; c++)
    if (e.src[c] !== c || e.od[c] !== 0) out.push(c);
  return out;
}

const undo = (turns: readonly Turn[]): Turn[] => turns.toReversed().map((t) => t ^ 1);

/** A word as the library holds it, or null for one that changes nothing. */
function sequenceOf(c: Word): Sequence | null {
  const support = supportOf(c.effect);
  if (support.length === 0) return null;
  const dest = new Int32Array(c.effect.src.length);
  for (let cell = 0; cell < dest.length; cell++) dest[c.effect.src[cell]] = cell;
  return { ...c, dest, fix: support[0], support };
}

/** The boards a learning search may hold, both ends together. A shape the
 * library covers never learns; this bounds what a hint on one it does not
 * costs, at about a second. */
const LEARN_BUDGET = 400_000;

/** How many small sequences inside a block a turn is multiplied by, for the
 * sequences of a parity commutators keep. */
const ODD_FACTORS = 48;
/** Everything the planner needs for one board shape. */
class Library {
  readonly size: number;
  readonly orientable: boolean;
  /** Each single turn's effect, and where it sends each cell's tile. */
  private readonly turns: readonly Effect[];
  private readonly turnDest: readonly Int32Array[];
  private readonly identity: Effect;
  readonly sequences: Sequence[];
  /** Per stage, per tile state `cell * 4 + turn`: the cost home. */
  readonly cost: Int32Array[];
  /** Per stage, per tile state: the sequence to play first, or -1. */
  readonly policy: Int32Array[];
  /** The remainders of the sequences some stage plan uses, by `fix`. */
  readonly restByFix: Sequence[][];
  /** The same remainders, by each cell they move a tile off. */
  readonly restByCell: Sequence[][];
  private readonly restKeys = new Map<string, Sequence>();
  /** The sequences whose remainders are in. */
  private readonly restsOf = new Set<Sequence>();

  constructor(w: number, h: number, n: number, orientable: boolean) {
    const size = w * h;
    this.size = size;
    this.orientable = orientable;
    const identity: Effect = {
      src: Int32Array.from({ length: size }, (_, i) => i),
      od: new Uint8Array(size),
    };
    this.identity = identity;
    const turns: Effect[] = [];
    for (let y = 0; y <= h - n; y++)
      for (let x = 0; x <= w - n; x++)
        for (const dir of [1, -1]) {
          const src = Int32Array.from(identity.src);
          const od = new Uint8Array(size);
          doRotate(src, od, w, n, orientable, x, y, dir);
          turns.push({ src, od });
        }
    this.turns = turns;
    this.turnDest = turns.map((e) => {
      const d = new Int32Array(size);
      for (let c = 0; c < size; c++) d[e.src[c]] = c;
      return d;
    });
    const word = (ts: readonly Turn[], roles: readonly Role[]): Word =>
      this.word(ts, roles);
    /** `a b a⁻¹ b⁻¹`: a cycle of two blocks' turns, or of two smaller cycles. */
    const commutator = (a: Word, b: Word, of: "blocks" | "cycles"): Word => {
      const [r1, r2, r3, r4]: Role[] =
        of === "blocks"
          ? ["first", "second", "firstBack", "secondBack"]
          : ["small1", "small2", "small1Back", "small2Back"];
      return word(
        [...a.turns, ...b.turns, ...undo(a.turns), ...undo(b.turns)],
        [
          ...fill(a.turns.length, r1),
          ...fill(b.turns.length, r2),
          ...fill(a.turns.length, r3),
          ...fill(b.turns.length, r4),
        ],
      );
    };
    const conjugate = (s: Word, c: Word): Word => {
      const [ts, roles] = reduced(
        [...s.turns, ...c.turns, ...undo(s.turns)],
        [
          ...fill(s.turns.length, "lineUp"),
          ...c.roles,
          ...fill(s.turns.length, "lineBack"),
        ],
      );
      return {
        effect: compose(compose(s.effect, c.effect), inverse(s.effect)),
        turns: ts,
        roles,
      };
    };
    const single: Word[] = turns.map((effect, t) => ({
      effect,
      turns: [t],
      roles: ["turn"],
    }));
    const setups: Word[] = [{ effect: identity, turns: [], roles: [] }, ...single];

    // Commutators of two blocks' quarter and half turns.
    const blocks = turns.length / 2;
    const powers = (b: number): Turn[][] => [[2 * b], [2 * b + 1], [2 * b, 2 * b]];
    const first: Word[] = [];
    {
      const seen = new Set<string>();
      for (let a = 0; a < blocks; a++)
        for (let b = 0; b < blocks; b++) {
          if (a === b) continue;
          for (const x of powers(a))
            for (const y of powers(b)) {
              const c = commutator(
                word(x, fill(x.length, "turn")),
                word(y, fill(y.length, "turn")),
                "blocks",
              );
              const k = keyOf(c.effect);
              if (seen.has(k) || supportOf(c.effect).length === 0) continue;
              seen.add(k);
              first.push(c);
            }
        }
    }

    // Commutators of the smallest of those with a placing of another that
    // shares exactly one cell with it: a three-tile cycle.
    const second: Word[] = [];
    if (first.length > 0) {
      const least = Math.min(...first.map((c) => supportOf(c.effect).length));
      const narrow = first.filter((c) => supportOf(c.effect).length <= least + 1);
      const seen = new Set<string>();
      for (const a of narrow) {
        const inA = new Set(supportOf(a.effect));
        for (const s of setups)
          for (const b0 of narrow) {
            const b = conjugate(s, b0);
            let meet = 0;
            for (const c of supportOf(b.effect)) if (inA.has(c) && ++meet > 1) break;
            if (meet !== 1) continue;
            const c = commutator(a, b, "cycles");
            const k = keyOf(c.effect);
            if (seen.has(k)) continue;
            seen.add(k);
            second.push(c);
          }
      }
    }

    const small = [...first, ...second].filter((c) => supportOf(c.effect).length <= 6);
    // Twists: two small sequences that move the same tiles the same way.
    const twists: Word[] = [];
    if (orientable) {
      const byPerm = new Map<string, Word[]>();
      for (const c of small) {
        const k = String.fromCharCode(...c.effect.src);
        byPerm.set(k, [...(byPerm.get(k) ?? []), c]);
      }
      for (const same of byPerm.values())
        for (const a of same)
          for (const b of same)
            if (a !== b)
              twists.push(
                word(
                  [...a.turns, ...undo(b.turns)],
                  [
                    ...fill(a.turns.length, "twist"),
                    ...fill(b.turns.length, "twistBack"),
                  ],
                ),
              );
    }

    // Every placing of the small sequences, by conjugating with single turns.
    const closure = new Map<string, Word>();
    const close = (from: readonly Word[]) => {
      let front: Word[] = [];
      for (const c of from) {
        if (supportOf(c.effect).length > SMALL) continue;
        const k = keyOf(c.effect);
        const had = closure.get(k);
        if (had && had.turns.length <= c.turns.length) continue;
        closure.set(k, c);
        front.push(c);
      }
      while (front.length > 0 && closure.size < CLOSURE_CAP) {
        const next: Word[] = [];
        for (const c of front)
          for (const s of single) {
            const d = conjugate(s, c);
            const k = keyOf(d.effect);
            const had = closure.get(k);
            if (had && had.turns.length <= d.turns.length) continue;
            closure.set(k, d);
            next.push(d);
          }
        front = next;
      }
    };
    close([...small, ...twists]);
    // A turn of side 2 mod 4 is an odd permutation, and an odd block's turn
    // is a four-cycle on each square color; a commutator is neither.
    if (n % 2 === 1 || n % 4 === 2) {
      const odd: Word[] = [];
      for (const g of single) {
        const inG = new Set(supportOf(g.effect));
        // The shortest few: the products are quadratic in them, and
        // orientation multiplies the small sequences by their turns.
        const inside = [...closure.values()]
          .filter((c) => supportOf(c.effect).every((cell) => inG.has(cell)))
          .sort((a, b) => a.turns.length - b.turns.length)
          .slice(0, ODD_FACTORS);
        for (const x of inside) {
          const gx = word([...g.turns, ...x.turns], ["swap", ...x.roles]);
          odd.push(gx);
          for (const y of inside)
            odd.push(word([...gx.turns, ...y.turns], [...gx.roles, ...y.roles]));
        }
      }
      close(odd);
    }

    // The library: single turns, the first commutators placed by one turn,
    // and the small sequences.
    const library = new Map<string, Sequence>();
    const offer = (c: Word) => {
      const s = sequenceOf(c);
      if (!s) return;
      const k = keyOf(c.effect);
      const had = library.get(k);
      if (!had || had.turns.length > c.turns.length) library.set(k, s);
    };
    for (const s of single) offer(s);
    for (const s of setups) for (const c of first) offer(conjugate(s, c));
    for (const c of closure.values()) offer(c);
    this.sequences = [...library.values()];

    this.cost = [];
    this.policy = [];
    for (let stage = 0; stage < size; stage++) {
      const [c, p] = this.stageTable(stage);
      this.cost.push(c);
      this.policy.push(p);
    }

    // The remainders of the sequences a stage plan plays.
    this.restByFix = Array.from({ length: size }, () => []);
    this.restByCell = Array.from({ length: size }, () => []);
    const used = new Set<number>();
    for (const p of this.policy) for (const i of p) if (i >= 0) used.add(i);
    for (const i of used) this.addRests(this.sequences[i]);
  }

  /** What one turn does. */
  turnEffect(t: Turn): Effect {
    return this.turns[t];
  }

  private word(turns: readonly Turn[], roles: readonly Role[]): Word {
    const [ts, rs] = reduced(turns, roles);
    return {
      effect: ts.reduce<Effect>((e, t) => compose(e, this.turns[t]), this.identity),
      turns: ts,
      roles: rs,
    };
  }

  /** The remainders of `s` after each of its turns but the last, so that a
   * plan asked halfway along it can carry on. */
  private addRests(s: Sequence): void {
    if (this.restsOf.has(s)) return;
    this.restsOf.add(s);
    for (let k = 1; k < s.turns.length; k++) {
      const rest = sequenceOf(this.word(s.turns.slice(k), s.roles.slice(k)));
      if (!rest) continue;
      const key = keyOf(rest.effect);
      const had = this.restKeys.get(key);
      if (had && had.turns.length <= rest.turns.length) continue;
      if (had) {
        this.restByFix[had.fix] = this.restByFix[had.fix].filter((r) => r !== had);
        for (const cell of had.support) {
          const off = had.effect.src[cell];
          this.restByCell[off] = this.restByCell[off].filter((r) => r !== had);
        }
      }
      this.restKeys.set(key, rest);
      this.restByFix[rest.fix].push(rest);
      for (const cell of rest.support)
        if (rest.effect.src[cell] !== cell)
          this.restByCell[rest.effect.src[cell]].push(rest);
    }
  }

  /** Take a learned way into the library for `stage`. */
  private adopt(turns: readonly Turn[], stage: number): void {
    const s = sequenceOf(this.word(turns, fill(turns.length, "learned")));
    if (!s) return;
    this.sequences.push(s);
    const [c, p] = this.stageTable(stage);
    this.cost[stage] = c;
    this.policy[stage] = p;
    for (const i of p) if (i >= 0) this.addRests(this.sequences[i]);
  }

  /**
   * Learn a way to put the tile on `from` into the cell `stage`, leaving the
   * cells before it alone, where the library holds none, by a search from
   * both ends that follows only those tiles. The way joins the
   * library, the stage's table is worked out again, and its remainders join
   * the rest, so a hint asked halfway along it carries on. A library that only
   * gains sequences only lowers what a plan costs, so the potential still
   * falls with every hinted turn. Returns whether it found one in budget.
   */
  learn(b: Board, stage: number, from: number): boolean {
    // Tracked tiles: the finished cells' and the one from `from`, each as
    // `cell * 4 + turn`.
    const k = stage + 1;
    const start = new Uint8Array(k);
    const goal = new Uint8Array(k);
    for (let t = 0; t < stage; t++) {
      start[t] = t * 4;
      goal[t] = t * 4;
    }
    start[stage] = from * 4 + (this.orientable ? b.orient[from] : 0);
    goal[stage] = stage * 4;
    const turns = this.turns;
    const step = (a: Uint8Array, t: Turn): Uint8Array => {
      const e = turns[t];
      const out = new Uint8Array(k);
      for (let i = 0; i < k; i++) {
        const cell = a[i] >> 2;
        const to = this.turnDest[t][cell];
        out[i] = (to << 2) | ((a[i] + e.od[to]) & 3);
      }
      return out;
    };
    const key = (a: Uint8Array) => String.fromCharCode(...a);
    type Seen = Map<string, { prev: string | null; turn: Turn }>;
    const fwd: Seen = new Map([[key(start), { prev: null, turn: -1 }]]);
    const bwd: Seen = new Map([[key(goal), { prev: null, turn: -1 }]]);
    if (fwd.has(key(goal))) return false;
    let ff: Uint8Array[] = [start];
    let fb: Uint8Array[] = [goal];
    while (ff.length > 0 && fb.length > 0 && fwd.size + bwd.size < LEARN_BUDGET) {
      const forward = ff.length <= fb.length;
      const [mine, other, front] = forward ? [fwd, bwd, ff] : [bwd, fwd, fb];
      const next: Uint8Array[] = [];
      let meet: string | null = null;
      for (const a of front) {
        const ka = key(a);
        for (let t = 0; t < turns.length && meet === null; t++) {
          // Backward, a state's predecessor is reached by the inverse turn.
          const b2 = step(a, forward ? t : t ^ 1);
          const kb = key(b2);
          if (mine.has(kb)) continue;
          mine.set(kb, { prev: ka, turn: t });
          if (other.has(kb)) meet = kb;
          next.push(b2);
        }
        if (meet !== null) break;
      }
      if (meet !== null) {
        const path: Turn[] = [];
        for (let c: string | null = meet; c !== null; ) {
          const e = fwd.get(c) as { prev: string | null; turn: Turn };
          if (e.prev === null) break;
          path.unshift(e.turn);
          c = e.prev;
        }
        for (let c: string | null = meet; c !== null; ) {
          const e = bwd.get(c) as { prev: string | null; turn: Turn };
          if (e.prev === null) break;
          path.push(e.turn);
          c = e.prev;
        }
        this.adopt(path, stage);
        return true;
      }
      if (forward) ff = next;
      else fb = next;
    }
    return false;
  }

  /** The cheapest way home for the tile of `stage` from every state, over the
   * sequences that leave the cells before `stage` alone. */
  private stageTable(stage: number): [Int32Array, Int32Array] {
    const states = this.size * 4;
    const turnsOf = this.orientable ? 4 : 1;
    // Edges into each state: (from state, cost, sequence).
    const into: number[][] = Array.from({ length: states }, () => []);
    this.sequences.forEach((s, i) => {
      if (s.fix < stage) return;
      for (const cell of s.support) {
        const to = s.dest[cell];
        for (let o = 0; o < turnsOf; o++)
          into[to * 4 + ((o + s.effect.od[to]) & 3)].push(
            cell * 4 + o,
            s.turns.length,
            i,
          );
      }
    });
    const cost = new Int32Array(states).fill(INF);
    const policy = new Int32Array(states).fill(-1);
    cost[stage * 4] = 0;
    const buckets: number[][] = [[stage * 4]];
    for (let d = 0; d < buckets.length; d++) {
      for (const u of buckets[d] ?? []) {
        if (cost[u] !== d) continue;
        const edges = into[u];
        for (let k = 0; k < edges.length; k += 3) {
          const v = edges[k];
          const nd = d + edges[k + 1];
          if (nd < cost[v]) {
            cost[v] = nd;
            policy[v] = edges[k + 2];
            buckets[nd] ??= [];
            buckets[nd].push(v);
          }
        }
      }
    }
    return [cost, policy];
  }
}

const libraries = new Map<string, Library>();

/** The library for a board shape, built on first use and kept. */
function libraryFor(state: TwiddleState): Library {
  const key = `${state.w}x${state.h}n${state.n}${state.orientable ? "o" : ""}`;
  let lib = libraries.get(key);
  if (!lib) {
    // A session plays one shape at a time; keep the last couple.
    if (libraries.size >= 2) libraries.delete(libraries.keys().next().value as string);
    lib = new Library(state.w, state.h, state.n, state.orientable);
    libraries.set(key, lib);
  }
  return lib;
}

/** A board as the planner moves it. */
interface Board {
  numbers: Int32Array;
  orient: Uint8Array;
}

function played(b: Board, e: Effect): Board {
  const size = b.numbers.length;
  const numbers = new Int32Array(size);
  const orient = new Uint8Array(size);
  for (let c = 0; c < size; c++) {
    numbers[c] = b.numbers[e.src[c]];
    orient[c] = (b.orient[e.src[c]] + e.od[c]) & 3;
  }
  return { numbers, orient };
}

/**
 * A run of the plan: the turns one sequence (or one free turn) makes, all for
 * the stage `stage`, the cell being filled.
 */
export interface Segment {
  readonly stage: number;
  readonly turns: readonly Turn[];
  /** Each turn's part in the technique: a remainder keeps its sequence's
   * roles from where it starts, and a cut drops the roles it cuts. */
  readonly roles: readonly Role[];
  /** The segment is the rest of a sequence, whose first turns it lacks. */
  readonly remainder: boolean;
}

export interface TwiddlePlan {
  readonly segments: readonly Segment[];
  /** Whether the segments end on the solved board, as opposed to where the
   * library runs out. */
  readonly solves: boolean;
}

/**
 * The plan from this board: each segment a library sequence or a remainder of
 * one, in the order they are played.
 */
export function planTwiddle(state: TwiddleState): TwiddlePlan {
  const lib = libraryFor(state);
  const size = lib.size;
  const goal = Int32Array.from(state.numbers).sort();
  const orientable = state.orientable;
  let board: Board = {
    numbers: Int32Array.from(state.numbers),
    orient: Uint8Array.from(state.orient),
  };
  const segments: Segment[] = [];

  /** How many cells, from the start, `e` leaves right on `b`; it is known to
   * leave the cells before `from` alone. */
  const prefix = (b: Board, e: Effect | null, from: number): number => {
    let c = from;
    for (; c < size; c++) {
      const s = e ? e.src[c] : c;
      if (b.numbers[s] !== goal[c]) break;
      if (orientable && ((b.orient[s] + (e ? e.od[c] : 0)) & 3) !== 0) break;
    }
    return c;
  };

  /** The cheapest tile state for `stage` on `b` after `e`: any tile of the
   * stage's number not yet among the finished cells. */
  const stageState = (b: Board, e: Sequence | null, stage: number) => {
    let best = INF;
    let at = -1;
    for (let q = 0; q < size; q++) {
      if (b.numbers[q] !== goal[stage]) continue;
      const cell = e ? e.dest[q] : q;
      if (cell < stage) continue;
      const o = orientable ? (b.orient[q] + (e ? e.effect.od[cell] : 0)) & 3 : 0;
      const c = lib.cost[stage][cell * 4 + o];
      if (c < best) {
        best = c;
        at = cell * 4 + o;
      }
    }
    return { cost: best, at };
  };

  /** `turns` played from `b` up to the first turn that leaves every cell to
   * `stage` right: a sequence's last turns can only put back tiles after the
   * stage's, which the plan from there does not need. */
  const cutAt = (
    b: Board,
    turns: readonly Turn[],
    roles: readonly Role[],
    stage: number,
  ) => {
    let at = b;
    for (let k = 0; k < turns.length; k++) {
      at = played(at, lib.turnEffect(turns[k]));
      if (prefix(at, null, 0) > stage)
        return {
          turns: turns.slice(0, k + 1),
          roles: roles.slice(0, k + 1),
          board: at,
        };
    }
    return { turns, roles, board: at };
  };

  // Rows-only boards repeat each number, so a remainder can rebuild a
  // finished cell with another tile of its number: it may start anywhere.
  const rowsOnly = goal.some((v, i) => i > 0 && v === goal[i - 1]);
  let learned = false;

  for (let guard = 0; guard < 4 * size * size; guard++) {
    const done = prefix(board, null, 0);
    if (done === size) return { segments, solves: true };

    // The direct plan: this stage's tile home. Its rank is (stage + 1, cost).
    const direct = stageState(board, null, done);
    let bestReach = direct.cost < INF ? done + 1 : -1;
    let bestCost = direct.cost;
    let bestRest: Sequence | null = null;

    // A remainder first, where one restores the prefix or carries the tile.
    const tried = new Set<Sequence>(lib.restByFix[done]);
    for (let q = done; q < size; q++)
      if (board.numbers[q] === goal[done])
        for (const r of lib.restByCell[q]) if (r.fix > done) tried.add(r);
    if (rowsOnly)
      for (let f = 0; f < done; f++) for (const r of lib.restByFix[f]) tried.add(r);
    for (const r of tried) {
      const reached = prefix(board, r.effect, Math.min(done, r.fix));
      if (reached < done) continue;
      let reach: number;
      let cost: number;
      if (reached === size) {
        reach = size + 1;
        cost = r.turns.length;
      } else {
        const next = stageState(board, r, reached);
        if (next.cost < INF) {
          reach = reached + 1;
          cost = r.turns.length + next.cost;
        } else if (reached > done) {
          reach = reached;
          cost = r.turns.length;
        } else continue;
      }
      if (reach > bestReach || (reach === bestReach && cost < bestCost)) {
        bestReach = reach;
        bestCost = cost;
        bestRest = r;
      }
    }
    if (bestReach < 0) {
      // The library holds no way on from here: learn one for this stage's
      // tile, and plan again. At most once a plan, and only where it has
      // nothing yet to offer: the turns so far are a plan, and the hint asked
      // at their end learns the next.
      if (learned || segments.length > 0) return { segments, solves: false };
      learned = true;
      let from = -1;
      for (let q = done; q < size && from < 0; q++)
        if (board.numbers[q] === goal[done]) from = q;
      if (from >= 0 && lib.learn(board, done, from)) continue;
      return { segments, solves: false };
    }

    let stage = done;
    if (bestRest) {
      const before = board;
      board = played(board, bestRest.effect);
      stage = prefix(board, null, 0);
      // The remainder serves the tile it carries on toward home, where the
      // stage plan goes on with it; else the last tile it put in place.
      const carried =
        stage < size &&
        stageState(board, null, stage).cost > 0 &&
        before.numbers.some((v, q) => v === goal[stage] && bestRest?.dest[q] !== q);
      if (carried)
        segments.push({
          stage,
          turns: bestRest.turns,
          roles: bestRest.roles,
          remainder: true,
        });
      else {
        const cut = cutAt(before, bestRest.turns, bestRest.roles, stage - 1);
        segments.push({
          stage: stage - 1,
          turns: cut.turns,
          roles: cut.roles,
          remainder: true,
        });
        board = cut.board;
        stage = prefix(board, null, 0);
      }
      if (stage === size) return { segments, solves: true };
    }
    // The stage plan: sequences off the policy until the tile is home.
    for (;;) {
      const at = stageState(board, null, stage);
      if (at.cost === 0 || at.cost >= INF) break;
      const s = lib.sequences[lib.policy[stage][at.at]];
      const after = played(board, s.effect);
      if (stageState(after, null, stage).cost === 0) {
        const cut = cutAt(board, s.turns, s.roles, stage);
        segments.push({ stage, turns: cut.turns, roles: cut.roles, remainder: false });
        board = cut.board;
      } else {
        segments.push({ stage, turns: s.turns, roles: s.roles, remainder: false });
        board = after;
      }
    }
  }
  throw new Error("twiddle: the plan did not finish");
}
