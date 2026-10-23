# Design: guard-color-and-shape-collisions

## Context

Render scenarios record every draw op with its palette slot and resolved
color (`testing/recording-drawing.ts`); `color-collide` already resolves each
game's palette in both schemes and measures each pair's distance; the slots
are named by each game's `COL_*` constants. What no instrument has is the
mark a slot is drawn as.

## Goals / Non-Goals

**Goals:** catch two unrelated things a player must tell apart that share a
color and a shape, in any game, as a gate once the collection is clean.

**Non-Goals:** colors that differ only in hue a color-blind player cannot
see (a separate question); marks of one meaning, which a game declares.

## Decisions

- **Shape from the ops, not from source.** A slot's marks are the ops drawn
  with it across the frames: a `line` by its thickness; a `rect` by its
  aspect (a bar if one side is at least three times the other, by its short
  side; a fill if it covers most of a tile); a `circle` by its radius; `text`.
  Two slots collide when some mark of one and some mark of the other are the
  same kind within a factor of 1.5 in size. A round-capped line and a flat
  bar are one kind: the owner's case was exactly that.
- **Frames that show marks together.** For each game, the frames its render
  scenarios already draw, plus a dealt preset after half the solve is played,
  so the player's marks and the board's are both on screen.
- **A declaration, not a name pattern.** A game lists the pairs of its slots
  that are one meaning, each with its reason, beside `colors()`; the guard
  reads it. No regex over `COL_*` names.
- **Report first, gate after.** The first task runs it as a report over the
  collection and reads every pair. If the defects and the declarations
  together are more than a sitting's work, the change says so and is split
  per family of games; the owner's word is needed only where a fix changes a
  game's look and the better choice is unclear.

## Risks / Trade-offs

- [The size factor flags too much or too little] → set it against the
  report: Path's wall and line before the fix must be flagged, and ink text
  beside an ink grid must not; plant Path's ink wall back to see it fail.
- [A frame never shows a pair together] → the report counts, per game, how
  many slots its frames painted against how many `colors()` defines, so a
  zero is not silence.
- [Declarations become a dumping ground] → every entry carries a reason a
  reviewer can check against the game's help page.
