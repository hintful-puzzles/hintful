import { BLACK, FREE, WHITE } from "../../engine/color/colors.ts";
import {
  cellSurface,
  givenSurface,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import type { MarkedDeadEnd } from "../../engine/contract/hint-refusal.ts";
import { CELL, stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Size } from "../../engine/contract/types.ts";
import { drawRectOutline } from "../../engine/render/draw.ts";
import {
  type HintMarkStyle,
  HintMarks,
  type MarkBand,
  type MarkCell,
} from "../../engine/render/hint-mark.ts";
import { OverlaySidecar } from "../../engine/render/overlay-sidecar.ts";
import { NOTHING_TO_CLEAR } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import { type Flash, sweepStep, winSlot } from "../../engine/render/win-wave.ts";
import {
  isCleared,
  isStuck,
  type SamegameMove,
  type SamegameState,
  type SamegameUi,
} from "./state.ts";

// --- tile-size metrics ------------------------------------------------

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_FRAME = 0.13;

/** `TILE_GAP` for a given full tile size (`game_set_size`). */
const gap = (ts: number) => Math.floor((ts + 8) / 16);
/** `BORDER` = half a full tile (the non-NARROW_BORDERS path). */
const border = (ts: number) => Math.floor(ts / 2);
/** `COORD(n)` — top-left pixel of cell `n` along one axis. */
const coord = (n: number, ts: number) => n * ts + border(ts);

// --- tile flags (packed into the per-cell render cache) ---------------

const TILE_COLMASK = 0x00ff;
const TILE_SELECTED = 0x0100;
const TILE_JOINRIGHT = 0x0200;
const TILE_JOINDOWN = 0x0400;
const TILE_JOINDIAG = 0x0800;
const TILE_HASSEL = 0x1000;
const TILE_IMPOSSIBLE = 0x2000;
/** The win flash's tone on the cell, two bits. */
const TILE_TONE_SHIFT = 14;

// --- color palette indices -------------------------------------------

/** The middle of every tile on a stuck board, and the cursor on an emptied
 * cell. */
export const COL_INK = FIRST_GAME_SLOT;
/** The body of a selected tile, whose color shrinks to its middle. */
export const COL_SEL = FIRST_GAME_SLOT + 1;
/** The field: an emptied cell, and the gap between two tiles. */
export const COL_CELL = FIRST_GAME_SLOT + 2;
/** The field on the lit beats of a stuck board's flash. */
export const COL_LIFTED = FIRST_GAME_SLOT + 3;
/** The frame round the field. */
export const COL_GRID = FIRST_GAME_SLOT + 4;
/** The cursor on a tile. */
const COL_ON_TILE = FIRST_GAME_SLOT + 5;
/** The nine piece colors: a square holding color `c` (1 to 9) paints
 * `COL_PIECE + c - 1`. */
export const COL_PIECE = FIRST_GAME_SLOT + 6;

export function colors(bg: Color): Color[] {
  const out = rolePalette(bg);
  out[COL_INK] = INK;
  // `WHITE` and `BLACK`, not `PAPER` and `INK`: both are read against a
  // tile, which is one color in both schemes, and a selected tile that
  // inverted would sink into the dark scheme's field.
  out[COL_SEL] = WHITE;
  out[COL_ON_TILE] = BLACK;
  out[COL_CELL] = cellSurface(bg);
  out[COL_LIFTED] = givenSurface(bg);
  out[COL_GRID] = surfaceGrid(bg);
  for (let i = 0; i < 9; i++) out[COL_PIECE + i] = FREE[i];
  return out;
}

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  return {
    w: ts * p.w + 2 * border(ts) - gap(ts),
    h: ts * p.h + 2 * border(ts) - gap(ts),
  };
}

// --- draw state -------------------------------------------------------

