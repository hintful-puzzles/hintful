# cube Specification

## Purpose
Cube, the puzzle of rolling a solid across a grid to gather every painted square
onto its faces in as few moves as possible. This capability specifies how a roll
turns the solid and exchanges paint with the grid, and how the solid and its
rolling animation are drawn.

## Requirements

### Requirement: Cube game implements the Game interface

The engine SHALL provide a registered `cube` game implementing
`Game<CubeParams, CubeState, CubeMove, CubeUi, CubeDrawState>`: a polyhedron
rolled around a tiled arena to collect paint from painted grid squares onto the
solid's faces.

#### Scenario: A generated board is winnable and starts unsolved

- **WHEN** a new game is created from any preset
- **THEN** the solid is placed on a start square, a non-empty set of blue
  squares is painted, and the initial state reports a not-completed status

### Requirement: Cube params are a solid and two dimensions

Params SHALL be `solid` (one of tetrahedron, cube, octahedron, icosahedron),
`d1` and `d2`, encoded `<t|c|o|i><d1>x<d2>`. Decoding SHALL be lenient: a
missing leading solid letter and a missing `x<d2>` SHALL both be tolerated, and
where `x<d2>` is missing `d2` SHALL default to `d1`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ solid: cube, d1: 4, d2: 4 }` are encoded
- **THEN** the result is `c4x4`
- **AND** decoding `c4x4`, `4x4`, and `4` all yield well-formed params with
  `d2` defaulting to `d1` when the `x<d2>` segment is absent

### Requirement: Cube offers one preset for each solid

The four presets SHALL be offered: Cube `c4x4`, Tetrahedron `t1x2`, Octahedron
`o2x2` and Icosahedron `i3x3`.

#### Scenario: The presets are the four solids

- **WHEN** the presets are listed
- **THEN** they encode as `c4x4`, `t1x2`, `o2x2` and `i3x3`

### Requirement: Cube has a status bar and neither a solver nor a text format

The game SHALL provide `statusbarText`, and SHALL NOT provide `solve` or
`textFormat`: Cube is a route puzzle with no solver, hint, mistake check or
text format.

#### Scenario: The game object carries no solver

- **WHEN** the registered `cube` game is inspected
- **THEN** it has a `statusbarText` hook and no `solve` or `textFormat` hook

### Requirement: A Cube move is one of four orthogonal rolls

A `CubeMove` SHALL be a roll in one of the four orthogonal directions. Input
SHALL produce only those four on a square grid. On a triangular grid input
SHALL also accept the four diagonal directions, each resolving to the
orthogonal roll over the same edge of the current square, so a stored move is
always one of the four.

#### Scenario: Direction set depends on grid topology

- **WHEN** input is interpreted on a square-grid board
- **THEN** only the four orthogonal roll directions are produced
- **AND** on a triangular board the diagonal directions are also available

### Requirement: Cube roll moves transform orientation and swap paint

`executeMove` SHALL be pure, returning a new state. It SHALL compute the
destination square and the solid's new resting face from the current
orientation key-points, and SHALL exchange paint between the destination
square and the face that lands on it, except that a solid with every face
painted SHALL roll without exchanging paint.

#### Scenario: Rolling tips the solid onto a new face

- **WHEN** a roll move executes from a given orientation
- **THEN** the new state's resting face differs per the polyhedron's geometry
- **AND** paint is exchanged between the destination square and the landing
  face, leaving the source state unmutated

### Requirement: Cube is solved exactly while every face is painted

The game SHALL be reported solved exactly while every face of the solid is
painted, and the move count SHALL keep counting every roll.

#### Scenario: A finished solid keeps rolling

- **WHEN** a solid with every face painted is rolled again
- **THEN** no paint is exchanged, the game is still reported solved, and the
  move count rises by one

### Requirement: Cube renders the solid, grid, and rolling animation

The Cube `redraw` SHALL draw the arena's grid squares, painted squares
distinguished from plain ones, and the solid projected to two dimensions with
its isometric shear and back-face culling. It SHALL draw a roll animation
interpolating the solid's orientation from the previous square to the current
one over the roll duration.

#### Scenario: Draw output contains grid squares and the solid

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the grid squares (with painted
  squares drawn in the paint's color) and the solid's projected polygons

#### Scenario: A roll animates between squares

- **WHEN** a roll move has just executed and `redraw` runs mid-animation
- **THEN** the solid is drawn at an interpolated orientation between its
  previous and current squares, settling exactly on the destination square at
  animation end

### Requirement: Cube repaints its whole scene every frame

Cube SHALL fully repaint every frame, with no per-tile cache, since its scene
is a handful of polygons. Cube SHALL fill its background rect on every frame,
which erases the previous one.

#### Scenario: A frame opens with the background

- **WHEN** `redraw` runs on any frame
- **THEN** the background rect is filled before any square or face is drawn

### Requirement: Cube has no win flash

Cube SHALL have no win flash: completion SHALL be reported only in the status
bar.

#### Scenario: Completing the board flashes nothing

- **WHEN** the last face is painted
- **THEN** the flash length is zero and the status bar reports the completion

### Requirement: Cube draws its arena as a quiet surface under a lifted solid

`redraw` SHALL draw a plain square of the arena as the collection's cell
surface and the line between two squares as the surface's grid line, so the
arena stands a step off the board and no line of it is heavier than a grid
line. A painted square SHALL be the collection's color for a thing the player
carries, the theme pair's first member, inside the same grid line.

#### Scenario: Plain squares are surface and painted squares are the pair's first color

- **WHEN** a fresh board is drawn
- **THEN** each plain square is filled with the cell surface and each painted
  square with the color of a thing carried, all outlined in the surface's grid
  color

### Requirement: Cube draws the solid as the one object on the board

The solid SHALL be drawn as the one object on the board: a plain face on the
collection's lifted surface, a face that has picked up a square in the same
color as a painted square, and its edges in ink.

#### Scenario: The solid stands off the arena

- **WHEN** a fresh board is drawn
- **THEN** the solid's plain faces are filled with the lifted surface and
  outlined in ink
