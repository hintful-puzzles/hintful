# draw-ascent-offered-numbers-as-notes

The owner, looking at the deployed dark scheme after
`tell-ascent-targets-from-a-plain-cell` (2026-10-08): the numbers offered
round a held one are what reads as too low in contrast.

## Why

A number offered and not placed was drawn in the bevel's lowlight gray. In the
owner's screenshot that is `#5f6166` on a plain dark cell of `#24262b`.

## What changes

- **An offered number is drawn in `pencilColor`**, in a slot of its own
  (`COL_OFFERED`). It is a number noted and not committed, which is the role's
  meaning, and the role is tuned to be read small on a plain cell and on a
  selected one in both schemes. On the dragged row or column it stays ink, as
  the blue sinks into the goal wash.
- The discs and crosses that preview a move keep the lowlight.

Seen in the app in both schemes with a number held on a Classic board.

## Capabilities

### Modified Capabilities

- `ascent`: the color of an offered number.
