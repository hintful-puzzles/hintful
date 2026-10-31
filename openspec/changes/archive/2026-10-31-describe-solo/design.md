# Design

The measurements are `report.md`'s; this is what was decided, and why.

## 1. Boxes and diagonals are units of the grid

A Sudoku's boxes and an X board's diagonals are lines of the compiled
space, numbered after the columns: `cells(u)`, `units` and `peers(c)` read
them as they read a row. `sudokuSpace(boxCells, diagonals)` builds that
space for a board, with its units in the order Solo scans them (boxes, rows,
columns, diagonals), and its peers in reading order, the order Solo's wing
has always met them in. A Latin square has no boxes, and its spaces are what
they were.

In a description the boxes are the partition listed among the units (Solo's
`box`), dealt or not: its name is the set of boxes and, as a function, the
box holding a cell. Any partition reads as a function the same way, so a
cage's cell finds its cage (`cage(c)`) in one read: the compiled
`Partition` keeps the part holding each cell.

With the boxes among the units, the library's techniques are Solo's where
they scan as Solo did: `latin.hiddenSingle` at the line-single rung (the
boxes come first in `units`, and `boxSingle` has emptied them by the time it
runs), `latin.single`, `latin.set` (the boxes, the rows, the columns, then
the diagonals, as the region and diagonal set rungs were), and `latin.wing`.
Solo states `boxSingle`, a hidden single in a box at its own tier;
`intersect`, its line and box readings; and `digitSet`, `latin.fish` with
the rows and columns swapped, as upstream's matrix has them.

## 2. One ladder for every variation

The compiler reads a description with every variation applied: one ladder
runs on every board the game deals, and a name a board's variations leave
out is empty there (no cages, no diagonals), so a technique over it binds
nothing. The soundness checker reads the description with every modifier
applied; a board shape (Jigsaw) is checked on the description's own shape.

## 3. Two scales

A description may name grading scales besides its `tiers`
(`scales: { killer: [...] }`); a technique's tier is a tier of one of them,
and the compiled ladder says which (`scale`). Solo caps and grades a
technique on the killer scale by `kdiff`, every other by `diff`, as
upstream did. A game-side table of which rung is on which scale would be a
second copy of what the description says.

`from` is the converse of `until`: a technique runs only at a cap of at
least `from` on its scale, and grades at its own tier. Solo's readings of
the partial cages the region rule works out grade as min/max and sums, and
run only where the region rule is in reach.

**A grade does not depend on the path only where a scale runs in tier
order.** Solo's sudoku scale does, and upstream's killer scale does not: the
region rule, its top tier, runs before the cages' min/max and sums. So how
much one step does decides which killer tier a solve reaches. The
hand-written rungs differed from the compiled techniques there in three
ways: its sudoku rungs stopped at their first firing on the solve path, its
min/max and sums read the cages and the partial cages in one rung, and its
region rule read a cell filled in its own sweep as still in its working
cage. A compiled technique is one rung and sweeps every binding on the solve
path, as every other described game's, and the killer grade follows that
ladder. Restoring upstream's granularity would need a runner of Solo's own,
and a slower solve; the cost is that a Killer deal differs now and then
(report § "What a player meets"), which a player cannot tell from any
other.

## 4. The killer rungs

Upstream's working cages are the dealt cages less their filled cells, and
their clues the totals less those cells' values: `owed(r)`. The region rule
works out, for each row, column and box, the open cells outside every cage
whose open cells lie within it, `L`, and their sum, and where `L` lies in
one cage, that cage's other open cells, `R`, and theirs. A cell alone
places; two or more are a partial cage that min/max and sums read after the
cages, as two techniques of their own (`partMinMax`, `partSums`), each bound
by the unit and then `i`, `L` at 0 and `R` at 1, so a binding is one partial
cage in upstream's sequence. Stated first as one binding a unit, reading `L`
where that struck and `R` otherwise, a solve's sweep skipped `R` where `L`
struck, which changed the killer grade on some 6×6 boards.

`L` is in the order of its cages, then of their cells, as upstream's filter
left it: a partial cage's strikes and its reason's cells are in that order.

Upstream's sums read the ways to make a total from its tables of 1 to 9,
clearing from a way only the values a cell has lost, so below 9×9 a way
using a value the board lacks counted as possible. The description reads
the board's own values: a player making 18 from four different values of 1
to 6 knows they are 3, 4, 5 and 6, and the hint now says so. Killer is at
most 9×9, so at 9×9 nothing changes.

Bringing the working cages up to date (each filled cell's value struck from
the rest of its cage, and a cage whose filled cells overshoot its total a
contradiction) stays in Solo, run before each killer technique as upstream
ran it: it is the cage's half of placing a value, made lazily, and making it
eagerly changes which step a hint finds first.

## 5. A firing is one binding

The hand-written region rule placed every unit's single in one firing, and
killer singles every cage's; compiled, each is one unit or cage. The hint
walk takes each recorded placement as a step of its own, so a player sees
the same steps.

The hand-written min/max struck within a cage cell by cell, each cell read
against the strikes just made to the cells before it, so a step could strike
a value whose reason rests on a strike the player has not been shown. The
compiled reading reads the board as the step shows it, so such a value goes
in the next step instead. That is a hint a player can now check against the
notes on the board, and the walk is otherwise the same.

A cell with no candidate left reads `none` in the description's `min` and
`max`, where upstream added nothing; that happens only on a board already
inconsistent, and the comparison saw no solve where it made a difference.

## 6. The forcing chain is not stated

A forcing chain is a search over chains of two-candidate cells, which the
formula syntax has no closure for, and runs only at Unreasonable, which no
hint records at. It stays Solo's hand-written rung after the compiled ones,
as the Latin engine's does.
