/**
 * Rendering for Bridges, a port of upstream's packed-word draw model
 * (`bridges.c` game_redraw + draw_* helpers): each tile's cache entry is a
 * 28-bit descriptor that encodes not only the tile's own contents but the
 * bridge-stubs intruding from neighboring islands and the island-arcs
 * intruding from adjacent island tiles. The descriptor *is* the cache key, so
 * "redraw iff `newgrid[i] != grid[i]`" falls straight out.
 *
 * The mistake overlay recolors `findMistakes` wrong bridges with the existing
 * red `COL_WARNING` channel, which lives inside the cache key and therefore
 * repaints clean when the overlay clears.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import {
  cellSurface,
  ERROR_WASH,
  FLASH,
  FLASH_LEAD,
  GRID_MID,
  givenSurface,
  HELD,
  HINT_OUTLINE,
  highlightWash,
  INK,
} from "../../engine/color/palette.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { type RingClear, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect } from "../../engine/types.ts";
import { type Flash, sweepStep, WIN_LEAD, WIN_NONE } from "../../engine/win-wave.ts";
import type { BridgesHighlights } from "./hint.ts";
import { PIECE, SPAN } from "./hint-text.ts";
import { dragReleaseOps, executeMove } from "./moves.ts";
import type { BridgesSpan } from "./solver.ts";
import {
  type BridgesMistake,
  type BridgesMove,
  type BridgesParams,
  type BridgesState,
  type BridgesUi,
  G_ISLAND,
  G_LINEH,
  G_LINEV,
  G_MARK,
  G_MARKH,
  G_MARKV,
  G_NOLINEH,
  G_NOLINEV,
  G_WARN,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 24;

/** Web build defines NARROW_BORDERS: BORDER = TILE/8 + 1 (bridges.c line 93). */
export function border(tileSize: number): number {
  return Math.floor(tileSize / 8) + 1;
}

// --- Colors ---
export const COL_BACKGROUND = 0;
export const COL_FOREGROUND = 1;
/** What the win flash is on: an island's face, and a bridge's bars. */
export const COL_FLASH = 2;
export const COL_LOWLIGHT = 3;
export const COL_SELECTED = 4;
/** **Settled**: the face of an island marked completed, or whose count is
 * met, and the band under a bridge such a mark has locked. The lifted
 * surface, since a settled island is fixed as a given is. */
export const COL_MARK = 5;
/**
 * Upstream's `COL_HINT`, renamed. It is the bevel shade the "Show possible
 * bridge locations" preference draws a span in, and has nothing to do with the
 * hint system: it says *a bridge could go here*, not *this one must*.
 *
 * The rename is not tidying. `hint-mark.test.ts` finds each game's hint colors
 * by reading the `COL_HINT` export out of its own `render.ts`, so a game that
 * already owns that identifier for something else does not fail the guard, it
 * **silently redirects it** at a color no hint ever paints. That is
 * `docs/method.md` § "A scan that keys on a name" from the other end: the sweep keys
 * on a name and the name was taken.
 */
export const COL_POSSIBLE = 6;
export const COL_GRID = 7;
export const COL_WARNING = 8;
export const COL_CURSOR = 9;
/** The hint's evidence color: the islands and bridges the argument counts.
 * The span a step decides is ringed by the engine. */
export const COL_HINT_CELL = 10;
/** The face of an island that still has bridges to take: the quiet surface,
 * a step off the board, so a settled island's lift reads against it. */
export const COL_ISLAND = 11;
/** What the leading edge of the win flash is on. */
export const COL_FLASH_LEAD = 12;

// A tile's lead word: whether the win flash's leading edge, and not its body,
// is on the square itself and on each of its four neighbors. A tile draws
// parts of its neighbors (an island's circle spills over, a bridge's bars run
// into the island), and the draw word has one "lit" value and no bit to spare.
const LEAD_SELF = 1;
const LEAD_L = 2;
const LEAD_R = 4;
const LEAD_U = 8;
const LEAD_D = 16;
/** The flash slot for the part of a tile drawn from the square `bit` names. */
const flashSlot = (lead: number, bit: number): number =>
  lead & bit ? COL_FLASH_LEAD : COL_FLASH;

// --- Packed draw-word fields (bridges.c lines 2262-2297) ---
// Line data (6 bits per direction).
const DL_COUNTMASK = 0x07;
const DL_COUNT_CROSS = 0x06;
const DL_COUNT_POSSIBLE = 0x07;
const DL_COLMASK = 0x18;
const DL_COL_NORMAL = 0x00;
const DL_COL_WARNING = 0x08;
const DL_COL_FLASH = 0x10;
const DL_COL_SELECTED = 0x18;
const DL_LOCK = 0x20;
const DL_MASK = 0x3f;
// Island data (4 bits per direction).
const DI_COLMASK = 0x03;
const DI_COL_NORMAL = 0x00;
const DI_COL_FLASH = 0x01;
const DI_COL_WARNING = 0x02;
const DI_COL_SELECTED = 0x03;
const DI_BGMASK = 0x0c;
const DI_BG_NO_ISLAND = 0x00;
const DI_BG_NORMAL = 0x04;
const DI_BG_MARK = 0x08;
const DI_BG_CURSOR = 0x0c;
const DI_MASK = 0x0f;
// Shifts within an island square's word.
const D_I_ISLAND_SHIFT = 0;
const D_I_LINE_SHIFT_L = 4;
const D_I_LINE_SHIFT_R = 10;
const D_I_LINE_SHIFT_U = 16;
const D_I_LINE_SHIFT_D = 24;
// Shifts within a line square's word.
const D_L_ISLAND_SHIFT_L = 0;
const D_L_ISLAND_SHIFT_R = 4;
const D_L_ISLAND_SHIFT_U = 8;
const D_L_ISLAND_SHIFT_D = 12;
const D_L_LINE_SHIFT_H = 16;
const D_L_LINE_SHIFT_V = 22;
/**
 * The "at most" limit written on a span, set only on the span's middle square
 * (0 = none). Two bits suffice because a limit is below `maxb`, which is at
 * most 4. The top of the word: read it with `>>>`.
 */
