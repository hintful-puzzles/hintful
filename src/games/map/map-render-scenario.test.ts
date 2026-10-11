/**
 * Tier-2.5 render scenarios for Map: drive a real Midend to a target frame and
 * capture `redraw`. Targeted op assertions (region fills, grid lines, the red
 * adjacency error polygon) plus a snapshot so a render regression is a
 * reviewable text diff (`vitest -u` re-baselines; the targeted assertions
 * survive a careless `-u`).
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, sweepStep } from "../../engine/win-wave.ts";
import { newMapDesc } from "./generator.ts";
import { mapGame } from "./index.ts";
import { TE } from "./map-data.ts";
import {
  COL_0,
  COL_3,
  COL_ERROR,
  COL_GRID,
  COL_UNCOLORED,
  fromCoord,
} from "./render.ts";
import type { MapMove, MapParams, MapState } from "./state.ts";

const P: MapParams = { w: 12, h: 10, n: 12, diff: 1 };
const SEED = "map-scenario";
const ID = `${mapGame.encodeParams(P, true)}#${SEED}`;

describe("map render scenarios", () => {
  it("opener frame: region fills + grid lines drawn", () => {
    const { recording } = renderScenario({ game: mapGame, id: ID });

    // Clue regions are painted with a map color (COL_0..COL_3).
    expect(
      recording.ops.some(
        (o) => o.op === "rect" && o.color >= COL_0 && o.color <= COL_3,
      ),
    ).toBe(true);
    // Region boundaries draw grid lines.
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_GRID)).toBe(
      true,
    );

    expect(recording.ops).toMatchSnapshot();
  });

  it("error frame: two same-colored adjacent regions draw a red diamond", () => {
    // Color a blank region the same as an adjacent clue → adjacency error.
    const { desc } = newMapDesc(P, randomNew(SEED));
    const st = mapGame.newState(P, desc) as MapState;
    const { graph, ngraph, immutable } = st.map;

    let move: MapMove | null = null;
    for (let i = 0; i < ngraph && !move; i++) {
      const a = Math.floor(graph[i] / P.n);
      const b = graph[i] % P.n;
      const clue = immutable[a] ? a : immutable[b] ? b : -1;
      const blank = immutable[a] ? b : a;
      if (clue >= 0 && !immutable[blank])
        move = { ops: [{ op: "color", region: blank, color: st.coloring[clue] }] };
    }
    if (!move) throw new Error("no clue/blank adjacency");

    const { recording } = renderScenario({ game: mapGame, id: ID, moves: [move] });
    expect(recording.ops.some((o) => o.op === "polygon" && o.fill === COL_ERROR)).toBe(
      true,
    );
  });
});

describe("map win flash", () => {
  const TS = mapGame.preferredTileSize ?? 20;
  const { desc } = newMapDesc(P, randomNew(SEED));
  const start = mapGame.newState(P, desc);
  const answer = mapGame.solve?.(start, start);
  if (!answer?.ok) throw new Error("the fixture does not solve");
  const state = mapGame.executeMove(start, answer.move);
  const { map } = state;
  const wh = P.w * P.h;
  /** The region a cell's square is filled for: its top one. */
  const regionOf = (cell: number) => map.map[TE * wh + cell];

  const paint = (flash: Flash) => {
    const dr = new RecordingDrawing(mapGame.colors(DEFAULT_BACKGROUND));
    const ds = mapGame.newDrawState(state, TS);
    mapGame.redraw(dr, ds, null, state, 1, mapGame.newUi(state), 0, flash);
    return dr;
  };
  /** The cells whose square a frame draws blank. */
  const blank = (dr: RecordingDrawing): number[] =>
    opsOfKind(dr.ops, "rect")
      .filter((o) => o.w === TS && o.h === TS && o.color === COL_UNCOLORED)
      .map((o) => fromCoord(o.y, TS) * P.w + fromCoord(o.x, TS));

  it("sweeps the regions from the bottom left, each lit whole", () => {
    expect(mapGame.status(state)).toBe("solved");
    const cellsOf = new Map<number, number>();
    for (let cell = 0; cell < wh; cell++)
      cellsOf.set(regionOf(cell), (cellsOf.get(regionOf(cell)) ?? 0) + 1);

    const cells = winFlashRun(paint, blank, 60);
    // Never part of a region: every lit region has all its cells blank.
    for (const frame of cells.frames) {
      const lit = new Map<number, number>();
      for (const cell of frame)
        lit.set(regionOf(cell), (lit.get(regionOf(cell)) ?? 0) + 1);
      for (const [region, n] of lit) expect(n).toBe(cellsOf.get(region));
    }
    const regions = (frame: readonly number[]) => [...new Set(frame.map(regionOf))];
    expectWinFlashTravels(
      { frames: cells.frames.map(regions), end: regions(cells.end) },
      cellsOf.size,
      (r) => sweepStep(map.regionx[r], map.regiony[r]),
    );
  });
});
