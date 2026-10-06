/**
 * Cross-game guarantees on hint narration *form* (never content).
 *
 * `docs/games/hints.md` § "Writing the narration" is a list of narration rules
 * that were, until this file, enforced per-game or by review alone — and
 * narration quality is the broadest hint-defect class in the history (8 games;
 * see `unify-hint-framework` §0.2). Three of its rules are pure form, so
 * they are guarded here for every hinting game at once:
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
 *  - **No step asks the player to carry a chain it never lays out**
 *    (`audit-guessing-tier-names`): a bounded chain is a legitimate
 *    *Tactic* and may be narrated — but with the chain **shown on the
 *    board**, ordered and anchored at both ends, rather than compressed
 *    into a claim; an unbounded search may not be narrated at all.
 *    Checked twice — once on each game's first preset with the rules
 *    above, and once **per tier** in its own block at the bottom,
 *    because such a rung is tier-gated and the first preset is the one
 *    place it can never fire.
 *
 * Form only: no assertion here ever touches *what* a hint says about the
 * board — flattening a good hint to satisfy a guard is the failure mode
 * this change's spec explicitly forbids.
 */
import { describe, expect, it } from "vitest";
import { difficultyTiers, withTier } from "./difficulty.ts";
import type { HintStep } from "./game.ts";
import { paramsError } from "./params.ts";
import { randomNew } from "./random/index.ts";
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
import { firstLeaf, leafPresets } from "./testing/presets.ts";
import { PRECOMMIT_HOOK_RUN, SLOW_TESTS_ENABLED } from "./testing/slow.ts";

const SEEDS = ["hq-a", "hq-b", "hq-c"];

/**
 * How long a step may be — short enough to read at a glance (owner,
 * 2026-09-10: *"a character limit as a linter, and a way to override it for a
 * few particularly complex hints"*).
 *
 * Measured before it was set, over 15,132 steps in 30 games: median 84, p75
 * 110, p90 147. 120 is the line Netslide and Spokes had each already drawn for
 * themselves, and it flags the 139-character Tracks sentence the owner
 * shortened by hand when asking for this — a limit that would not have caught
 * the sentence that prompted it would not be the one asked for.
 */
const NARRATION_LIMIT = 120;

/** The hard ceiling: what a ledgered sentence is held to instead. */
const MAX_NARRATION_CHARS = 300;

/** Why Boats' placing steps run long; two ledger entries share it. */
const BOATS_RINGS_THE_WATER =
  "A step that places a boat segment also rings the water boats never " +
  "touch, by the owner's choice to show that rule on the board rather than " +
  "spend a step restating it; a bound step names every mark it draws, so " +
  "the sentence carries one clause for it.";

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
 * its narration would say this, yet 100,249 plan steps never chose one, because
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
 * it** (`spokenOn`, a `params:desc` per game). Rect's is the case: its line
 * sentence fires on few boards, and three seeds a preset missed all of them,
 * so the listing read as dead on every push while a probe heard the sentence
 * 131 times on one preset. A pinned board is an input, where a wider walk
 * would be a bigger sample of the same kind, and it is checked on every commit
 * rather than at push: "every pinned board still speaks its sentence".
 */
