# What each menu became

Applied 2026-10-05. A game not listed here already had the shape and was left
alone. Deal times are three deals a cell on a loaded machine (load average
about 20), so each is an upper bound.

## Changed

| Game | Before | After | Why |
| --- | --- | --- | --- |
| Solo | 18 lines, five sizes, X and Jigsaw on several | 12: 2x3 at Easy to Tricky, 3x3 at all six tiers, one board each of X, Jigsaw, Killer | The cap. 2x2, 3x4 and 4x4, 2x3 Hard, and the X and Jigsaw combinations are a Custom away. |
| Ascent | 14 lines under "Ascent" | 10: the two rectangles at four tiers, Honeycomb Normal, Hexagon Normal | The cap; a second kind of board takes one line. |
| Loopy | Squares at three tiers, by tier | Squares 7x7 and 10x10 at all four tiers; the two Penrose tilings moved under "More..." | Tricky was on no line. |
| Boats | Four sizes, 6x6 and 8x8 skipping Tricky | 6x6, 8x8, 10x10 at all four tiers | A gap in a board's tiers. 10x12 with a fleet of five is a Custom away. |
| Unequal | Nine and three lines, no Easy or Unreasonable | Twelve and nine: each mode a grid, the small sizes stopping at Hard (at Tricky in Adjacent) and 7x7 starting at Tricky | Two tiers were on no line. Every cell deals in under 0.4 s. |
| Group | Seven lines, two of five tiers | 7: 6x6 at Easy and Normal, 8x8 at Easy to Tricky, 12x12 Normal, one board with the identity hidden | Easy was on no line. Hard and Unreasonable stay off, ledgered in the rule test. |
| Mathrax | Nine lines, no Unreasonable | 11: 5x5 and 6x6 at every tier, 7x7 to 9x9 at Normal | A tier was on no line. 8x8 Unreasonable took 6 s and 9x9 155 s. |
| Towers | Seven lines, corners cut | 12: 4x4, 5x5, 6x6 at every tier | Every cell deals in under 0.5 s. |
| Undead | 7x7 without Unreasonable | 9: three sizes at every tier | 0.2 s. |
| Map | 25x30 at two tiers | 8: both sizes at every tier | Under 0.1 s. |
| Magnets | 9x10 without Easy | 9x10 Easy added | Under 0.1 s. |
| Unruly | 8x8, 10x10, 14x14 with corners cut | 12: 6x6 at Easy and Normal, the other three at every tier, one unique board | The owner asked for 6x6; a modifier takes one line. 6x6 Tricky deals, and is left off for the cap. |
| Net | Five sizes, each also wrapping | Five sizes and 7x7 wrapping | A modifier takes one line. |
| Twiddle | Two orientable boards | One | A modifier takes one line. |
| Bridges | Nine lines, loops always allowed | A tenth: 10x10 Normal, no loops | A modifier takes one line. |
| Guess | Standard, Super | A third: Standard with duplicates forbidden | A modifier takes one line, and three boards. |
| Keen | Two multiplication-only lines among the tiers | One, last | A board's tiers are one run of lines. |
| Dominosa | By tier, then order | By order, then tier; the same twelve | A board's tiers are one run of lines. |
| Salad | Easy boards, then Normal | Each shape's Normal after its Easy; the same fifteen | A board's tiers are one run of lines. Its Normal presets stay. |
| Fifteen | 4x4 | 3x3, 4x4, 5x5 | Three boards. |
| Sticks | 7x7, 10x10 | 5x5 first | Three boards. One 13x13 deal took 7 s. |

## A fast deal is not an honest one

Filling a corner needs two measurements, and the first cut of this change
took only the deal's time. `difficulty-contract.test.ts` then failed Group's
new 6x6 Tricky, whose boards need Normal. Every preset of the eleven tiered
games changed here was then dealt three times and its lowest solving cap
compared with its tier. Five cells came out below their label and are not on
any menu: Group 6x6 at Tricky and Hard, Group 8x8 at Hard, and Adjacent 5x5
and 6x6 at Hard (two boards of three). The Custom dialog still deals all
five, which is `deal-the-tier-a-custom-size-asks-for`.

## Left as they were, with a cut

- **Tracks**: five sizes, the two non-square ones without Tricky. Every cell
  deals in under 0.4 s; the cut is the cap.
- **Keen**: 6x6 at every tier, 4x4, 5x5 and 9x9 at one. The cap.
- **Dominosa**: order 6 at every tier. The cap.
- **Netslide**: wrapping on three lines, as the hardest of the three levels
  its menu names at each size. The rule test ledgers it
  (`MODIFIER_ON_EVERY_SIZE`).

## What still deals a configuration a menu stopped offering

Every cross-game sweep deals from `dealtBoards`
(`engine/testing/presets.ts`): the menu's slice, and then every value of a
checkbox or a choice that no preset holds, on the first preset that accepts
it. No change above removes a value: each modifier still has a line, and the
menus that changed gained tiers.

What a menu no longer offers is a size, or a combination:

- Solo 2x2, 3x4 and 4x4; Jigsaw with X; X and Jigsaw at Hard. The cross-game
  sweeps keep X, Jigsaw and Killer on a line each and the size's two ends
  (2x3 and 3x3); nothing deals the three dropped sizes as presets any more.
- Boats 10x12 with a fleet of five. `boats-hint.test.ts` keeps both of those
  boards in its own list, by params.
- Ascent's Honeycomb and Hexagon at Tricky and Hard, Net and Twiddle's larger
  wrapping and orientable boards, Group's hidden identity at Tricky. The
  slow tier walked these as presets and no longer does; the per-commit slice
  never did, since it takes a modifier or a kind on the smallest board that
  holds it.
