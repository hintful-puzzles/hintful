# Tents

Place tents in the empty squares in such a way that:

- no two tents are adjacent, even diagonally
- the number of tents in each row and column matches the numbers
  around the edge of the grid
- it is possible to match tents to trees so that each tree is
  orthogonally adjacent to its own tent (but may also be adjacent to
  other tents).

## Controls

{{controls}}

Right-click and drag along a row or column to mark many squares at once
as grass. Hold Shift while moving the cursor to mark the empty squares
it passes over as grass, or Ctrl to turn tents it passes over into grass
as well.

Warning '!' marks appear to indicate adjacent tents. Numbers round
the edge of the grid light up red to indicate they do not match the
number of tents in the row. Groups of tents light up red to indicate
that they have too few trees between them, and vice versa.

## Joining a tent to its tree

The matching is the part of Tents you have to keep in your head, so you
can write it down. **Drag from a tree to the square beside it**, or from
the square to the tree, to join them with a short line: if the square is
empty, this places the tent there too. Drag between them again to part
them. From the keyboard, press **L** on a tree, tent or empty square and
then the arrow toward its neighbor.

Links are notes for you: the puzzle is solved by the tents alone. A link
that no correct matching could contain is shown as a mistake.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from your tents, your grass, the numbers and the links, so it
carries on from wherever you are, as long as none of those is wrong; if
one is, it asks you to fix the highlighted mistakes first. An *open*
square, in its words, is one still empty: neither a tent nor grass.

{{hint-marks}}

A tree has its tent once they are joined, and also when you can see it
at a glance: the tent touches no other tree still free, or it is the
only square beside the tree that is empty or holds a tent. When a step
needs a pairing that takes more than a glance, the hint asks you to draw
that link first.

A few ideas are worth learning by name:

* **Every tent needs a tree.** A square beside no tree, or beside trees
  that all have their tents, must be grass.
* **A tree with one square left** has its tent there.
* **A tree with two squares left round a corner**: whichever holds the
  tent, the square diagonal to the tree between them touches it, so it
  must be grass.
* **No spare room.** A run of empty squares in a row holds at most half
  its length, rounded up, in tents that don't touch. When a row needs
  exactly as many tents as its runs can hold, the odd-length runs must be
  filled alternately.
* On harder boards: **wherever a row's tents go**, some squares in the
  rows beside it are always touched by one of them, so they must be
  grass.

## Tents parameters

{{parameters}}
