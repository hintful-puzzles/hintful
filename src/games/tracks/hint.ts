/**
 * Tracks' explained hint: the ladder `tracks.description.yaml` states,
 * walked one firing a step from the player's marks (`ladderWalk`), and the
 * sentence each firing's binding gives, which the description states
 * (`STATED`), read off the board as it stood before the firing.
 *
 * **A line is named by its clue, never by an index.** Tracks draws no row or
 * column numbers, so "column 5" is a name the player cannot check against the
 * board (docs/hints.md § "Name elements by what the player can see", the
 * Netslide lesson). Every sentence that reasons over a line stripes that line
 * through its clue in the margin and says "this column" / "this row", so the
 * words point at something visible.
 */

import { PLACE, STRIKE_EDGE } from "../../engine/describe-runtime.ts";
import {
  describedEdgeHint,
  type Fired as FiredOf,
} from "../../engine/described-edge-hint.ts";
import { keepTrackBy } from "../../engine/hint-track.ts";
import type { MarkKind } from "../../engine/hint-words.ts";
import type { CellMarks, Ladder } from "../../engine/ladder-runtime.ts";
import { D, dirX, dirY, L, opposite, R, U } from "../../engine/square-edges.ts";
import * as tracks from "../../generated/games/tracks/tracks.compiled.ts";
import { STATED } from "../../generated/games/tracks/tracks.compiled.ts";
import { LINE, PIECE, type Piece, pieceCode, pieceOfCode } from "./kinds.ts";
import { executeMove } from "./moves.ts";
import {
  clueLine,
  edgeSide,
  finished,
  ladderOf,
  marksOf,
  NONE,
  ROLES,
  TRACK,
} from "./solver.ts";
import {
  type Board,
  DIRS,
  E_NOTRACK,
  E_TRACK,
  inGrid,
  S_NOTRACK,
  S_NOTRACK_SHIFT,
  S_TRACK,
  S_TRACK_SHIFT,
  sESet,
  stateToBoard,
  type TracksMove,
  type TracksOp,
  type TracksState,
} from "./state.ts";

// --- what a firing's sentence points at -----------------------------------

/** One side of one square. */
interface Side {
  x: number;
  y: number;
  dir: number;
}

/** The four sides, in the order a step lists them. */
const SIDES = [R, U, L, D] as const;

/** The side square `i` leaves the board by where an end of the track is
 * given there, else 0: the ends are on the left and at the bottom. */
const exitOf = (b: Board, i: number): number =>
  (i === b.rowS * b.w ? L : 0) | (i === (b.h - 1) * b.w + b.colS ? D : 0);

/** The sides of square `i` on the board's rim, among `dirs`, that the track
 * does not leave by. The description's edges stop at the rim, so its `shut`
 * terms hold none of these, and they are shut but where an end leaves. */
function rimShut(b: Board, i: number, dirs = 15): Side[] {
  const x = i % b.w;
  const y = (i / b.w) | 0;
  return SIDES.filter(
    (d) => d & dirs && !(d & exitOf(b, i)) && !inGrid(b, x + dirX(d), y + dirY(d)),
  ).map((dir) => ({ x, y, dir }));
}

/** A firing as its technique said it. */
type Said = { [K in TracksRung]: { id: K; says: TracksSays[K] } }[TracksRung];

/**
 * The terms a firing's description cannot know, as numbers of pieces
 * (`pieceCode`), read on the board `b` before the firing: the sides it reasons
 * from, which the description's edges lack at the board's rim, and the squares
 * and clue a sentence outlines together.
 */
function suppliedOf(b: Board, said: Said): Record<string, readonly number[]> {
  const { w, h } = b;
  const { sp } = ladderOf(b);
  const code = (p: Piece): number => pieceCode(w, h, p);
  const sides = (edges: readonly number[]): Piece[] =>
    edges.map((e) => edgeSide(sp, e));
  const squares = (cells: readonly number[]): Piece[] =>
    cells.map((i) => ({ x: i % w, y: (i / w) | 0 }));
  const codes = (pieces: readonly Piece[]): number[] => pieces.map(code);
  switch (said.id) {
    case "oneWayIn":
    case "bothSidesLeft":
      return {
        shut: codes([...sides(said.says.terms.shut), ...rimShut(b, said.says.terms.c)]),
      };
    case "finishEarly": {
      const [short] = said.says.terms.short;
      if (short === undefined)
        throw new Error("tracks hint: finishEarly with every clue met");
      return {
        unmet: codes([
          { clue: clueLine(w, h, short) },
          ...squares(said.says.marks.outline),
        ]),
      };
    }
    case "looseEnd": {
      const { L: line, unable } = said.says.terms;
      const across = clueLine(w, h, line) < w ? R | L : U | D;
      const { outline } = said.says.marks;
      return {
        unable: codes([
          ...squares(outline),
          ...sides(unable),
          ...outline.flatMap((i) => rimShut(b, i, across)),
        ]),
      };
    }
    case "sharedFate":
    case "sharedFateEmpties": {
      const { L: line, p, shut } = said.says.terms;
      return {
        shut: codes([...sides(shut), ...rimShut(b, p)]),
        lineClue: codes([
          { clue: clueLine(w, h, line) },
          ...squares(said.says.marks.outline),
        ]),
      };
    }
    case "parity": {
      // The rails across the block's border are the crossings the sentence
      // counts, and an end in it leaves the board across it too.
      const { crossing } = said.says.terms;
      const exits = said.says.marks.stripes.flatMap((i) =>
        SIDES.filter((d) => d & exitOf(b, i)).map((dir) => ({
          x: i % w,
          y: (i / w) | 0,
          dir,
        })),
      );
      return { crossing: codes([...sides(crossing), ...exits]) };
    }
    default:
      return {};
  }
}

