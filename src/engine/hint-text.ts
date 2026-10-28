/**
 * The sentences the collection's hints share, and the English they are built
 * from.
 *
 * A game's own sentences live in its `hint-text.ts`; these are the ones several
 * games speak word for word, so a wording pass on them lands once: the generic
 * Latin arms (Keen, Unequal, Group, Salad), the candidate games' two setup
 * steps and the conclusions
 * their strikes end in, the sliding-tile
 * games' "Working on tile N:" prefix, the border-grid games' later legs, and
 * the helpers that join a list or
 * choose "a" or "an". Which sentence a step speaks is decided by
 * the deduction (`latin-hint.ts`, `candidate-hint.ts` and each game's hint);
 * nothing here decides anything.
 */

import { EDGE, type ForcedBorderEdge } from "./border-grid-hint.ts";
import {
  CELL,
  mark,
  type Narration,
  NOTE,
  type Note,
  phrase,
  type Sentence,
  sentence,
  so,
  unshaped,
  whole,
} from "./hint-words.ts";
import { type GenericLatinReason, hiddenSingleLine } from "./latin-hint.ts";
import type { Point } from "./types.ts";

// --- lists and articles ------------------------------------------------------

/** Join a value list for narration: `[3]`→"3", `[1,2]`→"1 and 2",
 * `[1,2,3]`→"1, 2 and 3". */
export function joinNums(ns: number[]): string {
  if (ns.length <= 1) return `${ns[0] ?? ""}`;
  if (ns.length === 2) return `${ns[0]} and ${ns[1]}`;
  return `${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}`;
}

