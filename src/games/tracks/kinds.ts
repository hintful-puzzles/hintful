/**
 * What a Tracks hint's words point at: a square, one side of a square, or a
 * clue in the margin (`PIECE`), and a whole row or column (`LINE`). The words
 * themselves are the description's (`tracks.description.yaml`), spoken by
 * `hint.ts`.
 */

import { D, L, R, U } from "../../engine/board/square-edges.ts";
import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A square, one side of a square, or a clue in the margin (`0..w-1` columns,
 * then rows). One kind for all three, so one reference can name a clue with
 * the squares it counts. A side is keyed from its right or lower square, so
 * both squares it separates name it alike. */
export type Piece =
  | { readonly x: number; readonly y: number; readonly dir?: undefined }
  | { readonly x: number; readonly y: number; readonly dir: number }
  | { readonly clue: number };

function pieceKey(p: Piece): string {
  if ("clue" in p) return `clue ${p.clue}`;
  if (p.dir === undefined) return `${p.x},${p.y}`;
  if (p.dir === L) return `${p.x - 1},${p.y}:${R}`;
  if (p.dir === U) return `${p.x},${p.y - 1}:${D}`;
  return `${p.x},${p.y}:${p.dir}`;
}

export const PIECE: MarkKind<Piece> = { name: "piece", key: pieceKey };

/** A whole row or column, by clue index, striped through its clue. */
export const LINE: MarkKind<number> = { name: "line", key: String };

/** A piece as the number a term of pieces holds it by, on a `w` by `h` board:
 * the squares first, then the clues, then the sides, four a square. */
export function pieceCode(w: number, h: number, p: Piece): number {
  if ("clue" in p) return w * h + p.clue;
  if (p.dir === undefined) return p.y * w + p.x;
  return w * h + w + h + 4 * (p.y * w + p.x) + (31 - Math.clz32(p.dir));
}

/** The piece a {@link pieceCode} names. */
export function pieceOfCode(w: number, h: number, code: number): Piece {
  if (code < w * h) return { x: code % w, y: Math.floor(code / w) };
  if (code < w * h + w + h) return { clue: code - w * h };
  const side = code - w * h - w - h;
  const square = side >> 2;
  return { x: square % w, y: Math.floor(square / w), dir: 1 << (side & 3) };
}
