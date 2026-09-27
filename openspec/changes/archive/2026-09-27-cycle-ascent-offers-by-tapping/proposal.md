## Why

Owner, on a phone (2026-09-27): with 10 selected and neither 9 nor 11 placed,
there was no way to place a 9 beside it. The only route was a right-click, a
long press on touch, which the owner did not find and did not want: "I prefer
not to require a long tap there; cycling seems more intuitive to me … it's just
about the 'ghost' placements next to an existing cell."

## What Changes

- A second tap on a selected number whose two neighbors in the sequence are both
  missing makes the ghost placements around it show the number below instead of
  the one above; a third tap deselects. It acts on the release, so a drag
  starting on the selected number places what it offers.
- A tap or drag that placed the number above in a square leaves that square
  cycling on the next taps: the number below, then empty.
- A long press that cycles a square to empty keeps the number beside it
  selected, so the next long press starts the cycle again.

## Impact

- `src/games/ascent/ui.ts`, `ascent.test.ts`, `help/games/ascent.md`,
  `docs/games/input.md`.
- Spec: `ascent`. Shipped in the commits before this change was written; this
  records the rule.
