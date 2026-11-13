/**
 * ABCD's explained hint: the shared candidate walk (`runCandidatePlan`), with
 * ABCD's no-touch reach and its two line rungs.
 *
 * **Deduced from the player's notes, as Seismic's is.** `findMistakes` refuses
 * the hint on any note that has crossed out its cell's answer, so wherever this
 * runs every cell's notes still hold that answer, and a line's count read off
 * them is as sound as one read off the solver's own candidates. So the plan
 * records nothing: its rungs read the candidates the walk shows
 * (`RungContext.shown`), which is also what the player can check on screen.
 *
 * **Each rung is one firing of a compiled line technique** ({@link lineFirings}):
 * `satisfied` and `runs`, run on the letters placed and the notes shown. The
 * description's `single` is the walk's naked single and its placement strikes
 * the walk's `reach`, so those two are the walk's own. The frontier chooses
 * which line goes next, so the order the ladder fires in never reaches the
 * player.
 */

import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  candidateGesture,
  keepCandidateHintTrack,
  type Mark,
  type NoteEncoding,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  CANDIDATE_RUNGS,
  type CandidateRung,
  type Firing,
  type PlanRung,
  runCandidatePlan,
} from "../../engine/candidate-plan.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { rangeMask } from "../../engine/describe-runtime.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import { candidateConclusions } from "../../engine/hint-text.ts";
import {
  CellMarks,
  type Ladder,
  type Said,
  techniqueFirings,
} from "../../engine/ladder-runtime.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import type { NoteTakingUi } from "../../engine/note-taking-cell.ts";
import type { Point } from "../../engine/types.ts";
import type { SaysById } from "./abcd.compiled.ts";
import { LETTERS, type LineMarks, type LineWord, say } from "./hint-text.ts";
import { abcdLadder, abcdSpace, dealtOf, neighbors } from "./solver.ts";
import {
  type AbcdMove,
  type AbcdParams,
  type AbcdState,
  horClue,
  letterBit,
  verClue,
} from "./state.ts";

/** A candidate hint's highlights, and the clue whose count the step reads,
 * as its index in `numbers`. */
export type AbcdHint = CandidateHighlights & { clue?: number };

/** Why a letter is placed or ruled out. Letters are the walk's values `1..n`. */
type AbcdReason =
  /** Its notes are down to one. */
  | { kind: "single" }
  /** It has no notes, and every other letter is already next to it. */
  | { kind: "regionsFull" }
  /** The line already holds its count of `n` (or its count is 0). */
  | { kind: "satisfied"; line: Line; n: number; clue: number }
  /** The line's open cells fit only as many `n` as it needs. */
  | {
      kind: "packed";
      line: Line;
      n: number;
      need: number;
      more: boolean;
      only: boolean;
      open: Point[];
    };

/** Every rung an ABCD step can be: the walk's own, and the kinds of
 * {@link AbcdReason}. */
export const ABCD_RUNGS = [
  ...CANDIDATE_RUNGS,
  "single",
  "regionsFull",
  "satisfied",
  "packed",
] as const;
export type AbcdRung = (typeof ABCD_RUNGS)[number];

/** A row or column, and its cells in order. */
interface Line {
  word: LineWord;
  /** The index in `numbers` of this line's clue for letter 0. */
  clueBase: number;
  cells: number[];
}

/** The candidate walk's move dialect: a move names letter `i` by its index,
 * and the walk, like the grid, by `i + 1`. */
const abcdCandidateMoves: CandidateMoveAdapter<AbcdMove> = {
  read: (m) => {
    const toWalk = (marks: readonly { x: number; y: number; letter: number }[]) =>
      marks.map(({ x, y, letter }) => ({ x, y, n: letter + 1 }));
    switch (m.type) {
      case "enter":
        return m.letter === null
          ? null
          : { type: "set", x: m.x, y: m.y, n: m.letter + 1, pencil: false };
      case "pencil":
        return { type: "set", x: m.x, y: m.y, n: m.letter + 1, pencil: true };
      case "pencilAll":
        return m;
      case "pencilStrike":
        return { type: "pencilStrike", marks: toWalk(m.marks) };
      case "pencilAdd":
        return { type: "pencilAdd", marks: toWalk(m.marks) };
      default:
        return null;
    }
  },
  strike: (marks) => ({ type: "pencilStrike", marks: toMove(marks) }),
  add: (marks) => ({ type: "pencilAdd", marks: toMove(marks) }),
  place: (x, y, n) => ({ type: "enter", x, y, letter: n - 1 }),
  bit: (n) => letterBit(n - 1),
};