const DLIM_MASK = 0x03;
const D_L_LIMIT_SHIFT_H = 28;
const D_L_LIMIT_SHIFT_V = 30;

// --- Hint draw flags -------------------------------------------------------
//
// A second `Int32Array` beside `grid`, compared in the same per-tile diff test:
// that is what puts the overlay in the tile cache's diff key, which is the
// whole of the bug class `hint-overlay.test.ts` guards
// (docs/rendering.md § "The tile cache and the diff key"). There is no
// room in the packed word — an island square already reaches bit 29 — and a
// lane of its own is what `engine/overlay-sidecar.ts` reaches for too.
//
// It mirrors the packed model's island/line duality because it has to: a hint
// that recolors an island's rim has to intrude into the four neighbor tiles
// exactly as the rim itself does, and a hinted bridge has to reach the
// half-stubs its endpoint islands draw.
/** Bridges the step wants this span to end up carrying (0 = not a target). */
const HL_COUNTMASK = 0x07;
/** The step draws the game's own no-line cross here. */
const HL_CROSS = 0x08;
/** The argument counts the bridge already here. */
const HL_CITED = 0x10;
/** The span is one the step decides, which its line squares ring. */
const HL_RING = 0x20;
const HL_MASK = 0x3f;
/** An island the step's words outline. */
const HI_CITED = 0x02;
const HI_MASK = 0x03;
// Shifts within an island square's hint word.
const H_I_ISLAND_SHIFT = 0;
const H_I_LINE_SHIFT_L = 2;
const H_I_LINE_SHIFT_R = 8;
const H_I_LINE_SHIFT_U = 14;
const H_I_LINE_SHIFT_D = 20;
// Shifts within a line square's hint word.
const H_L_ISLAND_SHIFT_L = 0;
const H_L_ISLAND_SHIFT_R = 2;
const H_L_ISLAND_SHIFT_U = 4;
const H_L_ISLAND_SHIFT_D = 6;
const H_L_LINE_SHIFT_H = 8;
const H_L_LINE_SHIFT_V = 14;
/** The limit the step writes, on the span's middle square as the board's is. */
const H_L_LIMIT_SHIFT_H = 20;
const H_L_LIMIT_SHIFT_V = 22;

export interface BridgesDrawState {
  tileSize: number;
  /** Per-cell packed draw descriptor from the last paint; -1 forces a redraw. */
  grid: Int32Array;
  /** Scratch descriptor grid for the current frame (avoids per-frame alloc). */
  newgrid: Int32Array;
  /** Per-cell hint word from the last paint; part of the diff key. */
  hint: Int32Array;
  /** Per-cell lead word from the last paint; part of the diff key. */
  lead: Uint8Array;
  /** Scratch for the current frame: whether the flash's lead is on each cell. */
  newlead: Uint8Array;
}

export function newDrawState(state: BridgesState, tileSize: number): BridgesDrawState {
  const n = state.w * state.h;
  return {
    tileSize,
    grid: new Int32Array(n).fill(-1),
    newgrid: new Int32Array(n),
    hint: new Int32Array(n).fill(-1),
    lead: new Uint8Array(n),
    newlead: new Uint8Array(n),
  };
}

export function computeSize(
  p: BridgesParams,
  tileSize: number,
): { w: number; h: number } {
  const b = border(tileSize);
  return { w: p.w * tileSize + 2 * b, h: p.h * tileSize + 2 * b };
}

export function colors(defaultBackground: Color): Color[] {
  const { background, lowlight } = mkhighlight(defaultBackground);
  return [
    background, // COL_BACKGROUND
    INK, // COL_FOREGROUND
    FLASH, // COL_FLASH
    lowlight, // COL_LOWLIGHT
    HELD, // COL_SELECTED
    givenSurface(background), // COL_MARK
    lowlight, // COL_POSSIBLE (= LOWLIGHT): the "possible bridge" bevel line
    GRID_MID, // COL_GRID
    ERROR_WASH, // COL_WARNING (also the mistake overlay color)
    // COL_CURSOR — not `CURSOR`: green is the island a bridge is being drawn
    // from, and the cursor *fills* the island under its clue digit, which is
    // the "you are here" wash Solo's family draws its cursor cell with.
    highlightWash(background),
    HINT_OUTLINE, // COL_HINT_CELL
    cellSurface(background), // COL_ISLAND
    FLASH_LEAD, // COL_FLASH_LEAD
  ];
}

// --- geometry helpers (all args positive, so integer division is trunc) ---
const div = (a: number, b: number): number => Math.trunc(a / b);
/** A grid cell's top-left pixel (bridges.c COORD). */
export const toCoord = (x: number, ts: number, b: number): number => x * ts + b;
const lineWidth = (ts: number): number => div(ts, 8);
const ts8 = (x: number, ts: number): number => div(x * ts, 8);
const offset = (thing: number, ts: number): number => div(ts, 2) - div(thing, 2);
const islandRadius = (ts: number): number => div(ts * 12, 20);
const islandNumsize = (clue: number, ts: number): number =>
  clue < 10 ? div(ts * 7, 10) : div(ts * 5, 10);

/** The square a span's limit is written on: its middle one, so the mark sits
 * between the two islands rather than against either. */
function middleOf(span: BridgesSpan): { x: number; y: number } {
  const dx = Math.sign(span.x2 - span.x1);
  const dy = Math.sign(span.y2 - span.y1);
  const k = div(Math.abs(span.x2 - span.x1) + Math.abs(span.y2 - span.y1), 2);
  return { x: span.x1 + k * dx, y: span.y1 + k * dy };
}

/** WITHIN(x,min,max) — inclusive, order-independent (bridges.c line 200). */
function within(x: number, a: number, b: number): boolean {
  return a > b ? x >= b && x <= a : x >= a && x <= b;
}

/** Is (sx,sy) on the straight span strictly between two islands in dir (dx,dy)? */
function betweenIsland(
  st: BridgesState,
  sx: number,
  sy: number,
  dx: number,
  dy: number,
): boolean {
  let x = sx - dx;
  let y = sy - dy;
  let found = false;
  while (st.inGrid(x, y)) {
    if (st.gridAt(x, y) & G_ISLAND) {
      found = true;
      break;
    }
    x -= dx;
    y -= dy;
  }
  if (!found) return false;
  x = sx + dx;
  y = sy + dy;
  while (st.inGrid(x, y)) {
    if (st.gridAt(x, y) & G_ISLAND) return true;
    x += dx;
    y += dy;
  }
  return false;
}

