/**
 * The grammar of a stated clause, shared by the compiler that checks a
 * description's clauses (`describe/compile.ts`) and the renderer that speaks
 * them (`stated.ts`). It imports nothing: the describe script runs it under
 * Node's type stripping.
 *
 * A clause is literal words and slots:
 *
 * - `{name}`: a word of the lexicon ({@link STATED_WORDS}), else a number term.
 * - `{role}`, `{role: words}`, `{role term}`, `{role term: words}`: a reference
 *   in a role ({@link SLOT_ROLES}) to the step's marks in that role, or to the
 *   elements a term holds.
 * - `{derived outline: words}`: a reference whose words claim something the board
 *   does not show (`derived` in `hint-words.ts`); any reference may be one.
 *   `{derived each outline: words}` claims it of each element apart, so each
 *   counts as a fact of its own (`derived`'s `"each"`).
 * - `{ring 1}`, `{ring then}`, `{ring 2+then: words}`: a reference to the squares
 *   the step places that value on (`1`, `2`, ...), or to those its placing
 *   techniques follow with (`then`), or both (`+`). {@link ringNames}
 * - `{has 2+then: , with {ring 2+then: its water}}`: words, references among
 *   them, said only where those squares are there.
 * - `{piece term}`: the word for the piece of the two-state pair the number
 *   term names, by its shape ("block", "disc"; `PAIR_NAMES`, `piece.ts`).
 * - `{spelled term}`: the number term in words, "zero" to "ten" (a count that
 *   would read as a coordinate in digits), the numeral past ten.
 * - `{numeral term}`: the number term as a plain count, in digits, where `{term}`
 *   would print it as the board draws a value (a letter, say).
 * - `{a term}`: the number term as the board draws it, with its indefinite
 *   article ("an A", "a D").
 * - `{count: one | several}`: the first form where the number term `count` is 1,
 *   the second otherwise; its forms hold what an `if`'s do.
 * - `{if flag: yes | no}`: the form the step's flag term holds, whole; its forms
 *   hold what a clause does, references included, except inside a reference's
 *   words, where they hold literal words, number terms and further `if`s.
 * - `{or flags: a | b | c}`: the forms whose bit the number term `flags` has set
 *   (the first form is bit 0), listed as alternatives: "a, b or c". Its forms
 *   hold literal words only, and it may stand inside a `fit`'s.
 * - `{fit: longest | shorter | shortest}`: the first form with which the whole
 *   sentence fits `NARRATION_LIMIT`, else the last; its forms hold literal words,
 *   number terms and `if`s, and every `fit` of a sentence takes the same turn
 *   (a slot with fewer forms takes its last).
 * - A reference's words are one form, or `one | several`; a slot inside them is
 *   a word, a number term, an `if`, or one of {@link STATED_INNER_WORDS}.
 */

/** The lexicon's words a clause may say anywhere: the noun for one square
 * and for several, the two shading states' names, and how a deduction's cells
 * share a unit with the one it decides (`alongside`, the game's units in words),
 * and the values a strike step removes (`struck`, each named once; `struckOr` as alternatives; `struckA` each with its indefinite article), and how
 * many parallel lines a step names (`tally`, in digits: a count is not a value
 * a game prints), and the kinds of region a value may not repeat in
 * (`regions`, "row and column" unless the game names more), and what a value
 * is called (`valueNoun`: "number", "letter"; a game's mode may decide it), and
 * the verb a square takes one by (`be`: "be", Rome's arrows "point"). */
export const STATED_WORDS: ReadonlySet<string> = new Set([
  "noun",
  "nouns",
  "valueNoun",
  "be",
  "alongside",
  "struck",
  "struckOr",
  "struckA",
  "tally",
  "regions",
  "shaded",
  "unshaded",
]);

/** The words only a reference's own words may say, about its elements: what
 * each shows, the unit stripes are taken as, and how many are still live
 * (`live`: a step followed in part narrows its reference, and the count
 * follows). */
export const STATED_INNER_WORDS: ReadonlySet<string> = new Set([
  "each",
  "unit",
  "live",
]);

/** The roles a slot may name: what the step decides, and the roles of
 * `says.marks`. */
const SLOT_ROLES: ReadonlySet<string> = new Set([
  "ring",
  "outline",
  "stripes",
  "strand",
  "if",
  "piece",
  "spelled",
  "numeral",
  "a",
  "has",
  "fit",
  "or",
]);

