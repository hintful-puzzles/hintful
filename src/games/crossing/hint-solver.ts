/**
 * Crossing's recording deduction pass — the hint's half of the "one engine, two
 * projections" rule (docs/games/solver-and-generator.md § "One engine, two projections").
 *
 * It sits **beside** the untouched {@link solveCrossing} rather than threading a
 * recorder through it (the shape Boats' and Pattern's hints use): the
 * generator is solver-gated and covered end to end by a frozen byte-match
 * differential, so keeping the recording pass in its own module makes "the
 * solver didn't move" checkable from the file list.
 *
 * **Why the technique has to be re-derived.** `solverMarks` is a set
 * intersection: it reports *which* candidates a run's still-fitting numbers
 * rule out and carries no name for the reason. Narrating that raw ("this
 * square's candidates collapsed to one") would be correct, useless and
 * unteachable. So this module re-derives the things a Crossing player actually
 * thinks:
 *
 * 1. **`onlyNumber`** — one listed number is all that still fits a run, so the
 *    whole run is that number. One deduction, one whole-run move.
 * 2. **`sharedDigit`** — every number that still fits a run carries the same
 *    digit at one position, so that square is pinned.
 * 3. **`crossRuns`** — the signature deduction of a number crossword: the
 *    across number allows one set of digits in this square, the down number
 *    another, and they agree on exactly one.
 * 4. **`noteDigits`** / **`noteStrike`** — the digits a run's still-fitting
 *    numbers leave in one of its squares, written as notes into a square that
 *    has none, or struck from the notes of one that has.
 *
 * **"Still fits" is read off the board.** A number fits a run when it is the
 * run's length, is not written in elsewhere, and agrees with every square of
 * the run: its entered digit, or else its notes. That is a check the player can
 * make by eye, and reading the notes as facts is sound because `findMistakes`
 * flags a note that has ruled a square's answer out, and the hint refuses on a
 * flagged board.
 *
 * Rungs 1–3 read that way can stall where the solver does not: a number can
 * die three implications away, because some crossing run ruled a digit out of
 * one of its squares. The solver's narrowing fixpoint ({@link fixpoint}) finds
 * such a placement, and the hint then does **not** assert it (a hint relies
 * only on marks the player can make — `AGENTS.md` § "Hint quality bar" rule 6).
 * It traces the placement back to the narrowings it rests on ({@link support})
 * and places the earliest of them as notes, whose own premise is already on the
 * board. Each note step narrows some square's notes, so the walk ends at the
 * placement read off the notes.
 *
 * The order is goal-first: fill a whole run, else pin a square, else write the
 * notes a placement needs. Rung 4 also closes a board where deduction is
 * exhausted (a hand-authored, non-uniquely-solvable id reaches it, and that is
 * how `crossing-hint.test.ts` tests it) by ruling out a note no still-fitting
 * number supports.
 *
 * The fixpoint is {@link solveCrossing}'s `solverMarks` loop and rungs 2+3 are
 * its `solverConfirm`, so a plan always reaches the solution.
 */

import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { say } from "./hint-text.ts";
import {
  type CrossingPuzzle,
  type CrossingState,
  numberAvailableTo,
  placedRuns,
  type SolveStatus,
  validateBoard,
} from "./state.ts";

/** Candidate bit for digit `n` (1–9) — Crossing's `marks` encoding, one lower
 * than the Latin games' `1 << n` (there is no "empty" digit to reserve 0 for). */
const digitBit = (n: number): number => 1 << (n - 1);
const ALL_DIGITS = 0x1ff;

/** Plan-length cap — a UX bound, not a correctness one: the player rarely
 * follows more than a handful of steps before going their own way, and the next
 * request recomputes. Matches Spokes/Bricks/Boats. */
const HINT_PLAN_MAX = 40;

function digitsOf(mask: number): number[] {
  const out: number[] = [];
  for (let n = 1; n <= 9; n++) if (mask & digitBit(n)) out.push(n);
  return out;
}

