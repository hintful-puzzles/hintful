## MODIFIED Requirements

### Requirement: Mosaic is complete when every clue is satisfied

A clue SHALL count the marked cells of its 3×3 neighborhood, itself included.
The board SHALL be complete exactly when every shown clue is satisfied with no
cell of its neighborhood unmarked.

#### Scenario: Completing every clue solves the game

- **WHEN** the last clue becomes satisfied
- **THEN** no clue is left and `status` returns `"solved"`

## ADDED Requirements

### Requirement: Mosaic's win flash fills the ground of a cell

The win flash SHALL sweep the board's cells from the bottom left to the top
right. A lit cell's ground SHALL be filled with a flash color in place of
its own surface, a blank cell's clear surface included, and SHALL keep what it
holds: its piece, its cross and its number.

#### Scenario: A lit blank cell

- **WHEN** the win flash's highlight is on a blank cell with no number
- **THEN** the cell is filled with a flash color and still carries its
  faint cross

### Requirement: Mosaic draws a marked cell as a piece and a blank cell as the clear square

`redraw` SHALL draw a marked cell as the collection's shaded piece, inset on
the plain cell surface, a blank cell as the collection's clear square, a
surface of its own over the whole cell with no piece, and an unmarked cell as
plain surface holding nothing. The line between cells SHALL be the
collection's thin surface grid.

#### Scenario: The three marks are a piece, a surface of its own and nothing

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** the marked cell holds the shaded piece on the plain surface, the
  blank cell is filled with the clear square's color and holds no piece, and
  the unmarked cell is plain surface and holds nothing

## REMOVED Requirements

### Requirement: Mosaic draws a marked cell as a piece and a blank one as the clear square

**Reason**: Its scenario for the completion flash had the flash swap marked
and blank cells. The win flash lights a cell and leaves what it holds, and the
rule for the three marks is restated without that scenario.

**Migration**: None. Nothing a player holds refers to the flash.
