/**
 * Ascent rendering: imperative `redraw` (upstream `game_redraw`).
 *
 * Display code is not byte-parity scope: the aim is upstream's look with clean
 * code. The per-tile diff cache mirrors upstream's `ds` arrays, with the
 * keyboard cursor folded into the cell repaint instead of a blitter (docs/games/rendering.md § "Overlay sidecars").
 * Moves are instant; the only motion is the completion flash.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { YELLOW_WASH } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  ERROR,
  GRID_DARK,
  givenSurface,
  HINT_ACTION,
  HINT_EVIDENCE,
  highlightWash,
  INK,
  playerEntryColor,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont, strokeScaledPolygon } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Rect } from "../../engine/types.ts";
import type { AscentHighlights } from "./hint.ts";
import { PATH, SQUARE } from "./hint-text.ts";
import {
  type AscentMistake,
  type AscentMove,
  type AscentState,
  CELL_MULTIPLE,
  FLAG_COMPLETE,
  FLAG_ERROR,
  FLAG_USER,
  findDirection,
  fromNumberEdge,
  isEdgeValid,
  isHexagonal,
  isNear,
  isNumberEdge,
  MODE_EDGES,
  MODE_HEXAGON,
  MODE_HONEYCOMB,
  movementForMode,
  NUMBER_BOUND,
  NUMBER_CLEAR,
  NUMBER_EMPTY,
  NUMBER_FLAG_MOVE,
  NUMBER_MOVE,
  NUMBER_WALL,
  numberEdge,
} from "./state.ts";
import {
  type AscentUi,
  keyboardCursor,
  mouseCursor,
  TARGET_SHOW,
  validatePathMove,
} from "./ui.ts";

// --- palette -------------------------------------------------------

export const COL_MIDLIGHT = 0; // the board, and the margin an edge number sits in
export const COL_LOWLIGHT = 1;
export const COL_HIGHLIGHT = 2;
/** Ink: a wall, and a number the puzzle fixed. */
export const COL_BORDER = 3;
/** The player's own: the number they placed and the line they drew. */
export const COL_LINE = 4;
/**
 * The path the board draws for itself between consecutive numbers. It runs
 * through plain cells and lifted ones, and has to carry across both: the
 * strong gray, dark on a light board and light on a dark one, where the grid
 * line's tone sank into a plain dark cell.
 */
export const COL_PATH = 5;
export const COL_ERROR = 6;
export const COL_CURSOR = 7;
export const COL_ARROW = 8;
/** The hint's action color: the ring round the square a step fills, and the
 * stripes along the arrow line it names. */
export const COL_HINT = 9;
/** The hint's evidence outline. */
export const COL_HINT_CELL = 10;
/** The surface of a cell the player fills. */
export const COL_CELL = 11;
/** The lifted surface under a number the puzzle fixed. */
export const COL_GIVEN = 12;
/** The line between two cells, and the ring round the disc under the first
 * and the last number. */
export const COL_GRID = 13;
/** The cell the player is holding, typing into or has selected: the
 * collection's "you are here" wash, which sinks below a plain cell and a
 * lifted one in both schemes. */
export const COL_HELD = 14;
export const NCOLORS = 15;

/** A cell's part in the displayed hint, one bit per mark: its diff key. */
const HINT_TARGET = 1;
const HINT_AREA = 2;
const HINT_HATCH = 4;
/** How far out from a cell's center its hint marks sit: clear of the border,
 * and of a number drawn in the middle. */
const HINT_MARK_SCALE = 0.84;

export const FLASH_FRAME = 0.03;
export const FLASH_SIZE = 4;
const ERROR_MARGIN = 0.1;

export interface AscentDrawState {
  started: boolean;
  tileSize: number;
  /** Physical grid dimensions and mode (from the state). */
  w: number;
  h: number;
  mode: number;
  /** User-facing dimensions (for `computeSize`). */
  userW: number;
  userH: number;
  offsetX: number;
  offsetY: number;
  thickness: number;
  pxW: number;
  pxH: number;

  /** Committed per-cell caches (mirroring upstream `ds`). */
  colors: Int32Array;
  oldnum: Int32Array;
  oldpath: Int32Array;
  path: Int32Array;
  prevhints: Int32Array;
  nexthints: Int32Array;
  oldpositions: Int32Array;
  oldmistake: Uint8Array;
  /** Each cell's `HINT_*` bits as last drawn. */
  oldhint: Uint8Array;
  /** Each cell's hint-route directions (`1 << dir`) as last drawn. */
  oldroute: Int32Array;
  oldcursor: number;
}

/** User-facing dimensions from a physical grid + mode (inverse of
 * `ascentGridSize`). */
function userDims(
  w: number,
  h: number,
  mode: number,
): { userW: number; userH: number } {
  if (mode === MODE_EDGES) return { userW: w - 2, userH: h - 2 };
  if (mode === MODE_HONEYCOMB)
    return { userW: w - (Math.trunc((h + 1) / 2) - 1), userH: h };
  return { userW: w, userH: h };
}

