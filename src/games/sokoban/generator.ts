/**
 * Sokoban level generation (upstream `sokoban_generate` + `new_game_desc`).
 *
 * A level is built by playing the game *backwards*: start from a walled ring
 * of `INITIAL` interior, drop the player somewhere, then repeatedly make legal
 * inverse moves — *pulling* a barrel after the player, inventing new
 * barrels-on-targets out of untouched `INITIAL` squares, and carving corridors
 * through `INITIAL` as needed. Reversing a real solution makes every level
 * solvable by construction, which is why no solver gates generation. Leftover
 * `INITIAL` squares become walls in the desc.
 *
 * Every `randomUpto` draw, and the order of upstream's hand-rolled binary
 * min-heap (keyed on how many `INITIAL` squares a route carves through), match
 * the C, so a level reproduces the C engine's byte-for-byte; the differential
 * test pins that. A dealt board is the first such level the hint's search can
 * finish, which is the C's own for every seed whose first level it can.
 *
 * Upstream also has a NetHack variant (a deep pit in a corner that barrels are
 * pulled out of) and scores each pull by the damage it does to `INITIAL`
 * squares. `new_game_desc` never asks for the variant and picks a pull
 * uniformly, so neither is ported.
 */

import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { search } from "./solver.ts";
import {
  BARREL,
  BARRELTARGET,
  encodeBoard,
  INITIAL,
  PLAYER,
  PLAYERTARGET,
  type SokobanParams,
  type SokobanState,
  SPACE,
  TARGET,
  WALL,
} from "./state.ts";

// DX/DY over the four orthogonal directions (upstream DX/DY macros):
// 0 → (-1,0), 1 → (0,-1), 2 → (+1,0), 3 → (0,+1).
const DX = (d: number): number => (d === 0 ? -1 : d === 2 ? 1 : 0);
const DY = (d: number): number => (d === 1 ? -1 : d === 3 ? 1 : 0);

/** A square the player can walk on, or an untouched one a route can carve. */
const passable = (v: number): boolean => v === SPACE || v === TARGET || v === INITIAL;

/** A barrel pulled from cell `from` to cell `to`; the player starts on `to`
 * and steps one square further on. */
interface Pull {
  from: number;
  to: number;
}

/** Generate a level's grid of cell codes (upstream `sokoban_generate`). */
function sokobanGenerate(w: number, h: number, rs: RandomState): Uint8Array {
  const grid = new Uint8Array(w * h);
  const dist = new Int32Array(w * h);
  const prev = new Int32Array(w * h);
  const heap = new Int32Array(w * h);

  // A solid wall ring, INITIAL everywhere inside.
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      grid[y * w + x] =
        x === 0 || y === 0 || x === w - 1 || y === h - 1 ? WALL : INITIAL;

  // Place the player at a random interior square.
  const i = randomUpto(rs, (w - 2) * (h - 2));
  let player = (1 + Math.floor(i / (w - 2))) * w + 1 + (i % (w - 2));
  grid[player] = SPACE;

  // Up to w*h + 1 rounds, each aiming to make one real barrel-pull, plus
  // whatever free moves are needed to get into position for it.
  for (let round = 0; round <= w * h; round++) {
    // Enumerate every viable barrel-pull (two directions of the same barrel
    // count as different). A pull can also *create* a barrel from an INITIAL.
    const pulls: Pull[] = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        for (let d = 0; d < 4; d++) {
          const dx = DX(d);
          const dy = DY(d);
          const nx = x + dx;
          const ny = y + dy;
          const npx = nx + dx;
          const npy = ny + dy;

          // The player starts at (nx,ny) and steps to (npx,npy), pulling the
          // barrel at (x,y) to (nx,ny). Checking npx,npy in bounds suffices.
          if (npx < 0 || npx >= w || npy < 0 || npy >= h) continue;

          // (x,y) must be a barrel, or an INITIAL to make one from; the two
          // squares the player uses must be passable.
          const b = grid[y * w + x];
          if (b !== BARREL && b !== BARRELTARGET && b !== INITIAL) continue;
          if (!passable(grid[ny * w + nx]) || !passable(grid[npy * w + npx])) continue;

          pulls.push({ from: y * w + x, to: ny * w + nx });
        }

    // No pulls available at all: give up.
    if (pulls.length === 0) break;

    // Search from the player for every square it can reach, giving a
    // *positive* distance only to squares reached by carving through INITIAL —
    // hence a proper priority queue, not a plain FIFO.
    dist.fill(-1);
    prev.fill(-1);
    heap[0] = player;
    let heapsize = 1;
    dist[player] = 0;

    while (heapsize > 0) {
      // Pull the smallest element (at position 0); move the last element into
      // its place and sift it down.
      const top = heap[0];
      const y = Math.floor(top / w);
      const x = top % w;

      heapsize--;
      heap[0] = heap[heapsize];
      let hi = 0;
      while (true) {
        const lc = 2 * hi + 1;
        const rc = 2 * hi + 2;
        if (lc >= heapsize) break; // hit bottom
        if (rc >= heapsize) {
          // Only one child to check.
          if (dist[heap[hi]] > dist[heap[lc]]) {
            const t = heap[hi];
            heap[hi] = heap[lc];
            heap[lc] = t;
          }
          break;
        }
        if (dist[heap[hi]] > dist[heap[lc]] || dist[heap[hi]] > dist[heap[rc]]) {
          // Swap with the child that would want to be the parent.
          if (dist[heap[lc]] > dist[heap[rc]]) {
            const t = heap[hi];
            heap[hi] = heap[rc];
            heap[rc] = t;
            hi = rc;
          } else {
            const t = heap[hi];
            heap[hi] = heap[lc];
            heap[lc] = t;
            hi = lc;
          }
        } else {
          break; // this element is in the right place
        }
      }

      // Expand (x,y) in all four directions.
      for (let d = 0; d < 4; d++) {
        const nx = x + DX(d);
        const ny = y + DY(d);
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const next = ny * w + nx;
        if (!passable(grid[next]) || dist[next] !== -1) continue;
        dist[next] = dist[top] + (grid[next] === INITIAL ? 1 : 0);
        prev[next] = top;
        // Insert at the end of the heap and sift up.
        let ii = heapsize;
        heap[heapsize++] = next;
        while (ii > 0) {
          const p = (ii - 1) >> 1;
          if (dist[heap[p]] > dist[heap[ii]]) {
            const t = heap[p];
            heap[p] = heap[ii];
            heap[ii] = t;
            ii = p;
          } else break;
        }
      }
    }

    // Drop a pull whose start is unreachable, or whose route runs through its
    // own barrel's square: an INITIAL there was counted both as the barrel to
    // be and as a square to carve, and cannot be both. If it is on the route
    // at all, it is the last step before the end.
    const feasible = pulls.filter(({ from, to }) => dist[to] >= 0 && prev[to] !== from);
    if (feasible.length === 0) break;
    const { from, to } = feasible[randomUpto(rs, feasible.length)];

    // Carve a path to the pull site, then apply the pull.
    for (let k = to; prev[k] >= 0; k = prev[k])
      if (grid[k] === INITIAL) grid[k] = SPACE;
    player = 2 * to - from;
    if (grid[player] === INITIAL) grid[player] = SPACE;
    grid[to] = grid[to] === TARGET ? BARRELTARGET : BARREL;
    grid[from] = grid[from] === BARREL ? SPACE : TARGET;
  }

  grid[player] = grid[player] === TARGET ? PLAYERTARGET : PLAYER;
  return grid;
}

