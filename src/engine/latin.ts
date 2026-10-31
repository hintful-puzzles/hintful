/**
 * Generic Latin-square solver and generator: upstream `latin.c`'s solver, and
 * its RNG-faithful generator with `matching.c`.
 *
 * Shared by the games that call `latinSolver`. A game supplies its ladder,
 * compiled from its description, which places the library's techniques
 * (`latin.description.yaml`: singles, set elimination and the wing) among its
 * own, and a `valid` callback (does a completed grid satisfy the game's extra
 * constraints?); `latinSolver` runs them, and at the recursive level forcing
 * chains and guess-and-verify recursion (which doubles as the generators'
 * uniqueness check).
 *
 * The `o³` candidate cube is indexed as upstream's
 * `cubepos(x,y,n) = (x·o + y)·o + (n−1)`, `forcing` is upstream's deduction,
 * and the negative-result sentinels keep upstream's
 * numeric values so a game's `ret <= diff` / `ret != diff` comparisons read as
 * upstream's. Scratch buffers are owned by the solver instance; recursion
 * allocates a sub-solver per guess.
 *
 * ## A symbol that may repeat (this fork's extension)
 *
 * A *pseudo*-Latin puzzle — Salad, where `order − nums` squares per line are
 * empty — has one symbol that appears a stated number of times per line
 * rather than once. Upstream fakes it with a full square whose surplus symbols
 * are reinterpreted as holes, which works but leaves the solver reasoning about
 * *which* interchangeable hole symbol sits where, a question the puzzle never
 * asks; the natural deductions about "the empty square" cannot be written
 * against that encoding. So the cube can be told, via {@link LatinRepeats},
 * that its **last** symbol appears `times` times per line: the cube then has
 * `symbols = o − times + 1` distinct values, `cubepos` strides by `symbols`,
 * the library's techniques read each value's {@link LatinSolver.multiplicity}
 * (`times(d)`), and forcing chains never link through it (a link relies on the
 * value appearing once). With no repeat declared, `symbols = o` and every
 * multiplicity is 1, and the techniques read as on a Latin square.
 */

import { type DeductionTechnique, runDeductionFixpoint } from "./deduction-fixpoint.ts";
import type { DeductionRecorder } from "./deduction-record.ts";
import {
  type Facts,
  type Fire,
  type GridSpace,
  latinSpace,
  type Marks,
  STRIKE,
  valuesOf,
} from "./describe-runtime.ts";
import type { DifficultyVerdict } from "./difficulty.ts";
import {
  auditingPremises,
  type CellBoard,
  FiringReplay,
  offerReplay,
} from "./firing-replay.ts";
import * as compiled from "./latin.compiled.ts";
import { type RandomState, randomUpto } from "./random/index.ts";
import { shuffle } from "./shuffle.ts";
import { type StepBudget, stepBudget } from "./step-budget.ts";

/** Upstream `enum { diff_impossible = 10, diff_ambiguous, diff_unfinished }`
 * — positive sentinels larger than any real difficulty level, so a
 * generator's `ret <= diff` correctly treats them as "harder than allowed". */
export const DIFF_IMPOSSIBLE = 10;
export const DIFF_AMBIGUOUS = 11;
export const DIFF_UNFINISHED = 12;

/**
 * Read a latin-family solver's return as a {@link DifficultyVerdict}.
 *
 * Every solver built on this module returns *the difficulty level it reached*,
 * or one of the three sentinels above — so a plain level, whatever its value,
 * means the board was solved within the cap it was given (the cap is what
 * stopped the ladder, so a level above it is unreachable, not reported). Lives
 * here rather than in each game's difficulty contract because it is a fact
 * about *this* return convention, not about any one game.
 */
export function latinVerdict(ret: number): DifficultyVerdict {
  if (ret === DIFF_IMPOSSIBLE) return "impossible";
  if (ret === DIFF_AMBIGUOUS || ret === DIFF_UNFINISHED) return "unsolved";
  return "solved";
}

/** Validate a *completed* grid against the game's extra constraints. */
type Validator<Ctx> = (solver: LatinSolver, ctx: Ctx) => boolean;

/** Why a *generic* Latin deduction forced a candidate change — the premise a
 * hint narrates. A game's user-solvers attach their own (game-specific) reason
 * objects via `solver.recorder`; the discriminating `kind` fields never collide
 * with these. Used on the hint path only. */
export type LatinReason =
  /** A cell's last remaining candidate, so it must take that height. */
  | { kind: "single" }
  /** Height `n` was just placed at `(px, py)`, which rules it out of the rest
   * of that row and column. */
  | { kind: "dup"; n: number; px: number; py: number }
  | LatinSetReason
  | LatinWingReason;

/** A wing (`wing.ts`): whichever value the `middle` cell takes, one
 * of the `ends`, or where `self` the middle itself, is `n`, and the struck
 * cell shares a line with each. The words outline the middle and the ends,
 * which are every cell it reads. */