function linesLvlh(
  st: BridgesState,
  ui: BridgesUi,
  x: number,
  y: number,
  v: number,
): [number, number] {
  const c = st.idx(x, y);
  let lv = v & G_LINEV ? st.lines[c] : 0;
  let lh = v & G_LINEH ? st.lines[c] : 0;
  if (ui.showPossible) {
    if (betweenIsland(st, x, y, 0, 1) && !lv) lv = 1;
    if (betweenIsland(st, x, y, 1, 0) && !lh) lh = 1;
  }
  return [lv, lh];
}

// --- primitive drawing (bridges.c draw_cross/draw_general_line/…) ---

function drawCross(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  col: number,
): void {
  const off = ts8(2, ts);
  dr.drawLine({ x: ox, y: oy }, { x: ox + off, y: oy + off }, col, 1);
  dr.drawLine({ x: ox + off, y: oy }, { x: ox, y: oy + off }, col, 1);
}

/**
 * The "at most" mark: the limit as `≤n` on a patch of background, centered on
 * the span like a sign on a road. The patch is what keeps it legible over a
 * bridge already drawn through the square, which a span with a limit of one
 * or more may carry.
 */
function drawLimit(
  dr: GameDrawing,
  ts: number,
  cx: number,
  cy: number,
  limit: number,
  col: number,
): void {
  const w = div(ts * 3, 4);
  const h = div(ts, 2);
  dr.drawRect({ x: cx - div(w, 2), y: cy - div(h, 2), w, h }, COL_BACKGROUND);
  const { origin, options, text } = limitText(ts, cx, cy, limit);
  dr.drawText(origin, options, col, text);
}

/** Where a limit's text is drawn, which the mark and a hint's ring both read. */
function limitText(
  ts: number,
  cx: number,
  cy: number,
  limit: number,
): { origin: Point; options: DrawTextOptions; text: string } {
  return {
    origin: { x: cx, y: cy },
    options: glyphFont(div(ts * 2, 5)),
    text: `≤${limit}`,
  };
}

/**
 * The limits a line square writes, centered at (`cx`, `cy`) in pixels: the
 * step's in place of the board's on each span, each flagged `hinted`. A
 * square in the middle of both a limited row and a limited column is rare,
 * and there the two marks move apart so each stays readable.
 */
function limitsOf(
  ts: number,
  ox: number,
  oy: number,
  data: number,
  hint: number,
): { horizontal: boolean; limit: number; hinted: boolean; cx: number; cy: number }[] {
  const hlimHint = (hint >>> H_L_LIMIT_SHIFT_H) & DLIM_MASK;
  const vlimHint = (hint >>> H_L_LIMIT_SHIFT_V) & DLIM_MASK;
  const hlim = hlimHint || (data >>> D_L_LIMIT_SHIFT_H) & DLIM_MASK;
  const vlim = vlimHint || (data >>> D_L_LIMIT_SHIFT_V) & DLIM_MASK;
  const apart = hlim && vlim ? div(ts, 4) : 0;
  const half = div(ts, 2);
  const out = [];
  if (hlim)
    out.push({
      horizontal: true,
      limit: hlim,
      hinted: hlimHint !== 0,
      cx: ox + half,
      cy: oy + half - apart,
    });
  if (vlim)
    out.push({
      horizontal: false,
      limit: vlim,
      hinted: vlimHint !== 0,
      cx: ox + half - apart,
      cy: oy + half + apart,
    });
  return out;
}

/** The color a span's own marks take: the same choice the bars make. */
function lineColor(ldata: number, flashCol: number): number {
  switch (ldata & DL_COLMASK) {
    case DL_COL_SELECTED:
      return COL_SELECTED;
    case DL_COL_FLASH:
      return flashCol;
    case DL_COL_WARNING:
      return COL_WARNING;
    default:
      return COL_FOREGROUND;
  }
}

/**
 * Draw one direction of lines in a square. fx,fy is the 'forward' direction
 * (along the lines); ax,ay the 'across' direction. `which & 1` draws the white
 * locked-bridge backing; `which & 2` draws the bridges themselves (so two
 * overlapping locked bridges don't erase each other).
 *
 * `hdata` is this direction's hint word, and the hint borrows the shapes this
 * function already draws rather than inventing one
 * (docs/hints-marks.md § "Echo the move's shape in the hint color"): a span the
 * step wants bridged is drawn as the bundle it would become, with the bars the
 * step *adds* in `hintInk` over the ones already there; a span it wants
 * blocked takes the game's own pair of crosses in `hintInk`; and a bridge the
 * argument merely counts keeps its shape and takes `COL_HINT_CELL`. `hintInk`
 * is the ring's, inside the ring round the span, and null everywhere else,
 * where what the step adds is left out.
 */
