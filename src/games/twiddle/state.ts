import { parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_REPEATED,
  type DescError,
  type DescParse,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { PresetMenu } from "../../engine/game.ts";
import { AREA_TOO_LARGE, parseDimensions } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";

// --- types -----------------------------------------------------------

export interface TwiddleParams {
  w: number;
  h: number;
  /** Size of the rotating subsquare (≥ 2). */
  n: number;
  /** One number per row (tiles in a row share a number). */
  rowsonly: boolean;
  /** Orientation matters: a tile must also end upright. */
  orientable: boolean;
  /** Number of shuffling moves; `0` means "auto" (parity-safe default). */
  movetarget: number;
}

export interface TwiddleState {
  readonly w: number;
  readonly h: number;
  readonly n: number;
  readonly orientable: boolean;
  /** Displayed tile numbers in row-major order (1-indexed). The solved
   * board reads in non-decreasing order. */
  readonly numbers: Int32Array;
  /** Tile orientations 0..3 (only meaningful when `orientable`); 0 is
   * upright. Advanced by `(orient + dir) & 3` on each rotation. */
  readonly orient: Uint8Array;
  readonly moveCount: number;
  readonly movetarget: number;
  /** Top-left corner + direction of the last rotation, for animation
   * (`-1` when none yet). */
  readonly lastX: number;
  readonly lastY: number;
  readonly lastR: number;
}

/** A rotation carries the top-left corner of the `n×n` region and a
 * direction (`+1`/`-1`); a solve snaps to the solved board (upstream
 * `"S"`). Both are plain JSON-safe data, so the default move codec
 * suffices. */
export type TwiddleMove =
  | { type: "rotate"; x: number; y: number; dir: 1 | -1 }
  | { type: "solve" };

export interface TwiddleUi {
  /** Cursor position in the `(w-n+1) × (h-n+1)` rotation-origin space. */
  cursor: GridCursor;
}

// --- params ----------------------------------------------------------

export function defaultParams(): TwiddleParams {
  return { w: 3, h: 3, n: 2, rowsonly: false, orientable: false, movetarget: 0 };
}

export function encodeParams(p: TwiddleParams, _full: boolean): string {
  // Ignores `full`, as upstream does: the move target belongs in the brief
  // form because the status bar reports progress against it.
  let s = `${p.w}x${p.h}n${p.n}`;
  if (p.rowsonly) s += "r";
  if (p.orientable) s += "o";
  if (p.movetarget) s += `m${p.movetarget}`;
  return s;
}

export function decodeParams(s: string): TwiddleParams {
  // Upstream `decode_params`: `W` or `WxH`, an optional `nN` (default 2), then
  // `r`, `o` and `mK` in any order, skipping anything unrecognized.
  const { w, h, next } = parseDimensions(s);
  let i = next;
  let n = 2;
  if (s[i] === "n") {
    const run = parseLeadingInt(s, i + 1);
    n = run.value || 2;
    i = run.next;
  }
  let rowsonly = false;
  let orientable = false;
  let movetarget = 0;
  while (i < s.length) {
    const c = s[i++];
    if (c === "r") rowsonly = true;
    else if (c === "o") orientable = true;
    else if (c === "m") {
      const run = parseLeadingInt(s, i);
      movetarget = run.value;
      i = run.next;
    }
  }
  return { w, h, n, rowsonly, orientable, movetarget };
}

export function validateParams(p: TwiddleParams, _full: boolean): string | null {
  if (p.w < p.n) return "Width must be at least the rotating block size";
  if (p.h < p.n) return "Height must be at least the rotating block size";
  if (p.w > Math.floor(0x7fffffff / p.h)) return AREA_TOO_LARGE;
  return null;
}

// --- presets ----------------------------------------------------------

function preset(
  w: number,
  h: number,
  n: number,
  rowsonly: boolean,
  orientable: boolean,
) {
  return { params: { w, h, n, rowsonly, orientable, movetarget: 0 } };
}

export function presets(): PresetMenu<TwiddleParams> {
  return {
    title: "Type",
    submenu: [
      preset(3, 3, 2, true, false),
      preset(3, 3, 2, false, false),
      preset(3, 3, 2, false, true),
      preset(4, 4, 2, false, false),
      preset(4, 4, 2, false, true),
      preset(4, 4, 3, false, false),
      preset(5, 5, 3, false, false),
      preset(6, 6, 4, false, false),
    ],
  };
}

// --- rotation ---------------------------------------------------------

/**
 * Rotate the `n×n` block whose top-left corner is `(x, y)` by `dir`
 * quarter-turns, in place (so `executeMove` rotates copies). Upstream
 * `do_rotate`: loop the representative quarter `(n+1)/2 × n/2` and cycle
 * each element with its 4-rotational coset `p[0..3]`. When orientable, each
 * moved tile's orientation advances by `dir` (upstream's packed-bit
 * `v ^= ((v+dir) ^ v) & 3`), and so does the lone center tile when `n` is odd.
 */
export function doRotate(
  numbers: Int32Array,
  orient: Uint8Array,
  w: number,
  n: number,
  orientable: boolean,
  x: number,
  y: number,
  dir: number,
): void {
  const d = dir & 3;
  if (d === 0) return;

  const base = y * w + x;
  for (let i = 0; i < Math.floor((n + 1) / 2); i++) {
    for (let j = 0; j < Math.floor(n / 2); j++) {
      const p = [
        j * w + i,
        i * w + (n - j - 1),
        (n - j - 1) * w + (n - i - 1),
        (n - i - 1) * w + j,
      ];
      const gn = [0, 0, 0, 0];
      const go = [0, 0, 0, 0];
      for (let k = 0; k < 4; k++) {
        gn[k] = numbers[base + p[k]];
        go[k] = orient[base + p[k]];
      }
      for (let k = 0; k < 4; k++) {
        const src = (k + d) & 3;
        numbers[base + p[k]] = gn[src];
        orient[base + p[k]] = orientable ? (go[src] + d) & 3 : go[src];
      }
    }
  }

  if (orientable && n & 1) {
    const c = base + (n >> 1) * w + (n >> 1);
    orient[c] = (orient[c] + d) & 3;
  }
}

// --- completion -------------------------------------------------------

/** Solved iff the numbers read in non-decreasing row-major order
 * (non-strict, so `rowsonly`'s repeated numbers pass) and — when
 * orientable — every tile is upright. */
export function isComplete(
  numbers: Int32Array,
  orient: Uint8Array,
  wh: number,
  orientable: boolean,
): boolean {
  for (let i = 1; i < wh; i++) {
    if (numbers[i] < numbers[i - 1]) return false;
  }
  if (orientable) {
    for (let i = 0; i < wh; i++) {
      if (orient[i] !== 0) return false;
    }
  }
  return true;
}

// --- desc / state -----------------------------------------------------

/** The desc's orientation letters, indexed by orientation (`u` is upright). */
const ORIENT_LETTERS = "uldr";

function encodeDesc(
  numbers: Int32Array,
  orient: Uint8Array,
  wh: number,
  orientable: boolean,
): string {
  let s = "";
  for (let i = 0; i < wh; i++) {
    s += String(numbers[i]);
    if (orientable) s += ORIENT_LETTERS[orient[i]];
    else if (i < wh - 1) s += ",";
  }
  return s;
}

/**
 * Each tile's number, then its orientation letter when orientation matters and
 * a comma between tiles when it does not. The numbers are a shuffle of the
 * solved board's: `1..wh` once each, or with `rowsonly` each row's number once
 * per column.
 */
function parseDesc(
  p: TwiddleParams,
  desc: string,
): DescParse<{ numbers: Int32Array; orient: Uint8Array }> {
  const wh = p.w * p.h;
  const top = p.rowsonly ? p.h : wh;
  const copies = p.rowsonly ? p.w : 1;
  return readDesc(desc, (r) => {
    const numbers = new Int32Array(wh);
    const orient = new Uint8Array(wh);
    const seen = new Int32Array(top + 1);
    for (let i = 0; i < wh; i++) {
      if (i > 0 && !p.orientable) r.expect(",");
      numbers[i] = r.int(1, top);
      if (++seen[numbers[i]] > copies) r.fail(DESC_REPEATED);
      if (p.orientable) {
        orient[i] = ORIENT_LETTERS.indexOf(r.char((c) => ORIENT_LETTERS.includes(c)));
      }
    }
    r.end();
    return { numbers, orient };
  });
}

export function validateDesc(p: TwiddleParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: TwiddleParams, desc: string): TwiddleState {
  const { numbers, orient } = descValue(parseDesc(p, desc));
  return {
    w: p.w,
    h: p.h,
    n: p.n,
    orientable: p.orientable,
    numbers,
    orient,
    moveCount: 0,
    movetarget: p.movetarget,
    lastX: -1,
    lastY: -1,
    lastR: -1,
  };
}

export function status(state: TwiddleState): "solved" | "ongoing" {
  const { numbers, orient, w, h, orientable } = state;
  return isComplete(numbers, orient, w * h, orientable) ? "solved" : "ongoing";
}

// --- text format ------------------------------------------------------

const TEXT_ARROWS = "^<v>"; // orientation arrows: up, left, down, right

export function textFormat(state: TwiddleState): string {
  const { w, h, numbers, orient, orientable } = state;
  const col = numbers.reduce((max, v) => Math.max(max, String(v).length), 0);
  const lines: string[] = [];
  for (let y = 0; y < h; y++) {
    const cells: string[] = [];
    for (let x = 0; x < w; x++) {
      let cell = String(numbers[y * w + x]).padStart(col);
      if (orientable) cell += TEXT_ARROWS[orient[y * w + x]];
      cells.push(cell);
    }
    lines.push(cells.join(" "));
  }
  return lines.join("\n");
}

// --- generator --------------------------------------------------------

/**
 * Upstream `new_game_desc`: shuffle the solved grid by a long run of random
 * rotations, each chosen under the `prevmoves` guard that forbids immediately
 * undoing or over-repeating a rotation in an un-overlapped region. Shuffle
 * again while the result is still solved.
 */
export function newDesc(p: TwiddleParams, rng: RandomState): { desc: string } {
  const { w, h, n } = p;
  const wh = w * h;
  const numbers = new Int32Array(wh);
  const orient = new Uint8Array(wh);
  for (let i = 0; i < wh; i++) numbers[i] = (p.rowsonly ? Math.floor(i / w) : i) + 1;

  // Zero means auto; upstream adds a random move to avoid parity issues.
  const totalMoves = p.movetarget || w * h * n * n * 2 + randomUpto(rng, 2);

  const rw = w - n + 1; // width of the rotation-origin space
  const rh = h - n + 1;

  do {
    const prevmoves = new Int32Array(rw * rh);

    for (let i = 0; i < totalMoves; i++) {
      let x: number;
      let y: number;
      let r: number;
      let oldtotal: number;
      let newtotal: number;
      do {
        x = randomUpto(rng, rw);
        y = randomUpto(rng, rh);
        r = 2 * randomUpto(rng, 2) - 1; // ±1
        oldtotal = prevmoves[y * rw + x];
        newtotal = oldtotal + r;
        // When w == h == n every move repeats or undoes a previous one, so
        // the guard could never be satisfied: skip it there.
      } while (
        (w !== n || h !== n) &&
        (Math.abs(newtotal) < Math.abs(oldtotal) || Math.abs(newtotal) > 2)
      );

      doRotate(numbers, orient, w, n, p.orientable, x, y, r);

      // Log the rotation for inversion detection, and zero every region
      // that overlaps this one (now safe to move in again).
      prevmoves[y * rw + x] += r;
      for (let dy = -n + 1; dy <= n - 1; dy++) {
        if (y + dy < 0 || y + dy >= rh) continue;
        for (let dx = -n + 1; dx <= n - 1; dx++) {
          if (x + dx < 0 || x + dx >= rw) continue;
          if (dx === 0 && dy === 0) continue;
          prevmoves[(y + dy) * rw + (x + dx)] = 0;
        }
      }
    }
  } while (isComplete(numbers, orient, wh, p.orientable));

  return { desc: encodeDesc(numbers, orient, wh, p.orientable) };
}