export interface LatinWingReason {
  kind: "wing";
  n: number;
  middle: { x: number; y: number };
  ends: readonly { x: number; y: number }[];
  self: boolean;
}

/** A set elimination. `cells` are the subset: the cells whose candidates
 * account for the struck values between them. One value confined across
 * lines has `lines` too. */
type LatinSetReason = {
  kind: "set";
  cells: readonly { x: number; y: number }[];
  lines?: ConfinedLines;
};

/** The parallel lines one value is confined in, where a set is that and not a
 * set within one line: `count` whole rows or columns, whose `cells` are every
 * cell of them. The set's own `cells` are the ones of these the value can
 * still take, and the deduction reads the rest too, where it is absent, so a
 * hint stripes them all. */
export interface ConfinedLines {
  axis: "row" | "col";
  count: number;
  cells: readonly { x: number; y: number }[];
}

/** `indices` of the board's rows or columns, as {@link ConfinedLines}. */
export function confinedLines(
  axis: "row" | "col",
  indices: readonly number[],
  o: number,
): ConfinedLines {
  const cells = indices.flatMap((at) =>
    Array.from({ length: o }, (_, k) =>
      axis === "row" ? { x: k, y: at } : { x: at, y: k },
    ),
  );
  return { axis, count: indices.length, cells };
}

/**
 * The one reason only a solver with {@link LatinRepeats} ever records: the
 * repeated symbol `n` has been placed all `times` times in this line, so it is
 * ruled out of the rest of the line — the multiplicity analog of `dup`, which
 * names one placement where here it is the count that forces. Kept apart from
 * {@link LatinReason} so the Latin-square games, whose narrations switch over
 * that union exhaustively, are not asked to narrate a case they cannot meet. A
 * repeats consumer adds it to its own reason union, or drops the record where
 * a deduction of its own says the same.
 */
interface LatinRepeatReason {
  kind: "repeatFull";
  n: number;
  line: "row" | "col";
  index: number;
  times: number;
}

/**
 * One symbol that may appear more than once per line — what a pseudo-Latin
 * puzzle needs (Salad's empty square). The repeated symbol is always the
 * **last** one, `symbols = o − times + 1`, so a consumer's real symbols keep
 * their `1..k` numbering and the repeat sits one past them.
 */
export interface LatinRepeats {
  /** How many times the last symbol appears in each row and each column. */
  times: number;
}

/** The recorded-deduction shape lives in its own module (nothing about it is
 * Latin — see [`deduction-record.ts`](./deduction-record.ts)); re-exported here
 * so the Latin games keep importing it from the solver they already import. */
export type {
  DeductionRecord,
  DeductionRecorder,
} from "./deduction-record.ts";

export class LatinSolver implements Marks {
  readonly o: number;
  /** The grid as a compiled technique reads it. */
  readonly sp: GridSpace;
  readonly domain: number;
  /** By cell `y·o + x`, the cube index one below the cell's first symbol, so
   * `cellBase[c] + n` is `cubepos(x, y, n)` with no division a read. */
  private readonly cellBase: Int32Array;
  /** Distinct symbols: `o` for a Latin square, `o − times + 1` with a repeat. */
  readonly symbols: number;
  /** The repeated symbol (always `symbols`), or `0` when there is none. */
  readonly repeat: number;
  /** How many times {@link repeat} appears per line (`1` when there is none). */
  readonly times: number;
  /** `o²·symbols` possibility bitmap; `cube[cubepos(x,y,n)]` truthy ⇒ symbol
   * `n` is still possible at `(x, y)`. */
  readonly cube: Uint8Array;
  /** `o²` result grid (0 = blank); written back to the caller's array. */
  grid: Uint8Array;

  // Scratch buffers for forcing chains (instance-owned).
  private readonly sGrid: Uint8Array;
  private readonly sNeighbors: Int32Array;
  private readonly sBfsqueue: Int32Array;

  /** Hint-only deduction recorder; left unset on the generator/solve path so
   * those run with no recording overhead and byte-for-byte unchanged. */
  recorder?: DeductionRecorder;
  /** Hint-only fixpoint budget (set alongside `recorder`). */
  budget?: StepBudget;
  /** Current firing id — bumped once per top-level deduction attempt so every
   * record of one firing shares a `group`. */
  group = 0;
  /** Called as each rung is about to run, after {@link group} moves on. Set
   * only while a premise audit records this solver (`latinReplay`). */
  onGroup?: (rung: number) => void;

