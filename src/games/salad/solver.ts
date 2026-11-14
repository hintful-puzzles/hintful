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

import { latinSpace } from "../../engine/describe-runtime.ts";
import { type EntryBoard, entryMistake } from "../../engine/entry-mistakes.ts";
import { compiledRung, type Ladder } from "../../engine/ladder-runtime.ts";
import {
  DIFF_IMPOSSIBLE,
  type LatinRepeats,
  LatinSolver,
  type LatinSolverConfig,
  latinLadder,
  latinSolver,
  latinVerdict,
} from "../../engine/latin.ts";
import * as salad from "./salad.compiled.ts";
import {
  CIRCLE,
  CROSS,
  DIFF_HARD,
  DIFF_HOLESONLY,
  dealtOf,
  type SaladBoard,
  type SaladState,
  saladNotes,
  scratchBoard,
} from "./state.ts";

// --- the hole as a cube symbol ---------------------------------------------

/** The cube's symbol for an empty square: one past the last real symbol. This
 * is also the value a solved working `grid` holds in an empty square, which is
 * why every reader of a solved grid tests `<= nums`. */
export function holeSymbol(nums: number): number {
  return nums + 1;
}

/** How the cube is told about the empty squares. With exactly one empty square
 * per line (`nums = order − 1`) the hole is an ordinary once-per-line symbol
 * and needs no declaration. */
export function repeatsFor(b: { order: number; nums: number }): LatinRepeats | null {
  const times = b.order - b.nums;
  return times >= 2 ? { times } : null;
}

/** A cross: the square is empty, so the hole symbol goes here. A cross where
 * the cube has already ruled the hole out is a contradiction; emptying the cell
 * of every candidate is how the cube is told, and the single reports it. */
function placeCross(solver: LatinSolver, b: SaladBoard, x: number, y: number): void {
  const hole = holeSymbol(b.nums);
  const c = y * b.order + x;
  if (solver.grid[c] !== 0) return;
  if (solver.has(c, hole)) solver.place(c, hole);
  else solver.cands[c] = 0;
}

/** A ball: the square holds *some* symbol, so it is not the hole. */
function placeCircle(solver: LatinSolver, b: SaladBoard, x: number, y: number): void {
  solver.strikeAt(y * b.order + x, holeSymbol(b.nums));
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

/** The ladder over the dealt board: the ABC End View border deduction, then
 * the library's. No technique reads the balls, since a ball is seeded as a
 * strike. */
export function saladLadder(cl: salad.Dealt): Ladder<LatinSolver> {
  return latinLadder(salad, { border: compiledRung(salad.border, cl) });
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
    else if (clue && solver.grid[i] === 0) solver.place(i, clue);
  }
}

/** The shared config for a solve at `maxdiff` over `b`, seeded by `seed`. */
function configFor(
  b: SaladBoard,
  maxdiff: number,
  seed: (solver: LatinSolver) => void,
  cubeOut: Uint8Array,
): LatinSolverConfig {
  const cl = dealtOf(b);
  return {
    repeats: repeatsFor(b),
    maxdiff,
    ladder: saladLadder(cl),
    // Never search, by forcing chain or recursion: both tiers are pure
    // deduction (the guess-free policy).
    diffRecursive: DIFF_IMPOSSIBLE,
    // The working grid holds the empty square as the hole symbol, as the
    // description reads it.
    isAnswer: (grid) => salad.isAnswer(grid, latinSpace(b.order), cl),
    seed,
    cubeOut,
  };
}

/** The final candidate cube's size for `b` — `order² × symbols`. */
function cubeSize(b: SaladBoard): number {
  return b.order * b.order * holeSymbol(b.nums);
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
  const ret = latinSolver(
    b.grid,
    o,
    configFor(b, maxdiff, (solver) => seedGridClues(solver, b), cube),
  );
  markersFromCube(b, b.grid, cube);

  // Whether the board came out complete and an answer, which the solver's
  // verdict says once its answer check has run: with recursion disabled, that
  // is "pure deduction finished it", hence unique.
  return latinVerdict(ret) === "solved";
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
