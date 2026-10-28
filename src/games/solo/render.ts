/**
 * Solo (Sudoku) rendering — port of `game_redraw` / `draw_number` /
 * `game_colours` from `solo.c`.
 *
 * The board is a `cr × cr` grid drawn on a `COL_GRID` backing rectangle, which
 * shows as the blocks' boundaries and the frame; a cell paints the quiet
 * `COL_LINE` it shares with a neighbor in its block. A cell is `COL_CELL`, or
 * `COL_GIVEN` under a given digit. Each cell's background is widened by
 * `GRIDEXTRA` toward same-*block* neighbors (so a sub-block reads as one merged
 * region), with explicit corner-jut squares where a diagonal neighbor is a
 * different block — exactly Keen's cage drawing, but driven by
 * `blocks.whichblock` (rectangular or jigsaw) rather than a cage dsf. On top of
 * that, four composable variants add their own marks:
 *
 *  - **X** (`xtype`) — the two main diagonals are stroked `COL_XDIAGONALS`.
 *  - **killer** — a second cage partition drawn as inset `COL_KILLER` lines
 *    (offset `GRIDEXTRA*3` from the cell edge), plus the cage-sum clue text.
 *  - givens render `COL_CLUE` (black), player digits `COL_USER` (green); a
 *    digit that duplicates within its row/col/block/diagonal/cage, or a cage
 *    whose full sum is wrong, recolors to `COL_ERROR`.
 *
 * A cell's drawn pixels depend only on its own digit + pencil bitmap + a small
 * highlight byte (cursor/flash/error/cage-sum) plus the immutable block/cage
 * structure, so a per-cell cache of `(digit|hl, pencil)` suffices — with the
 * (fork) Check-&-Save mistake overlay tracked in a sidecar so an already-drawn
 * cell still repaints when flagged (docs/rendering.md § "Overlay sidecars").
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
import { soloKiller } from "../../engine/color/palette-games.ts";
import { drawStrike, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { fromCoord as fromCoordE } from "../../engine/geometry.ts";
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
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import { NOTHING_TO_CLEAR, type RingClear, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep } from "../../engine/win-wave.ts";
import {
  checkKillerCageSum,
  onDiag0,
  onDiag1,
  type SoloMove,
  type SoloState,
  type SoloUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 48;

// --- palette (index-for-index with the upstream COL_* enum) ----------------

export const COL_BACKGROUND = 0;
export const COL_XDIAGONALS = 1;
export const COL_GRID = 2;
export const COL_CLUE = 3;
export const COL_USER = 4;
export const COL_HIGHLIGHT = 5;
export const COL_ERROR = 6;
export const COL_PENCIL = 7;
export const COL_KILLER = 8;
// Fork additions, appended past the upstream enum (NCOLORS = 9).
export const COL_PENCIL_BODY = 9; // the yellow body of the pencil-mode indicator
/** The driving region's outline (drawn in redraw's last block). */
export const COL_HINT_CELL = 10;
export const COL_CELL = 11; // the surface of a cell the player fills
export const COL_GIVEN = 12; // the lifted surface under a given digit
/** The thin line between two cells of one block. A block's own edge is
 * content and stays `COL_GRID`. */
export const COL_LINE = 13;
/** The ground of a cell the win flash is on: its body, and its leading edge. */
export const COL_FLASH = 14;
export const COL_FLASH_LEAD = 15;

export function colors(defaultBackground: Color): Color[] {
  const bg = defaultBackground;
  const out: Color[] = [];
  out[COL_BACKGROUND] = bg;
  out[COL_XDIAGONALS] = surfaceGrid(bg);
  out[COL_GRID] = INK;
  out[COL_CLUE] = INK;
  out[COL_USER] = playerEntryColor(bg);
  out[COL_HIGHLIGHT] = highlightWash(bg);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_ERROR] = ERROR;
  out[COL_PENCIL] = pencilColor(bg);
  out[COL_KILLER] = soloKiller(bg);
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  out[COL_HINT_CELL] = HINT_OUTLINE;
  out[COL_CELL] = cellSurface(bg);
  out[COL_GIVEN] = givenSurface(bg);
  out[COL_LINE] = surfaceGrid(bg);
  return out;
}

