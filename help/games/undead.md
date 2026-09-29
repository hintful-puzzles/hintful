# Undead

Fill in every grid square which doesn't contain a mirror with either a
ghost, a vampire, or a zombie. The numbers round the grid edges show
how many monsters must be visible along your line of sight if you look
directly into the grid from that position, along a row or column.
Zombies are always visible; ghosts are only visible when reflected in
at least one mirror; vampires are only visible when not reflected in
any mirror. The counts at the top of the grid say how many ghosts,
vampires and zombies it holds in all.

## Controls

To place a monster, click in a square to select it, then
click the desired monster at the top or type the
monster's letter on the keyboard: G for a ghost, V for a vampire or Z
for a zombie. To erase a monster, click to select a square and then
press Backspace.

Right-click in a square and then type a letter to add or remove the
monster as a pencil mark, indicating monsters that you think
*might* go in that square. Press M to pencil in all three monsters on
every empty square that has no marks yet, and A to switch between
pictures and letters (also a preference). A square's pencil marks are
the monsters it can still hold, so **Check & save** flags a set of marks
that leaves out the square's real monster.

Left-click on a clue to mark it as done (gray it out). To unmark a
clue as done, left-click on it again.

With the keyboard, the arrow keys move the selection around the grid.
The keys 1, 2 and 3 work like G, V and Z, and E, 0, Space, Backspace and
Delete all clear the square. Press Enter to switch between placing
monsters and adding pencil marks. A preference makes right-click switch
on a *sticky* pencil mode instead, which stays on until you right-click
again.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the clues, the mirrors, your monsters and your pencil marks, so
it carries on from wherever you are, as long as none of your monsters is
wrong and no square's pencil marks leave out its real monster; if one
does, it asks you to fix the highlighted mistakes first.

Its steps work on pencil marks, so if some empty square has none, its
first step pencils every monster into each empty square that has no marks
yet. You can do the same yourself by pressing M. A square you have already
narrowed down keeps its marks.

{{hint-marks}}

The hint crosses out a monster for one of two reasons: a sightline's two
numbers leave no room for it in a square along that sightline, or the
counts at the top show that all of that monster have already been placed.
It fills a square when only one monster is left uncrossed there, or when
exactly as many squares can still hold a monster as there are of that
monster left to place.

Every hint is a deduction you could have made from what is on the board.
On an **Unreasonable** board there may come a point where no deduction is
left and the only way on is to try something and see whether it works —
that is what [the difficulty name means](../features#difficulty). The hint
says so rather than guessing for you: save your position, try it, and
undo if it breaks.

## Undead parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares: at least 3 each way, and at most 54 squares in all.</dd>
	<dt>Difficulty</dt>
	<dd>How hard the reasoning the puzzle needs may be (<a href="../features#difficulty">what the names mean</a>).</dd>
</dl>