export interface SamegameDrawState {
  /** Full tile size (`TILE_SIZE`). */
  tileSize: number;
  tileinner: number;
  tilegap: number;
  /** The color the margin was last drawn in, which the stuck board's flash
   * changes. */
  margin: number;
  /** What each square shows, as its packed tile value, and the hint's marks
   * on it. */
  tiles: TileCache;
  /** The hint step's marks by square. */
  hint: OverlaySidecar;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: SamegameState,
  tileSize: number,
): SamegameDrawState {
  const hint = new OverlaySidecar(state.w * state.h);
  return {
    tileSize,
    tileinner: tileSize - gap(tileSize),
    tilegap: gap(tileSize),
    margin: -1,
    tiles: new TileCache(state.w * state.h, { overlays: [hint] }),
    hint,
    marks: new HintMarks(),
  };
}

/** Where a hint mark sits around square `(x, y)`: in the gap round the tile
 * and a little way into it. */
function markBand(ds: SamegameDrawState, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  return {
    box: { x: coord(x, ts), y: coord(y, ts), w: ds.tileinner, h: ds.tileinner },
    outer: ds.tilegap,
    inner: Math.max(2, ts >> 4),
  };
}

// --- tile drawing -----------------------------------------------------

/**
 * Draw one tile and the gaps to its right and below (upstream
 * `tile_redraw`). If we share a color with our right / down / diagonal
 * neighbor the corresponding gap is filled, so a connected region paints
 * as a single seamless block.
 */
function tileRedraw(
  dr: GameDrawing,
  ds: SamegameDrawState,
  i: number,
  x: number,
  y: number,
  dright: boolean,
  dbelow: boolean,
  tile: number,
  bgcolor: number,
): void {
  const ts = ds.tileSize;
  const inner = ds.tileinner;
  const tgap = ds.tilegap;
  const col = tile & TILE_COLMASK;
  const piece = COL_PIECE + col - 1;

  let outerCol = bgcolor;
  let innerCol = bgcolor;
  if (col) {
    if (tile & TILE_IMPOSSIBLE) {
      outerCol = piece;
      innerCol = COL_INK;
    } else if (tile & TILE_SELECTED) {
      outerCol = COL_SEL;
      innerCol = piece;
    } else {
      outerCol = piece;
      innerCol = piece;
    }
  }

  const tileW = dright ? ts : inner;
  const tileH = dbelow ? ts : inner;
  const outerW = tile & TILE_JOINRIGHT ? tileW : inner;
  const outerH = tile & TILE_JOINDOWN ? tileH : inner;
  const cx = coord(x, ts);
  const cy = coord(y, ts);

  // Draw the background if any of it will be visible.
  if (outerW !== tileW || outerH !== tileH || outerCol === bgcolor)
    dr.drawRect({ x: cx, y: cy, w: tileW, h: tileH }, bgcolor);
  // Draw the piece, and the stripes of a group the hint names over it,
  // gaps and all, so a group's stripes run on from square to square.
  if (outerCol !== bgcolor)
    dr.drawRect({ x: cx, y: cy, w: outerW, h: outerH }, outerCol);
  ds.hint.drawHatch(dr, i, { x: cx, y: cy, w: outerW, h: outerH }, ts);
  if (innerCol !== outerCol)
    dr.drawRect(
      {
        x: cx + Math.floor(inner / 4),
        y: cy + Math.floor(inner / 4),
        w: Math.floor(inner / 2),
        h: Math.floor(inner / 2),
      },
      innerCol,
    );
  // Reset the bottom-right corner if we join right & down but not diag.
  if (
    (tile & (TILE_JOINRIGHT | TILE_JOINDOWN | TILE_JOINDIAG)) ===
      (TILE_JOINRIGHT | TILE_JOINDOWN) &&
    outerCol !== bgcolor &&
    tgap !== 0
  )
    dr.drawRect({ x: cx + inner, y: cy + inner, w: tgap, h: tgap }, bgcolor);

  if (tile & TILE_HASSEL) {
    drawRectOutline(
      dr,
      cx + 2,
      cy + 2,
      inner - 4,
      inner - 4,
      col ? COL_ON_TILE : COL_INK,
    );
  }

  dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });
}

