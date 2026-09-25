# walk-map-chains-by-color

## Why

Owner playtest, 2026-09-25, after `dot-map-chains-first`: with the dots in
place the chain step was "much better", but its final deduction still carried
too much load. "Each numbered region loses the color the one before it takes" is
a rule the player has to run. The owner's own reading of the board named a
pattern instead: regions 1 to 4 are each red or one other color, red has to
alternate along them, so region 1 or region 4 is red, and the highlighted region
touches both.

Measured over 228 chain steps on 120 Tricky boards, that pattern (every numbered
region carrying a dot of the struck color) is 30 of them. The other 198 have no
single-color pattern, and there the load comes from the same place: an abstract
rule where the colors could simply be named.

Also from the playtest: the fourth map color, called "purple", is pale lavender
in light mode and dusky violet in dark; neither reads as purple.

## What changes

- A chain whose every region has a dot of the struck color is told as the
  pattern: "Every numbered region has a red dot. If region 1 isn't red, region 2
  must be, and so on every other region to region 4. Either way region 1 or
  region 4 is red, and this region touches both, so …". That shape always ends on
  an even region, so the sentence is true whenever it fires.
- Any other chain is walked by color, up to five regions: "If region 1 isn't red,
  it's teal, so region 2 is violet and region 3 is red. Either way …". Past five
  (13 steps in 120 boards), the walk states the rule and names where it ends.
- The walk the sentence names is the walk the code takes: the plan throws if it
  does not end on the struck color, and `map-hint.test.ts` holds every named
  color to a dot of its region and to differing from the one before.
- `FOUR_NAMES` calls the fourth color "violet". Only Map's sentences read it.

Owner-approved. No saved data is affected.
