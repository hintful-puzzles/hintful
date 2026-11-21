/**
 * Wordguess's state, params and types, its desc codec and its score.
 *
 * A letter is a number, `a` = 1 to `z` = 26, so the working row is
 * `code-rows.ts`'s. The working row lives in the `Ui`; the state holds the
 * scored rows and the hidden answer.
 */

import {
  DESC_OUT_OF_RANGE,
  type DescParse,
  descValue,
  puzzleDescError,
} from "../../engine/contract/desc-error.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/contract/game.ts";
import type { GameStatus } from "../../engine/contract/types.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { modifierItem } from "../../engine/game-id/modifier.ts";
import { bin2hex, hex2bin, obfuscateBitmap } from "../../engine/game-id/obfuscate.ts";
import { numberItem } from "../../engine/game-id/params.ts";
import { flag, num, paramsCodec, size } from "../../engine/game-id/params-codec.ts";
import type { WorkingRow } from "../../engine/mechanics/code-rows.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { drawAnswer, isGuess, WORD_LENGTHS } from "../../engine/word-list/index.ts";

// --- letters ----------------------------------------------------------------

export const NLETTERS = 26;

/** `a` = 1 to `z` = 26. */
export const letterOf = (value: number): string => String.fromCharCode(96 + value);

/** The letters of a lowercase word as values. */
export const valuesOf = (word: string): number[] =>
  Array.from(word, (ch) => ch.charCodeAt(0) - 96);

export const wordOf = (values: readonly number[]): string =>
  values.map(letterOf).join("");

// --- score ------------------------------------------------------------------

/** A slot whose letter is nowhere the answer has one to spare. */
export const ABSENT = 0;
/** A slot whose letter the answer has, somewhere else. */
export const ELSEWHERE = 1;
/** A slot whose letter is the answer's there. */
export const IN_PLACE = 2;

/**
 * Score `guess` against `answer`, a mark a slot. Letters in place first; then,
 * left to right, a letter is marked elsewhere while the answer still has a copy
 * of it that is neither in place nor already claimed, so a guess repeating a
 * letter the answer has once is told so.
 */
export function score(guess: readonly number[], answer: readonly number[]): number[] {
  const marks: number[] = guess.map((v, i) => (v === answer[i] ? IN_PLACE : ABSENT));
  const spare = new Map<number, number>();
  answer.forEach((v, i) => {
    if (marks[i] !== IN_PLACE) spare.set(v, (spare.get(v) ?? 0) + 1);
  });
  guess.forEach((v, i) => {
    const left = spare.get(v) ?? 0;
    if (marks[i] === IN_PLACE || left === 0) return;
    marks[i] = ELSEWHERE;
    spare.set(v, left - 1);
  });
  return marks;
}

// --- types ------------------------------------------------------------------

export interface WordguessParams {
  /** Letters in the answer, and so in every guess. */
  len: number;
  /** Rows to find it in. */
  nguesses: number;
  /** Every guess keeps what the scores so far revealed. */
  hard: boolean;
}

/** A submitted guess and its score, a slot each. */
export interface ScoredRow {
  readonly letters: readonly number[];
  readonly marks: readonly number[];
}

export interface WordguessState {
  readonly params: WordguessParams;
  /** The rows submitted so far, in order; a win's row is the last. */
  readonly rows: readonly ScoredRow[];
  /** The hidden answer, a letter a slot. */
  readonly answer: readonly number[];
}

/** Submit a word. JSON-safe, so the default move codec serves. */
export type WordguessMove = { type: "guess"; letters: number[] };

export interface WordguessUi extends WorkingRow {
  params: WordguessParams;
  /** The full row was sent and refused; shown until the row is edited. */
  refused: boolean;
}

// --- params -----------------------------------------------------------------

const MIN_LEN = WORD_LENGTHS[0];
const MAX_LEN = WORD_LENGTHS[WORD_LENGTHS.length - 1];
const MAX_GUESSES = 20;

export const paramConfig: ParamConfigItem<WordguessParams>[] = [
  numberItem<WordguessParams>("letters", "Letters", "len", {
    doc: "How many letters the hidden word has, and so every guess.",
    bounds: { min: MIN_LEN, max: MAX_LEN, maxShown: true },
    label: { slot: "size", words: (p) => `${p.len} letters` },
  }),
  numberItem<WordguessParams>("guesses", "Guesses", "nguesses", {
    doc: "How many guesses you have to find the word in.",
    bounds: { min: 1, max: MAX_GUESSES, maxShown: true },
    label: { slot: "tail", words: (p) => `${p.nguesses} guesses` },
  }),
  modifierItem<WordguessParams>({
    kw: "hard",
    name: "Hard mode",
    type: "boolean",
    when: true,
    words: "hard",
    slot: "tail",
    rule: "every guess keeps what the scores have shown: a letter scored in place stays in its place, and a letter scored elsewhere is used again.",
    get: (p) => p.hard,
    set: (p, v) => {
      p.hard = v;
    },
  }),
];

