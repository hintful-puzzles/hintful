import { parseLeadingInt } from "../../engine/decimal.ts";
import { DESC_REPEATED, type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import type { PresetBoards } from "../../engine/game.ts";
import { AREA_TOO_LARGE, parseDimensions, unreadParams } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import * as twiddle from "./twiddle.compiled.ts";

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
  /** Tile orientations 0..3, each tile's quarter turns anticlockwise from
   * upright; all 0 unless `orientable`. The description's `turn` layer. */
  readonly orient: Int32Array;
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
  /** The block a click would turn, by its top-left square, while the mouse
   * is over the board; null otherwise. Mouse only: touch has no hover. */
  hoverBlock: { x: number; y: number } | null;
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
  // `r`, `o` and `mK` in any order.
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
    } else unreadParams(s, i - 1);
  }
  return { w, h, n, rowsonly, orientable, movetarget };
}

export function validateParams(p: TwiddleParams, _full: boolean): string | null {
  if (p.w < p.n) return "Width must be at least the rotating block size.";
  if (p.h < p.n) return "Height must be at least the rotating block size.";
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
): TwiddleParams {
  return { w, h, n, rowsonly, orientable, movetarget: 0 };
}

export const menu: PresetBoards<TwiddleParams> = {
  boards: [
    preset(3, 3, 2, true, false),
    preset(4, 4, 2, true, false),
    preset(5, 5, 3, true, false),
    preset(3, 3, 2, false, false),
    preset(3, 3, 2, false, true),
    preset(4, 4, 2, false, false),
    // Upstream's 4x4 and 6x6 with the larger blocks stand upright.
    preset(4, 5, 3, false, false),
    preset(5, 5, 3, false, false),
    preset(6, 7, 4, false, false),
  ],
};

// --- rotation ---------------------------------------------------------

// --- the rules ----------------------------------------------------------

/** The description's rules on a board of this size and kind. Rows only
 * changes only which numbers are dealt, which the rules do not read. */
export function rulesOf(s: {
  readonly w: number;
  readonly h: number;
  readonly n: number;
  readonly orientable: boolean;
}) {
  return twiddle.rules(
    describedSpace(twiddle.units, s.w, s.h),
    { n: s.n },
    s.orientable ? ["orientable"] : [],
  );
}

export const positionOf = (s: TwiddleState): twiddle.Position => ({
  value: s.numbers,
  turn: s.orient,
});

/** The description's turn of the block whose top-left square is `(x, y)`:
 * anticlockwise where `dir` is +1. */
export const turnOf = (w: number, x: number, y: number, dir: 1 | -1): twiddle.Move => ({
  move: dir === 1 ? "anticlockwise" : "clockwise",
  b: y * w + x,
});

// --- desc / state -----------------------------------------------------

/** The desc's orientation letters, indexed by orientation (`u` is upright). */
const ORIENT_LETTERS = "uldr";

export function encodeDesc(
  numbers: Int32Array,
  orient: Int32Array,
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
): DescParse<{ numbers: Int32Array; orient: Int32Array }> {
  const wh = p.w * p.h;
  const top = p.rowsonly ? p.h : wh;
  const copies = p.rowsonly ? p.w : 1;
  return readDesc(desc, (r) => {
    const numbers = new Int32Array(wh);
    const orient = new Int32Array(wh);
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

/**
 * Whether no turns put this board in order, by the description's claims:
 * what every turn keeps. Each is proved, and nothing says they are all there
 * is, so a board that passes them may still be out of reach.
 */
export function hasNoSolution(state: TwiddleState): boolean {
  return rulesOf(state).deadEnd(positionOf(state)) !== null;
}

export function status(state: TwiddleState): "solved" | "ongoing" {
  return rulesOf(state).finished(positionOf(state)) ? "solved" : "ongoing";
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
  const rules = rulesOf(p);
  const finished = new Int32Array(wh);
  for (let i = 0; i < wh; i++) finished[i] = (p.rowsonly ? Math.floor(i / w) : i) + 1;
  let position: twiddle.Position = { value: finished, turn: new Int32Array(wh) };

  // Zero means auto; upstream adds a random move to avoid parity issues.
  const totalMoves = p.movetarget || w * h * n * n * 2 + randomUpto(rng, 2);

  const rw = w - n + 1; // width of the rotation-origin space
  const rh = h - n + 1;

  const attempt = retryLimit("twiddle: a shuffle that is not already solved");
  do {
    attempt();
    const prevmoves = new Int32Array(rw * rh);

    for (let i = 0; i < totalMoves; i++) {
      let x: number;
      let y: number;
      let r: 1 | -1;
      let oldtotal: number;
      let newtotal: number;
      do {
        x = randomUpto(rng, rw);
        y = randomUpto(rng, rh);
        r = randomUpto(rng, 2) ? 1 : -1;
        oldtotal = prevmoves[y * rw + x];
        newtotal = oldtotal + r;
        // When w == h == n every move repeats or undoes a previous one, so
        // the guard could never be satisfied: skip it there.
      } while (
        (w !== n || h !== n) &&
        (Math.abs(newtotal) < Math.abs(oldtotal) || Math.abs(newtotal) > 2)
      );

      position = rules.play(position, turnOf(w, x, y, r));

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
  } while (rules.finished(position));

  return { desc: encodeDesc(position.value, position.turn, wh, p.orientable) };
}
