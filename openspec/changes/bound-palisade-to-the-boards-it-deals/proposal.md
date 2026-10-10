# bound-palisade-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Palisade its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Palisade deals a board by dividing the grid into regions at random and
keeping the division only if the solver solves it with every clue showing.
`easyClues` in `palisade/solver.ts` says the solver "nearly always" does. It
does on the presets and it does not as the number of regions grows, and
`validateParams` has no bound on size at all. A player who asks for such a
board waits for 10,000 divisions to be thrown away, 30 seconds at 12x12 in
threes, and is then told the generator gave up. The Unreasonable tier starts
from an Easy board, so it fails the same way on the same boards.

Measured 2026-10-10: the share of random divisions whose full clues the
solver solves, and the time one division and one solver run take.

| Board | Regions | One division in | ms a division |
| --- | --- | --- | --- |
| 6x6 in 3s | 12 | 18 | 0.2 |
| 6x8 in 3s | 16 | 50 | 0.4 |
| 6x10 in 3s | 20 | 250 | 0.6 |
| 9x9 in 3s | 27 | none in 1,000 | 1.0 |
| 6x6 in 4s | 9 | 5.5 | 0.3 |
| 8x8 in 4s | 16 | 26 | 0.8 |
| 10x10 in 4s | 25 | 125 | 1.7 |
| 10x12 in 4s | 30 | 1,500 | 2.5 |
| 12x12 in 4s | 36 | none in 500 | 3.4 |
| 10x10 in 5s | 20 | 30 | 1.9 |
| 10x15 in 5s | 30 | none in 1,000 | 4.1 |
| 12x12 in 6s | 24 | 30 | 3.8 |
| 12x18 in 6s | 36 | 500 | 8.2 |
| 15x18 in 6s | 45 | none in 400 | 12 |
| 16x16 in 8s | 32 | 21 | 11 |
| 16x24 in 8s | 48 | 250 | 24 |
| 20x24 in 8s | 60 | none in 150 | 37 |
| 20x20 in 10s | 40 | 20 | 24 |
| 20x30 in 10s | 60 | 40 | 56 |
| 25x30 in 10s | 75 | 50 | 87 |
| 30x30 in 10s | 90 | none in 30 | 120 |
| 24x24 in 12s | 48 | 13 | 48 |
| 24x30 in 12s | 60 | none in 60 | 75 |
| 30x30 in 15s | 60 | 40 | 115 |
| 20x30 in 20s | 30 | 2 | 45 |
| 30x40 in 20s | 40 | 6 | 190 |

A thin board holds up longer than a square one of the same regions, so the
bound is not a number of regions alone:

| Board | Regions | One division in |
| --- | --- | --- |
| 2x30 in 3s | 20 | 83 |
| 3x30 in 3s | 30 | none in 500 |
| 2x60 in 4s | 30 | 18 |
| 3x60 in 6s | 30 | 67 |
| 4x60 in 8s | 30 | 20 |

The samples above 300 squares are small, and a rate read off fewer than five
successes is a guess. Two things bound a deal: how seldom a division is
kept, where regions are small, and how long one division takes, where the
board is large.

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Palisade
  does not deal in a few seconds, with a reason that names what to change:
  a smaller grid or a larger region.
- The retry cap on divisions is sized to the rarest board the bound admits,
  so that running it out is a defect and takes seconds.
- A pasted board of any size still opens.

## What to settle first

- **Whether there is anything to refuse** (added 2026-10-10 by
  `bound-range-to-the-boards-it-deals`, which was filed on this premise and
  drew no bound). A Custom size is not refused for its wait
  (`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
  its median"): a player can stop a deal. Refuse only a deal that throws,
  gives up, or hands over a board other than the one asked for, and fix a
  throw where it is thrown. A slow deal is made cheaper or left.
- **The shape of the bound.** It depends on the region size, the number of
  regions and how thin the board is. Sweep the shorter side at each region
  size from 3 to 12 before choosing between a table by region size and a
  rule on the expected time of a deal.
- **Not refusing what deals today.** 2x60 in fours deals at once and a bound
  on regions taken from square boards would refuse it. A board that deals
  today in a few seconds stays dealt; refusing one is the owner's call.
- **Whether the Unreasonable bound moves.** It is 180 squares
  (`MAX_UNREASONABLE_AREA` in `palisade/state.ts`), set by the time a deal
  takes at the presets' region sizes. Inside it, 9x9 in threes and 12x12 in
  fours never deal at either tier.

## Capabilities

### Modified Capabilities

- `palisade`: which sizes are dealt.

## Impact

- `src/games/palisade/state.ts` (`validateParams`), `solver.ts` (the retry
  cap), `palisade-tier.test.ts` and `palisade.test.ts`, `help/games/palisade.md`
  and `help/differences.md`.
