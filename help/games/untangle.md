# Untangle

Move the points around so that none of the lines cross.

## Controls

Click on a point and drag it to move it.

On the keyboard, the arrow keys pick out the nearest point in that
direction, and Space or Tab steps through the points in turn (Shift+Tab
backwards). Enter picks up the chosen point; the arrow keys then move
it, and Enter again puts it down.

## Hints

**Hint** shows a point to move and where to put it, rather than simply
moving it. Nothing in Untangle is forced by logic, so the hint looks for
the move that takes the most crossings off the board, and says how many
crossings the point's lines are in before and after.

* **The point to move** is drawn in the hint's color, with a line in
  the same color running to **the spot** to drop it on, which is also
  drawn as a point.
* **Rings** mark the crossings the move removes, so you can count them.
* When only a few crossings are left, the hint may move several
  points together so that none of their lines crosses anything. The
  other points it will move next are ringed too — *the marked points*,
  in its words — and it moves them one at a time.

When no single move takes a crossing away, the hint says so and moves a
point toward an untangled layout anyway, telling you what that does to
the point's crossings — which may go up for now — and, when it does,
that it frees a move removing some.

## Untangle parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Number of points</dt>
	<dd>How many points the puzzle has, from 4 to 2000. More points means
	more lines to untangle.</dd>
</dl>
