/**
 * Cross-game guarantees on hint narration *form* (never content).
 *
 * `docs/hints.md` § "Writing the narration" is a list of narration rules,
 * and narration quality is the broadest class of hint defect. The rules that
 * are pure form are guarded here for every hinting game at once:
 *
 *  - **Every step shows something** (§ "Show the evidence as an area"): board
 *    marks, words, or both.
 *    A step with neither is invisible — a "hint" the player cannot see.
 *  - **Deductive conclusions use the necessity voice**
 *    (§ "Necessity for deductions, imperative for moves"): a
 *    deduction is narrated as what *must* / *can't* be, never a bare
 *    state of being. Movement games narrate imperatively instead and are
 *    exempt, as are the steps whose words declare a setup or a journey's
 *    later leg (`exemptByForm`) and each game's declared idioms
 *    (owner-endorsed phrasings whose necessity is carried by the words
 *    themselves — e.g. Filling's "fits exactly into").
 *  - **Narration stays readable at a glance** (§ "Keep the narration terse"):
 *    a limit every step is
 *    held to, with a ledger for the few sentences that genuinely need more
 *    room, and a hard ceiling even they cannot pass. Checked across every
 *    tier and every preset — and across the last preset at the hardest
 *    teachable tier, the Custom-dialog corner neither of those reaches — and
 *    into the middle of the game, in its own block, because the first
 *    preset's opening plan is where the long sentences never are.
 *  - **No step restates the counter** (§ "Keep the narration terse"): a leg
 *    of a journey never says which leg it is or how many there are, which
 *    the chrome shows as "Step 2 of 7". Held in the bound walk.
 *  - **No step asks the player to carry a chain it never lays out**: a
 *    bounded chain is a legitimate
 *    *Tactic* and may be narrated — but with the chain **shown on the
 *    board**, ordered and anchored at both ends, rather than compressed
 *    into a claim; an unbounded search may not be narrated at all.
 *    Checked twice — once on each game's first preset with the rules
 *    above, and once **per tier** in its own block at the bottom,
 *    because such a rung is tier-gated and the first preset is the one
 *    place it can never fire.
 *
 * Form only: no assertion here ever touches *what* a hint says about the
 * board — flattening a good hint to satisfy a guard is a failure, not a fix.
 */
import { describe, expect, it } from "vitest";
import { difficultyTiers, withTier } from "./difficulty.ts";
import type { HintStep } from "./game.ts";
import { NARRATION_LIMIT } from "./hint-words.ts";
import { paramsError } from "./params.ts";
import { dealsPromptly, dealt } from "./testing/dealt.ts";
import { bindingDefects } from "./testing/hint-binding.ts";
import { CHAIN_PINS, declaredOrder } from "./testing/hint-chain-pins.ts";
import {
  type AnyGame,
  declaresNoMarks,
  gatePresets,
  HINT_GAMES,
  SEARCH_PLANNING_GAMES,
  SEARCH_REACH_GAMES,
} from "./testing/hint-games.ts";
import { referenceDefects } from "./testing/hint-reference.ts";
import { firstLeaf, leafPresets } from "./testing/presets.ts";
import {
  itOverWholeSweep,
  PRECOMMIT_HOOK_RUN,
  perCommit,
  SLOW_TESTS_ENABLED,
} from "./testing/slow.ts";

/** Which of a params set's shared boards (`dealt`) a walk over several takes. */
const SEEDS = perCommit([0], [0, 1, 2]);

/** The hard ceiling: what a ledgered sentence is held to instead. */
const MAX_NARRATION_CHARS = 300;

/**
 * The override: the rungs whose sentences are allowed past
 * {@link NARRATION_LIMIT}, an entry per reason they need the room. An entry
 * lists rungs by id (`HintStep.rung`), never a pattern over the sentence, so
 * rewording a sentence cannot silently take it out of its listing.
 *
 * **Asserted in both directions**, the `NARRATES_MOVES` shape: a step over the
 * limit that no entry matches fails, and an exemption that matches nothing over
 * the limit fails too, so shortening a sentence means deleting its entry rather
 * than leaving behind an exemption that silently stops guarding anything.
 *
 * **The unit of both halves is the *listing*, not the entry.** `games` is the
 * roster of games that reach the template — some sentences are written once in
 * the engine and spoken by several — and it is what scopes the exemption, so a
 * Palisade entry cannot excuse a Towers sentence. Being a scope, it is checked
 * the same way in both directions: the forward half asks whether *this game* is
 * on the entry, and the reverse half asks whether *this game* ever spoke it. An
 * `(entry, game)` pair that never fires is deleted exactly as a dead entry is.
 *
 * So a shared-engine sentence's roster is **the games that actually reach it in
 * the walk, not the games that could** — those are different sets, and the
 * difference is invisible from the code: Mathrax's solver records `forcing` and
 * its narration would say this, yet the walk's plans never choose one, because
 * the frontier finishes the board on cheaper rungs first. Reading a roster off
 * the solver is therefore an inference, and the reverse half is what turns it
 * into a measurement.
 *
 * **The reverse half is a negative over a sample**, which is the one thing to
 * be careful with here: a game that speaks the sentence only on a preset or
 * tier {@link lintCases} does not walk looks identical to one that never speaks
 * it. Before deleting a listing, widen the walk for that game and let the wider
 * walk be the evidence; the floors in "ledgers only listings that still need
 * the room" are what stop a walk that examined nothing from reading as a
 * collection of dead listings.
 *
 * **A sentence the walk cannot be relied on to hear names a board that speaks
 * it** (`spokenOn`, a `params:desc` per game): a sentence that fires on few
 * boards, which the seeds a preset walks can miss, reading a live listing as
 * dead. A pinned board is an input, where a wider walk
 * would be a bigger sample of the same kind, and it is checked on every commit
 * rather than at push: "every pinned board still speaks its sentence".
 */
/** Why Pearl's step runs long. */
const PEARL_CARRIES_ON =
  "The owner's 2026-09-27 request (pearl/hint.ts, carryOn): a step also " +
  "draws the line on through a white pearl it runs into, and says so in a " +
  "second sentence after its own deduction, whichever deduction that is.";

