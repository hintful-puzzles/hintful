# Tasks

## 1. Confirm the owner's condition

- [x] 1.1 In the code: find every way a move is made on a board where no two
  tiles of a color touch. (There is one move, `remove`, and
  `interpretMove` emits it only from a selection, which `selExpand` keeps
  only for a group of two or more. The params that could change this are the
  color count and the scoring system, and neither is read by the selection.
  The game has no `solve` and no `hint`.)
- [x] 1.2 In the midend: sweep every button the engine has, with every
  modifier, at every tile, then in random sequences, over boards with no move
  in every ruleset, counting calls to `executeMove`. (2026-10-11: 420 boards,
  1x2 to 7x3, colors 3 to 9 under both scorings, 6,236,412 inputs, no call and
  no save changed. The same sweep on a board with one pair made its move.)
- [x] 1.3 In the running app, on the proposal's 5x5: click, double-click,
  right-click, middle-click and drag every tile, and press the keys. (273
  inputs: "Cannot move! Score: 0" and "Move 0 of 0" throughout, Undo and Redo
  disabled. Check & save saves, and says nothing of the board.)

## 2. Refuse it

- [x] 2.1 `hasNoSolution` also holds for a stuck board, and its comment says
  what is refused and on whose word.
- [x] 2.2 `samegame.test.ts`: the board with no move is refused under both
  scorings, a board with one move loads, and no press selects anything on a
  board with no move. Seen failing with the new line disabled.
- [x] 2.3 `samegame-midend.test.ts`: a game played until it is stuck still
  opens from its save, since a save is judged by its dealt board.
- [x] 2.4 In the running app: the proposal's ID is refused with "This game
  ID's puzzle has no solution, so it can't be played here."

## 3. Close

- [x] 3.1 The `samegame` spec delta, and `skip_specs` removed from
  `.openspec.yaml`.
- [x] 3.2 Gate, commit, push, archive.
