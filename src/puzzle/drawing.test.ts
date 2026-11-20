/**
 * The canvas drawing and the test recorder agree on every call: each throws
 * where the other throws, and the recorder records exactly the calls the
 * canvas paints. A test that passes on the recorder then cannot crash the app
 * on a color, and its record holds nothing the player never sees.
 *
 * The canvas runs on a stand-in 2D context that counts its painting calls, so
 * what is compared is `Drawing`'s own handling of its arguments.
 */
import { describe, expect, it } from "vitest";
import type { GameDrawing } from "../engine/contract/game.ts";
import type { Color } from "../engine/contract/types.ts";
import { NOTHING_TO_CLEAR } from "../engine/ring.ts";
import { RecordingDrawing } from "../engine/testing/recording-drawing.ts";
import { Drawing } from "./drawing.ts";

const PAINTS = new Set(["fill", "stroke", "fillRect", "fillText"]);

/** A `Drawing` whose context counts the calls that put ink on the canvas. */
function countingCanvas(paletteSize: number): {
  drawing: Drawing;
  painted: () => number;
} {
  let paints = 0;
  const context = new Proxy(
    {},
    {
      get(_target, key) {
        if (key === "measureText")
          return () => ({ actualBoundingBoxAscent: 7, actualBoundingBoxDescent: 0 });
        return (..._args: unknown[]) => {
          if (typeof key === "string" && PAINTS.has(key)) paints++;
        };
      },
      set: () => true,
    },
  );
  const canvas = { getContext: () => context } as unknown as OffscreenCanvas;
  const drawing = new Drawing(canvas);
  drawing.setPalette(Array.from({ length: paletteSize }, (_, i) => `#00000${i}`));
  return { drawing, painted: () => paints };
}

const PALETTE: Color[] = [
  [0, 0, 0],
  [1, 1, 1],
  [0.5, 0.5, 0.5],
];

const BAD_INKS = [-1, 99, 1.5, Number.NaN];
const INKS = [0, 2, ...BAD_INKS];
const box = { x: 1, y: 1, w: 4, h: 4 };
const tri = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 2, y: 3 },
];
const font = (size: number) =>
  ({ align: "center", baseline: "mathematical", fontType: "variable", size }) as const;

/** Every call worth comparing: each primitive with good and bad inks, at a
 * size that paints and one that does not. */
const CALLS: [string, (d: GameDrawing) => void][] = [
  ...INKS.flatMap((c): [string, (d: GameDrawing) => void][] => [
    [`rect ${c}`, (d) => d.drawRect(box, c)],
    [`empty rect ${c}`, (d) => d.drawRect({ ...box, w: 0.5 }, c)],
    [`line ${c}`, (d) => d.drawLine(box, { x: 9, y: 9 }, c, 1)],
    [`hairline ${c}`, (d) => d.drawLine(box, { x: 9, y: 9 }, c, 0)],
    [`text ${c}`, (d) => d.drawText(box, font(12), c, "5")],
    [`tiny text ${c}`, (d) => d.drawText(box, font(0.5), c, "5")],
    ...INKS.flatMap((o): [string, (d: GameDrawing) => void][] => [
      [`polygon ${c}/${o}`, (d) => d.drawPolygon(tri, c, o)],
      [`circle ${c}/${o}`, (d) => d.drawCircle(box, 3, c, o)],
      [`dot ${c}/${o}`, (d) => d.drawCircle(box, 0, c, o)],
    ]),
    [`ring-ink polygon ${c}`, (d) => d.drawRingInkPolygon(tri, c)],
  ]),
  ["empty polygon", (d) => d.drawPolygon([], 0, 0)],
  ["hatch", (d) => d.drawHatch(box, 4)],
  ["fine hatch", (d) => d.drawHatch(box, 1)],
  ["ring", (d) => d.drawRing(box, NOTHING_TO_CLEAR, 2)],
];

/** Whether `call` threw, and how many marks it left. */
function outcome(
  call: () => void,
  marks: () => number,
): { threw: boolean; marks: number } {
  try {
    call();
    return { threw: false, marks: marks() };
  } catch {
    return { threw: true, marks: 0 };
  }
}

/** What the canvas and the recorder each did with `call`; marks are counted
 * as painted or not, since one recorded op may be several canvas calls. */
function both(call: (d: GameDrawing) => void) {
  const canvas = countingCanvas(PALETTE.length + 2);
  const recorder = new RecordingDrawing(PALETTE);
  return {
    canvas: outcome(
      () => call(canvas.drawing),
      () => Math.min(canvas.painted(), 1),
    ),
    recorder: outcome(
      () => call(recorder),
      () => Math.min(recorder.ops.length, 1),
    ),
  };
}

describe("the recorder accepts what the canvas accepts", () => {
  it.each(CALLS)("%s", (_name, call) => {
    const { canvas, recorder } = both(call);
    expect(recorder).toEqual(canvas);
  });

  it("the calls include ones the canvas refuses and ones it paints nothing for", () => {
    const outcomes = CALLS.map(([, call]) => both(call).canvas);
    expect(outcomes.filter((o) => o.threw).length).toBeGreaterThan(0);
    expect(outcomes.filter((o) => !o.threw && o.marks === 0).length).toBeGreaterThan(0);
    expect(outcomes.filter((o) => !o.threw && o.marks === 1).length).toBeGreaterThan(0);
  });
});
