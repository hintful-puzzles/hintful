# switch-to-a-recently-played-game

**Status: asked for by the owner during a Path playtest on their phone (2026-11-09).**

## Why

The quick-switch opened on the current game's family, then the catalog. A
player going back and forth between a few games, as the owner was between
Path and others, had to find each again by typing or scrolling.

## What Changes

- Each puzzle's settings remember when it was last played: a visit on which
  its board held a move, once a visit, so a move costs no database write.
  Not an autosave: autosaves are taken down when a board is solved, and a
  finished game is still a recent one. Never shown or counted, as the
  doctrine's "no progression features" asks.
- From a puzzle, the empty quick-switch opens on "Recently played", the
  three other puzzles played last, then the family, then the rest; each
  puzzle once, in its first group.
- The switcher builds its groups in one place (`sections`), which the list
  and the keyboard's Enter both read.

## Acceptance

- The owner's look on their phone.