const LONG_NARRATIONS: {
  games: string[];
  rungs: string[];
  why: string;
  spokenOn?: Record<string, string>;
}[] = [
  {
    games: ["pearl"],
    rungs: ["closesEarlyThrough"],
    why: PEARL_CARRIES_ON,
  },
  {
    games: ["magnets"],
    rungs: ["onlyEndLeft"],
    why:
      "Where a tile lies along the line, its count premise carries three: the " +
      "line's count of tiles, why each other square of it cannot take the pole, " +
      "and why the tile's far end cannot. The owner's 2026-09-22 playtest found " +
      "the second missing, and a step that rests on a fact has to say it " +
      "(magnets spec, the hidden facts a later step names in board terms).",
  },
  {
    games: ["magnets"],
    rungs: ["lineExact"],
    why:
      "The count premise and why every other empty square of the line can't " +
      "take the pole are two premises, already cut to one clause per kind of " +
      "reason (owner, 2026-10-18). Naming the ruled-out squares and the poles " +
      "they would touch by their marks, not 'elsewhere', costs the room on a " +
      "line needing several poles (name-every-reference-by-its-mark).",
  },
  {
    games: ["ascent"],
    rungs: ["pointers"],
    why:
      "Edges: the step names every missing number that could stand on the " +
      "square, so the player can check each is ruled out, and the ringed " +
      "square they point at (name-every-reference-by-its-mark). Where three " +
      "or more rivals point there, no form that names them all fits.",
    spokenOn: {
      ascent:
        "5x5mEEdh:18_22_15_16_3_1_9_14e10_11e13_2e12_19e6_5a24c25_8_23_21_20_7_4_17",
    },
  },
  {
    games: ["net"],
    rungs: ["loop", "sealed"],
    why:
      "A turning ruled out because it would close a loop or seal a group off is " +
      "a second premise beside the notes and locks the others clash with, and " +
      "names the turning it rules out by its wires; a sentence citing only one " +
      "of the two would leave a way of turning the tile unaccounted for. When " +
      "dead ends are what seal the group, the sentence says so (they have no " +
      "other wire) and counts what is cut off, because the owner found the bare " +
      "'seal off' unreadable in playtest (2026-09-30). When the group is one the " +
      "wire only runs into, through squares not settled yet, the sentence says " +
      "what makes it a group: they end its wire however they turn. Over the " +
      "limit where a wrapped grid's edge, a group of dead ends or a run into " +
      "squares not settled yet stands beside a fit to the notes and locks.",
  },
  {
    games: ["boats"],
    rungs: ["sharedDiagonal"],
    why:
      "Where the middle of the three squares could be the boat, the step rests " +
      "on a second premise: that boat would fill the line crossing there. " +
      "Without it the sentence read as unsound to the owner (2026-10-22), " +
      "since a middle boat need not touch the ringed squares at a corner.",
  },
  {
    games: ["rect"],
    rungs: ["line"],
    why:
      "Over the limit only where both reasons stand beside several clues, on " +
      "Unreasonable boards: a crossing that would take a square another clue " +
      "needs, and one that would leave a square uncovered. Each rules out a " +
      "different clue's rectangle, so neither can go.",
  },
];

/** The shared necessity vocabulary a deductive conclusion draws from.
 *
 * `nowhere` is in it because *"can go nowhere but this cell"* is the same claim
 * as *"can only go in this cell"*, written in ordinary English rather than a
 * game's private idiom — there is no game that would want it read as anything
 * weaker, which is the test for whether a word belongs to the shared vocabulary
 * or to {@link IDIOMS}.
 *
 * **A lexical rule's vocabulary can only be as wide as the sentences it is run
 * over**, and two constructions are heard only beyond each game's easiest
 * opening plan:
 *
 *  - *"…can take one line at most"* — a proved bound, which is what `at most`
 *    always is here. Loopy writes it several ways, and Bridges, Clusters, Slant and
 *    Unequal write it too; Loopy's corner rung is the one whose necessity is
 *    carried by nothing else, and it fires at Hard.
 *  - *"none of its remaining edges can be walls"* — a negated possibility, the
 *    same claim as `cannot` with the negation moved to the subject. Scoped to a
 *    `can` within the same clause on purpose: bare *"none of them has A"*
 *    (Subsets) is a state of being, which is exactly what this rule exists to
 *    reject. Palisade's clue-0 rung is the one that carries it alone.
 */
