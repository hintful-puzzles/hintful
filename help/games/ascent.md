# Ascent

You're given a grid, with several numbers inside. Your objective is to place each number exactly once, so a path is formed from the lowest number (i.e. 1) to the highest number. Two numbers that are in sequence must be horizontally, vertically or diagonally adjacent.

The puzzle can be played on a rectangular or hexagonal grid. It's also possible to play on a rectangular grid while not allowing the path to move diagonally.

In the alternate game mode 'Edges', the grid is surrounded by numbers placed inside arrows. An arrow points to the row, column or diagonal where this number appears in the path.

This puzzle is invented by Gyora Benedek, and is known as *Hidato* (or the non-trademarked name *Hidoku*). Edges mode is an implementation of *1to25* invented by Jeff Widderich.

More information: http://www.janko.at/Raetsel/Hidoku/index.htm

## Controls

There are three ways to enter a number:

1. Click a number to highlight it, then click (or drag to) an adjacent cell to place the next number in the sequence. If the number just before it is placed and the one after is not, that is the one after; the other way round, the one before; and if neither is placed yet, the one after. Then click the highlighted number again to offer the one before instead, and once more to deselect it; or, once a number is placed beside it, click that square again for the one before, and once more to empty it. The arrow keys and Enter can be used to emulate mouse clicks.

2. Click an empty cell, then type a multi-digit number. To confirm a number, either press Enter, an arrow key, or click any cell.

3. In Edges mode, click and drag from an edge number, then release in an empty grid cell in the same row, column or diagonal.

To remove numbers, right-click or right-drag a number. Middle-click clears too.

It's also possible to draw a path while the numbers inside the path are still unknown. Left-click and drag across cells to draw a line, starting from an empty cell (a drag starting from a number places numbers instead). Right-click or right-drag to clear the line going through a cell.

If a path has only a single number, the endpoints will display one or two smaller numbers, which represent the numbers which are valid for this cell.

Where a cell has exactly two candidate numbers like that, right-clicking (on a touch screen, a long press) cycles through them instead of clearing — empty, then the lower number, then the higher, then empty again — so an either-or square can be tried both ways without typing. Middle-click still clears it outright.

## Hints

**Hint** explains the next step rather than simply making it. Every step places one number, and it reasons only from the numbers on the board and, in Edges mode, the arrows, so it carries on from wherever you are, as long as none of your numbers is wrong; if one is, it asks you to fix the highlighted mistakes first. Lines you have drawn are yours: the hint neither reads them nor draws any.

* **A ring** marks the square the step fills.
* **An outline** marks what it reasons from: the numbers the new one sits between, a dead end's one way in, or the squares a missing run has to step through.
* **Stripes** mark the row, column or diagonal an arrow points along, or every square a run of missing numbers can reach.
* In Edges mode, **an outlined arrow** is one the step reads.

When a step places the first number of a run and the rest of that run follows just as simply, the hint carries on through the run as one hint, a number at a time, each with its reason. And when the run has **only one route** between its two ends, the hint shows the whole run at once: a line in the hint's color from one end to the other, with every square on it ringed. Often a run is forced onto its route because some squares can be reached by no other run: those have to be on this run's route, or they would be left empty, so the hint stripes them. And sometimes a run could take several routes, but every one except one would cut a neighboring run off from its own ends: then the run must take the one that leaves room. In Edges mode, the arrows often leave a run only one route: when they are the reason, the hint says so and outlines them.

A *step* is one move to a neighboring square, so two numbers can be no more steps apart than they are apart in the sequence. That one idea gives most of the hint's reasons:

* **Next to its neighbors.** A number must sit next to the numbers just before and after it, so when only one empty square touches both, or the one that is placed, it goes there.
* **Within reach.** A number must be within as many steps of the nearest placed numbers below and above it as they are apart in the sequence: 10 is within 2 steps of 8 and within 3 of 13. When only one empty square is in reach of both, the number goes there. In Edges mode it must also be on its arrow's line.
* **Only one run can reach it.** A *run* is the missing numbers between two placed ones, like 14 and 15 between 13 and 16; the hint calls it "the run between 13 and 16". A run can only use squares close enough to both its ends: here, the steps to 13 and the steps to 16 add up to at most 3. So each run has an area it can reach, and an empty square inside only one run's area belongs to that run. Often only one other run comes close, and the hint names it and why it falls short ("the run between 41 and 43 can't, as this square doesn't touch 41"); when several do, it says that none of them reaches the square, and a look at the runs nearby shows why. Which number of the run it is follows the same way: only one is close enough to both ends ("3 steps from 67 and 2 from 72 rule out the rest"). When there are no counts to give, as for a run of a single number, the hint stripes the squares the run can reach and outlines its ends instead. The hint only names numbers you can see on the board, and the one it is placing.
* **A dead end.** A square the path can enter from only one neighbor must be an end of the path, so it holds 1 or the highest number. A neighbor is closed to the path when it is a wall, an arrow, or a number already joined to both of its neighbors in the sequence.
* In Edges mode: **where the lines cross.** Every missing number already has a line, its arrow's, and it must be within a step of the line of the numbers just before and after it, within 2 steps of the lines of those two away, and so on. So 12, on its column, must be within a step of 11's row and 13's row: where those cross its column, often only one square remains. The hint outlines the arrows it reads and stripes the lines of the other numbers.
* In Edges mode, on Tricky and Hard boards: **only one arrow still fits.** Only the missing numbers whose arrows point at a square can go there. When all but one of them are too far from a line or a number they must be near, the square is the last one's. The hint outlines every arrow pointing there and stripes the lines that rule the others out.
* On harder boards, and in Edges mode: **stepping through empty squares.** A missing run of numbers has to step from one placed number to the next through empty squares, one square per number, so walls and filled squares in the way stretch the distance. Sometimes only one square works for a number on any such route.

## Ascent parameters

These parameters are available from the ‘Custom…’ option on the ‘Type’ menu. 

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>Always show start and end points</dt>
	<dd>When enabled, the first and last number are always given. Disable this option for an added challenge.</dd>
	<dt>Symmetrical clues</dt>
	<dd>When enabled, all given numbers form a symmetric pattern. This usually leads to easier puzzles.</dd>
	<dt>Grid type</dt>
	<dd>Choose between 'Rectangle', 'Rectangle (no diagonals)', 'Hexagon', 'Honeycomb' and 'Edges' mode.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. Higher difficulties require more complex reasoning, and a puzzle always needs the difficulty you chose — it will never be solvable by the techniques of the level below.</dd>
</dl>

