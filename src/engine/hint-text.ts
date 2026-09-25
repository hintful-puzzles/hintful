/**
 * The sentences the collection's hints share, and the English they are built
 * from.
 *
 * A game's own sentences live in its `hint-text.ts`; these are the ones several
 * games speak word for word, so a wording pass on them lands once: the generic
 * Latin arms (Keen, Unequal, Group, Salad), the forcing chain (those four plus
 * Towers and Solo), the candidate games' two setup steps and the conclusions
 * their strikes end in, the sliding-tile
 * games' "Working on tile N:" prefix, and the helpers that join a list or
 * choose "a" or "an". Which sentence a step speaks is decided by
 * the deduction (`latin-hint.ts`, `candidate-hint.ts` and each game's hint);
 * nothing here decides anything.
 */

import type { ForcingLink, GenericLatinReason } from "./latin-hint.ts";

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

/** Sentence-initial form of a vocabulary's cell word. */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// --- the sliding-tile games' goal prefix -------------------------------------
//
// Shared "goal: tactic" vocabulary for the sliding-tile games (Fifteen, Sixteen,
// Netslide). Every step names the tile it is working toward home ("Working on
// tile N:") and then states the tactic, so the player always sees the goal
// behind a move, even when the tile being slid is only clearing the way. A move
// that lands its tile in the solved cell is a **home** move; one that only
// repositions toward a later home is a **staging** move (marked with
// `HINT_SETTING_UP`).

/** The shared "goal" prefix naming the tile a step works toward home,
 * e.g. `Working on tile 3: `, so the games' hints read as one voice. */
export function workingOn(tile: number): string {
  return `Working on tile ${tile}: `;
}

/** Shared marker appended to a staging move (one that does not yet land
 * its tile in its final spot). */
export const HINT_SETTING_UP = "(setting up)";

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
): string {
  // Says nothing about the "fill all pencil marks" button doing this same
  // cleanup: help/features.md says so once (docs/games/hints.md § "Rules belong
  // in the help").
  return `Now clear the easy ones: cross out any ${noun} already ${placedVerb} in each ${cell}'s ${regions}.`;
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
  values: readonly string[],
  every: boolean,
  vocab: { noun: string; placedVerb: string; regions: string; cell?: string },
): string {
  const { noun, placedVerb, regions } = vocab;
  const cell = vocab.cell ?? "cell";
  if (every)
    return `Nothing in this ${cell}'s ${regions} rules out a ${noun} yet, so pencil in every one.`;
  const one = values.length === 1;
  return `Only ${joinWith([...values])} ${one ? "isn't" : "aren't"} already ${placedVerb} in this ${cell}'s ${regions}, so pencil ${one ? "it" : "them"} in.`;
}

// --- the candidate games' conclusions ---------------------------------------

/**
 * A strike's words before their conclusion: why the struck values go, as a
 * clause the walk finishes with the move it makes (`candidate-plan.ts`'s
 * `StrikeWords`). "No way to make this cage multiply to 5 puts 2, 3 or 4 in this
 * cell" ends in "so we must cross out 2, 3 and 4" on a cell with notes, and in
 * "so this cell must be 1" on one without.
 *
 * `where` names the cells a strike reaches beyond the one the premise is about,
 * in the words its conclusion uses ("from the other cells they pass through").
 * A strike with one speaks for cells other than "this cell", so its step never
 * becomes one cell's placement.
 *
 * `struck` names the struck notes where a list of their values would misstate
 * them (Group's identity marks are a different element in every cell) or say
 * less than a word does (Rome's "the rest"). `named` says the premise has
 * already named the struck values ("puts 2 or 3 in this cell"), so a strike
 * refers back to them ("so we must cross them out") rather than listing them
 * twice. Neither changes what a folded step concludes: that names the values
 * left, which the premise never has.
 */
export interface Premise {
  premise: string;
  where?: string;
  struck?: string;
  named?: boolean;
}

/**
 * How a candidate step ends, by the move it makes. The walk decides which; the
 * game's vocabulary words it:
 *
 * - `strike` — the struck values go ("we must cross out 2 and 4");
 * - `place` — a cell with no notes has one value left ("this cell must be 3");
 * - `keep` — a cell with no notes has several left, and the step writes them
 *   ("pencil in only 1 and 5").
 *
 * Each is the clause after "so"; the walk supplies the "so" and the full stop.
 */
