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

import { valueBit } from "../../engine/board/candidate-bits.ts";
import {
  cellSurface,
  ERROR_WASH,
  givenSurface,
  highlightWash,
  INK,
  PENCIL_BODY,
  pencilColor,
  playerEntryColor,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  COL_BACKGROUND,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type {
  Color,
  DrawTextOptions,
  Point,
  Size,
} from "../../engine/contract/types.ts";
import {
  type CellHighlight,
  cellHighlight,
  drawCellBackground,
  HIGHLIGHT_NONE,
  noteGrid,
  winHighlight,
} from "../../engine/note-taking-cell.ts";
import { drawStrike, glyphFont } from "../../engine/render/draw.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
  ringTextBox,
} from "../../engine/render/hint-mark.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  OverlaySidecar,
} from "../../engine/render/overlay-sidecar.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorCanvas,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/render/pencil-indicator.ts";
import { NOTHING_TO_CLEAR, type RingClear, textBox } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import { type Flash, sweepStep } from "../../engine/render/win-wave.ts";
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

// The hint's outline (`COL_HINT_OUTLINE`) replaces a cell's own border rather
// than its background, so it is not read through the digits it surrounds.
const COL_GRID = FIRST_GAME_SLOT; // the line between two cells, and the frame
/** The surface of a cell the player fills. */
const COL_CELL = FIRST_GAME_SLOT + 1;
/** Ink: a given digit, a clue's ring and its label. */
const COL_BORDER = FIRST_GAME_SLOT + 2;
const COL_GUESS = FIRST_GAME_SLOT + 3;
export const COL_PENCIL = FIRST_GAME_SLOT + 4;
const COL_ERRORBG = FIRST_GAME_SLOT + 5;
/** The pencil-mode indicator's body. */
const COL_PENCIL_BODY = FIRST_GAME_SLOT + 6;
/** The highlight: a fill *under* the digits, and green is spent on the
 * player's own entries, so it is the Latin family's "you are here" wash (Solo,
 * Keen, Towers) and not the cursor role. */
const COL_HIGHLIGHT_WASH = FIRST_GAME_SLOT + 7;
/** The lifted surface of what the puzzle fixed: the cell under a given digit,
 * and the disc of a clue. */
const COL_GIVEN = FIRST_GAME_SLOT + 8;

export function colors(background: Color): Color[] {
  const out = rolePalette(background);
  out[COL_GRID] = surfaceGrid(background);
  out[COL_CELL] = cellSurface(background);
  out[COL_GIVEN] = givenSurface(background);
  out[COL_HIGHLIGHT_WASH] = highlightWash(background);
  out[COL_BORDER] = INK;
  out[COL_GUESS] = playerEntryColor(background);
  out[COL_PENCIL] = pencilColor(background);
  out[COL_ERRORBG] = ERROR_WASH;
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  return out;
}

/** Highlight payload a Mathrax hint step carries (built in `index.ts`). The
 * marks (docs/hints-marks.md § "The engine colors the marks"): the clue's
 * cells outlined `COL_HINT_OUTLINE`, the acted-on cell ringed by the engine,
 * the ruled-out candidates struck through among the pencil marks. */
