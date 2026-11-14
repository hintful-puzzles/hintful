# state-hint-sentences-in-the-description

**Status: draft, filed on the owner's word (2026-11-10), for later.** Fourth
in the plan of
[`derive-hint-steps-from-the-description/report.md`](../archive/2026-11-10-derive-hint-steps-from-the-description/report.md).
It waits for `build-hint-steps-in-the-engine` (a step's terms, arms and
marks), `standardize-hint-vocabulary` (the words) and
`explain-a-firing-by-its-witness-and-parents` (what a sentence could not say
without). The session that takes it up writes its tasks.

## Why

With the three changes before it, what a game still writes for a hint is its
sentences, each a function in its `hint-text.ts` (`wc -l
src/games/*/hint-text.ts`). They are where the catalog's wording drifts,
because nothing holds one game's sentence for a deduction to another's. The
owner left where they live to the session (2026-11-10), for the player's
understanding and for many new games that need very similar hints.

Taken: a technique's words are part of its statement. A hint that explains
why is part of what the game is here, as a technique's tier already is; a
sentence stated beside the deduction it speaks cannot drift from it; and a
library technique then brings one wording to every game that places it.

**Every game goes through the one mechanism** (the owner, 2026-11-14), the
move and search puzzles included, whose steps a planner picks and no
technique fires. What the mechanism states is a **step kind**: its terms,
its marks and its words. A technique's `says` is one source of step kinds,
named by the technique; a game whose steps come from a planner declares its
step kinds in its description, and the planner emits a kind with its terms
and marks. Which step is taken stays the game's logic either way; the words
are data in every game. Rejected: restating a planner's choices as
techniques (a search outcome is not a local rule, and game logic is not bent
to fit a contract), and a table of words with no declared terms (its slots
go unchecked: a second mechanism in all but name).

## What Changes

- **A step kind states what a player is shown**: a `look`, a `follows` and
  a `move` where the step needs them, and a `relation` (an `effect`, for a
  planner's step), in the lexicon's words, with slots that are the kind's
  terms and marks. A technique's arms and facts are step kinds; so are a
  planner's steps and a plan's note-placing steps (Loopy's).
- **The engine builds the sentence.** The closing clause comes from the
  fact; number, count words, pointing words and an element's name come from
  the lexicon; a journey's later legs take the shorter form; a sentence past
  the length limit takes its shorter form.
- **A game states its nouns once**, where they are not the lexicon's.
- **A sentence the form cannot state stays code**, as an override that says
  why. The first question of such a sentence is whether the form should
  grow, or the technique be restated.
- **`hint-text.ts` goes** from every game, logic or move puzzle.

## For a later translation

Not a goal of this change (the owner, 2026-11-10). A sentence kept as data,
whole clauses with slots, is what a translation would need, so the form is
designed so that a second language is a second file and nothing in a game's
TypeScript.

## Before it starts

1. **Write three games' steps both ways**, as the change this came from
   planned: Unequal (sentences alone), Singles (arms and marks), Loopy
   (notes and a plan), and Slide (a planner's steps, no technique; added
   2026-11-14). Compare the words a player reads, step for step, on
   the hint walks, in the running app.
2. **List what the form could not state** in those four, and decide for
   each: the form grows, the technique is restated, or it is an override.
3. **Ask the owner** with the comparison, before the catalog moves. Where
   the words are byte-identical (as Unequal's and Singles' are), the
   comparison shows the game's source before and after, and Loopy's and
   Slide's words where they move.

## What it touches

`describe/` (the schema, the compiler, the loader), the engine's hint words,
every game's `hint-text.ts` and description, the planners' step emission, `docs/hints.md`
§ "Writing the narration" and `docs/descriptions.md`. The cross-game
guards on wording (`hint-quality.test.ts` and its kin) are read again:
what the engine builds by construction needs no guard, and a guard that
read a game's prose now reads the description.

## Acceptance

To be written when it starts. At least: the owner accepts the four games'
words in the running app before the rest move; every hint walk still
finishes; and a new game's hint is its description and its adapter.
