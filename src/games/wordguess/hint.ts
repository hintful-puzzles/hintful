/**
 * Wordguess's hint: what to guess next, a probe and not a deduction. The plan
 * is one step, a word chosen to leave the fewest words whatever it scores, and
 * its sentence claims only what was counted (`docs/hints-search.md` § "A
 * hidden answer: marks for what is proved, a count for the guess"). The words
 * it counts are the dictionary's ({@link dictionaryWords}).
 *
 * Nothing here reads `state.answer`. The hint knows what the player knows.
 */

import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
} from "../../engine/contract/game.ts";
import { GAME_OVER } from "../../engine/contract/hint-refusal.ts";
import type { Relation, Sentence } from "../../engine/contract/hint-words.ts";
import { answerWords, guessWords } from "../../engine/generate/word-list/index.ts";
import { claimRelation, judgeRivals } from "../../engine/rival-judging.ts";
import * as wordguess from "../../generated/games/wordguess/wordguess.compiled.ts";
import { SQUARE } from "./hint-marks.ts";
import {
  IN_PLACE,
  NLETTERS,
  outcome,
  refusal,
  type ScoredRow,
  valuesOf,
  type WordguessMove,
  type WordguessState,
} from "./state.ts";

/** Which guess a step suggests: the step of `wordguess.description.yaml`
 * that says it, with its terms. */
type Reason =
  | { kind: "onlyAnswer"; word: string; common: boolean }
  | { kind: "opening"; word: string; fitting: number; worst: number }
  | {
      kind: "probe" | "split";
      word: string;
      common: boolean;
      fitting: number;
      worst: number;
    };

/** What a step rests on: its {@link Reason}'s kind. */
export const WORDGUESS_RUNGS = ["onlyAnswer", "opening", "probe", "split"] as const;
export type WordguessRung = (typeof WORDGUESS_RUNGS)[number];

/** What a step points at: the working row's squares the guess goes in,
 * ringed. */
export interface WordguessHighlights {
  squares: number[];
}

const speak = wordguess.voice<number>({ kind: SQUARE, value: (n) => String(n) });

/** A step's sentence. Only the one word that fits is argued, as the judging
 * that found every rival lost allows (`judged`); a probe counts. */
function say(r: Reason, ring: number[], judged: Relation | null): Sentence {
  switch (r.kind) {
    case "onlyAnswer":
      if (judged === null)
        throw new Error("wordguess: an onlyAnswer step with no judging");
      return speak.sentence(r.kind, {
        ring,
        terms: { word: r.word, common: r.common },
        relation: judged,
      });
    case "opening":
      return speak.sentence(r.kind, {
        ring,
        terms: { word: r.word, fitting: r.fitting, worst: r.worst },
      });
    case "probe":
    case "split":
      return speak.sentence(r.kind, {
        ring,
        terms: { word: r.word, common: r.common, fitting: r.fitting, worst: r.worst },
      });
  }
}

// --- the probe -----------------------------------------------------------

/** A list's words of one length, a letter a byte, word after word. */
interface Words {
  readonly words: readonly string[];
  readonly letters: Uint8Array;
}

const encoded = new Map<readonly string[], Words>();
function encode(words: readonly string[]): Words {
  let out = encoded.get(words);
  if (out === undefined) {
    out = { words, letters: Uint8Array.from(words.flatMap(valuesOf)) };
    encoded.set(words, out);
  }
  return out;
}

/**
 * The score of the guess at `G[go..]` against the answer at `A[ao..]`, as one
 * number: each slot's mark a base-3 digit, by `state.ts`'s `score`. Written
 * against a scratch array rather than calling `score`: choosing a guess scores
 * millions of pairs, and an allocation a pair is most of the cost.
 */
function scoreKey(
  G: Uint8Array,
  go: number,
  A: Uint8Array,
  ao: number,
  len: number,
  spare: Int32Array,
): number {
  spare.fill(0);
  let key = 0;
  let digit = 1;
  for (let i = 0; i < len; i++, digit *= 3) {
    if (G[go + i] === A[ao + i]) key += IN_PLACE * digit;
    else spare[A[ao + i]]++;
  }
  digit = 1;
  for (let i = 0; i < len; i++, digit *= 3) {
    const v = G[go + i];
    if (v === A[ao + i] || spare[v] === 0) continue;
    key += digit;
    spare[v]--;
  }
  return key;
}

/** A row's own score as {@link scoreKey} writes it. */
const keyOf = (marks: readonly number[]): number =>
  marks.reduce((k, m, i) => k + m * 3 ** i, 0);

/** The key of a guess's every slot in place: a win. */
const winKey = (len: number): number => 3 ** len - 1;