/** Highlight payload a Solo hint step carries (built in `index.ts`). The
 * marks (docs/hints-marks.md § "The engine colors the marks"): the cells the reason rests on outlined `COL_HINT_CELL` in the gutter, the
 * acted-on cell(s) ringed by the engine, the ruled-out candidate(s) shown struck.
 * The region a sentence names is hatched from the step's marks, not from here. */
export interface SoloHint {
  /** The cells the reason rests on (evidence), outlined `COL_HINT_CELL`. */
  area: { x: number; y: number }[];
  /** The cell(s) the deduction acts on, ringed. */
  targets: { x: number; y: number }[];
  /** The candidate number(s) ruled out, shown struck among the pencil marks. */
  marks: { x: number; y: number; n: number }[];
}

// --- highlight byte (the `hl` argument of draw_number) ----------------------
// Low nibble: the cell's `CellHighlight`, where the completion flash washes
// every cell as an entry highlight would. Bit 16 = duplicate-digit error,
// bit 32 = killer-cage sum wrong.

const HL_ERROR = 16;
const HL_KSUM = 32;

// --- geometry --------------------------------------------------------------

/** Half a tile, or the pencil indicator's reach where that is wider: the glyph
 * has a floor, and a small tile's half would put it on the top-right cell. */
export const border = (ts: number): number =>
  Math.max((ts / 2) | 0, pencilIndicatorReach(ts));
export const gridExtra = (ts: number): number => Math.max((ts / 32) | 0, 1);

/** Pixel to cell, faithful to `interpret_move`'s `(x+TILE-BORDER)/TILE-1`. */
export function fromCoord(v: number, ts: number): number {
  return fromCoordE(v, ts, border(ts));
}

export function computeSize(cr: number, ts: number): Size {
  const s = cr * ts + 2 * border(ts);
  return { w: s, h: s };
}

// --- draw state ------------------------------------------------------------

export interface SoloDrawState {
  started: boolean;
  tileSize: number;
  cr: number;
  xtype: boolean;
  /** `cr²` last-drawn `(digit | hl << 8)` values (-1 = never drawn). */
  tiles: Int32Array;
  /** `cr²` last-drawn pencil bitmaps (-1 = never drawn). */
  pencil: Int32Array;
  /** `cr²` hint-overlay sidecar (fork addition): bit 0 = target cell, bit 1 =
   * evidence cell, struck candidates at `valueBit(n)` in its `struck` lane. A
   * sidecar rather than a tile bit, because digit and pencil already fill the
   * two cache words (docs/rendering.md § "The tile cache and the diff
   * key"). */
  hint: OverlaySidecar;
  /** `cr²` mistake-overlay sidecar (fork addition) — same dance, so Check & Save
   * repaints a cell whose tile is otherwise unchanged. */
  wrong: OverlaySidecar;
  /** Whether the pencil-mode indicator was on last frame (fork addition). */
  pencilModeShown: boolean | null;
  /** The hint target's ring and the evidence region's outline (fork additions),
   * both drawn in the **gutter**, which a tile paints into only inside a
   * sub-block — so their removal is driven from here, before the tiles repaint.
   * See {@link markBand}. */
  marks: HintMarks;
}

export function newDrawState(state: SoloState, tileSize: number): SoloDrawState {
  const a = state.cr * state.cr;
  return {
    started: false,
    tileSize,
    cr: state.cr,
    xtype: state.xtype,
    tiles: new Int32Array(a).fill(-1),
    pencil: new Int32Array(a).fill(-1),
    hint: new OverlaySidecar(a),
    wrong: new OverlaySidecar(a),
    pencilModeShown: null,
    marks: new HintMarks(),
  };
}

/**
 * Where a hint mark sits around cell `(x, y)`: **entirely in the gutter**, the
 * grid line around the tile, rather than inside it.
 *
 * Solo's geometry is Keen's, so the reasoning is Keen's too — its pencil-mark
 * block is as wide as the cell, leaving a glyph only its own font padding at the
 * edge, and the gutter is `2·ge + 1` of `COL_GRID` backing that belongs to no
 * tile. Two cells in the same sub-block sit a single pixel apart (each widens by
 * `ge` toward the other), so a mark there overlaps the neighbor's background by
 * `ge` on that side, which is why erasing one repaints the neighbors (see
 * `redraw`); the block boundary — the wide gutter — is where the ring is
 * thickest and reads best.
 */
