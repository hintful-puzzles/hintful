## ADDED Requirements

### Requirement: Palisade draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface. A cell
that holds a clue SHALL sit on the lifted surface of a given, so the clues the
puzzle fixed are told by the cell under them, with the digit in ink. The edges
keep their own roles and strengths, since they are what the player draws: a
wall in ink, an edge ruled out and an edge undecided each in its own color.

A completed correct region SHALL fill whole, its clue cells included, with the
shared finished-region role, a wash of the theme pair's first hue. The solved flash
SHALL lift every cell to the given's surface on its lit beats, a step that
reads in both schemes.

#### Scenario: A clue is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every cell holding a clue is the lifted surface
- **AND** every other cell is the plain cell surface

#### Scenario: The edges keep their three colors

- **WHEN** a board holds a wall, an edge ruled out and an edge undecided
- **THEN** each is drawn in its own color, as before the surface was applied

## MODIFIED Requirements

### Requirement: Palisade shades completed correct regions

The render SHALL fill a wall-bounded region with the shared finished-region
role (`REGION_DONE`, a wash of the theme pair's first hue, as in Rectangles)
once it is a completed, correct region — exactly `k` cells, every clue in it
equal to its wall count, and no wall interior to it — giving the player the
same local-correctness feedback Galaxies and Rectangles give. The untouched
board (one undivided region) SHALL NOT be filled. The fill is a local check on
the region as drawn, not a check against the unique solution. The valid overlay
SHALL be part of the render cache diff key so it appears and clears as regions
are completed and broken.

#### Scenario: The solved board shades every region, the untouched board none

- **WHEN** the board carries the unique solution's walls
- **THEN** every region renders with the `COL_CORRECT` background
- **AND** the untouched board (no interior walls) renders none
