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
import type { ColorWord } from "./color/color-word.ts";
import {
  joinNums,
  joinOr,
  joinWith,
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
  readonly effect?: string;
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
  /** Where a role marks elements of several sorts (its marks a set by sort),
   * what a reference to one sort is drawn on. */
  readonly kinds?: Readonly<Record<string, MarkKind<E>>>;
  /** Where a term's elements are drawn on a kind of their own, not the
   * step's: a number that lies inside the squares it outlines (Range's). */
  readonly termKinds?: Readonly<Record<string, MarkKind<E>>>;
  /** The element a term's index names. */
  at(index: number): E;
  /** What the step decides. */
  readonly ring: readonly E[];
  /** The elements the step marks in each other role. */
  readonly marks: Readonly<
    Partial<
      Record<
        "outline" | "stripes" | "strand",
        readonly E[] | Readonly<Record<string, readonly E[]>>
      >
    >
  >;
  /** The technique's terms, by name: numbers, and element indices or sets of
   * them. */
  readonly terms: Readonly<Record<string, unknown>>;
  /** A value as the board draws it. */
  value(n: number): string;
  /** The color word a number term names, for `{color term}`. */
  color?(n: number): ColorWord;
  /** What an element shows, for `{each}`. */
  shows?(e: E): number;
  /** The noun for one element of `kind`: the lexicon's "square" unless the
   * game declares its own. */
  readonly noun?: Noun;
  /** How cells share a unit, in the game's units ("in a line or block
   * with"); "in line with" where the game declares none. */
  readonly alongside?: string;
  /** What a value is called, for `{valueNoun}`: "number" unless the game's
   * values are letters, elements or heights. */
  readonly valueNoun?: string;
  /** The values a strike step removes, for `{struck}` and `{struckOr}`: the order is the
   * solver's, and each is named once, smallest first. */
  readonly struck?: readonly number[];
  /** The kinds of region a value may not repeat in, for `{regions}`. */
  readonly regions?: string;
  /** How many parallel lines the step names, for `{tally}`. */
  readonly tally?: number;
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

/** A clause's pieces with each `if` replaced by the form its flag term holds. */
function expand<E>(pieces: readonly Piece[], cx: StatedContext<E>): Piece[] {
  return pieces.flatMap((p): Piece[] => {
    if (!("name" in p)) return [p];
    if (p.role === "count") {
      const n = cx.terms[p.name];
      if (typeof n !== "number")
        throw new Error(`stated clause: {${p.name}: …} is no count term`);
      return expand((p.words as readonly (readonly Piece[])[])[n === 1 ? 0 : 1], cx);
    }
    if (p.role === "if") {
      const flag = cx.terms[p.name];
      if (typeof flag !== "boolean")
        throw new Error(`stated clause: {if ${p.name}} is no flag term`);
      return expand((p.words as readonly (readonly Piece[])[])[flag ? 0 : 1], cx);
    }
    return [
      p.words === null ? p : { ...p, words: p.words.map((form) => expand(form, cx)) },
    ];
  });
}

function render<E>(src: string, cx: StatedContext<E>): Narration {
  const lits: string[] = [""];
  const vals: (Narration | ColorWord)[] = [];
  for (const p of expand(parseClause(src), cx)) {
    if ("text" in p) lits[lits.length - 1] += p.text;
    else if (p.role === null) lits[lits.length - 1] += word(p.name, cx, null);
    else if (p.role === "color") {
      vals.push(colorOf(p.name, cx));
      lits.push("");
    } else if (p.role === "spelled") lits[lits.length - 1] += spelled(p.name, cx);
    else {
      vals.push(reference(p, cx));
      lits.push("");
    }
  }
  return phrase(Object.assign([...lits], { raw: lits }), ...vals);
}

const SPELLED = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
] as const;

function spelled<E>(term: string, cx: StatedContext<E>): string {
  const n = cx.terms[term];
  if (typeof n !== "number")
    throw new Error(`stated clause: {spelled ${term}} is no number term`);
  return SPELLED[n] ?? String(n);
}

