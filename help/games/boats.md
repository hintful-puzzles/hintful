# Boats

You're given a grid, and a list of boats which must be located inside that grid. Boats can be rotated. Two boats cannot be horizontally, vertically or diagonally adjacent.

The numbers on the side indicate the amount of cells inside that row or column which are occupied by a boat.

Some boat segments are given (corner pieces, centers, or single-length boats), along with their orientation.

At the bottom of the puzzle is a list of every boat that must be placed in the grid. When a boat is found, it is automatically crossed off of this list. Make sure a boat is surrounded by water on all sides, to indicate that it cannot possibly grow any further.

This puzzle is best known as *Battleships*.

More information: https://www.janko.at/Raetsel/Battleships/index.htm

## Controls

Left-click to place a boat segment in the grid. Unknown boat segments are represented by a small rectangle, and will automatically change into the correct shape when the surrounding cells are filled in.

Right-click to place water, to indicate that a boat cannot be placed here.

To play with a keyboard, use the arrow keys to move the cursor. Press Enter to place a boat segment, and press Space to place water.

## Hints

**Hint** explains the next step rather than simply making it. It reasons from the numbers, the given segments and the boat segments and water you have placed, so it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first.

* **A small boat segment in the hint color** marks a square where the step places a boat segment.
* **Two wavy lines in the hint color**, like a given water square's, mark a square where it places water.
* **A ring** marks the squares it reasons from, such as a given segment, the rest of an unfinished boat, or the water that closes a square in.
* **Stripes** mark the row or column whose number it counts with, and the stripes run on through that number.

Boats never touch, not even at a corner, so a step that places a boat segment also shows the water that has to go round it. That water is part of the same step, and the sentence does not mention it each time. A *free* square, in the hint's words, is one still empty: neither a boat segment nor water. A *run* is a stretch of free squares in a row or column that a boat could lie along.

With **Remove numbers** on, some rows and columns have no number. When a step needs one anyway, it first says what that hidden number can only be.

A few ideas are worth learning by name:

* **A given end shows its boat's direction.** A boat's top end must continue downward and have water above it; a middle segment runs through, one way or the other.
* **A full row is finished.** Once a row has as many boat segments as its number, everything else in it is water; once its free squares are exactly as many as it still needs, they are all boat segments.
* **The fleet list counts too.** When every boat of some size is already placed, a square that would make another one, or make a boat longer than the largest still missing, must be water.
* On harder boards, **if this square were water**: the hint tries the other choice for a square and shows which rule it would break, such as a row that could no longer reach its number.

## Boats parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu. 

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>Fleet size</dt>
	<dd>The size of the largest possible boat.</dd>
	<dt>Fleet configuration</dt>
	<dd>Customize the fleet by entering a list of numbers. Each number indicates how many times a boat of a specific size appears. For example, the configuration <code>3,2,1</code> represents 3 boats of size 1, 2 boats of size 2, and 1 boat of size 3.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. Higher difficulties require more complex reasoning.</dd>
	<dt>Remove numbers</dt>
	<dd>When enabled, the difficulty is increased by hiding certain number clues.</dd>
</dl>

