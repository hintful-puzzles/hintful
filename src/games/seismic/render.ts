/**
 * Seismic rendering — port of `game_redraw` from `seismic.c`.
 *
 * The board is one rectangle in the wall color with each cell painted back
 * over it, inset by a pixel on any side that is a *region* boundary — so the
 * region walls are the backing left showing through. The thin line between two
 * cells of one region is not a wall: each tile paints it in the grid color
 * under its own surface, a given's lifted. The four corner pixels each cell
 * may owe (where its diagonal neighbor is in another region) are painted after
 * the cell, because the cell's own fill can cover them.
 *
 * That geometry depends only on the region partition, which never changes for
 * the life of a game — so the per-tile cache (docs/rendering.md § "The tile
 * cache and the diff key") keys on the cell's *contents* alone: its digit,
 * pencil marks, error flags and the background color the cursor/flash chose.
 * The Check-&-Save mistake overlay rides in an `OverlaySidecar` so it repaints a
 * cell whose contents are otherwise unchanged.
 *
 * Upstream stores the 9-bit pencil bitmask in a `char` before drawing it, so a
 * penciled **9** is truncated away and never appears; this draws it (a
 * display-only divergence, docs/solver-and-generator.md § "Divergence and
 * what it costs").
 *
 * The canvas also gains a half-tile margin at its right for the pencil-mode
 * indicator (docs/mechanics.md § "Pencil marks: the full note-taking
 * UX"): the web build compiles `NARROW_BORDERS`, so the black board rectangle
 * covers its own area edge to edge, leaving nowhere for the top-right corner
 * the engine puts the indicator in.
 */

import { valueBit } from "../../engine/candidate-bits.ts";
import {
  cellSurface,
  ERROR,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  highlightWash,
  INK,
  PENCIL_BODY,
  pencilColor,
  playerEntryColor,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawStrike, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
  ringTextBox,
} from "../../engine/hint-mark.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  type CellHighlight,
  cellHighlight,
  drawCellBackground,
  HIGHLIGHT_NONE,
  noteGrid,
  winHighlight,
} from "../../engine/note-taking-cell.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  OverlaySidecar,
} from "../../engine/overlay-sidecar.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorCanvas,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import { NOTHING_TO_CLEAR, type RingClear, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep } from "../../engine/win-wave.ts";
import type { SeismicHint } from "./hint.ts";
import {
  FM_ERRORMASK,
  FM_FIXED,
  type SeismicMove,
  type SeismicParams,
  type SeismicState,
  type SeismicUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

/** Width of a region wall, in pixels. */
const GRIDEXTRA = 1;
/** The `NARROW_BORDERS` arm — the web build defines it, so the grid's outer
 * outline is drawn *inside* the border area rather than a half-tile margin
 * (docs/rendering.md § "Sizing": check the define, don't port the desktop default). */
const BORDER = GRIDEXTRA * 2;

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0; // the board around the grid
/** The surface of a cell the player fills. */
export const COL_CELL = 1;
/** The lifted surface under a number the puzzle fixed. */
export const COL_GIVEN = 2;
/** A region's wall, and the frame, which is the outer regions' wall. */
export const COL_BORDER = 3;
export const COL_NUM_FIXED = 4;
export const COL_NUM_GUESS = 5;
export const COL_NUM_ERROR = 6;
export const COL_NUM_PENCIL = 7;
/** The thin line between two cells of one region. */
export const COL_GRID = 8;
/** The pencil indicator's body. */
export const COL_PENCIL_BODY = 9;
/** Fork addition: the outline of what an explained hint reasons from
 * (docs/hints-marks.md § "Shade vs ring"), drawn on a cell's edge rather than
 * behind its notes. The ring on the cell it acts on is the engine's. */
export const COL_HINT_CELL = 10;
/** The highlight's wash, in both its full-cell and its corner form. */
export const COL_CURSOR = 11;
/** The ground of a cell the win flash is on: its body, and its leading edge. */
export const COL_FLASH = 12;
export const COL_FLASH_LEAD = 13;

export function colors(background: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_CELL] = cellSurface(background);
  out[COL_GIVEN] = givenSurface(background);
  out[COL_GRID] = surfaceGrid(background);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_BORDER] = INK;
  out[COL_NUM_FIXED] = INK;
  out[COL_NUM_GUESS] = playerEntryColor(background);
  out[COL_NUM_ERROR] = ERROR;
  out[COL_NUM_PENCIL] = pencilColor(background);
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  out[COL_HINT_CELL] = HINT_OUTLINE;
  // A fill under the digit and its notes: the note-taking cell's "you are
  // here" wash, which every game in that mechanic shares, not the green mark.
  out[COL_CURSOR] = highlightWash(background);
  return out;
}