const BOARDS: WordguessParams[] = [
  { len: 4, nguesses: 6, hard: false },
  { len: 5, nguesses: 6, hard: false },
  { len: 5, nguesses: 6, hard: true },
  { len: 6, nguesses: 6, hard: false },
];

export function defaultParams(): WordguessParams {
  return { ...BOARDS[1] };
}

export const menu: PresetBoards<WordguessParams> = { boards: BOARDS };

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  size(paramConfig, "letters"),
  num(paramConfig, "g", "guesses"),
  flag(paramConfig, "h", "hard"),
]);

export function validateParams(p: WordguessParams, _full: boolean): string | null {
  if (!WORD_LENGTHS.includes(p.len)) {
    return `Words must have from ${MIN_LEN} to ${MAX_LEN} letters.`;
  }
  if (p.nguesses < 1 || p.nguesses > MAX_GUESSES) {
    return `Guesses must be from 1 to ${MAX_GUESSES}.`;
  }
  return null;
}

// --- desc -------------------------------------------------------------------

/** The answer's letters, a byte each, obfuscated as Guess's colors are, so a
 * game ID does not spell its answer. */
export function encodeDesc(answer: readonly number[]): string {
  const bmp = Uint8Array.from(answer);
  obfuscateBitmap(bmp, bmp.length * 8, false);
  return bin2hex(bmp);
}

export function newDesc(p: WordguessParams, rs: RandomState): { desc: string } {
  return { desc: encodeDesc(valuesOf(drawAnswer(p.len, rs))) };
}

const isHex = (c: string) => "0123456789abcdef".includes(c);

const NOT_A_WORD = puzzleDescError(
  "This game ID's hidden word is not in the word list, so no guess could find it.",
);

/** Any accepted word may be the answer of a game ID, though only answers are
 * dealt: a word no guess may be could never be found. */
function parseDesc(p: WordguessParams, desc: string): DescParse<number[]> {
  return readDesc(desc, (r) => {
    let hex = "";
    for (let i = 0; i < p.len * 2; i++) hex += r.char(isHex);
    r.end();
    const bmp = hex2bin(hex, p.len);
    obfuscateBitmap(bmp, p.len * 8, true);
    const answer = Array.from(bmp);
    if (answer.some((v) => v < 1 || v > NLETTERS)) r.fail(DESC_OUT_OF_RANGE);
    if (!isGuess(wordOf(answer))) r.fail(NOT_A_WORD);
    return answer;
  });
}

export function newState(p: WordguessParams, desc: string): WordguessState {
  return {
    params: p,
    rows: [],
    answer: descValue(parseDesc(p, desc)),
  };
}

// --- guesses ----------------------------------------------------------------

/**
 * Why `letters` may not be submitted, or `null` when it may: a slot empty, no
 * word of the list, or, in hard mode, a letter an earlier score revealed left
 * out. The first reason found is the one given.
 */
export function refusal(s: WordguessState, letters: readonly number[]): string | null {
  if (letters.length !== s.params.len || letters.some((v) => v < 1 || v > NLETTERS)) {
    return "fill every letter";
  }
  if (!isGuess(wordOf(letters)))
    return `${wordOf(letters).toUpperCase()} is not in the word list`;
  if (s.params.hard) return hardModeRefusal(s.rows, letters);
  return null;
}

function hardModeRefusal(
  rows: readonly ScoredRow[],
  letters: readonly number[],
): string | null {
  for (const row of rows) {
    for (let i = 0; i < letters.length; i++) {
      if (row.marks[i] === IN_PLACE && letters[i] !== row.letters[i]) {
        return `hard mode keeps the ${letterOf(row.letters[i]).toUpperCase()} in place ${i + 1}`;
      }
    }
    const found = new Map<number, number>();
    row.letters.forEach((v, i) => {
      if (row.marks[i] !== ABSENT) found.set(v, (found.get(v) ?? 0) + 1);
    });
    for (const [v, n] of found) {
      if (letters.filter((x) => x === v).length < n) {
        return `hard mode uses the ${letterOf(v).toUpperCase()} again`;
      }
    }
  }
  return null;
}

// --- status -----------------------------------------------------------------

/** Whether the last row scored every letter in place. */
const won = (s: WordguessState): boolean =>
  s.rows.at(-1)?.marks.every((m) => m === IN_PLACE) === true;

/** `+1` won, `-1` lost (out of rows, and the answer shown), `0` playing. */
export function outcome(s: WordguessState): number {
  if (won(s)) return 1;
  return s.rows.length >= s.params.nguesses ? -1 : 0;
}

export function status(s: WordguessState): GameStatus {
  const o = outcome(s);
  return o > 0 ? "solved" : o < 0 ? "lost" : "ongoing";
}
