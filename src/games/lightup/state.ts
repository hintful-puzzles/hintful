/**
 * Light Up (Akari) state, params, and desc codec — port of the
 * corresponding parts of `lightup.c`.
 *
 * The board is two parallel typed arrays, as upstream: `flags` carries the
 * per-cell flag byte (black / numbered / bulb / impossible-mark, plus the
 * NUMBERUSED and MARK scratch bits that never appear in play states), and
 * `lights` carries a numbered black square's clue value, or the number of
 * bulbs lighting an open square.
 */

import { digitValue, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { noSuchTier, tierNames, tooRareToDeal } from "../../engine/difficulty.ts";
import type { PresetMenu } from "../../engine/game.ts";
import { AREA_TOO_LARGE } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { encodeRunLength, scanRunLength } from "../../engine/run-length.ts";
import {
  SYMM_NONE,
  SYMM_REF4,
  SYMM_ROT2,
  SYMM_ROT4,
} from "../../engine/symmetric-blacks.ts";
import type { GameStatus, Point } from "../../engine/types.ts";

// --- cell flags (upstream values) -------------------------------------------

export const F_BLACK = 1;
/** Black square: it has a clue number attached. */
export const F_NUMBERED = 2;
/** Solver scratch: this clue was useful for solving (generator stripping). */
export const F_NUMBERUSED = 4;
/** Open square: player's "no bulb here" mark. */
export const F_IMPOSSIBLE = 8;
/** Open square: player's bulb. */
export const F_LIGHT = 16;
/** Generator scratch (place_lights sweep). */
export const F_MARK = 32;

export const idx = (x: number, y: number, w: number): number => y * w + x;

// --- types ---------------------------------------------------------------------

export interface LightupParams {
  w: number;
  h: number;
  /** Percentage of black squares, 5–100. */
  blackpc: number;
  symm: number;
  difficulty: number;
}

export interface LightupState {
  w: number;
  h: number;
  /** Number of player bulbs on the board. */
  nlights: number;
  /** Clue value for numbered blacks; times-lit count for open squares. */
  lights: Int16Array;
  flags: Uint8Array;
}

/** One toggle, exactly upstream's `L`/`I` move atoms (both are toggles;
 * placing either clears the other). */
export interface LightupOp {
  kind: "light" | "impossible";
  x: number;
  y: number;
}

/** A move is a list of toggles plus an optional solve flag (upstream's
 * `S;L…;I…` compound). A plain click is a single-op list. */
export interface LightupMove {
  solve?: boolean;
  ops: LightupOp[];
}

export interface LightupUi {
  cursor: GridCursor;
  /** Pref: draw the impossible-mark blob even on a lit square. */
  drawBlobsWhenLit: boolean;
}

// --- params ----------------------------------------------------------------------

const PRESETS: LightupParams[] = [
  { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 0 },
  { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 1 },
  { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 2 },
  { w: 10, h: 10, blackpc: 20, symm: SYMM_ROT2, difficulty: 0 },
  { w: 10, h: 10, blackpc: 20, symm: SYMM_ROT2, difficulty: 1 },
  { w: 10, h: 10, blackpc: 20, symm: SYMM_ROT2, difficulty: 2 },
  { w: 14, h: 14, blackpc: 20, symm: SYMM_ROT2, difficulty: 0 },
  { w: 14, h: 14, blackpc: 20, symm: SYMM_ROT2, difficulty: 1 },
  { w: 14, h: 14, blackpc: 20, symm: SYMM_ROT2, difficulty: 2 },
];

// Difficulty 2 requires guess-and-backtrack by construction (the generator
// rejects boards solvable at the tier below), so it is named Unreasonable.
export const DIFF_NAMES: readonly string[] = tierNames(3, { search: true });

export function defaultParams(): LightupParams {
  return { ...PRESETS[0] };
}

export function presets(): PresetMenu<LightupParams> {
  return {
    title: "Light Up",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

export function decodeParams(s: string): LightupParams {
  const p = defaultParams();
  let i = 0;
  // Upstream's EATNUM: `atoi` from `start`, leaving `i` just past the digits.
  const eatNum = (start: number): number => {
    const r = parseLeadingInt(s, start);
    i = r.next;
    return r.value;
  };
  p.w = eatNum(0);
  if (s[i] === "x") p.h = eatNum(i + 1);
  if (s[i] === "b") p.blackpc = eatNum(i + 1);
  if (s[i] === "s") p.symm = eatNum(i + 1);
  else if (p.symm === SYMM_ROT4 && p.w !== p.h) {
    // A bare '18x10' must not keep the default's square-only 4-fold symmetry.
    p.symm = SYMM_ROT2;
  }
  p.difficulty = 0;
  // Old params: a bare 'r' meant the recursive (Unreasonable) solver.
  if (s[i] === "r") {
    p.difficulty = 2;
    i++;
  }
  if (s[i] === "d") p.difficulty = eatNum(i + 1);
  return p;
}

export function encodeParams(p: LightupParams, full: boolean): string {
  return full
    ? `${p.w}x${p.h}b${p.blackpc}s${p.symm}d${p.difficulty}`
    : `${p.w}x${p.h}`;
}

/**
 * The refusal for a board too small to need the tier asked for, or `null`.
 *
 * Measured 2026-10-06 at 5%, 20% and 50% black, with the generator's ramp
 * running over and over: none in 70,000 to 900,000 boards built a cell. A 3x3
 * without symmetry has Unreasonable boards and a 2x5 has them, so the line is
 * nine squares; the 3x3's center is its own mirror image, which is why
 * symmetry costs it a tier.
 *
 * A 2x5 turned half round gave no Unreasonable board in 450,000 either, and
 * is left for the generator to run out on: no line was found through it.
 */
function absentTier(p: LightupParams): string | null {
  const tier = DIFF_NAMES[p.difficulty] ?? "";
  const squares = p.w * p.h;
  const is3x3 = p.w === 3 && p.h === 3;
  if (p.difficulty === 0) return null;
  if (squares <= 4) return noSuchTier("2x2 puzzle", tier);
  if (p.difficulty === 1) {
    return is3x3 && (p.symm === SYMM_REF4 || p.symm === SYMM_ROT4)
      ? noSuchTier("3x3 puzzle with 4-way symmetry", tier)
      : null;
  }
  if (squares < 9) return noSuchTier("puzzle of fewer than 9 squares", tier);
  if (is3x3 && p.symm !== SYMM_NONE)
    return noSuchTier("3x3 puzzle with symmetry", tier);
  if (p.w === 4 && p.h === 4) {
    // Mirrored: none in 170,000 boards built. Turned: 8 in 170,000, and none
    // at all starting from 50% black. Dealt 2026-10-06 with the round bound
    // lifted, 90 seconds a starting percentage: a deal finds its board in its
    // first twenty rounds or goes on finding none, so from 5% black two deals
    // found one and the third ran 89 seconds without, from 20% one did, and
    // from 50% none. That is a minute a board and more, which is too long to
    // wait once, and nothing to size a bound to.
    if (p.symm === SYMM_REF4)
      return noSuchTier("4x4 puzzle with 4-way mirror symmetry", tier);
    if (p.symm === SYMM_ROT4)
      return tooRareToDeal("4x4 puzzles with 4-way rotational symmetry", tier);
  }
  return null;
}

export function validateParams(p: LightupParams, full: boolean): string | null {
  if (p.w * p.h > 0x7fffffff) return AREA_TOO_LARGE;
  if (full) {
    if (p.blackpc < 5 || p.blackpc > 100)
      return "Percentage of walls must be between 5% and 100%.";
    if (p.w !== p.h && p.symm === SYMM_ROT4)
      return "4-fold symmetry is only available with square grids.";
    if ((p.symm === SYMM_ROT4 || p.symm === SYMM_REF4) && p.w < 3 && p.h < 3)
      return "Width or height must be at least 3 for 4-way symmetry.";
    return absentTier(p);
  }
  return null;
}

// --- board helpers ------------------------------------------------------------------

/** The orthogonal in-bounds neighbors of (x, y), in upstream's
 * left/right/up/down order (order matters — solver scratch lists and
 * tie-breaks are built in this order). */
export function getSurrounds(w: number, h: number, ox: number, oy: number): Point[] {
  const out: Point[] = [];
  if (ox > 0) out.push({ x: ox - 1, y: oy });
  if (ox < w - 1) out.push({ x: ox + 1, y: oy });
  if (oy > 0) out.push({ x: ox, y: oy - 1 });
  if (oy < h - 1) out.push({ x: ox, y: oy + 1 });
  return out;
}

/**
 * Every cell a bulb at (ox, oy) would light — the run of open squares
 * along its row and column, stopped by black squares. Yields the row
 * cells left-to-right (origin excluded), then the column cells
 * top-to-bottom (origin included iff `includeOrigin`) — exactly
 * upstream's `list_lights` + `FOREACHLIT` order, which solver scratch
 * ordering (and so tie-breaking) depends on.
 */
export function* litCells(
  state: LightupState,
  ox: number,
  oy: number,
  includeOrigin: boolean,
): Generator<Point> {
  const { w, h, flags } = state;
  let minx = ox;
  let maxx = ox;
  let miny = oy;
  let maxy = oy;
  for (let x = ox - 1; x >= 0; x--) {
    if (flags[idx(x, oy, w)] & F_BLACK) break;
    minx = x;
  }
  for (let x = ox + 1; x < w; x++) {
    if (flags[idx(x, oy, w)] & F_BLACK) break;
    maxx = x;
  }
  for (let y = oy - 1; y >= 0; y--) {
    if (flags[idx(ox, y, w)] & F_BLACK) break;
    miny = y;
  }
  for (let y = oy + 1; y < h; y++) {
    if (flags[idx(ox, y, w)] & F_BLACK) break;
    maxy = y;
  }
  for (let x = minx; x <= maxx; x++) {
    if (x === ox) continue;
    yield { x, y: oy };
  }
  for (let y = miny; y <= maxy; y++) {
    if (!includeOrigin && y === oy) continue;
    yield { x: ox, y };
  }
}

/** Force the bulb at (ox, oy) to `on`, updating the lit counts of every
 * cell it lights. Mutates `state` (play states are cloned first). */
export function setLight(
  state: LightupState,
  ox: number,
  oy: number,
  on: boolean,
): void {
  const i = idx(ox, oy, state.w);
  if (state.flags[i] & F_BLACK) throw new Error("setLight on a black square");
  if (((state.flags[i] & F_LIGHT) !== 0) === on) return;
  const diff = on ? 1 : -1;
  state.flags[i] ^= F_LIGHT;
  state.nlights += diff;
  for (const { x, y } of litCells(state, ox, oy, true)) {
    state.lights[idx(x, y, state.w)] += diff;
  }
}

// --- completion ----------------------------------------------------------------------

/** True when every open square is lit. */
function gridLit({ flags, lights }: LightupState): boolean {
  for (let i = 0; i < flags.length; i++) {
    if (!(flags[i] & F_BLACK) && lights[i] === 0) return false;
  }
  return true;
}

/** True when any bulb is lit by another bulb. */
export function gridOverlap({ flags, lights }: LightupState): boolean {
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] & F_LIGHT && lights[i] > 1) return true;
  }
  return false;
}