/** The single digit `mask` allows, or 0 when it allows none or several. */
function soleDigit(mask: number): number {
  if (mask === 0 || (mask & (mask - 1)) !== 0) return 0;
  return 32 - Math.clz32(mask);
}

// --- the candidate lattice --------------------------------------------------

/** The board the deduction walks: the player's entries plus their notes. */
export interface CrossingHintBoard {
  puzzle: CrossingPuzzle;
  grid: Uint8Array;
  marks: Int32Array;
}

/** What each square shows it can hold: its entered digit, else its notes, else
 * anything. */
function boardCandidates(board: CrossingHintBoard): Int32Array {
  const { puzzle, grid, marks } = board;
  const { w, h, walls } = puzzle;
  const cand = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    cand[i] = walls[i]
      ? 0
      : grid[i]
        ? digitBit(grid[i])
        : marks[i] & ALL_DIGITS || ALL_DIGITS;
  }
  return cand;
}

/** Number `l` is run `r`'s length and not already written into another run. */
function mayTake(
  puzzle: CrossingPuzzle,
  placed: Int32Array,
  r: number,
  l: number,
): boolean {
  if (placed[l] >= 0 && placed[l] !== r) return false;
  return puzzle.numbers[l].length === puzzle.runs[r].cells.length;
}

function fitsUnder(
  puzzle: CrossingPuzzle,
  cand: Int32Array,
  r: number,
  l: number,
): boolean {
  const cells = puzzle.runs[r].cells;
  const num = puzzle.numbers[l];
  for (let k = 0; k < cells.length; k++) {
    if (!(cand[cells[k]] & digitBit(num[k]))) return false;
  }
  return true;
}

/** Per run, the listed numbers that still fit it under `cand`, and per position
 * the digits they put there. */
interface Tables {
  fitting: number[][];
  acc: Int32Array[];
}

/** What the board shows: which numbers are used up, and which still fit each
 * run judged against its entered digits and notes. */
interface Analysis extends Tables {
  placed: Int32Array;
}

function analyze(board: CrossingHintBoard): Analysis {
  const { puzzle, grid } = board;
  const { numbers, runs } = puzzle;
  const cand = boardCandidates(board);
  const placed = placedRuns(puzzle, grid);
  const fitting: number[][] = [];
  const acc: Int32Array[] = [];
  for (let r = 0; r < runs.length; r++) {
    const cells = runs[r].cells;
    const fits: number[] = [];
    const a = new Int32Array(cells.length);
    for (let l = 0; l < numbers.length; l++) {
      if (!mayTake(puzzle, placed, r, l) || !fitsUnder(puzzle, cand, r, l)) continue;
      fits.push(l);
      for (let k = 0; k < cells.length; k++) a[k] |= digitBit(numbers[l][k]);
    }
    fitting.push(fits);
    acc.push(a);
  }
  return { placed, fitting, acc };
}

/** One square narrowed by one run's still-fitting numbers. */
interface Narrowing {
  cell: number;
  run: number;
  /** How many narrowings were recorded before the run's numbers were judged —
   * the only ones this one can rest on. */
  before: number;
}

/** `removedBy` value for a digit the fixpoint never rules out. */
const SURVIVES = 0x7fffffff;

interface Fixpoint extends Tables {
  /** Per square and digit (`cell * 9 + digit − 1`), the index of the narrowing
   * that ruled it out: −1 where the board already does, {@link SURVIVES} where
   * nothing does. */
  removedBy: Int32Array;
  narrowings: Narrowing[];
}

/**
 * `solverMarks`' narrowing, run to a fixpoint from the board, recording which
 * narrowing ruled out each digit. Every pass narrows **in place as it goes**, so
 * the vertical runs already see what the horizontal ones ruled out — that
 * ordering is where much of the solver's strength lives.
 */
