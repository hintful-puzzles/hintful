// Tier-1 tests for the shared border-marking mechanic (Palisade + Separate).
//
// The games' own suites already exercise this through their differentials and
// render snapshots, which is what proved the extraction was a no-op. These tests
// exist for the opposite reason: to pin the mechanic's contract *directly*, so a
// future change to it fails here — naming the rule it broke — rather than only
// as a moved fixture in two games.
import { describe, expect, it } from "vitest";
import {
  BORDER,
  type BorderEdit,
  type BorderGridState,
  type BorderGridUi,
  borderGridGeometry,
  borderGridVerbs,
  buildDsf,
  DISABLED,
  edgeEdits,
  FLIP,
  initBorders,
  pointerEdge,
} from "./border-grid.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  LEFT_BUTTON,
  newCursor,
  RIGHT_BUTTON,
} from "./pointer.ts";
import { interpretTargetVerbs } from "./target-verb.ts";

const TS = 32;
const grid = (w: number, h: number, borders?: Uint8Array): BorderGridState => ({
  w,
  h,
  borders: borders ?? initBorders(w, h),
});
const ui = (x = 1, y = 1, show = false): BorderGridUi => ({
  cursor: newCursor(x, y, show),
});

/** Center of the edge between cell (x,y) and its neighbor in direction dir. */
const edgeMidpoint = (x: number, y: number, dir: number) => {
  const m = Math.floor(TS / 2);
  const cx = m + x * TS + TS / 2;
  const cy = m + y * TS + TS / 2;
  const dx = [0, +1, 0, -1][dir] * (TS / 2 - 2);
  const dy = [-1, 0, +1, 0][dir] * (TS / 2 - 2);
  return { x: Math.round(cx + dx), y: Math.round(cy + dy) };
};

describe("border vocabulary", () => {
  it("FLIP is an involution that faces the opposite direction", () => {
    for (const dir of [0, 1, 2, 3]) {
      expect(FLIP(FLIP(dir))).toBe(dir);
      expect(FLIP(dir)).not.toBe(dir);
    }
  });

  it("a border bit and its DISABLED companion never collide", () => {
    for (const dir of [0, 1, 2, 3]) {
      expect(BORDER(dir) & DISABLED(BORDER(dir))).toBe(0);
    }
  });

  it("initBorders walls the rim and nothing else", () => {
    const b = initBorders(3, 3);
    // The center cell of a 3x3 touches no rim.
    expect(b[4]).toBe(0);
    // Every other cell has at least one rim wall.
    for (const i of [0, 1, 2, 3, 5, 6, 7, 8]) expect(b[i]).not.toBe(0);
  });
});

describe("buildDsf", () => {
  it("black=true merges across an edge with no wall", () => {
    // 2x1 grid, no interior wall: the two cells are one region.
    const b = initBorders(2, 1);
    expect(buildDsf(2, 1, b, true).equivalent(0, 1)).toBe(true);
  });

  it("black=true separates across a wall", () => {
    const b = initBorders(2, 1);
    b[0] |= BORDER(1); // wall on cell 0's right
    expect(buildDsf(2, 1, b, true).equivalent(0, 1)).toBe(false);
  });

  it("black=false merges only across an edge marked NOT a wall", () => {
    const b = initBorders(2, 1);
    // Undecided proves nothing: the two are not yet committed to one region.
    expect(buildDsf(2, 1, b, false).equivalent(0, 1)).toBe(false);
    b[0] |= DISABLED(BORDER(1));
    expect(buildDsf(2, 1, b, false).equivalent(0, 1)).toBe(true);
  });
});

describe("pointerEdge", () => {
  it("names the interior edge nearest the press", () => {
    const p = edgeMidpoint(1, 1, 1); // right edge of the center cell
    expect(pointerEdge(grid(3, 3), p.x, p.y, TS)).toEqual({ x: 1, y: 1, dir: 1 });
  });

  it("returns null outside the grid", () => {
    expect(pointerEdge(grid(3, 3), -50, -50, TS)).toBeNull();
  });

  it("breaks the tie toward the down edge at an exact tile center", () => {
    // Not a rejection. At the exact center both axes are equidistant, so each
    // `<` test is false: the left and up bits go first, then left|right go
    // again, leaving down. Pinned because a center click is a genuinely
    // reachable input (a precise click, or a synthetic tap at a tile's midpoint)
    // and the alternative — resolving to nothing — would put a dead zone in the
    // middle of every tile.
    const m = Math.floor(TS / 2);
    const center = { x: m + TS + TS / 2, y: m + TS + TS / 2 };
    expect(pointerEdge(grid(3, 3), center.x, center.y, TS)).toEqual({
      x: 1,
      y: 1,
      dir: 2,
    });
  });

  it("returns null on a rim edge, which has no second cell to pair with", () => {
    const p = edgeMidpoint(0, 0, 0); // top edge of the top-left cell
    expect(pointerEdge(grid(3, 3), p.x, p.y, TS)).toBeNull();
  });
});

