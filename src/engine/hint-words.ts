/**
 * A hint's words and its marks, bound together: the engine's vocabulary for the
 * marks a step draws, and the sentence builder that makes every reference to a
 * mark carry the mark's elements.
 *
 * A step's sentence is a {@link Narration}: literal words and **references**,
 * each naming a role, the kind of element it is drawn on and the elements
 * themselves. What a step draws is then something its words can be checked
 * against (`testing/hint-binding.ts`), and a caller that derives the drawing
 * from the references (the candidate walk) cannot draw anything the sentence
 * does not name.
 *
 * **The literal words may not say what only a reference may.** {@link phrase}
 * refuses a string part that uses a role's adjective or the deictic "this" /
 * "these", so "the striped row" can be written only as a reference to stripes,
 * and "this cell" only as a reference to something drawn. A template's literal
 * parts are fixed per call site, so one test reaching a call site checks it for
 * good.
 */

import type { RivalsLost } from "./rival-judging.ts";
import type { Point } from "./types.ts";

/** What a mark means. The engine owns the three, and a game adds one only when
 * none fits, saying why in its change. */
export type MarkRole = "ring" | "outline" | "stripes";

interface MarkRoleWords {
  /** The mark, as a thing: "ring". */
  readonly noun: string;
  /** A marked element, described: "the ringed square". */
  readonly adjective: string;
  /** What the mark says about the element, in every game. */
  readonly means: string;
  /** How the help's list of marks opens its entry: "**A ring** marks …". */
  readonly listed: readonly [lead: string, verb: string];
}

const MARK_ROLES: Readonly<Record<MarkRole, MarkRoleWords>> = {
  ring: {
    noun: "ring",
    adjective: "ringed",
    means: "what the step decides",
    listed: ["A ring", "marks"],
  },
  outline: {
    noun: "outline",
    adjective: "outlined",
    means: "what the step reasons from",
    listed: ["An outline", "marks"],
  },
  stripes: {
    noun: "stripes",
    adjective: "striped",
    means: "the line or region the sentence names",
    listed: ["Stripes", "mark"],
  },
};

/** Where a bound game's help page puts its list of marks; the help build
 * replaces it with {@link legendMarkdown}. */
export const HINT_MARKS_PLACEHOLDER = "{{hint-marks}}";

/**
 * The Hints help section's list of marks for a game whose legend says what each
 * role marks there (`Game.hintMarks.roles`), one entry per role, in the
 * engine's order and the engine's words for the role.
 */
export function legendMarkdown(roles: Partial<Record<MarkRole, string>>): string {
  return (Object.keys(MARK_ROLES) as MarkRole[])
    .filter((r) => roles[r] !== undefined)
    .map((r) => {
      const [lead, verb] = MARK_ROLES[r].listed;
      return `* **${lead}** ${verb} ${roles[r]}`;
    })
    .join("\n");
}

/** Adjectives the collection used for marks before the roles were fixed. A
 * bound sentence never says them: each named a mark that now has a role's word.
 * "Shaded" is not among them although it once named a mark, because in a
 * shading genre it is what the rules call a cell's state (Bricks: "each shaded
 * cell must have one below it"), and a hint speaks the rules' words. */
const RETIRED_ADJECTIVES = ["hatched", "highlighted"] as const;

const ROLE_ADJECTIVES = Object.values(MARK_ROLES).map((r) => r.adjective);

/** A literal that says what only a reference may. */
const UNBOUND = new RegExp(
  `\\b(?:this|these|${[...ROLE_ADJECTIVES, ...RETIRED_ADJECTIVES].join("|")})\\b`,
  "i",
);

/**
 * What a mark is drawn on. A kind keys its elements, so the same edge named
 * from either side, or a cell with an ordinal and without, compares equal, and
 * says what a noun counts: three struck notes in one cell are "this cell".
 */
export interface MarkKind<E> {
  readonly name: string;
  key(e: E): string;
  /** The unit a noun about these elements counts. Default: the element. */
  unit?(e: E): string;
  /** The element of another kind this one is drawn inside, as that kind's name
   * and key. A mark on this element marks that one with it, and naming this
   * one names that one: a struck note's ring is its cell's. */
  within?(e: E): { kind: string; key: string };
}

const pointKey = (p: Point): string => `${p.x},${p.y}`;

/** A square of the board. */
export const CELL: MarkKind<Point> = { name: "cell", key: pointKey };

/** A candidate note: value `n` in the cell at `(x, y)`. A noun about notes
 * counts their cells. */
export type Note = Point & { readonly n: number };