/** The flag changes a firing's facts make. */
function opsOf(b: Board, facts: readonly number[]): TracksOp[] {
  const sp = ladderOf(b).sp;
  const ops: TracksOp[] = [];
  for (let i = 0; i < facts.length; i += 3) {
    const at = facts[i + 1];
    const n = facts[i + 2];
    if (facts[i] === PLACE)
      ops.push({ kind: "edge", ...edgeSide(sp, at), track: n === TRACK, set: true });
    else if (facts[i] === STRIKE_EDGE)
      // Striking "none" from a square leaves it track.
      ops.push({
        kind: "square",
        x: at % b.w,
        y: (at / b.w) | 0,
        track: n === NONE,
        set: true,
      });
  }
  return ops;
}

/** Make a step's changes on the hint's copy of the board. */
function applyOps(b: Board, ops: readonly TracksOp[]): void {
  for (const op of ops) {
    if (op.kind === "square")
      b.sflags[op.y * b.w + op.x] |= op.track ? S_TRACK : S_NOTRACK;
    else sESet(b, op.x, op.y, op.dir ?? 0, op.track ? E_TRACK : E_NOTRACK);
  }
}

/** A decided square or side as its words name it. */
export const pieceOfOp = (o: TracksOp): Piece =>
  o.kind === "square" ? { x: o.x, y: o.y } : { x: o.x, y: o.y, dir: o.dir ?? 0 };

// --- the plan -------------------------------------------------------------

/** What each technique says, as the hint's sentences read it. */
type TracksSays = tracks.SaysById;

/** The rungs, the techniques a step can speak. */
export const TRACKS_RUNGS = tracks.SAYS_KINDS;
export type TracksRung = tracks.LadderId;

/** What the walk reads a firing by: the hint's copy of the board, which every
 * firing's changes are made on as it goes, and whether the marks are the
 * answer. */
interface TracksWalkContext {
  board: Board;
  finished(): boolean;
}

/** What a sentence is told of its step: the squares and sides it decides, and
 * the terms the board's reading adds. */
interface TracksMarked {
  ring: readonly Piece[];
  supplied: Record<string, readonly number[]>;
}

/** A firing's step: the changes it makes, made on the hint's copy of the board
 * too, so the next firing's premise reads the board it leaves. Every firing is
 * shown: the description reads a square with a rail as track and a side its
 * squares close as shut, so no technique concludes what the board already says
 * (docs/hints.md § "Show only what the board does not already say"). */
function stepOf(fired: FiredOf<TracksSays[keyof TracksSays], TracksWalkContext>): {
  move: TracksMove;
  highlights: undefined;
  marked: TracksMarked;
}[] {
  const { taken, says, ctx } = fired;
  const { board } = ctx;
  const supplied = suppliedOf(board, { id: taken.entry.id, says } as Said);
  const ops = opsOf(board, taken.facts);
  applyOps(board, ops);
  return [
    {
      move: { ops },
      highlights: undefined,
      marked: { ring: ops.map(pieceOfOp), supplied },
    },
  ];
}

/**
 * The ladder over the player's marks, for the engine's hint to walk
 * (`engine/described-edge-hint.ts`). The tier cap is the board's own
 * difficulty: the generator certified the board at that tier, every technique
 * is monotone in what is marked, so a correct partial board stays soluble
 * there, and an easiest-tier board is never handed a parity argument it did
 * not need.
 */
function tracksWalk(state: TracksState): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: TracksWalkContext;
} {
  const board = stateToBoard(state);
  const kept = ladderOf(board);
  const marks = marksOf(board, kept.sp);
  return {
    marks,
    entries: kept.ladder.entries,
    ctx: { board, finished: () => finished(marks, kept) },
  };
}

/** What a term's elements are: a piece, or a line by its clue's index. */
type Element = Piece | number;
const PIECE_OF_ELEMENT = PIECE as unknown as MarkKind<Element>;

/** The terms of pieces a clause names, the squares and sides and clues a step
 * reads, and the lines it stripes by their clues. */
const PIECE_TERMS = ["shut", "unmet", "unable", "lineClue", "crossing", "clueAt"];

