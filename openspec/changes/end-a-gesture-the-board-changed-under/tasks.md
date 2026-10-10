# Tasks

Read `docs/games/input.md` and `engine-input` first, in particular the
requirements on a canceled press and on a drag.

## 1. The guard, before the fix

- [ ] 1.1 The question in `src/engine/testing/input-probe.ts`: a gesture
  continued after the board changed under it, and whether it then made a
  move or left a preview in the frame. A guard that asks it of every
  registered game, with gestures whose press already makes a move included.
- [ ] 1.2 See it find the games of the proposal and the engine's sweep, and
  pin them. Record how many gestures it drove in each game.

## 2. Settle the design

- [ ] 2.1 `design.md` § "To settle first", 1 to 3, each decided with its
  reason and written into `design.md`.

## 3. The midend

- [ ] 3.1 `Midend`: a board change that is not the gesture's own ends the
  gesture, a declared sweep included, and the rest of its events reach no
  game.
- [ ] 3.2 The guard of 1.1 finds none. A drag that marks as it goes still
  makes all its moves as one step of Undo.
- [ ] 3.3 In the running app, with a mouse and by touch: Sixteen, Spokes, Map
  and Galaxies by the proposal's steps, and a drag in Tracks; then Undo and
  Redo after.

## 4. The rule

- [ ] 4.1 `engine-input`: "The engine cancels a drag the board changed
  under", as a `MODIFIED` that states it of every gesture.
- [ ] 4.2 `docs/games/input.md`: a game writes nothing to end its drag on a
  board change, and the `changedState` clearings that are no longer needed.

## 5. Close

- [ ] 5.1 Remove `skip_specs`, validate, the gate, commit, push, archive.