/** {@link joinNums} over already-rendered values: `["A","B"]` → "A and B". */
export function joinWith(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** "a" or "an" for `s` — chosen by how the *word* is pronounced, so a letter
 * value ("an A", "a B") and a digit ("a 6", "an 8") both read correctly. The
 * `dup` arm below says "There's already a …", which without this reads "a A" /
 * "a 8". `capital` gives the form that opens a sentence. */
export function indefinite(s: string, capital = false): string {
  const a = /^(?:[aefhilmnorsx]|8|11|18)/i.test(s) ? "an" : "a";
  return capital ? `${a.charAt(0).toUpperCase()}${a.slice(1)}` : a;
}

/** {@link joinWith} for **alternatives**: "1 or 2", "1, 2 or 3". A list of
 * candidates, or a list under a negation ("no room for …"), means "any one of
 * these", which "and" would turn into "all of them at once". */
export function joinOr(parts: readonly (string | number)[]): string {
  if (parts.length <= 1) return `${parts[0] ?? ""}`;
  return `${parts.slice(0, -1).join(", ")} or ${parts[parts.length - 1]}`;
}

/** Each value once, in order. */
const distinct = (ns: number[]): number[] => [...new Set(ns)].sort((a, b) => a - b);

// --- the sliding-tile games' goal prefix -------------------------------------
//
// The sliding-tile games (Fifteen, Sixteen, Netslide) name the tile a step works
// toward home as the sentence's aim (`hint-words.ts`'s `Said.aim`, "Working on
// tile N:") and then state the tactic, so the player always sees the goal
// behind a move, even when the tile being slid is only clearing the way. A move
// that lands its tile in the solved cell is a **home** move; one that only
// repositions toward a later home is a **staging** move (marked with
// `HINT_SETTING_UP`).

/** Shared marker appended to a staging move (one that does not yet land
 * its tile in its final spot). */
export const HINT_SETTING_UP = "(setting up)";

// --- the border-grid games' later legs ---------------------------------------

/**
 * A later leg of a firing that sets several edges (Palisade, Separate): short
 * and kind-specific, because the first leg gave the full reason. It still names
 * what the leg shows: the edges it rings, `left`, and `basis`, the evidence the
 * first leg reasoned from ("the same striped region", "clue 3").
 */
export function edgeContinuation(
  left: readonly ForcedBorderEdge[],
  basis: Narration,
): Sentence {
  const edges = mark.this("ring", EDGE, left, "edge");
  const many = left.length > 1;
  const move =
    left[0].kind === "wall"
      ? phrase`${edges} must be ${many ? "walls" : "a wall"} too`
      : phrase`${edges} can't be ${many ? "walls" : "a wall"} either`;
  return sentence({ move, relation: { kind: "again", basis } });
}

// --- the candidate games' setup steps ---------------------------------------

/** Narration for the populate opener — shared verbatim across the candidate
 * games modulo the game's own noun ("number", "height", …). Undead's opener
 * ("penciling every monster into…") is structurally different and stays
 * game-local. */
export function populateText(noun: string, cell = "cell"): string {
  return `Start by penciling every candidate ${noun} into each empty ${cell}, so there is something to cross out.`;
}

/** Narration for the obvious-cleanup step, parameterized by the game's noun,
 * its placement verb ("standing", "placed"), its region phrase ("row or
 * column", "row, column or block") — and what it calls a board position, which
 * defaults to "cell" but is Salad's "square" (see {@link populateText}: the two
 * setup strings and the generic narration arms must agree, or one game's hints
 * read in two vocabularies). */
export function cleanObviousText(
  noun: string,
  placedVerb: string,
  regions: string,
  cell = "cell",
): (marks: readonly Note[]) => Sentence {
  // Says nothing about the "fill all pencil marks" button doing this same
  // cleanup: help/features.md says so once (docs/hints.md § "Rules belong
  // in the help"). The notes it names are the ones it strikes.
  return (marks) =>
    unshaped(
      phrase`Now clear the easy ones: cross out ${mark.as("strike", NOTE, marks, `any ${noun} already ${placedVerb} in its ${cell}'s ${regions}`)}.`,
      "setup",
    );
}

/**
 * Narration for a note step under the implicit reading: a blank cell with no
 * notes gets the candidates its regions leave it, written down because the
 * deduction that follows strikes them or rests on them. `values` are already
 * rendered; the words are those of {@link cleanObviousText}, which states the
 * same rule for a board that has every note. `every` says the regions rule
 * nothing out yet, where "only" would list every value as if it were a finding.
 */
export function noteText(
  at: Point,
  values: readonly string[],
  every: boolean,
  vocab: { noun: string; placedVerb: string; regions: string; cell?: string },
): Sentence {
  const { noun, placedVerb, regions } = vocab;
  const here = thisCell(at, vocab.cell);
  // The noun is a word ("element"), not a letter name, so `indefinite` would
  // misread it ("an number").
  const a = /^[aeiou]/i.test(noun) ? "an" : "a";
  if (every)
    return so({
      look: phrase`Nothing in ${here}'s ${regions} rules out ${a} ${noun} yet`,
      move: phrase`pencil in every one`,
    });
  const one = values.length === 1;
  return so({
    look: phrase`Only ${joinWith([...values])} ${one ? "isn't" : "aren't"} already ${placedVerb} in ${here}'s ${regions}`,
    move: phrase`pencil ${one ? "it" : "them"} in`,
  });
}

/** "this cell": the ringed cell a step decides, in the game's word for it. */
export function thisCell(at: Point, cell = "cell"): Narration {
  return mark.this("ring", CELL, [at], cell);
}

// --- the candidate games' conclusions ---------------------------------------

/**
 * A strike's words before their conclusion: why the struck values go, as a
 * clause the walk finishes with the move it makes (`candidate-plan.ts`'s
 * `StrikeWords`). "No way to make this cage multiply to 5 puts 2, 3 or 4 in this
 * cell" ends in "so 2, 3 and 4 must go" on a cell with notes, and in
 * "so this cell must be 1" on one without.
 *
 * `where` names the cells a strike reaches beyond the one the premise is about,
 * in the words its conclusion uses ("from the other cells they pass through").
 * A strike with one speaks for cells other than "this cell", so its step never
 * becomes one cell's placement.
 *
 * `struck` names the struck notes where a list of their values would misstate
 * them (Group's identity marks are a different element in every cell) or say
 * less than a word does. It never changes what a folded step concludes: that
 * names the values left, which the premise never has.
 *
 * A strike names its values even where the premise just did ("puts 2 in this
 * cell, so the 2 must go"): the reference is what the player presses, and
 * "it" is no thing on the board.
 */
export interface Premise {
  premise: Narration;
  where?: string;
  struck?: string;
}

/**
 * How a candidate step ends, by the move it makes. The walk decides which; the
 * game's vocabulary words it, and the walk builds the reference, so a
 * reference is the thing the player presses and never the clause around it:
 *
 * - `strike` — the struck values go ("2 and 4 must go"): `what` names them,
 *   from the values a refresh leaves, and `after` follows the reference;
 * - `place` — a cell with no notes has one value left ("this cell must be
 *   3");
 * - `keep` — a cell with no notes has several left, and the step writes them
 *   ("this cell can only be 1 or 5").
 *
 * `place` and `keep` are said after the cell.
 *
 * Each is the clause after "so"; the walk supplies the "so" and the full stop.
 */
export interface Conclusions {
  /** What the game calls the cell a `place` or `keep` is said of. */
  readonly cell: string;
  /** `how` is what the premise said about the struck notes. */
  strike(how: Omit<Premise, "premise">): {
    what(values: readonly number[]): string;
    after: string;
  };
  place(n: number): string;
  keep(values: readonly number[]): string;
}

/** The {@link Conclusions} of a game whose values print one way everywhere, in
 * its value vocabulary. A value struck in several cells is named once. */
export function candidateConclusions(vocab: {
  value(n: number): string;
  cell?: string;
}): Conclusions {
  const v = vocab.value;
  const cell = vocab.cell ?? "cell";
  return {
    cell,
    strike: ({ where, struck }) => {
      const values = (values: readonly number[]): string => {
        const ns = distinct([...values]);
        return ns.length === 1 ? `the ${v(ns[0])}` : joinWith(ns.map(v));
      };
      // "Must go" is the necessity voice in the fewest words. A where that
      // says what they go from follows it; one that picks them out ("beyond
      // that") stays with them.
      const from = where?.startsWith("from ") ?? false;
      const named = struck ? () => struck : values;
      return {
        what: where && !from ? (ns) => `${named(ns)} ${where}` : named,
        after: from ? `must go ${where}` : "must go",
      };
    },
    place: (n) => `must be ${v(n)}`,
    // Short where it can be: the list is as long as the values left, and
    // "only" says they are all the cell can be.
    keep: (values) => `can only be ${joinOr(values.map(v))}`,
  };
}

// --- the generic Latin arms --------------------------------------------------

/**
 * The value vocabulary a game's cells are spoken in, which is all that separates
 * a letter-valued Latin game's generic arms from a digit game's (Group's
 * elements are letters `a`–`z`; Salad's symbols are `A`–`C` or `1`–`3`
 * depending on its mode).
 *
 * `noun` is the singular ("number", "element", "letter"); its plural is
 * `${noun}s`, which is right for every value word in the collection. `value`
 * renders one value.
 *
 * **Who declines, and why** (measured against the arms, not assumed):
 * **Towers** needs the value *qualified* in some arms and bare in others
 * ("every other cell in this row rules out height 5, so this cell must be 5"),
 * i.e. two renderers
 * for six arms; **Solo** names a different region set per arm ("row, column
 * **and** block", plus block/diagonal region names in `hiddenSingle`). Both stay
 * on their own `narrate` — one vocabulary can't express a per-arm difference,
 * and forcing it would read worse than the duplication (docs/hints-candidates.md § "Persist, populate, and the moves"'s
 * standing rule).
 */
export interface LatinVocab {
  /** Singular noun for a cell's value: "number", "element", "letter", … */
  noun: string;
  /** How one value prints. */
  value(n: number): string;
  /** What the game calls a board position. Default "cell"; Salad's board is
   * squares, and mixing the two words inside one game's hints reads as sloppy. */
  cell?: string;
}

const NUMBER_VOCAB: LatinVocab = { noun: "number", value: (n) => String(n) };

/** Narrate a generic Latin placement — the three single arms, which read
 * *identically* across the row/column Latin games once their value vocabulary
 * is factored out ({@link LatinVocab}): Keen and Unequal (numbers), Group
 * (elements) and Salad (letters or numbers). Shared so a wording improvement to,
 * say, the hidden-single sentence lands in one place instead of drifting between
 * them. `n` is the placed value; `vocab` defaults to plain numbers. The strike
 * arms are {@link latinPremise}'s.
 *
 * Each game still owns its game-specific arms (Keen's cage*, Unequal's
 * greater/lesser/adjacent*, Salad's border/count/sync, Group's associativity)
 * and delegates only the generic ones here. */
export function narrateLatinReason(
  reason: GenericLatinReason,
  at: Note,
  w: number,
  vocab: LatinVocab = NUMBER_VOCAB,
): Sentence {
  const { noun } = vocab;
  const v = vocab.value;
  const cell = vocab.cell ?? "cell";
  const here = thisCell(at, cell);
  switch (reason.kind) {
    case "single":
      return so({
        look: phrase`Every other ${noun} has been ruled out in ${here}`,
        move: phrase`it can only be ${v(at.n)}`,
      });
    case "regionsFull":
      return so({
        look: phrase`${here}'s row and column already hold every other ${noun}`,
        move: phrase`it can only be ${v(at.n)}`,
      });
    case "hiddenSingle": {
      const name = reason.line === "row" ? "row" : "column";
      const line = mark.this(
        "stripes",
        whole(CELL),
        hiddenSingleLine(reason.line, reason.index, w),
        name,
      );
      return so({
        look: phrase`Every other ${cell} in ${line} rules out ${v(reason.n)}`,
        move: phrase`${here} must be ${v(reason.n)}`,
      });
    }
    default:
      throw new Error(`a ${reason.kind} strikes, and is narrated by latinPremise`);
  }
}

/**
 * One value confined across several parallel lines: the `lines` take `value`
 * only in the outlined `set`, which lies in as many lines the other way, so
 * those have no other place for it. The premise of every game's version of the
 * step (an X-wing, a swordfish).
 *
 * Every line is striped whole, because the claim is about all of it: the
 * player checks the value is gone from each cell that is not outlined. The two
 * counts are the argument, so both are said. Kept short: the walk may end it
 * with every value a cell keeps, and the whole must fit the narration limit.
 */
export function confinedPremise(
  lines: {
    axis: "row" | "col";
    count: number;
    cells: readonly Point[];
  },
  set: readonly Point[],
  value: string,
  cell = "cell",
): Narration {
  const [along, across] =
    lines.axis === "row" ? ["rows", "columns"] : ["columns", "rows"];
  const striped = mark.as(
    "stripes",
    CELL,
    lines.cells,
    `These ${lines.count} ${along}`,
  );
  return phrase`${striped} fit ${value} only in ${mark.the("outline", CELL, set, cell)}, taking the ${value} of ${lines.count} ${across}`;
}

/**
 * A wing: whichever value the outlined middle cell takes, one of the other
 * outlined cells that shares a line with the outlined struck cell, or where
 * `self` the middle itself, must have `value`. Every way is read off the notes the walk
 * has written on the middle and the ends, so the words name the cells and the
 * value and leave the ways to the notes, as Map's weighing does. The ends take
 * no noun of their own (owner, 2026-10-28): they are named by their mark.
 * `beside` says how an end and the struck cell are related, in the game's
 * regions.
 */
export function wingPremise(
  wing: { middle: Point; ends: readonly Point[]; self: boolean },
  at: Point,
  value: string,
  cell = "cell",
  beside = "in line with",
): Narration {
  // "Another": the struck cell is outlined too, and an end is any outlined
  // cell but it (`point-a-cell-reference-at-its-cell`, D4).
  const end = mark.as("outline", CELL, wing.ends, `another outlined ${cell}`);
  const which = wing.self ? phrase`it or ${end}` : end;
  return phrase`Whatever goes in ${mark.as("outline", CELL, [wing.middle], `the middle ${cell}`)}, ${which} ${beside} ${thisCell(at, cell)} must have ${value}`;
}

/** The premise of a generic Latin strike (the placement cull, a set), shared
 * as {@link narrateLatinReason} is. `marks` are the struck notes. */
export function latinPremise(
  reason: GenericLatinReason,
  marks: readonly Note[],
  vocab: LatinVocab = NUMBER_VOCAB,
): Premise {
  const v = vocab.value;
  const cell = vocab.cell ?? "cell";
  switch (reason.kind) {
    case "dup":
      return {
        premise: placedRulesOut(reason, v(reason.n)),
        where: `from the other ${cell}s`,
      };
    case "set":
      if (reason.lines)
        return {
          premise: confinedPremise(reason.lines, reason.cells, v(marks[0].n), cell),
        };
      // One strike per cell can repeat a value, and the order is the solver's:
      // name each value once, smallest first.
      return {
        premise: phrase`${mark.the("outline", CELL, reason.cells, cell).capitalized()} already account for ${joinWith(distinct(marks.map((m) => m.n)).map(v))} between them`,
      };
    case "wing":
      return { premise: wingPremise(reason, marks[0], v(reason.n), cell) };
    default:
      throw new Error(`a ${reason.kind} places, and is narrated by narrateLatinReason`);
  }
}

/**
 * A placement's cull, whose premise is the value just placed: outlined, since
 * the ring that decided it has moved on to the notes it now strikes. `value` is
 * the value as the game prints it, `regions` where it may not repeat.
 */
export function placedRulesOut(
  placed: { px: number; py: number },
  value: string,
  regions = "row and column",
): Narration {
  const at = { x: placed.px, y: placed.py };
  return phrase`${mark.as("outline", CELL, [at], `The ${value} just placed`)} can't repeat in its ${regions}`;
}
