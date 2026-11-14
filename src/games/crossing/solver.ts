/**
 * Crossing's solver: the ladder `crossing.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`); the search
 * over it for a board's answers; the mistake check; and the hint's plan, read
 * off the compiled ladder's firings.
 *
 * Upstream's solver has two deductions, a run's still-fitting numbers
 * narrowing its squares and a square down to one digit (`// TODO harder
 * techniques?`), and no difficulty parameter. The fork's third is a number
 * with one run left. The description states the first as `narrow` and the
 * third as `onlyRun`, and reads the second as a run whose fitting numbers
 * agree on a square (`sharedDigit`); with them, the readings a player makes
 * of a whole run or a crossing (`onlyNumber`, `crossRuns`), which add
 * nothing to what the rest reach and are what the hint says. The generator accepts an
 * Easy board only when the ladder finishes it, and an Unreasonable one only
 * when it does not, so the ladder's strength is baked into which puzzles
 * exist at each tier.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  popcount,
  rangeMask,
  STRIKE,
} from "../../engine/describe-runtime.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Firing,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Said,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import * as crossing from "./crossing.compiled.ts";
import {
  type CrossingPuzzle,
  type CrossingState,
  numberAvailableTo,
  placedRuns,
  type SolveStatus,
  validateBoard,
} from "./state.ts";

/** A pencil note's bit for digit `n` (1–9), as the player's notes hold it. */
const noteBit = (n: number): number => 1 << (n - 1);
/** Every digit `1`–`9` noted. */
const ALL_NOTES = 0x1ff;

/** The value the description gives a square that holds no digit: a wall, or
 * an open square no run passes through. */
const BLANK = 10;

/** Every value a square may hold, as the marks hold it. */
const VALUES = rangeMask(1, BLANK);

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every solve reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(crossing.units, w, h);
  return lastSpace;
}

/** Whether square `i` holds no digit: a wall, or an open square in no run. */
const isBlank = (p: CrossingPuzzle, i: number): boolean =>
  p.walls[i] !== 0 || (p.acrossRun[i] < 0 && p.downRun[i] < 0);

/** Each puzzle's deal, made once: what the compiled ladder keeps for a
 * board, it keeps by this object. */
const dealt = new WeakMap<CrossingPuzzle, crossing.Dealt>();

/** The board as the description deals it: the squares that hold no digit,
 * and the listed numbers' digits. */
function dealtOf(p: CrossingPuzzle): crossing.Dealt {
  const kept = dealt.get(p);
  if (kept !== undefined) return kept;
  const at: number[] = [];
  for (let i = 0; i < p.w * p.h; i++) if (isBlank(p, i)) at.push(i);
  const made: crossing.Dealt = {
    blank: clueList(
      at,
      at.map(() => 0),
      p.w * p.h,
    ),
    numbers: {
      n: p.numbers.length,
      digits: p.numbers.map((num) => Int32Array.from(num)),
    },
  };
  dealt.set(p, made);
  return made;
}

/** The values the description reads in each square: the digit placed, and
 * {@link BLANK} where none goes. */
function valuesOf(p: CrossingPuzzle, grid: Uint8Array): Uint8Array {
  return Uint8Array.from(grid, (d, i) => (isBlank(p, i) ? BLANK : d));
}

/** The digits of a grid the description reads, `0` where none goes. */
const digitsOf = (values: ArrayLike<number>): Uint8Array =>
  Uint8Array.from(values, (v) => (v === BLANK ? 0 : v));

/** The run a binding names by its line and its first square. */
function runAt(p: CrossingPuzzle, sp: GridSpace, L: number, c: number): number {
  return sp.rowOf[c] === L ? p.acrossRun[c] : p.downRun[c];
}

// --- the ladder ----------------------------------------------------------------

/** Why a technique placed or struck, as the hint reads it: the run whose
 * fitting numbers it read and those numbers, or the two runs crossing at a
 * square. A check that only finds the marks inconsistent makes no fact, and
 * its reason is never read. */
