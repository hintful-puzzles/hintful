/**
 * The ABCD deductive solver — idiomatic port of `abcd_solve_game` (`abcd.c`).
 *
 * A fixpoint of three deduction techniques over a working grid, a per-cell
 * candidate cube and a `remaining[]` count per (row/column, letter):
 *
 *  1. **Satisfied clue** — when a line already holds its full count of a letter
 *     (`remaining === 0`), rule that letter out of every cell in that line.
 *  2. **Single possibility** — a cell with exactly one surviving candidate is
 *     that letter; place it.
 *  3. **Runs** ({@link runsForce}) — within a line, partition the still-open
 *     cells where a letter is a candidate into maximal runs; a run of length L
 *     can hold at most `⌈L/2⌉` copies without two touching. When the summed
 *     maximum over a line equals the required count, every odd-length run is
 *     forced onto its even offsets.
 *
 * The three are a `runDeductionFixpoint` ladder. Upstream's loop reruns 1+2 in
 * one pass and tries 3 only when neither fired (`if (busy) continue;`), which
 * is the runner's restart-at-first-firing walk under another name: 1 retires
 * the lines it finds and places nothing, so running it again straight after
 * itself finds nothing. {@link solveBoardLegacy} keeps upstream's loop as the
 * oracle `abcd-ladder.test.ts` proves that on.
 *
 * This is arithmetic over the candidate cube, not a Latin square: the
 * constraint is a per-line count plus a no-touch rule, so `engine/latin.ts`
 * does not apply.
 *
 * Upstream has no diagonal-specific techniques (the runs technique ignores
 * diagonal adjacency). That weaker solver is the difficulty curve it shipped,
 * not a defect to fix, and it still generates valid diag puzzles because
 * {@link placeLetter} rules out diagonal neighbors.
 */

import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
} from "../../engine/deduction-fixpoint.ts";
import {
  type AbcdParams,
  cuboid,
  EMPTY,
  horClue,
  letterBit,
  NO_NUMBER,
  validatePuzzle,
  verClue,
} from "./state.ts";

/** One pencil-mark cleanup: strike candidate `letter` at `(x, y)`. */
export interface AbcdMark {
  x: number;
  y: number;
  letter: number;
}

/**
 * The *obvious* pencil-mark eliminations given the placed letters, for the
 * adaptive mark-all — ABCD's analog of the Latin family's row/column duplicate
 * strikes (docs/games/mechanics.md § "Pencil marks: the full note-taking UX").
 * A penciled candidate `c` in an empty cell is struck when either:
 *   - an orthogonal (or, under `diag`, diagonal) neighbor already holds `c`; or
 *   - `c`'s row or column already holds its full clue count of `c`.
 * Both are the solver's cheapest deductions (technique 1 and
 * {@link placeLetter}'s neighbor rule-outs), so a struck mark is never one a
 * legal solution could keep. Like `obviousCandidateMarks`, it never strikes a
 * cell's last remaining candidate.
 */
export function abcdObviousMarks(
  p: AbcdParams,
  grid: Int8Array,
  pencil: Int32Array,
  numbers: Int32Array,
): AbcdMark[] {
  const { w, h, n } = p;

  // Placed count per (row, letter) and (column, letter).
  const rowCount = new Int32Array(h * n);
  const colCount = new Int32Array(w * n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = grid[y * w + x] - 1;
      if (c >= 0) {
        rowCount[y * n + c]++;
        colCount[x * n + c]++;
      }
    }
  }

  const marks: AbcdMark[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (grid[i] !== EMPTY || pencil[i] === 0) continue;

      const noted: number[] = [];
      for (let c = 0; c < n; c++) if (pencil[i] & letterBit(c)) noted.push(c);

      const removable = noted.filter((c) => {
        if (neighbors(p, i).some((j) => grid[j] === c + 1)) return true;
        const rowClue = numbers[horClue(y, c, n)];
        const colClue = numbers[verClue(x, c, n, h)];
        return (
          (rowClue !== NO_NUMBER && rowCount[y * n + c] >= rowClue) ||
          (colClue !== NO_NUMBER && colCount[x * n + c] >= colClue)
        );
      });

      // Never empty a cell: if every note is removable, keep the lowest.
      if (removable.length === noted.length) removable.shift();
      for (const c of removable) marks.push({ x, y, letter: c });
    }
  }
  return marks;
}

/** The cells a letter at cell `i` keeps its twin out of: the four orthogonal
 * neighbors, and under `diag` the four diagonal ones too. */
export function neighbors(p: AbcdParams, i: number): number[] {
  const { w, h, diag } = p;
  const x = i % w;
  const y = (i / w) | 0;
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (dx !== 0 && dy !== 0 && !diag) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) out.push(ny * w + nx);
    }
  return out;
}

export type SolveStatus = "solved" | "ambiguous" | "contradiction";

export interface AbcdSolveResult {
  status: SolveStatus;
  /** The working grid at the end, letter `i` as `i + 1` (the unique solution
   * when `status` is `"solved"`; a partial/contradictory fill otherwise). */
  grid: Int8Array;
}

