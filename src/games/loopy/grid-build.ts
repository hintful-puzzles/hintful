/**
 * Building a Loopy grid: which patch of an aperiodic tiling a deal is given.
 * Upstream draws one description and builds it. This draws again in two cases.
 *
 * **A patch that is empty.** A small Penrose patch can come out *empty*: the
 * seed triangle lands outside the bounding box, so the trimming BFS never runs
 * and every face is discarded. Upstream then aborts inside `dsf_new(0)`,
 * reachable from its own Custom dialog, because `loopy.c` accepts 3×3 for both
 * Penrose variants. `grid.ts` raises {@link GridTrimmedAwayError} instead. The
 * failure is *per seed*, not per size, so the minimum sizes are not raised for
 * it: that would forbid sizes that work for most seeds.
 *
 * **A patch far under its size.** A patch is cut from a random place in the
 * tiling and trimmed to the faces around one connected run of landlocked dots.
 * In a small box that run is often a single dot, and the board is the three
 * faces around it, in a box that mostly holds several times as many: one 5x5
 * Penrose (rhombs) patch in four, where the rest have 5 to 11. See
 * {@link usualFaces} for the line.
 *
 * - **Determinism is preserved**: every draw is from the same RNG stream, so a
 *   `params#seed` game ID still reproduces its board.
 * - **Only the choice of description changes.** What a description builds is
 *   fixed, since saved games and shared IDs carry descriptions.
 * - **No size is refused for it.** Where no patch reaches the line, the
 *   largest one drawn is the board. A run of nothing but empty patches throws
 *   `RetryLimitExceeded`: that is a size with no board at all.
 *
 * One configuration never succeeds at all, Penrose kite/dart at width 3, so
 * `validateParams` rejects it up front (`params.ts` has the measurement).
 */
import {
  APERIODIC_GRID_TYPES,
  type Grid,
  GridTrimmedAwayError,
  type GridType,
  gridNew,
  gridNewDesc,
} from "../../engine/grid/index.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { RetryLimitExceeded } from "../../engine/retry-limit.ts";

/** A freshly described grid: the description that produced it (`null` for the
 * tilings that take none) alongside the built grid. */
export interface BuiltGrid {
  desc: string | null;
  grid: Grid;
}

/**
 * About how many faces a patch of an aperiodic tiling has at a size: the box
 * less a border one unit wide, which the trimming takes.
 *
 * Measured, not derived: the median face count of both Penrose tilings from
 * 6x6 to 12x12 fits 0.96 (w - 2.2)(h - 2.2), and Hats and Spectres at 6x6
 * have medians of 16 and 14 against the 16 this gives (2026-10-07, 2,000
 * patches a size). A patch is far under its size at **half of this or less**.
 * With both sides 6 or more that turns away under one patch in twenty, and
 * none from 7x7 up or on Hats and Spectres. With a side of 5 or under it turns
 * away the three faces around a point, the few patches beside them, and in a
 * long box the patches that reach only part of its length.
 *
 * It keeps the three faces where the size is so small that they are what it
 * holds: Penrose (rhombs) at 3x3 to 3x7, 4x3, 4x4 and 5x3 to 7x3, where they
 * are nine patches in ten or all of them, and Penrose (kite/dart) at 4x3, 4x4
 * and 5x3 to 7x3, where no patch has more than 7.
 */
function usualFaces(w: number, h: number): number {
  return (w - 2) * (h - 2);
}

/**
 * Patches drawn before the largest of them is taken. Sized to the rarest patch
 * that reaches the line at a size where any does: one draw in 48 at 16x4
 * Penrose (rhombs), counting the empty ones (2026-10-07, widths and heights 3
 * to 16 with one of them 6 or under, 1,500 draws a size), which 400 draws miss
 * one deal in 4,000. A miss deals the largest patch seen, which is what a size
 * that never reaches the line deals every time: a Penrose (rhombs) box 3 or 4
 * wide stops growing with its length, at 6 faces and at 11. Those sizes pay all
 * 400 draws, a twentieth of a second at 3x14.
 */
const PATCH_DRAWS = 400;

/** The grid a description builds, or `null` where it trims away to nothing. */
function gridOrNull(
  type: GridType,
  w: number,
  h: number,
  desc: string | null,
): Grid | null {
  try {
    return gridNew(type, w, h, desc);
  } catch (e) {
    if (e instanceof GridTrimmedAwayError) return null;
    throw e;
  }
}

/**
 * Draw a grid description and build its grid. On an aperiodic tiling, draw
 * until a patch has more than half the faces its size usually gives, and take
 * the largest drawn where none does. See the module doc.
 */
export function buildLoopyGrid(
  type: GridType,
  w: number,
  h: number,
  rng: RandomState,
): BuiltGrid {
  // Only these tilings' descriptions consume randomness, so only for these is
  // a second draw a different grid.
  const varies = (APERIODIC_GRID_TYPES as readonly GridType[]).includes(type);
  let largest: BuiltGrid | null = null;
  for (let drawn = 0; drawn < PATCH_DRAWS; drawn++) {
    const desc = gridNewDesc(type, w, h, rng);
    const grid = gridOrNull(type, w, h, desc);
    if (grid === null) continue;
    if (!varies || 2 * grid.numFaces > usualFaces(w, h)) return { desc, grid };
    if (largest === null || grid.numFaces > largest.grid.numFaces) {
      largest = { desc, grid };
    }
  }
  if (largest === null) {
    throw new RetryLimitExceeded("loopy: grid construction", PATCH_DRAWS);
  }
  return largest;
}
