/**
 * Pegs' renderer: the beveled board, the pegs, the cursor ring, the held-peg
 * ring, and the blitter-backed drag.
 *
 * The board's pixel origin lives here and `interpretMove` imports its
 * `fromCoordWithTileSize` — one function, both callers
 * (`docs/games/mechanics.md`). The grid vocabulary comes the other way, from
 * `state.ts`: this module imports no value from `index.ts`, so the two cannot
 * form a runtime cycle (`module-layering.test.ts`).
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { BLUE, PURPLE } from "../../engine/color/colors.ts";
import { HELD, HINT_ACTION, HINT_EVIDENCE } from "../../engine/color/palette.ts";
import { drawRaisedBevel, raisedBevelWidth } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { coord as coordE, fromCoord as fromCoordE } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
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

const COL_BACKGROUND = 0;
const COL_HIGHLIGHT = 1;
const COL_LOWLIGHT = 2;
const COL_PEG = 3;
const COL_CURSOR = 4;
/** Appended past the C enum: the ring round a peg the keyboard has picked up
 * to jump with, which upstream drew in the cursor color. */
const COL_HELD = 5;
const COL_HINT = 6;
const COL_HINT_EVIDENCE = 7;

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
  const {
    background: bg,
    highlight: hi,
    lowlight: lo,
  } = mkhighlight(defaultBackground);

  // The cursor paints the whole cursor cell — the peg under it, or the hole
  // under it, which upstream showed as a raised bevel instead.
  return [
    bg, // COL_BACKGROUND
    hi, // COL_HIGHLIGHT
    lo, // COL_LOWLIGHT
    BLUE, // COL_PEG — the piece's own color, as upstream paints it
    PURPLE, // COL_CURSOR — not CURSOR: green is the held ring; purple as Spokes
    HELD, // COL_HELD — a peg picked up to jump with
    HINT_ACTION, // COL_HINT
    HINT_EVIDENCE, // COL_HINT_EVIDENCE
  ];
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

/** An arrow from the edge of the peg at `a` to the edge of the hole at `b`,
 * in the evidence color, laid over the peg it jumps. */
