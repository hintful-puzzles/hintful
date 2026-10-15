/**
 * **A color's word for the player, in each scheme**: what a sentence says for
 * it. Most colors read as one word in both (a dark-scheme red is still red);
 * one whose dark value a player would call something else carries its own
 * dark word, as Map's yellow region does, which is brown on a dark board. The
 * words are given beside the values, in [`colors.ts`](./colors.ts).
 *
 * A word is not a string, so it cannot be spliced into one: a template literal
 * that tries throws. A sentence takes it as a part (`phrase`, `hint-words.ts`)
 * and is rendered once per scheme. A surface that shows one text whatever the
 * scheme, a help page or a control's description, takes {@link ColorWord.only},
 * which refuses a color with two words.
 */

/** The schemes a color is authored for. */
export type Scheme = "light" | "dark";

export class ColorWord {
  readonly light: string;
  readonly dark: string;

  constructor(light: string, dark: string = light) {
    this.light = light;
    this.dark = dark;
  }

  /** The word in `scheme`. */
  in(scheme: Scheme): string {
    return scheme === "dark" ? this.dark : this.light;
  }

  /** The one word, for a surface that does not follow the scheme. */
  get only(): string {
    if (this.light !== this.dark)
      throw new Error(
        `"${this.light}" is "${this.dark}" in the dark scheme: name it where the words follow the scheme`,
      );
    return this.light;
  }

  /** Both words, each changed by `f`: the capital that opens a sentence. */
  map(f: (word: string) => string): ColorWord {
    return new ColorWord(f(this.light), f(this.dark));
  }

  [Symbol.toPrimitive](): never {
    throw new Error(
      `"${this.light}" spliced into a string: put it in a phrase, or take .only`,
    );
  }
}
