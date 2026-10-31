/**
 * Salad's solver — a consumer of the shared Latin framework
 * ([`engine/latin.ts`](../../engine/latin.ts)), per
 * docs/solver-and-generator.md § "The Latin family".
 *
 * **The empty square is a symbol of the cube.** Salad wants "each of `nums`
 * symbols once per line, the other `order − nums` squares empty" — a
 * *pseudo*-Latin square. The cube expresses that directly: its last symbol,
 * {@link holeSymbol} (`nums + 1`), repeats `order − nums` times per line
 * (`LatinRepeats`, and `answer.value.repeat` in the description), so every
 * library technique reasons about "the empty square" as a value with a
 * multiplicity — placed when exactly that many cells of a line can still be
 * empty, struck from a line once it holds all its empties, counted by its
 * copies in a set, never weighed by a wing or linked by a forcing chain.
 * Upstream instead fakes the rule with a *full* order-`o` square whose symbols
 * above `nums` are reinterpreted as holes, and translates between the two
 * views by hand (`latinholes_solver_sync`, `_count`, `_place_cross`,
 * `_place_circle`); the cube makes that layer unnecessary.
 *
 * The player's two markers map onto the cube in one line each: a **cross**
 * (known empty) is the hole symbol *placed*; a **ball** (known to hold a symbol,
 * which one unknown) is the hole symbol *struck*. The `holes` array on a board
 * is the player-facing record of those two facts and is read back off the cube
 * after a solve ({@link markersFromCube}).
 *
 * The ladder is `salad.description.yaml`'s, compiled: its own technique is
 * the ABC End View border deduction, and the rest is the library's. Two
 * difficulties, both **guess-free**: `diffRecursive = DIFF_IMPOSSIBLE`, so
 * the cube never recurses or follows a forcing chain at either tier.
 */

import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { clueList } from "../../engine/describe-runtime.ts";
import { type EntryBoard, entryMistake } from "../../engine/entry-mistakes.ts";
import {
  compiledRung,
  DIFF_IMPOSSIBLE,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinRepeats,
  type LatinRung,
  LatinSolver,
  type LatinSolverConfig,
  latinSolver,
} from "../../engine/latin.ts";
import * as salad from "./salad.compiled.ts";
import {
  CIRCLE,
  CROSS,
  DIFF_HARD,
  DIFF_HOLESONLY,
  latinholesCheck,
  type SaladBoard,
  type SaladState,
  saladNotes,
  scratchBoard,
} from "./state.ts";

// --- the hole as a cube symbol ---------------------------------------------

/** The cube's symbol for an empty square: one past the last real symbol. This
 * is also the value a solved working `grid` holds in an empty square, which is
 * why every reader of a solved grid tests `<= nums`. */
function holeSymbol(nums: number): number {
  return nums + 1;
}

/** How the cube is told about the empty squares. With exactly one empty square
 * per line (`nums = order − 1`) the hole is an ordinary once-per-line symbol
 * and needs no declaration. */
function repeatsFor(b: SaladBoard): LatinRepeats | null {
  const times = b.order - b.nums;
  return times >= 2 ? { times } : null;
}

/** A cross: the square is empty, so the hole symbol goes here. A cross where
 * the cube has already ruled the hole out is a contradiction; emptying the cell
 * of every candidate is how the cube is told, and the single reports it. */
function placeCross(solver: LatinSolver, b: SaladBoard, x: number, y: number): void {
  const hole = holeSymbol(b.nums);
  if (solver.grid[y * b.order + x] !== 0) return;
  if (solver.cubeGet(x, y, hole)) solver.place(x, y, hole);
  else
    for (let n = 1; n <= solver.symbols; n++) solver.cube[solver.cubepos(x, y, n)] = 0;
}

/** A ball: the square holds *some* symbol, so it is not the hole. */
function placeCircle(solver: LatinSolver, b: SaladBoard, x: number, y: number): void {
  solver.cube[solver.cubepos(x, y, holeSymbol(b.nums))] = 0;
}

/** Read the two markers back off a finished cube into `holes`: a placed hole is
 * a cross, a struck hole a ball. `cube` is the solver's final candidate cube
 * (`cubeOut`), laid out with `symbols` values per cell. */