/** Exactly `clue` bulbs around the numbered square at (x, y). */
function numberCorrect(state: LightupState, x: number, y: number): boolean {
  let n = 0;
  for (const pt of getSurrounds(state.w, state.h, x, y)) {
    if (state.flags[idx(pt.x, pt.y, state.w)] & F_LIGHT) n++;
  }
  return n === state.lights[idx(x, y, state.w)];
}

/** The display-error test for a clue: definitely too many bulbs, or too
 * few even if every plausible neighbor became one. */
export function numberWrong(state: LightupState, x: number, y: number): boolean {
  const clue = state.lights[idx(x, y, state.w)];
  let n = 0;
  let empty = 0;
  for (const pt of getSurrounds(state.w, state.h, x, y)) {
    const i = idx(pt.x, pt.y, state.w);
    if (state.flags[i] & F_LIGHT) {
      n++;
      continue;
    }
    if (state.flags[i] & F_BLACK) continue;
    if (state.flags[i] & F_IMPOSSIBLE) continue;
    if (state.lights[i] > 0) continue;
    empty++;
  }
  return n > clue || n + empty < clue;
}

/** True when all clue counts are exactly satisfied. */
function gridAddsup(state: LightupState): boolean {
  for (let x = 0; x < state.w; x++) {
    for (let y = 0; y < state.h; y++) {
      const i = idx(x, y, state.w);
      if (!(state.flags[i] & F_NUMBERED)) continue;
      if (!numberCorrect(state, x, y)) return false;
    }
  }
  return true;
}

