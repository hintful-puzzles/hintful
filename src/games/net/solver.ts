/**
 * Net's solver: the ladder `net.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`) over the board read
 * as a tiling (`engine/square-tiling.ts`): each square a dot, each side
 * between two squares an edge, wired or not.
 *
 * One ladder serves the generator, which rewires a network until the ladder
 * settles it and keeps an Easy board only where the ladder finishes it from
 * its walls; the answer search, which assumes a side either way where the
 * ladder stops; the difficulty probe; and the hint, which walks it from the
 * player's locks, notes and walls (`hint.ts`). No technique supposes
 * anything, so a board the ladder finishes has one answer.
 */

import {
  type Answer,
  answerCache,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  clueList,
  type GridSpace,
  rangeMask,
  tilingSpace,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import { D, DIRECTIONS, L, R, U } from "../../engine/square-edges.ts";
import { type SquareTiling, squareTiling } from "../../engine/square-tiling.ts";
import * as net from "./net.compiled.ts";
import { LOCKED, type NetState, NOTE_NONE, NOTE_WIRE, sideIndex } from "./state.ts";

/** What the description reads a wire as, and a side with none. */
export const WIRE = 1;
export const NONE = 2;

/** A board's wires and walls: what an answer depends on. A `NetState` is one,
 * and its locks and the way its tiles happen to be turned are not read. */
export type NetBoard = Pick<NetState, "w" | "h" | "tiles" | "barriers" | "wrapping">;

/** A board's one answer is each tile's wires as they are turned in it. */
export type NetAnswer = Answer<Uint8Array>;

/** A board's squares as a tiling, and the space the ladder reads it as. */
export interface NetGeometry extends SquareTiling {
  readonly sp: GridSpace;
}

const geometries = new Map<string, NetGeometry>();

/** The tiling of a `w × h` board, wrapping or not, built once a shape. */
function geometryOf(w: number, h: number, wrapping: boolean): NetGeometry {
  const key = `${w}x${h}${wrapping ? "w" : ""}`;
  let g = geometries.get(key);
  if (g === undefined) {
    const t = squareTiling(w, h, wrapping);
    g = { ...t, sp: tilingSpace(t.tiling) };
    geometries.set(key, g);
  }
  return g;
}

/** The piece a set of wires is, as the description numbers it: 1 a dead
 * end, 2 a straight, 3 a corner, 4 a T, 5 a cross, and 0 for no wires. */
function pieceOf(wires: number): number {
  let n = 0;
  for (const d of DIRECTIONS) if (wires & d) n++;
  if (n === 2) return wires === (L | R) || wires === (U | D) ? 2 : 3;
  return n === 0 ? 0 : n === 1 ? 1 : n + 1;
}

/** The board as the description deals it: each square's piece, and a wall
 * on each side a barrier crosses. A side across the grid's edge of a board
 * that does not wrap is no edge at all. */
function dealtOf(board: NetBoard, g: NetGeometry): net.Dealt {
  const n = board.w * board.h;
  const at: number[] = [];
  const v: number[] = [];
  const walls: number[] = [];
  for (let i = 0; i < n; i++) {
    const piece = pieceOf(board.tiles[i] & 0xf);
    if (piece > 0) {
      at.push(i);
      v.push(piece);
    }
    for (const d of [R, D]) {
      const e = g.sideEdge[i * 16 + d];
      if (e >= 0 && board.barriers[i] & d) walls.push(e);
    }
  }
  return {
    piece: clueList(at, v, n),
    wall: clueList(
      walls,
      walls.map(() => 1),
      g.sp.edges.length,
    ),
  };
}

/** Why one firing of the ladder holds: its technique and its binding, read
 * before the firing changes anything. */
export interface Fired {
  readonly kind: net.LadderId;
  readonly c: number;
  /** The side a note settles; absent for a lock. */
  readonly e?: number;
}

/** The ladder over the dealt board, each technique with its reason. */
function netLadder(dl: net.Dealt): Ladder {
  const rung = <B extends { c: number; e?: number }>(
    kind: net.LadderId,
    run: (b: never, sp: GridSpace, cl: net.Dealt, fire: never) => number,
  ) =>
    compiledRung(
      run as Parameters<typeof compiledRung<B, net.Dealt>>[0],
      dl,
      (b: B): Fired =>
        b.e === undefined ? { kind, c: b.c } : { kind, c: b.c, e: b.e },
    );
  return describedLadder(net, {
    fitLock: rung("fitLock", net.fitLock),
    fitNote: rung("fitNote", net.fitNote),
    loopLock: rung("loopLock", net.loopLock),
    loopNote: rung("loopNote", net.loopNote),
    sealLock: rung("sealLock", net.sealLock),
    sealNote: rung("sealNote", net.sealNote),
    strandLock: rung("strandLock", net.strandLock),
    strandNote: rung("strandNote", net.strandNote),
  });
}

/** A board's ladder and what it reads the board as, kept with the tiles and
 * walls it was dealt from: every solve of one board shares it. */
interface Kept {
  readonly tiles: Uint8Array;
  readonly barriers: Uint8Array;
  readonly g: NetGeometry;
  readonly dl: net.Dealt;
  readonly ladder: Ladder;
  /** The ladder's first ideas alone, {@link QUICK}. */
  readonly quick: Ladder;
}

/**
 * The ideas that read no reach: what an Unreasonable deal rewires a network
 * by and searches it with, before the whole ladder is asked once whether it
 * finishes the board. The whole ladder settles most networks, so asking it
 * at every rewiring cost a 9x11 wrapping deal seconds.
 */
const QUICK: ReadonlySet<net.LadderId> = new Set<net.LadderId>([
  "fitLock",
  "fitNote",
  "loopLock",
  "loopNote",
]);

const ladders = new WeakMap<Uint8Array, Kept>();

/** The ladder of `board`, kept per tile array while its wires and walls are
 * the same: the generator rewires one array between solves. */
export function ladderOf(board: NetBoard): Kept {
  const kept = ladders.get(board.tiles);
  if (
    kept !== undefined &&
    kept.g === geometryOf(board.w, board.h, board.wrapping) &&
    kept.barriers.every((b, i) => b === board.barriers[i]) &&
    kept.tiles.every((t, i) => pieceOf(t & 0xf) === pieceOf(board.tiles[i] & 0xf))
  )
    return kept;
  const g = geometryOf(board.w, board.h, board.wrapping);
  const dl = dealtOf(board, g);
  const ladder = netLadder(dl);
  const made: Kept = {
    tiles: board.tiles.slice(),
    barriers: board.barriers.slice(),
    g,
    dl,
    ladder,
    quick: {
      ...ladder,
      entries: ladder.entries.filter((e) => QUICK.has(e.id as net.LadderId)),
    },
  };
  ladders.set(board.tiles, made);
  return made;
}

/** Fresh marks on `g`, each side as `known` has it (0 open, {@link WIRE},
 * {@link NONE}). */
export function marksOn(g: NetGeometry, known: Uint8Array): CellMarks {
  const m = new CellMarks(g.sp, rangeMask(WIRE, NONE), known, null, "edge");
  m.seed(known);
  return m;
}

/** What the board itself says of its sides: none across a wall. */
function wallMarks(g: NetGeometry, dl: net.Dealt): Uint8Array {
  const known = new Uint8Array(g.sp.edges.length);
  for (const e of dl.wall.at) known[e] = NONE;
  return known;
}

/**
 * What the player has recorded of the sides: a wall's none, a note, and each
 * side of a locked tile as it shows. A side two of them disagree about is
 * read as the first says, in that order; the mistake check is what reports
 * the disagreement.
 */
export function recordedMarks(s: NetState, g: NetGeometry, dl: net.Dealt): Uint8Array {
  const known = wallMarks(g, dl);
  const n = s.w * s.h;
  for (let i = 0; i < n; i++) {
    const x = i % s.w;
    const y = (i / s.w) | 0;
    for (const d of DIRECTIONS) {
      const e = g.sideEdge[i * 16 + d];
      if (e < 0 || known[e] !== 0) continue;
      const note = s.sides[sideIndex(s, x, y, d)];
      if (note === NOTE_WIRE) known[e] = WIRE;
      else if (note === NOTE_NONE) known[e] = NONE;
    }
  }
  for (let i = 0; i < n; i++) {
    if (!(s.tiles[i] & LOCKED)) continue;
    for (const d of DIRECTIONS) {
      const e = g.sideEdge[i * 16 + d];
      if (e >= 0 && known[e] === 0) known[e] = s.tiles[i] & d ? WIRE : NONE;
    }
  }
  return known;
}

/** Run the ladder on `m` to its fixpoint, at Easy: whether it found the
 * marks inconsistent. */
function deduce(m: CellMarks, ladder: Ladder): boolean {
  return runLadder(m, ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {}));
}

