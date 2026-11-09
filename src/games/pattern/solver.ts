/**
 * Pattern's solver: the ladder `pattern.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The ladder is upstream's line solver (`do_row`): a line's squares that
 * every way its runs can fit, round what the line holds, gives one value.
 * It reasons about one row or column at a time, so it cannot crack a board
 * that needs the lines read together; an Easy board is one it finishes, so
 * its strength decides which Easy boards exist. Reaching a fixpoint, it
 * decides what upstream's does, in whatever order the lines are read.
 *
 * Beneath it, a search by trial and error over the ladder
 * ({@link searchAnswers}) counts a board's answers. It is what an
 * Unreasonable board is dealt by, and what Solve and the mistake check know
 * the answer from at either tier. The hint never runs it.
 *
 * The game keeps a square as `GRID_FULL`, `GRID_EMPTY` or `GRID_UNKNOWN`;
 * the description keeps 1 for shaded and 2 for clear, and 0 where a square
 * has neither yet.
 */
import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  describedSpace,
  type GridSpace,
  listClues,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { GameStatus } from "../../engine/types.ts";
import * as pattern from "./pattern.compiled.ts";
import {
  GRID_EMPTY,
  GRID_FULL,
  GRID_UNKNOWN,
  type GridVal,
  type PatternCommon,
  type PatternMistake,
  type PatternState,
} from "./state.ts";

/** The description's values. */
const SHADED = 1;
const CLEAR = 2;

// --- the board as the description reads it --------------------------------

const spaces = new Map<string, GridSpace>();

/** The space of a `w × h` board, built once a shape: its lines are its rows,
 * top first, then its columns, left first. */
function spaceOf(w: number, h: number): GridSpace {
  const key = `${w}x${h}`;
  let sp = spaces.get(key);
  if (sp === undefined) {
    sp = describedSpace(pattern.units, w, h);
    spaces.set(key, sp);
  }
  return sp;
}

/** The game's index of a line, columns `0..w-1` then rows, from the space's,
 * rows then columns. */
const gameLine = (L: number, w: number, h: number): number => (L < h ? w + L : L - h);

/** The board's numbers as the description deals them: every line's list. */
function dealtOf(
  w: number,
  h: number,
  clues: readonly (readonly number[])[],
): pattern.Dealt {
  const at: number[] = [];
  const lists: (readonly number[])[] = [];
  for (let L = 0; L < w + h; L++) {
    at.push(L);
    lists.push(clues[gameLine(L, w, h)]);
  }
  return { runs: listClues(at, lists, w + h) };
}

/** A square as the description holds it. */
const described = (v: number): number =>
  v === GRID_FULL ? SHADED : v === GRID_EMPTY ? CLEAR : 0;

/** Whether the board is solved: every square shaded or clear, by the rules
 * the description compiles to. */
export function isComplete(state: PatternState): boolean {
  const { w, h, clues } = state.common;
  return pattern.isAnswer(
    Uint8Array.from(state.grid, described),
    spaceOf(w, h),
    dealtOf(w, h, clues),
  );
}

export function status(state: PatternState): GameStatus {
  return isComplete(state) ? "solved" : "ongoing";
}

// --- the ladder ---------------------------------------------------------------

/** Why a set of cells is forced, driving the hint's narration. The ladder's
 * one technique, `line`, is told one of four ways, by what the firing's
 * cells are on its line: a run's overlap, out of every run's reach, a line
 * with no runs, or none of those, which is every fit agreeing. `line` is the
 * space's line, which a hint plan continues along. */
export type PatternHintReason = { line: number } & (
  | { kind: "overlap"; run: number; slack: number; shaded: number[]; clear: number[] }
  | { kind: "unreachable" } // clear: no run reaches these cells
  | { kind: "lineEmpty" } // clear: the line has no clues at all
  | { kind: "intersection"; black: boolean }
); // forced in every arrangement of the line's runs

/** The rungs a hint step can be: the reasons' kinds. */
export const PATTERN_RUNGS = [
  "overlap",
  "unreachable",
  "lineEmpty",
  "intersection",
] as const;
export type PatternRung = (typeof PATTERN_RUNGS)[number];

/**
 * Each run's start packed as far towards the line's start as its marks
 * allow, the least start it has in any fit; `null` where none fits. A run
 * starts no earlier than the one before it ends, past a gap, nor on or after
 * a clear square it would cover, nor so late it leaves a shaded square
 * behind it uncovered.
 */