function toMove(marks: readonly Mark[]): { x: number; y: number; letter: number }[] {
  return marks.map(({ x, y, n }) => ({ x, y, letter: n - 1 }));
}

/** Every row, then every column. */
function linesOf(p: AbcdParams): Line[] {
  const { w, h, n } = p;
  const lines: Line[] = [];
  for (let y = 0; y < h; y++)
    lines.push({
      word: "row",
      clueBase: horClue(y, 0, n),
      cells: Array.from({ length: w }, (_, x) => y * w + x),
    });
  for (let x = 0; x < w; x++)
    lines.push({
      word: "column",
      clueBase: verClue(x, 0, n, h),
      cells: Array.from({ length: h }, (_, y) => y * w + x),
    });
  return lines;
}

/**
 * The firings of the line technique `id` on the board the walk shows: the
 * letters placed, and each empty cell's notes as its candidates. Each is the
 * line, the letter, the line's number for it, and the cells it strikes or
 * places.
 */
function lineFirings(
  p: AbcdParams,
  ladder: Ladder,
  grid: Int8Array,
  shown: ArrayLike<number>,
  id: "satisfied" | "runs",
): { line: number; n: number; clue: number; cells: number[] }[] {
  const m = new CellMarks(abcdSpace(p), rangeMask(1, p.n), grid);
  for (let i = 0; i < grid.length; i++)
    m.cands[i] = grid[i] ? 1 << grid[i] : shown[i] << 1;
  return techniqueFirings(ladder, id, m).map(({ facts, reasons }) => {
    const { L, d, v } = (reasons[0] as Said<unknown, SaysById[typeof id]>).says.terms;
    const cells: number[] = [];
    for (let i = 0; i < facts.length; i += 3) cells.push(facts[i + 1]);
    return { line: L, n: d, clue: v, cells };
  });
}

type Rung = CandidateRung<AbcdMove, AbcdHint, DeductionRecord, AbcdReason>;
type AbcdFiring = Firing<AbcdMove, AbcdHint, AbcdReason>;

