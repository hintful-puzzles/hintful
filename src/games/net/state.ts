/** Types, bit vocabulary, params and pure state helpers for Net. */

import {
  DIFF_EASY,
  DIFF_UNREASONABLE,
  SEARCH_TIER_NAMES,
  searchTierItem,
  searchTierSegment,
} from "../../engine/answer-search.ts";
import { parseLeadingInt } from "../../engine/decimal.ts";
import { descValue } from "../../engine/desc-error.ts";
import { noSuchTier, tooRareToDeal } from "../../engine/difficulty.ts";
import { AREA_TOO_LARGE, atof, formatG } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { newCursor } from "../../engine/pointer.ts";
import type { Point } from "../../engine/types.ts";
import {
  addBorderBarriers,
  computeActive as computeActiveWires,
  D,
  L,
  offset,
  parseWireDesc,
  R,
  U,
} from "../../engine/wires.ts";

/* ----------------------------------------------------------------------
 * Bit vocabulary.
 *
 * A tile's low four bits are its wires (`R U L D`); the same four bits name a
 * neighbor direction (all in `engine/wires.ts`). Net owns the two high bits:
 * `LOCKED` (the player has pinned this tile) and `ACTIVE` (computed by the
 * power flood, never stored in the desc).
 */

/** The player has locked this tile; it cannot be rotated. Stored in `tiles`. */
export const LOCKED = 0x10;
/** Powered from the source. Computed by {@link computeActive}, not persisted. */
export const ACTIVE = 0x20;

/* ----------------------------------------------------------------------
 * Params.
 */

export interface NetParams {
  w: number;
  h: number;
  /** Walls wrap around: the grid is a torus with no border barriers. */
  wrapping: boolean;
  /** Fraction of the candidate wall sites that become barriers, in [0, 1]. */
  barrierProbability: number;
  /** `DIFF_EASY`, a board the solver and the hint finish, or
   * `DIFF_UNREASONABLE`, one with a single answer that they do not reach.
   * Generation-time only. */
  diff: number;
}

export function defaultParams(): NetParams {
  return { w: 5, h: 5, wrapping: false, barrierProbability: 0, diff: DIFF_EASY };
}

/** The Custom dialog's difficulty field, which the codec writes as well. */
export const tierItem = searchTierItem<NetParams>(
  "diff",
  "An Easy puzzle can be finished one forced square at a time: there is always a square with only one way left to turn, or a side every way left agrees about. An Unreasonable one has a single solution that those steps stop short of, so somewhere you have to try a square one way and see what follows. The Hint button stops where the forced squares do.",
);

// Last, in the full form only. Upstream's IDs lack it, and without one a
// board is Easy, the only kind upstream deals with its checks on.
const tierSegment = searchTierSegment([tierItem]);

export function encodeParams(p: NetParams, full: boolean): string {
  let s = `${p.w}x${p.h}`;
  if (p.wrapping) s += "w";
  if (full && p.barrierProbability) s += `b${formatG(p.barrierProbability)}`;
  return s + tierSegment.encode(p, full);
}

export function decodeParams(s: string): NetParams {
  // Start from the defaults, as upstream's midend does, so an absent suffix
  // keeps its default.
  const p = defaultParams();

  const width = parseLeadingInt(s, 0);
  p.w = width.value;
  let i = width.next;

  if (s[i] === "x") {
    const height = parseLeadingInt(s, i + 1);
    p.h = height.value;
    i = height.next;
  } else {
    p.h = p.w;
  }

  while (i < s.length) {
    if (s[i] === "w") {
      p.wrapping = true;
      i++;
    } else if (s[i] === "b") {
      i++;
      const start = i;
      while (i < s.length && (/[0-9]/.test(s[i]) || s[i] === ".")) i++;
      // The C stores this as a `float`, so round to single precision now.
      p.barrierProbability = Math.fround(atof(s.slice(start, i)));
    } else if (s[i] === "d") {
      i = tierSegment.decode(s, i, p);
    } else {
      // Any other gunk is skipped, as upstream. That takes in upstream's `a`,
      // which asks for a board with no promised single answer: every board
      // dealt here has one.
      i++;
    }
  }
  return p;
}

export function validateParams(p: NetParams, full: boolean): string | null {
  if (p.w <= 1 && p.h <= 1)
    return "At least one of width and height must be greater than one.";
  if (p.w * p.h > 1_000_000) return AREA_TOO_LARGE;
  // A wrapping grid with a dimension of 2 provably cannot have a unique
  // solution (net.c carries the 40-line proof); reject it up front.
  if (full && p.wrapping && (p.w === 2 || p.h === 2))
    return "No wrapping puzzle with a width or height of 2 can have a unique solution.";
  if (full && p.diff === DIFF_UNREASONABLE) return unreasonableRefusal(p);
  return null;
}