export function newAscentDrawState(
  state: AscentState,
  tileSize: number,
): AscentDrawState {
  const s = state.w * state.h;
  const { userW, userH } = userDims(state.w, state.h, state.mode);
  const px = ascentComputeSize(userW, userH, state.mode, tileSize);
  return {
    started: false,
    tileSize,
    w: state.w,
    h: state.h,
    mode: state.mode,
    userW,
    userH,
    offsetX: computeOffsetX(state.h, state.mode, tileSize),
    offsetY: 0,
    thickness: Math.max(2, tileSize / 7),
    pxW: px.w,
    pxH: px.h,
    colors: new Int32Array(s).fill(-1),
    oldnum: new Int32Array(s).fill(-0x7fff),
    oldpath: new Int32Array(s).fill(-1),
    path: new Int32Array(s),
    prevhints: new Int32Array(s).fill(-0x7fff),
    nexthints: new Int32Array(s).fill(-0x7fff),
    oldpositions: new Int32Array(s).fill(-3),
    oldmistake: new Uint8Array(s),
    oldhint: new Uint8Array(s),
    oldroute: new Int32Array(s),
    oldcursor: -1,
  };
}

// --- geometry and sizing -------------------------------------------
//
// Hexagon/Honeycomb are drawn as real pointy-top hexagons rather than
// upstream's offset squares: the movement table already gives six neighbors,
// so this is faithful to the rules and a clearer picture. With circumradius
// R = ts/√3 and row pitch ts·√3/2 the horizontal layout matches the square one
// (so `computeOffsetX` and the width are unchanged), and the six movement
// directions land on the six hexagon neighbors; only the vertical pitch, the
// cell outline and pixel→cell hit-testing differ.

/** Hexagon circumradius (center → vertex) for a given tile width. */
export function hexR(tileSize: number): number {
  return tileSize / Math.sqrt(3);
}
/** Vertical distance between adjacent hex rows. */
export function hexVpitch(tileSize: number): number {
  return (tileSize * Math.sqrt(3)) / 2;
}
/** Total pixel height of `h` hex rows (top vertex at y = 0). */
function hexPixelHeight(h: number, tileSize: number): number {
  return 2 * hexR(tileSize) + (h - 1) * hexVpitch(tileSize);
}

/** Upstream `game_compute_size` under `NARROW_BORDERS` (BORDER = 0), with
 * the hexagonal modes sized for real hexagons. */
export function ascentComputeSize(
  w: number,
  h: number,
  mode: number,
  tileSize: number,
): { w: number; h: number } {
  let x = w * tileSize;
  let y = h * tileSize;
  if (mode === MODE_HONEYCOMB) x += Math.trunc(tileSize / 2);
  else if (mode === MODE_EDGES) {
    x += tileSize * 2;
    y += tileSize * 2;
  }
  if (isHexagonal(mode)) y = Math.ceil(hexPixelHeight(h, tileSize));
  x += 1;
  y += 1;
  return { w: x, h: y };
}

/** Center of cell `i` in pixel space, branching on grid mode. */
export function cellCenter(
  i: number,
  w: number,
  mode: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
): { cx: number; cy: number } {
  const col = i % w;
  const row = Math.trunc(i / w);
  if (isHexagonal(mode)) {
    return {
      cx: offsetX + col * tileSize + row * (tileSize / 2) + tileSize / 2,
      cy: offsetY + hexR(tileSize) + row * hexVpitch(tileSize),
    };
  }
  return {
    cx: offsetX + col * tileSize + tileSize / 2,
    cy: offsetY + row * tileSize + tileSize / 2,
  };
}

/** The six pointy-top hexagon vertices around a center. */
function hexVertices(cx: number, cy: number, tileSize: number): Point[] {
  const r = hexR(tileSize);
  const hw = tileSize / 2; // R·√3/2
  const hr = r / 2;
  return [
    { x: cx, y: cy - r },
    { x: cx + hw, y: cy - hr },
    { x: cx + hw, y: cy + hr },
    { x: cx, y: cy + r },
    { x: cx - hw, y: cy + hr },
    { x: cx - hw, y: cy - hr },
  ];
}

/**
 * Rects wholly inside a pointy-top hexagon that between them cover most of it:
 * the full-width band between its two upright sides, and above and below it a
 * stack of strips, each as wide as the slanted sides allow at its narrow end.
 * A hatch drawn on them never reaches a neighboring cell, which the hexagon's
 * bounding rect would.
 */