function fixpoint(board: CrossingHintBoard, placed: Int32Array): Fixpoint {
  const { puzzle, grid } = board;
  const { w, h, numbers, runs } = puzzle;
  const cand = boardCandidates(board);
  const removedBy = new Int32Array(w * h * 9).fill(SURVIVES);
  for (let i = 0; i < w * h; i++) {
    for (let d = 1; d <= 9; d++) {
      if (!(cand[i] & digitBit(d))) removedBy[i * 9 + d - 1] = -1;
    }
  }
  const narrowings: Narrowing[] = [];

  // The fixpoint is budgeted here only; the generator's copy of it in
  // `solver.ts` runs unbudgeted.
  const budget = stepBudget("crossing hint narrowing");
  for (;;) {
    const fitting: number[][] = [];
    const acc: Int32Array[] = [];
    let changed = false;
    for (let r = 0; r < runs.length; r++) {
      const cells = runs[r].cells;
      const before = narrowings.length;
      const fits: number[] = [];
      const a = new Int32Array(cells.length);
      for (let l = 0; l < numbers.length; l++) {
        if (!mayTake(puzzle, placed, r, l) || !fitsUnder(puzzle, cand, r, l)) continue;
        fits.push(l);
        for (let k = 0; k < cells.length; k++) a[k] |= digitBit(numbers[l][k]);
      }
      fitting.push(fits);
      acc.push(a);

      for (let k = 0; k < cells.length; k++) {
        const i = cells[k];
        if (grid[i]) continue;
        const removed = cand[i] & ~a[k];
        if (!removed) continue;
        for (const d of digitsOf(removed)) removedBy[i * 9 + d - 1] = narrowings.length;
        narrowings.push({ cell: i, run: r, before });
        cand[i] &= a[k];
        changed = true;
      }
    }
    // A pass that changed nothing leaves `fitting`/`acc` agreeing with `cand`.
    if (!changed) return { fitting, acc, removedBy, narrowings };
    budget.tick();
  }
}

/**
 * The narrowings that killing every number in `kills` rests on, oldest first.
 *
 * A number died at the square of its run where one of its digits was ruled out
 * first. That narrowing rests on every number of its run carrying that digit
 * there having died before the run was judged, and so on down; a digit the
 * board already rules out rests on nothing. So the oldest narrowing in the
 * result rests only on the board, and is directly checkable.
 */
function support(
  puzzle: CrossingPuzzle,
  placed: Int32Array,
  fp: Fixpoint,
  kills: readonly { run: number; number: number }[],
): number[] {
  const { runs, numbers } = puzzle;
  const need = new Set<number>();
  const visited = new Set<number>();

  const kill = (r: number, l: number, bound: number): void => {
    const cells = runs[r].cells;
    const num = numbers[l];
    // The square where it died first; the board's own rule-outs come before
    // every narrowing and rest on nothing. (Preferring the square left with the
    // fewest digits was measured, and wrote about as many notes.)
    let key = -1;
    let at = SURVIVES;
    for (let k = 0; k < cells.length; k++) {
      const kk = cells[k] * 9 + num[k] - 1;
      if (fp.removedBy[kk] < at) {
        at = fp.removedBy[kk];
        key = kk;
      }
    }
    if (at >= bound)
      throw new Error("crossing hint: a dead number has no square it died at");
    if (at >= 0) rule(key);
  };

  const rule = (key: number): void => {
    if (visited.has(key)) return;
    visited.add(key);
    const e = fp.removedBy[key];
    need.add(e);
    const { cell, run, before } = fp.narrowings[e];
    const pos = posInRun(puzzle, run, cell);
    const digit = (key % 9) + 1;
    for (let l = 0; l < numbers.length; l++) {
      if (mayTake(puzzle, placed, run, l) && numbers[l][pos] === digit) {
        kill(run, l, before);
      }
    }
  };

  for (const { run, number } of kills) kill(run, number, SURVIVES);
  return [...need].sort((a, b) => a - b);
}

// --- firings ----------------------------------------------------------------

/** One deduction, named the way a player would name it. Every firing carries
 * the run(s) it reasons over and the listed numbers that are its premise — the
 * evidence lives half in the clue list, so it travels with the firing. */
