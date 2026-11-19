/**
 * Wordtrail's solver: the ladder `wordtrail.description.yaml` states,
 * compiled, on the engine's marks and runner (`engine/ladder-runtime.ts`),
 * and the answer check its rules compile to.
 *
 * The answer is on the edges between squares side by side, each a line or
 * none; a cross, an edge beside a dark square and an edge no line will take
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

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import {
  CellMarks,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
  type Taken,
} from "../../engine/ladder-runtime.ts";
import { CROSS, type EdgeMark, LINE, OPEN } from "../../engine/line-drawing.ts";
import { type SquareEdges, squareEdges } from "../../engine/square-edges.ts";
import * as wordtrail from "../../generated/games/wordtrail/wordtrail.compiled.ts";
import { DIFF_NORMAL } from "./state.ts";
import type { Trail } from "./trails.ts";

/** What the description reads an edge as holding. */
const LINED = 1;
const NONE = 2;

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
 * (`engine/square-edges.ts`) and the space's. */
interface Geometry {
  sp: GridSpace;
  g: SquareEdges;
  /** The space's edge for each of the game's. */
  toSp: Int32Array;
  /** The game's edge for each of the space's. */
  toGame: Int32Array;
}

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

/** The marks `board` holds as the description reads them: a line, none for
 * a cross or an edge beside a dark square, and nothing for an open edge. */
function deduction(board: WordtrailBoard): Deduction {
  const geo = geometryOf(board.w, board.h);
  const grid = new Uint8Array(geo.sp.edges.length);
  for (let e = 0; e < geo.g.edgeCount; e++) {
    if (darkEdge(board, geo.g, e) || board.edges[e] === CROSS) grid[geo.toSp[e]] = NONE;
    else if (board.edges[e] === LINE) grid[geo.toSp[e]] = LINED;
  }
  const m = new CellMarks(geo.sp, rangeMask(LINED, NONE), grid, null, "edge");
  m.seed(grid);
  return { geo, m, ladder: wordtrailLadder(board) };
}

/** Write the marks back onto `board`: a line, a cross where the marks say
 * none beside two letters, and open where they say nothing. */
function writeBack(d: Deduction, board: WordtrailBoard): void {
  const { g, toSp } = d.geo;
  for (let e = 0; e < g.edgeCount; e++) {
    if (darkEdge(board, g, e)) continue;
    const v = d.m.grid[toSp[e]];
    board.edges[e] = v === LINED ? LINE : v === NONE ? CROSS : OPEN;
  }
}

/** Whether the lines divide the letters into words of the listed lengths,
 * by the rules the description compiles to. A cross and an open edge are
 * the same here, so a player need cross nothing out to finish. */
export function isComplete(board: WordtrailBoard): boolean {
  const geo = geometryOf(board.w, board.h);
  const g = new Uint8Array(geo.sp.edges.length).fill(NONE);
  for (let e = 0; e < geo.g.edgeCount; e++)
    if (board.edges[e] === LINE) g[geo.toSp[e]] = LINED;
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

/** The lines of a board's answer, or `null` where the ladder does not reach
 * one. */
export function answerOf(
  board: Omit<WordtrailBoard, "edges">,
): readonly EdgeMark[] | null {
  const solving: WordtrailBoard = {
    ...board,
    edges: new Uint8Array(squareEdges(board.w, board.h).edgeCount),
  };
  if (solveWordtrail(solving, DIFF_NORMAL) !== "solved") return null;
  return Array.from(solving.edges, (m) => (m === LINE ? LINE : OPEN));
}

/** What the hint's steps are built from besides the technique's terms. */
export interface WordtrailWalkContext {
  /** Whether the lines already are the answer. */
  complete(): boolean;
  /** The game's edge for one of the space's. */
  edgeOf(spaceEdge: number): number;
  /** The edges a taken firing decides, as the game numbers them, each with
   * the mark it makes. */
  decided(taken: Taken): { edge: number; mark: typeof LINE | typeof CROSS }[];
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
        const out = new Map<number, typeof LINE | typeof CROSS>();
        for (let i = 0; i < taken.facts.length; i += 3)
          out.set(
            geo.toGame[taken.facts[i + 1]],
            taken.facts[i + 2] === LINED ? LINE : CROSS,
          );
        return Array.from(out, ([edge, mark]) => ({ edge, mark }));
      },
    },
  };
}