function drawGeneralLine(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  fx: number,
  fy: number,
  ax: number,
  ay: number,
  len: number,
  ldata: number,
  which: number,
  hdata: number,
  flashCol: number,
  hintInk: number | null = null,
): void {
  const raw = ldata & DL_COUNTMASK;
  // A cross and a "possible bridge" bevel are both drawn *instead of* bridges,
  // so neither is a bar the hint has to leave in the board's own color.
  const placed = raw === DL_COUNT_CROSS || raw === DL_COUNT_POSSIBLE ? 0 : raw;
  const want = hdata & HL_COUNTMASK;
  const count = want > 0 ? want : raw;
  /** Bars from here on are the ones the step adds. */
  const hintFrom = want > 0 ? placed : -1;
  const fg =
    count === DL_COUNT_POSSIBLE
      ? COL_POSSIBLE
      : hdata & HL_CITED
        ? COL_HINT_CELL
        : (ldata & DL_COLMASK) === DL_COL_SELECTED
          ? COL_SELECTED
          : (ldata & DL_COLMASK) === DL_COL_FLASH
            ? flashCol
            : (ldata & DL_COLMASK) === DL_COL_WARNING
              ? COL_WARNING
              : COL_FOREGROUND;

  if (hdata & HL_CROSS) {
    // Drawn under `which & 2` only, so the pair lands once per tile like the
    // bridge bars rather than twice.
    if (which & 2 && hintInk !== null) {
      drawCross(
        dr,
        ts,
        ox + ts8(1, ts) * fx + ts8(3, ts) * ax,
        oy + ts8(1, ts) * fy + ts8(3, ts) * ay,
        hintInk,
      );
      drawCross(
        dr,
        ts,
        ox + ts8(5, ts) * fx + ts8(3, ts) * ax,
        oy + ts8(5, ts) * fy + ts8(3, ts) * ay,
        hintInk,
      );
    }
    return;
  }

  if (count === DL_COUNT_CROSS) {
    drawCross(
      dr,
      ts,
      ox + ts8(1, ts) * fx + ts8(3, ts) * ax,
      oy + ts8(1, ts) * fy + ts8(3, ts) * ay,
      fg,
    );
    drawCross(
      dr,
      ts,
      ox + ts8(5, ts) * fx + ts8(3, ts) * ax,
      oy + ts8(5, ts) * fy + ts8(3, ts) * ay,
      fg,
    );
  } else if (count !== 0) {
    const lh = count === DL_COUNT_POSSIBLE ? 1 : count;
    const lw = lineWidth(ts);
    let gw = lw;
    // Shrink the inter-bridge gap until the whole bundle fits the tile.
    let bw = lw * lh + gw * (lh + 1);
    while (bw > ts) {
      gw--;
      bw = lw * lh + gw * (lh + 1);
    }
    let loff = offset(bw, ts);
    if (which & 1) {
      if (ldata & DL_LOCK && fg !== COL_POSSIBLE) {
        dr.drawRect(
          {
            x: ox + loff * ax,
            y: oy + loff * ay,
            w: len * fx + bw * ax,
            h: len * fy + bw * ay,
          },
          COL_MARK,
        );
      }
    }
    if (which & 2) {
      for (let i = 0; i < lh; i++, loff += lw + gw) {
        const color = hintFrom >= 0 && i >= hintFrom ? hintInk : fg;
        if (color === null) continue;
        dr.drawRect(
          {
            x: ox + (loff + gw) * ax,
            y: oy + (loff + gw) * ay,
            w: len * fx + lw * ax,
            h: len * fy + lw * ay,
          },
          color,
        );
      }
    }
  }
}

function drawHline(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  w: number,
  vdata: number,
  which: number,
  hint: number,
  flashCol: number,
  hintInk: number | null = null,
): void {
  drawGeneralLine(dr, ts, ox, oy, 1, 0, 0, 1, w, vdata, which, hint, flashCol, hintInk);
}

function drawVline(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  h: number,
  vdata: number,
  which: number,
  hint: number,
  flashCol: number,
  hintInk: number | null = null,
): void {
  drawGeneralLine(dr, ts, ox, oy, 0, 1, 1, 0, h, vdata, which, hint, flashCol, hintInk);
}

/**
 * `ihint` recolors the island's own rim and clue digit, which is a **ring**
 * rather than a fill: `drawIsland` paints an annulus (an `fg` disc with a `bg`
 * disc on top), so the hint costs the island's mark and its background nothing.
 *
 * That is the game's own vocabulary again, and it is what the shared
 * `hint-mark.ts` band could not have given here: an island's circle has a
 * radius of `12/20` of the tile, so it is *wider than its own tile* and spills
 * into the four neighbors. A band on the tile's border box would cut across the
 * circle rather than outline anything.
 */
function drawIsland(
  dr: GameDrawing,
  ts: number,
  ox: number,
  oy: number,
  clue: number,
  idata: number,
  ihint: number,
  flashCol: number,
): void {
  if ((idata & DI_BGMASK) === DI_BG_NO_ISLAND) return;
  const half = div(ts, 2);
  const orad = islandRadius(ts);
  const irad = orad - lineWidth(ts);
  const fg =
    ihint & HI_CITED
      ? COL_HINT_CELL
      : (idata & DI_COLMASK) === DI_COL_SELECTED
        ? COL_SELECTED
        : (idata & DI_COLMASK) === DI_COL_WARNING
          ? COL_WARNING
          : COL_FOREGROUND;
  // The win flash fills the island's face, under its rim and its count.
  const bg =
    (idata & DI_COLMASK) === DI_COL_FLASH
      ? flashCol
      : (idata & DI_BGMASK) === DI_BG_CURSOR
        ? COL_CURSOR
        : (idata & DI_BGMASK) === DI_BG_MARK
          ? COL_MARK
          : COL_ISLAND;

  dr.drawCircle({ x: ox + half, y: oy + half }, orad, fg, fg);
  dr.drawCircle({ x: ox + half, y: oy + half }, irad, bg, bg);

  if (clue > 0) {
    const textcolor = fg === COL_SELECTED ? COL_FOREGROUND : fg;
    dr.drawText(
      { x: ox + half, y: oy + half },
      glyphFont(islandNumsize(clue, ts)),
      textcolor,
      String(clue),
    );
  }
}

function drawIslandTile(
  dr: GameDrawing,
  ts: number,
  b: number,
  x: number,
  y: number,
  clue: number,
  data: number,
  hint: number,
  lead: number,
): void {
  const ox = toCoord(x, ts, b);
  const oy = toCoord(y, ts, b);
  dr.clip({ x: ox, y: oy, w: ts, h: ts });
  dr.drawRect({ x: ox, y: oy, w: ts, h: ts }, COL_BACKGROUND);
  const half = div(ts, 2);
  for (const which of [1, 2]) {
    drawHline(
      dr,
      ts,
      ox,
      oy,
      half,
      (data >> D_I_LINE_SHIFT_L) & DL_MASK,
      which,
      (hint >> H_I_LINE_SHIFT_L) & HL_MASK,
      flashSlot(lead, LEAD_L),
    );
    drawHline(
      dr,
      ts,
      ox + ts - half,
      oy,
      half,
      (data >> D_I_LINE_SHIFT_R) & DL_MASK,
      which,
      (hint >> H_I_LINE_SHIFT_R) & HL_MASK,
      flashSlot(lead, LEAD_R),
    );
    drawVline(
      dr,
      ts,
      ox,
      oy,
      half,
      (data >> D_I_LINE_SHIFT_U) & DL_MASK,
      which,
      (hint >> H_I_LINE_SHIFT_U) & HL_MASK,
      flashSlot(lead, LEAD_U),
    );
    drawVline(
      dr,
      ts,
      ox,
      oy + ts - half,
      half,
      (data >> D_I_LINE_SHIFT_D) & DL_MASK,
      which,
      (hint >> H_I_LINE_SHIFT_D) & HL_MASK,
      flashSlot(lead, LEAD_D),
    );
  }
  drawIsland(
    dr,
    ts,
    ox,
    oy,
    clue,
    (data >> D_I_ISLAND_SHIFT) & DI_MASK,
    (hint >> H_I_ISLAND_SHIFT) & HI_MASK,
    flashSlot(lead, LEAD_SELF),
  );
  dr.unclip();
  dr.drawUpdate({ x: ox, y: oy, w: ts, h: ts });
}

