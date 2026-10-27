# Proposal: guard-color-and-shape-collisions

## Why

In the owner's playtest of Path (2026-10-23), a wall and a line reaching no
number were both ink bars, and "look almost indistinguishable". It was fixed
in Path by drawing walls in `wallFill` (`2026-10-23-add-zip-to-path`). The
owner asked for a cross-game guard "to check that the same color and shape
are not used for two unrelated needs". Nothing checks it: `color-collide`
(`scripts/checks/color-collide.test.ts`) lists every pair of palette slots a
game cannot tell apart, but it says itself it cannot gate, because some 170
such pairs are deliberate, a game's givens and grid in one ink for one. What
tells Path's defect from those is the shape: the deliberate pairs are, on the
whole, drawn as different marks, a digit and a grid line, while the wall and
the line were both bars of a line's width.

## What Changes

- A cross-game guard over rendered frames: for each game, every pair of
  palette slots whose colors a player cannot tell apart in either scheme
  (the `color-collide` distance) that the frames draw as the same kind of
  mark at a like size is refused, unless the game declares the two one
  meaning.
- A mark's kind is read off the recorded ops (`testing/recording-drawing.ts`):
  a bar (a line, or a rect at least three times as long as wide) by its
  thickness; a cell fill; a disc by its radius; text. The frames are the
  ones the render scenarios already draw, with a solve and some play so a
  frame shows a game's marks side by side.
- A declaration that two slots are one meaning, beside the palette (e.g.
  Path's line and its pair's line through ink), never a pattern over names;
  every entry carries its reason.
- A census first: the guard runs as a report over the collection, every pair
  it flags is read, and the defects among them are fixed in the same change
  or, where a game needs a design choice, raised with the owner. It gates
  once the report is empty but for declared pairs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-colors`: a requirement that two unrelated marks are not one color
  and one shape.

## Impact

- A new cross-game test beside the color guards, reading render scenarios.
- Each game whose pair is a defect: its `render.ts` palette or its mark.
- The declaration of related slots, per game, beside its `colors()`.
