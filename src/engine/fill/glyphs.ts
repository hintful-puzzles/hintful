/**
 * How a board of numbers' values are drawn, typed, said and written in its
 * game ID: as numerals, or as letters from A or in an alphabet's order
 * (`play.numbers.letters`), or by its ruleset (a choice's `letters`, Salad's
 * Letters, Group's two alphabets); and the empty square,
 * where the answer has one (`play.numbers.empty`), as an X. A board whose
 * pieces all point is typed by their ways (`waysOf`).
 */

import { digitKeyCode } from "../input/key-labels.ts";
import { digitOf, stripModifiers } from "../input/pointer.ts";
import { PAINTERS, type PainterName } from "../render/pieces/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import type { FillModule } from "./board.ts";
import type { FillDeal } from "./game-id.ts";
import { sizeChoices } from "./params/settings.ts";

/** How a board of numbers' values are drawn, said and typed. */
export interface ValueGlyphs {
  /** The glyph value `v` is drawn and written as. */
  readonly draw: (v: number) => string;
  /** What a hint calls value `v`: its glyph, or its picture's name. */
  readonly say: (v: number) => string;
  /** Value `v`'s key's label on the keypad: its glyph, or its picture's
   * name, capitalized. */
  readonly label: (v: number) => string;
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
  say: numeral,
  label: numeral,
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
 * of `alphabet`, and typed by that letter in either case, or by a digit: as
 * the letter at its place from A where the alphabet is the first letters in
 * some order (ABCD's keys, upstream's too; Group's `e` typed by 5), else as
 * the alphabet's letter at its place (Undead's G, V and Z typed by 1 to 3,
 * upstream's). */
function lettersOf(alphabet: string): ValueGlyphs {
  const upper = alphabet.toUpperCase();
  const fromA = [...upper].every((ch) => ch.charCodeAt(0) - A < upper.length);
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
    say: letter,
    label: letter,
    keyCode: (v) => letter(v).charCodeAt(0),
    typed: (button) => {
      const base = stripModifiers(button);
      if ((base >= A && base < A + 26) || (base >= a && base < a + 26))
        return ofLetter(base);
      const d = digitOf(button);
      if (d === null || d === 0) return d;
      if (fromA) return ofLetter(A + d - 1);
      return d <= upper.length ? d : null;
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
 * ruleset draws them. Values drawn as pictures are said and labeled by their
 * names. */
export function glyphsOf(
  module: Pick<FillModule<unknown>, "play" | "deal">,
  sizes: Readonly<Record<string, unknown>> = {},
): ValueGlyphs {
  const glyphs = unnamedGlyphsOf(module, sizes);
  const names = module.play?.numbers?.pictures?.names;
  if (names === undefined) return glyphs;
  const name = (v: number): string => names[v] ?? glyphs.draw(v);
  const named: ValueGlyphs = {
    ...glyphs,
    say: name,
    label: (v) => {
      const n = name(v);
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
  };
  const ways = waysOf(module);
  if (ways === null) return named;
  // A board whose pieces point is typed by each way's number pad digit, its
  // key labeled by an arrow (upstream Rome's).
  const digitOfWay = (v: number): number => {
    const way = ways.get(v);
    if (way === undefined) throw new Error(`no way for the value ${v}`);
    return WAY_DIGITS[(way[1] + 1) * 3 + way[0] + 1];
  };
  const byDigit = new Map([...ways.keys()].map((v) => [digitOfWay(v), v]));
  return {
    ...named,
    label: (v) => WAY_ARROWS[digitOfWay(v)] ?? named.label(v),
    keyCode: (v) => digitKeyCode(digitOfWay(v)),
    typed: (button) => {
      const d = digitOf(button);
      if (d === null || d === 0) return d;
      return byDigit.get(d) ?? null;
    },
  };
}

/** The number pad digit of each way a step across the grid, read in rows
 * from up and left: 8 up, 4 left, 6 right, 2 down. */
const WAY_DIGITS = [7, 8, 9, 4, 5, 6, 1, 2, 3];
const WAY_ARROWS: Readonly<Record<number, string>> = {
  8: "↑",
  2: "↓",
  4: "←",
  6: "→",
};

/** On a board of numbers whose every piece the player places points
 * (`Painter.points`), the way each points, by value; `null` on any other
 * board. A value only the deal places (Rome's goal) is no player's. */
export function waysOf(
  module: Pick<FillModule<unknown>, "play">,
): ReadonlyMap<number, readonly [number, number]> | null {
  const paint = module.play?.numbers?.pictures?.paint;
  if (paint === undefined) return null;
  const given = module.play?.given ?? {};
  const ways = new Map<number, readonly [number, number]>();
  for (const [v, name] of Object.entries(paint)) {
    if (given[Number(v)] !== undefined) continue;
    const points = name in PAINTERS ? PAINTERS[name as PainterName].points : undefined;
    if (points === undefined) return null;
    ways.set(Number(v), points);
  }
  return ways.size === 0 ? null : ways;
}

function unnamedGlyphsOf(
  module: Pick<FillModule<unknown>, "play" | "deal">,
  sizes: Readonly<Record<string, unknown>>,
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
    say: (v) => (v === empty ? EMPTY_GLYPH : glyphs.say(v)),
    label: (v) => (v === empty ? EMPTY_GLYPH : glyphs.label(v)),
    keyCode: (v) => (v === empty ? EMPTY_GLYPH.charCodeAt(0) : glyphs.keyCode(v)),
  };
}