/** Where the ring round a span goes (`GameDrawing.drawRing`). */
interface SpanRing {
  readonly box: Rect;
  readonly clear: RingClear;
  readonly room: Rect;
}

/**
 * The ring round the span through line square (`x`, `y`), horizontal or not:
 * a pill along its line squares, from one island's square to the other's,
 * which every one of them draws the same. It holds the limit the step writes
 * on the span and keeps off the board's limits on the squares it crosses,
 * read from this frame's words, `grid` and `hint`.
 */
function spanRing(
  s: BridgesState,
  ts: number,
  b: number,
  x: number,
  y: number,
  horizontal: boolean,
  grid: Int32Array,
  hint: Int32Array,
): SpanRing {
  const dx = horizontal ? 1 : 0;
  const dy = horizontal ? 0 : 1;
  const squares: { x: number; y: number }[] = [];
  for (let k = -1; ; k--) {
    if (s.gridAt(x + k * dx, y + k * dy) & G_ISLAND) break;
    squares.unshift({ x: x + k * dx, y: y + k * dy });
  }
  squares.push({ x, y });
  for (let k = 1; ; k++) {
    if (s.gridAt(x + k * dx, y + k * dy) & G_ISLAND) break;
    squares.push({ x: x + k * dx, y: y + k * dy });
  }
  const first = squares[0];
  const ox = toCoord(first.x, ts, b);
  const oy = toCoord(first.y, ts, b);
  const along = squares.length * ts;
  const room = { x: ox, y: oy, w: horizontal ? along : ts, h: horizontal ? ts : along };
  // Wide enough to hold a double bridge's bundle clear of the stroke.
  const across = div(ts * 7, 8);
  const inset = div(ts - across, 2);
  const box = horizontal
    ? { x: ox, y: oy + inset, w: along, h: across }
    : { x: ox + inset, y: oy, w: across, h: along };
  const enclose: Rect[] = [];
  const avoid: Rect[] = [];
  for (const sq of squares) {
    const c = s.idx(sq.x, sq.y);
    const sx = toCoord(sq.x, ts, b);
    const sy = toCoord(sq.y, ts, b);
    for (const l of limitsOf(ts, sx, sy, grid[c], hint[c])) {
      const { origin, options, text } = limitText(ts, l.cx, l.cy, l.limit);
      (l.hinted && l.horizontal === horizontal ? enclose : avoid).push(
        textBox(origin, options, text),
      );
    }
  }
  return { box, clear: { enclose, avoid }, room };
}

function drawLineTile(
  dr: GameDrawing,
  ts: number,
  b: number,
  x: number,
  y: number,
  data: number,
  hint: number,
  lead: number,
  ringOf: (horizontal: boolean) => SpanRing,
): void {
  const ox = toCoord(x, ts, b);
  const oy = toCoord(y, ts, b);
  const own = flashSlot(lead, LEAD_SELF);
  dr.clip({ x: ox, y: oy, w: ts, h: ts });
  dr.drawRect({ x: ox, y: oy, w: ts, h: ts }, COL_BACKGROUND);
  const hdata = (data >> D_L_LINE_SHIFT_H) & DL_MASK;
  const vdata = (data >> D_L_LINE_SHIFT_V) & DL_MASK;
  const hhint = (hint >> H_L_LINE_SHIFT_H) & HL_MASK;
  const vhint = (hint >> H_L_LINE_SHIFT_V) & HL_MASK;
  // Possible-bridge bevels at the bottom, then crosses, then bridges — a
  // straight compare of the count fields gives that order (DL_COUNTMASK
  // enumeration).
  if ((hdata & DL_COUNTMASK) > (vdata & DL_COUNTMASK)) {
    drawHline(dr, ts, ox, oy, ts, hdata, 3, hhint, own);
    drawVline(dr, ts, ox, oy, ts, vdata, 3, vhint, own);
  } else {
    drawVline(dr, ts, ox, oy, ts, vdata, 3, vhint, own);
    drawHline(dr, ts, ox, oy, ts, hdata, 3, hhint, own);
  }
  // Islands intruding from the four sides (no clue numbers).
  const ihint = (side: number): number => (hint >> side) & HI_MASK;
  drawIsland(
    dr,
    ts,
    ox - ts,
    oy,
    -1,
    (data >> D_L_ISLAND_SHIFT_L) & DI_MASK,
    ihint(H_L_ISLAND_SHIFT_L),
    flashSlot(lead, LEAD_L),
  );
  drawIsland(
    dr,
    ts,
    ox + ts,
    oy,
    -1,
    (data >> D_L_ISLAND_SHIFT_R) & DI_MASK,
    ihint(H_L_ISLAND_SHIFT_R),
    flashSlot(lead, LEAD_R),
  );
  drawIsland(
    dr,
    ts,
    ox,
    oy - ts,
    -1,
    (data >> D_L_ISLAND_SHIFT_U) & DI_MASK,
    ihint(H_L_ISLAND_SHIFT_U),
    flashSlot(lead, LEAD_U),
  );
  drawIsland(
    dr,
    ts,
    ox,
    oy + ts,
    -1,
    (data >> D_L_ISLAND_SHIFT_D) & DI_MASK,
    ihint(H_L_ISLAND_SHIFT_D),
    flashSlot(lead, LEAD_D),
  );
  // Last, so neither an island's rim nor a bridge bar covers it. The limit
  // the step writes is drawn inside its ring.
  const limits = limitsOf(ts, ox, oy, data, hint);
  for (const { horizontal, limit, hinted, cx, cy } of limits)
    if (!hinted)
      drawLimit(dr, ts, cx, cy, limit, lineColor(horizontal ? hdata : vdata, own));
  // The ring round a span the step decides, with what it decides inside:
  // the bars it adds, its crosses, or its limit. Every line square of the
  // span draws the one ring in its own clip.
  for (const horizontal of [true, false]) {
    const hl = horizontal ? hhint : vhint;
    if (!(hl & HL_RING)) continue;
    const { box, clear, room } = ringOf(horizontal);
    dr.drawRing(box, clear, Math.max(2, div(ts, 16)), {
      room,
      inside: (ink) => {
        if (horizontal) drawHline(dr, ts, ox, oy, ts, hdata, 2, hhint, own, ink);
        else drawVline(dr, ts, ox, oy, ts, vdata, 2, vhint, own, ink);
        for (const l of limits)
          if (l.hinted && l.horizontal === horizontal)
            drawLimit(dr, ts, l.cx, l.cy, l.limit, ink);
      },
    });
  }
  dr.unclip();
  dr.drawUpdate({ x: ox, y: oy, w: ts, h: ts });
}

