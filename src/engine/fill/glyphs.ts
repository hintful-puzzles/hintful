/**
 * How a board of numbers' values are drawn, typed, said and written in its
 * game ID: as numerals, or as letters from A or in an alphabet's order
 * (`play.numbers.letters`), or by its ruleset (a choice's `letters`, Salad's
 * Letters, Group's two alphabets); and the empty square,
 * where the answer has one (`play.numbers.empty`), as an X.
 */

import { digitKeyCode } from "../input/key-labels.ts";
import { digitOf, stripModifiers } from "../input/pointer.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import type { FillModule } from "./board.ts";
import type { FillDeal } from "./game-id.ts";
import { sizeChoices } from "./params/settings.ts";

/** How a board of numbers' values are drawn, said and typed. */
export interface ValueGlyphs {
  /** The glyph value `v` is drawn and said as. */
  readonly draw: (v: number) => string;
  /** The key that types value `v`. */
  readonly keyCode: (v: number) => number;
  /** The value key `button` types, 0 for one that clears, or `null`. */
  readonly typed: (button: number) => number | null;
  /** The last value with a glyph, within a cell's domain mask. */
  readonly top: number;
  /** What a hint calls a value so drawn, where the description's `words`
   * does not say. */
  readonly noun: string;
}

/** The glyph value `v` is drawn and typed as: a digit, and past nine a
 * letter, as the keypad's keys are labeled. No key draws a value past `z`'s:
 * one is a count or a clue, said `{numeral …}` in a hint. */
const numeral = (v: number): string => {
  if (!Number.isInteger(v) || v < 1 || v > 35)
    throw new Error(`no key draws the value ${v}: say a count as {numeral …}`);
  return String.fromCharCode(digitKeyCode(v));
};

const NUMERALS: ValueGlyphs = {
  draw: numeral,
  keyCode: digitKeyCode,
  typed: digitOf,
  top: 31,
  noun: "number",
};

const A = "A".charCodeAt(0);
const a = "a".charCodeAt(0);

/** The alphabet `letters: true` draws: capitals from A, in order. */
const FROM_A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** The glyphs of an alphabet: value `v` drawn and said as the `v`-th letter
 * of `alphabet`, and typed by that letter in either case, or by a digit as
 * the letter at its place from A (ABCD's keys, upstream's too; Group's `e`
 * typed by 5). */
function lettersOf(alphabet: string): ValueGlyphs {
  const upper = alphabet.toUpperCase();
  const letter = (v: number): string => {
    if (!Number.isInteger(v) || v < 1 || v > alphabet.length)
      throw new Error(`no letter draws the value ${v}: say a count as {numeral …}`);
    return alphabet[v - 1];
  };
  /** The value the letter key `code`, of either case, types. */
  const ofLetter = (code: number): number | null => {
    const at = upper.indexOf(String.fromCharCode(code).toUpperCase());
    return at < 0 ? null : at + 1;
  };
  return {
    draw: letter,
    keyCode: (v) => letter(v).charCodeAt(0),
    typed: (button) => {
      const base = stripModifiers(button);
      if ((base >= A && base < A + 26) || (base >= a && base < a + 26))
        return ofLetter(base);
      const d = digitOf(button);
      return d === null || d === 0 ? d : ofLetter(A + d - 1);
    },
    top: alphabet.length,
    noun: "letter",
  };
}

/** Letters from A, typed by either case, or by a value's place as a digit. */
const LETTERS = lettersOf(FROM_A);

/** Numerals typed as letters are too: a board whose game draws letters
 * under another ruleset keeps its keys under this one (Salad's Numbers, A
 * typing 1). */
const NUMERALS_LETTER_KEYS: ValueGlyphs = { ...NUMERALS, typed: LETTERS.typed };

/** The glyphs `letters` draws: capitals from A where it is `true`, else its
 * alphabet's letters in order. */
const alphabetOf = (letters: true | string): ValueGlyphs =>
  letters === true ? LETTERS : lettersOf(letters);

/** The letters a board of the sizes `sizes` draws by its ruleset (a
 * choice's `letters`), `false` where its ruleset draws numerals; `null`
 * where no ruleset says. */
function rulesetLetters(
  deal: FillDeal,
  sizes: Readonly<Record<string, unknown>>,
): ValueGlyphs | false | null {
  for (const s of sizeChoices(deal)) {
    if (!s.choices.some((c) => c.letters !== undefined)) continue;
    const at = sizes[s.id];
    const chosen =
      s.choices[(typeof at === "number" ? at : s.from + s.default) - s.from];
    return chosen?.letters === undefined ? false : alphabetOf(chosen.letters);
  }
  return null;
}

/** The glyphs a board of `module` draws its values by, `sizes` the sizes its
 * params give (a board's clues hold them): letters where its `play` says
 * so or its ruleset does, else numerals, typed as letters where another
 * ruleset draws them. */
export function glyphsOf(
  module: Pick<FillModule<unknown>, "play" | "deal">,
  sizes: Readonly<Record<string, unknown>> = {},
): ValueGlyphs {
  const letters = module.play?.numbers?.letters;
  if (letters !== undefined) return alphabetOf(letters);
  const by = module.deal === undefined ? null : rulesetLetters(module.deal, sizes);
  if (by === null) return NUMERALS;
  return by === false ? NUMERALS_LETTER_KEYS : by;
}

/** On a board whose answer repeats a value in a unit as its empty square
 * (`play.numbers.empty`), that value, on the space `sp` dealt `dealt` (or
 * the params' sizes, which give it); `null` on any other board. */
export function emptyOf<C>(
  module: FillModule<C>,
  sp: GridSpace,
  dealt: C,
): number | null {
  if (module.play?.numbers?.empty === undefined || module.repeatOf === undefined)
    return null;
  return module.repeatOf(sp, dealt).value;
}

/** The empty square's glyph and key (upstream Salad's). */
const EMPTY_GLYPH = "X";

/** The ball's key and the letter a ball's square is written as, where the
 * empty square has one (`play.numbers.empty.ball`; upstream Salad's). */
export const BALL_GLYPH = "O";

/** The glyphs a board of `module` on the space `sp` dealt `dealt` draws,
 * says and writes its values by, its empty square as {@link EMPTY_GLYPH}
 * where it has one. */
export function boardGlyphs<C>(
  module: FillModule<C>,
  sp: GridSpace,
  dealt: C,
): ValueGlyphs {
  const glyphs = glyphsOf(module, dealt as Readonly<Record<string, unknown>>);
  const empty = emptyOf(module, sp, dealt);
  if (empty === null) return glyphs;
  return {
    ...glyphs,
    draw: (v) => (v === empty ? EMPTY_GLYPH : glyphs.draw(v)),
    keyCode: (v) => (v === empty ? EMPTY_GLYPH.charCodeAt(0) : glyphs.keyCode(v)),
  };
}