const NECESSITY =
  /\bmust\b|\bcan(?:no|')t\b|\bcannot\b|\bcan only\b|\bcan never\b|\bhas to\b|\bhave to\b|\bneeds?\b|\brul(?:e|es|ed|ing)\b.{0,40}\bout\b|\bno other\b|\bnowhere\b|\bonly\b|\bnever\b|\bforce[sd]?\b|\bimpossible\b|\bneither\b|\bat most\b|\bnone of\b[^.]{0,40}\bcan\b/i;

/**
 * Steps the necessity rule does not read, by the form their words declare. The
 * rule is about deductions, and a step's relation says whether it is one: a
 * forced step concludes what must be, while every other relation offers a move
 * (one of several, an answer to a danger, a move narrated by its effect, a leg
 * of a sequence, a step toward an aim), which the imperative states. A journey's
 * later leg (`again`) rests on the necessity its first leg stated, so making
 * every leg restate the modal is the flattening this file's header forbids; a
 * setup step is procedure, and a bare step has nothing but its move. An
 * evident step's look carries its own necessity, and is read.
 */
function exemptByForm(step: HintStep<unknown>): boolean {
  const form = step.words?.form;
  if (!form) return false;
  return "unshaped" in form ? form.unshaped !== "evident" : form.relation !== "forced";
}

/**
 * Games whose hints narrate **moves** rather than deductions, with the reason
 * each is exempt from the necessity-voice rule — the ledger, not the roster.
 *
 * **The population is derived and the exceptions are declared**
 * (`docs/testing.md` § "How a cross-game guard finds its population"). An
 * opt-in roster silently misses every game nobody added, and a guard blind to
 * a game cannot fire on it, so a game must have to be *removed* rather than
 * added.
 */
const NARRATES_MOVES: Record<string, string> = {
  fifteen: "sliding-tile: a step names the tile to slide, not a forced fact",
  sixteen: "sliding-tile: a step names the row or column to rotate",
  netslide: "sliding-tile: a step names the row or column to rotate",
  flood: "objective: a step names the color to flood with",
  inertia:
    "movement: the one thing it can prove is a gem's unreachability, and its " +
    "steps narrate the consequence a slide has",
  pegs:
    "search: no jump is forced by logic; a step names the jump and what was " +
    "checked about it, a necessity only where every rival was proved lost",
  untangle:
    "objective: a step names how many crossings a point's lines make before " +
    "and after the move, not a forced fact",
};

/** The games the necessity-voice rule applies to — every hinting game the
 * ledger above does not exempt. */
const DEDUCTIVE = new Set(
  HINT_GAMES.map(([id]) => id).filter((id) => !(id in NARRATES_MOVES)),
);

/**
 * The vocabulary of a conclusion the player is asked to take on trust because
 * the reasoning behind it was *not laid out* — the Check / Tactic / Search
 * taxonomy (`docs/solver-and-generator.md` § "Check, Tactic, Search"), which splits on whether the reasoning is a
 * **bounded chain the player can be walked through**:
 *
 * - **Check** — place, look, one rule breaks. Narrate directly.
 * - **Tactic** — a bounded chain of forced consequences to a named endpoint.
 *   Legitimate at a middle tier, but the chain must be **shown on the board** —
 *   each link marked in the order it falls, both ends anchored — rather than
 *   compressed into a claim the player can only check by redoing the deduction.
 *   The stricter form (a display-only leg per link, so the player advances one
 *   inference at a time) was designed and set aside by an owner decision:
 *   holding a *hypothesis* in your head is fine, holding the *chain* is not.
 * - **Search** — run the whole solver from a hypothesis, or branch and
 *   backtrack. `Unreasonable` only, and never narrated at all.
 *
 * It is checked for every hinting game at once: a rule enforced in one game is
 * not enforced.
 *
 * **It matches the compressed chain, not the hypothesis.** A pattern on "if
 * this cell were …" would fail Clusters on *"If this cell were blue, at most
 * one neighbor could ever match it"* — a sound single-step refutation, i.e. a
 * Check, and exactly what the rule permits everywhere. A hypothesis framing is
 * not the defect; asking the reader to carry it forward unaided is.
 *
 * **What this cannot see, stated rather than implied.** A Search that describes
 * itself as though it were a Check slips through — *"If this cell were a
 * vampire, the sightline clues and monster counts could no longer all be
 * met"* is wordwise indistinguishable from a one-glance refutation. So this is
 * a backstop. The guarantee for the Search rungs is structural: `UndeadReason`
 * and Dominosa's tag do not *contain* one, so narrating it is a compile error
 * rather than a string a test might miss.
 */
const SPECULATIVE =
  /\btr(?:y|ied|ies)\b|\bbreak the board\b|following (?:a|the) chain\b|following the forced\b|\bin turn\b|\bfurther along\b|\beventually\b/i;

/** As much of a step as an idiom is allowed to look at. */
interface NarratedStep {
  readonly explanation: string;
  readonly continuesPrevious?: boolean;
}

/**
 * Owner-endorsed per-game idioms that carry necessity in their own words rather
 * than a modal. Adding here is a deliberate, reviewable act — the list is the
 * legend of endorsed exceptions, not a loophole.
 *
 * A predicate over the **step** rather than a regex over its text, so an idiom
 * that belongs to one *leg* of a journey can say so and be held to it. Subsets
 * is why: exempting its continuation legs by their wording alone would have
 * exempted a lead leg that happened to open the same way.
 */
const IDIOMS: Record<string, (step: NarratedStep) => boolean> = {
  // Filling's grouped region step: "The shaded region of N fits exactly
  // into these squares." — the exactness *is* the forcing claim
  // (docs/hints-marks.md § "Group one firing into one step"; owner-endorsed with the Filling hint).
  filling: (s) => /fits exactly into/.test(s.explanation),

  // Loopy's blocked-pair rung: "Both outlined dots already have a line, so
  // joining them leaves this 2 short: that edge is out and the other 2 are
  // lines." The necessity is in "leaves this 2 short" — the clue could not be
  // met — and the conclusion is then stated in Loopy's own board word, where an
  // edge that is *out* is one ruled out (the same word its other sentences use:
  // "aren't ruled out", "already out"). Endorsed because the sentence is: the
  // owner settled its words on 2026-09-19, and `loopy/hint-text.ts` records what
  // each clause is doing and why it says it that way; the "so … :" join is the
  // engine's form for a look, what follows from it, and the move. Reached only
  // at Hard, so only a walk over the presets menu, not the first preset, hears
  // it.
  loopy: (s) => /leaves this \d+ short: that edge is out/.test(s.explanation),
};

/**
 * The em-dash, kept out of narration (owner, 2026-09-09).
 *
 * Where it would appear, it almost always stands in for the comma or the
 * sentence break before a concluding `so …` clause. Nothing about the teaching
 * depends on the character, so writing around it costs no reasoning; what it
 * must never buy is a
 * *shorter* hint, since deleting the clause is the flattening this file's header
 * forbids.
 *
 * **Not the en-dash.** Dominosa writes its dominoes `3–5`, where the dash is
 * notation rather than punctuation, and a guard that swept both would convict a
 * label for the sin of a connective.
 *
 * This file checks what the walks hear; `hint-em-dash.test.ts` checks the
 * source, for the arms no walk reaches.
 */
const EM_DASH = /—/;

/** "row 3", "Columns 2" — a line by a number. */
const NUMBERED_LINE = /\b(rows?|columns?)\s+\d/i;

describe("the necessity rule reaches every hinting game it should", () => {
  it("drew from a populated registry, and exempts a minority of it", () => {
    // Vacuity: an empty `HINT_GAMES` would exempt nothing and check nothing,
    // and every narration assertion below would pass over no games at all.
    expect(HINT_GAMES.length).toBeGreaterThan(25);
    expect(DEDUCTIVE.size).toBeGreaterThan(20);
    expect(Object.keys(NARRATES_MOVES).length).toBeLessThan(HINT_GAMES.length / 3);
  });

  it("ledgers only games that ship a hint, each with its reason", () => {
    const hinting = new Set(HINT_GAMES.map(([id]) => id));
    for (const [id, why] of Object.entries(NARRATES_MOVES)) {
      expect(hinting.has(id), `${id} is exempted here but ships no hint()`).toBe(true);
      expect(why.length, `${id}'s exemption states no reason`).toBeGreaterThan(40);
    }
  });

  it("endorses an idiom only for a game the rule applies to", () => {
    for (const id of Object.keys(IDIOMS))
      expect(
        DEDUCTIVE.has(id),
        `${id} has an endorsed idiom but is not necessity-checked — the entry does nothing`,
      ).toBe(true);
  });
});

/**
 * Boards per game for the form rules below — the gate slice, one seed each.
 *
 * **This block is about sentences.** A form rule — is the step visible, is the
 * conclusion in the necessity voice, is there an em-dash — is a property of the
 * *sentence*, so the question is how many distinct sentences the walk hears,
 * and a second seed of one preset hears the same ones again, where another
 * preset hears new ones (Solo's Killer cages, Loopy's other tilings).
 *
 * `lintCases` below walks every preset too, but only for *length*; the
 * necessity voice, the visibility rule and the speculative-chain rule are this
 * block's.
 */
const FORM_SEEDS = SEEDS.slice(0, 1);

describe("hint narration form, cross-game", () => {
  for (const [name, game] of HINT_GAMES) {
    it(`${name}: every step is visible, terse${DEDUCTIVE.has(name) ? ", and necessity-voiced" : ""}`, () => {
      for (const { title, params } of gatePresets(name, game))
        for (const seed of FORM_SEEDS) {
          const { desc, aux } = dealt(game, params, seed);
          const state = game.newState(params, desc);
          const res = game.hint?.(state, aux);
          if (!res?.ok) continue;
          res.steps.forEach((step, i) => {
            const at = `${name}/${title}/${seed} step ${i}: "${step.explanation}"`;

            // A step the player cannot see is not a hint.
            expect(
              step.explanation.length > 0 || !declaresNoMarks(step.highlights),
              `${at} — shows nothing: no words, no board marks`,
            ).toBe(true);

            // Length is checked in "hint narration stays readable at a glance"
            // below, across every tier and into the middle game.

            // A deduction concludes in the necessity voice.
            if (DEDUCTIVE.has(name) && !exemptByForm(step)) {
              expect(
                NECESSITY.test(step.explanation) || (IDIOMS[name]?.(step) ?? false),
                `${at} — no necessity modal (and no declared idiom)`,
              ).toBe(true);
            }

            expect(
              SPECULATIVE.test(step.explanation),
              `${at} — asks the player to carry a chain it never lays out`,
            ).toBe(false);

            // The runtime half of the em-dash rule. Strictly weaker than the
            // source scan below for anything written as a literal, and strictly
            // stronger for a narration *assembled* from pieces at run time —
            // two nets with different holes, and this one costs nothing.
            expect(
              EM_DASH.test(step.explanation),
              `${at} — narration uses an em-dash; rewrite with a comma, a semicolon or a sentence break`,
            ).toBe(false);
            // No board in the collection draws row or column numbers, so a
            // line named by one sends the player counting; the line a sentence
            // is about is striped instead (hints-marks.md § "Hatch the line the
            // sentence names").
            expect(
              NUMBERED_LINE.test(step.explanation),
              `${at} — narration names a row or column by a number the board does not draw`,
            ).toBe(false);
          });
        }
    });
  }
});

/**
 * A bound game's words name exactly the marks its steps draw
 * (`testing/hint-binding.ts`), through the whole game rather than its opening
 * plan: each plan is checked, played out, and recomputed until the board is
 * finished or the hint refuses. Every stored step is also checked as
 * `refreshHintStep` returns it after the moves before it, because a refresh
 * that shrinks a step's marks has to shrink its words with them.
 */
const BOUND_GAMES = HINT_GAMES.filter(([, g]) => g.hintMarks !== undefined);

/** The games whose hint searches: a move other than the offered one can be as
 * good, so a "so" there is a claim about the rivals. Derived, as the two
 * populations it joins are. */
const SEARCHING = new Set([...SEARCH_PLANNING_GAMES, ...SEARCH_REACH_GAMES]);

/**
 * What is wrong with the form a step's words declare (`hint-words.ts`'s
 * `Form`), one line per defect. An exception must have its kind's property,
 * which is what keeps the closed set of kinds from becoming a set of excuses;
 * and a searching game's forced step must say its rivals were judged lost,
 * the mechanical half of "so concludes only a move narrowed to one". Whether
 * the conclusion really follows is the reviewer's, not this walk's.
 */
function formDefects(step: HintStep<unknown>, searching: boolean): string[] {
  const words = step.words;
  if (!words) return [];
  const roles = new Set(words.refs.map((r) => r.role));
  const form = words.form;
  if ("unshaped" in form) {
    if (form.unshaped === "bare" && [...roles].some((r) => r !== "ring"))
      return ["is declared bare, yet names evidence beside the move"];
    if (form.unshaped === "setup" && (roles.has("outline") || roles.has("stripes")))
      return ["is declared setup, yet reasons from outlined or striped marks"];
    if (form.unshaped === "evident" && !roles.has("ring"))
      return ["is declared evident, yet rings nothing for the board to say"];
    return [];
  }
  if (searching && form.relation === "forced" && form.rivals !== "lost")
    return ['concludes with "so" in a searching hint without saying its rivals lost'];
  return [];
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
  "eleven",
  "twelve",
];
const ORDINAL = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
];

