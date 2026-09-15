# Loopy

Form a single closed loop out of the grid edges, in such a way that
every numbered square has exactly that many of its edges included in
the loop.

Click on a grid edge to mark it as part of the loop (black), and
again to return to marking it as undecided (yellow). Right-click on
a grid edge to mark it as definitely not part of the loop (faint
gray), and again to mark it as undecided again.

On a touch screen, tapping an edge cycles it through all three states,
so you never need a second button.

You can also play entirely from the keyboard. Everywhere else in this
collection the cursor sits on a square; here you are marking the *edges*
between squares, so the cursor sits on a **dot**, where edges meet, and the
arrow keys walk it from dot to dot along the grid's edges. The
edge you just walked along is the one your keys act on — think of a pen
that inks where it has been:

- **Enter** marks the edge you just walked as part of the loop, exactly
  as a left click does. Walk, Enter, walk, Enter traces a loop; walk back
  over a marked edge and press Enter again to clear it.
- **Space** marks it as definitely not part of the loop, exactly as a
  right click does, and again to clear it.
- **Backspace** or **Delete** clears it.
- **Shift + arrow** aims at an edge leaving your dot in that direction
  *without* moving; press it again to step round to the next edge that
  way. You will only ever need this on the Penrose kite/dart tiling, where
  a few edges cannot be walked onto from either end.
- **Escape** hides the cursor; any click hides it too.

The cursor is drawn as a green disc on its dot, with a green halo
under the edge your keys will act on.

When you have mastered the square grid, look in the Type menu for
many other types of tiling!

## Hints

**Hint** explains the next step rather than simply making it. It reasons
from the lines you have drawn and the edges you have ruled out, so it
carries on from wherever you are, as long as none of them is wrong; if
one is, it asks you to fix the highlighted mistakes first.

- **A blue band** along an edge is the edge the step is about: solid when
  it must be a line, broken when it can't be one.
- **An outlined clue** is the clue the step counts, and **a ringed dot**
  is the dot it reasons about. Every dot takes either no lines or two.
- **A band under drawn lines** marks the loop an edge would close.

Most steps are the rules at work: a clue that already has its lines, a
clue with only as many edges left as it needs, a line with only one way
to go on, a dot that already has two lines, or an edge that would close
a loop too early.

On harder boards the reasoning turns on things you have no way to mark,
so the hint draws them for you:

- **A corner** is two edges meeting at a dot around one clue's square.
  A **filled wedge** in it means the loop needs at least one line there;
  an **outlined wedge** means it can take one at most. A 3 on the square
  grid needs a line at every corner, for instance, because its other two
  edges can give it only 2.
- **A pair** is two edges joined by a thin connector: **=** means they
  match (both lines, or neither), and **≠** means exactly one of them is
  a line.

When a step rests on more of these than one sentence can explain, they
are numbered in the order they follow from one another. Read them from 1
upward: each one follows from the clue or dot beside it and the numbered
marks before it, and the step's sentence names the ones it concludes from.

## Checking your lines

**Check & save** compares your board with the puzzle's answer. A line the
loop does not use turns red, and an edge you ruled out that the loop needs
gets a red cross, even if you have chosen not to show ruled-out edges.

Some red appears without asking, too: when the lines you have drawn break
a rule, such as a dot with three lines or a closed loop that is not the
only one.
