# derive-hint-steps-from-the-description

**Status: draft, filed on the owner's word (2026-11-08), for later.** It
waits for `describe-the-whole-catalog` to end, so that it is weighed on
every described game and not on the first few. It reopens a candidate
`describe-the-whole-catalog/design.md` § "Further refactoring a description
makes possible" declined on 2026-11-01 ("The hint sentence carried by the
technique's statement"), for the reason under § "What changed since the
decline".

## Why

A compiled ladder gives a described game its solve, its grading and the
firings its hint walks. What it does not give is the step a player reads:
each game still writes, per technique, the sentence, the marks that show its
premises, and the step kinds (`*_RUNGS`), in its own `hint.ts` and
`hint-text.ts`. Measured 2026-11-08 (lines, comments included):

| Game | Description | `hint*.ts` |
| --- | --- | --- |
| Unequal | 109 | 38 |
| Towers | 171 | 141 |
| Singles | 167 | 244 |
| Map | 160 | 736 |
| Magnets | 195 | 1,397 |
| Mines | 176 | 747 |
| Loopy | 462 | 1,364 |

Where a game's hint is more than a sentence a technique (Map, Magnets,
Mines, Loopy), the hand-written part is now often larger than the
description. That is the per-game cost a new described game still pays most
of, and it is the cost of the project's first value: a hint that explains
why.

## What changed since the decline

The decline gave two reasons.

- **"The language says nothing about presentation."** The owner's goal is a
  description from which a game is the same game whatever implements it, and
  a hint that explains why is part of what the game is here. That makes what
  a step says, and what it marks, part of the description, as a technique's
  tier already is.
- **"A sentence quotes the board in game words."** Still true, so the words
  stay the game's: a technique carries a sentence in its game's words, with
  slots the binding fills (a clue's value, a count, the element a fact is
  about), and the marks are the binding's elements, by the role each plays
  in the premise. The engine owns the assembly: the sentence's grammar
  (plural, lists, "this" and "the marked"), the marks, journeys, and the
  step kinds.

## What Changes

- **A technique states its step**: a sentence in game words with slots from
  its binding, and which of its bound elements are marked and how.
- **The engine builds the step** from a firing: its words, its marks, and
  the step kinds a game lists today by hand.
- **What a game keeps is what is its own**: a plan's order across steps
  (Loopy's notes placed before the line that cites them), a fact's chain of
  parents, and any step a sentence per technique cannot carry, each with its
  reason.

## Before it starts

1. **Measure what is a sentence per technique.** For each described game,
   split its hint code into per-technique sentences and marks, plan
   machinery (chains, notes, journeys), and the rest. The change is worth
   making only if the first part is most of it in most games, or the second
   generalizes.
2. **Write three games' steps both ways**, one with sentences alone
   (Unequal), one with marks (Singles), one with a plan (Loopy), and compare
   the words a player reads, step for step, on the hint walks.
3. **Ask the owner** before any player-visible wording changes: a derived
   sentence that reads worse than today's is not taken.

## Acceptance

To be written when it starts, from what the measurement finds. At least:
every step a player reads is the same as or better than today's, judged in
the running app; every hint walk still finishes; and a game's hint code
shrinks by what the measurement predicted.