type CrossingWhy =
  | { kind: "onlyNumber" | "onlyRun"; run: number; number: number }
  | { kind: "sharedDigit" | "narrow"; run: number; fitting: readonly number[] }
  | {
      kind: "crossRuns";
      across: number;
      down: number;
      acrossFitting: readonly number[];
      downFitting: readonly number[];
    }
  | { kind: "check" };

/** What a firing of technique `id` says, read as the runs and numbers it
 * names. */
function whyOf(p: CrossingPuzzle, id: string, f: Firing): CrossingWhy {
  const sp = spaceOf(p.w, p.h);
  const said = <T extends keyof crossing.SaysById>(
    _: T,
  ): crossing.SaysById[T]["terms"] =>
    (f.reasons[0] as Said<unknown, crossing.SaysById[T]>).says.terms;
  switch (id) {
    case "onlyNumber": {
      const { L, c, K } = said(id);
      return { kind: id, run: runAt(p, sp, L, c), number: K[0] };
    }
    case "onlyRun": {
      const { k, L, c } = said(id);
      return { kind: id, run: runAt(p, sp, L, c), number: k };
    }
    case "sharedDigit":
    case "narrow": {
      const { L, c, K } = said(id);
      return { kind: id, run: runAt(p, sp, L, c), fitting: K };
    }
    case "crossRuns": {
      const { x, KA, KB } = said(id);
      return {
        kind: id,
        across: p.acrossRun[x],
        down: p.downRun[x],
        acrossFitting: KA,
        downFitting: KB,
      };
    }
    default:
      return { kind: "check" };
  }
}

/** Each puzzle's ladder, made once. */
const ladders = new WeakMap<CrossingPuzzle, Ladder>();

/** The ladder over a puzzle's runs and numbers. */
function crossingLadder(p: CrossingPuzzle): Ladder {
  const kept = ladders.get(p);
  if (kept !== undefined) return kept;
  const dl = dealtOf(p);
  const made = describedLadder(crossing, {
    onlyNumber: compiledRung(crossing.onlyNumber, dl),
    onlyRun: compiledRung(crossing.onlyRun, dl),
    sharedDigit: compiledRung(crossing.sharedDigit, dl),
    crossRuns: compiledRung(crossing.crossRuns, dl),
    narrow: compiledRung(crossing.narrow, dl),
    misread: compiledRung(crossing.misread, dl),
    twice: compiledRung(crossing.twice, dl),
  });
  ladders.set(p, made);
  return made;
}

/** Marks over `grid`'s digits, every other square open to every digit, or
 * `null` where a digit sits where none can go. */
function marksOf(p: CrossingPuzzle, grid: Uint8Array): CellMarks | null {
  const sp = spaceOf(p.w, p.h);
  const dl = dealtOf(p);
  const m = new CellMarks(sp, VALUES, valuesOf(p, grid));
  return m.seed(m.grid, (c) => crossing.domainOf(sp, dl, c)) ? m : null;
}

/** Run the ladder on `m` to its fixpoint and say where that leaves it:
 * solved where every square is filled and the rules hold. */
