/**
 * The sentences the collection's hints share, and the English they are built
 * from.
 *
 * A game's own sentences live in its description; these are the ones several
 * games speak word for word, so a wording pass on them lands once: the generic
 * Latin arms (Keen, Unequal, Group, Salad), the candidate games' two setup
 * steps and the conclusions their strikes end in, the border-grid games' later
 * legs, and the helpers that join a list or choose "a" or "an". Which sentence a step speaks is decided by
 * the deduction (`latin-hint.ts`, `candidate-hint.ts` and each game's hint);
 * nothing here decides anything.
 */

import {
  STATED as LATIN_STATED,
  voice as latinVoice,
} from "../../generated/engine/solve/latin.compiled.ts";
import {
  CELL,
  indefinite,
  joinNums,
  joinOr,
  joinWith,
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
} from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import { EDGE, type ForcedBorderEdge } from "../mechanics/border-grid-hint.ts";
import type { LatinWingReason } from "../solve/latin.ts";
import { type GenericLatinReason, hiddenSingleLine } from "./latin-hint.ts";
import { statedParts } from "./stated.ts";
import { lineUnit } from "./step-voice.ts";

// --- lists and articles ------------------------------------------------------

export { indefinite, joinNums, joinOr };

/** Each value once, in order. */
const distinct = (ns: number[]): number[] => [...new Set(ns)].sort((a, b) => a - b);

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
export function populateText(noun: string, cell = "square"): string {
  return `Start by penciling every candidate ${noun} into each empty ${cell}.`;
}

/** Narration for the obvious-cleanup step, parameterized by the game's noun,
 * its placement verb ("standing", "placed"), its region phrase ("row or
 * column", "row, column or block") — and what it calls a board position, which
 * defaults to "square" and is "cell" where the game's genre says so (see {@link populateText}: the two
 * setup strings and the generic narration arms must agree, or one game's hints
 * read in two vocabularies). */
