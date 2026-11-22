/**
 * Rome rendering — port of `game_redraw` / `rome_draw_arrow` in
 * `puzzles/unreleased/rome.c`.
 *
 * ## The grid lines are negative space, not strokes
 *
 * Nothing here draws a region outline. The first frame floods the board with
 * `COL_BORDER`, and every square then paints its own surface *inset* by
 * `GRIDEXTRA` on each side that borders a different outlined region (and by
 * one pixel everywhere else, since `cw = tileSize - 1`). What is left showing
 * through along a region boundary is the outline, which is content and stays
 * strong. The hairline between two squares of one region is not: each square
 * paints it in `COL_GRID` on its own right and bottom edge.
 *
 * ## Borders
 *
 * `BORDER` is upstream's `NARROW_BORDERS` arm, `GRIDEXTRA * 2` — **not** the
 * desktop `tileSize / 2` — and `computeSize` subtracts `GRIDEXTRA * 2` back off
 * because the outer grid outline is drawn inside the border area.
 *
 * Two pixels is not enough to hold the pencil-mode indicator, so the canvas is
 * grown for it on every side and the board starts at {@link origin} rather than
 * at `BORDER`. Every drawing site reads `origin`; `BORDER` remains only the
 * inner part of it.
 *
 * ## Colors
 *
 * The colors are the shared palette's meanings (docs/rendering.md § "The palette: three layers, meaning
 * first").
 */

import { valueBit } from "../../engine/board/candidate-bits.ts";
import { BLUE } from "../../engine/color/colors.ts";
import {
  cellSurface,
  ERROR_WASH,
  GOAL,
  GOAL_WASH,
  givenSurface,
  highlightWash,
  INK,
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
import type { Frame, GameDrawing } from "../../engine/contract/game.ts";
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
  HIGHLIGHT_NOTES,
  winHighlight,
} from "../../engine/mechanics/note-taking-cell.ts";
import { drawRectOutline, drawStrike } from "../../engine/render/draw.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
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
import { sweepStep } from "../../engine/render/win-wave.ts";
import type { RomeHint } from "./hint.ts";
import type { RomeMistake } from "./index.ts";
import { ruleBreaks } from "./solver.ts";
import {
  EMPTY,
  FD_ENTRY,
  FM_ARROWMASK,
  FM_DOWN,
  FM_FIXED,
  FM_GOAL,
  FM_LEFT,
  FM_RIGHT,
  FM_UP,
  KEYMODE_MOVE,
  KEYMODE_PENCIL,
  leadsHome,
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

/**
 * Where the board starts, in canvas pixels: {@link BORDER} plus the room the
 * pencil-mode indicator needs.
 *
 * Rome's own border is two pixels, so it had nothing to lend the indicator's
 * top-right corner, and `pencilIndicatorCanvas` grows the canvas on **every**
 * side rather than one so the board keeps equal margins instead of being pushed
 * off-center. Every drawing site and `fromCoord` reads this rather than
 * `BORDER`; the two differ only by that margin.
 */
export function origin(ts: number): number {
  return pencilIndicatorReach(ts) + BORDER;
}

/** Arrow head half-width, as a fraction of the arrow's half-length. */
const SIDE_SIZE = 0.6;

// --- palette ----------------------------------------------------------------

// An arrow in error is `COL_ERROR`.
/** The surface of a square the player fills. */
const COL_CELL = FIRST_GAME_SLOT;
/** The lifted surface under an arrow the puzzle fixed, and under the goal. */
const COL_GIVEN = FIRST_GAME_SLOT + 1;
/** A region's outline, and the frame, which is the outer regions' outline. */
export const COL_BORDER = FIRST_GAME_SLOT + 2;
export const COL_ARROW_FIXED = FIRST_GAME_SLOT + 3;
export const COL_ARROW_GUESS = FIRST_GAME_SLOT + 4;
export const COL_ARROW_PENCIL = FIRST_GAME_SLOT + 5;
export const COL_ARROW_ENTRY = FIRST_GAME_SLOT + 6;
export const COL_ERRORBG = FIRST_GAME_SLOT + 7;
export const COL_GOALBG = FIRST_GAME_SLOT + 8;
export const COL_GOAL = FIRST_GAME_SLOT + 9;
/** The selected square's wash, and its notes triangle: a fill under the arrow
 * and its marks, the note-taking cell's "you are here" wash, which every game
 * in that mechanic shares, and not the cursor role's green mark. */
export const COL_HIGHLIGHT_WASH = FIRST_GAME_SLOT + 10;
/** The thin line between two squares of one region. */
const COL_GRID = FIRST_GAME_SLOT + 11;

export function colors(background: Color): Color[] {
  const out = rolePalette(background);
  out[COL_CELL] = cellSurface(background);
  out[COL_GIVEN] = givenSurface(background);
  out[COL_GRID] = surfaceGrid(background);
  out[COL_BORDER] = INK;
  out[COL_ARROW_FIXED] = INK;
  out[COL_ARROW_GUESS] = playerEntryColor(background);
  out[COL_ARROW_PENCIL] = pencilColor(background);
  out[COL_ARROW_ENTRY] = BLUE;
  out[COL_ERRORBG] = ERROR_WASH;
  out[COL_GOALBG] = GOAL_WASH;
  out[COL_GOAL] = GOAL;
  out[COL_HIGHLIGHT_WASH] = highlightWash(background);
  return out;
}

// --- geometry ---------------------------------------------------------------

export function computeSize(p: RomeParams, ts: number): Size {
  // Compensate for the outer grid outline drawn in the border area, then grow
  // the canvas for the pencil-mode indicator's corner ({@link origin}).
  return pencilIndicatorCanvas(
    {
      w: p.w * ts + 2 * BORDER - GRIDEXTRA * 2,
      h: p.h * ts + 2 * BORDER - GRIDEXTRA * 2,
    },
    ts,
  );
}

// --- draw state -------------------------------------------------------------

/** Mistake-overlay bit (the only one; `OverlaySidecar` keeps it in the diff
 * key so the highlight paints on a frame where nothing else changed). */
const HB_MISTAKE = 1;

export interface RomeDrawState {
  tileSize: number;
  /** Packed `(effective cell, effective marks, highlight)` per square, and
   * the mistake and hint overlays on it. */
  tiles: TileCache;
  mistakes: OverlaySidecar;
  /** Hint overlay (fork addition): bit 0 = the square acted on, bit 1 =
   * evidence, and in its `struck` lane the arrow marks this firing rules out
   * (`valueBit(n)`). */
  hint: OverlaySidecar;
  /** The hint's ring and outline, painted after the square loop. */
  marks: HintMarks;
  /** What the pencil-mode indicator shows; `null` = never painted. */
  pencilModeShown: boolean | null;
}

export function newDrawState(state: RomeState, tileSize: number): RomeDrawState {
  const s = state.w * state.h;
  const mistakes = new OverlaySidecar(s);
  const hint = new OverlaySidecar(s);
  return {
    tileSize,
    tiles: new TileCache(s, { overlays: [mistakes, hint] }),
    mistakes,
    hint,
    marks: new HintMarks(),
    pencilModeShown: null,
  };
}

/** The pencil-mode indicator's colors: the pencil body in Rome's own mark
 * color, so the glyph reads as "this is what your drag will draw". */
const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_ARROW_PENCIL,
  ink: COL_BORDER,
};

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
 * background rect and the square's own repaint undoes it. That is why it has
 * no erase phase (`HintMarks.eraseBeforeTiles`).
 */
