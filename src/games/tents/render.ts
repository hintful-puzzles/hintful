/**
 * Tents rendering — `game_redraw` / `draw_tile` / `find_errors` from tents.c.
 * Non-blank tiles are grass-filled; trees draw a trunk + leaf circles, tents a
 * triangle; the edge numbers sit on the bottom (columns) and right (rows)
 * borders. Live error highlighting (adjacency diamonds, over/under-committed
 * numbers, over-committed tent/tree groups via two `dsf` passes) is computed
 * each frame over a drag-transformed grid, which is why it lives here and not
 * in state.
 *
 * Geometry is upstream's web build (`NARROW_BORDERS`): a 1px top/left border,
 * and `TS + 2` bottom/right to hold the numbers.
 *
 * The per-tile cache packs the square value plus every error / cursor / flash
 * / mistake overlay bit and the square's link into one `Int32Array` word, and
 * the hint's rings, outlines, hatch and link into a second, so the diff key
 * covers every overlay (docs/games/rendering.md § "Overlay sidecars"). Edge
 * numbers diff a parallel key of their error flag and hatch.
 */

import {
  BROWN,
  GREEN,
  GREEN_WASH,
  ORANGE,
  RED_BOLD,
} from "../../engine/color/colors.ts";
import {
  ERROR,
  ERROR_TEXT,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
} from "../../engine/color/palette.ts";
import { drawThickRectOutline } from "../../engine/draw.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import {
  type HintMarkStyle,
  HintMarks,
  type MarkBand,
  type MarkCell,
  MarkOutlines,
} from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { LEFT_BUTTON } from "../../engine/pointer.ts";
import type { Color, Size } from "../../engine/types.ts";
import { LINK, NUMBER } from "./hint-marks.ts";
import {
  BLANK,
  canJoin,
  D,
  DX,
  DY,
  executeMove,
  FLIP,
  L,
  N,
  NONTENT,
  partnerOf,
  R,
  TENT,
  type TentsMistake,
  type TentsMove,
  type TentsParams,
  type TentsState,
  type TentsUi,
  TREE,
  U,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_TIME = 0.3;

// --- palette (the tents.c color enum, index for index) -------------------
export const COL_BACKGROUND = 0;
export const COL_GRID = 1;
export const COL_GRASS = 2;
export const COL_TREETRUNK = 3;
export const COL_TREELEAF = 4;
export const COL_TENT = 5;
export const COL_ERROR = 6;
export const COL_ERRTEXT = 7;
export const COL_ERRTRUNK = 8;
// The findMistakes overlay, appended past upstream's enum.
export const COL_MISTAKE = 9;
/** The hint's action color: the ring round what a step decides, the link it
 * asks for, and the clue it counts with. */
export const COL_HINT = 10;
/** The hint's evidence outline. */
export const COL_HINT_CELL = 11;
/** A link between a tent and its tree: the ink of the grid and the clues, the
 * color of the player's own notation. */
const COL_LINK = COL_GRID;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = INK;
  out[COL_GRASS] = GREEN_WASH;
  out[COL_TREETRUNK] = BROWN;
  out[COL_TREELEAF] = GREEN;
  out[COL_TENT] = ORANGE;
  out[COL_ERROR] = ERROR;
  out[COL_ERRTEXT] = ERROR_TEXT;
  out[COL_ERRTRUNK] = RED_BOLD;
  out[COL_MISTAKE] = ERROR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

// --- packed tile word: v in the low nibble, error and overlay bits above ---
const ERR_ADJ_TOPLEFT = 1 << 4;
const ERR_ADJ_TOP = 1 << 5;
const ERR_ADJ_TOPRIGHT = 1 << 6;
const ERR_ADJ_LEFT = 1 << 7;
const ERR_ADJ_RIGHT = 1 << 8;
const ERR_ADJ_BOTLEFT = 1 << 9;
const ERR_ADJ_BOT = 1 << 10;
const ERR_ADJ_BOTRIGHT = 1 << 11;
const ERR_OVERCOMMITTED = 1 << 12;
const CURSOR_BIT = 1 << 13;
const FLASH_BIT = 1 << 14;
const MISTAKE_BIT = 1 << 15;
/** The direction of the square's link, `N` for none. */
const LINK_SHIFT = 16;
const LINK_MASK = 7 << LINK_SHIFT;
/** The link is one no pairing of the solution holds. */
const LINK_MISTAKE_BIT = 1 << 19;
/** The keyboard has armed a link from this square (the cursor's). */
const ARMED_BIT = 1 << 20;

// --- the hint's word, a second cache key per tile ---------------------------
// The ring and outline sides (`MarkOutlines.packed`) in the low byte.
/** The square lies on the line the step's sentence names. */
const HINT_LINE_BIT = 1 << 8;
/** The direction of the link the step asks for from this square. */
const HINT_LINK_SHIFT = 9;

// --- geometry (NARROW_BORDERS) --------------------------------------------
/** The board's pixel origin. Exported so `interpretMove` reads the same number
 * the painter does ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export const TLBORDER = 1;
const brBorder = (ts: number) => ts + 2;
const coord = (n: number, ts: number) => n * ts + TLBORDER;

export function computeSize(p: TentsParams, ts: number): Size {
  return {
    w: TLBORDER + brBorder(ts) + ts * p.w,
    h: TLBORDER + brBorder(ts) + ts * p.h,
  };
}

// --- draw state -----------------------------------------------------------

export interface TentsDrawState {
  started: boolean;
  tileSize: number;
  /** Last-drawn packed word per tile; -1 forces a draw. */
  drawn: Int32Array;
  /** Last-drawn hint word per tile, the second half of the key. */
  hintDrawn: Int32Array;
  /** Last-drawn key per edge number (its error flag, hatch and hint color);
   * -1 forces a draw. */
  numbersDrawn: Int32Array;
  /** The hint's rings and outlines, painted after the tile loop. */
  marks: HintMarks;
}