  constructor(o: number, repeats: LatinRepeats | null = null) {
    this.o = o;
    if (repeats) {
      if (!(repeats.times >= 2 && repeats.times <= o)) {
        throw new Error(
          `latin: a repeated symbol must appear 2..${o} times, not ${repeats.times}`,
        );
      }
      this.times = repeats.times;
      this.symbols = o - repeats.times + 1;
      this.repeat = this.symbols;
    } else {
      this.times = 1;
      this.symbols = o;
      this.repeat = 0;
    }
    const s = this.symbols;
    this.sp = latinSpace(o);
    this.cellBase = new Int32Array(o * o);
    for (let c = 0; c < o * o; c++)
      this.cellBase[c] = ((c % o) * o + ((c / o) | 0)) * s - 1;
    this.domain = ((1 << (s + 1)) - 1) & ~1;
    this.cube = new Uint8Array(o * o * s);
    this.grid = new Uint8Array(o * o);
    this.sGrid = new Uint8Array(o * o);
    this.sNeighbors = new Int32Array(3 * o);
    this.sBfsqueue = new Int32Array(o * o);
  }

  cubepos(x: number, y: number, n: number): number {
    return (x * this.o + y) * this.symbols + n - 1;
  }

  /** How many times symbol `n` appears in each line. */
  multiplicity(n: number): number {
    return n === this.repeat ? this.times : 1;
  }
  cubeGet(x: number, y: number, n: number): boolean {
    return this.cube[this.cubepos(x, y, n)] !== 0;
  }

  // The marks a compiled technique reads, its cells numbered `y·o + x`.
  known(c: number): boolean {
    return this.grid[c] !== 0;
  }
  value(c: number): number {
    return this.grid[c] || -1;
  }
  cand(c: number): number {
    const base = this.cellBase[c];
    let m = 0;
    for (let n = 1; n <= this.symbols; n++) if (this.cube[base + n]) m |= 1 << n;
    return m;
  }
  has(c: number, d: number): boolean {
    return this.cube[this.cellBase[c] + d] !== 0;
  }

  strikeAt(c: number, d: number): void {
    this.cube[this.cellBase[c] + d] = 0;
  }
  placeAt(c: number, d: number): void {
    this.place(c % this.o, (c / this.o) | 0, d);
  }

  /**
   * Make a compiled firing's facts, recording each with the reason `reasonOf`
   * gives it. Every reason is taken before any fact is made, from the marks
   * the firing read.
   */
  applyFacts(facts: Facts, reasonOf: ((i: number) => unknown) | null): void {
    const o = this.o;
    const rec = this.recorder;
    const reasons: unknown[] | null = rec ? [] : null;
    if (reasons && reasonOf)
      for (let i = 0; i < facts.length; i += 3) reasons.push(reasonOf(i));
    for (let i = 0; i < facts.length; i += 3) {
      const c = facts[i + 1];
      const n = facts[i + 2];
      if (facts[i] !== STRIKE) {
        // Two facts of one firing can place one cell (Towers' facing pairs
        // of a row and a column); the cell was open when both were made.
        if (this.grid[c] === 0)
          this.place(c % o, (c / o) | 0, n, reasons ? reasons[i / 3] : null);
        continue;
      }
      const pos = this.cellBase[c] + n;
      if (rec && this.cube[pos])
        rec({
          kind: "elim",
          x: c % o,
          y: (c / o) | 0,
          n,
          reason: reasons ? reasons[i / 3] : null,
          group: this.group,
        });
      this.cube[pos] = 0;
    }
  }

  /** Reset the cube and seed from `grid` (written back in place). Returns
   * false if a given digit is already ruled out (inconsistent). */
  alloc(grid: Uint8Array): boolean {
    const o = this.o;
    this.grid = grid;
    this.cube.fill(1);
    for (let x = 0; x < o; x++) {
      for (let y = 0; y < o; y++) {
        const n = grid[y * o + x];
        if (n) {
          if (this.cubeGet(x, y, n)) this.place(x, y, n);
          else return false;
        }
      }
    }
    return true;
  }

  /** Commit digit `n` at `(x, y)`: rule out other digits here, this digit
   * elsewhere in the row/column, and record the placement. `reason` (hint path
   * only) explains *why* the cell was placed; the row/column eliminations it
   * implies are recorded as `dup` strikes so a hint can teach them too. */
  place(x: number, y: number, n: number, reason: unknown = null): void {
    const o = this.o;
    const s = this.symbols;
    const rec = this.recorder;
    if (rec && reason !== null) {
      rec({ kind: "place", x, y, n, reason, group: this.group });
    }
    for (let i = 1; i <= s; i++) if (i !== n) this.cube[this.cubepos(x, y, i)] = 0;
    this.grid[y * o + x] = n;

    // The library's `placed`, which a recording records as `dup` strikes, or
    // for the repeated symbol, which leaves a line only once it holds every
    // copy, as `repeatFull`: the count forces it, not this placement.
    const fire: Fire<compiled.PlacedBinding> | null = rec
      ? (_, facts) => {
          this.applyFacts(
            facts,
            n === this.repeat
              ? (i): LatinRepeatReason => {
                  const c = facts[i + 1];
                  const inRow = ((c / o) | 0) === y;
                  return {
                    kind: "repeatFull",
                    n,
                    line: inRow ? "row" : "col",
                    index: inRow ? y : x,
                    times: this.times,
                  };
                }
              : () => ({ kind: "dup", n, px: x, py: y }),
          );
          return true;
        }
      : null;
    compiled.placed(this, this.sp, y * o + x, fire);
  }

