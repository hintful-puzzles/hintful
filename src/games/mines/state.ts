/**
 * Types, codec and pure state helpers for Mines (`puzzles/mines.c`).
 *
 * The one deliberate impurity of this port lives here: {@link MineLayout} is a
 * mutable box shared *by reference* across every cloned {@link MinesState}
 * (upstream's refcounted `struct mine_layout`, mines.c:62). The mine bitmap
 * does not exist until the first click generates it (so the first click is
 * never a mine), and once generated it survives undo — clicking a *different*
 * square after undoing to the start uses the *old* layout. That is not a wart:
 * it is what stops the player rerolling the board. `(state, move)` cannot carry
 * that history, so the box is explicit and `index.ts`'s `openSquare` is its
 * single mutation site.
 */

import { isDigit, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descValue,
  puzzleDescError,
} from "../../engine/desc-error.ts";
import { type DescReader, readDesc } from "../../engine/desc-reader.ts";
import { obfuscateBitmap } from "../../engine/obfuscate.ts";
import { AREA_TOO_LARGE } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import {
  type RandomState,
  randomStateDecode,
  randomStateEncode,
} from "../../engine/random/index.ts";
import type { Point } from "../../engine/types.ts";

// --- grid value encoding (upstream `signed char *grid`) ----------------
// 0..8 : open, that many neighboring mines
export const FLAG = -1; // marked as a mine
export const COVERED = -2; // unknown / covered
export const QUERY = -3; // question mark (this frontend never sets one)
export const KILLED = 65; // the mine the player trod on
/** A square queued to open, seen only inside `openSquare`'s flood. */
export const TODO = -10;

/** The in-bounds squares of the 3×3 block centered on (x, y), itself included,
 * row by row. */
export function around(w: number, h: number, x: number, y: number): Point[] {
  const out: Point[] = [];
  for (let ny = Math.max(y - 1, 0); ny <= Math.min(y + 1, h - 1); ny++) {
    for (let nx = Math.max(x - 1, 0); nx <= Math.min(x + 1, w - 1); nx++) {
      out.push({ x: nx, y: ny });
    }
  }
  return out;
}

// --- params ------------------------------------------------------------

export interface MinesParams {
  w: number;
  h: number;
  n: number;
  unique: boolean;
  /** A forced first click for batch generation (the `X`/`Y` param letters,
   * read by `newGameDescBatch`); -1 = unset. The running game never sets them. */
  firstClickX: number;
  firstClickY: number;
}

// --- the shared mine-layout box ----------------------------------------

export interface MineLayout {
  /** The real mine positions (1 = mine), or `null` while the layout has not
   * yet been generated (a preliminary `r…` game before the first click). */
  mines: Int8Array | null;
  /** Mine count, used before the bitmap exists (for the status bar's total). */
  n: number;
  unique: boolean;
  /** The generator RNG, decoded from the preliminary desc; consumed (and
   * nulled) when the layout is generated on the first click. */
  rs: RandomState | null;
  /** Where the first click landed (for the "start here" cross after an undo);
   * -1 until the layout is generated. */
  startx: number;
  starty: number;
}

// --- state / ui / move -------------------------------------------------

export interface MinesState {
  w: number;
  h: number;
  n: number;
  dead: boolean;
  /** Shared by reference across every clone. */
  layout: MineLayout;
  /** Where the first click landed, as this state knows it (see `openSquare`
   * for why that is not `layout.startx`). Drives `supersededDesc`. */
  clickedAt: Point | null;
  /** Player knowledge (the grid value encoding above); cloned per move. */
  grid: Int8Array;
}

export interface MinesUi {
  /** Mouse-down highlight center / radius (a render-only overlay). */
  hx: number;
  hy: number;
  hradius: number;
  /** Radius that a release will actually act on (0 = single square). */
  validradius: number;
  /** Whether the pending flash is a death (vs a win) — set by `flashLength`. */
  flashIsDeath: boolean;
  /** Death counter; survives undo and a save. */
  deaths: number;
  cursor: GridCursor;
}

/** One grid operation: `F` toggles a flag, `O` opens (with flood), `C` chords a
 * satisfied number. A player move is a list of these. */
export type MineOp = { op: "F" | "O" | "C"; x: number; y: number };
export type MinesMove = { type: "solve" } | { type: "ops"; ops: MineOp[] };

