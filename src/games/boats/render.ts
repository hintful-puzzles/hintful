/**
 * Boats rendering — port of `game_redraw` from `unreleased/boats.c`.
 *
 * The canvas is the `w × h` board, a right column and a bottom row for the
 * occupancy numbers, and — below a half-tile gutter — the **fleet display**: a
 * list of every boat to be found, drawn as segments and struck through once the
 * player has completed one of that size.
 *
 * Each cell paints its own background (water blue for anything the player
 * decided and for given water, the lifted surface under a given segment, the
 * plain cell surface for an undecided square), a thin grid outline, and its
 * part of the boat's hull, one `drawSegment` for the board and the fleet list
 * alike.
 *
 * **Two error layers, deliberately:**
 *  - the *live* rule violations upstream already draws as you play — a line
 *    whose number is exceeded, a segment contradicting its given clue, a boat
 *    the fleet cannot accommodate, and the warning diamond between two boats
 *    that touch diagonally. These need no solver call.
 *  - the *Check & Save* overlay from `findMistakes`, which re-solves to the
 *    unique solution. It catches a locally-legal placement no solution
 *    permits, which is exactly the board a live-only check would let Check &
 *    Save bless. Its cells are not a superset of the live ones: a live flag
 *    can sit on a given square or on a line's number, and neither is a square
 *    the player filled.
 *
 * The tile cache keys a square on the drawn segment, the live error/cursor
 * flags, the flash phase and the hint role (docs/rendering.md § "The tile
 * cache and the diff key"); the Check & Save overlay rides in an
 * `OverlaySidecar` registered with it, so it repaints a cell whose contents are otherwise
 * unchanged (the frame after the move that drew it).
 */

