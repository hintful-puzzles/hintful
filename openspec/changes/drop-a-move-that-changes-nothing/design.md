# Design

Written 2026-10-10 when the change was filed. Nothing here has been tried.

## Context

`Midend.interpret` asks the game for a move, calls `executeMove`, and hands
the state to `commitMove`, which records it. `applyMove` and the Solve path
reach `commitMove` too, and a load replays a save's moves through it. The
engine has no way today to ask whether two states are the same board: the
test harness has one (`ProbeBoard.board` in
`src/engine/testing/input-probe.ts`, a digest of the state), and it is not
part of what ships.

## To settle first

1. **What "the same board" is, and what it costs.** The candidates, each to
   be measured over every registered game before one is chosen:
   - *The same object.* A game that returns the state it was given has
     changed nothing, at no cost. It catches a game written to do that and
     none of the seven, each of which builds a new state.
   - *A structural comparison of the two states*, written once in the
     engine: plain objects, arrays, typed arrays and maps, compared by value,
     with a part both states share by reference equal at once. No game writes
     anything. Measure its cost on the largest boards the menus deal, on a
     move that does change something (the common case, and it should stop at
     the first difference) and on one that does not.
   - *A hook on `Game`.* The fallback only if a game's state holds something
     a structural comparison cannot read, and then for that game alone, with
     its reason. A hook every game writes is the per-game work this change
     exists to avoid.
2. **A state that differs where the board does not.** Net records which way
   its last turn went, so two inputs can leave one picture and two states.
   That is not this defect: the state changed, and the step stays. Say so in
   the requirement, and find the games where a field of the state is
   bookkeeping that changes on every move (a move counter, a last-move
   marker, a `solving` flag): in such a game the comparison never fires, and
   the guard below would report its moves that change nothing. Decide for
   each whether the bookkeeping belongs in the state.
3. **Which callers drop a move.** The player's input does. Decide, with the
   reason written down, for each of the others:
   - *A hint's move.* A step that changes nothing is a defect in the hint;
     dropping it silently could hide one. What does the plan's tracking do
     when its step's move is not recorded?
   - *Solve.* On a board already at its answer, and in a game whose Solve
     marks the state (`ts-engine`, "Solve leaves a solved board").
   - *A drag's joined moves and a sweep.* A later mark of one drag that
     changes nothing must not break the join of the ones around it
     (`engine-input`, "One drag is one step of Undo").
   - *A load's replay.* A save written before this change may hold such a
     move. It must load, and to the same board. Either the replay records it
     as it was written, or it drops it and the position counter in the save
     is read against the moves that remain. The owner's rule is that a save a
     player holds today opens in every later version.
4. **What the input is answered as.** `interpretMove` may have changed the
   `Ui` on the way to the move (a cursor moved, a highlight put away), so a
   dropped move is at least a `UI_UPDATE`: a redraw and a notification with
   no history entry. Check what `changedState` and the animation setup are
   owed when nothing is recorded: neither should run.

## The guard

The sweep that found the seven is the guard: over every registered game, the
shared probe's inputs (keys, presses, drags, the keypad), and after each one,
"did the move counter rise while `ProbeBoard.board` stayed as it was?". It
derives its population from the registry. Before the midend changes, it must
find the seven, each by the inputs of the proposal's table, pinned as the
positives it is trusted on; after, it finds none. Count what it reached: a
game in which the sweep made no move at all has been asked nothing, and the
earlier sweep made none in Pegs and five in Slide.

## Risks

- A comparison that is wrong about a game's state drops a real move, which is
  far worse than the defect → the guard's other half: over the same sweep,
  no input whose frame changed was answered without a history entry.
- A comparison on every move slows a large board → measured in 1 above, and
  it runs once an input, not once a frame.