export const NOTE: MarkKind<Note> = {
  name: "note",
  key: (m) => `${m.x},${m.y}:${m.n}`,
  unit: pointKey,
  within: (m) => ({ kind: "cell", key: pointKey(m) }),
};

/** `kind`'s elements taken together as one thing, so a noun about them is
 * singular: a cage, a row, a region is "this cage" over all its cells. Keys are
 * `kind`'s, so the marks compare equal to the cells drawn. */
export function whole<E>(kind: MarkKind<E>): MarkKind<E> {
  return { ...kind, key: (e) => kind.key(e), unit: () => "" };
}

/** The step's own move, as one element. A renderer that finds it among a
 * step's ring marks draws the move the way it draws any move, so words can
 * leave the move to the board ({@link mark.move}). */
export const MOVE: MarkKind<"move"> = { name: "move", key: () => "move" };

/** One mark a step draws: a role, over some elements of one kind. */
export interface MarkRef<E = unknown> {
  readonly role: MarkRole;
  readonly kind: MarkKind<E>;
  readonly elements: readonly E[];
}

/** A reference in a sentence: a mark, and the words that name it, which may
 * depend on its elements so that a narrowed reference re-renders. */
interface Reference<E> extends MarkRef<E> {
  words(elements: readonly E[]): string;
}

type Part = string | Reference<unknown>;

function lint(s: string): void {
  const m = UNBOUND.exec(s);
  if (m)
    throw new Error(
      `hint words: "${m[0]}" in "${s}" must be a reference to a mark (hint-words.ts's mark.*)`,
    );
}

/** The adjectives of every role but `role`, and the retired ones: words a
 * reference to `role` may not use. */
function checkAdjective(role: MarkRole, s: string): void {
  for (const other of Object.keys(MARK_ROLES) as MarkRole[]) {
    if (other === role) continue;
    const adj = MARK_ROLES[other].adjective;
    if (new RegExp(`\\b${adj}\\b`, "i").test(s))
      throw new Error(`hint words: a ${role} reference says "${adj}" in "${s}"`);
  }
  for (const adj of RETIRED_ADJECTIVES) {
    if (new RegExp(`\\b${adj}\\b`, "i").test(s))
      throw new Error(`hint words: "${adj}" is no mark's word, in "${s}"`);
  }
}

/** How many units a noun about `elements` counts. */
function unitCount<E>(kind: MarkKind<E>, elements: readonly E[]): number {
  const unit = kind.unit?.bind(kind) ?? kind.key.bind(kind);
  return new Set(elements.map(unit)).size;
}

/**
 * A sentence, or part of one: literal words and references to marks.
 * Immutable; {@link phrase} composes narrations and {@link Narration.narrow}
 * returns a new one.
 */
export class Narration {
  protected constructor(protected readonly parts: readonly Part[]) {}

  /** The same kind of narration over other parts: a {@link Sentence} keeps its
   * form through a narrow or a capitalization. */
  protected remade(parts: readonly Part[]): this {
    return new Narration(parts) as this;
  }

  /** A narration's parts, for a subclass building on another narration. */
  protected static partsOf(n: Narration): readonly Part[] {
    return n.parts;
  }

  /** Literal words and no reference. Linted like {@link phrase}'s parts. */
  static plain(s: string): Narration {
    lint(s);
    return new Narration(s ? [s] : []);
  }

  /** A single reference. */
  static ref<E>(ref: Reference<E>): Narration {
    checkAdjective(ref.role, ref.words(ref.elements));
    return new Narration([ref as Reference<unknown>]);
  }

  /** @internal {@link phrase}'s join: parts already linted. */
  static join(pieces: readonly (string | Narration)[]): Narration {
    const out: Part[] = [];
    for (const p of pieces) {
      for (const q of typeof p === "string" ? [p] : p.parts) {
        const last = out[out.length - 1];
        if (typeof q === "string" && typeof last === "string")
          out[out.length - 1] = last + q;
        else if (q !== "") out.push(q);
      }
    }
    return new Narration(out);
  }

  get text(): string {
    return this.parts
      .map((p) => (typeof p === "string" ? p : p.words(p.elements)))
      .join("");
  }

  /** Every mark the words name, in the order they name them; a reference whose
   * elements a {@link narrow} emptied names none. */
  get refs(): MarkRef[] {
    return this.parts.filter(
      (p): p is Reference<unknown> => typeof p !== "string" && p.elements.length > 0,
    );
  }