function markBand(ts: number, x: number, y: number): MarkBand {
  const ge = gridExtra(ts);
  const inner = ts - 1 - 2 * ge;
  return {
    box: {
      x: border(ts) + x * ts + 1 + ge,
      y: border(ts) + y * ts + 1 + ge,
      w: inner,
      h: inner,
    },
    outer: 2 * ge + 1,
    inner: 0,
  };
}

// --- digit glyph (upstream: '1'..'9' then 'a'.. for orders > 9) -------------

export function digitChar(n: number): string {
  // n is 1-based; upstream prints '0'+n, rolling into 'a' past '9'.
  return n <= 9 ? String(n) : String.fromCharCode("a".charCodeAt(0) + (n - 10));
}

// --- single-cell drawing (draw_number) -------------------------------------

function drawNumber(
  dr: GameDrawing,
  ds: SoloDrawState,
  state: SoloState,
  x: number,
  y: number,
  hl: number,
  wrong: boolean,
  struck: number,
): void {
  const ts = ds.tileSize;
  const cr = state.cr;
  const ge = gridExtra(ts);
  const b = border(ts);
  const wb = state.blocks.whichblock;
  const cell = y * cr + x;
  const colKiller = hl & HL_KSUM ? COL_ERROR : COL_KILLER;

  // Hint overlay (docs/hints-marks.md § "The engine colors the marks"): both
  // cell-level marks are read in `redraw`, which draws the target's ring and the
  // evidence region's outline in the gutter. What is left here is `struck`, the
  // set of candidates this firing rules out (bit n ⇒ candidate n), crossed
  // through among the marks.

  const tx = b + x * ts + 1 + ge;
  const ty = b + y * ts + 1 + ge;
  const inner = ts - 1 - 2 * ge; // the tile's side inside its gutter

  let cx = tx;
  let cy = ty;
  let cw = inner;
  let ch = inner;

  // Widen the background toward same-block neighbors so the sub-block merges.
  if (x > 0 && wb[cell] === wb[cell - 1]) {
    cx -= ge;
    cw += ge;
  }
  if (x + 1 < cr && wb[cell] === wb[cell + 1]) cw += ge;
  if (y > 0 && wb[cell] === wb[cell - cr]) {
    cy -= ge;
    ch += ge;
  }
  if (y + 1 < cr && wb[cell] === wb[cell + cr]) ch += ge;

  // The one-pixel line this cell shares with a same-block neighbor to its left
  // and above is the quiet grid line, and so is the pixel where four cells of
  // one block meet. A block's edge is left to the backing rectangle.
  const sameLeft = cx < tx;
  const sameTop = cy < ty;
  if (sameLeft) dr.drawRect({ x: cx - 1, y: cy, w: 1, h: ch }, COL_LINE);
  if (sameTop) dr.drawRect({ x: cx, y: cy - 1, w: cw, h: 1 }, COL_LINE);
  if (sameLeft && sameTop && wb[cell] === wb[cell - cr - 1])
    dr.drawRect({ x: cx - 1, y: cy - 1, w: 1, h: 1 }, COL_LINE);

  dr.clip({ x: cx, y: cy, w: cw, h: ch });

  // Background. No hint role appears here: the target's ring and the evidence
  // region's outline are both drawn in the gutter (see `redraw`), so a hint
  // never paints over the digits it is talking about.
  drawCellBackground(
    dr,
    { x: cx, y: cy, w: cw, h: ch },
    (hl & 15) as CellHighlight,
    COL_HIGHLIGHT,
    state.immutable[cell] ? COL_GIVEN : COL_CELL,
    COL_FLASH,
    COL_FLASH_LEAD,
  );
  // The X variant's diagonals, as a stroke between the cell's grid corners
  // under its content: a mark, since a shade of the surface would be a step of
  // gray beside a given's lifted cell.
  if (ds.xtype) {
    const lo = -ge - 1;
    const hi = inner + ge;
    if (onDiag0(cell, cr))
      dr.drawLine(
        { x: tx + lo, y: ty + lo },
        { x: tx + hi, y: ty + hi },
        COL_XDIAGONALS,
        1,
      );
    if (onDiag1(cell, cr))
      dr.drawLine(
        { x: tx + hi, y: ty + lo },
        { x: tx + lo, y: ty + hi },
        COL_XDIAGONALS,
        1,
      );
  }
  ds.hint.drawHatch(dr, cell, { x: cx, y: cy, w: cw, h: ch }, ts);

  // Corner juts: a GRIDEXTRA square where the diagonal neighbor is a different
  // block (so the grid corner shows through the merged region).
  if (x > 0 && y > 0 && wb[cell] !== wb[(y - 1) * cr + x - 1])
    dr.drawRect({ x: tx - ge, y: ty - ge, w: ge, h: ge }, COL_GRID);
  if (x + 1 < cr && y > 0 && wb[cell] !== wb[(y - 1) * cr + x + 1])
    dr.drawRect({ x: tx + inner, y: ty - ge, w: ge, h: ge }, COL_GRID);
  if (x > 0 && y + 1 < cr && wb[cell] !== wb[(y + 1) * cr + x - 1])
    dr.drawRect({ x: tx - ge, y: ty + inner, w: ge, h: ge }, COL_GRID);
  if (x + 1 < cr && y + 1 < cr && wb[cell] !== wb[(y + 1) * cr + x + 1])
    dr.drawRect({ x: tx + inner, y: ty + inner, w: ge, h: ge }, COL_GRID);

  // Killer cage borders + corners.
  const killer = state.killerData;
  if (killer) {
    const kwb = killer.kblocks.whichblock;
    const t = ge * 3;
    const line = (x0: number, y0: number, x1: number, y1: number): void =>
      dr.drawLine({ x: x0, y: y0 }, { x: x1, y: y1 }, colKiller, 1);
    // In jigsaw mode, offset from the cell *center* lines so adjacent cage
    // outlines line up; otherwise from the cell edge.
    const jigsaw = state.params.r === 1;
    const kcx = jigsaw ? tx : cx;
    const kcy = jigsaw ? ty : cy;
    const kcw = jigsaw ? inner : cw;
    const kch = jigsaw ? inner : ch;
    const hasLeft = x === 0 || kwb[cell] !== kwb[cell - 1];
    const hasRight = x + 1 >= cr || kwb[cell] !== kwb[cell + 1];
    const hasTop = y === 0 || kwb[cell] !== kwb[cell - cr];
    const hasBottom = y + 1 >= cr || kwb[cell] !== kwb[cell + cr];
    const kl = kcx - 1 + (hasLeft ? t : 0);
    const kt = kcy - 1 + (hasTop ? t : 0);
    const kr = kcx + kcw - (hasRight ? t : 0);
    const kb = kcy + kch - (hasBottom ? t : 0);
    if (hasTop) line(kl, kt, kr, kt);
    if (hasBottom) line(kl, kb, kr, kb);
    if (hasLeft) line(kl, kt, kl, kb);
    if (hasRight) line(kr, kt, kr, kb);
    // Corners, only where there wasn't a full edge.
    const cornerDiffers = (dx: number, dy: number): boolean =>
      kwb[cell] !== kwb[(y + dy) * cr + x + dx];
    if (x > 0 && y > 0 && !hasLeft && !hasTop && cornerDiffers(-1, -1)) {
      line(kl, kt + t, kl + t, kt + t);
      line(kl + t, kt, kl + t, kt + t);
    }
    if (x + 1 < cr && y > 0 && !hasRight && !hasTop && cornerDiffers(1, -1)) {
      line(kcx + kcw - t, kt + t, kcx + kcw, kt + t);
      line(kcx + kcw - t, kt, kcx + kcw - t, kt + t);
    }
    if (x > 0 && y + 1 < cr && !hasLeft && !hasBottom && cornerDiffers(-1, 1)) {
      line(kl, kcy + kch - t, kl + t, kcy + kch - t);
      line(kl + t, kcy + kch - t, kl + t, kcy + kch);
    }
    if (x + 1 < cr && y + 1 < cr && !hasRight && !hasBottom && cornerDiffers(1, 1)) {
      line(kcx + kcw - t, kcy + kch - t, kcx + kcw - t, kcy + kch);
      line(kcx + kcw - t, kcy + kch - t, kcx + kcw, kcy + kch - t);
    }
  }

  // Killer cage-sum clue.
  if (killer?.kgrid[cell]) {
    const { origin, options } = killerText(ts, x, y, killer.kgrid[cell]);
    dr.drawText(origin, options, colKiller, String(killer.kgrid[cell]));
  }

  // The digit, or the pencil-mark grid.
  const d = state.grid[cell];
  if (d) {
    const { origin, options } = digitText(ts, x, y);
    dr.drawText(
      origin,
      options,
      state.immutable[cell] ? COL_CLUE : hl & HL_ERROR ? COL_ERROR : COL_USER,
      digitChar(d),
    );
  } else {
    const shown = pencilValues(cr, state.pencil[cell]);
    pencilSlots(state, ts, x, y, shown.length).forEach(({ origin, options }, j) => {
      const i = shown[j];
      dr.drawText(origin, options, COL_PENCIL, digitChar(i));
      // A hint-ruled-out candidate keeps its normal pencil color with a
      // same-color strikethrough — the "ruled out" cue (docs/hints-marks.md § "The engine colors the marks").
      if (struck & (1 << i))
        drawStrike(dr, origin, options.size, COL_PENCIL, {
          x: cx,
          y: cy,
          w: cw,
          h: ch,
        });
    });
  }

  // Check & Save mistake overlay (fork addition): an inset red outline.
  if (wrong) {
    const l = tx;
    const tt = ty;
    const r = tx + ts - 1 - 2 * ge;
    const bb = ty + ts - 1 - 2 * ge;
    for (const inset of [2, 3]) {
      dr.drawLine(
        { x: l + inset, y: tt + inset },
        { x: r - inset, y: tt + inset },
        COL_ERROR,
        1,
      );
      dr.drawLine(
        { x: r - inset, y: tt + inset },
        { x: r - inset, y: bb - inset },
        COL_ERROR,
        1,
      );
      dr.drawLine(
        { x: r - inset, y: bb - inset },
        { x: l + inset, y: bb - inset },
        COL_ERROR,
        1,
      );
      dr.drawLine(
        { x: l + inset, y: bb - inset },
        { x: l + inset, y: tt + inset },
        COL_ERROR,
        1,
      );
    }
  }

  dr.unclip();
  dr.drawUpdate({ x: cx - 1, y: cy - 1, w: cw + 1, h: ch + 1 });
}

