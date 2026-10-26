/**
 * Fifteen's renderer: the beveled tiles, the recessed playfield border, and the
 * two-pass sliding animation.
 *
 * The board's pixel origin lives here and `interpretMove` imports it — one
 * function, both callers (`docs/mechanics.md`).
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import {
  cellSurface,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  INK,
} from "../../engine/color/palette.ts";
import {
  drawRaisedTile,
  drawRecessedBorder,
  glyphFont,
  raisedBevelWidth,
} from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { coord as coordE, fromCoord as fromCoordE } from "../../engine/geometry.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { textBox } from "../../engine/ring.ts";
import type {
  Color,
  DrawTextOptions,
  PaletteScheme,
  Point,
  Size,
} from "../../engine/types.ts";
import {
  type Flash,
  sweepStep,
  WIN_NONE,
  type WinTone,
  winSlot,
} from "../../engine/win-wave.ts";
import { TILE } from "./hint-text.ts";
import type { FifteenMove, FifteenParams, FifteenState, FifteenUi } from "./state.ts";

// --- constants --------------------------------------------------------

export const PREFERRED_TILE_SIZE = 48;
export const ANIM_TIME = 0.13;

// --- color indices ---------------------------------------------------

const COL_BACKGROUND = 0;
const COL_TEXT = 1;
const COL_HIGHLIGHT = 2;
const COL_LOWLIGHT = 3;
export const paletteScheme: Partial<PaletteScheme> = {
  darkSwaps: [[COL_HIGHLIGHT, COL_LOWLIGHT]],
};
/** A tile's face: the lifted surface, so the object the player moves stands
 * off the well it slides in, in both schemes. */
const COL_TILE = 4;
/** The well: the gap, and whatever a sliding tile uncovers. */
const COL_WELL = 5;
/** The face of a tile the win flash is on, inside its bevel: under the
 * highlight's body, and under its leading edge. */
export const COL_FLASH = 6;
export const COL_FLASH_LEAD = 7;

// --- coordinate helpers -----------------------------------------------

function border(ts: number): number {
  return Math.floor(ts / 2);
}

function coord(pos: number, ts: number): number {
  return coordE(pos, ts, border(ts));
}

export function fromCoord(pixel: number, ts: number): number {
  return fromCoordE(pixel, ts, border(ts));
}

/** The middle of cell `pos` along one axis, where a press addresses it. */
export function cellCenter(pos: number, ts: number): number {
  return coord(pos, ts) + Math.floor(ts / 2);
}

// --- drawing ----------------------------------------------------------

export interface FifteenDrawState {
  started: boolean;
  /** Per cell: the tone of the win flash's highlight on the tile last drawn. */
  lit: Uint8Array;
  /** Per-cell cache of the last-drawn tile value; `-1` forces a redraw
   * (unknown, or animating). */
  tiles: Int32Array;
  tileSize: number;
  /** Tile value currently highlighted as a hint, or null. */
  hintTile: number | null;
}

export function newDrawState(state: FifteenState, tileSize: number): FifteenDrawState {
  return {
    started: false,
    lit: new Uint8Array(state.n),
    tiles: new Int32Array(state.n).fill(-1),
    tileSize,
    hintTile: null,
  };
}

export function computeSize(p: FifteenParams, ts: number): Size {
  const b = border(ts);
  return { w: ts * p.w + 2 * b, h: ts * p.h + 2 * b };
}

export function colors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_TEXT] = INK;
  out[COL_HIGHLIGHT] = highlight;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_TILE] = givenSurface(background);
  out[COL_WELL] = cellSurface(background);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  return out;
}

