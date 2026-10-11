# Tasks

## 1. Reproduce

- [x] 1.1 Mines on `9x9n1` in the running app: first click, copy the game
  ID, open it; and reload the page on the won board.
- [x] 1.2 Subsets and Inertia on the boards `found.md` records.

## 2. The engine

- [x] 2.1 For every game that answers `finishesByDeduction` or is walked by
  its hint at load: a board won at load, and a board one move from won. The
  population is derived from the games, and the count of games asked is
  reported. Mend what fails in the engine where more than one game does.
- [x] 2.2 Sweep the games with a stored answer for a wrong entry that breaks
  no rule and that `findMistakes` does not return. Report the count looked
  at; a guard is written only if a second game fails. A second and a third
  did, and the guard goes with their fix
  (`check-a-wrong-entry-against-the-answer-in-every-game`).

## 3. The games

- [x] 3.1 Mines: a board won on opening finishes; its ID and save open.
- [x] 3.2 Subsets: a wrong letter is returned by `findMistakes`; "Subsets
  flags mistakes for Check & Save" changes with it.
- [x] 3.3 Inertia: the last gem ends the tour.
- [x] 3.4 Mines' and Solo's parsers, after checking against upstream's C
  that no generator writes what they will refuse.
- [x] 3.5 Fifteen's solved board: by the owner's answer. Moved, with its
  question, to `decide-whether-a-solved-game-id-opens`; nothing here waits
  on it.
- [x] 3.6 Run the app on each.

## 4. Close

- [x] 4.1 The spec deltas, the guide, validate, the gate, commit, push,
  archive.