function hexHatchRects(cx: number, cy: number, tileSize: number): Rect[] {
  const r = hexR(tileSize);
  const steps = 4;
  const h = r / 2 / steps;
  const out: Rect[] = [
    { x: cx - tileSize / 2 + 1, y: cy - r / 2, w: tileSize - 2, h: r },
  ];
  for (let j = 0; j < steps; j++) {
    // Strip `j` away from the band, whose far edge is `(j + 1) * h` out.
    const w = tileSize * (1 - ((j + 1) * h) / (r / 2)) - 2;
    if (w <= 0) continue;
    out.push({ x: cx - w / 2, y: cy - r / 2 - (j + 1) * h, w, h });
    out.push({ x: cx - w / 2, y: cy + r / 2 + j * h, w, h });
  }
  return out;
}

/** Upstream `game_set_offsets` under `NARROW_BORDERS` (BORDER = 0), where only
 * the hexagonal modes shift, and only horizontally. */
function computeOffsetX(h: number, mode: number, tileSize: number): number {
  let offsetX = 0;
  if (mode === MODE_HONEYCOMB) {
    offsetX -= (Math.trunc(h / 2) - 1) * tileSize;
    if (h & 1) offsetX -= tileSize;
  } else if (mode === MODE_HEXAGON) {
    offsetX -= Math.trunc(((h - 1) * tileSize) / 4);
  }
  return offsetX;
}

// --- colors -------------------------------------------------------

export function ascentColors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  const ret: Color[] = new Array(NCOLORS);
  ret[COL_MIDLIGHT] = background;
  ret[COL_HIGHLIGHT] = highlight;
  ret[COL_LOWLIGHT] = lowlight;
  ret[COL_BORDER] = INK;
  ret[COL_LINE] = playerEntryColor(background);
  ret[COL_PATH] = GRID_DARK;
  ret[COL_ERROR] = ERROR;
  ret[COL_CURSOR] = CURSOR;
  // Not `HELD`: the held cell is a fill under its number, which is the wash.
  ret[COL_HELD] = highlightWash(background);
  ret[COL_ARROW] = YELLOW_WASH;
  ret[COL_HINT] = HINT_ACTION;
  ret[COL_HINT_CELL] = HINT_EVIDENCE;
  ret[COL_CELL] = cellSurface(background);
  ret[COL_GIVEN] = givenSurface(background);
  ret[COL_GRID] = surfaceGrid(background);
  return ret;
}

// --- drawing primitives --------------------------------------------

function thickLine(
  dr: GameDrawing,
  thickness: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: number,
): void {
  dr.drawLine(
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    color,
    Math.max(1, Math.round(thickness)),
  );
}

/** The corners of a `size`-square with top-left `(x, y)`, clockwise. */
function squareCorners(x: number, y: number, size: number): Point[] {
  return [
    { x, y },
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
  ];
}

/** How much of each corner a square loses where the path may step diagonally:
 * the gap the four squares leave round a corner is where such a step crosses,
 * and it tells the board from one whose path keeps to the sides. */
function cornerCut(tileSize: number): number {
  return Math.max(2, Math.round(tileSize * 0.13));
}

/** The outline of a `size`-square with `cut` off each corner, clockwise: an
 * octagon, or the square itself at no cut. */
function cutSquare(x: number, y: number, size: number, cut: number): Point[] {
  if (cut === 0) return squareCorners(x, y, size);
  const far = size - cut;
  return [
    { x: x + cut, y },
    { x: x + far, y },
    { x: x + size, y: y + cut },
    { x: x + size, y: y + far },
    { x: x + far, y: y + size },
    { x: x + cut, y: y + size },
    { x, y: y + far },
    { x, y: y + cut },
  ];
}

/** The four triangles {@link cutSquare} takes off a square. */
function cutCorners(x: number, y: number, size: number, cut: number): Point[][] {
  return squareCorners(x, y, size).map((corner, k) => {
    const sx = k === 0 || k === 3 ? 1 : -1;
    const sy = k < 2 ? 1 : -1;
    return [
      corner,
      { x: corner.x + sx * cut, y: corner.y },
      { x: corner.x, y: corner.y + sy * cut },
    ];
  });
}

const HORIZONTAL_ARROW = [0.45, 0, 0.35, 0.45, -0.45, 0.45, -0.45, -0.45, 0.35, -0.45];
const DIAGONAL_ARROW = [-0.45, 0.3, -0.45, -0.45, 0.3, -0.45, 0.45, 0.45];

function drawArrow(
  dr: GameDrawing,
  i: number,
  w: number,
  h: number,
  tx: number,
  ty: number,
  fill: number,
  border: number,
  tileSize: number,
): void {
  const col = i % w;
  const row = Math.trunc(i / w);
  const pts: Point[] = [];

  if (row > 0 && row < h - 1) {
    const hdir = col ? -1 : +1;
    for (let k = 0; k < 10; k += 2)
      pts.push({
        x: HORIZONTAL_ARROW[k] * tileSize * hdir + 1 + tx,
        y: HORIZONTAL_ARROW[k + 1] * tileSize + 1 + ty,
      });
  } else if (col > 0 && col < w - 1) {
    const vdir = i > w ? -1 : +1;
    for (let k = 0; k < 10; k += 2)
      pts.push({
        x: HORIZONTAL_ARROW[k + 1] * tileSize + 1 + tx,
        y: HORIZONTAL_ARROW[k] * tileSize * vdir + 1 + ty,
      });
  } else {
    const hdir = col ? -1 : +1;
    const vdir = i > w ? -1 : +1;
    for (let k = 0; k < 8; k += 2)
      pts.push({
        x: DIAGONAL_ARROW[k] * tileSize * hdir + 1 + tx,
        y: DIAGONAL_ARROW[k + 1] * tileSize * vdir + 1 + ty,
      });
  }

  dr.drawPolygon(pts, fill, border);
}

