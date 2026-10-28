# Design

## Context

Map's Tricky rung, `weighRegion`, is Sudoku's XY- and XYZ-wing on a graph
(`teach-map-chains-with-marks` D2). The Latin games' top deductive tiers lost
their forcing chain on 2026-10-27 (`retire-hint-ordinals` D7) and rested on
set elimination alone. Measured 2026-10-28 on `85b02a8d`.

## D1. What a wing adds, per game (task 1.1)

A scratch census dealt 12 boards a preset at Unreasonable and at the top
deductive tier, with the wing on and off (the off path is HEAD's ladder):
how many Unreasonable boards the top tier finishes with the wing ("solves"),
on how many of their stalls it fires at all, and how many top-tier boards
dealt with the wing on need it. Times are a deal's median / max ms, off → on.

| Game, cell | Unr. solves / fires | Top needs wing | Top ms | Unr. ms |
| --- | --- | --- | --- | --- |
| Towers 4x4 Tricky | 4 / 6 | 10 | 197/1963 → 10/48 | 4/21 → 7/25 |
| Towers 5x5 | 2 / 3 | 8 | 42/99 → 19/50 | 5/13 → 8/33 |
| Towers 6x6 | 0 / 0 | 6 | 35/85 → 24/60 | 25/35 → 28/39 |
| Unequal 4x4 Hard | 4 / 4 | 11 | 17/108 → 5/19 | 3/11 → 7/16 |
| Unequal 5x5 | 0 / 0 | 7 | 23/67 → 10/37 | 3/15 → 4/19 |
| Unequal 7x7, Adjacent 5x5, 7x7 | 0 / 0 | 1, 2, 0 | unchanged | unchanged |
| Solo 2x3 Extreme | 5 / 6 | 12 | 1241/2883 → 29/115 | 28/90 → 60/246 |
| Solo 3x3 | 2 / 4 | 10 | 485/3871 → 111/194 | 39/104 → 66/175 |
| Solo 3x3 X | 0 / 0 | 11 | 219/536 → 48/80 | 70/214 → 124/345 |
| Solo 9 Jigsaw | 1 / 1 | 10 | 223/748 → 87/311 | 53/307 → 73/357 |
| Solo 3x3 Killer | 0 / 0 | 3 of 7 dealt | gave up 8 → 5 of 12 | 170/648 → 194/722 |
| Salad 4x4 A~C Normal | – | 12 | gave up 12 of 12 → 28/50 | – |
| Salad Numbers 5x5 1~4 Normal | – | 10 | 138/781 → 123/234 | – |
| Salad, six other presets | – | 0 or 1 | unchanged | – |
| Keen, five presets | 2 of 60 / 2 | 0 to 2 | unchanged | unchanged |
| Group 6x6, 8x8 Hard | 0 of 24 / 0 | 0 | 8x8: 7113 → 9522 | unchanged |
| Mathrax, five presets | 0 of 60 / 0 | 0 | unchanged | unchanged |

Where it fires, the generator strips clues as far as the wing reaches, so
most dealt top-tier boards come to need it, and they deal faster because the
top tier accepts more of what it builds. Unreasonable deals slower where its
boards must now beat the wing too. Group's 8x8 Hard slowed by a third before
the wing kept only the two-value units it can use as ends (`weighWing`'s
`around`), and Solo built every cell's seers on every call before it cached
them; D5 has the times after.

## D2. The rung (tasks 1.2, 2.1, 2.2)

`weighWing` (`engine/wing.ts`) is Map's `weighRegion` over a `WingBoard`:
units, a candidate mask each, and a symmetric "sees". Map's own function is
now that call with "touches" for "sees", and its tests and pins are
unchanged; the engine's test plants a dropped XYZ condition, which fails it
and five of Map's tests.

- **`latinSolver` runs it at `diffSet1`, after the single-number sets**, with
  "sees" as sharing a row or column. It is a Check, so it may define a tier
  below Unreasonable (`engine-hints`, "A hypothesis is classified as Check,
  Tactic or Search").
- **Solo runs it as the `wing` rung at Extreme**, after the digit sets, with
  "sees" as a row, column, block or X diagonal. A Killer cage is not counted:
  the sentence says "in a line or block", which a cage is not.
- **One firing strikes one cell.** A game's strike axis may group a firing's
  strikes by cell, by value or not at all, and the sentence says "this cell".
- **Salad's empty square is not a weighed value**: it repeats in a line, so
  "the middle is that, so the end is not" fails for it. A middle that could
  still be empty is skipped (`WingBoard.values`).

## D3. Where the wing goes (owner, 2026-10-28)

Offered: the wing at every one of these games' top deductive tier; only in
Towers, Unequal, Salad and Solo, by a switch in the Latin config; or a new
tier between the top one and Unreasonable, which changes the tier letters in
IDs. The owner chose **every game's top tier**. Keen, Group and Mathrax gain
a rung their boards seldom or never reach (D1), at no cost to dealing after
D2's two speedups.

**A board a player already has keeps its ID.** The wing only adds to a tier,
so a board dealt before still solves at its tier. An old Unreasonable board
the wing finishes opens as before, and its hint now teaches the wing where it
refused.

## D4. The hint (task 2.2)

`LatinWingReason` records the middle, the ends, the value and whether the
middle could be the value itself. `wingPremise` (`hint-text.ts`) words it
for every candidate game, as `confinedPremise` does a fish: "Whatever the
middle cell is, an end in line with this cell is 2, so the 2 must go", "it
or an end" for the XYZ shape. The middle and the ends are outlined and are
the whole premise, so under the implicit reading the walk writes their notes
first (Solo's pin: three note legs, then the wing). The longest measured is
Solo's XYZ at 117 characters.

- **The outline legends named a numbered chain**, which no hint has drawn
  since D7. Each now names "the middle cell" and "an end", which is also what
  lets the marks guard accept those references.
- **The help says what a wing is once**: `{{wing}}`, or `{{wing:square}}` in
  Salad, is `wingHelp` (`engine/wing.ts`), owed by a game whose `hintRungs`
  hold `"wing"`. The build and `help-coverage.test.ts` refuse a page that
  leaves it out or writes it without the rung.
- **Pins.** Towers, Unequal and Solo's scans found one. Keen's and Salad's
  were found on narrowed scans (4x4 Hard; 4x4 A~C Normal, which Salad's scan
  now keeps). Group and Mathrax list the wing as unreached, with D1's counts.

## D5. Cells that change, and dealing after (task 2.3)

The wing undoes two of D7's cell flips:

- **Unequal 3x3**: Hard deals again and Unreasonable is refused, as before
  2026-10-27. The generator found no 3x3 Unreasonable board in 400,000 tries
  (40 deals of 10,000), where HEAD deals one at once.
- **Salad 4x4 of three Letters at Normal** deals (12 of 12, median 28 ms) and
  its refusal goes.

`tier-walk` over the seven games, HEAD (in a worktree) and after, 3 seeds a
cell: no cell dealt below or above its tier in either. The refusals differ in
the two cells above only; Salad's two-symbol cells stay refused. "Gave up"
counts move by one or two deals either way (Group `6dx` 3 → 1, Solo
`3x2kade` 3 → 1, Keen `4dum` 1 → 2), within what three seeds say. The slow
cells' times move with the machine's load, both up and down, so the walk
cannot see D1's speedups; D1's medians are the measure.
