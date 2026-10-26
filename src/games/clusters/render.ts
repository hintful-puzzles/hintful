/**
 * Clusters rendering. A per-tile diffed loop: each cell is a `COL_GRID` rect
 * under a slightly smaller surface, lifted under a given, with the cell's
 * color as a piece of the collection's two-state pair (`engine/piece.ts`), a
 * dot on a given's piece, a red four-sided outline
 * for a rule violation, and a green frame under the keyboard cursor. Rule
 * violations are recomputed every frame from the current grid and shown live
 * (upstream behavior); the in-flight paint drag previews its cells in the
 * drag color. The win flash fills the ground of the cell it is on.
 *
 * The geometry is upstream's `NARROW_BORDERS` build, the one its web frontend
 * used: `BORDER = tileSize / 10` — a thin grid margin, not the desktop
 * `tileSize / 2` — and `computeSize` subtracts 1 to meet the outer grid line.
 */

import { BLACK, TWO, WHITE } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_WASH,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawThickRectOutline } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
  NO_TEXT,
} from "../../engine/hint-mark.ts";
import { drawHintOrdinal } from "../../engine/hint-ordinal.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { OverlaySidecar } from "../../engine/overlay-sidecar.ts";
import { drawPiece, TWO_SHAPES } from "../../engine/piece.ts";
import type { Color, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { ClustersHintHighlights, ClustersMistake } from "./index.ts";
import { findErrors } from "./solver.ts";
import {
  type ClustersMove,
  type ClustersParams,
  type ClustersState,
  type ClustersUi,
  COLMASK,
  F_COLOR_0,
  F_COLOR_1,
  F_SINGLE,
  pairIndex,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_GRID = 1;
export const COL_0 = 2; // an `F_COLOR_0` piece
export const COL_1 = 3; // an `F_COLOR_1` piece
export const COL_0_DOT = 4; // the dot on a given `F_COLOR_0` piece
export const COL_1_DOT = 5; // the dot on a given `F_COLOR_1` piece
export const COL_ERROR = 6;
export const COL_CURSOR = 7;
// Hint marks: the forced cell is ringed by the engine; the tile the refuted
// coloring would break gets a thin COL_HINT_CELL frame, an outline because the
// tile's own color *is* part of the premise; a lookahead chain's what-if cells
// are outlined COL_HINT_CELL with a small piece of the color each would be
// forced to.
/** The outlines, **and** a chain cell's ordinal — one index, because the
 * number indexes the evidence. */
export const COL_HINT_CELL = 8;
/** The surface of a cell. */
export const COL_CELL = 9;
/** The surface under a given. */
export const COL_GIVEN = 10;
/** The surface under a tile Check & Save found wrong. */
export const COL_WRONG = 11;
/** The ground of a cell the win flash is on: its body, and its leading edge. */
export const COL_FLASH = 12;
export const COL_FLASH_LEAD = 13;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_0] = TWO[pairIndex(F_COLOR_0)];
  out[COL_1] = TWO[pairIndex(F_COLOR_1)];
  // Pinned and not ink or paper: each dot is read against a piece whose own
  // lightness barely moves between the schemes, the lighter of the pair
  // taking the dark dot.
  out[COL_0_DOT] = BLACK;
  out[COL_1_DOT] = WHITE;
  out[COL_ERROR] = ERROR;
  out[COL_WRONG] = ERROR_WASH;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_CURSOR] = CURSOR;
  // The chain is outlined rather than washed, so it takes the mark form of the
  // evidence role, which covers the chain ordinal too (see `HINT_OUTLINE`).
  out[COL_HINT_CELL] = HINT_OUTLINE;
  return out;
}

// --- geometry --------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 10);

export function computeSize(p: ClustersParams, ts: number): Size {
  // NARROW_BORDERS: subtract 1 to meet the outer grid line drawn in redraw.
  return { w: p.w * ts + 2 * border(ts) - 1, h: p.h * ts + 2 * border(ts) - 1 };
}

// --- draw state ------------------------------------------------------------

// Cache flags above the effective-tile byte (0..6: color bits + F_SINGLE).
const F_ERR = 1 << 8;
const F_CUR = 1 << 9;
const F_WRONG = 1 << 10;
const K_LIT = 11; // bits 11-12: the win flash's tone on this cell

// Hint-overlay bits, packed per cell into the OverlaySidecar, which is part of
// the diff key (docs/rendering.md § "Overlay sidecars").
const HB_TARGET = 1; // the forced cell — ringed
const HB_DANGER = 1 << 1; // tile that would break — a thin COL_HINT_CELL ring
const HB_CHAIN_0 = 1 << 2; // what-if cell forced `F_COLOR_0` in the hypothetical
const HB_CHAIN_1 = 1 << 3; // what-if cell forced `F_COLOR_1` in the hypothetical
//
// A chain cell's **1-based position in the chain** is not a bit here: it rides
// the sidecar's own ordinal lane (`OverlaySidecar.order`). See `drawHintOrdinal`
// for why the mark is a number and not an arrow (34% of Clusters' consecutive
// links are not implications at all), and `OrderedCell` for why the order needs
// a lane of its own. Nothing draws the last link: the contradiction sits on, or
// orthogonally beside, the final forced cell in 140 of 140 firings measured, so
// the ring is already next to the highest number.