/** The ways a sentence writes these numbers, as an alternation: "3|three" for
 * a count, "3|third" for a place. */
const spellings = (ns: readonly number[], words: readonly string[]): string =>
  [...new Set(ns.flatMap((n) => [String(n), words[n] ?? ""]))]
    .filter((s) => s !== "")
    .join("|");

/** The nouns a sentence counts a journey's legs in: the gesture each leg is. */
const LEG_NOUNS =
  "turns?|moves?|jumps?|push(?:es)?|steps?|slides?|legs?|clicks?|taps?|flips?|swaps?|rotations?|shifts?|press(?:es)?|placements?";

/**
 * Where a step's words restate its place in its journey, which the hint's
 * chrome already shows as "Step `leg` of `legs`" (`StatusBarChange.hintJourney`,
 * owner 2026-10-16: *"there's no reason to say 'turn 2 of the 7', as that's
 * already there on the hint element"*). Three shapes, each built from this
 * step's own numbers so a count the board shows (a clue of 3, "needs 2 more
 * squares") never matches by coincidence of value alone: "`leg` of (the)
 * `legs`" or "the last of `legs`", "`leg`/`legs`", and a count of the journey's
 * legs, whole or still to go, in the gesture's own noun ("Three jumps", "the
 * next 4 turns").
 */
function journeyDefects(text: string, leg: number, legs: number): string[] {
  if (legs < 2) return [];
  const edge = (body: string): RegExp =>
    new RegExp(`(?:^|\\W)(?:${body})(?:\\W|$)`, "i");
  const shapes: [RegExp, string][] = [
    [
      edge(
        `(?:${spellings([leg], ORDINAL)}|(?:the )?last) of (?:the )?(?:${spellings([legs], SPELLED)})`,
      ),
      "its place",
    ],
    [edge(`${leg}\\s*/\\s*${legs}`), "its place"],
    [
      edge(
        `(?:${spellings(
          [legs, legs - leg + 1, legs - leg].filter((n) => n > 0),
          SPELLED,
        )})\\s+(?:more\\s+)?(?:${LEG_NOUNS})`,
      ),
      "how many legs it has",
    ],
  ];
  return shapes
    .filter(([shape]) => shape.test(text))
    .map(
      ([, what]) =>
        `restates ${what} in its journey (step ${leg} of ${legs}), which the hint's counter already shows`,
    );
}