export type CrossingFiring =
  | {
      technique: "onlyNumber";
      /** The run being filled. */
      run: number;
      /** The listed number it must be. */
      number: number;
      /** The run's still-empty cells **as this firing fires** — the squares the
       * move actually writes into, and so the ones the hint marks (built against
       * the board of this step, not the original). */
      fill: number[];
      /** The premise: the numbers that still fit (here, just `number`). */
      fitting: number[];
      /** **What actually rules the others out** — the premise the narration
       * must state, since they read very differently on the board (a premise
       * that doesn't single out this conclusion is a bug): `"length"` — no
       * other listed number is even this long (the whole story on a fresh
       * board); `"used"` — the other numbers of this length are already
       * written in elsewhere; `"digits"` — the digits already in this run
       * contradict them; `"notes"` — the notes in the run's squares do. */
      because: "length" | "used" | "digits" | "notes";
    }
  | {
      technique: "sharedDigit";
      run: number;
      /** Cell index of the square pinned, and its position along the run. */
      cell: number;
      pos: number;
      digit: number;
      fitting: number[];
    }
  | {
      technique: "crossRuns";
      cell: number;
      digit: number;
      acrossRun: number;
      downRun: number;
      /** What each run's still-fitting numbers allow in this square. */
      acrossDigits: number[];
      downDigits: number[];
      fitting: number[];
    }
  | ({ technique: "noteDigits" } & NoteFiring)
  | ({ technique: "noteStrike" } & NoteFiring);

/** `noteDigits` writes notes into a square that has none; `noteStrike` rules
 * notes out of one that has. */
interface NoteFiring {
  cell: number;
  /** The run whose fitting numbers decide the notes. */
  run: number;
  /** The digits written, or the digits struck. */
  digits: number[];
  fitting: number[];
}

/** Position of cell `i` along run `r`. */
function posInRun(puzzle: CrossingPuzzle, r: number, i: number): number {
  return puzzle.runs[r].cells.indexOf(i);
}

/**
 * The next forced deduction, in **goal-first** order: fill a whole run, else
 * pin one square, else pin one square from its two crossing numbers, else write
 * the notes the next placement rests on, else rule a refuted note out. Leading
 * with the whole-run placement is both the strongest teaching and the most
 * satisfying move.
 */
function nextCrossingFiring(board: CrossingHintBoard): CrossingFiring | null {
  const a = analyze(board);
  const shown = placementFiring(board, a, a);
  if (shown) return shown;

  const fp = fixpoint(board, a.placed);
  const hidden = placementFiring(board, fp, a);
  if (!hidden) return noteStrikeFiring(board, a);
  const [first] = support(board.puzzle, a.placed, fp, kills(board, a, fp, hidden));
  if (first === undefined) {
    throw new Error("crossing hint: a placement the board shows was passed over");
  }
  const { cell, run } = fp.narrowings[first];
  return noteFiring(board, a, cell, run);
}

/**
 * The three placement techniques, in goal-first order, read off whichever
 * tables `t` it is given. `shown` is always the board's own reading: it decides
 * how a whole-run placement is narrated.
 */