// --- params codec ------------------------------------------------------

export function defaultParams(): MinesParams {
  return { w: 9, h: 9, n: 10, unique: true, firstClickX: -1, firstClickY: -1 };
}

/** Upstream's `decode_params` (mines.c:168): `WxH`, optional `nN` mine count
 * (defaulting to area/10), then `a`/`X`/`Y` flags. */
export function decodeParams(s: string): MinesParams {
  const p = defaultParams();
  const w = parseLeadingInt(s, 0);
  p.w = w.value;
  let i = w.next;
  if (s[i] === "x") {
    const h = parseLeadingInt(s, i + 1);
    p.h = h.value;
    i = h.next;
  } else p.h = p.w;
  if (s[i] === "n") {
    const n = parseLeadingInt(s, i + 1);
    p.n = n.value;
    i = n.next;
    // upstream also skips '.' inside the mine count (a percentage form)
    while (i < s.length && (s[i] === "." || isDigit(s[i]))) i++;
  } else if (p.h > 0 && p.w > 0) {
    p.n = Math.floor((p.w * p.h) / 10);
  }
  while (i < s.length) {
    const c = s[i++];
    if (c === "a") p.unique = false;
    else if (c === "X") {
      const x = parseLeadingInt(s, i);
      p.firstClickX = x.value;
      i = x.next;
    } else if (c === "Y") {
      const y = parseLeadingInt(s, i);
      p.firstClickY = y.value;
      i = y.next;
    }
    // anything else is gunk, skipped
  }
  return p;
}

/** Upstream's `encode_params` (mines.c:208). The mine count and the `a`/`X`/`Y`
 * flags are generation-time (`full`) parameters only. */
export function encodeParams(p: MinesParams, full: boolean): string {
  let s = `${p.w}x${p.h}`;
  if (full) s += `n${p.n}`;
  if (full && !p.unique) s += "a";
  if (full && p.firstClickX >= 0) s += `X${p.firstClickX}`;
  if (full && p.firstClickY >= 0) s += `Y${p.firstClickY}`;
  return s;
}

/** Upstream's `validate_params` (mines.c:279). */
export function validateParams(p: MinesParams, full: boolean): string | null {
  if (full && p.unique && (p.w <= 2 || p.h <= 2))
    return "Width and height must both be greater than two.";
  if (p.w > Math.floor((2 ** 28 - 1) / p.h)) return AREA_TOO_LARGE;
  if (p.n > p.w * p.h - 9) return "There must be at least 9 more squares than mines.";
  if (p.firstClickX >= p.w) return "First-click x coordinate must be inside the grid.";
  if (p.firstClickY >= p.h) return "First-click y coordinate must be inside the grid.";
  return null;
}

// --- mine-bitmap ⇄ hex codec (mines.c describe_layout / new_game) -------

const HEX = "0123456789abcdef";
const isHex = (c: string) => HEX.includes(c);

/** Encode a mine bitmap as the obfuscated nibble string that follows the `m`
 * in a public/private desc (upstream `describe_layout`, mines.c:1981, with
 * `obfuscate = true`). Emits exactly `(wh+3)/4` nibbles. */
export function encodeLayoutHex(mines: Int8Array, wh: number): string {
  const bmp = new Uint8Array((wh + 7) >> 3);
  for (let i = 0; i < wh; i++) if (mines[i]) bmp[i >> 3] |= 0x80 >> (i & 7);
  obfuscateBitmap(bmp, wh, false);
  const nnib = (wh + 3) >> 2;
  let out = "";
  for (let i = 0; i < nnib; i++) {
    let v = bmp[i >> 1];
    if ((i & 1) === 0) v >>= 4;
    out += HEX[v & 0xf];
  }
  return out;
}

/** Read the `(wh+3)/4`-nibble hex layout exactly as {@link encodeLayoutHex}
 * writes it (upstream `new_game`, mines.c:2336): lowercase, the last nibble's
 * bits past `wh` clear. `masked` de-obfuscates. */
