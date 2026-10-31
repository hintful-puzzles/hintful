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

## What Rect's code needs (read 2026-10-31)

- **Solver** (`rect/solver.ts`): it narrows each clue's list of
  placements, and only `allPlacements` reads a clue's number, to enumerate
  the rectangles of that area. Given a clue's shape and optional size
  instead, the enumeration filters every rectangle around the clue
  (a numberless clue on 7×7 has at most 256), and the narrowing is
  unchanged. The answer search's check that the numbers sum to the grid's
  area holds only where every number shows.
- **Generator** (`rect/generator.ts`): the division (steps 1 to 3) is
  reused as it is; each rectangle's shape follows from its sides. What is
  new is choosing which clues say "any" and which hide their number, kept
  while the board stays unique and the hint finishes it: the strip-clues
  loop Path runs for Zip. The Easy deal's solver steering and the
  Unreasonable mending keep their shape once the solver takes a shape.
- **Hint** (`rect/hint.ts`): every rung reads a clue through
  `shapesAround`, the rectangles of its area around it. Given the clue's
  shape and size it serves all five rungs (fit, reach, overlap, starve,
  line), and no new rung is needed for soundness. A numberless clue has
  many fits, so `fit` fires less and `reach` and `starve` more; the words
  change where they name a clue ("the 6" becomes "the square", "the 6
  square") and where `fit` says why each other rectangle fails.
- **Board**: Rect's render draws numbers only; a clue gains a shape glyph,
  and `getCorrect` checks shape and size where it checks area. Rect's
  desc and params strings stay as they are either way.

**Precedent.** LinkedIn's Zip is a ruleset of Path
(`archive/2026-10-23-add-zip-to-path`), and Queens is Star Battle's "One
star" ruleset: the menu, Custom dialog, labels and help all come from one
`rulesetItem` declaration, and Path's older strings carry no letter so they
still open. Patches as a ruleset is the same shape; as its own page it is
the same modules with a second entry in the game list.

## What Changes

A new game or a new Rect variation, per the owner's answer, with its spec,
help page, hint and tiers, following `docs/new-game.md`.

## Acceptance

The owner's, in the running app.
