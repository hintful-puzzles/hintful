/**
 * Wordtrail's solver: the ladder `wordtrail.description.yaml` states,
 * compiled, on the engine's marks and runner (`engine/ladder-runtime.ts`),
 * and the answer check its rules compile to.
 *
 * The answer is on the edges between squares side by side, each a line,
 * which runs one way, or none; a cross, an edge beside a dark square and an edge no line will take
 * are all "none". The board is dealt as the description reads it: its dark
 * squares, its lengths, and every trail of its letters that spells a word
 * (`trails.ts`), which is how a technique reads the word list.
 * {@link solveWordtrail} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link wordtrailWalk} hands the engine the ladder to take one
 * firing at a time, and the hint narrates each (docs/solver-and-generator.md
 * § "One engine, two projections").
 *
 * Every technique decides an edge only where the rules force it, so a board
 * the ladder finishes has exactly one answer.
 */

import { type SquareEdges, squareEdges } from "../../engine/board/square-edges.ts";
import type { DifficultyVerdict } from "../../engine/contract/difficulty.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
  type Taken,
} from "../../engine/ladder-runtime.ts";
import { CROSS, type EdgeChange, LINE, OPEN } from "../../engine/line-drawing.ts";
import * as wordtrail from "../../generated/games/wordtrail/wordtrail.compiled.ts";
import { DIFF_NORMAL, type EdgeCode, LINE_BACK } from "./state.ts";
import type { Trail } from "./trails.ts";

/** What the description reads an edge as holding: a line read from the
 * space's first end of the edge, none, or a line read from its second. */
const FORTH = 1;
const NONE = 2;
const BACK = 3;

/** The rungs, easiest first: the ladder's techniques. */
export const WORDTRAIL_RUNGS = wordtrail.SAYS_KINDS;
export type WordtrailRung = (typeof WORDTRAIL_RUNGS)[number];
/** What each technique says of a firing. */
export type WordtrailSays = wordtrail.SaysById;

/** The board the ladder works on: the letters, the lengths and the trails
 * the deal fixes, and the edges it writes as it goes, each `OPEN`, `LINE`
 * or `CROSS`. */
export interface WordtrailBoard {
  w: number;
  h: number;
  letters: Uint8Array;
  lengths: readonly number[];
  trails: readonly Trail[];
  edges: Uint8Array;
}

// --- the board as the description reads it -----------------------------------

/** A board size's space, and its edges in both numberings: the game's
 * (`engine/board/square-edges.ts`) and the space's. */
interface Geometry {
  sp: GridSpace;
  g: SquareEdges;
  /** The space's edge for each of the game's. */
  toSp: Int32Array;
  /** The game's edge for each of the space's. */
  toGame: Int32Array;
}

/** The space's value for the game's edge `e` holding `code`, or 0 for an
 * open edge. */
function spaceValue(geo: Geometry, e: number, code: number): number {
  if (code === CROSS) return NONE;
  if (code !== LINE && code !== LINE_BACK) return 0;
  const from = code === LINE ? geo.g.a[e] : geo.g.b[e];
  return from === geo.sp.edgeEnds[2 * geo.toSp[e]] ? FORTH : BACK;
}

/** The square a line the space holds as `v` on its edge `se` runs from. */
const spaceFrom = (geo: Geometry, se: number, v: number): number =>
  geo.sp.edgeEnds[2 * se + (v === FORTH ? 0 : 1)];

/** The game's code for its edge `e` holding a line from square `from`. */
const lineCode = (geo: Geometry, e: number, from: number): EdgeCode =>
  from === geo.g.a[e] ? LINE : LINE_BACK;

function geometryOf(w: number, h: number): Geometry {
  const sp = describedSpace(wordtrail.units, w, h);
  const g = squareEdges(w, h);
  const toSp = new Int32Array(g.edgeCount);
  const toGame = new Int32Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++) {
    toSp[e] = sp.edgeOf(g.a[e], g.b[e]);
    toGame[toSp[e]] = e;
  }
  return { sp, g, toSp, toGame };
}

/** The board as the description deals it. The trails are the board's for
 * its life, so each board's dealing is kept. */
const dealtCache = new WeakMap<readonly Trail[], wordtrail.Dealt>();
function dealtOf(board: WordtrailBoard): wordtrail.Dealt {
  const kept = dealtCache.get(board.trails);
  if (kept !== undefined) return kept;
  const cells = board.w * board.h;
  const dark: number[] = [];
  const open: number[] = [];
  const letters: number[] = [];
  board.letters.forEach((letter, i) => {
    if (letter === 0) dark.push(i);
    else {
      open.push(i);
      letters.push(letter);
    }
  });
  const lens = [...new Set(board.lengths)];
  const dealt: wordtrail.Dealt = {
    block: clueList(
      dark,
      dark.map(() => 0),
      cells,
    ),
    letter: clueList(open, letters, cells),
    words: {
      n: lens.length,
      len: lens,
      num: lens.map((n) => board.lengths.filter((m) => m === n).length),
    },
    trail: {
      n: board.trails.length,
      pos: board.trails.map((t) => {
        const pos = new Array<number>(cells).fill(0);
        t.forEach((i, k) => {
          pos[i] = k + 1;
        });
        return pos;
      }),
    },
  };
  dealtCache.set(board.trails, dealt);
  return dealt;
}

/** The ladder. */
function wordtrailLadder(board: WordtrailBoard): Ladder {
  return describedLadder(wordtrail, dealtOf(board));
}

