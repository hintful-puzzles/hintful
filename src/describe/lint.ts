/**
 * What `npm run describe` checks of a description beyond what compiles it:
 * that each wording's words keep the rules the render holds a sentence to,
 * that each wording fits the line or says why not, and where a formula reads
 * the whole board for what it could read nearby (docs/descriptions.md
 * § "What the compiler checks of a wording"). Every finding is reported, not
 * the first, so a writer hears all of them in one run.
 *
 * The rules are the render's own (`engine/contract/wording-rules.ts`, and the judge of a
 * reference's words in `engine/testing/hint-reference.ts`), asked of every form
 * a clause can take. What only a board decides stays the render's and the hint
 * walk's: which elements a reference marks, and so whether two references in
 * one role tell their marks apart.
 */

import {
  adjectiveDefect,
  IS_OUT,
  KEEPS_IS_OUT_PRODUCES,
  NARRATION_LIMIT,
  RETIRED_PHRASE,
  unboundDefect,
} from "../engine/contract/wording-rules.ts";
import { WORD_LENGTHS } from "../engine/generate/word-list/index.ts";
import {
  DEFAULT_FORMS,
  DRAWN,
  type Piece,
  parseClause,
} from "../engine/hint/stated-clauses.ts";
import { PAIR_NAMES, SHADED_NAME, UNSHADED_NAME } from "../engine/render/piece.ts";
import { judge } from "../engine/testing/hint-reference.ts";
import {
  type DescriptionFile,
  isFormal,
  isLibrary,
  isPlanning,
  parseBinders,
  parseTechnique,
  type StatedClauses,
  type StatedTechnique,
  type Step,
  stepsOf,
  type Wording,
  withEveryVariation,
} from "./description.ts";
import { type Binder, type Expr, parse } from "./expr.ts";

/** One thing a description should change. An error fails `npm run describe`;
 * a warning names a cost. */
export interface Finding {
  readonly where: string;
  readonly error: boolean;
  readonly message: string;
}

/**
 * What each slot prints, at its shortest and at its longest: the samples a
 * wording's two bounds read. A word the game supplies (its noun, its units in
 * words) is read at the shortest a game has said and at the engine's default;
 * a number at one digit and at two; a list at one member and at three.
 */
interface Prints {
  readonly words: Readonly<Record<string, string>>;
  readonly number: string;
  readonly roles: Readonly<Record<string, string>>;
  /** What a step says where its description states no move: the engine's
   * closing from the fact. */
  readonly closing: string;
}

/** The pair's words, shortest first. */
const byLength = (names: readonly string[]): string[] =>
  [...names].sort((a, b) => a.length - b.length);

const SHORTEST: Prints = {
  words: {
    noun: "dot",
    nouns: "dots",
    valueNoun: "number",
    be: "be",
    alongside: "beside",
    struck: "1",
    struckOr: "1",
    struckA: "a 1",
    tally: "2",
    regions: "row",
    shaded: SHADED_NAME,
    unshaded: UNSHADED_NAME,
    each: "1",
    live: "1",
    unit: "row",
  },
  number: "1",
  roles: {
    numeral: "1",
    spelled: "one",
    a: "a 1",
    piece: byLength(PAIR_NAMES)[0],
    either: "1",
  },
  closing: "",
};

const LONGEST: Prints = {
  words: {
    noun: "square",
    nouns: "squares",
    valueNoun: "number",
    be: "point",
    alongside: "in line with",
    struck: "1, 2 and 3",
    struckOr: "1, 2 or 3",
    struckA: "a 1, a 2 and a 3",
    tally: "2",
    regions: "row and column",
    shaded: SHADED_NAME,
    unshaded: UNSHADED_NAME,
    each: "1, 2 and 3",
    live: "2",
    unit: "column",
  },
  number: "10",
  roles: {
    numeral: "10",
    spelled: "seven",
    a: "an 8",
    piece: byLength(PAIR_NAMES)[1],
    either: "1, 2 or 3",
  },
  closing: "this square must be clear",
};