export interface ClustersDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  cache: Int32Array;
  hint: OverlaySidecar;
  /** The hint target's ring and the chain's outline, drawn after the tile
   * loop. See {@link markBand}. */
  marks: HintMarks;
}

export function newDrawState(
  state: ClustersState,
  tileSize: number,
): ClustersDrawState {
  return {
    started: false,
    tileSize,
    w: state.w,
    h: state.h,
    cache: new Int32Array(state.w * state.h).fill(-1),
    hint: new OverlaySidecar(state.w * state.h),
    marks: new HintMarks(),
  };
}

/**
 * Where a hint mark sits around cell `(x, y)` — straddling the grid line, one
 * pixel of `COL_GRID` gutter and a couple of the cell's own edge.
 *
 * Each tile paints a `TILESIZE` square of `COL_GRID` and then its own color one
 * pixel smaller, so a single pixel between two cells is real gutter and is what
 * `HintMarks` paints back when a mark moves; the rest lies inside the cell,
 * where the cell's own repaint undoes it. There is room because a Clusters cell's
 * content is a centered dot or a `TILESIZE/3` what-if mark.
 */
function markBand(ds: ClustersDrawState, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  const b = border(ts);
  return {
    box: { x: x * ts + b, y: y * ts + b, w: ts - 1, h: ts - 1 },
    outer: 1,
    inner: Math.max(2, ts >> 5),
  };
}