  /** The same words over fewer elements: each reference keeps the elements
   * `keep` accepts, and one whose words depend on its elements re-renders. A
   * reference `keep` empties keeps its last words and names nothing. */
  narrow(keep: (role: MarkRole, kind: string, key: string) => boolean): this {
    return this.remade(
      this.parts.map((p) => {
        if (typeof p === "string") return p;
        const elements = p.elements.filter((e) =>
          keep(p.role, p.kind.name, p.kind.key(e)),
        );
        if (elements.length === p.elements.length) return p;
        if (elements.length === 0) {
          const frozen = p.words(p.elements);
          return { ...p, elements, words: () => frozen };
        }
        return { ...p, elements };
      }),
    );
  }

  /** The same words with the first letter capitalized, for a reference that
   * opens a sentence. */
  capitalized(): this {
    const [first, ...rest] = this.parts;
    if (first === undefined) return this;
    if (typeof first === "string")
      return this.remade([first.charAt(0).toUpperCase() + first.slice(1), ...rest]);
    return this.remade([
      { ...first, words: (els) => capitalize(first.words(els)) },
      ...rest,
    ]);
  }
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Compose a sentence: literal words, numbers, and narrations (a reference, or a
 * premise built earlier), so `` phrase`${premise}, so ${conclusion}.` `` carries
 * both halves' marks. Every string part, literal or interpolated, is linted.
 */
export function phrase(
  strings: TemplateStringsArray,
  ...values: readonly (string | number | Narration)[]
): Narration {
  const pieces: (string | Narration)[] = [];
  strings.forEach((s, i) => {
    lint(s);
    pieces.push(s);
    if (i < values.length) {
      const v = values[i];
      if (typeof v === "number") pieces.push(String(v));
      else if (typeof v === "string") {
        lint(v);
        pieces.push(v);
      } else pieces.push(v);
    }
  });
  return Narration.join(pieces);
}

/**
 * How a step's move stands to the reasoning before it. The engine writes the
 * words that join them, one fixed form per relation (owner, 2026-10-02), so
 * the collection says each relation one way:
 *
 * - `forced`: the look narrows the move to one. "L, so M." A searching hint's
 *   rivals are as good as its move unless judged, so there it carries the
 *   proof that they were, which only `rival-judging.ts`'s `judgeRivals` makes;
 *   the hint-quality walk fails a searching hint's "so" without it.
 * - `oneOf`: the move is one of several the look describes. "L. One of them: M."
 * - `answers`: the move answers a danger the look names, in the game's words
 *   for how. "L. One way to save it: M."
 * - `effect`: the move, then what it does, for a move no rule forces.
 *   "L. M: E."
 * - `sequence`: a move in a run the look announces. "L. First, M." then
 *   "Next, L, M." and "Last, L, M.", where a later look says what the run is for.
 * - `again`: a journey's later leg, forced by the reasoning the first leg gave.
 *   "…and M, for B."
 * - `serves`: the move toward a subgoal, with nothing else to say. Only with
 *   an aim.
 */
export type Relation =
  | { readonly kind: "forced"; readonly rivals?: RivalsLost }
  | { readonly kind: "oneOf" }
  | { readonly kind: "answers"; readonly how: string }
  | { readonly kind: "effect"; readonly effect: Narration }
  | {
      readonly kind: "sequence";
      readonly at: "first" | "next" | "last";
      readonly effect?: Narration;
    }
  | { readonly kind: "again"; readonly basis: Narration }
  | { readonly kind: "serves" };

/** A step's words, in their parts (docs/games/hints.md § "A sentence has
 * parts"): what to look at, what follows, the move, and how the move stands to
 * them. The game writes the parts; {@link sentence} joins them. */
export interface Said {
  /** A stable subgoal, said first: "Working on tile 3:". */
  readonly aim?: Narration;
  /** What to look at, and whatever follows inside the same words. */
  readonly look?: Narration;
  /** A consequence of the look that the move rests on: "L, so F: M." */
  readonly follows?: Narration;
  /** The action or the forced state, as it reads mid-sentence. */
  readonly move: Narration;
  readonly relation: Relation;
}

/**
 * The steps that cannot take the parts, by why. The engine owns the list, and
 * each kind has a property the hint-quality walk checks on the step:
 *
 * - `bare`: nothing to say but the move. Its words name only ring marks, since
 *   evidence on the board would be a look to say.
 * - `setup`: the method's opening procedure, not a deduction (pencil every
 *   candidate in, clear the easy ones). Its words name no outline or stripes.
 * - `evident`: a look alone, whose ringed squares and the board say what to do.
 *   Its words name a ring.
 */
export type Unshaped = "bare" | "setup" | "evident";

/** What a {@link Sentence} was built as. */
export type Form =
  | { readonly relation: Relation["kind"]; readonly rivals?: "lost" }
  | { readonly unshaped: Unshaped };

/**
 * A step's words: a narration built from its parts by {@link sentence}, or
 * declared an exception by {@link unshaped}. Only those two make one, so a step
 * cannot carry words that skipped the parts. It keeps its form through
 * {@link Narration.narrow} and {@link Narration.capitalized}.
 */
export class Sentence extends Narration {
  private constructor(
    parts: readonly Part[],
    readonly form: Form,
  ) {
    super(parts);
  }

