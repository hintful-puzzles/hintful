/**
 * A shared, deterministic recording `GameDrawing` for in-process render
 * tests. It captures *every* drawing primitive with *all* its arguments into
 * one normalized, ordered record — the basis for both targeted op assertions
 * and `toMatchSnapshot` regression snapshots. Dev/test-only; never imported by
 * production code.
 *
 * Determinism (so a snapshot changes only when the render changes):
 *  - coordinates are rounded to integers;
 *  - colors, which a game passes as palette *indices*, are resolved
 *    through the game's `colors(defaultBackground)` palette to a stable
 *    `rgb(r, g, b)` label. The raw index is kept too, so assertions can
 *    still match `op.color === COL_HINT`, but a snapshot prints only the
 *    label (`draw-op-snapshot.ts`), so renumbering a palette changes no
 *    frame that kept its colors;
 *  - ops are recorded in draw order (the order the game emits them,
 *    which is also their z-order — last drawn on top).
 *
 * It accepts what the canvas drawing accepts, through the same
 * `drawing-rules.ts`: a color the palette lacks throws here as it would in
 * the app, and a call the canvas paints nothing for is not recorded.
 *
 * `startDraw`/`endDraw`/`drawUpdate` are framework bookkeeping, not
 * visual content, so they are accepted and ignored. Blitter operations
 * (drag sprites) are no-ops: an in-process frame has nothing to save or
 * restore, and a captured drag sprite is not what these tests assert.
 */

import { HINT_RING, HINT_STRIPES } from "../color/palette.ts";
import type { GameDrawing, RingOptions } from "../contract/game.ts";
import type { Color, DrawTextOptions, Point, Rect } from "../contract/types.ts";
import {
  checkPolygon,
  hasFill,
  type InkRole,
  paintsNothing,
  paletteInk,
} from "../render/drawing-rules.ts";
import { type RingClear, ringShape } from "../render/ring.ts";

/** The `fillRgb` of a polygon or circle drawn with no fill. */
export const NO_FILL = "none";

/** One captured draw primitive. `color` is the palette index the game
 * passed; `rgb`/`fillRgb`/`outlineRgb` are that index resolved through
 * the palette to a stable label. Coordinates are integer-rounded. */
export type DrawOp =
  | {
      op: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      color: number;
      rgb: string;
    }
  | {
      op: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      thickness: number;
      color: number;
      rgb: string;
    }
  | {
      op: "polygon";
      points: ReadonlyArray<readonly [number, number]>;
      fill: number;
      fillRgb: string;
      outline: number;
      outlineRgb: string;
      /** Drawn by `drawRingInkPolygon`: a control the hint says to press,
       * which is allowed in the ring's ink without a ring. */
      hintControl?: true;
    }
  | {
      op: "circle";
      cx: number;
      cy: number;
      r: number;
      fill: number;
      fillRgb: string;
      outline: number;
      outlineRgb: string;
    }
  | {
      op: "text";
      x: number;
      y: number;
      text: string;
      align: string;
      baseline: string;
      fontType: string;
      size: number;
      color: number;
      rgb: string;
    }
  | {
      op: "hatch";
      x: number;
      y: number;
      w: number;
      h: number;
      period: number;
      color: number;
      rgb: string;
    }
  | {
      /** The stroke `ringShape` fitted; what `inside` drew follows it, between
       * a clip to the ring's box and an unclip. */
      op: "ring";
      x: number;
      y: number;
      w: number;
      h: number;
      radius: number;
      thickness: number;
      color: number;
      rgb: string;
    }
  | { op: "clip"; x: number; y: number; w: number; h: number }
  | { op: "unclip" };

const round = (n: number): number => Math.round(n);

/** A color as the recorder labels it, for a test that expects a color it
 * derived rather than one it read off a game's palette. */
export function rgbLabel(c: Color): string {
  return `rgb(${round(c[0] * 255)}, ${round(c[1] * 255)}, ${round(c[2] * 255)})`;
}

const roundRect = (r: Rect): Rect => ({
  x: round(r.x),
  y: round(r.y),
  w: round(r.w),
  h: round(r.h),
});

export class RecordingDrawing implements GameDrawing {
  readonly ops: DrawOp[] = [];

  private readonly palette: readonly Color[];

  /** `palette` is a game's, from `resolvePalette` or straight from its
   * `colors()`: the ring and stripes inks the engine draws in are added where
   * they are not already the last two entries. */
  constructor(palette: readonly Color[]) {
    this.palette =
      palette.at(-2) === HINT_RING && palette.at(-1) === HINT_STRIPES
        ? palette
        : [...palette, HINT_RING, HINT_STRIPES];
  }

  /** A palette index as a stable `rgb(r, g, b)` label (components 0..255),
   * refused as the canvas refuses it when the palette has no such entry. */
  private rgb(index: number, role: InkRole): string {
    return rgbLabel(paletteInk(this.palette, index, role));
  }

  /** A fill's label: {@link NO_FILL} where the canvas fills nothing. */
  private fillRgb(index: number): string {
    return hasFill(index) ? this.rgb(index, "fillColor") : NO_FILL;
  }

