# settle-the-cells-the-tier-walk-still-lists

**Status: done (2026-10-06).** What
`deal-the-tier-a-custom-size-asks-for` measured and did not fix. The four
games that dealt below the tier asked are settled, a generator that gives up
is answered and not thrown, and every cell under "The generator gave up" has
been counted and refused, budgeted for, or left to a run-out with its count.
"What was done" below has the detail, and "Left to a run-out" the remainder.

## Why

That change built the tier walk (`scripts/checks/tier-walk.test.ts`) and
converted the ten games whose generator settled for a lower tier at a size it
could name in a line. The walk, run over every tiered game on 2026-10-05 at
three deals a cell, still lists the cells below. Each was dealt from a fixed
seed, so each is found again by running the walk for that game.

### Dealt below the tier asked

- **Map.** A board with few regions for its size, or many, is dealt at Easy
  whatever was asked: `map/generator.ts` gives up on the tier after fifty tries
  where `n < 9 || n > (2 * wh) / 3`. Listed below their tier at Normal, Tricky
  and Unreasonable: `3x3n6`, `4x4n7`, `5x5n8`, `2x20n30`, `15x2n30`,
  `15x20n5` to `n8`, `25x30n5` to `n8`, `3x30n75`, `25x3n75`, `25x4n75`. This
  is Unequal's shape (a count of tries, then a lower tier) on two parameters,
  so the refusal is a line through size and region count, and where the tier
  is rare and where absent has to be counted.
- **Bridges.** A board of three islands skips the tier gate
  (`st.islands.length > MIN_SENSIBLE_ISLANDS`): `3x3i30e10m2` at Normal and at
  Tricky came out Easy, with and without loops allowed.
- **Bricks.** A board of six squares or fewer skips it (`spaces > 6`): `2x2dn`
  asked Unreasonable and came out Easy.
- **Boats**, by reading, since its solver has no lowest cap for the walk to
  compare: `boats/generator.ts` drops `strip` and then the tier after
  `MAX_ATTEMPTS`, and throws only when the tier falls below zero.

### The generator gave up

A throw where a refusal belongs, or a tier too rare for its retry bound; which
one, cell by cell, is not known. A throw reaches the player as a crash.

- **Ascent**: `2x2` and `3x3` above Easy in three modes; `2x7`, `6x2` and
  `2x10` at Hard in the rectangular mode.
- **Bridges**: `4x4i30e10m2d2` (Tricky), with and without loops.
- **Galaxies** at Unreasonable: `3x3`, `4x4`, `4x7` on all three deals;
  `5x7`, `7x3`, `10x3`, `4x15` on one or two.
- **Keen**, multiplication only: `4dxm`, `4dum`, `5dxm`, `5dum`, `7dxm`,
  `7dum` on two or three of three; `8dhm`, `8dxm`, `8dum` on one. Also `3dnm`
  (Normal) on one deal in five, in a separate probe.
- **Light Up**: `2x2` and `3x3` above Easy; `4x4`, `2x10`, `10x2`, `14x2` at
  Unreasonable on one or two deals.
- **Magnets**: `3x6dt` (Normal), with and without strip clues.
- **Map**: `6x6n9`, `3x20n30`, `15x3n30` at Tricky and Unreasonable on most
  deals; `7x7n10`, `8x8n11`, `15x20n9`, `15x20n10`, `25x30n9` on one or two.
- **Salad**, **Solo** and **Spokes**: six, three and one cell; read them from
  the report.
- **Tracks**: `4x5dh` (Hard) on one deal in five, in a separate probe.

## What is known and what is not

- **Three deals convict a cell that fails and clear none that passes.** A cell
  that gave up once in three is a rate near one in three; a cell that did not
  may still fail one deal in ten.
- **The walk's sizes are a sample**: each numeric field alone and all of them
  stepped together, from the field's minimum to the menu's largest. A game
  whose fields declare no minimum is barely walked: Clusters was dealt at 8
  cells and Subsets at 2.
- **Rare and absent need a count, not a run-out.** A 10,000-try bound comes
  back empty four times in five on a tier found once in 48,000
  (docs/games/solver-and-generator.md § "A size that cannot carry a tier").
- `keep-a-board-ready-for-the-next-deal` would change what a rare cell costs,
  and so which of these are refused.

