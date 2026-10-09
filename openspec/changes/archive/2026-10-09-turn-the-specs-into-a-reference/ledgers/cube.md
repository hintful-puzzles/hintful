# Ledger: cube

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Cube game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `cube` game implements `Game` over its five types, a polyhedron rolled around an arena to collect paint | spec: Cube game implements the Game interface |
| Params are `solid`, `d1`, `d2`, encoded `<t/c/o/i><d1>x<d2>`, with a lenient decode that tolerates a missing letter and a missing `x<d2>`, `d2` defaulting to `d1` | spec: Cube params are a solid and two dimensions |
| The four presets `c4x4`, `t1x2`, `o2x2`, `i3x3` are offered | spec: Cube offers one preset for each solid |
| The presets are upstream's | history |
| `statusbarText` is provided, and `solve` and `textFormat` are not, Cube being a route puzzle with no solver, hint, mistake check or text format | spec: Cube has a status bar and neither a solver nor a text format |
| Scenario: params round-trip and lenient decode | spec: Cube params are a solid and two dimensions |
| Scenario: a generated board is winnable and starts unsolved | spec: Cube game implements the Game interface |

## Cube roll moves transform orientation and swap paint

| Rule | Where it went |
| --- | --- |
| A `CubeMove` is a roll in one direction, the four orthogonal ones on a square grid | spec: A Cube move is one of four orthogonal rolls |
| A `CubeMove` is one of up to eight directions, diagonals included, on a triangular grid | untrue: `CubeMove` is `{ dir: "L" or "R" or "U" or "D" }` on every grid (`src/games/cube/state.ts`), and `interpretMove` in `src/games/cube/index.ts` translates a diagonal input into the orthogonal direction with the same edge mask before it makes the move, so the eight directions are input and the requirement now says so |
| Diagonals are also available on a hexagonal grid | untrue: `enumGridSquares` in `src/games/cube/grid.ts` builds two topologies only, squares for the cube and triangles for the other solids, and a hexagon is one outline the patch of triangles takes |
| `executeMove` is pure, computes the destination square and the new resting face from the orientation key-points, and exchanges paint between the destination square and the landing face, except that a fully painted solid rolls without exchanging | spec: Cube roll moves transform orientation and swap paint |
| The game is solved exactly while every face is painted, and the move count keeps counting every roll | spec: Cube is solved exactly while every face is painted |
| Scenario: rolling tips the solid onto a new face | spec: Cube roll moves transform orientation and swap paint |
| Scenario: direction set depends on grid topology | spec: A Cube move is one of four orthogonal rolls |

## Cube renders the solid, grid, and rolling animation

| Rule | Where it went |
| --- | --- |
| `redraw` draws the grid squares with painted ones distinguished, the solid projected with its isometric shear and back-face culling, and a roll animation interpolating the orientation between squares over the roll duration | spec: Cube renders the solid, grid, and rolling animation |
| Cube fully repaints every frame with no per-tile cache, and fills its background rect on every frame, which erases the previous one | spec: Cube repaints its whole scene every frame |
| There is no win flash, and completion is reported only in the status bar | spec: Cube has no win flash |
| Upstream's `flash_length` is 0 | history |
| Scenario: draw output contains grid squares and the solid | spec: Cube renders the solid, grid, and rolling animation |
| Scenario: a roll animates between squares | spec: Cube renders the solid, grid, and rolling animation |

## Cube draws its arena as a quiet surface under a lifted solid

| Rule | Where it went |
| --- | --- |
| A plain square is the cell surface and the line between squares the surface's grid line, so the arena stands a step off the board with no line heavier than a grid line, and a painted square is the color of a thing carried, the pair's first member, inside the same line | spec: Cube draws its arena as a quiet surface under a lifted solid |
| The solid is the one object on the board, with plain faces on the lifted surface, painted faces in the painted square's color, and edges in ink | spec: Cube draws the solid as the one object on the board |
| Scenario: plain squares are surface and painted squares are the pair's first color | spec: Cube draws its arena as a quiet surface under a lifted solid |
| Scenario: the solid stands off the arena | spec: Cube draws the solid as the one object on the board |
