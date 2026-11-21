/**
 * Palisade rendering — the clue layer over the shared border-grid renderer.
 *
 * The mechanic's own look — the three-valued border edges, the error model over
 * the two DSFs, the half-grid cursor, the tile skeleton, the hint's marks and
 * the geometry — is
 * [`engine/mechanics/border-grid-render.ts`](../../engine/border-grid-render.ts), shared
 * with Separate. What is Palisade's and stays here: a cell carries a **clue**
 * counting its walls and sits on the lifted surface of a given, a clue the board already contradicts reddens, and a region
 * counts as finished when it is size `k` with every clue in it satisfied.
 */

import {
  cellSurface,
  givenSurface,
  INK,
  lineMaybeColor,
  lineNoColor,
  REGION_DONE,
} from "../../engine/color/palette.ts";
import { COL_ERROR, FIRST_GAME_SLOT, rolePalette } from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Size } from "../../engine/contract/types.ts";
import { BORDER_MASK, buildDsf } from "../../engine/mechanics/border-grid.ts";
import {
  type BorderGridColors,
  type BorderGridDrawState,
  borderErrorBits,
  borderGridSize,
  center,
  cursorBits,
  drawBorderCursor,
  drawBorderGridBackground,
  drawBorderTile,
  F_CLUE_ERROR,
  F_CORRECT,
  F_GIVEN,
  flashFlag,
  hintTileBits,
  invalidateDanglingRegions,
  mistakeEdgeBits,
  newBorderGridDrawState,
} from "../../engine/mechanics/border-grid-render.ts";
import { glyphFont } from "../../engine/render/draw.ts";
import { type Flash, sweepStep } from "../../engine/render/win-wave.ts";
import {
  bitcount,
  EMPTY,
  type PalisadeHint,
  type PalisadeMistake,
  type PalisadeMove,
  type PalisadeParams,
  type PalisadeState,
  type PalisadeUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 48;

// --- palette --------------------------------------------------------------

/** The lifted surface under a clue. */
const COL_GIVEN = FIRST_GAME_SLOT;
export const COL_GRID = FIRST_GAME_SLOT + 1; // == COL_CLUE == COL_LINE_YES
export const COL_LINE_MAYBE = FIRST_GAME_SLOT + 2;
const COL_LINE_NO = FIRST_GAME_SLOT + 3;
export const COL_CORRECT = FIRST_GAME_SLOT + 4; // a completed, correct region
const COL_CELL = FIRST_GAME_SLOT + 5; // the surface of a cell with no clue

export function colors(defaultBackground: Color): Color[] {
  const background = defaultBackground;
  const out = rolePalette(background);
  out[COL_CELL] = cellSurface(background);
  out[COL_GIVEN] = givenSurface(background);
  out[COL_GRID] = INK;
  out[COL_CORRECT] = REGION_DONE;
  out[COL_LINE_MAYBE] = lineMaybeColor(background);
  out[COL_LINE_NO] = lineNoColor(background);
  return out;
}

/** Palisade's palette indices, in the shared renderer's terms. */
const PALETTE: BorderGridColors = {
  background: COL_CELL,
  given: COL_GIVEN,
  correct: COL_CORRECT,
  grid: COL_GRID,
  lineNo: COL_LINE_NO,
  lineMaybe: COL_LINE_MAYBE,
};

// --- geometry -------------------------------------------------------------

export function computeSize(p: PalisadeParams, ts: number): Size {
  return borderGridSize(p.w, p.h, ts);
}

// --- draw state ------------------------------------------------------------

export type PalisadeDrawState = BorderGridDrawState;

export function newDrawState(
  state: PalisadeState,
  tileSize: number,
): PalisadeDrawState {
  return newBorderGridDrawState(state.w, state.h, tileSize);
}

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: PalisadeDrawState,
  _prev: PalisadeState | null,
  state: PalisadeState,
  _dir: number,
  ui: PalisadeUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<PalisadeMove, PalisadeHint>,
  mistakes?: readonly PalisadeMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, k, clues, borders } = state;
  const wh = w * h;

  const hinted = hintTileBits(w, h, stepMarks(hint));

  if (ds.tiles.firstFrame()) drawBorderGridBackground(dr, ts, w, h, PALETTE);

  const blackDsf = buildDsf(w, h, borders, true);
  const yellowDsf = buildDsf(w, h, borders, false);

  // Completed-and-correct regions: a wall-bounded (black) component of exactly
  // `k` cells, every clue in it satisfied, and no wall interior to it: a
  // *local* check, as in Galaxies and Rect, not a comparison with the solution.
  // Start each right-sized component valid, then invalidate on a clue mismatch
  // or an interior (dangling) wall.
  const validRoot = new Map<number, boolean>();
  for (let i = 0; i < wh; i++) {
    const r = blackDsf.canonify(i);
    if (!validRoot.has(r)) validRoot.set(r, blackDsf.size(r) === k);
  }
  for (let i = 0; i < wh; i++) {
    if (clues[i] !== EMPTY && clues[i] !== bitcount(borders[i]))
      validRoot.set(blackDsf.canonify(i), false);
  }
  invalidateDanglingRegions(w, h, borders, blackDsf, validRoot);

  const mistakeMask = mistakeEdgeBits(w, h, mistakes);

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      const clue = clues[i];
      let flags = borders[i] | mistakeMask[i] | hinted.cells[i];

      if (validRoot.get(blackDsf.canonify(i))) flags |= F_CORRECT;
      if (clue !== EMPTY) flags |= F_GIVEN;
      flags |= flashFlag(flash.win(sweepStep(c, r)));

      const on = bitcount(borders[i]);
      const off = bitcount((borders[i] >> 4) & BORDER_MASK);
      if (clue !== EMPTY && (on > clue || clue > 4 - off)) flags |= F_CLUE_ERROR;

      flags |= cursorBits(ui.cursor, c, r);
      flags |= borderErrorBits(c, r, w, h, k, borders, blackDsf, yellowDsf);

      if (ds.tiles.changed(i, flags, hinted.edges[i])) {
        drawBorderTile(
          dr,
          ts,
          r,
          c,
          flags,
          PALETTE,
          (_body, o) => {
            if (clue !== EMPTY) {
              dr.drawText(
                { x: o.x + center(ts), y: o.y + center(ts) },
                glyphFont(Math.floor(ts / 2)),
                flags & F_CLUE_ERROR ? COL_ERROR : COL_GRID,
                String(clue),
              );
            }
          },
          hinted.edges[i],
        );
      }
    }
  }

  if (ui.cursor.visible) drawBorderCursor(dr, ts, ui.cursor.x, ui.cursor.y);
}