  protected override remade(parts: readonly Part[]): this {
    return new Sentence(parts, this.form) as this;
  }

  /** @internal {@link sentence} and {@link unshaped}'s constructor. */
  static of(words: Narration, form: Form): Sentence {
    return new Sentence(Narration.partsOf(words), form);
  }
}

/** The look, with what follows from it. */
function premiseOf(said: Said): Narration | null {
  if (!said.look) return null;
  return said.follows ? phrase`${said.look}, so ${said.follows}` : said.look;
}

/** The parts, joined in the relation's words. */
function compose(said: Said): Narration {
  const { move, relation: r } = said;
  const premise = premiseOf(said);
  if (said.follows && !said.look)
    throw new Error("hint sentence: follows without a look");
  const opened = (rest: Narration): Narration =>
    premise ? phrase`${premise}. ${rest.capitalized()}` : rest;
  switch (r.kind) {
    case "forced":
      if (!said.look) throw new Error("hint sentence: forced needs a look");
      return said.follows
        ? phrase`${premise as Narration}: ${move}.`
        : phrase`${said.look}, so ${move}.`;
    case "oneOf":
      if (!premise) throw new Error("hint sentence: oneOf needs a look");
      return phrase`${premise}. One of them: ${move}.`;
    case "answers":
      if (!premise) throw new Error("hint sentence: answers needs a look");
      return phrase`${premise}. ${r.how}: ${move}.`;
    case "effect":
      return opened(phrase`${move}: ${r.effect}.`);
    case "sequence": {
      const tail = r.effect ? phrase`${move}: ${r.effect}.` : phrase`${move}.`;
      if (r.at === "first") return opened(phrase`First, ${tail}`);
      const lead = r.at === "next" ? "Next" : "Last";
      if (said.follows) throw new Error("hint sentence: a later leg has no follows");
      return said.look
        ? phrase`${lead}, ${said.look}, ${tail}`
        : phrase`${lead}, ${tail}`;
    }
    case "again":
      if (premise)
        throw new Error("hint sentence: a later leg's look is its first leg's");
      return phrase`…and ${move}, for ${r.basis}.`;
    case "serves":
      if (!said.aim) throw new Error("hint sentence: serves needs an aim");
      return opened(phrase`${move}.`);
  }
}

/** A step's words, from its parts. */
export function sentence(said: Said): Sentence {
  const body = compose(said);
  const words = said.aim ? phrase`Working on ${said.aim}: ${body}` : body.capitalized();
  const r = said.relation;
  const form: Form =
    r.kind === "forced" && r.rivals
      ? { relation: r.kind, rivals: "lost" }
      : { relation: r.kind };
  return Sentence.of(words, form);
}

/** The common case: the look forces the move. "L, so M.", or with what follows
 * from the look, "L, so F: M." */
export function so(parts: Omit<Said, "relation">): Sentence {
  return sentence({ ...parts, relation: { kind: "forced" } });
}

/** A step's words that cannot take the parts, declared with why
 * ({@link Unshaped}). */
export function unshaped(words: Narration, kind: Unshaped): Sentence {
  return Sentence.of(words, { unshaped: kind });
}

/** A noun's two forms; a bare string pluralizes with "s". */
export type Noun = string | readonly [singular: string, plural: string];

function nounFor(noun: Noun, plural: boolean): string {
  if (typeof noun === "string") return plural ? `${noun}s` : noun;
  return plural ? noun[1] : noun[0];
}

/** Determiners that take a singular noun over several elements ("either
 * outlined tile", "each ringed cell"). */
const SINGULAR_DETERMINERS = new Set(["either", "each", "every", "neither"]);

/** The references a sentence makes to its marks. */
export const mark = {
  /** Deixis: "this cell", "these cells". */
  this<E>(
    role: MarkRole,
    kind: MarkKind<E>,
    elements: readonly E[],
    noun: Noun,
  ): Narration {
    return Narration.ref({
      role,
      kind,
      elements,
      words: (els) => {
        const many = unitCount(kind, els) > 1;
        return `${many ? "these" : "this"} ${nounFor(noun, many)}`;
      },
    });
  },

  /** A role's adjective on a noun: "the outlined squares", "either outlined
   * tile". A singular determiner keeps the noun singular. */
  the<E>(
    role: MarkRole,
    kind: MarkKind<E>,
    elements: readonly E[],
    noun: Noun,
    det = "the",
  ): Narration {
    const adj = MARK_ROLES[role].adjective;
    return Narration.ref({
      role,
      kind,
      elements,
      words: (els) => {
        const many = !SINGULAR_DETERMINERS.has(det) && unitCount(kind, els) > 1;
        return `${det} ${adj} ${nounFor(noun, many)}`;
      },
    });
  },

  /** Words with the role in brackets after them: "its bulbs (ringed)". */
  paren<E>(
    role: MarkRole,
    kind: MarkKind<E>,
    elements: readonly E[],
    words: string,
  ): Narration {
    const adj = MARK_ROLES[role].adjective;
    return Narration.ref({ role, kind, elements, words: () => `${words} (${adj})` });
  },

  /** Words that ask for the step's move without spelling it out, where the
   * board makes it obvious ("go back for it"): a ring on the whole move. */
  move(words: string): Narration {
    return mark.as("ring", MOVE, ["move"], words);
  },

  /** Any other words that name a mark: a clue by its value ("clue 3"), "the
   * other cells they pass through". Words that are a function of the elements
   * re-render when the reference is narrowed. */
  as<E>(
    role: MarkRole,
    kind: MarkKind<E>,
    elements: readonly E[],
    words: string | ((elements: readonly E[]) => string),
  ): Narration {
    const render = typeof words === "string" ? () => words : words;
    return Narration.ref({
      role,
      kind,
      elements,
      words: (els) => {
        const s = render(els);
        checkAdjective(role, s);
        return s;
      },
    });
  },
};

/** "it" or "them", agreeing with how many units `elements` are. */
export function pronoun<E>(kind: MarkKind<E>, elements: readonly E[]): string {
  return unitCount(kind, elements) > 1 ? "them" : "it";
}

/**
 * The marks a step's words name, as its renderer reads them. A bound game's
 * `redraw` takes every hint mark from here and from nowhere else, so a mark is
 * painted exactly when the words name it (`testing/hint-binding.ts` holds the
 * frame to that).
 */
export class StepMarks {
  static readonly NONE = new StepMarks([]);
  private readonly byPair = new Map<string, unknown[]>();