export function newDrawState(state: TentsState, tileSize: number): TentsDrawState {
  return {
    started: false,
    tileSize,
    drawn: new Int32Array(state.w * state.h).fill(-1),
    hintDrawn: new Int32Array(state.w * state.h).fill(-1),
    numbersDrawn: new Int32Array(state.w + state.h).fill(-1),
    marks: new HintMarks(),
  };
}

// --- live error analysis (upstream find_errors) ---------------------------

export interface TentsErrors {
  /** Per-cell error bitmask (ERR_ADJ_* / ERR_OVERCOMMITTED bits). */
  cell: Int32Array;
  /** Per-edge-number error flag (0/1), columns then rows. */
  num: Uint8Array;
}

export function findErrors(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
): TentsErrors {
  const cell = new Int32Array(w * h);
  const num = new Uint8Array(w + h);

  // Tent-adjacency violations: a diamond on the shared edge or corner.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (
        y + 1 < h &&
        x + 1 < w &&
        ((grid[i] === TENT && grid[i + w + 1] === TENT) ||
          (grid[i + w] === TENT && grid[i + 1] === TENT))
      ) {
        cell[i] |= ERR_ADJ_BOTRIGHT;
        cell[i + w] |= ERR_ADJ_TOPRIGHT;
        cell[i + 1] |= ERR_ADJ_BOTLEFT;
        cell[i + w + 1] |= ERR_ADJ_TOPLEFT;
      }
      if (y + 1 < h && grid[i] === TENT && grid[i + w] === TENT) {
        cell[i] |= ERR_ADJ_BOT;
        cell[i + w] |= ERR_ADJ_TOP;
      }
      if (x + 1 < w && grid[i] === TENT && grid[i + 1] === TENT) {
        cell[i] |= ERR_ADJ_RIGHT;
        cell[i + 1] |= ERR_ADJ_LEFT;
      }
    }
  }

  // Numeric-clue violations: too many tents, or too few squares left for them.
  const tents = new Int32Array(w + h);
  const maybe = new Int32Array(w + h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = grid[y * w + x];
      if (v !== TENT && v !== BLANK) continue;
      const counts = v === TENT ? tents : maybe;
      counts[x]++;
      counts[w + y]++;
    }
  }
  for (let i = 0; i < w + h; i++) {
    num[i] = tents[i] > numbers[i] || tents[i] + maybe[i] < numbers[i] ? 1 : 0;
  }

  // Per cell, the trees minus the `partner` squares in its component, where a
  // component joins each tree to its orthogonally adjacent partners.
  const balance = (partner: (v: number) => boolean): ((i: number) => number) => {
    const linked = (a: number, b: number) =>
      (grid[a] === TREE && partner(grid[b])) || (partner(grid[a]) && grid[b] === TREE);
    const dsf = new Dsf(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (x + 1 < w && linked(i, i + 1)) dsf.merge(i, i + 1);
        if (y + 1 < h && linked(i, i + w)) dsf.merge(i, i + w);
      }
    }
    const sum = new Int32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      if (grid[i] === TREE) sum[dsf.canonify(i)]++;
      else if (partner(grid[i])) sum[dsf.canonify(i)]--;
    }
    return (i) => sum[dsf.canonify(i)];
  };
  // A group of tents with too few trees flags every tent in it. A group of
  // trees with too few tents flags its trees, counting a blank as a potential
  // tent, so a tree is flagged only when there is no room left for its tents.
  const tentBalance = balance((v) => v === TENT);
  const treeBalance = balance((v) => v === TENT || v === BLANK);
  for (let i = 0; i < w * h; i++) {
    if (grid[i] === TENT && tentBalance(i) < 0) cell[i] |= ERR_OVERCOMMITTED;
    if (grid[i] === TREE && treeBalance(i) > 0) cell[i] |= ERR_OVERCOMMITTED;
  }

  return { cell, num };
}

