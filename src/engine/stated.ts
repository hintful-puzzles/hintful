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
  derived,
  indefinite,
  joinNums,
  joinOr,
  joinWith,
  listOf,
  type MarkKind,
  type MarkRole,
  mark,
  NARRATION_LIMIT,
  type Narration,
  type Noun,
  phrase,
  type Relation,
  type Sentence,
  sentence,
  unshaped,
  whole,
} from "./hint-words.ts";
import { PAIR_NAMES, type PairIndex, SHADED_NAME, UNSHADED_NAME } from "./piece.ts";
import {
  DEFAULT_FORMS,
  type Piece,
  parseClause,
  ringNames,
  STATED_WORDS,
} from "./stated-clauses.ts";

/** A step's parts as a description states them. */
export interface Clauses {
  readonly look?: string;
  readonly follows?: string;
  readonly move?: string;
  readonly effect?: string;
  /** What the move works toward, said first ("Working on tile 3:"); with no
   * `look` and no `effect`, the move only serves it. */
  readonly aim?: string;
  /** How the move answers a danger the `look` names ("One way to avoid it"),
   * said before the move: an `answers` relation. */
  readonly answers?: string;
  /** What a later leg of a journey says after its move, in place of `look` and
   * `follows`: the reasoning its first leg gave, as this square adds to it (an
   * `again` relation). A first leg ignores it. */
  readonly again?: string;
  /** What a later leg says as its move in place of `move`, where it differs
   * ("can't hold a domino either"); said with the `again` relation. */
  readonly later?: string;
  /** Why the sentence may run past the line, which it carries
   * (`Sentence.long`). */
  readonly long?: string;
}

/** A part of a step's sentence a description states. */
export type ClausePart = Exclude<keyof Clauses, "long" | "answers">;

/** The role each slot role is drawn in: `strand` is outlined apart. */
const DRAWN: Readonly<Record<string, MarkRole>> = {
  ring: "ring",
  outline: "outline",
  stripes: "stripes",
  strand: "outline",
};

/** What a clause is rendered against: a firing's terms and marks, and the
 * game's words. */
export interface StatedContext<E, R = E> {
  /** What the references are drawn on. */
  readonly kind: MarkKind<E>;
  /** What `ring` references are drawn on, where the step decides elements of
   * another kind than the ones it marks (a wall on an edge, the squares it
   * reasons from). */
  readonly ringKind?: MarkKind<R>;
  /** Where a role marks elements of several sorts (its marks a set by sort),
   * what a reference to one sort is drawn on. */
  readonly kinds?: Readonly<Record<string, MarkKind<E>>>;
  /** Where a term's elements are drawn on a kind of their own, not the
   * step's: a number that lies inside the squares it outlines (Range's). */
  readonly termKinds?: Readonly<Record<string, MarkKind<E>>>;
  /** The element a named term's index names, where `termKinds` draws it on a
   * kind whose elements are not the step's (edges among squares). */
  readonly termAt?: Readonly<Record<string, (index: number) => E>>;
  /** The element a term's index names. */
  at(index: number): E;
  /** What the step decides. */
  readonly ring: readonly R[];
  /** What the step decides to be `n`, for `{ring n}`. */
  placing?(n: number): readonly R[];
  /** What the step's placing techniques follow with, which it shows and makes
   * but does not decide, for `{ring then}`. */
  readonly consequences?: readonly R[];
  /** The elements the step marks in each other role, and its ring by sort
   * where a planner's step decides elements of several. */
  readonly marks: Readonly<
    Partial<
      Record<
        "outline" | "stripes" | "strand" | "ring",
        readonly E[] | Readonly<Record<string, readonly E[]>>
      >
    >
  >;
  /** The technique's terms, by name: numbers, and element indices or sets of
   * them. */
  readonly terms: Readonly<Record<string, unknown>>;
  /** A value as the board draws it: a color word where the value is a color
   * whose name differs by scheme (Map's), said only as a whole slot. */
  value(n: number): string | ColorWord;
  /** The member of the two-state pair a number term names, for `{piece term}`. */
  piece?(n: number): PairIndex;
  /** Whether the step is a later leg of its firing, which says its `again`
   * clause after the move in place of `look` and `follows`. */
  readonly later?: boolean;
  /** What an element shows, for `{each}`. */
  shows?(e: E): number;
  /** The noun for one element of `kind`: the lexicon's "square" unless the
   * game declares its own. */
  readonly noun?: Noun;
  /** The noun a `ring` reference without words of its own says, where the
   * ring is drawn on `ringKind`: `noun` names elements of `kind`, so a ring
   * of another kind with neither its words nor this is refused. */
  readonly ringNoun?: Noun;
  /** How cells share a unit, in the game's units ("in a line or block
   * with"); "in line with" where the game declares none. */
  readonly alongside?: string;
  /** What a value is called, for `{valueNoun}`: "number" unless the game's
   * values are letters, elements or heights. */
  readonly valueNoun?: string;
  /** The verb a square takes a value by, for `{be}` ("it can only {be} 3"):
   * "be" unless the game's values are ways, as Rome's arrows "point". */
  readonly be?: string;
  /** The values a strike step removes, for `{struck}` and `{struckOr}`: the order is the
   * solver's, and each is named once, smallest first. */
  readonly struck?: readonly number[];
  /** The kinds of region a value may not repeat in, for `{regions}`. */
  readonly regions?: string;
  /** How many parallel lines the step names, for `{tally}`. */
  readonly tally?: number;
  /** The noun a set of elements in stripes is, taken whole ("row"). */
  unit?(els: readonly E[]): string;
  /** Which form every `{fit: …}` of the sentence takes (`statedSentence`
   * tries them in turn); the first where unset. */
  readonly fit?: number;
}

