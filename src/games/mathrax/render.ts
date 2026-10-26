/**
 * Mathrax rendering — port of `game_redraw` from `mathrax.c`.
 *
 * The board is an `o × o` grid of cell surfaces, a given digit's lifted, drawn
 * on a backing rectangle in the grid line's color. Each clue is drawn as a
 * circle straddling an interior grid
 * *intersection*, so every clue is painted up to four times — once from each
 * cell it touches, clipped to that cell — which lets the per-tile cache repaint
 * a clue's quarter (and recolor it red) as that cell's error state changes.
 *
 * A cell's pixels depend only on its own digit, pencil marks and flags, so one
 * packed `Int32Array` per-tile cache suffices; the (fork) Check-&-Save mistake
 * overlay rides in an `OverlaySidecar` so it repaints a cell that is otherwise
 * unchanged (docs/rendering.md § "The tile cache and the diff key").
 *
 * **One deliberate geometric divergence**: upstream's web build has `BORDER 1`,
 * leaving nowhere to show the pencil-mode indicator every pencil-mark game ships
 * (docs/mechanics.md § "Pencil marks: the full note-taking UX"). The canvas therefore gains a half-tile margin at its
 * right, so the indicator has the top-right corner the engine puts it in. The
 * grid's own geometry is untouched, so pointer mapping and the board's own size
 * are exactly upstream's.
 */

import { valueBit } from "../../engine/candidate-bits.ts";
import {
  cellSurface,
  ERROR,
  ERROR_WASH,
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
  type CellText,
  HintMarks,
  type MarkBand,
  type MarkCell,
  NO_TEXT,
} from "../../engine/hint-mark.ts";
import { drawHintOrdinal } from "../../engine/hint-ordinal.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  type CellHighlight,
  cellHighlight,
  drawCellBackground,
  HIGHLIGHT_NONE,
  winHighlight,
} from "../../engine/note-taking-cell.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  type OrderedCell,
  OverlaySidecar,
} from "../../engine/overlay-sidecar.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorCanvas,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import { textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep } from "../../engine/win-wave.ts";
import {
  clueLabel,
  F_IMMUTABLE,
  FE_BOTLEFT,
  FE_BOTRIGHT,
  FE_COUNT,
  FE_TOPLEFT,
  FE_TOPRIGHT,
  type MathraxMove,
  type MathraxState,
  type MathraxUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

/** Upstream's `NARROW_BORDERS` arm, which the web build compiled: a one-pixel
 * border, not half a tile (docs/rendering.md § "Sizing"). */
const BORDER = 1;

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0; // the board around the grid
export const COL_GRID = 1; // the line between two cells, and the frame
/** The surface of a cell the player fills. */
export const COL_CELL = 2;
/** Ink: a given digit, a clue's ring and its label. */
export const COL_BORDER = 3;
export const COL_GUESS = 4;
export const COL_PENCIL = 5;
export const COL_ERROR = 6;
export const COL_ERRORBG = 7;
/** Fork addition, appended past the upstream enum: the pencil-mode indicator's
 * body. */
export const COL_PENCIL_BODY = 8;
/** The ground of a cell the win flash is on: its body, and its leading edge. */
export const COL_FLASH = 9;
export const COL_FLASH_LEAD = 13;
export const COL_CURSOR = 10;
/** The hint's outline around the cells a deduction reasons from
 * (docs/hints-marks.md § "The engine colors the marks"). It replaces a cell's
 * own border rather than its background, so it is not read through the digits
 * it surrounds. The ring round the cell it acts on is the engine's. */
export const COL_HINT_CELL = 11;
/** The lifted surface of what the puzzle fixed: the cell under a given digit,
 * and the disc of a clue. */
export const COL_GIVEN = 12;

export function colors(background: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_GRID] = surfaceGrid(background);
  out[COL_CELL] = cellSurface(background);
  out[COL_GIVEN] = givenSurface(background);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  // A fill *under* the digits, and green is spent on the player's own entries,
  // so the cursor is the Latin family's "you are here" wash (Solo, Keen, Towers).
  out[COL_CURSOR] = highlightWash(background);
  out[COL_BORDER] = INK;
  out[COL_GUESS] = playerEntryColor(background);
  out[COL_PENCIL] = pencilColor(background);
  out[COL_ERROR] = ERROR;
  out[COL_ERRORBG] = ERROR_WASH;
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  // The outline sits on a cell's own border, which is read against the board
  // rather than through it, so it takes the palette's strong hint color.
  out[COL_HINT_CELL] = HINT_OUTLINE;
  return out;
}

