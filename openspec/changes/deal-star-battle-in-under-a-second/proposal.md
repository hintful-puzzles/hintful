# deal-star-battle-in-under-a-second

**Status: scaffolded 2026-10-13 at the owner's word, not started.** It
needs no answer from the owner to start. It has no `tasks.md` yet: the
session that takes it up writes them after re-taking the figures below.

## Why

The owner, on first playing Star Battle (2026-10-13): dealing a board of two
stars sometimes takes several seconds, and those boards are the fun ones.

Measured 2026-10-12, a board, the mean over 12 to 40 draws
(`openspec/changes/archive/2026-10-13-add-starbattle/design.md` § "The
generator" has the whole table):

| Board | Easy | Normal | Tricky |
| --- | --- | --- | --- |
| 9x9, two stars | 0.1 s | 0.4 s | one board in 30 draws |
| 10x10, two stars | 0.35 to 1 s | 0.8 to 1 s | 2 s |
| 12x12, two stars | none in 12 draws | 5 s | 14 s |

Those are means. A draw succeeds about one time in two to three, a failed
draw spends its whole allowance of moves, and a tier above Easy turns away
the boards that came out easier, so the tail is several times the mean. That
tail is the "sometimes".

## Where the time goes

`src/games/starbattle/generator.ts`, `mend`. On a 10x10 of two stars, timed
2026-10-12 over 30 draws at each tier:

- **60 to 75% is the search for a second answer** (`otherAnswer`, up to 24
  positions, each a whole ladder solve from a copy of the board), run again
  after every move that is kept.
- **About 25% is the ladder solve after each move**, from a blank board.
- **Under 10% is choosing the cell to move.**
- A draw makes 60 to 130 moves. The allowance is two a cell, and a draw that
  fails spends all of it.

## What to try, cheapest first

None of these is measured. Each is a guess with a reason.

1. **Solve from where the last solve stopped.** A move changes two regions.
   The ladder is run from a blank board every time; what it concluded
   without reading either region still holds.
2. **Ask the search less often.** It is asked after every kept move. While
   the count of open cells is falling the board may be worked by the cheap
   move alone, and the search kept for when it stalls.
3. **Give up a draw that is not improving.** A stall limit was tried at 15,
   30 and 60 moves on 2026-10-12 and moved nothing in 40 draws, which was too
   few draws to see a change of a quarter. Try it again with a few hundred.
4. **Aim at the tier, not under it.** The mend stops at the first board the
   tier's ladder finishes, and at Normal a third to a half of those are Easy
   and thrown away. Keep moving cells while the easier ladder still finishes
   the board.
5. **A cheaper ladder.** `StarbattleBoard.open` and `need` filter a unit's
   cells on every call; counts kept as marks are written would make them a
   lookup.
6. **Deal ahead by more than one**, which is not this game's alone: the app
   deals the next board beside the one in play, so the wait is the first
   board's only, and a second board held ready would hide a slow tail too.

## What Changes

- The generator, so that a 10x10 board of two stars at Easy or Normal is
  dealt in under a second at the 95th of a hundred seeds, on the machine the
  figures above were taken on. Which board a seed deals may change: the app
  hands out boards and not seeds.
- With that, the menu may offer Tricky for two stars and a board past
  10x10, which it leaves off today for the wait.

`own-what-starbattle-wrote-for-the-engine` asks whether the mend becomes an
engine walk. Do this one first: the walk is easier to move once it is fast,
and what makes it fast says what the engine's version must take from a game.

## Capabilities

### Modified Capabilities

- `starbattle`: "Generation: A dealt board has one answer and no region too
  small to think about" as far as the mend's steps are stated there, and the
  menu if it grows.

## Impact

`src/games/starbattle/generator.ts`, `solver.ts`, `state.ts` (the menu) and
their tests.
