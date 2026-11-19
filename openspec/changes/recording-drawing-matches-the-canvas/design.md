## Decisions

**One check, two drawings.** The canvas drawing's palette-membership test
(`setUpContext` in `src/puzzle/drawing.ts`) and the arguments it treats as
"none" (a negative fill in `drawCircle`, and the like) move into a helper
both drawings call. Read every method of both for what each accepts; the
list is the source, not this file.

**Some tests may be passing a color the app would refuse.** Expect the
first run to fail somewhere: each failure is a game bug the app would show
as a crash, or a test fixture with no palette. Fix the bug, or give the
fixture a palette; do not loosen the check.

**What a snapshot keys a color on.** Options, in order of preference:

1. the resolved `rgb(…)` label alone, dropping the index from the
   snapshot's serialized form. Two slots with one color then read alike,
   which is what the player sees too;
2. the slot's name, where the game exports named constants. This needs a
   reverse map from index to name per game, which no game has today.

Take (1) unless it hides something a snapshot exists to catch; the
collision guard (`mark-collisions`) already asks whether two meanings share
a color. Positional color constants in the games stay: renaming them all to
a declared, named palette is a larger refactor that the snapshot change
makes unnecessary for this problem.

**The re-baseline is one commit of its own,** with a check that every
changed snapshot line differs only in the color's form (a diff shape check,
per `docs/method.md`).

## Risks

- A label-keyed snapshot misses a change from one slot to another of the
  same color in one scheme. The dark scheme often tells them apart; record
  both schemes' labels if the light alone proves too coarse.