  /** Forcing chains (upstream `latin_solver_forcing`): a chain of two-candidate
   * cells whose ends both line up with a third cell forces a digit out of it.
   *
   * Each link is "if this cell is a, that one is b", a conditional no mark
   * records, so a chain is a supposition: it runs only at the recursive level
   * (docs/solver-and-generator.md § "Check, Tactic, Search"), and a hint,
   * which never records at that level, has no words for it. */
  forcing(): number {
    if (this.recorder)
      throw new Error("a forcing chain is a search; no hint narrates one");
    const o = this.o;
    const s = this.symbols;
    const number = this.sGrid; // reused as the BFS "other candidate" map
    const neighbors = this.sNeighbors;
    const bfsqueue = this.sBfsqueue;

    for (let y = 0; y < o; y++) {
      for (let x = 0; x < o; x++) {
        let count = 0;
        let t = 0;
        for (let n = 1; n <= s; n++) {
          if (this.cubeGet(x, y, n)) {
            count++;
            t += n;
          }
        }
        if (count !== 2) continue;

        for (let n = 1; n <= s; n++) {
          if (!this.cubeGet(x, y, n)) continue;
          // Every link of a chain — "this cell takes `currn`, so its neighbor
          // in the line cannot" — relies on `currn` appearing once per line, so
          // the repeated symbol can neither start a chain nor carry one.
          if (n === this.repeat) continue;
          const orign = n;
          number.fill(o + 1, 0, o * o);
          let head = 0;
          let tail = 0;
          bfsqueue[tail++] = y * o + x;
          number[y * o + x] = t - n;

          while (head < tail) {
            let xx = bfsqueue[head++];
            const yy = (xx / o) | 0;
            xx %= o;
            const currn = number[yy * o + xx];
            // A cell whose forced value is the repeated symbol ends the chain
            // there: that value does not exclude itself from the line.
            if (currn === this.repeat) continue;

            let nn = 0;
            for (let yt = 0; yt < o; yt++) neighbors[nn++] = yt * o + xx;
            for (let xt = 0; xt < o; xt++) neighbors[nn++] = yy * o + xt;

            for (let i = 0; i < nn; i++) {
              const xt = neighbors[i] % o;
              const yt = (neighbors[i] / o) | 0;
              if (number[yt * o + xt] <= o) continue;
              if (!this.cubeGet(xt, yt, currn)) continue;
              if (xt === xx && yt === yy) continue;

              let cc = 0;
              let tt = 0;
              for (let m = 1; m <= s; m++) {
                if (this.cubeGet(xt, yt, m)) {
                  cc++;
                  tt += m;
                }
              }
              if (cc === 2) {
                bfsqueue[tail++] = yt * o + xt;
                number[yt * o + xt] = tt - currn;
              }

              if (currn === orign && (xt === x || yt === y)) {
                this.cube[this.cubepos(xt, yt, orign)] = 0;
                return 1;
              }
            }
          }
        }
      }
    }
    return 0;
  }
}

/** One technique of a ladder, run on a solver: `-1`, `0` or `1`, as a rung. */
export type LatinRung = (solver: LatinSolver) => number;

/**
 * A compiled technique as a rung: its firing made through
 * {@link LatinSolver.applyFacts}, each fact recorded with the reason `reason`
 * builds from the firing's binding, on the marks before the firing.
 */
export function compiledRung<B, C>(
  run: (b: Marks, sp: GridSpace, cl: C, fire: Fire<B> | null) => number,
  cl: C,
  reason: (binding: B, cell: number, n: number, solver: LatinSolver) => unknown,
): LatinRung {
  // A solve gives no `fire`, so the technique makes each fact as it
  // concludes it; a hint is told each firing, records it, and stops there,
  // one firing a call being one step.
  return (solver) =>
    run(
      solver,
      solver.sp,
      cl,
      solver.recorder
        ? (binding, facts) => {
            solver.applyFacts(facts, (i) =>
              reason(binding, facts[i + 1], facts[i + 2], solver),
            );
            return false;
          }
        : null,
    );
}

/** {@link compiledRung} of a technique that reads no clues: every library
 * technique, and a game's own that reads only the marks. */
export function uncluedRung<B>(
  run: (b: Marks, sp: GridSpace, fire: Fire<B> | null) => number,
  reason: (binding: B, cell: number, n: number, solver: LatinSolver) => unknown,
): LatinRung {
  return compiledRung(
    (b, sp, _: null, fire: Fire<B> | null) => run(b, sp, fire),
    null,
    reason,
  );
}

const cellAt = (o: number) => (c: number) => ({ x: c % o, y: (c / o) | 0 });