function placementFiring(
  board: CrossingHintBoard,
  t: Tables,
  shown: Analysis,
): CrossingFiring | null {
  const { puzzle, grid } = board;
  const { w, h, walls, runs, numbers } = puzzle;
  const { fitting, acc } = t;

  // 1 — a run only one listed number can still go in.
  for (let r = 0; r < runs.length; r++) {
    if (fitting[r].length !== 1) continue;
    const cells = runs[r].cells;
    const fill = cells.filter((i) => grid[i] === 0);
    if (fill.length === 0) continue; // already written in
    const sameLength = numbers.filter((n) => n.length === cells.length).length;
    // Judged on the entered digits alone, does anything else still fit?
    const unnoted = numbers.filter((_, l) =>
      numberAvailableTo(puzzle, grid, shown.placed, r, l),
    ).length;
    return {
      technique: "onlyNumber",
      run: r,
      number: fitting[r][0],
      fill,
      fitting: fitting[r],
      because:
        unnoted > 1
          ? "notes" // the notes in the run are what rule the others out
          : fill.length < cells.length
            ? "digits" // something is written in the run, and it does the work
            : sameLength > 1
              ? "used" // nothing written here, so the others must be used up
              : "length", // it is the only number of this length, full stop
    };
  }

  // 2 — a position every still-fitting number of one run agrees on.
  for (let r = 0; r < runs.length; r++) {
    const cells = runs[r].cells;
    for (let k = 0; k < cells.length; k++) {
      const i = cells[k];
      if (grid[i]) continue;
      const digit = soleDigit(acc[r][k]);
      if (!digit) continue;
      return {
        technique: "sharedDigit",
        run: r,
        cell: i,
        pos: k,
        digit,
        fitting: fitting[r],
      };
    }
  }

  // 3 — the two numbers crossing in a square agree on exactly one digit.
  for (let i = 0; i < w * h; i++) {
    if (walls[i] || grid[i]) continue;
    const across = puzzle.acrossRun[i];
    const down = puzzle.downRun[i];
    if (across < 0 || down < 0) continue;
    const acrossDigits = acc[across][posInRun(puzzle, across, i)];
    const downDigits = acc[down][posInRun(puzzle, down, i)];
    const digit = soleDigit(acrossDigits & downDigits);
    if (!digit) continue;
    return {
      technique: "crossRuns",
      cell: i,
      digit,
      acrossRun: across,
      downRun: down,
      acrossDigits: digitsOf(acrossDigits),
      downDigits: digitsOf(downDigits),
      fitting: [...fitting[across], ...fitting[down]],
    };
  }

  return null;
}

/** The numbers that still fit on the board but must be dead for `f` — found on
 * the fixpoint's tables — to fire on the board's own. */
function kills(
  board: CrossingHintBoard,
  shown: Analysis,
  fp: Fixpoint,
  f: CrossingFiring,
): { run: number; number: number }[] {
  const { puzzle } = board;
  /** The numbers still fitting run `r` whose digit at `pos` is not `digit`. */
  const against = (r: number, pos: number, digit: number) =>
    shown.fitting[r]
      .filter((l) => puzzle.numbers[l][pos] !== digit)
      .map((l) => ({ run: r, number: l }));
  switch (f.technique) {
    case "onlyNumber":
      return shown.fitting[f.run]
        .filter((l) => l !== f.number)
        .map((l) => ({ run: f.run, number: l }));
    case "sharedDigit":
      return against(f.run, f.pos, f.digit);
    case "crossRuns": {
      // Every other digit both runs allow on the board must go from one side:
      // whichever the fixpoint ruled it out of.
      const pa = posInRun(puzzle, f.acrossRun, f.cell);
      const pd = posInRun(puzzle, f.downRun, f.cell);
      const both = shown.acc[f.acrossRun][pa] & shown.acc[f.downRun][pd];
      const out: { run: number; number: number }[] = [];
      for (const d of digitsOf(both)) {
        if (d === f.digit) continue;
        const [r, pos] =
          fp.acc[f.acrossRun][pa] & digitBit(d) ? [f.downRun, pd] : [f.acrossRun, pa];
        out.push(
          ...shown.fitting[r]
            .filter((l) => puzzle.numbers[l][pos] === d)
            .map((l) => ({ run: r, number: l })),
        );
      }
      return out;
    }
    case "noteDigits":
    case "noteStrike":
      throw new Error("crossing hint: a note step is not a placement");
  }
}

/** The notes run `run`'s still-fitting numbers leave in square `cell`: written
 * in when it has none, the rest struck when it has some. */
function noteFiring(
  board: CrossingHintBoard,
  a: Analysis,
  cell: number,
  run: number,
): CrossingFiring {
  const leave = a.acc[run][posInRun(board.puzzle, run, cell)];
  const notes = board.marks[cell] & ALL_DIGITS;
  const digits = digitsOf(notes ? notes & ~leave : leave);
  if (notes ? digits.length === 0 : digits.length < 2) {
    throw new Error("crossing hint: a note step that narrows nothing");
  }
  const note = { cell, run, digits, fitting: a.fitting[run] };
  return notes
    ? { technique: "noteStrike", ...note }
    : { technique: "noteDigits", ...note };
}