/**
 * The largest Unreasonable board dealt, in squares, and the longest a
 * wrapping one may be: at any width, and at a width of four. A wrapping board
 * with an even shorter side is far slower to deal than one a square wider or
 * narrower.
 *
 * Measured 2026-10-10, mean time for a board inside the bounds | past them:
 * 30×30 0.45 s, 3×300 0.6 s, 4×225 0.7 s, 20×45 0.1 s | 40×40 0.7 s, 4×400
 * 1.9 s, 50×50 1.9 s, 70×70 none in 8 s. Wrapping: 30×30 0.45 s, 10×80
 * 0.3 s, 6×80 0.65 s, 4×30 0.6 s | 6×120 over 2 s, 4×50 over 2 s and none in
 * 5 s half the time, 4×80 none in 5 s, 3×300 3 s.
 */
const MAX_UNREASONABLE_AREA = 900;

/**
 * The most barriers an Unreasonable board is dealt with. A wall tells the
 * solver what crosses a side, so the more a board has the likelier the solver
 * settles it, and with every one drawn it settles every board.
 *
 * Measured 2026-10-10 on 5×5, 11×13, and wrapping 7×7 and 11×11, six deals
 * each: at 0.3 a deal takes 0.1 s to 0.4 s; at 0.5 it takes 0.6 s to 1.5 s
 * and two 5×5 deals in five gave up after 3 s; at 0.75 most gave up, after 3
 * to 13 s.
 */
const MAX_UNREASONABLE_BARRIERS = 0.3;
const MAX_UNREASONABLE_WRAPPING_SIDE = 80;
const MAX_UNREASONABLE_WRAPPING_SIDE_FOUR_WIDE = 30;

function unreasonableRefusal(p: NetParams): string | null {
  const tier = SEARCH_TIER_NAMES[DIFF_UNREASONABLE] as string;
  const short = Math.min(p.w, p.h);
  const long = Math.max(p.w, p.h);
  const size = `${p.w}x${p.h}`;
  // A strip is one line of squares, and its network is the line: every
  // square but the two at its ends is a straight that can only lie along it.
  if (short === 1) return noSuchTier(`${size} puzzle`, tier);
  // Every network and every set of walls on these was tried
  // (`net-tier.test.ts`), and the solver settles each one.
  if (!p.wrapping && (short === 2 ? long <= 6 : short === 3 && long <= 4))
    return noSuchTier(`${size} puzzle without wrapping`, tier);
  // The probability is kept in single precision, where 0.3 is a little more.
  if (p.barrierProbability > Math.fround(MAX_UNREASONABLE_BARRIERS))
    return tooRareToDeal(
      `puzzles with a barrier probability over ${MAX_UNREASONABLE_BARRIERS}`,
      tier,
    );
  if (p.w * p.h > MAX_UNREASONABLE_AREA)
    return `An ${tier} puzzle must have at most ${MAX_UNREASONABLE_AREA} squares; a larger one takes too long to deal.`;
  if (p.wrapping) {
    const most =
      short === 4
        ? MAX_UNREASONABLE_WRAPPING_SIDE_FOUR_WIDE
        : MAX_UNREASONABLE_WRAPPING_SIDE;
    if (long > most)
      return `An ${tier} wrapping puzzle ${short === 4 ? "four squares wide " : ""}must be at most ${most} squares long; a longer one takes too long to deal.`;
  }
  return null;
}

/* ----------------------------------------------------------------------
 * Moves: upstream's `;`-separated `A|C|F|L x,y` tokens (with a `J`/`S` prefix
 * on jumble and solve batches), as a union of the four shapes the game makes.
 */

/** One tile operation inside a jumble/solve batch. */
export type NetOp = { op: "A" | "C" | "F" | "L"; x: number; y: number };

export type NetMove =
  /** A single rotation of one tile — animates. `A` = anticlockwise,
   * `C` = clockwise, `F` = 180°. */
  | { type: "rotate"; op: "A" | "C" | "F"; x: number; y: number }
  /** Toggle the lock on one tile — no animation. */
  | { type: "lock"; x: number; y: number }
  /** Jumble: rotate every unlocked tile a random amount, expanded to an
   * explicit op list so replay is deterministic. No animation. */
  | { type: "jumble"; ops: NetOp[] }
  /** Solve: transform the current grid into the solution. No animation. */
  | { type: "solve"; ops: NetOp[] }
  /** Set the note on one side, named from the tile left of it (`dir` = `R`)
   * or above it (`D`): an absolute set, so re-applying it changes nothing. */
  | { type: "note"; x: number; y: number; dir: number; note: SideNote };

/** A player's note on the side two tiles share. */
export type SideNote = typeof NOTE_UNKNOWN | typeof NOTE_WIRE | typeof NOTE_NONE;
export const NOTE_UNKNOWN = 0;
/** A wire crosses this side. */
export const NOTE_WIRE = 1;
/** No wire crosses this side. */
export const NOTE_NONE = 2;

/**
 * Where the note on side `dir` of tile `(x, y)` lives in {@link NetState.sides}:
 * a side is kept once, under the tile left of it or above it, so the same side
 * named from either tile is one entry. On a wrapping grid the side off the
 * right edge is the one left of column 0.
 */
