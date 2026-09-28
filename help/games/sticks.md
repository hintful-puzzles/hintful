# Sticks

You are given a grid with several black cells. Fill every blank cell with a line, which connects two cell edges and goes horizontally or vertically through the center of the cell. The lines must follow these rules:

1. A number overlapping a line indicates the length of that line.
2. A line can't overlap more than one number.
3. Numbers in black cells indicate the amount of lines connected to the cell.

A line is connected to a black cell when it *runs into* it: a horizontal line
in the cell to its left or right, or a vertical line in the cell above or
below. A line lying alongside a black cell — a vertical line beside it, or a
horizontal line above it — does not connect to it, and can never come to.
That is why a black cell can run out of usable sides long before its number is
met.

This puzzle type was invented by [Nikoli](https://www.nikoli.co.jp/), and is known as *Tatebo-Yokobo*.

More information: https://www.janko.at/Raetsel/Tateboo-Yokoboo/index.htm

## Controls

To place a line, drag the mouse horizontally or vertically inside a cell.

To place a line without dragging the mouse, left-click to place a vertical line and right-click to place a horizontal line.

To play with a keyboard, use the arrow keys to move the cursor. Press Enter to place a vertical line, and press Space to place a horizontal line.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the numbers and the lines you have placed, so it carries on from
wherever you are, as long as none of your lines is wrong; if one is, it
asks you to fix the highlighted mistakes first.

* **A line in the hint color** shows the line the step asks you to place,
  running the way it must go: across for horizontal, up and down for
  vertical.
* **An outline in a second color** marks the cells the step reasons from:
  the cells a numbered line runs through or could still reach, or a black
  cell together with the lines already running into it or the cells beside
  it where one still could.

Every step rules one direction out and so leaves the other. The hint
names the square by its number when it has one ("this 2 must be
vertical"), and a black cell's number as "the black 2". The reasons it
gives are the rules: a line that would grow too long for its number, one
that would leave a number too little room to reach its length, one that
would join two numbers into a single line, one that would run into a
black cell that already has all its lines, and one that would close off a
side a black cell still needs, which the hint calls an *open side*. When
one number rules out several squares, the hint walks through them one at
a time as a single step.

## Sticks parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares, at least 2 each way.</dd>
	<dt>%age of black squares</dt>
	<dd>Rough percentage of black squares in the grid, from 5 to 100.</dd>
	<dt>Symmetry</dt>
	<dd>The pattern the black squares follow. <em>None</em> places them freely. <em>2-way mirror</em> makes the bottom half a mirror image of the top half, and <em>2-way rotational</em> makes the grid look the same turned upside down. <em>4-way mirror</em> mirrors top to bottom and left to right, and <em>4-way rotational</em> makes the grid look the same after a quarter turn, which needs a square grid.</dd>
</dl>

