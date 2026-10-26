import { BLACK, FREE, WHITE } from "../../engine/color/colors.ts";
import {
  cellSurface,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectOutline } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import {
  type HintMarkStyle,
  HintMarks,
  type MarkBand,
  type MarkCell,
  NO_TEXT,
} from "../../engine/hint-mark.ts";
import type { MarkedDeadEnd } from "../../engine/hint-refusal.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { OverlaySidecar } from "../../engine/overlay-sidecar.ts";
import type { Color, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, winSlot } from "../../engine/win-wave.ts";
import type { SamegameMove, SamegameState, SamegameUi } from "./state.ts";

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

const COL_BACKGROUND = 0;
const COL_1 = 1; // COL_1..COL_9 are 1..9
/** The middle of every tile on a stuck board, and the cursor on an emptied
 * cell. */
const COL_INK = 10;
/** The body of a selected tile, whose color shrinks to its middle. */
const COL_SEL = 11;
/** The field: an emptied cell, and the gap between two tiles. */
const COL_CELL = 12;
/** The field on the lit beats of a stuck board's flash. */
export const COL_LIFTED = 13;
/** The frame round the field. */
const COL_GRID = 14;
/** The cursor on a tile. */
export const COL_ON_TILE = 15;
/** The ground of a cell the win flash is on: its body, and its leading edge. */
export const COL_FLASH = 16;
export const COL_FLASH_LEAD = 17;
/** The outline round the squares and groups a hint step reasons from. The
 * ring round the group it removes is the engine's (`GameDrawing.drawRing`). */
export const COL_HINT_EVIDENCE = 18;
const NCOLORS = 19;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = new Array<Color>(NCOLORS);
  out[COL_BACKGROUND] = defaultBackground;
  for (let i = 0; i < 9; i++) out[COL_1 + i] = FREE[i];
  out[COL_INK] = INK;
  // `WHITE` and `BLACK`, not `PAPER` and `INK`: both are read against a
  // tile, which is one color in both schemes, and a selected tile that
  // inverted would sink into the dark scheme's field.
  out[COL_SEL] = WHITE;
  out[COL_ON_TILE] = BLACK;
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_LIFTED] = givenSurface(defaultBackground);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
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
  /** Per-cell cache of the last-drawn packed tile value; `-1` forces a
   * redraw (the no-BigInt Int32Array cache pattern). */
  grid: Int32Array;
  /** The hint step's marks by square, part of the diff key. */
  hint: OverlaySidecar;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: SamegameState,
  tileSize: number,
): SamegameDrawState {
  return {
    tileSize,
    tileinner: tileSize - gap(tileSize),
    tilegap: gap(tileSize),
    margin: -1,
    grid: new Int32Array(state.w * state.h).fill(-1),
    hint: new OverlaySidecar(state.w * state.h),
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

  let outerCol = bgcolor;
  let innerCol = bgcolor;
  if (col) {
    if (tile & TILE_IMPOSSIBLE) {
      outerCol = col;
      innerCol = COL_INK;
    } else if (tile & TILE_SELECTED) {
      outerCol = COL_SEL;
      innerCol = col;
    } else {
      outerCol = col;
      innerCol = col;
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

  // A stuck board's flash lifts the whole field on its even beats and rests it
  // on its odd ones. A win's flash fills the cells it is on and leaves the
  // margin.
  const stuckLit = flash.time > 0 && Math.floor(flash.time / FLASH_FRAME) % 2 === 0;
  const margin = stuckLit ? COL_LIFTED : COL_CELL;
  const marginChanged = ds.margin !== margin;
  if (marginChanged) {
    drawFrame(dr, w, h, ts, margin);
    ds.marks.reset();
  }

  // The displayed step's marks, read from its words and from nowhere else.
  const named = stepMarks(hint ?? deadEnd);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  ds.hint.pack(named, (x, y) => y * w + x);
  const style: HintMarkStyle = {
    band: (x, y) => markBand(ds, x, y),
    // A tile is a color, never text.
    text: () => NO_TEXT,
    evidenceColor: COL_HINT_EVIDENCE,
    // A step rings one group: one pill where it is straight, and a ring per
    // square where it bends.
    joinTargets: () => true,
    // Two groups the step outlines never share a color where they touch.
    joinEvidence: (a, b) => state.tiles[a.y * w + a.x] === state.tiles[b.y * w + b.x],
  };
  ds.marks.eraseBeforeTiles(dr, targets, evidence, style, margin, (x, y) => {
    if (x >= 0 && x < w && y >= 0 && y < h) ds.grid[y * w + x] = -1;
  });

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      const col = state.tiles[i];
      let tile = col;
      const dright = x + 1 < w;
      const dbelow = y + 1 < h;

      if (ui.selected[i]) tile |= TILE_SELECTED;
      if (state.impossible) tile |= TILE_IMPOSSIBLE;
      if (dright && state.tiles[i + 1] === col) tile |= TILE_JOINRIGHT;
      if (dbelow && state.tiles[i + w] === col) tile |= TILE_JOINDOWN;
      if (
        tile & TILE_JOINRIGHT &&
        tile & TILE_JOINDOWN &&
        state.tiles[i + w + 1] === col
      )
        tile |= TILE_JOINDIAG;
      // Hide the keyboard cursor on a finished board: cleared or stuck, which
      // `impossible` both says.
      if (
        ui.cursor.visible &&
        ui.cursor.x === x &&
        ui.cursor.y === y &&
        !state.impossible
      )
        tile |= TILE_HASSEL;
      const tone = flash.win(sweepStep(x, y));
      tile |= tone << TILE_TONE_SHIFT;

      // The margin's repaint covers the field, so every tile follows it.
      if (ds.grid[i] !== tile || marginChanged || ds.hint.stale(i)) {
        const bgcolor = tone ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD) : margin;
        tileRedraw(dr, ds, i, x, y, dright, dbelow, tile, bgcolor);
        ds.grid[i] = tile;
        ds.hint.commit(i);
      }
    }
  }
  ds.margin = margin;

  // After the tiles, because a mark straddles the gap between two of them.
  ds.marks.paint(dr, targets, evidence, style);
}