export interface Conclusions {
  /** `how` is what the premise said about the struck notes. */
  strike(values: readonly number[], how: Omit<Premise, "premise">): string;
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
    strike: (values, { where, struck, named }) => {
      const ns = distinct([...values]);
      const at = where ? ` ${where}` : "";
      if (struck) return `we must cross out ${struck}${at}`;
      if (named) return `we must cross ${ns.length === 1 ? "it" : "them"} out${at}`;
      const what = ns.length === 1 ? `the ${v(ns[0])}` : joinWith(ns.map(v));
      return `we must cross out ${what}${at}`;
    },
    place: (n) => `this ${cell} must be ${v(n)}`,
    // Short where it can be: the list is as long as the values left, and
    // "only" says they are all the cell can be.
    keep: (values) => `pencil in only ${joinWith(values.map(v))}`,
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
 * ("height 5 can go in only this cell … so it must be 5"), i.e. two renderers
 * for six arms; **Solo** names a different region set per arm ("row, column
 * **and** block", plus block/diagonal region names in `hiddenSingle`). Both stay
 * on their own `narrate` — one vocabulary can't express a per-arm difference,
 * and forcing it would read worse than the duplication (docs/games/hints.md § "Persist, populate, and the moves"'s
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
  n: number,
  vocab: LatinVocab = NUMBER_VOCAB,
): string {
  const { noun } = vocab;
  const v = vocab.value;
  const cell = vocab.cell ?? "cell";
  switch (reason.kind) {
    case "single":
      return `Every other ${noun} has been ruled out in this ${cell}, so it can only be ${v(n)}.`;
    case "regionsFull":
      return `This ${cell}'s row and column already hold every other ${noun}, so it can only be ${v(n)}.`;
    case "hiddenSingle":
      return `In this ${reason.line === "row" ? "row" : "column"}, ${v(reason.n)} can go in only this ${cell}, since every other ${cell} in the ${reason.line === "row" ? "row" : "column"} rules it out, so it must be ${v(reason.n)}.`;
    default:
      throw new Error(`a ${reason.kind} strikes, and is narrated by latinPremise`);
  }
}

/** The premise of a generic Latin strike (the placement cull, a set, a forcing
 * chain), shared as {@link narrateLatinReason} is. `ns` is the struck values. */
export function latinPremise(
  reason: GenericLatinReason,
  ns: number[],
  vocab: LatinVocab = NUMBER_VOCAB,
): Premise {
  const v = vocab.value;
  const cells = `${vocab.cell ?? "cell"}s`;
  switch (reason.kind) {
    case "dup": {
      const d = v(reason.n);
      return {
        premise: `There's already ${indefinite(d)} ${d} in this row and column`,
        where: `from the other ${cells} they pass through`,
      };
    }
    case "set":
      // One strike per cell can repeat a value, and the order is the solver's:
      // name each value once, smallest first.
      return {
        premise: `The outlined ${cells} already account for ${joinWith(distinct(ns).map(v))} between them`,
      };
    case "forcing":
      return {
        premise: forcingChainPremise(
          reason,
          ns[0],
          vocab,
          reason.shares === "row" ? "row" : "column",
        ),
      };
    default:
      throw new Error(`a ${reason.kind} places, and is narrated by narrateLatinReason`);
  }
}

/**
 * A forcing chain's premise, told as the argument it actually is rather than as
 * "a contradiction further along" — a claim the player could only check by
 * redoing the deduction. It ends in what both branches agree on, which the walk
 * concludes as the move the board calls for.
 *
 * **The case split is the load-bearing part.** A forcing chain does not refute a
 * hypothesis; it concludes from *both* branches of one, and a walk that narrates
 * only the chain has a final leg that does not follow from its own premises (the
 * Palisade lesson, `docs/games/hints.md` § "Writing the narration"):
 *
 * - the origin (chain cell 1) has exactly two candidates, the struck value and
 *   one other;
 * - **if it is the struck value**, the conclusion cell loses that value by plain
 *   uniqueness — the two share the line `reason.shares` names;
 * - **if it is the other**, each link forces the next (every chain cell has just
 *   two candidates left, so losing one leaves one), until the last link is
 *   driven *to* the struck value — and it too lines up with the conclusion cell,
 *   because it is a row/column neighbor of it by construction.
 *
 * The links between are numbered on the board (`latin-hint.ts`'s
 * `forcingChainArea`) rather than recited here; reciting them would put the
 * chain back in the reader's head, which is the thing the marks exist to
 * prevent. What the sentence must supply is the **rule** that propagates it,
 * since that is the technique the player is being taught and it is nowhere on
 * the board.
 *
 * **Exported, because Towers and Solo keep their own `narrate`.** They decline
 * {@link narrateLatinReason} for a reason that does not apply to this arm — they
 * need a value qualified in *some* arms and bare in others, and a different
 * region set per arm — and neither is at issue here: "two heights left" already
 * contextualizes the bare numbers, and `region` is a parameter. A chain sentence
 * that drifted between games would be a chance to say something the board does
 * not show.
 *
 * `region` is what the conclusion shares with the origin — a row or column
 * everywhere except Solo, which also reasons over blocks and diagonals.
 *
 * **The deixis tie is the numbering itself.** Two cell-marks on screen normally
 * make a bare "this cell" ambiguous, and this frame shows several — but every
 * chain cell is *numbered* and the conclusion is not, so "cell 1"/"cell 5" and
 * "this cell" pick out different things by the presence or absence of a label
 * rather than by a color. See `docs/games/hints.md` § "Two marks on the board,
 * one "this cell" — tie them, and never by color".
 */
export function forcingChainPremise(
  reason: { chain: readonly ForcingLink[] },
  struck: number,
  vocab: LatinVocab,
  region: string,
  /** How the last link lines up with this cell; a row/column game's chain
   * always ends in line with it, Solo's can end in its block or diagonal. */
  lastTie: string | null = null,
): string {
  const v = vocab.value;
  const cell = vocab.cell ?? "cell";
  const last = reason.chain.length;
  const other = v(reason.chain[0].n);
  const s = v(struck);
  return `${cap(cell)} 1 is ${s} or ${other}, and every numbered ${cell} has just two ${vocab.noun}s left, so each forces the next. If ${cell} 1 is ${s}, this ${cell}'s ${region} already has it; if ${other}, ${cell} ${last} is driven to ${s}, ${lastTie ?? `in line with this ${cell}`}. Either way, ${s} is ruled out here`;
}