/** Each tile's wires as the marks have its sides: a wire where a side is
 * known wired. */
function wiresOf(g: NetGeometry, grid: ArrayLike<number>, n: number): Uint8Array {
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++)
    for (const d of DIRECTIONS) {
      const e = g.sideEdge[i * 16 + d];
      if (e >= 0 && grid[e] === WIRE) out[i] |= d;
    }
  return out;
}

/** Whether every side of tile `i` is known. */
function tileKnown(g: NetGeometry, grid: ArrayLike<number>, i: number): boolean {
  for (const d of DIRECTIONS) {
    const e = g.sideEdge[i * 16 + d];
    if (e >= 0 && grid[e] === 0) return false;
  }
  return true;
}

/**
 * Whether the ladder alone settles every side of `tiles`, a network's wires
 * however they are turned, with the walls `barriers` (none where `null`):
 * the whole ladder, or with `quick` its first ideas. Each tile it settles
 * gains the `LOCKED` bit and each other loses it, which the generator
 * rewires the network along.
 */
export function settle(
  w: number,
  h: number,
  tiles: Uint8Array,
  barriers: Uint8Array | null,
  wrapping: boolean,
  quick = false,
): boolean {
  const board: NetBoard = {
    w,
    h,
    tiles,
    barriers: barriers ?? new Uint8Array(w * h),
    wrapping,
  };
  const kept = ladderOf(board);
  const { g, dl } = kept;
  const m = marksOn(g, wallMarks(g, dl));
  const impossible = deduce(m, quick ? kept.quick : kept.ladder);
  let all = !impossible;
  for (let i = 0; i < w * h; i++) {
    if (!impossible && tileKnown(g, m.grid, i)) tiles[i] |= LOCKED;
    else {
      tiles[i] &= ~LOCKED;
      all = false;
    }
  }
  return all && net.isAnswer(m.grid, g.sp, dl);
}

