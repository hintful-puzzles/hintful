// Tier-2 render test (see the `testing` spec): drive Cube's `redraw`
// against the engine's shared `RecordingDrawing` and assert the structure of
// the draw calls — a background fill, one polygon per grid square (painted
// squares in COL_PAINT), the projected solid's faces, and a final update.
import { describe, expect, it } from "vitest";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH } from "../../engine/win-wave.ts";
import { gridArea } from "./grid.ts";
import { cubeGame, executeMove } from "./index.ts";
import {
  COL_BACKGROUND,
  COL_BORDER,
  COL_CELL,
  COL_FLASH,
  COL_GRID,
  COL_PAINT,
  COL_SOLID,
} from "./render.ts";
import { SOLIDS, SolidType } from "./solids.ts";
import { type CubeParams, newState } from "./state.ts";

const PALETTE = cubeGame.colors(DEFAULT_BACKGROUND);

function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const newDrawState = cubeGame.newDrawState as NonNullable<typeof cubeGame.newDrawState>;
const redraw = cubeGame.redraw as NonNullable<typeof cubeGame.redraw>;

/** A cube board with square 0 painted blue and the solid starting on a
 * non-blue square, sized at the preferred tile size. */
function freshCube() {
  const p: CubeParams = { solid: SolidType.Cube, d1: 4, d2: 4 };
  const area = gridArea(p.d1, p.d2, SOLIDS[p.solid].order);
  // Square 0 blue (top nibble bit 0x8), start on square 5.
  const desc = `8${"0".repeat(Math.floor((area + 3) / 4) - 1)},5`;
  const state = newState(p, desc);
  const ds = newDrawState(state, cubeGame.preferredTileSize ?? 48);
  return { p, state, ds };
}

describe("Cube rendering", () => {
  it("paints a background fill, every grid square, the solid, and an update", () => {
    const { state, ds } = freshCube();
    const { dr, ops } = recordingDrawing();

    redraw(dr, ds, null, state, 0, {}, 0, NO_FLASH);

    // A background rect at the origin.
    expect(
      opsOfKind(ops, "rect").some(
        (o) => o.x === 0 && o.y === 0 && o.color === COL_BACKGROUND,
      ),
    ).toBe(true);

    // One polygon per grid square is drawn before the solid's faces; the
    // total polygon count exceeds the square count by the visible faces.
    const polys = opsOfKind(ops, "polygon");
    expect(polys.length).toBeGreaterThan(state.grid.length);

    // The first `grid.length` polygons are the grid squares; square 0 is
    // painted, so at least one square polygon uses COL_PAINT.
    const squarePolys = polys.slice(0, state.grid.length);
    expect(squarePolys.some((o) => o.fill === COL_PAINT)).toBe(true);

    // Every other square is quiet surface inside a grid line, and the solid's
    // plain faces are lifted off it, edged in ink.
    expect(
      squarePolys.every(
        (o) => (o.fill === COL_PAINT || o.fill === COL_CELL) && o.outline === COL_GRID,
      ),
    ).toBe(true);
    const facePolys = polys.slice(state.grid.length);
    expect(
      facePolys.every((o) => o.fill === COL_SOLID && o.outline === COL_BORDER),
    ).toBe(true);

    // A final drawUpdate covering the canvas. The shared recorder keeps these
    // off `ops` (they are bookkeeping, not content) and counts them instead.
    expect(dr.updates.length).toBeGreaterThan(0);
  });

  it("draws fewer faces than the solid has (back-face culling)", () => {
    const { state, ds } = freshCube();
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 0, {}, 0, NO_FLASH);

    const polys = opsOfKind(ops, "polygon");
    const facePolys = polys.length - state.grid.length;
    // A cube shows at most 3 faces at once; culling must drop the rest.
    expect(facePolys).toBeGreaterThan(0);
    expect(facePolys).toBeLessThan(SOLIDS[SolidType.Cube].nfaces);
  });

  it("animates a roll without throwing and still draws the solid", () => {
    const { state, ds } = freshCube();
    const rolled = executeMove(state, { dir: "R" });
    const { dr, ops } = recordingDrawing();

    // Mid-roll: prev = old state, animTime between 0 and ROLLTIME.
    redraw(dr, ds, state, rolled, 0, {}, 0.06, NO_FLASH);

    const polys = opsOfKind(ops, "polygon");
    expect(polys.length).toBeGreaterThan(state.grid.length);
  });

  it.each([
    ["square", SolidType.Cube, 4, 4],
    ["triangular", SolidType.Tetrahedron, 2, 2],
  ] as const)("sweeps the win flash over a %s arena from the bottom left", (_name, solid, d1, d2) => {
    // No square painted, as on a won board, where the solid holds the paint.
    const p: CubeParams = { solid, d1, d2 };
    const area = gridArea(p.d1, p.d2, SOLIDS[p.solid].order);
    const state = newState(p, `${"0".repeat(Math.floor((area + 3) / 4))},0`);
    // The squares of the arena filled in the flash's color, by index.
    const paint = (flash: Flash): number[] => {
      const { dr, ops } = recordingDrawing();
      const ds = newDrawState(state, cubeGame.preferredTileSize ?? 48);
      redraw(dr, ds, null, state, 1, {}, 0, flash);
      return opsOfKind(ops, "polygon")
        .slice(0, state.grid.length)
        .flatMap((o, i) => (o.fill === COL_FLASH ? [i] : []));
    };
    expect(paint(NO_FLASH)).toEqual([]);
    // A square's place in the sweep: its center's x less its y.
    const step = (i: number): number => {
      const { points, npoints } = state.grid[i];
      let at = 0;
      for (let j = 0; j < npoints; j++) at += points[2 * j] - points[2 * j + 1];
      return at / npoints;
    };
    expectWinFlashTravels(
      winFlashRun(paint, (squares) => squares),
      state.grid.length,
      step,
    );
  });
});
