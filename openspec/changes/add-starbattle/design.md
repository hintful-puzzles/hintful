# Design: add-starbattle

Every figure here was measured on 2026-10-12 on this machine, with the
ladder as it stands in `src/games/starbattle/solver.ts`. Re-take one before
designing against it.

## What was decided before writing

- **The board is square**, sized by one number, since it has a region for
  every row. Params are `size`, `stars` and `diff`, written `10s2dn`.
- **The desc is the walls between regions and nothing else**, as
  `engine/wall-runs.ts` writes them for Rome and Seismic. The board has no
  clues, so there is no second half.
- **The family is "Placing objects"**, beside Tents and Light Up. The
  catalog's `collection` field gains a third value, `own`, for a game with no
  upstream; nothing but the upstream links read the field, and they show
  none for it.
- **The first click crosses out, the second puts a star.** A 10x10 of two
  stars has 20 stars and 80 empty squares, and a player crosses most of
  those out on the way, so the cross is the left button and the drag. This
  is how the puzzle is played where most people meet it (Queens). The right
  button, and a held finger, put the star first.

## The ladder, and what each tier means

Eight rungs, in the order the hint tries them:

| Rung | Concludes | Tier |
| --- | --- | --- |
| `around` | the cells touching a star are empty | Easy |
| `full` | the rest of a unit that has its stars is empty | Easy |
| `exact` | a unit with as many open cells as it needs stars has a star in each | Easy |
| `confined` | one row or column counted against the regions in it | Easy |
| `needed` | a unit has no room for its stars without this cell | Easy |
| `crowded` | a star here would touch too much of a unit | Easy |
| `banded` | several neighboring rows or columns counted against the regions in them | Normal |
| `starved` | a star here would complete a unit of its own and leave another without room | Tricky |

**Why the trial star is two rungs.** With the trial as one rung at Normal,
no board of two stars was Easy (0 of 100 at 8x8, 0 of 3 at 10x10): the first
move of a two-star board is nearly always "a star here would leave this
region room for one". Split by what the star rules out, a touch alone reads
one unit and is Easy, and every star count has all three tiers.

**Why band counting is Normal and the deep trial Tricky**, and not the other
way round: band counting reads only what is on the board, and the deep trial
asks the player to imagine a star and what it completes. Both orders deal;
the order chosen is the one puzzle guides teach them in.

**A trial is a Check**, in the terms of `docs/solver-and-generator.md` §
"Check, Tactic, Search": one star, what it rules out at once, one question
of one unit. It follows nothing further, so it is narrated directly.

**Each rung sweeps in a solve and fires once in a hint.** A solve with no
recorder runs a rung until it finds nothing before returning to the easier
ones. The boards graded were the same before and after the change (the tier
counts of 180 boards did not move), which is what the rungs being monotone
predicts.

## The generator

**A division dealt round random stars almost never has one answer.** With
the regions grown round the stars and nothing else, the ladder finished 79
of 300 boards at 5x5 with one star, 16 of 300 at 6x6, and none of 300 at
8x8, of 200 at 10x10, or of 156 at 10x10 with two stars.

**So the board is mended, a cell at a time.** Where the ladder stops, a
search over the ladder (`solvedPositions`, 24 positions) looks for a second
answer. If it finds one, a cell holding one of its stars, and none of the
dealt answer's, moves into a neighboring region: that region then has a star
too many in the second answer. If it finds none, a cell the ladder left open
moves, and the move is kept unless it leaves more cells open. The regions
stay connected and no smaller than twice their stars, and a board that has
not come right in two moves a cell is drawn again.

The mend is run with the ladder capped at the tier asked for, so it aims at
a board the tier's deductions finish, and `solvableAtExactlyTier` then turns
away one that came out easier.

**The game writes no division.** The regions are `growFromSeeds` on the
stars, and for two or three stars `mergeToCount` under the rule of the
archived design. What the game adds is the move of one cell between two
regions that are already there.

**Deal times**, a board, the mean over 12 to 40 draws:

| Board | Easy | Normal | Tricky |
| --- | --- | --- | --- |
| 5x5, one star | 2 ms | 25 ms | about 70 ms |
| 6x6, one star | 6 ms | 36 ms | 108 ms |
| 8x8, one star | 67 ms | 183 ms | 268 ms |
| 10x10, one star | 0.4 s | 0.8 s | 2 s |
| 8x8, two stars | 4 ms | 26 ms | none in 100 draws |
| 9x9, two stars | 0.1 s | 0.4 s | one in 30 draws |
| 10x10, two stars | 0.35 to 1 s | 0.8 to 1 s | 2 s |
| 12x12, one star | 3 s | 2 s | 11 s |
| 12x12, two stars | none in 12 draws | 5 s | 14 s |
| 12x12, three stars | 20 ms | none in 12 | none in 12 |
| 14x14, three stars | 7 s | none in 8 | none in 8 |

Three fifths to three quarters of a deal is the search for a second answer.

**What follows from the table.**

- The menu is 5x5, 6x6 and 8x8 with one star at every tier, and 10x10 with
  two stars at Easy and Normal. Tricky at 10x10 takes two seconds and is
  left to the Custom dialog.
- The size runs from 4 (one star), 8 (two) and 12 (three), below which no
  arrangement of stars exists, to 14, the largest measured.
- Nothing is refused for its tier. A cell that came up empty in the table
  (4x4 above Easy, 8x8 with two stars at Tricky, three stars above Easy) is
  left to the deal's deadline, as `docs/solver-and-generator.md` § "A size
  that cannot carry a tier" asks of a cell with no one-line reason.

## The hint

**The hint steps on marks.** A cell is open until it holds a star or a
cross, so the crosses a star gives are steps of their own. The other choice
was to read a blank cell touching a star as closed and narrate only the
deductions; it gives fewer steps and sentences a player cannot check against
the board ("has only 1 open square" beside three blank ones). The steps are
short and the board carries the state.

**Marks.** The squares decided are ringed. The one unit a step is about is
striped. A count of lines against regions stripes the lines and outlines the
regions, which are the two shapes `docs/hints-marks.md` § "Two regions in
one sentence take two mark shapes" gives two regions. A trial star outlines
the cells it rules out in the unit it leaves short, where it leaves any.

**The renderer keeps the marks in its own tile key**, and not in an
`OverlaySidecar`: the sidecar's `pack` asks the words for ringed notes, and
the warm-repaint guard then expects a game with no notes to paint one.

## What stands in for an upstream

`starbattle-generation.test.ts`: every preset and the smallest boards deal
at exactly their tier, every rung fires on dealt boards, and no region is
under size. `starbattle-hint.test.ts`: on dealt boards the hint's steps lead
to the answer the solver gives, each within 120 characters.