/** The number/symbol to show at cell `i` (upstream `ascent_display_number`). */
function displayNumber(i: number, ui: AscentUi, state: AscentState): number {
  let n = state.grid[i];
  const w = state.w;
  const h = state.h;
  const movement = movementForMode(state.mode);

  if (n === NUMBER_BOUND || n === NUMBER_WALL) return n;

  if (ui.typingCell === i) return ui.typingNumber - 1;

  if (!isNumberEdge(ui.select) && ui.held >= 0 && validatePathMove(i, state, ui)) {
    if (n === NUMBER_EMPTY)
      n =
        ui.select >= 0 && ui.positions[ui.select] === -1
          ? ui.select
          : keyboardCursor(ui)
            ? NUMBER_MOVE
            : NUMBER_EMPTY;
    else if (keyboardCursor(ui)) n |= NUMBER_FLAG_MOVE;
  }

  if (
    n !== NUMBER_MOVE &&
    ui.nexthints[i] !== NUMBER_EMPTY &&
    ui.nexthints[i] !== n &&
    ui.prevhints[i] !== n
  )
    n = NUMBER_EMPTY;

  if (n === NUMBER_EMPTY && isNumberEdge(ui.select) && isEdgeValid(ui.held, i, w, h))
    n = numberEdge(ui.select);

  if (state.path && state.path[i] & (1 << findDirection(i, ui.held, w, movement))) {
    if (n === NUMBER_MOVE)
      n = ui.cursor.y * w + ui.cursor.x === i ? NUMBER_CLEAR : NUMBER_EMPTY;
    else if (n >= 0 && n & NUMBER_FLAG_MOVE && ui.cursor.y * w + ui.cursor.x === i)
      n = NUMBER_CLEAR;
    else if (n >= 0) n &= ~NUMBER_FLAG_MOVE;
  }

  return n;
}

