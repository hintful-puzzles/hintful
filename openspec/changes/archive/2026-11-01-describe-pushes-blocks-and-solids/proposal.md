# describe-pushes-blocks-and-solids

**Status: filed by `describe-guarded-moves` (2026-11-01)**, split from it
because each of its three games needs a construct of its own beyond a move
shape (`describe-guarded-moves/design.md` § "The split"). Part of step 3 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan").

## Why

The position runtime runs Sixteen, Twiddle and Fifteen, and
`describe-guarded-moves` adds jumps, toggles and runs until stopped (Pegs,
Flip, Inertia). Sokoban, Slide and Cube still write their rules by hand,
Sokoban's twice (`describe-the-whole-catalog/design.md` § "Corrections").

## What Changes

- **Sokoban**: a step, a push, and a walk that is a reach over the board; its
  pits' two-sided finish (`describe-the-whole-catalog/design.md`
  § "Corrections"); its deadlocks as dead-end claims that name the barrel a
  banner outlines; labeled barrels, which a move carries and no rule reads.
  `finish-search` fed the compiled pushes, or the packed copy kept with its
  measurement.
- **Slide**: a block shifted whole, a block's identity being a layer's
  value, and the forcefield only the main block crosses. The game's move,
  any reachable square, is a line of one-square shifts.
- **Cube**: the solid's faces as a second sort of element beside the cells,
  a roll table that stays data the description reads, and a board that is
  not a rectangle for the tetrahedron, octahedron and icosahedron.

## Facts for the session (2026-11-01; re-check)

- `describe-guarded-moves/design.md` § "What the runtime gains" lists the
  constructs the runtime has by then: shared unassigned layers, `on_grid`,
  `adj8`, `ray`, least fixed points, a dealt relation, token layers, a claim's
  witnesses.
- Cube's grids are its own (`src/games/cube/grid.ts`), its rolls computed
  from 3D alignment (`src/games/cube/solids.ts`).

## Acceptance

Each of the three has a description its runtime executes: its moves'
legality and its finish compiled and called, its hand-written copies removed
or kept with the reason and the measurement; every dead-end claim checked
sound on small boards; every fixture, deal and hint walk unchanged, or each
difference reported; the guides updated.