// --- cell drawing ----------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  tile: number,
  error: boolean,
  wrong: boolean,
  tone: WinTone,
  cursor: boolean,
  hintBits: number,
  hintOrder: number,
): void {
  const b = border(ts);
  const px = x * ts + b;
  const py = y * ts + b;

  // The cell keeps its own color under a hint: the target is ringed and the
  // chain outlined, both on the cell's border in `redraw`. In a game whose move
  // *is* "give this cell a color", a solid fill is not merely a legibility
  // question — it says with the board what the narration is still proposing, and
  // it buries the what-if mark's color, which is the whole content of a chain
  // cell.
  const surface = { x: px, y: py, w: ts - 1, h: ts - 1 };
  const piece = (fill: number, grown: number): void =>
    drawPiece(
      dr,
      surface,
      TWO_SHAPES[pairIndex(fill)],
      fill & F_COLOR_1 ? COL_1 : COL_0,
      grown,
    );
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, COL_GRID);
  dr.drawRect(
    surface,
    wrong
      ? COL_WRONG
      : tone
        ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD)
        : tile & F_SINGLE
          ? COL_GIVEN
          : COL_CELL,
  );
  if (tile & COLMASK) piece(tile, 1);

  // The small piece of the color a what-if cell would be forced to — a
  // deliberately piece-unlike size, so it reads as hypothetical, not placed.
  if (hintBits & (HB_CHAIN_0 | HB_CHAIN_1))
    piece(hintBits & HB_CHAIN_0 ? F_COLOR_0 : F_COLOR_1, 0.4);

  if (tile & F_SINGLE) {
    const dot = tile & F_COLOR_1 ? COL_1_DOT : COL_0_DOT;
    dr.drawCircle(
      { x: px + Math.floor(ts / 2), y: py + Math.floor(ts / 2) },
      Math.floor(ts / 7),
      dot,
      dot,
    );
  }

  if (error) {
    // Four-sided inset red frame (upstream clusters_draw_err_rectangle).
    const thick = Math.floor(ts / 7);
    const margin = Math.floor(ts / 20);
    const inner = ts - 1 - 2 * margin;
    drawThickRectOutline(dr, px + margin, py + margin, inner, inner, thick, COL_ERROR);
  }

  if (cursor) {
    const t = Math.floor(ts / 12);
    dr.drawRect({ x: px, y: py, w: t, h: ts - 1 }, COL_CURSOR);
    dr.drawRect({ x: px, y: py, w: ts - 1, h: t }, COL_CURSOR);
    dr.drawRect({ x: px + ts - 1 - t, y: py, w: t, h: ts - 1 }, COL_CURSOR);
    dr.drawRect({ x: px, y: py + ts - 1 - t, w: ts - 1, h: t }, COL_CURSOR);
  }

  // The danger ring, last so nothing paints over it. One thin ring at the
  // cell's edge, beside the piece: doubled, it has to cross the piece, and two
  // rings a pixel apart read as a fill. It is told from the red live-error
  // frame by hue and by being half as thick.
  const rt = Math.max(2, Math.floor(ts / 12));
  if (hintBits & HB_DANGER) {
    const side = ts - 3;
    drawThickRectOutline(dr, px + 1, py + 1, side, side, rt, COL_HINT_CELL);
  }

  // The order this consequence falls in, drawn after the ring and inside it
  // when there is one: the break lands on the last forced cell often enough
  // that "ringed *and* numbered" is a common frame, and at the shared inset the
  // ring would cover the digit.
  if (hintOrder > 0) {
    drawHintOrdinal(
      dr,
      { x: px, y: py },
      ts - 1,
      hintOrder,
      COL_HINT_CELL,
      hintBits & HB_DANGER ? 2 + rt : undefined,
    );
  }

  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: ClustersDrawState,
  _prev: ClustersState | null,
  state: ClustersState,
  _dir: number,
  ui: ClustersUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<ClustersMove>,
  mistakes?: readonly ClustersMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid } = state;
  const b = border(ts);

  if (!ds.started) {
    // The frame closes the grid on its top and left and is no heavier than
    // it; the per-tile COL_GRID rects draw the interior lines.
    dr.drawRect({ x: b - 1, y: b - 1, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
    ds.started = true;
  }

  // Live rule violations, recomputed from the committed grid every frame
  // (pure — never mutates the state's grid).
  const errors = new Set(findErrors(grid, w, h));
  // Check & Save's wrong tiles, which need break no rule.
  const wrongTiles = new Set(mistakes?.map((m) => m.index));

  const dragSet = ui.dragType !== -1 && ui.drag.length > 0 ? new Set(ui.drag) : null;

  // The displayed hint step's overlay, repacked each frame (cleared when no
  // hint is on display, so a dropped hint repaints too).
  const marks = stepMarks(hint);
  const hl = hint?.highlights as ClustersHintHighlights | undefined;
  const outlined = new Set(marks.of("outline", CELL).map((p) => p.y * w + p.x));
  ds.hint.clear();
  for (const p of marks.of("ring", CELL)) ds.hint.add(p.y * w + p.x, HB_TARGET);
  if (hl?.danger && outlined.has(hl.danger.y * w + hl.danger.x))
    ds.hint.add(hl.danger.y * w + hl.danger.x, HB_DANGER);
  for (const c of hl?.chain ?? []) {
    const i = c.y * w + c.x;
    if (!outlined.has(i)) continue;
    ds.hint.add(i, c.fill === F_COLOR_0 ? HB_CHAIN_0 : HB_CHAIN_1);
    if (c.order !== undefined) ds.hint.setOrder(i, c.order);
  }

  const targets: MarkCell[] = [];
  const chain: MarkCell[] = [];
  for (let i = 0; i < w * h; i++) {
    const c = { x: i % w, y: (i / w) | 0 };
    if (ds.hint.packed[i] & HB_TARGET) targets.push(c);
    if (ds.hint.packed[i] & (HB_CHAIN_0 | HB_CHAIN_1)) chain.push(c);
  }
  const markStyle = {
    band: (x: number, y: number) => markBand(ds, x, y),
    // A forced cell shows a piece or a dot, never text; an ordinal is on a
    // chain cell, inside its own tile, which the ring's room does not reach.
    text: () => NO_TEXT,
    evidenceColor: COL_HINT_CELL,
  };
  ds.marks.eraseBeforeTiles(dr, targets, chain, markStyle, COL_GRID, (x, y) => {
    if (x >= 0 && x < w && y >= 0 && y < h) ds.cache[y * w + x] = -1;
  });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let tile = grid[i];

      // In-flight paint drag previews non-given cells in the drag color.
      if (dragSet?.has(i) && !(tile & F_SINGLE)) tile = ui.dragType;

      // A dragged (uncommitted) cell shows no error outline — its color is a
      // preview, not the committed state the error check ran on.
      const error = !(dragSet?.has(i) && !(grid[i] & F_SINGLE)) && errors.has(i);
      const cursor = ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y;

      const wrong = wrongTiles.has(i);
      const tone = flash.win(sweepStep(x, y));

      const packed =
        (tile & 0x7) |
        (error ? F_ERR : 0) |
        (cursor ? F_CUR : 0) |
        (wrong ? F_WRONG : 0) |
        (tone << K_LIT);
      if (ds.cache[i] !== packed || ds.hint.stale(i)) {
        drawTile(
          dr,
          ts,
          x,
          y,
          tile,
          error,
          wrong,
          tone,
          cursor,
          ds.hint.packed[i],
          ds.hint.order[i],
        );
        ds.cache[i] = packed;
        ds.hint.commit(i);
      }
    }
  }

  // The hint marks, after the tile loop and outside every clip, because they
  // straddle the grid line.
  ds.marks.paint(dr, targets, chain, markStyle);
}