import { fromCoord as fromCoordE } from "../../engine/board/geometry.ts";
import { BLUE_WASH } from "../../engine/color/colors.ts";
import {
  cellSurface,
  clueDoneColor,
  ERROR_TEXT,
  givenSurface,
  INK,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  COL_BACKGROUND,
  COL_CURSOR,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import { CELL, stepMarks } from "../../engine/contract/hint-words.ts";
import type {
  Color,
  DrawTextOptions,
  Point,
  Rect,
  Size,
} from "../../engine/contract/types.ts";
import { drawRectOutline, drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { OverlaySidecar } from "../../engine/overlay-sidecar.ts";
import {
  drawPiecePart,
  JOIN_DOWN,
  JOIN_LEFT,
  JOIN_RIGHT,
  JOIN_UP,
} from "../../engine/piece.ts";
import { NOTHING_TO_CLEAR, textBox } from "../../engine/ring.ts";
import { TileCache } from "../../engine/tile-cache.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { BoatsHint } from "./index.ts";
import type { BoatsMistake } from "./solver.ts";
import {
  type BoatsMove,
  type BoatsParams,
  type BoatsState,
  type BoatsUi,
  boardOf,
  EMPTY,
  isShip,
  NO_CLUE,
  SHIP_BOTTOM,
  SHIP_CENTER,
  SHIP_LEFT,
  SHIP_RIGHT,
  SHIP_SINGLE,
  SHIP_TOP,
  SHIP_VAGUE,
  STATUS_INVALID,
  WATER,
} from "./state.ts";
import {
  checkCollision,
  checkFleet,
  countShips,
  FD_CURSOR,
  FE_COLLISION,
  FE_FLEET,
  FE_MISMATCH,
  validateGridClues,
} from "./validate.ts";

export const PREFERRED_TILE_SIZE = 32;

// --- palette ---------------------------------------------------------------

const COL_GRID = FIRST_GAME_SLOT; // the line between two squares, and the frame
export const COL_WATER = FIRST_GAME_SLOT + 1;
/** A boat segment: the player's, the puzzle's, and a boat still to be found
 * in the fleet tally, which is the same piece. */
export const COL_SHIP = FIRST_GAME_SLOT + 2;
const COL_SHIP_FLEET_DONE = FIRST_GAME_SLOT + 3;
const COL_SHIP_FLEET_STRIPE = FIRST_GAME_SLOT + 4;
export const COL_COUNT = FIRST_GAME_SLOT + 5;
export const COL_COLLISION_TEXT = FIRST_GAME_SLOT + 6;
const COL_CELL = FIRST_GAME_SLOT + 7; // the surface of an undecided square
export const COL_GIVEN = FIRST_GAME_SLOT + 8; // the lifted surface under a segment the puzzle gave
/** The waves on a given water square and the edge of a collision diamond. */
export const COL_INK = FIRST_GAME_SLOT + 9;

export function colors(defaultBackground: Color): Color[] {
  const out = rolePalette(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_INK] = INK;
  out[COL_WATER] = BLUE_WASH;
  // A segment the puzzle gave is the same piece: its lifted cell tells it.
  out[COL_SHIP] = SHADED;
  out[COL_SHIP_FLEET_DONE] = clueDoneColor(defaultBackground);
  out[COL_SHIP_FLEET_STRIPE] = INK;
  out[COL_COUNT] = INK;
  out[COL_COLLISION_TEXT] = ERROR_TEXT;
  return out;
}

// --- geometry --------------------------------------------------------------

/** The web build compiles `NARROW_BORDERS`, so there is no outer margin
 * (docs/rendering.md § "Sizing"). */
export const BORDER = 0;

/** Where a segment the fleet cannot hold takes its "?", in the square at
 * `(tx, ty)`: read by the text and by the ring round the square. */
function fleetMarkText(
  tx: number,
  ty: number,
  ts: number,
): { origin: Point; options: DrawTextOptions } {
  return {
    origin: { x: tx + ts / 2, y: ty + ts / 2 },
    options: glyphFont((ts / 2) | 0),
  };
}

/** Vertical gap between the number row and the fleet display. */
const gutter = (ts: number): number => (ts / 2) | 0;

/** Where the fleet display's first boat starts, in tile units. */
const FLEET_X = 0.5;
/** One fleet segment's size, as a fraction of a tile. */
const FLEET_SIZE = 0.75;
/** Gap between two boats in the fleet display, in tile units. */
const FLEET_MARGIN = 0.25;
/** Thickness of the stripe through a boat the player has found. */
const STRIPE_SIZE = 2;

export function fromCoord(pixel: number, ts: number): number {
  return fromCoordE(pixel, ts, BORDER);
}

/** The pixel at the middle of cell `pos` along one axis: `fromCoord`'s inverse. */
export function cellCenter(pos: number, ts: number): number {
  return BORDER + pos * ts + (ts >> 1);
}

/** One boat's slot in the fleet display. */
export interface FleetSlot {
  /** Zero-based size index — this boat is `size + 1` segments long. */
  size: number;
  /** Which copy of that size, `0 … fleetData[size] - 1`. */
  copy: number;
  /** Left edge, in tile units along its row. */
  fx: number;
  /** Width including its trailing margin, in tile units. */
  width: number;
  /** Which row of the fleet display it sits on. */
  row: number;
}

/**
 * The canvas's width in tiles: the board and its column of numbers, or the
 * fleet's longest boat where that is wider. A boat has no break to take, and
 * a fleet may hold one as long as the board's longer side, so on a narrow
 * tall board the canvas is what gives.
 */
function canvasTiles(p: BoatsParams): number {
  const longest = p.fleetData.slice(0, p.fleet).findLastIndex((n) => n > 0) + 1;
  return Math.max(p.w + 1, longest * FLEET_SIZE);
}

/**
 * Where a slot on a fleet row may end at the latest: the canvas's right edge
 * in the row's own units, which start at `FLEET_X`, plus the trailing margin a
 * slot's width includes and nothing is drawn in. Upstream's `w + 2` is the
 * same edge on a canvas with half a tile of border each side, which this
 * build's has not (`BORDER`).
 */
const fleetRowLimit = (p: BoatsParams): number =>
  canvasTiles(p) + FLEET_X + FLEET_MARGIN;

/**
 * Where every boat in the fleet display goes — upstream's `boats_draw_fleet`
 * layout walk, shared by the measurer ({@link fleetRows}) and the drawer so the
 * two cannot disagree about how many rows there are.
 *
 * Upstream breaks a row **between whole batches**, keeping one size's boats
 * together, and that is kept. It has no break *within* a batch, so a fleet
 * holding more boats of one size than fit on a row — nine size-1 boats on a
 * 5-wide board, say — runs off the right edge of its canvas (the author's own
 * `TODO ui: Certain custom fleets don't fit in the UI`). The second test below
 * is that break, and a pure repair: whenever the batch-level test lets a batch
 * through, every boat in it fits too, so the per-boat test cannot fire.
 */
export function* fleetLayout(p: BoatsParams): Generator<FleetSlot> {
  const limit = fleetRowLimit(p);
  let fx = FLEET_X;
  let row = 0;
  for (let size = 0; size < p.fleet; size++) {
    const width = (size + 1) * FLEET_SIZE + FLEET_MARGIN;
    if (fx + p.fleetData[size] * width > limit && fx !== FLEET_X) {
      fx = FLEET_X;
      row++;
    }
    for (let copy = 0; copy < p.fleetData[size]; copy++) {
      if (fx + width > limit && fx !== FLEET_X) {
        fx = FLEET_X;
        row++;
      }
      yield { size, copy, fx, width, row };
      fx += width;
    }
  }
}

/** How many rows the fleet display needs. */
export function fleetRows(p: BoatsParams): number {
  let rows = 1;
  for (const slot of fleetLayout(p)) rows = Math.max(rows, slot.row + 1);
  return rows;
}

/** Upstream `game_compute_size`: the board plus one row/column of numbers, the
 * gutter, and the fleet rows — less the fleet's own bottom padding. The width
 * is {@link canvasTiles}, which upstream's does not widen for a long boat. */
export function computeSize(p: BoatsParams, ts: number): Size {
  const rows = fleetRows(p);
  return {
    w: 2 * BORDER + Math.ceil(canvasTiles(p) * ts),
    h:
      2 * BORDER +
      gutter(ts) +
      (p.h + 1 + rows) * ts -
      Math.trunc((1 - FLEET_SIZE) * ts),
  };
}

// --- draw state ------------------------------------------------------------

export interface BoatsDrawState {
  tileSize: number;
  w: number;
  h: number;
  fleet: number;
  /** Per square: the segment shape in bits 0–3, the live error/cursor flags in
   * bits 4–7, the displayed hint step's role for this square in bits 9–12, the
   * win flash's tone in bits 13–14, and the sides a segment joins the rest of
   * its boat on in bits 15–18. */
  tiles: TileCache;
  /** Per border number, its `STATUS_*` and hatch. */
  border: TileCache;
  /** Per boat size, the count of completed boats. */
  fleetCount: TileCache;
  /** The Check & Save mistake overlay; it must be in the diff key or it never
   * repaints (docs/rendering.md § "Overlay sidecars"). */
  wrong: OverlaySidecar;
}

export function newDrawState(state: BoatsState, tileSize: number): BoatsDrawState {
  const { w, h, fleet } = state.params;
  const wrong = new OverlaySidecar(w * h);
  return {
    tileSize,
    w,
    h,
    fleet,
    tiles: new TileCache(w * h, { overlays: [wrong] }),
    border: new TileCache(w + h),
    fleetCount: new TileCache(fleet),
    wrong,
  };
}

// --- primitives ------------------------------------------------------------

/** The sides a segment of each resolved shape joins the rest of its boat on;
 * a center's are its boat's axis, which the shape does not say. */
const SHAPE_JOINS: Readonly<Record<number, number>> = {
  [SHIP_TOP]: JOIN_DOWN,
  [SHIP_BOTTOM]: JOIN_UP,
  [SHIP_LEFT]: JOIN_RIGHT,
  [SHIP_RIGHT]: JOIN_LEFT,
  [SHIP_SINGLE]: 0,
};

/** The sides segment `(x, y)` of `grid` joins its boat on: a center's along
 * whichever axis has a segment on both sides. */
function shipJoins(at: (i: number) => number, w: number, x: number, y: number): number {
  const ship = at(y * w + x);
  if (ship !== SHIP_CENTER) return SHAPE_JOINS[ship] ?? 0;
  const across =
    x > 0 && x < w - 1 && isShip(at(y * w + x - 1)) && isShip(at(y * w + x + 1));
  return across ? JOIN_LEFT | JOIN_RIGHT : JOIN_UP | JOIN_DOWN;
}

/** Each square of a boat, by index, to the sweep step of its boat's middle. */
function boatSteps(
  at: (i: number) => number,
  w: number,
  h: number,
): Map<number, number> {
  const out = new Map<number, number>();
  for (let start = 0; start < w * h; start++) {
    if (!isShip(at(start)) || out.has(start)) continue;
    const boat: number[] = [];
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length > 0) {
      const i = queue.pop() as number;
      boat.push(i);
      const joins = shipJoins(at, w, i % w, (i - (i % w)) / w);
      const next = [
        joins & JOIN_LEFT ? i - 1 : -1,
        joins & JOIN_RIGHT ? i + 1 : -1,
        joins & JOIN_UP ? i - w : -1,
        joins & JOIN_DOWN ? i + w : -1,
      ];
      for (const j of next)
        if (j >= 0 && j < w * h && isShip(at(j)) && !seen.has(j)) {
          seen.add(j);
          queue.push(j);
        }
    }
    const mx = boat.reduce((s, i) => s + (i % w), 0) / boat.length;
    const my = boat.reduce((s, i) => s + Math.floor(i / w), 0) / boat.length;
    for (const i of boat) out.set(i, sweepStep(mx, my));
  }
  return out;
}

/**
 * One boat segment, upstream `boats_draw_ship`: the engine's spanning piece
 * (`drawPiecePart`) with round ends, so a boat is one hull whose bow and stern
 * are its rounded ends, and a boat of one is a disc. No divider: a boat is
 * one hull, and its squares are counted by the grid lines beside it. A
 * segment not yet known to be an end or a middle is a small square.
 */
function drawSegment(
  dr: GameDrawing,
  tx: number,
  ty: number,
  ts: number,
  ship: number,
  color: number,
  joins: number = SHAPE_JOINS[ship] ?? 0,
  reach?: Rect,
): void {
  if (ship === SHIP_VAGUE) {
    const r = (ts / 2 - ts / 10) * 0.7;
    const cx = tx + ts / 2;
    const cy = ty + ts / 2;
    dr.drawRect({ x: cx - r, y: cy - r, w: 2 * r, h: 2 * r }, color);
    return;
  }
  drawPiecePart(dr, { x: tx, y: ty, w: ts, h: ts }, joins, color, {
    ends: "round",
    divider: null,
    reach,
  });
}

/** Upstream `boats_draw_collision` (itself copied from `tents.c`): a warning
 * diamond with an exclamation mark, centered on the corner where two boats
 * touch. */
function drawCollision(dr: GameDrawing, ts: number, x: number, y: number): void {
  const ext = (ts * 2) / 5;
  dr.drawPolygon(
    [
      { x: x - ext, y },
      { x, y: y - ext },
      { x: x + ext, y },
      { x, y: y + ext },
    ],
    COL_ERROR,
    COL_INK,
  );

  const xext = (ts / 16) | 0;
  const yext = ((ts * 2) / 5 - (xext * 2 + 2)) | 0;
  dr.drawRect(
    { x: x - xext, y: y - yext, w: xext * 2 + 1, h: yext * 2 + 1 - xext * 3 },
    COL_COLLISION_TEXT,
  );
  dr.drawRect(
    { x: x - xext, y: y + yext - xext * 2 + 1, w: xext * 2 + 1, h: xext * 2 },
    COL_COLLISION_TEXT,
  );
}

/**
 * Upstream `boats_draw_fleet` in drawing mode: the inventory of boats under the
 * board, one drawn boat per boat to be found, grayed and struck through once
 * that many have been located.
 */
function drawFleet(
  dr: GameDrawing,
  ds: BoatsDrawState,
  p: BoatsParams,
  fleetCount: Int32Array,
): void {
  const ts = ds.tileSize;
  const { h, fleet, fleetData } = p;
  const fxCoord = (fx: number): number => BORDER + (fx - FLEET_X) * ts;
  const fyCoord = (fy: number): number => BORDER + gutter(ts) + (h + 1 + fy) * ts;

  // One slope for every boat size, so the stripes all lean the same way.
  const slope =
    (FLEET_SIZE * ts - STRIPE_SIZE * 2) / (fleet * FLEET_SIZE * ts - STRIPE_SIZE * 2);

  // A size has a slot per boat of it, so whether its count moved is asked
  // once a size, before its slots are walked.
  const moved: boolean[] = [];
  for (let size = 0; size < fleet; size++)
    moved[size] = ds.fleetCount.changed(size, fleetCount[size]);
  for (const { size, copy, fx: startFx, width, row } of fleetLayout(p)) {
    if (!moved[size]) continue;

    const rect = {
      x: fxCoord(startFx),
      y: fyCoord(row),
      w: width * ts,
      h: FLEET_SIZE * ts,
    };
    dr.drawUpdate(rect);
    dr.drawRect(rect, COL_BACKGROUND);

    const found = copy < fleetCount[size];
    const color = found ? COL_SHIP_FLEET_DONE : COL_SHIP;

    let fx = startFx;
    for (let k = 0; k <= size; k++) {
      const ship =
        size === 0
          ? SHIP_SINGLE
          : k === 0
            ? SHIP_LEFT
            : k === size
              ? SHIP_RIGHT
              : SHIP_CENTER;
      const joins = ship === SHIP_CENTER ? JOIN_LEFT | JOIN_RIGHT : SHAPE_JOINS[ship];
      const cell = ts * FLEET_SIZE;
      drawSegment(dr, fxCoord(fx), fyCoord(row), cell, ship, color, joins);
      fx += FLEET_SIZE;
    }

    if (found) {
      // Red rather than ink when more boats of this size are on the board
      // than the fleet holds.
      const stripe =
        fleetData[size] >= fleetCount[size] ? COL_SHIP_FLEET_STRIPE : COL_ERROR;
      const cy = fyCoord(row) + (FLEET_SIZE * ts) / 2;
      const stripeH = slope * ((size + 1) * FLEET_SIZE * ts - STRIPE_SIZE * 2);
      dr.drawLine(
        { x: fxCoord(startFx) + STRIPE_SIZE, y: cy + stripeH / 2 },
        { x: fxCoord(fx) - STRIPE_SIZE, y: cy - stripeH / 2 },
        stripe,
        STRIPE_SIZE,
      );
    }
  }
}

// --- the frame -------------------------------------------------------------

// Hint bits, folded into the per-tile cache key so the overlay both paints and
// clears: a hint bit outside the key never repaints a warm frame
// (docs/rendering.md § "The tile cache and the diff key").
const HINT_SHIP = 1 << 9; // a square the step asks for a boat segment on
const HINT_WATER = 1 << 10; // …or for water
const HINT_EVID = 1 << 11; // a square the deduction reasons over
const HINT_LINE = 1 << 12; // a square of the line the sentence names (hatched)
/** Added to a border number's cached status when its slot is hatched: above
 * every status value, so the two never collide in `ds.border`. */
const BORDER_HATCHED = 0x100;

/** Pack a cell's drawn appearance into the per-tile cache word. */
function tileKey(
  ship: number,
  flags: number,
  tone: WinTone,
  hint: number,
  joins: number,
): number {
  return ship | (flags << 4) | hint | (tone << 13) | (joins << 15);
}

/** The per-cell hint bits for the displayed step. */
function hintBits(
  step: HintStep<BoatsMove, BoatsHint> | null,
  w: number,
  h: number,
): Int32Array | null {
  if (!step) return null;
  const marks = stepMarks(step);
  const on = (c: Point): boolean => c.x >= 0 && c.y >= 0 && c.x < w && c.y < h;
  const bits = new Int32Array(w * h);
  for (const c of marks.of("outline", CELL))
    if (on(c)) bits[c.y * w + c.x] |= HINT_EVID;
  for (const c of marks.of("stripes", CELL))
    if (on(c)) bits[c.y * w + c.x] |= HINT_LINE;
  // A ringed square is drawn in the shape of what the step puts there.
  const ship = new Set(
    (step.highlights?.targets ?? []).filter((t) => t.ship).map((t) => t.y * w + t.x),
  );
  // Targets win over evidence on the same cell — the action outranks its reason.
  for (const t of marks.of("ring", CELL))
    if (on(t)) {
      const i = t.y * w + t.x;
      bits[i] = (bits[i] & ~HINT_EVID) | (ship.has(i) ? HINT_SHIP : HINT_WATER);
    }
  return bits;
}

/** The two tildes Boats draws for a *given* water square — reused in the hint
 * color so a "place water here" suggestion speaks the game's own vocabulary
 * (docs/hints-marks.md § "Echo the move's shape in the hint color"). */
function drawWaves(
  dr: GameDrawing,
  tx: number,
  ty: number,
  ts: number,
  color: number,
): void {
  for (const frac of [0.42, 0.58])
    dr.drawText(
      { x: tx + ts / 2, y: ty + ts * frac },
      glyphFont((ts / 2) | 0),
      color,
      "~",
    );
}

export function redraw(
  dr: GameDrawing,
  ds: BoatsDrawState,
  _prev: BoatsState | null,
  state: BoatsState,
  _dir: number,
  ui: BoatsUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<BoatsMove, BoatsHint>,
  mistakes?: readonly BoatsMistake[],
): void {
  const ts = ds.tileSize;
  const p = state.params;
  const { w, h } = p;

  // The validation family writes its verdicts into caller-supplied arrays and
  // takes a mutable `BoatsBoard`, so give it a scratch copy rather than the
  // immutable state. (No `adjustShips` is needed here: `executeMove` already
  // resolved every segment's shape before the state was published.)
  const board = boardOf(state);
  const borderStatus = new Int32Array(w + h);
  const cellFlags = new Int32Array(w * h);
  const fleetCount = new Int32Array(p.fleet);

  countShips(board, undefined, undefined, borderStatus);
  checkFleet(board, fleetCount, cellFlags);
  validateGridClues(board, cellFlags);
  checkCollision(board, cellFlags);

  ds.wrong.packCells(mistakes ?? null, (x, y) => y * w + x);

  // --- the border numbers: columns along the bottom, then rows down the right ---
  // The hint's hatched line runs on through its number (column slots first,
  // then rows, as `borderClues` counts them), so the slot's hatch is part of
  // its key beside the validation status.
  const line = flash.winning ? [] : stepMarks(hint).of("stripes", CELL);
  const hatchedSlot =
    line.length === 0
      ? -1
      : line.every((c) => c.x === line[0].x)
        ? line[0].x
        : w + line[0].y;
  const half = (ts / 2) | 0;
  for (let i = 0; i < w + h; i++) {
    if (state.borderClues[i] === NO_CLUE) continue;
    const hatched = i === hatchedSlot;
    const key = borderStatus[i] + (hatched ? BORDER_HATCHED : 0);
    if (!ds.border.changed(i, key)) continue;

    const column = i < w;
    const tx = BORDER + (column ? i * ts + half : (w + 1) * ts);
    const ty = BORDER + (column ? (h + 1) * ts : (i - w) * ts + half);
    const cell = { x: tx - half, y: ty - half, w: ts, h: ts };
    dr.drawRect(cell, COL_BACKGROUND);
    if (hatched) dr.drawHatch(cell, hatchPeriod(ts));
    dr.drawUpdate(cell);
    dr.drawText(
      { x: tx, y: ty },
      {
        align: column ? "center" : "right",
        baseline: column ? "alphabetic" : "mathematical",
        fontType: "variable",
        size: half,
      },
      borderStatus[i] === STATUS_INVALID ? COL_ERROR : COL_COUNT,
      String(state.borderClues[i]),
    );
  }

  // A collision diamond straddles the corner of four cells, so a change to one
  // must repaint the other three (the flagged cell repaints on its own flags).
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const drawn = ds.tiles.shown(y * w + x);
      // A never-drawn cell (−1) has nothing to erase, so it is not a change.
      const wasCollision = drawn < 0 ? 0 : (drawn >> 4) & FE_COLLISION;
      if (wasCollision !== (cellFlags[y * w + x] & FE_COLLISION)) {
        if (y + 1 < h) ds.tiles.forget((y + 1) * w + x);
        if (x + 1 < w) ds.tiles.forget(y * w + (x + 1));
        if (x + 1 < w && y + 1 < h) ds.tiles.forget((y + 1) * w + (x + 1));
      }
    }
  }

  const drag = dragBounds(ui);
  const hints = flash.winning ? null : hintBits(hint ?? null, w, h);

  /** What square `i` shows: its given or its played content, or what an
   * in-progress drag would make it, previewed without committing a move. */
  const shown = (i: number): number => {
    const ship = state.gridClues[i] !== EMPTY ? state.gridClues[i] : board.grid[i];
    const x = i % w;
    const y = (i - x) / w;
    if (
      drag &&
      x >= drag.xmin &&
      x <= drag.xmax &&
      y >= drag.ymin &&
      y <= drag.ymax &&
      state.gridClues[i] === EMPTY &&
      (ui.dragFrom === "*" ||
        (ui.dragFrom === "-" && ship === EMPTY) ||
        (ui.dragFrom === "W" && ship === WATER) ||
        (ui.dragFrom === "B" && isShip(ship)))
    )
      return ui.dragTo === "B" ? SHIP_VAGUE : ui.dragTo === "W" ? WATER : EMPTY;
    return ship;
  };

  // The win flash lights a boat whole, as Dominosa a domino: each of its
  // squares asks about the boat's middle, the mean of its squares.
  const boatStep = flash.winning ? boatSteps(shown, w, h) : null;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      const tx = BORDER + x * ts;
      const ty = BORDER + y * ts;

      if (!flash.winning && ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y)
        cellFlags[i] |= FD_CURSOR;
      else cellFlags[i] &= ~FD_CURSOR;

      const ship = shown(i);
      const joins = isShip(ship) ? shipJoins(shown, w, x, y) : 0;

      const hintBit = hints ? hints[i] : 0;
      const tone = flash.win(boatStep?.get(i) ?? sweepStep(x, y));
      const key = tileKey(ship, cellFlags[i], tone, hintBit, joins);
      if (!ds.tiles.changed(i, key)) continue;

      dr.drawUpdate({ x: tx, y: ty, w: ts + 1, h: ts + 1 });
      // A segment the puzzle gave is told by the lifted cell under it; given
      // water keeps its blue and is told by its waves. A lit boat is its hull
      // in the flash's color, on its own surface.
      const lit = tone ? winSlot(tone) : null;
      const surface =
        lit !== null && !isShip(ship)
          ? lit
          : ship === EMPTY
            ? COL_CELL
            : isShip(state.gridClues[i])
              ? COL_GIVEN
              : COL_WATER;
      dr.drawRect({ x: tx, y: ty, w: ts, h: ts }, surface);
      if (hintBit & HINT_LINE)
        dr.drawHatch({ x: tx, y: ty, w: ts, h: ts }, hatchPeriod(ts));
      // A square's own lines are its top and left, and the last row's and
      // column's the board's edge: a hull covers the line between two of its
      // squares, and a line both squares drew would show or not by which
      // repainted last.
      dr.drawRect({ x: tx, y: ty, w: ts + 1, h: 1 }, COL_GRID);
      dr.drawRect({ x: tx, y: ty, w: 1, h: ts + 1 }, COL_GRID);
      if (x === w - 1) dr.drawRect({ x: tx + ts, y: ty, w: 1, h: ts + 1 }, COL_GRID);
      if (y === h - 1) dr.drawRect({ x: tx, y: ty + ts, w: ts + 1, h: 1 }, COL_GRID);

      if (isShip(ship)) {
        const color =
          lit ?? (cellFlags[i] & FE_MISMATCH || ds.wrong.at(i) ? COL_ERROR : COL_SHIP);
        // Clipped to the square, as a polygon's edge spills half a pixel.
        const square = { x: tx, y: ty, w: ts, h: ts };
        dr.clip(square);
        drawSegment(dr, tx, ty, ts + 1, ship, color, joins, square);
        dr.unclip();
      } else if (state.gridClues[i] === WATER) {
        // A *given* water square is marked with waves; player water is the
        // plain blue fill.
        drawWaves(dr, tx, ty, ts, COL_INK);
      }

      const fleetText = isShip(ship) && cellFlags[i] & FE_FLEET;
      const fleetAt = fleetMarkText(tx, ty, ts);

      // The hint rings *where*, and shows *which action* inside the ring in
      // the game's own vocabulary, and never performs the move
      // (docs/hints-marks.md § "Highlight, never perform"): an unresolved
      // segment for a boat, the given-water waves for water.
      if (hintBit & (HINT_SHIP | HINT_WATER))
        dr.drawRing(
          { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 },
          fleetText
            ? { enclose: [textBox(fleetAt.origin, fleetAt.options, "?")], avoid: [] }
            : NOTHING_TO_CLEAR,
          Math.max(2, ts >> 4),
          {
            inside: (ink) =>
              hintBit & HINT_SHIP
                ? drawSegment(dr, tx, ty, ts + 1, SHIP_VAGUE, ink)
                : drawWaves(dr, tx, ty, ts, ink),
          },
        );

      // Every evidence square keeps its own color and gets a ring at the cell's
      // edge — undecided or not, one mark for one role. A fill over water or a
      // segment would paint over the very thing that makes the square evidence,
      // and a fill pale enough not to is too faint to read as a mark at all
      // (`hint-mark.ts`), so neither kind of square gets one. The ring sits
      // outside a segment's radius: one that crossed a round end cap read as a
      // square drawn over it.
      if (hintBit & HINT_EVID) {
        const inset = 1;
        drawMarkSides(
          dr,
          {
            box: {
              x: tx + inset,
              y: ty + inset,
              w: ts - inset * 2 + 1,
              h: ts - inset * 2 + 1,
            },
            outer: 0,
            inner: Math.max(2, ts >> 4),
          },
          MARK_ALL,
          COL_HINT_OUTLINE,
        );
      }

      if (fleetText) dr.drawText(fleetAt.origin, fleetAt.options, COL_ERROR, "?");

      // Check & Save: a square the unique solution contradicts. A wrong *ship*
      // is already red above; this outline is what makes a wrong *water* square
      // visible too.
      if (ds.wrong.at(i)) {
        const inset = (ts / 12) | 0;
        drawRectOutline(
          dr,
          tx + inset,
          ty + inset,
          ts - inset * 2 + 1,
          ts - inset * 2 + 1,
          COL_ERROR,
        );
      }

      if (cellFlags[i] & FD_CURSOR) {
        // At the cell's edge, outside a segment's radius, so the ring reads
        // beside the piece on an empty, a water and a boat square alike.
        drawThickRectOutline(
          dr,
          tx + 1,
          ty + 1,
          ts - 1,
          ts - 1,
          Math.max(2, ts >> 4),
          COL_CURSOR,
        );
      }
    }
  }

  for (let x = 0; x < w - 1; x++)
    for (let y = 0; y < h - 1; y++)
      if (cellFlags[y * w + x] & FE_COLLISION)
        drawCollision(dr, ts, BORDER + (x + 1) * ts, BORDER + (y + 1) * ts);

  drawFleet(dr, ds, p, fleetCount);
}

/** The rectangle the current drag covers, or null when no drag is in progress. */
function dragBounds(
  ui: BoatsUi,
): { xmin: number; xmax: number; ymin: number; ymax: number } | null {
  // `drag.live` as well as `dragOk`: the engine ends a live drag when the board
  // changes under it, and the preview must go with it — `dragOk` only says the
  // pointer is over a valid cell.
  if (!ui.drag.live || !ui.dragOk) return null;
  const { sx, sy, ex, ey } = ui.drag;
  return {
    xmin: Math.min(sx, ex),
    xmax: Math.max(sx, ex),
    ymin: Math.min(sy, ey),
    ymax: Math.max(sy, ey),
  };
}
