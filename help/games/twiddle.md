# Twiddle

Rotate square sections of the grid to arrange the squares into
numerical order starting from the top left.

When you master the basic game, go to the Type menu to try it with
larger rotating groups (for a 3×3 group you must click in the
center of a square to rotate the block around it). Or try a setting
that changes the rules. Or both! A board's name in the Type menu says
which it has:

{{modifiers}}

## Controls

{{controls}}

A block is the square section that turns, 2×2 in the basic game. Aim a
click at its center, which for a 2×2 block is the corner point between
its four squares; the keyboard's cursor outlines the whole block.

The keys A, B, C and D turn the block in the top-left,
top-right, bottom-left and bottom-right corner anticlockwise, and
the capital letter (with Shift) turns it clockwise. On the numeric keypad, 7,
9, 1 and 3 turn the corner blocks, and 8, 2, 4, 6 and 5 turn the block
exactly halfway along an edge, or in the very center, where the grid
has one.

## Hints

**Hint** shows the next turn rather than simply making it. Nothing in
Twiddle is forced by logic, so the hint plans a way to finish from wherever
you are and says what each turn is for.

{{hint-marks}}

The plan puts the tiles in place in reading order, keeping every finished
tile where it is, and each step opens by naming the tile it is working on,
*"Working on tile 3:"*. A tile is *in place* on its own square and, when
orientation matters, the right way up.

While a block clear of the finished tiles can reach the tile, the hint turns
that block to *carry it toward its place*, or to *put it in place*. At the end
of a row, and in the last rows, every block covers a finished tile, so the
tile goes in by a run of turns, which the hint gives one at a time: *"8 turns
put it in place, finished tiles intact"*. Partway through the run, finished
tiles are moved; by the last turn they are all back.

Follow it or go your own way: when you make a different turn, the next hint
plans again from there. If you stop partway through a run, the next hint
puts the moved tiles back as it goes on.

## Twiddle parameters

{{parameters}}