/** A clause one way: literal words, and references with their words. */
type Item =
  | { readonly text: string }
  | { readonly role: string; readonly words: string };

/** The most forms of a clause a check reads: an `if` doubles them. */
const MOST_FORMS = 4096;

/** Every way `pieces` reads with its slots printed as `prints` has them, and
 * every `fit` taking form `turn` (its last where it has fewer). */
function forms(pieces: readonly Piece[], turn: number, prints: Prints): Item[][] {
  let out: Item[][] = [[]];
  for (const p of pieces) {
    const alts = pieceForms(p, turn, prints);
    const next: Item[][] = [];
    for (const a of out) for (const b of alts) next.push([...a, ...b]);
    out = next.slice(0, MOST_FORMS);
  }
  return out;
}

const text = (s: string): Item[] => [{ text: s }];

function pieceForms(p: Piece, turn: number, prints: Prints): Item[][] {
  if (!("name" in p)) return [text(p.text)];
  const words = p.words ?? [];
  switch (p.role) {
    case null:
      return [text(prints.words[p.name] ?? prints.number)];
    case "numeral":
    case "spelled":
    case "a":
    case "piece":
    case "either":
      return [text(prints.roles[p.role])];
    case "count":
    case "if":
      return words.flatMap((f) => forms(f, turn, prints));
    case "has":
      return [[], ...forms(words[0], turn, prints)];
    case "or": {
      // Each alternative alone, and every one at once.
      const alts = words.map((f) => f.map((q) => ("text" in q ? q.text : "")).join(""));
      return [...alts.map(text), text(orJoin(alts))];
    }
    case "fit":
      return forms(words[Math.min(turn, words.length - 1)], turn, prints);
  }
  // A reference: each of its forms, its words read as literal words are.
  const own = p.words ?? (DEFAULT_FORMS[p.role] ?? []).map((f) => parseClause(f));
  return own
    .flatMap((f) => forms(f, turn, prints))
    .map((items) => [{ role: p.role as string, words: said(items) }]);
}

