/**
 * Mathrax rendering — port of `game_redraw` from `mathrax.c`.
 *
 * The board is an `o × o` grid of bordered squares drawn on a black backing
 * rectangle. Each clue is drawn as a circle straddling an interior grid
 * *intersection*, so every clue is painted up to four times — once from each
 * cell it touches, clipped to that cell — which lets the per-tile cache repaint
 * a clue's quarter (and recolor it red) as that cell's error state changes.
 *
 * A cell's pixels depend only on its own digit, pencil marks and flags, so one
 * packed `Int32Array` per-tile cache suffices; the (fork) Check-&-Save mistake
 * overlay rides in an `OverlaySidecar` so it repaints a cell that is otherwise
 * unchanged (docs/games/rendering.md § "The tile cache and the diff key").
 *
 * **One deliberate geometric divergence**: upstream's web build has `BORDER 1`,
 * leaving nowhere to show the pencil-mode indicator every pencil-mark game ships
 * (docs/games/mechanics.md § "Pencil marks: the full note-taking UX"). The canvas therefore gains a half-tile margin at its
 * right, so the indicator has the top-right corner the engine puts it in. The
 * grid's own geometry is untouched, so pointer mapping and the board's own size
 * are exactly upstream's.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import {
  ERROR,
  ERROR_WASH,
  FLASH,
  HINT_ACTION,
  HINT_EVIDENCE,
  highlightWash,
  INK,
  PENCIL_BODY,
  pencilColor,
  playerEntryColor,
} from "../../engine/color/palette.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import { drawHintOrdinal } from "../../engine/hint-ordinal.ts";
import {
  type CellHighlight,
  cellHighlight,
  drawCellBackground,
} from "../../engine/note-taking-cell.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  hintMarkBit,
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
import type { Color, Point, Size } from "../../engine/types.ts";
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
export const FLASH_TIME = 0.7;
const FLASH_FRAME = 0.1;

/** Upstream's `NARROW_BORDERS` arm, which the web build compiled: a one-pixel
 * border, not half a tile (docs/games/rendering.md § "Sizing"). */
const BORDER = 1;

// --- palette (index-for-index with the upstream COL_* enum) ----------------

export const COL_BACKGROUND = 0;
export const COL_HIGHLIGHT = 1;
export const COL_LOWLIGHT = 2;
export const COL_BORDER = 3;
export const COL_GUESS = 4;
export const COL_PENCIL = 5;
export const COL_ERROR = 6;
export const COL_ERRORBG = 7;
/** Fork addition, appended past the upstream enum (Mathrax has no dark-mode
 * `paletteOverrides`, so appending is safe): the pencil-mode indicator's body. */
export const COL_PENCIL_BODY = 8;
/** Fork additions, likewise appended: the solved flash's cell fill and the
 * highlight's wash, in both its full-cell and its corner form. Upstream drew
 * all of them with `COL_LOWLIGHT`, which stays the cell-outline color. */
export const COL_FLASH = 9;
export const COL_CURSOR = 10;
/** The hint's two marks (docs/games/hints.md § "The element-type color
 * legend"): a ring around the cell the deduction acts on, and an outline around
 * the cells it reasons from. Both replace a cell's own border rather than its
 * background, so neither has to be read through the digits it surrounds. */
export const COL_HINT = 11;
export const COL_HINT_CELL = 12;

export function colors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_HIGHLIGHT] = highlight;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_FLASH] = FLASH;
  // A fill *under* the digits, and green is spent on the player's own entries,
  // so the cursor is the Latin family's "you are here" wash (Solo, Keen, Towers).
  out[COL_CURSOR] = highlightWash(background);
  out[COL_BORDER] = INK;
  out[COL_GUESS] = playerEntryColor(background);
  out[COL_PENCIL] = pencilColor(background);
  out[COL_ERROR] = ERROR;
  out[COL_ERRORBG] = ERROR_WASH;
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  // Both hint marks sit on a cell's own border, which is read against the board
  // rather than through it, so both take the palette's strong hint colors.
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

