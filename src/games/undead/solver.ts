/**
 * Undead's solver: the ladder `undead.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), and the two
 * searches no description states.
 *
 * One ladder serves the generator's grading, the difficulty probe and the
 * hint, which records its firings ({@link recordUndeadDeductions}). Its Easy
 * rungs are upstream's iterative solver: each sightline narrowed to the
 * monsters some filling of it allows, which upstream counts in passes over
 * every sightline. Its Normal rung is this fork's exact counting. Above them
 * are the searches: depth-1 forcing, which grades a board Unreasonable, and
 * upstream's brute force, which Solve and the generator's uniqueness check
 * run where the ladder stops.
 *
 * The game keeps a monster as a bit (1 ghost, 2 vampire, 4 zombie) for each
 * monster square, numbered in reading order with the mirrors left out; the
 * description keeps a value a square (1 ghost, 2 vampire, 3 zombie, 4 a
 * mirror), so a game mask is the description's shifted down one.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/describe-runtime.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { NO_SOLUTION, type SolveFailure } from "../../engine/solve-failure.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { GameStatus } from "../../engine/types.ts";
import {
  CELL_MIRROR_L,
  CELL_MIRROR_R,
  DIFF_EASY,
  DIFF_NORMAL,
  isSingleton,
  MON_NONE,
  MONSTERS,
  range2grid,
  rangeOfSlot,
  type UndeadCommon,
  type UndeadState,
} from "./state.ts";
import * as undead from "./undead.compiled.ts";

/** The description's value of a mirror. */
const D_MIRROR = 4;

/** Every value a square may hold, as the marks keep them: bits 1 to 4. */
const DOMAIN = 0b11110;

/** Lowest set monster bit (the odometer's starting value for a candidate set). */
export function lowestBit(v: number): number {
  return v & 1 ? 1 : v & 2 ? 2 : 4;
}

/**
 * The odometer the searches enumerate with (upstream `next_list`): advance
 * `guess` to the next assignment within `possible`, where `guess[pos]` is one
 * monster bit and `possible[pos]` the bits allowed there. Position `pos` turns
 * fastest, each position through its allowed bits in increasing order. Returns
 * `false` once every assignment has been visited, and at once when a carry
 * reaches an emptied cell (`possible` 0), which has no values to visit.
 */
export function nextList(
  guess: Int32Array,
  possible: Int32Array,
  pos: number,
): boolean {
  for (; pos >= 0; pos--) {
    const above = possible[pos] & ~(2 * guess[pos] - 1);
    if (above) {
      guess[pos] = lowestBit(above);
      return true;
    }
    if (pos === 0 || possible[pos] === 0) return false;
    guess[pos] = lowestBit(possible[pos]); // wrap round and carry
  }
  return false;
}

// --- the board as the description reads it --------------------------------

const spaces = new Map<string, GridSpace>();

/** The space of a `w × h` board, built once a shape. */
function spaceOf(w: number, h: number): GridSpace {
  const key = `${w}x${h}`;
  let sp = spaces.get(key);
  if (sp === undefined) {
    sp = describedSpace(undead.units, w, h);
    spaces.set(key, sp);
  }
  return sp;
}

/** A board as the ladder reads it, and how its squares number the game's
 * monsters. */
interface Board {
  common: UndeadCommon;
  sp: GridSpace;
  dl: undead.Dealt;
  /** Each monster's square, by monster. */
  squareOf: Int32Array;
  /** Each square's monster, `-1` at a mirror. */
  monsterOf: Int32Array;
}

/** The board `common` holds, as the description deals it: its mirrors, the
 * number in every slot, and the three totals. */