/** Deduce the hint's steps from the player's current marks. */
export const tracksHint = describedEdgeHint<
  TracksState,
  TracksMove,
  undefined,
  TracksMarked,
  TracksWalkContext,
  TracksSays,
  TracksRung,
  Piece,
  Element
>({
  name: "tracks hint",
  walk: tracksWalk,
  tiers: { lowest: (state) => state.diff, count: (state) => state.diff + 1 },
  roles: ROLES,
  done: (_marks, ctx) => ctx.finished(),
  step: stepOf,
  stated: STATED,
  // A sentence's marks are squares, indexed; the sides and clues it names are
  // terms, which hold pieces by their numbers.
  elements: {
    kind: PIECE_OF_ELEMENT,
    at: (index, state) => pieceOfCode(state.w, state.h, index),
  },
  ringKind: PIECE,
  ring: ({ ring }) => ring,
  terms: ({ supplied }) => supplied,
  termKinds: {
    L: LINE as unknown as MarkKind<Element>,
    short: LINE as unknown as MarkKind<Element>,
    ...Object.fromEntries(PIECE_TERMS.map((name) => [name, PIECE_OF_ELEMENT])),
  },
  termAt: {
    // A line by its index in the description's space, which a clue names.
    L: (index, state) => clueLine(state.w, state.h, index),
    short: (index, state) => clueLine(state.w, state.h, index),
    // A line's clue in the margin.
    clueAt: (index, state) => ({ clue: clueLine(state.w, state.h, index) }),
    ...Object.fromEntries(
      PIECE_TERMS.filter((name) => name !== "clueAt").map((name) => [
        name,
        (index: number, state: TracksState) => pieceOfCode(state.w, state.h, index),
      ]),
    ),
  },
});

// --- following the plan ---------------------------------------------------

/**
 * One flag of the board, named the same whichever square an op spells it
 * from: an edge flag is stored on both squares it separates, so an edge named
 * leftward or upward is keyed from its neighbor, when there is one.
 */
function flagKey(
  b: { w: number; h: number },
  kind: TracksOp["kind"],
  x: number,
  y: number,
  dir: number,
  track: boolean,
): string {
  if (kind === "square") return `s ${x} ${y} ${track}`;
  if ((dir === L || dir === U) && inGrid(b, x + dirX(dir), y + dirY(dir)))
    return `e ${x + dirX(dir)} ${y + dirY(dir)} ${opposite(dir)} ${track}`;
  return `e ${x} ${y} ${dir} ${track}`;
}

const opKey = (b: { w: number; h: number }, op: TracksOp): string =>
  flagKey(b, op.kind, op.x, op.y, op.dir ?? 0, op.track);

/** Every square and edge flag that differs between two boards, with whether
 * it is now set. */
function flagChanges(before: Board, after: Board): Map<string, boolean> {
  const out = new Map<string, boolean>();
  for (let y = 0; y < before.h; y++) {
    for (let x = 0; x < before.w; x++) {
      for (const track of [true, false]) {
        const sq: TracksOp = { kind: "square", x, y, track, set: true };
        const now = appliedIn(after, sq);
        if (appliedIn(before, sq) !== now) out.set(opKey(before, sq), now);
        for (const dir of DIRS) {
          const edge: TracksOp = { kind: "edge", x, y, dir, track, set: true };
          const on = appliedIn(after, edge);
          if (appliedIn(before, edge) !== on) out.set(opKey(before, edge), on);
        }
      }
    }
  }
  return out;
}

/**
 * Classify a player move against the displayed step, by what it did to the
 * board (`engine/hint-track.ts`), so a drag and a click that set the same
 * flags are the same move.
 *
 * A firing that forces several squares is one step whose move carries all of
 * them (docs/hints-marks.md § "Group one firing into one step"), and the player
 * places them one click or one drag at a time, so the step is shrunk in place
 * to what is left and a later `executeHint` does not re-apply what is done.
 */
export const tracksKeepTrack = keepTrackBy<
  TracksState,
  TracksMove,
  unknown,
  TracksOp,
  string,
  boolean
>({
  foreign: (m) => m.solve === true,
  execute: executeMove,
  targets: (step) => step.move.ops,
  changesOf: (before, after) => flagChanges(stateToBoard(before), stateToBoard(after)),
  key: (op, state) => opKey(state, op),
  want: (op) => op.set,
  valueOf: (state, op) => appliedIn(stateToBoard(state), op),
  narrowed: (_step, left) => ({ move: { ops: [...left] } }),
  ring: (op) => PIECE.key(pieceOfOp(op)),
});

/** Is the flag this op names set on `b`? */
function appliedIn(b: Board, op: TracksOp): boolean {
  const f = b.sflags[op.y * b.w + op.x];
  if (op.kind === "square") return (f & (op.track ? S_TRACK : S_NOTRACK)) !== 0;
  const shift = op.track ? S_TRACK_SHIFT : S_NOTRACK_SHIFT;
  return (f & ((op.dir ?? 0) << shift)) !== 0;
}
