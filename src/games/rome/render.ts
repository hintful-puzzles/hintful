/**
 * Rome rendering — port of `game_redraw` / `rome_draw_arrow` in
 * `puzzles/unreleased/rome.c`.
 *
 * ## The grid lines are negative space, not strokes
 *
 * Nothing here draws a grid line. The first frame floods the whole canvas with
 * `COL_BORDER`, and every square then paints its own background rect *inset*
 * by `GRIDEXTRA` on each side that borders a different outlined region (and by
 * one pixel everywhere else, since `cw = tileSize - 1`). What is left showing
 * through is the grid: a hairline between squares of one region, a double-width
 * line along a region boundary. So the region outlines cost no drawing code at
 * all — they fall out of four comparisons of the region forest.
 *
 * ## Borders
 *
 * `BORDER` is upstream's `NARROW_BORDERS` arm, `GRIDEXTRA * 2` — **not** the
 * desktop `tileSize / 2` — and `computeSize` subtracts `GRIDEXTRA * 2` back off
 * because the outer grid outline is drawn inside the border area.
 *
 * ## Colors
 *
 * The `COL_*` indices are upstream's; the colors are the shared palette's
 * meanings (docs/games/rendering.md § "The palette: three layers, meaning
 * first").
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { BLUE, BLUE_BOLD } from "../../engine/color/colors.ts";
import {
  ERROR,
  ERROR_WASH,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  pencilColor,
  playerEntryColor,
} from "../../engine/color/palette.ts";
import { romeGoalBackground } from "../../engine/color/palette-games.ts";
import { drawRectOutline } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import { drawHintOrdinal } from "../../engine/hint-ordinal.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  hintMarkBit,
  OverlaySidecar,
} from "../../engine/overlay-sidecar.ts";
import type { Color, Size } from "../../engine/types.ts";
import type { RomeHint } from "./hint.ts";
import type { RomeMistake } from "./index.ts";
import {
  EMPTY,
  FD_CURSOR,
  FD_ENTRY,
  FD_KBMASK,
  FD_PENCIL,
  FD_PLACE,
  FD_TOGOAL,
  FE_BOUNDS,
  FE_DOUBLE,
  FE_LOOP,
  FM_ARROWMASK,
  FM_DOWN,
  FM_FIXED,
  FM_GOAL,
  FM_LEFT,
  FM_RIGHT,
  FM_UP,
  KEYMODE_PENCIL,
  KEYMODE_PLACE,
  MOUSEMODE_PENCIL,
  MOUSEMODE_PLACE,
  type RomeMove,
  type RomeParams,
  type RomeState,
  type RomeUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

const GRIDEXTRA = 1;
/** `NARROW_BORDERS` arm: the top/left grid outline is drawn in the border. */
export const BORDER = GRIDEXTRA * 2;

const FLASH_FRAME = 0.1;
export const FLASH_TIME = 0.7;

/** Arrow head half-width, as a fraction of the arrow's half-length. */
const SIDE_SIZE = 0.6;

// --- palette (upstream COL_* enum, index for index) -------------------------

export const COL_BACKGROUND = 0;
export const COL_HIGHLIGHT = 1;
export const COL_LOWLIGHT = 2;
export const COL_BORDER = 3;
export const COL_ARROW_FIXED = 4;
export const COL_ARROW_GUESS = 5;
export const COL_ARROW_ERROR = 6;
export const COL_ARROW_PENCIL = 7;
export const COL_ARROW_ENTRY = 8;
export const COL_ERRORBG = 9;
export const COL_GOALBG = 10;
export const COL_GOAL = 11;
/** The square a hint's deduction acts on, ringed (fork addition). */
export const COL_HINT = 12;
/** The area a hint reasons from, outlined (fork addition). */
export const COL_HINT_CELL = 13;

export function colors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_HIGHLIGHT] = highlight;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_BORDER] = INK;
  out[COL_ARROW_FIXED] = INK;
  out[COL_ARROW_GUESS] = playerEntryColor(background);
  out[COL_ARROW_ERROR] = ERROR;
  out[COL_ARROW_PENCIL] = pencilColor(background);
  out[COL_ARROW_ENTRY] = BLUE;
  out[COL_ERRORBG] = ERROR_WASH;
  out[COL_GOALBG] = romeGoalBackground(background);
  out[COL_GOAL] = BLUE_BOLD;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

// --- geometry ---------------------------------------------------------------