// --- drag transform (upstream drag_xform) ---------------------------------

/** The direction from one square to its orthogonal neighbor, or `N`. */
export function dirTo(dx: number, dy: number): number {
  if (dy === 0 && dx === 1) return R;
  if (dy === 0 && dx === -1) return L;
  if (dx === 0 && dy === 1) return D;
  if (dx === 0 && dy === -1) return U;
  return N;
}

/** A left drag between a tree and the tent or open square beside it, either
 * way, is the link gesture: the move it makes on release, or `null` for any
 * other drag. It places the tent when the square is open, and parts the two
 * when they are already joined. */
export function dragLink(
  ui: TentsUi,
  state: Pick<TentsState, "w" | "grid" | "links">,
): Extract<TentsMove, { type: "link" }> | null {
  const { live, sx, sy, ex, ey } = ui.drag;
  if (!live || ui.dragButton !== LEFT_BUTTON) return null;
  const d = dirTo(ex - sx, ey - sy);
  const { w, grid, links } = state;
  if (d === N || !canJoin(grid, sy * w + sx, ey * w + ex)) return null;
  return { type: "link", x: sx, y: sy, d, on: links[sy * w + sx] !== d };
}

/** Apply an in-progress drag's effect to cell `(x, y)`, for the live preview,
 * the error feedback and the move a release makes. `dragButton` is the left or
 * the right button. Upstream's stylus branches are absent: the pointer model
 * delivers no `MOD_STYLUS`. */
export function dragXform(
  ui: TentsUi,
  state: Pick<TentsState, "w" | "grid" | "links">,
  x: number,
  y: number,
): number {
  const v = state.grid[y * state.w + x];
  if (v === TREE) return v; // trees are inviolate
  const { sx, sy, ex, ey } = ui.drag;
  if (ui.dragButton === LEFT_BUTTON) {
    // Left-dragging acts as a click at the drag start, unless it is the link
    // gesture, which changes only an open square it joins, to a tent.
    const link = dragLink(ui, state);
    if (link)
      return link.on &&
        v === BLANK &&
        ((x === sx && y === sy) || (x === ex && y === ey))
        ? TENT
        : v;
    if (x !== sx || y !== sy) return v;
    return v === BLANK ? TENT : BLANK;
  }
  // The right button: a click toggles a non-tent, a drag paints blanks.
  if (x < Math.min(sx, ex) || x > Math.max(sx, ex)) return v;
  if (y < Math.min(sy, ey) || y > Math.max(sy, ey)) return v;
  if (sx === ex && sy === ey) return v === BLANK ? NONTENT : BLANK;
  return v === BLANK ? NONTENT : v;
}

// --- tile drawing ----------------------------------------------------------

