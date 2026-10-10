# Tasks

Read `docs/games/mechanics.md` and `docs/games/input.md`, `ts-engine` and
`engine-input`, and the archived
`2026-10-10-state-once-what-several-games-each-state/rules/no-op-input.md`
first.

## 1. The guard, before the fix

- [ ] 1.1 The question in `src/engine/testing/input-probe.ts`: over the
  probe's inputs on a game, the inputs after which the move counter rose and
  `ProbeBoard.board` did not change. A guard beside the collection's other
  input guards that asks it of every registered game.
- [ ] 1.2 See it find the seven of the proposal's table, each pinned by its
  inputs. Record how many moves the sweep made in each game, and widen it
  where a game was hardly reached (Pegs, Slide).
- [ ] 1.3 Record whatever else it finds. A game found here is fixed by 3 and
  not in the game.
- [ ] 1.4 The mirror question in the same sweep: an input answered "nothing
  happened" after which the `Ui` or the frame differs. See it find Untangle's
  first Up arrow on a fresh deal, and record whatever else it finds.
- [ ] 1.5 Untangle's arrow arm answers `UI_UPDATE` where it shows the cursor.
  If 1.4 finds the same in other games, stop and ask what the midend could do
  so that no game has it, before fixing a second game.

## 2. Settle the design

- [ ] 2.1 `design.md` § "To settle first", 1 and 2: measure the comparison's
  cost on the largest dealt boards, and list the games whose state holds
  bookkeeping that changes on every move.
- [ ] 2.2 § "To settle first", 3 and 4: each caller of `commitMove`, decided
  with its reason, and what a dropped move is answered as.
- [ ] 2.3 Write the decisions into `design.md`.

## 3. The midend

- [ ] 3.1 The comparison, in the engine, with tests of its own on states of
  each kind the games hold.
- [ ] 3.2 `Midend`: a player's move that leaves the board as it was is not
  recorded. Tests through the midend: no history entry, no step of Undo, the
  `Ui` change still painted, a drag's join unbroken.
- [ ] 3.3 A save holding such a move, written by the build before this
  change, loads to the same board. Make the fixture from today's `main`
  before changing the midend.
- [ ] 3.4 The guard of 1.1 finds none, and its other half holds: no input
  whose frame changed went unrecorded.
- [ ] 3.5 In the running app: each row of the proposal's table, and Undo
  after it.

## 4. The rule, stated once

- [ ] 4.1 `ts-engine`: the requirement, as a `MODIFIED` of "A UI-only input
  redraws without a history entry" or a requirement beside it.
- [ ] 4.2 Each game's own sentence of the rule cut, or shortened to what is
  the game's, by the method of the archived change (its `brief.md`), with a
  second agent reading old against new.
- [ ] 4.3 `docs/games/mechanics.md`, the paragraph on `interpretMove`, and
  `docs/games/input.md` where it repeats it.

## 5. Close

- [ ] 5.1 Remove `skip_specs`, validate, the gate, commit, push, archive.