/** Highlight payload a Mathrax hint step carries (built in `index.ts`). The
 * marks (docs/hints-marks.md § "The engine colors the marks"): the clue's
 * cells outlined `COL_HINT_CELL`, the acted-on cell ringed by the engine,
 * the ruled-out candidates struck through among the pencil marks. */
export interface MathraxHint {
  /** The cells the deduction reasons from — a clue's diagonal pair, all four
   * cells around an `E`/`O` clue, or a hidden single's line. A forcing chain's
   * cells additionally carry their place in it, drawn as an ordinal. */
  area: OrderedCell[];
  /** The cell(s) the deduction acts on, ringed. */
  targets: Point[];
  /** The candidate number(s) ruled out, shown struck among the pencil marks. */
  marks: { x: number; y: number; n: number }[];
}

// --- draw-only flags (upstream FD_*) ---------------------------------------

/** Bits 9–11: the cell's `CellHighlight`. */
const FD_HIGHLIGHT_SHIFT = 9;

// --- geometry --------------------------------------------------------------

/**
 * The board's pixel origin: upstream's one-pixel border, plus the margin that
 * gives the pencil indicator the corner a `BORDER` of 1 leaves nowhere for.
 * The margin is taken on every side, so the board stays centered in its canvas.
 */
export const origin = (ts: number): number => BORDER + pencilIndicatorReach(ts);

export function computeSize(p: { o: number }, ts: number): Size {
  const side = p.o * ts + 2 * BORDER;
  return pencilIndicatorCanvas({ w: side, h: side }, ts);
}

/** Upstream `FROMCOORD`: C integer division **truncates**, so a pointer inside
 * the one-pixel border maps to row/column 0 rather than −1 (the Sticks idiom,
 * docs/input.md § "The accreting-paint drag"). This declines the shared
 * `fromCoord` of `engine/geometry.ts`, whose floor would put that pointer off
 * the grid. */
export function fromCoord(v: number, ts: number): number {
  return Math.trunc((v - origin(ts)) / ts);
}

// --- draw state ------------------------------------------------------------

export interface MathraxDrawState {
  started: boolean;
  tileSize: number;
  /** `o²` packed last-drawn tile values (−1 = never drawn): the digit in bits
   * 0–3, the pencil-mark bitmap (which itself starts at bit 1) in bits 4–13,
   * and the cell + draw flags in bits 14–24. */
  tiles: Int32Array;
  /** `o²` Check-&-Save mistake overlay. */
  wrong: OverlaySidecar;
  /** `o²` hint overlay: bit 0 = target cell, bit 1 = evidence, and the struck
   * candidates at `valueBit(n)` in its `struck` lane. Owns the chain ordinal and the
   * evidence outline lanes too (docs/rendering.md § "Overlay sidecars"). */
  hint: OverlaySidecar;
  /** The hint target's ring and the evidence region's outline. */
  marks: HintMarks;
  /** Whether the pencil-mode indicator was on last frame. */
  pencilModeShown: boolean | null;
}

export function newDrawState(state: MathraxState, tileSize: number): MathraxDrawState {
  const o = state.params.o;
  return {
    started: false,
    tileSize,
    tiles: new Int32Array(o * o).fill(-1),
    wrong: new OverlaySidecar(o * o),
    hint: new OverlaySidecar(o * o),
    marks: new HintMarks(),
    pencilModeShown: null,
  };
}

/**
 * Where a hint mark sits around cell `(x, y)` — **on the cell's own border**,
 * the outline `drawTile` already paints there, rather than in a gutter.
 *
 * Mathrax has no gutter: consecutive tiles sit at a `tileSize` pitch and each
 * fills its whole square, so the grid the player sees *is* that one-pixel box
 * outline. The band therefore lies wholly inside the box (`outer` 0), which is
 * also what undoes it — a cell whose overlay changes repaints itself and takes
 * its mark with it, so there is nothing for {@link HintMarks} to erase.
 *
 * **The box is the tile's clip rect, not the rectangle its outline traces.**
 * `drawTile` draws that outline a pixel above the clip and a pixel past its
 * right edge, where it is clipped away — what the player sees between two cells
 * is the *neighbor's* line. A band placed on the traced rectangle would put its
 * top row outside the cell that owns it, and nothing would ever repaint it: the
 * mark stayed on the board as a stray line after the step moved on.
 *
 * A clue circle straddles the corner and overlaps the band. `redraw` draws the
 * marked cell's quarters of it again after the marks, so a marked cell reads
 * as a highlighted grid line passing behind the clue, which is what the
 * unmarked frame already shows in `COL_GRID`, and the label stays on top.
 */
