/**
 * Tier-1 tests for the edges of a square grid.
 *
 * They state the rules the module's header claims: the direction algebra's
 * group structure, that one edge is one number seen the same from both its
 * squares, and that a point aimed at a side reads back as that side. Every
 * edge game's pointer leans on the last, and its own tests reach it only
 * through one game's input at a time.
 */
import { describe, expect, it } from "vitest";
import {
  across,
  anticlockwise,
  clockwise,
  D,
  DIRECTIONS,
  DOWN,
  DX,
  DY,
  dirCount,
  directionOf,
  dirX,
  dirY,
  edgeAt,
  edgeBetween,
  edgeMiddle,
  isHorizontal,
  L,
  LEFT,
  opposite,
  pointAtEdge,
  pointAtSide,
  R,
  RIGHT,
  reverse,
  rot,
  sideAt,
  sideOf,
  squareEdges,
  U,
  UP,
} from "./square-edges.ts";

const ALL = R | U | L | D;

describe("direction algebra", () => {
  it("lists the four directions in upstream's iteration order", () => {
    // Ports of upstream loops (`d = 1; d < 0x10; d <<= 1`) depend on this
    // order, and Net's `growSpanningTree` indexes the RNG through it.
    expect(DIRECTIONS).toEqual([R, U, L, D]);
    expect([R, U, L, D]).toEqual([0x01, 0x02, 0x04, 0x08]);
  });

  it("names a direction's bit by the direction: `1 << d`", () => {
    // The reason for the order: a stored mask and a direction meet without a
    // table.
    expect([RIGHT, UP, LEFT, DOWN].map((d) => 1 << d)).toEqual([R, U, L, D]);
    for (const d of [RIGHT, UP, LEFT, DOWN]) {
      expect(DX[d]).toBe(dirX(1 << d));
      expect(DY[d]).toBe(dirY(1 << d));
      expect(1 << reverse(d)).toBe(opposite(1 << d));
    }
  });

  it("rotates every mask as a group: four turns is the identity", () => {
    for (let m = 0; m <= ALL; m++) {
      expect(anticlockwise(anticlockwise(anticlockwise(anticlockwise(m))))).toBe(m);
      expect(clockwise(clockwise(clockwise(clockwise(m))))).toBe(m);
      // The two rotations are inverses, and two of either is a reversal.
      expect(clockwise(anticlockwise(m))).toBe(m);
      expect(anticlockwise(anticlockwise(m))).toBe(opposite(m));
      expect(opposite(opposite(m))).toBe(m);
    }
  });

  it("turns each single direction into its neighbor, anticlockwise on screen", () => {
    // y grows downward, so "anticlockwise" is R -> U -> L -> D -> R.
    expect([R, U, L, D].map(anticlockwise)).toEqual([U, L, D, R]);
    expect([R, U, L, D].map(clockwise)).toEqual([D, R, U, L]);
    expect([R, U, L, D].map(opposite)).toEqual([L, D, R, U]);
  });

  it("rot(x, n) is n quarter-turns, and only the low two bits of n matter", () => {
    for (let m = 0; m <= ALL; m++) {
      expect(rot(m, 0)).toBe(m);
      expect(rot(m, 1)).toBe(anticlockwise(m));
      expect(rot(m, 2)).toBe(opposite(m));
      expect(rot(m, 3)).toBe(clockwise(m));
      expect(rot(m, 5)).toBe(rot(m, 1));
      expect(rot(m, -3)).toBe(rot(m, 1)); // `n & 3` on a negative turn
    }
  });

  it("rotation preserves the count — it turns a mask, it does not change it", () => {
    for (let m = 0; m <= ALL; m++) {
      for (let n = 0; n < 4; n++) expect(dirCount(rot(m, n))).toBe(dirCount(m));
    }
  });

  it("counts directions as set bits of the low nibble", () => {
    expect(dirCount(0)).toBe(0);
    expect(dirCount(R)).toBe(1);
    expect(dirCount(R | L)).toBe(2);
    expect(dirCount(R | U | L)).toBe(3);
    expect(dirCount(ALL)).toBe(4);
    // High bits are each game's own (Net's LOCKED, Netslide's FLASHING).
    expect(dirCount(0x10 | R)).toBe(1);
  });

  it("maps a direction to its displacement, and a step back to its direction", () => {
    expect([R, U, L, D].map(dirX)).toEqual([1, 0, -1, 0]);
    expect([R, U, L, D].map(dirY)).toEqual([0, -1, 0, 1]);
    for (const d of [RIGHT, UP, LEFT, DOWN]) expect(directionOf(DX[d], DY[d])).toBe(d);
  });
});

