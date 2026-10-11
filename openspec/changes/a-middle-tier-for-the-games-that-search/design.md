# Design

Measured 2026-10-11 through `solver.ts` itself. What it says of the code was
true that day.

## D1: The engine's tiers take a count, and the two-tier names stay

`searchTiers(deductions)` gives the names, the tier of Unreasonable, the
difficulty field and the contract. `DIFF_UNREASONABLE`, `SEARCH_TIER_NAMES`,
`searchTierItem` and `searchTierContract` are `searchTiers(1)`, so eleven
games are not edited and there is one definition.

- The contract asks the game `deductionFinishes(state, cap)` below
  Unreasonable. A game with one deduction ignores the cap.
- `searchTierSegment` reads the tiers off the game's own difficulty field and
  writes each by the first letter of its name: `eu` as before, `enu` with a
  Normal. It throws where two names share a letter, which the scale's first
  five and Unreasonable do only at "Extreme".
- The cross-game guard that held such a game's tiers to the two names holds
  them to `searchTiers` at their own count, deals Unreasonable at the game's
  top tier, and requires that some game has a third, so that the count is
  exercised.

Not built: a deal for the middle tier in the engine. One game has one, and
it is that game's strip with another question asked of it.

## D2: Normal is an Easy board hidden further, graded a rung a tier

- **The deal** takes an Easy board, tries its clues again in random order,
  and keeps a clue hidden while the whole deduction still finishes the
  board. The board is kept where a comparison was needed. Hiding never makes
  a board easier, so a comparison needed once is needed on the board kept.
- **The grade is one run of the deduction** (`deductionTier`): it compares
  only where no number decides anything alone, so a comparison made is one
  needed. The generator and the contract both read it.
- **Without aggressive generation only as many clues are tried as the
  shorter side is long.** Stopping at the first clue whose loss asks for a
  comparison, as the Unreasonable deal stops at its first, left a 50x50
  board one number short of an Easy one.
- **The bound on aggressive generation, 900 squares, is the tier's too.** The
  refusal names the tier asked for.

A deal, and the steps that compare two numbers on the board dealt, median:

| Board | Aggressive | Not |
| --- | --- | --- |
| 3x3 | 1 ms, 1 step | 1 ms, 1 |
| 5x5 | 1 ms | 0.5 ms, 2 |
| 10x10 | 5 ms, 7 | 1.4 ms, 7 |
| 25x25 | 0.4 s, 74 | 26 ms, 95 |
| 30x30 | 0.9 s | |
| 35x35 | 2.2 s | |
| 50x50 | | 0.16 s, 161 |
| 100x100 | | 1.3 s, 466 |

Every board dealt in those runs graded as Normal, at 3x20 and 4x20 as well.
A 10x10 Normal board shows a median of 38 numbers against an Easy one's 42.

**What a saved board loads as.** An Easy pin on a board that needs a
comparison rises to Normal, which only a pasted board can be, since Easy
never dealt one. A Normal or Unreasonable pin is kept where the board solves
at it.

## D3: The menu is twelve lines

10x10, 15x15 and 25x25 at every tier, and 3x3, 5x5 and 50x50 at Easy alone.

- A section holds twelve lines, and Rectangles, Crossing and Net each offer a
  size at fewer tiers for the same reason. Raising the bound for every game
  to fit one was not weighed further.
- 3x3 and 5x5 lose Unreasonable from the menu, where they had it for a day.
  On 30 of 40 such 3x3 boards and 16 of 60 at 5x5 the hint has nothing to
  say from the start, and their Normal boards have a comparison or two.
- 50x50 loses Unreasonable from the menu. It is the one size dealt without
  aggressive generation.
- Each is dealt at any tier from the Custom dialog, and a board saved at one
  still opens.

**For the owner to turn round**: which sizes carry the three tiers.

## Seen in the app

- The menu: three sizes at three tiers between three at Easy.
- A dealt 10x10 Normal board followed by its hint to "COMPLETED!": the first
  comparison is its twenty-seventh step, "This 7 still needs 3 more purple
  squares than this 4, and only 3 of its empty squares are outside the 4's
  block, so these squares must be purple", with both blocks outlined and the
  three squares ringed, and eight steps compare in all.
- `5x5de:0b4c4b4a6a3d3a2c`, a board that needs a comparison under an Easy
  pin: it opens as "5x5 Normal".

## What the engine would have had to offer

Nothing more than D1. With the count in place a second game's middle tier is
that game's deal and menu.