function markBand(ds: MathraxDrawState, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  return {
    box: { x: origin(ts) + x * ts, y: origin(ts) + y * ts, w: ts, h: ts },
    outer: 0,
    inner: 2,
  };
}

// --- clue drawing ----------------------------------------------------------

function drawClue(
  dr: GameDrawing,
  ts: number,
  clue: number,
  x: number,
  y: number,
  error: boolean,
): void {
  if (!clue) return;
  dr.drawCircle(
    { x, y },
    (ts / 3) | 0,
    error ? COL_ERRORBG : COL_GIVEN,
    error ? COL_ERROR : COL_BORDER,
  );
  const label = clueText(ts, x, y);
  dr.drawText(label.origin, label.options, COL_BORDER, clueLabel(clue));
}

/** The (up to) four clues at cell `(x, y)`'s corners, each colored by *this*
 * cell's error flag for that corner in `fs`: a clue's quarters can differ. */
function drawCornerClues(
  dr: GameDrawing,
  ts: number,
  state: MathraxState,
  x: number,
  y: number,
  fs: number,
): void {
  const co = state.params.o - 1;
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  if (y < co && x < co)
    drawClue(dr, ts, state.clues[y * co + x], tx + ts, ty + ts, !!(fs & FE_BOTRIGHT));
  if (y > 0 && x < co)
    drawClue(dr, ts, state.clues[(y - 1) * co + x], tx + ts, ty, !!(fs & FE_TOPRIGHT));
  if (y < co && x > 0)
    drawClue(dr, ts, state.clues[y * co + x - 1], tx, ty + ts, !!(fs & FE_BOTLEFT));
  if (y > 0 && x > 0)
    drawClue(dr, ts, state.clues[(y - 1) * co + x - 1], tx, ty, !!(fs & FE_TOPLEFT));
}

/** A piece of text a tile draws: what it passes `drawText` but the color. */
interface TileText {
  readonly origin: Point;
  readonly options: DrawTextOptions;
}

/** A clue's label, on the grid corner at pixel `(x, y)`. */
const clueText = (ts: number, x: number, y: number): TileText => ({
  origin: { x, y },
  options: glyphFont((ts / 3) | 0),
});

/** A placed digit, in the middle of the tile at `(tx, ty)`. */
const digitText = (ts: number, tx: number, ty: number): TileText => ({
  origin: { x: tx + ((ts / 2) | 0), y: ty + ((ts / 2) | 0) },
  options: glyphFont((ts / 2) | 0),
});

/** The text cell `(x, y)` shows, for a hint's ring to keep clear of: its digit
 * or notes, and the labels of the clues on its four corners. */
function cellText(state: MathraxState, ts: number, x: number, y: number): CellText {
  const o = state.params.o;
  if (x < 0 || y < 0 || x >= o || y >= o) return NO_TEXT;
  const co = o - 1;
  const i = y * o + x;
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  const avoid: Rect[] = [];
  for (const [cx, cy] of [
    [x - 1, y - 1],
    [x, y - 1],
    [x - 1, y],
    [x, y],
  ]) {
    if (cx < 0 || cy < 0 || cx >= co || cy >= co) continue;
    const clue = state.clues[cy * co + cx];
    if (!clue) continue;
    const label = clueText(ts, origin(ts) + (cx + 1) * ts, origin(ts) + (cy + 1) * ts);
    avoid.push(textBox(label.origin, label.options, clueLabel(clue)));
  }
  if (state.grid[i]) {
    const { origin: at, options } = digitText(ts, tx, ty);
    return { enclose: [textBox(at, options, String(state.grid[i]))], avoid, notes: [] };
  }
  const notes = pencilSlots(ts, tx, ty, state.pencil[i], o).map((s) =>
    textBox(s.origin, s.options, String(s.n)),
  );
  return { enclose: [], avoid, notes };
}

