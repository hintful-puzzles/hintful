# Design: let-a-refusal-point-at-its-cause

## D1. The verdict is "the advice is to go back", typed per kind

The proposal called it *doomed*. Reading the kinds showed that is a stronger
claim than some of them make: `NO_SOLUTION_FROM_HERE` is "worded as what was
*found*" (`solve-failure.ts`), and Inertia's route solver, which returns it, is
a heuristic that can fail on a position a one-way last gem still finishes from.
What every candidate *does* share is its advice: each tells the player to undo.
So the verdict is `isDeadEnd`, whether a refusal's advice is to go back, and a
save is refused on it because a save is a position to come back to.

- Dead ends: `CONTRADICTION_UNLOCALIZED`, `GAME_OVER`, `NO_SOLUTION_FROM_HERE`,
  and every game's own (`puzzleDeadEnd`, `markedDeadEnd`).
- Not: `DEDUCTION_EXHAUSTED`, `SEARCH_OUT_OF_REACH`, `NO_MOVE_WORTH_MAKING`,
  `PUZZLE_NOT_REASONABLE`, `SOLUTION_UNKNOWN`.

The table is `Record<kind, boolean>`, so a new kind without a verdict fails the
typecheck, and `hint-refusal.test.ts` holds each verdict to whether the kind's
sentence has a sentence opening "Undo" (planted: flipping
`NO_SOLUTION_FROM_HERE` fails it). The game's escape is a dead end by
construction, so `puzzleHintRefusal` became `puzzleDeadEnd`: every caller it had
(Pegs, Inertia, Mines) was one, and no game has needed a game-specific refusal
that is not, so there is no second escape until one does.

## D2. A new result arm, not a moveless step

`HintResult` gains `MarkedDeadEnd`, `{ ok: false, error, words }`, made only by
`markedDeadEnd(words)` so the sentence is the words' text. A moveless
`HintStep` was rejected: seven renderers read `hint.move` without a guard
(Flood, Loopy, Netslide, Sixteen, Untangle, Fifteen's and Subsets' hooks), and
`hint-gesture.ts` plays every step as a gesture.

The marks reach the board as `redraw`'s trailing `deadEnd` argument, which only
the two games that make one read (`stepMarks(hint ?? deadEnd)`). The binding
walk (`deadEndBindingDefects`) holds the frame to the words exactly as for a
step, and catches a renderer that names marks it does not read (planted: Pegs
reading only `hint` fails with "names outline|peg|0, which is not drawn").

## D3. Nothing about the marks crosses the worker boundary

The canvas is painted in the worker, so the midend keeps the displayed dead end
beside `activeMistakes` and clears both on the same transitions
(`clearOverlays`). Only the verdict crosses: `check(): CheckVerdict`, replacing
`findMistakes()` on the surface.

## D4. One check, in the midend

`Midend.check()` asks `findMistakes` first, then the hint, and never shows a
hint. A solved board and one a stored plan still leads on from are answered
without computing a hint. The midend's tier assertion on `DEDUCTION_EXHAUSTED`
stays on the hint path only: the check asks a different question, and its
answer, "not a dead end", is right on any tier.

The static attribute `canCheck` (`findMistakes` or `hint`) replaces
`canFindMistakes`, which the app now read only to fold into this one, and
`contract-surface.test.ts` refuses a field shipped for nobody. It gates Check &
save's check and the Check without saving row, so Pegs and Inertia gain the
quiet command too.

## D5. Past the search's reach: save, and say so (owner, 2026-10-02)

Measured under random play (2026-10-02, a machine short on memory, so times
are upper bounds): Pegs' check lands past the search's reach on about 7% of
positions on the 33-hole board, about a third on 5×9 Cross and about half on
9×9 Cross. The owner chose to save and say so in a non-blocking toast
(`CHECK_OUT_OF_REACH`), over a quiet save or a confirm.

## D6. The cost of a check

A check costs one hint. Fresh boards, worst of three seeds per smallest and
largest preset: under 150 ms everywhere but Sixteen 5×5 (~1 s), Netslide 5×5
(~0.5 s), Bricks Unreasonable (~0.4 s) and Pegs 9×9 (~0.35 s; ~1.7 s worst
mid-game). It runs in the worker, so the page stays live. Sixteen's tangled
endgames cost what its hint already costs (~3–4 s). Declined: a declaration of
"this game has no dead ends" to skip the hint, because it would be a statement
about a game read only by the check, which is the kind of copy AGENTS.md
refuses.

## D7. Which games' checks change (task 1.1)

Read, not grepped by name alone (a pass-through of a solver's error was also
looked for: the only ones are in `solve`):

- **Behind a `findMistakes` that misses it**: Bricks, Bridges, Clusters, Loopy
  and Subsets, each with `CONTRADICTION_UNLOCALIZED`. Bridges was not in the
  proposal's list.
- **With no `findMistakes`**: Pegs (cut-off pegs, marked; a proved loss),
  Inertia (dead ball; stranded gems, marked; the route solver's failure), Mines
  (an opened mine), Flood and Guess (`GAME_OVER`).

Inertia's dead ball is left unmarked: the board already draws a dead ball as
one.

## Browser check

Pegs 7×7 with a cut-off peg: Check & save shows "Not saved" with the hint's
sentence, the peg is outlined, and Back to last save stays disabled; Check
without saving shows the same sentence in a toast. Clusters on a fresh board
saves as before ("No mistakes. Saved."). The contradiction path on a
deductive game was not driven through the canvas (Bricks' hex drag); it is
pinned through the midend in `bricks-hint.test.ts`, and reaches the same app
branch the Pegs run exercised. The toast sits over the bottom of the board and
can cover a mark in the bottom rows while it shows; the mark stays after it
fades.
