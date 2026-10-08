/**
 * Range rendering: a per-cell diffed loop over pieces on a quiet surface
 * (`engine/piece.ts`). A cell is a grid-outlined surface, lifted under a clue
 * and, on the lit beats of the completion flash, under every cell; a shaded
 * cell holds the shaded piece, a cell marked clear holds the ruled-out cross,
 * and a clue holds its number. The keyboard cursor is corner brackets, out at
 * the cell's corners. Rule violations are
 * recomputed every frame via `findErrors` and framed in the error color —
 * Range highlights errors live, which is upstream behavior, not the fork's
 * Check & Save.
 */

import {
  CURSOR,
  cellSurface,
  ERROR,
  givenSurface,
  HINT_ACTION,
  HINT_BLACKREF,
  HINT_EVIDENCE,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  drawRectCorners,
  drawRectOutline,
  drawThickRectOutline,
  glyphFont,
} from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, drawRuledOutCross, SHADED_SHAPE } from "../../engine/piece.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { CLUE } from "./hint-text.ts";
import type { RangeHint } from "./index.ts";
import { findErrors } from "./solver.ts";
import {
  BLACK,
  type Cell,
  idx,
  type RangeMove,
  type RangeParams,
  type RangeState,
  type RangeUi,
  WHITE,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_TIME = 0.7;

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0; // the board around the grid
export const COL_GRID = 1; // the line between two cells, and the frame
export const COL_CELL = 2; // the surface of a cell the puzzle left open
/** The surface under a clue, and under every cell while the board flashes. */
export const COL_GIVEN = 3;
export const COL_SHADED = 4; // the piece in a shaded cell
export const COL_RULED_OUT = 5; // the cross in a cell marked clear
export const COL_TEXT = 6; // a clue's number
export const COL_ERROR = 7;
export const COL_CURSOR = 8;
export const COL_HINT = 9; // the cell the displayed hint forces — ringed
export const COL_HINT_CELL = 10; // the deduction's premise/area cells — outlined
export const COL_HINT_SHADEDREF = 11; // a cited shaded premise (doubled outline)

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_SHADED] = SHADED;
  out[COL_RULED_OUT] = RULED_OUT;
  // Ink, which inverts: the number is read against a surface, never
  // against a piece, since a clue cell is never shaded.
  out[COL_TEXT] = INK;
  out[COL_ERROR] = ERROR;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  // The cross-game "a shaded square is the reason" hue (Singles' too), apart
  // from the action ring so premise and move don't read as the same color.
  out[COL_HINT_SHADEDREF] = HINT_BLACKREF;
  return out;
}

// --- geometry --------------------------------------------------------------

/** The board's pixel origin. Exported so `interpretMove` reads the same number
 * the painter does — one function, both callers
 * ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export const border = (ts: number): number => Math.floor(ts / 2);

export function computeSize(p: RangeParams, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts), h: p.h * ts + 2 * border(ts) };
}

// --- draw state ------------------------------------------------------------

// Packed cache flags above the (value + 2) field (value + 2 ≥ 0; clues
// can reach ~w + h − 1).
const F_ERROR = 1 << 16;
const F_CURSOR = 1 << 17;
const F_FLASH = 1 << 18;
const F_MISTAKE = 1 << 19;
const F_HINT_CLUE = 1 << 21; // the clue driving the deduction — digit in COL_HINT
const F_HINT_HATCH = 1 << 24; // on the run the sentence names — hatched

/** A cell's role in the displayed hint, with its cache flag. The `target` is
 * the forced cell, shaded or clear alike (the narration says which mark),
 * ringed in COL_HINT; the `area` is the deduction's evidence, outlined in
 * COL_HINT_CELL; a `shadedRef` is a shaded premise cell, which keeps its piece
 * and takes a doubled outline in COL_HINT_SHADEDREF. */
const HINT_FLAG = { none: 0, target: 1 << 20, area: 1 << 22, shadedRef: 1 << 23 };
type HintKind = keyof typeof HINT_FLAG;

export interface RangeDrawState {
  tileSize: number;
  w: number;
  h: number;
  cache: Int32Array;
}

export function newDrawState(state: RangeState, tileSize: number): RangeDrawState {
  return {
    tileSize,
    w: state.w,
    h: state.h,
    cache: new Int32Array(state.w * state.h).fill(-1),
  };
}

// --- cell drawing ----------------------------------------------------------

