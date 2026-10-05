import { c2n, DESC_ALPHABET_SIZE, n2c } from "../../engine/desc-alphabet.ts";
import {
  DESC_OUT_OF_RANGE,
  type DescParse,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, noSuchTier, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
/**
 * Types and pure state helpers for Singles (Hitori), from the state/codec
 * parts of `singles.c`.
 *
 * Each cell carries an immutable number (`nums`, 1..max(w,h)) and a
 * mutable `flags` bitmask (black / circle / error / solver-scratch). A
 * correctly completed board: no number repeats among the white (non-black)
 * cells of any row or column, no two black cells are orthogonally
 * adjacent, and the white cells form one connected region.
 */

/** Difficulty: upstream DIFF_EASY / DIFF_TRICKY. */
export type Difficulty = "easy" | "tricky";

/** Numeric difficulty levels, as upstream's `enum`. `ANY` is the "whatever
 * the solver reaches" level Solve and findMistakes use. */
export const DIFF_EASY = 0;
export const DIFF_TRICKY = 1;
export const DIFF_ANY = 3;

const DIFF_CHARS = "ek"; // singles_diffchars, indexed by level
const DIFF_NAMES = tierNames(2);

export function diffToLevel(d: Difficulty): number {
  return d === "tricky" ? DIFF_TRICKY : DIFF_EASY;
}
export function diffFromLevel(level: number): Difficulty {
  return level === DIFF_TRICKY ? "tricky" : "easy";
}

// Cell flag bits (upstream F_*).
export const F_BLACK = 0x1;
export const F_CIRCLE = 0x2;
export const F_ERROR = 0x4;
export const F_SCRATCH = 0x8;

export interface SinglesParams {
  w: number;
  h: number;
  diff: Difficulty;
}

export interface SinglesState {
  w: number;
  h: number;
  /** w*h. */
  n: number;
  /** max(w, h) — the number alphabet size. */
  o: number;
  impossible: boolean;
  /** Immutable per-cell numbers, shared by reference across states. */
  nums: Int8Array;
  /** Mutable per-cell flags, cloned per move. */
  flags: Uint8Array;
}

/** A single cell edit: black, circle (white mark), or empty. */
export type CellValue = "black" | "circle" | "empty";

export interface SinglesMove {
  sets: { x: number; y: number; value: CellValue }[];
  /** Set when this move is the Solve auto-fill. */
  solve?: boolean;
}

export interface SinglesUi {
  cursor: GridCursor;
  showBlackNums: boolean;
}

// --- params codec ----------------------------------------------------------

export function defaultParams(): SinglesParams {
  return { w: 5, h: 5, diff: "easy" };
}

/**
 * The largest grid whose numbers the desc alphabet can write.
 *
 * A cell holds `1..max(w, h)` and the alphabet's 62 slots run `0..61`, so the
 * largest number expressible is 61 — **one less than upstream's bound**, which
 * is `10+26+26` written out. A 62 would encode as `[`, which `c2n` gives no
 * value and the desc parse rejects. Derived from the alphabet so the two
 * cannot drift apart.
 */
const MAX_DIM = DESC_ALPHABET_SIZE - 1;

/** The "Custom type…" form, and the field list the codec below encodes. The
 * difficulty accessors convert to and from this game's string tier union, so
 * the codec never has to know how a tier is represented. */
export const paramConfig: ParamConfigItem<SinglesParams>[] = [
  ...dimensionParamConfig<SinglesParams>({
    doc: "Size of the grid in squares. A grid under 4 squares both ways has only Easy puzzles.",
    bounds: { min: 2, max: MAX_DIM },
  }),
  difficultyItem(DIFF_NAMES, {
    get: (p: SinglesParams) => diffToLevel(p.diff),
    set: (p: SinglesParams, tier: number) => {
      p.diff = diffFromLevel(tier);
    },
  }),
];

export function validateParams(p: SinglesParams, full: boolean): string | null {
  // Measured 2026-10-05: none in 50,000 boards built at each of 2x2, 2x3, 3x2
  // and 3x3. A board 4 long either way deals Normal at once, which upstream's
  // rule (under 4 in either direction is Easy) had hidden.
  if (full && p.w < 4 && p.h < 4 && p.diff === "tricky")
    return noSuchTier(`${p.w}x${p.h} puzzle`, DIFF_NAMES[DIFF_TRICKY]);
  return null;
}

/** `WxH`, plus the generator-only difficulty letter. An unknown letter leaves
 * the default tier. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

// --- state construction ----------------------------------------------------

export function makeState(w: number, h: number, nums: Int8Array): SinglesState {
  return {
    w,
    h,
    n: w * h,
    o: Math.max(w, h),
    impossible: false,
    nums,
    flags: new Uint8Array(w * h),
  };
}

/** `nums` is immutable, so the clone shares it. */
export function cloneState(s: SinglesState): SinglesState {
  return { ...s, flags: s.flags.slice() };
}

// --- desc codec ------------------------------------------------------------

/** One number per cell in reading order, each one desc-alphabet character. */
function parseDesc(p: SinglesParams, desc: string): DescParse<Int8Array> {
  const n = p.w * p.h;
  const o = Math.max(p.w, p.h);
  return readDesc(desc, (r) => {
    const nums = new Int8Array(n);
    for (let i = 0; i < n; i++) {
      const num = c2n(r.char((c) => c2n(c) !== null)) ?? 0;
      if (num < 1 || num > o) r.fail(DESC_OUT_OF_RANGE);
      nums[i] = num;
    }
    r.end();
    return nums;
  });
}

export function newState(p: SinglesParams, desc: string): SinglesState {
  return makeState(p.w, p.h, descValue(parseDesc(p, desc)));
}

export function encodeDesc(s: SinglesState): string {
  let out = "";
  for (let i = 0; i < s.n; i++) out += n2c(s.nums[i]);
  return out;
}

// --- text format (upstream game_text_format) -------------------------------

export function textFormat(s: SinglesState): string {
  let out = "";
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      if (x > 0) out += " ";
      out += s.flags[i] & F_BLACK ? "*" : n2c(s.nums[i]);
    }
    out += "\n";
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      if (x > 0) out += " ";
      out += s.flags[i] & F_CIRCLE ? "~" : " ";
    }
    out += "\n";
  }
  return out;
}