function markBand(ds: RomeDrawState, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  const inset = GRIDEXTRA * 2;
  return {
    box: {
      x: origin(ts) + x * ts + inset,
      y: origin(ts) + y * ts + inset,
      w: ts - 1 - 2 * inset,
      h: ts - 1 - 2 * inset,
    },
    outer: 0,
    inner: Math.max(2, Math.floor(ts / 14)),
  };
}

/** Where an armed keyboard cursor's `?` goes in square `(x, y)`: the
 * arguments `drawText` takes but the color, so the tile and a hint's ring
 * read one place. */
function armedText(
  ts: number,
  x: number,
  y: number,
): { origin: Point; options: DrawTextOptions } {
  const ox = origin(ts);
  return {
    origin: {
      x: ox + x * ts + Math.floor(ts / 2),
      y: ox + y * ts + Math.floor(ts / 2),
    },
    options: {
      align: "center",
      baseline: "mathematical",
      fontType: "fixed",
      size: Math.trunc(ts / 1.8),
    },
  };
}

/** The text square `(x, y)` shows, for a hint's ring to keep clear of: only
 * the armed cursor's `?`, since arrows and their marks are strokes. */
function squareText(ts: number, armed: Point | null, x: number, y: number): RingClear {
  if (!armed || armed.x !== x || armed.y !== y) return NOTHING_TO_CLEAR;
  const { origin: at, options } = armedText(ts, x, y);
  return { enclose: [textBox(at, options, "?")], avoid: [] };
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
function drawArrow(
  dr: GameDrawing,
  tx: number,
  ty: number,
  size: number,
  data: number,
  ink: number,
): void {
  // A pencil arrow is 0.12 of a tile, and a hairline one is hard to see on
  // the cell surface: two pixels from a 34-pixel tile up.
  const thick = size <= 4 ? 1 : 2;
  const sd = size * SIDE_SIZE;
  const color =
    ink !== -1
      ? ink
      : data & FD_ENTRY
        ? COL_ARROW_ENTRY
        : data & FM_FIXED
          ? COL_ARROW_FIXED
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
  frame: Frame<RomeState, RomeUi, RomeMove, RomeHint, RomeMistake>,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const ox = origin(ts);
  const { w, h, grid, pencil, regions } = state;

  // The win flash hides the displayed highlight while leaving `ui.cursor`
  // alone, as upstream does through a local copy.
  const cursorShown = ui.cursor.visible && !flash.winning;

  if (ds.tiles.firstFrame()) {
    // The grid: every square's own rect is inset into this, so what survives
    // is the outline.
    dr.drawRect(
      {
        x: ox - GRIDEXTRA * 2,
        y: ox - GRIDEXTRA * 2,
        w: w * ts + GRIDEXTRA * 2,
        h: h * ts + GRIDEXTRA * 2,
      },
      COL_BORDER,
    );
  }

  ds.mistakes.clear();
  if (mistakes) {
    for (const m of mistakes) ds.mistakes.add(m.index, HB_MISTAKE);
  }
  ds.hint.pack(
    stepMarks(hint),
    (hx, hy) => hy * w + hx,
    (m) => valueBit(m.n),
  );

  const breaks = ruleBreaks(state);
  const home = ui.sgoals ? leadsHome(state) : null;

  // The square showing the armed cursor's `?` this frame, for the ring.
  let armedAt: Point | null = null;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      const grabbed = ui.mx === x && ui.my === y;
      let c = grid[i1];
      let p = pencil[i1];

      // The in-flight mouse drag previews its direction in place, on the square
      // it was grabbed from — which is the drag's own and not the selection.
      if (ui.mmode === MOUSEMODE_PLACE && grabbed) {
        c = ui.mdir | FD_ENTRY;
      } else if (ui.mmode === MOUSEMODE_PENCIL && grabbed) {
        if (ui.mdir !== EMPTY) p ^= ui.mdir;
        else p |= FD_ENTRY;
      }
      // The one-shot keyboard arm for a mark is notes too, as far as the
      // picture goes; either arm also shows a `?` for the direction it awaits.
      let highlight: CellHighlight = cursorShown
        ? cellHighlight(ui, x, y)
        : HIGHLIGHT_NONE;
      if (highlight !== HIGHLIGHT_NONE && ui.kmode === KEYMODE_PENCIL)
        highlight = HIGHLIGHT_NOTES;
      const armed = highlight !== HIGHLIGHT_NONE && ui.kmode !== KEYMODE_MOVE;
      if (armed) armedAt = { x, y };
      highlight = winHighlight(flash.win(sweepStep(x, y))) ?? highlight;

      // A given is told by the square under it.
      const surface = grid[i1] & FM_FIXED ? COL_GIVEN : COL_CELL;
      const color =
        ui.sloops && breaks.loop.has(i1)
          ? COL_ERRORBG
          : home?.[i1]
            ? COL_GOALBG
            : breaks.bounds.has(i1)
              ? COL_ERRORBG
              : surface;
      // A repeated arrow is red, a given's and a drag's preview aside.
      const ink =
        c === grid[i1] && !(c & FM_FIXED) && breaks.double.has(i1) ? COL_ERROR : -1;

      const key =
        (c & 0x7fff) |
        (((p >> 2) & 0xf) << 15) |
        ((p & FD_ENTRY ? 1 : 0) << 19) |
        (highlight << 20) |
        ((armed ? 1 : 0) << 24) |
        ((color === COL_ERRORBG ? 1 : color === COL_GOALBG ? 2 : 0) << 25) |
        ((ink === COL_ERROR ? 1 : 0) << 27);
      if (!ds.tiles.changed(i1, key)) continue;

      let cx = ox + x * ts;
      let cy = ox + y * ts;
      let cw = ts - 1;
      let ch = ts - 1;
      dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });

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

      // The line on the square's right and bottom edge is the outline where
      // the neighbor is another region, which the inset leaves in the flood's
      // color, and the thin grid line where it is the same one.
      const sameRight = x + 1 < w && regions.equivalent(i1, i1 + 1);
      const sameBelow = y + 1 < h && regions.equivalent(i1, i1 + w);
      if (sameRight) {
        // Through the crossing below it, unless an outline turns there.
        const through = sameBelow && regions.equivalent(i1, i1 + w + 1);
        dr.drawRect(
          { x: ox + x * ts + ts - 1, y: cy, w: 1, h: through ? ch + 1 : ch },
          COL_GRID,
        );
      }
      if (sameBelow)
        dr.drawRect({ x: cx, y: ox + y * ts + ts - 1, w: cw, h: 1 }, COL_GRID);

      drawCellBackground(
        dr,
        { x: cx, y: cy, w: cw, h: ch },
        highlight,
        COL_HIGHLIGHT_WASH,
        color,
      );
      ds.hint.drawHatch(dr, i1, { x: cx, y: cy, w: cw, h: ch }, ts);

      // A square whose *diagonal* neighbor is in another region owes that
      // corner the piece of outline where the two outlines round it meet. An
      // outline takes `near` of a tile's top and left and `far` of its right
      // and bottom, so the piece is as large as the sides it sits on. Without
      // it the turn is joined only by the grid line, which is too quiet to
      // close it.
      const tx = ox + x * ts;
      const ty = ox + y * ts;
      const near = GRIDEXTRA;
      const far = GRIDEXTRA * 3;
      const corner = (px: number, py: number, pw: number, ph: number) =>
        dr.drawRect({ x: px, y: py, w: pw, h: ph }, COL_BORDER);
      if (x > 0 && y > 0 && !regions.equivalent(i1, i1 - w - 1))
        corner(tx, ty, near, near);
      if (x + 1 < w && y > 0 && !regions.equivalent(i1, i1 - w + 1))
        corner(tx + ts - far, ty, far, near);
      if (x > 0 && y + 1 < h && !regions.equivalent(i1, i1 + w - 1))
        corner(tx, ty + ts - far, near, far);
      if (x + 1 < w && y + 1 < h && !regions.equivalent(i1, i1 + w + 1))
        corner(tx + ts - far, ty + ts - far, far, far);

      const midX = ox + x * ts + Math.floor(ts / 2);
      const midY = ox + y * ts + Math.floor(ts / 2);

      // An armed keyboard cursor awaits a direction: a `?` in the ink of the
      // arrow or the mark that direction will make.
      if (armed) {
        const { origin: at, options } = armedText(ts, x, y);
        dr.drawText(
          at,
          options,
          highlight === HIGHLIGHT_NOTES ? COL_ARROW_PENCIL : COL_ARROW_GUESS,
          "?",
        );
      }

      // Pencil marks show only on a square with no arrow or goal of its own.
      if (c === EMPTY) {
        const q = ts * 0.12;
        // A mark this hint rules out keeps its own color and takes a
        // strikethrough in the same color — the collection's "ruled out" cue
        // (docs/hints-marks.md § "The engine colors the marks"). The hint
        // says what to cross off; it never crosses it off for the player.
        const struck = ds.hint.struck[i1];
        const markAt = (bit: number, mx: number, my: number, n: number): void => {
          if (!(p & bit)) return;
          drawArrow(dr, mx, my, q, bit, COL_ARROW_PENCIL);
          if (struck & valueBit(n))
            drawStrike(
              dr,
              { x: mx, y: my },
              2 * q,
              COL_ARROW_PENCIL,
              { x: tx, y: ty, w: ts, h: ts },
              { slant: true },
            );
        };
        markAt(FM_UP, midX, ox + y * ts + Math.floor(ts / 4), 1);
        markAt(FM_DOWN, midX, ox + y * ts + Math.floor((3 * ts) / 4), 2);
        markAt(FM_LEFT, ox + x * ts + Math.floor(ts / 4), midY, 3);
        markAt(FM_RIGHT, ox + x * ts + Math.floor((3 * ts) / 4), midY, 4);
        if (p & FD_ENTRY) {
          dr.drawRect({ x: midX - 2, y: midY - 2, w: 4, h: 4 }, COL_ARROW_PENCIL);
        }
      }

      if (c & FM_GOAL) {
        dr.drawCircle({ x: midX, y: midY }, Math.floor(ts / 3), COL_GOAL, COL_GOAL);
      } else if (c & FM_ARROWMASK) {
        drawArrow(dr, midX, midY, ts * 0.3, c, ink);
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
          ox + x * ts + inset,
          ox + y * ts + inset,
          ts - 1 - 2 * inset,
          ts - 1 - 2 * inset,
          COL_ERROR,
        );
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
    text: (bx, by) => squareText(ts, armedAt, bx, by),
    words: stepMarks(hint),
    evidenceColor: COL_HINT_OUTLINE,
  });

  // The pencil-mode indicator (fork addition), in the engine's corner. A sticky
  // mode with no visible state is a trap: the Marks key arms a drag to draw a
  // mark rather than an arrow, and this is what says so.
  repaintPencilIndicator(
    dr,
    ds,
    ui.pencilMode,
    pencilIndicatorBox(computeSize({ w, h, diff: 0 }, ts), ts),
    PENCIL_STYLE,
  );
}
