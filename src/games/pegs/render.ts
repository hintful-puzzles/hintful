/**
 * Pegs' renderer: pieces on a quiet surface (`engine/piece.ts`). The board is
 * a field of flat cells with the grid's thin line between them, a peg is a
 * disc on its cell and a hole is a small ring. The cursor is corner brackets,
 * a peg picked up from the keyboard wears a ring, and a dragged peg rides a
 * blitter.
 *
 * The board's pixel origin lives here and `interpretMove` imports its
 * `fromCoordWithTileSize` — one function, both callers
 * (`docs/games/mechanics.md`). The grid vocabulary comes the other way, from
 * `state.ts`: this module imports no value from `index.ts`, so the two cannot
 * form a runtime cycle (`module-layering.test.ts`).
 */

import { TWO } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  GRID_DARK,
  givenSurface,
  HELD,
  HINT_ACTION,
  HINT_EVIDENCE,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawMoveArrow, drawRectCorners, drawRectOutline } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { coord as coordE, fromCoord as fromCoordE } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import type { MarkedDeadEnd } from "../../engine/hint-refusal.ts";
import { MOVE, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, TWO_SHAPES } from "../../engine/piece.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { HOLE, JUMP, type Marked, PEG } from "./hint-text.ts";
import {
  GRID_HOLE,
  GRID_OBST,
  GRID_PEG,
  type PegsMove,
  type PegsParams,
  type PegsState,
  type PegsUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 33;

/** Added to a cell's value in the tile cache: the keyboard cursor is on the
 * cell, or is on it holding the peg picked up to jump. */
const GRID_CURSOR = 10;
const GRID_JUMPING = 20;
/** Added for a displayed hint step's marks: the cell is ringed (the jump to
 * make), or outlined (a peg a rival jump would cut off). */
const GRID_HINT_RING = 40;
const GRID_HINT_OUTLINE = 80;

// --- color indices --------------------------------------------------

const COL_BACKGROUND = 0; // the board around the cells
const COL_GRID = 1; // the line between two cells, and round the board
const COL_CELL = 2; // the surface of a cell
/** The surface of every cell on the lit beats of the completion flash. */
const COL_LIT = 3;
const COL_HOLE = 4; // the ring that marks an empty hole
const COL_PEG = 5;
const COL_CURSOR = 6;
/** The ring round a peg the keyboard has picked up to jump with. */
const COL_HELD = 7;
export const COL_HINT = 8;
export const COL_HINT_EVIDENCE = 9;

/** A peg is the pair's disc: the one piece on the board, in a color no mark
 * drawn round it has spent. */
const PAIR_DISC = 1;

// --- flash timing ----------------------------------------------------

export const FLASH_FRAME = 0.13;

export interface PegsDrawState {
  tileSize: number;
  dragBackground: unknown; // blitter handle
  dragging: boolean;
  dragX: number;
  dragY: number;
  /** Per-tile cache of what each square last showed: its value with the
   * cursor and hint flags, then the hint jumps drawn across it. */
  tiles: string[];
  started: boolean;
  bgColor: number;
}
// --- coordinate helpers ----------------------------------------------

function border(ts: number): number {
  return Math.floor(ts / 2);
}

function coord(x: number, ts: number): number {
  return coordE(x, ts, border(ts));
}

export function fromCoordWithTileSize(x: number, ts: number): number {
  return fromCoordE(x, ts, border(ts));
}

/** The pixel at the middle of column (or row) `x`. */
export function tileCenter(x: number, ts: number): number {
  return coord(x, ts) + Math.floor(ts / 2);
}

// --- colors ---------------------------------------------------------

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_LIT] = givenSurface(defaultBackground);
  // Strong enough to be a mark on the cell and not a step of its gray.
  out[COL_HOLE] = GRID_DARK;
  out[COL_PEG] = TWO[PAIR_DISC];
  // The cursor's brackets and the held ring are one green and never on the
  // board together: picking a peg up turns the one into the other.
  out[COL_CURSOR] = CURSOR;
  out[COL_HELD] = HELD;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_EVIDENCE] = HINT_EVIDENCE;
  return out;
}

// --- computeSize -----------------------------------------------------

export function computeSize(p: PegsParams, ts: number): Size {
  const b = border(ts);
  return {
    w: ts * p.w + 2 * b,
    h: ts * p.h + 2 * b,
  };
}

// --- draw state ------------------------------------------------------

