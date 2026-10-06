# Design

Decided and built 2026-10-06. Each heading is a question the proposal left
open, or one the build raised.

## A second worker deals the board

A generator is synchronous and owns its thread until it returns, so a board
dealt ahead in the puzzle's own worker would stop the board in play from
answering input for as long as the deal took: ten seconds at the cells this
change is for. The deal ahead runs in a second instance of the same worker
script (`spawn-worker.ts`), started for one board and ended with it.

- The same script, so there is one worker file in the build and in the
  precache, and both instances hold the same build of every generator.
- Started for each deal and not kept alive: a deal ahead happens once a board
  played, and an idle second copy of every game is memory a phone would rather
  have. Ending it is also how a deal for a type the player has left is
  stopped.
- The board a player is waiting for is still dealt in the puzzle's worker, as
  before. Sending it to the second worker would add a worker start to every
  first deal and buy only the chance to cancel one, which nothing offers.

## A kept board lives in IndexedDB, in a database of its own

In the worker's memory a board would be kept for one visit, so each visit to a
slow type would deal one whether or not the player asked for a board: the cost
on a phone's battery that the proposal names. In IndexedDB the count is one
board more than the player plays, for each type they open.

It is `PuzzleKeptBoards` and not a table in `PuzzleAppData`: every row can be
dealt again, so it shares nothing with the player's saved games, and a table
added there would have raised the schema version of the database that holds
them.

## A row is good for the build that dealt it

A kept board is played as the generator wrote it: no solver grades it and its
`aux` goes to Solve. A later build may grade the board at another tier, or
read `aux` differently, so a row carries the build's version string and reads
as absent to any other. The alternative, loading a kept board as a pasted desc
is loaded, would cost a solve at each New game and lose `aux`.

On the dev server a page load stands for a build: the version string there
names the last commit, and a board dealt before an edit to a generator would
be played after it, by a session checking that edit.

## Every type is dealt ahead

Dealing ahead only where a deal is slow needs a measure of slow that the page
does not have before it has dealt there, and a threshold to tune. The cost of
not choosing is one board per type opened, which for nearly every type is
milliseconds.

It waits for the board area. Which way round the next board is dealt is
decided against the space the view measured, and a board dealt ahead for the
other way round is one nobody plays.

A deal ahead that finds no board is not started again until a board of that
type is asked for. Otherwise each resize would start another search of seconds
on a type whose generator gives up.

## Rejects are not banked

Declined, on what the proposal had already found:

- Rejects only fall downward, so a search mostly fills tiers that are already
  instant.
- The one case it pays is a rare middle tier under a search for a higher one.
  The only such pair measured is Group's 6x6 Tricky under 6x6 Hard, and 6x6
  Hard found no board in 290,000 tries and stays refused, so nobody runs that
  search.
- It would change every generator's contract, to return what it threw away,
  and add a grading solve per reject.
- A banked board was stripped against a stronger solver than its tier's, so it
  is a different population from the boards dealt at that tier.

With the next board kept, a rare tier costs a wait in the background, which is
the thing banking was to save.

## A shipped pool of descs

Declined, as the proposal weighed it: the pool is finite, so boards repeat,
and a solver change can move a pooled board to another tier.

## The first, slow deal

It shows what any deal shows, the board's loading sheen, and after a second
the app says "Looking for a board…" where a pending hint says "Thinking…". It
cannot be cancelled, as a 12x12 Group at Hard could not be before this.

## Group

`tierTooRare` now refuses 6x6 Hard alone. A 6x6 at Tricky and an 8x8 at Hard,
identity shown, are dealt, with `retryBudget` at five times each cell's
measured mean (48,000 and 6,400 tries), which a deal runs out once in 150. The
house bound of 10,000 would have run out four times in five at the first.

Timed 2026-10-06 in Chrome on Group 6x6 Tricky: New game played the kept board
in about a third of a second on three presses running, and the board dealt
ahead behind each was found in 7, 35 and under 1 seconds. On a production
build the kept board was there after a reload and was the board New game
played.

The two cells stay off the preset menu: a preset is a type the first board of
which a player should not have to wait for.
