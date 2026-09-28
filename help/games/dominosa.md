# Dominosa

Tile the rectangle with dominoes (1×2 rectangles) so that
every possible domino appears exactly once (that is, every possible
pair of numbers, including doubles).

## Controls

Click between two adjacent numbers to place or remove a domino.
Right-click to place a line between numbers if you think a domino
definitely cannot go there. Dominoes light up red if two identical
ones appear on the grid.

A new domino replaces any dominoes it overlaps, and clears the lines around it. A line can only go between two squares that are not part of a domino; right-click it again to remove it.

Right-click the middle of a square, or type a number, to highlight every square showing that number; up to two numbers can be highlighted at once, and doing it again turns the highlight off.

To play with a keyboard, use the arrow keys to move the cursor onto the edge between two squares. Press Enter to place or remove a domino there, and Space to place or remove a line.

The reference panel lists every domino in the set, marking the ones you have placed and flagging any placed twice. Pick one to highlight where on the board it could still go.

## Hints

**Hint** explains the next step rather than simply making it. It reasons from the dominoes you have placed and the lines you have drawn between numbers, so it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first. A *spot*, in its words, is a pair of neighboring squares a domino could cover.

* **A ring round two squares** marks the spot the step is about: where a domino must go, or where one can't.
* **A thick line in the hint color** between those two squares is a line the step asks you to draw, saying no domino goes there.
* **Outlined squares** are the ones the reason rests on, such as a square with only one neighbor left to pair with, or the spots left for a domino.

When one reason rules out several spots, the hint shows them one after another, saying "for the same reason" rather than repeating it.

A few ideas are worth learning by name:

* **A square with one neighbor left** must pair with it.
* **A domino with one spot left** must go there.
* **Each domino is used once.** A domino here that would force a second copy of itself somewhere else can't go here.
* **Every remaining spot overlaps.** If every spot left for some domino covers the same square, that square is taken, and no other domino can go there.
* On harder boards, **odd regions**: a domino that would cut the empty squares into regions with an odd number of squares can't go there, because dominoes can't fill them.

On an Unreasonable board the hint may stop and say that nothing further follows by deduction. On an Ambiguous board, which has more than one solution, it says the solution can't be determined, and gives no hint.

## Dominosa parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Maximum number on dominoes</dt>
	<dd>The highest number that appears on a domino. The set runs from 0–0 up to this number doubled, one of each, so a maximum of <em>n</em> gives a grid <em>n</em>+1 squares wide and <em>n</em>+2 tall. It must be at least 1.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle; see <a href="../features#difficulty">what the names mean</a>. Ambiguous is this game's own extra setting: the board is not checked for a unique solution, so it may have several, and any tiling that uses every domino once counts as solved. On the smallest sets (a maximum of 1 or 2) the harder settings are capped at what that set can support.</dd>
</dl>
