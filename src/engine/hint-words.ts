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
 * bound sentence never says them: each named a mark that now has a role's word. */
const RETIRED_ADJECTIVES = ["hatched", "shaded", "highlighted"] as const;

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
  private constructor(private readonly parts: readonly Part[]) {}

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
  narrow(keep: (role: MarkRole, kind: string, key: string) => boolean): Narration {
    return new Narration(
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
  capitalized(): Narration {
    const [first, ...rest] = this.parts;
    if (first === undefined) return this;
    if (typeof first === "string")
      return new Narration([first.charAt(0).toUpperCase() + first.slice(1), ...rest]);
    return new Narration([
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