/** A piece of text a tile draws: what it passes `drawText` but the color. */
interface TileText {
  readonly origin: Point;
  readonly options: DrawTextOptions;
}

/** The top-left corner of cell `(x, y)`'s tile, inside the gutter. */
const tileOrigin = (ts: number, x: number, y: number): Point => {
  const ge = gridExtra(ts);
  return { x: border(ts) + x * ts + 1 + ge, y: border(ts) + y * ts + 1 + ge };
};

/** A killer cage's sum `sum`, its ink in the top-left corner of its cell
 * `(x, y)`'s {@link killerArea}. */
function killerText(ts: number, x: number, y: number, sum: number): TileText {
  const area = killerArea(ts, x, y);
  const options = killerFont(ts);
  const ink = textBox({ x: 0, y: 0 }, options, String(sum));
  return { origin: { x: area.x - ink.x, y: area.y - ink.y }, options };
}

const killerFont = (ts: number): DrawTextOptions => ({
  align: "left",
  baseline: "alphabetic",
  fontType: "variable",
  size: (ts / 4) | 0,
});

/** Where a Killer cell's text keeps: its {@link ringTextBox}, inside where a
 * cage's outline may run, in every cell whether or not one runs along its
 * sides, so that a cage does not move or shrink a cell's text. */
