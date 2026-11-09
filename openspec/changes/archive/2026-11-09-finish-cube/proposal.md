# finish-cube

**Status: filed on the owner's word (2026-11-08)**, who asked why Cube shows
as a draft.

## Why

A game is a draft while any contract section is neither implemented nor
declared not applicable with a reason (`draftSections` in
`src/engine/sections.ts`; `docs/mechanics.md` § "Contract sections, and what
makes a draft"). Cube is the only draft in the catalog (2026-11-08). It has
a hint, and it declares mistake checking not applicable, but it has nothing
for two sections:

- **Show solution** (`solve`): no member, and no reason it cannot have one.
- **Turning the board to fit the screen** (`transposeParams`): no member, and
  no reason.

Both have been missing since the draft label was derived from the sections
(`9037bc93`). Upstream's Cube has no Solve.

## What Changes

- **Show solution plays a line of rolls that paints every face.** Inertia is
  the model: its `solve` returns one move holding the whole route, and the
  midend shows it. Cube's hint already plans rolls with `planRolls`
  (`solver.ts`), but that planning works within an allowance and may stop
  short, leaving the next hint to carry on. Solve plans until the board is
  finished, or reports that it could not. The line need not be the shortest;
  the help says so if it is not.
- **A cube's board turns; the triangular boards do not.** Loopy is the
  model: its `transposeParams` swaps width and height for a grid that turns
  and returns `null` for one that does not. A cube's square grid swaps `d1`
  and `d2`. The tetrahedron's, octahedron's and icosahedron's triangular
  grids return `null`, unless swapping `d1` and `d2` turns the board
  exactly; check it against the drawn board before claiming it.
- **Cube is no longer a draft**, and its help lists only what it truly does
  not have.

## Acceptance

- `draftSections(cube)` is empty, and the home screen shows no Draft label
  on Cube.
- Show solution on a dealt board of each preset leads to a solved board, and
  on a board part-played it carries on from where the player is. Where it
  cannot finish, it says so and changes nothing.
- A cube board in portrait turns to fit, and a triangular board does not
  turn.
- The spec gains requirements for Show solution and for turning, and the
  help page describes both.
- The running app is checked in Chrome: Show solution animating its rolls,
  a turned board, and the home screen without the Draft label.

## Asks nothing of the owner

The change adds a feature and keeps every save, link and control as it is.