function boardOf(common: UndeadCommon): Board {
  const { w, h, grid, xinfo } = common;
  const stride = w + 2;
  const sp = spaceOf(w, h);
  const mirrorAt: number[] = [];
  const mirrorV: number[] = [];
  const squareOf = new Int32Array(common.numTotal);
  const monsterOf = new Int32Array(w * h).fill(-1);
  for (const c of sp.cells) {
    const g = (c % w) + 1 + ((c / w) | 0) * stride + stride;
    if (grid[g] === CELL_MIRROR_L || grid[g] === CELL_MIRROR_R) {
      mirrorAt.push(c);
      mirrorV.push(grid[g] === CELL_MIRROR_L ? 1 : 2);
    } else {
      monsterOf[c] = xinfo[g];
      squareOf[xinfo[g]] = c;
    }
  }
  const sees = sp.slots.map((s) => {
    const at = range2grid(rangeOfSlot(s, w, h), w, h);
    return grid[at.x + at.y * stride];
  });
  const dl: undead.Dealt = {
    mirror: clueList(mirrorAt, mirrorV, w * h),
    sees: clueList(sp.slots, sees, sp.slots.length),
    ghosts: common.numGhosts,
    vampires: common.numVampires,
    zombies: common.numZombies,
  };
  return { common, sp, dl, squareOf, monsterOf };
}

/** A game monster bit's value in the description: 1, 2 or 3. */
const monsterValue = (bit: number): number => 31 - Math.clz32(bit) + 1;

/**
 * The marks on `board` from `start`, a game mask a monster: each mirror
 * placed, each monster down to one placed, and every other square's
 * candidates narrowed to its mask. `null` where the masks clash with the
 * mirrors (never, from a board's own masks).
 */
function marksOf(board: Board, start: ArrayLike<number>): CellMarks | null {
  const { sp, dl, squareOf } = board;
  const grid = new Uint8Array(sp.cells.length);
  for (const c of dl.mirror.at) grid[c] = D_MIRROR;
  for (let i = 0; i < squareOf.length; i++)
    if (isSingleton(start[i])) grid[squareOf[i]] = monsterValue(start[i]);
  const m = new CellMarks(sp, DOMAIN, grid);
  if (!m.seed(grid, (c) => undead.domainOf(sp, dl, c))) return null;
  for (let i = 0; i < squareOf.length; i++) {
    if (isSingleton(start[i])) continue;
    for (let d = 1; d <= 3; d++)
      if (!(start[i] & (1 << (d - 1)))) m.strikeAt(squareOf[i], d);
  }
  return m;
}

/** Each monster's candidates on `m`, as the game keeps them. */
function guessOf(board: Board, m: CellMarks): Uint8Array {
  return Uint8Array.from(board.squareOf, (c) => (m.cand(c) >> 1) & MON_NONE);
}

/** Whether `guess`, a game monster a square, answers the board, by the
 * rules the description compiles to. */
function answers(board: Board, guess: ArrayLike<number>): boolean {
  const { sp, dl, squareOf } = board;
  const grid = new Uint8Array(sp.cells.length);
  for (const c of dl.mirror.at) grid[c] = D_MIRROR;
  for (let i = 0; i < squareOf.length; i++)
    if (isSingleton(guess[i])) grid[squareOf[i]] = monsterValue(guess[i]);
  return undead.isAnswer(grid, sp, dl);
}

/** Solved where every monster square holds one and the board's rules hold. */
export function status(state: UndeadState): GameStatus {
  return answers(boardOf(state.common), state.guess) ? "solved" : "ongoing";
}

// --- the ladder -------------------------------------------------------------

/** Why a candidate was eliminated, or a cell forced (docs/hints-candidates.md
 * § "What every game does"):
 * - `sightline` — one path's two count clues admit no filling leaving this
 *   cell the eliminated monster (the core mirror-sighting deduction);
 * - `total` — a monster type's full count is already placed, so it is struck
 *   from every still-undecided cell;
 * - `onlyCells` — exactly as many cells can still hold a type as remain to
 *   place, so each of them is forced to it (counting's dual, a placement);
 * - `single` — the cell's notes are down to one monster.
 *
 * There is no `forcing` reason, so a hint narrating the search is a compile
 * error rather than a convention. */
export type UndeadReason =
  | { kind: "sightline"; path: number }
  | { kind: "total"; monster: number }
  | { kind: "onlyCells"; monster: number; nCells: number }
  | { kind: "single" };

