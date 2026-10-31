# Design

The measurements are `report.md`'s; this is what was decided, and why.

## 1. A dealt partition is dealt with the clues

`space.regions: { cage: dealt }` names a partition the board deals. The
compiler reads its name as a set of elements of sort `region cage`, each a
part's index, and `cells(r)` as the part's cells in reading order. A clue
kind may sit at a part (`at: cage`).

The parts travel with the clues, in what the compiled module now calls
`Dealt` (it was `Clues`): one field a clue kind and one a partition, so the
compiler refuses a partition and a clue kind of one name. The space stays
the size's, cached and shared; a partition is the board's.

A cell's part, `region(c)` in the proposal, is not compiled: no technique
reads it. Solo's Killer, the next game with a dealt partition and a cell's
cage to read, adds it.

## 2. Keen's clue is four kinds

A clue's value is one number, so a cage's sign is its kind: `sum`, `product`,
`difference`, `quotient`, each at a cage. A technique binds the cage, so it
scans the cages in their order whatever their signs, and reads the clue of
each kind there, `none` where the cage has another. `makes(f, r)` says a
filling makes the cage's clue: four conjuncts, each `clue(kind, r) = none or
...`.

## 3. A filling's conditions kept as it is assigned

`describe-towers` kept a `distinct` and a pin as each cell is assigned. A
cage needs three more, each a conjunct of the filling's `where`, a
definition's body read as its conjuncts:

- **Two cells of it that share a line differ**: `forall x in S, y in
  before(x, S) where P: B`, over the filling's own set, is checked for each
  pair as the later of the two is assigned. It is the whole condition, so it
  is not read again once the filling is whole.
- **A sum no larger than its clue**: `sum(x in S of f(x)) = t`, or that
  guarded by a disjunct that reads no filling (`A or ...`), passes over a
  value that takes the sum so far past `t`, since no value is negative.
- **A product that divides its clue**: the same of `prod`, passing over a
  value whose product so far, where positive, does not divide `t`.

The sum and the product are read again once the filling is whole. They bound
the work: a sum cage of five cells on a 9×9 board from full candidates is
59,049 assignments without them.

## 4. Upstream's Easy reading runs only while Normal is out of reach

`solverEasy` returns nothing when the solve's cap is above Easy: Normal's
reading strikes all that Easy's does, and upstream keeps a board's grade
at a cap above Easy from resting on the weaker reading. A technique says it
with `until: <tier>`: the ladder runs it only at a cap below that tier. The
engine reads it (`LatinLadder`), so a game declares it and writes no code.

## 5. Keen's three techniques

All three bind a cage and enumerate its fillings from the candidates, every
two cells sharing a line apart, that make its clue:

- **`cageEasy`** (Easy, until Normal): the values some filling puts anywhere
  in the cage, `D`; a candidate of a cage cell outside `D` is struck. One
  firing a cage.
- **`cage`** (Normal): a candidate no filling puts in its cell is struck: the
  projection `describe-towers` built, one enumeration a cage. One firing a
  cage.
- **`cageLine`** (Hard): for each line, the columns before the rows as
  upstream scans them, a value every filling puts in the cage's part of it is
  struck from the rest of the line. One firing a line. With no filling at
  all, every value is struck from every line, as upstream's intersection
  over no layouts does.

Upstream returns after the first cage that strikes at Hard, on the solve path
too; the compiled technique goes on through every cage. The closure is the
same, and so the grade: what changes is how many calls a solve makes, which
the comparison does not count.
