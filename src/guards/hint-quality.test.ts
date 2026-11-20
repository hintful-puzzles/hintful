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
 *    tier and every preset, and into the middle of the game, in its own
 *    block, because the first preset's opening plan is where the long
 *    sentences never are. Each ledgered sentence is held to a board that
 *    still speaks it.
 *  - **No step restates the counter** (§ "Keep the narration terse"): a leg
 *    of a journey never says which leg it is or how many there are, which
 *    the chrome shows as "Step 2 of 7". Held in the bound walk.
 *  - **No step asks the player to carry a chain it never lays out**: a
 *    *Tactic* is taught as ordinary steps, each writing its mark, and a
 *    supposition is a Search, which may not be narrated at all.
 *    Checked twice — once on each game's first preset with the rules
 *    above, and once **per tier** in its own block at the bottom,
 *    because such a rung is tier-gated and the first preset is the one
 *    place it can never fire.
 *
 * Form only: no assertion here ever touches *what* a hint says about the
 * board — flattening a good hint to satisfy a guard is a failure, not a fix.
 */
import { describe, expect, it } from "vitest";
import { FOUR_FILLS, FREE, TWO, wordOf } from "../engine/color/colors.ts";
import type { HintStep } from "../engine/contract/game.ts";
import { NARRATION_LIMIT, Sentence } from "../engine/contract/hint-words.ts";
import type { Color } from "../engine/contract/types.ts";
import { paramsError } from "../engine/game-id/params.ts";
import { dealt } from "../engine/testing/dealt.ts";
import { bindingDefects } from "../engine/testing/hint-binding.ts";
import {
  type AnyGame,
  declaresNoMarks,
  gatePresets,
  HINT_GAMES,
  SEARCH_PLANNING_GAMES,
  SEARCH_REACH_GAMES,
} from "../engine/testing/hint-games.ts";
import { referenceDefects } from "../engine/testing/hint-reference.ts";
import { DEFAULT_BACKGROUND } from "../engine/testing/render-scenario.ts";
import { itOverWholeSweep, SLOW_TESTS_ENABLED } from "../engine/testing/slow.ts";
import { FIRST_SHARE, ofThisShare } from "../engine/testing/sweep-share.ts";

/**
 * Which of a params set's shared boards (`dealt`) a walk takes: the first.
 * Every rule here is about the words a rung speaks, so a second board of one
 * configuration walks code paths the first already walked; what a walk can
 * miss is a sentence few boards reach, and that is pinned to a board
 * ({@link LONG_NARRATIONS}' `spokenOn`) rather than sampled for.
 */
const SEEDS = [0];

/** The hinting games this share walks, each with every walk below: a check
 * that closes over a walk (the ledger's, the forms') then holds this share's
 * games to what this share heard. A check that walks nothing runs in the first
 * share alone. */
const SHARE_GAMES = ofThisShare(HINT_GAMES);
const SHARE_IDS = new Set(SHARE_GAMES.map(([id]) => id));

/** The hard ceiling: what a ledgered sentence is held to instead. */
const MAX_NARRATION_CHARS = 300;

/**
 * The override for sentences a game's code writes or assembles: the rungs
 * whose sentences are allowed past {@link NARRATION_LIMIT}, an entry per reason
 * they need the room. A sentence a description's wording states whole says
 * why beside the wording instead (`long:`), which the sentence carries
 * (`Sentence.long`), and `npm run describe` holds it both ways: a wording past
 * the limit on every board needs one, and one on wordings no board makes long
 * is refused (docs/descriptions.md § "What the compiler checks of a wording").
 * An entry
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
 * on the entry, and the reverse half asks whether *this game* still speaks it.
 *
 * **The reverse half is decided on a board, never on a sample.** Each listing
 * names, for each game it lists, a board that speaks the sentence over the
 * limit (`spokenOn`, a `params:desc`), and "every pinned board still speaks its
 * listing's sentence" walks it as the length walk would. A negative over the
 * walk's boards was no evidence: a sentence that fires on few boards read as
 * dead whenever the seeds missed it. So a roster is the games a board has been
 * found for, and a game that cannot be pinned is not listed.
 */
/** Why a wing's step runs long. */
const WING_NAMES_ITS_CELLS =
  "The owner's 2026-10-28 wording: \"whatever goes in the middle cell, another " +
  'outlined cell in line with this cell must have 2", which names the cells ' +
  "by their mark rather than a noun of their own, and takes the room where " +
  "the middle could hold the value too, Solo's sees a block, or Map's " +
  "conclusion dots the colors left.";

