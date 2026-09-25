/**
 * Every game's first frame paints every pixel of its canvas.
 *
 * The frontend's canvas is opaque (`alpha: false`), so it starts black: any
 * pixel a first frame leaves bare shows as black on the player's screen. Pegs
 * and Sixteen shipped that way for months, framed in a black square in light
 * mode, and Mines and Pearl left a thin black ring — all with every snapshot
 * green, because a snapshot records what a frame drew and cannot see what it
 * did not (docs/games/testing.md § "A snapshot cannot see a hole"). The midend
 * now lays a color-0 ground under every first frame, so what this holds is that
 * ground: present, first, and the size of the canvas the game was given.
 *
 * It rasterizes the first frame's filled shapes — rects, lines, filled
 * polygons and circles — and counts the canvas pixels none of them touched.
 * The raster is coarse (no antialiasing, integer-rounded ops), which errs
 * toward calling a pixel painted; a hole it reports is a real one.
 */

import { describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import type { DrawOp } from "./testing/recording-drawing.ts";
import { renderScenario } from "./testing/render-scenario.ts";

// At import time, not in `beforeAll`: `it.each` reads the registry while the
// file is being collected.
registerAllGames();
const IDS = registeredGameIds().sort();

function unpaintedPixels(ops: readonly DrawOp[], w: number, h: number): number {
  const painted = new Uint8Array(w * h);
  const paint = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < w && y < h) painted[y * w + x] = 1;
  };
  for (const op of ops) {
    if (op.op === "rect") {
      for (let y = op.y; y < op.y + op.h; y++)
        for (let x = op.x; x < op.x + op.w; x++) paint(x, y);
    } else if (op.op === "line") {
      const steps = Math.max(Math.abs(op.x2 - op.x1), Math.abs(op.y2 - op.y1), 1);
      const t = Math.max(1, Math.round(op.thickness));
      for (let i = 0; i <= steps; i++) {
        const x = Math.round(op.x1 + ((op.x2 - op.x1) * i) / steps) - (t >> 1);
        const y = Math.round(op.y1 + ((op.y2 - op.y1) * i) / steps) - (t >> 1);
        for (let dy = 0; dy < t; dy++)
          for (let dx = 0; dx < t; dx++) paint(x + dx, y + dy);
      }
    } else if (op.op === "circle" && op.fill >= 0) {
      for (let y = op.cy - op.r; y <= op.cy + op.r; y++)
        for (let x = op.cx - op.r; x <= op.cx + op.r; x++)
          if ((x - op.cx) ** 2 + (y - op.cy) ** 2 <= op.r ** 2) paint(x, y);
    } else if (op.op === "polygon" && op.fill >= 0) {
      const pts = op.points;
      const ys = pts.map((p) => p[1]);
      const xs = pts.map((p) => p[0]);
      for (let y = Math.min(...ys); y <= Math.max(...ys); y++)
        for (let x = Math.min(...xs); x <= Math.max(...xs); x++) {
          // Even-odd test at the pixel's center.
          let inside = false;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i];
            const [xj, yj] = pts[j];
            if (
              yi > y + 0.5 !== yj > y + 0.5 &&
              x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi
            ) {
              inside = !inside;
            }
          }
          if (inside) paint(x, y);
        }
    }
  }
  let bare = 0;
  for (const p of painted) if (!p) bare++;
  return bare;
}

describe("first-frame coverage", () => {
  it("the rasterizer sees a hole", () => {
    // A known positive: a frame that fills all but its last column.
    const ops: DrawOp[] = [{ op: "rect", x: 0, y: 0, w: 9, h: 10, color: 0, rgb: "" }];
    expect(unpaintedPixels(ops, 10, 10)).toBe(10);
  });

  it("covers every game in the registry", () => {
    expect(IDS.length).toBeGreaterThan(0);
  });

  it.each(IDS)("%s paints its whole canvas on the first frame", (id) => {
    const game = getTsGame(id);
    if (!game) throw new Error(`${id} is registered but has no game object`);
    const params = game.encodeParams(game.defaultParams(), true);
    const { recording, size } = renderScenario({ game, id: `${params}#coverage` });
    expect(unpaintedPixels(recording.ops, size.w, size.h)).toBe(0);
    // Under everything the game drew, not over it.
    expect(recording.ops[0]).toMatchObject({
      op: "rect",
      x: 0,
      y: 0,
      ...size,
      color: 0,
    });
  });
});
