/**
 * Generic Latin-square solver and generator: upstream `latin.c`'s solver, and
 * its RNG-faithful generator with `matching.c`.
 *
 * Shared by the games that call `latinSolver`. A game supplies its ladder,
 * compiled from its description, which places the library's techniques
 * (`latin.description.yaml`: singles, set elimination and the wing) among its
 * own, and its answer check, compiled from the same description's rules;
 * `latinSolver` runs them, and at the recursive level forcing
 * chains and guess-and-verify recursion (which doubles as the generators'
 * uniqueness check).
 *
 * The candidates are the engine's marks (`ladder-runtime.ts`'s `CellMarks`),
 * a mask a cell; upstream's `o³` cube survives only where a generator reads
 * it ({@link LatinSolver.writeCube}). `forcing` is upstream's deduction, and
 * the negative-result sentinels keep upstream's numeric values so a game's
 * `ret <= diff` / `ret != diff` comparisons read as upstream's. Scratch
 * buffers are owned by the solver instance; recursion allocates a sub-solver
 * per guess.
 *
 * ## A symbol that may repeat (this fork's extension)
 *
 * A *pseudo*-Latin puzzle — Salad, where `order − nums` squares per line are
 * empty — has one symbol that appears a stated number of times per line
 * rather than once. Upstream fakes it with a full square whose surplus symbols
 * are reinterpreted as holes, which works but leaves the solver reasoning about
 * *which* interchangeable hole symbol sits where, a question the puzzle never
 * asks; the natural deductions about "the empty square" cannot be written
 * against that encoding. So the solver can be told, via {@link LatinRepeats},
 * that its **last** symbol appears `times` times per line: it then has
 * `symbols = o − times + 1` distinct values,
 * the library's techniques read each value's {@link LatinSolver.multiplicity}
 * (`times(d)`), and forcing chains never link through it (a link relies on the
 * value appearing once). With no repeat declared, `symbols = o` and every
 * multiplicity is 1, and the techniques read as on a Latin square.
 */

import type { CompiledTechniques } from "./deduction-fixpoint.ts";
import type { DeductionRecorder } from "./deduction-record.ts";
import { latinSpace, valuesOf } from "./describe-runtime.ts";
import type { DifficultyVerdict } from "./difficulty.ts";
import { auditingPremises, type FiringReplay, offerReplay } from "./firing-replay.ts";
import {
  CellMarks,
  type CompiledLadder,
  describedLadder,
  type Ladder,
  type Library,
  ladderReplay,
  ladderTechniques,
  type OwnRungs,
  type PlaceRung,
  type Rung,
  runLadder,
  TIERS,
  uncluedPlacingRung,
  uncluedRung,
  withSearch,
} from "./ladder-runtime.ts";
import * as compiled from "./latin.compiled.ts";
import { type RandomState, randomUpto } from "./random/index.ts";
import { shuffle } from "./shuffle.ts";
import { stepBudget } from "./step-budget.ts";

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

/** The library's `placed`, run as each value is placed on a Latin square. */
const LATIN_PLACING: readonly PlaceRung[] = [uncluedPlacingRung(compiled.placed)];

/**
 * The marks of an `o × o` Latin square, cells numbered `y·o + x`, and the
 * forcing chain, which no description states: a supposition, run only at the
 * recursive level.
 */
export class LatinSolver extends CellMarks {
  readonly o: number;
  /** Distinct symbols: `o` for a Latin square, `o − times + 1` with a repeat. */
  readonly symbols: number;
  declare grid: Uint8Array;

  // Scratch buffers for forcing chains (instance-owned).
  private readonly sGrid: Uint8Array;
  private readonly sNeighbors: Int32Array;
  private readonly sBfsqueue: Int32Array;