const LONG_NARRATIONS: {
  games: string[];
  rungs: string[];
  why: string;
  spokenOn: Record<string, string>;
}[] = [
  {
    games: ["solo"],
    rungs: ["wing"],
    why: WING_NAMES_ITS_CELLS,
    spokenOn: {
      solo: "3x3de:a1a3c9c6_8b2a5b5b9a7_3f6c4a6a2a5c1f1_5a9b3b3a8b1_5c7c6a8a",
    },
  },
  {
    games: ["map"],
    rungs: ["weigh"],
    why: WING_NAMES_ITS_CELLS,
    spokenOn: {
      map: "15x20n30dh:faiaaaaaafdabamaacabacabdaabdabbacdbaafaaafeaaababbadbbdkaaalacaadcdgadabaaacaccahdabcbagbbbdaaaccbadaccdaafadbabbebcadadaacdcccacfacabbjadcacgaabdadbdadbfabahabbbabafcbabbagbaladabdecbaaaaabaaaaddaaaabaabbfbaabadalccac,02033322d31a303f11a022",
    },
  },
  {
    games: ["rome"],
    rungs: ["opposite"],
    why:
      "It names the neighbor, its area, and both of the neighbor's ways with " +
      "what each would make, a loop or two arrows alike, which is the whole " +
      "of why the square is struck (rome's 8x10 Tricky, 2026-10-27: 122 " +
      "characters with a left neighbor; a right one is two longer).",
    spokenOn: {
      rome: "8x10dt:6a4a1a2aaa2a3aa1a3ab1b2b1a1abaaf4c1a3b2a6aaba2a7a2aa3a1c1,bRDaXLbDcLRdLaRcUdLDbURaDcRaLaRUXaDbLaLcUbLdUDUbDUg",
    },
  },
  {
    games: ["crossing"],
    rungs: ["crossRuns"],
    why:
      "Its premise is the digits the tighter run's fitting numbers leave the " +
      "square, which no mark shows, so they are listed in full; where both " +
      "runs leave five or more, the list alone is a fifth of the line " +
      "(crossing's last preset, 2026-10-22: 123 characters with five).",
    spokenOn: {
      crossing:
        "15x15Sde:7b6a1b1a4a1b7a1b1a4b1a7a1a5a1a1a1a2a1a1a3a2a1a7a1b4a2b1a2a2a1b2a4b1a7a1a2a3a1a1a2a1a1a1a5a1a7a1b4a1b1a7b1a4a1b1a6b7,25,27,28,45,47,62,71,73,77,79,84,87,89,92,95,99,142,143,197,247,317,345,365,411,413,425,498,499,513,557,671,765,814,815,869,927,947,949,975,984,2311,2472,4478,5194,7183,7212,7926,9659,22499,33464,79354,82855,87427,88392,456457,575287,749691,754341,3814167,4483998,8789149,8857768,42828377,49641451",
    },
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
 * taxonomy (`docs/solver-and-generator.md` § "Check, Tactic, Search"), which splits on whether each
 * link of the reasoning writes a mark the player can make:
 *
 * - **Check** — place, look, one rule breaks; or weigh every value of one
 *   element so and keep what they share. Narrate directly.
 * - **Tactic** — a chain whose every link is a mark the player can make,
 *   taught as ordinary steps, each writing its mark.
 * - **Search** — run the whole solver from a hypothesis, branch and
 *   backtrack, or follow a chain of suppositions. `Unreasonable` only, and
 *   never narrated at all.
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

  // Loopy's blocked-pair rung: "Both outlined dots have a line, so joining
  // them leaves this 2 short: that edge can't be one and the rest must be
  // lines." The necessity is in "leaves this 2 short" — the clue could not be
  // met — and the conclusion is then stated in Loopy's own board word, where an
  // edge that is *out* is one ruled out (the same word its other sentences use:
  // "aren't ruled out", "already out"). Endorsed because the sentence is: the
  // owner settled its words on 2026-09-19, and `loopy/hint-text.ts` records what
  // each clause is doing and why it says it that way; the "so … :" join is the
  // engine's form for a look, what follows from it, and the move. Reached only
  // at Hard, so only a walk over the presets menu, not the first preset, hears
  // it.
  loopy: (s) => /leaves this \d+ short: that edge can't be one/.test(s.explanation),
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

/** A color's words in both schemes. */
const bothWords = (c: Color): string[] => [wordOf(c).light, wordOf(c).dark];

/**
 * The two-state pair's color words that `game`'s hint may not say, as one
 * pattern, or `null` where it may say them all. A piece or a state is named by
 * the rules or by its shape, since a theme changes the color and no word
 * (`name-states-by-rule-not-color`). A color is the content only where the
 * game draws it from a set whose colors are named for the player (`FREE`,
 * `FOUR_FILLS`): Flood's yellow, Map's yellow region.
 */
function pairColorWords(game: AnyGame): RegExp | null {
  const content = contentWords(game);
  const words = TWO.flatMap(bothWords).filter((w) => !content.has(w));
  return words.length === 0 ? null : new RegExp(`\\b(?:${words.join("|")})\\b`, "i");
}

/** The color words `game` draws as content. */
function contentWords(game: AnyGame): ReadonlySet<string> {
  const palette = game.colors(DEFAULT_BACKGROUND);
  return new Set(
    [...FREE, ...FOUR_FILLS].filter((c) => palette.includes(c)).flatMap(bothWords),
  );
}

if (FIRST_SHARE)
  it("finds the games whose colors are their content, and only by the palette", () => {
    const found = HINT_GAMES.filter(([, g]) => contentWords(g).size > 0).map(
      ([id]) => id,
    );
    expect(found).toEqual(expect.arrayContaining(["flood", "map"]));
    expect(found.length).toBeLessThan(HINT_GAMES.length / 4);
  });

if (FIRST_SHARE)
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
        expect(hinting.has(id), `${id} is exempted here but ships no hint()`).toBe(
          true,
        );
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
 * The form rules below walk the gate slice. **This block is about sentences.**
 * A form rule — is the step visible, is the conclusion in the necessity voice,
 * is there an em-dash — is a property of the *sentence*, so the question is
 * how many distinct sentences the walk hears, and another preset hears new
 * ones (Solo's Killer cages, Loopy's other tilings) where a second seed of one
 * preset hears the same ones again.
 *
 * The length walk below takes the same slice deeper into the game, but only
 * for *length*; the necessity voice, the visibility rule and the
 * speculative-chain rule are this block's.
 */
describe("hint narration form, cross-game", () => {
  for (const [name, game] of SHARE_GAMES) {
    it(`${name}: every step is visible, terse${DEDUCTIVE.has(name) ? ", and necessity-voiced" : ""}`, () => {
      const pairColor = pairColorWords(game);
      for (const { title, params } of gatePresets(game))
        for (const seed of SEEDS) {
          const { desc, aux } = dealt(game, params, seed);
          const state = game.newState(params, desc);
          const res = game.hint.plan(state, aux);
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
                `${at} — no necessity modal. Say what the board forces ` +
                  "(must, cannot, has to); a game whose hint narrates moves and " +
                  "deduces nothing goes in NARRATES_MOVES, and a wording the " +
                  "owner endorsed in IDIOMS (src/guards/hint-quality.test.ts)",
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
            expect(
              pairColor?.test(step.explanation) ?? false,
              `${at} — narration names a piece by its color; say the rules' word or the shape's (PAIR_NAMES, SHADED_NAME)`,
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
 * `hint.refreshStep` returns it after the moves before it, because a refresh
 * that shrinks a step's marks has to shrink its words with them.
 */
const BOUND_GAMES = HINT_GAMES.filter(([, g]) => g.hint.marks !== undefined);

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
 * How many steps of one board the walk below checks: a board's later steps
 * are spoken by the rungs its earlier ones were, and the largest boards
 * (Mosaic's 50x50) run to many times this, at most of the walk's cost. A rung
 * the walk does not reach is held by its pinned position in the game's own
 * hint test, and the slow tier checks every step. At 150 the walk checked
 * 13,022 steps against 400's 16,185, and met every form 400 did and every rung
 * but Loopy's `clueBlockedPair`, which its pin holds (2026-11-09).
 */
const BOUND_STEPS = SLOW_TESTS_ENABLED ? Number.POSITIVE_INFINITY : 150;

/** A step of a journey of two or more legs, held to `journeyDefects`: what
 * {@link formsHeard} records for it. */
const JOURNEY = "a leg of a multi-leg journey";

/** The games whose walk held a step of each form, and of {@link JOURNEY}, so
 * the close-out can tell that every kind of exception, the searching check and
 * the journey rule met real steps. */
const formsHeard = new Map<string, Set<string>>();

/**
 * For each form the close-out needs met, a game whose walk meets it: a share
 * sees only its own games' walks, so each is held in the share that walks its
 * game. Three of them are searching forms, so the searching check met three
 * kinds of step. Each was measured among the games that meet it (2026-10-27).
 */
const MET_ON: Record<string, string> = {
  "unshaped:setup": "towers",
  "unshaped:evident": "filling",
  "searching forced:lost": "samegame",
  "searching effect": "sokoban",
  "searching sequence": "pegs",
  [JOURNEY]: "twiddle",
};

function heard(form: string, game: string): void {
  const games = formsHeard.get(form) ?? new Set<string>();
  formsHeard.set(form, games.add(game));
}

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

if (FIRST_SHARE)
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
  if (FIRST_SHARE)
    it("every hinted game is bound", () => {
      // A hint whose game declares no legend is checked by nothing here, so an
      // unbound hint is named rather than passed over.
      expect(HINT_GAMES.filter(([, g]) => !g.hint.marks).map(([name]) => name)).toEqual(
        [],
      );
      // Vacuity: the population itself, so an empty registry cannot pass.
      expect(BOUND_GAMES.length).toBe(HINT_GAMES.length);
      expect(HINT_GAMES.length).toBeGreaterThan(40);
    });

  if (FIRST_SHARE)
    it("every hinted game lists its rungs, each once", () => {
      // The walk below holds every step's rung to this list, and the pin harness
      // requires a pinned position for each entry (`testing/hint-positions.ts`).
      for (const [name, game] of HINT_GAMES) {
        const rungs = game.hint.rungs ?? [];
        expect(rungs.length, `${name} declares no hintRungs`).toBeGreaterThan(0);
        expect(new Set(rungs).size, `${name} lists a rung twice`).toBe(rungs.length);
      }
    });

  for (const [name, game] of BOUND_GAMES.filter(([id]) => SHARE_IDS.has(id))) {
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
        if (step.words && game.hint.marks)
          for (const d of referenceDefects(step.words, game.hint.marks))
            defects.push(`${at} (${step.rung}): "${step.explanation}": ${d}`);
        if (legs > 1) heard(JOURNEY, name);
        for (const d of journeyDefects(step.explanation, leg, legs))
          defects.push(`${at}: "${step.explanation}": ${d}`);
        const form = step.words?.form;
        if (form) {
          const key =
            "unshaped" in form
              ? `unshaped:${form.unshaped}`
              : `${SEARCHING.has(name) ? "searching " : ""}${form.relation}${form.rivals ? `:${form.rivals}` : ""}`;
          heard(key, name);
        }
      };
      for (const { title, params } of gatePresets(game))
        for (const seed of SEEDS)
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
              const res = game.hint.plan(state, aux, ui);
              if (!res?.ok) break;
              // Each step over the board it is narrated for: the state after
              // the steps before it.
              for (const [i, step] of res.steps.entries()) {
                if (walked++ >= BOUND_STEPS) break;
                const journey = journeyOf(res.steps, i);
                check(state, ui, step, `${at} round ${round} step ${i}`, journey);
                // `null` is a step already resolved: the midend skips it.
                const live = game.hint.refreshStep
                  ? game.hint.refreshStep(step, state)
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

  if (FIRST_SHARE)
    it("pins each form on a game the walk takes", () => {
      for (const game of Object.values(MET_ON))
        expect(BOUND_GAMES.map(([id]) => id)).toContain(game);
    });

  itOverWholeSweep("met every form it checks on real steps", () => {
    // Vacuity: each property the form checks hold steps to was held on some.
    // `bare` is not here: no walked board leaves a hint nothing to say, and
    // the games that can (Pegs, Flood) pin it in their own tests.
    for (const [form, game] of Object.entries(MET_ON)) {
      if (!SHARE_IDS.has(game)) continue;
      expect(
        [...(formsHeard.get(form) ?? [])],
        `${game}'s walk held no step of "${form}"; pin a game whose walk does`,
      ).toContain(game);
    }
  });
});

/**
 * The same speculative-vocabulary check, **across everything a game varies**.
 *
 * It needs its own sweep because the block above samples
 * `firstLeaf(presetMenu(game))` — each game's *easiest* preset — and a trial rung
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
describe("no hint leaves a chain for the player to carry, at any tier", () => {
  for (const [name, game] of SHARE_GAMES) {
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
      const cases = gatePresets(game).map((e) => ({
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
          const res = game.hint.plan(game.newState(params, desc), aux);
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
 * no tier of the first one, so the walk takes the slice (`gatePresets`): a
 * board of every value of every axis, each tier among them, on the smallest
 * preset offering it. The presets between are the slow tier's, where the
 * slice is every preset.
 *
 * The walk is the forward half of the ledger: a sentence over the limit that
 * no listing excuses. Whether a listing is still spoken is decided on its
 * pinned board, never by this walk, so the walk can stay this narrow.
 */
const LINT_ROUNDS = 30;

/** Whether `game`'s hints, followed from the board `id` as the length walk
 * follows them, speak a step of one of `rungs` that is over the limit. */
function speaksOn(name: string, id: string, rungs: readonly string[]): boolean {
  const game = HINT_GAMES.find(([g]) => g === name)?.[1];
  if (!game) return false;
  const colon = id.indexOf(":");
  let state = game.newState(game.decodeParams(id.slice(0, colon)), id.slice(colon + 1));
  for (let round = 0; round < LINT_ROUNDS; round++) {
    if (game.status(state) === "solved") break;
    const res = game.hint.plan(state);
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
  for (const [name, game] of SHARE_GAMES) {
    it(`${name}: every step within ${NARRATION_LIMIT} characters, or ledgered`, () => {
      let linted = 0;
      for (const { title, params } of gatePresets(game)) {
        const label = `preset "${title}"`;
        for (const seed of SEEDS) {
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
            const res = game.hint.plan(state, aux);
            if (!res?.ok) break;
            for (const step of res.steps) {
              const text = step.explanation;
              linted++;
              // The same walk holds a step's rung to the game's list: a
              // step built outside the typed path could carry any string.
              expect(
                game.hint.rungs ?? [],
                `${name} ${label}/${seed}: "${text}" is of a rung hintRungs does not list`,
              ).toContain(step.rung);
              expect(
                text.length,
                `${name} ${label}/${seed}: "${text}" is over the hard ceiling of ${MAX_NARRATION_CHARS}`,
              ).toBeLessThanOrEqual(MAX_NARRATION_CHARS);
              if (text.length <= NARRATION_LIMIT) continue;
              // A description's wording says why beside it (`long:`).
              if (step.words instanceof Sentence && step.words.long !== null) continue;
              const entry = LONG_NARRATIONS.findIndex(
                (e) => e.games.includes(name) && e.rungs.includes(step.rung),
              );
              expect(
                entry,
                `${name} ${label}/${seed}: "${text}" (rung ${step.rung}) is ${text.length} characters, over ${NARRATION_LIMIT}. Shorten it; or where its description states it, say why it needs the room with long: beside the wording; or else list the rung in LONG_NARRATIONS with the reason.`,
              ).toBeGreaterThanOrEqual(0);
            }
            // Walk on through the whole plan, not just its first step: the
            // aim is the sentences deeper in the game, cheaply.
            for (const step of res.steps) state = game.executeMove(state, step.move);
          }
        }
      }
      // A game whose every board refused would pass having read nothing.
      expect(linted, `${name}: the length walk read no step`).toBeGreaterThan(0);
    });
  }

  if (FIRST_SHARE)
    it("states a reason for every ledger entry, and lists only hinting games", () => {
      const hinting = new Set(HINT_GAMES.map(([id]) => id));
      for (const e of LONG_NARRATIONS) {
        expect(e.why.length, `${e.rungs} states no reason`).toBeGreaterThan(60);
        expect(e.rungs.length, `${e.games} lists no rung`).toBeGreaterThan(0);
        expect(
          Object.keys(e.spokenOn).sort(),
          `${e.rungs}: pin a board that speaks it for each game listed, and no other`,
        ).toEqual([...e.games].sort());
        // A listed rung is one the game declares, so a renamed rung cannot
        // leave a listing that excuses nothing.
        for (const [g, game] of HINT_GAMES)
          if (e.games.includes(g))
            for (const rung of e.rungs)
              expect(game.hint.rungs ?? [], `${g} has no rung ${rung}`).toContain(rung);
        for (const g of e.games)
          expect(hinting.has(g), `${g} ships no hint()`).toBe(true);
      }
    });

  // A listing is held in the share that walks its game. Collected rather than
  // asserted one at a time, so one run reports every dead listing.
  it("every pinned board still speaks its listing's sentence over the limit", () => {
    const dead: string[] = [];
    for (const e of LONG_NARRATIONS)
      for (const [g, id] of Object.entries(e.spokenOn))
        if (SHARE_IDS.has(g) && !speaksOn(g, id, e.rungs))
          dead.push(`${g} on ${e.rungs}`);
    expect(
      dead,
      `the board pinned for these no longer speaks the rung over ${NARRATION_LIMIT} ` +
        "characters. Either the sentence got shorter, and the listing goes, or the " +
        "board stopped reaching it, and another board that does is pinned.",
    ).toEqual([]);
  });
});
