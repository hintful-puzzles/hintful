import { describe, expect, it } from "vitest";
import { glyphFont } from "./draw.ts";
import { RING_MIN_ROUNDNESS, type RingClear, ringShape, textBox } from "./ring.ts";
import type { Rect } from "./types.ts";

const S = 48;
const cell = (x: number, y: number): Rect => ({ x: x * S, y: y * S, w: S, h: S });

/** A 3×3 note grid's corner glyphs in cell (`x`, `y`): each a 10-pixel box
 * `inset` pixels in from the cell's corner. */
const cornerNotes = (x: number, y: number, inset: number): Rect[] =>
  [
    [inset, inset],
    [S - 10 - inset, inset],
    [inset, S - 10 - inset],
    [S - 10 - inset, S - 10 - inset],
  ].map(([dx, dy]) => ({ x: x * S + dx, y: y * S + dy, w: 10, h: 10 }));

/** Cell (1, 1) and its eight neighbors, the room a ring there may grow into. */
const AROUND: Rect = { x: 0, y: 0, w: 3 * S, h: 3 * S };

const NEIGHBORS = [-1, 0, 1]
  .flatMap((dy) => [-1, 0, 1].map((dx) => [1 + dx, 1 + dy] as const))
  .filter(([x, y]) => x !== 1 || y !== 1);

/** Corner notes in cell (1, 1), enclosed, and in its eight neighbors, avoided. */
const notesAround = (inset: number): RingClear => ({
  enclose: cornerNotes(1, 1, inset),
  avoid: NEIGHBORS.flatMap(([x, y]) => cornerNotes(x, y, inset)),
});

const NONE: RingClear = { enclose: [], avoid: [] };

const roundness = (r: ReturnType<typeof ringShape>): number =>
  r.radius / (Math.min(r.rect.w, r.rect.h) / 2);

describe("ringShape", () => {
  it("rings an empty cell with a circle inside it", () => {
    const r = ringShape(cell(1, 1), NONE, 2);
    expect(roundness(r)).toBe(1);
    expect(r.rect.x).toBeGreaterThanOrEqual(S);
    expect(r.rect.x + r.rect.w).toBeLessThanOrEqual(2 * S);
  });

  it("rings a domino with a pill", () => {
    const r = ringShape({ x: 0, y: 0, w: 2 * S, h: S }, NONE, 2);
    expect(r.radius).toBe(r.rect.h / 2);
    expect(r.rect.w).toBeGreaterThan(r.rect.h);
  });

  it("keeps to its own cell unless given room", () => {
    const own = { enclose: cornerNotes(1, 1, 4), avoid: [] };
    expect(() => ringShape(cell(1, 1), own, 2)).toThrow(/No round ring fits/);
  });

  it("rounds its corners at the cell's border round notes in its corners", () => {
    const r = ringShape(cell(1, 1), notesAround(6), 2, AROUND);
    expect(roundness(r)).toBeGreaterThanOrEqual(RING_MIN_ROUNDNESS);
    expect(roundness(r)).toBeLessThan(1);
    expect(Math.abs(r.rect.x - S)).toBeLessThan(3);
  });

  it("grows into its room where its own border cannot clear the notes", () => {
    const own = { enclose: cornerNotes(1, 1, 2), avoid: [] };
    const r = ringShape(cell(1, 1), own, 2, AROUND);
    expect(roundness(r)).toBeGreaterThanOrEqual(RING_MIN_ROUNDNESS);
    expect(r.rect.x).toBeLessThan(S);
  });

  it("is a circle at the cell's border once its corners are free", () => {
    const r = ringShape(cell(1, 1), notesAround(10), 2, AROUND);
    expect(roundness(r)).toBe(1);
    expect(r.rect.x).toBe(S + 1);
  });

  it("throws where notes crowd the corners of a cell and its neighbors", () => {
    expect(() => ringShape(cell(1, 1), notesAround(4), 2, AROUND)).toThrow(
      /No round ring fits/,
    );
  });

  describe("Keen's cage-clue cell at a 45-pixel tile, as its tile painter lays it", () => {
    const box = { x: 0, y: 0, w: 45, h: 45 };
    const room = { x: -3, y: -3, w: 51, h: 51 };
    const clue = textBox(
      { x: 2, y: 13 },
      { align: "left", baseline: "alphabetic", fontType: "variable", size: 11 },
      "120×",
    );

    it("rings the cell clear of its clue", () => {
      const r = ringShape(box, { enclose: [], avoid: [clue] }, 3, room);
      expect(roundness(r)).toBeGreaterThanOrEqual(RING_MIN_ROUNDNESS);
      expect(r.rect.x).toBeGreaterThan(box.x);
    });

    it("cannot ring a placed digit there: it sits a pixel under the clue", () => {
      const digit = textBox({ x: 22, y: 22 }, glyphFont(22), "5");
      expect(() =>
        ringShape(box, { enclose: [digit], avoid: [clue] }, 3, room),
      ).toThrow();
    });
  });

  it("shifts away from a board edge to enclose its own corner text", () => {
    // Rect's 9×2 rectangle at a 24-pixel tile, its clue in its top-left
    // square, against the board's right edge (pin "overlap").
    const box = { x: 27, y: 75, w: 213, h: 45 };
    const clue = { x: 29.56, y: 80.56, w: 14.9, h: 8.9 };
    const room = { x: 2, y: 50, w: 239, h: 95 };
    const r = ringShape(box, { enclose: [clue], avoid: [] }, 2, room);
    expect(roundness(r)).toBeGreaterThanOrEqual(RING_MIN_ROUNDNESS);
    expect(r.rect.x + r.rect.w + 1).toBeLessThanOrEqual(room.x + room.w);
  });

  it("leaves a clue in the cell's own corner outside the ring", () => {
    const clue = { x: S + 2, y: S + 2, w: 14, h: 10 };
    const r = ringShape(cell(1, 1), { enclose: [], avoid: [clue] }, 2);
    expect(roundness(r)).toBeGreaterThanOrEqual(RING_MIN_ROUNDNESS);
    expect(() => ringShape(cell(1, 1), { enclose: [clue], avoid: [] }, 2)).toThrow();
  });
});
