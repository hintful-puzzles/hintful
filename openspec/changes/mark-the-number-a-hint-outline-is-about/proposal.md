# mark-the-number-a-hint-outline-is-about

**Status: filed 2026-10-11 by the session that gave Mosaic its comparison of
two numbers (`give-mosaic-the-deduction-its-unreasonable-boards-lack`), which
saw it in the running app. Taken up by the owner the same day; `tasks.md` is
its plan, and `design.md` holds the count the draft asked for and what was
chosen. What it says of the code was true that day.**

## Why

A Mosaic hint says "this 4" and outlines the 4's block, nine squares with the
4 in the middle. The outline is the only thing that says which 4 is meant,
and the player finds it by taking the middle of the outlined square. With one
block on the board that is quick. A step that compares two numbers outlines
two blocks that overlap, and the same digit is often elsewhere inside them:
seen 2026-10-11 on `10x10du:3a21j44b5b8a4a6a5c87c45a3477a4a45d86412b4a36a4f4c554a43a5k23a44a`,
"this 4" with three 4s inside the outlines, and "this 7" beside a ringed
square that also holds a 7.

The draft asked whether the engine should give a sentence a new role, "the
square this area is about". The count says no (`design.md`): of the hinted
games, Mosaic alone names a clue and marks only its area. The others that name
a clue mark the clue's square, and the roles already cover it: a clue is what
the step reasons from, an outline reference, and its glyph is the game's.

The same look found a second way the name fails, which no mark mends. Where
the two compared numbers are the same, the sentence said "this 7" and "the
other 7". Mines had already written the answer for itself, "the upper outlined
1", and nothing shared it.

## What Changes

- Mosaic circles each number a step names, inside its square, beside the
  outline round its block.
- Two compared numbers of one value are named by where they sit: "the upper
  7" and "the lower 7", or the left and the right.
- The engine owns those words (`apartByPosition`), moved out of Mines, which
  now names its numbers through it and reads as before.
- The guide gains the rule, a clue named with its area is marked on its own
  square, and an advisory report that reads the shape off the frame across
  every hinted game.

## Capabilities

### Modified Capabilities

- `engine-hints`: a clue named with its area is marked on its own square, and
  two squares of one name are told apart by where they sit.
- `mosaic`: what a step draws for a number it names, and how it names two of
  one value.

## Impact

- `src/engine/apart-by-position.ts`, new, with its test;
  `src/games/mines/hint-text.ts`, which loses its own copy.
- `src/games/mosaic/render.ts`, `hint-text.ts`, `index.ts` (the legend) and
  `mosaic-hint.test.ts` with its four frame snapshots.
- `help/games/mosaic.md`, `docs/games/hints.md` § "Name a square by its
  value", `docs/games/engine-catalog.md`.
- `scripts/checks/hint-area-names.test.ts` and `metrics/hint-area-names.md`.
- Nothing a player holds: no save, id or preference reads a hint's marks or
  words.
