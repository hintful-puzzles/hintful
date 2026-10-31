# Design

The measurements are `report.md`'s; this is what was decided, and why.

## 1. A clue's line of sight is the space's

`slots`, `sight(s)` and `opposite(s)` join `GridSpace`, numbered as Towers
deals its clues and as the interpreter numbers them: above each column, below
each, left of each row, right of each. A slot is an element, its index; `sight(s)`
is its line's cells nearest it first. Every grid has them, as every grid has
edges. `before(x, L)`, `index(x, L)` and `nth(L, i)` read an ordered set.

`index` and `nth` are not in the proposal's list. Towers' rules are about
distance from a clue ("within `v - r - 1` cells"), and the statement that does
not name a position has to rebuild it with `before` on every read.

**What they cost.** `before(x, L)` bound as a binder's set is a loop to `x`'s
place, not a copy. `index(x, L)` where `x` was bound by a loop over the same
`L` is that loop's counter; `index(x, slots)` (or `cells`, `lines`) is `x`,
since the space numbers its elements in that order.

## 2. A filling is a binder

`fill f of S [from cand]` binds `f`, an assignment of a value to each element of
`S`, from its candidates where `from cand` is said, and is read `f(x)`. It
binds in a quantifier or an aggregate, as `x in S` does, so `exists fill`,
`forall fill` and `count(fill f of S where P)` all read. Its `where` says
which assignments count. A filling is not a value: it cannot be compared,
returned, or bound by `=`.

**A filling satisfies nothing it is not told to.** language.md's definition
is an assignment from the domain or the marks, and Keen's statement in the
investigation writes its Latin condition out. So Towers' says
`where distinct(f(x) over x in L)`. Keen's cage states its own, per line.

**The bound is the set's.** `S` is a set the board bounds (a line, a cage),
so the enumeration is at most `|domain|^|S|`. The compiler enumerates
depth-first in `S`'s order, each element's values ascending, and checks two
kinds of condition as each element is assigned rather than at the end: a
`distinct(f(x) over x in T)` in the `where`, which prunes an assignment
repeating a value in `T`; and, for `exists`, an `f(x) = t` in the `where` or
the body that reads no `f` but there, which pins `x` to `t`. Everything else
is read once the assignment is whole. The result is the same with or without
either; they bound the work, which for a line of 6 is 720 assignments rather
than 46,656.

**A pinned filling asked cell by cell is a projection.** `arrangement` asks,
for each cell `c` of a line and each height `d`, whether some filling puts
`d` in `c`. Searched afresh each time, that was twice the hand-written
time. The compiler sees an `exists fill` whose only reading of the inner
loops' names is its pin `f(x) = t`, enumerates every filling the rest allows
once where the rest's names are bound, keeps by cell the values they give,
and answers each question with one bit. It reads the marks through the
technique's kept candidates, so it is valid as long as they are: the
compiled code counts their clearings (`_epoch`), and enumerates again on the
next question after one. The answers are the pinned search's, in both the
solve and the hint path; the comparison was run with it.

The checker expands a filling over its set's concrete members into a
disjunction of every assignment, each guarded by its values being candidates.
At orders 3 and 4 that is at most 256 assignments a binding.

## 3. Towers' Easy reading is one technique, clue by clue

`solverEasy` reads each clue twice, the run one short of the clue
(`lineFull`) and then the heights too near it (`lowerBound`), and returns
after the first that strikes. A rung runs its techniques in order, so two
techniques would read every clue's run before any clue's bounds, and a hint
would show a different step. They are one technique, `bounds`, bound by
clue, whose conclusion is the run's strikes where they change the marks and
the bounds' otherwise. The binding's `near` says which, for the reason.

The run's reading is wanted only where the clue is one more than the towers
it sees in the run, so its nearest index and its short heights are
definitions read under `near`'s `and`, which the compiled code evaluates
only where the left side holds, and the bounds' visible heights are bound
in their own branch. Read eagerly, every clue paid for both readings, and
`bounds` took three times the hand-written Easy rung.

`lowerBound` passes over a placed height only where one at least two taller
stands nearer the clue. The spec states it (§ "A Towers height is struck from
the cells too near a clue to hide it"), and the statement keeps it.

## 4. The facing pairs are a technique, one firing for all of them

`TowersCtx.started` ran the facing pairs once a solve, recursion included. As
a technique at Easy, before `bounds`, it runs every time and changes the
marks only the first: its towers are placed after that, and the recursion's
grids carry them. A seed would place them before recording starts, and the
hint narrates them. The cost is a scan of the slots each Easy call.

It is one firing over every pair, as the one-off was one return, so the hint
path's calls and groups are the same.

The one-off placed a tower that was already placed, a firing that changed
nothing, recorded as a placement; and a contradiction on one pair was undone
by a placement on a later one. The compiled `place` makes neither, so the
hand-written code was given both fixes before the comparison. Every Towers
deal and hint walk traced the same with them, but for the internal group
number a hint step's record carries, which the dropped firing had used.

Two pairs, a row's and a column's, can name one cell. On the hint path a
firing's facts are all made after it is found, so `applyFacts` places a cell
once, as it already strikes a candidate once.

## 5. `arrangement` is a filling of the clue's line

For each clue and each cell of its line, a height no filling of the line
from its candidates, distinct, that shows the clue's count puts there is
struck. One firing a cell, as the hand-written code returned after each
position that struck.