export function newDrawState(s: PegsState, tileSize: number): PegsDrawState {
  return {
    tileSize,
    dragBackground: null,
    dragging: false,
    dragX: 0,
    dragY: 0,
    tiles: new Array<string>(s.w * s.h).fill(""),
    started: false,
    bgColor: -1,
  };
}

// --- draw_tile -------------------------------------------------------

/** The hint jumps a square shows a piece of: arrows for jumps that can still
 * finish, and the stripes of a jump that loses. Each is a line of three
 * squares, so all three carry it and each paints its own piece. */
interface TileJumps {
  readonly striped: boolean;
  /** Each arrow as the pixel centers of the peg that jumps and the hole it
   * lands in. */
  readonly arrows: readonly (readonly [Point, Point])[];
}

const NO_JUMPS: TileJumps = { striped: false, arrows: [] };

function drawTile(
  dr: GameDrawing,
  ds: PegsDrawState,
  x: number,
  y: number,
  v: number,
  bgColor: number,
  jumps: TileJumps = NO_JUMPS,
): void {
  const ts = ds.tileSize;
  let jumping = false;
  let cursor = false;

  // The cell's surface, inside the grid line along its top and left. Its
  // width is even at an odd tile size, so the disc on it has a whole-pixel
  // center.
  const face: Rect = { x: x + 1, y: y + 1, w: ts - 1, h: ts - 1 };

  // A hint jump spans three squares, so each square paints only its own piece
  // of it, and the piece leaves with the square's own repaint.
  dr.clip({ x, y, w: ts, h: ts });
  if (bgColor >= 0) {
    dr.drawRect({ x, y, w: ts, h: ts }, COL_GRID);
    dr.drawRect(face, bgColor);
  }
  if (jumps.striped) dr.drawHatch(face, COL_HINT, hatchPeriod(ts));

  let outlined = false;
  let ringed = false;
  if (v >= GRID_HINT_OUTLINE) {
    outlined = true;
    v -= GRID_HINT_OUTLINE;
  }
  if (v >= GRID_HINT_RING) {
    ringed = true;
    v -= GRID_HINT_RING;
  }
  if (v >= GRID_JUMPING) {
    jumping = true;
    v -= GRID_JUMPING;
  }
  if (v >= GRID_CURSOR) {
    cursor = true;
    v -= GRID_CURSOR;
  }

  // Whole pixels: upstream's TILESIZE/2 &c. are integer divisions, and the
  // drawing API is defined on integer coordinates. At an odd tile size a bare
  // `/` leaves a half-pixel that anti-aliases the pegs and, worse, shifts the
  // drag sprite's flush TILESIZE blitter off the tile it has to erase.
  const half = Math.floor(ts / 2);
  if (v === GRID_HOLE) {
    // A hole is a ring, and the cell inside it is the cell.
    const r = Math.floor(ts / 6);
    for (const d of [0, 1])
      dr.drawCircle({ x: x + half, y: y + half }, r - d, -1, COL_HOLE);
  } else if (v === GRID_PEG) {
    // Picked up to jump, the peg keeps its own color inside a held ring.
    if (jumping) {
      drawPiece(dr, face, TWO_SHAPES[PAIR_DISC], COL_HELD);
      drawPiece(dr, face, TWO_SHAPES[PAIR_DISC], COL_PEG, 0.72);
    } else drawPiece(dr, face, TWO_SHAPES[PAIR_DISC], COL_PEG);
  }
  // Out at the corners of the cell, clear of the peg.
  if (cursor)
    drawRectCorners(dr, x + half, y + half, half - 2, COL_CURSOR, Math.max(2, ts >> 4));

  // The hint's rings sit in the margin outside the peg, beside it; an
  // outline inside a ring when one cell carries both.
  const ring = (r: number, color: number) => {
    dr.drawCircle({ x: x + half, y: y + half }, r, -1, color);
    dr.drawCircle({ x: x + half, y: y + half }, r - 1, -1, color);
  };
  const outer = half - 1;
  if (ringed) ring(outer, COL_HINT);
  if (outlined) ring(ringed ? outer - 2 : outer, COL_HINT_EVIDENCE);
  // Laid over the peg each jumps.
  for (const [a, b] of jumps.arrows) drawMoveArrow(dr, ts, a, b, COL_HINT_EVIDENCE);

  dr.unclip();
  dr.drawUpdate({ x, y, w: ts, h: ts });
}