const LONG_NARRATIONS: {
  games: string[];
  rungs: string[];
  why: string;
  spokenOn?: Record<string, string>;
}[] = [
  {
    // Not Mathrax, though its solver records `forcing`: measured over all nine
    // presets × 3 seeds × both auto-pencil settings, 100,249 plan steps spoke
    // this sentence **zero** times, because the frontier takes its clue strikes
    // and singles first and the board finishes before a chain is ever the best
    // candidate.
    //
    // Group is the near-miss in the other direction, and is listed on the
    // measurement rather than on the inference: it reaches this sentence at
    // **Hard only** (measured 2026-10-06 over 12 deals a cell: 26 times at
    // 12x12 Hard and 9 at 8x8 Hard, and zero at 8x8, 10x10 and 12x12 Normal
    // and Tricky, at 10x10 Hard, and at 12x12 Tricky with the identity
    // hidden). Neither Hard board is a shipped preset: 8x8 Hard is refused as
    // too rare to deal, and 12x12 Hard is reachable through the Custom dialog.
    // So the board is pinned. `lintCases`' last-preset rule used to reach it,
    // until the preset list was regrouped and its last entry became an 8x8.
    games: ["group", "keen", "salad", "solo", "towers", "unequal"],
    rungs: ["forcing"],
    spokenOn: {
      group:
        "12dx:1_2_3_4_5_6_7_8_9_10_11_12_2k3a7g9a4f9a3b5k6b2c1c9_7k8h6b9k10_5b9g11k12f5d",
    },
    why:
      "The Latin chain Tactic (`latin-hint.ts`). ts-engine requires a narrated " +
      "chain to name both ends, cite its links by position and say when the " +
      "conclusion rests on a case split, and that is three clauses.",
  },
  {
    games: ["solo"],
    rungs: ["cageMinMax", "cageSums"],
    why:
      "Killer's region rule under a cage-sum strike is two premises: what the " +
      "row, column or block leaves its open cells, which the player needs to " +
      "see worked out because nothing on the board records it, and then the " +
      "min/max or combination rung on that sum (`teach-solo-cage-splits`).",
  },
  {
    games: ["rome"],
    rungs: ["opposite"],
    why:
      "Rome's opposite rule has two branches, and dropping either is a " +
      "non-sequitur: an arrow into a square that can only point along its " +
      "axis is either pointed straight back at (a loop) or repeated (a second " +
      "arrow of that direction in the area), and the same-area premise is what " +
      "makes the second one illegal.",
  },
  {
    games: ["singles"],
    rungs: ["offset"],
    why:
      'The owner-endorsed indication-first offset narration (hints.md § "Lead ' +
      'with the indication"): its opener alone, the pattern the player learns ' +
      "to spot, is 65 characters.",
  },
  {
    games: ["lightup"],
    rungs: ["discountClue", "discountUnlit"],
    why:
      "Two premises and a quantifier: one of a set must light the outlined dark square " +
      "or fill the clue, and a bulb here disqualifies every member. The reach " +
      "relation is also the deixis tie: the driving clue is never adjacent to or " +
      "in line with the target (lightup/index.ts, measured).",
  },
  {
    games: ["boats"],
    rungs: ["centerForced", "givenClue", "lineForced", "refuted"],
    why: BOATS_RINGS_THE_WATER,
  },
  {
    // An entry of its own because a pin excuses every rung of its entry from
    // the walk, and the board speaks only this one. Measured 2026-10-06 over 6
    // deals a preset, the sentence ran over the limit on 3 of them at 10x10
    // Normal and 2 at 10x10 Tricky, and on none at 10x10 Hard or below 10x10:
    // live on shipped boards, and missed by the one seed those presets walk.
    games: ["boats"],
    rungs: ["onlyRunsLeft"],
    spokenOn: {
      boats:
        "10x10f4dn,4,3,2,1:3,2,0,2,1,5,1,2,2,2,1,5,1,4,3,2,0,3,0,1,mWgWmBlCxWWoWSaWbW",
    },
    why: BOATS_RINGS_THE_WATER,
  },
  {
    games: ["palisade"],
    rungs: ["equivalentEdges"],
    why:
      "The collection's hint exemplar, quoted in docs/games/hints.md § \"The " +
      'quality bar" and owner-endorsed: the "share a fate" premise and its ' +
      "gloss are what made the conclusion follow.",
  },
  {
    games: ["palisade"],
    rungs: ["cluesVersusRegionSize"],
    why:
      "A proof by contradiction over two clues at once: opening their shared " +
      "edge would spend each 3's only open side and seal a region of the wrong " +
      "size, and each of those clauses carries weight.",
  },
  {
    games: ["boats"],
    rungs: ["sharedDiagonal"],
    why:
      "A two-case argument: the line's water budget forces a boat segment into " +
      "one of the marked squares, and the conclusion holds whichever it is, " +
      "which the sentence has to say to be true.",
  },
  {
    games: ["pearl"],
    rungs: ["square", "whiteCannotTurn"],
    why:
      "The owner's 2026-09-27 request (pearl/hint.ts, carryOn): a step also " +
      "draws the line on through a white pearl it runs into, and says so in a " +
      "second sentence after its own deduction, whichever deduction that is.",
  },
  {
    games: ["subsets"],
    rungs: ["collapse"],
    why:
      "The owner's 2026-07-21 enhancement (subsets/index.ts, narrateExclusion): " +
      "a collapse names one competitor set and the visible rule that blocks it, " +
      "a second sentence on purpose.",
  },
  {
    games: ["salad"],
    rungs: ["borderFar", "borderNear"],
    why:
      "Salad's border-clue deductions carry two premises each: the symbol the " +
      "clue sees first, and either the line's empty-square budget or the marked " +
      "gap before this square. The strike list follows, so the long cases are " +
      "the ones where the budget or the gap has to be counted out.",
  },
  {
    games: ["magnets"],
    rungs: ["lineExact", "onlyEndLeft"],
    why:
      "Magnets' count premises carry two: the line's count, and why each other " +
      "square of it cannot take the pole. The owner's 2026-09-22 playtest found " +
      "the second missing, and a step that rests on a fact has to say it " +
      "(magnets spec, the hidden facts a later step names in board terms).",
  },
  {
    games: ["clusters"],
    rungs: ["chain"],
    why:
      "A Tactic chain. ts-engine requires the narration to name both ends and " +
      'cite the links by their numbers on the board, and "from it" is the ' +
      "deixis tie clusters-hint.test.ts checks.",
  },
  {
    games: ["towers"],
    rungs: ["lineFull"],
    why:
      "The line-full rule strikes the shortest heights from the cell nearest the " +
      "clue without placing anything, and the guide records a first cut that " +
      "implied a placement: the wording that stops that misreading needs both " +
      'sentences (hints.md § "Conclude with the action the move makes").',
  },
  {
    games: ["map"],
    rungs: ["sharedPair"],
    why:
      "Two premises: the pair are down to the same two colors, and, because " +
      "they touch, they use both between them. The second is what makes " +
      '"this region can\'t be either" follow; it is Palisade\'s "share a fate" ' +
      "premise in Map's terms, and the sentence without it is the non-sequitur " +
      "that exemplar was fixed for.",
  },
  {
    games: ["map"],
    rungs: ["forcingChain"],
    why:
      "Map's chain Tactic, held to what ts-engine asks of every narrated chain: " +
      "name both ends, cite the links by their numbers on the board, and state " +
      "the case split. The walk names each link's color, which is what made it " +
      "readable at a glance (owner playtest, 2026-09-25), and costs a clause per link.",
  },
  {
    games: ["singles"],
    rungs: ["corner2", "corner3"],
    why:
      'The owner-directed corner family (hints.md § "Name a square by its ' +
      'value": concrete values read far clearer): each arm is a proof by ' +
      "contradiction whose links are values the player can check, and the " +
      "box-in step is the one a shorter sentence would drop.",
  },
  {
    games: ["signpost"],
    rungs: ["onlyBefore", "onlyNext"],
    why:
      "A link's rivals ruled out for all three of Signpost's reasons at once: the " +
      "sentence names each reason some rival has, and a reason left out would " +
      "leave a square on the board the player cannot account for.",
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
      "what makes it a group: the wire must stop there however they turn.",
  },
  {
    games: ["rect"],
    rungs: ["line"],
    // Upstream's 10x10 board, which `rect-hint.test.ts` pins for this rung.
    spokenOn: { rect: "10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c" },
    why:
      "A line drawn because every rectangle across the edge is ruled out rests " +
      "on two premises: which clues could cross it at all, and why none of " +
      "their rectangles stands. Without the first the player cannot tell the " +
      "edge is closed to every clue, and without the second, why.",
  },
  {
    games: ["mines"],
    rungs: ["pair"],
    why:
      "Two numbers that share squares, in its three forms: one needs more than " +
      "the other allows in the shared squares; one's squares all lie inside " +
      "the other's, which needs more than they can hold; or they lie inside " +
      "and both need the same. Each has to name both numbers, what each needs " +
      "and the shared squares, or the conclusion does not follow, and two " +
      "numbers of one value add where each sits.",
  },
  {
    games: ["mines"],
    rungs: ["full"],
    why:
      "A number that already touches some of its mines needs the rest in its " +
      "last unopened squares; 'still' is what tells the player the flagged " +
      "mines around it are counted, and two numbers of one value add where " +
      "each sits.",
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
 * **Two entries are here because the sweep below finally heard them**
 * (`slice-the-first-leaf-hint-guards-by-axis`). A lexical rule's vocabulary can
 * only be as wide as the sentences it is run over, and this one was run over
 * each game's easiest opening plan, so two constructions the collection has
 * used all along were missing:
 *
 *  - *"…can take one line at most"* — a proved bound, which is what `at most`
 *    always is here. Loopy writes it six ways, and Bridges, Clusters, Slant and
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
 * **The population is derived and the exceptions are declared**, which is the
 * way round this repo settled on (`audit-declared-versus-derived-capabilities`;
 * `docs/games/testing.md` § "How a cross-game guard finds its population").
 * It was the other way round until then: an opt-in set of eighteen names, which
 * had silently missed **six** hinting games — Boats, Bricks, Group, Salad,
 * Sticks and Subsets — every one of them deductive, and five of them passing
 * this check across 72–153 steps the whole time nothing ran it. That is
 * `testing/hint-games.ts`'s own defect one level down, and it has the same fix:
 * a guard blind to a game cannot fire on it, so a game must have to be
 * *removed* rather than added.
 */
const NARRATES_MOVES: Record<string, string> = {
  fifteen: "sliding-tile: a step names the tile to slide, not a forced fact",
  sixteen: "sliding-tile: a step names the row or column to rotate",
  netslide: "sliding-tile: a step names the row or column to rotate",
  flood: "objective: a step names the color to flood with",
  inertia:
    "movement: the one thing it can prove is a gem's unreachability, and its " +
    "steps narrate the consequence a slide has (`add-inertia-hint`)",
  pegs:
    "search: no jump is forced by logic; a step names the jump and what was " +
    "checked about it, a necessity only where every rival was proved lost " +
    "(`add-pegs-hint`)",
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
 * the reasoning behind it was *not laid out* — `audit-guessing-tier-names`'s
 * Check / Tactic / Search taxonomy, which splits on whether the reasoning is a
 * **bounded chain the player can be walked through**:
 *
 * - **Check** — place, look, one rule breaks. Narrate directly.
 * - **Tactic** — a bounded chain of forced consequences to a named endpoint.
 *   Legitimate at a middle tier, but the chain must be **shown on the board** —
 *   each link marked in the order it falls, both ends anchored — rather than
 *   compressed into a claim the player can only check by redoing the deduction.
 *   The stricter form (a display-only leg per link, so the player advances one
 *   inference at a time) was designed and set aside by an owner decision:
 *   holding a *hypothesis* in your head is fine, holding the *chain* is not
 *   (`walk-tactic-hint-chains` D1–D2). This list was emptied by seven games
 *   meeting the revised bar, not by seven walks.
 * - **Search** — run the whole solver from a hypothesis, or branch and
 *   backtrack. `Unreasonable` only, and never narrated at all.
 *
 * Promoted here from `galaxies-hint.test.ts`, where it guarded one game out of
 * thirty: a rule enforced in one place is not enforced.
 *
 * **It matches the compressed chain, not the hypothesis.** The first cut also
 * caught "if this cell were …" and instantly failed Clusters on *"If this cell
 * were blue, at most one neighbor could ever match it"* — a sound single-step
 * refutation, i.e. a Check, and exactly what the rule permits everywhere. A
 * hypothesis framing is not the defect; asking the reader to carry it forward
 * unaided is.
 *
 * **What this cannot see, stated rather than implied.** A Search that describes
 * itself as though it were a Check slips through — Undead's removed arm said
 * *"If this cell were a vampire, the sightline clues and monster counts could no
 * longer all be met"*, wordwise indistinguishable from a one-glance refutation.
 * So this is a backstop. The guarantee for the Search rungs is structural:
 * `UndeadReason` and Dominosa's tag no longer *contain* one, so narrating it is
 * a compile error rather than a string a test might miss.
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
  // (docs/games/hints.md § "Group one firing into one step"; owner-endorsed with the Filling hint).
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
  // at Hard, which is why the walk met it for the first time when it started
  // reading the presets menu rather than the first preset.
  loopy: (s) => /leaves this \d+ short: that edge is out/.test(s.explanation),
};

/**
 * The em-dash, retired from narration (owner, 2026-09-09).
 *
 * It was the collection's default connective before this rule — **141 of them
 * across 26 files**, almost all standing in for the comma or the sentence break
 * before a concluding `so …` clause. Nothing about the teaching depended on the
 * character, so the rewrite cost no reasoning; what it must never buy is a
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
 * **This block is about sentences, and it had never heard most of them.** It
 * read `firstLeaf` at three seeds until
 * `slice-the-first-leaf-hint-guards-by-axis`: three boards of `2x2 Trivial` for
 * Solo, whose Killer mode alone adds four cage sentences, and one board of
 * Squares for Loopy's twenty-one tilings. A form rule — is the step visible, is
 * the conclusion in the necessity voice, is there an em-dash — is a property of
 * the *sentence*, so the question is how many distinct sentences the walk
 * hears, and a second seed of one preset hears the same ones again.
 *
 * `lintCases` below already walks every preset, but only for *length*; the
 * necessity voice, the visibility rule and the speculative-chain rule are this
 * block's, and they stopped at the first preset.
 */
const FORM_SEEDS = SEEDS.slice(0, 1);

describe("hint narration form, cross-game", () => {
  for (const [name, game] of HINT_GAMES) {
    it(`${name}: every step is visible, terse${DEDUCTIVE.has(name) ? ", and necessity-voiced" : ""}`, () => {
      for (const { title, params } of gatePresets(name, game))
        for (const seed of FORM_SEEDS) {
          const { desc, aux } = game.newDesc(
            params,
            randomNew(`${name}-${title}-${seed}`),
          );
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
            // is about is striped instead (hints.md § "Hatch the line the
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

/** Forms seen across the walk, so the close-out can tell that every kind of
 * exception and the searching check met real steps. */
const formsSeen = new Map<string, number>();

/**
 * Both readings of a note-less cell for a game whose `Ui` offers the choice
 * (`candidateReading`), since the player may pick either and the implicit one
 * folds strikes into placements; otherwise the game's own, `null`.
 */
function readingsOf(game: AnyGame, params: unknown): readonly (string | null)[] {
  const { desc } = game.newDesc(params, randomNew("reading-probe"));
  const ui = game.newUi(game.newState(params, desc)) as Record<string, unknown>;
  return typeof ui["candidateReading"] === "string" ? ["implicit", "populate"] : [null];
}

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
      ): void => {
        checked++;
        for (const d of bindingDefects(game, state, ui, step))
          defects.push(`${at}: "${step.explanation}": ${d}`);
        for (const d of formDefects(step, SEARCHING.has(name)))
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
            const { desc, aux } = game.newDesc(
              params,
              randomNew(`${name}-${title}-${seed}`),
            );
            let state = game.newState(params, desc);
            const ui = game.newUi(state);
            if (reading)
              (ui as { candidateReading: string }).candidateReading = reading;
            const at = `${title}/${seed}${reading ? `/${reading}` : ""}`;
            for (
              let round = 0;
              round < 60 && game.status(state) === "ongoing";
              round++
            ) {
              const res = game.hint?.(state, aux, ui);
              if (!res?.ok) break;
              // Each step over the board it is narrated for: the state after
              // the steps before it.
              for (const [i, step] of res.steps.entries()) {
                check(state, ui, step, `${at} round ${round} step ${i}`);
                // `null` is a step already resolved: the midend skips it.
                const live = game.refreshHintStep
                  ? game.refreshHintStep(step, state)
                  : step;
                if (live === null) continue;
                if (live !== step)
                  check(state, ui, live, `${at} round ${round} step ${i}, refreshed`);
                state = game.executeMove(state, live.move);
              }
            }
            if (defects.length > 0) break;
          }
      expect(defects.slice(0, 20)).toEqual([]);
      expect(checked, `${name}: the walk checked no step`).toBeGreaterThan(0);
    });
  }

  it("met every form it checks on real steps", () => {
    // Vacuity: each property the form checks hold steps to was held on some.
    // `bare` is not here: no walked board leaves a hint nothing to say, and
    // the games that can (Pegs, Flood) pin it in their own tests.
    const seen = [...formsSeen.keys()];
    expect(seen).toContain("unshaped:setup");
    expect(seen).toContain("unshaped:evident");
    expect(seen).toContain("searching forced:lost");
    expect(seen.filter((k) => k.startsWith("searching ")).length).toBeGreaterThan(2);
  });
});

/**
 * The same speculative-vocabulary check, **across everything a game varies**.
 *
 * It needs its own sweep because the block above samples
 * `firstLeaf(game.presets())` — each game's *easiest* preset — and a trial rung
 * is tier-gated, so it never fires there. Proved rather than assumed: planting
 * "further along" in Bricks' lookahead narration left the block above green,
 * because Bricks' first preset is Easy and Easy never reaches that arm. The
 * check was therefore guarding nothing on precisely the tiers it exists for.
 *
 * **Tier is only one axis, and this used to walk off the end of games that have
 * no tiers at all.** `if (!contract || !tiers) continue` skipped the whole case,
 * so twelve of the thirty hinting games — Sixteen, Netslide, Palisade, Inertia,
 * Pattern, Range and the rest — were outside it entirely, and the per-game
 * vacuity guard below could not say so because it only ran for the games that
 * got as far as running. A game with no tiers varies by *preset* instead, and is
 * walked that way. (`hint-resume.test.ts` had the same blind spot in a milder
 * form, sampling one preset rather than none; both were found by
 * `fix-sixteen-endgame-stranding`. If you add a sweep over games, the question
 * to ask is what axis each game varies, not what axis you keyed on.)
 */
/**
 * The cases an **untiered** game contributes: its presets, which is the axis
 * such a game actually varies (a sweep keyed on tier alone collapses them all
 * to one and walks a single board — the blindness `hint-resume.test.ts` paid
 * for first).
 *
 * **A game that plans by searching walks its three smallest presets in the
 * gate.** The property under test here is the *wording* of an explanation, and
 * a planner's narration vocabulary does not change with board size — but a
 * search's cost does, steeply. Three is not arbitrary: it is what reaches every
 * mode Netslide varies (its nine presets are three barrier/wrapping modes at
 * each of three sizes, ordered smallest-first), and it keeps Sixteen's 3×3, 4×3
 * and 4×4 while dropping the two boards that carry the search cost. The slow
 * tier walks all of them.
 *
 * Measured 2026-09-09 (`retire-tests-that-do-not-earn-their-runtime`): the two
 * members of `SEARCH_PLANNING_GAMES` were 62% of this file's test time.
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
      // **One board per value of every axis the game varies**, which subsumes
      // the per-tier loop this used to build with `withTier` on the first
      // preset: difficulty is a `"choices"` axis like any other, so the slice
      // already carries a board at each tier — and carries it at the size the
      // menu offers that tier at, which is a board the player can pick rather
      // than a tier label written onto the smallest grid in the game.
      //
      // The `withTier` form is the tell `docs/games/testing.md` § "How a
      // cross-game guard finds its population" rule 6 names: it writes the tier
      // field and nothing else, so it never produced a Killer board, an
      // Adjacent board or a Tectonic one, and a trial rung that fires only in a
      // mode was outside this sweep as surely as it was outside the block above.
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
            board = game.newDesc(params, randomNew(`${name}-${label}-${seed}`));
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
      // every case failed to generate would pass while asserting nothing. It
      // now also covers the games that used to be skipped before reaching it.
      expect(checked, `${name}: nothing produced a hint to check`).toBeGreaterThan(0);
    });
  }
});

/**
 * How many plans each board is walked through. The opening plan alone is
 * where long sentences are rarest: a firing that needs more room to explain
 * usually needs more of the board decided first.
 *
 * **As deep as the census that set the limit, not shallower.** The first cut
 * walked eight plans to save time, and the ledger's own two-way check caught
 * it: Light Up's two discount arms fired nowhere in eight plans, so their
 * entry matched nothing and read as dead while the sentences were still being
 * spoken deeper in the game. A shallow walk turns a live ledger entry into a
 * false "delete me", which is the rot the check exists to stop.
 *
 * **And as wide as the modes a player can pick.** The first walk took every
 * tier of each game's *easiest preset* only, and a review of the text files
 * (2026-09-10) found thirty-odd sentences over the limit that it never heard:
 * Unequal's Adjacent mode, Solo's Killer and X, Salad's Number Ball are each
 * reached by a preset and by no tier of the first one. So every leaf preset is
 * walked too, on one seed, beside the tiers' three; the search-planning games
 * keep their sliced preset list, which is what their cost is sliced for.
 *
 * Cost, 2026-09-10: 43 s of test time for this block, measured at load
 * average 19–41 with 34% memory free — an upper bound, not a cost. The same
 * walk as a standalone census measured 16 s. Spokes, Palisade, Crossing and
 * Sticks hold most of it; slicing those four is the lever if it ever matters.
 * Walking every preset on every seed measured 103 s as a census against 49 s
 * for the tiers alone (load 12, swap 22 GB used: upper bounds both); one seed
 * per extra preset is the middle of that.
 *
 * Cost of {@link lintCases}' third rule, 2026-09-20, load 5–6 (upper bounds,
 * same box, same session, so the ratios are the usable part): 36 s for the
 * block without it, 43 s with it at one seed, 83 s at three. It is not spread
 * evenly — four games hold ~40 s of the 47, and all four for the same reason,
 * that generating a *large* board at a *hard* tier is the expensive corner:
 * Group ~18 s, Salad ~12 s, Solo ~6 s, Spokes ~3 s. Three seeds rather than
 * one because the rule's whole job is to let the close-out case decide a
 * negative, and a negative from a sample of one is not evidence — Group speaks
 * its chain sentence on three of six 12x12 Hard seeds, so one seed is a coin
 * flip on whether a live listing reads as dead. Slicing those four games is
 * the lever if this ever matters.
 */
const LINT_ROUNDS = 30;

/**
 * Whether this run walks {@link lintCases}' third rule — and with it, whether
 * the ledger's *rot* half can decide anything.
 *
 * **Off in the automatic per-commit hook, on everywhere else.** That is the
 * gate's existing third-scoping-by-role shape (`scripts/gate.sh`, `slow.ts`'s
 * {@link PRECOMMIT_HOOK_RUN}): CI runs `npm run gate` with the toggle unset on
 * every push to `main`, so this narrows what a *commit* costs and never what
 * protects the branch.
 *
 * **Why this rule and not the rest of the block.** Measured: the rule is 47 s
 * of the block's 83, and the block is selected on essentially every commit —
 * the per-commit selector maps any staged path under `src/games/` to every
 * guard that reads game source as text, and this is one, so a one-line edit to
 * one game was paying the whole 47 s. What it protects is not the code the
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
 * is walked by neither. Group is the case that found it
 * (`derive-the-narration-ledger-population`): its shipped presets stop at 8x8
 * Tricky and 12x12 Normal, and it speaks the shared Latin chain sentence
 * **only** at 12x12 Hard, 44 times in 2,007 steps. Every tier of its 6x6 and
 * every preset at its own tier: zero, across 12 seeds each. So the roster was
 * right and the walk was short, which is the failure mode that matters most
 * here — a listing the walk cannot reach reads as a dead exemption, and the
 * close-out case would have had it deleted.
 *
 * **"Hardest teachable" excludes a declared search tier**, which is where the
 * cost lives and where there is nothing to hear: a hint refuses on a board that
 * needs a guess (docs/games/hints.md § "The quality bar" rule 6), so the plan stops
 * early — Group's 6x6 yields 27 steps at Unreasonable against 253 at Hard — and
 * generation there is by far the most expensive thing in the cross product
 * (12x12 Unreasonable ran past 25 minutes for 12 boards and was abandoned;
 * 12x12 Hard was 116 s). The tier is derived from its *name*, the way
 * `hint-resume.test.ts` and `difficulty-contract.test.ts` already do it:
 * `tierNames(n, { search: true })` puts "Unreasonable" last, so the game has
 * already said so for its own reasons.
 *
 * **"Last preset" stands in for "largest"** — preset menus are ordered
 * smallest-first by convention (see {@link untieredCases} on Netslide). If a
 * game ever orders them otherwise this walks a different board rather than a
 * wrong one, and the close-out case is what would notice. It is the last of
 * {@link untieredCases} rather than of `leafPresets`, so a search-planning
 * game's sliced list is sliced here too — for those two the board is the last
 * of the three the gate keeps, and the whole list in the slow tier.
 */
function lintCases(
  id: string,
  game: AnyGame,
): { label: string; params: unknown; seeds: readonly string[] }[] {
  const out: { label: string; params: unknown; seeds: readonly string[] }[] = [];
  const seen = new Set<string>();
  const add = (label: string, params: unknown, seeds: readonly string[]): void => {
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
 * entry alone it passed as soon as *any* listed game reached the sentence,
 * which on the ten single-game entries is the same thing and on the shared
 * Latin chain entry is not — that is how Mathrax sat on it while speaking it
 * zero times in 100,249 plan steps (`derive-the-narration-ledger-population`).
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
        if (paramsError(game, params, true)) continue;
        for (const seed of seeds) {
          let board: { desc: string; aux?: string };
          try {
            board = game.newDesc(params, randomNew(`${name}-${label}-${seed}`));
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

  it("every pinned board still speaks its listing's sentence over the limit", () => {
    let pinned = 0;
    for (const e of LONG_NARRATIONS) {
      for (const [g, id] of Object.entries(e.spokenOn ?? {})) {
        pinned++;
        expect(e.games, `${g} is pinned on ${e.rungs} without being listed`).toContain(
          g,
        );
        expect(
          speaksOn(g, id, e.rungs),
          `${g}: the board pinned for ${e.rungs} no longer speaks it over ${NARRATION_LIMIT} characters. Pin a board that does, or delete the listing.`,
        ).toBe(true);
      }
    }
    // Vacuity: the loop above asserts nothing over a ledger with no pin.
    expect(pinned).toBeGreaterThan(0);
  });

  // Skipped rather than weakened in the per-commit hook, so a deferred check is
  // **reported** instead of passing over a walk that could not see its subject.
  it.skipIf(!CORNER_WALKED)("ledgers only listings that still need the room", () => {
    // Registered last, so it runs after every per-game case has filled
    // `ledgerUsed`. Vacuity first: an unpopulated walk would find every listing
    // "unused" for the wrong reason.
    expect(linted, "the length walk looked at almost nothing").toBeGreaterThan(2000);
    // And per game, because the check below is a negative *per listing*: a game
    // whose every case refused to generate would read as dead on every entry it
    // is listed on, and the collection-wide floor above cannot say so — it is
    // met many times over by the games that did walk. Measured 2026-09-20, the
    // listed games walk 320 (Subsets) to 3,007 (Solo) steps each, so 200 is
    // clear of the smallest and nowhere near "examined nothing".
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