function drawCell(
  dr: GameDrawing,
  ts: number,
  r: number,
  c: number,
  value: number,
  error: boolean,
  cursor: boolean,
  flash: boolean,
  hintKind: HintKind,
  /** This clue drives the displayed deduction, so its digit draws `COL_HINT`
   * (see `RangeHint.clue`). The clue is *inside* the outlined area or striped
   * run it drives, so it keeps that mark and changes only its digit. */
  clueRef = false,
  /** On the run the sentence names (`RangeHint.hatch`). */
  hatched = false,
): void {
  const b = border(ts);
  const x = b + ts * c;
  const y = b + ts * r;
  const tx = x + Math.floor(ts / 2);
  const ty = y + Math.floor(ts / 2);
  const box = { x: x + 1, y: y + 1, w: ts - 1, h: ts - 1 };

  // The surface says who put the cell's content there and never what state it
  // is in: lifted under a clue, plain everywhere else. The solved flash lifts
  // every cell, which reads in both schemes where a paper fill would sink into
  // a dark board. The cursor is corner brackets and no hint role is a
  // fill: a Range premise area runs along a clue's arms and takes in the clue
  // cell itself, whose digit the deduction counts.
  const surface = flash || value > 0 ? COL_GIVEN : COL_CELL;

  drawRectOutline(dr, x, y, ts + 1, ts + 1, COL_GRID);
  dr.drawRect(box, surface);
  if (hatched) dr.drawHatch(box, COL_HINT, hatchPeriod(ts));

  // Content before the marks, which sit at the cell's edge beside it. A
  // violation is told by the frame below, so a shaded piece keeps its color.
  if (value === BLACK) {
    drawPiece(dr, box, SHADED_SHAPE, COL_SHADED);
  } else if (value === WHITE) {
    drawRuledOutCross(dr, box, error ? COL_ERROR : COL_RULED_OUT);
  } else if (value > 0) {
    dr.drawText(
      { x: tx, y: ty },
      glyphFont(Math.floor((ts * 3) / 5)),
      error ? COL_ERROR : clueRef ? COL_HINT : COL_TEXT,
      String(value),
    );
  }

  const thick = Math.max(2, ts >> 4);
  if (error) drawThickRectOutline(dr, box.x, box.y, box.w, box.h, thick, COL_ERROR);
  // Out at the corners of the cell, clear of the piece.
  if (cursor) drawRectCorners(dr, tx, ty, Math.floor(ts / 2) - 2, COL_CURSOR, thick);

  // The hint marks sit on the cell's own border. A shaded premise gets a
  // doubled inset outline so "this shaded square is the reason" reads distinct
  // from the ring of the forced move. The target is never previewed with its
  // mark: a placed piece or cross would read as already done, so the narration
  // says which mark and auto-hint applies it for real.
  const band = { box, outer: 0, inner: thick };
  if (hintKind === "area") drawMarkSides(dr, band, MARK_ALL, COL_HINT_CELL);
  if (hintKind === "target") drawMarkSides(dr, band, MARK_ALL, COL_HINT);
  if (hintKind === "shadedRef") {
    drawRectOutline(dr, x + 1, y + 1, ts - 1, ts - 1, COL_HINT_SHADEDREF);
    drawRectOutline(dr, x + 2, y + 2, ts - 3, ts - 3, COL_HINT_SHADEDREF);
  }

  dr.drawUpdate({ x, y, w: ts + 1, h: ts + 1 });
}

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: RangeDrawState,
  _prev: RangeState | null,
  state: RangeState,
  _dir: number,
  ui: RangeUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<RangeMove, RangeHint>,
  mistakes?: readonly Cell[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid } = state;

  // Whole-board flash pulse: lift every cell on alternate
  // beats of the flash.
  const flash = flashTime > 0 && Math.floor((flashTime * 5) / FLASH_TIME) % 2 === 1;

  const errors: boolean[] = new Array(w * h).fill(false);
  findErrors(grid, w, h, errors);

  // Check & Save mistakes (cells contradicting the unique solution) are
  // highlighted the same red as live rule violations.
  const mistakeSet = mistakes ? new Set(mistakes.map((m) => idx(m.r, m.c, w))) : null;

  const marks = stepMarks(hint);
  const at = (p: Point): number => idx(p.y, p.x, w);
  const hintTarget = new Set(marks.of("ring", CELL).map(at));
  const hintOutline = new Set(marks.of("outline", CELL).map(at));
  const hintClue = new Set(marks.of("outline", CLUE).map(at));
  const hintHatch = new Set(marks.of("stripes", CELL).map(at));

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = idx(r, c, w);
      const value = grid[i];
      const error = errors[i];
      const mistake = mistakeSet?.has(i) ?? false;
      const cursor = ui.cursor.visible && r === ui.cursor.y && c === ui.cursor.x;
      // An outlined shaded square is a premise, which keeps its piece and
      // takes the doubled outline.
      const hintKind: HintKind = hintTarget.has(i)
        ? "target"
        : hintOutline.has(i)
          ? value === BLACK
            ? "shadedRef"
            : "area"
          : "none";
      const clueRef = hintClue.has(i);
      const hatched = hintHatch.has(i);

      let packed = (value + 2) | HINT_FLAG[hintKind];
      if (error) packed |= F_ERROR;
      if (cursor) packed |= F_CURSOR;
      if (flash) packed |= F_FLASH;
      if (mistake) packed |= F_MISTAKE;
      if (clueRef) packed |= F_HINT_CLUE;
      if (hatched) packed |= F_HINT_HATCH;

      if (ds.cache[i] !== packed) {
        drawCell(
          dr,
          ts,
          r,
          c,
          value,
          error || mistake,
          cursor,
          flash,
          hintKind,
          clueRef,
          hatched,
        );
        ds.cache[i] = packed;
      }
    }
  }
}