/**
 * How many steps of one board the walk below checks. The local hooks stop
 * at 400: a board's later steps are spoken by the rungs its earlier ones were,
 * and the largest boards (Mosaic's 50x50) run to many times that, at most of
 * the walk's cost. Every step of every board is checked in CI.
 */
const BOUND_STEPS = perCommit(400, Number.POSITIVE_INFINITY);

/** Forms seen across the walk, so the close-out can tell that every kind of
 * exception and the searching check met real steps. */
const formsSeen = new Map<string, number>();

/** Steps of a journey of two or more legs the walk held to `journeyDefects`,
 * so the close-out can tell the rule met real journeys. */
let journeyLegsChecked = 0;

/** Where `steps[i]` sits in its journey, 1-based, and the journey's length:
 * the same grouping by `continuesPrevious` the midend's counter makes. */
function journeyOf(
  steps: readonly HintStep<unknown>[],
  i: number,
): { leg: number; legs: number } {
  let first = i;
  while (first > 0 && steps[first].continuesPrevious === true) first--;
  let last = i;
  while (last + 1 < steps.length && steps[last + 1].continuesPrevious === true) last++;
  return { leg: i - first + 1, legs: last - first + 1 };
}

/**
 * Both readings of a note-less cell for a game whose `Ui` offers the choice
 * (`candidateReading`), since the player may pick either and the implicit one
 * folds strikes into placements; otherwise the game's own, `null`.
 */
function readingsOf(game: AnyGame, params: unknown): readonly (string | null)[] {
  const { desc } = dealt(game, params);
  const ui = game.newUi(game.newState(params, desc)) as Record<string, unknown>;
  return typeof ui["candidateReading"] === "string" ? ["implicit", "populate"] : [null];
}

describe("a step's words leave its place in the journey to the counter", () => {
  it("flags the counter's facts and passes a count the board shows", () => {
    const flagged = (text: string, leg: number, legs: number): boolean =>
      journeyDefects(text, leg, legs).length > 0;
    expect(
      flagged(
        "Turn the ringed block clockwise, turn 2 of the 7 that put it in place.",
        2,
        7,
      ),
    ).toBe(true);
    expect(flagged("Turn the ringed block clockwise, the last of the 7.", 7, 7)).toBe(
      true,
    );
    expect(
      flagged("Six jumps clear the striped block and change nothing else.", 1, 6),
    ).toBe(true);
    expect(flagged("The next 3 turns put it in place.", 2, 4)).toBe(true);
    expect(flagged("Push it left (2/3).", 2, 3)).toBe(true);
    // A clue or a count of squares that happens to equal the journey's.
    expect(
      flagged(
        "This row needs 3 more +s and only these 3 squares can still take one.",
        1,
        3,
      ),
    ).toBe(false);
    expect(flagged("This 3's other edges can give it 2 at most.", 2, 3)).toBe(false);
    // One leg: the counter shows nothing, so the words may.
    expect(flagged("Two pushes put this barrel on a target.", 1, 1)).toBe(false);
  });
});

describe("a bound hint's words name exactly the marks it draws", () => {
  it("every hinted game is bound", () => {
    // A hint whose game declares no legend is checked by nothing here, so an
    // unbound hint is named rather than passed over.
    expect(HINT_GAMES.filter(([, g]) => !g.hintMarks).map(([name]) => name)).toEqual(
      [],
    );
    // Vacuity: the population itself, so an empty registry cannot pass.
    expect(BOUND_GAMES.length).toBe(HINT_GAMES.length);
    expect(HINT_GAMES.length).toBeGreaterThan(40);
  });

  it("every hinted game lists its rungs, each once", () => {
    // The walk below holds every step's rung to this list, and the pin harness
    // requires a pinned position for each entry (`testing/hint-positions.ts`).
    for (const [name, game] of HINT_GAMES) {
      const rungs = game.hintRungs ?? [];
      expect(rungs.length, `${name} declares no hintRungs`).toBeGreaterThan(0);
      expect(new Set(rungs).size, `${name} lists a rung twice`).toBe(rungs.length);
    }
  });

  for (const [name, game] of BOUND_GAMES) {
    it(`${name}: every step, fresh and refreshed`, () => {
      let checked = 0;
      const defects: string[] = [];
      const check = (
        state: unknown,
        ui: unknown,
        step: Parameters<typeof bindingDefects>[3],
        at: string,
        { leg, legs }: { leg: number; legs: number },
      ): void => {
        checked++;
        for (const d of bindingDefects(game, state, ui, step))
          defects.push(`${at}: "${step.explanation}": ${d}`);
        for (const d of formDefects(step, SEARCHING.has(name)))
          defects.push(`${at}: "${step.explanation}": ${d}`);
        if (step.words && game.hintMarks)
          for (const d of referenceDefects(step.words, game.hintMarks))
            defects.push(`${at} (${step.rung}): "${step.explanation}": ${d}`);
        if (legs > 1) journeyLegsChecked++;
        for (const d of journeyDefects(step.explanation, leg, legs))
          defects.push(`${at}: "${step.explanation}": ${d}`);
        const form = step.words?.form;
        if (form) {
          const key =
            "unshaped" in form
              ? `unshaped:${form.unshaped}`
              : `${SEARCHING.has(name) ? "searching " : ""}${form.relation}${form.rivals ? `:${form.rivals}` : ""}`;
          formsSeen.set(key, (formsSeen.get(key) ?? 0) + 1);
        }
      };
      for (const { title, params } of gatePresets(name, game))
        for (const seed of FORM_SEEDS)
          for (const reading of readingsOf(game, params)) {
            const { desc, aux } = dealt(game, params, seed);
            let state = game.newState(params, desc);
            const ui = game.newUi(state);
            if (reading)
              (ui as { candidateReading: string }).candidateReading = reading;
            const at = `${title}/${seed}${reading ? `/${reading}` : ""}`;
            let walked = 0;
            for (
              let round = 0;
              round < 60 && walked < BOUND_STEPS && game.status(state) === "ongoing";
              round++
            ) {
              const res = game.hint?.(state, aux, ui);
              if (!res?.ok) break;
              // Each step over the board it is narrated for: the state after
              // the steps before it.
              for (const [i, step] of res.steps.entries()) {
                if (walked++ >= BOUND_STEPS) break;
                const journey = journeyOf(res.steps, i);
                check(state, ui, step, `${at} round ${round} step ${i}`, journey);
                // `null` is a step already resolved: the midend skips it.
                const live = game.refreshHintStep
                  ? game.refreshHintStep(step, state)
                  : step;
                if (live === null) continue;
                if (live !== step)
                  check(
                    state,
                    ui,
                    live,
                    `${at} round ${round} step ${i}, refreshed`,
                    journey,
                  );
                state = game.executeMove(state, live.move);
              }
            }
            if (defects.length > 0) break;
          }
      expect(defects.slice(0, 20)).toEqual([]);
      expect(checked, `${name}: the walk checked no step`).toBeGreaterThan(0);
    });
  }

  itOverWholeSweep("met every form it checks on real steps", () => {
    // Vacuity: each property the form checks hold steps to was held on some.
    // `bare` is not here: no walked board leaves a hint nothing to say, and
    // the games that can (Pegs, Flood) pin it in their own tests.
    const seen = [...formsSeen.keys()];
    expect(seen).toContain("unshaped:setup");
    expect(seen).toContain("unshaped:evident");
    expect(seen).toContain("searching forced:lost");
    expect(seen.filter((k) => k.startsWith("searching ")).length).toBeGreaterThan(2);
    expect(
      journeyLegsChecked,
      "no step of a multi-leg journey was held to its counter",
    ).toBeGreaterThan(0);
  });
});

