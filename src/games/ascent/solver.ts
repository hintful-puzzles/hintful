/**
 * Ascent's solver: the ladder `ascent.description.yaml` states, compiled, on
 * the engine's wide marks and runner (`engine/ladder-runtime.ts`), and the
 * answer check its rules compile to. The generator removes a clue only while
 * the ladder at the board's tier still solves the result, so its verdict on
 * every intermediate board decides which puzzles exist; `solve()`,
 * `findMistakes` and the difficulty ask it too. No tier supposes anything.
 *
 * The hint reads the same ladder ({@link readingOf}): the rungs that only
 * strike narrow a board's marks, and a placing rung's firings on them are
 * its steps.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import { clueList, describedSpace, PLACE } from "../../engine/describe-runtime.ts";
import {
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  placingRung,
  runLadder,
  TIERS,
  WideCellMarks,
} from "../../engine/ladder-runtime.ts";
import * as ascent from "./ascent.compiled.ts";
import {
  type AscentState,
  DIFF_HARD,
  fromNumberEdge,
  isHexagonal,
  isNumberEdge,
  isObstacle,
  MODE_EDGES,
  MODE_ORTHOGONAL,
  NUMBER_EMPTY,
} from "./state.ts";

/** Which squares are neighbors, as the description numbers it. */
function movesOf(mode: number): number {
  if (mode === MODE_ORTHOGONAL) return 0;
  return isHexagonal(mode) ? 1 : 2;
}

/** The board as the description deals it: a given number at its square, a
 * wall at each obstacle, an arrow at each of an Edges board's, each number
 * counted from 1, and the path's last number. */
function dealtOf(puzzle: Int16Array, mode: number): ascent.Dealt {
  const s = puzzle.length;
  const number: [number[], number[]] = [[], []];
  const wall: [number[], number[]] = [[], []];
  const arrow: [number[], number[]] = [[], []];
  const add = (list: [number[], number[]], at: number, v: number): void => {
    list[0].push(at);
    list[1].push(v);
  };
  let open = 0;
  for (let i = 0; i < s; i++) {
    const v = puzzle[i];
    // An arrow is an obstacle too, so it is told apart first.
    if (isNumberEdge(v)) add(arrow, i, fromNumberEdge(v) + 1);
    else if (isObstacle(v)) add(wall, i, 0);
    else {
      open++;
      if (v >= 0) add(number, i, v + 1);
    }
  }
  return {
    number: clueList(number[0], number[1], s),
    wall: clueList(wall[0], wall[1], s),
    arrow: clueList(arrow[0], arrow[1], s),
    moves: movesOf(mode),
    top: open,
  };
}

/** Why a technique fired: its id and binding. */
interface DescribedReason {
  kind: ascent.LadderId;
  binding: object;
}

const reasonOf =
  (kind: ascent.LadderId) =>
  (binding: object): DescribedReason => ({ kind, binding });

/** The ladder over the board `dl`, with an Edges board's own techniques where
 * it has arrows. */
function ascentLadder(dl: ascent.Dealt, mode: number): Ladder<WideCellMarks> {
  return describedLadder<ascent.LadderId, ascent.PlacingId, WideCellMarks>(
    ascent,
    {
      once: placingRung(ascent.once, dl),
      onlySquare: compiledRung(ascent.onlySquare, dl, reasonOf("onlySquare")),
      nextTo: compiledRung(ascent.nextTo, dl, reasonOf("nextTo")),
      reach: compiledRung(ascent.reach, dl, reasonOf("reach")),
      deadEnd: compiledRung(ascent.deadEnd, dl, reasonOf("deadEnd")),
      overlap: compiledRung(ascent.overlap, dl, reasonOf("overlap")),
      onlyNumberNear: compiledRung(
        ascent.onlyNumberNear,
        dl,
        reasonOf("onlyNumberNear"),
      ),
      onlyNumber: compiledRung(ascent.onlyNumber, dl, reasonOf("onlyNumber")),
      onLine: compiledRung(ascent.onLine, dl, reasonOf("onLine")),
      overlapEdges: compiledRung(ascent.overlapEdges, dl, reasonOf("overlapEdges")),
    },
    undefined,
    mode === MODE_EDGES ? ["Edges"] : [],
  );
}

/**
 * The board's numbers as the description holds them: each given counted from
 * 1, a wall or an arrow `top + 1`, an empty square 0.
 */
function describedValues(puzzle: Int16Array, top: number): Int16Array {
  const values = new Int16Array(puzzle.length);
  for (let i = 0; i < puzzle.length; i++) {
    const v = puzzle[i];
    values[i] = v >= 0 ? v + 1 : v === NUMBER_EMPTY ? 0 : top + 1;
  }
  return values;
}

/** The marks over `puzzle` with its numbers placed, and the ladder over it;
 * `null` where the numbers given contradict one another. */