export function gridCorrect(state: LightupState): boolean {
  return gridLit(state) && !gridOverlap(state) && gridAddsup(state);
}

// --- state construction ----------------------------------------------------------------

export function emptyState(p: LightupParams): LightupState {
  return {
    w: p.w,
    h: p.h,
    nlights: 0,
    lights: new Int16Array(p.w * p.h),
    flags: new Uint8Array(p.w * p.h),
  };
}

export function cloneState(s: LightupState): LightupState {
  return { ...s, lights: s.lights.slice(), flags: s.flags.slice() };
}

export function status(s: LightupState): GameStatus {
  return gridCorrect(s) ? "solved" : "ongoing";
}

// --- desc codec ---------------------------------------------------------------------------

/** Encode the black/numbered layout as upstream: row-major, `B` for an
 * unnumbered black, `0`–`4` for a numbered black, runs of open squares
 * compressed as `a`–`z`. The trailing run is kept, because
 * {@link parseDesc} wants exactly `w × h` cells. */
export function encodeDesc(state: LightupState): string {
  const { w, h, flags, lights } = state;
  return encodeRunLength(
    w * h,
    (i) => {
      if (!(flags[i] & F_BLACK)) return null;
      return flags[i] & F_NUMBERED ? String(lights[i]) : "B";
    },
    { keepTrailingBlanks: true },
  );
}