  /**
   * The rects handed to `drawUpdate`, kept OUT of `ops` deliberately.
   *
   * A `drawUpdate` is bookkeeping — it tells the frontend which region to blit,
   * not what was drawn — so putting it in `ops` would add a line to every
   * snapshot in the collection for something no reviewer is reading a frame to
   * check. But it is not nothing: a redraw that stops emitting one repaints
   * nothing on a real canvas, and Cube's render test is the one that says so.
   * Counted here, asserted there, invisible to snapshots.
   */
  readonly updates: Rect[] = [];

  startDraw(): void {}
  endDraw(): void {}
  drawUpdate(rect: Rect): void {
    this.updates.push(roundRect(rect));
  }

  clip(rect: Rect): void {
    this.ops.push({ op: "clip", ...roundRect(rect) });
  }

  unclip(): void {
    this.ops.push({ op: "unclip" });
  }

  drawRect(rect: Rect, color: number): void {
    if (paintsNothing.rect(rect)) return;
    this.ops.push({
      op: "rect",
      ...roundRect(rect),
      color,
      rgb: this.rgb(color, "strokeColor"),
    });
  }

  drawLine(p1: Point, p2: Point, color: number, thickness: number): void {
    if (paintsNothing.line(thickness)) return;
    this.ops.push({
      op: "line",
      x1: round(p1.x),
      y1: round(p1.y),
      x2: round(p2.x),
      y2: round(p2.y),
      thickness: round(thickness),
      color,
      rgb: this.rgb(color, "strokeColor"),
    });
  }

  drawRingInkPolygon(coords: Point[], outlineColor: number): void {
    this.drawPolygon(coords, this.palette.length - 2, outlineColor);
    const last = this.ops[this.ops.length - 1];
    if (last.op === "polygon") last.hintControl = true;
  }

  drawPolygon(coords: Point[], fillColor: number, outlineColor: number): void {
    checkPolygon(coords);
    const outlineRgb = this.rgb(outlineColor, "strokeColor");
    this.ops.push({
      op: "polygon",
      points: coords.map((p) => [round(p.x), round(p.y)] as const),
      fill: fillColor,
      fillRgb: this.fillRgb(fillColor),
      outline: outlineColor,
      outlineRgb,
    });
  }

  drawCircle(
    center: Point,
    radius: number,
    fillColor: number,
    outlineColor: number,
  ): void {
    if (paintsNothing.circle(radius)) return;
    const outlineRgb = this.rgb(outlineColor, "strokeColor");
    this.ops.push({
      op: "circle",
      cx: round(center.x),
      cy: round(center.y),
      r: round(radius),
      fill: fillColor,
      fillRgb: this.fillRgb(fillColor),
      outline: outlineColor,
      outlineRgb,
    });
  }

  drawText(origin: Point, options: DrawTextOptions, color: number, text: string): void {
    if (paintsNothing.text(options.size)) return;
    this.ops.push({
      op: "text",
      x: round(origin.x),
      y: round(origin.y),
      text,
      align: options.align,
      baseline: options.baseline,
      fontType: options.fontType,
      size: round(options.size),
      color,
      rgb: this.rgb(color, "fillColor"),
    });
  }

  drawHatch(rect: Rect, period: number): void {
    if (paintsNothing.hatch(rect, period)) return;
    const color = this.palette.length - 1;
    this.ops.push({
      op: "hatch",
      ...roundRect(rect),
      period: round(period),
      color,
      rgb: this.rgb(color, "fillColor"),
    });
  }

  drawRing(
    box: Rect,
    clear: RingClear,
    thickness: number,
    { room, inside, centered }: RingOptions = {},
  ): void {
    const { rect, radius } = ringShape(box, clear, thickness, room, centered);
    const color = this.palette.length - 2;
    this.ops.push({
      op: "ring",
      ...roundRect(rect),
      radius: round(radius),
      thickness: round(thickness),
      color,
      rgb: this.rgb(color, "strokeColor"),
    });
    if (!inside) return;
    this.clip(rect);
    inside(color);
    this.unclip();
  }

  blitterNew(): unknown {
    return {};
  }
  blitterFree(): void {}
  blitterSave(): void {}
  blitterLoad(): void {}
}

/**
 * The ops of one kind, narrowed — so `rects(ops).map((o) => o.color)` typechecks
 * where `ops.filter((o) => o.op === "rect").map(…)` does not.
 *
 * `Array.prototype.filter` does not narrow a discriminated union through a
 * predicate it was not told is a type guard, and every migrating render test
 * hits that on its first assertion. One helper rather than a cast per file: a
 * cast would be the `as unknown as GameDrawing` this recorder exists to remove,
 * reappearing one level down.
 */
export function opsOfKind<K extends DrawOp["op"]>(
  ops: readonly DrawOp[],
  kind: K,
): Extract<DrawOp, { op: K }>[] {
  return ops.filter((o): o is Extract<DrawOp, { op: K }> => o.op === kind);
}

/** Whether `op` paints in palette index `color` — as its `color`, or as a
 * polygon's or circle's fill or outline. For a test asking "is anything in
 * COL_HINT" without caring which primitive carries it. */
export function paintsWith(op: DrawOp, color: number): boolean {
  if ("color" in op) return op.color === color;
  if ("fill" in op) return op.fill === color || op.outline === color;
  return false;
}
