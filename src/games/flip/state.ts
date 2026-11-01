/**
 * Flip's data model: params, state, moves, the `Ui`, and the hex bitmap codec
 * its desc is written in.
 */

import type { DescReader } from "../../engine/desc-reader.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import * as flip from "./flip.compiled.ts";

// --- types ----------------------------------------------------------

export type MatrixType = "crosses" | "random";

export interface FlipParams {
  w: number;
  h: number;
  matrixType: MatrixType;
}

export interface FlipState {
  readonly w: number;
  readonly h: number;
  /** wh×wh GF(2) toggle matrix: row i is the set of lights cell i flips. It is
   * fixed for the game and shared by reference across its states (upstream
   * reference-counts it), so a move clones only the grid. */
  readonly matrix: Uint8Array;
  /** wh cells; 1 = unlit, still to be lit: the description's position. */
  readonly grid: Int32Array;
  readonly moves: number;
}

const dealtOfMatrix = new WeakMap<Uint8Array, flip.Dealt>();

/** The description's rules on `s`'s board: its matrix's rows as the squares
 * each press flips, kept for the matrix's life. */
export function rulesOf(s: FlipState) {
  let cl = dealtOfMatrix.get(s.matrix);
  if (cl === undefined) {
    const wh = s.w * s.h;
    const flips = Array.from({ length: wh }, (_, i) =>
      Array.from({ length: wh }, (_, j) => j).filter((j) => s.matrix[i * wh + j] === 1),
    );
    cl = { flips };
    dealtOfMatrix.set(s.matrix, cl);
  }
  return flip.rules(describedSpace(flip.units, s.w, s.h), cl, []);
}

export type FlipMove =
  | { kind: "flip"; x: number; y: number }
  /** Solve: every press of the solution at once. */
  | { kind: "solution"; mask: number[] };

export interface FlipUi {
  cursor: GridCursor;
}

// --- bitmap hex codec (flip.c encode_bitmap/decode_bitmap) ----------

const HEX = "0123456789abcdef";

export function encodeBitmap(bmp: ArrayLike<number>, len: number): string {
  const slen = (len + 3) >> 2;
  let out = "";
  for (let i = 0; i < slen; i++) {
    let v = 0;
    for (let j = 0; j < 4; j++) {
      if (i * 4 + j < len && bmp[i * 4 + j]) v |= 8 >> j;
    }
    out += HEX[v];
  }
  return out;
}

/**
 * Read `len` bits exactly as {@link encodeBitmap} writes them: lowercase hex,
 * four bits a digit, and the unused low bits of the last digit clear.
 */
export function readBitmap(r: DescReader, len: number): Uint8Array {
  const bmp = new Uint8Array(len);
  for (let i = 0; i * 4 < len; i++) {
    const used = Math.min(4, len - i * 4);
    const padding = (1 << (4 - used)) - 1;
    const v = HEX.indexOf(
      r.char((c) => HEX.includes(c) && (HEX.indexOf(c) & padding) === 0),
    );
    for (let j = 0; j < used; j++) bmp[i * 4 + j] = v & (8 >> j) ? 1 : 0;
  }
  return bmp;
}