/** The board the desc lays out: its black squares and their clues. */
function parseDesc(p: LightupParams, desc: string): DescParse<LightupState> {
  const wh = p.w * p.h;
  return readDesc(desc, (r) => {
    const state = emptyState(p);
    let i = 0;
    for (const tok of scanRunLength(r.rest())) {
      // A token past the last cell is data the grid has no room for, whether or
      // not it is a character this game accepts.
      if (i >= wh) r.fail(DESC_TOO_LONG);
      if ("blanks" in tok) {
        i += tok.blanks;
        continue;
      }
      if (tok.value === "B") {
        state.flags[i++] |= F_BLACK;
        continue;
      }
      // A numbered black square counts the lights around it, so `0`–`4`.
      const clue = digitValue(tok.value);
      if (clue === null) return r.fail(descBadCharacter(tok.value));
      if (clue > 4) r.fail(DESC_OUT_OF_RANGE);
      state.flags[i] |= F_NUMBERED | F_BLACK;
      state.lights[i++] = clue;
    }
    if (i < wh) r.fail(DESC_TOO_SHORT);
    if (i > wh) r.fail(DESC_TOO_LONG);
    return state;
  });
}

export function newState(p: LightupParams, desc: string): LightupState {
  return descValue(parseDesc(p, desc));
}

// --- text format -----------------------------------------------------------------------------

export function textFormat(state: LightupState): string {
  const { w, h, flags, lights } = state;
  const lines: string[] = [];
  const gridline = `+${"-+".repeat(w)}`;
  for (let y = 0; y < h; y++) {
    lines.push(gridline);
    let row = "";
    for (let x = 0; x < w; x++) {
      const i = idx(x, y, w);
      let c = " ";
      if (flags[i] & F_BLACK) {
        c = flags[i] & F_NUMBERED ? String(lights[i]) : "#";
      } else if (flags[i] & F_LIGHT) {
        c = "L";
      } else if (flags[i] & F_IMPOSSIBLE) {
        c = "x";
      } else if (lights[i] > 0) {
        c = ".";
      }
      row += `|${c}`;
    }
    lines.push(`${row}|`);
  }
  lines.push(gridline);
  return `${lines.join("\n")}\n`;
}