describe("the edges of a board", () => {
  const g = squareEdges(4, 3);

  it("numbers every edge between two squares once, the side-by-side ones first", () => {
    expect(g.edgeCount).toBe(3 * 3 + 4 * 2);
    for (let e = 0; e < g.edgeCount; e++) {
      expect(g.a[e]).toBeLessThan(g.b[e]);
      expect(g.b[e] - g.a[e]).toBe(isHorizontal(g, e) ? 1 : g.w);
    }
    // Reading order within each kind.
    for (let e = 1; e < g.edgeCount; e++)
      if (isHorizontal(g, e) === isHorizontal(g, e - 1))
        expect(g.a[e]).toBeGreaterThan(g.a[e - 1]);
  });

  it("is the same edge from either square, and the square across it is the other", () => {
    for (let e = 0; e < g.edgeCount; e++) {
      const [i, j] = [g.a[e], g.b[e]];
      expect(edgeBetween(g, i, j)).toBe(e);
      expect(edgeBetween(g, j, i)).toBe(e);
      expect(across(g, e, i)).toBe(j);
      expect(across(g, e, j)).toBe(i);
      expect(g.around[i * 4 + sideOf(g, e, i)]).toBe(e);
      expect(g.around[j * 4 + sideOf(g, e, j)]).toBe(e);
      expect(sideOf(g, e, j)).toBe(reverse(sideOf(g, e, i)));
    }
  });

  it("puts a square's edge on side `d` toward the square a step `d` away", () => {
    for (let i = 0; i < g.cells; i++)
      for (let d = 0; d < 4; d++) {
        const [x, y] = [(i % g.w) + DX[d], Math.floor(i / g.w) + DY[d]];
        const onBoard = x >= 0 && x < g.w && y >= 0 && y < g.h;
        const e = g.around[i * 4 + d];
        expect(e >= 0).toBe(onBoard);
        if (onBoard) expect(across(g, e, i)).toBe(y * g.w + x);
      }
  });

  it("has no edge between squares that do not share a side", () => {
    expect(edgeBetween(g, 0, 5)).toBe(-1);
    expect(edgeBetween(g, 3, 4)).toBe(-1); // the end of one row and the next
  });

  it("is the one board for one size", () => {
    expect(squareEdges(4, 3)).toBe(g);
  });
});

describe("aiming at an edge", () => {
  const g = squareEdges(3, 3);
  const m = { tile: 30, border: 7 };

  it("reads a point aimed at any side back as that side", () => {
    for (let cell = 0; cell < g.cells; cell++)
      for (let dir = 0; dir < 4; dir++) {
        const want = g.around[cell * 4 + dir] >= 0 ? { cell, dir } : null;
        for (const still of [0, 1 / 4])
          expect(sideAt(g, m, pointAtSide(g, m, { cell, dir }), still)).toEqual(want);
      }
    for (let e = 0; e < g.edgeCount; e++)
      expect(edgeAt(g, m, pointAtEdge(g, m, e))).toBe(e);
  });

  it("aims at nothing near a square's middle, unless told the middle is not still", () => {
    const center = { x: m.border + m.tile + 15, y: m.border + m.tile + 15 };
    expect(sideAt(g, m, center)).toBeNull();
    // On the diagonal, the vertical side wins.
    expect(sideAt(g, m, center, 0)).toEqual({ cell: 4, dir: DOWN });
    expect(sideAt(g, m, { x: center.x - 9, y: center.y - 9 }, 0)).toEqual({
      cell: 4,
      dir: UP,
    });
  });

  it("aims at nothing off the board or on its rim", () => {
    expect(sideAt(g, m, { x: 0, y: 0 }, 0)).toBeNull();
    expect(sideAt(g, m, pointAtSide(g, m, { cell: 0, dir: LEFT }))).toBeNull();
  });

  it("finds an edge's middle on the line the two squares share", () => {
    const e = edgeBetween(g, 0, 1);
    expect(edgeMiddle(g, m, e)).toEqual({ x: m.border + m.tile, y: m.border + 15 });
  });
});