function markersFromCube(b: SaladBoard, grid: Uint8Array, cube: Uint8Array): void {
  const o = b.order;
  const hole = holeSymbol(b.nums);
  const symbols = hole;
  for (let i = 0; i < o * o; i++) {
    const x = i % o;
    const y = (i / o) | 0;
    if (grid[i] === hole) b.holes[i] = CROSS;
    else if (!cube[(x * o + y) * symbols + hole - 1]) b.holes[i] = CIRCLE;
  }
}

// --- the ABC End View border deduction -------------------------------------

/**
 * Why a border-clue elimination is forced — the premise Salad's hint narrates,
 * built from the compiled `border` technique's binding.
 */
export type BorderReason =
  /** Near the clue: the first square that could hold a symbol must hold the
   * clue's, so every *other* symbol is ruled out of it. `skipped` counts the
   * already-known-empty squares between the clue and this one. */
  | { kind: "borderNear"; clue: number; clueVal: number; skipped: number }
  /** Past the clue's reach: the clue's own symbol cannot sit this far in.
   * `reach` is how many squares from the clue it may still sit (0-based), which
   * starts at `order − nums` (the line's whole hole budget), is reduced by the
   * `tightenedBy` empty squares already marked beyond it, and is cut off
   * outright at `circleAt` if a square in between is known to hold a symbol. */
  | {
      kind: "borderFar";
      clue: number;
      clueVal: number;
      reach: number;
      holes: number;
      tightenedBy: number;
      circleAt: number | null;
    };

/** A border slot as the space numbers it (above each column, below each,
 * left of each row, right of each), as Salad's clue array numbers it (top,
 * left, bottom, right). */
function clueOfSlot(slot: number, o: number): number {
  const side = (slot / o) | 0;
  return [0, 2, 1, 3][side] * o + (slot % o);
}

/** A border strike's reason: the clue's own letter struck past its reach,
 * any other letter near the clue. A square known to hold a letter cut the
 * reach where it comes no later than the empties' reach does. */
function borderReason(
  { k, L, H, reach, stop }: salad.BorderBinding,
  cell: number,
  n: number,
  cl: salad.Dealt,
  o: number,
): BorderReason {
  const clue = clueOfSlot(cl.border.at[k], o);
  const clueVal = cl.border.v[k];
  if (n !== clueVal)
    return { kind: "borderNear", clue, clueVal, skipped: L.indexOf(cell) };
  return {
    kind: "borderFar",
    clue,
    clueVal,
    reach,
    holes: H,
    tightenedBy: H - reach,
    circleAt: stop >= 0 && stop <= reach ? L[stop] : null,
  };
}