function drawErrAdj(dr: GameDrawing, ts: number, x: number, y: number): void {
  const d = Math.floor((ts * 2) / 5);
  dr.drawPolygon(
    [
      { x: x - d, y },
      { x, y: y - d },
      { x: x + d, y },
      { x, y: y + d },
    ],
    COL_ERROR,
    COL_GRID,
  );
  // An exclamation mark, drawn by hand (draw_text looked off-center upstream).
  const xext = Math.floor(ts / 16);
  const yext = Math.floor((ts * 2) / 5) - (xext * 2 + 2);
  dr.drawRect(
    { x: x - xext, y: y - yext, w: xext * 2 + 1, h: yext * 2 + 1 - xext * 3 },
    COL_ERRTEXT,
  );
  dr.drawRect(
    { x: x - xext, y: y + yext - xext * 2 + 1, w: xext * 2 + 1, h: xext * 2 },
    COL_ERRTEXT,
  );
}

/**
 * This square's half of a link toward `d`: a thin line from the shared edge a
 * quarter of the way in, so the neighbor's half completes it across the grid
 * line. Thin and in ink, it reads as a mark the player made; a bar in the
 * trunk's brown read as more trunk when the link ran up or down through a tree.
 */
function drawLinkHalf(
  dr: GameDrawing,
  ts: number,
  tx: number,
  ty: number,
  d: number,
  color: number,
): void {
  const th = Math.max(2, Math.floor(ts / 14));
  const len = Math.floor(ts / 4) + 1;
  const mid = Math.floor(ts / 2) - Math.floor(th / 2);
  if (d === L) dr.drawRect({ x: tx, y: ty + mid, w: len, h: th }, color);
  else if (d === R)
    dr.drawRect({ x: tx + ts - len, y: ty + mid, w: len, h: th }, color);
  else if (d === U) dr.drawRect({ x: tx + mid, y: ty, w: th, h: len }, color);
  else if (d === D)
    dr.drawRect({ x: tx + mid, y: ty + ts - len, w: th, h: len }, color);
}

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  packed: number,
  hintWord: number,
  cur: boolean,
): void {
  const err = packed & ~15;
  const v = packed & 15;
  const tx = coord(x, ts);
  const ty = coord(y, ts);
  const cx = tx + Math.floor(ts / 2);
  const cy = ty + Math.floor(ts / 2);

  dr.clip({ x: tx, y: ty, w: ts, h: ts });

  dr.drawRect({ x: tx, y: ty, w: ts, h: ts }, COL_GRID);
  dr.drawRect(
    { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 },
    v === BLANK ? COL_BACKGROUND : COL_GRASS,
  );
  // The line the hint's sentence names, under the content so it stays whole.
  if (hintWord & HINT_LINE_BIT) {
    dr.drawHatch(
      { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 },
      COL_HINT,
      hatchPeriod(ts),
    );
  }

  const over = (err & ERR_OVERCOMMITTED) !== 0;
  if (v === TREE) {
    dr.drawRect(
      {
        x: cx - Math.floor(ts / 15),
        y: ty + Math.floor((ts * 3) / 10),
        w: 2 * Math.floor(ts / 15) + 1,
        h: Math.floor((ts * 9) / 10) - Math.floor((ts * 3) / 10),
      },
      over ? COL_ERRTRUNK : COL_TREETRUNK,
    );
    const col = over ? COL_ERROR : COL_TREELEAF;
    const leaf = (dx: number, dy: number, r: number) =>
      dr.drawCircle({ x: cx + dx, y: ty + dy }, r, col, col);
    leaf(0, Math.floor((ts * 4) / 10), Math.floor(ts / 4));
    const r = Math.floor(ts / 8);
    leaf(Math.floor(ts / 5), Math.floor(ts / 4), r);
    leaf(-Math.floor(ts / 5), Math.floor(ts / 4), r);
    leaf(Math.floor(ts / 4), Math.floor((ts * 6) / 13), r);
    leaf(-Math.floor(ts / 4), Math.floor((ts * 6) / 13), r);
  } else if (v === TENT) {
    const t = Math.floor(ts / 3);
    const col = over ? COL_ERROR : COL_TENT;
    dr.drawPolygon(
      [
        { x: cx - t, y: cy + t },
        { x: cx + t, y: cy + t },
        { x: cx, y: cy - t },
      ],
      col,
      col,
    );
  }

  const link = (packed & LINK_MASK) >> LINK_SHIFT;
  if (link !== N) {
    drawLinkHalf(
      dr,
      ts,
      tx,
      ty,
      link,
      packed & LINK_MISTAKE_BIT ? COL_MISTAKE : COL_LINK,
    );
  }
  const hintLink = hintWord >> HINT_LINK_SHIFT;
  if (hintLink !== N) drawLinkHalf(dr, ts, tx, ty, hintLink, COL_HINT);

  const half = Math.floor(ts / 2);
  if (err & ERR_ADJ_TOPLEFT) drawErrAdj(dr, ts, tx, ty);
  if (err & ERR_ADJ_TOP) drawErrAdj(dr, ts, tx + half, ty);
  if (err & ERR_ADJ_TOPRIGHT) drawErrAdj(dr, ts, tx + ts, ty);
  if (err & ERR_ADJ_LEFT) drawErrAdj(dr, ts, tx, ty + half);
  if (err & ERR_ADJ_RIGHT) drawErrAdj(dr, ts, tx + ts, ty + half);
  if (err & ERR_ADJ_BOTLEFT) drawErrAdj(dr, ts, tx, ty + ts);
  if (err & ERR_ADJ_BOT) drawErrAdj(dr, ts, tx + half, ty + ts);
  if (err & ERR_ADJ_BOTRIGHT) drawErrAdj(dr, ts, tx + ts, ty + ts);

  // The findMistakes overlay: an inset red outline (distinct from the live
  // error red on trunk/leaf/tent).
  if (packed & MISTAKE_BIT) {
    const thick = Math.max(1, Math.floor(ts / 16));
    const inset = Math.max(2, Math.floor(ts / 8));
    const span = ts - 2 * inset;
    drawThickRectOutline(dr, tx + inset, ty + inset, span, span, thick, COL_MISTAKE);
  }

  if (cur) {
    // A stroked outline, heavier while `L` has armed a link from this square.
    const coff = Math.floor(ts / 8);
    const span = ts - coff * 2 + 1;
    const thick = packed & ARMED_BIT ? Math.max(2, Math.floor(ts / 12)) : 1;
    drawThickRectOutline(dr, tx + coff, ty + coff, span, span, thick, COL_GRID);
  }

  dr.unclip();
  dr.drawUpdate({ x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 });
}