function packLeft(runs: readonly number[], held: readonly number[]): number[] | null {
  const len = held.length;
  const starts = new Array<number>(runs.length);
  const rec = (ndone: number, pos: number): boolean => {
    if (ndone === runs.length) {
      for (let i = pos; i < len; i++) if (held[i] === SHADED) return false;
      return true;
    }
    const r = runs[ndone];
    let firstShaded = len;
    for (let i = pos; i < len; i++)
      if (held[i] === SHADED) {
        firstShaded = i;
        break;
      }
    for (let start = pos; start <= Math.min(len - r, firstShaded); start++) {
      let fits = true;
      for (let k = 0; k < r && fits; k++) if (held[start + k] === CLEAR) fits = false;
      if (!fits || (start + r < len && held[start + r] === SHADED)) continue;
      if (rec(ndone + 1, start + r + 1)) {
        starts[ndone] = start;
        return true;
      }
    }
    return false;
  };
  return rec(0, 0) ? starts : null;
}

/** Each run's greatest start in any fit: {@link packLeft} on the line
 * read backwards. */
function packRight(runs: readonly number[], held: readonly number[]): number[] | null {
  const len = held.length;
  const back = packLeft([...runs].reverse(), [...held].reverse());
  if (back === null) return null;
  const k = runs.length;
  return runs.map((r, j) => len - back[k - 1 - j] - r);
}

/**
 * How a firing of `line` is told: the cells `cells` of line `L`, given the
 * value `d` by every fit of its runs `R` on the marks `m` as the firing
 * found them. A run covers the same squares in every fit between its
 * least start and its greatest plus its length, so cells all in that span
 * are its overlap; a clear cell is out of reach where it is outside every
 * run's span from its least start to its greatest end.
 */
function reasonOf(
  m: CellMarks,
  L: number,
  R: ArrayLike<number>,
  d: number,
  cells: readonly number[],
): PatternHintReason {
  const line = m.sp.lineCells[L];
  const runs = Array.from(R);
  if (runs.length === 0) return { line: L, kind: "lineEmpty" };
  const held = line.map((c) => m.grid[c]);
  const at = cells.map((c) => line.indexOf(c));
  const lo = packLeft(runs, held);
  const hi = packRight(runs, held);
  if (lo !== null && hi !== null) {
    if (d === SHADED) {
      for (let i = 0; i < runs.length; i++) {
        const from = hi[i];
        const to = lo[i] + runs[i];
        if (!at.every((p) => p >= from && p < to)) continue;
        // The marks that hold the run between its two packings.
        const shaded: number[] = [];
        const clear: number[] = [];
        for (let p = lo[i]; p < hi[i] + runs[i]; p++)
          if (held[p] === SHADED) shaded.push(line[p]);
          else if (held[p] === CLEAR) clear.push(line[p]);
        return {
          line: L,
          kind: "overlap",
          run: runs[i],
          slack: hi[i] - lo[i],
          shaded,
          clear,
        };
      }
    } else if (at.every((p) => runs.every((r, i) => p < lo[i] || p >= hi[i] + r)))
      return { line: L, kind: "unreachable" };
  }
  return { line: L, kind: "intersection", black: d === SHADED };
}

/** The ladder over the dealt numbers. A firing's reason is made once, from
 * the marks before any of its facts land. */
function patternLadder(dl: pattern.Dealt): Ladder {
  const made = new WeakMap<pattern.LineBinding, PatternHintReason>();
  return describedLadder(pattern, {
    line: compiledRung(pattern.line, dl, (binding, _c, _n, m): PatternHintReason => {
      let reason = made.get(binding);
      if (reason === undefined) {
        const { L, R, d, O, c } = binding;
        const line = m.sp.lineCells[L];
        const from = line.indexOf(c);
        const cells: number[] = [];
        for (let p = from; p < line.length && O.includes(line[p]); p++)
          cells.push(line[p]);
        reason = reasonOf(m, L, R ?? [], d, cells);
        made.set(binding, reason);
      }
      return reason;
    }),
  });
}

/** The marks over `grid`, a described value a square, each square holding
 * one placed. */
function marksOf(sp: GridSpace, grid: Uint8Array): CellMarks {
  const m = new CellMarks(sp, rangeMask(SHADED, CLEAR), grid);
  m.seed(grid);
  return m;
}

/** A board's described squares from the squares a picture desc fixes, or
 * none: only such a desc fixes any. */
function startOf(
  w: number,
  h: number,
  seedGrid?: Uint8Array,
  immutable?: Uint8Array,
): Uint8Array {
  const grid = new Uint8Array(w * h);
  if (seedGrid && immutable)
    for (let i = 0; i < w * h; i++) if (immutable[i]) grid[i] = described(seedGrid[i]);
  return grid;
}

