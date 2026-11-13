/**
 * Tracks' explained hint: the ladder `tracks.description.yaml` states,
 * walked one firing a step from the player's marks (`ladderWalk`), and the
 * sentence and the picture each firing's binding gives, read off the board
 * as it stood before the firing.
 *
 * **A line is named by its clue, never by an index.** Tracks draws no row or
 * column numbers, so "column 5" is a name the player cannot check against the
 * board (docs/hints.md § "Name elements by what the player can see", the
 * Netslide lesson). Every narration that reasons over a line highlights that
 * line's clue digit in the margin and says "this column" / "this row", so the
 * words point at something visible.
 */

import { PLACE, STRIKE_EDGE } from "../../engine/describe-runtime.ts";
import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired as FiredOf,
} from "../../engine/described-edge-hint.ts";
import { spokenOf } from "../../engine/described-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { CellMarks, Ladder, Taken } from "../../engine/ladder-runtime.ts";
import {
  D,
  dirCount,
  dirX,
  dirY,
  L,
  opposite,
  R,
  U,
} from "../../engine/square-edges.ts";
import { type Axis, type Marked, PIECE, type Piece, say } from "./hint-text.ts";
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
  sEDirs,
  sEFlags,
  sESet,
  stateToBoard,
  type TracksMove,
  type TracksOp,
  type TracksState,
} from "./state.ts";
import * as tracks from "./tracks.compiled.ts";

/**
 * A hard cap on how far ahead the plan is computed.
 *
 * A UX bound rather than a correctness one, and Tracks needs it more than most:
 * a 15x15 board is ~600 forced decisions from empty, and a player rarely
 * follows more than a handful before going their own way, at which point the
 * plan is recomputed anyway (Spokes and Bricks bound theirs the same way:
 * `engine/hint-plan.ts`). It also keeps `hint()` cheap enough to be called
 * after every move, which the cross-game resume walk does.
 */
const PLAN_CAP = 40;

// --- why a firing holds ---------------------------------------------------

/** What a firing's sentence points at: squares (`y * w + x`), sides (as
 * `(y * w + x) * 16 + dir`, the board's rim included), and clues (`0..w-1`
 * columns, `w..w+h-1` rows). */
export interface TracksEvidence {
  cells: number[];
  edges: number[];
  clues: number[];
}

/**
 * Why one firing holds, as its sentence tells it, read off the technique's
 * binding on the board before the firing changed it.
 */
export type TracksReason = { ev: TracksEvidence } & (
  | { kind: "onlyOneSideLeft"; x: number; y: number; open: number }
  | { kind: "bothSidesLeft"; x: number; y: number }
  | { kind: "clueFull"; line: number }
  | { kind: "clueExact"; line: number }
  | { kind: "wouldCloseLoop"; x: number; y: number; dir: number }
  | { kind: "wouldStrandTrack"; x: number; y: number; dir: number }
  | { kind: "wouldFinishEarly"; x: number; y: number; dir: number; unmet: number }
  | { kind: "looseEndSpans"; line: number }
  | {
      kind: "sharedFate";
      line: number;
      x: number;
      y: number;
      dir: number;
      /** Whether the line has room for one more track square, which empties
       * this square; else for one more empty square, which fills the next. */
      fills: boolean;
    }
  | { kind: "crossingParity"; x: number; y: number; dir: number; crossings: number }
);

/** The four sides, in the order a step lists them. */
const SIDES = [R, U, L, D] as const;

const evEdge = (w: number, x: number, y: number, d: number): number =>
  (y * w + x) * 16 + d;

/** The sides of square `(x, y)` carrying track, the board's edge where the
 * track leaves it included. */
const rails = (b: Board, x: number, y: number): number => sEDirs(b, x, y, E_TRACK);

/** Whether a square is known to hold track: marked, or a rail on it. */
const holds = (b: Board, i: number): boolean =>
  (b.sflags[i] & S_TRACK) !== 0 || rails(b, i % b.w, (i / b.w) | 0) !== 0;

const empty = (b: Board, i: number): boolean => (b.sflags[i] & S_NOTRACK) !== 0;