export function buildSteps(
  state: AbcdState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<AbcdMove, AbcdHint, AbcdRung>[] {
  const p = state.params;
  const { w, diag } = p;
  const grid = state.grid.slice();
  // A placed cell carries no notes on the walk's board.
  const pencil = Int32Array.from(state.pencil, (v, i) => (grid[i] ? 0 : v));
  const cellOf = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });

  const reached = new Map<number, number[]>();
  const reach = (i: number): number[] => {
    let cells = reached.get(i);
    if (!cells) {
      cells = neighbors(p, i);
      reached.set(i, cells);
    }
    return cells;
  };
  const enc: NoteEncoding = {
    bit: (n) => letterBit(n - 1),
    values: p.n,
    all: () => (1 << p.n) - 1,
  };

  // Both line rungs strike or place notes, so they wait for the setup; the
  // runs technique is the solver's last resort, so it waits for the others.
  const lines = linesOf(p);
  const ladder = abcdLadder(p, dealtOf(p, state.numbers));
  const satisfied: Rung = ({ populated, shown }) =>
    populated
      ? lineFirings(p, ladder, grid, shown, "satisfied").map(
          ({ line, n, clue, cells }): AbcdFiring => [
            {
              strike: cells.map((i) => ({ ...cellOf(i), n })),
              reason: { kind: "satisfied", line: lines[line], n, clue },
            },
          ],
        )
      : [];
  const packed: Rung = ({ populated, nothingEarlier, shown }) =>
    populated && nothingEarlier
      ? lineFirings(p, ladder, grid, shown, "runs").map(
          ({ line: L, n, clue, cells }): AbcdFiring => {
            const line = lines[L];
            const placed = line.cells.filter((i) => grid[i] === n).length;
            const open = line.cells.filter(
              (i) => grid[i] === 0 && (shown[i] & letterBit(n - 1)) !== 0,
            );
            const reason: AbcdReason = {
              kind: "packed",
              line,
              n,
              need: clue - placed,
              more: placed > 0,
              only: cells.length === open.length,
              open: open.map(cellOf),
            };
            return cells.map((i) => ({ place: { ...cellOf(i), n }, reason }));
          },
        )
      : [];

  /** The line a step names, as its words mark it: striped, with its clue for
   * `n` the count the words read. */
  const marksOf = (line: Line, n: number): LineMarks => ({
    word: line.word,
    cells: line.cells.map(cellOf),
    clue: line.clueBase + n - 1,
  });

  const steps: HintStep<AbcdMove, AbcdHint, PlanRung<AbcdReason>>[] = [];
  runCandidatePlan<AbcdMove, AbcdHint, DeductionRecord, AbcdReason, CellRegion>({
    w,
    steps,
    grid,
    pencil,
    enc,
    moves: abcdCandidateMoves,
    autoClean,
    reading,
    label: "abcd hint plan",
    record: () => [],
    // No region holds every letter or forbids a repeat: a line's rule is a
    // count, which the rungs read, and the no-touch rule is `reach`.
    regionsOf: () => [],
    reach,
    rungs: [satisfied, packed],
    singleReason: (_n, why) => {
      if (why.kind === "hidden")
        throw new Error("abcd: no region holds a hidden single");
      return why.kind === "naked" ? { kind: "single" } : { kind: "regionsFull" };
    },
    placeWords: (m, reason, continues) => {
      switch (reason.kind) {
        case "single":
          return { words: say.naked(m, w) };
        case "regionsFull":
          return { words: say.regionsFull(m, diag) };
        case "packed": {
          const { line, n, need, more, only, open } = reason;
          const lm = marksOf(line, n);
          // A later leg points back at the line and reads no count; the first
          // reads the clue, and a lone home needs no outline, since the ring
          // is the whole premise.
          if (continues) return { words: say.alsoForced(lm, m) };
          return {
            words: only
              ? say.onlyHomes(lm, m, need, more, open)
              : say.packed(lm, m, need, more, open),
            clue: lm.clue,
          };
        }
        default:
          throw new Error(`abcd: a ${reason.kind} places nothing`);
      }
    },
    strikeWords: (marks, reason) => {
      switch (reason.kind) {
        case "dup":
          return {
            premise: say.cull({ x: reason.px, y: reason.py }, reason.n, diag),
            struck: say.culled(reason.n),
          };
        case "satisfied": {
          const { line, n, clue } = reason;
          const lm = marksOf(line, n);
          const placed = line.cells.filter((i) => grid[i] === n).map(cellOf);
          return {
            premise: say.satisfied(lm, n, clue, placed),
            struck: say.satisfiedStruck(n, clue, marks.length),
            clue: lm.clue,
          };
        }
        default:
          throw new Error(`abcd: a ${reason.kind} strikes nothing`);
      }
    },
    conclude: candidateConclusions({ value: LETTERS.value }),
    notes: {
      populate: say.populate,
      cleanObvious: say.clean(diag),
      note: (at, values, every) => say.note(at, values, every, diag),
    },
  });
  return steps;
}

export function hintKeepTrack(
  m: AbcdMove,
  step: HintStep<AbcdMove, AbcdHint, AbcdRung>,
  state: AbcdState,
): HintTrackVerdict {
  return keepCandidateHintTrack(
    m,
    step,
    state.pencil,
    state.params.w,
    abcdCandidateMoves,
  );
}

/** How the pointer makes a step's `move`, with `at` the middle of a cell,
 * `code` the keypad key that types walk value `n` (letter `n - 1`) and
 * `markAll` what the mark-all control makes now. */
export function hintGesture(
  ui: NoteTakingUi,
  at: (x: number, y: number) => Point,
  code: (n: number) => number,
  move: AbcdMove,
  markAll: AbcdMove | null,
): PointerAction[] {
  return candidateGesture(move, ui, at, code, abcdCandidateMoves, markAll);
}

export function refreshHintStep(
  step: HintStep<AbcdMove, AbcdHint, AbcdRung>,
  state: AbcdState,
): HintStep<AbcdMove, AbcdHint, AbcdRung> | null {
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.params.w,
    abcdCandidateMoves,
  );
}