// --- geometry --------------------------------------------------------------

/** The board's own size, without the indicator margin — upstream's
 * `game_compute_size`, `NARROW_BORDERS` arm (which subtracts the outline it
 * drew inside the border). */
function boardSize(p: SeismicParams, ts: number): Size {
  return {
    w: p.w * ts + 2 * BORDER - GRIDEXTRA * 2,
    h: p.h * ts + 2 * BORDER - GRIDEXTRA * 2,
  };
}

/**
 * The board's pixel origin: upstream's border, plus the margin that gives the
 * pencil indicator its corner — the black board rectangle covers its own area
 * edge to edge, so there is nowhere else for it. The margin is taken on every
 * side, so the board stays centered in its canvas.
 */
export const origin = (ts: number): number => BORDER + pencilIndicatorReach(ts);

export function computeSize(p: SeismicParams, ts: number): Size {
  return pencilIndicatorCanvas(boardSize(p, ts), ts);
}

/** Upstream `FROMCOORD` — C integer division, which **truncates** toward zero,
 * so a pointer inside the two-pixel border maps to row/column 0 rather than −1
 * (docs/input.md § "The accreting-paint drag"). This declines the shared
 * `fromCoord` of `engine/geometry.ts`, whose floor would put that pointer off
 * the grid. */
export function fromCoord(v: number, ts: number): number {
  return Math.trunc((v - origin(ts)) / ts);
}

// --- draw state ------------------------------------------------------------

export interface SeismicDrawState {
  started: boolean;
  tileSize: number;
  /** Per-tile last-drawn contents (−1 = never drawn): the digit in bits 0–3, the
   * pencil bitmask in bits 4–12, the cell flags in 13–15, the completion wave's
   * beat in 16–17 and the cell's highlight from bit 18. */
  tiles: Int32Array;
  /** The Check-&-Save mistake overlay. */
  wrong: OverlaySidecar;
  /** The displayed hint: target and evidence bits, and each struck note at
   * `valueBit(n)` in the `struck` lane. */
  hint: OverlaySidecar;
  /** The hint's rings and outline, painted once per frame after the tiles. */
  marks: HintMarks;
  /** Whether the pencil-mode indicator was on last frame. */
  pencilModeShown: boolean | null;
}

export function newDrawState(state: SeismicState, tileSize: number): SeismicDrawState {
  const cells = state.w * state.h;
  return {
    started: false,
    tileSize,
    tiles: new Int32Array(cells).fill(-1),
    wrong: new OverlaySidecar(cells),
    hint: new OverlaySidecar(cells),
    marks: new HintMarks(),
    pencilModeShown: null,
  };
}

// --- tile drawing ----------------------------------------------------------

/** The inset a cell's fill takes on each side that borders another region — the
 * gap that leaves the backing showing as a wall. */
function cellRect(state: SeismicState, x: number, y: number, ts: number) {
  const { w, h, dsf } = state;
  const i = y * w + x;
  let cx = origin(ts) + x * ts;
  let cy = origin(ts) + y * ts;
  let cw = ts - 1;
  let ch = ts - 1;

  if (x === 0 || !dsf.equivalent(i, i - 1)) {
    cx += GRIDEXTRA;
    cw -= GRIDEXTRA;
  }
  if (x === w - 1 || !dsf.equivalent(i, i + 1)) cw -= GRIDEXTRA * 2;
  if (y === 0 || !dsf.equivalent(i, i - w)) {
    cy += GRIDEXTRA;
    ch -= GRIDEXTRA;
  }
  if (y === h - 1 || !dsf.equivalent(i, i + w)) ch -= GRIDEXTRA * 2;

  return { cx, cy, cw, ch };
}

/**
 * Where a hint mark sits around cell `(x, y)`: inside the box the cell paints,
 * over its edge (`outer` 0).
 *
 * Not in the gap between cells, because that gap is the backing the region
 * walls are made of, and a colored band there would read as a wall. Inside, the
 * cell's own repaint undoes the mark. There is room: the pencil grid's first row
 * and column of glyphs sit about a tenth of a tile in from the box, against a band
 * of a sixteenth.
 */
function markBand(state: SeismicState, x: number, y: number, ts: number): MarkBand {
  const { cx, cy, cw, ch } = cellRect(state, x, y, ts);
  return { box: { x: cx, y: cy, w: cw, h: ch }, outer: 0, inner: Math.max(2, ts >> 4) };
}

/** A piece of text a tile draws: what it passes `drawText` but the color. */
interface TileText {
  readonly origin: Point;
  readonly options: DrawTextOptions;
}

