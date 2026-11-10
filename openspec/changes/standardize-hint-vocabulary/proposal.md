# standardize-hint-vocabulary

**Status: filed on the owner's word (2026-11-10).** Second in the plan of
[`derive-hint-steps-from-the-description/report.md`](../archive/2026-11-10-derive-hint-steps-from-the-description/report.md).
Its census and its proposal to the owner can start at once; applying the
lexicon follows `build-hint-steps-in-the-engine`, which gives the engine the
place the shared words are built.

## Why

The same deduction is worded differently from game to game. A count that is
met, a square with one candidate left, an edge that cannot be a line: each
has as many phrasings as games that use it, written at different times by
different sessions. The owner (2026-11-10): "it's detrimental that different
games' hints often use different vocabulary where the same words would fit",
and much of today's text "is clunky and could actually be improved by
further standardization".

A crude measure, 2026-11-10: of 61 `hint-text.ts` files, 42 say "square" and
36 say "cell", 5 of them both; a value ruled out of an edge is "is out",
"ruled out", "must be blocked", "must be empty" or "must be crossed out" by
game. A player who has learned one game's hints reads the next game's as a
new language.

## What Changes

- **One lexicon, the engine's.** It holds the words a hint uses for what
  every game has:
  - what an element is called (a square, an edge, a clue, a row, column or
    region), which a game overrides only where its own word is the one its
    help page and its players use;
  - how a step points ("this", "the ringed", "the outlined"), and how two
    like things are told apart;
  - counts (none, its one, both, all n) and number;
  - the closing clause for each kind of fact: a value placed, a value ruled
    out, a mark made.
- **One wording a kind of deduction**, wherever games share the kind: the
  count met, the count starved, the last place, the last candidate, the
  neighbor ruled out, "this would break".
- **A game keeps a word of its own only where it needs it**, and says why.

## The bar

The owner's ruling (2026-11-10), in `docs/doctrine.md` § "Convention over
configuration": a hint may be reworded for consistency and is never made
significantly less clear, judged in the running app. A little clarity in one
game may be given up for consistency across the catalog, since consistency
itself lowers what a player has to hold.

## For a later translation

Internationalization is not a priority and nothing here builds it (the
owner, 2026-11-10). It is a reason to shape the lexicon so that it could be
translated: a clause is whole, with slots, and never assembled from
fragments by English grammar; number and count words are the engine's to
choose, not a suffix a sentence adds.

## Before it applies anything

1. **Take the census by kind of deduction**, not by word: for each kind the
   report names, every game's sentence for it, side by side.
2. **Propose the lexicon and each kind's one wording**, and show the owner
   one page: each kind, its sentences today, the sentence proposed, and each
   exception a game would keep with its reason.
3. **Wait for the owner's word.** Every sentence a player reads is theirs to
   accept.

## What it touches

The engine's hint words (`engine/hint-words.ts`, `engine/hint-text.ts`),
every game's `hint-text.ts`, `docs/hints.md` § "Writing the narration", the
help pages' `## Hints` sections where they quote a hint's words, and the
`engine-hints` spec.

## Acceptance

The owner accepts the page before anything is applied, and the applied words
in the deployed app after. A word the lexicon holds is written in no game.