/** The ladder over `board`, each technique with its reason. */
function ladderOf(board: Board): Ladder {
  const { common, dl } = board;
  const { w, h } = common;
  // A sightline's path in the game's list, by the slot it is read from.
  const pathOf = new Map<number, number>();
  common.paths.slice(0, common.numPaths).forEach((p, i) => {
    pathOf.set(p.gridStart, i);
    pathOf.set(p.gridEnd, i);
  });
  return describedLadder(undead, {
    single: uncluedRung(undead.single, (): UndeadReason => ({ kind: "single" })),
    sightline: compiledRung(
      undead.sightline,
      dl,
      ({ s }): UndeadReason => ({
        kind: "sightline",
        path: pathOf.get(rangeOfSlot(s, w, h)) ?? -1,
      }),
    ),
    total: compiledRung(
      undead.total,
      dl,
      ({ d, n, P }): UndeadReason =>
        P.length === n
          ? { kind: "total", monster: MONSTERS[d - 1] }
          : { kind: "onlyCells", monster: MONSTERS[d - 1], nCells: n },
    ),
  });
}

/** A ladder run's marks and their verdict. */
interface Run {
  m: CellMarks;
  /** A technique proved the marks inconsistent, or a square has no
   * candidate left. */
  impossible: boolean;
}

/** Run `ladder` on `m` to a fixpoint at tier `cap`, counting each technique's
 * firings into `firings` where one is given. */
function runAt(ladder: Ladder, m: CellMarks, cap: number, firings?: FiringTally): Run {
  const grades = { [TIERS]: -1 };
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, grades),
    { firings },
  );
  return { m, impossible: impossible || m.cands.includes(0) };
}

/** Whether every square of `m` holds a value. */
const filled = (m: CellMarks): boolean => !m.grid.includes(0);

// --- grading ----------------------------------------------------------------

/** Highest deductive technique a board needs (or `RECURSION` if the ladder
 * stalls — that board needs nested hypothesizing = guessing). */
export const RUNG_ARC = 0;
export const RUNG_COUNTING = 1;
export const RUNG_FORCING = 2;
const RUNG_RECURSION = 3;
export type TierRung = 0 | 1 | 2 | 3;

/** The ladder's cap for each tier level, `DIFF_EASY` upward. */
export const TIER_RUNG: readonly TierRung[] = [RUNG_ARC, RUNG_COUNTING, RUNG_FORCING];

/**
 * Easy's bound on sightline passes, upstream's arc-consistency passes, the
 * last of which narrows nothing: a board needing more than this falls to
 * Normal even though it never leaves the Easy rungs.
 *
 * It lives beside the rungs because Easy is a rung *and a bound* and both of
 * its readers need the pair: the generator's tier-acceptance rule
 * (`gradeMatchesTier`) and the difficulty contract's `solveAtCap` are two
 * spellings of one rule.
 */
export const EASY_MAX_ARC_PASSES = 3;

export interface DeductiveResult {
  /** highest rung the ladder needed; `RUNG_RECURSION` if it never solved. */
  rung: TierRung;
  /** the ladder narrowed every cell to a single monster (⇒ unique solution). */
  solved: boolean;
  /** a contradiction surfaced (the board has no solution). */
  inconsistent: boolean;
  /** sightline passes at the Easy cap, the last narrowing nothing. */
  arcPasses: number;
  /** each monster's candidates after the ladder ran, as the game keeps them. */
  guess: Uint8Array;
}

/**
 * Upstream's forcing pass, one round: each candidate of each undecided
 * square in turn, supposed, and the Normal ladder run from it on a copy; one
 * that leads to a contradiction is struck. Returns `-1` where a square is
 * left with none, `1` where anything was struck, else `0`. A supposition is
 * never made inside another: a board that needs one is left unsolved.
 */
