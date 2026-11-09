/**
 * A roll of the solid: its geometry, which deals the arena's roll table the
 * description reads, and the move, which the description's rules play. The
 * solver reads the same table ({@link dealtOf}).
 */

import { rejectMove } from "../../engine/assert-never.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import * as cube from "./cube.compiled.ts";
import { Direction, type GridSquare } from "./grid.ts";
import {
  alignPolyKeys,
  flipPoly,
  lowestFace,
  SOLIDS,
  type Solid,
  sqr,
  transformPoly,
} from "./solids.ts";
import type { CubeMove, CubeState, RollLetter } from "./state.ts";

/** Move letters, indexed by the orthogonal `Direction`s. */
export const DIR_CHARS: readonly RollLetter[] = ["L", "R", "U", "D"];

/**
 * The square that rolling `direction` from square `current` lands on, and
 * `skey`, the two corners of the current square the solid rolls over; null
 * if the roll runs off the grid. Mirrors `find_move_dest`.
 */
function findMoveDest(
  grid: readonly GridSquare[],
  current: number,
  direction: Direction,
): { dest: number; skey: [number, number] } | null {
  const sq = grid[current];
  const mask = sq.directions[direction];
  if (mask === 0) return null;

  const skey: number[] = [];
  for (let i = 0; i < sq.npoints; i++) if (mask & (1 << i)) skey.push(i);
  const near = (s2: typeof sq, j: number, k: number) =>
    sqr(s2.points[j * 2] - sq.points[k * 2]) +
      sqr(s2.points[j * 2 + 1] - sq.points[k * 2 + 1]) <
    0.1;

  // The destination is the other square sharing both rolled-over corners.
  for (let i = 0; i < grid.length; i++) {
    if (i === current) continue;
    const s2 = grid[i];
    let match = 0;
    for (let j = 0; j < s2.npoints; j++) {
      if (near(s2, j, skey[0])) match++;
      if (near(s2, j, skey[1])) match++;
    }
    if (match === 2) return { dest: i, skey: [skey[0], skey[1]] };
  }
  return null;
}

/** What a roll does, read off the solid's geometry. */
interface RollGeometry {
  /** The square it lands on. */
  readonly dest: number;
  /** The corners of the square it leaves that it rolls over, and the
   * solid's vertices over them. */
  readonly skey: [number, number];
  readonly pkey: [number, number];
  /** The angle it turns through. */
  readonly angle: number;
  /** For each face's place on the solid, the place whose paint it carries
   * after the roll. */
  readonly source: readonly number[];
}

/** The roll toward `direction` from square `current` of `grid`, or null off
 * the arena. */
function rollGeometry(
  solidIndex: number,
  grid: readonly GridSquare[],
  current: number,
  direction: Direction,
): RollGeometry | null {
  const roll = findMoveDest(grid, current, direction);
  if (!roll) return null;
  const { dest, skey } = roll;
  const solid = SOLIDS[solidIndex];

  // The two source-square corners we roll over, as solid vertex indices.
  const allPkey = alignPolyKeys(solid, grid[current]);
  if (!allPkey) throw new Error("cube: source alignment failed");
  const pkey: [number, number] = [allPkey[skey[0]], allPkey[skey[1]]];

  let angle = dihedralAngle(solid, pkey);

  // HACK (from cube.c): for the cube, both +angle and -angle align, so
  // disambiguate the UP roll by hand.
  if (solid.order === 4 && direction === Direction.Up) angle = -angle;

  // Roll, reflect onto the destination square, and check the result
  // seats correctly; if not, the rotation went the wrong way — flip the
  // sign and try once more (mirrors cube.c's try-both approach).
  let poly = transformPoly(solid, grid[current].flip, pkey[0], pkey[1], angle);
  flipPoly(poly, grid[dest].flip);
  if (!alignPolyKeys(poly, grid[dest])) {
    angle = -angle;
    poly = transformPoly(solid, grid[current].flip, pkey[0], pkey[1], angle);
    flipPoly(poly, grid[dest].flip);
    if (!alignPolyKeys(poly, grid[dest]))
      throw new Error("cube: could not seat solid after roll");
  }

  // The rolled solid is congruent to the original with its faces permuted:
  // each face's place takes the paint of the rolled face whose normal
  // matches it.
  const source = new Array<number>(solid.nfaces).fill(-1);
  for (let i = 0; i < solid.nfaces; i++) {
    for (let j = 0; j < poly.nfaces; j++) {
      let dist = 0;
      for (let k = 0; k < 3; k++)
        dist += sqr(poly.normals[j * 3 + k] - solid.normals[i * 3 + k]);
      if (dist < 0.1) source[i] = j;
    }
  }
  return { dest, skey, pkey, angle, source };
}