const nounOf = (noun: Noun, many: boolean): string =>
  typeof noun === "string" ? (many ? `${noun}s` : noun) : many ? noun[1] : noun[0];

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
    // Words that are said only where the squares they name are there.
    if (p.role === "has")
      return squaresNamed(p.name, cx).length === 0
        ? []
        : expand((p.words as readonly (readonly Piece[])[])[0], cx);
    if (p.role === "or") {
      const bits = cx.terms[p.name];
      if (typeof bits !== "number")
        throw new Error(`stated clause: {or ${p.name}: …} is no number term`);
      const said = (p.words as readonly (readonly Piece[])[])
        .filter((_, i) => (bits >> i) & 1)
        .map((form) => form.map((q) => ("text" in q ? q.text : "")).join(""));
      return [{ text: joinOr(said) }];
    }
    if (p.role === "fit") {
      const forms = p.words as readonly (readonly Piece[])[];
      return expand(forms[Math.min(cx.fit ?? 0, forms.length - 1)], cx);
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
  const vals: Narration[] = [];
  for (const p of expand(parseClause(src), cx)) {
    if ("text" in p) lits[lits.length - 1] += p.text;
    else if (p.role === null) {
      const w = colored(p.name, cx);
      if (typeof w === "string") lits[lits.length - 1] += w;
      else {
        vals.push(w);
        lits.push("");
      }
    } else if (p.role === "numeral") lits[lits.length - 1] += numeral(p.name, cx);
    else if (p.role === "a") lits[lits.length - 1] += article(p.name, cx);
    else if (p.role === "piece") lits[lits.length - 1] += pieceOf(p.name, cx);
    else if (p.role === "spelled") lits[lits.length - 1] += spelled(p.name, cx);
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

/** A number term as the board draws it, with its indefinite article. */
function article<E>(term: string, cx: StatedContext<E>): string {
  const v = word(term, cx, null);
  return `${indefinite(v)} ${v}`;
}

/** A number term as a plain count, in digits. */
function numeral<E>(term: string, cx: StatedContext<E>): string {
  const n = cx.terms[term];
  if (typeof n !== "number")
    throw new Error(`stated clause: {numeral ${term}} is no number term`);
  return String(n);
}

function spelled<E>(term: string, cx: StatedContext<E>): string {
  const n = cx.terms[term];
  if (typeof n !== "number")
    throw new Error(`stated clause: {spelled ${term}} is no number term`);
  return SPELLED[n] ?? String(n);
}

function pieceOf<E>(term: string, cx: StatedContext<E>): string {
  const n = cx.terms[term];
  if (typeof n !== "number" || !cx.piece)
    throw new Error(
      `stated clause: {piece ${term}} needs a number term and the game's pieces`,
    );
  return PAIR_NAMES[cx.piece(n)];
}

/** A whole slot outside a reference: a value term, or the struck values,
 * stays a color word where the game's values are colors, so the scheme picks
 * its name; any other is {@link word}'s. */
function colored<E>(name: string, cx: StatedContext<E>): string | Narration {
  const t = cx.terms[name];
  const values =
    (name === "struck" || name === "struckOr") && cx.struck
      ? [...new Set(cx.struck)].sort((a, b) => a - b).map(cx.value)
      : typeof t === "number" && !STATED_WORDS.has(name)
        ? [cx.value(t)]
        : [];
  if (values.every((v) => typeof v === "string")) return word(name, cx, null);
  return listOf(
    values.map((v) => (typeof v === "string" ? phrase`${v}` : v)),
    name === "struckOr" ? "or" : "and",
  );
}

/** A value as words, where a color word cannot stand (inside a word, after
 * an article). */
function text(v: string | ColorWord): string {
  if (typeof v === "string") return v;
  throw new Error(`stated clause: the color ${v.light} can only be a slot of its own`);
}

/** A word or a number term, said outside a reference, or inside one's words
 * about its live elements `els`. */
function word<E>(name: string, cx: StatedContext<E>, els: readonly E[] | null): string {
  const value = (n: number): string => text(cx.value(n));
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
    case "be":
      return cx.be ?? "be";
    case "struck":
      if (!cx.struck)
        throw new Error("stated clause: {struck} needs the step's strikes");
      return joinWith([...new Set(cx.struck)].sort((a, b) => a - b).map(value));
    case "struckA":
      if (!cx.struck)
        throw new Error("stated clause: {struckA} needs the step's strikes");
      return joinWith(
        [...new Set(cx.struck)]
          .sort((a, b) => a - b)
          .map(value)
          .map((v) => `${indefinite(v)} ${v}`),
      );
    case "struckOr":
      if (!cx.struck)
        throw new Error("stated clause: {struckOr} needs the step's strikes");
      return joinOr([...new Set(cx.struck)].sort((a, b) => a - b).map(value));
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
  if (typeof t === "number") return value(t);
  // A unit term holds the unit's name.
  if (typeof t === "string") return t;
  throw new Error(`stated clause: {${name}} is no word, no number and no unit term`);
}

/** The squares a `ring` reference or a `has` slot names (`ringNames`). */
function squaresNamed<E>(name: string, cx: StatedContext<E>): readonly E[] {
  return (ringNames(name) as readonly string[]).flatMap((n) => {
    const els = n === "then" ? cx.consequences : cx.placing?.(Number(n));
    if (els === undefined)
      throw new Error(`stated clause: {… ${n}} needs the squares the step places`);
    return els;
  });
}

function reference<E>(
  p: Extract<Piece, { role: string | null }>,
  cx: StatedContext<E>,
): Narration {
  const role = p.role as string;
  let els: readonly E[];
  let kind = role === "ring" ? (cx.ringKind ?? cx.kind) : cx.kind;
  // A ring is in the marks only where a step gives it by sort.
  const ofRole = cx.marks[role as "outline"];
  if (ofRole !== undefined && !Array.isArray(ofRole)) {
    // A role of several sorts: the reference names the one it is over.
    const bySort = ofRole as Readonly<Record<string, readonly E[]>>;
    if (p.name === "" || !(p.name in bySort))
      throw new Error(
        `stated clause: {${role} ${p.name}} names no sort the step marks`,
      );
    els = bySort[p.name];
    kind = cx.kinds?.[p.name] ?? cx.kind;
  } else if (role === "ring" && ringNames(p.name) !== null)
    els = squaresNamed(p.name, cx);
  else if (p.name !== "") {
    const t = cx.terms[p.name];
    kind = cx.termKinds?.[p.name] ?? kind;
    const at = cx.termAt?.[p.name] ?? cx.at;
    if (typeof t === "number") els = [at(t)];
    else if (Array.isArray(t)) els = (t as number[]).map((i) => at(i));
    else throw new Error(`stated clause: {${role} ${p.name}} names no element term`);
  } else if (role === "ring") els = cx.ring;
  else els = (ofRole as readonly E[] | undefined) ?? [];
  const forms = p.words ?? DEFAULT_FORMS[role].map(parseClause);
  // A ring is named by its own noun, in the default words or as its words'
  // `{noun}`: a kind's sentence says "the ringed {noun}" whatever it rings.
  const namesNoun =
    p.words === null ||
    forms.some((f) =>
      f.some((q) => "name" in q && (q.name === "noun" || q.name === "nouns")),
    );
  if (
    role === "ring" &&
    namesNoun &&
    cx.ringNoun === undefined &&
    cx.ringKind !== undefined &&
    cx.ringKind.name !== cx.kind.name
  )
    throw new Error(
      `stated clause: {ring} is drawn on ${cx.ringKind.name}s, which the game's noun does not name: give it words, or the hint a ringNoun`,
    );
  const said =
    role === "ring" && cx.ringNoun !== undefined ? { ...cx, noun: cx.ringNoun } : cx;
  const say = (live: readonly E[]): string => {
    const many = role !== "stripes" && new Set(live.map((e) => kind.key(e))).size > 1;
    return forms[many && forms.length > 1 ? 1 : 0]
      .map((q) =>
        "text" in q
          ? q.text
          : q.role === "piece"
            ? pieceOf(q.name, said)
            : q.role === "spelled"
              ? spelled(q.name, said)
              : q.role === "numeral"
                ? numeral(q.name, said)
                : q.role === "a"
                  ? article(q.name, said)
                  : word(q.name, said, live),
      )
      .join("");
  };
  const ref = mark.as(DRAWN[role], role === "stripes" ? whole(kind) : kind, els, say);
  return p.derived === true ? derived(ref) : ref;
}

/** A step's parts, rendered; `move` only where the clauses state one. */
export function statedParts<E, R = E>(
  c: Clauses,
  context: StatedContext<E, R>,
  /** Whether the look may open the sentence: not after a sequence's "Next,". */
  lookOpens = true,
): {
  aim?: Narration;
  look?: Narration;
  follows?: Narration;
  move?: Narration;
  effect?: Narration;
  again?: Narration;
  later?: Narration;
} {
  // The ring's elements are of the kind `ringKind` names, which only a ring
  // reference reads.
  const cx = context as unknown as StatedContext<E>;
  // A look opens the sentence unless an aim goes before it.
  const look = (src: string): Narration =>
    c.aim === undefined && lookOpens ? render(src, cx).capitalized() : render(src, cx);
  return {
    ...(c.aim === undefined ? {} : { aim: render(c.aim, cx) }),
    ...(c.again === undefined ? {} : { again: render(c.again, cx) }),
    ...(c.later === undefined ? {} : { later: render(c.later, cx) }),
    ...(c.look === undefined ? {} : { look: look(c.look) }),
    ...(c.follows === undefined ? {} : { follows: render(c.follows, cx) }),
    ...(c.move === undefined ? {} : { move: render(c.move, cx) }),
    ...(c.effect === undefined ? {} : { effect: render(c.effect, cx) }),
  };
}

/** A step's words, from its stated parts; `closing` is the move's words where
 * the clauses state none, the engine's from the fact, and `relation` how the
 * move stands to its look where a search judged it (else the clauses say:
 * forced, or serving an aim). */
export function statedSentence<E, R = E>(
  c: Clauses,
  context: StatedContext<E, R>,
  closing: Narration | null = null,
  relation: Relation | null = null,
): Sentence {
  const cx = context as unknown as StatedContext<E>;
  const { long: _, ...parts } = c;
  const turns = Math.max(
    1,
    ...Object.values(parts).map((src) =>
      src === undefined ? 0 : fitForms(parseClause(src)),
    ),
  );
  for (let fit = 0; fit < turns - 1; fit++) {
    const said = statedOnce(c, { ...cx, fit }, closing, relation);
    if (said.text.length <= NARRATION_LIMIT) return said;
  }
  return statedOnce(c, { ...cx, fit: turns - 1 }, closing, relation);
}

/** The most forms of any `fit` in `pieces`, those inside an `if` included. */
function fitForms(pieces: readonly Piece[]): number {
  return Math.max(
    0,
    ...pieces.map((p) => {
      if (!("name" in p) || p.words === null) return 0;
      const inner = Math.max(0, ...p.words.map(fitForms));
      return p.role === "fit" ? Math.max(p.words.length, inner) : inner;
    }),
  );
}

function statedOnce<E>(
  c: Clauses,
  cx: StatedContext<E>,
  closing: Narration | null,
  relation: Relation | null,
): Sentence {
  const { effect, again, later, ...parts } = statedParts(
    c,
    cx,
    !(relation?.kind === "sequence" && relation.at !== "first"),
  );
  const move = parts.move ?? closing;
  // A wording that states only its look leaves the move to the ringed squares
  // and the board (Filling's region that fits exactly into them).
  if (
    move === null &&
    parts.look !== undefined &&
    parts.follows === undefined &&
    parts.aim === undefined &&
    effect === undefined &&
    relation === null
  )
    return unshaped(phrase`${parts.look}.`, "evident");
  if (move === null)
    throw new Error("stated clause: no move, and no closing from the fact");
  if (cx.later === true && again !== undefined)
    return sentence({
      move: later ?? move,
      relation: { kind: "again", basis: again },
      ...(c.long === undefined ? {} : { long: c.long }),
    });
  // A wording that states only its move has nothing to say but the move
  // (Flood's fill that joins no square).
  if (
    effect === undefined &&
    parts.look === undefined &&
    parts.follows === undefined &&
    parts.aim === undefined &&
    relation === null
  )
    return unshaped(phrase`${move}.`.capitalized(), "bare");
  return sentence({
    ...parts,
    move,
    // A move with an aim serves it unless a search proved more: an aimed
    // planner's step claims no "so" of its own.
    relation:
      effect !== undefined
        ? { kind: "effect", effect }
        : c.answers !== undefined
          ? { kind: "answers", how: render(c.answers, cx).text }
          : (relation ??
            (parts.aim === undefined ? { kind: "forced" } : { kind: "serves" })),
    ...(c.long === undefined ? {} : { long: c.long }),
  });
}
