# Map

Color the map with four colors, so that no two adjacent regions
have the same color. (Regions touching at only one corner do not
count as adjacent.) There is a unique coloring consistent with the
colored regions you are already given.

## Controls

Drag from a colored region to a blank one to color the latter the
same color as the former. Drag from outside the grid into a region
to erase its color. (You cannot change the colors of the regions
you are given at the start of the game.)

Or tap a region to select it and press one of the four color buttons
below the grid, which is the same thing without the drag — each
button is painted in the color it fills with, and the digit on it is
the key that does the same from the keyboard. The Clear button
empties the selected region.

Right-drag from a colored region to a blank one to add dots marking
the latter region as *possibly* the same color as the
former, or to remove those dots again. Pressing the Marks button
below the grid makes ordinary drags — and the color buttons — leave
those dots instead of coloring, until you press it again. A
right-click without a drag does the same as the Marks button and
selects the region, as it does in the other note-taking puzzles.

**Fill all pencil marks** (the M key, or **Fill marks** on a phone)
dots all four colors into every blank region that has no dots yet.
Pressed again, it removes from each blank region the dots of colors
its neighbors already show. Regions you have dotted yourself are
never refilled.

A region's dots are the colors it might still be, so Check treats a
set of dots that leaves out the region's real color as a mistake,
just as it does a wrong color. A region with no dots is simply
unmarked.

The selected region is outlined in green inside its border; while
the buttons leave dots, a small green triangle also sits in its
top-left corner.

The keyboard can also be used. Move the cursor with the arrow keys,
then press a color's digit to fill the region the cursor is on, or
Backspace to empty it. Enter picks up the color under the cursor and
a second Enter drops it where you have moved to; pressing Enter twice
without moving erases instead. Space drops what you are carrying as a
dot rather than as a color.

## Hints

**Hint** explains the next step rather than simply making it. It reads
dots the same way Check does: what a blank region can be comes from its
dots, or from all four colors when it has none, less the colors its
neighbors already show. It places dots itself only when a deduction
rules out a color no neighbor shows, so a map you have never dotted
stays undotted until a step needs it. If you would rather the hint
start from a fully dotted map, set **Hints pencil in** to **Every
candidate first** in the preferences: it then begins by pressing **Fill
all pencil marks** twice, just as you would.

* **A thick band in the hint color** along a region's border marks the
  region the step decides, the one it calls "this region".
* **A thin dashed line in a second color**, set in from a region's
  border, marks a region the step reasons from; "the outlined pair" are
  the two regions drawn this way.
* **Numbers in the second color**, where a region's number would go,
  mark the regions of a chain, "region 1" to the last. While a chain is
  shown, the map's own region numbers are hidden.

The hint names colors by their words, red, yellow, teal and violet, and
a step ends by saying what to do: color the region, dot the colors it
can still be, or remove the dots it can't.

The ideas it teaches, from the plainest up:

* **Three neighbors' colors.** A region that touches three colors must
  be the fourth.
* **A pair.** Two touching regions that can only be the same two colors
  must use both between them, so any region touching both can be
  neither.
* **A chain.** On harder boards, a line of regions that can each be
  only two colors passes a choice along: if region 1 isn't red, it is
  its other color, which settles region 2, and so on down the chain
  until the last region has to be red. Either way region 1 or the last
  is red, so a region touching both can't be.

Every hint is a deduction you could have made from what is on the board.
On an **Unreasonable** board there may come a point where no deduction is
left and the only way on is to try something and see whether it works —
that is what [the difficulty name means](../features#difficulty). The
hint says so rather than guessing for you: save your position, try it,
and undo if it breaks.

A hint is refused while a color or a set of dots on the board
contradicts the solution; those regions light up instead, exactly as
they do for **Check & save**.

## Map parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid the map is drawn on, in squares; each must be at least 2.</dd>
	<dt>Regions</dt>
	<dd>How many regions the map is divided into: at least 5, and no more than the grid has squares.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. Higher difficulties require more complex reasoning (<a href="../features#difficulty">what the names mean</a>).</dd>
</dl>
