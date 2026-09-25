# dot-map-pairs-first

## Why

Owner playtest, 2026-09-25: a pair hint was confusing when one of the outlined
pair had no dots. "Both outlined regions can only be yellow or teal" was shown
for one of them and left, for the other, to be worked out from its neighbors
while reading the step. The owner's suggestion: "should we perhaps first deal
with the outlined region?" It is the defect `dot-map-chains-first` fixed for
chains, in the rung below.

## What changes

- A pair firing opens its journey the way a chain firing does: a leg per pair
  region that does not already show exactly its two colors, dotting them ("Its
  neighbors show red and violet, so this region can only be yellow or teal: dot
  those."), with the region ringed and the pair's other region outlined. Then the
  pair step, read off both regions' dots.
- The chain's dotting legs and the pair's are one helper (`premiseDots`), with
  each rung's own words.
- `map-hint.test.ts` holds both pair regions to showing exactly their two
  colors when the pair step is spoken.

Owner-requested. No saved data is affected.
