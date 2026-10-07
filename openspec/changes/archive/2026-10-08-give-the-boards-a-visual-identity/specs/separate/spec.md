## ADDED Requirements

### Requirement: Separate draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface, with
its letter in ink. Every cell holds a letter the puzzle fixed and the player
enters none, so no cell is lifted as a given: the surface is one tone and the
edges carry the board. The edges keep their own roles and strengths: a wall in
ink, an edge ruled out and an edge undecided each in its own color.

A completed correct region SHALL fill with the shared finished-region role, a
wash of the theme pair's first hue. The solved flash SHALL lift every cell to the
given's surface on its lit beats, a step that reads in both schemes.

#### Scenario: Every cell is the same surface

- **WHEN** an untouched board is drawn
- **THEN** every cell's body is the plain cell surface

#### Scenario: The flash lifts the cells

- **WHEN** the solved flash is on a lit beat
- **THEN** every cell's body is the lifted surface

## MODIFIED Requirements

### Requirement: Separate shades completed correct regions

The render SHALL fill a wall-bounded region with the shared finished-region
role (`REGION_DONE`, a wash of the theme pair's first hue, as in Rectangles)
once it is a completed, correct region — exactly `k` cells, holding one of each
letter (no duplicate), with no wall interior to it — giving the player the same
local-correctness feedback Galaxies and Rectangles give. The untouched board
(one undivided region) SHALL NOT be filled. The fill is a local check on the
region as drawn, not a check against the unique solution. The valid overlay SHALL
be part of the render cache diff key so it appears and clears as regions are
completed and broken.

#### Scenario: A completed region is shaded, the rest is not

- **WHEN** the player seals one region of the unique solution (its full boundary)
  while the rest of the grid is still undivided
- **THEN** exactly that region's `k` cells render with the `COL_CORRECT` background
- **AND** the untouched remainder does not
