# add-patches

**Status: filed on the owner's word (2026-10-29)**: LinkedIn's Patches is
"one of the next few games I'd like to prioritize".

## Why

Patches divides a grid into rectangles that cover it, each holding exactly
one clue. A clue names a shape (a square, a tall rectangle, a wide rectangle,
or any of the three), and a clue with a number fixes its rectangle's size.
The owner's screenshot of its "How to play" is the source; the rules are as
`2026-10-29-investigate-a-language-for-puzzle-games/corpus-list.md` (107)
states them.

## What the theory says about it

Rect (Shikaku) is in the collection, and its clue is Patches' with the shape
"any" and the number always shown. Written in the language
(`corpus.md` § "Added after the test"), Patches is Rect with each clue's
meaning widened by a shape (added predicates, so every Rect technique stays
sound) and some numbers hidden (a generator setting). **By the theory it is a
variation of Rect, not a game of its own.**

## The owner's question, before the catalog is touched

How a player meets it is player-visible, so the owner decides
(`AGENTS.md`, "Ask before changing what a player or their data can see"):

1. **Patches as a ruleset or modifier of Rect** (a Type menu entry and the
   params codec gaining a field), which is what the theory says and shares
   Rect's solver, generator and hint; or
2. **Patches as its own game page**, which is what its players know it as,
   built on Rect's engine.

The session that takes this up brings the question with what it found:
what Rect's generator and solver would need for shape clues and hidden
numbers, and which hint rungs the shapes add.

## What Changes

A new game or a new Rect variation, per the owner's answer, with its spec,
help page, hint and tiers, following `docs/new-game.md`.

## Acceptance

The owner's, in the running app.