const dealtByArena = new WeakMap<readonly GridSquare[], cube.Dealt>();

/** The arena's roll table, as the description reads it: each square's
 * destination toward each of the four directions, and each face's source,
 * read off the geometry once an arena. */
export function dealtOf(state: CubeState): cube.Dealt {
  const known = dealtByArena.get(state.grid);
  if (known) return known;
  const solid = SOLIDS[state.solidIndex];
  const rolls = state.grid.map((_, sq) =>
    DIR_CHARS.map((_, r) => rollGeometry(state.solidIndex, state.grid, sq, r)),
  );
  const dealt: cube.Dealt = {
    nfaces: solid.nfaces,
    dest: rolls.map((rs) => rs.map((g) => g?.dest ?? -1)),
    source: rolls.map((rs) => rs.map((g) => g?.source ?? [])),
    down: lowestFace(solid),
  };
  dealtByArena.set(state.grid, dealt);
  return dealt;
}

/** The square rolling toward `r` (an orthogonal `Direction`) from where the
 * solid stands lands on, by the roll table; -1 off the arena. */
export function rollDest(state: CubeState, r: number): number {
  return dealtOf(state).dest[state.current][r] ?? -1;
}

/** The description's rules on the arena `state` stands on. */
export function rulesOf(state: CubeState) {
  return cube.rules(
    describedSpace(cube.units, state.grid.length, 1),
    dealtOf(state),
    [],
  );
}

/** The state as the description's layers. */
export function positionOf(state: CubeState): cube.Position {
  const at = new Int32Array(state.grid.length);
  at[state.current] = 1;
  return { blue: state.blue, at, paint: state.faceColors };
}

/** A roll, or a line of them, by the description's rules. */
export function executeMove(from: CubeState, move: CubeMove): CubeState {
  if ("solution" in move) {
    if (!Array.isArray(move.solution)) rejectMove(move, "cube: executeMove");
    const boards = [from];
    for (const dir of move.solution) boards.push(roll(boards[boards.length - 1], dir));
    return { ...boards[boards.length - 1], via: boards.slice(1, -1) };
  }
  return roll(from, move.dir);
}

/** One roll, and the key points its animation turns the solid about. */
function roll(from: CubeState, dir: RollLetter): CubeState {
  // Cube's moves have no discriminant to narrow to `never`, so check the one
  // field the dispatch reads: an unknown letter from another build must be
  // rejected as unrecognized, not reported as a roll into a wall.
  const direction: Direction = DIR_CHARS.indexOf(dir);
  if (direction < 0) rejectMove({ dir }, "cube: executeMove");

  const rules = rulesOf(from);
  const p = positionOf(from);
  const m = { move: "roll", s: from.current, r: direction } as const;
  if (!rules.legal(p, m)) throw new Error("cube: illegal move");
  const q = rules.play(p, m);

  const geo = rollGeometry(from.solidIndex, from.grid, from.current, direction);
  if (!geo) throw new Error("cube: illegal move");
  // Resting key points for the static (non-animated) display.
  const restKeys = alignPolyKeys(SOLIDS[from.solidIndex], from.grid[geo.dest]);
  if (!restKeys) throw new Error("cube: rest alignment failed");

  return {
    ...from,
    current: q.at.indexOf(1),
    faceColors: q.paint,
    blue: q.blue,
    movecount: from.movecount + 1,
    dpkey: [restKeys[0], restKeys[1]],
    dgkey: [0, 1],
    spkey: geo.pkey,
    sgkey: geo.skey,
    previous: from.current,
    angle: geo.angle,
    via: [],
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