function killerArea(ts: number, x: number, y: number): Rect {
  const ge = gridExtra(ts);
  const t = tileOrigin(ts, x, y);
  const within = { x: t.x + ge * 4, y: t.y + ge * 4, w: ts - ge * 8, h: ts - ge * 8 };
  return ringTextBox(markBand(ts, x, y), { within });
}

/** A placed digit, in the middle of the tile. */
function digitText(ts: number, x: number, y: number): TileText {
  const t = tileOrigin(ts, x, y);
  return {
    origin: { x: t.x + ((ts / 2) | 0), y: t.y + ((ts / 2) | 0) },
    options: glyphFont((ts / 2) | 0),
  };
}

/** The values set in a cell's pencil-mark bits (bit `i` is value `i`). */
const pencilValues = (cr: number, bits: number): number[] =>
  Array.from({ length: cr }, (_, i) => i + 1).filter((i) => bits & (1 << i));

/** Where `count` pencil marks go in the empty cell `(x, y)`, in order: its
 * {@link ringTextBox}, and in Killer the part of its {@link killerArea} below
 * where a sum goes, in every cell, so that a sum neither shrinks a cell's
 * notes nor moves them off its neighbors' rows. */
function pencilSlots(
  state: SoloState,
  ts: number,
  x: number,
  y: number,
  count: number,
): TileText[] {
  if (!state.killer) return noteGrid(ringTextBox(markBand(ts, x, y)), count);
  const area = killerArea(ts, x, y);
  // A sum's digits ink one height whatever they say.
  const sumInk = textBox({ x: 0, y: 0 }, killerFont(ts), "0");
  const top = area.y + sumInk.h + gridExtra(ts);
  return noteGrid({ ...area, y: top, h: area.y + area.h - top }, count);
}