  /** `placing`: what runs as each value is placed, the compiled module's
   * where a game's ladder gives it, and the library's `placed` otherwise. */
  constructor(
    o: number,
    repeats: LatinRepeats | null = null,
    placing: readonly PlaceRung[] = LATIN_PLACING,
  ) {
    if (repeats && !(repeats.times >= 2 && repeats.times <= o)) {
      throw new Error(
        `latin: a repeated symbol must appear 2..${o} times, not ${repeats.times}`,
      );
    }
    const s = repeats ? o - repeats.times + 1 : o;
    super(
      latinSpace(o),
      ((1 << (s + 1)) - 1) & ~1,
      new Uint8Array(o * o),
      repeats ? { value: s, times: repeats.times } : null,
    );
    this.o = o;
    this.symbols = s;
    this.placing = placing;
    this.sGrid = new Uint8Array(o * o);
    this.sNeighbors = new Int32Array(3 * o);
    this.sBfsqueue = new Int32Array(o * o);
  }

  /** How many times symbol `n` appears in each line. */
  multiplicity(n: number): number {
    return n === this.repeat ? this.times : 1;
  }
  cubeGet(x: number, y: number, n: number): boolean {
    return this.has(y * this.o + x, n);
  }

  /** Seed the marks from `grid` (written back in place). Returns false if a
   * given digit is already ruled out (inconsistent). */
  alloc(grid: Uint8Array): boolean {
    return this.seed(grid);
  }

  /** The candidate cube upstream's generators read (`state->hints`), at
   * `cubepos(x, y, n) = (x·o + y)·symbols + n − 1`. */
  writeCube(out: Uint8Array): void {
    const { o, symbols: s } = this;
    for (let x = 0; x < o; x++)
      for (let y = 0; y < o; y++)
        for (let n = 1; n <= s; n++)
          out[(x * o + y) * s + n - 1] = this.has(y * o + x, n) ? 1 : 0;
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
                this.strikeAt(yt * o + xt, orign);
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

const cellAt = (w: number) => (c: number) => ({ x: c % w, y: (c / w) | 0 });

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
    (_b, _c, _n, m, { terms }): LatinReason => ({
      kind: "set",
      cells: terms.S.map(cellAt(m.sp.w)),
    }),
  ),
  "latin.fish": uncluedRung(
    compiled.fish,
    (_b, _c, _n, m, says): LatinReason => fishReason(says, m.sp.w),
  ),
  "latin.wing": uncluedRung(
    compiled.wing,
    (_b, _c, _n, m, { terms: { m: mid, x, E, self } }): LatinReason => ({
      kind: "wing",
      n: x,
      middle: cellAt(m.sp.w)(mid),
      ends: E.map(cellAt(m.sp.w)),
      self,
    }),
  ),
} satisfies Record<string, Rung>;

/** The Latin library, as the engine pairs it for every game that places
 * it. */
const LATIN_LIBRARY: Library = {
  rungs: LATIN_RUNGS,
  placing: { "latin.placed": LATIN_PLACING[0] },
};

/** A Latin game's ladder: its compiled module's, its own techniques paired
 * by `own` and the library's by the engine. */
export function latinLadder<Id extends string, P extends string, S extends CellMarks>(
  module: CompiledLadder<Id, P>,
  own: OwnRungs<Id, P, S>,
): Ladder<S> {
  return describedLadder(module, own, LATIN_LIBRARY);
}

/** A fish as a set confined across lines, in the view its `says` names: the
 * columns, whose elements follow the `o` rows in a Latin space, or the rows,
 * a set of indices. */
function fishReason({ arm, terms }: compiled.FishSays, o: number): LatinReason {
  const lines =
    arm === "cols"
      ? confinedLines(
          "col",
          terms.lines.map((L) => L - o),
          o,
        )
      : confinedLines("row", valuesOf(terms.lines), o);
  return { kind: "set", cells: terms.places.map(cellAt(o)), lines };
}

/** How `latinSolver` runs: its rungs, the game's answer check, and the
 * hint-path hooks. */
