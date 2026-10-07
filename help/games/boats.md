# Boats

You're given a grid, and a list of boats which must be located inside that grid. Boats can be rotated. Two boats cannot be horizontally, vertically or diagonally adjacent.

The numbers on the side indicate the amount of cells inside that row or column which are occupied by a boat.

Some boat segments are given (corner pieces, centers, or single-length boats), along with their orientation.

At the bottom of the puzzle is a list of every boat that must be placed in the grid. When a boat is found, it is automatically crossed off of this list. Make sure a boat is surrounded by water on all sides, to indicate that it cannot possibly grow any further.

## Controls

{{controls}}

Unknown boat segments are represented by a small rectangle, and will automatically change into the correct shape when the surrounding cells are filled in.

Drag along a row or column to fill every square it passes over the way the first one changed. Hold Ctrl while moving the cursor to place boat segments on the empty squares it passes over, Shift to place water, or both to empty them.

## Where the puzzle comes from

This puzzle is best known as *Battleships*.

More information: https://www.janko.at/Raetsel/Battleships/index.htm

## Hints

**Hint** explains the next step rather than simply making it. It reasons from the numbers, the given segments and the boat segments and water you have placed, so it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

Boats never touch, not even at a corner, so a step that places a boat segment also shows the water that has to go round it. That water is part of the same step, and the sentence names it without saying why each time. A *free* square, in the hint's words, is one still empty: neither a boat segment nor water. A *run* is a stretch of free squares in a row or column that a boat could lie along.

With **Remove numbers** on, some rows and columns have no number. When a step needs one anyway, it first says what that hidden number can only be.

A few ideas are worth learning by name:

* **A given end shows its boat's direction.** A boat's top end must continue downward and have water above it; a middle segment runs through, one way or the other.
* **A full row is finished.** Once a row has as many boat segments as its number, everything else in it is water; once its free squares are exactly as many as it still needs, they are all boat segments.
* **The fleet list counts too.** When every boat of some size is already placed, a square that would make another one, or make a boat longer than the largest still missing, must be water.
* On harder boards, **if this square were water**: the hint tries the other choice for a square and shows which rule it would break, such as a row that could no longer reach its number.

## Boats parameters

{{parameters}}