// --- redraw ----------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: PegsDrawState,
  _prev: PegsState | null,
  s: PegsState,
  _dir: number,
  ui: PegsUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<PegsMove>,
  _mistakes?: readonly unknown[],
  deadEnd?: MarkedDeadEnd,
): void {
  const { w, h } = s;
  const ts = ds.tileSize;
  const marks = stepMarks(hint ?? deadEnd);
  // A ring on the step's whole move, named by words that do not spell it out,
  // rings its peg and its hole as the two separate rings do.
  const move = hint?.move;
  const ringed = new Set([
    ...marks.of("ring", PEG),
    ...marks.of("ring", HOLE),
    ...(marks.of("ring", MOVE).length > 0 && move?.type === "jump"
      ? [move.sy * w + move.sx, move.ty * w + move.tx]
      : []),
  ]);
  const outlined = new Set(marks.of("outline", PEG));
  const center = (i: number): Point => ({
    x: tileCenter(i % w, ts),
    y: tileCenter(Math.floor(i / w), ts),
  });
  // A jump's three squares: from, the peg it takes (their midpoint, in grid
  // indices as in coordinates), and to.
  const across = (j: Marked) => [j.from, (j.from + j.to) / 2, j.to];
  const striped = new Set([
    ...marks.of("stripes", JUMP).flatMap(across),
    ...marks.of("stripes", PEG),
  ]);
  const arrowsAt = new Map<number, Marked[]>();
  for (const j of marks.of("outline", JUMP))
    for (const i of across(j)) arrowsAt.set(i, [...(arrowsAt.get(i) ?? []), j]);

  // The completion flash lifts every cell on its lit beats, a step that reads
  // in both schemes.
  const lit = flashTime > 0 && Math.floor(flashTime / FLASH_FRAME) % 2 === 0;
  const bgColor = lit ? COL_LIT : COL_CELL;

  // Erase the sprite currently being dragged, if any.
  if (ds.dragging) {
    if (ds.dragBackground) {
      dr.blitterLoad(ds.dragBackground, { x: ds.dragX, y: ds.dragY });
      dr.drawUpdate({ x: ds.dragX, y: ds.dragY, w: ts, h: ts });
    }
    ds.dragging = false;
  }

  if (!ds.started) {
    // First draw: the grid line round every playable cell. A cell paints the
    // line along its own top and left, so this is what closes the right and
    // the bottom of the board, whatever its shape.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (s.grid[y * w + x] !== GRID_OBST)
          drawRectOutline(dr, coord(x, ts), coord(y, ts), ts + 1, ts + 1, COL_GRID);
      }
    }
    ds.started = true;
  }

  // Incremental redraw: only changed cells.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = s.grid[y * w + x];
      // Blank the drag source so the peg looks picked up.
      if (ui.dragging && ui.sx === x && ui.sy === y && v === GRID_PEG) {
        v = GRID_HOLE;
      }
      if (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y) {
        v += ui.curJumping ? GRID_JUMPING : GRID_CURSOR;
      }
      if (ringed.has(y * w + x)) v += GRID_HINT_RING;
      if (outlined.has(y * w + x)) v += GRID_HINT_OUTLINE;
      if (v === GRID_OBST) continue;
      const i = y * w + x;
      const arrows = arrowsAt.get(i) ?? [];
      const key = `${v}${striped.has(i) ? "s" : ""}:${arrows.map(JUMP.key).join(",")}`;
      if (bgColor !== ds.bgColor || key !== ds.tiles[i]) {
        drawTile(dr, ds, coord(x, ts), coord(y, ts), v, bgColor, {
          striped: striped.has(i),
          arrows: arrows.map((j) => [center(j.from), center(j.to)] as const),
        });
        ds.tiles[i] = key;
      }
    }
  }

  // Draw the dragging sprite.
  if (ui.dragging) {
    // Allocate the blitter lazily (only `redraw` has the `GameDrawing`).
    if (!ds.dragBackground) {
      ds.dragBackground = dr.blitterNew({ w: ts, h: ts });
    }
    ds.dragging = true;
    ds.dragX = ui.dx - Math.floor(ts / 2);
    ds.dragY = ui.dy - Math.floor(ts / 2);
    dr.blitterSave(ds.dragBackground, { x: ds.dragX, y: ds.dragY });
    drawTile(dr, ds, ds.dragX, ds.dragY, GRID_PEG, -1);
  }

  ds.bgColor = bgColor;
}
