# Report: the king's-move games described

Measured 2026-11-01 against `372d3c83` (HEAD before this change), in a
scratchpad worktree of HEAD and on the finished tree.

## Deals and hint walks

The trace (`research/describe/trace-latin.test.ts`) dealt three boards of
every preset of the thirteen games it knows and walked each by the hint's
first step.

- **The ten games this change does not describe are byte-identical to
  HEAD**, 28,263 lines. The compiler changes (the candidate cache emitted only
  where read, the two-sided sum bound, `within`) moved no deal, step or
  sentence of a Latin game, Unruly or Seismic.
- **Star Battle** dealt the same board on 56 of 57 deals; one 10×10 two-star
  Normal deal differs. Of the 53 walks on boards both trees dealt, 2 are
  identical and 25 more say the same sentences in another order. The rest
  differ in which unit a sentence names or how many squares one step takes,
  as the order moves: over all the walks the hint takes 587 trial-star steps
  against 536 and 273 full-unit steps against 277.
- **Mosaic** dealt a different board on 38 of 39 deals: Easy hides the
  numbers no solve reads, and which numbers the compiled ladder reads differs
  from what upstream's `solveCheck` read. Over the walks, 1,441 `met` steps
  against 1,315, 1,363 `needsAll` against 1,317, 232 `needsMore` against 191
  and 207 `sameNeed` against 160.
- **Clusters** dealt a different board on 29 of 33 deals: the prune now
  removes two neighboring dots of one color that the error bit used to keep
  (`design.md` § "Clusters"). 1,377 single-cell steps against 1,386, 21
  counting steps against 24.
- **No sentence form is new and none is gone.** With numbers masked, every
  sentence the tree's walks say is one HEAD's sentence code writes. The
  forms that appear on one side only are the same sentences in the singular
  or plural, or naming the other neighbor (left and right, upper and lower),
  on boards the other side did not deal.
- The trace walks the same number of boards on both trees, each up to its
  step limit or the hint's refusal, which a finished board and an
  Unreasonable one give alike; that the Easy and Normal walks finish is each
  game's hint test.

## Tiers

HEAD's corpus (`research/describe/tiers-described.test.ts`: 40 boards a tier
of every tier of the three games, 360 boards) regraded on the tree gives the
same verdict at every cap on every board. A corpus the tree deals has the
same tier mix as HEAD's: on both, the lowest cap that solves each board is
the tier it was dealt at.

## Saves and links

Desc and move encodings are unchanged, and every HEAD board grades as it
did, so every save and link loads and plays as before. What changes is
which board a seed deals, for Mosaic and Clusters nearly always, which the
plan allows (`describe-the-whole-catalog/design.md` § "Decisions made here").

## Soundness

Every technique of the three is sound at the checker's orders, and each
planted defect beside it comes out unsound
(`research/technique-check/results-describe-<game>.txt`).

- **Mosaic** at orders 3 and 4. `compared` at order 4 takes 8 minutes.
- **Clusters** at orders 3 and 4.
- **Star Battle** at order 4 and one star. No board of two or three stars
  has an answer at orders 3 and 4; those rest on the comparison with HEAD
  above.

The checker learned three things for Star Battle: `adj8` and `within`; a
`fill` of a set the marks decide, filled over every cell that may be in it,
with `before` over such a set; and building each first-binder group's query
as it runs, without which `crowdedRegion` exhausted node's heap.

## Speed

A deal and the first hint of every preset, ten seeds each, median and
worst in milliseconds, HEAD then the tree. A deal runs ahead in a worker and
is kept (`src/puzzle/README.md`), so New game seldom waits on one.

