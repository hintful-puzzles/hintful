/**
 * Net's solver: the ladder `net.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/solve/cell-marks.ts` and `ladder-runtime.ts`)
 * over the board read as a tiling (`engine/solve/square-tiling.ts`): each square a
 * dot, each side between two squares an edge, wired or not.
 *
 * One ladder serves the generator, which rewires a network until the ladder
 * settles it and keeps an Easy board only where the ladder finishes it from
 * its walls; the answer search, which assumes a side either way where the
 * ladder stops; the difficulty probe; and the hint, which walks it from the
 * player's locks, notes and walls (`hint.ts`). No technique supposes
 * anything, so a board the ladder finishes has one answer.
 */

import { D, DIRECTIONS, L, R, U } from "../../engine/board/square-edges.ts";
import type { RulesOf } from "../../engine/contract/rules.ts";
import { liveErrors } from "../../engine/render/live-errors.ts";
import {
  type Answer,
  answerCache,
  searchAnswers as searchBoard,
} from "../../engine/solve/answer-search.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import {
  clueList,
  cluesWhere,
  type GridSpace,
  perBoard,
  rangeMask,
  tilingSpace,
} from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import { type SquareTiling, squareTiling } from "../../engine/solve/square-tiling.ts";
import * as net from "../../generated/games/net/net.compiled.ts";
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
  const walls: number[] = [];
  for (let i = 0; i < board.w * board.h; i++)
    for (const d of [R, D]) {
      const e = g.sideEdge[i * 16 + d];
      if (e >= 0 && board.barriers[i] & d) walls.push(e);
    }
  const piece = (t: number): number => pieceOf(t & 0xf);
  return {
    piece: cluesWhere(board.tiles, (t) => piece(t) > 0, piece),
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
  return describedLadder(net, dl, {
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

/** The ladder of `board`, kept per tile array while its wires and walls are
 * the same: the generator rewires one array between solves. */
const laddersOf = perBoard(
  (_tiles: Uint8Array, board: NetBoard): Kept => {
    const g = geometryOf(board.w, board.h, board.wrapping);
    const dl = dealtOf(board, g);
    const ladder = netLadder(dl);
    return {
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
  },
  (kept, _tiles, board) =>
    kept.g === geometryOf(board.w, board.h, board.wrapping) &&
    kept.barriers.every((b, i) => b === board.barriers[i]) &&
    kept.tiles.every((t, i) => pieceOf(t & 0xf) === pieceOf(board.tiles[i] & 0xf)),
);

export const ladderOf = (board: NetBoard): Kept => laddersOf(board.tiles, board);

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
 * What the player has recorded of the sides: each side of a locked tile as
 * it shows, a note, and a wall's none. A side two of them disagree about is
 * read as the first says, in that order, and as a wire where two locks
 * disagree, so the rules find the disagreement where it stands: a wire
 * across a wall, or a locked piece given a wire it has not. Which of the two
 * is wrong is the mistake check's to say, and the hint asks for mistakes to
 * be fixed before it reads these.
 */
export function recordedMarks(s: NetState, g: NetGeometry, dl: net.Dealt): Uint8Array {
  const known = new Uint8Array(g.sp.edges.length);
  const n = s.w * s.h;
  for (let i = 0; i < n; i++) {
    if (!(s.tiles[i] & LOCKED)) continue;
    for (const d of DIRECTIONS) {
      const e = g.sideEdge[i * 16 + d];
      if (e < 0) continue;
      if (s.tiles[i] & d) known[e] = WIRE;
      else if (known[e] === 0) known[e] = NONE;
    }
  }
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
  for (const e of dl.wall.at) if (known[e] === 0) known[e] = NONE;
  return known;
}

/** The board as its rules read it: the sides the player has recorded
 * ({@link recordedMarks}). A tile turned but not locked records nothing. */
export const rules: RulesOf<NetState> = describedRules(net, {
  space: (s) => geometryOf(s.w, s.h, s.wrapping).sp,
  grid: (s) => {
    const g = geometryOf(s.w, s.h, s.wrapping);
    return recordedMarks(s, g, dealtOf(s, g));
  },
  deals: (s) => [dealtOf(s, geometryOf(s.w, s.h, s.wrapping))],
});

/**
 * {@link rules}' reading with the wires of unlocked tiles that meet across
 * a side read as a wire, where nothing is recorded there: what a loop
 * through unlocked tiles is found on, for the player who asks to see one
 * (`NetUi.unlockedLoops`). A loop the tiles make as they are turned is
 * certain only of the board as it is turned, not of the player's records.
 */
function turnedGrid(s: NetState): Uint8Array {
  const g = geometryOf(s.w, s.h, s.wrapping);
  const out = rules.grid(s) as Uint8Array;
  for (let i = 0; i < s.w * s.h; i++)
    for (const d of [R, D]) {
      const e = g.sideEdge[i * 16 + d];
      if (e < 0 || out[e] !== 0 || s.barriers[i] & d || !(s.tiles[i] & d)) continue;
      const x = i % s.w;
      const y = (i / s.w) | 0;
      const j = d === R ? y * s.w + ((x + 1) % s.w) : ((y + 1) % s.h) * s.w + x;
      if (s.tiles[j] & (d === R ? L : U)) out[e] = WIRE;
    }
  return out;
}

const NO_LOOP: net.RuleName = "noLoop";
const PIECE: keyof net.Dealt = "piece";

/**
 * The live errors as each tile's wires to draw red, a direction's bit per
 * wire: every wire of a tile whose piece no longer fits the sides, and each
 * wire across a side a broken rule names (a loop's, a closed group's, a
 * wall's, a side two locks disagree about). With `turned`, the loops the
 * tiles make as they are turned too ({@link turnedGrid}).
 */
export function errorWires(s: NetState, turned: boolean): Uint8Array {
  const g = geometryOf(s.w, s.h, s.wrapping);
  const live = liveErrors(rules, s);
  const bad = new Uint8Array(g.sp.edges.length);
  bad.set(live.at);
  for (const pair of live.pairs) for (const e of pair) bad[e] = 1;
  for (const byClue of live.clueAt.values())
    for (const els of byClue.values()) for (const e of els) bad[e] = 1;
  if (turned)
    for (const at of liveErrors(rules, s, turnedGrid(s)).byRule.get(NO_LOOP) ?? [])
      for (const e of at) bad[e] = 1;
  const out = new Uint8Array(s.w * s.h);
  const pieces = live.clues.get(PIECE);
  if (pieces !== undefined) {
    const at = dealtOf(s, g).piece.at;
    for (const k of pieces) out[at[k]] = 0xf;
  }
  for (let i = 0; i < s.w * s.h; i++)
    for (const d of DIRECTIONS) {
      const e = g.sideEdge[i * 16 + d];
      if (e >= 0 && bad[e]) out[i] |= d;
    }
  return out;
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
        const next = m.fork();
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