export function computeSize(p: RomeParams, ts: number): Size {
  // Compensate for the outer grid outline drawn in the border area.
  return {
    w: p.w * ts + 2 * BORDER - GRIDEXTRA * 2,
    h: p.h * ts + 2 * BORDER - GRIDEXTRA * 2,
  };
}

// --- draw state -------------------------------------------------------------

/** Mistake-overlay bit (the only one; `OverlaySidecar` keeps it in the diff
 * key so the highlight paints on a frame where nothing else changed). */
const HB_MISTAKE = 1;

export interface RomeDrawState {
  started: boolean;
  tileSize: number;
  /** Packed `(effective cell, effective marks, flash phase)` per square. */
  cache: Int32Array;
  mistakes: OverlaySidecar;
  /** Hint overlay (fork addition): bit 0 = the square acted on, bit 1 =
   * evidence, bits 2.. = the arrow marks this firing rules out. */
  hint: OverlaySidecar;
  /** The hint's ring and outline, painted after the square loop. */
  marks: HintMarks;
}

export function newDrawState(state: RomeState, tileSize: number): RomeDrawState {
  const s = state.w * state.h;
  return {
    started: false,
    tileSize,
    cache: new Int32Array(s).fill(-1),
    mistakes: new OverlaySidecar(s),
    hint: new OverlaySidecar(s),
    marks: new HintMarks(),
  };
}

/**
 * Where a square's hint band sits: **inside** its content box, over pixels the
 * square's own painter fills.
 *
 * Rome's grid lines are negative space — the first frame floods `COL_BORDER`
 * and every square paints its background inset into it — so the gutter between
 * two squares is the *region outline*, and a mark drawn there would erase a
 * region boundary that nothing repaints. Insetting by `2 * GRIDEXTRA` clears
 * the widest inset any square takes (`GRIDEXTRA` on a boundary side, plus
 * `GRIDEXTRA * 2` off the far edge), so the band is always strictly within the
 * background rect and the square's own repaint undoes it. That is why no
 * `gutterColor` is passed.
 */
function markBand(ds: RomeDrawState, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  const inset = GRIDEXTRA * 2;
  return {
    box: {
      x: BORDER + x * ts + inset,
      y: BORDER + y * ts + inset,
      w: ts - 1 - 2 * inset,
      h: ts - 1 - 2 * inset,
    },
    outer: 0,
    inner: Math.max(2, Math.floor(ts / 14)),
  };
}

// --- primitives -------------------------------------------------------------

function line(
  dr: GameDrawing,
  thick: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: number,
): void {
  dr.drawLine(
    { x: Math.round(x1), y: Math.round(y1) },
    { x: Math.round(x2), y: Math.round(y2) },
    color,
    thick,
  );
}

/**
 * An arrow centered on `(tx, ty)` with half-length `size`: a shaft plus two
 * head strokes. `ink` of `-1` picks the color from the cell's own bits — an
 * in-progress mouse entry is blue, a fixed clue black, a duplicated arrow red,
 * and a player's own arrow green.
 */
