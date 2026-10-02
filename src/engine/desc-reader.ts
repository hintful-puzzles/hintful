/**
 * **A cursor over a game ID's description**, whose every failure is a
 * {@link DescError}.
 *
 * A parser reading a desc keeps making one decision: a separator or a number
 * that is not there is missing either because the desc *ended*, which is
 * {@link DESC_TOO_SHORT}, or because something else is in its place, which is
 * that character. When `read-descs-through-one-cursor` read every parser, about
 * forty-five sites in two dozen games made it by hand and some twenty-five
 * more made it wrong; {@link DescReader.expect}, {@link DescReader.char} and {@link DescReader.int}
 * make it once.
 *
 * The second job is that a game reads its desc **once**. {@link readDesc} runs
 * one parser and returns a {@link DescParse}, which `newState` takes the value
 * of with `descValue`; the engine's verdict on the desc is that same parse
 * (`loadDesc`). Two loops, a validator's and a parser's, once disagreed in
 * silence, because a typed array swallows a stray write: validators accepted
 * what their parsers skipped in about half the collection.
 *
 * WHAT DOES NOT LIVE HERE is any game's grammar: what a letter means, how runs
 * chunk, which characters a value may be. Those are the puzzle's and its frozen
 * bytes' (`run-length.ts`'s header says why a shared letter alphabet fails).
 * The cursor only reads what the caller asks for and says why it could not.
 *
 * Failures unwind by throwing a private value that {@link readDesc} catches,
 * so a game sees only the {@link DescParse} it returns.
 * Calling a reading method outside {@link readDesc} is a bug and throws.
 */
import { isDigit, parseLeadingInt } from "./decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescError,
  type DescParse,
  descBadCharacter,
} from "./desc-error.ts";

/** What {@link DescReader.fail} throws and {@link readDesc} catches. */
class DescFailure {
  constructor(readonly error: DescError) {}
}

export class DescReader {
  #pos = 0;

  constructor(readonly desc: string) {}

  /** The index of the next character to read. */
  get pos(): number {
    return this.#pos;
  }

  /** Whether every character has been read. */
  get done(): boolean {
    return this.#pos >= this.desc.length;
  }

  /** The next character, unread, or `null` at the end. */
  peek(): string | null {
    return this.done ? null : this.desc[this.#pos];
  }

  /** Whether there is a next character and `ok` holds of it. */
  peekIs(ok: (c: string) => boolean): boolean {
    return !this.done && ok(this.desc[this.#pos]);
  }

  /** Read `s` if it comes next, and say whether it did. */
  accept(s: string): boolean {
    if (!this.desc.startsWith(s, this.#pos)) return false;
    this.#pos += s.length;
    return true;
  }

  /** Read `s`, which must come next. */
  expect(s: string): void {
    for (const c of s) this.char((d) => d === c);
  }

  /** Read one character, which must satisfy `ok` when it is given. */
  char(ok?: (c: string) => boolean): string {
    const c = this.#next();
    if (ok && !ok(c)) this.fail(descBadCharacter(c));
    this.#pos++;
    return c;
  }

  /**
   * Read a decimal number, which must lie in `[lo, hi]`.
   *
   * The bound is required because a desc is a player's text: an unbounded
   * number reaches a typed array and wraps, and two games read a different
   * board from the one their validator accepted that way. Leading zeros are
   * read, as every game's hand loop read them.
   */
  int(lo: number, hi: number): number {
    const c = this.#next();
    if (!isDigit(c)) this.fail(descBadCharacter(c));
    const { value, next } = parseLeadingInt(this.desc, this.#pos);
    this.#pos = next;
    if (value < lo || value > hi) this.fail(DESC_OUT_OF_RANGE);
    return value;
  }

  /** Read everything left, which may be nothing. */
  rest(): string {
    const s = this.desc.slice(this.#pos);
    this.#pos = this.desc.length;
    return s;
  }

  /** The desc must have been read to its end. */
  end(): void {
    if (!this.done) this.fail(DESC_TOO_LONG);
  }

  /** Give up with `error`. */
  fail(error: DescError): never {
    throw new DescFailure(error);
  }

  /** The next character, failing as {@link DESC_TOO_SHORT} at the end. */
  #next(): string {
    if (this.done) this.fail(DESC_TOO_SHORT);
    return this.desc[this.#pos];
  }
}

/**
 * Parse `desc` with `read`, turning any failure the cursor or `read` raised
 * into the parse's error. `read` must read to the end itself (`r.end()`), since
 * some grammars legitimately stop early.
 */
export function readDesc<T>(desc: string, read: (r: DescReader) => T): DescParse<T> {
  try {
    return { ok: true, value: read(new DescReader(desc)) };
  } catch (e) {
    if (e instanceof DescFailure) return { ok: false, error: e.error };
    throw e;
  }
}