export interface MathraxHint {
  /** The cells the deduction reasons from — a clue's diagonal pair, all four
   * cells around an `E`/`O` clue, or a hidden single's line. */
  area: Point[];
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
 * the one-pixel border maps to row/column 0 rather than −1 (the Sticks
 * idiom). This declines the shared
 * `fromCoord` of `engine/board/geometry.ts`, whose floor would put that pointer off
 * the grid. */
export function fromCoord(v: number, ts: number): number {
  return Math.trunc((v - origin(ts)) / ts);
}

// --- draw state ------------------------------------------------------------

export interface MathraxDrawState {
  tileSize: number;
  /** What each of the `o²` cells shows: the digit in bits 0–3, the pencil-mark
   * bitmap (which itself starts at bit 1) in bits 4–13, and the cell + draw
   * flags in bits 14–24; and the mistake and hint overlays on it. */
  tiles: TileCache;
  /** `o²` Check-&-Save mistake overlay. */
  wrong: OverlaySidecar;
  /** `o²` hint overlay: bit 0 = target cell, bit 1 = evidence, and the struck
   * candidates at `valueBit(n)` in its `struck` lane. Owns the evidence outline
   * lane too (docs/rendering.md § "Overlay sidecars"). */
  hint: OverlaySidecar;
  /** The hint target's ring and the evidence region's outline. */
  marks: HintMarks;
  /** Whether the pencil-mode indicator was on last frame. */
  pencilModeShown: boolean | null;
}

export function newDrawState(state: MathraxState, tileSize: number): MathraxDrawState {
  const o = state.params.o;
  const wrong = new OverlaySidecar(o * o);
  const hint = new OverlaySidecar(o * o);
  return {
    tileSize,
    tiles: new TileCache(o * o, { overlays: [wrong, hint] }),
    wrong,
    hint,
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
function markBand(ts: number, x: number, y: number): MarkBand {
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
 * or notes. The clues on its corners are not among it: each sits on a disc
 * that `redraw` paints again over the marks, so a ring passes under them. */
function cellText(state: MathraxState, ts: number, x: number, y: number): RingClear {
  const o = state.params.o;
  if (x < 0 || y < 0 || x >= o || y >= o) return NOTHING_TO_CLEAR;
  const i = y * o + x;
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  if (state.grid[i]) {
    const { origin: at, options } = digitText(ts, tx, ty);
    return { enclose: [textBox(at, options, String(state.grid[i]))], avoid: [] };
  }
  const notes = pencilSlots(state, ts, x, y, state.pencil[i]).map((s) =>
    textBox(s.origin, s.options, String(s.n)),
  );
  return { enclose: notes, avoid: [] };
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
    COL_HIGHLIGHT_WASH,
    fs & F_IMMUTABLE ? COL_GIVEN : COL_CELL,
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
    drawPencilMarks(dr, state, ts, x, y, struck);
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

  dr.unclip();
}

/** Cell `(x, y)`'s pencil marks. The marks bitmap is in this port's
 * player-facing convention, bit `n` for candidate `n`. */
function drawPencilMarks(
  dr: GameDrawing,
  state: MathraxState,
  ts: number,
  x: number,
  y: number,
  struck: number,
): void {
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  const marks = state.pencil[y * state.params.o + x];
  for (const { origin: at, options, n } of pencilSlots(state, ts, x, y, marks)) {
    // A struck candidate keeps its pencil color, so it still reads as the
    // player's note; the same-color strikethrough is what says the hint rules it
    // out (docs/hints-marks.md § "The engine colors the marks").
    dr.drawText(at, options, COL_PENCIL, String(n));
    if (struck & (1 << n))
      drawStrike(dr, at, options.size, COL_PENCIL, { x: tx, y: ty, w: ts, h: ts });
  }
}

/** Where the marks in `marks` go in cell `(x, y)`, each with its candidate:
 * its {@link ringTextBox}. */
function pencilSlots(
  state: MathraxState,
  ts: number,
  x: number,
  y: number,
  marks: number,
): (TileText & { n: number })[] {
  const shown = Array.from({ length: state.params.o }, (_, i) => i + 1).filter(
    (n) => marks & (1 << n),
  );
  return noteGrid(ringTextBox(markBand(ts, x, y)), shown.length).map((slot, j) => ({
    ...slot,
    n: shown[j],
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
  if (ds.tiles.firstFrame()) {
    // The rectangle the cell outlines sit on, which is the frame's own line.
    dr.drawRect(
      { x: origin(ts), y: origin(ts) - 1, w: o * ts + 1, h: o * ts + 1 },
      COL_GRID,
    );
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
      if (ds.tiles.changed(i, tile))
        drawTile(dr, ds, state, x, y, fs, ds.wrong.at(i), ds.hint.struck[i]);
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
    band: (x, y) => markBand(ts, x, y),
    text: (x, y) => cellText(state, ts, x, y),
    evidenceColor: COL_HINT_OUTLINE,
  });
  // A mark passes behind the clues on its cell's corners, never over their
  // labels: each marked cell draws its quarters of them again, on top.
  for (const c of [...targets, ...evidence]) {
    const box = markBand(ts, c.x, c.y).box;
    dr.clip(box);
    drawCornerClues(dr, ts, state, c.x, c.y, state.flags[c.y * o + c.x]);
    dr.unclip();
  }

  repaintPencilIndicator(dr, ds, ui.pencilMode, PENCIL_BOX(o, ts), PENCIL_STYLE);
}