function drawEdgeTile(
  dr: GameDrawing,
  ts: number,
  b: number,
  x: number,
  y: number,
  dx: number,
  dy: number,
  data: number,
  hint: number,
  lead: number,
): void {
  const ox = toCoord(x, ts, b);
  const oy = toCoord(y, ts, b);
  let cx = ox;
  let cy = oy;
  let cw = ts;
  let ch = ts;
  const half = div(ts, 2);
  if (dy) {
    if (dy > 0) cy += half;
    ch -= half;
  } else {
    if (dx > 0) cx += half;
    cw -= half;
  }
  dr.clip({ x: cx, y: cy, w: cw, h: ch });
  dr.drawRect({ x: cx, y: cy, w: cw, h: ch }, COL_BACKGROUND);
  drawIsland(
    dr,
    ts,
    ox + ts * dx,
    oy + ts * dy,
    -1,
    (data >> D_I_ISLAND_SHIFT) & DI_MASK,
    (hint >> H_I_ISLAND_SHIFT) & HI_MASK,
    flashSlot(lead, LEAD_SELF),
  );
  dr.unclip();
  dr.drawUpdate({ x: cx, y: cy, w: cw, h: ch });
}

/**
 * Build the mistake mask: a per-cell bit set for every line-square on a wrong
 * bridge span, plus the two endpoint island cells, and for every island marked
 * complete too soon, so they can be recolored red. Returns a `Uint8Array` (1 = mistake) sized w*h, or null when there are
 * no mistakes.
 */
function buildMistakeMask(
  st: BridgesState,
  mistakes: readonly BridgesMistake[],
): Uint8Array | null {
  if (mistakes.length === 0) return null;
  const mask = new Uint8Array(st.w * st.h);
  for (const m of mistakes) {
    if ("x" in m) {
      mask[st.idx(m.x, m.y)] = 1;
      continue;
    }
    mask[st.idx(m.x1, m.y1)] = 1;
    mask[st.idx(m.x2, m.y2)] = 1;
    const dx = Math.sign(m.x2 - m.x1);
    const dy = Math.sign(m.y2 - m.y1);
    let x = m.x1 + dx;
    let y = m.y1 + dy;
    while (x !== m.x2 || y !== m.y2) {
      mask[st.idx(x, y)] = 1;
      x += dx;
      y += dy;
    }
  }
  return mask;
}

/**
 * The per-cell hint word for the displayed step, in the same island/line
 * layout the packed descriptor uses, and by the same two-pass shape: every
 * cell's own roles first, then the intrusions into its neighbors.
 *
 * **Nothing here comes from `engine/hint-mark.ts`, and that is this game's
 * answer to it.** A `MarkBand` is a band on a cell's border box, and neither
 * thing a Bridges deduction points at is one: an island is a circle wider than
 * its own tile, and a bridge is a *span* between two of them, which is nobody's
 * border. Both marks are therefore the game's own shapes recolored
 * (docs/hints-marks.md § "Echo the move's shape in the hint color").
 */