/** The library's techniques (`latin.description.yaml`) as rungs, by the id a
 * description places them with. */
export const LATIN_RUNGS = {
  "latin.hiddenSingle": uncluedRung(
    compiled.hiddenSingle,
    (): LatinReason => ({ kind: "single" }),
  ),
  "latin.single": uncluedRung(compiled.single, (): LatinReason => ({ kind: "single" })),
  "latin.set": uncluedRung(
    compiled.set,
    ({ S }, _c, _n, solver): LatinReason => ({
      kind: "set",
      cells: S.map(cellAt(solver.o)),
    }),
  ),
  "latin.fish": uncluedRung(
    compiled.fish,
    (binding, _c, _n, solver): LatinReason => fishReason(binding, solver),
  ),
  "latin.wing": uncluedRung(
    compiled.wing,
    ({ m, x, E }, _c, _n, solver): LatinReason => ({
      kind: "wing",
      n: x,
      middle: cellAt(solver.o)(m),
      ends: E.map(cellAt(solver.o)),
      self: solver.has(m, x),
    }),
  ),
} satisfies Record<string, LatinRung>;

/**
 * A fish confines its value two ways at once, and either gives its strikes:
 * the columns `X` hold it only in the rows `Y0 − T`, and the rows `T` hold it
 * only in the other columns. The one over fewer lines is recorded, the smaller
 * pattern for a player to check, with the places the value can take in it.
 */
function fishReason(
  { d, X0, Y0, T, X }: compiled.FishBinding,
  solver: LatinSolver,
): LatinReason {
  const o = solver.o;
  const chosen = valuesOf(T);
  const byColumn = X.length <= chosen.length;
  const cols = byColumn ? X : X0.filter((L) => !X.includes(L));
  const rows = byColumn ? valuesOf(Y0 & ~T) : chosen;
  const cells: { x: number; y: number }[] = [];
  for (const L of cols)
    for (const y of rows)
      if (solver.has(y * o + (L - o), d)) cells.push({ x: L - o, y });
  const lines = byColumn
    ? confinedLines(
        "col",
        X.map((L) => L - o),
        o,
      )
    : confinedLines("row", chosen, o);
  return { kind: "set", cells, lines };
}

/** The rungs of a described game: every technique its description places,
 * in its order, each run at its tier, and only at a cap below its `until`
 * where it has one. */
export interface LatinLadder {
  ladder: readonly { tier: number; until?: number; run: LatinRung }[];
}

/** How `latinSolver` runs: its rungs, the game's validator, and the hint-path
 * hooks. */
export type LatinSolverConfig<Ctx> = LatinSolverCommon<Ctx> & LatinLadder;

interface LatinSolverCommon<Ctx> {
  /** Declare the last symbol as repeating `times` per line (a pseudo-Latin
   * puzzle). Leave unset or `null` for a Latin square; see {@link LatinRepeats}. */
  repeats?: LatinRepeats | null;
  maxdiff: number;
  /** The searching level: forcing chains, then guess-and-verify recursion. */
  diffRecursive: number;
  valid: Validator<Ctx> | null;
  ctx: Ctx;
  /** Per-recursion context cloning (upstream `ctxnew`); a game whose ctx is
   * immutable (Towers) omits it. */
  ctxNew?: (ctx: Ctx) => Ctx;
  /** Hint path only: record every candidate cleared / cell placed, in solver
   * order. When set, a fixpoint step budget is also installed. Leaving it unset
   * (generator/solve path) keeps that path byte-for-byte unchanged. */
  recorder?: DeductionRecorder;
  /** What the recorder's fixpoint budget calls itself if it trips. Defaults to
   * the first consumer's label; a game that records passes its own so a runaway
   * fixpoint names the game that owns it. */
  budgetLabel?: string;
  /**
   * Extra candidate-cube constraints to apply *after* `alloc` and *before* the
   * deduction fixpoint — the slot upstream games use between
   * `latin_solver_alloc` and `latin_solver_main`. Salad's Number Ball clues are
   * the case: a ball ("this square holds a symbol") or a cross ("this one does
   * not") rules candidates out of a cell without placing any digit, so it
   * cannot be expressed through the seeded `grid`.
   *
   * Deliberately **not** re-applied inside `latinSolverRecurse`, as upstream's
   * recursion re-runs only `latin_solver_top` on a bare sub-solver. Sound for
   * Salad, which passes `diffRecursive = DIFF_IMPOSSIBLE` and so never recurses;
   * a recursing consumer would have to revisit it.
   */
  seed?: (solver: LatinSolver) => void;
  /** Optional `o³` output buffer that receives the final candidate cube
   * (upstream copies `solver.cube` into `state->hints` after solving). Unequal's
   * greedy clue-assembly generator reads the remaining-possibility counts off
   * it; most games omit it. Filled at every non-recursive exit. */
  cubeOut?: Uint8Array;
}

