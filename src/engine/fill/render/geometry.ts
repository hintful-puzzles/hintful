/**
 * Where a fill board's cells lie on the canvas. `FillMetrics` is what the
 * board's look decides once: its margins, gaps and shear. `Layout` adds what
 * a frame decides, the list depth, the width and the 3D (`FrameGeometry`):
 * the renderer builds one a frame and passes it to every helper, so no helper
 * reads geometry another frame left behind.
 */

import type { Point, Size } from "../../contract/types.ts";
import { glyphFont } from "../../render/draw.ts";
import type { MarkBand } from "../../render/hint-mark.ts";
import { pencilIndicatorReach } from "../../render/pencil-indicator.ts";
import { walledBoxes } from "../../render/region-walls.ts";
import { hexShift, inHexagon } from "../../solve/describe-runtime.ts";
import { COUNTS_HEIGHT, countsAcross } from "../counts.ts";
import { LIST_HEIGHT } from "../record-list.ts";
import { tallyAcross, tallyHeight } from "../tally-display.ts";

/** What of a board's look its geometry follows. */
export interface FillShape {
  /** The board keeps notes, and the pencil-mode indicator's room. */
  readonly notes: boolean;
  /** A press off the grid shows the covered numbers (`play.covers`). */
  readonly covers: boolean;
  /** The lines have a fixed label before their start. */
  readonly lineLabels: boolean;
  /** The lines have lists before their start. */
  readonly listed: boolean;
  /** The lines have clues one a value before their start, a tile a value
   * (`value-margin.ts`). */
  readonly margined: boolean;
  /** The tiles of those clues past the lines' end (`play.ends`). */
  readonly marginEnd: number;
  /** The lines have clues past their end. */
  readonly lineClued: boolean;
  /** The board has clues at slots. */
  readonly slotted: boolean;
  /** The board has clues at edges, in gaps between the cells. */
  readonly gapped: boolean;
  /** The board is a hexagon, its rows sheared. */
  readonly hexagon: boolean;
}

export type FillMetrics = ReturnType<typeof fillMetrics>;

/** The geometry of a board of shape `shape` that no frame changes. */
export function fillMetrics(shape: FillShape) {
  const {
    notes,
    covers,
    lineLabels,
    listed,
    margined,
    marginEnd,
    lineClued,
    slotted,
    gapped,
    hexagon,
  } = shape;
  /** The tiles before a board's lines its lists take, upstream pattern.c's
   * `TLBORDER`: a line of `d` holds at most about `d / 2` runs, which stack
   * a fifth as deep with room to spare. Its clues one a value take a tile
   * each of the `values` its margin heads. One depth serves both axes, the
   * longer side's, so the board has one origin. */
  const depthOf = (b: { w: number; h: number }, values: number): number =>
    listed ? Math.floor(Math.max(b.w, b.h) / 5) + 2 : margined ? values : 0;
  // Where a press off the grid shows the covered numbers, the board keeps
  // half a tile round it to press (upstream singles.c's BORDER); where it
  // keeps notes, the pencil-mode indicator's room at its top right.
  const rim = (ts: number): number =>
    notes
      ? Math.max(Math.floor(ts / 2), pencilIndicatorReach(ts))
      : !covers
        ? 1
        : Math.floor(ts / 2);
  // A board with clues at slots keeps a tile's margin round it for them, and
  // an eighth more, upstream towers.c's BORDER, or the rim where that is wider.
  const slotMargin = (ts: number): number => Math.max(ts + Math.floor(ts / 8), rim(ts));
  const startAt = (ts: number, d: number): number =>
    lineLabels
      ? ts
      : d > 0
        ? d * ts + (margined ? rim(ts) : Math.floor(ts / 4))
        : slotted
          ? slotMargin(ts)
          : rim(ts);
  const end = (ts: number): number =>
    marginEnd > 0
      ? marginEnd * ts + rim(ts)
      : lineClued
        ? ts + 2
        : slotted
          ? slotMargin(ts)
          : rim(ts);
  // A board with clues at edges has a gap between every two cells to draw
  // them in, half a tile wide (upstream unequal.c's).
  const gapOf = (ts: number): number => (gapped ? Math.floor(ts / 2) : 0);
  /** From one cell's left to the next's. */
  const pitch = (ts: number): number => ts + gapOf(ts);
  // A hexagon's rows are drawn sheared, each half a tile right of the one
  // above, its store's corners not at all.
  const drawn = (b: { w: number; h: number }, x: number, y: number): boolean =>
    !hexagon || inHexagon(b.w, b.h, x, y);
  /** Which outlined cells share a side: on a hexagon only a row's, since a
   * cell overlaps those above and below it by half; across a gap none. */
  const sides = hexagon
    ? { joinEvidence: (a: { y: number }, b: { y: number }) => a.y === b.y }
    : gapped
      ? { joinEvidence: () => false }
      : {};
  /** The tile size a board is drawn at: even on a hexagon, so its rows shift
   * by exactly half a tile. */
  const tileOf = (ts: number): number => (hexagon ? ts & ~1 : ts);
  /** The canvas a board `w` by `h` whose margin heads `values` values takes
   * at tile size `ts`, with what is drawn `beneath` it where anything is:
   * the tally, its pieces as long as they are, or a row of counts. */
  const canvasOf = (
    { w, h }: { readonly w: number; readonly h: number },
    values: number,
    beneath: Beneath | null,
    ts: number,
  ): Size => {
    const from = startAt(ts, depthOf({ w, h }, values));
    return {
      w: Math.max(
        from + end(ts) + spanOf(w, ts) + (hexagon ? ts >> 1 : 0),
        beneath === null ? 0 : from + Math.ceil(beneath.across * ts),
      ),
      h:
        from +
        end(ts) +
        spanOf(h, ts) +
        (beneath === null ? 0 : Math.ceil(beneath.height * ts)),
    };
  };
  /** From the first of `n` cells' near side to the last's far side: the
   * cells, and the gaps between them. */
  const spanOf = (n: number, ts: number): number => pitch(ts) * n - gapOf(ts);
  /** The same in tiles, a gap half a tile. */
  const spanTiles = (n: number): number => (gapped ? n + (n - 1) / 2 : n);
  /** The top left of what a board `h` high whose margins are `depth` deep
   * draws beneath it, past its bottom margin. */
  const beneathAt = (ts: number, depth: number, h: number): Point => {
    const x = startAt(ts, depth);
    return { x, y: x + spanOf(h, ts) + end(ts) };
  };
  return {
    hexagon,
    gapped,
    listed,
    depthOf,
    startAt,
    end,
    gapOf,
    pitch,
    drawn,
    sides,
    tileOf,
    canvasOf,
    spanTiles,
    beneathAt,
  };
}

