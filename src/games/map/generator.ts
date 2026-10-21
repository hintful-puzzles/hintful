/**
 * Map's board generator (upstream `new_game_desc` and its helpers). Byte-faithful
 * to the C RNG draw order so a seed reproduces the exact desc + aux:
 *   1. the regions, grown from seeds scattered at random (upstream `genmap`,
 *      which is the engine's `growFromSeeds`);
 *   2. `gengraph` — the adjacency graph (see graph.ts);
 *   3. a four-coloring, on the engine's walk (`colorRegions`) with the draws
 *      of upstream's own;
 *   4. solver-gated clue reduction (never removing the last region of a color);
 *   5. the difficulty-floor retry loop.
 */

import { growFromSeeds, regionNumbers, scatterSeeds } from "../../engine/divide.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { colorRegions, type FillChoice } from "../../engine/region-fill.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { gengraph, graphNeighbors } from "./graph.ts";
import { encodeMapDesc } from "./map-data.ts";
import { mapSolver, SOLVER_UNIQUE } from "./solver.ts";
import type { MapParams } from "./state.ts";

const FOUR = 4;

// --- four-coloring --------------------------------------------------

/**
 * The draws of upstream's four-coloring, which the frozen fixture pins: a region at
 * random among those tied, and its colors shuffled and tried from the last.
 */
const drawn = (rs: RandomState): FillChoice => ({
  region: (tied) => tied[randomUpto(rs, tied.length)],
  order: (free) => {
    shuffle(free, rs);
    return free.reverse();
  },
});

// --- main ------------------------------------------------------------

/**
 * What a try costs tracks squares times regions: a small map of few regions
 * takes microseconds, and at some sizes a tier is found once in tens of
 * thousands. Where few regions make the tier seldom found, 8 at Normal and 9
 * or 10 above it, a board took, measured 2026-10-06 in squares
 * times regions times maps built, 9 to 144 million from 5x5 to 15x20, the
 * most at a 15x20 of 8 regions at Normal, and 358 million over two boards at
 * a 30x25 of 9 regions at Tricky.
 */
export function newMapDesc(
  p: MapParams,
  rs: RandomState,
): { desc: string; aux: string } {
  const { w, h, n } = p;
  const wh = w * h;

  const coloring = new Int32Array(n);
  const coloring2 = new Int32Array(n);
  const cfreq = new Int32Array(FOUR);

  const attempt = retryLimit("map: generation");
  for (;;) {
    attempt();

    // Numbered in reading order, so that maps no player could tell apart are
    // the same description.
    const map = regionNumbers(growFromSeeds(p, scatterSeeds(p, n, rs), rs), wh);
    const { graph, ngraph } = gengraph(w, h, n, map);
    const answer = colorRegions(graphNeighbors(graph, n), FOUR, drawn(rs));
    if (!answer) throw new Error("map: a map of a grid has no four-coloring");
    coloring.set(answer);

    // Encode the full solution as the aux string.
    let aux = "";
    for (let i = 0; i < n; i++) {
      if (coloring[i] < 0) continue;
      aux += `${i ? ";" : "S;"}${coloring[i]}:${i}`;
    }

    // Clue reduction: remove region colors one by one, keeping solubility,
    // but never removing the last region of any color.
    cfreq.fill(0);
    const regions: number[] = [];
    for (let i = 0; i < n; i++) {
      regions.push(i);
      cfreq[coloring[i]]++;
    }
    shuffle(regions, rs);

    for (let i = 0; i < n; i++) {
      const j = regions[i];
      if (cfreq[coloring[j]] === 1) continue; // keep last of its color
      coloring2.set(coloring);
      coloring2[j] = -1;
      if (mapSolver(graph, n, ngraph, coloring2, p.diff) === SOLVER_UNIQUE) {
        cfreq[coloring[j]]--;
        coloring[j] = -1;
      }
    }

    // Must be at least as hard as required (and not already solved by a solver
    // that does nothing).
    coloring2.set(coloring);
    if (mapSolver(graph, n, ngraph, coloring2, p.diff - 1) === SOLVER_UNIQUE) continue;

    return { desc: encodeMapDesc(w, h, n, map, coloring), aux };
  }
}