describe("edgeEdits", () => {
  const edge = { x: 1, y: 1, dir: 1 };
  const wall = [
    { x: 1, y: 1, flag: BORDER(1) },
    { x: 2, y: 1, flag: BORDER(FLIP(1)) },
  ];
  const notWall = [
    { x: 1, y: 1, flag: DISABLED(BORDER(1)) },
    { x: 2, y: 1, flag: DISABLED(BORDER(FLIP(1))) },
  ];
  const marked = (flag: number) => {
    const b = initBorders(3, 3);
    b[1 * 3 + 1] |= flag;
    return grid(3, 3, b);
  };

  it("toward a wall: undecided → wall → undecided, on both cells", () => {
    expect(edgeEdits(grid(3, 3), edge, true)).toEqual(wall);
    expect(edgeEdits(marked(BORDER(1)), edge, true)).toEqual(wall);
  });

  it("toward not-a-wall: the disabled nibble, the same way", () => {
    expect(edgeEdits(grid(3, 3), edge, false)).toEqual(notWall);
    expect(edgeEdits(marked(DISABLED(BORDER(1))), edge, false)).toEqual(notWall);
  });

  it("an edge marked the other way switches straight over", () => {
    const both = (a: BorderEdit[], b: BorderEdit[]) =>
      a.map((e, i) => ({ ...e, flag: e.flag | b[i].flag }));
    expect(edgeEdits(marked(DISABLED(BORDER(1))), edge, true)).toEqual(
      both(wall, notWall),
    );
    expect(edgeEdits(marked(BORDER(1)), edge, false)).toEqual(both(wall, notWall));
  });
});

describe("borderGridGeometry", () => {
  const geometry = borderGridGeometry<BorderGridState, { tileSize: number }>();

  it("the cursor names an edge on a half-cell, and nothing on a corner or center", () => {
    const s = grid(3, 3);
    expect(geometry.cursorTarget(s, ui(2, 3))).toEqual({ x: 1, y: 1, dir: 3 });
    expect(geometry.cursorTarget(s, ui(3, 2))).toEqual({ x: 1, y: 1, dir: 0 });
    expect(geometry.cursorTarget(s, ui(3, 3))).toBeNull();
    expect(geometry.cursorTarget(s, ui(2, 2))).toBeNull();
  });

  it("parking puts the cursor on the edge a press named", () => {
    const u = ui();
    geometry.parkCursor(u, { x: 1, y: 1, dir: 1 });
    // Half-cell coordinates: the edge right of cell (1,1) is at x = 2*1+1+1 = 4.
    expect(u.cursor).toMatchObject({ x: 4, y: 3 });
    expect(geometry.cursorTarget(grid(3, 3), u)).toEqual({ x: 2, y: 1, dir: 3 });
  });

  // Both axes, and both ends of each: a walk along one axis alone leaves the
  // other axis's clamp — the same line — unasserted.
  it.each([
    ["up", CURSOR_UP, "y", 1],
    ["down", CURSOR_DOWN, "y", 5],
    ["left", CURSOR_LEFT, "x", 1],
    ["right", CURSOR_RIGHT, "x", 5],
  ] as const)("keeps the cursor inside the grid walking %s", (_name, key, axis, limit) => {
    // Half-cell coordinates on a 3×3 board run 1..2*3-1 = 1..5.
    const s = grid(3, 3);
    const u = ui(3, 3, true);
    for (let i = 0; i < 10; i++) geometry.moveCursor(s, u, key);
    expect(u.cursor[axis]).toBe(limit);
    // The other axis did not drift while this one was clamped.
    expect(u.cursor[axis === "x" ? "y" : "x"]).toBe(3);
  });
});

describe("borderGridVerbs", () => {
  const verbs = borderGridVerbs<
    BorderGridState,
    BorderGridUi,
    { tileSize: number },
    BorderEdit[]
  >((edits) => edits);
  const run = (u: BorderGridUi, button: number, p = { x: 0, y: 0 }) =>
    interpretTargetVerbs(verbs, grid(3, 3), u, { tileSize: TS }, p, button);

  it("a click and a key on the same edge make the same edits", () => {
    const p = edgeMidpoint(1, 1, 3); // left edge of the center cell
    const u = ui();
    expect(run(u, LEFT_BUTTON, p)).toEqual(run(ui(2, 3, true), CURSOR_SELECT));
    expect(run(u, RIGHT_BUTTON, p)).toEqual(run(ui(2, 3, true), CURSOR_SELECT2));
  });
});
