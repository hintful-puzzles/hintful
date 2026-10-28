# Proposal

## Why

The owner (2026-10-28), accepting `offer-the-wing-to-latin-games`: the
wing's "an end" is the one wording they are not happy with, and they would
avoid a noun for those cells altogether. Offered a technical writer's
alternatives ("a partner", "an arm", "a pincer"), they declined each, and
chose: *"Whatever goes in the middle cell, an outlined cell in line with
this cell must have 2"*, with the room it takes allowed where the sentence
runs past the narration limit (Solo's block, the middle that could hold the
value itself, Map's dotting conclusions), as an exception the length guard
lists.

## What Changes

- `wingPremise` (`engine/hint-text.ts`) and Map's `weigh`: "Whatever goes in
  the middle cell, an outlined cell in line with this cell must have 2"; "it
  or an outlined cell" where the middle could be the value.
- The outline legends teach "the middle cell" alone; the help's `wingHelp`
  speaks of outlined cells, not "the ends".
- `hint-quality.test.ts`'s `LONG_NARRATIONS` lists Solo's `wing` and Map's
  `weighRegion`, each pinned on a board that speaks it long.

## Impact

The two sentence templates, eight legends, `wingHelp`, the hint snapshots of
the seven games, `engine-candidate-hints` and `map`.