/**
 * The same speculative-vocabulary check, **across everything a game varies**.
 *
 * It needs its own sweep because the block above samples
 * `firstLeaf(game.presets())` — each game's *easiest* preset — and a trial rung
 * is tier-gated, so it never fires there: planting "further along" in Bricks'
 * lookahead narration leaves the block above green, because Bricks' first
 * preset is Easy and Easy never reaches that arm.
 *
 * **Tier is only one axis.** A game with no tiers at all (Sixteen, Netslide,
 * Palisade and others) varies by *preset* instead, and is walked that way; a
 * sweep keyed on tier would skip it whole, and a per-game vacuity guard that
 * runs only for the games that get as far as running could not say so. If you
 * add a sweep over games, the question to ask is what axis each game varies,
 * not what axis you keyed on.
 */
/**
 * The cases an **untiered** game contributes: its presets, which is the axis
 * such a game actually varies (a sweep keyed on tier alone collapses them all
 * to one and walks a single board).
 *
 * **A game that plans by searching walks its three smallest presets in the
 * gate.** The property under test here is the *wording* of an explanation, and
 * a planner's narration vocabulary does not change with board size — but a
 * search's cost does, steeply. Three is not arbitrary: it is what reaches every
 * mode Netslide varies (its presets are three barrier/wrapping modes at each
 * of three sizes, ordered smallest-first), and it keeps Sixteen's small boards
 * while dropping the large ones that carry the search cost. The slow tier
 * walks all of them. Unsliced, `SEARCH_PLANNING_GAMES` would be most of this
 * file's test time.
 */
function untieredCases(
  id: string,
  game: AnyGame,
): { label: string; params: unknown }[] {
  const all = leafPresets(game).map((e) => ({
    label: `preset "${e.title}"`,
    params: e.params as unknown,
  }));
  if (SLOW_TESTS_ENABLED) return all;
  return SEARCH_PLANNING_GAMES.includes(id) ? all.slice(0, 3) : all;
}

describe("no hint leaves a chain for the player to carry, at any tier", () => {
  for (const [name, game] of HINT_GAMES) {
    it(`${name}: every tier`, () => {
      // **One board per value of every axis the game varies**, rather than a
      // per-tier loop with `withTier` on the first preset: difficulty is a
      // `"choices"` axis like any other, so the slice already carries a board
      // at each tier — and carries it at the size the menu offers that tier
      // at, which is a board the player can pick rather than a tier label
      // written onto the smallest grid in the game.
      //
      // The `withTier` form is the tell `docs/testing.md` § "How a
      // cross-game guard finds its population" rule 6 names: it writes the tier
      // field and nothing else, so it never produces a Killer board, an
      // Adjacent board or a Tectonic one, and a trial rung that fires only in a
      // mode would be outside this sweep as surely as it is outside the block
      // above.
      const cases = gatePresets(name, game).map((e) => ({
        label: `preset "${e.title}"`,
        params: e.params,
      }));
      let checked = 0;
      for (const { label, params } of cases) {
        if (paramsError(game, params, true)) continue; // refused at this size
        for (const seed of SEEDS) {
          let board: { desc: string; aux?: string };
          try {
            board = dealt(game, params, seed);
          } catch {
            continue; // ungenerable at this size; difficulty-contract.test.ts owns that
          }
          const { desc, aux } = board;
          const res = game.hint?.(game.newState(params, desc), aux);
          if (!res?.ok) continue;
          checked++;
          for (const step of res.steps) {
            expect(
              SPECULATIVE.test(step.explanation),
              `${name} ${label}/${seed}: "${step.explanation}" — asks the player to carry a chain it never lays out`,
            ).toBe(false);
          }
        }
      }
      // The "how many did I actually look at?" guard: without it, a game whose
      // every case failed to generate would pass while asserting nothing.
      expect(checked, `${name}: nothing produced a hint to check`).toBeGreaterThan(0);
    });
  }
});

/**
 * How many plans each board is walked through. The opening plan alone is
 * where long sentences are rarest: a firing that needs more room to explain
 * usually needs more of the board decided first.
 *
 * **Deep, not shallow.** A firing that fires only deeper in the game (Light
 * Up's two discount arms) is not heard by a walk of a few plans, so its entry
 * matches nothing and reads as dead while the sentence is still being spoken.
 * A shallow walk turns a live ledger entry into a false "delete me", which is
 * the rot the check exists to stop.
 *
 * **And as wide as the modes a player can pick.** Unequal's Adjacent mode,
 * Solo's Killer and X, Salad's Number Ball are each reached by a preset and by
 * no tier of the first one. So every leaf preset is walked too, on one seed,
 * beside the tiers' three; the search-planning games keep their sliced preset
 * list, which is what their cost is sliced for. One seed per extra preset sits
 * between the tiers alone and every preset on every seed.
 *
 * {@link lintCases}' third rule is not spread evenly in cost: generating a
 * *large* board at a *hard* tier is the expensive corner, and a few games
 * (Group, Salad, Solo, Spokes) hold most of it. Slicing those is the lever if
 * this ever matters. Three seeds rather than one because the rule's whole job
 * is to let the close-out case decide a negative, and a negative from a sample
 * of one is not evidence — Group speaks its chain sentence on only some large
 * Hard seeds, so one seed is a coin flip on whether a live listing reads as
 * dead.
 */
const LINT_ROUNDS = 30;

