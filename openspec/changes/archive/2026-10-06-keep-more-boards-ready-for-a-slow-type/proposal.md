# keep-more-boards-ready-for-a-slow-type

**Status: built and verified (2026-10-06); `design.md` holds what was
decided.** A follow-up from
`keep-a-board-ready-for-the-next-deal`, raised with the owner the day it
landed: they asked whether keeping more than one board makes sense.

## Why

The app keeps one board dealt ahead for each type (`src/puzzle/deal-ahead.ts`,
`src/store/kept-boards.ts`). One board covers a player who finishes a board
and asks for the next, because solving takes far longer than dealing. It does
not cover New game pressed twice running, which is how a player passes over a
board they do not like the look of: the second press finds nothing kept and
deals in the foreground.

Measured 2026-10-06 on Group 6x6 Tricky, identity shown: a kept board is
played in about a third of a second, and the board dealt behind it was found
in 7, 35 and under 1 seconds on three presses. Six seeded deals of that cell
on a loaded machine took 0.2 to 47 seconds. So a second press inside that
window waits as long as a first deal does.

For nearly every type a miss costs milliseconds, and more boards kept would
buy nothing.

## What Changes

The shape discussed, which is the shape built:

- **One board for every type, as now, and up to three where the deal is
  slow.** The deal ahead can time itself, which is the measure of slow that
  `keep-a-board-ready-for-the-next-deal` said the page lacked when it chose to
  deal every type ahead alike. Where a deal ahead took more than about a
  second, keep dealing until three are kept.
- **The store holds several rows a type.** Its key is one row for a puzzle and
  its params (`&[puzzleId+params]`), so it needs a key of its own and a read
  that takes the oldest. It is a cache in a database of its own, so the schema
  change puts nothing of the player's at risk.

What is known, so the design does not have to find it again:

- Each further board of a slow type is about ten seconds of one core in the
  background, more on a phone, and is wasted where the player only passed
  through that type. That is the reason for a small bound.
- Depth does nothing for the first deal of a rare type, which nothing has
  dealt ahead of.
- Every deploy empties the store, since a kept board is good only for the
  build that dealt it. More boards kept is more thrown away then.

## Open questions

Each is answered in `design.md`.

- The threshold for slow, and whether three is the number: both are guesses.
- Whether the depth should follow what the player does (a type they skip
  boards on) instead of what the deal costs.
- Whether a slow deal seen in the foreground should count as the measure too,
  so the first board dealt ahead already knows the type is slow.

## Hints to pull in

None.

## What would show it worked

On Group 6x6 Tricky, with the store full, three New games pressed running each
play a kept board, and a quick type keeps one board as before.