function forcingPass(ladder: Ladder, m: CellMarks): number {
  const { cells } = m.sp;
  let changed = 0;
  for (const c of cells) {
    if (m.known(c)) continue;
    for (let d = 1; d <= 3; d++) {
      if (!m.has(c, d)) continue;
      const grid = m.grid.slice();
      const cands = m.snapshot();
      m.place(c, d);
      const dead = runAt(ladder, m, DIFF_NORMAL).impossible;
      m.restore(grid, cands);
      if (!dead) continue;
      m.strikeAt(c, d);
      changed = 1;
      if (m.cand(c) === 0) return -1;
    }
  }
  return changed;
}

/**
 * Run the deductive ladder over a starting candidate grid, a tier at a time
 * so the result records the highest technique needed: the Easy rungs, then
 * the Normal rung, then depth-1 forcing to a fixpoint, never a supposition
 * inside one. This is the generator's grading entry.
 *
 * `maxRung` stops escalation early: grading for a tier rejects anything the
 * tier's rung cannot solve, so Easy and Normal need not pay for forcing.
 * `solved=false` then means "needs more than `maxRung`", reported as
 * `RUNG_RECURSION`.
 *
 * `firings` counts the techniques fired on the board itself, for the ladder
 * census; a supposition's are not the board's, and are not counted.
 */
export function solveDeductive(
  common: UndeadCommon,
  start: Uint8Array,
  maxRung: TierRung = RUNG_FORCING,
  firings?: FiringTally,
): DeductiveResult {
  const board = boardOf(common);
  const ladder = ladderOf(board);
  const m = marksOf(board, start);
  // The passes are the Easy attempt's alone, as upstream counted them.
  let arcPasses = 0;
  const result = (rung: TierRung, inconsistent = false): DeductiveResult => ({
    rung,
    solved: rung !== RUNG_RECURSION,
    inconsistent,
    arcPasses,
    guess: m === null ? new Uint8Array(common.numTotal) : guessOf(board, m),
  });
  if (m === null) return result(RUNG_RECURSION, true);

  // Each sightline firing is a pass that narrowed something.
  const tally: FiringTally = firings ?? new Map();
  const before = tally.get("sightline") ?? 0;
  const easy = runAt(ladder, m, DIFF_EASY, tally);
  arcPasses = (tally.get("sightline") ?? 0) - before + 1;
  if (easy.impossible) return result(RUNG_RECURSION, true);
  if (filled(m)) return result(RUNG_ARC);
  if (maxRung < RUNG_COUNTING) return result(RUNG_RECURSION);

  if (runAt(ladder, m, DIFF_NORMAL, firings).impossible)
    return result(RUNG_RECURSION, true);
  if (filled(m)) return result(RUNG_COUNTING);
  if (maxRung < RUNG_FORCING) return result(RUNG_RECURSION);

  for (;;) {
    const ret = forcingPass(ladder, m);
    if (ret < 0) return result(RUNG_RECURSION, true);
    if (ret === 0) break;
    if (runAt(ladder, m, DIFF_NORMAL, firings).impossible)
      return result(RUNG_RECURSION, true);
    if (filled(m)) break;
  }
  return result(filled(m) ? RUNG_FORCING : RUNG_RECURSION);
}

// --- upstream's solve: the iterative solver, then brute force ---------------

/**
 * Whole-grid brute-force uniqueness check (upstream `solve_bruteforce`):
 * enumerate every assignment within the current candidate sets; succeed only
 * when exactly one answers the board, recording it into `guess`.
 */
function solveBruteforce(board: Board, guess: Uint8Array): boolean {
  const numTotal = guess.length;
  if (numTotal === 0) return false;
  const loopPossible = new Int32Array(guess);
  const loopGuess = loopPossible.map(lowestBit);
  let solutions = 0;
  do {
    if (answers(board, loopGuess)) {
      if (++solutions > 1) return false;
      guess.set(loopGuess);
    }
  } while (nextList(loopGuess, loopPossible, numTotal - 1));
  return solutions === 1;
}

export interface GradeResult {
  iterativeSolved: boolean;
  bruteforceSolved: boolean;
  inconsistent: boolean;
  /** cells still ambiguous after the iterative fixpoint. */
  ambiguous: number;
  /** the (possibly partial) candidate grid after solving. */
  guess: Uint8Array;
}

