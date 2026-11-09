# keep-a-numbers-line-until-a-stroke-leaves-it

**Status: asked for by the owner in a Path playtest (2026-11-09).**

## Why

A stroke from a number replaced the line ahead of it from the moment it left
the number's square. A finger that slipped one square along the line, or a
player tracing the line, lost the rest of it, through every later number:
on a finished 10x10, all but a corner of the board. And a line from a number
that reached no other number counted as ahead, so a player who drew back from
the 3 toward the 2 lost that line to a stroke from the 3 on toward the 4, even
where the number had room for both.

The owner's aim (2026-11-09): Path should serve a quick, LinkedIn-Zip-like
style, one stroke and a few corrections, and deductive work on large boards.
A correction from a number is the quick style's main gesture, so it stays,
and its reach, to the end of the line, stays too: in deductive play the
player's lines are short pieces, so the reach stays local.

## What Changes

- The engine's drag replaces a game's `restarts` lines only once it leaves
  them. A drag that only retraces them changes nothing.
- Path counts a line from a number that reaches no number by the number's
  other side: opposite a line from a lower number it is ahead, opposite one
  to a higher number it is behind. The 1's is ahead, the last number's behind.
  Alone on a middle number it stays. Two such lines on a full number are both
  ahead, as nothing says which runs on.
- The help's paragraph on a stroke from a number says both.

## Acceptance

- The owner's playtest of the new strokes (2026-11-09: "Much better!").
