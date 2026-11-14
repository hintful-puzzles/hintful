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
 * - A reference's words are one form, or `one | several`; a slot inside them is
 *   a word, a number term, or one of {@link STATED_INNER_WORDS}.
 */

/** The lexicon's words a clause may say anywhere: the noun for one square
 * and for several, and the two shading states' names. */
export const STATED_WORDS: ReadonlySet<string> = new Set([
  "noun",
  "nouns",
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
  if (head.length === 2 && SLOT_ROLES.has(head[0]))
    return { name: head[1], role: head[0], words };
  if (head.length === 1 && head[0] !== "" && words === null)
    return { name: head[0], role: null, words };
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
}

/** Every slot of a clause, for the compiler to check. Throws on a malformed
 * one. */
export function slotsOf(src: string): Slot[] {
  const inner = (forms: readonly (readonly Piece[])[] | null): string[] =>
    (forms ?? []).flat().flatMap((p) => ("name" in p ? [p.name] : []));
  return parseClause(src).flatMap((p) =>
    "name" in p
      ? [
          {
            name: p.role !== null && p.name === "" ? null : p.name,
            role: p.role,
            inner: inner(p.words),
          },
        ]
      : [],
  );
}