function colorOf<E>(term: string, cx: StatedContext<E>): ColorWord {
  const n = cx.terms[term];
  if (typeof n !== "number" || !cx.color)
    throw new Error(
      `stated clause: {color ${term}} needs a number term and the game's colors`,
    );
  return cx.color(n);
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
    case "alongside":
      return cx.alongside ?? "in line with";
    case "valueNoun":
      return cx.valueNoun ?? "number";
    case "struck":
      if (!cx.struck)
        throw new Error("stated clause: {struck} needs the step's strikes");
      return joinWith([...new Set(cx.struck)].sort((a, b) => a - b).map(cx.value));
    case "struckOr":
      if (!cx.struck)
        throw new Error("stated clause: {struckOr} needs the step's strikes");
      return joinOr([...new Set(cx.struck)].sort((a, b) => a - b).map(cx.value));
    case "regions":
      return cx.regions ?? "row and column";
    case "tally":
      if (cx.tally === undefined)
        throw new Error("stated clause: {tally} needs the step's line count");
      return String(cx.tally);
    case "shaded":
      return SHADED_NAME;
    case "unshaded":
      return UNSHADED_NAME;
    case "each":
      if (els === null || !cx.shows)
        throw new Error("stated clause: {each} needs what an element shows");
      return joinNums(els.map((e) => (cx.shows as (e: E) => number)(e)));
    case "live":
      if (els === null)
        throw new Error("stated clause: {live} counts a reference's elements");
      return String(els.length);
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
  let kind = cx.kind;
  const ofRole = role === "ring" ? undefined : cx.marks[role as "outline"];
  if (ofRole !== undefined && !Array.isArray(ofRole)) {
    // A role of several sorts: the reference names the one it is over.
    const bySort = ofRole as Readonly<Record<string, readonly E[]>>;
    const k = cx.kinds?.[p.name];
    if (p.name === "" || !(p.name in bySort) || k === undefined)
      throw new Error(
        `stated clause: {${role} ${p.name}} names no sort the step marks`,
      );
    els = bySort[p.name];
    kind = k;
  } else if (p.name !== "") {
    const t = cx.terms[p.name];
    kind = cx.termKinds?.[p.name] ?? kind;
    if (typeof t === "number") els = [cx.at(t)];
    else if (Array.isArray(t)) els = (t as number[]).map((i) => cx.at(i));
    else throw new Error(`stated clause: {${role} ${p.name}} names no element term`);
  } else if (role === "ring") els = cx.ring;
  else els = (ofRole as readonly E[] | undefined) ?? [];
  const forms = p.words ?? DEFAULT_FORMS[role].map(parseClause);
  const say = (live: readonly E[]): string => {
    const many = role !== "stripes" && new Set(live.map((e) => kind.key(e))).size > 1;
    return forms[many && forms.length > 1 ? 1 : 0]
      .map((q) =>
        "text" in q
          ? q.text
          : q.role === "color"
            ? colorOf(q.name, cx).only
            : q.role === "spelled"
              ? spelled(q.name, cx)
              : word(q.name, cx, live),
      )
      .join("");
  };
  return mark.as(DRAWN[role], role === "stripes" ? whole(kind) : kind, els, say);
}

/** A step's parts, rendered; `move` only where the clauses state one. */
export function statedParts<E>(
  c: Clauses,
  cx: StatedContext<E>,
): {
  look?: Narration;
  follows?: Narration;
  move?: Narration;
  effect?: Narration;
} {
  return {
    ...(c.look === undefined ? {} : { look: render(c.look, cx).capitalized() }),
    ...(c.follows === undefined ? {} : { follows: render(c.follows, cx) }),
    ...(c.move === undefined ? {} : { move: render(c.move, cx) }),
    ...(c.effect === undefined ? {} : { effect: render(c.effect, cx) }),
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
  const { effect, ...parts } = statedParts(c, cx);
  const move = parts.move ?? closing;
  if (move === null)
    throw new Error("stated clause: no move, and no closing from the fact");
  return sentence({
    ...parts,
    move,
    relation: effect === undefined ? relation : { kind: "effect", effect },
  });
}

/** What a game's planner supplies for a step of a kind its description
 * declares (`steps`): number and flag terms, and the elements it marks by role
 * and sort. */
export interface PlannedSaid<E> {
  readonly terms: Readonly<Record<string, number | boolean>>;
  readonly marks: Readonly<
    Partial<Record<string, Readonly<Record<string, readonly E[]>>>>
  >;
}

/** A planner's kind of step as the module's `STEPS` holds it: its clauses by
 * wording, and the condition each is said under. */
export interface PlannedKind<T, M> {
  readonly clauses: readonly Clauses[];
  readonly when: readonly (null | ((t: T, m: M) => boolean))[];
}

/**
 * The words of a step a planner emits: the first wording whose condition holds,
 * rendered against the terms and marks the planner supplies. `ring` is what
 * the step decides, and the context's `kind` the sort it is of.
 */
export function plannedSentence<
  E,
  T extends PlannedSaid<E>["terms"],
  M extends PlannedSaid<E>["marks"],
>(
  step: PlannedKind<T, M>,
  said: { readonly terms: T; readonly marks: M },
  cx: Omit<StatedContext<E>, "terms" | "marks" | "at">,
): Sentence {
  const i = step.when.findIndex((w) => w === null || w(said.terms, said.marks));
  if (i < 0) throw new Error("stated clause: no wording of the step holds");
  return statedSentence(step.clauses[i], {
    ...cx,
    at: () => {
      throw new Error("stated clause: a planned step has no element terms");
    },
    terms: said.terms,
    marks: said.marks as StatedContext<E>["marks"],
  });
}