/** What a board draws beneath it, in tiles: how far across, from the board's
 * left, and how far down, below the board's margin. */
export interface Beneath {
  readonly across: number;
  readonly height: number;
}

/** The tally of `counts` beneath a board `w` wide. */
export const tallyBeneath = (counts: readonly number[], w: number): Beneath => ({
  across: tallyAcross(counts, w),
  height: tallyHeight(counts, w),
});

/** A row of counts beneath a board `w` wide. */
export const countsBeneath = (w: number): Beneath => ({
  across: countsAcross(w),
  height: COUNTS_HEIGHT,
});

/** A list beneath a board `w` wide, as wide as it. */
export const listBeneath = (w: number): Beneath => ({ across: w, height: LIST_HEIGHT });

/** What a frame decides of the geometry: the board's list depth and width,
 * and where it draws its values raised (`play.numbers.raised`), whether this
 * frame does (the appearance preference) and its largest value, which stands
 * a fixed share of a tile tall. */
export interface FrameGeometry {
  readonly depth: number;
  readonly boardW: number;
  readonly threeD: boolean;
  readonly top: number;
}

export type Layout = ReturnType<typeof layoutOf>;

/** The geometry of one frame of a board of metrics `m`. */
export function layoutOf(m: FillMetrics, f: FrameGeometry) {
  const start = (ts: number): number => m.startAt(ts, f.depth);
  const coord = (n: number, ts: number): number => n * m.pitch(ts) + start(ts);
  /** The left of cell `(x, y)` on a board `h` high. */
  const cellX = (x: number, y: number, h: number, ts: number): number =>
    coord(x, ts) + (m.hexagon ? hexShift(y, h, ts) : 0);
  /** Where a hint mark sits round cell `(x, y)`: inside its own box, over
   * the grid line it owns, so a cell whose marks change repaints itself and
   * takes the old ones with it. On a walled cell, inside its walls: a band on
   * the line between two cells would read as a wall. */
  const markBand = (
    ts: number,
    [x, y, h]: readonly [number, number, number],
    walls: number | null,
  ): MarkBand => {
    const box = { x: cellX(x, y, h, ts), y: coord(y, ts), w: ts, h: ts };
    return {
      box: walls === null ? box : walledBoxes(ts, box.x, box.y, walls)[1],
      outer: 0,
      inner: Math.max(2, ts >> 4),
    };
  };
  return { m, f, start, coord, cellX, markBand };
}

/** Where a number on a tile at `(tx, ty)` is written, and its font: three
 * fifths of the tile, and a pixel less on a tile of 6 px or under, where a
 * ring fits between a 3 px number and its neighbors' by no step of its
 * search (measured 2026-10-28, `keep-rings-off-a-cells-numbers`). */
export const numberText = (ts: number, tx: number, ty: number) => ({
  origin: { x: tx + Math.floor(ts / 2), y: ty + Math.floor(ts / 2) },
  options: glyphFont(Math.floor((ts * 3) / 5) - (ts <= 6 ? 1 : 0)),
});
