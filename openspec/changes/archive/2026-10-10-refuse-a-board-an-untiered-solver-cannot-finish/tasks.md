# Tasks

## 1. See it, and count it

- [x] 1.1 Reproduce in the running app. Seen in Chrome 2026-10-10 with the old
  verdict put back: `proposal.md` has what Check & save, Hint and Show
  solution each did on a Signpost, a Crossing and a Sticks board.
- [x] 1.2 A test that lists every untiered game and sorts it.
  `src/engine/untiered-load.test.ts`: twenty-four games had neither answer,
  and nine can end a hint with the deduction-exhausted refusal. The four named
  here are among them.

## 2. The generator, before any refusal

- [x] 2.1 "Its deductions finish this board" is one test, `hintAndSolveFinish`
  in `src/engine/hint-finishes.ts`, for eight of the nine. Filling answers
  with its solver alone (2.2).
- [x] 2.2 Every dealt board is accepted, once Filling was taken off the shared
  test. `desc-error-games.test.ts` holds each preset and each Custom value to
  `loadVerdict` on every run. A census beside it asked `hintAndSolveFinish` of
  boards each game dealt (2026-10-10: 75 s a game over every preset and Custom
  value, then 150 s a game on its two smallest presets for all but ABCD and
  Signpost):

  | game | boards dealt | refused |
  | --- | --- | --- |
  | ABCD | 30,016 | 0 |
  | Crossing | 759,114 | 0 |
  | Filling | 7,450 | 14 |
  | Mosaic | 1,434,985 | 0 |
  | Palisade | 16,886 | 0 |
  | Pattern | 121,954 | 0 |
  | Separate | 19,519 | 0 |
  | Signpost | 58,722 | 0 |
  | Sticks | 7,166 | 0 |

  Filling's fourteen were all in the second pass, 14 of 6,688; the first had
  762 boards and none. Its solver finishes them and its hint does not, so
  its `finishesByDeduction` asks the solver alone, which refuses no board it
  deals, and the hint's gap is filed as
  `close-the-solver-hint-gap-in-filling`. Most of the large counts are of
  small boards, since those are what a time budget deals. And 94 descriptions
  upstream's generator wrote, across the seven of these games with a frozen
  fixture, still load (`upstream-descs.test.ts`).

## 3. The fix

- [x] 3.1 The declaration, checked at registration (`design.md`, Decision 3).
- [x] 3.2 Implemented, with deltas to `engine-params`, `engine-hints` and
  `abcd`. `skip_specs` is gone.
- [x] 3.3 The cross-game guard, seen to fail three ways on Palisade: its
  answer taken out (registration throws), swapped for `nothingToDeduce` (the
  two sets differ), and replaced by `() => true` (`5x5n5:a` loads).
- [x] 3.4 `loadVerdict` on each game's largest preset, before, and what the
  new test adds (2026-10-10, one board, this machine under load):

  | game | board | before | added |
  | --- | --- | --- | --- |
  | ABCD | 7x7, 4 letters | 0.2 ms | 1.5 ms |
  | Crossing | 15x15 symmetric | 0.2 ms | 1.9 ms |
  | Filling | 13x17 | 2.5 ms | 1.9 ms (its solver again; the shared test would add 35 ms) |
  | Mosaic | 50x50 | 2.9 ms | 7.9 ms |
  | Palisade | 12x15, regions of 10 | 4.3 ms | 5.8 ms |
  | Pattern | 30x30 | 0.7 ms | 17.5 ms |
  | Separate | 6x6, 6 letters | 0.2 ms | 0.7 ms |
  | Signpost | 7x7 | 0.1 ms | 1.3 ms |
  | Sticks | 10x10 | 3.7 ms | 21 ms |

## 4. Close

- [x] 4.1 In the running app (Chrome, 2026-10-10): the two Palisade IDs of the
  proposal and one board each of Signpost, Crossing, Sticks, Filling, Mosaic,
  Pattern, Separate and ABCD are refused with "This game ID's puzzle needs
  trial and error, and only puzzles that deduction alone solves can be played
  here." Twelve presses of Hint on the dealt board behind each raised no
  error, and finished Crossing's and Mosaic's.

  **What still loads, in Filling only:** a board its solver finishes and its
  hint does not. `7x9:94g999a447c5a6774a5d55d4b4f83g3284a4a` is one, and it
  opens. It is the same gap as the dealt boards of 2.2 and goes with them to
  `close-the-solver-hint-gap-in-filling`.
- [x] 4.2 The guides: `solver-and-generator.md`, `mechanics.md` and
  `engine-catalog.md`.
- [x] 4.3 Commit, push, archive.