/** Run the ladder on `m` to a fixpoint and say what it reached. */
function deduce(m: CellMarks, ladder: Ladder, dl: pattern.Dealt): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return pattern.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** Run the lines from the squares a picture desc fixes, if any: whether they
 * decide every square. */
function solvePuzzle(
  w: number,
  h: number,
  clues: readonly (readonly number[])[],
  seedGrid?: Uint8Array,
  immutable?: Uint8Array,
): boolean {
  const dl = dealtOf(w, h, clues);
  const m = marksOf(spaceOf(w, h), startOf(w, h, seedGrid, immutable));
  return deduce(m, patternLadder(dl), dl) === "solved";
}

/** Whether the clue set is fully line-solvable from a blank grid (the
 * generator's uniqueness gate). */
export function isSoluble(
  w: number,
  h: number,
  clues: readonly (readonly number[])[],
): boolean {
  return solvePuzzle(w, h, clues);
}

/** What a search established about a board's answers; the one answer is its
 * squares as `GRID_*` values. */
export type PatternAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a square
 * assumed and the lines deduced from it.
 *
 * It decides which Unreasonable boards exist: a picture that needs more is
 * thrown away when dealing and refused when pasted. Of 225 boards dealt at
 * 30x30 the hardest needed 1,105 and the median 17, and a 30x30 board that
 * runs the budget out costs about half a second. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder:
 * where no line decides a square, assume it shaded, then clear, and deduce
 * on.
 */
export function searchAnswers(
  w: number,
  h: number,
  clues: readonly (readonly number[])[],
  seedGrid?: Uint8Array,
  immutable?: Uint8Array,
  budget: number = SEARCH_BUDGET,
): PatternAnswer {
  const dl = dealtOf(w, h, clues);
  const ladder = patternLadder(dl);
  return searchBoard<CellMarks, Uint8Array>({
    start: marksOf(spaceOf(w, h), startOf(w, h, seedGrid, immutable)),
    deduce: (m) => deduce(m, ladder, dl),
    assume(m) {
      const at = branchSquare(m.grid, w, h);
      return [SHADED, CLEAR].map((d) => {
        const sub = new CellMarks(m.sp, m.domain, m.grid.slice());
        sub.cands.set(m.cands);
        sub.place(at, d);
        return sub;
      });
    },
    solution: (m) =>
      Uint8Array.from(m.grid, (v) => (v === SHADED ? GRID_FULL : GRID_EMPTY)),
    budget,
  });
}

/** The undecided square to assume next: the one with the most decided
 * squares or edges beside it, since its lines are the nearest to deciding
 * more. */
