# The menus, measured

Taken 2026-10-05 from every registered game (57): `leafPresets(game)` for the
lines, `presetMenu(game)` for the sections, and each `paramConfig` item's
`get` over the lines for which fields a menu moves. The shapes in the second
half were sorted by reading all 57 menus, not by a rule.

## Length

Median 7, least 1, most 23.

| Lines | Games |
| --- | --- |
| 15 or more | Loopy 23, Solo 18, Ascent 17, Seismic 16, Salad 15 |
| 10 to 12 | Boats, Dominosa, Rome, Tracks, Unequal 12; Keen, Net, Singles 10 |
| 7 to 9 | Bridges, Light Up, Mathrax, Netslide, Pegs 9; ABCD, Clusters, Crossing, Magnets, Pearl, Twiddle, Undead 8; Flood, Group, Rectangles, Towers, Unruly 7 |
| 4 to 6 | Flip, Galaxies, Map, Mines, Mosaic, Signpost, Slant, Spokes, Tents 6; Black Box, Pattern, Same Game, Sixteen, Untangle 5; Bricks, Cube, Palisade, Range, Separate 4 |
| 3 or fewer | Filling, Inertia, Slide, Sokoban 3; Guess, Sticks, Subsets 2; Fifteen 1 |

The longest single list a player scrolls is not the longest menu. By section:
Solo 18 flat, Ascent's own section 14, Loopy 12 and 11, Boats, Dominosa, Rome
and Tracks 12 flat. Seismic's 16 is two lists of 8 and Salad's 15 is 9 and 6.

## How many sizes

A menu's length is mostly its number of sizes times its number of tiers. The
sizes alone, counted as distinct size words in the labels:

- **7**: Rectangles, Dominosa (orders 3 to 9).
- **6**: Mosaic, Crossing.
- **5**: Net, Pattern, Singles, Untangle, Sixteen, Mathrax, Salad.
- **4**: Rome, Clusters, Pearl, Seismic, Unequal, Keen, Boats, Tracks, Range,
  Palisade, Signpost, ABCD.
- **3 or fewer**: everything else. Three is the most common count.

## Shape, tiered games

**A grid: every size at every tier the menu offers.** Bricks 2x2, Bridges
3x3, Clusters 4x2, Galaxies 3x2, Light Up 3x3, Pearl 4x2, Rome 4x3, Seismic
4x2 in each ruleset, Singles 5x2, Slant 3x2, Spokes 2x3, Tents 3x2, Subsets
1x2, and the Rectangle rows of Ascent 2x4.

**A grid with corners cut: a small size stops short of the hard tiers, or a
large one starts above the easy ones.** Boats, Towers, Undead, Unruly, Tracks,
Mathrax, Unequal, Map, Magnets, Salad, Group, and Ascent's Honeycomb, Hexagon
and Edges rows (Normal and up). Whether each cut is the deal's cost or the
author's taste is not known from the menu; `bound-custom-sizes-by-their-deal`
has the method for telling.

**The author's pick, fitting neither.** Solo (sizes, three modifiers and six
tiers in one list of 18), Keen (one size carries all five tiers, with two
"multiplication only" lines among them), Dominosa (ordered by tier, then
order: seven orders at Easy and Normal, one at Tricky and Unreasonable),
Loopy (Squares as a 2x3 grid, then seventeen tilings at one size and Hard
each).

## Shape, untiered games

**A ladder of sizes and nothing else.** Rectangles 7, Mosaic 6, Pattern,
Sixteen and Untangle 5, Range 4, Filling, Inertia and Sokoban 3, Sticks 2,
Fifteen 1.

**Sizes by one other field, as a grid.** Net 5x2 (wrapping), Flip 3x2 (its
rulesets), Netslide 3x3 (named easy, medium, hard).

**Sizes with a second number that grows with them.** Mines, Black Box, Same
Game, Palisade, Separate, Slide.

**A list of kinds.** Cube (four solids), Guess (two named), Pegs (three board
types), Flood (five named, two more by colors), Twiddle, Crossing, Signpost,
ABCD.

## Tiers a menu does not offer

Group offers 2 of its 5 (no Easy, Hard or Unreasonable), Unequal 3 of 5 (no
Easy or Unreasonable), Loopy 3 of 4 (no Tricky), Mathrax 3 of 4 (no
Unreasonable). Every other tiered game offers every tier somewhere.

## Fields a menu never moves

Seventeen games have a Custom field no preset changes. The modifiers among
them: Bridges' loops, Guess's blanks and duplicates, Unruly's unique rows.
Light Up and Solo move symmetry between two of its values (of 5 and 8) only
as a side effect of size.

## Titles that are names

Flood's five allowance names, Guess's two, Netslide's nine and Subsets' two
are written by the game. Netslide's read "3x3 easy" in lower case beside the
catalog's "Easy", and are not tiers: "hard" is wrapping, and "easy" is a
barrier at every wall, both of which the label could say. Subsets' are its
label with "Size 4" added.