/** Rung `i` of the ladder (0..maxdiff): the techniques the game's ladder
 * places at tier `i`, in its order, then at the searching level the forcing
 * chain. Returns `-1` (contradiction) / `0` (nothing) / `>0` (fired), the
 * runner's contract. */
function latinRung<Ctx>(
  solver: LatinSolver,
  cfg: LatinSolverConfig<Ctx>,
  i: number,
): number {
  for (const rung of cfg.ladder) {
    if (rung.tier !== i || (rung.until !== undefined && cfg.maxdiff >= rung.until))
      continue;
    const ret = rung.run(solver);
    if (ret !== 0) return ret;
  }
  // A forcing chain is a supposition, so it shares the level of the other
  // search, the recursion, and no game can place it lower.
  return i === cfg.diffRecursive ? solver.forcing() : 0;
}

function latinSolverTop<Ctx>(solver: LatinSolver, cfg: LatinSolverConfig<Ctx>): number {
  const { maxdiff, diffRecursive } = cfg;
  // Rung `i` **is** tier `i` here, and `diffRecursive` a tier number the game
  // hands in, so the technique's tier is its index, and the cap is the game's
  // own `maxdiff` rather than a position derived from it.
  const techniques: DeductionTechnique[] = [];
  for (let i = 0; i <= maxdiff; i++) {
    techniques.push({
      id: `latin-level-${i}`,
      tier: i,
      run: () => latinRung(solver, cfg, i),
    });
  }

  const fp = runDeductionFixpoint({
    techniques,
    maxTier: maxdiff,
    budget: solver.budget,
    beforeTechnique: (technique) => {
      solver.group++;
      solver.onGroup?.(technique.tier);
    },
  });
  if (fp.impossible) return finish(solver, cfg, DIFF_IMPOSSIBLE);
  let diff = fp.grade;

  if (maxdiff === diffRecursive) {
    const nsol = latinSolverRecurse(solver, cfg);
    if (nsol < 0) diff = DIFF_IMPOSSIBLE;
    else if (nsol === 1) diff = diffRecursive;
    else if (nsol > 1) diff = DIFF_AMBIGUOUS;
    // nsol === 0 ⇒ already complete; leave diff unchanged.
  } else {
    const o = solver.o;
    for (let y = 0; y < o; y++) {
      for (let x = 0; x < o; x++) {
        if (!solver.grid[y * o + x]) diff = DIFF_UNFINISHED;
      }
    }
  }

  return finish(solver, cfg, diff);
}

function finish<Ctx>(
  solver: LatinSolver,
  cfg: LatinSolverConfig<Ctx>,
  diff: number,
): number {
  if (
    diff !== DIFF_IMPOSSIBLE &&
    diff !== DIFF_UNFINISHED &&
    diff !== DIFF_AMBIGUOUS &&
    cfg.valid &&
    !cfg.valid(solver, cfg.ctx)
  ) {
    return DIFF_IMPOSSIBLE;
  }
  return diff;
}

function latinSolverRecurse<Ctx>(
  solver: LatinSolver,
  cfg: LatinSolverConfig<Ctx>,
): number {
  const o = solver.o;
  let best = -1;
  const s = solver.symbols;
  let bestcount = s + 1;
  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      if (!solver.grid[y * o + x]) {
        let count = 0;
        for (let n = 1; n <= s; n++) if (solver.cubeGet(x, y, n)) count++;
        if (count < bestcount) {
          bestcount = count;
          best = y * o + x;
        }
      }
    }
  }

  if (best === -1) return 0; // already complete

  const y = (best / o) | 0;
  const x = best % o;
  const list: number[] = [];
  for (let n = 1; n <= s; n++) if (solver.cubeGet(x, y, n)) list.push(n);

  const ingrid = solver.grid.slice();
  let diff = DIFF_IMPOSSIBLE; // no solution found yet

  for (const guess of list) {
    const outgrid = ingrid.slice();
    outgrid[y * o + x] = guess;

    const newctx = cfg.ctxNew ? cfg.ctxNew(cfg.ctx) : cfg.ctx;
    const sub = new LatinSolver(o, cfg.repeats);
    const ret = sub.alloc(outgrid)
      ? latinSolverTop(sub, { ...cfg, maxdiff: cfg.diffRecursive, ctx: newctx })
      : DIFF_IMPOSSIBLE;

    if (ret === DIFF_IMPOSSIBLE) continue;
    // The first solution found is the one written back; a second makes it
    // ambiguous.
    if (diff === DIFF_IMPOSSIBLE) solver.grid.set(outgrid);
    diff =
      ret === DIFF_AMBIGUOUS || diff !== DIFF_IMPOSSIBLE
        ? DIFF_AMBIGUOUS
        : cfg.diffRecursive;
    if (diff === DIFF_AMBIGUOUS) break;
  }

  if (diff === DIFF_IMPOSSIBLE) return -1;
  if (diff === DIFF_AMBIGUOUS) return 2;
  return 1;
}