/** What guess `g` does to the words `among` still fitting. */
interface Split {
  /** Index into `words`. */
  guess: number;
  /** The most it can leave, over every score but a win. */
  worst: number;
  /** The sum of the squares of what each score leaves: how many it leaves on
   * average, times the count. */
  squares: number;
  /** Whether it is one of `among`, so could win. */
  fits: boolean;
}

function split(
  guesses: Words,
  g: number,
  answers: Words,
  among: readonly number[],
  len: number,
  parts: Int32Array,
  spare: Int32Array,
): Split {
  const G = guesses.letters;
  const A = answers.letters;
  const win = winKey(len);
  let worst = 0;
  let squares = 0;
  let fits = false;
  for (const a of among) {
    const key = scoreKey(G, g * len, A, a * len, len, spare);
    const n = ++parts[key];
    squares += 2 * n - 1;
    if (key === win) fits = true;
    else if (n > worst) worst = n;
  }
  for (const a of among) parts[scoreKey(G, g * len, A, a * len, len, spare)] = 0;
  return { guess: g, worst, squares, fits };
}

/** Whether `a` is the better guess: it leaves fewer at worst; or as few, and
 * could win where `b` cannot; or leaves fewer on average. */
const better = (a: Split, b: Split): boolean =>
  a.worst !== b.worst
    ? a.worst < b.worst
    : a.fits !== b.fits
      ? a.fits
      : a.squares < b.squares;

/** Past this many pairs to score, the guess is chosen among the words that
 * fit rather than the whole list, and past {@link FIRST_PAST} words fitting it
 * is the first of them. The opening is the dearest, every common word against
 * every other, and is below both. */
const PAIRS = 8_000_000;
const FIRST_PAST = 3_000;

/** The words of `guesses` among `pool`, as each splits the words of
 * `answers` among `among`, best first ({@link better}), in the list's order
 * among equals. */
function ranked(
  guesses: Words,
  pool: readonly number[],
  answers: Words,
  among: readonly number[],
  len: number,
): Split[] {
  const parts = new Int32Array(3 ** len);
  const spare = new Int32Array(NLETTERS + 1);
  const fitting = (): number[] => among.map((a) => indexIn(guesses, answers.words[a]));
  const tried =
    among.length > FIRST_PAST
      ? fitting().slice(0, 1)
      : pool.length * among.length > PAIRS
        ? fitting()
        : pool;
  const out = tried.map((g) => split(guesses, g, answers, among, len, parts, spare));
  if (out.length === 0) throw new Error("wordguess hint: no word to guess");
  return out.sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0));
}

// --- looking ahead -------------------------------------------------------

/** Words still fitting at most this many, the guess is one that finds every
 * one of them in the guesses left, where a short search shows one does. The
 * best split alone, followed to the end of every four-letter answer, took
 * seven guesses for six of them (GILL among them). */
const SEARCH_AMONG = 300;
/** The guesses the search tries at each step: the best splits of the words
 * fitting when the hint is asked, and the words still fitting there. */
const SEARCH_GUESSES = 40;
/** The guesses it tries at each later step. */
const SEARCH_BELOW = 15;
/** At most this many words, each that fits is tried as well. */
const SEARCH_FEW = 30;
/** Words the search may score a guess against before it gives up and the
 * best split stands. */
const SEARCH_BUDGET = 4_000_000;

interface Search {
  guesses: Words;
  answers: Words;
  len: number;
  /** Indices into `guesses` the board accepts now. */
  pool: readonly number[];
  hard: boolean;
  /** Each answer's index among `guesses`. */
  asGuess: (a: number) => number;
  memo: Map<string, boolean>;
  left: number;
}

/** The words of `among` split by what guess `g` would score against each,
 * the win aside. */
function parts(s: Search, g: number, among: readonly number[]): number[][] {
  s.left -= among.length;
  const spare = new Int32Array(NLETTERS + 1);
  const win = winKey(s.len);
  const by = new Map<number, number[]>();
  for (const a of among) {
    const key = scoreKey(
      s.guesses.letters,
      g * s.len,
      s.answers.letters,
      a * s.len,
      s.len,
      spare,
    );
    if (key === win) continue;
    const part = by.get(key);
    if (part) part.push(a);
    else by.set(key, [a]);
  }
  // The largest first, where a guess most often fails.
  return [...by.values()].sort((a, b) => b.length - a.length);
}

/** Whether every word of `among` guess `g` is not is findable in `limit - 1`
 * more guesses. */
function finishes(
  s: Search,
  g: number,
  among: readonly number[],
  limit: number,
): boolean {
  const split = parts(s, g, among);
  // With one guess left, every word must stand alone.
  if (limit === 2 && split[0] !== undefined && split[0].length > 1) return false;
  return split.every((part) => findable(s, part, limit - 1));
}