function settle(p: CrossingPuzzle, m: CellMarks): Deduced {
  const techniques = ladderTechniques(m, crossingLadder(p).entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return crossing.isAnswer(m.grid, m.sp, dealtOf(p)) ? "solved" : "contradiction";
}

export interface CrossingSolveResult {
  status: SolveStatus;
  /** The grid the solver reached, complete where `status` is `"valid"`. */
  grid: Uint8Array;
}

const STATUS: Record<Deduced, SolveStatus> = {
  solved: "valid",
  stuck: "progress",
  contradiction: "invalid",
};

/**
 * Run the ladder from an empty grid. `"valid"` means the puzzle was solved
 * outright, every run full and every number used exactly once, which is what
 * the generator gates an Easy board on.
 */
export function solveCrossing(puzzle: CrossingPuzzle): CrossingSolveResult {
  const m = marksOf(puzzle, new Uint8Array(puzzle.w * puzzle.h));
  if (m === null)
    return { status: "invalid", grid: new Uint8Array(puzzle.w * puzzle.h) };
  return { status: STATUS[settle(puzzle, m)], grid: digitsOf(m.grid) };
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a puzzle's answers; the one answer is its
 * grid, `0` where no digit goes. */
export type CrossingAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a digit assumed
 * in a cell and the ladder run from it.
 *
 * It decides which Unreasonable boards exist: a puzzle that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. Measured 2026-10-11 over the
 * boards twenty seconds of draws found at each of twenty shapes from 4×2 to
 * 12×12 and 3×48: a median of 3 to 7, which is one square of two or three
 * digits tried each way, and 155 for the hardest. A board that runs it out
 * is not one that needed more: under the first two deductions alone, none of
 * the eight that did, tried again with 20,000, had one answer.
 */
const SEARCH_BUDGET = 2_000;

/** A search's position: the digits placed, and once the ladder has run on
 * them, what each square can still hold. */
interface Position {
  grid: Uint8Array;
  cands: Int32Array | null;
}

/**
 * Count a puzzle's answers up to two, by trial and error over the ladder:
 * where it stops, take the empty square with the fewest digits left and
 * assume each in turn.
 */
export function searchAnswers(
  puzzle: CrossingPuzzle,
  budget: number = SEARCH_BUDGET,
): CrossingAnswer {
  return searchBoard<Position, Uint8Array>({
    start: { grid: new Uint8Array(puzzle.w * puzzle.h), cands: null },
    deduce(pos) {
      const m = marksOf(puzzle, pos.grid);
      if (m === null) return "contradiction";
      const verdict = settle(puzzle, m);
      pos.grid = digitsOf(m.grid);
      pos.cands = m.cands.slice();
      return verdict;
    },
    assume: (pos) => assumeDigits(puzzle, pos),
    solution: (pos) => pos.grid,
    budget,
  });
}

/**
 * The positions a stuck one divides into: its empty square with the fewest
 * digits left, the first such in reading order, holding each of them. Only a
 * square some run passes through is taken, since a stuck board has an empty
 * one in a run.
 */
function assumeDigits(puzzle: CrossingPuzzle, pos: Position): Position[] {
  const { grid, cands } = pos;
  if (cands === null)
    throw new Error("crossing search: a position assumed before it settled");
  let at = -1;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] || isBlank(puzzle, i)) continue;
    if (at < 0 || popcount(cands[i]) < popcount(cands[at])) at = i;
  }
  const out: Position[] = [];
  if (at < 0) return out;
  for (let d = 1; d <= 9; d++) {
    if (!((cands[at] >> d) & 1)) continue;
    const next = grid.slice();
    next[at] = d;
    out.push({ grid: next, cands: null });
  }
  return out;
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
  /** `"cell"`: the entered digit is wrong; `"note"`: the cell's pencil notes
   * have ruled out the digit that belongs there. */
  kind: "cell" | "note";
}

/**
 * Check & Save's mistake check (docs/solver-and-generator.md § "The
 * solvable-game contract"): take the puzzle's one answer from the search over
 * its walls and numbers, then flag every player marking it contradicts: a
 * wrong entered digit, and (docs/mechanics.md § "Pencil marks: the full
 * note-taking UX") an empty cell whose *non-empty* notes exclude the
 * solution's digit. Notes carrying merely extra candidates are ordinary
 * mid-solve state and are not flagged.
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
      enc: { bit: noteBit },
      fixed: (i) => walls[i] !== 0,
    },
    gridCell(w),
  );
}

// --- the hint plan ------------------------------------------------------------
//
// The plan walks the compiled ladder's firings (`ladderWalk`) on marks read
// off the player's board: a square holds its entered digit, or else the digits
// its notes hold, or else any. Each firing is one step: a whole number into a
// run, one digit, or a square's notes narrowed, written in where it has none
// and struck where it has some. A step's move puts on the board exactly what
// the firing put on the marks, so each later firing reads what the board
// shows.

/** One deduction, named the way a player would name it. Every firing carries
 * the run(s) it reasons over and the listed numbers that are its premise: the
 * evidence lives half in the clue list, so it travels with the firing. */