/**
 * The field's margin and the frame round it: the tiles stand one gap in from
 * a frame one pixel wide, so the edge of the field is spaced as two tiles are.
 * The margin is field, and a stuck board's flash lights it with the cells.
 */
function drawFrame(
  dr: GameDrawing,
  w: number,
  h: number,
  ts: number,
  bgcolor: number,
): void {
  const g = gap(ts);
  const x = coord(0, ts) - g;
  const y = coord(0, ts) - g;
  const fw = w * ts + g;
  const fh = h * ts + g;
  dr.drawRect({ x: x - 1, y: y - 1, w: fw + 2, h: fh + 2 }, COL_GRID);
  dr.drawRect({ x, y, w: fw, h: fh }, bgcolor);
  dr.drawUpdate({ x: x - 1, y: y - 1, w: fw + 2, h: fh + 2 });
}

export function redraw(
  dr: GameDrawing,
  ds: SamegameDrawState,
  _prev: SamegameState | null,
  state: SamegameState,
  _dir: number,
  ui: SamegameUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<SamegameMove>,
  _mistakes?: readonly never[],
  deadEnd?: MarkedDeadEnd,
): void {
  const ts = ds.tileSize;
  const { w, h } = state;
  // No removal is left: the board is cleared, or stuck.
  const over = isCleared(state) || isStuck(state);

  // A stuck board's flash lifts the whole field on its even beats and rests it
  // on its odd ones. A win's flash fills the cells it is on and leaves the
  // margin.
  const stuckLit = flash.time > 0 && Math.floor(flash.time / FLASH_FRAME) % 2 === 0;
  const margin = stuckLit ? COL_LIFTED : COL_CELL;
  const marginChanged = ds.margin !== margin;
  if (marginChanged) {
    // The margin's repaint covers the field, so every tile follows it.
    drawFrame(dr, w, h, ts, margin);
    ds.marks.reset();
    ds.tiles.forgetAll();
  }

  // The displayed step's marks, read from its words and from nowhere else.
  const named = stepMarks(hint ?? deadEnd);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  ds.hint.pack(named, (x, y) => y * w + x);
  const style: HintMarkStyle = {
    band: (x, y) => markBand(ds, x, y),
    // A tile is a color, never text.
    text: () => NOTHING_TO_CLEAR,
    evidenceColor: COL_HINT_OUTLINE,
    // A step rings one group: one pill where it is straight, and a ring per
    // square where it bends.
    joinTargets: () => true,
    // Two groups the step outlines never share a color where they touch.
    joinEvidence: (a, b) => state.tiles[a.y * w + a.x] === state.tiles[b.y * w + b.x],
  };
  ds.marks.eraseBeforeTiles(dr, targets, evidence, style, margin, (x, y) => {
    if (x >= 0 && x < w && y >= 0 && y < h) ds.tiles.forget(y * w + x);
  });

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      const col = state.tiles[i];
      let tile = col;
      const dright = x + 1 < w;
      const dbelow = y + 1 < h;

      if (ui.selected[i]) tile |= TILE_SELECTED;
      if (over) tile |= TILE_IMPOSSIBLE;
      if (dright && state.tiles[i + 1] === col) tile |= TILE_JOINRIGHT;
      if (dbelow && state.tiles[i + w] === col) tile |= TILE_JOINDOWN;
      if (
        tile & TILE_JOINRIGHT &&
        tile & TILE_JOINDOWN &&
        state.tiles[i + w + 1] === col
      )
        tile |= TILE_JOINDIAG;
      // Hide the keyboard cursor on a finished board: cleared or stuck.
      if (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y && !over)
        tile |= TILE_HASSEL;
      const tone = flash.win(sweepStep(x, y));
      tile |= tone << TILE_TONE_SHIFT;

      if (ds.tiles.changed(i, tile)) {
        const bgcolor = tone ? winSlot(tone) : margin;
        tileRedraw(dr, ds, i, x, y, dright, dbelow, tile, bgcolor);
      }
    }
  }
  ds.margin = margin;

  // After the tiles, because a mark straddles the gap between two of them.
  ds.marks.paint(dr, targets, evidence, style);
}