/**
 * Whether the track is known not to cross side `d` of square `(x, y)`, as
 * the description's `shut` reads it: the board's edge where no end leaves,
 * a crossed-out side, a square either side marked empty, or one with both
 * its rails elsewhere.
 */
function shut(b: Board, x: number, y: number, d: number): boolean {
  const own = rails(b, x, y);
  if (own & d) return false;
  const nx = x + dirX(d);
  const ny = y + dirY(d);
  if (!inGrid(b, nx, ny)) return true;
  return (
    (sEFlags(b, x, y, d) & E_NOTRACK) !== 0 ||
    empty(b, y * b.w + x) ||
    empty(b, ny * b.w + nx) ||
    dirCount(own) === 2 ||
    dirCount(rails(b, nx, ny)) === 2
  );
}

/** The sides of `(x, y)` the track is known not to cross, as evidence. */
const shutSides = (b: Board, x: number, y: number, dirs = 15): number[] =>
  SIDES.filter((d) => d & dirs && shut(b, x, y, d)).map((d) => evEdge(b.w, x, y, d));

/** The squares of the game's line `line`, in order. */
function lineSquares(b: Board, line: number): number[] {
  const { w, h } = b;
  return line < w
    ? Array.from({ length: h }, (_, y) => y * w + line)
    : Array.from({ length: w }, (_, x) => (line - w) * w + x);
}

/** The direction from square `i` to the square beside it, `j`. */
function towards(i: number, j: number): number {
  if (j === i + 1) return R;
  if (j === i - 1) return L;
  return j > i ? D : U;
}

/** A firing's premise, as its sentence tells it, from the technique's
 * binding on the board `b` before the firing. */