| Preset | Deal, HEAD | Deal, tree | Hint, HEAD | Hint, tree |
| --- | --- | --- | --- | --- |
| Mosaic 12×15 Normal | 16 / 37 | 31 / 72 | 1 | 1 |
| Mosaic 12×15 Unreasonable | 44 / 122 | 88 / 232 | 0 / 1 | 1 / 2 |
| Mosaic 20×25 Easy | 65 / 91 | 133 / 174 | 1 | 0 / 1 |
| Mosaic 20×25 Normal | 212 / 383 | 580 / 917 | 2 / 4 | 3 / 5 |
| Mosaic 20×25 Unreasonable | 343 / 592 | 1,358 / 1,946 | 2 | 3 / 4 |
| Mosaic 50×50 Easy | 8 / 14 | 8 / 59 | 6 / 7 | 2 / 3 |
| Star Battle 8×8 one star Normal | 95 / 247 | 144 / 909 | 1 | 2 / 3 |
| Star Battle 8×8 one star Tricky | 286 / 1,096 | 453 / 1,499 | 1 / 2 | 2 / 4 |
| Star Battle 9×9 two stars Easy | 36 / 144 | 103 / 426 | 2 / 3 | 9 / 39 |
| Star Battle 9×9 two stars Tricky | 193 / 679 | 297 / 1,043 | 3 / 4 | 5 / 6 |
| Star Battle 10×10 two stars Easy | 156 / 759 | 255 / 1,211 | 2 / 3 | 4 / 7 |
| Star Battle 10×10 two stars Normal | 329 / 1,201 | 602 / 2,485 | 2 / 4 | 5 / 9 |
| Star Battle 10×10 two stars Tricky | 808 / 1,338 | 1,425 / 2,338 | 3 / 4 | 7 / 9 |
| Clusters 7×7 Unreasonable | 282 / 741 | 30 / 244 | 1 | 1 |
| Clusters 9×9 Normal | 410 / 919 | 22 / 106 | 2 | 2 |
| Clusters 9×9 Unreasonable | 805 / 2,232 | 71 / 264 | 1 / 2 | 1 / 2 |

The other presets' median deal is under 100 ms on both trees, and their
first hint's under 15 ms. Clusters deals faster on every preset, by up to 18 times at 9×9
Normal, because the compiled rules write no error bit for the prune to
compare.

Mosaic was first 9 to 17 times HEAD at 20×25 and 60 times at 50×50. Four
changes brought it to the table's figures, each keeping every walk:

- **`within` keeps the last space it was asked of**, which saves two
  lookups a call; it was a tenth of a deal's time.
- **`compared` skips a pair with a decided block**, and **`alone` a number
  with none to need and none to spare**: neither can conclude anything there
  that `alone` has not, and the guard only removes bindings.
- **A recorded run may take every firing of a pass** (`CellMarks
  .wholePasses`). Easy's deal records which numbers its solve read; it did
  so a firing a pass, reading the whole board again for each. This changed
  which numbers an Easy deal hides, and so which boards a seed deals; the
  numbers a board keeps are HEAD's to within 3.4 on average (`mosaic-tier
  .test.ts` "keeps most of its numbers", now over ten boards rather than
  one, since one board's count varies by more than the margin).

What is left at 20×25 Unreasonable is the answer search: it deduces at
every branch, and on a stalled position `compared` reads every open pair
and fires nothing, where upstream's worklist read only the numbers beside a
change. A worklist for a compiled technique whose first binder is a clue is
an engine change of its own.

## The running app

These ran in Chrome against the dev server, with no console error:

- **Mosaic**, 10×10 Unreasonable: the first hint compared a 7 with a 4
  ("This 7 needs 3 more purple squares than this 4, so these squares outside
  the 4's block must be purple."), both numbers circled, both blocks
  outlined and the three squares ringed. A later step said "This 8 and this
  3 both need 2 purple squares, and the 8's all lie in the 3's block", the
  five squares of the 3's block outside the 8's ringed, which is right by
  hand. The walk ended at the refusal after 17 steps.
- **Star Battle**, two stars 10×10 Normal: the walk finished the board in 61
  steps. A trial-star step ringed the square, outlined the two squares of
  the column it would touch, and said the column would have room for 1 star,
  not 2.
- **Clusters**, 7×7 Normal: the walk finished the board in 38 steps and the
  win flash showed.

## What was declined

- **`Game.rulesOut` from the rules** (`design.md`): the compiled rules give
  what Star Battle crosses on every consistent board, but cross nothing on
  an inconsistent one, where the hand rule still crosses. Taking it would
  change how the aid behaves on that board, which is the owner's call.
- **A plan cap the engine owns**: ten games' hints and both skeletons now
  declare `PLAN_CAP = 24`. It is a refactor of its own.
