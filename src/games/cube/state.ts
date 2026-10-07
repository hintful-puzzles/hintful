/** Cube parameters, state, and the game-description codec. */

import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { parseDimensions } from "../../engine/params.ts";
import { enumGridSquares, type GridSquare, gridArea } from "./grid.ts";
import { alignPolyKeys, SOLIDS, SolidType } from "./solids.ts";

export interface CubeParams {
  /** A `SolidType`. */
  solid: number;
  /** Grid dimensions: width/height for the square grid, or the
   * hexagon/triangle side lengths for the triangular grid. */
  d1: number;
  d2: number;
}

/** A roll in one of the four orthogonal directions. Diagonal inputs on
 * triangular grids resolve to the equivalent orthogonal roll, so a stored
 * move is always one of these four (JSON-safe: the default codec suffices). */
export type CubeMove = { dir: "L" | "R" | "U" | "D" };

/** A key-point pair: indices into either a grid square's corners or the
 * solid's vertices. */
export type KeyPair = readonly [number, number];

export interface CubeState {
  readonly params: CubeParams;
  readonly solidIndex: number;
  /** The arena, derived from params; never changes, so clones share it. */
  readonly grid: GridSquare[];
  /** Paint per polyhedron face: 1 = blue, 0 = blank. */
  readonly faceColors: Int32Array;
  /** Paint per grid square: 1 = blue, 0 = blank. */
  readonly blue: Uint8Array;
  readonly current: number;
  /** Source/destination key points for the in-progress roll animation
   * (s*) and the resting position (d*); g = grid-square corner indices,
   * p = solid vertex indices. */
  readonly sgkey: KeyPair;
  readonly dgkey: KeyPair;
  readonly spkey: KeyPair;
  readonly dpkey: KeyPair;
  readonly previous: number;
  readonly angle: number;
  readonly movecount: number;
}

// --- params ----------------------------------------------------------

export function defaultParams(): CubeParams {
  return { solid: SolidType.Cube, d1: 4, d2: 4 };
}

/** Each solid's preset grid, `[d1, d2]`, indexed by `SolidType`. */
const PRESET_SIZES: readonly (readonly [number, number])[] = [
  [1, 2],
  [4, 4],
  [2, 2],
  [3, 3],
];

/** The preset of `solid`: its own grid. */
function presetOf(solid: SolidType): CubeParams {
  const [d1, d2] = PRESET_SIZES[solid];
  return { solid, d1, d2 };
}

/** Whether `p` rolls its solid on the grid that solid's preset uses, which a
 * label then need not state. */
export function hasPresetSize(p: CubeParams): boolean {
  const size = PRESET_SIZES[p.solid];
  return size !== undefined && size[0] === p.d1 && size[1] === p.d2;
}

export function presets() {
  const solids = [
    SolidType.Cube,
    SolidType.Tetrahedron,
    SolidType.Octahedron,
    SolidType.Icosahedron,
  ];
  return { title: "Type", submenu: solids.map((s) => ({ params: presetOf(s) })) };
}

const SOLID_LETTERS = "tcoi";

export function encodeParams(p: CubeParams, _full: boolean): string {
  return `${SOLID_LETTERS[p.solid]}${p.d1}x${p.d2}`;
}

/** An optional solid letter, then `WxH` (or `N` for both). */
export function decodeParams(s: string): CubeParams {
  const letter = SOLID_LETTERS.indexOf(s[0]);
  const dims = parseDimensions(s, letter >= 0 ? 1 : 0);
  return {
    solid: letter >= 0 ? letter : defaultParams().solid,
    d1: dims.w,
    d2: dims.h,
  };
}

export function validateParams(p: CubeParams, _full: boolean): string | null {
  const solid = SOLIDS[p.solid];
  if (solid.order === 4) {
    if (p.d1 <= 1 || p.d2 <= 1) return "Both grid dimensions must be greater than one.";
  } else {
    if (p.d1 <= 0 && p.d2 <= 0)
      return "At least one grid dimension must be greater than zero.";
  }

  // Enough squares in each equivalence class to host that class's faces?
  const nclasses = classCount(p.solid);
  const counts = new Array(nclasses).fill(0);
  for (const sq of enumGridSquares(p.solid, p.d1, p.d2)) {
    counts[squareClass(sq, nclasses)]++;
  }
  const facesPerClass = solid.nfaces / nclasses;
  for (let i = 0; i < nclasses; i++) {
    if (counts[i] < facesPerClass)
      return "The grid is too small to place all the painted squares.";
  }

  if (gridArea(p.d1, p.d2, solid.order) < solid.nfaces + 1)
    return "The grid is too small to place the solid on an empty square.";

  return null;
}

/** How many equivalence classes the solid divides its grid into: the
 * tetrahedron has one per face (4, by `tetraClass`), the octahedron two
 * (by `flip`), the others one. Mirrors the `nclasses` logic in cube.c. */
export function classCount(solidIndex: number): number {
  if (solidIndex === SolidType.Tetrahedron) return 4;
  if (solidIndex === SolidType.Octahedron) return 2;
  return 1;
}

export function squareClass(sq: GridSquare, nclasses: number): number {
  if (nclasses === 4) return sq.tetraClass;
  if (nclasses === 2) return sq.flip ? 1 : 0;
  return 0;
}

// --- game description -------------------------------------------------

// A desc is the blue mask in hex, four squares per digit with the first
// square in the high bit, then a comma and the start square (cube.c's format).

const HEX = "0123456789ABCDEF";

/** The mask exactly as {@link encodeDesc} writes it: uppercase, and the unused
 * low bits of the last digit clear. */
function parseDesc(
  p: CubeParams,
  desc: string,
): DescParse<{ blue: Uint8Array; start: number }> {
  const area = gridArea(p.d1, p.d2, SOLIDS[p.solid].order);
  return readDesc(desc, (r) => {
    const blue = new Uint8Array(area);
    for (let i = 0; i < area; i += 4) {
      const used = Math.min(4, area - i);
      const padding = (1 << (4 - used)) - 1;
      const v = HEX.indexOf(
        r.char((c) => HEX.includes(c) && (HEX.indexOf(c) & padding) === 0),
      );
      for (let k = 0; k < used; k++) blue[i + k] = v & (8 >> k) ? 1 : 0;
    }
    r.expect(",");
    const start = r.int(0, area - 1);
    r.end();
    return { blue, start };
  });
}

export function newState(p: CubeParams, desc: string): CubeState {
  const { blue, start: current } = descValue(parseDesc(p, desc));
  const solid = SOLIDS[p.solid];
  const grid = enumGridSquares(p.solid, p.d1, p.d2);

  // Seat the solid on its start square to get the resting key points.
  const pkey = alignPolyKeys(solid, grid[current]);
  if (!pkey) throw new Error("cube: failed to align solid on start square");
  const restKeys: KeyPair = [pkey[0], pkey[1]];

  return {
    params: p,
    solidIndex: p.solid,
    grid,
    faceColors: new Int32Array(solid.nfaces),
    blue,
    current,
    sgkey: [0, 1],
    dgkey: [0, 1],
    spkey: restKeys,
    dpkey: restKeys,
    previous: current,
    angle: 0,
    movecount: 0,
  };
}

/** Encode a blue mask + start square as a game description. */
export function encodeDesc(blue: Uint8Array, start: number): string {
  let out = "";
  for (let i = 0; i < blue.length; i += 4) {
    let digit = 0;
    for (let k = 0; k < 4; k++) if (blue[i + k]) digit |= 8 >> k;
    out += HEX[digit];
  }
  return `${out},${start}`;
}
