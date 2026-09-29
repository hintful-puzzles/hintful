# Dominosa

Tile the rectangle with dominoes (1×2 rectangles) so that
every possible domino appears exactly once (that is, every possible
pair of numbers, including doubles).

## Controls

{{controls}}

Aim a click between the two numbers, nearer their shared edge than the
middle of either; the keyboard's cursor moves by half a square, so it
rests on those edges. Dominoes light up red if two identical ones
appear on the grid.

A new domino replaces any dominoes it overlaps, and clears the lines around it. A line can only go between two squares that are not part of a domino.

Right-click the middle of a square, or type a number, to highlight every square showing that number; up to two numbers can be highlighted at once, and doing it again turns the highlight off.

The reference panel lists every domino in the set, marking the ones you have placed and flagging any placed twice. Pick one to highlight where on the board it could still go.

## Hints

**Hint** explains the next step rather than simply making it. It reasons from the dominoes you have placed and the lines you have drawn between numbers, so it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first. A *spot*, in its words, is a pair of neighboring squares a domino could cover.

{{hint-marks}}

When one reason rules out several spots, the hint shows them one after another, saying "for the same reason" rather than repeating it.

A few ideas are worth learning by name:

* **A square with one neighbor left** must pair with it.
* **A domino with one spot left** must go there.
* **Each domino is used once.** A domino here that would force a second copy of itself somewhere else can't go here.
* **Every remaining spot overlaps.** If every spot left for some domino covers the same square, that square is taken, and no other domino can go there.
* On harder boards, **odd regions**: a domino that would cut the empty squares into regions with an odd number of squares can't go there, because dominoes can't fill them.

On an Unreasonable board the hint may stop and say that nothing further follows by deduction. On an Ambiguous board, which has more than one solution, it says the solution can't be determined, and gives no hint.

## Dominosa parameters

{{parameters}}