/**
 * Place `letter` at `(x, y)`: set the grid cell, rule the other letters out of
 * the cell and `letter` out of its orthogonal (and, under `diag`, diagonal)
 * neighbors, and, when `remaining` is supplied, decrement the letter's row and
 * column counts. The generator passes no `remaining`, using it only to keep a
 * partial fill no-touch-legal. Upstream's `abcd_place_letter`.
 */
export function placeLetter(
  p: AbcdParams,
  grid: Int8Array,
  cube: Uint8Array,
  x: number,
  y: number,
  letter: number,
  remaining?: Int32Array,
): void {
  const { w, h, n, diag } = p;
  grid[y * w + x] = letter + 1;

  // Rule out all other letters in this square.
  for (let i = 0; i < n; i++) {
    if (i !== letter) cube[cuboid(x, y, i, n, w)] = 0;
  }

  // Rule out this letter for adjacent squares.
  if (diag && x > 0 && y > 0) cube[cuboid(x - 1, y - 1, letter, n, w)] = 0;
  if (diag && x < w - 1 && y > 0) cube[cuboid(x + 1, y - 1, letter, n, w)] = 0;
  if (diag && x > 0 && y < h - 1) cube[cuboid(x - 1, y + 1, letter, n, w)] = 0;
  if (diag && x < w - 1 && y < h - 1) cube[cuboid(x + 1, y + 1, letter, n, w)] = 0;
  if (x > 0) cube[cuboid(x - 1, y, letter, n, w)] = 0;
  if (x < w - 1) cube[cuboid(x + 1, y, letter, n, w)] = 0;
  if (y > 0) cube[cuboid(x, y - 1, letter, n, w)] = 0;
  if (y < h - 1) cube[cuboid(x, y + 1, letter, n, w)] = 0;

  if (remaining) {
    const row = horClue(y, letter, n);
    const col = verClue(x, letter, n, h);
    if (remaining[row] !== NO_NUMBER) remaining[row]--;
    if (remaining[col] !== NO_NUMBER) remaining[col]--;
  }
}

/** A maximal stretch of a line's open positions: where it starts, and how
 * many positions long it is. */
export interface Run {
  start: number;
  length: number;
}

/**
 * The runs technique's arithmetic, for one line and one letter: the maximal
 * runs of `open` positions (where the letter may still go), and the positions
 * they force when the line needs `req` more copies. A run of length L holds at
 * most `⌈L/2⌉` copies without two touching, so when those maxima sum to `req`
 * every run must be full, and a full run of odd length has only one shape:
 * every other position, from its first. An even run can be full two ways, so it
 * forces nothing. `forced` is empty when the maxima exceed `req`.
 *
 * The solver and the hint both take the technique from here, so the sentence a
 * hint speaks about a line is the one the solver acted on.
 */
export function runsForce(
  open: readonly boolean[],
  req: number,
): { runs: Run[]; most: number; forced: number[] } {
  const runs: Run[] = [];
  for (let b = 0; b < open.length; b++) {
    if (!open[b]) continue;
    const last = runs[runs.length - 1];
    if (last && last.start + last.length === b) last.length++;
    else runs.push({ start: b, length: 1 });
  }
  let most = 0;
  for (const r of runs) most += (r.length + 1) >> 1;
  const forced: number[] = [];
  if (most === req)
    for (const r of runs)
      if (r.length & 1)
        for (let b = r.start; b < r.start + r.length; b += 2) forced.push(b);
  return { runs, most, forced };
}

/** The solver's working board: the grid, the candidate cube, and how many more
 * of each letter each line still needs (`NO_NUMBER` once retired). */
export interface SolverBoard {
  p: AbcdParams;
  grid: Int8Array;
  cube: Uint8Array;
  remaining: Int32Array;
  /** A cell was found with no candidate left. */
  contradiction: boolean;
}

/** A blank board over `numbers`, every candidate open. */
export function newSolverBoard(p: AbcdParams, numbers: Int32Array): SolverBoard {
  const a = p.w * p.h;
  return {
    p,
    grid: new Int8Array(a),
    cube: new Uint8Array(a * p.n).fill(1),
    remaining: Int32Array.from(numbers),
    contradiction: false,
  };
}

/** Technique 1: retire every line already holding its full count of a letter,
 * ruling the letter out of the whole line. Returns the lines retired. */
function solverSatisfied(b: SolverBoard): number {
  const { p, cube, remaining } = b;
  const { w, h, n } = p;
  let fired = 0;
  for (let c = 0; c < n; c++) {
    for (let y = 0; y < h; y++) {
      if (remaining[horClue(y, c, n)] === 0) {
        fired++;
        remaining[horClue(y, c, n)] = NO_NUMBER;
        for (let x = 0; x < w; x++) cube[cuboid(x, y, c, n, w)] = 0;
      }
    }
    for (let x = 0; x < w; x++) {
      if (remaining[verClue(x, c, n, h)] === 0) {
        fired++;
        remaining[verClue(x, c, n, h)] = NO_NUMBER;
        for (let y = 0; y < h; y++) cube[cuboid(x, y, c, n, w)] = 0;
      }
    }
  }
  return fired;
}

