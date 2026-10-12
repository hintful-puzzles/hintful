/**
 * Map's board generator (upstream `new_game_desc` and its helpers). Byte-faithful
 * to the C RNG draw order so a seed reproduces the exact desc + aux:
 *   1. the regions, grown from seeds scattered at random (upstream `genmap`,
 *      which is the engine's `growFromSeeds`);
 *   2. `gengraph` — the adjacency graph (see graph.ts);
 *   3. `fourcolor` — a recursive four-coloring;
 *   4. solver-gated clue reduction (never removing the last region of a color);
 *   5. the difficulty-floor retry loop.
 */

import { growFromSeeds, regionNumbers, scatterSeeds } from "../../engine/divide.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { gengraph, graphVertexStart } from "./graph.ts";
import { encodeMapDesc } from "./map-data.ts";
import { mapSolver, SOLVER_UNIQUE } from "./solver.ts";
import type { MapParams } from "./state.ts";

const FOUR = 4;
const FIVE = 5;

// --- four-coloring --------------------------------------------------

function fourcolorRecurse(
  graph: Int32Array,
  n: number,
  ngraph: number,
  coloring: Int32Array,
  scratch: Int32Array,
  rs: RandomState,
): boolean {
  // Fewest free colors in any uncolored vertex, and how many such vertices.
  let nfree = FIVE;
  let nvert = 0;
  for (let i = 0; i < n; i++)
    if (coloring[i] < 0 && scratch[i * FIVE + FOUR] <= nfree) {
      if (nfree > scratch[i * FIVE + FOUR]) {
        nfree = scratch[i * FIVE + FOUR];
        nvert = 0;
      }
      nvert++;
    }

  if (nvert === 0) return true; // done

  // Pick a random vertex in that set.
  let j = randomUpto(rs, nvert);
  let i = 0;
  for (; i < n; i++)
    if (coloring[i] < 0 && scratch[i * FIVE + FOUR] === nfree) {
      if (j-- === 0) break;
    }
  const start = graphVertexStart(graph, n, ngraph, i);

  // Candidate colors for i, shuffled.
  const cs: number[] = [];
  for (let c = 0; c < FOUR; c++) if (scratch[i * FIVE + c] === 0) cs.push(c);
  shuffle(cs, rs);

  let ci = cs.length;
  while (ci-- > 0) {
    const c = cs[ci];
    coloring[i] = c;

    for (let gj = start; gj < ngraph && graph[gj] < n * (i + 1); gj++) {
      const kk = graph[gj] - i * n;
      if (scratch[kk * FIVE + c] === 0) scratch[kk * FIVE + FOUR]--;
      scratch[kk * FIVE + c]++;
    }

    if (fourcolorRecurse(graph, n, ngraph, coloring, scratch, rs)) return true;

    for (let gj = start; gj < ngraph && graph[gj] < n * (i + 1); gj++) {
      const kk = graph[gj] - i * n;
      scratch[kk * FIVE + c]--;
      if (scratch[kk * FIVE + c] === 0) scratch[kk * FIVE + FOUR]++;
    }
    coloring[i] = -1;
  }

  return false;
}

function fourcolor(
  graph: Int32Array,
  n: number,
  ngraph: number,
  coloring: Int32Array,
  rs: RandomState,
): void {
  // Per vertex, FIVE slots: how many neighbors hold each color, then how many
  // colors are still free.
  const scratch = new Int32Array(n * FIVE);
  for (let i = 0; i < n * FIVE; i++) scratch[i] = i % FIVE === FOUR ? FOUR : 0;
  coloring.fill(-1);
  fourcolorRecurse(graph, n, ngraph, coloring, scratch, rs);
}

// --- main ------------------------------------------------------------

/**
 * What a try costs tracks squares times regions: a small map of few regions
 * takes microseconds, and at some sizes a tier is found once in tens of
 * thousands. Where few regions make the tier seldom found
 * (`fewRegionsTierIsSeldom`) a board took, measured 2026-10-06 in squares
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
    fourcolor(graph, n, ngraph, coloring, rs);

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