/**
 * Solve an `o × o` Latin-square puzzle in place. `grid` is the working grid
 * (0 = blank) seeded with the game's fixed cells; it is written back with the
 * first solution found. Returns the difficulty level reached, or one of
 * `DIFF_IMPOSSIBLE` / `DIFF_AMBIGUOUS` / `DIFF_UNFINISHED`.
 */
export function latinSolver<Ctx>(
  grid: Uint8Array,
  o: number,
  cfg: LatinSolverConfig<Ctx>,
): number {
  const solver = new LatinSolver(o, cfg.repeats);
  if (!solver.alloc(grid)) {
    if (cfg.cubeOut) cfg.cubeOut.set(solver.cube);
    return DIFF_IMPOSSIBLE;
  }
  cfg.seed?.(solver);
  // Enable recording only *after* alloc, so seeding the cube from the givens
  // (a flurry of `place`s) is not mistaken for deductions the hint should teach.
  if (cfg.recorder) {
    solver.recorder = cfg.recorder;
    solver.budget = stepBudget(cfg.budgetLabel ?? "towers hint");
  }
  const replay = cfg.recorder && auditingPremises() ? latinReplay(solver, cfg) : null;
  const ret = latinSolverTop(solver, cfg);
  if (replay) offerReplay(replay);
  // Expose the final candidate cube (upstream's `memcpy(state->hints, ...)`),
  // for a generator that grades clues by remaining possibilities (Unequal).
  if (cfg.cubeOut) cfg.cubeOut.set(solver.cube);
  return ret;
}

/**
 * The premise audit's replay of a recording run (`firing-replay.ts`), installed
 * on the solver the recording uses before it runs. A firing's technique is its
 * rung, run alone from the edited state.
 *
 * The replay starts from the context the run started with, because a context
 * may narrow as the run goes (Mathrax mirrors the cube in its own marks, and
 * pulls the cube into them at every call).
 */
function latinReplay<Ctx>(
  solver: LatinSolver,
  cfg: LatinSolverConfig<Ctx>,
): FiringReplay<number> {
  const { o, symbols: s } = solver;
  const clone = (ctx: Ctx): Ctx =>
    cfg.ctxNew ? cfg.ctxNew(ctx) : structuredClone(ctx);
  const ctx = clone(cfg.ctx);
  const capture = (from: LatinSolver): CellBoard => {
    const values = Int32Array.from(from.grid);
    const cands = new Int32Array(o * o);
    for (let c = 0; c < o * o; c++)
      for (let n = 1; n <= s; n++)
        if (from.cubeGet(c % o, (c / o) | 0, n)) cands[c] |= 1 << n;
    return { values, cands };
  };
  const replay = new FiringReplay<number>({
    w: o,
    h: o,
    capture: () => capture(solver),
    name: (rung) => `latin-level-${rung}`,
    run: (board, rung) => {
      const run = new LatinSolver(o, cfg.repeats);
      if (!run.alloc(Uint8Array.from(board.values)))
        throw new Error("latin replay: the edited state is inconsistent");
      for (let c = 0; c < o * o; c++)
        for (let n = 1; n <= s; n++)
          if (!(board.cands[c] & (1 << n)))
            run.cube[run.cubepos(c % o, (c / o) | 0, n)] = 0;
      // The recording path's techniques behave as recorded only with a recorder.
      run.recorder = () => {};
      const replayed = { ...cfg, ctx: clone(ctx) };
      return () => {
        const ret = latinRung(run, replayed, rung);
        return { after: capture(run), ret };
      };
    },
  });
  solver.onGroup = (rung) => {
    replay.before(rung);
    replay.open(solver.group);
  };
  return replay;
}

// --- generator (matching.c / latin.c, RNG-faithful) ------------------------

/**
 * Maximum bipartite matching (Hopcroft–Karp) between `nl` left and `nr`
 * right vertices. `adjlists[L]` lists L's neighbors (mutated in place by the
 * randomizing DFS, exactly as upstream). Returns the L→R assignment array
 * (`-1` = unmatched), upstream's `outl`; invert it for an R→L assignment.
 *
 * With `rs`, the matching is chosen at random among the maximum ones
 * (generation): upstream's two draws — `shuffle(Lorder)` per BFS pass and the
 * in-place `random_upto` adjacency swap during the DFS — are reproduced
 * exactly, so generation is byte-faithful. Without it the run is
 * deterministic; a matching's *cardinality* does not depend on the choice, so
 * that mode is upstream's `rs = NULL` existence check (Tents' completion check).
 */
