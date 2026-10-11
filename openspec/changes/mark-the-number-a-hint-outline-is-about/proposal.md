# mark-the-number-a-hint-outline-is-about

**Status: a draft for the owner to pick, filed 2026-10-11 by the session that
gave Mosaic its comparison of two numbers
(`give-mosaic-the-deduction-its-unreasonable-boards-lack`), which saw it in
the running app. What it says of the code was true that day; re-check before
relying on it. It has no `tasks.md` until the owner takes it up.**

## Why

A Mosaic hint says "this 4" and outlines the 4's block, nine squares with the
4 in the middle. The outline is the only thing that says which 4 is meant,
and the player finds it by taking the middle of the outlined square. With one
block on the board that is quick. A step that compares two numbers outlines
two blocks that overlap, and the same digit is often elsewhere inside them:
seen 2026-10-11 on `10x10du:3a21j44b5b8a4a6a5c87c45a3477a4a45d86412b4a36a4f4c554a43a5k23a44a`,
"this 4" with three 4s inside the outlines, and "this 7" beside a ringed
square that also holds a 7.

The hint marks have three roles: a ring on what the step decides, an outline
on what it reasons from, stripes on a line or region the sentence names
(`engine/hint-words.ts`). None says "the square this area is about". A clue
whose area is a block, a cage or a line of sight has this shape in any game
that outlines the area and names the clue.

## The question

Whether the engine gives a sentence a way to mark the clue an outlined area
belongs to, and what it looks like: a second outline on the clue's own
square, a heavier side, a dot. Count first which games outline an area and
name a clue inside it, and on how many of their steps the name is ambiguous
by value, before choosing a mark.

## Capabilities

### Modified Capabilities

- `ts-engine`: the roles a hint's marks have.

## Impact

- `src/engine/hint-words.ts`, `src/engine/hint-mark.ts`, the renderers of the
  games that take it up, and `docs/games/hints.md` § "Bind the words to the
  marks".