/**
 * Whether this run walks {@link lintCases}' third rule — and with it, whether
 * the ledger's *rot* half can decide anything.
 *
 * **Off in the two local hooks, pre-commit and pre-push, on everywhere else**
 * (CI, `npm run gate`, a bare `vitest`). That is the gate's
 * third-scoping-by-role shape (`scripts/gate.sh`, `slow.ts`'s
 * {@link PRECOMMIT_HOOK_RUN}): CI runs `npm run gate` with the toggle unset on
 * every push to `main`, so this narrows what a hook costs and never what
 * protects the branch.
 *
 * **Why this rule and not the rest of the block.** The rule is most of the
 * block's cost, and the block is selected on essentially every commit — the
 * per-commit selector maps any staged path under `src/games/` to every guard
 * that reads game source as text, and this is one, so a one-line edit to one
 * game would pay for the whole rule. What it protects is not the code the
 * commit is changing: the forward half, which catches a sentence you just
 * wrote too long, runs on every commit at every tier and every preset and is
 * untouched. What defers to push is the *rot* half — a ledger listing that has
 * stopped being spoken — and rot is exactly the thing a push-time check
 * catches in time.
 *
 * **The two move together and must.** The rot half's verdict is decided
 * against this walk, so with the rule off it would report Group's live listing
 * as dead (see the ledger's first entry). It is therefore `skipIf`-ed on the
 * same flag rather than left to pass over a walk that could not see its
 * subject — a check that reports health over a sample it never took is the
 * defect this whole file exists to avoid.
 *
 * **What was rejected:** running the rule only for the games whose source the
 * commit staged. It sounds targeted and is unsound — the shared Latin chain
 * sentence lives in `engine/hint-text.ts`, so the commit most likely to kill a
 * listing touches no `src/games/<id>/` path at all, and the version that fixes
 * that ("...or any engine file") runs everything nearly always.
 */
const CORNER_WALKED = !PRECOMMIT_HOOK_RUN;

/**
 * The boards the length walk plays: every tier of the first preset on every
 * seed, then every other preset once, then **the last preset at the hardest
 * teachable tier**. Deduplicated by params, since a tier of the first preset is
 * often a preset too.
 *
 * That third rule is one board per tiered game, and it is the one corner of
 * `presets × tiers` the other two both miss: they walk every tier of the
 * *smallest* board and every board at *its own* tier, so a combination a player
 * reaches only through the Custom dialog — a big grid turned up to a hard tier —
 * is walked by neither. Group is the case: its shipped presets stop short of
 * a large board at Hard, and only there does it speak the shared Latin chain
 * sentence. A walk that misses the corner is short while the roster is right,
 * which is the failure mode that matters most here — a listing the walk cannot
 * reach reads as a dead exemption, and the close-out case would have it
 * deleted.
 *
 * **"Hardest teachable" excludes a declared search tier**, which is where the
 * cost lives and where there is nothing to hear: a hint refuses on a board that
 * needs a guess (docs/hints.md § "The quality bar" rule 6), so the plan stops
 * early, and generation there is by far the most expensive thing in the cross
 * product, a large board taking many times what it takes at Hard. The tier is
 * derived from its *name*, as `hint-resume.test.ts` and
 * `difficulty-contract.test.ts` do it:
 * `tierNames(n, { search: true })` puts "Unreasonable" last, so the game has
 * already said so for its own reasons.
 *
 * **"Last preset" stands in for "largest"** — preset menus are ordered
 * smallest-first by convention (see {@link untieredCases} on Netslide). If a
 * game ever orders them otherwise this walks a different board rather than a
 * wrong one, and the close-out case is what would notice. It is the last of
 * {@link untieredCases} rather than of `leafPresets`, so a search-planning
 * game's sliced list is sliced here too — for those games the board is the last
 * of the three the gate keeps, and the whole list in the slow tier.
 */
function lintCases(
  id: string,
  game: AnyGame,
): { label: string; params: unknown; seeds: readonly number[] }[] {
  const out: { label: string; params: unknown; seeds: readonly number[] }[] = [];
  const seen = new Set<string>();
  const add = (label: string, params: unknown, seeds: readonly number[]): void => {
    const key = JSON.stringify(params);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label, params, seeds });
  };
  const contract = game.difficulty;
  const tiers = difficultyTiers(game);
  if (contract && tiers) {
    const base = firstLeaf(game.presets());
    for (const [tier, tierName] of tiers.entries()) {
      add(`tier ${tier} ("${tierName}")`, withTier(game, base, tier), SEEDS);
    }
    // Through `untieredCases`, so a search-planning game's sliced preset list
    // is sliced here too rather than quietly handing this rule the one board
    // its cost was sliced to avoid.
    const last = CORNER_WALKED ? untieredCases(id, game).at(-1) : undefined;
    const top = tiers.length - (tiers.at(-1) === "Unreasonable" ? 2 : 1);
    if (last && top >= 0)
      add(
        "last preset at the hardest teachable tier",
        withTier(game, last.params, top),
        SEEDS,
      );
  }
  // A tiered game already plays three seeds of each tier, so its other presets
  // play once; an untiered game's presets are all it has, so they keep all three.
  const extra = contract && tiers ? SEEDS.slice(0, 1) : SEEDS;
  for (const c of untieredCases(id, game)) add(c.label, c.params, extra);
  return out;
}

/**
 * The **listings** that matched a step over the limit, as `"<entry index>:<game
 * id>"`. Filled by the per-game cases, read by the last one.
 *
 * Keyed by the pair, not by the entry: a listing is what the ledger asks a
 * reader to believe, so a listing is the unit the check has to hold. Keyed by
 * entry alone it would pass as soon as *any* listed game reached the sentence,
 * which on a single-game entry is the same thing and on the shared Latin chain
 * entry is not: a game could sit on that entry while never speaking it.
 */
const ledgerUsed = new Set<string>();
/** Steps walked per game, so the close-out case can tell "this game's walk
 * found nothing" from "this game's walk *was* nothing". */
const lintedPerGame = new Map<string, number>();
let linted = 0;

/** Whether `game`'s hints, followed from the board `id` as the length walk
 * follows them, speak a step of one of `rungs` that is over the limit. */
function speaksOn(name: string, id: string, rungs: readonly string[]): boolean {
  const game = HINT_GAMES.find(([g]) => g === name)?.[1];
  if (!game) return false;
  const colon = id.indexOf(":");
  let state = game.newState(game.decodeParams(id.slice(0, colon)), id.slice(colon + 1));
  for (let round = 0; round < LINT_ROUNDS; round++) {
    if (game.status(state) === "solved") break;
    const res = game.hint?.(state);
    if (!res?.ok) break;
    for (const step of res.steps) {
      const text = step.explanation;
      if (text.length > NARRATION_LIMIT && rungs.includes(step.rung)) return true;
    }
    for (const step of res.steps) state = game.executeMove(state, step.move);
  }
  return false;
}

