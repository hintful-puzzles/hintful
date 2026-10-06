# bound-custom-sizes-by-their-deal

**Status: done (2026-10-06).** A follow-up from
`strengthen-the-sokoban-solver`. The diagnostic is built and was run across
the collection, Sokoban and Salad are settled, and the other games it
convicted are **not** bounded one by one: § "What was done, and what was not"
says why, and `let-a-player-stop-a-deal` carries them.

## Why

Sokoban's Custom dialog takes any size from 4 up (`paramConfig`, `bounds:
{ min: 4 }`). Measured 2026-10-04, under load, eight deals a size: a deal
took 0.7 s on average at 20×24, 2.2 s at 24×30, 3.0 s at 30×30 and 9.9 s at
40×40, where it gives up on seven deals in eight and deals a level the hint
may not reach. Before `strengthen-the-sokoban-solver` bounded the loop, the
40×40 deal did not end in minutes.

That is one game, measured because its solver was being worked on. Whether
other games offer a Custom size whose deal is slow, or never ends, has not
been measured: this proposal claims only that nothing in the tree asks.
docs/games/solver-and-generator.md § "Bound a generator by its tail, not its
median" gives the method, game by game; nothing runs it across the
collection.

**A second game, found 2026-10-05 by `fix-salad-number-ball-hint-throw`, and
at a small size, not a large one.** Salad's Number Ball at Normal is a
rejection loop behind a tier gate, and how thin the tier is depends on the
shape. Dealt from fixed seeds on a loaded machine, a minute a shape:

- 4x4 with 3 numbers: **6 of 21 seeds ran to the 50,000-attempt bound and
  threw**, about ten seconds each. The other 15 dealt.
- 5x5 with 3: 21 boards in the minute, about 3 s each.
- 6x6 with 3: 39 in the minute. 6x6 with 4: 66. 7x7 with 4: 39.
- 5x5 with 4: 150 boards in under 3 s. Letters at Normal, every shape from
  4x4 to 7x7: under half a second a board.

So the diagnostic below should deal *every* shape a dialog allows, the small
ones too, and at every tier: a size is not the only field a deal's cost
follows. For Salad the question is whether 4x4 Number Ball has a Normal tier
worth offering at all, which is a params refusal or a generator that finds
those boards directly, and either is the owner's to weigh
(`salad/generator.ts`'s header says a better generator for the mode is still
unwritten).

## What Changes

- A diagnostic, never a gate: for each game, deal a few boards at sizes past
  its largest preset, counting in the generator's own units where it has
  them and in time otherwise, and report where the tail leaves a second, and
  whether it fails by time or by memory.
- For each game it convicts, the bound goes in `validateParams`, with the
  measurement beside it. Sokoban's is the first.
- A size a player already has in a saved game or a shared ID keeps loading: a
  bound on what the dialog deals is not a bound on what a desc may be. That is
  the owner's to confirm before any bound that would refuse one.

## What would show it worked

A table of every game's largest size that deals within a second, taken on an
idle machine, and a params check in each game the table convicts.

## What was done, and what was not

Everything here was measured 2026-10-06 on a machine that was not idle: load
3 to 4, half a gigabyte free and nine of ten gigabytes of swap in use. The
times are that machine's.

**The diagnostic is `npm run deal-walk`** (`scripts/deal-walk.ts`, and
`scripts/checks/deal-walk.test.ts` for the sizes it deals). Each game is dealt
in a watched process, since a deal that never returns can only be stopped
from outside, and the first version of the watcher is why that is worth
saying: it killed a walker for the age of a state file the walker had not yet
had time to rewrite, and started it again for ever. Its report is
`metrics/deal-walk.md`. It times deals and does not count tries: a generator's
own units are in its own code, and the Sokoban and Salad counts below were
taken there.

**Which fields have no upper end** (task 1.1) was read from every game's
`paramConfig` items. Of the games with a size field, the ones that declare a
maximum for it are Ascent, Black Box, Boats, Galaxies, Group, Keen, Magnets,
Mathrax, Mines, Singles, Slide (its width), Solo, Towers, Unequal and
Untangle; the rest declare none, and several of those are bounded in
`validateParams` instead (ABCD, Crossing, Seismic, Undead, Slide), which the
walk shows as refusals.

**What the walk found**, in 57 games:

- No deal ran out of memory under a 2 GB heap, and none threw anything but
  its retry bound.
- Quick out to eight times the menu's largest: Fifteen, Sixteen, Netslide,
  Twiddle, Mines, Map, Guess, Cube, Black Box, and Flip with crosses.
- A retry bound that runs out, which the player is told in a sentence:
  Filling at 20x26 and up, Tracks at 30x30 Tricky and up, and one deal each at
  the top of Galaxies, Magnets, Samegame, Separate and Signpost.
- In most of the rest a ladder passed ten seconds a board or gave no answer
  in a minute, mostly between 1.5 and 4 times the menu's largest size, and at
  a different size for each tier and each choice field. The report has each.
- **Mathrax, 9x9 at its top tier**, which is inside the range its field
  declares: one deal in the walk gave no answer in a minute, and dealt again
  it gave none in ten. Twelve more deals of that cell took 7 seconds on
  average with the slowest at 36, and one more gave no answer in 45; an 8x8
  was half a second and never over 2. So its mean is under the half-minute
  line and it stays dealt, with a tail no bound of ours ends.

**Sokoban** (2.1). Its deal was never slow: what falls with the area is how
often the hint's search finishes a level, 74 in 100 at 16x20 down to 3 in 100
at 40x40, and with eight levels a deal at every size a 30x30 was dealt
unchecked one time in two. A deal now generates five times the mean number of
levels its area needs (`dealTries`), which leaves every menu size its eight
and so its boards. The mean deal is 12 seconds at 30x40 and 30 at 40x40, and
`MAX_DEAL_AREA` refuses past 1200 squares when a level is to be dealt.

**Salad's 4x4 Number Ball at Normal** (2.2a). 29 deals in 80 ran the 50,000-try
bound out, which is a board once in 49,000 tries and nine seconds. That is
under the half-minute line `deal-the-rare-tiers-other-games-refuse` drew the
day after this was scaffolded, so the shape is dealt and its bound is 250,000.
It was the owner's call when written; that line made it.

**No refusal here refuses a board a player has** (2.3). Both sit behind
`full`, so a saved game or an ID that carries its desc loads at any size, and
a link naming only the type is told the limit.

**The other games are not bounded** (2.2), and that is a decision, not a
remainder. A refusal per convicted cell would be some hundreds of numbers:
Loopy alone is 72 ladders ending at sizes from 8x10 to 60x60. They would be
this machine's, wrong on a phone in one direction and on a faster desk in the
other. And a table bounds only what was counted, where the Mathrax cell was
dealt quickly three times by the tier walk before it was dealt for ten
minutes. What a player waiting on such a deal lacks is a way to stop it, and
that is one change to the page and none to a game:
`let-a-player-stop-a-deal`.