function drawArrow(dr: GameDrawing, ts: number, a: Point, b: Point): void {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const at = (p: Point, d: number): Point => ({
    x: Math.round(p.x + ux * d),
    y: Math.round(p.y + uy * d),
  });
  const tip = at(b, -Math.floor(ts / 4));
  const head = Math.max(4, Math.floor(ts / 4));
  const base = at(tip, -head);
  dr.drawLine(
    at(a, Math.floor(ts / 3)),
    base,
    COL_HINT_EVIDENCE,
    Math.max(2, Math.floor(ts / 12)),
  );
  const side = (k: number): Point => ({
    x: Math.round(base.x - uy * k),
    y: Math.round(base.y + ux * k),
  });
  const half = Math.floor(head / 2);
  dr.drawPolygon([tip, side(half), side(-half)], COL_HINT_EVIDENCE, COL_HINT_EVIDENCE);
}

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

  // A hint jump spans three squares, so each square paints only its own piece
  // of it, and the piece leaves with the square's own repaint.
  dr.clip({ x, y, w: ts, h: ts });
  if (bgColor >= 0) {
    dr.drawRect({ x, y, w: ts, h: ts }, bgColor);
  }
  if (jumps.striped) dr.drawHatch({ x, y, w: ts, h: ts }, COL_HINT, hatchPeriod(ts));

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
    const bg = cursor ? COL_CURSOR : COL_LOWLIGHT;
    dr.drawCircle({ x: x + half, y: y + half }, Math.floor(ts / 4), bg, bg);
  } else if (v === GRID_PEG) {
    // Under the cursor the whole peg takes the cursor color; picked up to
    // jump, it keeps its own color inside a held ring.
    const outerBg = cursor ? COL_CURSOR : jumping ? COL_HELD : COL_PEG;
    const innerBg = cursor ? COL_CURSOR : COL_PEG;
    dr.drawCircle({ x: x + half, y: y + half }, Math.floor(ts / 3), outerBg, outerBg);
    dr.drawCircle({ x: x + half, y: y + half }, Math.floor(ts / 4), innerBg, innerBg);
  }

  // The hint's rings sit in the margin outside the peg, so they read on the
  // peg's own blue; an outline inside a ring when one cell carries both.
  const ring = (r: number, color: number) => {
    dr.drawCircle({ x: x + half, y: y + half }, r, -1, color);
    dr.drawCircle({ x: x + half, y: y + half }, r - 1, -1, color);
  };
  const outer = half - 1;
  if (ringed) ring(outer, COL_HINT);
  if (outlined) ring(ringed ? outer - 2 : outer, COL_HINT_EVIDENCE);
  for (const [a, b] of jumps.arrows) drawArrow(dr, ts, a, b);

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
): void {
  const { w, h } = s;
  const ts = ds.tileSize;
  const marks = stepMarks(hint);
  const ringed = new Set([...marks.of("ring", PEG), ...marks.of("ring", HOLE)]);
  const outlined = new Set(marks.of("outline", PEG));
  const hw = raisedBevelWidth(ts);
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

  let bgColor: number;
  if (flashTime > 0) {
    const frame = Math.floor(flashTime / FLASH_FRAME);
    bgColor = frame % 2 ? COL_LOWLIGHT : COL_HIGHLIGHT;
  } else {
    bgColor = COL_BACKGROUND;
  }

  // Erase the sprite currently being dragged, if any.
  if (ds.dragging) {
    if (ds.dragBackground) {
      dr.blitterLoad(ds.dragBackground, { x: ds.dragX, y: ds.dragY });
      dr.drawUpdate({ x: ds.dragX, y: ds.dragY, w: ts, h: ts });
    }
    ds.dragging = false;
  }

  if (!ds.started) {
    // First draw: the relief round the playable cells, in upstream's four
    // passes. Each pass covers every cell before the next begins, because a
    // cell's relief overlaps its neighbors'.

    // Pass 1: diagonal corner triangles.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (s.grid[y * w + x] !== GRID_OBST) {
          const cx = coord(x, ts);
          const cy = coord(y, ts);
          // The relief extends `hw` *outside* the cell, unlike the other
          // raised-bevel games, because Pegs bevels the gaps between playable
          // cells rather than the cells themselves.
          drawRaisedBevel(
            dr,
            {
              left: cx - hw,
              top: cy - hw,
              right: cx + ts + hw - 1,
              bottom: cy + ts + hw - 1,
            },
            COL_HIGHLIGHT,
            COL_LOWLIGHT,
          );
        }
      }
    }

    // Pass 2: overlapping rectangles to fill the edges.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (s.grid[y * w + x] !== GRID_OBST) {
          const cx = coord(x, ts);
          const cy = coord(y, ts);
          dr.drawRect(
            { x: cx - hw, y: cy - hw, w: ts + hw, h: ts + hw },
            COL_HIGHLIGHT,
          );
          dr.drawRect({ x: cx, y: cy, w: ts + hw, h: ts + hw }, COL_LOWLIGHT);
        }
      }
    }

    // Pass 3: trapezoids on each edge.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (s.grid[y * w + x] !== GRID_OBST) {
          const cx = coord(x, ts);
          const cy = coord(y, ts);
          for (let ddx = 0; ddx < 2; ddx++) {
            const ddy = 1 - ddx;
            for (let si = 0; si < 2; si++) {
              const sn = 2 * si - 1;
              const c = si ? COL_LOWLIGHT : COL_HIGHLIGHT;
              const coords: Point[] = [
                { x: cx + si * ddx * (ts - 1), y: cy + si * ddy * (ts - 1) },
                {
                  x: cx + (si * ddx + ddy) * (ts - 1),
                  y: cy + (si * ddy + ddx) * (ts - 1),
                },
                {
                  x: cx + (si * ddx + ddy) * (ts - 1) - hw * (ddy - sn * ddx),
                  y: cy + (si * ddy + ddx) * (ts - 1) - hw * (ddx - sn * ddy),
                },
                {
                  x: cx + si * ddx * (ts - 1) + hw * (ddy + sn * ddx),
                  y: cy + si * ddy * (ts - 1) + hw * (ddx + sn * ddy),
                },
              ];
              dr.drawPolygon(coords, c, c);
            }
          }
        }
      }
    }

    // Pass 4: fill playable cells with background color.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (s.grid[y * w + x] !== GRID_OBST) {
          dr.drawRect(
            { x: coord(x, ts), y: coord(y, ts), w: ts, h: ts },
            COL_BACKGROUND,
          );
        }
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