/** Whether the ladder finishes the board from what its player has recorded:
 * from its walls alone on a board just dealt. */
export function finishes(s: NetState): boolean {
  const { g, dl, ladder } = ladderOf(s);
  const m = marksOn(g, recordedMarks(s, g, dl));
  if (deduce(m, ladder)) return false;
  return !m.grid.includes(0) && net.isAnswer(m.grid, g.sp, dl);
}

/* ----------------------------------------------------------------------
 * The answer: a search over the ladder that counts a board's answers to two.
 */

/** A position of the search: its marks, which it narrows in place. */
interface Position {
  readonly m: CellMarks;
}

/**
 * The positions the search may try before it gives up, which decides which
 * Unreasonable boards exist ({@link AnswerSearch.budget}): lowering it
 * refuses boards in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder:
 * where it stops, take an open side of the tile with the fewest open sides
 * and assume it wired, then not. With `quick`, over the ladder's first ideas
 * ({@link QUICK}), as a deal asks it.
 */
export function searchAnswers(
  board: NetBoard,
  budget: number = SEARCH_BUDGET,
  quick = false,
): NetAnswer {
  const kept = ladderOf(board);
  const { g, dl } = kept;
  const ladder = quick ? kept.quick : kept.ladder;
  const n = board.w * board.h;
  return searchBoard<Position, Uint8Array>({
    start: { m: marksOn(g, wallMarks(g, dl)) },
    deduce({ m }) {
      if (deduce(m, ladder)) return "contradiction";
      if (m.grid.includes(0)) return "stuck";
      return net.isAnswer(m.grid, g.sp, dl) ? "solved" : "contradiction";
    },
    assume({ m }) {
      let at = -1;
      let fewest = 5;
      for (let i = 0; i < n; i++) {
        let open = 0;
        for (const e of g.sp.cellEdges[i]) if (m.grid[e] === 0) open++;
        if (open > 0 && open < fewest) {
          at = i;
          fewest = open;
        }
      }
      if (at < 0) return [];
      const e = g.sp.cellEdges[at].find((x) => m.grid[x] === 0) as number;
      return [WIRE, NONE].map((v) => {
        const next = marksOn(g, Uint8Array.from(m.grid));
        next.place(e, v);
        return { m: next };
      });
    },
    solution: ({ m }) => wiresOf(g, m.grid, n),
    budget,
  });
}

/** Keyed on a state's walls, which every state of one game shares. */
const answers = answerCache<Uint8Array, Uint8Array>();

/** What a search of a state's wires and walls established about their
 * answers. */
export function answerOf(state: NetState): NetAnswer {
  return answers(state.barriers, () => searchAnswers(state));
}
