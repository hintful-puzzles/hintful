# bound-signpost-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Signpost its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Signpost deals a board by growing a chain through every square from both ends
at random (`newGameFill` in `signpost/generator.ts`), which fails where the
walk boxes itself in and is tried again up to 10,000 times, and then by
adding and removing given numbers with a solver run for each. Both grow
steeply with the board, and `validateParams` has no bound on size at all. A
player who asks for a large board waits several seconds and is then, often,
told the generator gave up.

Measured 2026-10-10 at Easy with the ends in the corners (free ends are the
same within a tenth): mean time for a deal, and how many gave up.

| Board | Squares | Deals | Gave up | s a deal |
| --- | --- | --- | --- | --- |
| 12x12 | 144 | 8 | 0 | 0.06 |
| 15x15 | 225 | 8 | 0 | 0.23 |
| 16x16 | 256 | 8 | 0 | 0.35 |
| 20x20 | 400 | 7 | 0 | 1.8 |
| 22x22 | 484 | 4 | 2 | 3.4 |
| 24x24 | 576 | 3 | 2 | 5.9 |
| 25x25 | 625 | 2 | 1 | 7.2 |
| 30x30 | 900 | 2 | 2 | 10.4 |
| 40x40 | 1,600 | 1 | 1 | 22.6 |

A thin board costs more than a square one of its area, since an arrow on a
long line has more squares to lead to and each solver run walks them:

| Board | Squares | Deals | Gave up | s a deal |
| --- | --- | --- | --- | --- |
| 9x25 | 225 | 8 | 0 | 0.29 |
| 7x30 | 210 | 8 | 0 | 0.29 |
| 5x45 | 225 | 8 | 0 | 0.47 |
| 3x75 | 225 | 8 | 0 | 0.75 |
| 1x225 | 225 | 6 | 0 | 2.3 |
| 10x50 | 500 | 2 | 0 | 6.3 |
| 5x100 | 500 | 3 | 0 | 6.7 |
| 2x250 | 500 | 1 | 0 | 18.6 |
| 1x500 | 500 | 1 | 0 | 47 |

The samples past 400 squares are of one to four deals, and a rate read off
them is a guess. Which of the two steps gives up, the fill or the strip, was
not separated.

The Unreasonable tier has its own bound already (225 squares and 30 on the
longer side, `MAX_UNREASONABLE_AREA` and `MAX_UNREASONABLE_SIDE` in
`signpost/index.ts`), set from its own times, so this change is about Easy.

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Signpost
  does not deal in a few seconds, with a reason that names what to change.
- The retry caps are sized to the rarest board the bound admits, so that
  running one out is a defect.
- A pasted board of any size still opens.

## What to settle first

- **Whether there is anything to refuse** (added 2026-10-10 by
  `bound-range-to-the-boards-it-deals`, which was filed on this premise and
  drew no bound). A Custom size is not refused for its wait
  (`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
  its median"): a player can stop a deal. Refuse only a deal that throws,
  gives up, or hands over a board other than the one asked for, and fix a
  throw where it is thrown. A slow deal is made cheaper or left.
- **The shape of the bound.** Time depends on the area and on the longer
  side. Sweep the shorter side from 1 to 25 with at least five deals at
  every size the bound will admit, and separate the fill's give-ups from the
  strip's time, before choosing between an area with a side and a rule on
  the expected time of a deal.
- **Not refusing what deals today.** A 20x20 board deals every time in under
  two seconds. Refusing a board that deals today in a few seconds is the
  owner's call.
- **Whether the fill can be made to reach further**, which is a different
  change: a walk that backs out of a dead end in place of starting again.

## Capabilities

### Modified Capabilities

- `signpost`: which sizes are dealt.

## Impact

- `src/games/signpost/index.ts` (`validateParams`), `generator.ts` (the retry
  caps), `signpost-tier.test.ts` and `signpost.test.ts`,
  `help/games/signpost.md` and `help/differences.md`.