export function cleanObviousText(
  noun: string,
  placedVerb: string,
  regions: string,
  cell = "square",
): (marks: readonly Note[]) => Sentence {
  // Says nothing about the "fill all pencil marks" button doing this same
  // cleanup: help/features.md says so once (docs/hints.md § "Rules belong
  // in the help"). The notes it names are the ones it strikes. A game whose
  // values are only "in" a region, never placed or standing, gives no verb.
  const already = placedVerb === "" ? "already" : `already ${placedVerb}`;
  return (marks) =>
    unshaped(
      phrase`Now clear the easy ones: cross out ${mark.as("strike", NOTE, marks, `any ${noun} ${already} in its ${cell}'s ${regions}`)}.`,
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
  if (every)
    return so({
      look: phrase`No ${noun} is ${placedVerb} in ${here}'s ${regions} yet`,
      move: phrase`every one must be penciled in`,
    });
  const one = values.length === 1;
  return so({
    look: phrase`Only ${joinWith([...values])} ${one ? "isn't" : "aren't"} already ${placedVerb} in ${here}'s ${regions}`,
    move: phrase`pencil ${one ? "it" : "them"} in`,
  });
}

/** "this cell": the ringed cell a step decides, in the game's word for it. */
function thisCell(at: Point, cell = "square"): Narration {
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
 * its value vocabulary. A value struck in several cells is named once. `be`
 * is the verb a cell takes a value by (Rome's arrows "point"), and `note`
 * what a struck value is called where its word alone would not say it is a
 * note: "the up marks in it", and with no `where` "this square's up mark",
 * the cell saying which mark a word that is no value cannot. */
export function candidateConclusions(vocab: {
  value(n: number): string;
  cell?: string;
  be?: string;
  note?: string;
}): Conclusions {
  const v = vocab.value;
  const cell = vocab.cell ?? "square";
  const be = vocab.be ?? "be";
  const { note } = vocab;
  return {
    cell,
    strike: ({ where, struck }) => {
      const values = (values: readonly number[]): string => {
        const ns = distinct([...values]);
        if (note !== undefined)
          return `${where ? "the" : `this ${cell}'s`} ${joinWith(ns.map(v))} ${values.length === 1 ? note : `${note}s`}`;
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
    place: (n) => `must ${be} ${v(n)}`,
    // Short where it can be: the list is as long as the values left, and
    // "only" says they are all the cell can be.
    keep: (values) => `can only ${be} ${joinOr(values.map(v))}`,
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
 * A reason names the units it reads where they are not a row and a column
 * (Solo's blocks and diagonals), so every game speaks these arms here but
 * where its words differ, measured against the arms: **Towers** qualifies the
 * value in its hidden single and set and leaves it bare after ("no other
 * cell in this row can be height 5, so this cell must be 5"), and **Solo**
 * says a set's cells as "other cells in this block". One vocabulary can't
 * express a per-arm difference, and forcing it would read worse than the
 * duplication (docs/hints-candidates.md § "Persist, populate, and the moves"'s
 * standing rule).
 */
export interface LatinVocab {
  /** Singular noun for a cell's value: "number", "element", "letter", … */
  noun: string;
  /** How one value prints. */
  value(n: number): string;
  /** What the game calls a board position. Default "square"; a game whose
   * genre says "cell" declares it here, and mixing the two words inside one
   * game's hints reads as sloppy. */
  cell?: string;
  /** How a wing's ends share a unit with the struck cell, in the game's
   * units. Default "in line with". */
  beside?: string;
  /** The verb a square takes a value by. Default "be"; Rome's arrows
   * "point". */
  be?: string;
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
  const words = {
    kind: CELL,
    value: vocab.value,
    valueNoun: vocab.noun,
    noun: vocab.cell,
    be: vocab.be,
  };
  const ring = [at];
  const terms = { d: at.n };
  switch (reason.kind) {
    case "single":
      return latinVoice<Point>(words).sentence("single", { ring, terms });
    case "regionsFull":
      return latinVoice<Point>({
        ...words,
        ...("regions" in reason ? { regions: joinWith([...reason.regions]) } : {}),
      }).sentence("regionsFull", { ring, terms: { ...terms, named: false } });
    case "hiddenSingle": {
      const unit =
        "unit" in reason
          ? reason.unit
          : {
              name: lineUnit(reason.line),
              cells: hiddenSingleLine(reason.line, reason.index, w),
            };
      return latinVoice<Point>({
        ...words,
        kinds: { cell: whole(CELL) },
        unit: () => unit.name,
      }).sentence("hiddenSingle", {
        ring,
        terms: { d: reason.n },
        marks: { stripes: { cell: unit.cells } },
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
function confinedPremise(
  lines: {
    axis: "row" | "col";
    count: number;
    cells: readonly Point[];
  },
  set: readonly Point[],
  n: number,
  value: (n: number) => string,
  cell = "square",
): Narration {
  const { look } = statedParts(
    LATIN_STATED[lines.axis === "row" ? "fish.rows" : "fish.cols"].step[0],
    {
      kind: CELL,
      at: (): Point => {
        throw new Error("a fish names no element term");
      },
      ring: [],
      marks: { stripes: lines.cells, outline: set },
      terms: { d: n, two: lines.count === 2 },
      value,
      noun: cell,
      tally: lines.count,
    },
  );
  if (look === undefined) throw new Error("the library's fish states no look");
  return look;
}

/**
 * A wing, as the library's `says` states it (`latin.description.yaml`): the
 * words name the cells and the value and leave the ways to the notes, as
 * Map's weighing does. `cell` and `beside` are the game's: what it calls a
 * board position, and how an end and the struck cell share a unit in its
 * units.
 */
function wingPremise(
  { said, w }: Pick<LatinWingReason, "said" | "w">,
  struck: Note,
  value: (n: number) => string,
  cell = "square",
  beside?: string,
): Narration {
  const { look } = statedParts(LATIN_STATED.wing.step[0], {
    kind: CELL,
    // The struck cell is the note the walk strikes, which its highlight names.
    at: (i): Point => (i === said.t ? struck : { x: i % w, y: (i / w) | 0 }),
    ring: [],
    marks: {},
    terms: said,
    value,
    noun: cell,
    alongside: beside,
  });
  if (look === undefined) throw new Error("the library's wing states no look");
  return look;
}

/** The premise of a generic Latin strike (the placement cull, a set), shared
 * as {@link narrateLatinReason} is. `marks` are the struck notes. */
export function latinPremise(
  reason: GenericLatinReason,
  marks: readonly Note[],
  vocab: LatinVocab = NUMBER_VOCAB,
): Premise {
  const v = vocab.value;
  const cell = vocab.cell ?? "square";
  switch (reason.kind) {
    case "dup":
      return {
        premise: placedRulesOut(reason, v),
        where: `from the other ${cell}s`,
      };
    case "set": {
      if ("lines" in reason)
        return {
          premise: confinedPremise(reason.lines, reason.cells, marks[0].n, v, cell),
        };
      const { look } = statedParts(LATIN_STATED.set.step[0], {
        kind: CELL,
        at: (i): Point => ({ x: i % reason.w, y: (i / reason.w) | 0 }),
        ring: [],
        marks: {},
        terms: reason.said,
        value: v,
        noun: cell,
        struck: marks.map((m) => m.n),
      });
      if (look === undefined) throw new Error("the library's set states no look");
      return { premise: look };
    }
    case "wing":
      return {
        premise: wingPremise(reason, marks[0], v, cell, vocab.beside),
      };
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
  placed: { px: number; py: number; n: number },
  value: (n: number) => string,
  regions?: string,
): Narration {
  const { look } = statedParts(LATIN_STATED.placed.step[0], {
    kind: CELL,
    at: (): Point => {
      throw new Error("a placement's cull names no element term");
    },
    ring: [],
    marks: { outline: [{ x: placed.px, y: placed.py }] },
    terms: { d: placed.n },
    value,
    regions,
  });
  if (look === undefined) throw new Error("the library's placed states no look");
  return look;
}
