/**
 * The Crossing deductive solver — `crossing_solve_game` and its two techniques
 * from `unreleased/crossing.c`.
 *
 * The solver keeps a per-cell candidate bitmask (bit `n-1` = digit `n`) and runs
 * two deductions to a fixpoint:
 *
 * 1. **positional narrowing** (`crossing_solver_marks`) — for each run, take
 *    every not-yet-placed number of the run's length that still fits the current
 *    candidates, union each of its digits into a per-position accumulator, then
 *    intersect each open cell's candidates with that accumulator. A cell can
 *    only hold a digit that *some* still-fitting number puts there.
 * 2. **naked single** (`crossing_solver_confirm`) — a cell whose candidates
 *    collapse to one digit is placed.
 *
 * Upstream has exactly this one technique tier (`// TODO harder techniques?`)
 * and no difficulty parameter, so there is no grading. Since the generator
 * accepts a board only when this solver reaches `"valid"`, the solver's exact
 * strength is baked into which puzzles exist — the byte-match differential
 * covers it end to end.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import {
  type CrossingPuzzle,
  type CrossingState,
  type SolveStatus,
  validateBoard,
} from "./state.ts";

/** Candidate bit for digit `n` (1–9) — upstream `NUM_BIT`. */
const bit = (n: number): number => 1 << (n - 1);
/** Every digit `1`–`9` is a candidate (upstream `0x1ff`). */
const ALL_DIGITS = 0x1ff;

export interface CrossingSolveResult {
  status: SolveStatus;
  /** The grid the solver reached — complete iff `status === "valid"`. */
  grid: Uint8Array;
}

/**
 * Positional narrowing. Returns the number of cells whose candidate set the
 * pass touched.
 *
 * The termination argument is worth stating, because upstream's counter looks
 * like it could spin: a cell is counted whenever `cand !== acc`, not only when
 * the intersection actually removes something. But a number contributes to
 * `acc[k]` only if *every* one of its digits is still a candidate in its cell,
 * so `acc[k] ⊆ cand[cell]` always holds — a difference therefore means a strict
 * subset, and the intersection strictly shrinks. The fixpoint is monotone.
 */
function solverMarks(
  puzzle: CrossingPuzzle,
  grid: Uint8Array,
  cand: Int32Array,
  done: Int32Array,
): number {
  const { numbers, runs } = puzzle;
  let changed = 0;

  for (const run of runs) {
    const cells = run.cells;
    const acc = new Int32Array(cells.length);

    for (let l = 0; l < numbers.length; l++) {
      if (done[l]) continue; // this number is already placed somewhere
      const num = numbers[l];
      if (num.length !== cells.length) continue;

      let fits = true;
      for (let k = 0; k < cells.length; k++) {
        if (!(cand[cells[k]] & bit(num[k]))) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      for (let k = 0; k < cells.length; k++) acc[k] |= bit(num[k]);
    }

    for (let k = 0; k < cells.length; k++) {
      const i = cells[k];
      if (!grid[i] && cand[i] !== acc[k]) {
        changed++;
        cand[i] &= acc[k];
      }
    }
  }

  return changed;
}

/** Naked singles. Upstream scans `j` from 0, where `NUM_BIT(0)` is a shift by
 * −1 that no live mask can equal; the loop starts at 1 here, which is the same
 * set of placements. */
function solverConfirm(grid: Uint8Array, cand: Int32Array): number {
  let changed = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i]) continue;
    for (let n = 1; n <= 9; n++) {
      if (cand[i] === bit(n)) {
        changed++;
        grid[i] = n;
      }
    }
  }
  return changed;
}

/** The solver's working board: the digits placed, and each cell's candidates.
 * A placed cell's candidates are its digit alone, which is how
 * {@link solverMarks} reads what a run already holds. */
interface SolverBoard {
  grid: Uint8Array;
  cand: Int32Array;
}

/** A blank board, every digit open in every open cell. */
function newSolverBoard(puzzle: CrossingPuzzle): SolverBoard {
  const { w, h, walls } = puzzle;
  const cand = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) cand[i] = walls[i] ? 0 : ALL_DIGITS;
  return { grid: new Uint8Array(w * h), cand };
}

/**
 * Run the two deductions on `b` to a fixpoint and say where that leaves it.
 * `"solved"` is every run full and every number used exactly once.
 *
 * An empty cell with no candidate left is a contradiction, and is said here:
 * narrowing empties the cells of a run no number fits and then finds nothing
 * more to do, which would otherwise read as merely stuck. Upstream's solver
 * has no such verdict, since no board it is asked about has one. The search
 * would get by without it, as such a cell is the one {@link assumeDigits}
 * takes and it divides into nothing; the verdict is what lets the solver say
 * so of a board on its own.
 */
