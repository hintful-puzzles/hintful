# offer-solos-small-board-at-every-tier

## Why

Solo's 2x3 (6×6) board is offered at **Normal and nothing else**, so a player
who prefers the smaller grid has one difficulty and a player who wants a harder
puzzle has to take a bigger one. Owner, 2026-09-20: *"I found myself really
enjoying LinkedIn's 2x3 sudoku, and think it would be useful for us to have more
types of it."* Board size and difficulty are independent axes and the menu
should let a player pick both; upstream's menu offers the small board at one
tier, and this is a deliberate divergence in the player's favor.

**Measured 2026-09-20 before proposing**, 20 seeds per tier on an otherwise idle
machine, because "can it?" is the whole question:

| preset | min | median | p90 | max | graded off-tier |
| --- | --- | --- | --- | --- | --- |
| 2x3 Tricky (`DIFF_INTERSECT`) | 0 ms | 134 ms | 339 ms | 637 ms | 0 / 20 |
| 2x3 Hard (`DIFF_SET`) | 99 ms | 1762 ms | 3274 ms | 3503 ms | 0 / 20 |

Every board graded back at exactly the tier it asked for, so the existing
"uniquely solvable at exactly the requested difficulty" requirement holds at
this size with nothing added. A 6×6 has fewer places to hide a `set` deduction
than a 9×9, which is why Hard costs roughly fifty times what 3x3 Hard does
(5–132 ms) — a generator retry count, not a failure.

## What changes

Two presets, `2x3 Tricky` and `2x3 Hard`, inserted after `2x3 Normal` so the
menu keeps its size-ascending order. Titles derive from the params as every
Solo preset's does, so neither spells a tier name out.

**The one real decision is what this does to the gate**, and it is not
cosmetic. `hint-resume.test.ts`'s `walkedPresets` takes, in the gate slice,
**the first preset of each tier** — so inserting a 2x3 Tricky and a 2x3 Hard
ahead of the 3x3 ones switches the board the cross-game hint guards walk for
those two tiers from a 9×9 to a 6×6, on every guard that slices by tier, at
five seeds each. That is a coverage change nobody asked for, arriving as a side
effect of a menu edit, and this change SHALL state the cost it measured and
what still covers the configuration it moved off.

## What this does not do

- **Not Extreme or Unreasonable at 2x3.** Both generate (measured: ~30 ms and
  ~300 ms, and they grade honestly), so this is menu economy rather than
  feasibility — the owner asked for Tricky and Hard, and a longer menu is their
  call, not a decision to make while implementing.
- **Not a change to the tier slice.** If the swap turns out to cost too much,
  the honest fixes are a cheaper preset order or a slice that keys on size as
  well as tier — both bigger than this change, and neither justified until the
  measurement says so.