  private constructor(private readonly refs: readonly MarkRef[]) {}

  /** The marks `words` name; none when there are no words. */
  static of(words?: Narration): StepMarks {
    if (!words) return StepMarks.NONE;
    let m = cache.get(words);
    if (!m) {
      m = new StepMarks(words.refs);
      cache.set(words, m);
    }
    return m;
  }

  /** The elements of `kind` the words name in `role`, each once by the kind's
   * key, in the order the words first name them, as they were named (an
   * outlined cell keeps its chain ordinal). */
  of<E>(role: MarkRole, kind: MarkKind<E>): readonly E[] {
    const pair = `${role}|${kind.name}`;
    let out = this.byPair.get(pair);
    if (!out) {
      out = [];
      const seen = new Set<string>();
      for (const r of this.refs) {
        if (r.role !== role || r.kind.name !== kind.name) continue;
        for (const e of r.elements as readonly E[]) {
          const k = kind.key(e);
          if (seen.has(k)) continue;
          seen.add(k);
          out.push(e);
        }
      }
      this.byPair.set(pair, out);
    }
    return out as readonly E[];
  }
}

const cache = new WeakMap<Narration, StepMarks>();

/** The marks a displayed hint step's words name; none when no step is shown. */
export function stepMarks(step?: { readonly words?: Narration } | null): StepMarks {
  return StepMarks.of(step?.words);
}

/** Every element `refs` mark, as `role|kind|key`, with the element each one is
 * drawn inside ({@link MarkKind.within}) marked in the same role. */
export function markKeys(refs: readonly MarkRef[]): Set<string> {
  const out = new Set<string>();
  for (const r of refs)
    for (const e of r.elements) {
      out.add(`${r.role}|${r.kind.name}|${r.kind.key(e)}`);
      const w = r.kind.within?.(e);
      if (w) out.add(`${r.role}|${w.kind}|${w.key}`);
    }
  return out;
}