const SALAD_LADDER: Record<salad.LadderId, (cl: salad.Dealt) => LatinRung> = {
  border: (cl) =>
    compiledRung(salad.border, cl, (binding, cell, n, solver) =>
      borderReason(binding, cell, n, cl, solver.o),
    ),
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

/** The board as its description deals it: the border letters in the order
 * the scan meets them, each line's top, left, bottom and right in turn; the
 * balls, which no technique reads, since a ball is seeded as a strike. */
function describedLadder(b: SaladBoard): LatinLadder {
  const o = b.order;
  const at: number[] = [];
  const v: number[] = [];
  const slots = [0, 2, 1, 3];
  for (let i = 0; i < o; i++)
    for (let side = 0; side < 4; side++) {
      const clue = b.borderclues[side * o + i];
      if (!clue) continue;
      at.push(slots[side] * o + i);
      v.push(clue);
    }
  const balls: number[] = [];
  for (let c = 0; c < o * o; c++) if (b.gridclues[c] === CIRCLE) balls.push(c);
  const cl: salad.Dealt = {
    border: clueList(at, v, 4 * o),
    ball: clueList(
      balls,
      balls.map(() => holeSymbol(b.nums)),
      o * o,
    ),
    nums: b.nums,
  };
  return {
    ladder: salad.ladder.map(({ id, tier }) => ({ tier, run: SALAD_LADDER[id](cl) })),
  };
}

// --- the driver ------------------------------------------------------------

/** Seed the cube with the fixed grid clues — a symbol placement, or the
 * ball/cross constraints, which place no *real* symbol and so cannot travel
 * through the seeded grid. */
function seedGridClues(solver: LatinSolver, b: SaladBoard): void {
  const o = b.order;
  for (let i = 0; i < o * o; i++) {
    const clue = b.gridclues[i];
    const x = i % o;
    const y = (i / o) | 0;
    if (clue === CROSS) placeCross(solver, b, x, y);
    else if (clue === CIRCLE) placeCircle(solver, b, x, y);
    else if (clue && solver.grid[i] === 0) solver.place(x, y, clue);
  }
}

/** Seed the cube from a board's *confirmed markers* — the hint path's analog
 * of {@link seedGridClues}. A cross or ball is a real entry (Check & Save flags a
 * wrong one), so it is a fact the working cube may assume; the player's *pencil
 * notes* never are (docs/hints-candidates.md § "The recorder and the soundness
 * boundary"). Symbols need no seeding here because they sit in `b.grid`, which
 * `LatinSolver.alloc` places. */
function seedMarkers(solver: LatinSolver, b: SaladBoard): void {
  const o = b.order;
  for (let i = 0; i < o * o; i++) {
    const x = i % o;
    const y = (i / o) | 0;
    if (b.holes[i] === CROSS) placeCross(solver, b, x, y);
    else if (b.holes[i] === CIRCLE) placeCircle(solver, b, x, y);
  }
}

/** The shared config for a solve at `maxdiff` over `b`, seeded by `seed`. */
function configFor(
  b: SaladBoard,
  maxdiff: number,
  seed: (solver: LatinSolver) => void,
  cubeOut: Uint8Array,
): LatinSolverConfig<SaladBoard> {
  return {
    repeats: repeatsFor(b),
    maxdiff,
    ...describedLadder(b),
    // Never search, by forcing chain or recursion: both tiers are pure
    // deduction (the guess-free policy).
    diffRecursive: DIFF_IMPOSSIBLE,
    // Salad has no whole-grid post-check beyond `latinholesCheck`.
    valid: () => true,
    ctx: b,
    seed,
    cubeOut,
  };
}

/** The final candidate cube's size for `b` — `order² × symbols`. */
function cubeSize(b: SaladBoard): number {
  return b.order * b.order * holeSymbol(b.nums);
}

/** What one recording run of the solver saw, from the player's board forward. */
export interface SaladDeductions {
  /** Every candidate cleared / cell placed, in solver order, each carrying the
   * reason that forced it. Values run over `1..nums + 1`: an op with
   * `n === nums + 1` concerns the empty-square symbol, whose player-visible
   * note is the X mark (see `hint.ts` for which of those the plan teaches). */
  ops: DeductionRecord[];
  /** The marker array at the deduction fixpoint: which squares are forced empty
   * ({@link CROSS}) or forced to hold a symbol ({@link CIRCLE}), read back off
   * the cube. */
  holes: Uint8Array;
  /** The grid at the fixpoint, holes as {@link holeSymbol}. */
  grid: Uint8Array;
}

/**
 * Run the solver over a copy of `b` at `maxdiff` with recording on, and report
 * everything it deduced (hint path only). Deductive only — both of Salad's tiers
 * pass `diffRecursive = DIFF_IMPOSSIBLE`, so there is nothing to cap.
 */
export function recordSaladDeductions(b: SaladBoard, maxdiff: number): SaladDeductions {
  const o = b.order;
  const grid = b.grid.slice();
  const holes = b.holes.slice();
  const work: SaladBoard = { ...b, grid, holes };
  const ops: DeductionRecord[] = [];
  const cube = new Uint8Array(cubeSize(b));

  latinSolver(grid, o, {
    ...configFor(work, maxdiff, (solver) => seedMarkers(solver, work), cube),
    recorder: (rec) => ops.push(rec),
    budgetLabel: "salad hint",
  });
  markersFromCube(work, grid, cube);

  return { ops, holes, grid };
}

/**
 * Upstream `salad_solve`: solve `b` in place at difficulty `maxdiff` and report
 * whether the result is a *complete, valid* board. `b.grid` and `b.holes` are
 * written; the caller supplies them blank (the generator) or seeded with the
 * clues (play).
 *
 * `DIFF_HOLESONLY` is the Number Ball generator's quality gate rather than a
 * playable tier: reason about the empty squares alone — where the hole symbol
 * must go and where it cannot — and report whether *every* hole fell out with
 * no number entered. A board that passes never made the player think about a
 * number's position, which is the concept the mode exists for.
 */
export function saladSolve(b: SaladBoard, maxdiff: number): boolean {
  const o = b.order;
  const o2 = o * o;
  const hole = holeSymbol(b.nums);

  if (maxdiff === DIFF_HOLESONLY) {
    const solver = new LatinSolver(o, repeatsFor(b));
    solver.alloc(b.grid);
    seedGridClues(solver, b);
    holesOnlyFixpoint(solver, hole);
    let holes = 0;
    for (let i = 0; i < o2; i++) if (b.grid[i] === hole) holes++;
    return holes === (o - b.nums) * o;
  }

  const cube = new Uint8Array(cubeSize(b));
  latinSolver(
    b.grid,
    o,
    configFor(b, maxdiff, (solver) => seedGridClues(solver, b), cube),
  );
  markersFromCube(b, b.grid, cube);

  // Upstream discards the difficulty `latin_solver_main` reports and asks only
  // whether the board came out complete and legal — which, with recursion
  // disabled, is exactly "pure deduction finished it", hence unique.
  return latinholesCheck(b);
}

/**
 * The hole-only deductions to a fixpoint, each pass the rows, then the
 * columns, then the squares: a line with exactly as many places left for the
 * empty square as it has empties holds one in each (and placing the last
 * strikes the line), and a square that can hold nothing *but* the hole is
 * empty. Never places a real symbol — that is the whole point of the gate.
 */
function holesOnlyFixpoint(solver: LatinSolver, hole: number): void {
  const { sp } = solver;
  for (;;) {
    let changed = false;
    for (const line of sp.lines) {
      const places = sp.lineCells[line].filter((c) => solver.has(c, hole));
      if (places.length !== solver.times) continue;
      for (const c of places)
        if (!solver.known(c)) {
          solver.placeAt(c, hole);
          changed = true;
        }
    }
    for (const c of sp.cells)
      if (!solver.known(c) && solver.cand(c) === 1 << hole) {
        solver.placeAt(c, hole);
        changed = true;
      }
    if (!changed) return;
  }
}

// --- Check & Save ----------------------------------------------------------

/** A player marking that contradicts the unique solution. All four render as
 * the same red overlay; the kinds exist so tests (and any future hint) can say
 * *what* is wrong. */
export interface SaladMistake {
  kind: "cell" | "cross" | "circle" | "note";
  x: number;
  y: number;
}

/**
 * The solved board as one entry per cell (a symbol `1..nums`, or 0 for a hole)
 * — what `Game.solve` turns into a `solve` move. `null` when no solution is
 * deducible.
 *
 * Solved at the top tier: Salad's Normal rung only *adds* sound generic
 * techniques to Easy's, so an Easy board still solves here (pinned by the
 * "generate low, solve high" check, docs/solver-and-generator.md
 * § "Solver-gated generation").
 */
export function saladSolution(s: SaladState): number[] | null {
  const board = scratchBoard(s);
  if (!saladSolve(board, DIFF_HARD)) return null;
  const cells: number[] = [];
  for (let i = 0; i < s.order * s.order; i++) {
    cells.push(board.grid[i] <= s.nums ? board.grid[i] : 0);
  }
  return cells;
}

/**
 * Re-solve from the fixed clues alone and flag every player marking the unique
 * solution contradicts (docs/solver-and-generator.md § "The solvable-game
 * contract"): a wrong symbol, a cross on a square that holds one, a circle on a
 * square that must stay empty, and — notes being first-class markings — an
 * empty square whose non-empty notes have crossed out its solution value.
 * Returns `[]` when the board is not uniquely deducible, so Check & Save neither
 * blesses nor blocks what it cannot judge.
 */
export function findMistakes(s: SaladState): SaladMistake[] {
  const o = s.order;
  const nums = s.nums;
  const sol = saladSolution(s);
  if (!sol) return [];

  // The "might be empty" mark is the note value just past the symbols, so a
  // hole's answer reads as that value — which no placed symbol can equal.
  const board: EntryBoard = {
    answer: sol.map((v) => (v === 0 ? nums + 1 : v)),
    entry: s.grid,
    notes: s.pencil,
    enc: saladNotes(nums),
  };
  const out: SaladMistake[] = [];
  for (let i = 0; i < o * o; i++) {
    const clue = s.gridclues[i];
    // A fixed symbol or cross is by definition correct; a fixed *circle* still
    // leaves the square's symbol up to the player.
    if (clue && clue !== CIRCLE) continue;

    const x = i % o;
    const y = (i / o) | 0;
    if (s.grid[i] === 0) {
      if (s.holes[i] === CROSS) {
        if (sol[i] !== 0) out.push({ kind: "cross", x, y });
        continue;
      }
      if (s.holes[i] === CIRCLE && sol[i] === 0) {
        out.push({ kind: "circle", x, y });
        continue;
      }
    }
    const kind = entryMistake(board, i);
    if (kind) out.push({ kind, x, y });
  }
  return out;
}