export type CrossingFiring =
  | {
      technique: "onlyNumber";
      /** The run being filled. */
      run: number;
      /** The listed number it must be. */
      number: number;
      /** The run's still-empty cells as this firing fires: the squares the
       * move writes into, and so the ones the hint marks. */
      fill: number[];
      /** The premise: the numbers that still fit (here, just `number`). */
      fitting: number[];
      /** **What actually rules the others out**, the premise the narration
       * must state: `"length"`, no other listed number is this long;
       * `"used"`, the other numbers of this length are already written in
       * elsewhere; `"digits"`, the digits already in this run contradict
       * them; `"notes"`, the notes in the run's squares do. */
      because: "length" | "used" | "digits" | "notes";
    }
  | {
      technique: "onlyRun";
      /** The listed number, and the one run it still fits. */
      number: number;
      run: number;
      /** The run's still-empty cells, as `onlyNumber`'s. */
      fill: number[];
      /** The squares that rule the number out of the other runs of its length
       * with a square still empty: the ones whose digit or notes it disagrees
       * with. A full run needs no ruling out. */
      against: number[];
      /** How many such runs there are. */
      others: number;
      /** The premise's listed numbers: `number` alone. */
      fitting: number[];
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
      /** Each run's still-fitting numbers; `fitting` is both. */
      acrossFitting: number[];
      downFitting: number[];
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

/** The board a plan walks: the player's entries plus their notes. */
interface PlanBoard {
  puzzle: CrossingPuzzle;
  grid: Uint8Array;
  pencil: Int32Array;
}

/** The digits a candidate mask of the marks holds, lowest first. */
function digitList(mask: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if ((mask >> d) & 1) out.push(d);
  return out;
}

/** The digit number `l` puts in square `i` of run `r`. */
function digitAt(p: CrossingPuzzle, r: number, l: number, i: number): number {
  return p.numbers[l][p.runs[r].cells.indexOf(i)];
}

/** What square `i` shows it can hold, as a note mask: its entered digit,
 * else its notes, else any. */
function shown(board: PlanBoard, i: number): number {
  const { grid, pencil } = board;
  return grid[i] ? noteBit(grid[i]) : pencil[i] & ALL_NOTES || ALL_NOTES;
}

/** The firing a step of the walk makes, as the board shows it before the
 * step, or `null` where it changes nothing the board shows. */
function firingOf(board: PlanBoard, t: Taken): CrossingFiring | null {
  const { puzzle, grid } = board;
  const why = whyOf(puzzle, t.entry.id, t);
  const struck: number[] = [];
  for (let i = 0; i < t.facts.length; i += 3)
    if (t.facts[i] === STRIKE) struck.push(t.facts[i + 2]);
  const at = t.facts[1];
  switch (why.kind) {
    case "onlyNumber": {
      const { run, number } = why;
      const cells = puzzle.runs[run].cells;
      const fill = cells.filter((i) => grid[i] === 0);
      const sameLength = puzzle.numbers.filter((n) => n.length === cells.length).length;
      // Judged on the entered digits alone, does anything else still fit?
      const taken = placedRuns(puzzle, grid);
      const unnoted = puzzle.numbers.filter((_, l) =>
        numberAvailableTo(puzzle, grid, taken, run, l),
      ).length;
      return {
        technique: "onlyNumber",
        run,
        number,
        fill,
        fitting: [number],
        because:
          unnoted > 1
            ? "notes"
            : fill.length < cells.length
              ? "digits"
              : sameLength > 1
                ? "used"
                : "length",
      };
    }
    case "onlyRun": {
      const { run, number } = why;
      const num = puzzle.numbers[number];
      const against: number[] = [];
      let others = 0;
      puzzle.runs.forEach(({ cells }, r) => {
        if (r === run || cells.length !== num.length) return;
        if (cells.every((i) => grid[i] !== 0)) return;
        others++;
        against.push(...cells.filter((i, k) => !(shown(board, i) & noteBit(num[k]))));
      });
      return {
        technique: "onlyRun",
        run,
        number,
        fill: puzzle.runs[run].cells.filter((i) => grid[i] === 0),
        against,
        others,
        fitting: [number],
      };
    }
    case "sharedDigit": {
      const pos = puzzle.runs[why.run].cells.indexOf(at);
      return {
        technique: "sharedDigit",
        run: why.run,
        cell: at,
        pos,
        digit: t.facts[2],
        fitting: [...why.fitting],
      };
    }
    case "crossRuns": {
      const { across, down } = why;
      const allows = (r: number, ks: readonly number[]): number[] =>
        [...new Set(ks.map((l) => digitAt(puzzle, r, l, at)))].sort((a, b) => a - b);
      return {
        technique: "crossRuns",
        cell: at,
        digit: t.facts[2],
        acrossRun: across,
        downRun: down,
        acrossDigits: allows(across, why.acrossFitting),
        downDigits: allows(down, why.downFitting),
        acrossFitting: [...why.acrossFitting],
        downFitting: [...why.downFitting],
        fitting: [...why.acrossFitting, ...why.downFitting],
      };
    }
    case "narrow": {
      const notes = board.pencil[at] & ALL_NOTES;
      let gone = 0;
      for (const d of struck) gone |= noteBit(d);
      const note = { cell: at, run: why.run, fitting: [...why.fitting] };
      if (notes !== 0) {
        const digits = digitList((notes & gone) << 1);
        return digits.length === 0
          ? null
          : { technique: "noteStrike", ...note, digits };
      }
      return {
        technique: "noteDigits",
        ...note,
        digits: digitList((ALL_NOTES & ~gone) << 1),
      };
    }
    case "check":
      return null;
  }
}

/** Apply a firing to the plan's board. */
export function applyCrossingFiring(
  board: { puzzle: CrossingPuzzle; grid: Uint8Array; pencil: Int32Array },
  firing: CrossingFiring,
): void {
  const { puzzle, grid, pencil } = board;
  switch (firing.technique) {
    case "onlyNumber":
    case "onlyRun": {
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
      for (const d of firing.digits) pencil[firing.cell] |= noteBit(d);
      break;
    case "noteStrike":
      for (const d of firing.digits) pencil[firing.cell] &= ~noteBit(d);
      break;
  }
}

/** The squares a firing's premise reads, which the walk continues from: the
 * runs whose numbers it counts, and the squares it writes. */
function readsOf(p: CrossingPuzzle, t: Taken): number[] {
  const why = whyOf(p, t.entry.id, t);
  const out: number[] = [];
  for (let i = 0; i < t.facts.length; i += 3) out.push(t.facts[i + 1]);
  if (why.kind === "crossRuns")
    out.push(...p.runs[why.across].cells, ...p.runs[why.down].cells);
  else if (why.kind !== "check") out.push(...p.runs[why.run].cells);
  return out;
}

/** Plan-length cap: a UX bound, not a correctness one. The player rarely
 * follows more than a handful of steps before going their own way, and the
 * next request recomputes. */
const HINT_PLAN_MAX = 40;

export interface CrossingPlan {
  status: SolveStatus;
  firings: CrossingFiring[];
}

/** Marks over the plan board: its digits, and where a square holds notes,
 * only the digits noted. */
function boardMarks(board: PlanBoard): CellMarks | null {
  const { puzzle, grid, pencil } = board;
  const m = marksOf(puzzle, grid);
  if (m === null) return null;
  for (let i = 0; i < grid.length; i++) {
    const notes = pencil[i] & ALL_NOTES;
    if (grid[i] || isBlank(puzzle, i) || notes === 0) continue;
    for (let d = 1; d <= 9; d++) if (!(notes & noteBit(d))) m.strikeAt(i, d);
  }
  return m;
}

/** Whether a firing places a digit. */
const places = (f: { facts: readonly number[] }): boolean => {
  for (let i = 0; i < f.facts.length; i += 3) if (f.facts[i] !== STRIKE) return true;
  return false;
};

/**
 * The notes the next placement rests on, in the order they are written, or
 * `null` where no placement follows from notes at all. `narrow` runs ahead
 * on a copy of the board until a placing technique fires. That placement
 * rests on some listed numbers no longer fitting some runs; each stopped
 * fitting where one of its digits was first struck from its run, and that
 * strike rests in turn on the numbers of the striking run that carried the
 * digit there having stopped fitting before it. Only the strikes so reached
 * are kept, and a digit the board already rules out rests on nothing. So a
 * note step is always on the way to a digit, never a run noted for its own
 * sake.
 */
function aimedNotes(board: PlanBoard, entries: readonly LadderEntry[]): Taken[] | null {
  const { puzzle } = board;
  const { runs, numbers } = puzzle;
  const scratch = boardMarks(board);
  if (scratch === null) return null;
  const narrowing = entries.filter((e) => e.id === "narrow");
  const placing = entries.filter((e) => e.id !== "narrow");
  const walk = ladderWalk(scratch, narrowing, { [TIERS]: 0 }, (t) =>
    readsOf(puzzle, t),
  );
  const ahead: Taken[] = [];
  // When each digit left each square: -1 where the board rules it out, else
  // the step ahead that struck it.
  const STAYS = Number.MAX_SAFE_INTEGER;
  const struckAt = new Float64Array(scratch.cands.length * 16).fill(STAYS);
  for (let c = 0; c < scratch.cands.length; c++)
    for (let d = 1; d <= 9; d++)
      if (!((scratch.cands[c] >> d) & 1)) struckAt[c * 16 + d] = -1;
  const goalOf = (): Taken | null => {
    for (const entry of placing) {
      const got = entry.run.firings?.(scratch);
      if (got === undefined || got === "contradiction") continue;
      const f = got.find(places);
      if (f !== undefined) return { ...f, entry };
    }
    return null;
  };
  let goal = goalOf();
  while (goal === null) {
    const t = walk.next();
    if (t === null || t === "contradiction") return null;
    for (let i = 0; i < t.facts.length; i += 3) {
      const key = t.facts[i + 1] * 16 + t.facts[i + 2];
      if (t.facts[i] === STRIKE && struckAt[key] === STAYS)
        struckAt[key] = ahead.length;
    }
    ahead.push(t);
    goal = goalOf();
  }

  const placed = placedRuns(puzzle, board.grid);
  const needed = new Set<number>();
  /** The numbers of run `r`'s length other than `keep`, not yet written. */
  const others = (r: number, keep: readonly number[]): number[] => {
    const out: number[] = [];
    for (let l = 0; l < numbers.length; l++)
      if (
        placed[l] < 0 &&
        numbers[l].length === runs[r].cells.length &&
        !keep.includes(l)
      )
        out.push(l);
    return out;
  };
  const traced = new Set<number>();
  // Number `l` stopped fitting run `r`: where one of its digits went first.
  const ruledOut = (r: number, l: number): void => {
    const cells = runs[r].cells;
    let first = 0;
    for (let k = 1; k < cells.length; k++)
      if (
        struckAt[cells[k] * 16 + numbers[l][k]] <
        struckAt[cells[first] * 16 + numbers[l][first]]
      )
        first = k;
    struck(cells[first] * 16 + numbers[l][first]);
  };
  // The digit `key` left its square: every number of the striking run that
  // carried it there had stopped fitting before.
  const struck = (key: number): void => {
    const j = struckAt[key];
    if (j < 0 || j === STAYS || traced.has(key)) return;
    traced.add(key);
    needed.add(j);
    const why = whyOf(puzzle, ahead[j].entry.id, ahead[j]);
    if (why.kind !== "narrow") return;
    const pos = runs[why.run].cells.indexOf(key >> 4);
    for (const o of others(why.run, why.fitting))
      if (numbers[o][pos] === (key & 15)) ruledOut(why.run, o);
  };
  const why = whyOf(puzzle, goal.entry.id, goal);
  switch (why.kind) {
    case "onlyNumber":
      for (const l of others(why.run, [why.number])) ruledOut(why.run, l);
      break;
    case "onlyRun":
      runs.forEach(({ cells }, r) => {
        if (r !== why.run && cells.length === numbers[why.number].length)
          ruledOut(r, why.number);
      });
      break;
    case "sharedDigit":
    case "narrow":
      for (const l of others(why.run, why.fitting)) ruledOut(why.run, l);
      break;
    case "crossRuns":
      for (const l of others(why.across, why.acrossFitting)) ruledOut(why.across, l);
      for (const l of others(why.down, why.downFitting)) ruledOut(why.down, l);
      break;
    case "check":
      break;
  }
  return [...needed].sort((a, b) => a - b).map((j) => ahead[j]);
}

/** The run a `narrow` firing read. */
const narrowRun = (p: CrossingPuzzle, f: Firing): number => {
  const why = whyOf(p, "narrow", f);
  return why.kind === "narrow" ? why.run : -1;
};

/**
 * The plan from the player's own board, one firing a step. Digits come from
 * the placing techniques, continuing from the last step; where none shows,
 * the plan writes the notes the next one rests on ({@link aimedNotes}), and
 * where no digit follows from notes at all, it only strikes from the notes
 * the player wrote what their runs rule out.
 */
export function deduceCrossingPlan(state: CrossingState): CrossingPlan {
  const { puzzle } = state;
  const board: PlanBoard = {
    puzzle,
    grid: state.grid.slice(),
    pencil: state.pencil.slice(),
  };
  const firings: CrossingFiring[] = [];
  const m = boardMarks(board);
  if (m === null) return { status: "invalid", firings };
  const { entries } = crossingLadder(puzzle);
  const walk = ladderWalk(
    m,
    entries.filter((e) => e.id !== "narrow"),
    { [TIERS]: 0 },
    (t) => readsOf(puzzle, t),
  );
  const take = (t: Taken): void => {
    const f = firingOf(board, t);
    m.group++;
    m.applyFacts(t.facts, (i) => t.reasons[i / 3]);
    if (f === null) return;
    applyCrossingFiring(board, f);
    firings.push(f);
  };
  // Once no digit follows from notes, none will: the plan only strikes.
  let aimless = false;
  while (firings.length < HINT_PLAN_MAX) {
    const t = walk.next();
    if (t === "contradiction") break;
    if (t !== null) {
      const f = firingOf(board, t);
      if (f === null) continue;
      applyCrossingFiring(board, f);
      firings.push(f);
      continue;
    }
    const entry = entries.find((e) => e.id === "narrow");
    if (entry === undefined) break;
    const aimed = aimless ? null : aimedNotes(board, entries);
    if (aimed !== null && aimed.length > 0) {
      // Each is taken again as the board stands when it is written, so its
      // fitting numbers are the ones the board shows then.
      const before = firings.length;
      for (const n of aimed) {
        const now = entry.run.firings?.(m);
        if (now === undefined || now === "contradiction") break;
        const f = now.find(
          (g) =>
            g.facts[1] === n.facts[1] && narrowRun(puzzle, g) === narrowRun(puzzle, n),
        );
        if (f !== undefined) take({ ...f, entry });
      }
      // A plan that wrote nothing would find the same notes again.
      if (firings.length > before) continue;
    }
    aimless = true;
    const narrow = entry.run.firings?.(m);
    if (narrow === undefined || narrow === "contradiction") break;
    const strike = narrow
      .map((f): Taken => ({ ...f, entry }))
      .find((t) => firingOf(board, t)?.technique === "noteStrike");
    if (strike === undefined) break;
    take(strike);
  }
  return { status: validateBoard(puzzle, board.grid).status, firings };
}
