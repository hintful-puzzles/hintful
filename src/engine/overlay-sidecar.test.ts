import { describe, expect, it } from "vitest";
import { valueBit } from "./candidate-bits.ts";
import {
  CELL,
  mark,
  NOTE,
  type Note,
  phrase,
  type StepMarks,
  stepMarks,
} from "./hint-words.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  OVERLAY_FLAG,
  OverlaySidecar,
} from "./overlay-sidecar.ts";
import type { Point } from "./types.ts";

/** The marks of a step whose words outline `area`, ring `targets` and ring the
 * notes `marks`. */
function said({
  area = [],
  targets = [],
  marks = [],
}: {
  area?: Point[];
  targets?: Point[];
  marks?: Note[];
}): StepMarks {
  return stepMarks({
    words: phrase`${mark.as("outline", CELL, area, "a")} ${mark.as("ring", CELL, targets, "t")} ${mark.as("ring", NOTE, marks, "m")}`,
  });
}

describe("OverlaySidecar", () => {
  const idx = (x: number, y: number) => y * 3 + x;
  const marks = (m: Note) => valueBit(m.n);

  it("every cell is stale before its first commit", () => {
    const s = new OverlaySidecar(9);
    for (let i = 0; i < 9; i++) expect(s.stale(i)).toBe(true);
  });

  it("packs area, target and marks; commit settles exactly that cell", () => {
    const s = new OverlaySidecar(9);
    s.pack(
      said({
        area: [{ x: 0, y: 0 }],
        targets: [{ x: 1, y: 0 }],
        marks: [{ x: 1, y: 0, n: 3 }],
      }),
      idx,
      marks,
    );
    expect(s.packed[0]).toBe(HINT_AREA);
    expect(s.packed[1]).toBe(HINT_TARGET);
    expect(s.struck[1]).toBe(valueBit(3));
    s.commit(1);
    expect(s.stale(1)).toBe(false);
    expect(s.stale(0)).toBe(true);
  });

  it("keeps a candidate mask's highest values off the roles, and repaints on them", () => {
    // Solo and Unequal reach 31 values. Sharing one word, a strike on 30 once
    // packed exactly as "this cell is the target", and swapping the two
    // repainted nothing.
    // A ringed note rings its cell (`NOTE.within`), so the word is the target
    // role and nothing more.
    const s = new OverlaySidecar(9);
    s.pack(said({ targets: [{ x: 0, y: 0 }] }), idx, marks);
    s.commit(0);
    s.pack(said({ marks: [{ x: 0, y: 0, n: 30 }] }), idx, marks);
    expect(s.packed[0]).toBe(HINT_TARGET);
    expect(s.struck[0]).toBe(valueBit(30));
    expect(s.stale(0)).toBe(true);
    s.commit(0);
    s.pack(said({ marks: [{ x: 0, y: 0, n: 31 }] }), idx, marks);
    expect(s.stale(0)).toBe(true);
  });

  it("a hint change makes exactly the affected cells stale again", () => {
    const s = new OverlaySidecar(9);
    s.pack(said({ targets: [{ x: 2, y: 2 }] }), idx, marks);
    for (let i = 0; i < 9; i++) s.commit(i);
    // The hint moves to another cell: old cell must repaint (erase), new
    // cell must repaint (draw), the rest are settled.
    s.pack(said({ targets: [{ x: 0, y: 1 }] }), idx, marks);
    expect(s.stale(idx(2, 2))).toBe(true);
    expect(s.stale(idx(0, 1))).toBe(true);
    expect(s.stale(idx(1, 1))).toBe(false);
  });

  it("an evidence cell whose outline changes shape is stale, though its word is not", () => {
    // (1,1) is evidence in both frames: alone, then the middle of a row. Its
    // packed word is HINT_AREA both times while two of its sides go away, and a
    // mark drawn inside the cell is undone only by the cell repainting.
    const row = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ];
    const s = new OverlaySidecar(9);
    s.pack(said({ area: [{ x: 1, y: 1 }] }), idx, marks);
    for (let i = 0; i < 9; i++) s.commit(i);
    s.pack(said({ area: row }), idx, marks);
    expect(s.packed[idx(1, 1)]).toBe(HINT_AREA);
    expect(s.stale(idx(1, 1))).toBe(true);
    // The same shape again repaints nothing.
    for (let i = 0; i < 9; i++) s.commit(i);
    s.pack(said({ area: row }), idx, marks);
    expect(s.stale(idx(1, 1))).toBe(false);
  });

  it("packing no marks clears the overlay (hint dismissed)", () => {
    const s = new OverlaySidecar(4);
    s.pack(said({ targets: [{ x: 0, y: 0 }] }), (x, y) => y * 2 + x, marks);
    for (let i = 0; i < 4; i++) s.commit(i);
    s.pack(stepMarks(null), (x, y) => y * 2 + x, marks);
    expect(s.stale(0)).toBe(true); // the erased cell repaints
    expect(s.stale(1)).toBe(false);
  });

  it("packCells flags a mistake list and leaves the rest clear", () => {
    const s = new OverlaySidecar(9);
    s.packCells(
      [
        { x: 1, y: 0 },
        { x: 2, y: 2 },
      ],
      idx,
    );
    expect(s.packed[idx(1, 0)]).toBe(OVERLAY_FLAG);
    expect(s.at(idx(2, 2))).toBe(true);
    expect(s.at(idx(0, 0))).toBe(false);
  });

  it("a mistake overlay that clears makes the flagged cells stale again", () => {
    const s = new OverlaySidecar(9);
    s.packCells([{ x: 1, y: 1 }], idx);
    for (let i = 0; i < 9; i++) s.commit(i);
    // Check & Save's overlay is dropped on the next move: the cell that showed
    // a red highlight must repaint to erase it. (Towers shipped this bug — its
    // mistake array was missing from the diff key, so nothing lit up at all.)
    s.packCells(null, idx);
    expect(s.stale(idx(1, 1))).toBe(true);
    expect(s.stale(idx(0, 0))).toBe(false);
  });

  it("clear + add packs a game's own overlay topology", () => {
    // Galaxies' wall overlay: one mistake contributes different bits to the two
    // tiles the wall separates, so it packs itself rather than by cell list.
    const s = new OverlaySidecar(4);
    s.clear();
    s.add(2, 1 << 0);
    s.add(2, 1 << 3);
    expect(s.packed[2]).toBe(0b1001);
    expect(s.at(2)).toBe(true);
    s.commit(2);
    s.clear();
    expect(s.stale(2)).toBe(true);
  });
});