/** The candidates set in a pencil mask, in order; bit `n − 1` is candidate `n`. */
const pencilValues = (marks: number): number[] =>
  Array.from({ length: 9 }, (_, n) => n + 1).filter((n) => marks & (1 << (n - 1)));

/** Where `count` notes go in a cell of `band`, in order: its
 * {@link ringTextBox}. */
function pencilSlots(band: MarkBand, count: number): TileText[] {
  return noteGrid(ringTextBox(band), count);
}

/** A placed number, in the middle of the tile. */
function digitText(ts: number, x: number, y: number): TileText {
  return {
    origin: {
      x: origin(ts) + x * ts + ((ts / 2) | 0),
      y: origin(ts) + y * ts + ((ts / 2) | 0),
    },
    options: glyphFont((ts / 2) | 0),
  };
}

/** The pencil marks; bit `n` of `struck` is a candidate the displayed hint
 * rules out, drawn with a line through it. */
function drawPencilMarks(
  dr: GameDrawing,
  band: MarkBand,
  marks: number,
  struck: number,
  tile: Rect,
): void {
  const shown = pencilValues(marks);
  pencilSlots(band, shown.length).forEach(({ origin: at, options }, j) => {
    const n = shown[j];
    dr.drawText(at, options, COL_NUM_PENCIL, String(n));
    // The struck note keeps its own color, so it still reads as the player's
    // note; the line through it is what says the hint rules it out.
    if (struck & (1 << n)) drawStrike(dr, at, options.size, COL_NUM_PENCIL, tile);
  });
}

/** The text cell `(x, y)` shows, for a hint's ring to keep clear of. */
function cellText(state: SeismicState, ts: number, x: number, y: number): RingClear {
  const { w, h } = state;
  if (x < 0 || y < 0 || x >= w || y >= h) return NOTHING_TO_CLEAR;
  const i = y * w + x;
  if (state.grid[i]) {
    const { origin: at, options } = digitText(ts, x, y);
    return {
      enclose: [textBox(at, options, String(state.grid[i]))],
      avoid: [],
    };
  }
  const shown = pencilValues(state.pencil[i]);
  const notes = pencilSlots(markBand(state, x, y, ts), shown.length).map(
    ({ origin: at, options }, j) => textBox(at, options, String(shown[j])),
  );
  return { enclose: notes, avoid: [] };
}

function drawTile(
  dr: GameDrawing,
  ds: SeismicDrawState,
  state: SeismicState,
  x: number,
  y: number,
  color: number,
  highlight: CellHighlight,
  wrong: boolean,
  struck: number,
): void {
  const ts = ds.tileSize;
  const { w, h, dsf, grid, pencil, flags } = state;
  const i = y * w + x;
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  const { cx, cy, cw, ch } = cellRect(state, x, y, ts);

  dr.clip({ x: tx, y: ty, w: ts, h: ts });
  dr.drawUpdate({ x: tx, y: ty, w: ts, h: ts });

  // The line on the tile's right and bottom edge is a wall where the neighbor
  // is another region, which the fill's inset already leaves in the backing's
  // color, and the thin grid line where it is the same one.
  const sameRight = x + 1 < w && dsf.equivalent(i, i + 1);
  const sameBelow = y + 1 < h && dsf.equivalent(i, i + w);
  if (sameRight)
    dr.drawRect({ x: tx + ts - 1, y: cy, w: 1, h: sameBelow ? ch + 1 : ch }, COL_GRID);
  if (sameBelow) dr.drawRect({ x: cx, y: ty + ts - 1, w: cw, h: 1 }, COL_GRID);

  drawCellBackground(
    dr,
    { x: cx, y: cy, w: cw, h: ch },
    highlight,
    COL_CURSOR,
    color,
    COL_FLASH,
    COL_FLASH_LEAD,
  );
  ds.hint.drawHatch(dr, i, { x: cx, y: cy, w: cw, h: ch }, ts);

  // A cell whose *diagonal* neighbor is in another region owes that corner the
  // piece of wall where the two walls round it meet — drawn after the fill,
  // which can otherwise cover it. A wall takes `near` of a tile's top and left
  // and `far` of its right and bottom, so the piece is as large as the sides
  // it sits on. Without it the turn is joined only by the grid line, which is
  // too quiet to close it.
  const near = GRIDEXTRA;
  const far = GRIDEXTRA * 3;
  const corner = (px: number, py: number, pw: number, ph: number) =>
    dr.drawRect({ x: px, y: py, w: pw, h: ph }, COL_BORDER);
  if (x > 0 && y > 0 && !dsf.equivalent(i, i - w - 1)) corner(tx, ty, near, near);
  if (x + 1 < w && y > 0 && !dsf.equivalent(i, i - w + 1))
    corner(tx + ts - far, ty, far, near);
  if (x > 0 && y + 1 < h && !dsf.equivalent(i, i + w - 1))
    corner(tx, ty + ts - far, near, far);
  if (x + 1 < w && y + 1 < h && !dsf.equivalent(i, i + w + 1))
    corner(tx + ts - far, ty + ts - far, far, far);

  if (grid[i] === 0) {
    drawPencilMarks(dr, markBand(state, x, y, ts), pencil[i], struck, {
      x: tx,
      y: ty,
      w: ts,
      h: ts,
    });
  } else {
    const ink =
      flags[i] & FM_FIXED
        ? COL_NUM_FIXED
        : flags[i] & FM_ERRORMASK
          ? COL_NUM_ERROR
          : COL_NUM_GUESS;
    const { origin: at, options } = digitText(ts, x, y);
    dr.drawText(at, options, ink, String(grid[i]));
  }

  // Check & Save mistake overlay (fork addition): an inset red double outline,
  // so it reads distinctly from the red *digit* a live rule violation gets.
  if (wrong) {
    for (const inset of [2, 3]) {
      const l = tx + inset;
      const t = ty + inset;
      const r = tx + ts - 2 - inset;
      const b = ty + ts - 2 - inset;
      dr.drawLine({ x: l, y: t }, { x: r, y: t }, COL_NUM_ERROR, 1);
      dr.drawLine({ x: r, y: t }, { x: r, y: b }, COL_NUM_ERROR, 1);
      dr.drawLine({ x: r, y: b }, { x: l, y: b }, COL_NUM_ERROR, 1);
      dr.drawLine({ x: l, y: b }, { x: l, y: t }, COL_NUM_ERROR, 1);
    }
  }

  dr.unclip();
}