describe("hint narration stays readable at a glance", () => {
  for (const [name, game] of HINT_GAMES) {
    it(`${name}: every step within ${NARRATION_LIMIT} characters, or ledgered`, () => {
      for (const { label, params, seeds } of lintCases(name, game)) {
        // A tier written onto the first preset can be accepted and still have
        // boards too rare to wait on (Group's 6x6 at Hard, identity shown).
        if (paramsError(game, params, true) || !dealsPromptly(game, params)) continue;
        for (const seed of seeds) {
          let board: { desc: string; aux?: string };
          try {
            board = dealt(game, params, seed);
          } catch {
            continue;
          }
          const { desc, aux } = board;
          let state = game.newState(params, desc);
          for (let round = 0; round < LINT_ROUNDS; round++) {
            if (game.status(state) === "solved") break;
            const res = game.hint?.(state, aux);
            if (!res?.ok) break;
            for (const step of res.steps) {
              const text = step.explanation;
              linted++;
              lintedPerGame.set(name, (lintedPerGame.get(name) ?? 0) + 1);
              // Which games `hint-ordinal.test.ts` owes a rendered frame: any
              // whose step numbers a chain. Held here because this is the
              // widest walk of hints there is, and it is already paid for.
              expect(
                declaredOrder(step.highlights) === null || name in CHAIN_PINS,
                `${name} ${label}/${seed}: "${text}" numbers a chain, and no board of ${name}'s is pinned to check the numbers are drawn. Add ${name} to CHAIN_PINS in testing/hint-chain-pins.ts.`,
              ).toBe(true);
              // The same walk holds a step's rung to the game's list: a
              // step built outside the typed path could carry any string.
              expect(
                game.hintRungs ?? [],
                `${name} ${label}/${seed}: "${text}" is of a rung hintRungs does not list`,
              ).toContain(step.rung);
              expect(
                text.length,
                `${name} ${label}/${seed}: "${text}" is over the hard ceiling of ${MAX_NARRATION_CHARS}`,
              ).toBeLessThanOrEqual(MAX_NARRATION_CHARS);
              if (text.length <= NARRATION_LIMIT) continue;
              const entry = LONG_NARRATIONS.findIndex(
                (e) => e.games.includes(name) && e.rungs.includes(step.rung),
              );
              expect(
                entry,
                `${name} ${label}/${seed}: "${text}" (rung ${step.rung}) is ${text.length} characters, over ${NARRATION_LIMIT}. Shorten it, or list the rung in LONG_NARRATIONS with the reason it needs the room.`,
              ).toBeGreaterThanOrEqual(0);
              ledgerUsed.add(`${entry}:${name}:${step.rung}`);
            }
            // Walk on through the whole plan, not just its first step: the
            // aim is the sentences deeper in the game, cheaply.
            for (const step of res.steps) state = game.executeMove(state, step.move);
          }
        }
      }
    });
  }

  it("states a reason for every ledger entry, and lists only hinting games", () => {
    // The structural half: cheap, needs no walk, and so runs on every commit
    // whatever `CORNER_WALKED` says.
    const hinting = new Set(HINT_GAMES.map(([id]) => id));
    for (const e of LONG_NARRATIONS) {
      expect(e.why.length, `${e.rungs} states no reason`).toBeGreaterThan(60);
      expect(e.rungs.length, `${e.games} lists no rung`).toBeGreaterThan(0);
      // A listed rung is one the game declares, so a renamed rung cannot
      // leave a listing that excuses nothing.
      for (const [g, game] of HINT_GAMES)
        if (e.games.includes(g))
          for (const rung of e.rungs)
            expect(game.hintRungs ?? [], `${g} has no rung ${rung}`).toContain(rung);
      for (const g of e.games)
        expect(hinting.has(g), `${g} ships no hint()`).toBe(true);
    }
  });

  // Skipped, and so reported, while no listing pins a board: the walk then
  // reaches every listed sentence itself.
  it.skipIf(!LONG_NARRATIONS.some((e) => e.spokenOn))(
    "every pinned board still speaks its listing's sentence over the limit",
    () => {
      for (const e of LONG_NARRATIONS) {
        for (const [g, id] of Object.entries(e.spokenOn ?? {})) {
          expect(
            e.games,
            `${g} is pinned on ${e.rungs} without being listed`,
          ).toContain(g);
          expect(
            speaksOn(g, id, e.rungs),
            `${g}: the board pinned for ${e.rungs} no longer speaks it over ${NARRATION_LIMIT} characters. Pin a board that does, or delete the listing.`,
          ).toBe(true);
        }
      }
    },
  );

  // Skipped rather than weakened in the two local hooks, so a deferred check is
  // **reported** instead of passing over a walk that could not see its subject.
  it.skipIf(!CORNER_WALKED)("ledgers only listings that still need the room", () => {
    // Registered last, so it runs after every per-game case has filled
    // `ledgerUsed`. Vacuity first: an unpopulated walk would find every listing
    // "unused" for the wrong reason.
    expect(linted, "the length walk looked at almost nothing").toBeGreaterThan(2000);
    // And per game, because the check below is a negative *per listing*: a game
    // whose every case refused to generate would read as dead on every entry it
    // is listed on, and the collection-wide floor above cannot say so — it is
    // met many times over by the games that did walk. The floor sits below what
    // the smallest listed game walks, and nowhere near "examined nothing".
    for (const g of new Set(LONG_NARRATIONS.flatMap((e) => e.games))) {
      const n = lintedPerGame.get(g) ?? 0;
      expect(
        n,
        `${g} is listed in LONG_NARRATIONS but its length walk looked at ${n} steps`,
      ).toBeGreaterThan(200);
    }
    // Collected rather than asserted one at a time, so one run reports every
    // dead listing: a check that stops at the first turns a census into a
    // queue of reruns, and this one's whole job is to be read as a census.
    const dead: string[] = [];
    LONG_NARRATIONS.forEach((e, i) => {
      // A pinned listing is held by the case above, on its board.
      for (const g of e.games)
        for (const rung of e.rungs)
          if (!ledgerUsed.has(`${i}:${g}:${rung}`) && !e.spokenOn?.[g])
            dead.push(`${g} on ${rung}`);
    });
    expect(
      dead,
      `listed in LONG_NARRATIONS but never spoke the rung over ${NARRATION_LIMIT} ` +
        "characters. Either the sentence got shorter, or that game never reaches the " +
        "rung. Widen the walk for the game first (every leaf preset, both auto-pencil " +
        "settings); if it still says nothing, delete the listing and record the walk " +
        "that found nothing beside the entry, so the next reader can re-run it rather " +
        "than re-derive it.",
    ).toEqual([]);
  });
});