/** A pencil note no still-fitting number supports. */
function noteStrikeFiring(
  board: CrossingHintBoard,
  a: Analysis,
): CrossingFiring | null {
  const { puzzle, grid, marks } = board;
  const { w, h, walls } = puzzle;
  for (let i = 0; i < w * h; i++) {
    if (walls[i] || grid[i] || marks[i] === 0) continue;
    let bestRun = -1;
    let bestMask = 0;
    for (const r of [puzzle.acrossRun[i], puzzle.downRun[i]]) {
      if (r < 0) continue;
      // One firing states one run's refutation, so take the run that refutes
      // the most — a premise mixing two runs would need two sentences.
      const mask = marks[i] & ~a.acc[r][posInRun(puzzle, r, i)] & ALL_DIGITS;
      if (
        mask !== 0 &&
        (bestRun < 0 || digitsOf(mask).length > digitsOf(bestMask).length)
      ) {
        bestRun = r;
        bestMask = mask;
      }
    }
    if (bestRun < 0) continue;
    return {
      technique: "noteStrike",
      cell: i,
      run: bestRun,
      digits: digitsOf(bestMask),
      fitting: a.fitting[bestRun],
    };
  }

  return null;
}

/** Apply a firing to the deduction's working board. */
export function applyCrossingFiring(
  board: CrossingHintBoard,
  firing: CrossingFiring,
): void {
  const { puzzle, grid, marks } = board;
  switch (firing.technique) {
    case "onlyNumber": {
      const cells = puzzle.runs[firing.run].cells;
      const num = puzzle.numbers[firing.number];
      for (let k = 0; k < cells.length; k++) grid[cells[k]] = num[k];
      break;
    }
    case "sharedDigit":
    case "crossRuns":
      grid[firing.cell] = firing.digit;
      break;
    case "noteDigits":
      for (const d of firing.digits) marks[firing.cell] |= digitBit(d);
      break;
    case "noteStrike":
      for (const d of firing.digits) marks[firing.cell] &= ~digitBit(d);
      break;
  }
}

// --- the plan ---------------------------------------------------------------

export interface CrossingPlan {
  status: SolveStatus;
  firings: CrossingFiring[];
}

/** Replay the deduction from the player's own board, one firing at a time. */
export function deduceCrossingPlan(state: CrossingState): CrossingPlan {
  const board: CrossingHintBoard = {
    puzzle: state.puzzle,
    grid: state.grid.slice(),
    marks: state.pencil.slice(),
  };
  const { status, plan } = deduceHintPlan<
    CrossingHintBoard,
    CrossingFiring,
    SolveStatus
  >({
    board,
    status: (b) => validateBoard(b.puzzle, b.grid).status,
    incomplete: "progress",
    next: nextCrossingFiring,
    apply: applyCrossingFiring,
    planCap: HINT_PLAN_MAX,
    budget: stepBudget("crossing hint"),
  });
  return { status, firings: plan };
}

// --- narration --------------------------------------------------------------

/**
 * One firing, in one sentence: which one, with the run's length, direction and
 * number read off the puzzle. The words are [`hint-text.ts`](./hint-text.ts)'s.
 */
export function narrateCrossing(
  puzzle: CrossingPuzzle,
  firing: CrossingFiring,
): string {
  switch (firing.technique) {
    case "onlyNumber": {
      const run = puzzle.runs[firing.run];
      return say.onlyNumber(
        firing,
        run.cells.length,
        puzzle.numbers[firing.number].join(""),
      );
    }
    case "sharedDigit":
      return say.sharedDigit(firing, puzzle.runs[firing.run].horizontal);
    case "crossRuns":
      return say.crossRuns(firing);
    case "noteDigits":
      return say.noteDigits(firing, puzzle.runs[firing.run].horizontal);
    case "noteStrike":
      return say.noteStrike(firing, puzzle.runs[firing.run].horizontal);
  }
}