// --- pencil-mode indicator (fork addition) ---------------------------------

const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_PENCIL_BODY,
  ink: COL_BORDER,
};

/** The margin `computeSize` grows for it, at the canvas's top-right. */
const PENCIL_BOX = (p: SeismicParams, ts: number) =>
  pencilIndicatorBox(computeSize(p, ts), ts);

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SeismicDrawState,
  _prev: SeismicState | null,
  state: SeismicState,
  _dir: number,
  ui: SeismicUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<SeismicMove, SeismicHint>,
  mistakes?: readonly { x: number; y: number }[],
): void {
  const ts = ds.tileSize;
  const { w, h } = state;
  const firstFrame = !ds.started;

  if (firstFrame) {
    // The rectangle the region walls show through.
    dr.drawRect(
      {
        x: origin(ts) - GRIDEXTRA * 2,
        y: origin(ts) - GRIDEXTRA * 2,
        w: w * ts + GRIDEXTRA * 2,
        h: h * ts + GRIDEXTRA * 2,
      },
      COL_BORDER,
    );
    ds.started = true;
  }

  const index = (x: number, y: number): number => y * w + x;
  ds.wrong.packCells(mistakes ?? null, index);
  ds.hint.pack(stepMarks(hint), index, (m) => valueBit(m.n));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      // The cursor is hidden while the win flash plays.
      const highlight =
        winHighlight(flash.win(sweepStep(x, y))) ??
        (flash.winning ? HIGHLIGHT_NONE : cellHighlight(ui, x, y));
      const color = state.flags[i] & FM_FIXED ? COL_GIVEN : COL_CELL;

      const tile =
        state.grid[i] |
        (state.pencil[i] << 4) |
        (state.flags[i] << 13) |
        (highlight << 18);

      if (ds.tiles[i] !== tile || ds.wrong.stale(i) || ds.hint.stale(i)) {
        const struck = ds.hint.struck[i];
        drawTile(dr, ds, state, x, y, color, highlight, ds.wrong.at(i), struck);
        ds.tiles[i] = tile;
        ds.wrong.commit(i);
        ds.hint.commit(i);
      }
    }
  }

  // The hint's marks, after every tile, so no tile painted this frame covers one.
  const targets: MarkCell[] = [];
  const evidence: MarkCell[] = [];
  for (let i = 0; i < w * h; i++) {
    const c = { x: i % w, y: (i / w) | 0 };
    if (ds.hint.packed[i] & HINT_TARGET) targets.push(c);
    if (ds.hint.packed[i] & HINT_AREA) evidence.push(c);
  }
  ds.marks.paint(dr, targets, evidence, {
    band: (x, y) => markBand(state, x, y, ts),
    text: (x, y) => cellText(state, ts, x, y),
    evidenceColor: COL_HINT_CELL,
  });

  const box = PENCIL_BOX(state.params, ts);
  repaintPencilIndicator(dr, ds, ui.pencilMode, box, PENCIL_STYLE);
}
