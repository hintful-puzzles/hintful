/**
 * **A periodic tiling numbers its faces, edges and dots as it always has.** A
 * Loopy game ID lists a clue per face in face order, and a saved move names an
 * edge, so a renumbered grid reads every shared link as another board. The
 * numbering is upstream's (`grid.c`), which is also what keeps a link from Simon
 * Tatham's site opening the same board here.
 *
 * `__fixtures__/grid-numbering.json` was recorded from the C, and nothing can
 * re-record it, so it stays the answer: indices are assigned in first-encounter
 * order by each tiling's emission loop, and index-exact incidence proves the
 * loop's order, not merely the shape. Coordinates and sizes are display, which
 * is free to change, so the recorded `tileSize`, `boundingBox` and dot
 * positions are not asserted.
 */

import { describe, expect, it } from "vitest";
import reference from "./__fixtures__/grid-numbering.json" with { type: "json" };
import { type Grid, type GridType, gridNew } from "./index.ts";

/** One `(type, w, h, desc)` grid's incidence. */
interface GridFixture {
  type: string;
  width: number;
  height: number;
  desc: string | null;
  /** `[dot1, dot2, face1, face2]` per edge; `-1` face = infinite exterior. */
  edges: [number, number, number, number][];
  faces: { order: number; dots: number[]; edges: number[] }[];
  dotRings: { order: number; edges: number[]; faces: number[] }[];
}

const fixtures = reference as unknown as GridFixture[];

/** A `Grid`'s incidence, in the fixture's shape. */
function dump(g: Grid): Pick<GridFixture, "edges" | "faces" | "dotRings"> & {
  dots: [number, number][];
} {
  return {
    dots: g.dots.map((d) => [d.x, d.y]),
    edges: g.edges.map((e) => [
      e.dot1.index,
      e.dot2.index,
      e.face1 === null ? -1 : e.face1.index,
      e.face2 === null ? -1 : e.face2.index,
    ]),
    faces: g.faces.map((f) => ({
      order: f.order,
      dots: f.dots.map((d) => (d === null ? -1 : d.index)),
      edges: f.edges.map((e) => (e === null ? -1 : e.index)),
    })),
    dotRings: g.dots.map((d) => ({
      order: d.order,
      edges: d.edges.map((e) => (e === null ? -1 : e.index)),
      faces: d.faces.map((f) => (f === null ? -1 : f.index)),
    })),
  };
}

describe("periodic tilings keep their numbering", () => {
  it("has a fixture for every periodic tiling", () => {
    // Guards against a silently-shrinking matrix, which would pass vacuously.
    const covered = new Set(fixtures.map((f) => f.type));
    expect([...covered].sort()).toEqual(
      [
        "cairo",
        "compassdodecagonal",
        "dodecagonal",
        "floret",
        "greatdodecagonal",
        "greatgreatdodecagonal",
        "greathexagonal",
        "honeycomb",
        "kagome",
        "kites",
        "octagonal",
        "snubsquare",
        "square",
        "triangular",
      ].sort(),
    );
  });

  for (const f of fixtures) {
    const label = `${f.type} ${f.width}x${f.height}${f.desc === null ? "" : ` desc=${f.desc}`}`;

    describe(label, () => {
      // Built lazily and memoized: constructing at describe-body time would
      // make one unimplemented tiling abort collection for the whole file,
      // hiding every other tiling's result.
      let memo: ReturnType<typeof dump> | null = null;
      const got = (): ReturnType<typeof dump> => {
        memo ??= dump(gridNew(f.type as GridType, f.width, f.height, f.desc));
        return memo;
      };

      // Split into separate assertions so a failure names *what* diverged —
      // a face-corner order slip (faces), or a makeConsistent ring bug
      // (dotRings) — rather than one wall of diff.
      it("edges, with their dots and faces", () => {
        expect(got().edges).toEqual(f.edges);
      });

      it("faces, with their clockwise dot and edge rings", () => {
        expect(got().faces).toEqual(f.faces);
      });

      it("per-dot edge and face rings", () => {
        // Loopy's dline machinery indexes on these rings
        // (`2*edge.index + (edge.dot1 === dot ? 1 : 0)`), so an ordering slip
        // here silently corrupts every deduction rather than failing loudly.
        expect(got().dotRings).toEqual(f.dotRings);
      });

      it("no dot coordinate is fractional", () => {
        // Dot dedup is by exact coordinate equality (grid.c:1404 "No
        // floating-point arithmetic here!"), so a fractional coordinate produces
        // duplicate dots and a structurally broken grid rather than an error.
        for (const [x, y] of got().dots) {
          expect(Number.isInteger(x)).toBe(true);
          expect(Number.isInteger(y)).toBe(true);
        }
      });
    });
  }
});
