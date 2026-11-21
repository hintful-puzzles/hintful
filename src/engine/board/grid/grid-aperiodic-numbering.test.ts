/**
 * **An aperiodic patch's desc builds the grid it always has, numbered as it
 * always was** (Penrose P2/P3, hats, spectres). These tilings are dealt at
 * random, so a Loopy game ID carries the patch's desc and then a clue per face
 * in face order: a desc that builds another patch, or the same patch
 * renumbered, reads every shared link as another board. The numbering is
 * upstream's (`grid.c`), which also keeps a link from Simon Tatham's site
 * opening the same board here.
 *
 * `__fixtures__/grid-aperiodic-numbering.json` was recorded from the C, and
 * nothing can re-record it, so it stays the answer. Each record is built from
 * its recorded desc, consuming no randomness, which exercises the metatile
 * recursion, the BFS, the half-tile pairing and `gridTrimVigorously`. Which
 * patch a seed deals is not held (a record's `seed` is unused), and neither
 * are coordinates and sizes, which are display.
 */

import { describe, expect, it } from "vitest";
import reference from "./__fixtures__/grid-aperiodic-numbering.json" with {
  type: "json",
};
import {
  APERIODIC_GRID_TYPES,
  type Grid,
  type GridType,
  gridNew,
  gridValidateDesc,
} from "./index.ts";

/** One `(type, w, h, desc)` patch's incidence. */
interface AperiodicFixture {
  type: string;
  width: number;
  height: number;
  desc: string;
  edges: [number, number, number, number][];
  faces: { order: number; dots: number[]; edges: number[] }[];
  dotRings: { order: number; edges: number[]; faces: number[] }[];
}

const fixtures = reference as unknown as AperiodicFixture[];

/** A `Grid`'s incidence, in the fixture's shape. */
function dump(g: Grid): Pick<AperiodicFixture, "edges" | "faces" | "dotRings"> & {
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

describe("aperiodic patches keep their numbering", () => {
  it("has a fixture for every aperiodic tiling", () => {
    // Guards against a silently-shrinking matrix, which would pass vacuously.
    const covered = new Set(fixtures.map((f) => f.type));
    expect([...covered].sort()).toEqual([...APERIODIC_GRID_TYPES].sort());
  });

  fixtures.forEach((f, i) => {
    describe(`${f.type} ${f.width}x${f.height} #${i}`, () => {
      // Built lazily and memoized: constructing at describe-body time would let
      // one unimplemented tiling abort collection for the whole file, hiding
      // every other tiling's result.
      let memo: ReturnType<typeof dump> | null = null;
      const got = (): ReturnType<typeof dump> => {
        memo ??= dump(gridNew(f.type as GridType, f.width, f.height, f.desc));
        return memo;
      };

      it("accepts the desc as valid", () => {
        expect(
          gridValidateDesc(f.type as GridType, f.width, f.height, f.desc),
        ).toBeNull();
      });

      // Split into separate assertions so a failure names *what* diverged — a
      // trimming bug (counts), a face-corner order slip (faces), or a
      // makeConsistent ring bug (dotRings).
      it("survives trimming with the same face, edge and dot counts", () => {
        // Asserted before the full dumps below, because a trimming divergence
        // otherwise surfaces as thousands of lines of index diff whose real
        // cause is "we kept the wrong faces".
        expect({
          faces: got().faces.length,
          edges: got().edges.length,
          dots: got().dotRings.length,
        }).toEqual({
          faces: f.faces.length,
          edges: f.edges.length,
          dots: f.dotRings.length,
        });
      });

      it("edges, with their dots and faces", () => {
        expect(got().edges).toEqual(f.edges);
      });

      it("faces, with their clockwise dot and edge rings", () => {
        expect(got().faces).toEqual(f.faces);
      });

      it("per-dot edge and face rings", () => {
        // Loopy's dline machinery indexes on these rings, so an ordering slip
        // silently corrupts every deduction rather than failing loudly.
        expect(got().dotRings).toEqual(f.dotRings);
      });

      it("no dot coordinate is fractional", () => {
        // Dot dedup is by exact coordinate equality, so a fractional
        // coordinate produces duplicate dots rather than an error.
        for (const [x, y] of got().dots) {
          expect(Number.isInteger(x)).toBe(true);
          expect(Number.isInteger(y)).toBe(true);
        }
      });
    });
  });
});
