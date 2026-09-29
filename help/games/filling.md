# Filling

Write a number in every blank square of the grid. When the grid is
full, every orthogonally connected group of identical numbers should
have an area equal to that number: so 1s always appear alone, 2s in
pairs, and so on.

## Controls

To place a number, click the mouse in a blank square to select it,
then type the number you want on the keyboard. You can also drag to
select multiple squares, and then type a number to place it in all
of them. To erase numbers, select one or more squares in the same
way and then press Backspace.

To play with a keyboard, use the arrow keys to move the cursor and type a number to write it in the square under the cursor. Press Space to add the square under the cursor to a selection (or take it out again), or press Enter and then move the cursor to select every square it passes over; typing a number then fills the whole selection. Escape clears the selection.

## Hints

**Hint** explains the next step rather than simply making it. It reasons from the numbers given and the numbers you have written, so it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

A few ideas are worth learning by name:

* **A region that must grow.** When a region of 6 has fewer than six squares and only one empty square beside it, or every way it could reach six passes through the same squares, those squares must be 6 too.
* **An exact fit.** When the empty space a region can reach holds exactly as many squares as it is missing, it fills them all.
* **A lonely square.** A square that no neighboring region can grow to include can only be a 1.
* **Nothing else fits.** When every other number in a square would break the rule, by touching an equal number or by leaving some region short of its size, the one that is left must go there.

## Filling parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
</dl>
