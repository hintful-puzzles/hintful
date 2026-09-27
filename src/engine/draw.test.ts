import { describe, expect, it } from "vitest";
import {
  type BevelBounds,
  drawRecessedBorder,
  drawRectOutline,
  drawThickRectOutline,
  strokeScaledPolygon,
} from "./draw.ts";
import { opsOfKind, RecordingDrawing } from "./testing/recording-drawing.ts";

/**
 * These helpers take colors as bare palette indices and no game is involved, so
 * the recorder gets an empty palette: its `rgb` labels read `color#<n>` and the
 * assertions below use the index, which is what a helper's contract is stated
 * in. The point of using it anyway is that it records EVERY primitive — the two
 * local doubles this replaced each saw exactly one.
 */
function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing([]);
  return { dr, ops: dr.ops };
}

describe("drawRecessedBorder", () => {
  const bounds: BevelBounds = { left: 10, top: 10, right: 110, bottom: 110 };
  const inset = 20;
  const HI = 1;
  const LO = 2;

  it("draws two filled pentagons, highlight then lowlight", () => {
    const { dr, ops } = recordingDrawing();
    drawRecessedBorder(dr, bounds, inset, HI, LO);

    expect(ops).toHaveLength(2);
    expect(ops[0]).toMatchObject({ op: "polygon", fill: HI });
    expect(ops[1]).toMatchObject({ op: "polygon", fill: LO });
    expect(opsOfKind(ops, "polygon")[0].points).toHaveLength(5);
    expect(opsOfKind(ops, "polygon")[1].points).toHaveLength(5);
  });

  it("places the highlight wedge on the top/right corner", () => {
    const { dr, ops } = recordingDrawing();
    drawRecessedBorder(dr, bounds, inset, HI, LO);
    expect(opsOfKind(ops, "polygon")[0].points).toEqual([
      [110, 110],
      [110, 10],
      [90, 30],
      [30, 90],
      [10, 110],
    ]);
  });

  it("highlight and lowlight wedges share the two diagonal vertices", () => {
    const { dr, ops } = recordingDrawing();
    drawRecessedBorder(dr, bounds, inset, HI, LO);
    const [hi, lo] = opsOfKind(ops, "polygon").map((o) => o.points);
    // The inner diagonal edge (the two inset vertices) is common to both.
    expect(hi).toContainEqual([90, 30]);
    expect(hi).toContainEqual([30, 90]);
    expect(lo).toContainEqual([90, 30]);
    expect(lo).toContainEqual([30, 90]);
  });
});

describe("drawRectOutline", () => {
  it("draws four lines with inclusive corners (x..x+w-1, y..y+h-1)", () => {
    const { dr, ops } = recordingDrawing();
    drawRectOutline(dr, 5, 7, 10, 20, 3);

    expect(ops).toHaveLength(4);
    // Far corner is inclusive: (5+10-1, 7+20-1) = (14, 26).
    const lines = opsOfKind(ops, "line");
    const xs = lines.flatMap((o) => [o.x1, o.x2]);
    const ys = lines.flatMap((o) => [o.y1, o.y2]);
    expect(Math.max(...xs)).toBe(14);
    expect(Math.max(...ys)).toBe(26);
    expect(Math.min(...xs)).toBe(5);
    expect(Math.min(...ys)).toBe(7);
    for (const o of lines) expect(o.color).toBe(3);
  });
});

describe("drawThickRectOutline", () => {
  /*
   * This is tested here rather than through a game because of what the
   * promotion measured: with the helper wired into all eight games, deleting a
   * whole side of the frame failed **one** test in the collection (Crossing's).
   * The other seven draw their error or mistake frame in a code path no
   * snapshot reaches — Tents' and Magnets' render-scenario snapshots contain
   * zero mistake ops. A primitive eight games share needs a check at its own
   * level, not eight chances that one game's frame happens to be observed.
   */
  it("draws four bands that cover exactly the frame, and nothing inside it", () => {
    const { dr, ops: all } = recordingDrawing();
    drawThickRectOutline(dr, 10, 20, 30, 40, 3, 7);
    const ops = opsOfKind(all, "rect");

    expect(ops).toHaveLength(4);
    for (const o of ops) expect(o.color).toBe(7);

    // Every pixel of the border ring is painted, and no interior pixel is.
    const painted = (px: number, py: number) =>
      ops.some((o) => px >= o.x && px < o.x + o.w && py >= o.y && py < o.y + o.h);
    for (let px = 10; px < 40; px++) {
      for (let py = 20; py < 60; py++) {
        const onRing = px < 13 || px >= 37 || py < 23 || py >= 57;
        expect(painted(px, py), `(${px},${py})`).toBe(onRing);
      }
    }
  });

  it("stays inside the rect it was given", () => {
    const { dr, ops: all } = recordingDrawing();
    drawThickRectOutline(dr, 0, 0, 8, 8, 2, 1);
    const ops = opsOfKind(all, "rect");
    for (const o of ops) {
      expect(o.x).toBeGreaterThanOrEqual(0);
      expect(o.y).toBeGreaterThanOrEqual(0);
      expect(o.x + o.w).toBeLessThanOrEqual(8);
      expect(o.y + o.h).toBeLessThanOrEqual(8);
    }
  });
});

describe("strokeScaledPolygon", () => {
  it("strokes each side with its corners drawn toward the center, rounded", () => {
    const { dr, ops: all } = recordingDrawing();
    // A 40-square at (10, 20), center (30, 40), drawn at 0.8: corners 16 in.
    const square = [
      { x: 10, y: 20 },
      { x: 50, y: 20 },
      { x: 50, y: 60 },
      { x: 10, y: 60 },
    ];
    strokeScaledPolygon(dr, square, { x: 30, y: 40 }, 0.8, 5, 3);
    const lines = opsOfKind(all, "line");
    expect(lines.map((o) => [o.x1, o.y1, o.x2, o.y2])).toEqual([
      [14, 24, 46, 24],
      [46, 24, 46, 56],
      [46, 56, 14, 56],
      [14, 56, 14, 24],
    ]);
    for (const o of lines) expect(o).toMatchObject({ color: 5, thickness: 3 });
  });

  it("closes a polygon of any number of sides", () => {
    const { dr, ops: all } = recordingDrawing();
    const hexagon = Array.from({ length: 6 }, (_, k) => ({
      x: 100 + 30 * Math.cos((k * Math.PI) / 3),
      y: 100 + 30 * Math.sin((k * Math.PI) / 3),
    }));
    strokeScaledPolygon(dr, hexagon, { x: 100, y: 100 }, 0.5, 1, 2);
    const lines = opsOfKind(all, "line");
    expect(lines).toHaveLength(6);
    // The last side returns to the first corner.
    expect([lines[5].x2, lines[5].y2]).toEqual([lines[0].x1, lines[0].y1]);
    expect([lines[0].x1, lines[0].y1]).toEqual([115, 100]);
  });
});
