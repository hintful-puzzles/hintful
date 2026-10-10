# Tasks

Read `docs/games/mechanics.md` and `docs/games/input.md`, `ts-engine` and
`engine-input`, and the archived
`2026-10-10-state-once-what-several-games-each-state/rules/no-op-input.md`
first.

## 1. The guard, before the fix

- [x] 1.1 The question in `src/engine/testing/input-probe.ts`
  (`inputAnswers`): over the probe's inputs on a game, the inputs after which
  the history grew by a move the game made that left `ProbeBoard.board` as it
  was. `src/engine/input-answers.test.ts` asks it of every registered game.
- [x] 1.2 Seen to find the seven of the proposal's table and no other game,
  before the midend changed. The moves the sweep made in each game are in the
  guard's failure message; Pegs (7) and Slide (16) are still hardly reached
  (`design.md`, § "The guard").
- [x] 1.3 It found nothing else of that kind. Six games whose state changes
  where the frame does not are listed in `design.md`, decision 2.
- [x] 1.4 The mirror question in the same sweep. It found Untangle's first Up
  arrow and seven other games.
- [x] 1.5 Untangle's arrow arm answers `UI_UPDATE` where it shows the cursor.
  For the eight together the midend repaints a `Ui` changed under "nothing
  happened" (`design.md`, § "The mirror"), and the answer the other seven
  give is filed as `claim-an-input-that-changed-the-ui`.

## 2. Settle the design

- [x] 2.1 The comparison's cost and its agreement with the probe's digest,
  and the search for bookkeeping that changes on every move.
- [x] 2.2 Each caller of `commitMove`, and what a dropped move is answered
  as.
- [x] 2.3 Written into `design.md`.

## 3. The midend

- [x] 3.1 `src/engine/same-value.ts`, with `same-value.test.ts`.
- [x] 3.2 `Midend`: a player's move that leaves the board as it was is not
  recorded. `midend-unchanged-move.test.ts`.
- [x] 3.3 A Loopy save holding such a move, written by the build before the
  change, loads with both its moves and saves again as it was.
- [x] 3.4 The guard finds none, and no move that changed the board is left
  out. Each half seen to fail with its rule switched off.
- [x] 3.5 In the running app: each row of the proposal's table, and Undo
  after it. Untangle needed its put-down arm changed (`design.md`,
  decision 2).

## 4. The rule, stated once

- [x] 4.1 `ts-engine`: "A move that leaves the board as it was is no step of
  the history" and "A `Ui` changed under "nothing happened" is painted",
  beside a `MODIFIED` "A UI-only input redraws without a history entry".
- [x] 4.2 Each game's own sentence of the rule cut, or shortened to what is
  the game's, in twenty-three games, and a second agent read old against new
  and the code: it restored Salad's refusal on a given, narrowed a Pattern
  sentence, and corrected two Untangle requirements that said a put-down is
  always a move.
- [x] 4.3 `docs/games/mechanics.md` § "interpretMove and UI_UPDATE",
  `docs/games/input.md`, `docs/games/README.md` and the engine catalog.

## 5. Close

- [x] 5.1 Validate, the gate, commit, push, archive.
