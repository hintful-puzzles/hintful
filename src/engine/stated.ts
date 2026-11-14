/**
 * A step's words as its technique's description states them: clauses with
 * slots (`stated-clauses.ts` is their grammar), rendered against what a firing
 * says, its terms and the elements it marks, into the bound words of
 * `hint-words.ts`.
 *
 * A clause is whole, with slots, and never assembled from fragments by English
 * grammar, so the words are data and a second language would be a second set
 * of clauses. `describe/compile.ts` checks every slot against the technique's
 * terms when the description is compiled, so a clause cannot name what its
 * technique does not state.
 */
import { joinNums } from "./hint-text.ts";
import {
  type MarkKind,
  type MarkRole,
  mark,
  type Narration,
  type Noun,
  phrase,
  type Relation,
  type Sentence,
  sentence,
  whole,
} from "./hint-words.ts";
import { SHADED_NAME, UNSHADED_NAME } from "./piece.ts";
import { type Piece, parseClause } from "./stated-clauses.ts";

/** A step's parts as a description states them. */
export interface Clauses {
  readonly look?: string;
  readonly follows?: string;
  readonly move?: string;
}

/** The role each slot role is drawn in: `strand` is outlined apart. */
const DRAWN: Readonly<Record<string, MarkRole>> = {
  ring: "ring",
  outline: "outline",
  stripes: "stripes",
  strand: "outline",
};

/** What a clause is rendered against: a firing's terms and marks, and the
 * game's words. */
export interface StatedContext<E> {
  /** What the references are drawn on. */
  readonly kind: MarkKind<E>;
  /** The element a term's index names. */
  at(index: number): E;
  /** What the step decides. */
  readonly ring: readonly E[];
  /** The elements the step marks in each other role. */
  readonly marks: Readonly<
    Partial<Record<"outline" | "stripes" | "strand", readonly E[]>>
  >;
  /** The technique's terms, by name: numbers, and element indices or sets of
   * them. */
  readonly terms: Readonly<Record<string, unknown>>;
  /** A value as the board draws it. */
  value(n: number): string;
  /** What an element shows, for `{each}`. */
  shows?(e: E): number;
  /** The noun for one element of `kind`: the lexicon's "square" unless the
   * game declares its own. */
  readonly noun?: Noun;
  /** The noun a set of elements in stripes is, taken whole ("row"). */
  unit?(els: readonly E[]): string;
}

const nounOf = (noun: Noun, many: boolean): string =>
  typeof noun === "string" ? (many ? `${noun}s` : noun) : many ? noun[1] : noun[0];

/** The words a reference takes when its slot gives none. */
const DEFAULT_FORMS: Readonly<Record<string, readonly string[]>> = {
  ring: ["this {noun}", "these {nouns}"],
  stripes: ["this {unit}"],
  outline: ["the outlined {noun}", "the outlined {nouns}"],
  strand: ["the outlined {noun}", "the outlined {nouns}"],
};

function render<E>(src: string, cx: StatedContext<E>): Narration {
  const lits: string[] = [""];
  const vals: Narration[] = [];
  for (const p of parseClause(src)) {
    if ("text" in p) lits[lits.length - 1] += p.text;
    else if (p.role === null) lits[lits.length - 1] += word(p.name, cx, null);
    else {
      vals.push(reference(p, cx));
      lits.push("");
    }
  }
  return phrase(Object.assign([...lits], { raw: lits }), ...vals);
}

/** A word or a number term, said outside a reference, or inside one's words
 * about its live elements `els`. */
function word<E>(name: string, cx: StatedContext<E>, els: readonly E[] | null): string {
  const noun = cx.noun ?? "square";
  switch (name) {
    case "noun":
      return nounOf(noun, false);
    case "nouns":
      return nounOf(noun, true);
    case "shaded":
      return SHADED_NAME;
    case "unshaded":
      return UNSHADED_NAME;
    case "each":
      if (els === null || !cx.shows)
        throw new Error("stated clause: {each} needs what an element shows");
      return joinNums(els.map((e) => (cx.shows as (e: E) => number)(e)));
    case "unit":
      if (els === null || !cx.unit)
        throw new Error("stated clause: {unit} needs the game's units");
      return cx.unit(els);
  }
  const t = cx.terms[name];
  if (typeof t === "number") return cx.value(t);
  throw new Error(`stated clause: {${name}} is no word and no number term`);
}

function reference<E>(
  p: Extract<Piece, { role: string | null }>,
  cx: StatedContext<E>,
): Narration {
  const role = p.role as string;
  let els: readonly E[];
  if (p.name !== "") {
    const t = cx.terms[p.name];
    if (typeof t === "number") els = [cx.at(t)];
    else if (Array.isArray(t)) els = (t as number[]).map((i) => cx.at(i));
    else throw new Error(`stated clause: {${role} ${p.name}} names no element term`);
  } else if (role === "ring") els = cx.ring;
  else els = cx.marks[role as "outline" | "stripes" | "strand"] ?? [];
  const forms = p.words ?? DEFAULT_FORMS[role].map(parseClause);
  const say = (live: readonly E[]): string => {
    const many =
      role !== "stripes" && new Set(live.map((e) => cx.kind.key(e))).size > 1;
    return forms[many && forms.length > 1 ? 1 : 0]
      .map((q) => ("text" in q ? q.text : word(q.name, cx, live)))
      .join("");
  };
  return mark.as(DRAWN[role], role === "stripes" ? whole(cx.kind) : cx.kind, els, say);
}

/** A step's parts, rendered; `move` only where the clauses state one. */
export function statedParts<E>(
  c: Clauses,
  cx: StatedContext<E>,
): { look?: Narration; follows?: Narration; move?: Narration } {
  return {
    ...(c.look === undefined ? {} : { look: render(c.look, cx).capitalized() }),
    ...(c.follows === undefined ? {} : { follows: render(c.follows, cx) }),
    ...(c.move === undefined ? {} : { move: render(c.move, cx) }),
  };
}

/** A step's words, from its stated parts; `closing` is the move's words where
 * the clauses state none, the engine's from the fact. */
export function statedSentence<E>(
  c: Clauses,
  cx: StatedContext<E>,
  closing: Narration | null = null,
  relation: Relation = { kind: "forced" },
): Sentence {
  const parts = statedParts(c, cx);
  const move = parts.move ?? closing;
  if (move === null)
    throw new Error("stated clause: no move, and no closing from the fact");
  return sentence({ ...parts, move, relation });
}