export function matching(
  nl: number,
  nr: number,
  adjlists: number[][],
  adjsizes: number[],
  rs?: RandomState,
): Int32Array {
  const LtoR = new Int32Array(nl).fill(-1);
  const RtoL = new Int32Array(nr).fill(-1);
  const Llayer = new Int32Array(nl);
  const Rlayer = new Int32Array(nr);
  const Lqueue = new Int32Array(nl);
  const Rqueue = new Int32Array(nr);
  const nmin = Math.min(nl, nr);
  const augpath = new Int32Array(2 * nmin);
  const dfsstate = new Int32Array(nmin + 1);
  const Lorder = new Int32Array(nl);

  outer: while (true) {
    Llayer.fill(-1);
    Rlayer.fill(-1);

    let Lqs = 0;
    for (let L = 0; L < nl; L++) {
      if (LtoR[L] === -1) {
        Llayer[L] = 0;
        Lqueue[Lqs++] = L;
      }
    }

    let layer = 0;
    let targetLayer = -1;
    while (true) {
      let foundFreeR = false;
      let Rqs = 0;
      for (let q = 0; q < Lqs; q++) {
        const L = Lqueue[q];
        for (let j = 0; j < adjsizes[L]; j++) {
          const R = adjlists[L][j];
          if (R !== LtoR[L] && Rlayer[R] === -1) {
            Rlayer[R] = layer + 1;
            Rqueue[Rqs++] = R;
            if (RtoL[R] === -1) foundFreeR = true;
          }
        }
      }
      layer++;

      if (foundFreeR) {
        targetLayer = layer;
        break;
      }
      if (Rqs === 0) break outer;

      Lqs = 0;
      for (let q = 0; q < Rqs; q++) {
        const R = Rqueue[q];
        const L = RtoL[R];
        if (L !== -1 && Llayer[L] === -1) {
          Llayer[L] = layer + 1;
          Lqueue[Lqs++] = L;
        }
      }
      layer++;

      if (Lqs === 0) break outer;
    }

    for (let R = 0; R < nr; R++) {
      if (Rlayer[R] === targetLayer && RtoL[R] !== -1) Rlayer[R] = -1;
    }

    for (let L = 0; L < nl; L++) Lorder[L] = L;
    if (rs) shuffle(Lorder as unknown as number[], rs);

    dfsstate[0] = 0;
    let i = 0;
    while (true) {
      let L: number;
      if (i === 0) {
        if (dfsstate[0] === nl) break;
        L = Lorder[dfsstate[0]++];
        if (Llayer[L] !== 0) continue;
      } else {
        L = augpath[2 * i - 2];
        const j = dfsstate[i]++;
        if (j === adjsizes[L]) {
          i--;
          continue;
        }
        if (rs && adjsizes[L] - j > 1) {
          const which = j + randomUpto(rs, adjsizes[L] - j);
          const tmp = adjlists[L][which];
          adjlists[L][which] = adjlists[L][j];
          adjlists[L][j] = tmp;
        }
        const R = adjlists[L][j];

        if (Rlayer[R] !== 2 * i - 1) continue;

        augpath[2 * i - 1] = R;
        Rlayer[R] = -1;

        if (2 * i - 1 === targetLayer) {
          for (let k = 0; k < 2 * i; k += 2) {
            LtoR[augpath[k]] = augpath[k + 1];
            RtoL[augpath[k + 1]] = augpath[k];
          }
          i = 0;
          continue;
        }

        L = RtoL[R];
        if (Llayer[L] !== 2 * i) continue;
      }

      augpath[2 * i] = L;
      Llayer[L] = -1;
      i++;
      dfsstate[i] = 0;
    }
  }

  return LtoR;
}

/** Generate an `o × o` Latin square (values 1..o), row by row via matching,
 * faithful to `latin_generate`. */
export function latinGenerate(o: number, rs: RandomState): Int32Array {
  const sq = new Int32Array(o * o);

  const row: number[] = [];
  for (let i = 0; i < o; i++) row[i] = i;
  shuffle(row, rs);

  const adjlists: number[][] = [];
  const adjsizes: number[] = [];
  for (let j = 0; j < o; j++) adjlists[j] = [];

  for (let i = 0; i < o; i++) {
    for (let j = 0; j < o; j++) {
      const present = new Int8Array(o);
      for (let k = 0; k < i; k++) present[sq[row[k] * o + j] - 1] = 1;
      const adj = adjlists[j];
      adj.length = 0;
      for (let k = 0; k < o; k++) if (!present[k]) adj.push(k);
      adjsizes[j] = adj.length;
    }

    const m = matching(o, o, adjlists, adjsizes, rs);
    for (let j = 0; j < o; j++) sq[row[i] * o + j] = m[j] + 1;
  }

  return sq;
}

/** Crop an `o × o` Latin square to `w × h` (`o = max(w,h)`). */
export function latinGenerateRect(w: number, h: number, rs: RandomState): Int32Array {
  const o = Math.max(w, h);
  const latin = latinGenerate(o, rs);
  const rect = new Int32Array(w * h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) rect[y * w + x] = latin[y * o + x];
  }
  return rect;
}