function hintWords(
  s: BridgesState,
  hint?: HintStep<BridgesMove, BridgesHighlights>,
): Int32Array {
  const { w, h } = s;
  const out = new Int32Array(w * h);
  const marks = stepMarks(hint);
  const hl = hint?.highlights;

  // Islands: "this 5" and "the outlined islands" are two references, told
  // apart by the colors the app repaints each in.
  const pieces = marks.of("outline", PIECE);
  for (const i of pieces) {
    if ("x1" in i) continue;
    out[s.idx(i.x, i.y)] |= HI_CITED << H_I_ISLAND_SHIFT;
  }

  /** Set `bits` on every cell strictly between the span's two islands. */
  const span = (sp: BridgesSpan, bits: number): void => {
    const dx = Math.sign(sp.x2 - sp.x1);
    const dy = Math.sign(sp.y2 - sp.y1);
    const shift = dx ? H_L_LINE_SHIFT_H : H_L_LINE_SHIFT_V;
    for (let x = sp.x1 + dx, y = sp.y1 + dy; x !== sp.x2 || y !== sp.y2; ) {
      out[s.idx(x, y)] |= bits << shift;
      x += dx;
      y += dy;
    }
  };
  for (const sp of pieces) if ("x1" in sp) span(sp, HL_CITED);
  // Targets after citations: a span the step decides is never merely cited.
  // What the step decides on a ringed span is the plan's.
  const decides = new Map((hl?.targets ?? []).map((t) => [SPAN.key(t), t]));
  for (const ringed of marks.of("ring", SPAN)) {
    const t = decides.get(SPAN.key(ringed));
    if (!t) continue;
    span(t, HL_RING | (t.blocked ? HL_CROSS : t.bridges & HL_COUNTMASK));
    if (t.limit !== null) {
      const m = middleOf(t);
      const shift = t.x1 !== t.x2 ? H_L_LIMIT_SHIFT_H : H_L_LIMIT_SHIFT_V;
      out[s.idx(m.x, m.y)] |= (t.limit & DLIM_MASK) << shift;
    }
  }

  // Second pass: what each cell shows of its neighbors. An island's rim spills
  // into the four tiles around it and a bridge reaches the half-stubs its
  // endpoint islands draw, so both have to be carried across.
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const c = s.idx(x, y);
      if (s.gridAt(x, y) & G_ISLAND) {
        const role = (out[c] >> H_I_ISLAND_SHIFT) & HI_MASK;
        if (!role) continue;
        if (x > 0 && !(s.gridAt(x - 1, y) & G_ISLAND))
          out[s.idx(x - 1, y)] |= role << H_L_ISLAND_SHIFT_R;
        if (x + 1 < w && !(s.gridAt(x + 1, y) & G_ISLAND))
          out[s.idx(x + 1, y)] |= role << H_L_ISLAND_SHIFT_L;
        if (y > 0 && !(s.gridAt(x, y - 1) & G_ISLAND))
          out[s.idx(x, y - 1)] |= role << H_L_ISLAND_SHIFT_D;
        if (y + 1 < h && !(s.gridAt(x, y + 1) & G_ISLAND))
          out[s.idx(x, y + 1)] |= role << H_L_ISLAND_SHIFT_U;
      } else {
        const hbits = (out[c] >> H_L_LINE_SHIFT_H) & HL_MASK;
        const vbits = (out[c] >> H_L_LINE_SHIFT_V) & HL_MASK;
        if (hbits) {
          if (x > 0 && s.gridAt(x - 1, y) & G_ISLAND)
            out[s.idx(x - 1, y)] |= hbits << H_I_LINE_SHIFT_R;
          if (x + 1 < w && s.gridAt(x + 1, y) & G_ISLAND)
            out[s.idx(x + 1, y)] |= hbits << H_I_LINE_SHIFT_L;
        }
        if (vbits) {
          if (y > 0 && s.gridAt(x, y - 1) & G_ISLAND)
            out[s.idx(x, y - 1)] |= vbits << H_I_LINE_SHIFT_D;
          if (y + 1 < h && s.gridAt(x, y + 1) & G_ISLAND)
            out[s.idx(x, y + 1)] |= vbits << H_I_LINE_SHIFT_U;
        }
      }
    }
  }
  return out;
}