const orJoin = (xs: readonly string[]): string =>
  xs.length < 2 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} or ${xs.at(-1)}`;

const said = (items: readonly Item[]): string =>
  items.map((i) => ("text" in i ? i.text : i.words)).join("");

/** The most turns any `fit` of `pieces` has. */
function fitTurns(pieces: readonly Piece[]): number {
  return Math.max(
    1,
    ...pieces.map((p) => {
      if (!("name" in p) || p.words === null) return 1;
      const inner = Math.max(1, ...p.words.map(fitTurns));
      return p.role === "fit" ? Math.max(p.words.length, inner) : inner;
    }),
  );
}

type Part = keyof StatedClauses;
const PARTS: readonly Part[] = [
  "aim",
  "answers",
  "look",
  "follows",
  "move",
  "effect",
  "again",
  "later",
];

/** Each part's shortest or longest reading, with every `fit` at `turn`. */
function readings(
  c: StatedClauses,
  turn: number,
  prints: Prints,
  pick: (a: string, b: string) => string,
): Partial<Record<Part, string>> {
  const out: Partial<Record<Part, string>> = {};
  for (const part of PARTS) {
    const src = c[part];
    if (src !== undefined)
      out[part] = forms(parseClause(src), turn, prints).map(said).reduce(pick);
  }
  return out;
}

const shorter = (a: string, b: string): string => (b.length < a.length ? b : a);
const longer = (a: string, b: string): string => (b.length > a.length ? b : a);

/** A wording's parts joined as `hint-words.ts`'s `sentence` joins them: the
 * first leg's sentence, and a later leg's where it has one. */
function joined(n: Partial<Record<Part, string>>, closing: string): string[] {
  const move = n.move ?? closing;
  const premise =
    n.look === undefined
      ? null
      : n.follows === undefined
        ? n.look
        : `${n.look}, so ${n.follows}`;
  let first: string;
  if (n.effect !== undefined)
    first = `${premise === null ? "" : `${premise}. `}${move}: ${n.effect}.`;
  else if (n.answers !== undefined) first = `${premise}. ${n.answers}: ${move}.`;
  else if (n.follows !== undefined) first = `${premise}: ${move}.`;
  else if (premise !== null) first = `${premise}, so ${move}.`;
  else first = `${move}.`;
  // "Working on A: " or "Working on A, ": the same length either way.
  if (n.aim !== undefined) first = `Working on ${n.aim}: ${first}`;
  return n.again === undefined
    ? [first]
    : [first, `…and ${n.later ?? move}, for ${n.again}.`];
}

/** The most `fit` turns of any part of `c`. */
const turnsOf = (c: StatedClauses): number =>
  Math.max(
    ...PARTS.map((p) =>
      c[p] === undefined ? 1 : fitTurns(parseClause(c[p] as string)),
    ),
  );

/**
 * A wording's two bounds. `shortest` is the shortest sentence of its first
 * leg on any board, each slot at its shortest: past the limit, the wording is
 * long wherever it is said. `longest` is the longest of either leg, each slot
 * at its longest and each choice taken independently, which a board may not
 * reach: within the limit, no board makes it long. Every `fit` takes its last
 * form, which a sentence takes where an earlier one would run over.
 */
function bounds(
  c: StatedClauses,
  spoken: Spoken = NO_CLAUSES,
): { shortest: string; longest: string } {
  const last = turnsOf(c) - 1;
  const short = withWords(SHORTEST, spoken.shortest);
  const long = withWords(LONGEST, spoken.longest);
  const [shortest] = joined(readings(c, last, short, shorter), short.closing);
  const longest = joined(readings(c, last, long, longer), long.closing).reduce(longer);
  return { shortest, longest };
}

/** A step's `clause` terms as they print: each the shortest and the longest
 * move of the steps it may speak. */
interface Spoken {
  readonly shortest: Readonly<Record<string, string>>;
  readonly longest: Readonly<Record<string, string>>;
}

const NO_CLAUSES: Spoken = { shortest: {}, longest: {} };

/** A word the game supplies is one of the word list's, so it reads at the
 * list's shortest and longest lengths, and a list of them at one word and at
 * three. */
const SHORT_WORD = "w".repeat(WORD_LENGTHS[0] ?? 1);
const LONG_WORD = "w".repeat(WORD_LENGTHS.at(-1) ?? 1);
const LONG_WORDS = `${LONG_WORD}, ${LONG_WORD} and ${LONG_WORD}`;

/** What the terms a wording's game supplies as words print, by name, laid
 * over `spoken`: `lists` say several words, `single` one. */
function withSuppliedWords(
  spoken: Spoken,
  lists: readonly string[],
  single: readonly string[],
): Spoken {
  if (lists.length + single.length === 0) return spoken;
  const shortest = { ...spoken.shortest };
  const longest = { ...spoken.longest };
  for (const name of [...lists, ...single]) shortest[name] = SHORT_WORD;
  for (const name of lists) longest[name] = LONG_WORDS;
  for (const name of single) longest[name] = LONG_WORD;
  return { shortest, longest };
}

const withWords = (p: Prints, words: Readonly<Record<string, string>>): Prints => ({
  ...p,
  words: { ...p.words, ...words },
});

/** What each step's `clause` terms print, the steps they speak read with
 * their own clause terms first. */
function spokenOf(steps: readonly Step[]): Map<string, Spoken> {
  const out = new Map<string, Spoken>();
  const byId = new Map(steps.map((s) => [s.id, s]));
  const of = (s: Step, seen: ReadonlySet<string>): Spoken => {
    const known = out.get(s.id);
    if (known !== undefined) return known;
    if (seen.has(s.id))
      throw new Error(`step ${s.id}: its clause terms speak it again`);
    const shortest: Record<string, string> = {};
    const longest: Record<string, string> = {};
    for (const t of s.terms) {
      if (typeof t.kind !== "object" || Array.isArray(t.kind)) continue;
      const kind = t.kind as {
        clause?: readonly string[];
        clauses?: readonly string[];
      };
      const ids = kind.clause ?? kind.clauses ?? [];
      const moves = ids.flatMap((id) => {
        const named = byId.get(id);
        if (named === undefined) return [];
        const inner = of(named, new Set([...seen, s.id]));
        return named.words.flatMap((w) => {
          const src = w.clauses.move;
          if (src === undefined) return [];
          const last = turnsOf(w.clauses) - 1;
          const read = (p: Prints, words: Readonly<Record<string, string>>) =>
            forms(parseClause(src), last, withWords(p, words)).map(said);
          return [
            {
              short: read(SHORTEST, inner.shortest).reduce(shorter),
              long: read(LONGEST, inner.longest).reduce(longer),
            },
          ];
        });
      });
      if (moves.length === 0) continue;
      shortest[t.name] = moves.map((m) => m.short).reduce(shorter);
      const long = moves.map((m) => m.long).reduce(longer);
      // A list is read at one member and at three, as a `values` term is.
      longest[t.name] =
        kind.clauses === undefined ? long : `${long}, ${long} and ${long}`;
    }
    const spoken = { shortest, longest };
    out.set(s.id, spoken);
    return spoken;
  };
  for (const s of steps) of(s, new Set());
  return out;
}

/** What is wrong with a wording's words, one line each. */
function wordDefects(c: StatedClauses, moveRing = false, keepsIsOut = false): string[] {
  const retired = keepsIsOut ? [RETIRED_PHRASE] : [RETIRED_PHRASE, IS_OUT];
  const out = new Set<string>();
  for (let turn = 0; turn < turnsOf(c); turn++)
    for (const part of PARTS) {
      const src = c[part];
      if (src === undefined) continue;
      for (const items of forms(parseClause(src), turn, LONGEST)) {
        const whole = said(items);
        for (const rule of retired) {
          const m = rule.exec(whole);
          if (m !== null)
            out.add(`${part} says "${m[0]}", a retired phrase: "${whole}"`);
        }
        // Literal words between references, as the render lints them.
        let lit = "";
        const lits: string[] = [];
        for (const i of items)
          if ("text" in i) lit += i.text;
          else {
            lits.push(lit);
            lit = "";
          }
        lits.push(lit);
        for (const l of lits) {
          const why = unboundDefect(l);
          if (why !== null) out.add(`${part}: ${why}`);
        }
        // A deictic noun said in two roles does not say which is which.
        const refs = items.filter(
          (i): i is Extract<Item, { role: string }> => "role" in i,
        );
        const deictic = new Map<string, Set<string>>();
        for (const r of refs) {
          const noun = /^(?:this|these|those|that)\s+(.+)$/i.exec(r.words)?.[1];
          if (noun === undefined) continue;
          const key = noun.toLowerCase().replace(/s$/, "");
          deictic.set(key, (deictic.get(key) ?? new Set()).add(r.role));
        }
        for (const r of refs) {
          const role = DRAWN[r.role];
          const adj = adjectiveDefect(role, r.words);
          if (adj !== null) out.add(`${part}: ${adj}`);
          // A ring of sort `move` is the move itself, as the voice draws it.
          const kind = moveRing && r.role === "ring" ? "move" : "cell";
          const why = judge(
            { kind: { name: kind, key: String } },
            r.words,
            null,
            (noun) => (deictic.get(noun)?.size ?? 0) > 1,
          );
          if (why !== null)
            out.add(`${part}: its ${r.role} reference "${r.words}" ${why}`);
        }
      }
    }
  return [...out];
}

/** Every wording a description states, each named by where. */
function wordingsIn(
  file: DescriptionFile,
): { where: string; w: Wording; moveRing?: boolean; spoken?: Spoken }[] {
  const out: { where: string; w: Wording; moveRing?: boolean; spoken?: Spoken }[] = [];
  const technique = (id: string, t: StatedTechnique): void => {
    const says = parseTechnique("", id, t).says;
    if (says === null) return;
    for (const v of says.variants) {
      const lists = v.terms.filter((x) => x.supplied === "words").map((x) => x.name);
      const spoken = withSuppliedWords(NO_CLAUSES, lists, []);
      for (const w of v.words) out.push({ where: id, w, spoken });
    }
    for (const w of says.fact?.words ?? []) out.push({ where: id, w });
  };
  if (isLibrary(file))
    for (const [id, t] of Object.entries(file.techniques)) technique(id, t);
  else if (isFormal(file))
    for (const t of withEveryVariation(file).techniques ?? [])
      if (!("use" in t)) technique(t.id, t);
  const steps = "steps" in file ? (file.steps ?? {}) : {};
  const parsed = stepsOf(steps, (_, src) => parse(src));
  const spoken = spokenOf(parsed);
  for (const s of parsed) {
    const words = s.terms.filter((t) => t.kind === "word").map((t) => t.name);
    const said = withSuppliedWords(spoken.get(s.id) ?? NO_CLAUSES, [], words);
    for (const w of s.words)
      out.push({ where: "", w, moveRing: s.ring === "move", spoken: said });
  }
  return out;
}

/** What the wordings of `file` should change: words the render would refuse,
 * a wording long on every board with no `long`, and a `long` on wordings no
 * board makes long. */
function wordingFindings(file: DescriptionFile): Finding[] {
  const out: Finding[] = [];
  const needed = new Map<string, boolean>();
  const keepsIsOut = "produces" in file && file.produces === KEEPS_IS_OUT_PRODUCES;
  for (const { where: id, w, moveRing, spoken } of wordingsIn(file)) {
    const where = id === "" ? w.label : `${id} ${w.label}`;
    for (const message of wordDefects(w.clauses, moveRing === true, keepsIsOut))
      out.push({ where, error: true, message });
    const { shortest, longest } = bounds(w.clauses, spoken);
    const at = w.long === null ? null : id === "" ? w.long.at : `${id} ${w.long.at}`;
    if (at !== null && !needed.has(at)) needed.set(at, false);
    if (at !== null && longest.length > NARRATION_LIMIT) needed.set(at, true);
    if (at === null && shortest.length > NARRATION_LIMIT)
      out.push({
        where,
        error: true,
        message: `runs to ${shortest.length} characters at its shortest, past the ${NARRATION_LIMIT} a sentence may take: shorten it, give a part a shorter {fit: …} form, or say why it needs the room with long: ("${shortest}")`,
      });
  }
  for (const [at, used] of needed)
    if (!used)
      out.push({
        where: at,
        error: true,
        message: `says long:, and every wording it covers fits ${NARRATION_LIMIT} characters: take it out`,
      });
  return out;
}

/** The binders `e` holds, outermost first. */
function bindersIn(e: Expr): Binder[] {
  switch (e.k) {
    case "quant":
    case "agg":
      return [
        ...e.binders,
        ...e.binders.flatMap((b) => [
          ...bindersIn(b.of),
          ...(b.where ? bindersIn(b.where) : []),
        ]),
        ...(e.k === "agg" && e.where ? bindersIn(e.where) : []),
        ...(e.k === "agg" && e.term ? bindersIn(e.term) : []),
        ...(e.k === "quant" ? bindersIn(e.body) : []),
      ];
    case "call":
      return e.args.flatMap(bindersIn);
    case "set":
      return e.elems.flatMap(bindersIn);
    case "size":
    case "not":
    case "neg":
      return bindersIn(e.of);
    case "bin":
      return [...bindersIn(e.a), ...bindersIn(e.b)];
    case "with":
      return [...bindersIn(e.cell), ...bindersIn(e.value), ...bindersIn(e.body)];
    default:
      return [];
  }
}

function conjuncts(e: Expr): Expr[] {
  return e.k === "bin" && e.op === "and" ? [...conjuncts(e.a), ...conjuncts(e.b)] : [e];
}

function names(e: Expr, x: string): boolean {
  switch (e.k) {
    case "name":
      return e.name === x;
    case "num":
      return false;
    default:
      return JSON.stringify(e).includes(`"name":"${x}"`);
  }
}

/** A call's source, short: `adj4(d)`. */
function show(e: Expr): string {
  if (e.k === "name") return e.name;
  if (e.k === "call") return `${e.fn}(${e.args.map(show).join(", ")})`;
  if (e.k === "num") return String(e.v);
  return "…";
}

/** Where a binder over the whole board, `x in cells`, keeps only elements
 * near another (`x in adj4(d)`, or `exists d in D: x in adj4(d)`): the
 * compiled code reads every square of the board for each binding of what
 * encloses it, where the local form reads only the squares beside. */
function wholeBoardReads(e: Expr, where: string): Finding[] {
  const out: Finding[] = [];
  for (const b of bindersIn(e)) {
    if (
      b.kind !== "in" ||
      b.of.k !== "name" ||
      b.of.name !== "cells" ||
      b.where === null
    )
      continue;
    const x = b.name;
    for (const c of conjuncts(b.where)) {
      let local: string | null = null;
      if (
        c.k === "bin" &&
        c.op === "in" &&
        c.a.k === "name" &&
        c.a.name === x &&
        !names(c.b, x)
      )
        local = `${x} in ${show(c.b)}`;
      else if (c.k === "quant" && c.q === "exists" && c.binders.length === 1) {
        const d = c.binders[0];
        const inner = conjuncts(c.body).find(
          (q) =>
            q.k === "bin" &&
            q.op === "in" &&
            q.a.k === "name" &&
            q.a.name === x &&
            !names(q.b, x),
        );
        if (inner !== undefined && d.kind === "in" && inner.k === "bin")
          local = `${x} in set(q over ${d.name} in ${show(d.of)}, q in ${show(inner.b)})`;
      }
      if (local === null) continue;
      out.push({
        where,
        error: false,
        message: `"${x} in cells where …" keeps only ${x} near another, and reads the whole board each time: bind ${local}, which reads only what is near (the elements then come in that order, and a firing's order is behavior)`,
      });
      break;
    }
  }
  return out;
}