/** Where a tile's number is drawn, for the tile and for the ring round it. */
function numberText(
  ts: number,
  x: number,
  y: number,
): { origin: Point; options: DrawTextOptions } {
  return {
    origin: { x: x + Math.floor(ts / 2), y: y + Math.floor(ts / 2) },
    options: glyphFont(ts / 3),
  };
}

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  tile: number,
  face: number,
  ringed: boolean,
): void {
  if (tile === 0) {
    dr.drawRect({ x, y, w: ts, h: ts }, COL_WELL);
  } else {
    drawRaisedTile(dr, { x, y, w: ts, h: ts }, ts, face, COL_HIGHLIGHT, COL_LOWLIGHT);
    const { origin, options } = numberText(ts, x, y);
    dr.drawText(origin, options, COL_TEXT, String(tile));
    // The hinted tile's ring sits on its face, inside the bevel, and is drawn
    // with the tile so it rides the slide.
    if (ringed) {
      const hw = raisedBevelWidth(ts);
      dr.drawRing(
        { x: x + hw, y: y + hw, w: ts - 2 * hw, h: ts - 2 * hw },
        { enclose: [textBox(origin, options, String(tile))], avoid: [] },
        Math.max(2, Math.floor(ts / 16)),
      );
    }
  }
  dr.drawUpdate({ x, y, w: ts, h: ts });
}

function drawPlayfieldBorder(
  dr: GameDrawing,
  w: number,
  h: number,
  ts: number,
  hw: number,
): void {
  drawRecessedBorder(
    dr,
    {
      left: coord(0, ts) - hw,
      top: coord(0, ts) - hw,
      right: coord(w, ts) + hw - 1,
      bottom: coord(h, ts) + hw - 1,
    },
    ts,
    COL_HIGHLIGHT,
    COL_LOWLIGHT,
  );
}

export function redraw(
  dr: GameDrawing,
  ds: FifteenDrawState,
  prev: FifteenState | null,
  state: FifteenState,
  _dir: number,
  _ui: FifteenUi,
  animTime: number,
  flash: Flash,
  activeHint?: HintStep<FifteenMove>,
): void {
  const ts = ds.tileSize;
  const { w, h, n } = state;
  const hw = raisedBevelWidth(ts);

  if (!ds.started) {
    drawPlayfieldBorder(dr, w, h, ts, hw);
    ds.started = true;
  }

  const hintTile = stepMarks(activeHint).of("ring", TILE)[0] ?? null;

  // Which tiles the win flash is on, asked once a tile before the two passes
  // below. The gap is no tile, and never lights.
  const lights = Array.from(
    state.tiles,
    (t, i): WinTone =>
      t !== 0 ? flash.win(sweepStep(i % w, Math.floor(i / w))) : WIN_NONE,
  );

  // Two passes so a whole sliding line animates cleanly: pass 0 blanks
  // the cells vacated by moving tiles, pass 1 draws the moving tiles
  // interpolated toward the gap.
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      // A cell whose tile differs from the previous state is animating
      // (-1 = "always redraw"); otherwise it shows its settled value.
      let t = prev && prev.tiles[i] !== state.tiles[i] ? -1 : state.tiles[i];
      const t0 = t;
      const lit = lights[i];

      if (
        ds.lit[i] !== lit ||
        ds.hintTile !== hintTile ||
        ds.tiles[i] !== t ||
        ds.tiles[i] === -1
      ) {
        let x: number;
        let y: number;

        if (t === -1) {
          if (pass === 0) {
            // Blank the vacated cell.
            x = coord(i % w, ts);
            y = coord(Math.floor(i / w), ts);
            t = 0;
          } else {
            t = state.tiles[i];
            // Don't draw the moving gap; just leave it blank.
            if (t === 0) continue;

            const x1 = coord(i % w, ts);
            const y1 = coord(Math.floor(i / w), ts);
            // Where this tile was in the previous state.
            const j = (prev as FifteenState).tiles.indexOf(t);
            const x0 = coord(j % w, ts);
            const y0 = coord(Math.floor(j / w), ts);

            let c = animTime / ANIM_TIME;
            c = Math.max(0, Math.min(1, c));
            x = x0 + Math.floor(c * (x1 - x0));
            y = y0 + Math.floor(c * (y1 - y0));
          }
        } else {
          if (pass === 0) continue;
          x = coord(i % w, ts);
          y = coord(Math.floor(i / w), ts);
        }

        const face = lit ? winSlot(lit, COL_FLASH, COL_FLASH_LEAD) : COL_TILE;
        drawTile(dr, ts, x, y, t, face, t !== 0 && t === hintTile);
      }
      ds.lit[i] = lit;
      ds.tiles[i] = t0;
    }
  }

  ds.hintTile = hintTile;
}
