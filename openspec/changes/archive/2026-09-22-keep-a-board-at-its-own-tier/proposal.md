# keep-a-board-at-its-own-tier

## Why

Reported by the owner, 2026-09-22, the day after
`grade-a-board-shared-without-its-tier`: the same Bridges board
(`10x10m2:a2a4e31c2a4a1l1b1e5b4b4a1m1f43j2a4e43d4a2b`, a Normal board) kept
reopening as Easy on some dev-server reloads, and its hint then threw at move
10 over deduction running out on a tier that does not allow trial and error.

Opening the id itself grades the board correctly (Normal, on every load, from
any prior params). A reload never sees the id: the app drops `?id=` from the
URL once the board is up, and a reload restores the board from the autosave or
from the remembered `lastGameId` instead. **Both of those pin the tier.** The
board was first opened before grading existed, so it was labeled Easy, and both
records were written with `d0`. A pinned tier was taken as stated "without
grading the board", so every reload reopened it as Easy.

A second path relabeled a board, with no stale data needed: the midend kept one
`params` field for both the board on screen and the next New game. Choosing a
type or custom params writes it before the new board is dealt, so a save, a
restart or an id emitted in that gap paired the old desc with the new
difficulty (and the new size), and the next reload reopened the board at a tier
it was never dealt at.

## What changes

- A board loaded from a `:desc` id or a save is checked against the tier its
  params pin: one capped solve at that tier. If the board solves there, the pin
  stands. If not, the board is raised to the lowest tier above it that solves
  it. A pin is never lowered, and a tier that allows search or promises no
  unique solution is taken as stated. This also corrects the owner's stale
  records the next time they load.
- The midend keeps the board's params (`boardParams`, upstream `curparams`)
  apart from the params for the next board (`params`). `setParams` and the
  custom dialog change only the latter. Everything that describes the board on
  screen reads the former: the save envelope, restart, the game ids, the hint's
  tier check, the keypad and the size.

## What does not change

The id and save formats. The sharing id still omits the difficulty and is still
graded outright. The midend still throws when deduction runs out outside an
Unreasonable tier: that check now catches a hint weaker than the tier's solver,
since a mislabeled board no longer gets that far.

## Cost

One capped solve on each load of a tiered board from a full id or a save, where
there was none. Generators run many of these per board dealt.

## Impact

- `src/engine/midend.ts`: `boardParams`, `withBoardTier` on pinned ids and on
  `loadGame`.
- Specs: `ts-engine` (the grading requirement replaced, a new requirement for
  the params split), `app-shell` (the remembered board is now checked by the
  solver, and the requirement it cites is renamed).
