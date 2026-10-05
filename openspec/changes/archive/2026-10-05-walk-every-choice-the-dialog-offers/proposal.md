# walk-every-choice-the-dialog-offers

**Status: implemented (2026-10-05).** A follow-up from
`fix-salad-number-ball-hint-throw`.

## Why

Every cross-game guard that deals a board dealt it from a game's presets
(`engine/testing/presets.ts`: `leafPresets`, and `axisSlice` for the per-commit
slice). A value the Custom dialog offers and no preset holds was therefore
dealt by none of them, and that is where Salad's hint threw on 71 of 1,195
Normal boards with the whole suite green.

The population, taken 2026-10-05 by reading each registered game's
`paramConfig` against its `leafPresets` (a `"boolean"` or `"choices"` item, and
each of its values no preset holds): **54 values in 27 fields of 16 games**.

- **A whole difficulty tier**: Loopy Tricky; Mathrax Unreasonable; Unequal
  Easy and Unreasonable; Group Easy, Hard and Unreasonable.
- **A rule or mode**: ABCD without diagonal touching; Ascent's rectangle
  without diagonals, and symmetrical clues; Boats with numbers removed;
  Bridges without loops, and with 1, 3 or 4 bridges a direction; Guess with
  blanks, and without duplicates; Mathrax with each of its six clue kinds
  switched off; Tracks allowing consecutive 1 clues; Unruly with unique rows
  and columns; Same Game's second scoring system (no hint).
- **A generator's taste**, 28 of the 54: Bridges' island and expansion
  percentages, and the symmetry choices of Light Up, Solo and Sticks.

The scaffold counted the fields (27) and called them the population; the
values are what a guard has to deal, and there are twice as many. The census is
a test now and should be read there, not here.

## What Changes

**The guards deal every one of them, with no list.** `unofferedValues` finds
each value of a closed-set field that no preset holds and writes it onto the
first preset, in menu order, that `paramsError` accepts it on. `dealtBoards`
is the slice of the menu (or all of it) and then those boards, and
`gatePresets` calls it. A game is dealt on everything its dialog offers by
having a `paramConfig`.

Five sweeps that sliced the menu for themselves now call it too:

- `desc-error-games` and `candidate-reading`, which called `axisSlice`.
- `firing-replay`, which read every leaf.
- `mistake-invariant`, which **keyed on tier alone**, the key
  `presets.ts` records as having twice named one axis of several. It dealt no
  mode at all: no Killer grid, no Adjacent clue set, and one board of an
  untiered game whatever its menu varied. Its own comment said a clue
  structure "varies by tier and mode". It takes every tier and mode on the
  smallest board now, and no large one, for the reason it already gave.

**ABCD's menu gains one preset**, "6x6 Easy, 5 letters, no diagonal". The rule
against diagonal touching needs five letters and every ABCD preset had three
or four, so no preset accepted the value and nothing but a preset could reach
it. It deals in 25 ms or less at every size tried from 5x5 to 8x8, and the
hint solved all 24 boards walked. This is the one player-visible change here.

## The decisions

- **A walk, not a preset, for the tiers.** The scaffold called a preset "the
  plain case" for a tier. Menu length is under the owner's review
  (`review-preset-counts-across-the-catalog`, opened because Salad's had grown),
  and a preset added so that a guard has a board is a menu decision made for a
  test's sake. The walk gives the guards the board and leaves the menu to that
  review, which now says so.
- **No ledger of excused values.** The scaffold offered one for the
  generator's-taste values. Measured, Bridges (22 of the 54 values) cost 0.7 s
  across the nine guards before and 0.9 s after. A ledger would have saved
  nothing and been a second copy to keep true. The one ledger kept is
  `NO_BOARD`, for a value no preset accepts; it is empty and asserted exact.
- **Not built: treating a numeric dropdown as a line.** Bridges' percentages
  and bridge count are `"choices"` whose members are numbers, and the slice
  already takes only the ends of a numeric scalar. At 0.2 s for all of them
  there was nothing to buy.
- **`hint-frontier` still reads the menu.** It asserts a ratio over a game's
  boards taken together, so its population is part of what it measures;
  widening it moves the number without checking anything new.
- **The title of such a board is the preset's and the field**, "6x6 Normal,
  Difficulty: Hard": which preset it was written onto is what reproducing a
  failure needs, and the guards seed their deals from the title.

## What was measured

**The cost per commit is below what the box's load moves a run by.** The nine
guards that call `gatePresets`, summed test time, one run each, on a machine
15 GB into swap at load 6 to 40 (upper bounds; only ratios taken in one run
mean anything): 982 s before, 711 s after with 52 more boards a guard, so the
load moved the total further than the boards did. Within the runs, Bridges
went 0.7 s to 0.9 s and ABCD 0.7 s to 1.1 s, the second figure of each taking
in the three sweeps moved onto `dealtBoards` as well. A guard now deals the
hinting games 263 boards.

**The new boards found no fault in a game and two in guards.**

- `candidate-reading` threw on any refusal from a fresh board. Group's
  Unreasonable 6x6 refuses on the first request on 7 of 12 boards, with the
  collection's one wording for deduction running out, which is what that tier
  is for. The guard's sibling case twenty lines below already allowed it.
- `mark-all` needs a cell with two candidates to narrow, and the 4x4 Solo
  under 4-way mirrored clues had none on its seed. It deals up to eight boards
  for one.

**The power probe** (task 1.2). Each of the 24 tier and mode values a hinting
game has, on the first preset that accepts it and on the middle one, up to 150
boards or 30 s a shape, hint-guided play one recomputed step at a time: **48
shapes, 7,059 boards, no throw, and no refusal below a tier that allows trial
and error.** 150 boards meets a fault at Salad's lowest rate (one in fifty)
with probability 0.95. 45 shapes reached 150 and two more reached 142 and
143; the short one is Group Hard at 8x8, 24 boards (a fault at one in fifty
would show with probability 0.38), whose 6x6 reached 150. The three
Unreasonable tiers refused on 899 of 900 boards before solving. A separate
twelve boards of each read the refusal: the collection's one sentence for
deduction running out, every time.

The 28 generator's-taste values were not in that probe. They are dealt by
every guard, at one to five boards each.

**That this would have caught Salad's kind of fault** was planted, not argued:
a throw in Group's hint that only its Hard tier reaches turned ten cases red
in five guard files. Dropping the new boards from `dealtBoards` turns the
census red naming all 53, and writing onto the preset where a copy belongs
turns two unit cases red.

## What replaces the manual test

`docs/games/testing.md` told a game whose menu stops short of a value that it
"owes that value a test of its own". It no longer does.

## Compatibility

None to break. A preset is a menu entry; no saved game or shared ID names one.

## Hints to pull in

None. Every game named here but Same Game has its hint.

## What would show it worked

`hint-enrollment.test.ts`, "every choice the Custom dialog offers is dealt":
recomputed from `paramConfig` and the dealt boards, with a count of what it
looked at and five boards named by the params they carry.