// --- tile drawing ----------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ds: MathraxDrawState,
  state: MathraxState,
  x: number,
  y: number,
  fs: number,
  wrong: boolean,
  struck: number,
): void {
  const ts = ds.tileSize;
  const o = state.params.o;
  const co = o - 1;
  const i = y * o + x;
  // Of the hint overlay, a tile draws only `struck`, the candidates this firing
  // rules out. The target's ring and the evidence outline are painted after the
  // tile loop, unclipped, so a neighbor's repaint cannot bury them.
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  const cell = { x: tx, y: ty, w: ts, h: ts };

  dr.clip(cell);
  dr.drawUpdate(cell);
  drawCellBackground(
    dr,
    cell,
    ((fs >> FD_HIGHLIGHT_SHIFT) & 7) as CellHighlight,
    COL_CURSOR,
    fs & F_IMMUTABLE ? COL_GIVEN : COL_CELL,
    COL_FLASH,
    COL_FLASH_LEAD,
  );
  ds.hint.drawHatch(dr, i, cell, ts);

  // The cell's own outline.
  dr.drawPolygon(
    [
      { x: tx, y: ty - 1 },
      { x: tx + ts, y: ty - 1 },
      { x: tx + ts, y: ty + ts - 1 },
      { x: tx, y: ty + ts - 1 },
    ],
    -1,
    COL_GRID,
  );

  if (state.grid[i]) {
    const { origin: at, options } = digitText(ts, tx, ty);
    dr.drawText(
      at,
      options,
      fs & F_IMMUTABLE ? COL_BORDER : fs & FE_COUNT ? COL_ERROR : COL_GUESS,
      String(state.grid[i]),
    );
  } else if (state.pencil[i]) {
    drawPencilMarks(dr, ts, tx, ty, state.pencil[i], o, struck);
  }

  drawCornerClues(dr, ts, state, x, y, fs);

  // Check & Save mistake overlay (fork addition): an inset red outline.
  if (wrong) {
    for (const inset of [2, 3]) {
      const l = tx + inset;
      const t = ty + inset;
      const r = tx + ts - 1 - inset;
      const b = ty + ts - 1 - inset;
      dr.drawLine({ x: l, y: t }, { x: r, y: t }, COL_ERROR, 1);
      dr.drawLine({ x: r, y: t }, { x: r, y: b }, COL_ERROR, 1);
      dr.drawLine({ x: r, y: b }, { x: l, y: b }, COL_ERROR, 1);
      dr.drawLine({ x: l, y: b }, { x: l, y: t }, COL_ERROR, 1);
    }
  }

  // A forcing chain's place in the order it fires, so the narration can cite the
  // cells by number. The collection draws it in the bottom-right corner, which
  // here can hold a quarter of a clue circle of radius `ts / 3`; where one does,
  // the inset grows past it rather than moving the mark to another corner, so
  // the ordinal still means the same thing it means in every other game.
  const order = ds.hint.order[i];
  if (order > 0) {
    const clued = y < co && x < co && state.clues[y * co + x] !== 0;
    drawHintOrdinal(
      dr,
      { x: tx, y: ty },
      ts,
      order,
      COL_HINT_CELL,
      clued ? Math.ceil(ts / 3) : undefined,
    );
  }

  dr.unclip();
}

/** The auto-sized pencil-mark grid (upstream's layout arithmetic verbatim —
 * integer division throughout). Note the marks bitmap is in this port's
 * player-facing convention, bit `n` for candidate `n`. */
function drawPencilMarks(
  dr: GameDrawing,
  ts: number,
  tx: number,
  ty: number,
  marks: number,
  o: number,
  struck: number,
): void {
  for (const { origin: at, options, n } of pencilSlots(ts, tx, ty, marks, o)) {
    // A struck candidate keeps its pencil color, so it still reads as the
    // player's note; the same-color strikethrough is what says the hint rules it
    // out (docs/hints-marks.md § "The engine colors the marks").
    dr.drawText(at, options, COL_PENCIL, String(n));
    if (struck & (1 << n))
      drawStrike(dr, at, options.size, COL_PENCIL, { x: tx, y: ty, w: ts, h: ts });
  }
}

/** Where the marks in `marks` go in the tile at `(tx, ty)`, each with its
 * candidate. */