/** Technique 2: place every cell down to one candidate, returning how many. A
 * cell with none sets `contradiction` and the sweep carries on, as upstream's
 * does. */
function solverSingles(b: SolverBoard): number {
  const { p, grid, cube, remaining } = b;
  const { w, h, n } = p;
  let placed = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y * w + x] !== EMPTY) continue;
      let only = -1;
      let multiple = false;
      for (let c = 0; c < n; c++) {
        if (cube[cuboid(x, y, c, n, w)]) {
          if (only === -1) only = c;
          else multiple = true;
        }
      }
      if (only === -1) {
        b.contradiction = true; // a cell with no candidate
      } else if (!multiple) {
        placed++;
        placeLetter(p, grid, cube, x, y, only, remaining);
      }
    }
  }
  return placed;
}

/** Technique 3 (`abcd_solver_runs`), one letter `c` across every row
 * (`horizontal`) or column. Returns the lines it placed letters in. */
function solverRunsLines(b: SolverBoard, horizontal: boolean, c: number): number {
  const { p, grid, cube, remaining } = b;
  const { w, h, n } = p;
  const amx = horizontal ? h : w;
  const bmx = horizontal ? w : h;
  let fired = 0;

  for (let a = 0; a < amx; a++) {
    const req = horizontal
      ? remaining[horClue(a, c, n)]
      : remaining[verClue(a, c, n, h)];
    if (req === NO_NUMBER || req === 0) continue;

    const at = (k: number): [number, number] => (horizontal ? [k, a] : [a, k]);
    const open = Array.from({ length: bmx }, (_, k) => {
      const [x, y] = at(k);
      return cube[cuboid(x, y, c, n, w)] === 1 && grid[y * w + x] === EMPTY;
    });
    const { forced } = runsForce(open, req);
    if (forced.length === 0) continue;
    fired++;
    for (const k of forced) {
      const [x, y] = at(k);
      placeLetter(p, grid, cube, x, y, c, remaining);
    }
  }
  return fired;
}

/** Technique 3 over every letter, both directions. */
function solverRuns(b: SolverBoard): number {
  let fired = 0;
  for (let c = 0; c < b.p.n; c++) {
    fired += solverRunsLines(b, true, c);
    fired += solverRunsLines(b, false, c);
  }
  return fired;
}

/** The three rungs, easiest first. Untiered: ABCD grades nothing, so every
 * rung is tier 0. The ids are what `abcd-ladder.test.ts` takes its census over. */
function abcdLadder(b: SolverBoard): DeductionTechnique[] {
  return [
    { id: "satisfied", tier: 0, run: () => solverSatisfied(b) },
    {
      id: "singles",
      tier: 0,
      run: () => {
        const placed = solverSingles(b);
        return b.contradiction ? -1 : placed;
      },
    },
    { id: "runs", tier: 0, run: () => solverRuns(b) },
  ];
}

/** Classify the settled board. */
function verdict(b: SolverBoard, numbers: Int32Array): AbcdSolveResult {
  if (b.contradiction) return { status: "contradiction", grid: b.grid };
  const v = validatePuzzle(b.p, b.grid, numbers);
  const status: SolveStatus =
    v === 0 ? "solved" : v === -1 ? "contradiction" : "ambiguous";
  return { status, grid: b.grid };
}

/** Run the ladder on `b` to a fixpoint and classify the result. */
export function solveBoard(
  b: SolverBoard,
  numbers: Int32Array,
  firings?: FiringTally,
): AbcdSolveResult {
  runDeductionFixpoint({ techniques: abcdLadder(b), firings });
  return verdict(b, numbers);
}

/**
 * Upstream's hand-written loop, kept as the oracle `abcd-ladder.test.ts` proves
 * {@link solveBoard} against.
 *
 * **Where the two differ, and why it does not matter.** On a board where a cell
 * runs out of candidates, this loop still tries technique 3 once if technique 2
 * placed nothing in the same pass, while the runner stops at the `-1`. Both
 * then report `"contradiction"`, and no caller reads the grid of a contradiction.
 * A generated board never reaches one: its clues come from a real fill, and
 * every technique is sound.
 */
export function solveBoardLegacy(b: SolverBoard, numbers: Int32Array): AbcdSolveResult {
  let busy = true;
  while (busy && !b.contradiction) {
    busy = false;
    if (solverSatisfied(b) > 0) busy = true;
    if (solverSingles(b) > 0) busy = true;
    // Rerun the two cheap techniques before trying runs again.
    if (busy) continue;
    if (solverRuns(b) > 0) busy = true;
  }
  return verdict(b, numbers);
}

/** Run the deductive solver on `numbers` from a blank board. */
export function solveAbcd(p: AbcdParams, numbers: Int32Array): AbcdSolveResult {
  return solveBoard(newSolverBoard(p, numbers), numbers);
}
