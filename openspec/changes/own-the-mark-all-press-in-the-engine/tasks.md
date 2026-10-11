# Tasks

- [x] 1.1 `MARK_ALL_BUTTON` in `pointer.ts`; `Game.markAll` in place of
  `canMarkAll`; the midend answers the button and the free letter, for the
  player's input and a hint's gesture alike.
- [x] 1.2 The Fill marks button sends the button code.
- [x] 2.1 Each of the twelve games: the `M` arm leaves `interpretMove` and
  becomes its `markAll`; `markAllNow` goes.
- [x] 2.2 Seismic's `markAll` cleans over its hint's reach.
- [x] 3.1 `mark-all.test.ts` and the other guards read the hook, and
  `midend.test.ts` holds the rule for the letter on a game made for it.
- [x] 3.2 The help sentence and the Group, Solo and Seismic pages; the guides.
- [x] 3.3 Run the app: Solo 22+, Group, Seismic.
- [x] 4.1 Spec deltas, validate, gate, commit, push, archive.

## What was seen (2026-10-11)

- In the running app, on Chrome: on a Solo `2x11` board with a square
  selected, the Fill marks button filled the marks and entered nothing (one
  move, the square still empty); on a six-element Group board, small `m`
  turned the button to Update marks; on Seismic's first preset a second press
  was a second move that struck notes.
- The guard for the letter was seen to fail: with the keypad check taken out
  of `Midend.ask`, "hands the letter to a game whose keypad has an M" failed.
- No board of the gate's slice has M on its keypad, so the cross-game sweep
  reaches that arm only in the slow tier; the midend's own test holds it.

Undead keeps a press that only fills. That is the puzzle's and not a
shortfall: no placed monster rules a monster out of another square.