/** The guesses tried on `among`, best split first ({@link ranked}): the first
 * {@link SEARCH_GUESSES} at the top, {@link SEARCH_BELOW} below it, and among
 * a few words every one that fits. A function of `among`
 * and the pool alone, so the hint asked again after this guess tries the same
 * ones on what it leaves, and finds what this search found. In hard mode the
 * later guesses are the words of `among`, which hard mode always accepts. */
function candidates(s: Search, among: readonly number[], top: boolean): Split[] {
  const pool = top || !s.hard ? s.pool : among.map(s.asGuess);
  s.left -= pool.length * among.length;
  const width = top ? SEARCH_GUESSES : SEARCH_BELOW;
  // Among a few words, any that fits is worth a try: it may win outright.
  const fitting = among.length <= SEARCH_FEW;
  return ranked(s.guesses, pool, s.answers, among, s.len).filter(
    (c, i) => i < width || (fitting && c.fits),
  );
}

/** The first of {@link candidates} that finds every word of `among` within
 * `limit` guesses, this one included; `null` where none does, or the budget
 * ran out first. */
function pick(
  s: Search,
  among: readonly number[],
  limit: number,
  top = false,
): Split | null {
  for (const c of candidates(s, among, top)) {
    if (s.left <= 0) return null;
    if (finishes(s, c.guess, among, limit)) return c;
  }
  return null;
}

function findable(s: Search, among: readonly number[], limit: number): boolean {
  // Guessing the words in turn finds each within as many guesses as words.
  if (among.length <= limit) return true;
  if (limit <= 1) return false;
  const key = `${limit}:${among.join(",")}`;
  const known = s.memo.get(key);
  if (known !== undefined) return known;
  const ok = pick(s, among, limit) !== null;
  s.memo.set(key, ok);
  return ok;
}

/**
 * The best split of `among` ({@link ranked}) by a word of `pool` that finds
 * every word of it in `limit` guesses, this one included; `null` where the
 * search finds none.
 */
function choose(
  guesses: Words,
  pool: readonly number[],
  answers: Words,
  among: readonly number[],
  len: number,
  limit: number,
  hard: boolean,
): Split | null {
  const s: Search = {
    guesses,
    answers,
    len,
    pool,
    hard,
    asGuess: guesses === answers ? (a) => a : (a) => indexIn(guesses, answers.words[a]),
    memo: new Map(),
    left: SEARCH_BUDGET,
  };
  return pick(s, among, limit, true);
}

/** Where `word` is in `words`, which hold it. */
function indexIn(words: Words, word: string): number {
  let lo = 0;
  let hi = words.words.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (words.words[mid] < word) lo = mid + 1;
    else hi = mid;
  }
  if (words.words[lo] !== word) throw new Error(`wordguess hint: ${word} is no guess`);
  return lo;
}

/** The first guess at each length, chosen once: with nothing scored, every
 * common word fits, and the choice is the same in every game. */
const openings = new Map<number, Split>();

interface Probe {
  word: string;
  /** Whether the words counted are the common ones, which a game deals. */
  common: boolean;
  fitting: number;
  worst: number;
  /** Whether it is one of the words that fit, so could win. */
  fits: boolean;
  opening: boolean;
}

/** The indices of `words` that would have scored every row as it scored. */
function fittingIn(words: Words, rows: readonly ScoredRow[], len: number): number[] {
  const spare = new Int32Array(NLETTERS + 1);
  const guessed = Uint8Array.from(rows.flatMap((r) => r.letters));
  const keys = rows.map((r) => keyOf(r.marks));
  const out: number[] = [];
  for (let w = 0; w < words.words.length; w++) {
    const fits = keys.every(
      (key, k) =>
        scoreKey(guessed, k * len, words.letters, w * len, len, spare) === key,
    );
    if (fits) out.push(w);
  }
  return out;
}

/**
 * The guess to try next: the common word, of those the board accepts, that
 * leaves the fewest of the words still fitting whatever it scores
 * ({@link better}). A word that does not fit can split them better than any
 * that does: following only words that fit took up to twelve guesses over
 * every three-letter answer, among clusters such as BOW, COW, HOW and LOW. The
 * words counted are the common ones, and every word of the list once no common
 * word fits (a game ID may hide any word), chosen then among those that fit.
 *
 * A pure function of the scored rows, so a plan recomputed after a mark names
 * the same guess (`hint-resume.test.ts`).
 */