function pencilSlots(
  ts: number,
  tx: number,
  ty: number,
  marks: number,
  o: number,
): (TileText & { n: number })[] {
  const shown = Array.from({ length: o }, (_, i) => i + 1).filter(
    (n) => marks & (1 << n),
  );
  const nhints = shown.length;
  if (!nhints) return [];

  let hw = 1;
  while (hw * hw < nhints) hw++;
  if (hw < 3) hw = 3;
  let hh = ((nhints + hw - 1) / hw) | 0;
  if (hh < 2) hh = 2;
  const hmax = Math.max(hw, hh);
  const fontsz = (ts / (((hmax * (11 - hmax)) / 8) | 0)) | 0;

  return shown.map((n, j) => ({
    origin: {
      x: tx + ((((4 * (j % hw) + 3) * ts) / (4 * hw + 2)) | 0),
      y: ty + ((((4 * ((j / hw) | 0) + 3) * ts) / (4 * hh + 2)) | 0),
    },
    options: glyphFont(fontsz),
    n,
  }));
}

// --- pencil-mode indicator (fork addition) ---------------------------------

const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_PENCIL_BODY,
  ink: COL_BORDER,
};

/** The margin `computeSize` grows for it, at the canvas's top-right. */
const PENCIL_BOX = (o: number, ts: number) =>
  pencilIndicatorBox(computeSize({ o }, ts), ts);

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: MathraxDrawState,
  _prev: MathraxState | null,
  state: MathraxState,
  _dir: number,
  ui: MathraxUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<MathraxMove, MathraxHint>,
  mistakes?: readonly Point[],
): void {
  const ts = ds.tileSize;
  const o = state.params.o;
  const firstFrame = !ds.started;

  if (firstFrame) {
    // The rectangle the cell outlines sit on, which is the frame's own line.
    dr.drawRect(
      { x: origin(ts), y: origin(ts) - 1, w: o * ts + 1, h: o * ts + 1 },
      COL_GRID,
    );
    ds.started = true;
  }

  const index = (x: number, y: number): number => y * o + x;
  ds.wrong.packCells(mistakes ?? null, index);
  ds.hint.pack(stepMarks(hint), index, (m) => valueBit(m.n));

  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      const i = y * o + x;
      let fs = state.flags[i];

      // The selection is not drawn while the board is won.
      const highlight =
        winHighlight(flash.win(sweepStep(x, y))) ??
        (flash.winning ? HIGHLIGHT_NONE : cellHighlight(ui, x, y));
      fs |= highlight << FD_HIGHLIGHT_SHIFT;

      const tile = state.grid[i] | (state.pencil[i] << 4) | (fs << 14);
      if (ds.tiles[i] !== tile || ds.wrong.stale(i) || ds.hint.stale(i)) {
        drawTile(dr, ds, state, x, y, fs, ds.wrong.at(i), ds.hint.struck[i]);
        ds.tiles[i] = tile;
        ds.wrong.commit(i);
        ds.hint.commit(i);
      }
    }
  }

  // The hint marks, after the tile loop and outside every clip: a mark lies on
  // the shared grid line between two cells, so a neighbor repainting for its own
  // reasons would otherwise clip a side off.
  const targets: MarkCell[] = [];
  const evidence: MarkCell[] = [];
  for (let i = 0; i < o * o; i++) {
    const c = { x: i % o, y: (i / o) | 0 };
    if (ds.hint.packed[i] & HINT_TARGET) targets.push(c);
    if (ds.hint.packed[i] & HINT_AREA) evidence.push(c);
  }
  ds.marks.paint(dr, targets, evidence, {
    band: (x, y) => markBand(ds, x, y),
    text: (x, y) => cellText(state, ts, x, y),
    evidenceColor: COL_HINT_CELL,
  });
  // A mark passes behind the clues on its cell's corners, never over their
  // labels: each marked cell draws its quarters of them again, on top.
  for (const c of [...targets, ...evidence]) {
    const box = markBand(ds, c.x, c.y).box;
    dr.clip(box);
    drawCornerClues(dr, ts, state, c.x, c.y, state.flags[c.y * o + c.x]);
    dr.unclip();
  }

  repaintPencilIndicator(dr, ds, ui.pencilMode, PENCIL_BOX(o, ts), PENCIL_STYLE);
}