function reasonOf(b: Board, kind: tracks.LadderId, bd: object): TracksReason {
  const { w, h } = b;
  const at = (i: number) => ({ x: i % w, y: (i / w) | 0 });
  const terms = bd as Record<string, unknown>;
  const num = (k: string): number => terms[k] as number;
  const set = (k: string): readonly number[] => terms[k] as readonly number[];
  const edgeAt = () => edgeSide(ladderOf(b).sp, num("e"));
  switch (kind) {
    case "oneWayIn": {
      const { x, y } = at(num("c"));
      const edges = shutSides(b, x, y);
      return {
        kind: "onlyOneSideLeft",
        x,
        y,
        open: 4 - edges.length,
        ev: { cells: [], edges, clues: [] },
      };
    }
    case "bothSidesLeft": {
      const { x, y } = at(num("c"));
      return {
        kind: "bothSidesLeft",
        x,
        y,
        ev: { cells: [], edges: shutSides(b, x, y), clues: [] },
      };
    }
    case "clueFull":
    case "clueExact": {
      const line = clueLine(w, h, num("L"));
      const full = kind === "clueFull";
      return {
        kind,
        line,
        ev: {
          cells: lineSquares(b, line).filter((i) => (full ? holds(b, i) : empty(b, i))),
          edges: [],
          clues: [line],
        },
      };
    }
    case "closeLoop":
      return {
        kind: "wouldCloseLoop",
        ...edgeAt(),
        ev: { cells: [...set("G")], edges: [], clues: [] },
      };
    case "strand": {
      const joined = new Set([...set("G"), ...set("H")]);
      const stranded: number[] = [];
      for (let i = 0; i < w * h; i++)
        if (holds(b, i) && !joined.has(i)) stranded.push(i);
      return {
        kind: "wouldStrandTrack",
        ...edgeAt(),
        ev: { cells: stranded, edges: [], clues: [] },
      };
    }
    case "finishEarly": {
      const joined = new Set([...set("G"), ...set("H")]);
      let unmet = -1;
      for (let line = 0; line < w + h && unmet < 0; line++)
        if (lineSquares(b, line).filter((i) => joined.has(i)).length < b.numbers[line])
          unmet = line;
      if (unmet < 0) throw new Error("tracks hint: finishEarly with every clue met");
      return {
        kind: "wouldFinishEarly",
        ...edgeAt(),
        unmet,
        ev: {
          cells: lineSquares(b, unmet).filter((i) => holds(b, i)),
          edges: [],
          clues: [unmet],
        },
      };
    }
    case "looseEnd": {
      const line = clueLine(w, h, num("L"));
      // Every unfinished square has a side blocked across the line, which is
      // why none can be crossed straight through: show those sides.
      const across = line < w ? R | L : U | D;
      const unfinished = lineSquares(b, line).filter(
        (i) => dirCount(rails(b, i % w, (i / w) | 0)) !== 2,
      );
      return {
        kind: "looseEndSpans",
        line,
        ev: {
          cells: unfinished,
          edges: unfinished.flatMap((i) => shutSides(b, i % w, (i / w) | 0, across)),
          clues: [line],
        },
      };
    }
    case "sharedFate":
    case "sharedFateEmpties": {
      const line = clueLine(w, h, num("L"));
      const p = num("p");
      const { x, y } = at(p);
      const fills = kind === "sharedFate";
      return {
        kind: "sharedFate",
        line,
        x,
        y,
        dir: towards(p, num("q")),
        fills,
        ev: {
          cells: lineSquares(b, line).filter((i) =>
            fills ? holds(b, i) : empty(b, i),
          ),
          edges: shutSides(b, x, y),
          clues: [line],
        },
      };
    }
    case "parity": {
      // The block and the crossings the sentence counts are the whole
      // premise, so the picture is the argument.
      const block = set("G");
      const inside = new Set(block);
      const edges: number[] = [];
      for (const i of block) {
        const { x, y } = at(i);
        for (const d of SIDES) {
          if (!(rails(b, x, y) & d)) continue;
          const nx = x + dirX(d);
          const ny = y + dirY(d);
          if (!inGrid(b, nx, ny) || !inside.has(ny * w + nx))
            edges.push(evEdge(w, x, y, d));
        }
      }
      return {
        kind: "crossingParity",
        ...edgeAt(),
        crossings: edges.length,
        ev: { cells: [...block], edges, clues: [] },
      };
    }
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

/** The squares a firing's premise reads, which a plan continues from: the
 * square it turns on, the squares and sides it cites, and the lines whose
 * clues it counts. A player follows the track through them. */
function premise(b: Board, reason: TracksReason): number[] {
  const { ev } = reason;
  return [
    ...("x" in reason ? [reason.y * b.w + reason.x] : []),
    ...ev.cells,
    ...ev.edges.map((e) => e >> 4),
    ...ev.clues.flatMap((line) => lineSquares(b, line)),
  ];
}

// --- the picture ----------------------------------------------------------

/** One side of one square. */
export interface TracksHintEdge {
  x: number;
  y: number;
  dir: number;
}

/**
 * What one step's sentence names, in five roles.
 *
 * The split follows the mark roles (docs/hints-marks.md § "The engine colors
 * the marks"): the squares and edges a step *decides* are rings, the squares
 * and edges it *reasons from* outlines, and the clue it counts with has its
 * own digit recolored. `targets` and `targetEdges` are separate roles
 * only because Tracks decides two different kinds of thing, not because their
 * fates differ: a firing that forces four edges forces all four the same way,
 * and they are all drawn identically (equivalent moves share a color).
 */
export interface TracksPicture {
  /** Squares this step decides. `track` is what it decides them to be. */
  targets: { x: number; y: number; track: boolean }[];
  /** Sides this step decides. */
  targetEdges: (TracksHintEdge & { track: boolean })[];
  /** Squares the deduction reasons from. */
  area: { x: number; y: number }[];
  /** Sides the deduction reasons from. */
  areaEdges: TracksHintEdge[];
  /** Clue indices the deduction counts with (`0..w-1` columns, then rows). */
  clues: number[];
  /** The line the sentence names, by the same index, hatched with its clue;
   * `null` when it names none (docs/hints-marks.md § "Hatch the line the
   * sentence names"). */
  line: number | null;
  /** The closed block a parity sentence names, hatched like a line; empty when
   * it names none. */
  hatch: { x: number; y: number }[];
}

/** The one line a reason's sentence names, by clue index. */
function namedLine(reason: TracksReason): number | null {
  switch (reason.kind) {
    case "clueFull":
    case "clueExact":
    case "looseEndSpans":
    case "sharedFate":
      return reason.line;
    case "wouldFinishEarly":
      return reason.unmet;
    default:
      return null;
  }
}

// --- narration ------------------------------------------------------------

/** Read a line's clue index back into orientation, length and target. */
function lineOf(b: Board, line: number) {
  const isCol = line < b.w;
  return {
    axis: (isCol ? "column" : "row") as Axis,
    /** How many squares the line holds. */
    len: isCol ? b.h : b.w,
    /** How many of them carry track. */
    target: b.numbers[line],
  };
}

/**
 * Which sentence a firing speaks, and with what values: the deduction's half of
 * the narration. The words are [`hint-text.ts`](./hint-text.ts)'s.
 *
 * Seven rungs are represented here and the eighth, `check-single`, is not: it
 * fires on no board this generator produces, so narrating it would be prose
 * nobody can ever read or check (`tracks-ladder.test.ts`'s `unreached` ledger,
 * and `tracks-hint.test.ts` asserts it stays that way).
 */
export function narrate(
  b: Board,
  reason: TracksReason,
  picture: TracksPicture,
): Sentence {
  const m = markedOf(picture);
  switch (reason.kind) {
    case "onlyOneSideLeft":
      return say.onlyOneSideLeft(reason.open, m);
    case "bothSidesLeft":
      return say.bothSidesLeft(m);
    case "clueFull": {
      const { axis, target } = lineOf(b, reason.line);
      return say.clueFull(axis, target, m);
    }
    case "clueExact": {
      const { axis, target, len } = lineOf(b, reason.line);
      return say.clueExact(axis, target, len, m);
    }
    case "wouldCloseLoop":
      return say.wouldCloseLoop(m);
    case "wouldStrandTrack":
      return say.wouldStrandTrack(m);
    case "wouldFinishEarly":
      return say.wouldFinishEarly(lineOf(b, reason.unmet).axis, m);
    case "looseEndSpans":
      return say.looseEndSpans(lineOf(b, reason.line).axis, m);
    case "sharedFate": {
      const { axis, target } = lineOf(b, reason.line);
      const { dir } = reason;
      if (reason.fills) return say.sharedFateFills(axis, dir, target, m);
      return say.sharedFateEmpties(axis, target, m);
    }
    case "crossingParity":
      // The track crosses a closed block's border an even number of times, so
      // an odd count so far means the last side must carry it.
      return say.crossingParity(reason.crossings, reason.crossings % 2 === 1, m);
  }
}

const cellOf = ({ x, y }: { x: number; y: number }): Piece => ({ x, y });
const sideOf = ({ x, y, dir }: TracksHintEdge): Piece => ({ x, y, dir });

/** A step's picture as the marks its words name. */
function markedOf(hl: TracksPicture): Marked {
  return {
    decided: [...hl.targets.map(cellOf), ...hl.targetEdges.map(sideOf)],
    cells: hl.area.map(cellOf),
    sides: hl.areaEdges.map(sideOf),
    clues: hl.clues.map((clue) => ({ clue })),
    line: hl.line === null ? [] : [hl.line],
    block: hl.hatch.map(cellOf),
  };
}

/** A decided square or side as its words name it. */
export const pieceOfOp = (o: TracksOp): Piece =>
  o.kind === "square" ? { x: o.x, y: o.y } : { x: o.x, y: o.y, dir: o.dir ?? 0 };

// --- the picture from a firing --------------------------------------------

function pictureOf(
  b: Board,
  reason: TracksReason,
  firing: { ops: readonly TracksOp[] },
): TracksPicture {
  const { w } = b;
  const { ev } = reason;
  const cells = ev.cells.map((i) => ({ x: i % w, y: Math.floor(i / w) }));
  // A parity firing's cells are the block its sentence is about, so they are
  // hatched; every other rung's are the particular squares it reasons from.
  const block = reason.kind === "crossingParity";
  return {
    targets: firing.ops
      .filter((o) => o.kind === "square")
      .map((o) => ({ x: o.x, y: o.y, track: o.track })),
    targetEdges: firing.ops
      .filter((o) => o.kind === "edge")
      .map((o) => ({ x: o.x, y: o.y, dir: o.dir ?? 0, track: o.track })),
    area: block ? [] : cells,
    hatch: block ? cells : [],
    areaEdges: ev.edges.map((e) => ({
      x: Math.floor(e / 16) % w,
      y: Math.floor(Math.floor(e / 16) / w),
      dir: e % 16,
    })),
    clues: ev.clues,
    line: namedLine(reason),
  };
}

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

/** A firing's premise, read off the board as it stood before the firing. */
const premiseOf = (board: Board, taken: Taken): TracksReason =>
  reasonOf(
    board,
    taken.entry.id as tracks.LadderId,
    spokenOf<{ terms: object }>(taken).says.terms,
  );

/** What a sentence is told of its step: why it holds, and its picture. */
interface TracksMarked {
  board: Board;
  reason: TracksReason;
  picture: TracksPicture;
}

/** Every technique's sentence is the one `narrate` says for its premise. */
const sentence = (_spoken: unknown, { board, reason, picture }: TracksMarked) =>
  narrate(board, reason, picture);

const sentences: {
  [K in keyof TracksSays]: (
    spoken: EdgeSpoken<TracksSays[K]>,
    marked: TracksMarked,
  ) => Sentence;
} = {
  oneWayIn: sentence,
  bothSidesLeft: sentence,
  clueFull: sentence,
  clueExact: sentence,
  closeLoop: sentence,
  strand: sentence,
  finishEarly: sentence,
  looseEnd: sentence,
  sharedFate: sentence,
  sharedFateEmpties: sentence,
  parity: sentence,
};

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
  const { taken, ctx } = fired;
  const { board } = ctx;
  const reason = premiseOf(board, taken);
  const ops = opsOf(board, taken.facts);
  applyOps(board, ops);
  return [
    {
      move: { ops },
      highlights: undefined,
      marked: { board, reason, picture: pictureOf(board, reason, { ops }) },
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

/** Deduce the hint's steps from the player's current marks. */
export const tracksHint = describedEdgeHint<
  TracksState,
  TracksMove,
  undefined,
  TracksMarked,
  TracksWalkContext,
  TracksSays,
  TracksRung
>({
  name: "tracks hint",
  walk: tracksWalk,
  tiers: { lowest: (state) => state.diff, count: (state) => state.diff + 1 },
  roles: ROLES,
  done: (_marks, ctx) => ctx.finished(),
  plan: PLAN_CAP,
  // The squares the premise reads, on the board as it stands before the firing.
  reads: (taken, ctx) => premise(ctx.board, premiseOf(ctx.board, taken)),
  step: stepOf,
  say: sentences,
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
export function tracksKeepTrack(
  m: TracksMove,
  step: HintStep<TracksMove>,
  state: TracksState,
): HintTrackVerdict {
  if (m.solve) return "off";
  const before = stateToBoard(state);
  const after = stateToBoard(executeMove(state, m));
  const { verdict, left } = trackTargets({
    targets: step.move.ops,
    changes: flagChanges(before, after),
    key: (op) => opKey(before, op),
    want: (op) => op.set,
    holds: (op) => appliedIn(after, op) === op.set,
  });
  if (verdict !== "onTrack") return verdict;

  step.move = { ops: left };
  if (step.words) {
    const kept = new Set(left.map((o) => PIECE.key(pieceOfOp(o))));
    step.words = step.words.narrow(
      (role, _kind, key) => role !== "ring" || kept.has(key),
    );
    step.explanation = step.words.text;
  }
  return "onTrack";
}

/** Is the flag this op names set on `b`? */
function appliedIn(b: Board, op: TracksOp): boolean {
  const f = b.sflags[op.y * b.w + op.x];
  if (op.kind === "square") return (f & (op.track ? S_TRACK : S_NOTRACK)) !== 0;
  const shift = op.track ? S_TRACK_SHIFT : S_NOTRACK_SHIFT;
  return (f & ((op.dir ?? 0) << shift)) !== 0;
}