/** Positions the search may generate on a level about to be dealt. Below the
 * hint's `PLAN_BUDGET`, since a level it rejects costs the whole budget
 * and another level is cheap; a line found within it is within the hint's
 * reach too, the search being the same. The levels that take the search
 * longest from the opening are the ones whose every hint is slowest, so the
 * budget is also what keeps a dealt board's hints quick
 * (`strengthen-the-sokoban-solver` design D8). */
const DEAL_BUDGET = 20_000;

/** Levels a deal may generate. At 16×20 the search finishes about three
 * levels in four, so the last is dealt unchecked about once in 35,000 deals;
 * a Custom board of 40×40 finishes about one in 85, and without the bound its
 * deal ran for minutes. */
const DEAL_TRIES = 8;

/** A level as upstream generates it, unchecked: what the frozen C reference
 * pins (`sokoban-differential.test.ts`). */
export function sokobanLevel(p: SokobanParams, rng: RandomState): SokobanState {
  // An INITIAL square generation never touched is a wall.
  const grid = sokobanGenerate(p.w, p.h, rng).map((v) => (v === INITIAL ? WALL : v));
  // The player's square holds the floor beneath it, as a state's does.
  const at = grid.findIndex((v) => v === PLAYER || v === PLAYERTARGET);
  grid[at] = grid[at] === PLAYERTARGET ? TARGET : SPACE;
  return { w: p.w, h: p.h, grid, px: at % p.w, py: Math.floor(at / p.w) };
}

/**
 * A level the hint can see through from its first push: generated as upstream
 * does, and generated again where the search finds no line within `budget`.
 * Every level can be solved, being made by playing backwards, but some are
 * past the search, and a board the hint refuses from its opening is one whose
 * hint never helps (`judge-rivals-for-search-hints` design D5). After
 * `DEAL_TRIES` levels the last is dealt as it is, since it can still be
 * solved and a deal has to end.
 */
export function dealtLevel(
  p: SokobanParams,
  rng: RandomState,
  budget = DEAL_BUDGET,
): SokobanState {
  let state = sokobanLevel(p, rng);
  for (let tries = 1; tries < DEAL_TRIES; tries++) {
    if (search(state, budget).kind === "found") break;
    state = sokobanLevel(p, rng);
  }
  return state;
}

export function newSokobanDesc(p: SokobanParams, rng: RandomState): { desc: string } {
  return { desc: encodeBoard(dealtLevel(p, rng)) };
}