function marksOver(
  puzzle: Int16Array,
  w: number,
  h: number,
  mode: number,
): { m: WideCellMarks; ladder: Ladder<WideCellMarks>; values: Int16Array } | null {
  const dl = dealtOf(puzzle, mode);
  const sp = describedSpace(ascent.units, w, h);
  const values = describedValues(puzzle, dl.top);
  const m = new WideCellMarks(sp, dl.top + 1, values, (c, d) =>
    ascent.domainOf(sp, dl, c, d),
  );
  const ladder = ascentLadder(dl, mode);
  m.placing = ladder.placing;
  m.striking = ladder.striking;
  return m.seed(values) ? { m, ladder, values } : null;
}

/** What a solve leaves: the board with every number it placed, in the
 * game's numbering, and whether that is the board's answer. */
export interface AscentSolved {
  grid: Int16Array;
  solved: boolean;
}

/**
 * Solve `puzzle`, a `w`×`h` board of `mode`, by the described ladder up to
 * the tier `cap`. No technique supposes anything, so a board the ladder
 * fills is uniquely solved.
 */
export function ascentSolve(
  puzzle: Int16Array,
  w: number,
  h: number,
  mode: number,
  cap: number,
  firings?: FiringTally,
): AscentSolved {
  const grid = puzzle.slice();
  const over = marksOver(puzzle, w, h, mode);
  if (over === null) return { grid, solved: false };
  const { m, ladder, values } = over;
  const top = m.most - 1;
  const broken = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
    { firings },
  );
  for (let i = 0; i < grid.length; i++)
    if (grid[i] === NUMBER_EMPTY && values[i] > 0 && values[i] <= top)
      grid[i] = values[i] - 1;
  const sp = describedSpace(ascent.units, w, h);
  return {
    grid,
    solved:
      !broken &&
      !values.includes(0) &&
      ascent.isAnswer(values, sp, dealtOf(puzzle, mode)),
  };
}

/** Whether the board is solved: its numbers are the answer, by the
 * description's rules. */
export function isSolved(s: AscentState): boolean {
  const dl = dealtOf(s.grid, s.mode);
  const values = describedValues(s.grid, dl.top);
  if (values.includes(0)) return false;
  const sp = describedSpace(ascent.units, s.w, s.h);
  return ascent.isAnswer(values, sp, dl);
}

// --- the hint's readings ------------------------------------------------------

/**
 * How far a hint reading narrows the board before it places, weakest first:
 * `touch` measures each missing number from the placed numbers beside it in
 * the sequence, `reach` from the nearest placed either way, and `route`
 * also asks that a number touch squares the numbers before and after it
 * may take, to its fixpoint. On an Edges board each keeps every number on
 * its arrow's line.
 */
export type Reading = "touch" | "reach" | "route";

/** The striking techniques each reading runs. */
const READING_RUNGS: Record<Reading, readonly ascent.LadderId[]> = {
  touch: ["onLine", "nextTo"],
  reach: ["onLine", "nextTo", "reach"],
  route: ["onLine", "nextTo", "reach", "overlap", "overlapEdges"],
};

/** A technique that places, as the hint asks it of a reading. */
export type Placer = "onlySquare" | "deadEnd" | "onlyNumberNear" | "onlyNumber";

/** A board read by one of the hint's readings. */
export interface BoardReading {
  /** Whether number `n` (the game's numbering, from 0) may still go in square
   * `cell`; true of a number placed there. */
  may(cell: number, n: number): boolean;
  /** Every placement `placer` makes on the reading, in its scan's order,
   * each in the game's numbering. */
  placements(placer: Placer): { cell: number; n: number }[];
}

/**
 * The board `state` as the reading `reading` narrows it, by the ladder's own
 * striking techniques; `null` where its numbers contradict one another, or
 * the reading finds the marks inconsistent.
 */
export function readingOf(state: AscentState, reading: Reading): BoardReading | null {
  const over = marksOver(state.grid, state.w, state.h, state.mode);
  if (over === null) return null;
  const { m, ladder } = over;
  const ids = READING_RUNGS[reading];
  const strikes = ladder.entries.filter((e) => ids.includes(e.id as ascent.LadderId));
  if (runLadder(m, ladderTechniques(m, strikes, { [TIERS]: DIFF_HARD }, {})))
    return null;
  return {
    may: (cell, n) => m.has(cell, n + 1),
    placements: (placer) => {
      const entry = ladder.entries.find((e) => e.id === placer);
      const got = entry?.run.firings?.(m);
      if (got === undefined || got === "contradiction") return [];
      const out: { cell: number; n: number }[] = [];
      for (const f of got)
        for (let i = 0; i < f.facts.length; i += 3)
          if (f.facts[i] === PLACE)
            out.push({ cell: f.facts[i + 1], n: f.facts[i + 2] - 1 });
      return out;
    },
  };
}