function settle(puzzle: CrossingPuzzle, b: SolverBoard): Deduced {
  const { grid, cand } = b;
  for (;;) {
    const { status, done } = validateBoard(puzzle, grid);
    if (status === "valid") return "solved";
    if (status === "invalid") return "contradiction";
    const narrowed = solverMarks(puzzle, grid, cand, done);
    // A wall's mask is zero as well, and a wall is not a cell left without.
    for (let i = 0; i < grid.length; i++)
      if (!grid[i] && !cand[i] && !puzzle.walls[i]) return "contradiction";
    // Stuck: no harder techniques exist upstream.
    if (narrowed + solverConfirm(grid, cand) === 0) return "stuck";
  }
}

const STATUS: Record<Deduced, SolveStatus> = {
  solved: "valid",
  stuck: "progress",
  contradiction: "invalid",
};

/**
 * Run the solver from an empty grid. `"valid"` means the puzzle was solved
 * outright — every run full and every number used exactly once — which is what
 * the generator gates an Easy board on.
 */
export function solveCrossing(puzzle: CrossingPuzzle): CrossingSolveResult {
  const board = newSolverBoard(puzzle);
  return { status: STATUS[settle(puzzle, board)], grid: board.grid };
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a puzzle's answers; the one answer is its
 * grid, `0` in a wall. */
export type CrossingAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a digit assumed
 * in a cell and the two deductions run from it.
 *
 * It decides which Unreasonable boards exist: a puzzle that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. Measured 2026-10-10 over sixty
 * dealt boards at each of twelve sizes from 4×2 to 13×13: a median of 3 to 5,
 * which is one square of two digits tried each way, and 129 for the hardest.
 * A board that runs it out is not one that needed more: none of the eight
 * that did, tried again with 20,000, had one answer.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a puzzle's answers up to two, by trial and error over the solver:
 * where it stops, take the empty cell with the fewest digits left and assume
 * each in turn.
 */
export function searchAnswers(
  puzzle: CrossingPuzzle,
  budget: number = SEARCH_BUDGET,
): CrossingAnswer {
  return searchBoard<SolverBoard, Uint8Array>({
    start: newSolverBoard(puzzle),
    deduce: (b) => settle(puzzle, b),
    assume: (b) => assumeDigits(puzzle, b),
    solution: (b) => b.grid,
    budget,
  });
}

/** The digits `mask` holds, lowest first. */
function digitsOf(mask: number): number[] {
  const digits: number[] = [];
  for (let n = 1; n <= 9; n++) if (mask & bit(n)) digits.push(n);
  return digits;
}

/**
 * The boards a stuck one divides into: its empty cell with the fewest
 * candidates, the first such in reading order, holding each of them. Only a
 * cell some run passes through is taken, since no number reaches any other and
 * a stuck board has an empty cell in a run.
 */
function assumeDigits(puzzle: CrossingPuzzle, b: SolverBoard): SolverBoard[] {
  const { grid, cand } = b;
  let fewest: number[] | null = null;
  let at = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] || (puzzle.acrossRun[i] < 0 && puzzle.downRun[i] < 0)) continue;
    const digits = digitsOf(cand[i]);
    if (fewest === null || digits.length < fewest.length) {
      fewest = digits;
      at = i;
    }
  }
  return (fewest ?? []).map((digit) => {
    const next = { grid: grid.slice(), cand: cand.slice() };
    next.grid[at] = digit;
    next.cand[at] = bit(digit);
    return next;
  });
}

/** Keyed on a state's puzzle, which every state of a game shares. */
const answers = answerCache<CrossingPuzzle, Uint8Array>();

/** What a search of a state's puzzle established about its answers. The
 * player's digits and notes are not read. */
export function answerOf(state: { puzzle: CrossingPuzzle }): CrossingAnswer {
  return answers(state.puzzle, () => searchAnswers(state.puzzle));
}

// --- mistake checking (fork addition) --------------------------------------

/** A player marking that contradicts the puzzle's unique solution. */
export interface CrossingMistake {
  x: number;
  y: number;
  /** `"cell"` — the entered digit is wrong; `"note"` — the cell's pencil notes
   * have ruled out the digit that belongs there. */
  kind: "cell" | "note";
}

/**
 * Check & Save's mistake check (docs/games/solver-and-generator.md § "The solvable-game contract"): take the puzzle's one answer from
 * the search over its walls and numbers, then flag every player marking it
 * contradicts — a wrong entered digit, and (per the cross-game
 * notes-are-first-class convention, docs/games/mechanics.md § "Pencil marks: the full note-taking UX") an empty cell whose
 * *non-empty* notes exclude the solution's digit. Notes carrying merely extra
 * candidates are ordinary mid-solve state and are not flagged.
 *
 * Returns `[]` when the search did not prove the puzzle has one answer, so the
 * check never judges a position it cannot prove.
 */
export function findMistakes(state: CrossingState): CrossingMistake[] {
  const { w, walls } = state.puzzle;
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];

  return entryMistakes(
    {
      answer: answer.solution,
      entry: state.grid,
      notes: state.pencil,
      enc: { bit },
      fixed: (i) => walls[i] !== 0,
    },
    gridCell(w),
  );
}