export function sideIndex(
  s: { w: number; h: number },
  x: number,
  y: number,
  dir: number,
): number {
  if (dir === R || dir === D) return (y * s.w + x) * 2 + (dir === R ? 0 : 1);
  const o = offset(x, y, dir, s.w, s.h);
  return (o.y * s.w + o.x) * 2 + (dir === L ? 0 : 1);
}

/* ----------------------------------------------------------------------
 * State.
 */

export interface NetState {
  readonly w: number;
  readonly h: number;
  /** Re-derived from the barriers, as upstream: a wrapping grid whose every
   * border edge carries a wall is de-facto non-wrapping, which disables
   * origin-shifting. */
  readonly wrapping: boolean;

  /** Wire masks with the `LOCKED` bit, row-major. The only part of the state a
   * move changes. */
  readonly tiles: Uint8Array;
  /** Walls, row-major (low four bits only; the renderer derives corner joins
   * per frame). Fixed for the whole game, so every state shares this one array
   * and a move copies only `tiles`. Nothing after `newState` writes to it (a
   * populated typed array cannot be frozen, so the `readonly` type is the
   * guarantee). */
  readonly barriers: Uint8Array;
  /** The player's side notes, two per tile ({@link sideIndex}), each a
   * {@link SideNote}. A note move copies it; nothing else does. */
  readonly sides: Uint8Array;

  /** The tile last rotated and which way, for the rotation animation. `dir` is
   * 0 (no animation — a lock, jumble or solve), +1 (`A`), −1 (`C`) or +2 (`F`).
   */
  readonly lastRotateX: number;
  readonly lastRotateY: number;
  readonly lastRotateDir: number;
}

/**
 * Parse a desc into the initial state: the wire grid, the barriers named by the
 * desc's `v`/`h` markers, and the border wall a non-wrapping game is fenced in
 * by.
 */
export function newState(p: NetParams, desc: string): NetState {
  const { w, h } = p;
  const { tiles, barriers } = descValue(parseWireDesc(w, h, p.wrapping, desc));

  let wrapping = false;
  if (!p.wrapping) {
    addBorderBarriers(barriers, w, h);
  } else {
    for (let x = 0; x < w; x++) {
      if (!(barriers[x] & U) || !(barriers[(h - 1) * w + x] & D)) wrapping = true;
    }
    for (let y = 0; y < h; y++) {
      if (!(barriers[y * w] & L) || !(barriers[y * w + (w - 1)] & R)) wrapping = true;
    }
  }

  return {
    w,
    h,
    wrapping,
    tiles,
    barriers,
    sides: new Uint8Array(w * h * 2),
    lastRotateX: 0,
    lastRotateY: 0,
    lastRotateDir: 0,
  };
}

/* ----------------------------------------------------------------------
 * Powering + completion.
 */

/** Flood outward from `(cx, cy)`, marking the tiles powered from there. */
export function computeActive(s: NetState, cx: number, cy: number): Uint8Array {
  return computeActiveWires(s.w, s.h, s.tiles, s.barriers, cx, cy, ACTIVE);
}

/**
 * Is the whole grid connected? Upstream floods from the *first non-empty tile*
 * rather than the ui source, because connectedness is independent of where you
 * start; the game is complete when every non-empty tile is powered.
 */
export function isComplete(s: NetState): boolean {
  const pos = s.tiles.findIndex((t) => (t & 0xf) !== 0);
  if (pos < 0) return true; // an all-empty grid is trivially "complete"
  const active = computeActive(s, pos % s.w, Math.floor(pos / s.w));
  return s.tiles.every((t, i) => !(t & 0xf) || active[i] !== 0);
}

/* ----------------------------------------------------------------------
 * UI.
 */

export interface NetUi {
  /** Origin: the physical top-left of a wrapping grid, shifted by Shift+arrow.
   * Always `(0, 0)` on a non-wrapping grid. */
  orgX: number;
  orgY: number;
  /** The source (the black box power flows from), moved by Ctrl+arrow. */
  cx: number;
  cy: number;
  /** The keyboard cursor. */
  cursor: GridCursor;
  /** Highlight loops that involve unlocked squares (the one preference). */
  unlockedLoops: boolean;
  /** Notes mode: a tap or a select notes a side instead of turning a tile. */
  pencilMode: boolean;
  /** The tile a keyboard note starts from, in notes mode: the next select on
   * a neighbor notes the side between them. */
  pin: Point | null;
  /** Set by the Source key: the next press on a square, or select at the
   * cursor, lights the network from there. The pointer's route to what
   * Ctrl+arrow does. */
  placingSource: boolean;
  /** A drag in the margin of a wrapping grid, scrolling it as Shift+arrow
   * does: where it started, and the origin then. */
  scroll: { x: number; y: number; orgX: number; orgY: number } | null;
}

export function newUi(s: NetState): NetUi {
  const cx = Math.floor(s.w / 2);
  const cy = Math.floor(s.h / 2);
  return {
    orgX: 0,
    orgY: 0,
    cx,
    cy,
    cursor: newCursor(cx, cy),
    unlockedLoops: true,
    pencilMode: false,
    pin: null,
    placingSource: false,
    scroll: null,
  };
}