/**
 * Upstream's solver pipeline (`new_game_desc`'s grading block): its
 * iterative solver, the ladder's Easy rungs, to a fixpoint, then brute force
 * when `diffAllowsBruteforce` (upstream skips it at Easy). The differential
 * checks its verdicts against C; the generator grades by
 * {@link solveDeductive} instead.
 */
export function gradeUndead(
  common: UndeadCommon,
  start: Uint8Array,
  diffAllowsBruteforce: boolean,
): GradeResult {
  const board = boardOf(common);
  const m = marksOf(board, start);
  const guess = m === null ? new Uint8Array(common.numTotal) : guessOf(board, m);
  if (m !== null) {
    runAt(ladderOf(board), m, DIFF_EASY);
    guess.set(guessOf(board, m));
  }
  const iterativeSolved = guess.every(isSingleton);
  const inconsistent = guess.includes(0);

  let ambiguous = 0;
  let bruteforceSolved = false;
  if (diffAllowsBruteforce && !iterativeSolved && !inconsistent) {
    ambiguous = guess.filter((v) => !isSingleton(v)).length;
    bruteforceSolved = solveBruteforce(board, guess);
  }
  return { iterativeSolved, bruteforceSolved, inconsistent, ambiguous, guess };
}

export type SolutionResult =
  | { ok: true; guess: Uint8Array }
  | { ok: false; error: SolveFailure };

/**
 * The unique solution of a board, for `solve` and `findMistakes` (upstream
 * `solve_game`): {@link gradeUndead} from the fixed cells, every other cell
 * undecided. Never derived from the player's notes or non-fixed entries.
 */
export function findUndeadSolution(state: UndeadState): SolutionResult {
  const fixed = state.common.fixed;
  const start = state.guess.map((g, i) => (fixed[i] ? g : MON_NONE));
  const grade = gradeUndead(state.common, start, true);
  if (grade.inconsistent) return { ok: false, error: NO_SOLUTION };
  if (!grade.iterativeSolved && !grade.bruteforceSolved) {
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  }
  return { ok: true, guess: grade.guess };
}

/** True iff the board has exactly one solution (iterative-or-brute-force,
 * order-independent). Used by the generator and the differential. */
export function isUniquelySolvable(common: UndeadCommon): boolean {
  const start = new Uint8Array(common.numTotal).fill(MON_NONE);
  const grade = gradeUndead(common, start, true);
  return !grade.inconsistent && (grade.iterativeSolved || grade.bruteforceSolved);
}

// --- the hint's record ------------------------------------------------------

/** One recorded firing op. `kind: "elim"` removes `monster` from `cell`'s
 * candidates; `kind: "place"` forces `cell` to `monster`. `group` ties the ops
 * of a single firing together (one firing = one journey). */
export interface HintOp {
  kind: "elim" | "place";
  cell: number;
  monster: number;
  reason: UndeadReason;
  group: number;
}

/**
 * Run the ladder's Easy and Normal rungs over the candidates `placed`
 * implies (a placed cell's single monster, otherwise all three), recording
 * every firing in the order the ladder makes them, one a pass. A square the
 * ladder places because its candidates are down to one is the plan's own
 * step, read off the player's notes, so its record is left out. The forcing
 * search is not run: a board that needs it gives a short record, and the
 * hint stops where it would begin.
 */
export function recordUndeadDeductions(
  common: UndeadCommon,
  placed: Uint8Array,
): HintOp[] {
  const board = boardOf(common);
  const start = placed.map((v) => (isSingleton(v) ? v : MON_NONE));
  const m = marksOf(board, start);
  if (m === null) return [];
  const ops: HintOp[] = [];
  m.recorder = (rec) => {
    const reason = rec.reason as UndeadReason;
    if (reason.kind === "single") return;
    ops.push({
      kind: rec.kind,
      cell: board.monsterOf[rec.y * common.w + rec.x],
      monster: MONSTERS[rec.n - 1],
      reason,
      group: rec.group,
    });
  };
  m.budget = stepBudget("undead hint recorder");
  runAt(ladderOf(board), m, DIFF_NORMAL);
  return ops;
}
