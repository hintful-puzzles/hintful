# bound-separate-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Separate its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Separate deals a board by dividing the grid into regions at random, filling
each with the letters, and refilling the letters the solver did not use until
the solver solves the board or stops making progress (`easyBoard` in
`separate/generator.ts`). A division that never gives a solvable board is
thrown away for another, up to 10,000 of them. Upstream's Separate is
unfinished and never had a size bound, and `validateParams` has none beyond
26 letters. Outside a small set of sizes the solver almost never solves a
fill. A player who asks for such a board waits for 10,000 divisions to be
thrown away, 12 seconds at 8x8 with eight letters and about three and a half
minutes at 20x20 with two, and is then told the generator gave up. The
Unreasonable tier starts from an Easy board, so it fails the same way on the
same boards.

Measured 2026-10-10, 30 deals a board at the real cap of 10,000: the
divisions tried for each board dealt, and the time a deal took.

| Board | Divisions a deal | ms a deal | Worst of 30, ms |
| --- | --- | --- | --- |
| 4x4, 4 letters (preset) | 3 | 1 | 2 |
| 6x6, 3 letters | 15 | 4 | 20 |
| 6x8, 3 letters | 39 | 18 | 58 |
| 5x5, 5 letters (preset) | 64 | 14 | 31 |
| 6x6, 4 letters (preset) | 117 | 36 | 75 |
| 4x4, 8 letters | 433 | 93 | 668 |
| 8x8, 2 letters | 585 | 356 | 1,899 |
| 8x6, 4 letters | 586 | 279 | 1,046 |
| 5x8, 5 letters | 855 | 347 | 2,442 |
| 7x4, 7 letters | 968 | 330 | 1,016 |
| 6x6, 6 letters (preset) | 1,867 | 742 | 2,960 |

And 10 deals a board with the cap lowered to 300 divisions, which shows where
a deal stops being likely at all. "Gave up" is of the 10.

| Board | Gave up at 300 | ms for 300 divisions |
| --- | --- | --- |
| 9x9, 3 letters | 5 | 350 |
| 8x8, 4 letters | 9 | 260 |
| 5x6, 6 letters | 9 | 100 |
| 8x4, 8 letters | 9 | 160 |
| 9x4, 9 letters | 9 | 250 |
| 10x5, 5 letters | 10 | 180 |
| 6x7, 6 letters | 10 | 160 |
| 7x6 and 7x7, 7 letters | 10 | 190, 230 |
| 8x5, 8x6 and 8x8, 8 letters | 10 | 200, 260, 380 |
| 3x6, 9 letters | 10 | 95 |
| 10x10, 4 or 5 letters | 10 | 530, 560 |
| 12x12, 2, 3 or 4 letters | 10 | 880, 1,020, 1,030 |
| 15x15, 3 letters | 10 | 2,400 |
| 20x20, 2 letters | 10 | 6,600 |

8x8 with eight letters gave up at the real cap six times in six. No board
that gave up ten times in ten at 300 has been tried at 10,000 except that
one, so the second table says where to look and not where the bound is.

Two things bound a deal: how seldom a division gives a solvable fill, which
falls with the number of letters and with the number of regions, and how long
one division takes, which grows with the board (the solver keeps a table of
every pair of squares).

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Separate
  does not deal in a few seconds, with a reason that names what to change:
  a smaller grid or fewer letters.
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
- **The shape of the bound.** It depends on the number of letters, the number
  of regions and perhaps how thin the board is, which nobody has swept.
  Sweep the shorter side at each letter count from 2 to 9 before choosing
  between a table by letter count and a rule on the expected time of a deal.
- **Whether the largest preset stays.** 6x6 with six letters takes 0.7 s to
  deal on average and 3 s at worst, the slowest board on any menu here that
  is not marked as slow. Upstream's presets are these four. Dropping or
  replacing one changes the menu, which is the owner's call.
- **Not refusing what deals today.** A board that deals today in a few
  seconds stays dealt; refusing one is the owner's call.
- **Whether the generator can be made to reach further**, which is a
  different change: a division chosen for the fill, or a fill chosen for the
  solver, in place of throwing 1,800 divisions away. (Added 2026-10-10 by
  `bound-palisade-to-the-boards-it-deals`: for Palisade it was this change
  and not a different one. Its divisions come from the same
  `divvyRectangle`, each was thrown away for a fault in a few neighboring
  regions, and dividing those again deals every size with no bound drawn:
  `docs/games/solver-and-generator.md` § "Unlucky, impossible, and
  load-bearing validation", and `palisade/generator.ts`. Count what
  Separate's thrown-away divisions are thrown away for before a bound.)

## Capabilities

### Modified Capabilities

- `separate`: which sizes are dealt.

## Impact

- `src/games/separate/state.ts` (`validateParams`), `generator.ts` (the retry
  cap), `separate-tier.test.ts` and `separate.test.ts`,
  `help/games/separate.md` and `help/differences.md`.