function readLayout(r: DescReader, wh: number, masked: boolean): Int8Array {
  const bmp = new Uint8Array((wh + 7) >> 3);
  for (let i = 0; i * 4 < wh; i++) {
    const padding = (1 << (4 - Math.min(4, wh - i * 4))) - 1;
    const v = HEX.indexOf(r.char((c) => isHex(c) && (HEX.indexOf(c) & padding) === 0));
    bmp[i >> 1] |= v << (4 * (1 - (i & 1)));
  }
  if (masked) obfuscateBitmap(bmp, wh, true);
  const mines = new Int8Array(wh);
  for (let i = 0; i < wh; i++) if (bmp[i >> 3] & (0x80 >> (i & 7))) mines[i] = 1;
  return mines;
}

/** Read the rest of the desc as an RNG state written by `randomStateEncode`,
 * which is the only text that round-trips through it. */
function readRandomState(r: DescReader): RandomState {
  const start = r.pos;
  while (!r.done) r.char(isHex);
  const text = r.desc.slice(start);
  const rs = randomStateDecode(text);
  const canonical = randomStateEncode(rs);
  if (text.length < canonical.length) r.fail(DESC_TOO_SHORT);
  if (text.length > canonical.length) r.fail(DESC_TOO_LONG);
  // Same length and all hex, so only the read position can differ.
  if (text !== canonical) r.fail(DESC_OUT_OF_RANGE);
  return rs;
}

// --- desc (mines.c validate_desc:2081, new_game:2264) -------------------

/** The parsed shape of a desc: the shared layout box, plus the first click
 * to open (a public desc bakes one in). */
export interface DecodedDesc {
  layout: MineLayout;
  openXY: Point | null;
}

/**
 * Three forms: the preliminary `r<n>,<u|a>,<rng>` that `newDesc` writes, whose
 * layout waits for the first click; and the public `x,y,m<hex>` and private
 * `m<hex>` that `supersededDesc` writes once it exists. `u` in place of `m` is
 * upstream's unobfuscated layout, kept for IDs typed by hand.
 */
function parseDesc(p: MinesParams, desc: string): DescParse<DecodedDesc> {
  const wh = p.w * p.h;
  return readDesc(desc, (r) => {
    const layout: MineLayout = {
      mines: null,
      n: p.n,
      unique: p.unique,
      rs: null,
      startx: -1,
      starty: -1,
    };
    if (r.accept("r")) {
      // The real bound is the puzzle's own rule, which has its own sentence.
      layout.n = r.int(0, Number.MAX_SAFE_INTEGER);
      if (layout.n > wh - 9) {
        r.fail(
          puzzleDescError(
            "This game ID has more mines than its board can hold around a safe first click.",
          ),
        );
      }
      r.expect(",");
      layout.unique = r.char((c) => c === "u" || c === "a") === "u";
      r.expect(",");
      layout.rs = readRandomState(r);
      return { layout, openXY: null };
    }
    let openXY: Point | null = null;
    if (r.peekIs(isDigit)) {
      const x = r.int(0, p.w - 1);
      r.expect(",");
      const y = r.int(0, p.h - 1);
      r.expect(",");
      openXY = { x, y };
    }
    const masked = r.char((c) => c === "m" || c === "u") === "m";
    layout.mines = readLayout(r, wh, masked);
    r.end();
    return { layout, openXY };
  });
}

export function decodeDesc(p: MinesParams, desc: string): DecodedDesc {
  return descValue(parseDesc(p, desc));
}

/** Won: the layout exists, the player is alive, and every square still
 * covered (flagged or not) is a mine, so every safe square is open. */
export function isWon(s: MinesState): boolean {
  const mines = s.layout.mines;
  if (!mines || s.dead) return false;
  for (let i = 0; i < s.w * s.h; i++) {
    if (s.grid[i] < 0 && !mines[i]) return false;
  }
  return true;
}

/** The next move's state: its own `grid`, the same shared `layout`. */
export function cloneState(s: MinesState): MinesState {
  return { ...s, grid: new Int8Array(s.grid) };
}

// --- ui serialization (mines.c encode_ui/decode_ui:2492) ---------------

/** `D<deaths>`. Upstream also saved a `C` for "ever completed", which only
 * stopped the clock; the engine's timer keeps that fact itself, so a `C` in
 * an older save is read past. */
export function encodeUi(ui: MinesUi): string {
  return `D${ui.deaths}`;
}

export function decodeUi(ui: MinesUi, encoded: string): void {
  const m = /^D(\d+)/.exec(encoded);
  if (!m) return;
  ui.deaths = Number(m[1]);
}