function chooseProbe(state: WordguessState): Probe | null {
  const { len, nguesses, hard } = state.params;
  const { rows } = state;
  const limit = nguesses - rows.length;
  const answers = encode(answerWords(len));
  const toProbe = (
    words: Words,
    s: Split,
    common: boolean,
    fitting: number,
  ): Probe => ({
    word: words.words[s.guess],
    common,
    fitting,
    worst: s.worst,
    fits: s.fits,
    opening: rows.length === 0,
  });
  if (rows.length === 0) {
    let s = openings.get(len);
    if (s === undefined) {
      const all = answers.words.map((_, i) => i);
      // Every word fits, past what the search reads, so the guesses left do
      // not bear on the choice. The opening leaves the fewest words on
      // average, not at worst: the look-ahead takes the worst cases from the
      // second guess on, and on four letters the best worst case (AEON) left
      // an _A_E cluster no common word could finish in the rows.
      s = ranked(answers, all, answers, all, len).reduce((a, c) =>
        c.squares < a.squares ? c : a,
      );
      openings.set(len, s);
    }
    return toProbe(answers, s, true, answers.words.length);
  }
  const among = fittingIn(answers, rows, len);
  if (among.length > 0) {
    // Hard mode refuses a word that drops a letter the scores revealed.
    const allowed = (words: Words): number[] =>
      words.words.flatMap((w, i) => (refusal(state, valuesOf(w)) === null ? [i] : []));
    const pool = allowed(answers);
    const best = (): Probe =>
      toProbe(
        answers,
        ranked(answers, pool, answers, among, len)[0],
        true,
        among.length,
      );
    if (among.length > SEARCH_AMONG) return best();
    const common = choose(answers, pool, answers, among, len, limit, hard);
    if (common !== null) return toProbe(answers, common, true, among.length);
    // Where no common word is sure to find the answer in time, a word of the
    // whole list may be; not one with no vowel, which is an abbreviation
    // (BLDG) or a sound (TSK) a player would not take for a word.
    const guesses = encode(guessWords(len));
    const spoken = allowed(guesses).filter((i) => /[aeiouy]/.test(guesses.words[i]));
    const any = choose(guesses, spoken, answers, among, len, limit, hard);
    return any !== null ? toProbe(guesses, any, true, among.length) : best();
  }
  const guesses = encode(guessWords(len));
  const rare = fittingIn(guesses, rows, len);
  if (rare.length === 0) return null;
  const s =
    (rare.length > SEARCH_AMONG
      ? null
      : choose(guesses, rare, guesses, rare, len, limit, true)) ??
    ranked(guesses, rare, guesses, rare, len)[0];
  return toProbe(guesses, s, false, rare.length);
}

// --- the dictionary ------------------------------------------------------

/**
 * The words the hint counts, in alphabetical order: the common words that
 * would have scored every row as it scored, or every word of the list that
 * would once no common word does (`common` false). What the dictionary
 * lists, so the panel and the hint's count agree.
 */
export function dictionaryWords(state: WordguessState): {
  words: string[];
  common: boolean;
} {
  const { len } = state.params;
  const answers = encode(answerWords(len));
  const common = fittingIn(answers, state.rows, len).map((i) => answers.words[i]);
  if (common.length > 0) return { words: common, common: true };
  const guesses = encode(guessWords(len));
  return {
    words: fittingIn(guesses, state.rows, len).map((i) => guesses.words[i]),
    common: false,
  };
}

// --- the plan ------------------------------------------------------------

export function wordguessHint(
  state: WordguessState,
): HintResult<WordguessMove, WordguessHighlights, WordguessRung> {
  // Out of guesses, or the answer shown by Solve: the status is lost.
  if (outcome(state) !== 0) return { ok: false, error: GAME_OVER };
  // The answer is a word of the list (`state.ts`'s desc parser refuses any
  // other) and fits every score, so some word always does.
  const probe = chooseProbe(state);
  if (!probe) throw new Error("wordguess hint: no word fits the scores");
  const letters = valuesOf(probe.word);
  const squares = letters.map((_, pos) => pos);
  const reason = probeReason(probe);
  // When one word fits, every other word of its list was found to misfit a
  // score: each is a rival guess, and lost.
  const judged =
    reason.kind === "onlyAnswer"
      ? claimRelation(judgeRivals(["every other word"], 0, () => "lost").claim)
      : null;
  const words = say(reason, squares, judged);
  const step: HintStep<WordguessMove, WordguessHighlights, WordguessRung> = {
    move: { type: "guess", letters },
    rung: reason.kind,
    explanation: words.text,
    words,
    highlights: { squares },
  };
  return { ok: true, steps: [step] };
}

function probeReason(probe: Probe): Reason {
  const { word, common, fitting, worst } = probe;
  if (fitting === 1) return { kind: "onlyAnswer", word: word.toUpperCase(), common };
  if (probe.opening)
    return { kind: "opening", word: word.toUpperCase(), fitting, worst };
  const kind = probe.fits ? "probe" : "split";
  return { kind, word: word.toUpperCase(), common, fitting, worst };
}

/** The guess the step asks for, sent whole, completes it; any other is off. */
export function wordguessHintKeepTrack(
  m: WordguessMove,
  step: HintStep<WordguessMove>,
): HintTrackVerdict {
  const want = step.move;
  return m.letters.every((v, i) => v === want.letters[i]) ? "completed" : "off";
}
