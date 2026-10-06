# Design

Decided and built 2026-10-06. Each heading is a question the proposal left
open, or one the build raised.

## Slow is the wait the player is told about

A deal ahead is slow where its generator ran for a second or more, which is
`DEAL_PENDING_MS`: how long a New game goes unanswered before the page says
"Looking for a board…". The two are one constant (`SLOW_DEAL_MS`). A type is
worth more boards exactly where finding none kept is a wait the player is
shown, so the threshold is not a second number to tune.

## The worker times the deal

The time is taken in the worker, around the generator alone, and comes back
with the board (`TimedDeal`). Timed from the page it would include starting
the worker, which loads every game; on a slow phone that alone could pass a
second, and every type would then keep three boards.

## One slow deal makes the type slow

A search for a rare board ends at the first one it meets, so its time varies
widely: the three boards kept for Group 6x6 Tricky in the run below took 3.3,
6.4 and 8.3 seconds, three later ones 20.4, 20.7 and 7.7, and the scaffold
measured one in under a second. Judged deal by deal, a quick find would stop
the dealing at one board. So:

- A type is slow for the rest of the visit once a board kept for it was slow
  to find (`DealAhead.slow`).
- Each kept row carries how long it took (`dealMs`), so a later visit knows
  the type is slow while any slow row is still kept. Once all are played the
  next deal ahead measures again.

## Three boards, dealt one at a time

Three is the owner's figure and stays a guess: two boards passed over and one
played. Each is seconds of one core, spent again after every deploy and
wasted where the player only passed through the type, which is why it is not
more. The boards are dealt in turn in one worker at a time, so the cost is one
core and never three.

## The store's key, and which row is taken

The table is `kept`, keyed by a number that counts up (`++id`), with an index
on `[puzzleId+params]`. New game takes the lowest id of its type: the board
kept longest, so no board sits unplayed behind newer ones.

Dexie cannot change a table's primary key in an upgrade, so version 2 drops
`boards` and adds `kept`, and the one board a type that a player had kept is
dealt again. A store that failed to open would fail every New game, since
each asks it for a board first, so `kept-boards.test.ts` opens the new store
over a version 1 database.

## Declined: depth that follows what the player does

A player who skips boards on a quick type waits milliseconds at a miss, so
there is nothing for the depth to buy there. On a slow type the cost measure
already keeps three.

## Declined: counting a slow deal in the foreground

The first deal ahead follows the foreground deal by moments and times the
same type, so a second measure would matter only where that one deal happened
to be quick, and then the next slow deal makes the type slow anyway.

## Verified

Timed 2026-10-06 in Chrome on the dev server, Group 6x6 Tricky, identity
shown, opened over a version 1 database made by hand:

- The database went from version 1 to 2 and the old table was gone.
- Three boards were kept 19 seconds after the page loaded.
- New game pressed three times, a second apart: each press played a kept
  board in about 50 ms and none showed "Looking for a board…". A fourth, with
  none kept, did show it, which is the check that the words could be seen.
- The store was back at three boards afterwards.
- Group 6x6 Normal dealt ahead in 3 ms and kept one board, before and after
  two New games.
