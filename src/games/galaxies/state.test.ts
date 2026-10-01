import { describe, expect, it } from "vitest";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import {
  blankGame,
  checkComplete,
  cloneState,
  encodeGame,
  F_DOT,
  F_DOT_BLACK,
  F_EDGE_SET,
  idx,
  inInterior,
  isVerticalEdge,
  parseDesc,
  rebuildDots,
  SpaceType,
  spaceTypeAt,
} from "./state.ts";

describe("Galaxies geometry helpers", () => {
  it("spaceTypeAt classifies cells by parity", () => {
    expect(spaceTypeAt(0, 0)).toBe(SpaceType.Vertex);
    expect(spaceTypeAt(2, 0)).toBe(SpaceType.Vertex);
    expect(spaceTypeAt(0, 1)).toBe(SpaceType.Edge);
    expect(spaceTypeAt(1, 0)).toBe(SpaceType.Edge);
    expect(spaceTypeAt(1, 1)).toBe(SpaceType.Tile);
    expect(spaceTypeAt(3, 5)).toBe(SpaceType.Tile);
  });

  it("isVerticalEdge follows IS_VERTICAL_EDGE(x % 2 == 0)", () => {
    expect(isVerticalEdge(0)).toBe(true); // vertical edge at even col
    expect(isVerticalEdge(2)).toBe(true);
    expect(isVerticalEdge(1)).toBe(false);
    expect(isVerticalEdge(3)).toBe(false);
  });

  it("blankGame sets border edges only", () => {
    const s = blankGame(3, 3);
    expect(s.sx).toBe(7);
    expect(s.sy).toBe(7);
    // Outer perimeter edges set; interior unset.
    for (let x = 0; x < s.sx; x++) {
      const t0 = spaceTypeAt(x, 0);
      const t1 = spaceTypeAt(x, s.sy - 1);
      if (t0 === SpaceType.Edge) {
        expect(s.flags[idx(s, x, 0)] & F_EDGE_SET).toBeTruthy();
      }
      if (t1 === SpaceType.Edge) {
        expect(s.flags[idx(s, x, s.sy - 1)] & F_EDGE_SET).toBeTruthy();
      }
    }
    // Interior edge should be unset.
    expect(s.flags[idx(s, 2, 1)] & F_EDGE_SET).toBeFalsy();
  });
});

describe("Galaxies desc encode/decode", () => {
  it("round-trips a manually-crafted dot bitmap", () => {
    // 5x5: place a white dot at (3,3), a black dot at (5,5).
    const s = blankGame(5, 5);
    s.flags[idx(s, 3, 3)] |= F_DOT;
    s.flags[idx(s, 5, 5)] |= F_DOT;
    s.flags[idx(s, 5, 5)] |= F_DOT_BLACK;
    s.dots = rebuildDots(s);
    const desc = encodeGame(s);

    const parse = parseDesc({ w: 5, h: 5 }, desc);
    expect(descVerdict(parse)).toBeNull();
    const decoded = descValue(parse);
    expect(decoded.dots).toEqual([
      { x: 3, y: 3 },
      { x: 5, y: 5 },
    ]);
    expect(decoded.flags[idx(decoded, 5, 5)] & F_DOT_BLACK).toBeTruthy();
    expect(decoded.flags[idx(decoded, 3, 3)] & F_DOT_BLACK).toBeFalsy();
  });

  const verdict = (w: number, h: number, desc: string) =>
    descVerdict(parseDesc({ w, h }, desc));

  it("rejects out-of-grid desc", () => {
    // 'z' = 25 spaces (no dot), then 'b' = 1 space + white dot. On
    // a 3x3 grid the inner subcell area is 5x5 = 25 cells, so the
    // second token lands beyond the grid.
    expect(verdict(3, 3, "zb")).toBe(DESC_TOO_LONG);
    // 'y' is the last space of the 25.
    expect(verdict(3, 3, "y")).toBeNull();
    expect(verdict(3, 3, "ya")).toBe(DESC_TOO_LONG);
  });

  it("rejects invalid characters", () => {
    expect(verdict(3, 3, "1")).toBe(descBadCharacter("1"));
    // `Z` is no token: a run of empties is `z` whatever the dot after it.
    expect(verdict(7, 7, "ZA")).toBe(descBadCharacter("Z"));
  });

  it("rejects a desc with no dot, or ending in a run of empties", () => {
    // The encoder drops the empties after the last dot, and a board has a dot.
    expect(verdict(3, 3, "")).toBe(DESC_TOO_SHORT);
    expect(verdict(7, 7, "az")).toBe(DESC_TOO_SHORT);
    expect(verdict(7, 7, "az".padEnd(8, "z"))).toBe(DESC_TOO_LONG);
  });
});

describe("checkComplete", () => {
  it("trivially complete: a single-dot puzzle with the dot at center", () => {
    // 3x3 with one white dot at the center (3,3). Outer border edges
    // are already set; no interior edges means everything is one
    // region centered on (3,3), which is symmetric.
    const s = blankGame(3, 3);
    s.flags[idx(s, 3, 3)] |= F_DOT;
    s.dots = rebuildDots(s);
    const { complete, colors } = checkComplete(s, true);
    expect(complete).toBe(true);
    expect(colors).toBeDefined();
    if (!colors) return;
    expect(Array.from(colors)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it("clone preserves completion state", () => {
    const s = blankGame(3, 3);
    s.flags[idx(s, 3, 3)] |= F_DOT;
    s.dots = rebuildDots(s);
    const c = cloneState(s);
    expect(c.dots).toEqual(s.dots);
    expect(c.flags).not.toBe(s.flags);
    // Mutating clone doesn't affect original.
    c.flags[idx(c, 3, 3)] |= F_DOT_BLACK;
    expect(s.flags[idx(s, 3, 3)] & F_DOT_BLACK).toBeFalsy();
  });

  it("inInterior excludes the perimeter", () => {
    const s = blankGame(3, 3);
    expect(inInterior(s, 0, 1)).toBe(false);
    expect(inInterior(s, 1, 0)).toBe(false);
    expect(inInterior(s, 1, 1)).toBe(true);
    expect(inInterior(s, s.sx - 1, 1)).toBe(false);
  });
});