/** The ladder's marks over `board`, and what it reads them by. */
interface Deduction {
  geo: Geometry;
  m: CellMarks;
  ladder: Ladder;
}

/** Whether edge `e` lies beside a dark square. */
const darkEdge = (board: WordtrailBoard, g: SquareEdges, e: number): boolean =>
  board.letters[g.a[e]] === 0 || board.letters[g.b[e]] === 0;

/** The marks `board` holds as the description reads them: a line the way
 * it runs, none for a cross or an edge beside a dark square, and nothing
 * for an open edge. */
function deduction(board: WordtrailBoard): Deduction {
  const geo = geometryOf(board.w, board.h);
  const grid = new Uint8Array(geo.sp.edges.length);
  for (let e = 0; e < geo.g.edgeCount; e++)
    grid[geo.toSp[e]] = darkEdge(board, geo.g, e)
      ? NONE
      : spaceValue(geo, e, board.edges[e]);
  const m = new CellMarks(geo.sp, rangeMask(FORTH, BACK), grid, null, "edge");
  m.seed(grid);
  return { geo, m, ladder: wordtrailLadder(board) };
}

/** Write the marks back onto `board`: a line the way it runs, a cross where
 * the marks say none beside two letters, and open where they say nothing. */
function writeBack(d: Deduction, board: WordtrailBoard): void {
  const { geo } = d;
  for (let e = 0; e < geo.g.edgeCount; e++) {
    if (darkEdge(board, geo.g, e)) continue;
    const se = geo.toSp[e];
    const v = d.m.grid[se];
    board.edges[e] =
      v === FORTH || v === BACK
        ? lineCode(geo, e, spaceFrom(geo, se, v))
        : v === NONE
          ? CROSS
          : OPEN;
  }
}

/** Whether the lines divide the letters into words of the listed lengths,
 * each read the way its lines run, by the rules the description compiles
 * to. A cross and an open edge are the same here, so a player need cross
 * nothing out to finish. */
export function isComplete(board: WordtrailBoard): boolean {
  const geo = geometryOf(board.w, board.h);
  const g = new Uint8Array(geo.sp.edges.length).fill(NONE);
  for (let e = 0; e < geo.g.edgeCount; e++) {
    const v = spaceValue(geo, e, board.edges[e]);
    if (v === FORTH || v === BACK) g[geo.toSp[e]] = v;
  }
  return wordtrail.isAnswer(g, geo.sp, dealtOf(board));
}

/**
 * Solve `board` in place with the ladder capped at tier `cap`, and say how it
 * ended. `firings` takes a count of each technique's firings, for a census.
 */
export function solveWordtrail(
  board: WordtrailBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const d = deduction(board);
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [SCALE]: cap }, {}),
    {
      firings,
    },
  );
  writeBack(d, board);
  if (impossible) return "impossible";
  return isComplete(board) ? "solved" : "unsolved";
}

/** The lines of a board's answer, each the way it runs, or `null` where the
 * ladder does not reach one. */
export function answerOf(
  board: Omit<WordtrailBoard, "edges">,
): readonly EdgeCode[] | null {
  const solving: WordtrailBoard = {
    ...board,
    edges: new Uint8Array(squareEdges(board.w, board.h).edgeCount),
  };
  if (solveWordtrail(solving, DIFF_NORMAL) !== "solved") return null;
  return Array.from(solving.edges, (m) => (m === LINE || m === LINE_BACK ? m : OPEN));
}

/** The trails, by index, that the board's lines and crosses still allow as
 * words: the description's `fitting`, the hint's own reading of "still
 * fits", for each listed length. */
export function fittingTrails(board: WordtrailBoard): Set<number> {
  const { geo, m } = deduction(board);
  const dealt = dealtOf(board);
  return new Set(
    [...new Set(board.lengths)].flatMap((n) => wordtrail.fitting(m, geo.sp, dealt, n)),
  );
}

/** What the hint's steps are built from besides the technique's terms. */
export interface WordtrailWalkContext {
  /** Whether the lines already are the answer. */
  complete(): boolean;
  /** The game's edge for one of the space's. */
  edgeOf(spaceEdge: number): number;
  /** The edges a taken firing decides, as the game numbers them, each with
   * the mark it makes and a line with the square it runs from. */
  decided(taken: Taken): EdgeChange[];
}

/**
 * The ladder over `state`'s lines and crosses, for the engine's hint to walk
 * (`engine/described-edge-hint.ts`).
 */
export function wordtrailWalk(state: WordtrailBoard): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: WordtrailWalkContext;
} {
  const board: WordtrailBoard = { ...state, edges: state.edges.slice() };
  const d = deduction(board);
  const { geo } = d;
  return {
    marks: d.m,
    entries: d.ladder.entries,
    ctx: {
      complete: () => {
        writeBack(d, board);
        return isComplete(board);
      },
      edgeOf: (e) => geo.toGame[e],
      // A firing that reads an edge from both its squares decides it from
      // each: the one change.
      decided: (taken) => {
        const out = new Map<number, EdgeChange>();
        for (let i = 0; i < taken.facts.length; i += 3) {
          const se = taken.facts[i + 1];
          const v = taken.facts[i + 2];
          const edge = geo.toGame[se];
          out.set(
            edge,
            v === NONE
              ? { edge, mark: CROSS }
              : { edge, mark: LINE, from: spaceFrom(geo, se, v) },
          );
        }
        return [...out.values()];
      },
    },
  };
}