// --- redraw -----------------------------------------------------------------

/**
 * Where a hint mark sits round square `(x, y)`: inside its own box, over the
 * grid line it owns, so a square whose marks change repaints itself and takes
 * the old ones with it.
 */
function markBand(ts: number, x: number, y: number): MarkBand {
  return {
    box: { x: coord(x, ts), y: coord(y, ts), w: ts, h: ts },
    outer: 0,
    inner: Math.max(2, ts >> 4),
  };
}

export function redraw(
  dr: GameDrawing,
  ds: TentsDrawState,
  _prev: TentsState | null,
  state: TentsState,
  _dir: number,
  ui: TentsUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<TentsMove>,
  mistakes?: readonly TentsMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid, numbers } = state;

  if (!ds.started) {
    // The grid lines.
    for (let y = 0; y <= h; y++) {
      dr.drawLine(
        { x: coord(0, ts), y: coord(y, ts) },
        { x: coord(w, ts), y: coord(y, ts) },
        COL_GRID,
        1,
      );
    }
    for (let x = 0; x <= w; x++) {
      dr.drawLine(
        { x: coord(x, ts), y: coord(0, ts) },
        { x: coord(x, ts), y: coord(h, ts) },
        COL_GRID,
        1,
      );
    }
    ds.started = true;
  }

  const flashing = flashTime > 0 && Math.floor((flashTime * 3) / FLASH_TIME) !== 1;

  // Errors: transform only the drag's start cell (upstream — instant single-
  // click feedback without right-drag flicker).
  let errGrid = grid;
  // `drag.live`, not `dragButton >= 0`: the engine ends a live drag when the
  // board changes under it, and the preview must go with it — otherwise a
  // canceled drag keeps painting phantom cells until the player lets go.
  if (ui.drag.live) {
    const { sx, sy } = ui.drag;
    errGrid = Int8Array.from(grid);
    errGrid[sy * w + sx] = dragXform(ui, state, sx, sy);
  }
  const errors = findErrors(w, h, errGrid, numbers);

  // The links as drawn, with a link drag's result previewed.
  let links = state.links;
  const gesture = dragLink(ui, state);
  if (gesture) links = executeMove(state, gesture).links;

  const mistakeSet = new Set<number>();
  const badLinkSet = new Set<number>();
  for (const m of mistakes ?? []) {
    const i = m.y * w + m.x;
    if (m.kind !== "link") mistakeSet.add(i);
    else {
      // Both halves of the bar take the mistake color.
      badLinkSet.add(i);
      badLinkSet.add(partnerOf(w, state.links, i));
    }
  }

  const cx = ui.cursor.visible ? ui.cursor.x : -1;
  const cy = ui.cursor.visible ? ui.cursor.y : -1;

  // The hint: a ring round each square it decides (a link's two squares as one
  // shape), an outline round the squares it reasons from, the line its sentence
  // names hatched, and the link it asks for in its own color.
  const marks = stepMarks(hint);
  const cellsOf = (cells: readonly MarkCell[]): MarkCell[] =>
    [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
  const hintTargets = cellsOf(marks.of("ring", CELL));
  const area = cellsOf(marks.of("outline", CELL));
  const hintLinks = new Int8Array(w * h);
  for (const { sq, d } of marks.of("ring", LINK)) {
    hintLinks[sq] = d;
    hintLinks[sq + DY(d) * w + DX(d)] = FLIP(d);
  }
  const markStyle: HintMarkStyle = {
    band: (x, y) => markBand(ts, x, y),
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_CELL,
    joinTargets: (a, b) => hintLinks[a.y * w + a.x] === dirTo(b.x - a.x, b.y - a.y),
  };
  const outlines = new MarkOutlines(hintTargets, area, markStyle);
  const striped = new Set(marks.of("stripes", CELL).map((p) => p.y * w + p.x));
  const counted = new Set(marks.of("outline", NUMBER));
  const onLine = (x: number, y: number): boolean => striped.has(y * w + x);

  // Draw the grid squares whose packed word changed.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = ui.drag.live ? dragXform(ui, state, x, y) : grid[i];
      if (flashing && (v === TREE || v === TENT)) v = NONTENT;
      let packed = v | errors.cell[i];
      const isCur = x === cx && y === cy;
      if (isCur) packed |= CURSOR_BIT;
      if (isCur && ui.linkArmed) packed |= ARMED_BIT;
      if (flashing) packed |= FLASH_BIT;
      if (mistakeSet.has(i)) packed |= MISTAKE_BIT;
      if (!flashing) packed |= links[i] << LINK_SHIFT;
      if (badLinkSet.has(i)) packed |= LINK_MISTAKE_BIT;
      let hintWord = outlines.packed(x, y) | (hintLinks[i] << HINT_LINK_SHIFT);
      if (onLine(x, y)) hintWord |= HINT_LINE_BIT;
      if (ds.drawn[i] !== packed || ds.hintDrawn[i] !== hintWord) {
        drawTile(dr, ts, x, y, packed, hintWord, isCur);
        ds.drawn[i] = packed;
        ds.hintDrawn[i] = hintWord;
      }
    }
  }

  // After every tile, and every frame: `HintMarks.paint` always draws.
  ds.marks.paint(dr, hintTargets, area, markStyle);

  // Edge numbers. The clue a hint counts with takes the action color, and its
  // line's hatch runs on through the clue's slot.
  const numberSize = Math.floor(ts / 2);
  for (let k = 0; k < w + h; k++) {
    const hatched = counted.has(k);
    const color = errors.num[k] ? COL_ERROR : hatched ? COL_HINT : COL_GRID;
    const key = errors.num[k] | (hatched ? 2 : 0);
    if (ds.numbersDrawn[k] === key) continue;
    const column = k < w;
    const box = column
      ? { x: coord(k, ts), y: coord(h, ts) + 1, w: ts, h: brBorder(ts) - 1 }
      : { x: coord(w, ts) + 1, y: coord(k - w, ts), w: brBorder(ts) - 1, h: ts };
    dr.drawRect(box, COL_BACKGROUND);
    if (hatched) dr.drawHatch(box, COL_HINT, hatchPeriod(ts));
    dr.drawText(
      column
        ? { x: coord(k, ts) + Math.floor(ts / 2), y: coord(h + 1, ts) }
        : { x: coord(w + 1, ts), y: coord(k - w, ts) + Math.floor(ts / 2) },
      {
        align: column ? "center" : "right",
        baseline: column ? "alphabetic" : "mathematical",
        fontType: "variable",
        size: numberSize,
      },
      color,
      String(numbers[k]),
    );
    dr.drawUpdate(box);
    ds.numbersDrawn[k] = key;
  }
}
