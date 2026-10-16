/**
 * A roll of the solid: where it lands, how it turns, and the paint it swaps
 * with the square it lands on. The game applies a move with
 * {@link executeMove}, and the solver reads the same roll off it.
 */

import { rejectMove } from "../../engine/assert-never.ts";
import { Direction } from "./grid.ts";
import {
  alignPolyKeys,
  flipPoly,
  lowestFace,
  SOLIDS,
  type Solid,
  sqr,
  transformPoly,
} from "./solids.ts";
import type { CubeMove, CubeState } from "./state.ts";

/** Move letters, indexed by the orthogonal `Direction`s. */
export const DIR_CHARS: readonly CubeMove["dir"][] = ["L", "R", "U", "D"];

/**
 * The square that rolling `direction` from `state.current` lands on, and
 * `skey`, the two corners of the current square the solid rolls over; null
 * if the roll runs off the grid. Mirrors `find_move_dest`.
 */
export function findMoveDest(
  state: CubeState,
  direction: Direction,
): { dest: number; skey: [number, number] } | null {
  const sq = state.grid[state.current];
  const mask = sq.directions[direction];
  if (mask === 0) return null;

  const skey: number[] = [];
  for (let i = 0; i < sq.npoints; i++) if (mask & (1 << i)) skey.push(i);
  const near = (s2: typeof sq, j: number, k: number) =>
    sqr(s2.points[j * 2] - sq.points[k * 2]) +
      sqr(s2.points[j * 2 + 1] - sq.points[k * 2 + 1]) <
    0.1;

  // The destination is the other square sharing both rolled-over corners.
  for (let i = 0; i < state.grid.length; i++) {
    if (i === state.current) continue;
    const s2 = state.grid[i];
    let match = 0;
    for (let j = 0; j < s2.npoints; j++) {
      if (near(s2, j, skey[0])) match++;
      if (near(s2, j, skey[1])) match++;
    }
    if (match === 2) return { dest: i, skey: [skey[0], skey[1]] };
  }
  return null;
}

export function executeMove(from: CubeState, move: CubeMove): CubeState {
  // Cube's move has no discriminant to narrow to `never`, so check the one
  // field the dispatch reads: an unknown letter from another build must be
  // rejected as unrecognized, not reported as a roll into a wall.
  const direction: Direction = DIR_CHARS.indexOf(move.dir);
  if (direction < 0) rejectMove(move, "cube: executeMove");

  const roll = findMoveDest(from, direction);
  if (!roll) throw new Error("cube: illegal move");
  const { dest, skey } = roll;

  const solid = SOLIDS[from.solidIndex];
  const grid = from.grid;

  // The two source-square corners we roll over, as solid vertex indices.
  const allPkey = alignPolyKeys(solid, grid[from.current]);
  if (!allPkey) throw new Error("cube: source alignment failed");
  const pkey: [number, number] = [allPkey[skey[0]], allPkey[skey[1]]];

  let angle = dihedralAngle(solid, pkey);

  // HACK (from cube.c): for the cube, both +angle and -angle align, so
  // disambiguate the UP roll by hand.
  if (solid.order === 4 && direction === Direction.Up) angle = -angle;

  // Roll, reflect onto the destination square, and check the result
  // seats correctly; if not, the rotation went the wrong way — flip the
  // sign and try once more (mirrors cube.c's try-both approach).
  let poly = transformPoly(solid, grid[from.current].flip, pkey[0], pkey[1], angle);
  flipPoly(poly, grid[dest].flip);
  if (!alignPolyKeys(poly, grid[dest])) {
    angle = -angle;
    poly = transformPoly(solid, grid[from.current].flip, pkey[0], pkey[1], angle);
    flipPoly(poly, grid[dest].flip);
    if (!alignPolyKeys(poly, grid[dest]))
      throw new Error("cube: could not seat solid after roll");
  }

  // Map the face permutation the roll induced: the rolled solid is
  // congruent to the original with faces permuted, so each original
  // face's color follows the rolled face whose normal matches it.
  const faceColors = new Int32Array(solid.nfaces).fill(-1);
  for (let i = 0; i < solid.nfaces; i++) {
    for (let j = 0; j < poly.nfaces; j++) {
      let dist = 0;
      for (let k = 0; k < 3; k++)
        dist += sqr(poly.normals[j * 3 + k] - solid.normals[i * 3 + k]);
      if (dist < 0.1) faceColors[i] = from.faceColors[j];
    }
  }

  const blue = new Uint8Array(from.blue);
  const movecount = from.movecount + 1;

  // Swap paint between the resting face and the landed-on square, unless
  // already complete (a finished solid may roll freely as a small reward).
  if (!allFacesPainted(from)) {
    const lf = lowestFace(solid);
    [faceColors[lf], blue[dest]] = [blue[dest], faceColors[lf]];
  }

  // Resting key points for the static (non-animated) display.
  const restKeys = alignPolyKeys(solid, grid[dest]);
  if (!restKeys) throw new Error("cube: rest alignment failed");

  return {
    ...from,
    current: dest,
    faceColors,
    blue,
    movecount,
    dpkey: [restKeys[0], restKeys[1]],
    dgkey: [0, 1],
    spkey: pkey,
    sgkey: skey,
    previous: from.current,
    angle,
  };
}

/** Dihedral angle across the edge between solid vertices `pkey[0]` and
 * `pkey[1]`: acos of the dot product of the two faces sharing it. */
function dihedralAngle(solid: Solid, pkey: [number, number]): number {
  const f: number[] = [];
  for (let i = 0; i < solid.nfaces; i++) {
    let match = 0;
    for (let j = 0; j < solid.order; j++) {
      const v = solid.faces[i * solid.order + j];
      if (v === pkey[0] || v === pkey[1]) match++;
    }
    if (match === 2) f.push(i);
  }
  let dp = 0;
  for (let i = 0; i < 3; i++)
    dp += solid.normals[f[0] * 3 + i] * solid.normals[f[1] * 3 + i];
  return Math.acos(Math.min(1, Math.max(-1, dp)));
}

/** Every face of the solid carries paint. */
export function allFacesPainted(state: CubeState): boolean {
  return state.faceColors.every((c) => c);
}
