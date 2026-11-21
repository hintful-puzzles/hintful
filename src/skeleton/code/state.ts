/**
 * Skeleton's state, params and types, its desc codec and its score.
 *
 * The answer is the desc: there is nothing to deal but a code, so there is no
 * generator and no solver. The working row lives in the `Ui`
 * (`code-rows.ts`); the state holds the scored rows, the answer row's
 * rule-outs and the hidden code.
 */

import {
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  type DescParse,
  descValue,
} from "../../engine/contract/desc-error.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/contract/game.ts";
import type { GameStatus } from "../../engine/contract/types.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { bin2hex, hex2bin, obfuscateBitmap } from "../../engine/game-id/obfuscate.ts";
import { numberItem } from "../../engine/game-id/params.ts";
import { num, paramsCodec, size } from "../../engine/game-id/params-codec.ts";
import {
  type RuleOut,
  type RuleOutMistake,
  ruleOutMistakes,
  type WorkingRow,
} from "../../engine/mechanics/code-rows.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";

// --- score ------------------------------------------------------------------

/** A digit the code does not have. */
export const ABSENT = 0;
/** A digit the code has, in another place. */
export const ELSEWHERE = 1;
/** A digit the code has in this place. */
export const IN_PLACE = 2;

/**
 * Score `guess` against `code`, a mark a slot. Neither repeats a digit, so a
 * digit is in place, elsewhere or absent with no copies to count.
 */
export function score(guess: readonly number[], code: readonly number[]): number[] {
  return guess.map((v, i) =>
    v === code[i] ? IN_PLACE : code.includes(v) ? ELSEWHERE : ABSENT,
  );
}

// --- types ------------------------------------------------------------------

export interface SkeletonParams {
  /** Digits in the code, and so in every guess. */
  len: number;
  /** The digits the code is drawn from, `1..nsymbols`. */
  nsymbols: number;
  /** Rows to find it in. */
  nguesses: number;
}

/** A submitted guess and its score, a slot each. */
export interface ScoredRow {
  readonly digits: readonly number[];
  readonly marks: readonly number[];
}

export interface SkeletonState {
  readonly params: SkeletonParams;
  /** The rows submitted so far, in order; a win's row is the last. */
  readonly rows: readonly ScoredRow[];
  /** The answer row's rule-outs, a bitmask a slot (`code-rows.ts`). */
  readonly ruledOut: Int32Array;
  /** The hidden code, a digit a slot. */
  readonly code: readonly number[];
}

/** Submit a guess, or set answer-row marks. JSON-safe, so the default move
 * codec serves. A mark move *sets* each mark rather than toggling it, so a
 * hint's step is idempotent. */
export type SkeletonMove =
  | { type: "guess"; digits: number[] }
  | { type: "mark"; marks: RuleOut[]; ruledOut: boolean };

export interface SkeletonUi extends WorkingRow {
  /** Notes mode: a digit rules itself out of the cursor's answer slot. */
  pencilMode: boolean;
  params: SkeletonParams;
  /** The full row was sent and refused; shown until the row is edited. */
  refused: boolean;
}

// --- params -----------------------------------------------------------------

const MIN_LEN = 3;
const MAX_LEN = 6;
/** A digit a key, `1` to `9`. */
const MAX_SYMBOLS = 9;
const MAX_GUESSES = 20;

export const paramConfig: ParamConfigItem<SkeletonParams>[] = [
  numberItem<SkeletonParams>("length", "Code length", "len", {
    doc: "How many digits the hidden code has, and so every guess.",
    bounds: { min: MIN_LEN, max: MAX_LEN, maxShown: true },
    label: { slot: "size", words: (p) => `${p.len} digits` },
  }),
  numberItem<SkeletonParams>("symbols", "Digits", "nsymbols", {
    doc: "How many digits the code is drawn from, starting at 1.",
    bounds: { min: MIN_LEN, max: MAX_SYMBOLS, maxShown: true },
    label: { slot: "tail", words: (p) => `1 to ${p.nsymbols}` },
  }),
  numberItem<SkeletonParams>("guesses", "Guesses", "nguesses", {
    doc: "How many guesses you have to find the code in.",
    bounds: { min: 1, max: MAX_GUESSES, maxShown: true },
    label: { slot: "tail", words: (p) => `${p.nguesses} guesses` },
  }),
];

