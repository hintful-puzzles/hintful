/**
 * Separate rendering — the clue layer over the shared border-grid renderer.
 *
 * The mechanic's own look — the three-valued border edges, the error model over
 * the two DSFs, the half-grid cursor, the tile skeleton, the hint's marks and
 * the geometry — is
 * [`engine/mechanics/border-grid-render.ts`](../../engine/border-grid-render.ts), shared
 * with Palisade. What is Separate's and stays here: a cell carries a **letter**,
 * a letter that repeats inside a *completed* wall-bounded region reddens, and a
 * region counts as finished when it is size `k` with no letter twice.
 */

import {
  cellSurface,
  INK,
  lineMaybeColor,
  lineNoColor,
  REGION_DONE,
} from "../../engine/color/palette.ts";
import { COL_ERROR, FIRST_GAME_SLOT, rolePalette } from "../../engine/color/roles.ts";
import type { Frame, GameDrawing } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Size } from "../../engine/contract/types.ts";
import { buildDsf } from "../../engine/mechanics/border-grid.ts";
import type { BorderHint } from "../../engine/mechanics/border-grid-hint.ts";
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
  flashFlag,
  hintTileBits,
  invalidateDanglingRegions,
  mistakeEdgeBits,
  newBorderGridDrawState,
} from "../../engine/mechanics/border-grid-render.ts";
import { glyphFont } from "../../engine/render/draw.ts";
import { sweepStep } from "../../engine/render/win-wave.ts";
import type {
  SeparateMistake,
  SeparateMove,
  SeparateParams,
  SeparateState,
  SeparateUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 48;

const A = "A".charCodeAt(0);

// --- palette (mirrors Palisade's) -----------------------------------------

const COL_GRID = FIRST_GAME_SLOT; // == letter color == wall color
const COL_LINE_MAYBE = FIRST_GAME_SLOT + 1;
const COL_LINE_NO = FIRST_GAME_SLOT + 2;
export const COL_CORRECT = FIRST_GAME_SLOT + 3; // a completed, correct region
const COL_CELL = FIRST_GAME_SLOT + 4; // the surface of every cell

export function colors(defaultBackground: Color): Color[] {
  const background = defaultBackground;
  const out = rolePalette(background);
  out[COL_CELL] = cellSurface(background);
  out[COL_GRID] = INK;
  out[COL_CORRECT] = REGION_DONE;
  out[COL_LINE_MAYBE] = lineMaybeColor(background);
  out[COL_LINE_NO] = lineNoColor(background);
  return out;
}

/** Separate's palette indices, in the shared renderer's terms. */
const PALETTE: BorderGridColors = {
  background: COL_CELL,
  correct: COL_CORRECT,
  grid: COL_GRID,
  lineNo: COL_LINE_NO,
  lineMaybe: COL_LINE_MAYBE,
};

// --- geometry -------------------------------------------------------------

export function computeSize(p: SeparateParams, ts: number): Size {
  return borderGridSize(p.w, p.h, ts);
}

// --- draw state ------------------------------------------------------------

export type SeparateDrawState = BorderGridDrawState;

export function newDrawState(
  state: SeparateState,
  tileSize: number,
): SeparateDrawState {
  return newBorderGridDrawState(state.w, state.h, tileSize);
}

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SeparateDrawState,
  frame: Frame<SeparateState, SeparateUi, SeparateMove, BorderHint, SeparateMistake>,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const { w, h, k, letters, borders } = state;
  const wh = w * h;

  if (ds.tiles.firstFrame()) drawBorderGridBackground(dr, ts, w, h, PALETTE);

  const blackDsf = buildDsf(w, h, borders, true);
  const yellowDsf = buildDsf(w, h, borders, false);

  // Per black region: how many times each letter appears. A letter repeated
  // within a *completed* (size-k) region reddens every cell carrying it. Gating
  // on size k keeps the untouched board (one big region holding every letter k
  // times) clean: as in Palisade, only provably-wrong state is flagged.
  const regionCounts = new Map<number, Int32Array>();
  for (let i = 0; i < wh; i++) {
    const root = blackDsf.canonify(i);
    let counts = regionCounts.get(root);
    if (!counts) {
      counts = new Int32Array(k);
      regionCounts.set(root, counts);
    }
    counts[letters[i]]++;
  }

  // A region is complete and correct when it has exactly `k` cells, no repeated
  // letter and no wall interior to it. It takes the shared finished-region
  // color, the local-correctness feedback Galaxies and Rect give.
  const validRoot = new Map<number, boolean>();
  for (let i = 0; i < wh; i++) {
    const r = blackDsf.canonify(i);
    if (validRoot.has(r)) continue;
    let ok = blackDsf.size(r) === k;
    const counts = regionCounts.get(r);
    if (ok && counts) for (let n = 0; n < k; n++) if (counts[n] > 1) ok = false;
    validRoot.set(r, ok);
  }
  invalidateDanglingRegions(w, h, borders, blackDsf, validRoot);

  const mistakeMask = mistakeEdgeBits(w, h, mistakes);
  const hinted = hintTileBits(w, h, stepMarks(hint));

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      let flags = borders[i] | mistakeMask[i] | hinted.cells[i];

      flags |= flashFlag(flash.win(sweepStep(c, r)));

      const root = blackDsf.canonify(i);
      const counts = regionCounts.get(root);
      if (counts && blackDsf.size(i) === k && counts[letters[i]] > 1)
        flags |= F_CLUE_ERROR;
      if (validRoot.get(root)) flags |= F_CORRECT;

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
            dr.drawText(
              { x: o.x + center(ts), y: o.y + center(ts) },
              glyphFont(Math.floor(ts / 2)),
              flags & F_CLUE_ERROR ? COL_ERROR : COL_GRID,
              String.fromCharCode(A + letters[i]),
            );
          },
          hinted.edges[i],
        );
      }
    }
  }

  if (ui.cursor.visible) drawBorderCursor(dr, ts, ui.cursor.x, ui.cursor.y);
}
