# light-the-win-along-the-lines

**Status: asked for by the owner in a Path playtest (2026-11-09)**, for Path;
Pairs followed from their question whether its win could do the same.

## Why

Path's win flash swept the board on the engine's default diagonal, across
the line rather than along it. A Path board is one line through its numbers
in order, and a Pairs board a line for each pair, so the win reads best
traveling them in the order a player reads them.

## What Changes

- The win flash's route is each square's step along the lines: under Path,
  the one line from the 1 to the last number; under Pairs, the 1s' line from
  its first square in reading order, then the 2s', and on. It is the
  engine's path route (`win-wave.ts`); Path gives each square its step.

## Acceptance

- The owner sees both on their phone.
