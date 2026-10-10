# Tasks

Read `docs/games/input.md` and `engine-input` first, in particular the
requirements on a canceled press and on a drag.

## 1. The guard, before the fix

- [x] 1.1 The question in `src/engine/testing/input-probe.ts`
  (`changedUnder`): a gesture continued after the board changed under it,
  and whether it then made a move or left a preview in the frame. A guard
  that asks it of every registered game (`drag-cancel.test.ts`), with
  gestures whose press already makes a move included.
- [x] 1.2 Seen to find the games of the proposal and the engine's sweep, 32
  games in all. Not pinned as a list: the guard requires none. The counts are
  in `design.md` § "The guard".

## 2. Settle the design

- [x] 2.1 `design.md` § "Decisions", 1 to 4.

## 3. The midend

- [x] 3.1 `Midend`: a board change that is not the input's own ends the
  gesture, a declared sweep included, and the rest of its events reach no
  game.
- [x] 3.2 The guard of 1.1 finds none. A drag that marks as it goes still
  makes all its moves as one step of Undo (`drag-marks.test.ts`, unchanged
  and green).
- [x] 3.3 In the running app, with a mouse: Sixteen, Spokes, Map, Galaxies
  and Tracks; by touch: Sixteen. `design.md` § "In the app".

## 4. The rule

- [x] 4.1 `engine-input`: "The engine cancels a drag the board changed
  under" as a `MODIFIED`, and four requirements added for the gesture.
- [x] 4.2 `docs/games/input.md` § "A board change under a gesture is the
  engine's", and the two guides that told a port to clear its drag.

## 5. Close

- [ ] 5.1 Remove `skip_specs`, validate, the gate, commit, push, archive.
