# add-norinori

Asked for by the owner by name (2026-11-16). Second of the track the debrief
set (`archive/2026-11-16-state-hint-sentences-in-the-description/tasks.md`
§ 3); it follows `generate-compiled-modules` and
`speak-a-step-through-the-engine`.

## Why

The description effort is justified by new games being cheap to write
(`archive/2026-11-09-describe-the-whole-catalog`: "a new game starts as its
description"), and no game has been written that way. Every described game
was restated from a hand-written one. This is the measurement.

Norinori was chosen as close to the catalog on purpose: it is the case the
form should fit best, so a poor result here is a finding about the engine.

## The game

Shade cells of a grid divided into regions, so that every region holds
exactly two shaded cells and every shaded cell is orthogonally adjacent to
exactly one other shaded cell (the shaded cells are dominoes, which may cross
a region's border). Rules as the corpus has them
(`archive/2026-10-29-investigate-a-language-for-puzzle-games/corpus-list.md`
§ A, 5; its description in `corpus/shading-and-loops.md`); confirm them
against the cited sources before writing.

Nearest in the catalog: Star Battle (dealt regions, a count a region, a
no-touch rule) for the board, the deal and the techniques; a shading game for
input and rendering.

## What Changes

- A new game, `norinori`, written description-first: its description, then
  what the description cannot say.
- Its hint is the engine's from its firings, with no hand-written sentence.
- Its generator deals boards with one answer, at tiers.

## What the session records

This is why the game is written now, so it is the change's deliverable as
much as the game is:

- **What was written by hand, by file and line count**, against Star Battle's.
- **Every place the engine made the game state something that is not about
  Norinori**, each mended in the engine in passing or filed as the engine's.
- **Which of its techniques follow from one rule alone** ("exactly two in
  this region", "a shaded cell has one shaded neighbor"), stated so that the
  clustering `supply-techniques-by-kind-of-rule` asks for can use them.
- **How long each part took**: description, generator, hint, rendering,
  tests.

## The owner's, where the session is unsure

Player-visible choices follow the nearest game's unless the session finds a
reason: how a cell is marked unshaded, drag to shade, the presets and tier
names.