/** The text cell `(x, y)` shows, for a hint's ring to keep clear of. */
function cellText(state: SoloState, ts: number, x: number, y: number): RingClear {
  const cr = state.cr;
  if (x < 0 || y < 0 || x >= cr || y >= cr) return NOTHING_TO_CLEAR;
  const cell = y * cr + x;
  const avoid: Rect[] = [];
  const sum = state.killerData?.kgrid[cell] ?? 0;
  if (sum) {
    const { origin, options } = killerText(ts, x, y, sum);
    avoid.push(textBox(origin, options, String(sum)));
  }
  const d = state.grid[cell];
  if (d) {
    const { origin, options } = digitText(ts, x, y);
    return { enclose: [textBox(origin, options, digitChar(d))], avoid };
  }
  const shown = pencilValues(cr, state.pencil[cell]);
  const notes = pencilSlots(state, ts, x, y, shown.length).map(
    ({ origin, options }, j) => textBox(origin, options, digitChar(shown[j])),
  );
  return { enclose: notes, avoid };
}

// --- pencil-mode indicator -------------------------------------------------

/** The three palette indices the shared glyph is drawn in; the engine draws it
 * and decides where. */
const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_PENCIL_BODY,
  ink: COL_GRID,
};
/** The room reserved for it is the border corner, outside every cell and clue:
 * `border` is never narrower than `pencilIndicatorReach`. */
