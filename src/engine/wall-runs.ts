/**
 * **A region layout as a run-length list of walls**, the first half of Rome's
 * and Seismic's descs (`⟨walls⟩,⟨clues⟩`).
 *
 * The list covers every border between two orthogonally adjacent cells: the
 * `(w-1)·h` borders inside the rows first, then the `w·(h-1)` between them,
 * each in reading order. A decimal number is a run of that many walls; a letter
 * `a`–`y` is a run of 1–25 gaps **followed by one wall**; `z` is 26 gaps with no
 * wall after it, so a longer gap run is written as `z`s and a remainder. A final
 * letter's wall falls off the end of the list and is simply not there.
 *
 * Upstream wrote a gap run as a bare `'a' + run - 1`, so a run of 26 came out
 * as `z` while its reader took `z` as wall-less, losing a wall, and a longer run
 * left the alphabet. Both games' writers chunk instead; every run of 25 or fewer
 * is written exactly as upstream wrote it.
 *
 * WHAT DOES NOT LIVE HERE is the clue half. It is a cell run-length grammar
 * whose value characters are each game's own; {@link gapLetters} is shared only
 * because it is the same letter run.
 */
import { isDigit } from "./decimal.ts";
import { DESC_TOO_LONG } from "./desc-error.ts";
import type { DescReader } from "./desc-reader.ts";
import type { Dsf } from "./dsf.ts";

const BEFORE_A = "a".charCodeAt(0) - 1;

function isLetter(c: string): boolean {
  return c >= "a" && c <= "z";
}

/** A run of `n` gaps or blanks as letters: a `z` per 26, then one letter for
 * the rest (`a` = 1). */
export function gapLetters(n: number): string {
  const rest = n % 26;
  return (
    "z".repeat((n - rest) / 26) + (rest ? String.fromCharCode(BEFORE_A + rest) : "")
  );
}

/** Encode a wall list (`1` a wall, `0` a gap). */
export function encodeWallRuns(walls: ArrayLike<number>): string {
  let out = "";
  let erun = 0;
  let wrun = 0;
  for (let i = 0; i < walls.length; i++) {
    if (!walls[i]) {
      if (wrun > 0) out += String(wrun);
      wrun = 0;
      erun++;
    } else if (erun > 0) {
      out += gapLetters(erun);
      // A closing letter speaks for this wall; a bare run of `z`s does not.
      wrun = erun % 26 === 0 ? 1 : 0;
      erun = 0;
    } else {
      wrun++;
    }
  }
  if (wrun > 0) out += String(wrun);
  return out + gapLetters(erun);
}

/**
 * Read a wall list of exactly `count` borders. A run that would pass the end
 * is refused; only a final letter's own wall may fall off it, because that is
 * how the writer ends a list whose last border is a gap.
 */
export function readWallRuns(r: DescReader, count: number): Uint8Array {
  const walls = new Uint8Array(count);
  let i = 0;
  while (i < count) {
    if (r.peekIs(isDigit)) {
      const n = r.int(1, count - i);
      walls.fill(1, i, i + n);
      i += n;
      continue;
    }
    const c = r.char(isLetter);
    const gaps = c.charCodeAt(0) - BEFORE_A;
    if (gaps > count - i) r.fail(DESC_TOO_LONG);
    i += gaps;
    if (c !== "z" && i < count) walls[i++] = 1;
  }
  return walls;
}

/** The borders of a `w × h` grid in list order, `1` where `regions` puts the
 * two cells in different regions. */
function regionWalls(regions: Dsf, w: number, h: number): Uint8Array {
  const walls = new Uint8Array((w - 1) * h + w * (h - 1));
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      walls[n++] = regions.equivalent(y * w + x, y * w + x + 1) ? 0 : 1;
    }
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      walls[n++] = regions.equivalent(y * w + x, (y + 1) * w + x) ? 0 : 1;
    }
  }
  return walls;
}

/** Encode the region layout of a `w × h` grid. */
export function encodeRegionWalls(regions: Dsf, w: number, h: number): string {
  return encodeWallRuns(regionWalls(regions, w, h));
}

/**
 * Read a region layout into `regions`, a fresh forest over the `w × h` cells.
 *
 * The merges run along the rows, then down the columns, in list order. That
 * order fixes which cell union-by-size makes each region's root, so a caller
 * that reads a root as a cell is reading part of what the desc means.
 */
export function readRegionWalls(
  r: DescReader,
  regions: Dsf,
  w: number,
  h: number,
): void {
  const hs = (w - 1) * h;
  const walls = readWallRuns(r, hs + w * (h - 1));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      if (!walls[y * (w - 1) + x]) regions.merge(y * w + x, y * w + x + 1);
    }
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      if (!walls[hs + y * w + x]) regions.merge(y * w + x, (y + 1) * w + x);
    }
  }
}
