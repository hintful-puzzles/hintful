/**
 * Shape assertions for a hint's board marks — the guards behind
 * `docs/hints-marks.md` § "Shade vs ring".
 *
 * **Shape, deliberately, and not color.** "Some rect carries the hint color"
 * is satisfied by exactly the thing these guards exist to forbid: a solid fill
 * behind the digits the hint is talking about. So a target asserts *a round
 * ring and nothing else in its ink*, and an evidence contour asserts its **side count**,
 * which distinguishes one contour around a `w`-cell region (`2w + 2` sides) from
 * a ring per cell (`4w`) — a game that loses the neighbor test still fails.
 *
 * Dev/test-only; never imported by production code.
 */
import { expect } from "vitest";
import { RING_MIN_ROUNDNESS, ringSide, textBox } from "../ring.ts";
import type { DrawTextOptions } from "../types.ts";
import { type DrawOp, opsOfKind, paintsWith } from "./recording-drawing.ts";

interface RectOp {
  op: string;
  color?: number;
  w?: number;
  h?: number;
}

/** A rect is a mark *side* when it is thin in exactly one direction; a solid
 * fill is thick in both. */
export function isThin(r: { w?: number; h?: number }): boolean {
  const w = r.w ?? 0;
  const h = r.h ?? 0;
  return Math.min(w, h) * 4 < Math.max(w, h);
}

/** Every rect drawn in `color`. */
export function markSides(ops: readonly RectOp[], color: number): RectOp[] {
  return ops.filter((o) => o.op === "rect" && o.color === color);
}

/**
 * Every ring of a frame that crosses text the frame draws, with the text: the
 * claim "a ring crosses no number" read off what is drawn, not off the text a
 * game hands its ring. Text in the ring's own ink is drawn inside the ring
 * (`RingOptions.inside`) and is not counted, and nor is text on a filled disc
 * painted over the ring, which hides the ring there (Mathrax's clues). The
 * recorder rounds to whole pixels, so a pixel's overlap with the stroke is
 * allowed for.
 */
export function ringCrossings(ops: readonly DrawOp[]): string[] {
  const crossings: string[] = [];
  ops.forEach((r, at) => {
    if (r.op !== "ring") return;
    const shape = {
      rect: { x: r.x, y: r.y, w: r.w, h: r.h },
      radius: r.radius,
      thickness: r.thickness,
    };
    const discs = ops
      .slice(at + 1)
      .flatMap((o) => (o.op === "circle" && o.fill >= 0 ? [o] : []));
    for (const t of opsOfKind(ops, "text")) {
      if (t.color === r.color) continue;
      const options = {
        align: t.align,
        baseline: t.baseline,
        fontType: t.fontType,
        size: t.size,
      } as DrawTextOptions;
      const box = textBox(t, options, t.text);
      const onDisc = discs.some((d) =>
        [
          [box.x, box.y],
          [box.x + box.w, box.y],
          [box.x, box.y + box.h],
          [box.x + box.w, box.y + box.h],
        ].every(([px, py]) => Math.hypot(px - d.cx, py - d.cy) <= d.r),
      );
      if (!onDisc && ringSide(shape, box, -1) === "crossed")
        crossings.push(
          `a ${r.w}×${r.h} ring at (${r.x}, ${r.y}) crosses "${t.text}" at (${t.x}, ${t.y})`,
        );
    }
  });
  return crossings;
}

/** The rings a frame draws (`GameDrawing.drawRing`). */
export function ringsOf(ops: readonly DrawOp[]): Extract<DrawOp, { op: "ring" }>[] {
  return opsOfKind(ops, "ring");
}

/**
 * The cells a deduction acts on are **ringed**: `rings` ring ops, each at least
 * {@link RING_MIN_ROUNDNESS} round and crossing no text, and nothing else
 * drawn in the ring's ink. A step may act on more than one cell.
 */
export function expectRing(
  ops: readonly DrawOp[],
  { rings = 1 }: { rings?: number } = {},
): void {
  const found = ringsOf(ops);
  expect(found.length, `${rings} target ring(s)`).toBe(rings);
  expect(ringCrossings(ops), "a ring crosses no number").toEqual([]);
  for (const r of found) {
    const half = Math.min(r.w, r.h) / 2;
    expect(r.radius, `a ${r.w}×${r.h} ring is round`).toBeGreaterThanOrEqual(
      Math.floor(RING_MIN_ROUNDNESS * half),
    );
  }
  const ink = found[0]?.color;
  if (ink !== undefined)
    expect(
      outsideRings(ops).filter((o) => paintsWith(o, ink)),
      "nothing but a ring, and the move's shape inside one, is drawn in the ring's ink",
    ).toEqual([]);
}

/** The ops not drawn inside a ring, rings aside: the recorder draws a ring's
 * `inside` between a clip to it and an unclip, straight after the ring. */
export function outsideRings(ops: readonly DrawOp[]): DrawOp[] {
  const out: DrawOp[] = [];
  let depth = 0;
  ops.forEach((o, i) => {
    if (o.op === "ring") return;
    if (o.op === "clip" && ops[i - 1]?.op === "ring") depth = 1;
    else if (depth > 0 && o.op === "clip") depth++;
    else if (depth > 0 && o.op === "unclip") depth--;
    else if (depth === 0) out.push(o);
  });
  return out;
}

/** `color` draws exactly one straight `cells`-cell outline: `2·cells + 2` thin
 * sides, where a ring per cell would be `4·cells`. */
function expectOneShape(
  ops: readonly RectOp[],
  color: number,
  cells: number,
  shape: string,
): void {
  const sides = markSides(ops, color);
  expect(
    sides.length,
    `a ${cells}-cell ${shape} is ${2 * cells + 2} sides, not ${4 * cells} per-cell rings`,
  ).toBe(2 * cells + 2);
  for (const s of sides)
    expect(isThin(s), `${shape} side ${s.w}x${s.h} is not thin — that is a fill`).toBe(
      true,
    );
}

/**
 * A contiguous `cells`-cell evidence region is **one contour**: `2·cells + 2`
 * sides for a straight line or rectangle-free run, never `4·cells`.
 *
 * The count is the assertion. A region drawn as one ring per cell, or one that
 * silently lost a cell, both come out at a different number.
 */
export function expectContour(
  ops: readonly RectOp[],
  color: number,
  cells: number,
): void {
  expectOneShape(ops, color, cells, "contour");
}

/**
 * A straight piece the step acts on — a domino — is **one ring** around its
 * squares: a pill about `squares` times as long as it is wide, never a ring
 * per square.
 */
export function expectPieceRing(
  ops: readonly DrawOp[],
  { squares = 2 }: { squares?: number } = {},
): void {
  expectRing(ops);
  const [r] = ringsOf(ops);
  const ratio = Math.max(r.w, r.h) / Math.min(r.w, r.h);
  expect(ratio, `a ${squares}-square piece is one pill`).toBeGreaterThan(squares - 0.5);
  expect(ratio).toBeLessThan(squares + 0.5);
}
