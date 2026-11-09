# pick-up-a-line-anywhere-along-it

**Status: asked for by the owner in a Path playtest on their phone (2026-11-09).**

## Why

A stroke from a number could redraw the line on from it, but a player who
saw a wrong turn between the 3 and the 4 had to go back to the 3 to fix it.
The owner asked to pick a line up anywhere along it and redraw it from
there on, as from a number.

## What Changes

- A stroke from a square in the middle of a line, not only from a number,
  picks the line up there and redraws the line ahead.
- Which side is ahead: under Path, the side the numbers rise along; under
  Pairs, a number's whole line, or from the middle of a line the side away
  from the one number it meets. Where that does not decide, as on a fragment
  meeting no number or a finished Pairs line, it is the side the stroke
  sets off along. So the engine asks a game what a drag replaces at the
  drag's first step, not at the press.
- A stroke that picks a line up changes nothing until it lays a line, along
  whichever side it traces.
- Taking a line up by dragging along it now starts from its loose end, as
  Zip pulls a line back. A line can also be taken up a click at a time, or
  by Undo. The owner chose this (2026-11-09) over keeping a trace from the
  middle as an erase, which the pick-up would otherwise contradict.
- Pearl, the other game on the engine's drag, declares nothing a drag
  replaces, and is unchanged.

## Acceptance

- The owner's playtest on their phone.
