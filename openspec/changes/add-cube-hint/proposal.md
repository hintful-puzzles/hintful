# add-cube-hint

**Status: filed 2026-10-16 at the owner's word, split out of
`hintless-games-in-reserve`** (to be picked off one by one, and used as a
source of engine improvements and refactoring). The last of the four to
take: it has no solver at all.

## Why

Cube has no hint, so it is a draft. The player rolls a solid over a grid to
pick up the paint from every blue square onto its faces.

## What is already there (read 2026-10-16; re-check before relying on it)

- `src/games/cube/index.ts` says it plainly: "no solver, no hints, no
  mistake-checking … just rolling". The geometry is in `solids.ts`, the two
  grid topologies (square, triangular) in `grid.ts`.
- A position is the solid's square, its orientation, which faces are painted
  and which grid squares are still blue.

## What the hint has to settle

1. **Whether a search can finish at all.** The state space is position ×
   orientation × the paint on faces and squares; measure it on every preset
   before choosing a search (breadth-first with a good key, A* with a lower
   bound such as the blue squares left, or a staged plan that collects one
   square at a time). If no search reaches the larger presets in a budget,
   say which presets get a hint and what the rest refuse with.
2. **What a step can prove**: for example, the shortest roll that picks up
   the next square without dropping paint, or that a roll would paint over a
   face that is needed elsewhere.
3. **The generator** (`docs/hints-search.md` § "Deal only what the search
   can finish").
4. **Every solid**: tetrahedron, cube, octahedron, icosahedron, on their
   grids.

## Engine questions to carry

- A best-first search with a position key and a budget is the shape every
  search game writes. If this one is written again from nothing, ask what the
  engine should own so that the next game does not.

## Impact

- `src/games/cube/`: a new `solver.ts`, `hint.ts`, `hintGesture`, marks,
  help page `## Hints`.