// --- redraw --------------------------------------------------------

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one redraw covering five grid modes (square/hex/honeycomb variants) on a shared substrate.
export function redrawAscent(
  dr: GameDrawing,
  ds: AscentDrawState,
  _prev: AscentState | null,
  state: AscentState,
  _dir: number,
  ui: AscentUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<AscentMove, AscentHighlights>,
  mistakes?: readonly AscentMistake[],
): void {
  const w = state.w;
  const h = state.h;
  const tileSize = ds.tileSize;
  const positions = ui.positions;
  const movement = movementForMode(state.mode);
  const margin = tileSize * ERROR_MARGIN;

  const flash = flashTime > 0 ? Math.trunc(flashTime / FLASH_FRAME) : -2;

  const mistakeSet = new Uint8Array(w * h);
  if (mistakes) for (const m of mistakes) mistakeSet[m.cell] = 1;

  const hintMarks = new Uint8Array(w * h);
  const marks = stepMarks(hint);
  for (const i of marks.of("stripes", SQUARE)) hintMarks[i] |= HINT_HATCH;
  for (const i of marks.of("outline", SQUARE)) hintMarks[i] |= HINT_AREA;
  for (const i of marks.of("ring", SQUARE)) hintMarks[i] |= HINT_TARGET;
  // A whole run's route rings the squares it still has to fill; its placed
  // ends, and a number the player has placed along it since, carry the line only.
  const route = marks.of("ring", PATH);
  for (const i of route)
    if (state.grid[i] === NUMBER_EMPTY) hintMarks[i] |= HINT_TARGET;
  // Each route square: the directions it joins its neighbors on.
  const routeBits = new Int32Array(w * h);
  for (let k = 1; k < route.length; k++) {
    const [p, q] = [route[k - 1], route[k]];
    routeBits[p] |= 1 << findDirection(p, q, w, movement);
    routeBits[q] |= 1 << findDirection(q, p, w, movement);
  }

  if (!ds.started) {
    ds.started = true;
    ds.colors.fill(-1);
    ds.oldpath.fill(-1);
  }

  /* Build the render path for every cell. */
  for (let i = 0; i < w * h; i++) {
    let pathline = state.path ? state.path[i] : 0;
    let lines = 0;
    const n = state.grid[i];
    const single = n >= 0 && positions[n] !== CELL_MULTIPLE;

    if (single && n > 0 && positions[n - 1] >= 0) {
      const i2 = positions[n - 1];
      if (isNear(i, i2, w, state.mode))
        pathline |= 1 << findDirection(i, i2, w, movement);
      else pathline |= FLAG_ERROR;
      lines++;
    }
    if (single && n < state.last && positions[n + 1] >= 0) {
      const i2 = positions[n + 1];
      if (isNear(i, i2, w, state.mode))
        pathline |= 1 << findDirection(i, i2, w, movement);
      else pathline |= FLAG_ERROR;
      lines++;
    }
    if (n === 0 || n === state.last) lines++;
    if (lines === 2) pathline |= FLAG_COMPLETE;
    if (state.path && state.path[i] & ~FLAG_COMPLETE) pathline |= FLAG_USER;

    ds.path[i] = pathline;
  }

  /* Deliberate divergence: preview the connecting line for a *typed* number
   * (keyboard entry) before it is committed with Enter, so the link shows
   * immediately. Add reciprocal segments between the preview cell and each
   * placed consecutive neighbor it is genuinely adjacent to — only when
   * adjacent, so a real cell never flashes an error because of a preview. */
  const typingN = ui.typingCell >= 0 && ui.typingNumber > 0 ? ui.typingNumber - 1 : -1;
  if (typingN >= 0 && typingN <= state.last && positions[typingN] < 0) {
    const pc = ui.typingCell;
    for (const nb of [typingN - 1, typingN + 1]) {
      if (nb < 0 || nb > state.last) continue;
      const j = positions[nb];
      if (j < 0 || !isNear(pc, j, w, state.mode)) continue;
      ds.path[pc] |= 1 << findDirection(pc, j, w, movement);
      ds.path[j] |= 1 << findDirection(j, pc, w, movement);
    }
  }

  const oldNextTarget = ui.nextTargetMode & TARGET_SHOW ? ui.nextTarget : NUMBER_EMPTY;
  const oldPrevTarget = ui.prevTargetMode & TARGET_SHOW ? ui.prevTarget : NUMBER_EMPTY;
  const cursorCell = keyboardCursor(ui) ? ui.cursor.y * w + ui.cursor.x : -1;

  /* Invalidate cells whose contents/path/hints/overlays changed. */
  for (let i = 0; i < w * h; i++) {
    let dirty = false;
    const n = displayNumber(i, ui, state);

    if (ds.oldnum[i] !== n) {
      dirty = true;
      ds.oldnum[i] = n;
    }
    if (ds.oldpath[i] !== ds.path[i]) {
      dirty = true;
      for (let i2 = Math.max(0, i - (w + 1)); i2 < w * h && i2 < i + w + 1; i2++) {
        if (isNear(i, i2, w, state.mode)) ds.colors[i2] = -1;
      }
      ds.oldpath[i] = ds.path[i];
    }
    if (
      isNumberEdge(n) &&
      positions[fromNumberEdge(n)] !== ds.oldpositions[fromNumberEdge(n)]
    )
      dirty = true;
    if (ds.prevhints[i] !== ui.prevhints[i] || ds.nexthints[i] !== ui.nexthints[i]) {
      ds.prevhints[i] = ui.prevhints[i];
      ds.nexthints[i] = ui.nexthints[i];
      dirty = true;
    }
    if (ds.oldmistake[i] !== mistakeSet[i]) {
      ds.oldmistake[i] = mistakeSet[i];
      dirty = true;
    }
    if (ds.oldhint[i] !== hintMarks[i]) {
      ds.oldhint[i] = hintMarks[i];
      dirty = true;
    }
    if (ds.oldroute[i] !== routeBits[i]) {
      ds.oldroute[i] = routeBits[i];
      dirty = true;
    }
    if ((cursorCell === i) !== (ds.oldcursor === i)) dirty = true;

    if (dirty) ds.colors[i] = -1;
  }
  ds.oldcursor = cursorCell;

  for (let n = 0; n <= state.last; n++) {
    if (ds.oldpositions[n] !== positions[n]) {
      if (ds.oldpositions[n] >= 0) ds.colors[ds.oldpositions[n]] = -1;
      if (positions[n] >= 0) ds.colors[positions[n]] = -1;
      ds.oldpositions[n] = positions[n];
    }
  }

  /* Draw cells (hexagons for the hexagonal modes, squares otherwise). */
  const hex = isHexagonal(state.mode);
  const diagonal = movement.dirs.some((d) => d.dx !== 0 && d.dy !== 0);
  const cut = !hex && diagonal ? cornerCut(tileSize) : 0;
  const dirBit = (dx: number, dy: number): number =>
    1 << movement.dirs.findIndex((d) => d.dx === dx && d.dy === dy);
  /** What crosses the corner of cell `i` toward `(sx, sy)`: the hint's route,
   * the player's line or the board's path, in that order where two diagonals
   * cross there, and the board where none does. It reads the same from each of
   * the four cells round the corner. */
  const cornerInk = (i: number, sx: number, sy: number): number => {
    const col = i % w;
    const row = Math.trunc(i / w);
    if (col + sx < 0 || col + sx >= w || row + sy < 0 || row + sy >= h)
      return COL_MIDLIGHT;
    const beside = i + sx;
    const below = i + sy * w;
    const across = below + sx;
    const crossings = [
      { from: i, to: across, bit: dirBit(sx, sy), back: dirBit(-sx, -sy) },
      { from: beside, to: below, bit: dirBit(-sx, sy), back: dirBit(sx, -sy) },
    ];
    let ink = COL_MIDLIGHT;
    for (const { from, to, bit, back } of crossings) {
      if (routeBits[from] & bit) return COL_HINT;
      if (!(ds.path[from] & bit) && !(ds.path[to] & back)) continue;
      ink =
        (ds.path[from] | ds.path[to]) & FLAG_USER || ink === COL_LINE
          ? COL_LINE
          : COL_PATH;
    }
    return ink;
  };
  const r = hexR(tileSize);
  for (let i = 0; i < w * h; i++) {
    const { cx, cy } = cellCenter(i, w, state.mode, tileSize, ds.offsetX, ds.offsetY);
    const tx1 = Math.round(cx);
    const ty1 = Math.round(cy);
    const center = { x: tx1, y: ty1 };
    /* Top-left of a tile-sized box centered on the cell — used for the
     * square outline (non-hex) and for centered decorations. */
    const tx = Math.round(cx - tileSize / 2);
    const ty = Math.round(cy - tileSize / 2);
    let sn = state.grid[i];

    if (sn === NUMBER_BOUND) continue;

    const color =
      sn === NUMBER_WALL
        ? COL_BORDER
        : flash >= sn && flash <= sn + FLASH_SIZE
          ? COL_LOWLIGHT
          : ui.dragColumn === i % w || ui.dragRow === Math.trunc(i / w)
            ? COL_HIGHLIGHT
            : ui.held === i ||
                ui.typingCell === i ||
                (mouseCursor(ui) && ui.cursor.y * w + ui.cursor.x === i)
              ? COL_HELD
              : oldNextTarget >= 0 && positions[oldNextTarget] === i
                ? COL_HIGHLIGHT
                : oldPrevTarget >= 0 && positions[oldPrevTarget] === i
                  ? COL_HIGHLIGHT
                  : state.immutable[i]
                    ? COL_GIVEN
                    : COL_CELL;

    if (ds.colors[i] === color) continue;

    const fn = displayNumber(i, ui, state);
    sn = fn < 0 ? fn : fn & ~NUMBER_FLAG_MOVE;

    const fillColor = isNumberEdge(sn) ? COL_MIDLIGHT : color;
    if (hex) {
      /* Clip to the hexagon's bounding box (for drawUpdate); fill only the
       * hexagon itself so interlocking neighbors aren't erased. */
      const clip = {
        x: tx1 - Math.ceil(tileSize / 2) - 1,
        y: ty1 - Math.ceil(r) - 1,
        w: tileSize + 2,
        h: Math.ceil(2 * r) + 2,
      };
      dr.clip(clip);
      dr.drawUpdate(clip);
      const verts = hexVertices(cx, cy, tileSize);
      dr.drawPolygon(verts, fillColor, fillColor);
    } else {
      dr.clip({ x: tx, y: ty, w: tileSize + 1, h: tileSize + 1 });
      dr.drawUpdate({ x: tx, y: ty, w: tileSize + 1, h: tileSize + 1 });
      dr.drawRect(
        { x: tx + 1, y: ty + 1, w: tileSize - 1, h: tileSize - 1 },
        fillColor,
      );
    }
    ds.colors[i] = color;

    // The line or run's reach a hint names, under the content.
    if (hintMarks[i] & HINT_HATCH)
      for (const rect of hex
        ? hexHatchRects(cx, cy, tileSize)
        : [{ x: tx + 1, y: ty + 1, w: tileSize - 1, h: tileSize - 1 }])
        dr.drawHatch(rect, COL_HINT, hatchPeriod(tileSize));

    // The cut corners show the board, over the fill and the hatch and under
    // the lines that cross them.
    if (cut > 0 && !isNumberEdge(sn))
      for (const corner of cutCorners(tx, ty, tileSize, cut))
        dr.drawPolygon(corner, COL_MIDLIGHT, COL_MIDLIGHT);

    if (ui.typingCell !== i) {
      const linecolor = ds.path[i] & FLAG_USER ? COL_LINE : COL_PATH;

      if (!hex) {
        for (let dy = -1; dy <= 1; dy += 2) {
          const i2 = i + w * dy;
          if (i2 < 0 || i2 >= w * h) continue;
          const tx2 = (i2 % w) * tileSize + ds.offsetX + Math.trunc(tileSize / 2);
          const ty2 =
            Math.trunc(i2 / w) * tileSize + ds.offsetY + Math.trunc(tileSize / 2);
          for (let dir = 0; dir < movement.dircount; dir++) {
            if (!movement.dirs[dir].dy || !movement.dirs[dir].dx) continue;
            if (ds.path[i2] & (1 << dir))
              thickLine(
                dr,
                ds.thickness,
                tx2 + movement.dirs[dir].dx * tileSize,
                ty2 + movement.dirs[dir].dy * tileSize,
                tx2,
                ty2,
                ds.path[i2] & FLAG_USER ? COL_LINE : COL_PATH,
              );
          }
        }
      }

      /* Path lines to neighbors. In hex modes draw to the shared-edge
       * midpoint (= the midpoint of the two centers) so the line stays inside
       * this cell; the neighbor draws its own half. Square modes draw the
       * full segment and rely on the tile clip. */
      for (let dir = 0; dir < movement.dircount; dir++) {
        if (!(ds.path[i] & (1 << dir))) continue;
        const i2 = i + w * movement.dirs[dir].dy + movement.dirs[dir].dx;
        const nc = cellCenter(i2, w, state.mode, tileSize, ds.offsetX, ds.offsetY);
        const ex = hex ? (cx + nc.cx) / 2 : nc.cx;
        const ey = hex ? (cy + nc.cy) / 2 : nc.cy;
        thickLine(dr, ds.thickness, tx1, ty1, ex, ey, linecolor);
      }

      /* Circle on the beginning/end of the path, over the line into it, so
       * the number on it is read against the disc. */
      if (
        (sn === 0 || sn === state.last) &&
        (state.immutable[i] || positions[sn] !== CELL_MULTIPLE)
      ) {
        if (fn & NUMBER_FLAG_MOVE) {
          dr.drawCircle(center, tileSize * 0.4, COL_LOWLIGHT, COL_LOWLIGHT);
          dr.drawCircle(center, tileSize * 0.3, COL_HIGHLIGHT, COL_HIGHLIGHT);
        } else {
          // Ringed, so the disc is told from a lifted cell as from a plain one.
          dr.drawCircle(center, Math.trunc(tileSize / 3), COL_HIGHLIGHT, COL_GRID);
        }
      } else if (ds.path[i] & ~FLAG_COMPLETE) {
        dr.drawCircle(center, Math.trunc(ds.thickness / 2), linecolor, linecolor);
      }
    } else if (i === ui.typingCell) {
      /* The typing cell skips the block above (it shows the typed number on a
       * clean background), but still draws its half of any preview connecting
       * line so the link is visible while typing. */
      for (let dir = 0; dir < movement.dircount; dir++) {
        if (!(ds.path[i] & (1 << dir))) continue;
        const i2 = i + w * movement.dirs[dir].dy + movement.dirs[dir].dx;
        const nc = cellCenter(i2, w, state.mode, tileSize, ds.offsetX, ds.offsetY);
        const ex = hex ? (cx + nc.cx) / 2 : nc.cx;
        const ey = hex ? (cy + nc.cy) / 2 : nc.cy;
        thickLine(dr, ds.thickness, tx1, ty1, ex, ey, COL_PATH);
      }
    }

    /* A whole run's route, the game's own path line in the hint's color. Each
     * square draws to the midpoint toward each route neighbor, so the line
     * stays inside the square and its neighbor draws the other half. */
    for (let dir = 0; dir < movement.dircount; dir++) {
      if (!(routeBits[i] & (1 << dir))) continue;
      const j = i + w * movement.dirs[dir].dy + movement.dirs[dir].dx;
      const nc = cellCenter(j, w, state.mode, tileSize, ds.offsetX, ds.offsetY);
      thickLine(
        dr,
        ds.thickness,
        tx1,
        ty1,
        (cx + nc.cx) / 2,
        (cy + nc.cy) / 2,
        COL_HINT,
      );
    }

    /* Cell border. */
    if (!isNumberEdge(sn)) {
      const outline = hex
        ? hexVertices(cx, cy, tileSize)
        : cutSquare(tx, ty, tileSize, cut);
      dr.drawPolygon(outline, -1, COL_GRID);
    }

    // A corner's own pixel is in four tiles' clips, and two diagonal lines may
    // cross on it, so whichever tile was painted last would decide it. Every
    // tile leaves it what the board's state says, as a square's outline leaves
    // it the grid's.
    if (cut > 0)
      squareCorners(tx, ty, tileSize).forEach((corner, k) => {
        const sx = k === 1 || k === 2 ? 1 : -1;
        const sy = k >= 2 ? 1 : -1;
        dr.drawRect({ x: corner.x, y: corner.y, w: 1, h: 1 }, cornerInk(i, sx, sy));
      });

    /* Light circle on possible endpoints. */
    if (state.grid[i] === NUMBER_EMPTY && (sn === 0 || sn === state.last)) {
      dr.drawCircle(center, Math.trunc(tileSize / 3), color, COL_LOWLIGHT);
    }

    /* Background circle over lines so numbers stay readable: the player's
     * line and the board's own path alike. */
    if (sn > 0 && sn < state.last && ds.path[i] & ~FLAG_COMPLETE) {
      dr.drawCircle(center, Math.trunc(tileSize / 3), color, color);
      if (fn > 0 && fn & NUMBER_FLAG_MOVE)
        dr.drawCircle(center, tileSize * 0.22, COL_LOWLIGHT, COL_LOWLIGHT);
    } else if (sn > 0 && sn < state.last && fn & NUMBER_FLAG_MOVE) {
      dr.drawCircle(center, tileSize * 0.28, COL_LOWLIGHT, COL_LOWLIGHT);
    } else if (sn === NUMBER_MOVE) {
      dr.drawCircle(center, tileSize * 0.22, COL_LOWLIGHT, COL_LOWLIGHT);
    }

    if (sn === NUMBER_CLEAR) {
      const shape = Math.trunc(tileSize / 4);
      thickLine(
        dr,
        tileSize / 7,
        tx + shape,
        ty + shape,
        tx + tileSize - shape,
        ty + tileSize - shape,
        COL_LOWLIGHT,
      );
      thickLine(
        dr,
        tileSize / 7,
        tx + tileSize - shape,
        ty + shape,
        tx + shape,
        ty + tileSize - shape,
        COL_LOWLIGHT,
      );
    }

    /* Draw the number / edge arrow / candidate hints. */
    if (sn >= 0) {
      dr.drawText(
        center,
        glyphFont(Math.trunc(tileSize / 2)),
        state.immutable[i]
          ? COL_BORDER
          : state.grid[i] === NUMBER_EMPTY && ui.typingCell !== i
            ? COL_LOWLIGHT
            : sn <= state.last && positions[sn] === -2 && ui.typingCell !== i
              ? COL_ERROR
              : COL_LINE,
        String(sn + 1),
      );
      if (ds.path[i] & FLAG_ERROR)
        thickLine(
          dr,
          2,
          tx + margin,
          ty + margin,
          tx + tileSize - margin,
          ty + tileSize - margin,
          COL_ERROR,
        );
    } else if (isNumberEdge(sn)) {
      const i2 = positions[fromNumberEdge(sn)];
      const error = i2 >= 0 && !isEdgeValid(i, i2, w, h);
      drawArrow(dr, i, w, h, tx1, ty1, COL_ARROW, COL_BORDER, tileSize);
      dr.drawText(
        center,
        glyphFont(Math.trunc(tileSize / 2)),
        error ? COL_ERROR : i2 >= 0 ? COL_LOWLIGHT : COL_BORDER,
        String(fromNumberEdge(sn) + 1),
      );
    } else if (sn !== NUMBER_CLEAR) {
      if (ui.prevhints[i] >= 0)
        dr.drawText(
          { x: tx1 - Math.trunc(tileSize / 4), y: ty1 - Math.trunc(tileSize / 4) },
          glyphFont(Math.trunc(tileSize / 3)),
          COL_BORDER,
          String(ui.prevhints[i] + 1),
        );
      if (ui.nexthints[i] >= 0)
        dr.drawText(
          { x: tx1 + Math.trunc(tileSize / 4), y: ty1 + Math.trunc(tileSize / 4) },
          glyphFont(Math.trunc(tileSize / 3)),
          COL_BORDER,
          String(ui.nexthints[i] + 1),
        );
    }

    /* findMistakes overlay: an inset red outline. */
    if (mistakeSet[i]) {
      const m = Math.trunc(tileSize * 0.12);
      dr.drawPolygon(
        [
          { x: tx + m, y: ty + m },
          { x: tx + tileSize - m, y: ty + m },
          { x: tx + tileSize - m, y: ty + tileSize - m },
          { x: tx + m, y: ty + tileSize - m },
        ],
        -1,
        COL_ERROR,
      );
    }

    /* The hint's marks, inside the cell's own outline so they never sit on
     * its border: a ring round the square a step fills, an outline round what
     * it reasons from. */
    if (hintMarks[i] & (HINT_TARGET | HINT_AREA)) {
      const target = (hintMarks[i] & HINT_TARGET) !== 0;
      strokeScaledPolygon(
        dr,
        hex
          ? hexVertices(cx, cy, tileSize)
          : cutSquare(tx, ty, tileSize, isNumberEdge(sn) ? 0 : cut),
        center,
        HINT_MARK_SCALE,
        target ? COL_HINT : COL_HINT_CELL,
        Math.max(2, Math.round(tileSize / (target ? 14 : 20))),
      );
    }

    /* Keyboard cursor, folded into this cell's repaint (no blitter). */
    if (cursorCell === i) {
      const blr = Math.trunc(tileSize * 0.4);
      drawRectCorners(dr, tx1, ty1, blr - 1, COL_CURSOR);
    }

    dr.unclip();
  }
}