const PENCIL_BOX = (cr: number, ts: number) =>
  pencilIndicatorBox(computeSize(cr, ts), ts);

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SoloDrawState,
  _prev: SoloState | null,
  state: SoloState,
  _dir: number,
  ui: SoloUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<SoloMove, SoloHint>,
  mistakes?: readonly { x: number; y: number }[],
): void {
  const ts = ds.tileSize;
  const cr = state.cr;
  const ge = gridExtra(ts);
  const b = border(ts);

  if (!ds.started) {
    // The grid backing rectangle the thin lines show through.
    dr.drawRect(
      {
        x: b - ge,
        y: b - ge,
        w: cr * ts + 1 + 2 * ge,
        h: cr * ts + 1 + 2 * ge,
      },
      COL_GRID,
    );
    ds.marks.reset(); // the backing rect just erased every gutter
    ds.started = true;
  }

  // Tally duplicate digits per row / column / block / diagonal / killer cage so
  // an over-used digit can be flagged red (faithful to game_redraw's
  // `entered_items`). We track a count per (region, digit).
  const blocks = state.blocks;
  const killer = state.killerData;
  const nrBlocks = blocks.nrBlocks;
  // Region layout: rows [0,cr), cols [cr,2cr), blocks [2cr, 2cr+nrBlocks),
  // diag0/diag1, then killer cages.
  const diagBase = 2 * cr + nrBlocks;
  const kBase = diagBase + 2;
  const nKiller = killer ? killer.kblocks.nrBlocks : 0;
  const nregions = kBase + nKiller;
  const count = new Int32Array(nregions * cr);
  const bump = (region: number, digit: number) => {
    count[region * cr + (digit - 1)]++;
  };
  for (let y = 0; y < cr; y++) {
    for (let x = 0; x < cr; x++) {
      const d = state.grid[y * cr + x];
      if (!d) continue;
      bump(y, d); // row y
      bump(cr + x, d); // col x
      bump(2 * cr + blocks.whichblock[y * cr + x], d); // block
      if (ds.xtype) {
        if (onDiag0(y * cr + x, cr)) bump(diagBase, d);
        if (onDiag1(y * cr + x, cr)) bump(diagBase + 1, d);
      }
      if (killer) bump(kBase + killer.kblocks.whichblock[y * cr + x], d);
    }
  }
  const dup = (region: number, digit: number) => count[region * cr + (digit - 1)] > 1;

  // Pack both overlays per cell.
  const index = (x: number, y: number) => y * cr + x;
  ds.hint.pack(stepMarks(hint), index, (m) => valueBit(m.n));
  ds.wrong.packCells(mistakes ?? null, index);

  // Marks that moved are erased before the tile loop, not after it: inside a
  // sub-block the band covers the neighbors' widened backgrounds, so every cell
  // whose background reaches an erased band repaints over it.
  const targets: MarkCell[] = [];
  const evidence: MarkCell[] = [];
  for (let i = 0; i < cr * cr; i++) {
    const c = { x: i % cr, y: (i / cr) | 0 };
    if (ds.hint.packed[i] & HINT_TARGET) targets.push(c);
    if (ds.hint.packed[i] & HINT_AREA) evidence.push(c);
  }
  const markStyle = {
    band: (x: number, y: number) => markBand(ds.tileSize, x, y),
    text: (x: number, y: number) => cellText(state, ts, x, y),
    evidenceColor: COL_HINT_CELL,
  };
  ds.marks.eraseBeforeTiles(dr, targets, evidence, markStyle, COL_GRID, (x, y) => {
    if (x >= 0 && x < cr && y >= 0 && y < cr) ds.tiles[y * cr + x] = -1;
  });

  for (let y = 0; y < cr; y++) {
    for (let x = 0; x < cr; x++) {
      const cell = y * cr + x;
      const d = state.grid[cell];
      let hl: number =
        winHighlight(flash.win(sweepStep(x, y))) ?? cellHighlight(ui, x, y);

      if (d) {
        if (
          dup(y, d) ||
          dup(cr + x, d) ||
          dup(2 * cr + blocks.whichblock[cell], d) ||
          (ds.xtype &&
            ((onDiag0(cell, cr) && dup(diagBase, d)) ||
              (onDiag1(cell, cr) && dup(diagBase + 1, d)))) ||
          (killer && dup(kBase + killer.kblocks.whichblock[cell], d))
        )
          hl |= HL_ERROR;
        if (
          killer &&
          checkKillerCageSum(killer, state.grid, killer.kblocks.whichblock[cell]) === 0
        )
          hl |= HL_KSUM;
      }

      const tile = d | (hl << 8);
      const pen = state.pencil[cell];
      if (
        ds.tiles[cell] !== tile ||
        ds.pencil[cell] !== pen ||
        ds.hint.stale(cell) ||
        ds.wrong.stale(cell)
      ) {
        drawNumber(dr, ds, state, x, y, hl, ds.wrong.at(cell), ds.hint.struck[cell]);
        ds.tiles[cell] = tile;
        ds.pencil[cell] = pen;
        ds.hint.commit(cell);
        ds.wrong.commit(cell);
      }
    }
  }

  // The hint marks, **after** the tile loop and outside every clip, because they
  // straddle the gutter between tiles.
  ds.marks.paint(dr, targets, evidence, markStyle);

  // Pencil-mode indicator (fork addition).
  repaintPencilIndicator(dr, ds, ui.pencilMode, PENCIL_BOX(cr, ts), PENCIL_STYLE);
}