export interface LatinSolverConfig {
  ladder: Ladder<LatinSolver>;
  /** Declare the last symbol as repeating `times` per line (a pseudo-Latin
   * puzzle). Leave unset or `null` for a Latin square; see {@link LatinRepeats}. */
  repeats?: LatinRepeats | null;
  maxdiff: number;
  /** The searching level: forcing chains, then guess-and-verify recursion. */
  diffRecursive: number;
  /** Whether a whole grid is an answer to the board: the game's compiled
   * `isAnswer` over what it deals. A solve that fills the grid with one that
   * is not is impossible. */
  isAnswer: (grid: Uint8Array) => boolean;
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

/** The forcing chain's id among a ladder's techniques. */
const FORCING = "forcing-chain";

/**
 * The game's ladder at `cfg.maxdiff`, then at the searching level the forcing
 * chain. Every Latin game lists its techniques in tier order, so they run as
 * a ladder grouped by tier would; the forcing chain is a supposition, so it
 * shares the level of the other search, the recursion, and comes after every
 * technique.
 */
function latinTechniques(
  solver: LatinSolver,
  cfg: LatinSolverConfig,
  grades: Record<string, number>,
): CompiledTechniques {
  const techniques = ladderTechniques(
    solver,
    cfg.ladder.entries,
    { [TIERS]: cfg.maxdiff },
    grades,
  );
  if (cfg.maxdiff < cfg.diffRecursive) return techniques;
  return withSearch(techniques, {
    id: FORCING,
    tier: cfg.diffRecursive,
    run: () => {
      const ret = solver.forcing();
      if (ret > 0) grades[TIERS] = Math.max(grades[TIERS], cfg.diffRecursive);
      return ret;
    },
  });
}

function latinSolverTop(solver: LatinSolver, cfg: LatinSolverConfig): number {
  const { maxdiff, diffRecursive } = cfg;
  const grades = { [TIERS]: 0 };
  const impossible = runLadder(solver, latinTechniques(solver, cfg, grades));
  if (impossible) return finish(solver, cfg, DIFF_IMPOSSIBLE);
  let diff = grades[TIERS];

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

function finish(solver: LatinSolver, cfg: LatinSolverConfig, diff: number): number {
  if (
    diff !== DIFF_IMPOSSIBLE &&
    diff !== DIFF_UNFINISHED &&
    diff !== DIFF_AMBIGUOUS &&
    !cfg.isAnswer(solver.grid)
  ) {
    return DIFF_IMPOSSIBLE;
  }
  return diff;
}

function latinSolverRecurse(solver: LatinSolver, cfg: LatinSolverConfig): number {
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

    const sub = new LatinSolver(o, cfg.repeats, cfg.ladder.placing);
    const ret = sub.alloc(outgrid)
      ? latinSolverTop(sub, { ...cfg, maxdiff: cfg.diffRecursive })
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
export function latinSolver(
  grid: Uint8Array,
  o: number,
  cfg: LatinSolverConfig,
): number {
  const solver = new LatinSolver(o, cfg.repeats, cfg.ladder.placing);
  if (!solver.alloc(grid)) {
    if (cfg.cubeOut) solver.writeCube(cfg.cubeOut);
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
  if (cfg.cubeOut) solver.writeCube(cfg.cubeOut);
  return ret;
}

/**
 * The premise audit's replay of a recording run (`ladderReplay`), installed on
 * the solver the recording uses before it runs.
 */
function latinReplay(
  solver: LatinSolver,
  cfg: LatinSolverConfig,
): FiringReplay<string> {
  const { o } = solver;
  return ladderReplay(
    solver,
    (values) => {
      const run = new LatinSolver(o, cfg.repeats, cfg.ladder.placing);
      if (!run.alloc(Uint8Array.from(values)))
        throw new Error("latin replay: the edited state is inconsistent");
      return run;
    },
    (run) => latinTechniques(run, cfg, { [TIERS]: 0 }),
  );
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
