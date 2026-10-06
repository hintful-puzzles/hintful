# let-a-player-stop-a-deal

**Status: implemented (2026-10-06).** A follow-up from
`bound-custom-sizes-by-their-deal`. What the work found, and the decisions it
took, are at the end.

## Why

A deal the player is waiting for runs in the board's own worker and cannot be
stopped (`Puzzle.newGame`, `Midend.deal`). After a second the page says
"Looking for a board…", and that is all it can do: the generator owns the
thread until it returns, so the board on screen takes no input either.

That was written for a wait of seconds. `npm run deal-walk`, run across the
collection on 2026-10-06 (`metrics/deal-walk.md`), found that a Custom size
makes the wait as long as the player cares to ask for, in nearly every game:

- **A ladder that leaves ten seconds a board, or gives no answer in a
  minute, between 1.5 and 4 times the menu's largest size**, in most games
  whose size has no upper end. The ones quick out to eight times the menu are
  the minority (the shuffles, Mines, Map, Guess and Cube among them). Bricks at 16x20 Normal, Pearl at 15x15,
  Palisade at 15x15 of 5, Tents at 23x23, Sticks at 15x15 and Dominosa at 27
  gave no answer in a minute.
- **Inside a size the fields declare a maximum for**, too: Solo at 5x5 above
  Hard, Unequal at 11 Recursive, Group at 12 Unreasonable.
- **One inside the menu's own range**: see the Mathrax line in
  `bound-custom-sizes-by-their-deal`'s archive, a 9x9 at its top tier.

`bound-custom-sizes-by-their-deal` set out to refuse such sizes game by game
and stopped at Sokoban, for three reasons that are this change's case:

1. **The line is in a different place at every tier and every choice.** Boats
   is quick at 80x80 Easy and 26 seconds at 30x30 Normal. Loopy's walk is
   72 ladders, four tiers on each of eighteen tilings, and they end at sizes
   from 8x10 to 60x60. A refusal per cell is some hundreds of hand-kept numbers.
2. **The numbers are one machine's.** A size that is 20 seconds here is over
   a minute on a phone, and a size refused here is a fair wait on something
   faster. A table cannot be right for both.
3. **A table bounds only what was measured.** The Mathrax cell was dealt
   quickly three times by the tier walk before a fourth seed did not come
   back in ten minutes.

A player who can stop a deal needs none of it: a large size is a wait they
chose and can leave.

## What Changes

- **A waited-for deal runs where it can be stopped.** `deal-ahead.ts` already
  deals in a second worker that ends with its deal (`dealInWorker`, `stop`).
  A New game that finds no board kept should wait on a deal there, hand the
  board to `workerPuzzle.newGame(area, kept)` as a kept one is handed, and
  leave the board in play answering input meanwhile.
- **"Looking for a board…" gets a way out**, which stops the deal and leaves
  the board that was on screen. Its wording, and whether it also says how
  long it has looked, are open.
- **One deal, not two.** The deal-ahead for a type just chosen and the deal
  the player is waiting for are the same board; the waited-for one should be
  the deal already under way where there is one.
- **A type whose deal was stopped is not dealt ahead again unasked**, as a
  fruitless one is not (`DealAhead.fruitless`).

## What is known and what is not

- **Not known: what a reload does mid-deal.** If the chosen type is saved
  before its first board arrives, a reload deals it again and the page comes
  back to the same wait. Find out first; it decides whether this is urgent.
- **Not known: whether any deal fails by memory in a browser.** None did in
  node under a 2 GB heap, at up to eight times the menu's size.
- **Sokoban's `MAX_DEAL_AREA` and Seismic's `MAX_CELLS_SEISMIC` are bounds of
  the other kind, on wait alone.** Once a deal can be stopped, ask of each
  whether it still earns its refusal. A bound on what cannot be dealt at all
  (Seismic's fill) stays.
- A hint or a Solve that searches has the same shape (`_hintPending`'s
  comment says why it was left). Out of scope here, and worth one sentence in
  the design on whether the same worker arrangement would serve it.

## What would show it worked

In the browser: a Mathrax 9x9 at its top tier, or a Bricks 16x20 at Normal,
asked for from the Custom dialog; the board in play still takes moves while
the page looks; the way out returns to it at once; and asking again deals.
`npm run deal-walk` is unchanged by this and stays the instrument for where
the waits are.

## What was found (2026-10-06)

- **A reload mid-deal was never a trap.** Before this change, a Bricks 16x20
  asked for and the page reloaded three seconds in came back to the board that
  had been on screen, with its type: the page reopens the board it last
  showed, and that sets the type. So this was not urgent. The one page with no
  board to reopen is a link that names a type (`?type=`), which waits again on
  every load; its Stop deals the game's first preset.
- **The board in play is given back untouched**: its moves, the type chip and
  the type the next New game deals. Stopping uses what a deal that found no
  board already did (`Midend.returnToBoardType`).
- **Bricks at "Normal" is the tier this app calls Unreasonable**, and a 16x20
  of it came back in a few seconds when asked for here, against no answer in
  a minute in the walk. Pearl 15x15 Easy was the board the checks ran on: it
  never came back in the time any of them waited.
- **A race worth its test.** A deal ahead that ended between a New game's look
  in the store and its wait beginning left the wait unserved where it had
  found nothing. `DealAhead.prepareNow` looks again for a waiting player.

## Decisions

- **No count of the time spent looking.** The words sit in a live region, and
  one that changes every second is read out every second.
- **The words moved out of the hint's place**, to under New game on the rail
  and a strip of their own above the phone's bar. The board in play takes
  hints during a wait, and a hint written over the words took Stop with it.
- **A waited-for deal now pays for starting a worker**, which the board's own
  thread did not. Measured on the production build on this machine: 60 ms,
  six runs of 58 to 64. Keeping one worker alive between deals would remove
  it, at the cost of a second copy of every game held for the whole visit;
  declined, since a type pays it once and has boards kept from then on.
- **Sokoban's and Seismic's bounds both stay**, and neither is for wait alone:
  each says at its constant what a stoppable deal changed about its reason.
- **A hint or Solve that searches is not served by this arrangement as it
  stands.** A deal needs only the type; a hint needs the position, and its
  plan lives in the engine that plays the board, so a second worker would
  have to be sent the game and send a plan back. `_hintPending`'s comment
  still holds.
- **One board can be thrown away**: where the type is changed during a wait
  and no New game follows, the board found for the type left is dropped and
  the wait goes on for the new one. Keeping it would need its deal time,
  which a board handed to a waiting player does not carry.