// The redraw doctrine is what makes this branchy: one cache key per island and
// per bridge span, compared against the last frame before anything is painted.
// The branches ARE the diff, and hoisting them into helpers hides which cell a
// given comparison guards.
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: see above
export function redrawBridges(
  dr: GameDrawing,
  ds: BridgesDrawState,
  _prev: BridgesState | null,
  s: BridgesState,
  ui: BridgesUi,
  flash: Flash,
  mistakes: readonly BridgesMistake[] = [],
  hint?: HintStep<BridgesMove, BridgesHighlights>,
): void {
  const ts = ds.tileSize;
  const b = border(ts);
  const w = s.w;
  const h = s.h;

  let dragSrc: { x: number; y: number } | null = null;
  let dragDst: { x: number; y: number } | null = null;
  // `drag.live` as well as the coordinates: the engine ends a live drag when
  // the board changes under it, and the preview must go with it.
  if (ui.drag.live && ui.drag.sx !== -1 && ui.drag.sy !== -1) {
    dragSrc = { x: ui.drag.sx, y: ui.drag.sy };
    if (ui.drag.ex !== -1 && ui.drag.ey !== -1) {
      dragDst = { x: ui.drag.ex, y: ui.drag.ey };
    }
  }

  // The board the release would leave. The drag's span is drawn from it, so
  // the preview is whatever the release does.
  const releaseOps = dragDst ? dragReleaseOps(s, ui) : null;
  const released = releaseOps ? executeMove(s, { ops: releaseOps }) : null;

  const mistakeMask = buildMistakeMask(s, mistakes);
  const newgrid = ds.newgrid;
  newgrid.fill(0);
  const newlead = ds.newlead;
  newlead.fill(0);
  const newhint = hintWords(s, hint);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const c = s.idx(x, y);
      const v = s.gridAt(x, y);

      if (v & G_ISLAND) {
        const is = s.islandAt(x, y);
        if (!is) continue;
        let idata = 0;
        const tone = flash.win(sweepStep(x, y));
        if (tone === WIN_LEAD) newlead[c] = 1;
        if (tone) idata |= DI_COL_FLASH;
        else if (
          dragSrc &&
          ((is.x === dragSrc.x && is.y === dragSrc.y) ||
            (dragDst && is.x === dragDst.x && is.y === dragDst.y))
        )
          idata |= DI_COL_SELECTED;
        else if (
          s.islandImpossible(is, (v & G_MARK) !== 0) ||
          v & G_WARN ||
          mistakeMask?.[c]
        )
          idata |= DI_COL_WARNING;
        else idata |= DI_COL_NORMAL;

        if (ui.cursor.visible && ui.cursor.x === is.x && ui.cursor.y === is.y)
          idata |= DI_BG_CURSOR;
        else if (v & G_MARK) idata |= DI_BG_MARK;
        // Fork aid: lift a satisfied island (visual only — no lock).
        // A satisfied island is never impossible, so this never fights the red.
        else if (ui.autoMark && s.islandCountbridges(is) === is.count)
          idata |= DI_BG_MARK;
        else idata |= DI_BG_NORMAL;

        newgrid[c] |= idata << D_I_ISLAND_SHIFT;
        if (x > 0 && !(s.gridAt(x - 1, y) & G_ISLAND))
          newgrid[s.idx(x - 1, y)] |= idata << D_L_ISLAND_SHIFT_R;
        if (x + 1 < w && !(s.gridAt(x + 1, y) & G_ISLAND))
          newgrid[s.idx(x + 1, y)] |= idata << D_L_ISLAND_SHIFT_L;
        if (y > 0 && !(s.gridAt(x, y - 1) & G_ISLAND))
          newgrid[s.idx(x, y - 1)] |= idata << D_L_ISLAND_SHIFT_D;
        if (y + 1 < h && !(s.gridAt(x, y + 1) & G_ISLAND))
          newgrid[s.idx(x, y + 1)] |= idata << D_L_ISLAND_SHIFT_U;
      } else {
        let selh = false;
        let selv = false;
        if (
          dragSrc &&
          dragDst &&
          within(x, dragSrc.x, dragDst.x) &&
          within(y, dragSrc.y, dragDst.y)
        ) {
          if (dragSrc.x !== dragDst.x) selh = true;
          else selv = true;
        }
        const drawn = released && (selh || selv) ? released : s;
        const dv = drawn.gridAt(x, y);
        const [lv, lh] = linesLvlh(drawn, ui, x, y, dv);

        let hdata =
          dv & G_NOLINEH
            ? DL_COUNT_CROSS
            : dv & G_LINEH
              ? lh
              : ui.showPossible && betweenIsland(s, x, y, 1, 0)
                ? DL_COUNT_POSSIBLE
                : 0;
        let vdata =
          dv & G_NOLINEV
            ? DL_COUNT_CROSS
            : dv & G_LINEV
              ? lv
              : ui.showPossible && betweenIsland(s, x, y, 0, 1)
                ? DL_COUNT_POSSIBLE
                : 0;

        const wrong = mistakeMask?.[c];
        // The win flash lights a bridge square by square as it crosses, and a
        // square with no bridge has nothing to light.
        const tone = dv & (G_LINEH | G_LINEV) ? flash.win(sweepStep(x, y)) : WIN_NONE;
        const lit = tone !== WIN_NONE;
        if (tone === WIN_LEAD) newlead[c] = 1;
        hdata |= lit
          ? DL_COL_FLASH
          : v & G_WARN || wrong
            ? DL_COL_WARNING
            : selh
              ? DL_COL_SELECTED
              : DL_COL_NORMAL;
        vdata |= lit
          ? DL_COL_FLASH
          : v & G_WARN || wrong
            ? DL_COL_WARNING
            : selv
              ? DL_COL_SELECTED
              : DL_COL_NORMAL;

        if (v & G_MARKH) hdata |= DL_LOCK;
        if (v & G_MARKV) vdata |= DL_LOCK;

        newgrid[c] |= hdata << D_L_LINE_SHIFT_H;
        newgrid[c] |= vdata << D_L_LINE_SHIFT_V;
        if (x > 0 && s.gridAt(x - 1, y) & G_ISLAND)
          newgrid[s.idx(x - 1, y)] |= hdata << D_I_LINE_SHIFT_R;
        if (x + 1 < w && s.gridAt(x + 1, y) & G_ISLAND)
          newgrid[s.idx(x + 1, y)] |= hdata << D_I_LINE_SHIFT_L;
        if (y > 0 && s.gridAt(x, y - 1) & G_ISLAND)
          newgrid[s.idx(x, y - 1)] |= vdata << D_I_LINE_SHIFT_D;
        if (y + 1 < h && s.gridAt(x, y + 1) & G_ISLAND)
          newgrid[s.idx(x, y + 1)] |= vdata << D_I_LINE_SHIFT_U;
      }
    }
  }

  // Each limit on its span's middle square. Spans are walked from their left
  // or top island so each is visited once; a limit under a cross is the cross.
  // Read after the release, which differs only on the drag's own span.
  const limited = released ?? s;
  for (const is of s.islands) {
    for (const pt of is.points) {
      if (pt.dx === -1 || pt.dy === -1 || !pt.off) continue;
      const limit = limited.maximum(pt.dx, pt.x, pt.y);
      if (limit >= s.maxb) continue;
      if (limited.gridAt(pt.x, pt.y) & (pt.dx ? G_NOLINEH : G_NOLINEV)) continue;
      const m = middleOf({
        x1: is.x,
        y1: is.y,
        x2: is.x + pt.off * pt.dx,
        y2: is.y + pt.off * pt.dy,
      });
      newgrid[s.idx(m.x, m.y)] |=
        (limit & DLIM_MASK) << (pt.dx ? D_L_LIMIT_SHIFT_H : D_L_LIMIT_SHIFT_V);
    }
  }

  // Draw any changed tile.
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const c = s.idx(x, y);
      const newval = newgrid[c];
      const newhintval = newhint[c];
      const lead =
        (newlead[c] ? LEAD_SELF : 0) |
        (x > 0 && newlead[s.idx(x - 1, y)] ? LEAD_L : 0) |
        (x + 1 < w && newlead[s.idx(x + 1, y)] ? LEAD_R : 0) |
        (y > 0 && newlead[s.idx(x, y - 1)] ? LEAD_U : 0) |
        (y + 1 < h && newlead[s.idx(x, y + 1)] ? LEAD_D : 0);
      // The hint word is part of the diff key, not a second overlay pass: a
      // frame whose board is unchanged and whose hint is not must still
      // repaint (`hint-overlay.test.ts`).
      if (ds.grid[c] === newval && ds.hint[c] === newhintval && ds.lead[c] === lead)
        continue;
      const v = s.gridAt(x, y);
      if (v & G_ISLAND) {
        const is = s.islandAt(x, y);
        const hv = newhintval;
        drawIslandTile(dr, ts, b, x, y, is ? is.count : 0, newval, hv, lead);
        if (x === 0) drawEdgeTile(dr, ts, b, x - 1, y, 1, 0, newval, hv, lead);
        if (y === 0) drawEdgeTile(dr, ts, b, x, y - 1, 0, 1, newval, hv, lead);
        if (x === w - 1) drawEdgeTile(dr, ts, b, x + 1, y, -1, 0, newval, hv, lead);
        if (y === h - 1) drawEdgeTile(dr, ts, b, x, y + 1, 0, -1, newval, hv, lead);
      } else {
        drawLineTile(dr, ts, b, x, y, newval, newhintval, lead, (horizontal) =>
          spanRing(s, ts, b, x, y, horizontal, newgrid, newhint),
        );
      }
      ds.grid[c] = newval;
      ds.lead[c] = lead;
      ds.hint[c] = newhintval;
    }
  }
}
