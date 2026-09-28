# Mines

Try to expose every square in the grid that is not one of the hidden
mines, without opening any square that is a mine.

The first square you open is guaranteed to be safe, and (by default)
you are guaranteed to be able to solve the whole grid by deduction
rather than guesswork. (Deductions may require you to think about
the total number of mines.)

If you think you've found a grid which can't be solved without
guessing, **think harder!** Mines was written in 2005, and since it
was written, I've had over 50 reports claiming that a grid had two
solutions, or required guessing at a safe square to
open. *None* of those reports turned out to be a real bug in
the game generation.

## Controls

Click in a square to open it. Every opened square is marked with
the number of mines in the surrounding 8 squares, if there are any;
if not, all the surrounding squares are automatically opened.

Right-click in a square to mark it with a flag if you think it is a
mine. If a numbered square has exactly the right number of flags
around it, you can click in it to open all the squares around it
that are not flagged.

Middle-clicking a numbered square does the same, and while you hold the button down it shows the squares around it that it would open.

To play with a keyboard, use the arrow keys to move the cursor. Press Enter to open the square under it, or, on a numbered square, to open the squares around it; press Space to place or remove a flag.

## Mines parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>Mines</dt>
	<dd>How many mines are hidden. Give a number, or a percentage such as <code>20%</code> of the grid's squares. There must be at least one, and at least nine squares without a mine, because none is ever placed in or next to the first square you open.</dd>
	<dt>Ensure solubility</dt>
	<dd>When this is on, the grid is laid out so that it can be solved by deduction from your first click onwards, without any guessing. It needs a grid more than 2 squares in each direction. When it is off, the mines are placed at random, and you may have to guess.</dd>
</dl>
