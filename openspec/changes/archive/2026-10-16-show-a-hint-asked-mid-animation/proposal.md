# show-a-hint-asked-mid-animation

**Status: filed 2026-10-16, from the hint review of `add-numgame-ts-port`.
Seen in the app on Target and Fifteen; diagnosed and fixed 2026-10-16
(`tasks.md` 1.1).**

## Why

Pressing Hint while a move is still animating leaves the hint in a state no
player can read. Reproduced in Chrome on Target and on Fifteen, so it is the
engine's or the shell's and not one game's:

1. Press Hint, then Apply the hint, which plays a move with an animation.
2. Press Hint again while that move is still animating (60 to 250 ms later).

The words under the board then read "Hint applied", no step is drawn and no
sentence shows, and the Bar's button reads "Apply the hint". Waited out (two
seconds later), it is the same: no sentence, no marks, and the button still
offers to apply. Pressing it plays a step the player never saw. On Fifteen the
board showed the move done and the step's marks gone.

A player who presses Hint twice in quick succession, the natural way to walk
a hint, meets this on every game whose moves animate.

## What Changes

- A Hint press that arrives during a move's animation SHALL either show its
  step (its words and its marks) once the animation ends, or be answered as a
  fresh press then; never arm "Apply the hint" over a step that is not shown.
- A guard that plays the two presses with the animation in flight, for every
  game that animates a hinted move.

## Where to look first

`src/puzzle/puzzle.ts`: `hint()`, `_hintArmedToApply`, `_hintInFlight` and how
`activeHintExplanation` is cleared by "Hint applied"; and the midend's
handling of a hint request while an animation is running (`midend.ts`). The
midend advances a plan when the animation ends, so a request answered before
then may be answered against the step being left.

## Impact

- `engine-hints`: the midend answers a hint asked mid-animation with the next
  step. No game changes.
