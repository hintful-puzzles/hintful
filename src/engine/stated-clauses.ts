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
 * - `{count: one | several}`: the first form where the number term `count` is 1,
 *   the second otherwise; its forms hold what an `if`'s do.
 * - `{if flag: yes | no}`: the form the step's flag term holds, whole; its forms
 *   hold literal words, number terms and further `if`s, and no reference.
 * - A reference's words are one form, or `one | several`; a slot inside them is
 *   a word, a number term, an `if`, or one of {@link STATED_INNER_WORDS}.
 */

/** The lexicon's words a clause may say anywhere: the noun for one square
 * and for several, the two shading states' names, and how a deduction's cells
 * share a unit with the one it decides (`alongside`, the game's units in words),
 * and the values a strike step removes (`struck`, each named once), and how
 * many parallel lines a step names (`tally`, in digits: a count is not a value
 * a game prints). */
export const STATED_WORDS: ReadonlySet<string> = new Set([
  "noun",
  "nouns",
  "alongside",
  "struck",
  "tally",
  "shaded",
  "unshaded",
]);

/** The words only a reference's own words may say, about its elements: what
 * each shows, and the unit stripes are taken as. */
export const STATED_INNER_WORDS: ReadonlySet<string> = new Set(["each", "unit"]);

/** The roles a slot may name: what the step decides, and the roles of
 * `says.marks`. */
const SLOT_ROLES: ReadonlySet<string> = new Set([
  "ring",
  "outline",
  "stripes",
  "strand",
  "if",
]);

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
  const colon = body.indexOf(":");
  const head = (colon < 0 ? body : body.slice(0, colon)).trim().split(/ +/);
  const words =
    colon < 0
      ? null
      : splitForms(body.slice(colon + 1).trim()).map((f) => parseClause(f.trim()));
  if (head.length === 1 && SLOT_ROLES.has(head[0]))
    return { name: "", role: head[0], words };
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
function splitForms(words: string): string[] {
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
  if (forms.length > 2) throw new Error(`more than two forms in "${words}"`);
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
}

/** Every slot of a clause, for the compiler to check: a slot of an `if`'s
 * forms is a slot of the clause, as a word said plainly. Throws on a malformed
 * one, and on a reference inside an `if`. */
export function slotsOf(src: string): Slot[] {
  const within = (
    forms: readonly (readonly Piece[])[] | null,
    into: { inner: string[]; flags: string[] },
  ): void => {
    for (const p of (forms ?? []).flat()) {
      if (!("name" in p)) continue;
      if (p.role === "if") {
        into.flags.push(p.name);
        within(p.words, into);
      } else if (p.role === "count") {
        into.inner.push(p.name);
        within(p.words, into);
      } else if (p.role === null) into.inner.push(p.name);
      else throw new Error(`a reference inside the words of "${src}"`);
    }
  };
  const walk = (pieces: readonly Piece[]): Slot[] =>
    pieces.flatMap((p): Slot[] => {
      if (!("name" in p)) return [];
      if (p.role === "if") {
        // Its forms' words are said plainly, wherever the `if` is.
        const into = { inner: [] as string[], flags: [] as string[] };
        within(p.words, into);
        return [
          { name: p.name, role: "if", inner: [], flags: [p.name, ...into.flags] },
          ...into.inner.map(
            (n): Slot => ({ name: n, role: null, inner: [], flags: [] }),
          ),
        ];
      }
      const into = { inner: [] as string[], flags: [] as string[] };
      within(p.words, into);
      if (p.role === "count")
        // The term it counts and its forms' words are said plainly.
        return [p.name, ...into.inner].map(
          (n): Slot => ({ name: n, role: null, inner: [], flags: into.flags }),
        );
      return [
        {
          name: p.role !== null && p.name === "" ? null : p.name,
          role: p.role,
          inner: into.inner,
          flags: into.flags,
        },
      ];
    });
  return walk(parseClause(src));
}
