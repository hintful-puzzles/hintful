# Design

The measurements are `report.md`'s; this is what was decided, and why.

## 1. A grid's corners

`space.corners: true` gives the points inside the grid where four cells
meet. A corner is an element, numbered in reading order, the one below and
right of cell `(x, y)` being `y·(w − 1) + x`: Mathrax's own clue index, so a
firing's corner names its packed clue with no table. `corners` is every
corner; `cells(k)` its four cells in reading order; `corners(c)` a cell's,
those inside the grid; `across(k, c)` the cell diagonally across `k` from
`c`. A clue kind may sit at a corner (`at: corner`).

A cell's corners come below right, above right, below left, above left:
the order upstream's solver reads them in. A firing is the first corner
whose clue strikes at a cell, and the hint narrates it, so the order is the
step a player sees; reading order would change it.

`across` is a function rather than `the(x in cells(k) where ...)`: an
aggregate is never moved out of a loop, and a corner's diagonal pairs each
sum to its first and last cells, so the compiled read is one subtraction.

## 2. A clue kind for each sign, and a parity for E and O

A clue's value is one number, so a sign is its kind, as in Keen: `sum`,
`difference`, `product`, `quotient`. Equality is a `difference` of 0, as
the game itself encodes it (`CLUE_SUB` with 0). E and O are one kind,
`parity`, whose value is the remainder each of the four cells leaves by 2.
A kind of no value would need the compiler and both checkers to learn a
clue without `v`; a value of 0 or 1 needs nothing new but `mod` in the
soundness checker, which reads it as the compiled `%` does.

## 3. Three statements, one a tier

`applyOptions` is one body under two gates. Each is a premise a tier reads,
and a tier is not a name a formula can read, so they are three techniques
over shared definitions: `allows(k, c, d)`, what the clue at corner `k`
permits in cell `c` given the candidates across it, and `allowsEasy`, the
same reading an arithmetic clue only where the cell across has at most one
value left. Each binds the cell, then `M`, what every clue at its corners
allows it, then the corner:

- **`clueEasy`** (Easy) and **`clue`** (Normal): where `M` is at most one
  value, each corner's clue strikes what it rules out.
- **`clueTricky`** (Tricky): each corner's clue strikes what it rules out.

`M` is the cell's candidates less those some corner's clue rules out,
`set(d over j in corners(c) where constrains(j), d in cand(c) where ...)`,
the corner bound first so that its clue reads are made once a corner, and a
corner that can rule nothing out (no clue, or at Easy an arithmetic clue
with two values open across it) is passed over whole. The Easy and Normal
gate is the `where` of `M`, so a cell with two values left opens no corner
loop. Stated first as `{d in cand(c) where forall j in corners(c): ...}`,
the value bound first, the ladder took 4.4 to 6.4 times the hand-written
one's time a deal.

All three conclude `|M| > 0` first: a cell no value is left for is a
contradiction, which `applyOptions` returned before its gate. A firing is
one clue at one cell, as the recording path made it. `allows` reads the
cell across only for an arithmetic clue: a corner with no clue, or a
parity, permits what it permits whatever is across.

## 4. A moved term's own reads are shared

A term computed early was compiled with nothing moved inside it, so
`clue(sum, k) = none` read the clue again beside the `clue(sum, k)` moved
on its own: fourteen reads a corner where five were distinct. Its own terms
are now moved as it is, each to its slot. They were computed whenever it
was, so no guard is newly passed by; every Latin game's trace is byte for
byte what it was.

## 5. The mirror goes

`applyOptions` kept the cube in upstream's `BIT(d)` form, synced from the
cube each call and cloned each recursion. A compiled technique reads the
marks, so the context goes with it. The generator is solver-gated, so the
comparison running both ladders on every generator call is what shows it
deals the same boards.

The hand-written sweep read the cells across from its mirror as the call
began, while the compiled one reads them as its own strikes leave them. The
closure is the same, and so the grade; the comparison counts no calls.