/** Highlight payload a Mathrax hint step carries (built in `index.ts`). The
 * element-type legend (docs/games/hints.md § "The element-type color legend"):
 * the clue's cells shaded `COL_HINT_CELL`, the acted-on cell ringed `COL_HINT`,
 * the ruled-out candidates struck through among the pencil marks. */
export interface MathraxHint {
  /** The cells the deduction reasons from — a clue's diagonal pair, all four
   * cells around an `E`/`O` clue, or a hidden single's line. A forcing chain's
   * cells additionally carry their place in it, drawn as an ordinal. */
  area: OrderedCell[];
  /** The cell(s) the deduction acts on, ringed `COL_HINT`. */
  targets: Point[];
  /** The candidate number(s) ruled out, shown struck among the pencil marks. */
  marks: { x: number; y: number; n: number }[];
}

// --- draw-only flags (upstream FD_*) ---------------------------------------

const FD_FLASH = 0x100;
/** Bits 9–10: the cell's `CellHighlight`. */
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
 * docs/games/input.md § "The accreting-paint drag"). */
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
  /** `o²` hint overlay: bit 0 = target cell, bit 1 = evidence, bits 2.. = the
   * struck-candidate mask (`hintMarkBit(n)`). Owns the chain ordinal and the
   * evidence outline lanes too (docs/games/rendering.md § "Overlay sidecars"). */
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
 * A clue circle straddles the corner and overlaps the band by a chord of a few
 * pixels. The circle is drawn first and the band over it, so a marked cell
 * reads as a highlighted grid line passing behind the clue, which is what the
 * unmarked frame already shows in `COL_BORDER`.
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
    error ? COL_ERRORBG : COL_HIGHLIGHT,
    error ? COL_ERROR : COL_BORDER,
  );
  dr.drawText({ x, y }, glyphFont((ts / 3) | 0), COL_BORDER, clueLabel(clue));
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
  hint: number,
): void {
  const ts = ds.tileSize;
  const o = state.params.o;
  const co = o - 1;
  const i = y * o + x;
  // Of the hint overlay, a tile draws only `struck`, the candidates this firing
  // rules out. The target's ring and the evidence outline are painted after the
  // tile loop, unclipped, so a neighbor's repaint cannot bury them.
  const struck = hint >> 2;
  const tx = origin(ts) + x * ts;
  const ty = origin(ts) + y * ts;
  const cell = { x: tx, y: ty, w: ts, h: ts };

  dr.clip(cell);
  dr.drawUpdate(cell);
  drawCellBackground(
    dr,
    cell,
    ((fs >> FD_HIGHLIGHT_SHIFT) & 3) as CellHighlight,
    COL_CURSOR,
    fs & FD_FLASH ? COL_FLASH : COL_BACKGROUND,
  );

  // The cell's own outline.
  dr.drawPolygon(
    [
      { x: tx, y: ty - 1 },
      { x: tx + ts, y: ty - 1 },
      { x: tx + ts, y: ty + ts - 1 },
      { x: tx, y: ty + ts - 1 },
    ],
    -1,
    COL_BORDER,
  );

  if (state.grid[i]) {
    dr.drawText(
      { x: tx + ((ts / 2) | 0), y: ty + ((ts / 2) | 0) },
      glyphFont((ts / 2) | 0),
      fs & F_IMMUTABLE ? COL_BORDER : fs & FE_COUNT ? COL_ERROR : COL_GUESS,
      String(state.grid[i]),
    );
  } else if (state.pencil[i]) {
    drawPencilMarks(dr, ts, tx, ty, state.pencil[i], o, struck);
  }

  // The (up to) four clues at this cell's corners, each colored by *this*
  // cell's error flag for that corner.
  if (y < o - 1 && x < o - 1)
    drawClue(dr, ts, state.clues[y * co + x], tx + ts, ty + ts, !!(fs & FE_BOTRIGHT));
  if (y > 0 && x < o - 1)
    drawClue(dr, ts, state.clues[(y - 1) * co + x], tx + ts, ty, !!(fs & FE_TOPRIGHT));
  if (y < o - 1 && x > 0)
    drawClue(dr, ts, state.clues[y * co + x - 1], tx, ty + ts, !!(fs & FE_BOTLEFT));
  if (y > 0 && x > 0)
    drawClue(dr, ts, state.clues[(y - 1) * co + x - 1], tx, ty, !!(fs & FE_TOPLEFT));

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
  let nhints = 0;
  for (let n = 1; n <= o; n++) if (marks & (1 << n)) nhints++;
  if (!nhints) return;

  let hw = 1;
  while (hw * hw < nhints) hw++;
  if (hw < 3) hw = 3;
  let hh = ((nhints + hw - 1) / hw) | 0;
  if (hh < 2) hh = 2;
  const hmax = Math.max(hw, hh);
  const fontsz = (ts / (((hmax * (11 - hmax)) / 8) | 0)) | 0;

  let j = 0;
  for (let n = 1; n <= o; n++) {
    if (!(marks & (1 << n))) continue;
    const hx = j % hw;
    const hy = (j / hw) | 0;
    const cx = tx + ((((4 * hx + 3) * ts) / (4 * hw + 2)) | 0);
    const cy = ty + ((((4 * hy + 3) * ts) / (4 * hh + 2)) | 0);
    // A struck candidate keeps its pencil color, so it still reads as the
    // player's note; the same-color strikethrough is what says the hint rules it
    // out (docs/games/hints.md § "The element-type color legend").
    dr.drawText({ x: cx, y: cy }, glyphFont(fontsz), COL_PENCIL, String(n));
    if (struck & (1 << n)) {
      const r = Math.max(2, (fontsz / 3) | 0);
      dr.drawLine({ x: cx - r, y: cy }, { x: cx + r, y: cy }, COL_PENCIL, 2);
    }
    j++;
  }
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
  flashTime: number,
  hint?: HintStep<MathraxMove, MathraxHint>,
  mistakes?: readonly Point[],
): void {
  const ts = ds.tileSize;
  const o = state.params.o;
  const size = computeSize({ o }, ts);
  const firstFrame = !ds.started;

  if (firstFrame) {
    // The engine paints no pixels of its own (docs/games/rendering.md § "The rendering doctrine") — the game fills
    // its whole canvas, then the black rectangle the cell outlines sit on.
    dr.drawRect({ x: 0, y: 0, w: size.w, h: size.h }, COL_BACKGROUND);
    dr.drawRect(
      { x: origin(ts), y: origin(ts) - 1, w: o * ts + 1, h: o * ts + 1 },
      COL_BORDER,
    );
    dr.drawUpdate({ x: 0, y: 0, w: size.w, h: size.h });
    ds.started = true;
  }

  const flash = flashTime > 0 ? Math.floor(flashTime / FLASH_FRAME) % 3 : -1;
  const index = (x: number, y: number): number => y * o + x;
  ds.wrong.packCells(mistakes ?? null, index);
  ds.hint.pack(hint?.highlights ?? null, index, (m) => hintMarkBit(m.n));

  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      const i = y * o + x;
      let fs = state.flags[i];

      if (flashTime > 0 && (x + y) % 3 === flash) fs |= FD_FLASH;
      if (flashTime === 0) fs |= cellHighlight(ui, x, y) << FD_HIGHLIGHT_SHIFT;

      const tile = state.grid[i] | (state.pencil[i] << 4) | (fs << 14);
      if (ds.tiles[i] !== tile || ds.wrong.stale(i) || ds.hint.stale(i)) {
        drawTile(dr, ds, state, x, y, fs, ds.wrong.at(i), ds.hint.packed[i]);
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
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_CELL,
  });

  repaintPencilIndicator(dr, ds, ui.pencilMode, PENCIL_BOX(o, ts), PENCIL_STYLE);
}
