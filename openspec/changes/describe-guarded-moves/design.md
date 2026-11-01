# Design: jumps, toggles and runs

Read 2026-11-01 at `508ed4b8`. Figures are dated; re-check one before
designing against it.

## Sections

| Section | What it holds |
| --- | --- |
| The split | which games this change describes, and the change it files |
| What the runtime gains | each construct, and why it is stated that way |
| The games | what each keeps, and why |

## The split

The proposal names six games. Read against the runtime, they fall into two
groups with different design reasoning (`docs/work-management.md` § "One
change per coherent unit of work"):

- **Pegs, Flip and Inertia**, kept here. Each move is a fixed number of
  cells found from a binding (a jump's three, a toggle's dealt set, a run's
  cells up to where it stops), on a rectangular grid. Their dead-end claims
  and lose state are formulas over one grid of values, and two need one new
  construct: a set defined as the least one closed under a rule (Pegs'
  `can_arrive`, Inertia's reach).
- **Sokoban, Slide and Cube**, filed as `describe-pushes-blocks-and-solids`.
  Each needs a construct of its own beyond a move shape: Sokoban's walk is a
  reach over the board and its deadlocks name a barrel; Slide's move shifts a
  whole block, whose identity is a layer's value; Cube's position has a
  second sort of element (the solid's faces) and its board is not a
  rectangle for three of its four solids.

Ball sort waits only on what this change states: a move guarded by the
position and one that cannot be undone.

## What the runtime gains

- **A layer no move sets is shared, not copied.** `play` copies only the
  layers a move assigns. Board features that never change (Pegs' holes,
  Inertia's walls) are a layer like any other, so the checker's universe
  holds every board as well as every position on it, which is the "every
  filling" the proposal asked for: no dealt structure needs enumerating
  apart.
- **`on_grid(x, y)`**: whether a point is on the grid. `cell(x, y)` stays
  unchecked, so a move reaching past the edge says where it stops. A
  library name is spelled apart from a game's own (Solo defines `inside`),
  since the library's are looked up first.
- **`adj8(c)`**, a cell's eight neighbors, clockwise from north, the order
  Inertia's directions run in. A move binds the first cell of its direction
  rather than a direction number: a set of numbers is a bitmask and holds no
  negative step.
- **`ray(c, n)`**: the cells from `n` on, in the direction from `c` to `n`,
  to the edge of the grid. A run until stopped is `the(...)` or `first` over
  a ray: no iteration construct is needed, and the investigation's
  `first x in L where P` is what Inertia's slide states.
- **A definition that reads itself is its least fixed point**, over its one
  cell parameter: the least set of cells for which the body holds, the self
  reads read as membership. Pegs' `can_arrive` (a Datalog rule over two
  premises, which `chain` could not state) is written as a plain definition.
  The compiler refuses a self read under `not`, on either side of `iff` or
  `=`, on the left of `implies`, inside an aggregate or as another
  function's argument, so the body is monotone and the set is well defined.
  It is computed once a call of the function that reads it, at the top,
  since it reads only the position.
- **A dead-end claim's witnesses.** A claim whose last conjunct is
  `exists x in S: P` names the cells it holds of: `witnesses(id, p)` gives
  every binding of `x` for which the rest holds. Pegs' banner outlines its
  frozen pegs and Inertia's its stranded gems from it, so the cells a banner
  outlines are the claim's own.
- **A lost position has no moves.** Where the description states `lose`,
  `moves` is empty and `legal` false on a lost position. Inertia's dead ball
  can only be undone.
- **A token layer** (`once: v`): exactly one cell holds `v`. The ball is one
  cell of a layer; the checker's universe counts its cells, not every
  filling of the layer.
- **A dealt relation** (`relations: { flips: "dealt" }`): a set of cells for
  each cell, read `flips(c)`. Flip's patterns are in its desc for both
  rulesets, so the relation is dealt for both; the generator keeps making
  them.

## The games

Written as each is moved; see `report.md` for what each kept and the
measurements.
