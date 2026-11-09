# take-back-a-stroke-by-drawing-back

**Status: asked for by the owner in a Path playtest (2026-11-09).**

## Why

A pointer's line drag kept every square it passed: back onto one it did
nothing, so a brush against an earlier part of a long stroke could not cut it
short (owner, 2026-10-23). But it also meant a player could not change their
mind mid-stroke: a wrong turn stayed until the release, and was undone after.
The owner (2026-11-09) asked for a stroke that can be taken back, without
bringing back the accidental cut, by drawing back on the current stroke.

## What Changes

- The engine's line drag is cut back where the pointer draws back over its
  end: onto the square it just came from, or straight back along its last
  straight stretch, as a quick pull back does. Onto any other square it has
  passed it still does nothing, so a brush cannot cut it: in a tight U, the
  square beside the end is three back, never the one it came from. A jitter
  on the line between its last two squares takes a step back and draws it
  again. Pearl's drag round onto its first square still closes the loop.
- Path and Pearl, the games on the engine's line drag, get it from there; the
  help of both says so.

Which other strokes share it (2026-11-09): Tracks', Rect's and Pattern's
drags already follow the pointer, a run or a rectangle from the press to it.
The drag-to-repeat-a-mark sweeps are brushes, swept back and forth on
purpose, where a step back taking a mark off would fire on every zig-zag.
Ascent's path drawing places a number each step, as its own move, outside
the engine's drag; the owner is asked about it.

## Acceptance

- The owner's playtest of the new strokes.