/** The words a reference takes when its slot gives none, by role. */
export const DEFAULT_FORMS: Readonly<Record<string, readonly string[]>> = {
  ring: ["this {noun}", "these {nouns}"],
  stripes: ["this {unit}"],
  outline: ["the outlined {noun}", "the outlined {nouns}"],
  strand: ["the outlined {noun}", "the outlined {nouns}"],
};

/** The squares a `ring` reference or a `has` slot is over, by name: `1`, `2`
 * and so on are the squares the step places that value on, `then` the squares
 * its placing techniques follow with, and `+` joins them (`2+then`); `null`
 * where the name is none of these. */
export function ringNames(name: string): readonly string[] | null {
  const names = name.split("+");
  return names.every((n) => n === "then" || /^[0-9]+$/.test(n)) ? names : null;
}

/** One piece of a clause: literal words, or a slot. */
export type Piece =
  | { readonly text: string }
  | {
      /** The word or term; with a role, the term a reference is over, or `""`
       * for the role's own marks. */
      readonly name: string;
      readonly role: string | null;
      /** A reference's forms: one, or one and several. */
      readonly words: readonly (readonly Piece[])[] | null;
      /** Set on a reference whose words claim what the board does not show:
       * one fact, or one of each element (`hint-words.ts`'s `Derived`). */
      readonly derived?: "fact" | "each";
    };

/** A clause, parsed. Throws on a malformed slot. */
export function parseClause(src: string): Piece[] {
  const out: Piece[] = [];
  let i = 0;
  let text = "";
  while (i < src.length) {
    const ch = src[i];
    if (ch === "}") throw new Error(`an unopened "}" in "${src}"`);
    if (ch !== "{") {
      text += ch;
      i++;
      continue;
    }
    let depth = 0;
    let j = i;
    for (; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}" && --depth === 0) break;
    }
    if (j === src.length) throw new Error(`an unclosed "{" in "${src}"`);
    if (text) out.push({ text });
    text = "";
    out.push(slot(src.slice(i + 1, j), src));
    i = j + 1;
  }
  if (text) out.push({ text });
  return out;
}

function slot(body: string, src: string): Piece {
  if (/^\s*derived\s/.test(body)) {
    const each = /^\s*derived\s+each\s/.test(body);
    const ref = slot(body.replace(/^\s*derived\s+(each\s+)?/, ""), src);
    if (
      !("name" in ref) ||
      ref.role === null ||
      !["ring", "outline", "stripes", "strand"].includes(ref.role)
    )
      throw new Error(`"{${body}}" is no derived reference, in "${src}"`);
    return { ...ref, derived: each ? "each" : "fact" };
  }
  const colon = body.indexOf(":");
  const head = (colon < 0 ? body : body.slice(0, colon)).trim().split(/ +/);
  const words =
    colon < 0
      ? null
      : splitForms(
          body.slice(colon + 1).trim(),
          head[0] === "fit" || head[0] === "or" ? Infinity : 2,
        ).map((f) => parseClause(f.trim()));
  if (
    (head[0] === "piece" ||
      head[0] === "spelled" ||
      head[0] === "numeral" ||
      head[0] === "a") &&
    (head.length !== 2 || words !== null)
  )
    throw new Error(`"{${body}}" is no word of a term, in "${src}"`);
  if (head[0] === "or") {
    if (
      head.length !== 2 ||
      words === null ||
      words.length < 2 ||
      words.some((f) => f.some((q) => "name" in q))
    )
      throw new Error(
        `"{${body}}" is no or of a term and two forms or more of literal words, in "${src}"`,
      );
    return { name: head[1], role: "or", words };
  }
  if (head[0] === "fit") {
    if (head.length !== 1 || words === null || words.length < 2)
      throw new Error(`"{${body}}" is no fit of two forms or more, in "${src}"`);
    return { name: "", role: "fit", words };
  }
  if (head.length === 1 && SLOT_ROLES.has(head[0]))
    return { name: "", role: head[0], words };
  if (head[0] === "has") {
    if (
      head.length !== 2 ||
      ringNames(head[1]) === null ||
      words === null ||
      words.length !== 1
    )
      throw new Error(`"{${body}}" is no has of squares and one form, in "${src}"`);
    return { name: head[1], role: "has", words };
  }
  if (head[0] === "if") {
    if (head.length !== 2 || words === null || words.length !== 2)
      throw new Error(`"{${body}}" is no if of a flag and two forms, in "${src}"`);
    return { name: head[1], role: "if", words };
  }
  if (head.length === 2 && SLOT_ROLES.has(head[0]))
    return { name: head[1], role: head[0], words };
  if (head.length === 1 && head[0] !== "" && words === null)
    return { name: head[0], role: null, words };
  if (head.length === 1 && head[0] !== "" && words !== null && words.length === 2)
    return { name: head[0], role: "count", words };
  throw new Error(`"{${body}}" is no slot, in "${src}"`);
}

