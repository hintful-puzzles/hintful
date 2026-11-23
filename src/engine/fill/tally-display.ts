/**
 * The tally's display beneath the board (`play.tally`): one drawn piece for
 * each piece the tally counts, struck through once that many are found.
 * Upstream's boats.c `boats_draw_fleet`, its layout and its strike.
 */

import type { GameDrawing } from "../contract/game.ts";
import { JOIN_LEFT, JOIN_RIGHT } from "../render/piece.ts";
import type { Painter } from "../render/pieces/painter.ts";

/** Where the first piece starts, in tiles from the board's left. */
const START = 0.5;
/** One square of a drawn piece, as a fraction of a tile. */
const SQUARE = 0.75;
/** The gap after each piece, in tiles. */
const MARGIN = 0.25;
/** The strike's thickness, in pixels. */
const STRIKE = 2;

/** One piece's place: `size` squares long, the `copy`th of that length,
 * `x` tiles from the board's left on row `row`. */
interface Slot {
  readonly size: number;
  readonly copy: number;
  readonly x: number;
  readonly row: number;
}

/**
 * Where each piece goes, `counts[k]` of them `k + 1` long, on rows `across`
 * tiles wide: upstream's walk, which keeps a length's pieces together on a
 * row where they fit, and breaks inside a batch only where one row cannot
 * take it (upstream's own `TODO ui: Certain custom fleets don't fit`).
 */
function* layout(counts: readonly number[], across: number): Generator<Slot> {
  const limit = across + START + MARGIN;
  let x = START;
  let row = 0;
  for (const [k, n] of counts.entries()) {
    const width = (k + 1) * SQUARE + MARGIN;
    if (x + n * width > limit && x !== START) {
      x = START;
      row++;
    }
    for (let copy = 0; copy < n; copy++) {
      if (x + width > limit && x !== START) {
        x = START;
        row++;
      }
      yield { size: k + 1, copy, x, row };
      x += width;
    }
  }
}

/** The tiles the canvas is wide for a board `w` wide with its numbers: the
 * longest piece's where that is wider, since a piece has no break. */
export function tallyAcross(counts: readonly number[], w: number): number {
  const longest = counts.findLastIndex((n) => n > 0) + 1;
  return Math.max(w + 1, longest * SQUARE);
}

/** The height of the display in tiles, with the half tile above it. */
export function tallyHeight(counts: readonly number[], w: number): number {
  let rows = 1;
  for (const s of layout(counts, tallyAcross(counts, w)))
    rows = Math.max(rows, s.row + 1);
  return 0.5 + rows - (1 - SQUARE);
}

/** The display's ink: a piece to find, one found, the strike, and the
 * strike where more are found than the tally counts. */
export interface TallyInks {
  readonly piece: readonly number[];
  readonly found: number;
  readonly strike: number;
  readonly over: number;
  readonly background: number;
}

/**
 * Draw the display at `(x0, y0)`, the left of the board and the top of the
 * half tile under its numbers, each piece by `painter` as a straight run.
 * `found[k]` is how many pieces `k + 1` long the board holds whole.
 */
export function drawTally(
  dr: GameDrawing,
  ts: number,
  at: { readonly x: number; readonly y: number; readonly w: number },
  counts: readonly number[],
  found: readonly number[],
  painter: Painter,
  inks: TallyInks,
): void {
  const across = tallyAcross(counts, at.w);
  let rows = 1;
  for (const s of layout(counts, across)) rows = Math.max(rows, s.row + 1);
  const area = {
    x: at.x,
    y: at.y,
    w: Math.ceil(across * ts),
    h: Math.ceil((0.5 + rows) * ts),
  };
  dr.drawRect(area, inks.background);
  // One slope for every length, so the strikes all lean alike.
  const longest = counts.length;
  const slope = (SQUARE * ts - STRIKE * 2) / (longest * SQUARE * ts - STRIKE * 2);
  const cell = SQUARE * ts;
  for (const { size, copy, x, row } of layout(counts, across)) {
    const left = at.x + (x - START) * ts;
    const top = at.y + (0.5 + row) * ts;
    const done = copy < (found[size - 1] ?? 0);
    const ink = done ? [inks.found] : inks.piece;
    for (let k = 0; k < size; k++) {
      const joined = (k > 0 ? JOIN_LEFT : 0) | (k < size - 1 ? JOIN_RIGHT : 0);
      painter.paint(
        dr,
        { x: left + k * cell, y: top, w: cell, h: cell },
        ink,
        false,
        1,
        false,
        joined,
      );
    }
    if (!done) continue;
    const strike = (found[size - 1] ?? 0) > counts[size - 1] ? inks.over : inks.strike;
    const cy = top + cell / 2;
    const rise = slope * (size * cell - STRIKE * 2);
    dr.drawLine(
      { x: left + STRIKE, y: cy + rise / 2 },
      { x: left + size * cell - STRIKE, y: cy - rise / 2 },
      strike,
      STRIKE,
    );
  }
  dr.drawUpdate(area);
}

/** Whether the board holds as many squares of `value` as the tally's pieces
 * cover, so an open square can hold none (upstream boats.c's
 * `boats_adjust_ships`, once the fleet is placed). */
export function tallyPlaced(
  values: ArrayLike<number>,
  value: number,
  counts: readonly number[],
): boolean {
  let placed = 0;
  for (let i = 0; i < values.length; i++) if (values[i] === value) placed++;
  return placed === counts.reduce((sum, n, k) => sum + n * (k + 1), 0);
}

/**
 * How many whole pieces of each length up to `longest` the board holds:
 * straight runs of `value` along a row or a column, every cell round them
 * (the edge, or a decided cell) holding another value, or an open one where
 * `openShut`. A run longer than `longest` counts as none.
 */
export function wholePieces(
  values: ArrayLike<number>,
  w: number,
  h: number,
  value: number,
  longest: number,
  openShut = false,
): number[] {
  const out = new Array<number>(longest).fill(0);
  const at = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= w || y >= h ? -1 : values[y * w + x];
  const shut = (x: number, y: number): boolean => {
    const v = at(x, y);
    return v === -1 || (v !== value && (v !== 0 || openShut));
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // A piece is counted from its top left square.
      if (at(x, y) !== value || at(x - 1, y) === value || at(x, y - 1) === value)
        continue;
      const across = at(x + 1, y) === value;
      const [dx, dy] = across ? [1, 0] : [0, 1];
      let n = 0;
      while (at(x + dx * n, y + dy * n) === value) n++;
      let whole = shut(x - dx, y - dy) && shut(x + dx * n, y + dy * n);
      for (let k = 0; k < n && whole; k++)
        whole =
          shut(x + dx * k + dy, y + dy * k + dx) &&
          shut(x + dx * k - dy, y + dy * k - dx);
      if (whole && n <= longest) out[n - 1]++;
    }
  return out;
}