const BOARDS: SkeletonParams[] = [
  { len: 3, nsymbols: 6, nguesses: 7 },
  { len: 4, nsymbols: 6, nguesses: 7 },
  { len: 4, nsymbols: 8, nguesses: 8 },
];

export function defaultParams(): SkeletonParams {
  return { ...BOARDS[1] };
}

export const menu: PresetBoards<SkeletonParams> = { boards: BOARDS };

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  size(paramConfig, "length"),
  num(paramConfig, "s", "symbols"),
  num(paramConfig, "g", "guesses"),
]);

export function validateParams(p: SkeletonParams, _full: boolean): string | null {
  if (p.len < MIN_LEN || p.len > MAX_LEN) {
    return `Codes must have from ${MIN_LEN} to ${MAX_LEN} digits.`;
  }
  if (p.nsymbols < p.len || p.nsymbols > MAX_SYMBOLS) {
    return `The digits must run from 1 to at least the code's length, and at most ${MAX_SYMBOLS}.`;
  }
  if (p.nguesses < 1 || p.nguesses > MAX_GUESSES) {
    return `Guesses must be from 1 to ${MAX_GUESSES}.`;
  }
  return null;
}

// --- desc -------------------------------------------------------------------

/** The code's digits, a byte each, obfuscated so a game ID does not spell its
 * answer. */
export function encodeDesc(code: readonly number[]): string {
  const bmp = Uint8Array.from(code);
  obfuscateBitmap(bmp, bmp.length * 8, false);
  return bin2hex(bmp);
}

/** A code of different digits, at random. */
export function newDesc(p: SkeletonParams, rs: RandomState): { desc: string } {
  const pool = Array.from({ length: p.nsymbols }, (_, i) => i + 1);
  const code: number[] = [];
  for (let i = 0; i < p.len; i++)
    code.push(...pool.splice(randomUpto(rs, pool.length), 1));
  return { desc: encodeDesc(code) };
}

const isHex = (c: string) => "0123456789abcdef".includes(c);

/** A code repeating a digit could never be guessed, since no guess may. */
function parseDesc(p: SkeletonParams, desc: string): DescParse<number[]> {
  return readDesc(desc, (r) => {
    let hex = "";
    for (let i = 0; i < p.len * 2; i++) hex += r.char(isHex);
    r.end();
    const bmp = hex2bin(hex, p.len);
    obfuscateBitmap(bmp, p.len * 8, true);
    const code = Array.from(bmp);
    if (code.some((v) => v < 1 || v > p.nsymbols)) r.fail(DESC_OUT_OF_RANGE);
    if (new Set(code).size < code.length) r.fail(DESC_REPEATED);
    return code;
  });
}

export function newState(p: SkeletonParams, desc: string): SkeletonState {
  return {
    params: p,
    rows: [],
    ruledOut: new Int32Array(p.len),
    code: descValue(parseDesc(p, desc)),
  };
}

// --- guesses ----------------------------------------------------------------

/**
 * Why `digits` may not be submitted, or `null` when it may: a slot empty, or a
 * digit used twice. The first reason found is the one given.
 */
export function refusal(s: SkeletonState, digits: readonly number[]): string | null {
  if (
    digits.length !== s.params.len ||
    digits.some((v) => v < 1 || v > s.params.nsymbols)
  ) {
    return "fill every square";
  }
  const twice = digits.find((v, i) => digits.indexOf(v) !== i);
  return twice === undefined ? null : `the ${twice} is used twice`;
}

// --- status -----------------------------------------------------------------

/** Whether the last row scored every digit in place. */
const won = (s: SkeletonState): boolean =>
  s.rows.at(-1)?.marks.every((m) => m === IN_PLACE) === true;

/** `+1` won, `-1` lost (out of rows, and the code shown), `0` playing. */
export function outcome(s: SkeletonState): number {
  if (won(s)) return 1;
  return s.rows.length >= s.params.nguesses ? -1 : 0;
}

export function status(s: SkeletonState): GameStatus {
  const o = outcome(s);
  return o > 0 ? "solved" : o < 0 ? "lost" : "ongoing";
}

export type SkeletonMistake = RuleOutMistake;

/** The answer slots that rule out their own digit. A guess is never one: it
 * is a question, and its score the answer. */
export function findMistakes(s: SkeletonState): readonly SkeletonMistake[] {
  return outcome(s) !== 0 ? [] : ruleOutMistakes(s.ruledOut, s.code);
}