/** Every formula of `file`, by where, for a check of its shape. */
function formulasIn(file: DescriptionFile): { where: string; e: Expr }[] {
  const out: { where: string; e: Expr }[] = [];
  const add = (where: string, src?: string, binders = false): void => {
    if (src === undefined) return;
    try {
      out.push({
        where,
        e: binders
          ? {
              k: "quant",
              q: "exists",
              binders: parseBinders(src),
              body: { k: "num", v: 1 },
            }
          : parse(src),
      });
    } catch {
      // What does not parse, the compiler refuses with its own message.
    }
  };
  if ("define" in file)
    for (const [head, body] of Object.entries(file.define ?? {}))
      add(`define ${head}`, body);
  const technique = (id: string, t: StatedTechnique): void => {
    add(`${id} for`, t.for, true);
    add(`${id} premise`, t.premise);
    add(`${id} conclude`, t.conclude);
    for (const [n, src] of Object.entries(t.says?.terms ?? {}))
      if (typeof src === "string") add(`${id} says ${n}`, src);
    for (const [role, src] of Object.entries(t.says?.marks ?? {}))
      if (typeof src === "string") add(`${id} says ${role}`, src);
  };
  if (isLibrary(file))
    for (const [id, t] of Object.entries(file.techniques)) technique(id, t);
  else if (isFormal(file))
    for (const t of withEveryVariation(file).techniques ?? [])
      if (!("use" in t)) technique(t.id, t);
  return out;
}

/** What `npm run describe` reports of `file`. */
export function lintDescription(file: DescriptionFile): Finding[] {
  if (isPlanning(file)) return wordingFindings(file);
  return [
    ...wordingFindings(file),
    ...formulasIn(file).flatMap(({ where, e }) => wholeBoardReads(e, where)),
  ];
}