## What Changes

Per game, once the cause is read and the cell counted: the pair refused in
`validateParams` with `noSuchTier` and pinned with `describeAbsentTiers`, or
dealt at its tier with a retry bound its tail fits under.

The walk itself gains what it lacked here: a size for a game whose fields
declare no minimum, and Boats, which needs a comparison its non-monotone
solver can make.

## What was done

- **Bricks.** The gate no longer skips boards of six squares. `2x2` at
  Unreasonable is refused (none in 2,300,000 boards); `2x3` and `3x2` deal.
- **Bridges.** The gate no longer skips three-island boards. The tier follows
  the island count (`islandTarget`), and five families are refused on counts
  of 4 to 40 million: 3 islands above Easy; 4 at Tricky; 4 or 5 with one
  bridge a line at Normal; one bridge a line with loops and 100% expansion at
  Normal; 5 with two bridges a line and no loops at Tricky. The retry budget
  is islands placed, so a sparse board tries up to two million times: a 10x10
  of 5 islands at Tricky is found once in about 100,000. Grading the state the
  generator grew let about one board in a hundred through as Tricky that Easy
  solves; the cause was the solver, whose grade depended on island order, and
  `find-why-bridges-grades-a-grown-board-differently` fixed it there, so the
  read-back from the desc this change first added is gone again.
- **Map.** The fifty-try drop to Easy is gone. Refused as absent: under 8
  regions, or two squares wide, or a region to every square, above Easy; 8
  regions above Normal. Refused as too rare to deal: 8 regions at Normal, 9
  or 10 at Tricky and Unreasonable, three squares wide at Tricky. The retry
  budget is squares times regions. One frozen fixture recorded the drop
  (`10x10n8` asked Tricky, graded Easy) and keeps only its solver half.
- **Boats.** The ladder that showed hidden numbers and then stepped the tier
  down is gone. A fleet of one boat is refused above Easy (none in
  3,300,000). Other small fleets lack a tier with no line to name (two
  single boats on a 3x3 do, on an 8x8 they do not), and there the generator
  runs out.
- **A run-out is answered.** `Midend.deal` catches `RetryLimitExceeded`,
  keeps the board in play and its type, and returns `dealGaveUp`'s sentence,
  which the app shows from every control that deals (`puzzle/deal-actions.ts`).
  Before this the throw left the dealing spinner up for good. This is what
  every cell still listed below now does in place of a crash.
- **The walk** grades Boats, by lowest solving cap. `describeDealtTiers`
  pins cells that deal at their tier.

The rest was counted on 2026-10-06, each cell dealt with its retry bound
lifted for 15 to 90 seconds on a loaded machine, so a time below is an upper
bound. Each game's count is in a comment at its refusal or its budget.

- **Ascent.** Absent, in 40,000 to 800,000 tries a cell: a 2x2 above Easy on
  every grid; on the Rectangle, Normal at 2x3 and 3x3 and Hard on any board
  two wide; without diagonals, a 2x3 above Easy and Hard at 2x4 and 2x5; on
  the Honeycomb, Normal and Hard at 2x3, Tricky and Hard at 3x2, Hard at 4x2;
  on the Hexagon, a 2x3 above Easy and Normal at 3x3. The cells are a table
  (`lacksTier`): a 3x3 Rectangle has Tricky and Hard and no Normal, so no
  line through size holds. Edges had none missing.
- **Galaxies.** A 3x3 has no Unreasonable (none in 600,000 boards). The other
  cells were rare against a bound of 200 regenerations: once in 830 at 4x4,
  half a second away. The bound is now regenerations times squares. Its
  run-out was a plain `Error`, which the midend did not answer.
- **Keen**, multiplication only. Too rare to deal, at ten to thirty seconds a
  board: Hard and Unreasonable at 5x5, 7x7, 8x8 and 9x9, and Tricky at 9x9.
  A 4x4 and a 6x6 are found in a second or two and are dealt, as is a 3x3
  Normal, once the bound is tries times the cube of the width.