function branchSquare(grid: ArrayLike<number>, w: number, h: number): number {
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < w * h; i++) {
    if (grid[i] !== 0) continue;
    const x = i % w;
    const y = (i / w) | 0;
    let score = 0;
    if (x === 0 || grid[i - 1] !== 0) score++;
    if (x === w - 1 || grid[i + 1] !== 0) score++;
    if (y === 0 || grid[i - w] !== 0) score++;
    if (y === h - 1 || grid[i + w] !== 0) score++;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

/** Whether the lines alone decide every square of a state's board, from its
 * clues and any squares a picture desc fixes: what an Easy board is. */
export function linesDecide(state: PatternState): boolean {
  const { w, h, clues, immutable } = state.common;
  return solvePuzzle(w, h, clues, state.grid, immutable);
}

/** Keyed on `common`, which every state of a game shares. */
const answers = answerCache<PatternCommon, Uint8Array>();

/** What a search of a state's board established about its answers, from its
 * clues and any squares a picture desc fixes. The player's marks are not
 * read. */
export function answerOf(state: PatternState): PatternAnswer {
  const { w, h, clues, immutable } = state.common;
  return answers(state.common, () => searchAnswers(w, h, clues, state.grid, immutable));
}

/** The board's one answer as `GRID_*` values, or `null` where the search
 * found several, none, or ran out. */
export function solveState(state: PatternState): Uint8Array | null {
  const answer = answerOf(state);
  return answer.kind === "one" ? answer.solution : null;
}

/**
 * Live error check for one line (upstream `check_errors`): is the line's
 * pattern of *complete runs* (maximal `GRID_FULL` runs bounded by
 * `GRID_EMPTY` or the line ends) inconsistent with its clue list? The check
 * is deliberately weak — it ignores `GRID_UNKNOWN`-separated gaps so a typo
 * doesn't light up crossing lines as a spoiler. Returns true on error.
 */
export function lineHasError(state: PatternState, line: number): boolean {
  const { w, h, clues } = state.common;
  const { grid } = state;
  const rowdata = clues[line];
  const rowlen = rowdata.length;
  // Pretend the clue list has a 0 at each end.
  const ROWDATA = (k: number): number => (k < 0 || k >= rowlen ? 0 : rowdata[k]);

  let rowpos = 0;
  let ncontig = 1; // pretend we've already seen the initial zero run

  const foundRun = (r: number): boolean => {
    for (let newpos = rowpos; newpos <= rowlen; newpos++) {
      if (ROWDATA(newpos) !== r) continue;
      let match = true;
      for (let m = 1; m <= ncontig; m++) {
        if (ROWDATA(newpos - m) !== ROWDATA(rowpos - m)) {
          match = false;
          break;
        }
      }
      if (!match) continue;
      rowpos = newpos + 1;
      ncontig++;
      return true;
    }
    return false;
  };

  let start: number;
  let step: number;
  let end: number;
  if (line < w) {
    start = line;
    step = w;
    end = start + step * h;
  } else {
    start = (line - w) * w;
    step = 1;
    end = start + step * w;
  }

  let runlen = -1;
  for (let j = start - step; j <= end; j += step) {
    const val = j < start || j === end ? GRID_EMPTY : grid[j];
    if (val === GRID_UNKNOWN) {
      runlen = -1;
      ncontig = 0;
    } else if (val === GRID_FULL) {
      if (runlen >= 0) runlen++;
    } else {
      // GRID_EMPTY
      if (runlen > 0 && !foundRun(runlen)) return true;
      runlen = 0;
    }
  }
  // Terminating zero run, contiguous iff no GRID_UNKNOWN intervened.
  if (!foundRun(0)) return true;
  return false;
}

// --- the hint -----------------------------------------------------------------

/** One hint step: an unbroken stretch of same-value cells one line forces,
 * the line reasoned over (for the line-of-sight shade and clue, the game's
 * index), the reason, and the already-placed marks an overlap leans on
 * (ringed by their own color). All indices are absolute grid positions. */
export interface PatternHintMove {
  cells: number[];
  value: GridVal; // GRID_FULL (black) or GRID_EMPTY (white)
  line: number; // 0..w-1 columns, w..w+h-1 rows
  reason: PatternHintReason;
  blackRefs: number[];
  whiteRefs: number[];
}

/**
 * A hint plan from the player's current marks: the ladder's firings, one a
 * step, each the one beside the plan's last where there is one
 * (`ladderWalk`), so a plan works the lines through the cells it has just
 * decided before it moves on. Each step is made before the next is found,
 * so every step's narration and highlight reflect the board as that step
 * fires, and a fresh plan resumes from any position (docs/hints.md § "A
 * hint must resume from any position").
 */
export function deduceHintPlan(state: PatternState): PatternHintMove[] {
  const { w, h, clues } = state.common;
  const dl = dealtOf(w, h, clues);
  const m = marksOf(spaceOf(w, h), Uint8Array.from(state.grid, described));
  m.budget = stepBudget("pattern hint");
  const reasonOfTaken = (f: Taken): PatternHintReason =>
    f.reasons[0] as PatternHintReason;
  // A firing reads its own line.
  const walk = ladderWalk(m, patternLadder(dl).entries, { [TIERS]: 0 }, (f) => [
    ...m.sp.lineCells[reasonOfTaken(f).line],
  ]);
  const plan: PatternHintMove[] = [];
  for (let f = walk.next(); f !== null && f !== "contradiction"; f = walk.next()) {
    const reason = reasonOfTaken(f);
    const cells: number[] = [];
    for (let i = 0; i < f.facts.length; i += 3) cells.push(f.facts[i + 1]);
    const value = f.facts[2] === SHADED ? GRID_FULL : GRID_EMPTY;
    plan.push({
      cells,
      value,
      line: gameLine(reason.line, w, h),
      reason,
      blackRefs: reason.kind === "overlap" ? reason.shaded : [],
      whiteRefs: reason.kind === "overlap" ? reason.clear : [],
    });
  }
  return plan;
}

/** Every player-marked cell that contradicts the board's one answer. Returns
 * `[]` when no single answer was found (nothing to check against) or when
 * there are no contradictions. */
export function findMistakes(state: PatternState): readonly PatternMistake[] {
  const solution = solveState(state);
  if (!solution) return [];
  const { w, h } = state.common;
  const { grid } = state;
  const out: PatternMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (grid[i] !== GRID_UNKNOWN && grid[i] !== solution[i]) out.push({ x, y });
    }
  }
  return out;
}
