/**
 * Gated C-vs-TS byte-match differential for Map.
 *
 * The generator is RNG-draw-order-critical (the cumulative-frequency draws of
 * the engine's `growFromSeeds`, the four-coloring's shuffle + random-most-constrained pick, the clue-reduction
 * shuffle) and solver-gated (the desc depends on `map_solver`'s uniqueness
 * verdict on every intermediate board). So we assert two things per fixture:
 *   1. `newMapDesc(p, randomNew(seed))` reproduces the C desc AND aux exactly;
 *   2. the TS solver grades the decoded board at the C-recorded difficulty.
 *
 * The fixture is **frozen and cannot be regenerated**. It was captured by
 * `puzzles/auxiliary/map-trace.c` against upstream's C, under an
 * Emscripten/CMake build that `retire-c-engine` deleted along with the
 * sources and the harness — see `engine/testing/differential.ts`.
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import cReference from "./__fixtures__/map-c-reference.json" with { type: "json" };
import { newMapDesc } from "./generator.ts";
import { mapGame } from "./index.ts";
import { newMapData } from "./map-data.ts";
import { gradeMap } from "./solver.ts";
import { DIFF_HARD, type MapParams } from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  n: number;
  diff: number;
  seed: string;
  desc: string;
  aux: string;
  solverDiff: number;
}

const data = cReference as { fixtures: Fixture[] };

const paramsOf = (f: Fixture): MapParams => ({ w: f.w, h: f.h, n: f.n, diff: f.diff });
const label = (f: Fixture) => `${f.w}x${f.h}n${f.n}d${f.diff} seed=${f.seed}`;

// Upstream dealt an Easy board under the tier's name after fifty tries, and
// one fixture records that. The generator here does not, so that fixture keeps
// only its solver half. Tricky is no longer upstream's forcing chain
// (2026-10-28), and the rungs a tier runs decide which clues its board keeps,
// so a board dealt at Tricky or above keeps only the solver half too, held to
// having one answer, which Unreasonable proves.
describeDescDifferential<Fixture, MapParams>({
  title: "map differential (frozen C reference, desc + aux)",
  fixtures: data.fixtures.filter((f) => f.diff < DIFF_HARD && f.solverDiff >= f.diff),
  label,
  params: paramsOf,
  newDesc: newMapDesc,
  extra: (f, p) => expect(validateDesc(mapGame, p, f.desc)).toBeNull(),
});

describe("map differential (frozen C reference, solver)", () => {
  for (const f of data.fixtures) {
    const p = paramsOf(f);
    it(`${label(f)}: TS solver grades the board at the C difficulty, or has one answer`, () => {
      const { map, coloring } = newMapData(p, f.desc);
      const clues = new Int32Array(f.n).fill(-1);
      for (let i = 0; i < f.n; i++) if (map.immutable[i]) clues[i] = coloring[i];
      const grade = gradeMap(map.graph, f.n, clues);
      if (f.solverDiff < DIFF_HARD) expect(grade).toBe(f.solverDiff);
      else expect(grade).toBeGreaterThanOrEqual(DIFF_HARD);
    });
  }
});
