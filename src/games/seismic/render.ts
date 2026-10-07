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
 * the life of a game — so the per-tile cache (docs/games/rendering.md § "The tile
 * cache and the diff key") keys on the cell's *contents* alone: its digit,
 * pencil marks, error flags and the background color the cursor/flash chose.
 * The Check-&-Save mistake overlay rides in an `OverlaySidecar` so it repaints a
 * cell whose contents are otherwise unchanged.
 *
 * Upstream stores the 9-bit pencil bitmask in a `char` before drawing it, so a
 * penciled **9** is truncated away and never appears; this draws it (a
 * display-only divergence, docs/games/solver-and-generator.md § "Divergence and
 * what it costs").
 *
 * The canvas also gains a half-tile margin at its right for the pencil-mode
 * indicator (docs/games/mechanics.md § "Pencil marks: the full note-taking
 * UX"): the web build compiles `NARROW_BORDERS`, so the black board rectangle
 * covers its own area edge to edge, leaving nowhere for the top-right corner
 * the engine puts the indicator in.
 */

import { valueBit } from "../../engine/candidate-bits.ts";
import {
  cellSurface,
  ERROR,
  FLASH,
  givenSurface,
  HINT_ACTION,
  HINT_EVIDENCE,
  highlightWash,
  INK,
  PENCIL_BODY,
  pencilColor,
  playerEntryColor,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  type CellHighlight,
  cellHighlight,
  drawCellBackground,
  HIGHLIGHT_NONE,
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
import type { Color, Size } from "../../engine/types.ts";
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
export const FLASH_TIME = 0.7;
const FLASH_FRAME = 0.1;

/** Width of a region wall, in pixels. */
const GRIDEXTRA = 1;
/** The `NARROW_BORDERS` arm — the web build defines it, so the grid's outer
 * outline is drawn *inside* the border area rather than a half-tile margin
 * (docs/games/rendering.md § "Sizing": check the define, don't port the desktop default). */
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
/** Fork additions: the explained hint's two marks (docs/games/hints.md § "Shade vs
 * ring"), the ring on the cell a step acts on and the outline of what it reasons
 * from. Both are drawn on a cell's edge rather than behind its notes. */
export const COL_HINT = 10;
export const COL_HINT_CELL = 11;
/** The highlight's wash, in both its full-cell and its corner form, and the
 * completion wave's dim beat. */
export const COL_CURSOR = 12;
/** The completion wave's bright beat. */
export const COL_FLASH = 13;

export function colors(background: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_CELL] = cellSurface(background);
  out[COL_GIVEN] = givenSurface(background);
  out[COL_GRID] = surfaceGrid(background);
  out[COL_FLASH] = FLASH;
  out[COL_BORDER] = INK;
  out[COL_NUM_FIXED] = INK;
  out[COL_NUM_GUESS] = playerEntryColor(background);
  out[COL_NUM_ERROR] = ERROR;
  out[COL_NUM_PENCIL] = pencilColor(background);
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
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
 * (docs/games/input.md § "The accreting-paint drag"; Sticks and Mathrax needed the same). */
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

/** The auto-sized pencil-mark grid — upstream's layout arithmetic verbatim,
 * integer division throughout. Bit `n − 1` is candidate `n`; bit `n` of `struck`
 * is a candidate the displayed hint rules out, drawn with a line through it. */
function drawPencilMarks(
  dr: GameDrawing,
  ts: number,
  cx: number,
  cy: number,
  marks: number,
  struck: number,
): void {
  let nhints = 0;
  for (let n = 0; n < 9; n++) if (marks & (1 << n)) nhints++;
  if (!nhints) return;

  let hw = 1;
  while (hw * hw < nhints) hw++;
  if (hw < 3) hw = 3;
  let hh = ((nhints + hw - 1) / hw) | 0;
  if (hh < 2) hh = 2;
  const hmax = Math.max(hw, hh);
  const fontsz = (ts / (((hmax * (11 - hmax)) / 8) | 0)) | 0;

  let j = 0;
  for (let n = 0; n < 9; n++) {
    if (!(marks & (1 << n))) continue;
    const hx = j % hw;
    const hy = (j / hw) | 0;
    const at = {
      x: cx + ((((4 * hx + 3) * ts) / (4 * hw + 2)) | 0),
      y: cy + ((((4 * hy + 3) * ts) / (4 * hh + 2)) | 0),
    };
    dr.drawText(at, glyphFont(fontsz), COL_NUM_PENCIL, String(n + 1));
    // The struck note keeps its own color, so it still reads as the player's
    // note; the line through it is what says the hint rules it out.
    if (struck & (1 << (n + 1))) {
      const r = Math.max(2, (fontsz / 3) | 0);
      dr.drawLine(
        { x: at.x - r, y: at.y },
        { x: at.x + r, y: at.y },
        COL_NUM_PENCIL,
        2,
      );
    }
    j++;
  }
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

  drawCellBackground(dr, { x: cx, y: cy, w: cw, h: ch }, highlight, COL_CURSOR, color);
  ds.hint.drawHatch(dr, i, { x: cx, y: cy, w: cw, h: ch }, COL_HINT, ts);

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
    drawPencilMarks(dr, ts, cx, cy, pencil[i], struck);
  } else {
    const ink =
      flags[i] & FM_FIXED
        ? COL_NUM_FIXED
        : flags[i] & FM_ERRORMASK
          ? COL_NUM_ERROR
          : COL_NUM_GUESS;
    dr.drawText(
      { x: tx + ((ts / 2) | 0), y: ty + ((ts / 2) | 0) },
      glyphFont((ts / 2) | 0),
      ink,
      String(grid[i]),
    );
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
  flashTime: number,
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

  // The completion flash runs a three-phase diagonal wave; the cursor is hidden
  // while it plays.
  const flash = flashTime > 0 ? Math.floor(flashTime / FLASH_FRAME) % 3 : -1;

  const index = (x: number, y: number): number => y * w + x;
  ds.wrong.packCells(mistakes ?? null, index);
  ds.hint.pack(stepMarks(hint), index, (m) => valueBit(m.n));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const highlight = flash === -1 ? cellHighlight(ui, x, y) : HIGHLIGHT_NONE;
      // The wave's three beats: the cell's own surface, a dim one, a bright one.
      const beat = flash === -1 ? 0 : (x + y + 3 - flash) % 3;
      const color =
        beat === 2
          ? COL_CURSOR
          : beat === 1
            ? COL_FLASH
            : state.flags[i] & FM_FIXED
              ? COL_GIVEN
              : COL_CELL;

      const tile =
        state.grid[i] |
        (state.pencil[i] << 4) |
        (state.flags[i] << 13) |
        (beat << 16) |
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
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_CELL,
  });

  const box = PENCIL_BOX(state.params, ts);
  repaintPencilIndicator(dr, ds, ui.pencilMode, box, PENCIL_STYLE);
}
