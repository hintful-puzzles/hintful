# point-the-first-hint-beat-at-the-board

**Status: filed on the owner's word (2026-11-13), from a Netslide hint they
showed.** An engine finding, not Netslide's: Netslide is the first case found.
Player-visible, so its result goes to the owner before it is archived.

## Why

The Hint button's first beat shows one mark, "where to look"
(`archive/2026-11-09-show-where-to-look-first`). The engine picks it from the
step's marks by role: the evidence outline first, then stripes, and a step with
neither shows its ring.

That order assumes a stripe is evidence about the position. Where a game
stripes a line that is part of the puzzle's layout and never changes (Netslide
stripes the column or row that never slides, with a sentence that says "This
column never slides"), the first beat points at a fact that holds in every
position. The owner (2026-11-13): the first click "should always show something
that's specific to the board state".

The measurement that change took (2026-11-09, 5,506 steps) found stripes were
the first non-ring mark in 18% of steps. How many of those stripe a fixed fact
of the layout is not known.

## Since filing (2026-11-13)

`reword-the-netslide-hint` is archived: Netslide no longer stripes the fixed
line, and its first beat is the ring on the tile (the owner saw it in the
running app). So Netslide is no longer a case the census can find; it is the
sanity check that the census, run on the tree before that commit
(`git log` for `src/games/netslide/hint.ts`), would have found it. Plant the
old stripe back to see the new guard fail, and take the other games from the
census.

## The census (2026-11-13)

Over every hinting game's gate presets, up to 40 steps a board, each step
with a first beat: 4,982 steps, whose first beat is an outline in 3,297,
stripes in 442 and the ring in 1,243. The query is a throwaway vitest file
that walks the plan as `src/engine/hint-look.test.ts` does and groups
`whereToLook()`'s mark by game, rung and role, with an example sentence.
Every rung found (44 stripe-first, 204 outline-first) was read.

- **Its power**: run on the tree before `e483be152`, it lists Netslide's
  `frozenLine` stripe-first in 7 of 14 steps, with "This row never slides".
- **One case in today's tree**: Seismic's `singleton`, "This area is a single
  cell" over a striped area of one cell (2 steps). Fixed here: the cell is
  ringed and the sentence says it ("This cell is an area by itself, so it can
  only be 1.").
- **Every other stripe** is the scope of a claim about what the line holds
  now ("No other cell in this row can be 2", "This row already has its one
  boat square"). Galaxies' `mirrorWall` outlines the board's edge, a layout
  fact, but never as its first beat: the dot it names first is one element.
- **Pearl's `square`** ("This white pearl sits on the board's edge") is a
  deduction from the layout alone, but its first beat is the pearl the line
  is drawn at, not the fact.

## No guard: why (2026-11-13)

What the proposal asked for was a guard that reads the rule off the step. No
property of a step separates Netslide's old stripe from a Sudoku row's: both
are a set of squares fixed by the layout, both hold the step's target, and
both recur across a board's steps. What differs is the claim made about
them, which only the sentence says. A guard keyed on a set's recurrence or
on the words would be a heuristic that misconvicts the rows of every Latin
game, or a scan of prose. So the rule binds where a game author chooses a mark: in the
role itself. The `engine-hints` requirement on the roles defines stripes as
the line or region whose contents the step reasons from (it was "the line or
region the sentence names"), and a fact of the layout takes no role.
`docs/hints-marks.md` § "Hatch the line the sentence names" says to read
each rung that stripes. The role table's unread `means` and `noun` copies in
`hint-words.ts` are deleted, so the definition has one home.

The owner (2026-11-13), asked between this and dropping stripes from the
first beat (the outline, else the ring; 442 steps would point at the cell
rather than its row): either, whichever works best across the catalog, and
no acceptance needed. Kept stripes in the first beat: a row is the better
nudge, and the role's definition is one standard every game already shares.

## What Changes

- **A rule**: a step's first beat shows something that depends on the board's
  position. A mark that is true of every position of the puzzle is not
  eligible, and is not drawn on the first beat. When nothing else is eligible,
  the first beat shows the ring on what the step decides.
- **A census, as a query**: over every hinting game's gate presets, the
  steps whose first-beat mark is a set of squares that is the same in every
  position of that game (a fixed line, a source, a border). Count them and
  take the sample size that would have found one (`docs/method.md`).
- **The fix is in the game's marks, not the rule's order**, where the census
  finds one: a fixed fact is not a stripe, and the sentence that named it
  loses the clause (`standardize-hint-vocabulary` decides the words; Netslide's
  own sentence is `reword-the-netslide-hint`).
- **A guard that derives its population**: every game with a `hint()` is held
  to the rule, so a new game cannot ship a structural stripe as its first beat.

## What it must not become

A per-game list of exempt games or marks. The rule is about what a mark
depends on, and the guard reads it from the step, not from a name.

## What it touches

The engine's choice of the first-beat mark (`src/engine/midend.ts`
`lookFirst`, and the helper `show-where-to-look-first` added), the role
definitions in `src/engine/hint-words.ts`, `docs/hints-marks.md`, the
`engine-hints` spec, and each game the census finds.

## Acceptance

The census is written and its count stated. No game's first beat is a mark
that holds in every position. The owner sees the Netslide first click land on
the tile it moves, in the running app.
