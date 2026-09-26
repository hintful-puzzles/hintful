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
 * **Each rung is one line's firing of a solver technique.** The solver's
 * techniques sweep every line and letter per call and apply all they find; a
 * hint step is one line. Technique 2 is the walk's naked singles and the
 * placement cull is `placeLetter`'s neighbor rule-out, so what is left is
 * {@link satisfiedLines} (technique 1) and {@link packedLines} (technique 3),
 * whose arithmetic is the solver's own `runsForce`. The frontier chooses which
 * line goes next, so the order the solver sweeps in never reaches the player.
 */

import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  keepCandidateHintTrack,
  type Mark,
  type NoteEncoding,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  type CandidateRung,
  type Firing,
  runCandidatePlan,
} from "../../engine/candidate-plan.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { candidateConclusions } from "../../engine/hint-text.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import type { Point } from "../../engine/types.ts";
import { LETTERS, type LineWord, say } from "./hint-text.ts";
import { neighbors, runsForce } from "./solver.ts";
import {
  type AbcdMove,
  type AbcdParams,
  type AbcdState,
  horClue,
  letterBit,
  NO_NUMBER,
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
 * Technique 1, one line at a time: a line already holding its count of a
 * letter, or whose count is 0, while some empty cell in it still shows that
 * letter. The struck cells, the placed letters they rest on, and the count.
 */
function* satisfiedLines(
  p: AbcdParams,
  grid: ArrayLike<number>,
  shown: ArrayLike<number>,
  numbers: Int32Array,
): Generator<{
  line: Line;
  n: number;
  clue: number;
  struck: number[];
  placed: number[];
}> {
  for (const line of linesOf(p))
    for (let n = 1; n <= p.n; n++) {
      const clue = numbers[line.clueBase + n - 1];
      if (clue === NO_NUMBER) continue;
      const placed = line.cells.filter((i) => grid[i] === n);
      if (placed.length !== clue) continue;
      const struck = line.cells.filter(
        (i) => grid[i] === 0 && (shown[i] & letterBit(n - 1)) !== 0,
      );
      if (struck.length > 0) yield { line, n, clue, struck, placed };
    }
}

/**
 * Technique 3, one line at a time: a line whose open cells for a letter fit
 * only as many as it still needs, and the cells that forces. `open` is every
 * empty cell still showing the letter.
 */
export function* packedLines(
  p: AbcdParams,
  grid: ArrayLike<number>,
  shown: ArrayLike<number>,
  numbers: Int32Array,
): Generator<{
  line: Line;
  n: number;
  need: number;
  more: boolean;
  open: number[];
  forced: number[];
}> {
  for (const line of linesOf(p))
    for (let n = 1; n <= p.n; n++) {
      const clue = numbers[line.clueBase + n - 1];
      if (clue === NO_NUMBER) continue;
      const placed = line.cells.filter((i) => grid[i] === n).length;
      const need = clue - placed;
      if (need <= 0) continue;
      const isOpen = line.cells.map(
        (i) => grid[i] === 0 && (shown[i] & letterBit(n - 1)) !== 0,
      );
      const { forced } = runsForce(isOpen, need);
      if (forced.length === 0) continue;
      yield {
        line,
        n,
        need,
        more: placed > 0,
        open: line.cells.filter((_, k) => isOpen[k]),
        forced: forced.map((k) => line.cells[k]),
      };
    }
}

type Rung = CandidateRung<AbcdMove, AbcdHint, DeductionRecord, AbcdReason>;
type AbcdFiring = Firing<AbcdMove, AbcdHint, AbcdReason>;

export function buildSteps(
  state: AbcdState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<AbcdMove, AbcdHint>[] {
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
  const satisfied: Rung = ({ populated, shown }) =>
    populated
      ? [...satisfiedLines(p, grid, shown, state.numbers)].map(
          ({ line, n, clue, struck }): AbcdFiring => [
            {
              strike: struck.map((i) => ({ ...cellOf(i), n })),
              reason: { kind: "satisfied", line, n, clue },
            },
          ],
        )
      : [];
  const packed: Rung = ({ populated, nothingEarlier, shown }) =>
    populated && nothingEarlier
      ? [...packedLines(p, grid, shown, state.numbers)].map(
          ({ line, n, need, more, open, forced }): AbcdFiring => {
            const reason: AbcdReason = {
              kind: "packed",
              line,
              n,
              need,
              more,
              only: forced.length === open.length,
              open: open.map(cellOf),
            };
            return forced.map((i) => ({ place: { ...cellOf(i), n }, reason }));
          },
        )
      : [];

  const lineWords = (line: Line, n: number) => ({
    hatch: line.cells.map(cellOf),
    clue: line.clueBase + n - 1,
  });

  const steps: HintStep<AbcdMove, AbcdHint>[] = [];
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
          return { explanation: say.naked(m.n), area: [] };
        case "regionsFull":
          return { explanation: say.regionsFull(m.n, diag), area: [] };
        case "packed": {
          const { line, n, need, more, only, open } = reason;
          const explanation = continues
            ? say.alsoForced(n)
            : only
              ? say.onlyHomes(line.word, n, need, more)
              : say.packed(line.word, n, need, more);
          // A lone home needs no outline: the ring is the whole premise.
          return {
            explanation,
            area: open.length > 1 ? open : [],
            ...lineWords(line, n),
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
            premise: say.cull(reason.n, diag),
            struck: say.culled(reason.n),
            area: [{ x: reason.px, y: reason.py }],
          };
        case "satisfied": {
          const { line, n, clue } = reason;
          const placed = line.cells.filter((i) => grid[i] === n).map(cellOf);
          return {
            premise: say.satisfied(line.word, n, clue),
            struck: say.satisfiedStruck(n, clue, marks.length),
            area: placed,
            ...lineWords(line, n),
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
      note: (_cell, values, every) => say.note(values, every, diag),
    },
  });
  return steps;
}

export function hintKeepTrack(
  m: AbcdMove,
  step: HintStep<AbcdMove, AbcdHint>,
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

export function refreshHintStep(
  step: HintStep<AbcdMove, AbcdHint>,
  state: AbcdState,
): HintStep<AbcdMove, AbcdHint> | null {
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.params.w,
    abcdCandidateMoves,
  );
}