- **Light Up.** The cells were not rare by tries. The generator adds black
  squares after each twenty failures and stayed at 90% for the rest of its
  bound, where a small board has no tier above Easy, so one deal in ten of a
  4x4 Unreasonable gave up whatever the bound. The ramp now starts over at
  the top. Absent, at 5%, 20% and 50% black: a 2x2 above Easy, fewer than
  nine squares at Unreasonable, a 3x3 with any symmetry at Unreasonable and
  with 4-way symmetry at Normal, a 4x4 with 4-way mirror symmetry at
  Unreasonable. Too rare: that 4x4 with 4-way rotational symmetry.
- **Magnets.** A 3x6 has no board at the harder tier (none in 900,000),
  where a 3x5 and a 3x7 do.
- **Salad**, with 2 symbols at Normal. Absent on a Letters board smaller than
  8x8, which is clued on its border alone, and on a 3x3 and a 4x4 Numbers
  board; a 5x5 Numbers one is once in 36,000 tries and 48 seconds, and is
  refused as too rare. A 7x7 Letters Easy with 2 symbols is once in 42,000
  tries of forty microseconds, and the border-only bound was raised to it.
- **Solo.** A 4 Jigsaw has nothing above Tricky, with the diagonals or
  without (none in 220,000 to 370,000); with Killer cages it was not counted
  and is not refused. A 2 Jigsaw with Killer cages has no board at all (none
  in 4,850,000), which the walk reached only once it walked the rows field,
  after the run whose report is committed here: `metrics/tier-walk.md` still
  lists `2jka` as giving up, and the refusal is pinned in `solo.test.ts`.
- **Spokes.** A board of 8 squares or fewer has no Unreasonable (none in
  440,000 at 2x2 and in 100,000 at 2x3 and at 2x4). A 2x5 has them once in
  26,000 tries, a minute a board, and a 2x6 once in 4,100, half a minute:
  both are refused as too rare. A 3x3 is once in 140.
- **Tracks.** A 4x5 Hard is once in 6,500 tries of 44 microseconds. The bound
  on a small board is now tries times squares.
- **A run-out is the one class.** Galaxies was not alone: Inertia, Pattern,
  Separate, Undead, Black Box and `divvyRectangle` each ended a counted loop
  with a plain `Error`. All throw `RetryLimitExceeded` now, and
  `retry-bound.test.ts` refuses a `throw` standing straight after a loop that
  draws unless it is that class. It found the last two, which a search of the
  files named `generator.ts` had missed.
- **The walk** starts a field that declares no minimum at 1 (Clusters and
  Loopy; Subsets has one size, so its two cells were its whole population),
  and no longer takes an empty list field for a number.

## Left to a run-out

Counted, with no line found to name, or outside what this change measured:

- **Boats**: a three-boat fleet on a 3x3 (`3x3f2dn,2,1`) above Easy.
- **Light Up**: a 2x5 with 2-way rotational symmetry at Unreasonable, none in
  450,000 boards. It runs out in about four seconds.
- **Loopy**: a 3x3 and a 3x4 Penrose (rhombs) at Normal, none in 500,000
  boards over 50 patches, six seconds a run-out. The widened walk found it,
  and `count-loopys-smallest-penrose-boards` holds it.
- **Map**, timed 2026-10-05 under load: `3x30n75du` ran out on 3 of 3, ten
  seconds each; `25x30n11dh` on 3 of 6, four seconds a board when found;
  `10x10n85du` on 1 of 7 and `25x4n75du` on 1 of 8.
- **Salad**: Normal on a Numbers board is slow at every size past 5x5 (an
  8x8 with 2 symbols took 130 seconds once), and the walk leaves twenty of
  its cells out as slow. That is a question of time and not of tier, and
  `bound-custom-sizes-by-their-deal` holds it.
- **Spokes**: Unreasonable two wide past 2x6 was not counted, and the walk
  leaves those cells out as slow. A try there is seven milliseconds or more,
  so a run-out is over a minute; `bound-custom-sizes-by-their-deal` again.
- **What the walk does not deal**: a choice field as no preset has it (an
  Ascent grid, a Light Up symmetry) and a size between its steps (a 3x4).
  The cells beside each refusal here were counted by hand for that reason.

## Hints to pull in

None.

## What would show it worked

The walk over every tiered game lists no cell below its tier, and none that
gave up whose line can be named or whose tries are quick enough to budget
for. The cells left to a run-out are listed here with their counts.