/** `a | b` split at the top level, never inside a nested slot. */
function splitForms(words: string, most = 2): string[] {
  const forms: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < words.length; i++) {
    if (words[i] === "{") depth++;
    else if (words[i] === "}") depth--;
    else if (words[i] === "|" && depth === 0) {
      forms.push(words.slice(from, i));
      from = i + 1;
    }
  }
  forms.push(words.slice(from));
  if (forms.length > most) throw new Error(`more than two forms in "${words}"`);
  return forms;
}

/** A clause's slot, as the compiler checks it. */
export interface Slot {
  /** A word or term; with `role`, the term a reference is over, `null` for
   * the role's own marks. */
  readonly name: string | null;
  readonly role: string | null;
  /** The words and terms named inside a reference's words. */
  readonly inner: readonly string[];
  /** The flags of every `if` inside the slot's forms, nested ones too. */
  readonly flags: readonly string[];
  /** The terms it says as numbers (`numeral`, `spelled`, `a`, `piece`, `or`,
   * a count), which a word may not stand for. */
  readonly numbers?: readonly string[];
}

/** The roles that say their term as a number. */
const NUMBER_ROLES: ReadonlySet<string> = new Set([
  "piece",
  "spelled",
  "numeral",
  "a",
  "or",
]);

/** Every slot of a clause, for the compiler to check: a slot of an `if`'s
 * forms is a slot of the clause, as a word said plainly. Throws on a malformed
 * one, and on a reference inside an `if`. */
export function slotsOf(src: string): Slot[] {
  const within = (
    forms: readonly (readonly Piece[])[] | null,
    into: { inner: string[]; flags: string[]; numbers: string[] },
  ): void => {
    for (const p of (forms ?? []).flat()) {
      if (!("name" in p)) continue;
      if (p.role === "if") {
        into.flags.push(p.name);
        within(p.words, into);
      } else if (p.role === "count") {
        into.inner.push(p.name);
        into.numbers.push(p.name);
        within(p.words, into);
      } else if (p.role === null) into.inner.push(p.name);
      else if (NUMBER_ROLES.has(p.role)) {
        into.inner.push(p.name);
        into.numbers.push(p.name);
      } else throw new Error(`a reference inside the words of "${src}"`);
    }
  };
  const walk = (pieces: readonly Piece[]): Slot[] =>
    pieces.flatMap((p): Slot[] => {
      if (!("name" in p)) return [];
      // What a `has` holds is the clause's own, references and all.
      if (p.role === "has")
        return [
          { name: p.name, role: "has", inner: [], flags: [] },
          ...walk((p.words as readonly (readonly Piece[])[])[0]),
        ];
      // What an `if` holds is the clause's own, references and all.
      if (p.role === "if")
        return [
          { name: p.name, role: "if", inner: [], flags: [p.name] },
          ...(p.words as readonly (readonly Piece[])[]).flatMap(walk),
        ];
      const into = {
        inner: [] as string[],
        flags: [] as string[],
        numbers: [] as string[],
      };
      within(p.words, into);
      // A `fit`'s forms are said plainly.
      if (p.role === "fit")
        return [
          { name: "", role: "fit", inner: [], flags: into.flags },
          ...into.inner.map(
            (n): Slot => ({
              name: n,
              role: null,
              inner: [],
              flags: [],
              numbers: into.numbers.filter((m) => m === n),
            }),
          ),
        ];
      // A number role is said where its term is, which must be a number.
      if (p.role !== null && NUMBER_ROLES.has(p.role))
        return [{ name: p.name, role: null, inner: [], flags: [], numbers: [p.name] }];
      if (p.role === "count")
        // The term it counts and its forms' words are said plainly.
        return [p.name, ...into.inner].map(
          (n): Slot => ({
            name: n,
            role: null,
            inner: [],
            flags: into.flags,
            numbers: n === p.name ? [n] : into.numbers.filter((m) => m === n),
          }),
        );
      return [
        {
          name: p.role !== null && p.name === "" ? null : p.name,
          role: p.role,
          inner: into.inner,
          flags: into.flags,
          numbers: into.numbers,
        },
      ];
    });
  return walk(parseClause(src));
}