export function drawArrow(
  dr: GameDrawing,
  tx: number,
  ty: number,
  size: number,
  data: number,
  ink: number,
): void {
  const thick = size <= 8 ? 1 : 2;
  const sd = size * SIDE_SIZE;
  const color =
    ink !== -1
      ? ink
      : data & FD_ENTRY
        ? COL_ARROW_ENTRY
        : data & FM_FIXED
          ? COL_ARROW_FIXED
          : data & FE_DOUBLE
            ? COL_ARROW_ERROR
            : COL_ARROW_GUESS;

  if (data & (FM_UP | FM_DOWN)) line(dr, thick, tx, ty - size, tx, ty + size, color);
  else line(dr, thick, tx - size, ty, tx + size, ty, color);

  if (data & FM_UP) {
    line(dr, thick, tx, ty - size, tx - sd, ty, color);
    line(dr, thick, tx, ty - size, tx + sd, ty, color);
  }
  if (data & FM_LEFT) {
    line(dr, thick, tx, ty - sd, tx - size, ty, color);
    line(dr, thick, tx, ty + sd, tx - size, ty, color);
  }
  if (data & FM_RIGHT) {
    line(dr, thick, tx, ty - sd, tx + size, ty, color);
    line(dr, thick, tx, ty + sd, tx + size, ty, color);
  }
  if (data & FM_DOWN) {
    line(dr, thick, tx, ty + size, tx - sd, ty, color);
    line(dr, thick, tx, ty + size, tx + sd, ty, color);
  }
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: RomeDrawState,
  _prev: RomeState | null,
  state: RomeState,
  _dir: number,
  ui: RomeUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<RomeMove, RomeHint>,
  mistakes?: readonly RomeMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid, pencil, regions } = state;

  // The win animation hides the *displayed* cursor while leaving `ui.cursor`
  // alone, because the cursor still feeds the cell value and so the cache key.
  // Upstream keeps the two apart the same way, through a local copy.
  let flash = -1;
  let cursorShown = ui.cursor.visible;
  if (flashTime > 0) {
    flash = Math.floor(flashTime / FLASH_FRAME) % 3;
    cursorShown = false;
  }

  if (!ds.started) {
    const fullW = w * ts + 2 * BORDER;
    const fullH = h * ts + 2 * BORDER;
    dr.drawRect({ x: 0, y: 0, w: fullW, h: fullH }, COL_BACKGROUND);
    dr.drawUpdate({ x: 0, y: 0, w: fullW, h: fullH });
    // The grid: every square's own rect is inset into this, so what survives
    // is the outline.
    dr.drawRect(
      {
        x: BORDER - GRIDEXTRA * 2,
        y: BORDER - GRIDEXTRA * 2,
        w: w * ts + GRIDEXTRA * 2,
        h: h * ts + GRIDEXTRA * 2,
      },
      COL_BORDER,
    );
    ds.started = true;
  }

  ds.mistakes.clear();
  if (mistakes) {
    for (const m of mistakes) ds.mistakes.add(m.index, HB_MISTAKE);
  }
  ds.hint.pack(
    hint?.highlights ?? null,
    (hx, hy) => hy * w + hx,
    (m) => hintMarkBit(m.n),
  );

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      const onHighlight = ui.cursor.x === x && ui.cursor.y === y;
      let c = grid[i1];
      let p = pencil[i1];

      // The in-flight mouse drag previews its direction in place.
      if (ui.mmode === MOUSEMODE_PLACE && onHighlight) {
        c = ui.mdir | FD_ENTRY;
      } else if (ui.mmode === MOUSEMODE_PENCIL && onHighlight) {
        if (ui.mdir !== EMPTY) p ^= ui.mdir;
        else p |= FD_ENTRY;
      }
      if (ui.cursor.visible && onHighlight) {
        c |=
          ui.kmode === KEYMODE_PLACE
            ? FD_PLACE
            : ui.kmode === KEYMODE_PENCIL
              ? FD_PENCIL
              : FD_CURSOR;
      }

      const key =
        (c & 0x7fff) |
        (((p >> 2) & 0xf) << 15) |
        ((p & FD_ENTRY ? 1 : 0) << 19) |
        ((flash + 1) << 20);
      if (ds.cache[i1] === key && !ds.mistakes.stale(i1) && !ds.hint.stale(i1))
        continue;
      ds.cache[i1] = key;
      ds.mistakes.commit(i1);
      ds.hint.commit(i1);

      let cx = BORDER + x * ts;
      let cy = BORDER + y * ts;
      let cw = ts - 1;
      let ch = ts - 1;
      dr.drawUpdate({ x: cx, y: cy, w: cw, h: ch });

      let color: number;
      if (flash === -1) {
        color =
          ui.sloops && grid[i1] & FE_LOOP
            ? COL_ERRORBG
            : ui.sgoals && grid[i1] & FD_TOGOAL
              ? COL_GOALBG
              : grid[i1] & FE_BOUNDS
                ? COL_ERRORBG
                : COL_BACKGROUND;
        if (cursorShown && onHighlight) {
          color = ui.kmode === KEYMODE_PLACE ? COL_HIGHLIGHT : COL_LOWLIGHT;
        }
      } else {
        color =
          (x + y) % 3 === flash
            ? COL_BACKGROUND
            : (x + y + 1) % 3 === flash
              ? COL_LOWLIGHT
              : COL_HIGHLIGHT;
      }

      // Inset each side that meets a different region, leaving the outline.
      if (x === 0 || !regions.equivalent(i1, i1 - 1)) {
        cx += GRIDEXTRA;
        cw -= GRIDEXTRA;
      }
      if (x === w - 1 || !regions.equivalent(i1, i1 + 1)) cw -= GRIDEXTRA * 2;
      if (y === 0 || !regions.equivalent(i1, i1 - w)) {
        cy += GRIDEXTRA;
        ch -= GRIDEXTRA;
      }
      if (y === h - 1 || !regions.equivalent(i1, i1 + w)) ch -= GRIDEXTRA * 2;

      dr.drawRect({ x: cx, y: cy, w: cw, h: ch }, color);

      const midX = BORDER + x * ts + Math.floor(ts / 2);
      const midY = BORDER + y * ts + Math.floor(ts / 2);

      if (cursorShown && ui.kmode === KEYMODE_PENCIL && onHighlight) {
        dr.drawText(
          { x: midX, y: midY },
          {
            align: "center",
            baseline: "mathematical",
            fontType: "fixed",
            size: Math.trunc(ts / 1.8),
          },
          COL_HIGHLIGHT,
          "?",
        );
      }

      // Pencil marks show only on a square with no arrow or goal of its own.
      if ((c & FD_KBMASK) === c) {
        const q = ts * 0.12;
        // A mark this hint rules out keeps its own color and takes a
        // strikethrough in the same color — the collection's "ruled out" cue
        // (docs/games/hints.md § "The element-type color legend"). The hint
        // says what to cross off; it never crosses it off for the player.
        const struck = ds.hint.packed[i1];
        const markAt = (bit: number, mx: number, my: number, n: number): void => {
          if (!(p & bit)) return;
          drawArrow(dr, mx, my, q, bit, COL_ARROW_PENCIL);
          if (struck & hintMarkBit(n)) {
            line(dr, 1, mx - q, my + q, mx + q, my - q, COL_ARROW_PENCIL);
          }
        };
        markAt(FM_UP, midX, BORDER + y * ts + Math.floor(ts / 4), 1);
        markAt(FM_DOWN, midX, BORDER + y * ts + Math.floor((3 * ts) / 4), 2);
        markAt(FM_LEFT, BORDER + x * ts + Math.floor(ts / 4), midY, 3);
        markAt(FM_RIGHT, BORDER + x * ts + Math.floor((3 * ts) / 4), midY, 4);
        if (p & FD_ENTRY) {
          dr.drawRect({ x: midX - 2, y: midY - 2, w: 4, h: 4 }, COL_ARROW_PENCIL);
        }
      }

      if (c & FM_GOAL) {
        dr.drawCircle({ x: midX, y: midY }, Math.floor(ts / 3), COL_GOAL, COL_GOAL);
      } else if (c & FM_ARROWMASK) {
        drawArrow(dr, midX, midY, ts * 0.3, c, -1);
      } else if (c & FD_ENTRY) {
        dr.drawRect({ x: midX - 2, y: midY - 2, w: 4, h: 4 }, COL_ARROW_ENTRY);
      }

      // Check & Save's mistake overlay. Upstream already reds a duplicated
      // arrow and an off-grid arrow's background as you play; the inset ring
      // is what makes the *other* kind visible — a legal-looking arrow that
      // contradicts the unique solution has nothing to recolor.
      if (ds.mistakes.packed[i1] & HB_MISTAKE) {
        const inset = Math.max(2, Math.floor(ts / 10));
        drawRectOutline(
          dr,
          BORDER + x * ts + inset,
          BORDER + y * ts + inset,
          ts - 1 - 2 * inset,
          ts - 1 - 2 * inset,
          COL_ARROW_ERROR,
        );
      }

      // A loop firing shades the arrow chain that leads back here, and the
      // ordinal is what makes it a chain the player can walk rather than a heap
      // of squares (docs/games/hints.md § "Number the chain").
      const order = ds.hint.order[i1];
      if (order > 0) {
        drawHintOrdinal(dr, { x: cx, y: cy }, ts, order, COL_HINT_CELL);
      }
    }
  }

  // The ring and the evidence outline, after the square loop: a band sits over
  // the square's own background, so it has to be painted once the background is
  // down, and once per frame rather than once per square.
  const targets: MarkCell[] = [];
  const evidence: MarkCell[] = [];
  for (let i = 0; i < w * h; i++) {
    const cell = { x: i % w, y: (i / w) | 0 };
    if (ds.hint.packed[i] & HINT_TARGET) targets.push(cell);
    if (ds.hint.packed[i] & HINT_AREA) evidence.push(cell);
  }
  ds.marks.paint(dr, targets, evidence, {
    band: (bx, by) => markBand(ds, bx, by),
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_CELL,
  });
}
